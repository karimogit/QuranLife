import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const surah = searchParams.get('surah');
    const ayah = searchParams.get('ayah');
    const edition = searchParams.get('edition') || 'ar.alafasy';

    if (!surah || !ayah) {
      return new Response(JSON.stringify({ error: 'Missing required params: surah and ayah' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Validate numeric params and edition format
    const surahNum = Number(surah);
    const ayahNum = Number(ayah);
    if (!Number.isInteger(surahNum) || surahNum < 1 || surahNum > 114 ||
        !Number.isInteger(ayahNum) || ayahNum < 1 || ayahNum > 286 ||
        !/^[a-z0-9.]+$/i.test(edition)) {
      return new Response(JSON.stringify({ error: 'Invalid surah, ayah, or edition' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      });
    }

    // First fetch the verse metadata to get the global verse number
    const metaUrl = `https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/${edition}`;
    
    let metaRes;
    try {
      metaRes = await fetch(metaUrl, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'QuranLife/1.0',
          'Accept': 'application/json'
        }
      });
    } catch (fetchError) {
      logger.error('Fetch error', fetchError, 'Audio API');
      return new Response(JSON.stringify({ error: 'Network error fetching metadata' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (!metaRes.ok) {
      logger.error('Metadata fetch failed', { status: metaRes.status, statusText: metaRes.statusText }, 'Audio API');
      return new Response(JSON.stringify({ error: 'Failed to fetch audio metadata' }), {
        status: metaRes.status >= 400 && metaRes.status < 600 ? metaRes.status : 502,
        headers: { 'content-type': 'application/json' }
      });
    }

    let meta;
    try {
      meta = await metaRes.json();
    } catch (jsonError) {
      logger.error('JSON parse error', jsonError, 'Audio API');
      return new Response(JSON.stringify({ error: 'Invalid JSON response from metadata API' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }
    
    const verseNumber = meta?.data?.number;
    if (!verseNumber) {
      logger.error('No verse number found in metadata', undefined, 'Audio API');
      return new Response(JSON.stringify({ error: 'Verse number not found' }), {
        status: 404,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Construct the audio URL using the global verse number
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${edition}/${verseNumber}.mp3`;

    // Forward Range header for streaming support
    const range = req.headers.get('range') || undefined;

    let audioRes;
    try {
      audioRes = await fetch(audioUrl, {
        headers: range ? { Range: range } : undefined,
      });
    } catch (audioFetchError) {
      logger.error('Audio fetch error', audioFetchError, 'Audio API');
      return new Response(JSON.stringify({ error: 'Network error fetching audio file' }), {
        status: 500,
        headers: { 'content-type': 'application/json' }
      });
    }

    if (!audioRes.ok) {
      logger.error('Audio fetch failed', { status: audioRes.status, statusText: audioRes.statusText }, 'Audio API');
      return new Response(JSON.stringify({ error: 'Failed to fetch audio file' }), {
        status: audioRes.status >= 400 && audioRes.status < 600 ? audioRes.status : 502,
        headers: { 'content-type': 'application/json' }
      });
    }

    // Stream back the response with relevant headers
    const headers = new Headers();
    // Copy commonly needed headers
    const copyHeaders = [
      'content-type',
      'content-length',
      'accept-ranges',
      'content-range',
      'cache-control',
      'etag',
      'last-modified'
    ];
    for (const h of copyHeaders) {
      const v = audioRes.headers.get(h);
      if (v) headers.set(h, v);
    }
    // Allow browsers to cache for a short period
    if (!headers.has('cache-control')) {
      headers.set('cache-control', 'public, max-age=3600');
    }

    return new Response(audioRes.body, {
      status: audioRes.status, // could be 200 or 206
      headers
    });
  } catch (err) {
    logger.error('Audio API error', err, 'Audio API');
    return new Response(JSON.stringify({ error: 'Audio proxy error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    });
  }
}
