/**
 * Advanced Quran Engine for QuranLife
 * Provides intelligent verse matching, practical guidance, and thematic organization
 * Now powered by AlQuran.cloud API for complete Quran access
 * Author: Karim Osman (https://kar.im)
 */

import { quranAPI, type Verse, type RandomVerseResponse } from './quran-api';

export interface QuranVerse {
  id: number;
  surah: string;
  surah_number: number;
  ayah: number;
  text_ar: string;
  text_en: string;
  theme: string[];
  reflection: string;
  practical_guidance?: string[];
  related_hadith?: string;
  context?: string;
  life_application?: string;
  audio?: string; // Audio URL for the verse
}

export interface GoalMatchResult {
  verse: QuranVerse;
  relevanceScore: number;
  practicalSteps: string[];
  duaRecommendation?: string;
  relatedHabits: string[];
}

export interface ThematicCollection {
  theme: string;
  description: string;
  verses: QuranVerse[];
  practicalGuidance: string[];
  recommendedActions: string[];
}

// Enhanced guidance for transforming API verses into practical advice
const PRACTICAL_GUIDANCE: Record<string, string[]> = {
  patience: [
    "Make dua during difficult times: 'Rabbana afrigh 'alayna sabran' (Our Lord, pour upon us patience)",
    "Practice the 3-breath technique when feeling impatient",
    "Remember that every difficulty is temporary and has wisdom",
    "Read stories of Prophet Ayub (Job) for inspiration",
    "Set realistic timelines for your goals"
  ],
  prayer: [
    "Set 5 phone reminders for daily prayers",
    "Prepare a clean prayer space in your home",
    "Learn the meanings of Surah Al-Fatiha",
    "Make dua in your own language after each prayer",
    "Join congregation prayers when possible"
  ],
  health: [
    "Remember your body is an amanah (trust) from Allah",
    "Make dua before physical activities: 'Allahumma a'inni wa la tu'in 'alayya' (O Allah, help me and do not help others against me)",
    "Exercise with the intention of strengthening yourself for worship",
    "Maintain moderation in all physical activities",
    "Thank Allah for the strength and ability He has given you",
    "Use fitness time for dhikr (remembrance of Allah)",
    "Remember the Prophet's ﷺ emphasis on physical strength and health"
  ],
  fitness: [
    "Set consistent workout schedules as discipline for the soul",
    "Use gym time for reflection and gratitude",
    "Remember that physical strength helps in serving Allah better",
    "Practice moderation - avoid obsession with appearance",
    "Make intention to be strong for your family and community",
    "Include walking or movement as Sunnah practices",
    "Thank Allah for your body's capabilities after each workout"
  ],
  strength: [
    "Seek both physical and spiritual strength from Allah",
    "Remember: 'The strong believer is better than the weak believer'",
    "Use physical training to build mental resilience",
    "Combine physical exercise with spiritual exercises (prayer, dhikr)",
    "Help others using your physical capabilities",
    "Maintain humility despite gaining strength",
    "Use strength to protect and serve, not to show off"
  ],
  change: [
    "Start with one small habit change this week",
    "Make du'a: 'Rabbana atina fi'd-dunya hasanatan' (Our Lord, give us good in this world)",
    "Write down 3 specific steps toward your goal",
    "Find an accountability partner in your community",
    "Celebrate small victories along the way"
  ],
  family: [
    "Schedule weekly family time without devices",
    "Teach children one new Islamic value each month",
    "Practice forgiveness and patience with family members",
    "Make family du'a together before meals",
    "Share stories of the Prophet's family life"
  ],
  anxiety: [
    "Recite Ayat al-Kursi when feeling anxious",
    "Practice deep breathing with 'La hawla wa la quwwata illa billah'",
    "Maintain regular prayer times for structure",
    "Seek support from trusted friends or counselors",
    "Remember that Allah does not burden a soul beyond its capacity"
  ],
  success: [
    "Begin every endeavor with 'Bismillah'",
    "Set intentions (niyyah) aligned with Islamic values",
    "Balance worldly goals with spiritual growth",
    "Give charity (sadaqah) as you progress",
    "Remember success comes from Allah alone"
  ]
};

// Enhanced dua recommendations for different life situations
const DUA_RECOMMENDATIONS: Record<string, string> = {
  patience: "Rabbana afrigh 'alayna sabran wa thabbit aqdamana (Our Lord, pour upon us patience and make our steps firm)",
  change: "Rabbana atina fi'd-dunya hasanatan wa fi'l-akhirati hasanatan (Our Lord, give us good in this world and good in the hereafter)",
  guidance: "Rabbana la tuzigh qulubana ba'da idh hadaytana (Our Lord, do not let our hearts deviate after You have guided us)",
  family: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin (Our Lord, grant us wives and offspring who will be the comfort of our eyes)",
  anxiety: "Hasbunallahu wa ni'mal wakeel (Allah is sufficient for us and He is the best guardian)",
  success: "Rabbi a'inni wa la tu'in 'alayya (My Lord, help me and do not help against me)",
  health: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari (O Allah, grant me health in my body, O Allah, grant me health in my hearing, O Allah, grant me health in my sight)",
  fitness: "Allahumma a'inni wa la tu'in 'alayya wa'nsurni wa la tansur 'alayya (O Allah, help me and do not help others against me, support me and do not support others against me)",
  strength: "Allahumma inni as'aluka min quwwatika wa 'afiyatika (O Allah, I ask You for Your strength and Your well-being)"
};

class QuranEngine {
  private apiCache: Map<string, any> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get daily verse with guidance - now powered by live API
   */
  async getDailyVerse(): Promise<QuranVerse | null> {
    try {
      const randomVerseResponse = await quranAPI.getRandomVerse();
      return this.convertAPIVerseToQuranVerse(randomVerseResponse);
    } catch (error) {
      console.error('Error fetching daily verse:', error);
      
      // Fallback to a default verse if API fails
      return this.getFallbackVerse();
    }
  }

