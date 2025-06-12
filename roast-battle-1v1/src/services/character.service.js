const fs = require('fs');
const path = require('path');
const { logger } = require('./logger.service');

class CharacterService {
  constructor() {
    this.ogCharacters = [];
    this.roasterCharacters = [];
    this.charactersLoaded = false;
    this.loadCharacters();
  }

  loadCharacters() {
    try {
      // Load 0G team characters
      const ogPath = path.join(__dirname, '..', '..', 'data', 'characters-0g.json');
      const ogData = fs.readFileSync(ogPath, 'utf8');
      this.ogCharacters = JSON.parse(ogData);
      
      // Load roaster characters
      const roasterPath = path.join(__dirname, '..', '..', 'data', 'roasters.json');
      const roasterData = fs.readFileSync(roasterPath, 'utf8');
      this.roasterCharacters = JSON.parse(roasterData);
      
      this.charactersLoaded = true;
      
      logger.info('Characters loaded successfully', {
        ogCount: this.ogCharacters.length,
        roasterCount: this.roasterCharacters.length
      });
    } catch (error) {
      logger.error('Failed to load characters', { error: error.message });
      throw new Error('CHARACTERS_LOAD_FAILED');
    }
  }

  // Get random OG character
  getRandomOGCharacter() {
    if (!this.charactersLoaded) {
      throw new Error('Characters not loaded');
    }
    
    const randomIndex = Math.floor(Math.random() * this.ogCharacters.length);
    return this.ogCharacters[randomIndex];
  }

  // Get random roaster character
  getRandomRoasterCharacter() {
    if (!this.charactersLoaded) {
      throw new Error('Characters not loaded');
    }
    
    const randomIndex = Math.floor(Math.random() * this.roasterCharacters.length);
    return this.roasterCharacters[randomIndex];
  }

  // Get specific character by ID
  getCharacterById(characterId, type = 'og') {
    const characters = type === 'og' ? this.ogCharacters : this.roasterCharacters;
    return characters.find(char => char.id === characterId);
  }

  // Get all OG characters
  getAllOGCharacters() {
    return [...this.ogCharacters];
  }

  // Get all roaster characters
  getAllRoasterCharacters() {
    return [...this.roasterCharacters];
  }

  // Get character for battle display
  getCharacterForBattle(characterId, type) {
    const character = this.getCharacterById(characterId, type);
    
    if (!character) {
      throw new Error(`Character not found: ${characterId}`);
    }
    
    // Return simplified version for frontend
    return {
      id: character.id,
      name: character.name,
      role: character.role,
      icon: character.icon,
      color: character.color,
      catchphrase: character.catchphrase,
      description: character.description,
      archetype: character.archetype,
      twitterUrl: character.twitterUrl || null
    };
  }

  // Get character personality for AI generation
  getCharacterPersonality(characterId, type) {
    const character = this.getCharacterById(characterId, type);
    
    if (!character) {
      throw new Error(`Character not found: ${characterId}`);
    }
    
    return {
      name: character.name,
      role: character.role,
      personality: character.personality,
      catchphrase: character.catchphrase,
      roastingNotes: character.roastingNotes,
      archetype: character.archetype,
      // Additional context for roasters
      ...(type === 'roaster' && {
        triggers: character.triggers,
        weaknesses: character.weaknesses,
        strengths: character.strengths,
        cryptoPersonality: character.cryptoPersonality
      })
    };
  }

  // Generate random battle matchup
  generateRandomMatchup() {
    const ogCharacter = this.getRandomOGCharacter();
    const roasterCharacter = this.getRandomRoasterCharacter();
    
    return {
      og: this.getCharacterForBattle(ogCharacter.id, 'og'),
      roaster: this.getCharacterForBattle(roasterCharacter.id, 'roaster'),
      // Include full personality data for AI
      personalities: {
        og: this.getCharacterPersonality(ogCharacter.id, 'og'),
        roaster: this.getCharacterPersonality(roasterCharacter.id, 'roaster')
      }
    };
  }

  // Check if characters are compatible opponents
  areCharactersCompatible(ogId, roasterId) {
    // All characters can battle each other
    // This method exists for future expansion (e.g., special matchups)
    return true;
  }

  // Get battle context for AI
  getBattleContext(ogId, roasterId) {
    const ogChar = this.getCharacterPersonality(ogId, 'og');
    const roasterChar = this.getCharacterPersonality(roasterId, 'roaster');
    
    return {
      setting: '0G Roast Arena - Blockchain Battle',
      format: 'Verbal roast battle between crypto personalities',
      rules: [
        'Keep it crypto/tech focused',
        'Reference character backgrounds and roles',
        'Use Web3/blockchain terminology',
        'Be creative but not overly harsh',
        'End with a mic drop moment'
      ],
      og: ogChar,
      roaster: roasterChar,
      audience: 'Crypto community watching live'
    };
  }

  // Get character stats (for future features)
  getCharacterBattleStats(characterId, type) {
    // Placeholder for future battle statistics
    // Could track win rates, popular matchups, etc.
    return {
      characterId,
      type,
      battles: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      popularOpponents: [],
      lastBattle: null
    };
  }
}

// Export singleton instance
module.exports = new CharacterService();