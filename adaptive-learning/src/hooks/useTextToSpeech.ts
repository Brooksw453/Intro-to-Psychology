'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface TTSBlock {
  label: string;
  text: string;
}

export interface TTSMediaMetadata {
  title: string;
  artist: string;
}

interface UseTextToSpeechReturn {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentBlockIndex: number;
  currentChunkIndex: number;
  totalBlocks: number;
  currentBlockLabel: string;
  play: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  skipForward: () => void;
  skipBack: () => void;
  rateLabel: string;
  cycleRate: () => void;
}

// Mobile browsers (especially iOS) scale speech rate much more aggressively
// than desktop — a rate of 1.5 on iOS sounds like 5x on desktop.
// Use compressed rates on mobile to keep speeds natural.
const DESKTOP_RATES = [0.75, 1.0, 1.25, 1.5, 2.0];
const MOBILE_RATES = [0.85, 1.0, 1.05, 1.1, 1.15];
// Display labels shown to the user (same for both platforms)
const RATE_LABELS = ['0.75x', '1x', '1.25x', '1.5x', '2x'];

function isMobile(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function getRateOptions(): number[] {
  return isMobile() ? MOBILE_RATES : DESKTOP_RATES;
}

/**
 * Split text into sentence-sized chunks (~200 chars max) to avoid
 * the iOS Safari bug where long utterances get cut off after ~15 seconds.
 * Exported so ContentRenderer can split text the same way for highlighting.
 */
export function chunkText(text: string): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (current.length + sentence.length > 200 && current.length > 0) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += (current ? ' ' : '') + sentence;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }
  return chunks.length > 0 ? chunks : [text];
}

// ─── Silent audio keepalive (AudioContext) ───────────────────────────
// Mobile browsers suspend SpeechSynthesis when the screen locks because
// there's no active audio session. We use AudioContext (Web Audio API)
// instead of a plain <audio> element because AudioContext properly
// establishes an A2DP (media audio) session on iOS. This is critical
// for Bluetooth speakers and CarPlay — without it, SpeechSynthesis
// only routes through HFP (hands-free profile), which AirPods support
// but most speakers and car systems do not.
//
// The AudioContext plays a looping silent buffer that:
// 1. Keeps the browser audio session alive on the lock screen
// 2. Claims the A2DP Bluetooth route so SpeechSynthesis piggybacks on it
// 3. Enables Media Session API (lock screen controls)

let audioCtx: AudioContext | null = null;
let silentSource: AudioBufferSourceNode | null = null;

function startSilentAudio() {
  if (typeof window === 'undefined') return;
  if (audioCtx && audioCtx.state !== 'closed') return; // Already running

  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;

  audioCtx = new AC();

  // Create a 1-second silent buffer and loop it
  const sampleRate = audioCtx.sampleRate;
  const buffer = audioCtx.createBuffer(1, sampleRate, sampleRate);
  const channelData = buffer.getChannelData(0);
  // Near-zero samples — inaudible but enough to keep the audio session active
  for (let i = 0; i < channelData.length; i++) {
    channelData[i] = 0.00001;
  }

  silentSource = audioCtx.createBufferSource();
  silentSource.buffer = buffer;
  silentSource.loop = true;

  // Route through a gain node at near-zero volume
  const gain = audioCtx.createGain();
  gain.gain.value = 0.01;
  silentSource.connect(gain);
  gain.connect(audioCtx.destination);
  silentSource.start();

  // iOS requires explicit resume after user gesture
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
}

function stopSilentAudio() {
  if (silentSource) {
    try { silentSource.stop(); } catch { /* already stopped */ }
    silentSource = null;
  }
  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }
}

// ─── Media Session API ────────────────────────────────────────────────
// Shows lock screen controls (play/pause, skip forward/back) on mobile.

function updateMediaSession(
  metadata: TTSMediaMetadata | null,
  blockLabel: string,
  handlers: {
    play: () => void;
    pause: () => void;
    skipForward: () => void;
    skipBack: () => void;
  } | null,
) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

  if (metadata && handlers) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: blockLabel || metadata.title,
      artist: metadata.artist,
      album: metadata.title,
    });

    navigator.mediaSession.setActionHandler('play', handlers.play);
    navigator.mediaSession.setActionHandler('pause', handlers.pause);
    navigator.mediaSession.setActionHandler('previoustrack', handlers.skipBack);
    navigator.mediaSession.setActionHandler('nexttrack', handlers.skipForward);
  } else {
    // Clear handlers
    navigator.mediaSession.setActionHandler('play', null);
    navigator.mediaSession.setActionHandler('pause', null);
    navigator.mediaSession.setActionHandler('previoustrack', null);
    navigator.mediaSession.setActionHandler('nexttrack', null);
  }
}

// ─── Main hook ────────────────────────────────────────────────────────

