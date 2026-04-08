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
 * - Playback rate via bufferSource.playbackRate (conservative range to avoid pitch distortion)
 * - Generation counter to prevent overlapping playback from stale callbacks
 * - onEnded callback for sequential chunk playback
 */

const MAX_CACHE_SIZE = 50;

export interface TTSPlayer {
  /** Initialize AudioContext — MUST be called from a user gesture (click/tap). */
  init(): void;
  /** Fetch (or use cache), decode, and play a chunk. Resolves when playback starts. */
  playChunk(text: string): Promise<void>;
  /** Fetch and decode a chunk into the cache without playing. */
  prefetch(text: string): Promise<void>;
  /** Stop all current playback and cancel pending callbacks. */
  stopCurrent(): void;
  /** Pause (freezes audio position). */
  pause(): void;
  /** Resume from pause. */
  resume(): void;
  /** Whether audio is currently paused. */
  isPaused(): boolean;
  /** Register callback fired when current chunk finishes playing. */
  setOnEnded(cb: (() => void) | null): void;
  /** Adjust playback speed. Uses conservative range to avoid pitch distortion. */
  setPlaybackRate(rate: number): void;
  /** Get current playback rate. */
  getPlaybackRate(): number;
  /** Set the voice for subsequent API calls. Stops current playback and clears cache. */
  setVoice(voice: string): void;
  /** Get current voice. */
  getVoice(): string;
  /** Tear down AudioContext and clear cache. */
  cleanup(): void;
}

export function createTTSPlayer(): TTSPlayer {
  let audioCtx: AudioContext | null = null;
  let currentSource: AudioBufferSourceNode | null = null;
  let keepaliveSource: AudioBufferSourceNode | null = null;
  let onEndedCallback: (() => void) | null = null;
  let playbackRate = 1.0;
  let currentVoice = 'nova';

  // Generation counter: incremented on every stop/voice-change/cleanup.
  // Each playChunk call captures the current generation; if it changes
  // before playback finishes, the onended callback is suppressed.
  // This prevents overlapping audio from stale callbacks.
  let generation = 0;

  // Cache: text → decoded AudioBuffer
  const cache = new Map<string, AudioBuffer>();
  // In-flight fetches to avoid duplicate requests
  const inflight = new Map<string, Promise<AudioBuffer>>();

  function getContext(): AudioContext {
    if (!audioCtx || audioCtx.state === 'closed') {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AC();
    }
    // Resume if suspended (iOS requires this after user gesture,
    // also needed when Bluetooth disconnects and reconnects to phone speaker)
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
        credentials: 'same-origin',
        body: JSON.stringify({ text, voice: currentVoice }),
      });

      if (!response.ok) {
        // Check for quota exceeded — special error the hook needs to detect
        if (response.status === 429) {
          const errorData = await response.json().catch(() => null);
          if (errorData?.error === 'quota_exceeded') {
            const quotaError = new Error('quota_exceeded');
            (quotaError as unknown as Record<string, string>).resetIn = errorData.resetIn || '';
            (quotaError as unknown as Record<string, string>).message = errorData.message || '';
            throw quotaError;
          }
        }
        throw new Error(`TTS fetch failed: ${response.status}`);
      }

      // Verify we got audio, not HTML (middleware redirect returns HTML)
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('audio')) {
        throw new Error(`TTS returned non-audio: ${contentType}`);
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
    promise.catch(() => inflight.delete(text));

    return promise;
  }

  function stopCurrent() {
    // Increment generation to invalidate any pending onended callbacks
    generation++;

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
    // Ensure context is running (handles Bluetooth disconnect → phone speaker switch)
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const myGeneration = generation;
    const buffer = await fetchAndDecode(text);

    // If generation changed while we were fetching, another play/stop happened — abort
    if (generation !== myGeneration) return;

    // Create new source for this chunk
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = playbackRate;

    // Connect directly to destination (volume controlled by device)
    source.connect(ctx.destination);

    source.onended = () => {
      // Only fire callback if this is still the active generation
      if (currentSource === source && generation === myGeneration) {
        currentSource = null;
        onEndedCallback?.();
      }
    };

    currentSource = source;
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

  function setVoice(voice: string) {
    if (voice !== currentVoice) {
      stopCurrent(); // Stop + increment generation to prevent overlap
      currentVoice = voice;
      // Clear cache — different voice produces different audio
      cache.clear();
      inflight.clear();
    }
  }

  function getVoice(): string {
    return currentVoice;
  }

  /**
   * Start a silent looping buffer to keep the iOS audio session alive.
   * Without this, iOS suspends the AudioContext between chunks (during
   * fetch latency or the 500ms block pause), which stops playback on
   * the lock screen and when switching apps.
   */
  function startKeepalive() {
    if (keepaliveSource) return; // Already running
    const ctx = getContext();
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = 0.00001; // Near-silent — keeps audio session active
    }
    keepaliveSource = ctx.createBufferSource();
    keepaliveSource.buffer = buffer;
    keepaliveSource.loop = true;
    const gain = ctx.createGain();
    gain.gain.value = 0.01;
    keepaliveSource.connect(gain);
    gain.connect(ctx.destination);
    keepaliveSource.start();
  }

  function stopKeepalive() {
    if (keepaliveSource) {
      try { keepaliveSource.stop(); } catch { /* already stopped */ }
      keepaliveSource.disconnect();
      keepaliveSource = null;
    }
  }

  /** Initialize AudioContext eagerly — call from user gesture (click handler). */
  function init() {
    getContext();
    startKeepalive();
  }

  function cleanup() {
    stopCurrent();
    stopKeepalive();
    onEndedCallback = null;
    cache.clear();
    inflight.clear();
    if (audioCtx) {
      audioCtx.close().catch(() => {});
      audioCtx = null;
    }
  }

  return {
    init,
    playChunk,
    prefetch,
    stopCurrent,
    pause,
    resume,
    isPaused,
    setOnEnded,
    setPlaybackRate,
    getPlaybackRate,
    setVoice,
    getVoice,
    cleanup,
  };
}
