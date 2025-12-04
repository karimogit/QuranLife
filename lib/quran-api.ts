/**
 * QuranLife API Service - AlQuran.cloud Integration
 * Provides clean interfaces to interact with Quran data
 * Updated to handle CORS issues with audio URLs
 */

export interface Verse {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  translation?: string;
  transliteration?: string; // Phonetic/transliteration text
  audio?: string; // Audio URL for the verse
  surahNumber?: number;
  surahName?: string;
  surahEnglishName?: string;
  surahEnglishNameTranslation?: string;
  surahRevelationType?: 'Meccan' | 'Medinan';
  surahAyahCount?: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  verses?: Verse[];
}

export interface RandomVerseResponse {
  verse: Verse;
  surah: Surah;
  theme?: string;
  context?: string;
  audio?: string; // Audio URL for the verse
}

class QuranAPI {
  private readonly baseURL = 'https://api.alquran.cloud/v1';
  private readonly arabicEdition = 'quran-uthmani';
  private readonly englishEdition = 'en.asad'; // Muhammad Asad translation
  private readonly transliterationEdition = 'en.transliteration'; // Phonetic/transliteration
  private audioEdition = 'ar.alafasy'; // Default: Mishary Rashid Alafasy recitation

  /**
   * Set the audio edition for recitations
   */
  setAudioEdition(edition: string) {
    this.audioEdition = edition;
  }

  /**
   * Get current audio edition
   */
  getAudioEdition(): string {
    return this.audioEdition;
  }

