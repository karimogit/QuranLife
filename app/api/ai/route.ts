import type { NextRequest } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

interface VerseRecommendation {
  surah: number;
  ayah: number;
  reason: string;
}

interface AIResponse {
  verses: VerseRecommendation[];
  theme: string;
}

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

    const systemPrompt = `You are a knowledgeable Islamic scholar assistant. Your task is to recommend the most relevant Quranic verses for a user's personal goal or life situation.

Given a user's goal, return 3-5 Quranic verses that provide guidance, inspiration, or wisdom relevant to their situation.

You must respond with valid JSON in this exact format:
{
  "theme": "the main Islamic theme (e.g., patience, gratitude, trust, success, family, etc.)",
  "verses": [
    {
      "surah": <surah number 1-114>,
      "ayah": <ayah number>,
      "reason": "<brief explanation of why this verse is relevant>"
    }
  ]
}

Important guidelines:
- Only recommend verses that genuinely relate to the goal
- Prefer well-known, impactful verses when appropriate
- Consider both literal and thematic connections
- Include verses that offer practical guidance, not just abstract concepts
- Ensure surah and ayah numbers are accurate (Surah 1 has 7 ayahs, Surah 2 has 286, etc.)`;

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
          { role: 'user', content: `Find relevant Quranic verses for this goal: "${goal}"` }
        ],
        temperature: 0.7,
        max_tokens: 1000
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
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Empty response from AI' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Parse the JSON response from GPT
    let aiResponse: AIResponse;
    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      aiResponse = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', content, parseError);
      return new Response(JSON.stringify({ error: 'Invalid AI response format', raw: content }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Validate the response structure
    if (!aiResponse.verses || !Array.isArray(aiResponse.verses)) {
      return new Response(JSON.stringify({ error: 'Invalid verse recommendations' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Validate and filter verse references
    const validVerses = aiResponse.verses.filter(v => 
      typeof v.surah === 'number' && 
      typeof v.ayah === 'number' && 
      v.surah >= 1 && v.surah <= 114 &&
      v.ayah >= 1
    );

    return new Response(JSON.stringify({
      theme: aiResponse.theme || 'guidance',
      verses: validVerses
    }), {
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
