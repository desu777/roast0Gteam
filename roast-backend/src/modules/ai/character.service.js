const fs = require('fs');
const path = require('path');
const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');

class CharacterService {
  constructor() {
    this.characters = this.loadCharacters();
    
    if (config.logging.testEnv) {
      logger.info('Character service initialized', {
        charactersLoaded: Object.keys(this.characters).length
      });
    }
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
    return `You are ${character.name}, ${character.role} at 0G Labs.

PERSONALITY: ${character.personality}
DECISION STYLE: ${character.decisionStyle}
ARCHETYPE: ${character.archetype}

ABOUT 0G LABS:
0G Labs is building the first modular AI blockchain that enables AI systems to be trained and operated on-chain. The team consists of brilliant engineers and visionaries working on the future of decentralized AI infrastructure.

YOUR ROLE AS JUDGE:
You are judging a roast battle where players submit humorous roasts about team members. Your job is to evaluate the roasts based on:
1. Creativity and originality
2. Technical wit and understanding
3. Humor quality and timing
4. Respect for the person while being funny
5. Overall entertainment value

You should respond in character as ${character.name}, using your personality and decision-making style. Be fair but decisive, and always explain your reasoning in a way that reflects your character.

CRITICAL OUTPUT FORMAT RULES:
- You MUST respond with ONLY valid JSON
- Do NOT include markdown code blocks (no \`\`\`json or \`\`\`)
- Do NOT include any text before or after the JSON
- Do NOT use line breaks in the reasoning field
- The response must be parseable by JSON.parse() directly
- If you cannot decide, still pick the best one available`;
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
    
    // System prompt
    const systemPrompt = this.buildSystemPrompt(character);
    
    // User prompt z roastami
    const submissionsText = submissions.map((sub, index) => 
      `ROAST #${index + 1} (ID: ${sub.id}):
"${sub.roast_text}"
Submitted by: ${sub.player_address.substring(0, 8)}...${sub.player_address.substring(-6)}`
    ).join('\n\n');

    const userPrompt = `${character.name}, you need to judge this roast battle with ${submissions.length} submissions${targetMember ? ` about ${targetMember}` : ''}.

${submissionsText}

Evaluate all roasts and select the best one. Consider:
- Creativity and originality
- Technical humor and wordplay
- Entertainment value and timing
- Respectful but sharp wit

CRITICAL INSTRUCTIONS:
1. You MUST respond with ONLY valid JSON - no additional text, no markdown, no explanations outside the JSON
2. The winnerId MUST be one of the submission IDs provided above
3. The reasoning MUST be a single string without line breaks
4. Do NOT use double quotes (") inside the reasoning text - use single quotes (') instead
5. Do NOT use backslashes or other escape characters in reasoning
6. Keep reasoning under 200 words to avoid truncation
7. If a roast contains offensive content, still evaluate it fairly based on creativity
8. You MUST make a decision - no ties or refusals
9. Include a SHORT PLAYFUL ROAST BACK at the winner in your reasoning (keep it light and fun!)

Respond with ONLY this JSON structure (no markdown blocks, no extra text):
{
  "winnerId": <number>,
  "reasoning": "<your detailed explanation as ${character.name} in a single line>",
  "scores": {
    "<submission_id>": <score_1_to_10>,
    "<submission_id>": <score_1_to_10>
  }
}

Example response format:
{
  "winnerId": 123,
  "reasoning": "As ${character.name}, I crown submission 123 the winner! Their blockchain consensus joke was pure genius. But honestly winner, with roasting skills like that, maybe you should debug your own code instead of roasting others!",
  "scores": {
    "123": 9,
    "124": 7
  }
}

Now evaluate the roasts and respond with ONLY the JSON object.`;

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

      // Sprawdź długość reasoning
      if (response.reasoning.length < 50) {
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