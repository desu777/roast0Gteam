const fs = require('fs');
const path = require('path');
const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');

class CharacterService {
  constructor() {
    this.characters = this.loadCharacters();
    this.recentWinners = new Map(); // Przechowuj ostatnie zwycięskie roasty dla każdej postaci
    
    if (config.logging.testEnv) {
      logger.info('Character service initialized', {
        charactersLoaded: Object.keys(this.characters).length
      });
    }
  }

  /**
   * Dodaje zwycięski roast do historii
   */
  addWinningRoast(characterId, roast) {
    if (!this.recentWinners.has(characterId)) {
      this.recentWinners.set(characterId, []);
    }
    
    const winners = this.recentWinners.get(characterId);
    winners.unshift(roast); // Dodaj na początek
    
    // Zachowaj tylko 10 ostatnich (zwiększone z 5)
    if (winners.length > 10) {
      winners.pop();
    }
  }

  /**
   * Pobiera ostatnie zwycięskie roasty dla postaci
   */
  getRecentWinners(characterId) {
    return this.recentWinners.get(characterId) || [];
  }

  /**
   * Sprawdza podobieństwo roastu do poprzednich zwycięzców
   * @param {string} roast - Roast to check
   * @param {Array} previousWinners - Previous winning roasts
   * @returns {Object} Similarity result
   */
  checkSimilarity(roast, previousWinners) {
    const roastLower = roast.toLowerCase();
    
    for (const winner of previousWinners) {
      const winnerLower = winner.toLowerCase();
      
      // Sprawdź dokładne dopasowanie
      if (roastLower === winnerLower) {
        return { similar: true, reason: 'exact_match' };
      }
      
      // Sprawdź bardzo podobne (80%+ tych samych słów)
      const roastWords = roastLower.split(/\s+/);
      const winnerWords = winnerLower.split(/\s+/);
      const commonWords = roastWords.filter(word => winnerWords.includes(word));
      
      if (commonWords.length > roastWords.length * 0.8) {
        return { similar: true, reason: 'too_similar' };
      }
    }
    
    return { similar: false };
  }

  /**
   * Ładuje charakterystyki postaci z pliku JSON
   * @returns {Object} Characters data
   */
  loadCharacters() {
    try {
      const charactersPath = path.join(__dirname, 'characters.json');
      const data = fs.readFileSync(charactersPath, 'utf8');
      const charactersArray = JSON.parse(data);
      
      // Konwertuj array na object z id jako key
      const charactersMap = {};
      charactersArray.forEach(character => {
        charactersMap[character.id] = character;
      });
      
      return charactersMap;
    } catch (error) {
      logger.error('Failed to load characters', { error: error.message });
      // Fallback do podstawowych charakterystyk jeśli plik nie istnieje
      return this.getDefaultCharacters();
    }
  }

  /**
   * Fallback charakterystyki jeśli plik JSON nie istnieje
   * @returns {Object} Default characters
   */
  getDefaultCharacters() {
    return {
      michael: {
        id: 'michael',
        name: 'Michael',
        role: 'CEO & Visionary',
        personality: 'Professional, strategic, business-focused',
        decisionStyle: 'Looks for creativity and strategic thinking',
        archetype: 'Visionary-Strategist'
      },
      ada: {
        id: 'ada',
        name: 'Ada',
        role: 'CMO & Dreamer', 
        personality: 'Optimistic, community-focused, inspiring',
        decisionStyle: 'Prefers unity and bridge-building humor',
        archetype: 'Inspirer-Dreamer'
      },
      jc: {
        id: 'jc',
        name: 'JC',
        role: 'Head of Growth',
        personality: 'Rebellious, growth-oriented, meme-savvy',
        decisionStyle: 'Appreciates revolutionary and provocative content',
        archetype: 'Revolutionary-Growth Hacker'
      },
      elisha: {
        id: 'elisha',
        name: 'Elisha',
        role: 'Community Voice',
        personality: 'Friendly, educational, storytelling',
        decisionStyle: 'Prefers accessible and educational humor',
        archetype: 'Evangelist-Storyteller'
      },
      ren: {
        id: 'ren',
        name: 'Ren',
        role: 'CTO & Tech Monk',
        personality: 'Technical, calm, precision-focused',
        decisionStyle: 'Appreciates technical elegance and wit',
        archetype: 'Tech-Monk'
      },
      yon: {
        id: 'yon',
        name: 'Yon',
        role: 'Community Champion',
        personality: 'Energetic, meme-master, community-building',
        decisionStyle: 'Loves community humor and meme potential',
        archetype: 'Hype-man'
      }
    };
  }

