import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/rateLimit';
import { COURSE_ID } from '@/lib/course.config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const DEFAULT_VOICE = 'nova';
const DEFAULT_MODEL = 'tts-1';
const CACHE_BUCKET = 'audio-cache';

// Daily character limit for UNCACHED (new) generations only.
// Cached audio is free and doesn't count toward the quota.
const DAILY_CHAR_LIMIT = 50000;
// Emails that bypass the daily limit (unlimited new generations)
const UNLIMITED_EMAILS = ['bwinchell@esdesigns.org'];

// In-memory daily usage tracker: userId → { chars, date }
const dailyUsage = new Map<string, { chars: number; date: string }>();

function getDailyUsage(userId: string): number {
  const today = new Date().toISOString().slice(0, 10);
  const entry = dailyUsage.get(userId);
  if (!entry || entry.date !== today) {
    dailyUsage.set(userId, { chars: 0, date: today });
    return 0;
  }
  return entry.chars;
}

function addDailyUsage(userId: string, chars: number) {
  const today = new Date().toISOString().slice(0, 10);
  const entry = dailyUsage.get(userId);
  if (!entry || entry.date !== today) {
    dailyUsage.set(userId, { chars, date: today });
  } else {
    entry.chars += chars;
  }
}

function getResetTime(): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/** Generate a short hash for cache keys */
async function hashKey(text: string, voice: string): Promise<string> {
  const data = new TextEncoder().encode(`${voice}:${text}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

// GET /api/tts — lightweight check + optional debug
export async function GET(request: Request) {
  const url = new URL(request.url);
  const debug = url.searchParams.get('debug') === '1';

  if (!debug) {
    return NextResponse.json(
      { available: !!OPENAI_API_KEY },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, max-age=300' },
      }
    );
  }

  if (!OPENAI_API_KEY) {
    return NextResponse.json({ available: false, error: 'No OPENAI_API_KEY env var' });
  }

  try {
    const openaiResponse = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        voice: DEFAULT_VOICE,
        input: 'Test.',
        response_format: 'mp3',
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text().catch(() => 'Unknown');
      return NextResponse.json({
        available: true,
        openaiStatus: openaiResponse.status,
        openaiError: errorBody,
        keyPrefix: OPENAI_API_KEY.slice(0, 8) + '...',
      });
    }

    const audioBytes = (await openaiResponse.arrayBuffer()).byteLength;

    // Check if cache bucket exists
    const admin = createAdminClient();
    const { data: buckets } = await admin.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === CACHE_BUCKET) || false;

    return NextResponse.json({
      available: true,
      openaiStatus: 200,
      audioBytes,
      voice: DEFAULT_VOICE,
      cacheBucket: bucketExists ? 'exists' : 'missing — create it in Supabase Dashboard → Storage',
      keyPrefix: OPENAI_API_KEY.slice(0, 8) + '...',
    });
  } catch (err) {
    return NextResponse.json({
      available: true,
      error: String(err),
      keyPrefix: OPENAI_API_KEY.slice(0, 8) + '...',
    });
  }
}

export async function POST(request: Request) {
  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'TTS not configured' },
      { status: 501 }
    );
  }

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit: 120 req/min
    const { success } = rateLimit(user.id, 120, 60000);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': '10' } }
      );
    }

    const VALID_VOICES = ['alloy', 'echo', 'fable', 'nova', 'onyx', 'shimmer'];
    const { text, voice } = await request.json() as { text: string; voice?: string };

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }
    if (text.length > 4096) {
      return NextResponse.json({ error: 'Text too long (max 4096 chars)' }, { status: 400 });
    }

    const selectedVoice = voice && VALID_VOICES.includes(voice) ? voice : DEFAULT_VOICE;

    // ─── Check cache first ──────────────────────────────────────────
    const cacheKey = await hashKey(text, selectedVoice);
    const cachePath = `${COURSE_ID}/${cacheKey}.mp3`;
    const admin = createAdminClient();

    // Try to download from cache
    const { data: cachedData } = await admin.storage
      .from(CACHE_BUCKET)
      .download(cachePath);

    if (cachedData) {
      // Cache HIT — return cached audio (free, no quota impact)
      const audioBuffer = await cachedData.arrayBuffer();
      return new Response(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.byteLength.toString(),
          'Cache-Control': 'public, max-age=86400',
          'X-TTS-Cache': 'hit',
        },
      });
    }

    // ─── Cache MISS — need to generate ──────────────────────────────

    // Daily quota check (only for uncached generations)
    const userEmail = user.email || '';
    const isUnlimited = UNLIMITED_EMAILS.includes(userEmail.toLowerCase());

    if (!isUnlimited) {
      const used = getDailyUsage(user.id);
      if (used + text.length > DAILY_CHAR_LIMIT) {
        const remaining = Math.max(0, DAILY_CHAR_LIMIT - used);
        return NextResponse.json(
          {
            error: 'quota_exceeded',
            message: `You've reached your daily premium voice limit. It resets in ${getResetTime()}.`,
            used,
            limit: DAILY_CHAR_LIMIT,
            remaining,
            resetIn: getResetTime(),
          },
          { status: 429 }
        );
      }
    }

    // Call OpenAI TTS API
    const openaiResponse = await fetch(OPENAI_TTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        voice: selectedVoice,
        input: text,
        response_format: 'mp3',
      }),
    });

    if (!openaiResponse.ok) {
      const errorBody = await openaiResponse.text().catch(() => 'Unknown error');
      console.error('OpenAI TTS error:', openaiResponse.status, errorBody);
      return NextResponse.json(
        { error: 'TTS generation failed' },
        { status: 502 }
      );
    }

    const audioBuffer = await openaiResponse.arrayBuffer();

    // Track usage (only for uncached, after successful generation)
    if (!isUnlimited) {
      addDailyUsage(user.id, text.length);
    }

    // Store in cache (fire and forget — don't block audio delivery)
    admin.storage
      .from(CACHE_BUCKET)
      .upload(cachePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      })
      .then(({ error }) => {
        if (error) console.error('TTS cache store error:', error.message);
      });

    // Log interaction
    supabase.from('ai_interactions').insert({
      user_id: user.id,
      course_id: COURSE_ID,
      interaction_type: 'tts',
      context: { chars: text.length, voice: selectedVoice, cached: false },
      prompt_sent: text.slice(0, 200),
      response_received: 'audio/mp3',
      tokens_used: 0,
    }).then(() => {});

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=86400',
        'X-TTS-Cache': 'miss',
      },
    });
  } catch (error) {
    console.error('TTS route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
