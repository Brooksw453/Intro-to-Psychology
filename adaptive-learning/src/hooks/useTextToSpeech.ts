'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface TTSBlock {
  label: string;
  text: string;
}

interface UseTextToSpeechReturn {
  isPlaying: boolean;
  isPaused: boolean;
  isSupported: boolean;
  currentBlockIndex: number;
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
 */
function chunkText(text: string): string[] {
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

export function useTextToSpeech(blocks: TTSBlock[]): UseTextToSpeechReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
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
      blockIndexRef.current = 0;
      chunkIndexRef.current = 0;
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
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsPaused(false);
    speakChunk();
  }, [isSupported, speakChunk]);

  const pause = useCallback(() => {
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    isPlayingRef.current = false;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentBlockIndex(0);
    blockIndexRef.current = 0;
    chunkIndexRef.current = 0;
  }, []);

  const skipForward = useCallback(() => {
    if (blockIndexRef.current >= blocks.length - 1) return;
    window.speechSynthesis.cancel();
    blockIndexRef.current += 1;
    chunkIndexRef.current = 0;
    setCurrentBlockIndex(blockIndexRef.current);
    setIsPaused(false);
    speakChunk();
  }, [blocks.length, speakChunk]);

  const skipBack = useCallback(() => {
    if (blockIndexRef.current <= 0) return;
    window.speechSynthesis.cancel();
    blockIndexRef.current -= 1;
    chunkIndexRef.current = 0;
    setCurrentBlockIndex(blockIndexRef.current);
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

  // Auto-pause when page loses visibility
  useEffect(() => {
    if (!isSupported) return;
    function handleVisibility() {
      if (document.hidden && isPlayingRef.current && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isPlayingRef.current = false;
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