  /**
   * Find verses matching specific goals or themes
   */
  async findVersesForGoal(goal: string): Promise<GoalMatchResult[]> {
    try {
      // Extract keywords from goal
      const keywords = this.extractKeywords(goal);
      const theme = this.determineTheme(keywords);
      
      console.log('Goal analysis:', { goal, keywords, theme });
      
      // Build multiple search attempts with better strategy
      const distinctByNumber = (arr: any[]) => {
        const seen = new Set<number>();
        const out: any[] = [];
        for (const v of arr) {
          if (!seen.has(v.number)) { seen.add(v.number); out.push(v); }
        }
        return out;
      };

      // Create more targeted search queries
      const searchQueries = this.buildSearchQueries(goal, keywords, theme);
      console.log('Search queries:', searchQueries);

      let aggregated: any[] = [];
      
      // Try each search query until we get good results
      for (const query of searchQueries) {
        try {
          console.log('Trying search query:', query);
          const res = await quranAPI.searchVerses(query, 'en');
          console.log(`Query "${query}" returned ${res.length} results`);
          
          aggregated = distinctByNumber([...aggregated, ...res]);
          
          // If we have enough good results, stop searching
          if (aggregated.length >= 5) {
            console.log('Enough results found, stopping search');
            break;
          }
        } catch (error) {
          console.log(`Search query "${query}" failed:`, error);
          continue;
        }
      }
      
      // If no search results, try direct goal search as fallback
      if (aggregated.length === 0) {
        try {
          console.log('No theme-based results, trying direct goal search:', goal);
          const directResults = await quranAPI.searchVerses(goal, 'en');
          if (directResults.length > 0) {
            console.log('Direct goal search found results:', directResults.length);
            const matches: GoalMatchResult[] = [];
            
            for (const apiVerse of directResults.slice(0, 1)) {
              const quranVerse = await this.convertAPIVerseToQuranVerse({
                verse: apiVerse,
                surah: { number: Math.floor(apiVerse.number / 1000) + 1 } as any,
                theme: 'guidance',
                context: `Direct search for: ${goal}`
              });

              if (quranVerse) {
                matches.push({
                  verse: quranVerse,
                  relevanceScore: this.calculateRelevanceScore(goal, quranVerse),
                  practicalSteps: this.generatePracticalSteps('guidance', goal),
                  duaRecommendation: DUA_RECOMMENDATIONS['guidance'],
                  relatedHabits: this.getRelatedHabits('guidance')
                });
              }
            }
            
            if (matches.length > 0) {
              return matches;
            }
          }
        } catch (error) {
          console.log('Direct goal search failed:', error);
        }
        
        // Final fallback to thematic verses with variety
        console.log('Using thematic fallback for theme:', theme);
        const fallbackResults = await this.getThematicVersesForGoal(theme, goal);
        
        // If we still don't have results, try a different theme
        if (fallbackResults.length === 0) {
          console.log('No results for primary theme, trying alternative themes');
          const alternativeThemes = ['guidance', 'success', 'patience', 'prayer'];
          for (const altTheme of alternativeThemes) {
            if (altTheme !== theme) {
              const altResults = await this.getThematicVersesForGoal(altTheme, goal);
              if (altResults.length > 0) {
                console.log('Found results with alternative theme:', altTheme);
                return altResults;
              }
            }
          }
        }
        
        return fallbackResults;
      }

      // Convert API results to goal matches with better ranking
      const matches: GoalMatchResult[] = [];
      
      // Sort results by relevance before processing
      const sortedResults = aggregated
        .map(apiVerse => ({
          apiVerse,
          relevanceScore: this.calculateRelevanceScore(goal, { 
            text_en: apiVerse.translation || '', 
            reflection: '' 
          } as any)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 3); // Get top 3 most relevant results
      
      console.log('Top results by relevance:', sortedResults.map(r => ({ 
        verse: r.apiVerse.number, 
        score: r.relevanceScore,
        text: r.apiVerse.translation?.substring(0, 100) + '...'
      })));
      
      for (const { apiVerse } of sortedResults.slice(0, 1)) { // Show only 1 verse initially
        const quranVerse = await this.convertAPIVerseToQuranVerse({
          verse: apiVerse,
          surah: { number: Math.floor(apiVerse.number / 1000) + 1 } as any, // Approximate surah from verse number
          theme,
          context: `Guidance for: ${goal}`
        });

        if (quranVerse) {
          matches.push({
            verse: quranVerse,
            relevanceScore: this.calculateRelevanceScore(goal, quranVerse),
            practicalSteps: this.generatePracticalSteps(theme, goal),
            duaRecommendation: DUA_RECOMMENDATIONS[theme],
            relatedHabits: this.getRelatedHabits(theme)
          });
        }
      }

      return matches;
    } catch (error) {
      console.error('Error finding verses for goal:', error);
      // Return fallback verses if search fails
      const fallbackTheme = this.determineTheme(this.extractKeywords(goal));
      return await this.getThematicVersesForGoal(fallbackTheme, goal);
    }
  }

  /**
   * Get additional verses for a goal (for "Load More" functionality)
   */
  async getAdditionalVersesForGoal(goal: string, currentCount: number = 1): Promise<GoalMatchResult[]> {
    try {
      // Extract keywords from goal
      const keywords = this.extractKeywords(goal);
      const theme = this.determineTheme(keywords);
      
      console.log('Loading additional verses for goal:', { goal, currentCount });
      
      // Build multiple search attempts with better strategy
      const distinctByNumber = (arr: any[]) => {
        const seen = new Set<number>();
        const out: any[] = [];
        for (const v of arr) {
          if (!seen.has(v.number)) { seen.add(v.number); out.push(v); }
        }
        return out;
      };

      // Create more targeted search queries
      const searchQueries = this.buildSearchQueries(goal, keywords, theme);
      console.log('Additional search queries:', searchQueries);

      let aggregated: any[] = [];
      
      // Try each search query until we get good results
      for (const query of searchQueries) {
        try {
          console.log('Trying additional search query:', query);
          const res = await quranAPI.searchVerses(query, 'en');
          console.log(`Additional query "${query}" returned ${res.length} results`);
          
          aggregated = distinctByNumber([...aggregated, ...res]);
          
          // Get more results for additional verses
          if (aggregated.length >= 10) {
            console.log('Enough results for additional verses, stopping search');
            break;
          }
        } catch (error) {
          console.log(`Additional search query "${query}" failed:`, error);
          continue;
        }
      }
      
      if (aggregated.length === 0) {
        console.log('No additional results found, using thematic fallback');
        return await this.getThematicVersesForGoal(theme, goal);
      }

      // Sort results by relevance and get additional verses
      const sortedResults = aggregated
        .map(apiVerse => ({
          apiVerse,
          relevanceScore: this.calculateRelevanceScore(goal, { 
            text_en: apiVerse.translation || '', 
            reflection: '' 
          } as any)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(currentCount, currentCount + 3); // Get next 3 most relevant results
      
      console.log('Additional results by relevance:', sortedResults.map(r => ({ 
        verse: r.apiVerse.number, 
        score: r.relevanceScore,
        text: r.apiVerse.translation?.substring(0, 100) + '...'
      })));

      // Convert API results to goal matches
      const matches: GoalMatchResult[] = [];
      
      for (const { apiVerse } of sortedResults) {
        const quranVerse = await this.convertAPIVerseToQuranVerse({
          verse: apiVerse,
          surah: { number: Math.floor(apiVerse.number / 1000) + 1 } as any,
          theme,
          context: `Additional guidance for: ${goal}`
        });

        if (quranVerse) {
          matches.push({
            verse: quranVerse,
            relevanceScore: this.calculateRelevanceScore(goal, quranVerse),
            practicalSteps: this.generatePracticalSteps(theme, goal),
            duaRecommendation: DUA_RECOMMENDATIONS[theme],
            relatedHabits: this.getRelatedHabits(theme)
          });
        }
      }

      return matches;
    } catch (error) {
      console.error('Error getting additional verses for goal:', error);
      const fallbackTheme = this.determineTheme(this.extractKeywords(goal));
      return await this.getThematicVersesForGoal(fallbackTheme, goal);
    }
  }

  /**
   * Get thematic collection of verses
   */
  async getThematicCollection(theme: string): Promise<ThematicCollection | null> {
    try {
      const cacheKey = `theme_${theme}`;
      
      // Check cache first
      if (this.isCacheValid(cacheKey)) {
        return this.apiCache.get(cacheKey);
      }

      // Get verses related to the theme
      const searchTerms = this.getThemeSearchTerms(theme);
      const searchResults = await quranAPI.searchVerses(searchTerms, 'en');
      
      const verses: QuranVerse[] = [];
      
      // Convert up to 5 verses for the collection
      for (const apiVerse of searchResults.slice(0, 5)) {
        const quranVerse = await this.convertAPIVerseToQuranVerse({
          verse: apiVerse,
          surah: { number: Math.floor(apiVerse.number / 1000) + 1 } as any,
          theme,
          context: `Thematic guidance: ${theme}`
        });

        if (quranVerse) {
          verses.push(quranVerse);
        }
      }

      // Curated fallback if no thematic search results (e.g., prayer keywords vary)
      if (verses.length === 0) {
        const curated = await this.getCuratedThemeVerses(theme);
        verses.push(...curated);
      }

      const collection: ThematicCollection = {
        theme: this.capitalizeTheme(theme),
        description: this.getThemeDescription(theme),
        verses,
        practicalGuidance: PRACTICAL_GUIDANCE[theme] || [],
        recommendedActions: this.getRecommendedActions(theme)
      };

      // Cache the result
      this.apiCache.set(cacheKey, collection);
      this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

      return collection;
    } catch (error) {
      console.error('Error getting thematic collection:', error);
      return null;
    }
  }

  /**
   * Convert API verse response to QuranVerse format
   */
  private async convertAPIVerseToQuranVerse(apiResponse: RandomVerseResponse): Promise<QuranVerse | null> {
    try {
      const { verse, surah, theme, context } = apiResponse;
      
      return {
        id: verse.number,
        surah: surah.englishName || `Surah ${surah.number}`,
        surah_number: surah.number,
        ayah: verse.numberInSurah,
        text_ar: verse.text,
        text_en: verse.translation || '',
        theme: theme ? [theme] : ['guidance'],
        reflection: this.generateReflection(verse.translation || '', theme || 'guidance'),
        practical_guidance: PRACTICAL_GUIDANCE[theme || 'guidance']?.slice(0, 3),
        context: context || `From ${surah.englishName}`,
        life_application: this.generateLifeApplication(verse.translation || '', theme || 'guidance'),
        audio: verse.audio || apiResponse.audio // Include audio from API
      };
    } catch (error) {
      console.error('Error converting API verse:', error);
      return null;
    }
  }

  /**
   * Generate practical reflection for a verse
   */
  private generateReflection(translation: string, theme: string): string {
    const reflectionTemplates: Record<string, string[]> = {
      patience: [
        "This verse reminds us that patience is not just waiting, but maintaining faith during challenges.",
        "True patience involves trusting Allah's timing while continuing to make effort.",
        "Every test is an opportunity to grow closer to Allah and strengthen our character."
      ],
      prayer: [
        "Prayer is our direct connection to Allah, offering guidance and peace in all situations.",
        "This verse emphasizes that consistent worship transforms our hearts and daily actions.",
        "Through prayer, we align our will with Allah's guidance and find purpose in our days."
      ],
      change: [
        "Personal transformation begins with sincere intention and trust in Allah's support.",
        "This verse teaches us that positive change requires both effort and reliance on Allah.",
        "Growth happens gradually - each small step taken with faith leads to lasting transformation."
      ],
      guidance: [
        "Divine guidance illuminates our path when we sincerely seek Allah's direction.",
        "This verse reminds us that true wisdom comes from following Islamic teachings.",
        "Guidance is available to all who approach Allah with humility and openness to learn."
      ],
      fitness: [
        "Islam teaches us to care for our bodies as a trust (amanah) from Allah. This verse reminds us that striving and effort are valued in Islam - whether spiritual or physical.",
        "Physical strength enables us to better serve Allah, our families, and our communities. This verse encourages perseverance in all beneficial efforts.",
        "The Prophet ﷺ said 'The strong believer is better than the weak believer.' This verse guides us to pursue strength with the right intention - to serve Allah better."
      ],
      strength: [
        "True strength comes from both physical capability and spiritual fortitude. This verse reminds us to seek strength through faith and effort.",
        "Building strength - whether of body, character, or faith - requires consistent effort and reliance on Allah's help.",
        "Physical strength is a blessing that enables us to fulfill our duties better. This verse encourages us to strive with gratitude."
      ],
      health: [
        "Our health is a precious gift from Allah, and maintaining it is part of our worship. This verse reminds us of Allah's care and mercy.",
        "Taking care of our health allows us to worship Allah better and serve others. This verse encourages mindful living.",
        "Islam emphasizes preventive care and balance. This verse guides us to approach health with gratitude and trust in Allah."
      ]
    };

    const templates = reflectionTemplates[theme] || reflectionTemplates.guidance;
    return templates[Math.floor(Math.random() * templates.length)];
  }

  /**
   * Generate life application advice
   */
  private generateLifeApplication(translation: string, theme: string): string {
    const applications: Record<string, string[]> = {
      patience: [
        "When facing delays in your goals, use this time for extra dhikr and self-improvement.",
        "Practice gratitude daily to maintain perspective during challenging periods.",
        "Set small, achievable milestones to maintain motivation while exercising patience."
      ],
      prayer: [
        "Reflect on this verse during your daily prayers for deeper spiritual connection."
      ],
      change: [
        "Apply this verse's wisdom by taking one concrete step toward your goal today.",
        "Create a accountability system with someone who shares your Islamic values.",
        "Reflect on this verse weekly to stay motivated on your transformation journey."
      ]
    };

    const options = applications[theme] || applications.prayer;
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Fallback verse when API is unavailable
   */
  private getFallbackVerse(): QuranVerse {
    return {
      id: 2255,
      surah: "Al-Baqarah",
      surah_number: 2,
      ayah: 255,
      text_ar: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
      text_en: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
      theme: ["faith", "strength"],
      reflection: "This powerful verse reminds us that Allah is always present and in control, providing strength and comfort in all situations.",
      practical_guidance: [
        "Recite Ayat al-Kursi for protection and peace",
        "Remember Allah's constant presence during challenges",
        "Trust in Allah's perfect timing and wisdom"
      ],
      context: "Ayat al-Kursi - The Throne Verse",
      life_application: "Use this verse as a source of strength and comfort throughout your day, especially during moments of uncertainty or stress.",
      audio: `/api/audio?surah=2&ayah=255&edition=ar.alafasy`
    };
  }

  // Helper methods for theme analysis and guidance generation
  private extractKeywords(text: string): string[] {
    return text.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .map(word => word.replace(/[^\w]/g, ''));
  }

  private determineTheme(keywords: string[]): string {
    // Define keyword synonyms and related terms
    const keywordMapping: Record<string, string[]> = {
      fitness: [
        'fitness', 'gym', 'exercise', 'workout', 'training', 'sport', 'muscle', 'cardio', 'strength', 'physical', 'body',
        'run', 'running', 'jog', 'jogging', 'walk', 'walking', 'swim', 'swimming', 'bike', 'cycling', 'lift', 'lifting',
        'weight', 'weights', 'aerobics', 'yoga', 'pilates', 'dance', 'dancing', 'martial', 'arts', 'boxing', 'kickboxing',
        'crossfit', 'hiit', 'treadmill', 'elliptical', 'stairmaster', 'rowing', 'rowing', 'squat', 'deadlift', 'bench',
        'pushup', 'pullup', 'plank', 'burpee', 'jumping', 'jacks', 'mountain', 'climber', 'lunge', 'crunch', 'situp'
      ],
      health: [
        'health', 'wellness', 'medical', 'care', 'healing', 'recovery', 'nutrition', 'diet', 'food', 'eating', 'meal',
        'vitamin', 'supplement', 'medicine', 'doctor', 'hospital', 'clinic', 'therapy', 'treatment', 'surgery',
        'mental', 'psychology', 'therapy', 'counseling', 'meditation', 'mindfulness', 'sleep', 'rest', 'relaxation',
        'stress', 'management', 'hygiene', 'clean', 'sanitize', 'vaccine', 'immunization', 'prevention', 'screening'
      ],
      strength: [
        'strong', 'strength', 'power', 'powerful', 'force', 'endurance', 'mighty', 'robust', 'sturdy', 'tough', 'resilient',
        'unyielding', 'steadfast', 'firm', 'solid', 'unbreakable', 'indomitable', 'invincible', 'unconquerable',
        'strive', 'striving', 'effort', 'persevere', 'perseverance', 'persist', 'persistent'
      ],
      prayer: [
        'pray', 'prayer', 'salah', 'salat', 'worship', 'dua', 'dhikr', 'mosque', 'qibla', 'adhan', 'azan', 'iqama',
        'rakah', 'rakat', 'sujud', 'ruku', 'qiyam', 'jalsa', 'tashahhud', 'tasleem', 'fatiha', 'ayat', 'verse',
        'recitation', 'tilawah', 'quran', 'koran', 'surah', 'ayah', 'juz', 'hizb', 'masjid', 'musalla', 'mihrab',
        'minbar', 'minaret', 'wudu', 'ablution', 'ghusl', 'tayammum', 'qibla', 'direction', 'kaaba', 'makkah'
      ],
      patience: [
        'patient', 'patience', 'wait', 'waiting', 'endure', 'endurance', 'persevere', 'perseverance', 'difficult',
        'hardship', 'trial', 'test', 'challenge', 'struggle', 'suffer', 'suffering', 'tolerate', 'tolerance',
        'forbear', 'forbearance', 'steadfast', 'steadfastness', 'resilient', 'resilience', 'persistent', 'persistence',
        'determined', 'determination', 'tenacious', 'tenacity', 'unwavering', 'unshakeable', 'unmovable'
      ],
      family: [
        'family', 'parent', 'child', 'children', 'marriage', 'spouse', 'relationship', 'home', 'household',
        'mother', 'father', 'son', 'daughter', 'brother', 'sister', 'grandparent', 'grandfather', 'grandmother',
        'uncle', 'aunt', 'cousin', 'niece', 'nephew', 'husband', 'wife', 'partner', 'spouse', 'inlaw',
        'domestic', 'household', 'home', 'house', 'residence', 'dwelling', 'abode', 'nest', 'hearth'
      ],
      anxiety: [
        'anxious', 'anxiety', 'worry', 'worried', 'stress', 'stressed', 'fear', 'fearful', 'nervous', 'panic',
        'overwhelmed', 'overwhelming', 'afraid', 'scared', 'terrified', 'frightened', 'alarmed', 'distressed',
        'troubled', 'concerned', 'uneasy', 'uncomfortable', 'restless', 'agitated', 'jittery', 'tense',
        'apprehensive', 'dread', 'dreadful', 'horror', 'horrified', 'shocked', 'shocking', 'startled'
      ],
      success: [
        'achieve', 'achievement', 'goal', 'accomplish', 'accomplishment', 'succeed', 'success', 'victory',
        'win', 'winning', 'progress', 'advance', 'advancement', 'improve', 'improvement', 'excel', 'excellence',
        'outperform', 'outstanding', 'exceptional', 'remarkable', 'notable', 'distinguished', 'eminent',
        'prominent', 'prestigious', 'honorable', 'respectable', 'admirable', 'commendable', 'praiseworthy'
      ],
      change: [
        'change', 'changing', 'improve', 'improvement', 'transform', 'transformation', 'better', 'betterment',
        'habit', 'habits', 'different', 'difference', 'new', 'renew', 'renewal', 'modify', 'modification',
        'alter', 'alteration', 'adjust', 'adjustment', 'adapt', 'adaptation', 'evolve', 'evolution',
        'develop', 'development', 'grow', 'growth', 'mature', 'maturity', 'progress', 'progression'
      ]
    };

    const themeScores: Record<string, number> = {};
    
    // Initialize scores
    for (const theme of Object.keys(PRACTICAL_GUIDANCE)) {
      themeScores[theme] = 0;
    }

    // Calculate scores based on keyword matches and synonyms
    for (const keyword of keywords) {
      for (const [theme, synonyms] of Object.entries(keywordMapping)) {
        if (synonyms.includes(keyword)) {
          themeScores[theme] = (themeScores[theme] || 0) + 1;
        }
      }
      
      // Also check direct matches in practical guidance
      for (const [theme, themeKeywords] of Object.entries(PRACTICAL_GUIDANCE)) {
        if (themeKeywords.some(tk => tk.toLowerCase().includes(keyword))) {
          themeScores[theme] = (themeScores[theme] || 0) + 0.5;
        }
      }
    }

    // Find the theme with the highest score
    const topTheme = Object.entries(themeScores)
      .filter(([, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)[0];
    
    console.log('Theme detection:', { keywords, themeScores, selectedTheme: topTheme ? topTheme[0] : 'guidance' });
    
    // If no theme matches, return 'guidance' to trigger fallback search
    return topTheme ? topTheme[0] : 'guidance';
  }

  private async getThematicVersesForGoal(theme: string, goal: string): Promise<GoalMatchResult[]> {
    try {
      const collection = await this.getThematicCollection(theme);
      if (!collection || collection.verses.length === 0) {
        return [];
      }

      return collection.verses.slice(0, 2).map(verse => ({
        verse,
        relevanceScore: this.calculateRelevanceScore(goal, verse),
        practicalSteps: this.generatePracticalSteps(theme, goal),
        duaRecommendation: DUA_RECOMMENDATIONS[theme],
        relatedHabits: this.getRelatedHabits(theme)
      }));
    } catch (error) {
      console.error('Error getting thematic verses:', error);
      return [];
    }
  }

  private calculateRelevanceScore(goal: string, verse: QuranVerse): number {
    const goalWords = this.extractKeywords(goal);
    const verseWords = this.extractKeywords(verse.text_en + ' ' + verse.reflection);
    
    // Calculate exact matches
    const exactMatches = goalWords.filter(word => 
      verseWords.some(vw => vw === word)
    );
    
    // Calculate partial matches
    const partialMatches = goalWords.filter(word => 
      verseWords.some(vw => vw.includes(word) || word.includes(vw))
    );
    
    // Calculate semantic matches (related words)
    const semanticMatches = this.calculateSemanticMatches(goalWords, verseWords);
    
    // Weight the different types of matches
    const exactScore = exactMatches.length * 1.0;
    const partialScore = (partialMatches.length - exactMatches.length) * 0.7;
    const semanticScore = semanticMatches * 0.5;
    
    const totalMatches = exactScore + partialScore + semanticScore;
    const maxPossibleScore = goalWords.length * 1.0;
    
    return Math.min(0.95, totalMatches / Math.max(maxPossibleScore, 1));
  }
  
  private calculateSemanticMatches(goalWords: string[], verseWords: string[]): number {
    // Define semantic relationships
    const semanticMap: Record<string, string[]> = {
      'fitness': ['strength', 'power', 'ability', 'body', 'strive', 'effort'],
      'health': ['healing', 'cure', 'wellness', 'body', 'care', 'blessing'],
      'prayer': ['worship', 'salah', 'remembrance', 'dhikr', 'establish'],
      'family': ['children', 'parents', 'mercy', 'compassion', 'love'],
      'success': ['achievement', 'blessing', 'prosper', 'victory', 'triumph'],
      'patience': ['endure', 'persevere', 'steadfast', 'resilient'],
      'study': ['knowledge', 'wisdom', 'learn', 'understand', 'reflect'],
      'work': ['effort', 'strive', 'provision', 'sustenance', 'blessing']
    };
    
    let semanticMatches = 0;
    
    for (const goalWord of goalWords) {
      const relatedWords = semanticMap[goalWord] || [];
      for (const relatedWord of relatedWords) {
        if (verseWords.some(vw => vw.includes(relatedWord) || relatedWord.includes(vw))) {
          semanticMatches++;
          break; // Count each goal word only once
        }
      }
    }
    
    return semanticMatches;
  }

  private generatePracticalSteps(theme: string, goal: string): string[] {
    const baseSteps = PRACTICAL_GUIDANCE[theme] || PRACTICAL_GUIDANCE.guidance;
    const goalSpecific = [
      `Set a specific timeline for: ${goal}`,
      `Make daily du'a for success in: ${goal}`,
      `Break down "${goal}" into smaller, manageable tasks`
    ];
    
    return [...baseSteps.slice(0, 2), ...goalSpecific];
  }

  private getRelatedHabits(theme: string): string[] {
    const habitMap: Record<string, string[]> = {
      patience: ['Daily dhikr', 'Gratitude journaling', 'Regular prayer'],
      prayer: ['5 daily prayers', 'Morning athkar', 'Evening dhikr'],
      change: ['Goal setting', 'Daily reflection', 'Skill learning'],
      family: ['Family time', 'Teaching children', 'Shared meals'],
      anxiety: ['Stress management', 'Seeking support', 'Mindful breathing'],
      success: ['Planning', 'Charity giving', 'Continuous learning']
    };
    
    return habitMap[theme] || habitMap.prayer;
  }

  private buildSearchQueries(goal: string, keywords: string[], theme: string): string[] {
    const queries: string[] = [];
    
    // 1. Direct goal search (most specific)
    queries.push(goal);
    
    // 2. Key goal words (remove common words)
    const keyWords = keywords.filter(word => 
      !['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'do', 'get', 'make', 'have', 'be', 'is', 'are', 'was', 'were', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall', 'a', 'an'].includes(word)
    );
    
    if (keyWords.length > 0) {
      // 3. Key words combined (different combinations for variety)
      queries.push(keyWords.slice(0, 4).join(' '));
      queries.push(keyWords.slice(0, 3).join(' '));
      queries.push(keyWords.slice(0, 2).join(' '));
      
      // 4. Key words with theme
      queries.push(`${keyWords.slice(0, 3).join(' ')} ${theme}`);
      queries.push(`${keyWords.slice(0, 2).join(' ')} ${theme}`);
      
      // 5. Individual key words for broader matching
      keyWords.slice(0, 3).forEach(word => {
        queries.push(word);
        queries.push(`${word} ${theme}`);
      });
    }
    
    // 6. Theme-specific search terms (multiple variations)
    const themeTerms = this.getThemeSearchTerms(theme);
    if (themeTerms && themeTerms !== 'guidance wisdom') {
      queries.push(themeTerms);
      // Add individual theme terms for better matching
      const individualTerms = themeTerms.split(' ').slice(0, 3);
      queries.push(individualTerms.join(' '));
      individualTerms.forEach(term => queries.push(term));
    }
    
    // 7. Goal-specific theme terms
    const goalSpecificTerms = this.getGoalSpecificTerms(goal, theme);
    if (goalSpecificTerms) {
      queries.push(goalSpecificTerms);
      // Add individual terms from goal-specific terms
      const individualGoalTerms = goalSpecificTerms.split(' ').slice(0, 3);
      queries.push(individualGoalTerms.join(' '));
      individualGoalTerms.forEach(term => queries.push(term));
    }
    
    // 8. Add some variety with different guidance terms
    const guidanceVariations = [
      'guidance wisdom help',
      'guidance success',
      'guidance strength',
      'guidance patience',
      'guidance prayer',
      'guidance family',
      'guidance health',
      'guidance believer',
      'guidance righteous',
      'guidance mercy'
    ];
    
    // Pick a random guidance variation for variety
    const randomGuidance = guidanceVariations[Math.floor(Math.random() * guidanceVariations.length)];
    queries.push(randomGuidance);
    
    // 9. Add category-specific guidance
    if (theme === 'fitness' || theme === 'health') {
      queries.push('body strength health care trust');
      queries.push('strive effort persevere');
    } else if (theme === 'prayer') {
      queries.push('prayer worship establish salah');
      queries.push('remembrance dhikr');
    } else if (theme === 'family') {
      queries.push('family children parents');
      queries.push('mercy compassion love');
    } else if (theme === 'success') {
      queries.push('success achievement blessing');
      queries.push('prosper triumph victory');
    }
    
    // Remove duplicates and empty queries
    const filteredQueries = queries.filter(q => q && q.trim().length > 0);
    return Array.from(new Set(filteredQueries));
  }

  private getGoalSpecificTerms(goal: string, theme: string): string {
    const goalLower = goal.toLowerCase();
    
    // Fitness-related goals - map to Quran concepts about strength, striving, and caring for the body
    if (theme === 'fitness' || theme === 'strength' || goalLower.includes('fitness') || goalLower.includes('exercise') || goalLower.includes('workout') || goalLower.includes('gym') || goalLower.includes('train')) {
      // Use Quran concepts: striving, strength, health, body as trust
      return 'strive effort persevere strong strength';
    }
    
    // Health-related goals - map to Quran terms about well-being and Allah's blessings
    if (theme === 'health' || goalLower.includes('health') || goalLower.includes('wellness') || goalLower.includes('heal')) {
      return 'cure healing bless good mercy';
    }
    
    // Prayer-related goals - already Quran terms
    if (theme === 'prayer' || goalLower.includes('pray') || goalLower.includes('worship') || goalLower.includes('salah')) {
      return 'prayer worship establish salah remember';
    }
    
    // Success-related goals - map to Quran terms about success and achievement
    if (theme === 'success' || goalLower.includes('success') || goalLower.includes('achieve') || goalLower.includes('accomplish')) {
      return 'success prosper triumph victory believer';
    }
    
    // Family-related goals - map to Quran terms
    if (theme === 'family' || goalLower.includes('family') || goalLower.includes('parent') || goalLower.includes('child') || goalLower.includes('spouse')) {
      return 'parents children family righteous mercy';
    }
    
    // Patience-related goals - already Quran terms
    if (theme === 'patience' || goalLower.includes('patience') || goalLower.includes('wait') || goalLower.includes('persever')) {
      return 'patient patience persever endure steadfast';
    }
    
    // Study/learning goals - map to Quran terms about knowledge
    if (goalLower.includes('study') || goalLower.includes('learn') || goalLower.includes('read') || goalLower.includes('knowledge')) {
      return 'knowledge wisdom understand learn reflect';
    }
    
    // Work/career goals - map to Quran terms about effort and provision
    if (goalLower.includes('work') || goalLower.includes('career') || goalLower.includes('job') || goalLower.includes('business')) {
      return 'work strive effort provision sustenance';
    }
    
    // Relationship goals - map to Quran terms about kindness and mercy
    if (goalLower.includes('relationship') || goalLower.includes('friend') || goalLower.includes('love') || goalLower.includes('kindness')) {
      return 'mercy compassion love kindness righteous';
    }
    
    // Change/improvement goals - map to transformation and renewal
    if (goalLower.includes('change') || goalLower.includes('improve') || goalLower.includes('better') || goalLower.includes('transform')) {
      return 'change believe good righteous repent';
    }
    
    return '';
  }

  private getThemeSearchTerms(theme: string): string {
    const searchTerms: Record<string, string> = {
      patience: 'patience perseverance endurance',
      prayer: 'prayer worship remembrance establish prayer salah salat',
      change: 'change transformation growth',
      family: 'family children parents',
      anxiety: 'peace comfort trust',
      success: 'success achievement blessing',
      health: 'body strength health care trust',
      fitness: 'strength power ability body',
      strength: 'strong power force mighty'
    };
    
    return searchTerms[theme] || 'guidance wisdom';
  }

  private getThemeDescription(theme: string): string {
    const descriptions: Record<string, string> = {
      patience: "Building resilience and endurance through Islamic teachings",
      prayer: "Strengthening your connection with Allah through worship",
      change: "Personal transformation guided by Quranic wisdom",
      family: "Nurturing relationships with Islamic values",
      anxiety: "Finding peace and calm through Islamic practices",
      success: "Achieving goals while maintaining Islamic principles",
      health: "Caring for your body as an amanah (trust) from Allah",
      fitness: "Building physical strength to better serve Allah and community",
      strength: "Developing both physical and spiritual strength through Islamic guidance"
    };
    return descriptions[theme] || `Islamic guidance for ${theme}`;
  }

  private getRecommendedActions(theme: string): string[] {
    const actions: Record<string, string[]> = {
      patience: ["Practice daily dhikr", "Read stories of the Prophets", "Make dua during challenges"],
      prayer: ["Maintain 5 daily prayers", "Learn prayer meanings", "Join community prayers"],
      change: ["Set Islamic goals", "Find mentorship", "Track spiritual progress"],
      family: ["Schedule family time", "Teach Islamic values", "Practice forgiveness"],
      anxiety: ["Recite protective verses", "Practice breathing exercises", "Seek community support"],
      success: ["Align goals with values", "Give regular charity", "Seek beneficial knowledge"]
    };
    
    return actions[theme] || actions.prayer;
  }

  // Curated verses for themes when search is weak
  private async getCuratedThemeVerses(theme: string): Promise<QuranVerse[]> {
    try {
      const results: QuranVerse[] = [];
      
      // Define curated verses for different themes with more variety
      const themeVerses: Record<string, Array<[number, number]>> = {
        prayer: [
          [2, 43],   // Establish prayer and give zakah
          [11, 114], // Establish prayer at the two ends of the day
          [29, 45],  // Recite what has been revealed... establish prayer
          [4, 103],  // Indeed, prayer has been decreed upon the believers
          [17, 78],  // Establish prayer at the decline of the sun
          [20, 14],  // Indeed, I am Allah. There is no deity except Me
          [2, 238],  // Maintain with care the prayers
          [31, 17],  // O my son, establish prayer
          [70, 23],  // Who are in their prayer persistent
          [87, 15]   // And mentions the name of his Lord and prays
        ],
        patience: [
          [2, 153],  // Indeed, Allah is with the patient
          [2, 155],  // We will surely test you with something of fear and hunger
          [3, 200],  // O you who have believed, persevere and endure
          [8, 46],   // And be patient, indeed Allah is with the patient
          [103, 3],  // Except for those who have believed and done righteous deeds
          [2, 177],  // Righteousness is not that you turn your faces
          [3, 186],  // You will surely be tested in your possessions
          [16, 127], // And be patient, [O Muhammad], and your patience is not but through Allah
          [39, 10],  // Indeed, the patient will be given their reward
          [47, 31]   // And We will surely test you until We make evident
        ],
        success: [
          [2, 201],  // Our Lord, grant us in this world [that which is] good
          [3, 200],  // O you who have believed, persevere and endure
          [65, 3],   // And whoever relies upon Allah - then He is sufficient for him
          [94, 5],   // For indeed, with hardship [will be] ease
          [13, 11],  // Indeed, Allah will not change the condition of a people
          [2, 286],  // Allah does not burden a soul beyond that it can bear
          [3, 139],  // So do not weaken and do not grieve
          [8, 45],   // And when you are among them and lead them in prayer
          [9, 40],   // If you do not aid him - Allah has already aided him
          [48, 29]   // Muhammad is the Messenger of Allah
        ],
        change: [
          [13, 11],  // Indeed, Allah will not change the condition of a people
          [2, 286],  // Allah does not burden a soul beyond that it can bear
          [65, 3],   // And whoever relies upon Allah - then He is sufficient for him
          [94, 5],   // For indeed, with hardship [will be] ease
          [2, 216],  // But perhaps you hate a thing and it is good for you
          [3, 159],  // So by mercy from Allah, [O Muhammad]
          [4, 29],   // O you who have believed, do not consume one another's wealth
          [7, 96],   // And if only the people of the cities had believed
          [8, 53],   // That is because Allah would not change a favor
          [35, 11]   // And Allah created you from dust
        ],
        family: [
          [4, 1],    // O mankind, fear your Lord, who created you from one soul
          [17, 23],  // And your Lord has decreed that you not worship except Him
          [25, 74],  // And those who say, "Our Lord, grant us from among our spouses
          [30, 21],  // And of His signs is that He created for you from yourselves
          [66, 6],   // O you who have believed, protect yourselves and your families
          [2, 187],  // They are clothing for you and you are clothing for them
          [4, 19],   // O you who have believed, it is not lawful for you
          [4, 36],   // Worship Allah and associate nothing with Him
          [6, 151],  // Say, "Come, I will recite what your Lord has prohibited
          [17, 24]   // And lower to them the wing of humility out of mercy
        ],
        health: [
          [26, 80],  // And when I am ill, it is He who cures me - perfect for health goals
          [17, 82],  // And We send down of the Quran that which is healing
          [7, 31],   // O children of Adam, take your adornment... and eat and drink but be not excessive
          [2, 195],  // And do good; indeed, Allah loves the doers of good
          [16, 69],  // Then eat from all the fruits and follow the ways of your Lord - about nutrition
          [2, 168],  // O mankind, eat from whatever is on earth [that which is] lawful and good
          [5, 88],   // And eat of what Allah has provided for you [that which is] lawful and good
          [2, 286],  // Allah does not burden a soul beyond that it can bear
          [65, 3],   // And whoever relies upon Allah - then He is sufficient for him
          [94, 5]    // For indeed, with hardship [will be] ease
        ],
        fitness: [
          [22, 78],  // And strive for Allah with the striving due to Him - perfect for fitness/effort
          [29, 69],  // And those who strive for Us - We will surely guide them
          [3, 139],  // So do not weaken and do not grieve - encouragement for strength
          [2, 195],  // And do good; indeed, Allah loves the doers of good
          [8, 46],   // And be patient. Indeed, Allah is with the patient - for perseverance in training
          [94, 5],   // For indeed, with hardship [will be] ease - motivation during tough workouts
          [2, 286],  // Allah does not burden a soul beyond that it can bear
          [103, 3],  // Except for those who have believed and done righteous deeds - including caring for health
          [65, 3],   // And whoever relies upon Allah - then He is sufficient for him
          [13, 11]   // Indeed, Allah will not change the condition of a people until they change themselves
        ],
        anxiety: [
          [2, 286],  // Allah does not burden a soul beyond that it can bear
          [13, 28],  // Those who have believed and whose hearts are assured
          [65, 3],   // And whoever relies upon Allah - then He is sufficient for him
          [94, 5],   // For indeed, with hardship [will be] ease
          [113, 1],  // Say, "I seek refuge in the Lord of daybreak"
          [2, 255],  // Allah - there is no deity except Him
          [3, 8],    // Our Lord, let not our hearts deviate
          [7, 200],  // And if an evil suggestion comes to you from Satan
          [16, 98],  // So when you recite the Quran
          [41, 44]   // And if We had made it a non-Arabic Quran
        ]
      };

      // Get verses for the specific theme, or fall back to general guidance
      let refs = themeVerses[theme] || themeVerses.success || [
        [2, 201],   // Our Lord, grant us in this world [that which is] good
        [65, 3],    // And whoever relies upon Allah - then He is sufficient for him
        [94, 5],    // For indeed, with hardship [will be] ease
        [2, 286],   // Allah does not burden a soul beyond that it can bear
        [13, 11]    // Indeed, Allah will not change the condition of a people
      ];

      // Shuffle the verses to get variety
      refs = refs.sort(() => Math.random() - 0.5);

      // Fetch verses (limit to 3 for performance)
      for (const [s, a] of refs.slice(0, 3)) {
        try {
          const [verse, surah] = await Promise.all([
            quranAPI.getVerse(s, a),
            quranAPI.getSurah(s)
          ]);
          const qv = await this.convertAPIVerseToQuranVerse({
            verse,
            surah,
            theme: theme,
            context: `Thematic guidance: ${theme}`
          } as any);
          if (qv) results.push(qv);
        } catch (error) {
          console.log(`Failed to fetch verse ${s}:${a} for theme ${theme}:`, error);
          continue;
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error building curated theme verses:', error);
      return [];
    }
  }

  private capitalizeTheme(theme: string): string {
    return theme.charAt(0).toUpperCase() + theme.slice(1);
  }

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  /**
   * Smart verse recommendation based on user context
   */
  async getSmartRecommendation(userGoals: string[], completedHabits: string[]): Promise<QuranVerse | null> {
    try {
      // Analyze user's current focus areas
      const currentFocus = this.analyzeUserFocus(userGoals, completedHabits);
      
      // Get a random verse that matches their focus
      const randomResponse = await quranAPI.getRandomVerse();
      
      // Enhance the verse with personalized guidance
      const verse = await this.convertAPIVerseToQuranVerse(randomResponse);
      
      if (verse && currentFocus) {
        verse.practical_guidance = this.getPersonalizedGuidance(currentFocus, userGoals);
        verse.life_application = `Based on your current goals (${userGoals.slice(0, 2).join(', ')}), ${verse.life_application}`;
      }
      
      return verse;
    } catch (error) {
      console.error('Error getting smart recommendation:', error);
      return this.getFallbackVerse();
    }
  }

  private analyzeUserFocus(goals: string[], habits: string[]): string {
    // Simple analysis - in a real app, this could be more sophisticated
    const allText = [...goals, ...habits].join(' ').toLowerCase();
    
    for (const [theme, keywords] of Object.entries(PRACTICAL_GUIDANCE)) {
      if (keywords.some(keyword => allText.includes(keyword.toLowerCase()))) {
        return theme;
      }
    }
    
    return 'guidance';
  }

  private getPersonalizedGuidance(focus: string, goals: string[]): string[] {
    const baseGuidance = PRACTICAL_GUIDANCE[focus] || PRACTICAL_GUIDANCE.guidance;
    const personalizedTips = [
      `Apply this wisdom to your goal: "${goals[0] || 'your current focus'}"`,
      "Reflect on this verse during your daily prayer",
      "Share this insight with someone who could benefit from it"
    ];
    
    return [...baseGuidance.slice(0, 2), ...personalizedTips];
  }
}

// Export singleton instance
export const quranEngine = new QuranEngine();
export default quranEngine; 