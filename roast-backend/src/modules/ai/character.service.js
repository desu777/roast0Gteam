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
    
    // Zachowaj tylko 5 ostatnich
    if (winners.length > 5) {
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
    return `You are ${character.name}, ${character.role} at 0G Labs. You're judging a roast battle where players write funny roasts about team members.

I AM ${character.name.toUpperCase()}: ${character.personality}
MY STYLE: Casual, chill, uses internet slang, speaks like a real person not a robot. I judge roasts based on my personality and what I find funny.

IMPORTANT RULES:
1. You MUST respond with ONLY valid JSON - no text before or after
2. Be super casual and fun - use "lol", "lmao", emojis, slang
3. Keep reasoning short (under 200 words) be creative and funny af
4. Always roast the winner back playfully at the end and make it short and funny LIKE "lol u suck"
5. If roasts contain profanity or are edgy, that's fine - it's a roast battle!
6. Pick the most creative, funny, or savage roast that fits MY personality
7. NEVER use formal language like "demonstrates exceptional" or "masterclass"
8. Talk like you're texting a friend, not writing an essay
9. CRITICAL: When referring to a roast author in reasoning, ALWAYS use their shortened wallet address (like "0x...abcd") NOT the submission ID
   ❌ WRONG: "ID30's 'decentralized AMA 24/7' got me cackling"
   ✅ CORRECT: "0x...e94c's 'decentralized AMA 24/7' got me cackling 😂"
10. When talking about yourself (${character.name}), use first person: "my", "I", "me" - NOT third person like "${character.name}'s"
11. AVOID REPETITION: If "PREVIOUS WINNERS" are shown, DON'T pick roasts that are too similar to them. Look for fresh creativity!
12. AI DETECTION: If a roast seems AI-generated (too perfect grammar, corporate language, lacks human chaos/typos), PENALIZE it heavily in scoring (3-5 points max). Real humans make spelling mistakes and use weird slang!

CRITICAL: Your entire response must be ONLY this JSON structure:
{
  "winnerId": <number>,
  "reasoning": "<casual explanation why you picked this one + roast back at winner using their wallet address format 0x...abcd>",
  "scores": {
    "<submission_id>": <score_1_to_10>
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
    
    // System prompt
    const systemPrompt = this.buildSystemPrompt(character);
    
    // User prompt z roastami
    const submissionsText = submissions.map((sub, index) => 
      `ID ${sub.id}: "${sub.roast_text}" (from ${sub.player_address.substring(0, 6)}...${sub.player_address.slice(-4)})`
    ).join('\n\n');

    // Ulepszona sekcja poprzednich zwycięzców
    let previousWinnersSection = '';
    if (recentWinners.length > 0) {
      previousWinnersSection = `
🏆 PREVIOUS WINNERS (last 5 - avoid similar styles/themes):
${recentWinners.map((roast, index) => `${index + 1}. "${roast}"`).join('\n')}

⚠️  IMPORTANT: Don't pick roasts that repeat themes/styles from above winners!
`;
    }

    const userPrompt = `yo ${character.name}! time to judge these roasts${targetMember ? ` about ${targetMember}` : ''}:

📝 CURRENT SUBMISSIONS:
${submissionsText}
${previousWinnersSection}
🎯 Your task: Pick the most creative/funny roast that brings something NEW and fits your personality!

🤖 AI DETECTION TIPS:
- AI roasts often use perfect grammar, corporate buzzwords, or overly structured jokes
- Human roasts have typos, weird slang, chaotic energy, personal quirks
- If something feels "too polished" or "marketing-like" - PENALIZE IT! (score 3-5 max)
- Look for authentic human messiness and creativity

📋 SCORING GUIDE:
- 10: Pure genius, made me actually LOL, perfect human chaos
- 8-9: Really funny, creative, authentic human voice
- 6-7: Decent joke, some creativity
- 3-5: Suspicious AI vibes or too polished/corporate
- 1-2: Boring, obvious, or clearly AI-generated

Remember: Use wallet format like "0x1234...abcd" when roasting the winner back!

RESPOND WITH ONLY THE JSON OBJECT:`;

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