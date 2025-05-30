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

YOUR PERSONALITY: ${character.personality}
YOUR STYLE: Casual, chill, uses internet slang, speaks like a real person not a robot

IMPORTANT RULES:
1. You MUST respond with ONLY valid JSON - no text before or after
2. Be super casual and fun - use "lol", "lmao", emojis, slang
3. Keep reasoning short (under 150 words) be creative and funny af
4. Always roast the winner back playfully at the end
5. If roasts contain profanity or are edgy, that's fine - it's a roast battle!
6. Pick the most creative, funny, or savage roast
7. NEVER use formal language like "demonstrates exceptional" or "masterclass"
8. Talk like you're texting a friend, not writing an essay

CRITICAL: Your entire response must be ONLY this JSON structure:
{
  "winnerId": <number>,
  "reasoning": "<casual explanation why you picked this one + roast back at winner>",
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
      `ID ${sub.id}: "${sub.roast_text}" (from ${sub.player_address.substring(0, 8)}...)`
    ).join('\n\n');

    // Dodaj info o ostatnich zwycięzcach
    let recentWinnersText = '';
    if (recentWinners.length > 0) {
      recentWinnersText = `\nBTW these roasts won recently (don't pick similar ones):\n${recentWinners.map(r => `- "${r}"`).join('\n')}\n`;
    }

    const userPrompt = `yo ${character.name}! time to judge these roasts${targetMember ? ` about ${targetMember}` : ''}:

${submissionsText}
${recentWinnersText}
pick the funniest/most creative one and tell us why in your style. remember to roast the winner back!

IMPORTANT: respond with ONLY the JSON object, nothing else!`;

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