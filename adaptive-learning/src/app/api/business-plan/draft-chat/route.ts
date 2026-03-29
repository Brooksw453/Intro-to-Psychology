import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClaudeClient } from '@/lib/claude';
import { rateLimit } from '@/lib/rateLimit';
import { COURSE_ID } from '@/lib/course.config';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { success } = rateLimit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before trying again.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const { sectionType, messages, planContent } = await request.json();

    if (!sectionType || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let systemPrompt: string;

    if (sectionType === 'exec-summary') {
      systemPrompt = `You are an AI drafting assistant helping a community college student write the Executive Summary for their business plan.

Here is the full content of their business plan sections:
${planContent}

YOUR ROLE:
You are helping the student write a compelling Executive Summary (200-500 words) that synthesizes their entire business plan. The executive summary should:
- Open with a hook about the business opportunity
- Briefly describe the business concept and target market
- Highlight the organizational structure and management approach
- Summarize the marketing and competitive strategy
- Touch on financial projections and funding needs
- End with a confident forward-looking statement

PHASE 1 (Gathering info): If you need clarification, ask 1-2 focused questions. But since you have the full plan content above, you should usually have enough to draft immediately.

PHASE 2 (Drafting): Generate a complete executive summary draft using their actual plan content. Write in first person, professional but accessible tone. Wrap the draft between markers:

--- DRAFT ---
[the actual draft content here]
--- END DRAFT ---

After the draft, briefly note what you emphasized and ask if they'd like adjustments.

PHASE 3 (Refining): If they want changes, generate an updated draft with the same markers.

IMPORTANT:
- Use ONLY details from their actual plan sections — don't invent facts
- Write at a community college level — professional but not overly formal
- Keep it 200-500 words
- Keep non-draft conversation brief`;
    } else {
      // Introduction — focused on reflection
      systemPrompt = `You are an AI drafting assistant helping a community college student write the Introduction for their business plan.

The introduction should be a personal, reflective piece (150-300 words) about their journey creating this business plan.

YOUR ROLE:
Guide the student through reflective questions to help them write a meaningful introduction. Ask questions like:

- What inspired you to choose this particular business idea?
- What was the most surprising thing you learned while developing this plan?
- How did the course concepts (economics, ethics, management, marketing, finance) shape your thinking?
- What was the most challenging part of creating this plan?
- How has your understanding of business changed through this process?
- What are you most proud of in this plan?
- Who do you envision reading this plan, and what do you want them to take away?

PHASE 1 (Gathering info): Ask 2-3 of these reflective questions. Adapt based on their responses. This is about their personal journey, so draw out their authentic voice.

PHASE 2 (Drafting): Once you have their reflections, generate a complete introduction draft that:
- Opens with what inspired the business idea
- Reflects on the learning journey
- Previews what the reader will find in the plan
- Sounds authentically like the student, not like AI

Wrap the draft between markers:
--- DRAFT ---
[the actual draft content here]
--- END DRAFT ---

PHASE 3 (Refining): If they want changes, generate an updated draft with the same markers.

IMPORTANT:
- This is personal and reflective — not a business document
- Use the student's own words and feelings as much as possible
- Keep it 150-300 words
- Be warm and encouraging — this is a capstone moment`;
    }

    const claudeMessages = messages.map((msg: { role: 'user' | 'assistant'; content: string }) => ({
      role: msg.role,
      content: msg.content,
    }));

    const claude = createClaudeClient();
    const response = await claude.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      temperature: 0.7,
      system: systemPrompt,
      messages: claudeMessages,
    });

    const aiText = response.content[0].type === 'text' ? response.content[0].text : '';
    const hasDraft = aiText.includes('--- DRAFT ---') && aiText.includes('--- END DRAFT ---');

    await supabase.from('ai_interactions').insert({
      user_id: user.id,
      interaction_type: 'bp_draft_chat',
      context: { sectionType, messageCount: messages.length, hasDraft },
      prompt_sent: messages[messages.length - 1]?.content || '',
      response_received: aiText,
      tokens_used: response.usage?.output_tokens || 0,
      course_id: COURSE_ID,
    });

    return NextResponse.json({ message: aiText, hasDraft });
  } catch (error) {
    console.error('Business plan draft chat error:', error);
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 });
  }
}
