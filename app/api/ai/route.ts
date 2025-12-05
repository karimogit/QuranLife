import type { NextRequest } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const { goal } = await req.json();

    if (!goal || typeof goal !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing or invalid goal parameter' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    const apiKey = process.env.CHATGPT_API;
    if (!apiKey) {
      console.error('CHATGPT_API environment variable not set');
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    const systemPrompt = `You are a Quran scholar. Given a user's goal, return 3-5 relevant Quranic verse references.

PLAIN OUTPUT ONLY. One verse per line in format: surah:ayah
Example:
2:286
13:11
94:5

Rules:
- Only valid surah numbers (1-114) and ayah numbers
- Choose verses that genuinely relate to the goal
- No explanations, no extra text, just the references`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: goal }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI service error', details: errorText }), {
        status: response.status,
        headers: { 'content-type': 'application/json' }
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return new Response(JSON.stringify({ error: 'Empty response from AI' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Parse plain text response: one "surah:ayah" per line
    const lines = content.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    const verses: Array<{ surah: number; ayah: number }> = [];

    for (const line of lines) {
      const match = line.match(/^(\d+):(\d+)$/);
      if (match) {
        const surah = parseInt(match[1], 10);
        const ayah = parseInt(match[2], 10);
        if (surah >= 1 && surah <= 114 && ayah >= 1) {
          verses.push({ surah, ayah });
        }
      }
    }

    if (verses.length === 0) {
      console.error('No valid verses parsed from AI response:', content);
      return new Response(JSON.stringify({ error: 'No valid verses returned', raw: content }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ verses }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });

  } catch (err) {
    console.error('AI API error:', err);
    return new Response(JSON.stringify({ 
      error: 'AI service error', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