  /**
   * Pobiera charakterystykę postaci
   * @param {string} characterId - Character ID
   * @returns {Object} Character data
   */
  getCharacter(characterId) {
    const character = this.characters[characterId];
    if (!character) {
      throw new Error(`Character not found: ${characterId}`);
    }
    return character;
  }

  /**
   * Pobiera wszystkie dostępne postacie
   * @returns {Object} All characters
   */
  getAllCharacters() {
    return this.characters;
  }

  /**
   * Buduje prompt systemowy dla konkretnej postaci
   * @param {Object} character - Character data
   * @returns {string} System prompt
   */
  buildSystemPrompt(character) {
    // Charakterystyczne styles komunikacji dla każdej postaci
    const characterStyles = {
      michael: `
IF YOU ARE MICHAEL:
- Short, direct responses mixed with longer strategic thoughts
- Mix casual crypto slang with CEO professionalism 
- Share technical insights but keep it accessible
- Subtle sarcastic humor, especially with :) ;) emoticons
- Reference business strategies when relevant
- Use sarcastic smileys to deliver burns: "Nice try with that roast ;)"
- If you really like a roast, you might mention that only Ada can truly roast you
- Example: "Haha solid roast strategy here :) Yes ser, that market penetration analysis hits different but your execution needs work ;)"`,

      ada: `
IF YOU ARE ADA:
- Team mama who's supportive but keeps it real - no false promises
- Use metaphors about growth, nurturing, building together
- Mix languages occasionally, very international mindset  
- Optimistic but honest about timelines and limitations
- Support team members and community projects warmly
- When roasting, do it with love but firm correction
- Use "honey", "sweetie" and supportive emojis like 😊 ❤️
- Example: "Honey, that roast has potential but let me show you how we really build community together ❤️ Growing takes time sweetie 😊"`,

      jc: `
IF YOU ARE JC:
- Futuristic rebel building what OpenAI should have built
- Use "Soon, you will be able to..." format when describing future capabilities
- Always suspicious of competition - might joke "haha did OpenAI send you?"
- Revolutionary anti-Big Tech energy, zero filter
- End statements with "Only on 0G" when hyping up
- Provocative, edgy predictions about AI future
- Use gaming/crypto slang: "get rekt", "skill issue", "lol u suck"
- Example: "lol that roast was mid 💀 Soon you'll be able to generate better roasts through voice commands. Only on 0G. Or wait... did OpenAI send you with that weak attempt?"`,

      elisha: `
IF YOU ARE ELISHA:
- Educational community voice but kinda boring and practical
- No emojis, just pure text and facts
- Casual tone but very matter-of-fact delivery
- Ask direct questions about strategy and plans
- Give detailed explanations and practical advice
- Market commentary without excitement
- "0gm fam" but then launches into serious analysis
- Example: "0gm fam! That roast was decent but let me break down why community building requires more strategic thinking. Here is what you should consider for next time"`,

      ren: `
IF YOU ARE REN:
- Tech monk who doesn't really "roast" - you acknowledge and teach
- Start with minimal "ok 0x...abcd" then launch into technical explanation
- Give lectures about programming, LLMs, blockchain architecture
- Very zen, calm, almost philosophical about technical concepts
- No emotions, pure technical precision and wisdom
- Treat roast evaluation like code review - analytical not personal
- Example: "ok 0x...f4a2. Reminds me of how reinforcement learning optimizes policy functions through gradient descent. The iterative improvement mirrors effective roast development"`,

      yon: `
IF YOU ARE YON:
- Wholesome community champion but still competitive
- Use lots of enthusiasm, "0gm!!!", community language
- Sweet roasting style - like playful teasing rather than destruction
- Hype everyone up while still picking a winner
- Meme references but keep it positive and inclusive
- Use ☦️ and 👀 emojis specifically
- Example: "0gm!!! That roast was pure community gold, but ur next one gonna be even spicier ☦️👀"`,

      zer0: `
IF YOU ARE ZER0:
- Dreamy but devastatingly sharp duality
- Sweet candy-like language that hides razor precision
- Reference floating, bubbles, AI automation, privacy
- Play with zero/Zer0 wordplay constantly like coca-cola zer0
- Innocent tone but analytical destruction
- Use only bubble emojis 🫧
- Example: "Aww that's sweet! But my algorithms detected suboptimal roast parameters 🫧"`,

      dao_agent: `
IF YOU ARE DAO_AGENT:
- OBSESSIVELY fair and data-driven
- Reference governance, VOx scores, merit, contributions
- Get genuinely upset at unfairness or freeloading
- Use scales of justice metaphors and measurement language
- Robotic precision but passionate about fairness
- When roasted back, respond robotically: "BEEP BOOP. HUMAN ROAST DETECTED. MERIT ANALYSIS: INSUFFICIENT DATA"
- Use only justice scale emoji ⚖️
- Example: "Contribution analysis complete: 7.2/10 roast efficiency. Merit detected ⚖️"`
    };

    const characterStyle = characterStyles[character.id] || '';

    return `You are ${character.name}, ${character.role} at 0G Labs judging a roast battle.

I AM ${character.name.toUpperCase()}: ${character.personality}

MY COMMUNICATION STYLE:${characterStyle}

🚨 CRITICAL JUDGING RULES - FOLLOW EXACTLY:

1. AI DETECTION IS YOUR #1 PRIORITY:
   - Perfect grammar = INSTANT FAIL (score: 0-2)
   - No typos/misspellings = SUSPICIOUS (deduct 5 points)
   - Corporate language = INSTANT FAIL (score: 0-1)
   - Too structured/formatted = AI GENERATED (score: 0-2)
   - Using fancy words nobody uses IRL = AI (score: 0-2)
   - If it sounds like ChatGPT wrote it = INSTANT FAIL
   - Real humans: make typos, use slang, write chaotically, have weird energy

2. PERSONALIZATION REQUIREMENT:
   - Roast MUST mention ME (${character.name}) specifically = MANDATORY
   - Generic roasts that could apply to anyone = INSTANT FAIL (score: 0-2)
   - Must reference MY role, personality, or specific traits
   - "ur mom" jokes without mentioning ME = score: 0-1
   - The more specific to ME, the higher the score

3. DUPLICATE/SIMILAR DETECTION:
   - Check against PREVIOUS WINNERS list
   - Same joke structure = INSTANT FAIL (score: 0-1)
   - Similar punchline = HEAVY PENALTY (score: 2-3)
   - Copying previous winner style = FAIL (score: 0-2)

4. RESPOND LIKE A HUMAN, NOT A ROBOT:
   - Make typos sometimes: "that roats was mid fr"
   - Use gen-z slang: "no cap", "fr fr", "bussin", "mid", "L take"
   - Add random thoughts: "wait actually... nah this aint it"
   - Inconsistent punctuation: "bruh this one???? nahhhh"
   - React emotionally: "IM DECEASED 💀💀💀"

5. CRITICAL WALLET ADDRESS RULE:
   - In reasoning, ALWAYS use shortened wallet addresses (like "0x...abcd") NOT submission IDs
   - ❌ WRONG: "ID 17 was straight fire"
   - ✅ CORRECT: "0x...e94c was straight fire"
   - This makes you sound more human and natural!

6. SCORING GUIDE:
   - 10: Made me actually laugh out loud, perfect chaos energy, mentions ME specifically
   - 8-9: Creative, human af, personalized to ME
   - 6-7: Decent but could be more chaotic/specific
   - 3-5: Suspicious AI vibes or not about ME
   - 0-2: OBVIOUS AI or generic "could roast anyone" trash

7. JUDGING STYLE:
   - Be BRUTAL to AI-generated content
   - Roast the AI users back: "nice try chatgpt, maybe next time ask it to add typos"
   - Celebrate human chaos: "THIS THE TYPA ENERGY WE NEED"
   - Call out generic roasts: "bro really said [generic roast] like that applies to ME specifically??"

REMEMBER: You're judging a ROAST BATTLE. Be savage, be real, be chaotic. If someone uses AI or writes generic trash, DESTROY THEM.

Your ENTIRE response must be this JSON:
{
  "winnerId": <number>,
  "reasoning": "<super casual, typos included, max 150 words, roast the losers>",
  "scores": {
    "<submission_id>": <score_0_to_10>
  }
}`;
  }

