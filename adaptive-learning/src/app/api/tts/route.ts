import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rateLimit';
import { COURSE_ID } from '@/lib/course.config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_TTS_URL = 'https://api.openai.com/v1/audio/speech';
const DEFAULT_VOICE = 'nova';
const DEFAULT_MODEL = 'tts-1';

// GET /api/tts — lightweight check: is OpenAI TTS configured?
// No auth required — just returns { available: true/false }
export async function GET() {
  return NextResponse.json(
    { available: !!OPENAI_API_KEY },
    {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=300' }, // Cache 5 min
    }
  );
}

export async function POST(request: Request) {
  // If no OpenAI key configured, signal client to fall back to SpeechSynthesis
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

    // Rate limit: 120 req/min (TTS chunks are small and cheap)
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

    // Validate voice or use default
    const selectedVoice = voice && VALID_VOICES.includes(voice) ? voice : DEFAULT_VOICE;

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

    // Log interaction (fire and forget — don't block audio delivery)
    supabase.from('ai_interactions').insert({
      user_id: user.id,
      course_id: COURSE_ID,
      interaction_type: 'tts',
      context: { chars: text.length },
      prompt_sent: text.slice(0, 200),
      response_received: 'audio/mp3',
      tokens_used: 0,
    }).then(() => {});

    // Stream the MP3 back to client
    const audioBuffer = await openaiResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
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