  /**
   * Get available audio editions
   */
  async getAudioEditions(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseURL}/edition?format=audio&language=ar&type=versebyverse`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching audio editions:', error);
      return [];
    }
  }

  /**
   * Get a specific Surah with both Arabic text and English translation
   */
  async getSurah(surahNumber: number): Promise<Surah> {
    try {
      const response = await fetch(
        `${this.baseURL}/surah/${surahNumber}/editions/${this.arabicEdition},${this.englishEdition}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch Surah ${surahNumber}`);
      }

      const data = await response.json();
      
      if (data.code !== 200 || !data.data || data.data.length !== 2) {
        throw new Error('Invalid API response format');
      }

      const [arabicSurah, englishSurah] = data.data;
      
      // Combine Arabic text with English translation
      const verses: Verse[] = arabicSurah.ayahs.map((ayah: any, index: number) => ({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        juz: ayah.juz,
        page: ayah.page,
        translation: englishSurah.ayahs[index]?.text || '',
        surahNumber: arabicSurah.number,
        surahName: arabicSurah.name,
        surahEnglishName: arabicSurah.englishName,
        surahEnglishNameTranslation: arabicSurah.englishNameTranslation,
        surahRevelationType: arabicSurah.revelationType,
        surahAyahCount: arabicSurah.numberOfAyahs
      }));

      return {
        number: arabicSurah.number,
        name: arabicSurah.name,
        englishName: arabicSurah.englishName,
        englishNameTranslation: arabicSurah.englishNameTranslation,
        revelationType: arabicSurah.revelationType,
        numberOfAyahs: arabicSurah.numberOfAyahs,
        verses
      };
    } catch (error) {
      console.error('Error fetching Surah:', error);
      throw error;
    }
  }

  /**
   * Get audio URL for a specific verse - Updated to handle CORS issues
   */
  async getVerseAudio(surahNumber: number, verseNumber: number): Promise<string | null> {
    try {
      // Always return our proxy URL; upstream CORS is handled server-side
      const proxied = `/api/audio?surah=${encodeURIComponent(String(surahNumber))}&ayah=${encodeURIComponent(String(verseNumber))}&edition=${encodeURIComponent(this.audioEdition)}`;
      return proxied;
    } catch (error) {
      console.error('Error building verse audio URL:', error);
      return null;
    }
  }

  /**
   * Get a specific verse with Arabic text, English translation, and transliteration
   */
  async getVerse(surahNumber: number, verseNumber: number): Promise<Verse> {
    try {
      const response = await fetch(
        `${this.baseURL}/ayah/${surahNumber}:${verseNumber}/editions/${this.arabicEdition},${this.englishEdition},${this.transliterationEdition}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch verse ${surahNumber}:${verseNumber}`);
      }

      const data = await response.json();
      const arabicVerse = data.data.find((v: any) => v.edition.identifier === this.arabicEdition);
      const englishVerse = data.data.find((v: any) => v.edition.identifier === this.englishEdition);
      const transliterationVerse = data.data.find((v: any) => v.edition.identifier === this.transliterationEdition);

      if (!arabicVerse || !englishVerse) {
        throw new Error('Missing Arabic or English text for verse');
      }

      // Get audio URL via our proxy (works in browsers)
      const audioUrl = await this.getVerseAudio(surahNumber, verseNumber);

      return {
        number: arabicVerse.number,
        text: arabicVerse.text,
        numberInSurah: arabicVerse.numberInSurah,
        juz: arabicVerse.juz,
        page: arabicVerse.page,
        translation: englishVerse.text,
        transliteration: transliterationVerse?.text || undefined,
        audio: audioUrl || undefined,
        surahNumber: arabicVerse.surah?.number,
        surahName: arabicVerse.surah?.name,
        surahEnglishName: arabicVerse.surah?.englishName,
        surahEnglishNameTranslation: arabicVerse.surah?.englishNameTranslation,
        surahRevelationType: arabicVerse.surah?.revelationType,
        surahAyahCount: arabicVerse.surah?.numberOfAyahs
      };
    } catch (error) {
      console.error('Error fetching verse:', error);
      throw error;
    }
  }

  /**
   * Get a random verse - simulates random selection from popular Surahs
   */
  async getRandomVerse(): Promise<RandomVerseResponse> {
    // Popular Surahs for daily guidance
    const popularSurahs = [
      { number: 1, maxVerses: 7 },    // Al-Fatiha
      { number: 2, maxVerses: 286 },  // Al-Baqarah
      { number: 3, maxVerses: 200 },  // Ali 'Imran
      { number: 18, maxVerses: 110 }, // Al-Kahf
      { number: 36, maxVerses: 83 },  // Ya-Sin
      { number: 55, maxVerses: 78 },  // Ar-Rahman
      { number: 67, maxVerses: 30 },  // Al-Mulk
      { number: 112, maxVerses: 4 },  // Al-Ikhlas
      { number: 113, maxVerses: 5 },  // Al-Falaq
      { number: 114, maxVerses: 6 }   // An-Nas
    ];

    try {
      // Select random Surah
      const randomSurah = popularSurahs[Math.floor(Math.random() * popularSurahs.length)];
      const randomVerseNumber = Math.floor(Math.random() * randomSurah.maxVerses) + 1;

      // Get the verse and Surah info
      const [verse, surah] = await Promise.all([
        this.getVerse(randomSurah.number, randomVerseNumber),
        this.getSurah(randomSurah.number)
      ]);

      // Add thematic context based on Surah
      const context = this.getVerseContext(randomSurah.number);

      return {
        verse,
        surah,
        theme: context.theme,
        context: context.description
      };
    } catch (error) {
      console.error('Error getting random verse:', error);
      throw error;
    }
  }

  /**
   * Search for verses containing specific keywords
   */
  async searchVerses(query: string, language: 'ar' | 'en' = 'en', surah: 'all' | number = 'all'): Promise<Verse[]> {
    try {
      const edition = language === 'ar' ? this.arabicEdition : this.englishEdition;
      const response = await fetch(
        `${this.baseURL}/search/${encodeURIComponent(query)}/${surah}/${edition}`
      );
      
      if (!response.ok) {
        throw new Error(`Search failed for query: ${query}`);
      }

      const data = await response.json();
      
      if (data.code !== 200 || !data.data?.matches) {
        return [];
      }

      return data.data.matches.map((match: any) => ({
        number: match.number,
        text: match.text,
        numberInSurah: match.numberInSurah,
        juz: match.juz,
        page: match.page,
        translation: language === 'ar' ? undefined : match.text,
        surahNumber: match.surah?.number,
        surahName: match.surah?.name,
        surahEnglishName: match.surah?.englishName,
        surahEnglishNameTranslation: match.surah?.englishNameTranslation,
        surahRevelationType: match.surah?.revelationType,
        surahAyahCount: match.surah?.numberOfAyahs
      }));
    } catch (error) {
      console.error('Error searching verses:', error);
      return [];
    }
  }

  /**
   * Get thematic context for verses from different Surahs
   */
  private getVerseContext(surahNumber: number): { theme: string; description: string } {
    const contexts: Record<number, { theme: string; description: string }> = {
      1: { theme: 'Prayer & Worship', description: 'The opening chapter, perfect for daily recitation and reflection' },
      2: { theme: 'Guidance', description: 'The longest chapter with comprehensive guidance for life' },
      3: { theme: 'Family of Imran', description: 'Stories of prophets and guidance for believers' },
      18: { theme: 'Stories & Lessons', description: 'Contains the story of the cave and other parables' },
      36: { theme: 'Heart of Quran', description: 'Often called the heart of the Quran' },
      55: { theme: 'Gratitude', description: 'Emphasizes Allah\'s countless blessings' },
      67: { theme: 'Sovereignty', description: 'About Allah\'s dominion and the afterlife' },
      112: { theme: 'Unity of Allah', description: 'Declares the absolute oneness of Allah' },
      113: { theme: 'Protection', description: 'Seeking refuge from evil' },
      114: { theme: 'Protection', description: 'Seeking refuge in Allah from all harms' }
    };

    return contexts[surahNumber] || { 
      theme: 'Islamic Guidance', 
      description: 'Divine guidance for spiritual growth' 
    };
  }

  /**
   * Get list of all Surahs (metadata only)
   */
  async getAllSurahs(): Promise<Surah[]> {
    try {
      const response = await fetch(`${this.baseURL}/surah`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Surahs list');
      }

      const data = await response.json();
      
      if (data.code !== 200 || !data.data) {
        throw new Error('Invalid API response format');
      }

      return data.data.map((surah: any) => ({
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        revelationType: surah.revelationType,
        numberOfAyahs: surah.numberOfAyahs
      }));
    } catch (error) {
      console.error('Error fetching Surahs list:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const quranAPI = new QuranAPI();
export default quranAPI; 