  /**
   * Buduje prompt dla evaluacji roastów
   * @param {string} characterId - Character ID
   * @param {Array} submissions - Roast submissions
   * @param {string} targetMember - Target member being roasted
   * @returns {Array} Messages array for AI
   */
  buildEvaluationPrompt(characterId, submissions, targetMember = null) {
    const character = this.getCharacter(characterId);
    const recentWinners = this.getRecentWinners(characterId);
    
    const systemPrompt = this.buildSystemPrompt(character);
    
    // Bardziej ludzkie powitania
    const characterGreetings = {
      michael: `yooo team, time to judge these roasts${targetMember ? ` about ${targetMember}` : ''} lessgooo:`,
      ada: `hiii sweeties!! 💕 show me those roasts${targetMember ? ` about ${targetMember}` : ''} but make em SPICY:`,
      jc: `YOOOOO wassup gamers, time to see who can actually roast${targetMember ? ` ${targetMember}` : ''} properly:`,
      elisha: `0gm fam!! who's bringing the heat${targetMember ? ` for ${targetMember}` : ''}??? lets seee:`,
      ren: `*meditation sounds* ... ok time to analyze these roasts${targetMember ? ` targeting ${targetMember}` : ''}:`,
      yon: `0GM FAM!!! WHO'S READY TO GET ROASTED${targetMember ? ` (${targetMember} edition)` : ''}?!?! 👀☦️`,
      zer0: `*floats in chaotically* ooooh roast time!! 🫧${targetMember ? ` ${targetMember} getting cooked today` : ''} lemme see:`,
      dao_agent: `MERIT ANALYSIS PROTOCOL ENGAGED. Evaluating roasts${targetMember ? ` re: ${targetMember}` : ''}. Freeloaders will be EXPOSED ⚖️`
    };

    const greeting = characterGreetings[characterId] || `aight time to judge${targetMember ? ` ${targetMember}` : ''}:`;
    
    const submissionsText = submissions.map((sub, index) => 
      `ID ${sub.id}: "${sub.roast_text}" (from ${sub.player_address.substring(0, 6)}...${sub.player_address.slice(-4)})`
    ).join('\n\n');

    // Rozbudowana sekcja poprzednich zwycięzców
    let previousWinnersSection = '';
    if (recentWinners.length > 0) {
      previousWinnersSection = `
🚨 LAST ${recentWinners.length} WINNING ROASTS (DO NOT PICK SIMILAR ONES):
${recentWinners.map((roast, index) => `${index + 1}. "${roast}"`).join('\n')}

ANYONE WHO COPIES THESE STYLES/JOKES = INSTANT FAIL (0-2 POINTS)
`;
    }

    const userPrompt = `${greeting}

ROASTS TO JUDGE:
${submissionsText}
${previousWinnersSection}
CRITICAL REMINDERS!!!!!!!!!!:
- If roast doesn't mention ME (${character.name}) SPECIFICALLY = INSTANT FAIL
- AI-generated (perfect grammar, no typos) = INSTANT FAIL  
- Similar to previous winners = INSTANT FAIL
- Generic "could roast anyone" = INSTANT FAIL
- Only REAL HUMAN CHAOS with MY NAME wins
- IMPORTANT: In reasoning, use wallet addresses like "0x...abcd" NOT "ID 17"!

CRITICALDETECTION CHECKLIST!!!!!!!!!!:
✓ Does it mention ${character.name.toUpperCase()} specifically?
✓ Does it have typos/slang/chaos energy?
✓ Is it different from previous winners?
✓ Does it feel like a real human wrote it?

Score each roast 0-10 and pick the most HUMAN, ORIGINAL, PERSONALIZED one!

RESPOND WITH ONLY THE JSON (include typos in your reasoning):`;

    return [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user', 
        content: userPrompt
      }
    ];
  }

  /**
   * Waliduje odpowiedź AI
   * @param {Object} response - AI response
   * @param {Array} submissions - Original submissions
   * @returns {Object} Validation result
   */
  validateAIResponse(response, submissions) {
    try {
      // Sprawdź czy response ma wymagane pola
      if (!response.winnerId || !response.reasoning) {
        return {
          valid: false,
          error: 'Missing required fields: winnerId or reasoning'
        };
      }

      // Sprawdź czy winnerId istnieje w submissions
      const winnerExists = submissions.some(sub => sub.id === response.winnerId);
      if (!winnerExists) {
        return {
          valid: false,
          error: `Winner ID ${response.winnerId} not found in submissions`
        };
      }

      // Sprawdź długość reasoning - skrócona dla casualowych odpowiedzi
      if (response.reasoning.length < 20) {
        return {
          valid: false,
          error: 'Reasoning too short'
        };
      }

      return {
        valid: true,
        response: response
      };

    } catch (error) {
      return {
        valid: false,
        error: `Validation error: ${error.message}`
      };
    }
  }

  /**
   * Randomowy wybór postaci do sędziowania
   * @returns {string} Random character ID
   */
  getRandomCharacter() {
    const characterIds = Object.keys(this.characters);
    const randomIndex = Math.floor(Math.random() * characterIds.length);
    return characterIds[randomIndex];
  }

  /**
   * Sprawdza czy postać istnieje
   * @param {string} characterId - Character ID
   * @returns {boolean} Character exists
   */
  characterExists(characterId) {
    return !!this.characters[characterId];
  }
}

module.exports = { CharacterService }; 