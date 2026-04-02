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

// ─── Silent audio keepalive ───────────────────────────────────────────
// Mobile browsers suspend SpeechSynthesis when the screen locks because
// there's no active audio session. Playing a near-silent audio loop
// keeps the browser's audio session alive so TTS continues on the lock screen.

let silentAudio: HTMLAudioElement | null = null;

function startSilentAudio() {
  if (typeof document === 'undefined') return;
  if (silentAudio) return; // Already running

  // Generate a tiny WAV file: 1 second of near-silence (single quiet sample)
  // This is a valid WAV with minimal data — just enough to establish an audio session
  const sampleRate = 8000;
  const numSamples = sampleRate; // 1 second
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);

  // WAV header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true);  // PCM
  view.setUint16(22, 1, true);  // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true);  // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, numSamples * 2, true);

  // Near-silent samples (value 1 — essentially inaudible)
  for (let i = 0; i < numSamples; i++) {
    view.setInt16(44 + i * 2, 1, true);
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);

  silentAudio = new Audio(url);
  silentAudio.loop = true;
  silentAudio.volume = 0.01; // Near-silent
  silentAudio.play().catch(() => {
    // Autoplay might be blocked — that's OK, the user gesture from the play
    // button will have already unlocked audio
  });
}

function stopSilentAudio() {
  if (silentAudio) {
    silentAudio.pause();
    silentAudio.src = '';
    silentAudio = null;
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
