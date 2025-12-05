/**
 * Advanced Quran Engine for QuranLife
 * Provides intelligent verse matching, practical guidance, and thematic organization
 * Now powered by AlQuran.cloud API for complete Quran access
 * Author: Karim Osman (https://kar.im)
 */

import { quranAPI, type Verse, type RandomVerseResponse, type Surah } from './quran-api';

export interface QuranVerse {
  id: number;
  surah: string;
  surah_number: number;
  ayah: number;
  text_ar: string;
  text_en: string;
  text_transliteration?: string; // Phonetic/transliteration text
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
  ],
  love: [
    "Make dua for a righteous spouse: 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin'",
    "Focus on becoming the best version of yourself first",
    "Seek love through halal means and with pure intentions",
    "Remember that true love includes mercy and compassion (mawaddah wa rahmah)",
    "Trust in Allah's timing for bringing the right person into your life",
    "Develop qualities that make you a good partner: patience, kindness, honesty",
    "Pray Salat al-Istikhara when considering a potential spouse"
  ],
  relationships: [
    "Maintain ties of kinship (silat al-rahim) as emphasized in Islam",
    "Practice active listening and empathy in all relationships",
    "Forgive others as you would want Allah to forgive you",
    "Be the first to greet others with salam",
    "Resolve conflicts before sleeping - don't let anger fester",
    "Show gratitude and appreciation to those around you"
  ],
  marriage: [
    "Choose a spouse based on their deen (religion) first",
    "Make istikhara before making your decision",
    "Understand that marriage is half of your deen",
    "Build your relationship on mutual respect and mercy",
    "Communicate openly and honestly with your spouse",
    "Remember that spouses are garments for each other - providing comfort and protection"
  ],
  career: [
    "Make your work an act of worship by having good intentions",
    "Seek halal income and avoid anything doubtful",
    "Be honest and trustworthy in all business dealings",
    "Remember that rizq (provision) comes from Allah alone",
    "Balance work with worship and family time",
    "Use your skills and income to benefit the ummah"
  ],
  wealth: [
    "Remember that wealth is a test from Allah",
    "Pay your zakat and give regular sadaqah",
    "Avoid extravagance and be moderate in spending",
    "Seek halal income through honest means",
    "Use wealth to help family, community, and those in need",
    "Don't let the pursuit of wealth distract from worship"
  ],
  education: [
    "Seek knowledge from the cradle to the grave",
    "Make dua before studying: 'Rabbi zidni ilma' (My Lord, increase me in knowledge)",
    "Share your knowledge with others - it's ongoing charity",
    "Balance religious and worldly knowledge",
    "Study with the intention of benefiting yourself and others",
    "Remember that the ink of a scholar is holier than the blood of a martyr"
  ],
  gratitude: [
    "Say 'Alhamdulillah' at least 100 times daily",
    "Keep a gratitude journal to record Allah's blessings",
    "Thank people who help you - 'Whoever does not thank people does not thank Allah'",
    "Look at those who have less than you to appreciate what you have",
    "Express gratitude through actions, not just words",
    "Remember that gratitude increases blessings"
  ],
  forgiveness: [
    "Seek Allah's forgiveness through regular istighfar",
    "Forgive others to earn Allah's forgiveness",
    "Don't hold grudges - they harm you more than others",
    "Make tawbah (repentance) sincerely and don't repeat the sin",
    "Remember that Allah's mercy is greater than any sin",
    "Pray for those who have wronged you"
  ],
  trust: [
    "Practice tawakkul - trust in Allah while taking action",
    "Remember that nothing happens except by Allah's will",
    "When making plans, say 'InshaAllah' with true conviction",
    "Accept qadr (divine decree) with patience",
    "Let go of excessive worry - Allah is the best of planners",
    "Rely on Allah but tie your camel - take practical steps too"
  ],
  purpose: [
    "Remember that you were created to worship Allah",
    "Find your unique talents and use them to serve others",
    "Set goals that align with both dunya and akhirah",
    "Reflect on the meaning of your daily actions",
    "Seek guidance through Quran, prayer, and wise counsel",
    "Your purpose includes being a source of good for others"
  ],
  happiness: [
    "True happiness comes from closeness to Allah",
    "Practice contentment (qana'ah) with what you have",
    "Surround yourself with righteous company",
    "Help others - it brings joy to your own heart",
    "Reduce attachment to material things",
    "Remember the akhirah - eternal happiness awaits the believers"
  ],
  discipline: [
    "Use the five daily prayers as anchors for your day",
    "Fast voluntarily to build self-control",
    "Wake up for Fajr consistently - it sets the tone for the day",
    "Make a daily schedule and stick to it",
    "Start with small habits and build up gradually",
    "Remember that consistency is more important than intensity"
  ],
  social: [
    "Visit the sick and attend funerals - fulfill the rights of Muslims",
    "Participate in community activities and volunteer",
    "Be a good neighbor regardless of their faith",
    "Speak kindly or remain silent",
    "Avoid backbiting and gossip",
    "Build genuine connections based on shared values"
  ],
  guidance: [
    "Recite Surah Al-Fatiha with reflection daily",
    "Make dua for guidance: 'Ihdinas siratal mustaqeem'",
    "Seek knowledge from authentic sources",
    "Consult with knowledgeable people before major decisions",
    "Follow the Quran and Sunnah in all matters",
    "Be open to signs and wisdom from Allah"
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
  strength: "Allahumma inni as'aluka min quwwatika wa 'afiyatika (O Allah, I ask You for Your strength and Your well-being)",
  love: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin wa'j'alna lil-muttaqina imama (Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us leaders for the righteous)",
  relationships: "Allahumma allif bayna qulubina wa aslih dhata baynina (O Allah, unite our hearts and reconcile our differences)",
  marriage: "Allahumma inni as'aluka khayrahaa wa khayra ma jabaltaha 'alayhi (O Allah, I ask You for her good and the good upon which You have created her)",
  career: "Allahumma inni as'aluka 'ilman nafi'an wa rizqan tayyiban wa 'amalan mutaqabbalan (O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds)",
  wealth: "Allahumma akfini bi-halalika 'an haramika wa aghnini bi-fadlika 'amman siwak (O Allah, suffice me with what You have made lawful over what You have forbidden, and enrich me with Your bounty over all else)",
  education: "Rabbi zidni 'ilman (My Lord, increase me in knowledge)",
  gratitude: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik (O Allah, help me to remember You, to thank You, and to worship You well)",
  forgiveness: "Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna la-nakunanna minal-khasirin (Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers)",
  trust: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul 'arshil 'azeem (Allah is sufficient for me; there is no god but He. In Him I put my trust, and He is Lord of the Mighty Throne)",
  purpose: "Allahumma arini al-haqqa haqqan wa'rzuqni ittiba'ah, wa arini al-batila batilan wa'rzuqni ijtinabah (O Allah, show me truth as truth and grant me its following, and show me falsehood as falsehood and grant me its avoidance)",
  happiness: "Allahumma inni as'aluka ridaka wal-jannah, wa a'udhu bika min sakhatika wan-nar (O Allah, I ask You for Your pleasure and Paradise, and I seek refuge in You from Your anger and the Fire)",
  discipline: "Allahumma la taj'al ad-dunya akbara hammina wa la mablagha 'ilmina (O Allah, do not make the world our greatest concern nor the extent of our knowledge)",
  social: "Allahumma alhimni rushdi wa a'idhni min sharri nafsi (O Allah, inspire me with guidance and protect me from the evil of my soul)",
  prayer: "Rabbij'alni muqimas-salati wa min dhurriyyati Rabbana wa taqabbal du'a (My Lord, make me an establisher of prayer, and from my descendants. Our Lord, accept my supplication)"
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
   * Uses GPT-4.1 nano for semantic understanding of goals
   */
  async findVersesForGoal(goal: string): Promise<GoalMatchResult[]> {
    try {
      console.log('Finding verses for goal using AI:', goal);
      
      // Call the AI API to get semantically relevant verse references with explanations
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('AI API error:', response.status, errorData);
        throw new Error(`AI API error: ${response.status}`);
      }

      const aiResult = await response.json();
      const verseRefs: Array<{ surah: number; ayah: number; explanation: string }> = aiResult.verses || [];
      console.log('AI recommended verses:', verseRefs);

      if (verseRefs.length === 0) {
        throw new Error('No verses returned from AI');
      }

      // Determine theme from goal keywords for practical guidance
      const keywords = this.extractKeywords(goal);
      const theme = this.determineTheme(keywords);

      // Fetch the actual verse data for each recommendation
      const matches: GoalMatchResult[] = [];
      
      for (const ref of verseRefs.slice(0, 5)) {
        try {
          const [verse, surah] = await Promise.all([
            quranAPI.getVerse(ref.surah, ref.ayah),
            quranAPI.getSurah(ref.surah)
          ]);

          const quranVerse = await this.convertAPIVerseToQuranVerse({
            verse,
            surah,
            theme,
            context: `Guidance for: ${goal}`
          });

          if (quranVerse) {
            // Use AI-generated explanation if available, otherwise fallback to template
            if (ref.explanation && ref.explanation.trim().length > 0) {
              quranVerse.reflection = ref.explanation;
            }
            
            matches.push({
              verse: quranVerse,
              relevanceScore: 0.9,
              practicalSteps: this.generatePracticalSteps(theme, goal),
              duaRecommendation: DUA_RECOMMENDATIONS[theme],
              relatedHabits: this.getRelatedHabits(theme)
            });
          }
        } catch (verseError) {
          console.error(`Error fetching verse ${ref.surah}:${ref.ayah}:`, verseError);
        }
      }

      if (matches.length > 0) {
        console.log('Successfully matched', matches.length, 'verses via AI');
        return matches;
      }

      throw new Error('Failed to fetch any recommended verses');

    } catch (error) {
      console.error('Error finding verses for goal:', error);
      throw error;
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
            text_en: apiVerse.translation || apiVerse.text || '', 
            reflection: '' 
          } as any)
        }))
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(currentCount, currentCount + 3); // Get next 3 most relevant results
      
      console.log('Additional results by relevance:', sortedResults.map(r => ({ 
        verse: r.apiVerse.number, 
        score: r.relevanceScore,
        text: (r.apiVerse.translation || r.apiVerse.text)?.substring(0, 100) + '...'
      })));

      // Convert API results to goal matches
      const matches: GoalMatchResult[] = [];
      
      for (const { apiVerse } of sortedResults) {
        // Fetch full verse data with both Arabic and English text
        // Search results only contain one language, so we need the complete verse
        const surahNum = apiVerse.surahNumber || apiVerse.surah?.number;
        const verseNum = apiVerse.numberInSurah;
        
        if (surahNum && verseNum) {
          try {
            const fullVerse = await quranAPI.getVerse(surahNum, verseNum);
            const surahMetadata = await this.buildSurahMetadata(fullVerse);
            const quranVerse = await this.convertAPIVerseToQuranVerse({
              verse: fullVerse,
              surah: surahMetadata,
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
          } catch (error) {
            console.error('Error fetching full verse data:', error);
          }
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
        const surahMetadata = await this.buildSurahMetadata(apiVerse);
        const quranVerse = await this.convertAPIVerseToQuranVerse({
          verse: apiVerse,
          surah: surahMetadata,
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
      
      // Build audio URL from surah number and ayah if not already provided
      // This ensures audio is available for verses from both direct fetch and search
      const audioUrl = verse.audio || apiResponse.audio || 
        (surah.number && verse.numberInSurah 
          ? `/api/audio?surah=${surah.number}&ayah=${verse.numberInSurah}&edition=ar.alafasy`
          : undefined);
      
      return {
        id: verse.number,
        surah: surah.englishName || `Surah ${surah.number}`,
        surah_number: surah.number,
        ayah: verse.numberInSurah,
        text_ar: verse.text,
        text_en: verse.translation || '',
        text_transliteration: verse.transliteration || undefined,
        theme: theme ? [theme] : ['guidance'],
        reflection: this.generateReflection(verse.translation || '', theme || 'guidance'),
        practical_guidance: PRACTICAL_GUIDANCE[theme || 'guidance']?.slice(0, 3),
        context: context || `From ${surah.englishName}`,
        life_application: this.generateLifeApplication(verse.translation || '', theme || 'guidance'),
        audio: audioUrl
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
        "Islam teaches us to care for our bodies as a trust (amanah) from Allah. This verse reminds us that striving and effort are valued in Islam.",
        "Physical strength enables us to better serve Allah, our families, and our communities. This verse encourages perseverance in all beneficial efforts.",
        "The Prophet ﷺ said 'The strong believer is better than the weak believer.' This verse guides us to pursue strength with the right intention."
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
      ],
      love: [
        "Allah has placed love and mercy between spouses as one of His signs. This verse reminds us that true love is a blessing from Allah.",
        "Seeking love through halal means and with pure intentions brings barakah (blessings) into relationships.",
        "Love in Islam is built on mercy, compassion, and mutual respect. This verse guides us to nurture these qualities within ourselves."
      ],
      marriage: [
        "Marriage completes half of one's deen. This verse reminds us of the sacred bond between spouses.",
        "Spouses are described as garments for each other - providing comfort, protection, and closeness.",
        "A successful marriage is built on mawaddah (love), rahmah (mercy), and mutual respect as guided by this verse."
      ],
      relationships: [
        "Islam emphasizes maintaining good relationships with all people. This verse guides us to treat others with kindness and respect.",
        "True connection with others comes through sincerity, honesty, and compassion. This verse encourages us to embody these qualities.",
        "Building lasting relationships requires patience, understanding, and forgiveness - virtues highlighted in this verse."
      ],
      family: [
        "Family ties are sacred in Islam. This verse reminds us to honor and maintain our relationships with relatives.",
        "Being dutiful to parents is second only to worshipping Allah. This verse emphasizes the importance of family bonds.",
        "A righteous family is built through love, patience, and teaching Islamic values to the next generation."
      ],
      career: [
        "Seeking halal provision is a form of worship. This verse reminds us to pursue our careers with integrity and good intentions.",
        "Success in work comes from Allah, but we must strive and put in the effort. Balance your career with spiritual growth.",
        "Your profession is an opportunity to serve others and contribute to society. Let this verse guide you to excellence in your work."
      ],
      wealth: [
        "Wealth is a test from Allah - both having it and lacking it. This verse guides us to be grateful and generous.",
        "True richness is contentment of the heart. This verse reminds us not to be consumed by the pursuit of material things.",
        "Use your wealth wisely - for your family, for charity, and in ways that please Allah. This is the guidance of this verse."
      ],
      success: [
        "True success is achieving good in this world and the next. This verse reminds us to balance our worldly and spiritual goals.",
        "Success comes from Allah, but it requires effort, planning, and trust in His decree.",
        "The most successful are those who purify their souls and remain steadfast in faith. Let this verse inspire your journey."
      ],
      education: [
        "Seeking knowledge is an obligation in Islam. This verse encourages us to learn and grow continuously.",
        "Knowledge brings us closer to Allah and helps us understand His creation. Pursue learning with this intention.",
        "The first word revealed was 'Read.' This verse reminds us of the high status of knowledge and learning in Islam."
      ],
      anxiety: [
        "Allah does not burden a soul beyond what it can bear. This verse offers comfort and reassurance during difficult times.",
        "True peace comes from remembrance of Allah. When anxiety strikes, turn to Him through prayer and dhikr.",
        "Trust in Allah's plan and know that with every hardship comes ease. This verse is a source of hope and comfort."
      ],
      happiness: [
        "True happiness comes from a heart connected to Allah. This verse reminds us that contentment is found in faith.",
        "A good life is promised to those who believe and do righteous deeds. Let this verse guide you to lasting joy.",
        "Happiness in Islam is not about circumstances but about your relationship with Allah. Nurture that connection."
      ],
      gratitude: [
        "Gratitude increases blessings. This verse reminds us to recognize and appreciate all that Allah has given us.",
        "Saying 'Alhamdulillah' is not just words - it's a state of the heart. This verse encourages deep appreciation.",
        "When we count our blessings, we realize how much Allah has favored us. Let this verse inspire daily gratitude."
      ],
      forgiveness: [
        "Allah's mercy is greater than any sin. This verse offers hope and encouragement to seek His forgiveness.",
        "Forgiveness is both sought from Allah and given to others. This verse guides us to be merciful as we hope for mercy.",
        "Repentance wipes away sins and brings us closer to Allah. Let this verse inspire a fresh start."
      ],
      trust: [
        "Whoever relies upon Allah - He is sufficient for them. This verse is a powerful reminder to place your trust in Allah.",
        "Tawakkul means taking action while trusting the outcome to Allah. This verse guides us to this balanced approach.",
        "Let go of excessive worry and trust in Allah's perfect plan. This verse brings peace to the anxious heart."
      ],
      purpose: [
        "You were created for a noble purpose - to worship Allah and be His representative on earth. This verse gives meaning to your existence.",
        "Life is a test, and every moment is an opportunity to earn Allah's pleasure. Let this verse guide your priorities.",
        "Finding your purpose means aligning your life with what pleases Allah. This verse points the way."
      ],
      discipline: [
        "Consistency in worship and good habits is key to success. This verse encourages steadfastness in your practices.",
        "The five daily prayers create structure and discipline. This verse reminds us of their importance.",
        "Self-discipline is developed through consistent effort and seeking Allah's help. This verse encourages perseverance."
      ],
      social: [
        "We were created to know and help one another. This verse reminds us of our social responsibilities.",
        "Being kind to neighbors, helping the needy, and maintaining ties are emphasized in Islam. This verse guides our social conduct.",
        "Contributing to your community is a form of worship. Let this verse inspire you to be a source of good for others."
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

  private async buildSurahMetadata(apiVerse: Verse): Promise<Surah> {
    if (apiVerse.surahNumber) {
      return {
        number: apiVerse.surahNumber,
        name: apiVerse.surahName || `Surah ${apiVerse.surahNumber}`,
        englishName: apiVerse.surahEnglishName || apiVerse.surahName || `Surah ${apiVerse.surahNumber}`,
        englishNameTranslation: apiVerse.surahEnglishNameTranslation || '',
        revelationType: apiVerse.surahRevelationType || 'Meccan',
        numberOfAyahs: apiVerse.surahAyahCount || 0
      };
    }

    const fallbackNumber = this.estimateSurahNumberFromGlobal(apiVerse.number);
    try {
      return await quranAPI.getSurah(fallbackNumber);
    } catch {
      return {
        number: fallbackNumber,
        name: `Surah ${fallbackNumber}`,
        englishName: `Surah ${fallbackNumber}`,
        englishNameTranslation: '',
        revelationType: 'Meccan',
        numberOfAyahs: 0
      };
    }
  }

  private estimateSurahNumberFromGlobal(globalVerseNumber: number): number {
    if (!globalVerseNumber || globalVerseNumber < 1) return 1;
    return Math.min(114, Math.max(1, Math.floor((globalVerseNumber - 1) / 60) + 1));
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
      text_transliteration: "Allahu la ilaha illa huwal hayyul qayyum",
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
    // Comprehensive keyword-to-theme mapping covering modern vocabulary
    // Maps common words people use to Quranic themes
    const keywordMapping: Record<string, string[]> = {
      // Love & Relationships
      love: [
        'love', 'loving', 'loved', 'lover', 'romance', 'romantic', 'affection', 'affectionate',
        'heart', 'hearts', 'soulmate', 'beloved', 'dating', 'date', 'crush', 'attraction',
        'attracted', 'feelings', 'emotion', 'emotional', 'passion', 'passionate', 'intimacy',
        'intimate', 'connection', 'chemistry', 'companionship', 'companion', 'loneliness', 'lonely',
        'single', 'finding', 'find', 'meet', 'meeting', 'someone', 'special', 'sweetheart'
      ],
      marriage: [
        'marriage', 'marry', 'married', 'wedding', 'wed', 'nikah', 'engagement', 'engaged',
        'fiancé', 'fiancee', 'proposal', 'propose', 'spouse', 'husband', 'wife', 'partner',
        'nikkah', 'walima', 'mahr', 'dowry', 'matchmaking', 'arranged', 'compatibility'
      ],
      relationships: [
        'relationship', 'relationships', 'friend', 'friends', 'friendship', 'friendships',
        'social', 'socialize', 'socializing', 'connect', 'connecting', 'bond', 'bonding',
        'trust', 'trusting', 'communicate', 'communication', 'understanding', 'respect',
        'conflict', 'argument', 'reconcile', 'reconciliation', 'forgive', 'apologize'
      ],
      family: [
        'family', 'families', 'parent', 'parents', 'parenting', 'child', 'children', 'kids',
        'mother', 'mom', 'mum', 'father', 'dad', 'son', 'daughter', 'brother', 'sister',
        'sibling', 'siblings', 'grandparent', 'grandfather', 'grandmother', 'grandma', 'grandpa',
        'uncle', 'aunt', 'cousin', 'niece', 'nephew', 'inlaw', 'inlaws', 'stepparent',
        'home', 'household', 'domestic', 'relatives', 'kinship', 'upbringing', 'raising'
      ],
      
      // Career & Finance
      career: [
        'career', 'job', 'jobs', 'work', 'working', 'workplace', 'office', 'profession',
        'professional', 'employment', 'employed', 'employee', 'employer', 'boss', 'manager',
        'promotion', 'promoted', 'raise', 'salary', 'income', 'interview', 'hire', 'hiring',
        'fired', 'layoff', 'resign', 'resignation', 'retire', 'retirement', 'business',
        'entrepreneur', 'startup', 'company', 'corporate', 'industry', 'occupation'
      ],
      wealth: [
        'money', 'wealth', 'wealthy', 'rich', 'riches', 'financial', 'finance', 'finances',
        'savings', 'save', 'saving', 'invest', 'investment', 'investing', 'debt', 'loan',
        'mortgage', 'credit', 'budget', 'budgeting', 'expense', 'expenses', 'income',
        'profit', 'profitable', 'earning', 'earnings', 'poverty', 'poor', 'broke',
        'afford', 'affordable', 'expensive', 'cheap', 'frugal', 'spending', 'spend'
      ],
      success: [
        'success', 'successful', 'succeed', 'achievement', 'achieve', 'achieving', 'accomplish',
        'accomplishment', 'goal', 'goals', 'ambition', 'ambitious', 'aspiration', 'aspire',
        'dream', 'dreams', 'vision', 'milestone', 'progress', 'progressing', 'advance',
        'advancement', 'excel', 'excellence', 'outstanding', 'exceptional', 'victory',
        'win', 'winning', 'winner', 'champion', 'top', 'best', 'first', 'leader'
      ],
      
      // Health & Fitness
      fitness: [
        'fitness', 'fit', 'gym', 'exercise', 'exercising', 'workout', 'workouts', 'training',
        'train', 'sport', 'sports', 'athletic', 'athlete', 'muscle', 'muscles', 'cardio',
        'running', 'run', 'jogging', 'jog', 'walking', 'walk', 'swimming', 'swim', 'cycling',
        'bike', 'biking', 'lifting', 'weights', 'weightlifting', 'yoga', 'pilates', 'crossfit',
        'marathon', 'triathlon', 'abs', 'biceps', 'squats', 'pushups', 'pullups', 'plank',
        'treadmill', 'elliptical', 'hiking', 'climbing', 'active', 'activity', 'physical'
      ],
      health: [
        'health', 'healthy', 'wellness', 'wellbeing', 'medical', 'medicine', 'doctor',
        'hospital', 'clinic', 'disease', 'illness', 'sick', 'sickness', 'healing', 'heal',
        'recovery', 'recover', 'treatment', 'therapy', 'nutrition', 'diet', 'dieting',
        'eating', 'food', 'weight', 'obesity', 'overweight', 'underweight', 'bmi',
        'calories', 'vitamins', 'supplements', 'sleep', 'sleeping', 'insomnia', 'rest',
        'tired', 'fatigue', 'energy', 'immune', 'immunity', 'prevention', 'checkup'
      ],
      strength: [
        'strength', 'strong', 'stronger', 'strongest', 'power', 'powerful', 'force',
        'endurance', 'stamina', 'resilience', 'resilient', 'tough', 'toughness', 'grit',
        'determination', 'determined', 'willpower', 'perseverance', 'persevere', 'persist',
        'persistence', 'tenacity', 'tenacious', 'steadfast', 'unwavering', 'unbreakable'
      ],
      
      // Mental & Emotional
      anxiety: [
        'anxiety', 'anxious', 'worry', 'worried', 'worrying', 'stress', 'stressed', 'stressful',
        'panic', 'panicking', 'fear', 'fearful', 'scared', 'afraid', 'nervous', 'nerves',
        'overwhelmed', 'overwhelming', 'pressure', 'tension', 'tense', 'restless', 'uneasy',
        'apprehensive', 'dread', 'phobia', 'ocd', 'ptsd', 'trauma', 'traumatic'
      ],
      happiness: [
        'happy', 'happiness', 'joy', 'joyful', 'content', 'contentment', 'satisfied',
        'satisfaction', 'peace', 'peaceful', 'calm', 'tranquil', 'serenity', 'serene',
        'pleasure', 'delight', 'delighted', 'cheerful', 'optimistic', 'positive', 'positivity',
        'wellbeing', 'fulfillment', 'fulfilled', 'blessed', 'grateful', 'gratitude'
      ],
      
      // Personal Development
      education: [
        'education', 'learn', 'learning', 'study', 'studying', 'student', 'school', 'college',
        'university', 'degree', 'diploma', 'course', 'class', 'classes', 'teacher', 'professor',
        'tutor', 'tutoring', 'exam', 'exams', 'test', 'tests', 'grade', 'grades', 'gpa',
        'knowledge', 'skill', 'skills', 'training', 'reading', 'read', 'books', 'book',
        'homework', 'assignment', 'thesis', 'research', 'academic', 'scholarship', 'graduate'
      ],
      change: [
        'change', 'changing', 'transform', 'transformation', 'improve', 'improving', 'improvement',
        'better', 'betterment', 'habit', 'habits', 'routine', 'routines', 'lifestyle',
        'mindset', 'attitude', 'behavior', 'behaviour', 'reform', 'renew', 'renewal',
        'restart', 'fresh', 'start', 'beginning', 'new', 'different', 'evolve', 'growth'
      ],
      discipline: [
        'discipline', 'disciplined', 'self-control', 'selfcontrol', 'willpower', 'consistency',
        'consistent', 'routine', 'schedule', 'organized', 'organization', 'productive',
        'productivity', 'procrastination', 'procrastinate', 'lazy', 'laziness', 'motivation',
        'motivated', 'focus', 'focused', 'concentration', 'distraction', 'distracted',
        'commitment', 'committed', 'dedication', 'dedicated', 'punctual', 'punctuality'
      ],
      purpose: [
        'purpose', 'purposeful', 'meaning', 'meaningful', 'meaningless', 'direction',
        'lost', 'confused', 'confusion', 'identity', 'who', 'am', 'why', 'exist',
        'existence', 'life', 'living', 'destiny', 'fate', 'calling', 'mission', 'passion',
        'unfulfilled', 'empty', 'emptiness', 'void', 'searching', 'seeking', 'quest'
      ],
      
      // Spiritual
      prayer: [
        'prayer', 'pray', 'praying', 'salah', 'salat', 'salaah', 'namaz', 'worship',
        'dua', 'duas', 'dhikr', 'zikr', 'remembrance', 'mosque', 'masjid', 'fajr',
        'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud', 'qiyam', 'witr', 'sunnah',
        'fard', 'wudu', 'ablution', 'quran', 'recite', 'recitation', 'tilawah',
        'spiritual', 'spirituality', 'faith', 'iman', 'deen', 'religion', 'religious'
      ],
      forgiveness: [
        'forgiveness', 'forgive', 'forgiving', 'forgave', 'forgiven', 'pardon', 'mercy',
        'merciful', 'repent', 'repentance', 'tawbah', 'taubah', 'sin', 'sins', 'sinful',
        'guilt', 'guilty', 'shame', 'ashamed', 'regret', 'regretful', 'mistake', 'mistakes',
        'wrong', 'wrongdoing', 'redemption', 'atonement', 'apologize', 'apology', 'sorry'
      ],
      gratitude: [
        'gratitude', 'grateful', 'thankful', 'thanks', 'thanksgiving', 'appreciate',
        'appreciation', 'blessed', 'blessing', 'blessings', 'alhamdulillah', 'shukr',
        'count', 'blessings', 'recognize', 'acknowledge', 'value', 'cherish'
      ],
      trust: [
        'trust', 'trusting', 'tawakkul', 'reliance', 'rely', 'relying', 'faith',
        'faithful', 'believe', 'belief', 'hope', 'hoping', 'hopeful', 'hopeless',
        'despair', 'despairing', 'doubt', 'doubting', 'uncertain', 'uncertainty',
        'confidence', 'confident', 'insecure', 'insecurity', 'qadr', 'decree', 'destiny'
      ],
      patience: [
        'patience', 'patient', 'impatient', 'impatience', 'wait', 'waiting', 'endure',
        'endurance', 'persevere', 'perseverance', 'sabr', 'difficulty', 'difficulties',
        'hardship', 'hardships', 'trial', 'trials', 'test', 'tested', 'testing',
        'struggle', 'struggling', 'suffering', 'suffer', 'pain', 'painful', 'tough',
        'hard', 'difficult', 'challenge', 'challenging', 'obstacle', 'obstacles'
      ],
      guidance: [
        'guidance', 'guide', 'guided', 'guiding', 'direction', 'path', 'way', 'road',
        'lost', 'astray', 'confused', 'confusion', 'decision', 'decisions', 'choose',
        'choosing', 'choice', 'choices', 'option', 'options', 'istikhara', 'advice',
        'counsel', 'wisdom', 'wise', 'insight', 'clarity', 'clear', 'uncertain'
      ],
      
      // Social & Community
      social: [
        'social', 'society', 'community', 'ummah', 'people', 'others', 'neighbor',
        'neighbors', 'neighbourhood', 'volunteer', 'volunteering', 'charity', 'sadaqah',
        'zakat', 'donate', 'donation', 'help', 'helping', 'serve', 'service', 'serving',
        'give', 'giving', 'generous', 'generosity', 'kindness', 'kind', 'compassion',
        'compassionate', 'empathy', 'sympathetic', 'support', 'supporting'
      ]
    };

    const themeScores: Record<string, number> = {};
    
    // Initialize scores for all themes
    for (const theme of Object.keys(PRACTICAL_GUIDANCE)) {
      themeScores[theme] = 0;
    }

    // Calculate scores based on keyword matches
    for (const keyword of keywords) {
      const lowerKeyword = keyword.toLowerCase();
      
      for (const [theme, synonyms] of Object.entries(keywordMapping)) {
        // Exact match
        if (synonyms.includes(lowerKeyword)) {
          themeScores[theme] = (themeScores[theme] || 0) + 2;
        }
        // Partial match (keyword is part of a synonym or vice versa)
        else if (synonyms.some(s => s.includes(lowerKeyword) || lowerKeyword.includes(s))) {
          themeScores[theme] = (themeScores[theme] || 0) + 1;
        }
      }
    }

    // Find the theme with the highest score
    const topTheme = Object.entries(themeScores)
      .filter(([, score]) => score > 0)
      .sort(([,a], [,b]) => b - a)[0];
    
    console.log('Theme detection:', { keywords, themeScores: Object.fromEntries(Object.entries(themeScores).filter(([,v]) => v > 0)), selectedTheme: topTheme ? topTheme[0] : 'guidance' });
    
    // If no theme matches, return 'guidance' as default
    return topTheme ? topTheme[0] : 'guidance';
  }

  private async getThematicVersesForGoal(theme: string, goal: string): Promise<GoalMatchResult[]> {
    try {
      const collection = await this.getThematicCollection(theme);
      if (!collection || collection.verses.length === 0) {
        return [];
      }

      return collection.verses.slice(0, 5).map(verse => ({
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
      success: ['Planning', 'Charity giving', 'Continuous learning'],
      love: ['Self-improvement', 'Prayer for guidance', 'Character development'],
      marriage: ['Communication practice', 'Kindness acts', 'Shared worship'],
      relationships: ['Regular check-ins', 'Active listening', 'Forgiveness practice'],
      career: ['Skill development', 'Ethical work habits', 'Work-life balance'],
      wealth: ['Budget tracking', 'Regular charity', 'Halal income review'],
      education: ['Daily reading', 'Knowledge sharing', 'Quran study'],
      gratitude: ['Gratitude journal', 'Daily Alhamdulillah', 'Blessing counting'],
      forgiveness: ['Daily istighfar', 'Letting go practice', 'Mercy to others'],
      trust: ['Tawakkul meditation', 'Worry release', 'Divine decree acceptance'],
      purpose: ['Purpose journaling', 'Service to others', 'Intention setting'],
      happiness: ['Contentment practice', 'Positive relationships', 'Acts of worship'],
      discipline: ['Morning routine', 'Prayer on time', 'Habit tracking'],
      social: ['Community service', 'Neighbor visits', 'Charitable giving'],
      health: ['Regular exercise', 'Healthy eating', 'Adequate sleep'],
      fitness: ['Workout routine', 'Physical activity', 'Body care'],
      strength: ['Strength training', 'Mental resilience', 'Spiritual fortitude'],
      guidance: ['Quran reading', 'Seeking knowledge', 'Istikhara prayer']
    };
    
    return habitMap[theme] || habitMap.guidance;
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
    
    // Love-related goals - map to Quran terms about affection, mercy, and companionship
    if (theme === 'love' || goalLower.includes('love') || goalLower.includes('romance') || goalLower.includes('dating') || goalLower.includes('soulmate')) {
      return 'love mercy affection spouse companion tranquility';
    }
    
    // Marriage-related goals
    if (theme === 'marriage' || goalLower.includes('marriage') || goalLower.includes('marry') || goalLower.includes('wedding') || goalLower.includes('spouse')) {
      return 'spouse wife husband garment tranquility mercy affection';
    }
    
    // Relationship goals - map to Quran terms about kindness and mercy
    if (theme === 'relationships' || goalLower.includes('relationship') || goalLower.includes('friend') || goalLower.includes('friendship')) {
      return 'brothers kindness mercy peace know reconcile';
    }
    
    // Family-related goals
    if (theme === 'family' || goalLower.includes('family') || goalLower.includes('parent') || goalLower.includes('child') || goalLower.includes('kids')) {
      return 'parents children family righteous mercy kind';
    }
    
    // Fitness-related goals
    if (theme === 'fitness' || theme === 'strength' || goalLower.includes('fitness') || goalLower.includes('exercise') || goalLower.includes('workout') || goalLower.includes('gym')) {
      return 'strive effort persevere strong strength power';
    }
    
    // Health-related goals
    if (theme === 'health' || goalLower.includes('health') || goalLower.includes('wellness') || goalLower.includes('heal') || goalLower.includes('sick')) {
      return 'cure healing health good lawful mercy';
    }
    
    // Career-related goals
    if (theme === 'career' || goalLower.includes('career') || goalLower.includes('job') || goalLower.includes('work') || goalLower.includes('business') || goalLower.includes('promotion')) {
      return 'provision bounty strive work seek effort';
    }
    
    // Wealth-related goals
    if (theme === 'wealth' || goalLower.includes('money') || goalLower.includes('wealth') || goalLower.includes('financial') || goalLower.includes('debt') || goalLower.includes('savings')) {
      return 'wealth spend provision charity generous halal';
    }
    
    // Success-related goals
    if (theme === 'success' || goalLower.includes('success') || goalLower.includes('achieve') || goalLower.includes('accomplish') || goalLower.includes('goal')) {
      return 'success prosper triumph righteous believers';
    }
    
    // Education-related goals
    if (theme === 'education' || goalLower.includes('study') || goalLower.includes('learn') || goalLower.includes('read') || goalLower.includes('knowledge') || goalLower.includes('school')) {
      return 'knowledge wisdom learn understand reflect read';
    }
    
    // Anxiety-related goals
    if (theme === 'anxiety' || goalLower.includes('anxiety') || goalLower.includes('stress') || goalLower.includes('worry') || goalLower.includes('fear') || goalLower.includes('overwhelm')) {
      return 'peace hearts assured trust sufficient ease';
    }
    
    // Happiness-related goals
    if (theme === 'happiness' || goalLower.includes('happy') || goalLower.includes('happiness') || goalLower.includes('joy') || goalLower.includes('peace')) {
      return 'good life pleased content peace joy';
    }
    
    // Change/improvement goals
    if (theme === 'change' || goalLower.includes('change') || goalLower.includes('improve') || goalLower.includes('better') || goalLower.includes('habit')) {
      return 'change condition strive righteous good repent';
    }
    
    // Discipline-related goals
    if (theme === 'discipline' || goalLower.includes('discipline') || goalLower.includes('focus') || goalLower.includes('productive') || goalLower.includes('motivation')) {
      return 'prayer constant attentive establish steadfast';
    }
    
    // Purpose-related goals
    if (theme === 'purpose' || goalLower.includes('purpose') || goalLower.includes('meaning') || goalLower.includes('direction') || goalLower.includes('lost')) {
      return 'created purpose worship test guidance path';
    }
    
    // Prayer-related goals
    if (theme === 'prayer' || goalLower.includes('pray') || goalLower.includes('worship') || goalLower.includes('salah')) {
      return 'prayer worship establish remember constant';
    }
    
    // Patience-related goals
    if (theme === 'patience' || goalLower.includes('patience') || goalLower.includes('patient') || goalLower.includes('wait')) {
      return 'patience patient endure steadfast persevere';
    }
    
    // Forgiveness-related goals
    if (theme === 'forgiveness' || goalLower.includes('forgive') || goalLower.includes('forgiveness') || goalLower.includes('guilt') || goalLower.includes('regret')) {
      return 'forgiveness mercy repent pardon sins';
    }
    
    // Gratitude-related goals
    if (theme === 'gratitude' || goalLower.includes('grateful') || goalLower.includes('gratitude') || goalLower.includes('thankful')) {
      return 'grateful thankful increase blessing favor';
    }
    
    // Trust-related goals
    if (theme === 'trust' || goalLower.includes('trust') || goalLower.includes('faith') || goalLower.includes('believe')) {
      return 'trust rely sufficient faith decree';
    }
    
    // Social-related goals
    if (theme === 'social' || goalLower.includes('community') || goalLower.includes('volunteer') || goalLower.includes('charity')) {
      return 'people brothers cooperate kind charity';
    }
    
    return '';
  }

  private getThemeSearchTerms(theme: string): string {
    const searchTerms: Record<string, string> = {
      // Love & Relationships
      love: 'love mercy affection spouse companion',
      marriage: 'spouse wife husband garment tranquility',
      relationships: 'brothers kindness friends mercy peace',
      family: 'parents children family kindness mercy',
      
      // Career & Finance
      career: 'provision bounty work strive seek',
      wealth: 'spend wealth charity provision generous',
      success: 'success believers righteous prosper triumph',
      
      // Health & Fitness
      health: 'healing cure body good lawful',
      fitness: 'strive effort strength persevere able',
      strength: 'strong power force strive support',
      
      // Mental & Emotional
      anxiety: 'peace hearts assured trust sufficient',
      happiness: 'good life righteous pleased content',
      
      // Personal Development
      education: 'knowledge wisdom learn understand reflect',
      change: 'change condition themselves strive growth',
      discipline: 'prayer constant attentive establish maintain',
      purpose: 'created worship test deed purpose',
      
      // Spiritual
      prayer: 'prayer worship remembrance establish salah',
      patience: 'patience perseverance endurance steadfast patient',
      forgiveness: 'forgiveness mercy repent pardon wrong',
      gratitude: 'grateful thankful increase blessing favor',
      trust: 'trust rely sufficient decree faith',
      guidance: 'guidance path straight light wisdom',
      
      // Social
      social: 'people tribes know brothers cooperate'
    };
    
    return searchTerms[theme] || 'guidance wisdom mercy';
  }

  private getThemeDescription(theme: string): string {
    const descriptions: Record<string, string> = {
      // Love & Relationships
      love: "Finding and nurturing love through Islamic principles of mercy and affection",
      marriage: "Building a blessed marriage based on tranquility, love, and mercy",
      relationships: "Cultivating meaningful connections guided by Islamic brotherhood",
      family: "Nurturing family bonds with Islamic values of kindness and mercy",
      
      // Career & Finance
      career: "Pursuing halal provision and professional growth with integrity",
      wealth: "Managing wealth responsibly as a trust from Allah",
      success: "Achieving worldly and spiritual success through Islamic principles",
      
      // Health & Fitness
      health: "Caring for your body as an amanah (trust) from Allah",
      fitness: "Building physical strength to better serve Allah and community",
      strength: "Developing physical and spiritual fortitude through faith",
      
      // Mental & Emotional
      anxiety: "Finding peace and tranquility through remembrance of Allah",
      happiness: "Discovering true contentment through faith and gratitude",
      
      // Personal Development
      education: "Seeking knowledge as a path to Allah and service to humanity",
      change: "Personal transformation guided by Quranic wisdom",
      discipline: "Building consistency through the structure of Islamic practices",
      purpose: "Understanding your creation and role as Allah's servant",
      
      // Spiritual
      prayer: "Strengthening your connection with Allah through worship",
      patience: "Building resilience and endurance through trust in Allah",
      forgiveness: "Embracing Allah's mercy and extending forgiveness to others",
      gratitude: "Recognizing and appreciating Allah's countless blessings",
      trust: "Developing tawakkul - complete reliance upon Allah",
      guidance: "Seeking and following the straight path illuminated by Quran",
      
      // Social
      social: "Contributing to community welfare through Islamic brotherhood"
    };
    return descriptions[theme] || `Islamic guidance for ${theme}`;
  }

  private getRecommendedActions(theme: string): string[] {
    const actions: Record<string, string[]> = {
      // Love & Relationships
      love: ["Make dua for a righteous spouse", "Focus on self-improvement", "Seek guidance through istikhara"],
      marriage: ["Practice kindness daily", "Communicate with respect", "Pray together when possible"],
      relationships: ["Check in on friends regularly", "Practice active listening", "Forgive past hurts"],
      family: ["Schedule family time", "Teach Islamic values", "Practice forgiveness"],
      
      // Career & Finance
      career: ["Set ethical work goals", "Seek beneficial skills", "Balance work and worship"],
      wealth: ["Pay zakat promptly", "Give regular sadaqah", "Avoid doubtful income"],
      success: ["Align goals with values", "Give regular charity", "Seek beneficial knowledge"],
      
      // Health & Fitness
      health: ["Eat halal and tayyib", "Exercise regularly", "Get adequate rest"],
      fitness: ["Set consistent workout times", "Exercise with good intention", "Thank Allah for ability"],
      strength: ["Build physical endurance", "Develop mental resilience", "Strengthen spiritual core"],
      
      // Mental & Emotional
      anxiety: ["Recite protective verses", "Practice breathing with dhikr", "Seek community support"],
      happiness: ["Practice daily gratitude", "Connect with righteous people", "Engage in acts of worship"],
      
      // Personal Development
      education: ["Read Quran with understanding", "Learn something new daily", "Share knowledge with others"],
      change: ["Set Islamic goals", "Find mentorship", "Track spiritual progress"],
      discipline: ["Pray on time consistently", "Wake up for Fajr", "Create daily routines"],
      purpose: ["Reflect on your purpose", "Serve others regularly", "Set meaningful goals"],
      
      // Spiritual
      prayer: ["Maintain 5 daily prayers", "Learn prayer meanings", "Join community prayers"],
      patience: ["Practice daily dhikr", "Read stories of the Prophets", "Make dua during challenges"],
      forgiveness: ["Say istighfar 100x daily", "Forgive someone today", "Make sincere tawbah"],
      gratitude: ["Keep a gratitude journal", "Say Alhamdulillah often", "Thank people around you"],
      trust: ["Practice letting go", "Accept Allah's decree", "Reduce excessive planning"],
      guidance: ["Read Quran daily", "Seek knowledgeable counsel", "Make istikhara for decisions"],
      
      // Social
      social: ["Volunteer in community", "Visit the sick", "Help those in need"]
    };
    
    return actions[theme] || actions.guidance;
  }

  // Curated verses for themes when search is weak
  // These are carefully selected verses that are guaranteed to provide relevant guidance
  private async getCuratedThemeVerses(theme: string): Promise<QuranVerse[]> {
    try {
      const results: QuranVerse[] = [];
      
      // Comprehensive curated verses for all themes
      // Each verse is selected for its relevance to the theme
      const themeVerses: Record<string, Array<[number, number]>> = {
        // Love & Relationships
        love: [
          [30, 21],  // And of His signs is that He created for you from yourselves mates... and He placed between you affection (mawaddah) and mercy (rahmah)
          [25, 74],  // Our Lord, grant us from among our wives and offspring comfort to our eyes
          [3, 31],   // Say, "If you should love Allah, then follow me, [so] Allah will love you"
          [2, 165],  // But those who believe are stronger in love for Allah
          [19, 96],  // Indeed, those who have believed and done righteous deeds - the Most Merciful will appoint for them affection
          [5, 54],   // He will love them and they will love Him
          [9, 24],   // Say, "If your fathers, your sons... are more beloved to you than Allah..."
          [2, 222],  // Indeed, Allah loves those who are constantly repentant and loves those who purify themselves
        ],
        marriage: [
          [30, 21],  // He created for you from yourselves mates that you may find tranquility in them
          [2, 187],  // They are clothing for you and you are clothing for them
          [25, 74],  // Our Lord, grant us from among our wives and offspring comfort to our eyes
          [4, 19],   // Live with them in kindness
          [4, 21],   // And how could you take it while you have gone in unto each other
          [2, 228],  // And women have rights similar to their obligations, according to what is fair
          [7, 189],  // He created you from one soul and made from it its mate that he might dwell in security with her
          [4, 1],    // O mankind, fear your Lord, who created you from one soul and created from it its mate
        ],
        relationships: [
          [49, 13],  // We made you peoples and tribes that you may know one another
          [49, 10],  // The believers are but brothers, so make settlement between your brothers
          [3, 103],  // And hold firmly to the rope of Allah all together and do not become divided
          [41, 34],  // Repel evil by that which is better; and thereupon the one... will become as a devoted friend
          [60, 8],   // Allah does not forbid you from those who do not fight you... to be kind to them
          [4, 86],   // When you are greeted with a greeting, greet with one better than it
          [25, 63],  // The servants of the Most Merciful are those who walk upon the earth easily
          [31, 18],  // And do not turn your cheek [in contempt] toward people
        ],
        family: [
          [17, 23],  // And your Lord has decreed... to parents, good treatment
          [46, 15],  // And We have enjoined upon man to his parents good treatment
          [31, 14],  // And We have enjoined upon man [care] for his parents
          [4, 36],   // Worship Allah... and to parents do good, and to relatives
          [25, 74],  // Our Lord, grant us from among our wives and offspring comfort to our eyes
          [66, 6],   // O you who have believed, protect yourselves and your families from a Fire
          [2, 233],  // Mothers may breastfeed their children two complete years
          [17, 24],  // And lower to them the wing of humility out of mercy
        ],
        
        // Career & Finance
        career: [
          [62, 10],  // When the prayer has been concluded, disperse within the land and seek from Allah's bounty
          [28, 77],  // But seek, through that which Allah has given you, the home of the Hereafter
          [17, 12],  // And We have made the night and day two signs... that you may seek bounty from your Lord
          [73, 20],  // Others traveling throughout the land seeking of Allah's bounty
          [29, 69],  // And those who strive for Us - We will surely guide them to Our ways
          [9, 105],  // And say, "Do [as you will], for Allah will see your deeds"
          [16, 97],  // Whoever does righteousness... We will surely cause him to live a good life
          [67, 15],  // He who made the earth tame for you - so walk among its slopes and eat of His provision
        ],
        wealth: [
          [2, 261],  // The example of those who spend their wealth in the way of Allah is like a seed
          [2, 274],  // Those who spend their wealth by night and by day, secretly and publicly
          [3, 180],  // And let not those who withhold what Allah has given them of His bounty think it is good for them
          [9, 34],   // And those who hoard gold and silver... give them tidings of a painful punishment
          [17, 29],  // And do not make your hand [as] chained to your neck or extend it completely
          [25, 67],  // And those who, when they spend, do so not excessively or sparingly
          [57, 7],   // Believe in Allah and His Messenger and spend out of that in which He has made you successors
          [64, 16],  // So fear Allah as much as you are able and... spend; it is better for yourselves
        ],
        success: [
          [23, 1],   // Certainly will the believers have succeeded
          [3, 200],  // O you who have believed, persevere and endure and remain stationed
          [24, 51],  // The only statement of the believers... is that they say, "We hear and we obey"
          [87, 14],  // He has certainly succeeded who purifies himself
          [91, 9],   // He has succeeded who purifies it
          [59, 9],   // And whoever is protected from the stinginess of his soul - those are the successful
          [64, 16],  // And whoever is protected from the stinginess of his soul - it is those who are successful
          [2, 5],    // Those are upon guidance from their Lord, and it is those who are the successful
        ],
        
        // Health & Fitness
        health: [
          [26, 80],  // And when I am ill, it is He who cures me
          [17, 82],  // And We send down of the Quran that which is healing and mercy for the believers
          [16, 69],  // There emerges from their bellies a drink... in which there is healing for people
          [10, 57],  // O mankind, there has come to you instruction... and healing for what is in the breasts
          [41, 44],  // Say, "It is, for those who believe, a guidance and cure"
          [7, 31],   // Eat and drink, but be not excessive
          [2, 168],  // O mankind, eat from whatever is on earth [that which is] lawful and good
          [5, 88],   // And eat of what Allah has provided for you [that which is] lawful and good
        ],
        fitness: [
          [22, 78],  // And strive for Allah with the striving due to Him
          [29, 69],  // And those who strive for Us - We will surely guide them to Our ways
          [8, 60],   // And prepare against them whatever you are able of power
          [3, 139],  // So do not weaken and do not grieve, and you will be superior
          [47, 31],  // And We will surely test you until We make evident those who strive
          [2, 195],  // And spend in the way of Allah and do not throw [yourselves] with your [own] hands into destruction
          [94, 5],   // For indeed, with hardship [will be] ease
          [8, 46],   // And be patient. Indeed, Allah is with the patient
        ],
        strength: [
          [8, 60],   // And prepare against them whatever you are able of power
          [3, 139],  // So do not weaken and do not grieve
          [22, 78],  // And strive for Allah with the striving due to Him
          [47, 7],   // If you support Allah, He will support you and plant firmly your feet
          [57, 25],  // And We sent down iron, wherein is great military might
          [2, 286],  // Allah does not burden a soul beyond that it can bear
          [8, 46],   // And be patient. Indeed, Allah is with the patient
          [29, 69],  // And those who strive for Us - We will surely guide them
        ],
        
        // Mental & Emotional
        anxiety: [
          [13, 28],  // Those who have believed and whose hearts are assured by the remembrance of Allah
          [2, 286],  // Allah does not burden a soul beyond that it can bear
          [94, 5],   // For indeed, with hardship [will be] ease
          [65, 3],   // And whoever relies upon Allah - then He is sufficient for him
          [3, 139],  // So do not weaken and do not grieve
          [9, 51],   // Say, "Never will we be struck except by what Allah has decreed for us"
          [10, 62],  // Unquestionably, for the allies of Allah there will be no fear
          [39, 53],  // Say, "O My servants who have transgressed... do not despair of the mercy of Allah"
        ],
        happiness: [
          [13, 28],  // Unquestionably, by the remembrance of Allah hearts are assured
          [16, 97],  // Whoever does righteousness... We will surely cause him to live a good life
          [10, 62],  // Unquestionably, for the allies of Allah there will be no fear... nor will they grieve
          [20, 123], // Whoever follows My guidance will neither go astray nor suffer
          [2, 38],   // Whoever follows My guidance - there will be no fear concerning them
          [3, 170],  // They receive good tidings of favor from Allah and bounty
          [89, 27],  // O reassured soul, return to your Lord, well-pleased and pleasing [to Him]
          [9, 72],   // Allah has promised the believing men and believing women gardens
        ],
        
        // Personal Development
        education: [
          [20, 114], // And say, "My Lord, increase me in knowledge"
          [96, 1],   // Read in the name of your Lord who created
          [39, 9],   // Are those who know equal to those who do not know?
          [58, 11],  // Allah will raise those who have believed among you and those who were given knowledge
          [35, 28],  // Only those fear Allah, from among His servants, who have knowledge
          [29, 43],  // And these examples We present to the people, but none will understand them except those of knowledge
          [2, 269],  // He gives wisdom to whom He wills, and whoever has been given wisdom has been given much good
          [3, 18],   // Allah witnesses that there is no deity except Him, and [so do] the angels and those of knowledge
        ],
        change: [
          [13, 11],  // Indeed, Allah will not change the condition of a people until they change what is in themselves
          [8, 53],   // That is because Allah would not change a favor which He had bestowed upon a people
          [53, 39],  // And that there is not for man except that [good] for which he strives
          [99, 7],   // So whoever does an atom's weight of good will see it
          [2, 286],  // Allah does not burden a soul beyond that it can bear
          [94, 5],   // For indeed, with hardship [will be] ease
          [65, 7],   // Allah will bring about, after hardship, ease
          [29, 69],  // And those who strive for Us - We will surely guide them to Our ways
        ],
        discipline: [
          [103, 1],  // By time, indeed mankind is in loss, except for those who have believed...
          [73, 1],   // O you who wraps himself [in clothing], arise [to pray] the night
          [74, 1],   // O you who covers himself [with a garment], arise and warn
          [2, 238],  // Maintain with care the [obligatory] prayers and [in particular] the middle prayer
          [19, 59],  // But there came after them successors who neglected prayer
          [70, 23],  // Those who are constant in their prayer
          [23, 9],   // And they who are to their trusts and their promises attentive
          [29, 45],  // Indeed, prayer prohibits immorality and wrongdoing
        ],
        purpose: [
          [51, 56],  // And I did not create the jinn and mankind except to worship Me
          [67, 2],   // [He] who created death and life to test you [as to] which of you is best in deed
          [23, 115], // Did you think that We created you uselessly?
          [2, 30],   // Indeed, I will make upon the earth a successive authority
          [33, 72],  // Indeed, we offered the Trust to the heavens... but man undertook it
          [95, 4],   // We have certainly created man in the best of stature
          [76, 2],   // Indeed, We created man from a sperm-drop mixture that We may try him
          [90, 4],   // We have certainly created man into hardship
        ],
        
        // Spiritual
        prayer: [
          [2, 45],   // And seek help through patience and prayer
          [29, 45],  // Indeed, prayer prohibits immorality and wrongdoing
          [20, 14],  // Indeed, I am Allah. There is no deity except Me, so worship Me and establish prayer
          [2, 238],  // Maintain with care the [obligatory] prayers
          [4, 103],  // Indeed, prayer has been decreed upon the believers a decree of specified times
          [11, 114], // And establish prayer at the two ends of the day
          [17, 78],  // Establish prayer at the decline of the sun
          [73, 20],  // So recite what is easy from it and establish prayer
        ],
        patience: [
          [2, 153],  // O you who have believed, seek help through patience and prayer
          [2, 155],  // And We will surely test you with something of fear and hunger
          [3, 200],  // O you who have believed, persevere and endure
          [16, 127], // And be patient, and your patience is not but through Allah
          [39, 10],  // Indeed, the patient will be given their reward without account
          [11, 115], // And be patient, for indeed, Allah does not allow to be lost the reward of those who do good
          [46, 35],  // So be patient, as were those of determination among the messengers
          [8, 46],   // And be patient. Indeed, Allah is with the patient
        ],
        forgiveness: [
          [39, 53],  // Say, "O My servants who have transgressed... do not despair of the mercy of Allah"
          [4, 110],  // And whoever does a wrong or wrongs himself but then seeks forgiveness of Allah will find Allah Forgiving
          [3, 135],  // And those who, when they commit an immorality... remember Allah and ask forgiveness
          [11, 90],  // And ask forgiveness of your Lord and then repent to Him
          [42, 25],  // And it is He who accepts repentance from his servants and pardons misdeeds
          [25, 70],  // Except for those who repent, believe and do righteous work
          [66, 8],   // O you who have believed, repent to Allah with sincere repentance
          [24, 22],  // And let them pardon and overlook. Would you not like that Allah should forgive you?
        ],
        gratitude: [
          [14, 7],   // If you are grateful, I will surely increase you [in favor]
          [31, 12],  // And We had certainly given Luqman wisdom [and said], "Be grateful to Allah"
          [2, 152],  // So remember Me; I will remember you. And be grateful to Me and do not deny Me
          [55, 13],  // So which of the favors of your Lord would you deny?
          [16, 78],  // And Allah has extracted you from the wombs of your mothers not knowing a thing
          [27, 40],  // This is from the favor of my Lord to test me whether I will be grateful or ungrateful
          [34, 13],  // Work, O family of David, in gratitude
          [76, 3],   // Indeed, We guided him to the way, be he grateful or be he ungrateful
        ],
        trust: [
          [65, 3],   // And whoever relies upon Allah - then He is sufficient for him
          [3, 159],  // And when you have decided, then rely upon Allah
          [8, 2],    // The believers are only those who... when His verses are recited to them, it increases them in faith; and upon their Lord they rely
          [9, 51],   // Say, "Never will we be struck except by what Allah has decreed for us"
          [14, 12],  // And why should we not rely upon Allah while He has guided us to our ways
          [33, 3],   // And rely upon Allah; and sufficient is Allah as Disposer of affairs
          [39, 38],  // Say, "Sufficient for me is Allah; upon Him [alone] rely those who would rely"
          [12, 67],  // And I entrust my affair to Allah. Indeed, Allah is Seeing of [His] servants
        ],
        guidance: [
          [1, 6],    // Guide us to the straight path
          [2, 2],    // This is the Book about which there is no doubt, a guidance for those conscious of Allah
          [3, 8],    // Our Lord, let not our hearts deviate after You have guided us
          [17, 9],   // Indeed, this Quran guides to that which is most suitable
          [10, 57],  // O mankind, there has come to you instruction from your Lord and healing
          [16, 89],  // And We have sent down to you the Book as clarification for all things
          [6, 82],   // They who believe and do not mix their belief with injustice - those will have security
          [18, 10],  // Our Lord, grant us from Yourself mercy and prepare for us guidance in our affair
        ],
        
        // Social & Community
        social: [
          [49, 13],  // O mankind, indeed We have created you... and made you peoples and tribes that you may know one another
          [49, 10],  // The believers are but brothers, so make settlement between your brothers
          [3, 110],  // You are the best nation produced for mankind
          [5, 2],    // And cooperate in righteousness and piety
          [4, 36],   // And to parents do good, and to relatives, orphans, the needy, the near neighbor, the neighbor farther away
          [107, 1],  // Have you seen the one who denies the Recompense? That is the one who drives away the orphan
          [9, 71],   // The believing men and believing women are allies of one another
          [59, 9],   // And [also for] those who were settled in the Home... before them, love those who emigrated to them
        ]
      };

      // Get verses for the specific theme, or fall back to guidance
      let refs = themeVerses[theme] || themeVerses.guidance || [
        [1, 6],     // Guide us to the straight path
        [2, 286],   // Allah does not burden a soul beyond that it can bear
        [65, 3],    // And whoever relies upon Allah - then He is sufficient for him
        [94, 5],    // For indeed, with hardship [will be] ease
        [13, 11]    // Indeed, Allah will not change the condition of a people
      ];

      // Shuffle the verses to get variety
      refs = refs.sort(() => Math.random() - 0.5);

      // Fetch verses (limit to 5 for navigation)
      for (const [s, a] of refs.slice(0, 5)) {
        try {
          const [verse, surah] = await Promise.all([
            quranAPI.getVerse(s, a),
            quranAPI.getSurah(s)
          ]);
          const qv = await this.convertAPIVerseToQuranVerse({
            verse,
            surah,
            theme: theme,
            context: `Guidance for ${this.capitalizeTheme(theme)}`
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