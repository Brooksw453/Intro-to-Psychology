/**
 * OpenAI TTS Audio Player
 *
 * Plays MP3 audio from the /api/tts endpoint via AudioContext.
 * AudioContext routes through A2DP (media audio) on iOS, which is
 * the key fix for Bluetooth speakers and CarPlay — SpeechSynthesis
 * only routes through HFP (hands-free), which most speakers don't support.
 *
 * Features:
 * - Pre-fetch cache: decoded AudioBuffers stored by text key (max 50)
 * - Pause/resume via audioContext.suspend()/resume()
 * - Playback rate via bufferSource.playbackRate (instant, no re-fetch)
 * - onEnded callback for sequential chunk playback
 */

const MAX_CACHE_SIZE = 50;

export interface TTSPlayer {
  /** Fetch (or use cache), decode, and play a chunk. Resolves when playback starts. */
  playChunk(text: string): Promise<void>;
  /** Fetch and decode a chunk into the cache without playing. */
  prefetch(text: string): Promise<void>;
  /** Stop current playback. */
  stopCurrent(): void;
  /** Pause (freezes audio position). */
  pause(): void;
  /** Resume from pause. */
  resume(): void;
  /** Whether audio is currently paused. */
  isPaused(): boolean;
  /** Register callback fired when current chunk finishes playing. */
  setOnEnded(cb: (() => void) | null): void;
  /** Adjust playback speed (0.5–2.0). Applies instantly to current audio. */
  setPlaybackRate(rate: number): void;
  /** Get current playback rate. */
  getPlaybackRate(): number;
  /** Tear down AudioContext and clear cache. */
  cleanup(): void;
}

export function createTTSPlayer(): TTSPlayer {
  let audioCtx: AudioContext | null = null;
  let currentSource: AudioBufferSourceNode | null = null;
  let currentGain: GainNode | null = null;
  let onEndedCallback: (() => void) | null = null;
  let playbackRate = 1.0;

  // Cache: text → decoded AudioBuffer
  const cache = new Map<string, AudioBuffer>();
  // In-flight fetches to avoid duplicate requests
  const inflight = new Map<string, Promise<AudioBuffer>>();

  function getContext(): AudioContext {
    if (!audioCtx || audioCtx.state === 'closed') {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
    }
    // Resume if suspended (iOS requires this after user gesture)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  async function fetchAndDecode(text: string): Promise<AudioBuffer> {
    // Check cache first
    const cached = cache.get(text);
    if (cached) return cached;

    // Check if already fetching
    const existing = inflight.get(text);
    if (existing) return existing;

    const promise = (async () => {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`TTS fetch failed: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const ctx = getContext();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Store in cache, evict oldest if full
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        if (firstKey !== undefined) cache.delete(firstKey);
      }
      cache.set(text, audioBuffer);
      inflight.delete(text);

      return audioBuffer;
    })();

    inflight.set(text, promise);

    // Clean up inflight on error too
    promise.catch(() => inflight.delete(text));

    return promise;
  }

  function stopCurrent() {
    if (currentSource) {
      try {
        currentSource.onended = null;
        currentSource.stop();
      } catch { /* already stopped */ }
      currentSource.disconnect();
      currentSource = null;
    }
  }

  async function playChunk(text: string): Promise<void> {
    stopCurrent();

    const ctx = getContext();
    const buffer = await fetchAndDecode(text);

    // Create new source for this chunk
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    // Gain node (at full volume — volume controlled by device)
    const gain = ctx.createGain();
    gain.gain.value = 1.0;
    source.connect(gain);
    gain.connect(ctx.destination);

    source.onended = () => {
      if (currentSource === source) {
        currentSource = null;
        currentGain = null;
        onEndedCallback?.();
      }
    };

    currentSource = source;
    currentGain = gain;
    source.start();
  }

  async function prefetch(text: string): Promise<void> {
    try {
      await fetchAndDecode(text);
    } catch {
      // Prefetch failures are non-critical
    }
  }

  function pause() {
    if (audioCtx && audioCtx.state === 'running') {
      audioCtx.suspend().catch(() => {});
    }
  }

  function resume() {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function isPaused(): boolean {
    return audioCtx?.state === 'suspended' || false;
  }

  function setOnEnded(cb: (() => void) | null) {
    onEndedCallback = cb;
  }

  function setPlaybackRate(rate: number) {
    playbackRate = rate;
    if (currentSource) {
      currentSource.playbackRate.value = rate;
    }
  }

  function getPlaybackRate(): number {
    return playbackRate;
  }

  function cleanup() {
    stopCurrent();
    onEndedCallback = null;
    cache.clear();
    inflight.clear();
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  }

  return {
    playChunk,
    prefetch,
    stopCurrent,
    pause,
    resume,
    isPaused,
    setOnEnded,
    setPlaybackRate,
    getPlaybackRate,
    cleanup,
  };
}