export function useTextToSpeech(
  blocks: TTSBlock[],
  mediaMetadata?: TTSMediaMetadata,
): UseTextToSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [rateIndex, setRateIndex] = useState(1); // index 1 = 1.0x

  const blockIndexRef = useRef(0);
  const chunkIndexRef = useRef(0);
  const chunksRef = useRef<string[][]>([]);
  const isPlayingRef = useRef(false);
  const rateRef = useRef(1.0);
  rateRef.current = getRateOptions()[rateIndex];

  useEffect(() => {
    setIsSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  // Pre-chunk all blocks
  useEffect(() => {
    chunksRef.current = blocks.map(b => chunkText(b.text));
  }, [blocks]);

  const speakChunk = useCallback(() => {
    if (!isPlayingRef.current) return;

    const blockIdx = blockIndexRef.current;
    const chunkIdx = chunkIndexRef.current;
    const allChunks = chunksRef.current;

    if (blockIdx >= allChunks.length) {
      // Done with all blocks
      isPlayingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentBlockIndex(0);
      setCurrentChunkIndex(0);
      blockIndexRef.current = 0;
      chunkIndexRef.current = 0;
      stopSilentAudio();
      updateMediaSession(null, '', null);
      return;
    }

    const blockChunks = allChunks[blockIdx];
    if (chunkIdx >= blockChunks.length) {
      // Move to next block with a brief pause
      blockIndexRef.current = blockIdx + 1;
      chunkIndexRef.current = 0;
      setCurrentBlockIndex(blockIdx + 1);
      // 500ms pause between blocks
      setTimeout(() => speakChunk(), 500);
      return;
    }

    setCurrentChunkIndex(chunkIdx);

    const utterance = new SpeechSynthesisUtterance(blockChunks[chunkIdx]);
    utterance.lang = 'en-US';
    utterance.rate = rateRef.current;

    utterance.onend = () => {
      chunkIndexRef.current = chunkIdx + 1;
      speakChunk();
    };

    utterance.onerror = (e) => {
      // 'interrupted' and 'canceled' are expected when stopping/skipping
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('TTS error:', e.error);
      }
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const play = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    blockIndexRef.current = 0;
    chunkIndexRef.current = 0;
    setCurrentBlockIndex(0);
    setCurrentChunkIndex(0);
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    startSilentAudio();
    speakChunk();
  }, [isSupported, speakChunk]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  }, []);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentBlockIndex(0);
    setCurrentChunkIndex(0);
    blockIndexRef.current = 0;
    chunkIndexRef.current = 0;
    stopSilentAudio();
    updateMediaSession(null, '', null);
  }, []);

  const skipForward = useCallback(() => {
    if (blockIndexRef.current >= blocks.length - 1) return;
    window.speechSynthesis.cancel();
    blockIndexRef.current += 1;
    chunkIndexRef.current = 0;
    setCurrentBlockIndex(blockIndexRef.current);
    setCurrentChunkIndex(0);
    setIsPaused(false);
    speakChunk();
  }, [blocks.length, speakChunk]);

  const skipBack = useCallback(() => {
    if (blockIndexRef.current <= 0) return;
    window.speechSynthesis.cancel();
    blockIndexRef.current -= 1;
    chunkIndexRef.current = 0;
    setCurrentBlockIndex(blockIndexRef.current);
    setCurrentChunkIndex(0);
    setIsPaused(false);
    speakChunk();
  }, [speakChunk]);

  // When rate changes mid-playback, cancel current speech and restart
  // from the current chunk so the new rate takes effect immediately.
  const cycleRate = useCallback(() => {
    setRateIndex(prev => {
      const rates = getRateOptions();
      const nextIdx = (prev + 1) % rates.length;
      rateRef.current = rates[nextIdx];

      // If currently playing (not paused), restart current chunk at new rate
      if (isPlayingRef.current && !window.speechSynthesis.paused) {
        window.speechSynthesis.cancel();
        // Small delay to let cancel complete before speaking again
        setTimeout(() => speakChunk(), 50);
      }

      return nextIdx;
    });
  }, [speakChunk]);

  // Register / update Media Session controls when playing state or block changes
  useEffect(() => {
    if (!isPlaying || !mediaMetadata) return;

    const currentLabel = blocks[currentBlockIndex]?.label || '';
    updateMediaSession(mediaMetadata, currentLabel, {
      play: () => {
        if (isPaused) {
          window.speechSynthesis.resume();
          setIsPaused(false);
        }
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
      },
      pause: () => {
        window.speechSynthesis.pause();
        setIsPaused(true);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      },
      skipForward,
      skipBack,
    });

    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPaused ? 'paused' : 'playing';
    }
  }, [isPlaying, isPaused, currentBlockIndex, blocks, mediaMetadata, skipForward, skipBack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
      stopSilentAudio();
      updateMediaSession(null, '', null);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isPlaying,
    isPaused,
    isSupported,
    currentBlockIndex,
    currentChunkIndex,
    totalBlocks: blocks.length,
    currentBlockLabel: blocks[currentBlockIndex]?.label || '',
    play,
    pause,
    resume,
    stop,
    skipForward,
    skipBack,
    rateLabel: RATE_LABELS[rateIndex],
    cycleRate,
  };
}
