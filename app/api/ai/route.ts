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

    const systemPrompt = `You are a Quran scholar. Given a user's goal, return 3-5 relevant Quranic verse references with a brief explanation of how each applies to their goal.

FORMAT: One verse per line as: surah:ayah|How this applies (max 16 words)

Example for goal "find inner peace":
13:28|Remembrance of Allah brings tranquility and peace to the heart.
2:286|Allah never burdens you beyond your capacity—trust His wisdom.
94:5|With every hardship comes ease—relief is always near.

Rules:
- Only valid surah numbers (1-114) and ayah numbers
- Choose verses that genuinely relate to the goal
- Each explanation must be 16 words or fewer
- Make explanations personal and actionable (use "you/your")
- No extra text, just the formatted lines`;

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
        max_tokens: 300
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

    // Parse response: "surah:ayah|explanation" per line
    const lines = content.split('\n').map((l: string) => l.trim()).filter((l: string) => l);
    const verses: Array<{ surah: number; ayah: number; explanation: string }> = [];

    for (const line of lines) {
      // Match format: surah:ayah|explanation
      const match = line.match(/^(\d+):(\d+)\|(.+)$/);
      if (match) {
        const surah = parseInt(match[1], 10);
        const ayah = parseInt(match[2], 10);
        let explanation = match[3].trim();
        
        // Enforce 16 word limit
        const words = explanation.split(/\s+/);
        if (words.length > 16) {
          explanation = words.slice(0, 16).join(' ');
          // Add ellipsis if we truncated
          if (!explanation.endsWith('.')) {
            explanation += '...';
          }
        }
        
        if (surah >= 1 && surah <= 114 && ayah >= 1) {
          verses.push({ surah, ayah, explanation });
        }
      } else {
        // Fallback: try to match just surah:ayah without explanation
        const simpleMatch = line.match(/^(\d+):(\d+)$/);
        if (simpleMatch) {
          const surah = parseInt(simpleMatch[1], 10);
          const ayah = parseInt(simpleMatch[2], 10);
          if (surah >= 1 && surah <= 114 && ayah >= 1) {
            verses.push({ surah, ayah, explanation: '' });
          }
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
