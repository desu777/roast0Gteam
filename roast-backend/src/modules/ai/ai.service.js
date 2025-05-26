const { config } = require('../../config/app.config');
const { logger, gameLogger } = require('../../services/logger.service');
const { OpenRouterService } = require('./openrouter.service');
const { CharacterService } = require('./character.service');
const { ERROR_CODES } = require('../../utils/constants');

class AIService {
  constructor() {
    this.openRouterService = new OpenRouterService();
    this.characterService = new CharacterService();
    this.isInitialized = false;
    
    this.initialize();
  }

  /**
   * Inicjalizacja serwisu AI
   */
  async initialize() {
    try {
      // Sprawdź czy AI jest włączone
      if (!config.ai.enabled) {
        logger.warn('AI service is disabled in configuration');
        return;
      }

      // Sprawdź czy mamy klucze API
      if (!config.ai.apiKeys.length) {
        throw new Error('No OpenRouter API keys configured');
      }

      this.isInitialized = true;

      if (config.logging.testEnv) {
        logger.info('AI Service initialized successfully', {
          openRouterKeys: config.ai.apiKeys.length,
          charactersLoaded: Object.keys(this.characterService.getAllCharacters()).length,
          model: config.ai.model,
          evaluationTimeout: config.ai.evaluationTimeout
        });
      }

    } catch (error) {
      logger.error('Failed to initialize AI Service', { error: error.message });
      this.isInitialized = false;
      throw error;
    }
  }

  /**
   * Główna metoda evaluacji roastów
   * @param {number} roundId - Round ID
   * @param {string} characterId - Character ID for judging
   * @param {Array} submissions - Roast submissions
   * @param {string} targetMember - Optional target member
   * @returns {Promise<Object>} Evaluation result
   */
  async evaluateRoasts(roundId, characterId, submissions, targetMember = null) {
    const startTime = Date.now();
    
    try {
      // Sprawdź czy serwis jest zainicjalizowany
      if (!this.isInitialized) {
        throw new Error('AI Service not initialized');
      }

      // Walidacja inputów
      if (!submissions || submissions.length === 0) {
        throw new Error('No submissions to evaluate');
      }

      if (!this.characterService.characterExists(characterId)) {
        throw new Error(`Character not found: ${characterId}`);
      }

      if (config.logging.testEnv) {
        logger.info('Starting AI evaluation', {
          roundId,
          characterId,
          submissionsCount: submissions.length,
          targetMember
        });
      }

      // Buduj prompt dla evaluacji
      const messages = this.characterService.buildEvaluationPrompt(
        characterId, 
        submissions, 
        targetMember
      );

      // Wywołaj OpenRouter API z timeoutem
      const aiResponse = await this.callAIWithTimeout(messages, {
        maxTokens: 1600,
        temperature: 0.3,
      });

      // Parsuj i waliduj odpowiedź
      const evaluationResult = await this.parseAIResponse(aiResponse, submissions);

      const duration = Date.now() - startTime;

      // Loguj sukces
      gameLogger.aiEvaluation(roundId, characterId, submissions.length, duration);

      if (config.logging.testEnv) {
        logger.info('AI evaluation completed successfully', {
          roundId,
          characterId,
          winnerId: evaluationResult.winnerId,
          duration: `${duration}ms`,
          tokensUsed: aiResponse.usage?.total_tokens || 'unknown'
        });
      }

      return {
        success: true,
        winnerId: evaluationResult.winnerId,
        reasoning: evaluationResult.reasoning,
        scores: evaluationResult.scores || {},
        characterId,
        duration,
        tokensUsed: aiResponse.usage?.total_tokens || 0
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      logger.error('AI evaluation failed', {
        roundId,
        characterId,
        submissionsCount: submissions?.length || 0,
        error: error.message,
        duration: `${duration}ms`
      });

      // Sprawdź czy można użyć fallbacku
      if (config.ai.fallbackEnabled) {
        return this.fallbackEvaluation(roundId, characterId, submissions, error.message);
      }

      throw error;
    }
  }

  /**
   * Wywołanie AI z timeoutem
   * @param {Array} messages - Messages for AI
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} AI response
   */
  async callAIWithTimeout(messages, options = {}) {
    return new Promise(async (resolve, reject) => {
      // Timeout handler
      const timeoutId = setTimeout(() => {
        reject(new Error(`AI evaluation timeout after ${config.ai.evaluationTimeout}ms`));
      }, config.ai.evaluationTimeout);

      try {
        const response = await this.openRouterService.callOpenRouter(messages, options);
        clearTimeout(timeoutId);
        resolve(response);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  /**
   * Parsuje i waliduje odpowiedź AI
   * @param {Object} aiResponse - Raw AI response
   * @param {Array} submissions - Original submissions
   * @returns {Object} Parsed evaluation result
   */
  async parseAIResponse(aiResponse, submissions) {
    try {
      // Pobierz content z odpowiedzi
      const content = aiResponse.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      if (config.logging.testEnv) {
        logger.debug('AI response received', {
          contentLength: content.length,
          contentPreview: content.substring(0, 100) + '...',
          fullContent: content.length < 500 ? content : 'Content too long to log'
        });
      }

      // Parsuj JSON - ulepszona wersja
      let evaluationResult;
      try {
        // Najpierw spróbuj usunąć bloki markdown
        let cleanContent = content;
        
        // Usuń ```json na początku i ``` na końcu
        if (cleanContent.includes('```json')) {
          cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        } else if (cleanContent.includes('```')) {
          cleanContent = cleanContent.replace(/```\s*/g, '');
        }
        
        // Znajdź JSON w treści
        const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          evaluationResult = JSON.parse(jsonMatch[0]);
        } else {
          evaluationResult = JSON.parse(cleanContent);
        }
      } catch (parseError) {
        // Jeśli dalej nie działa, spróbuj różnych metod
        if (config.logging.testEnv) {
          logger.debug('Initial parse failed, trying alternative methods...', {
            error: parseError.message,
            contentPreview: content.substring(0, 200)
          });
        }
        
        // Metoda 2: Usuń wszystko przed pierwszym { i po ostatnim }
        const startIdx = content.indexOf('{');
        const endIdx = content.lastIndexOf('}');
        
        if (startIdx !== -1 && endIdx !== -1) {
          const jsonContent = content.substring(startIdx, endIdx + 1);
          
          // Próbuj naprawić uszkodzony JSON
          try {
            evaluationResult = JSON.parse(jsonContent);
          } catch (e) {
            // Spróbuj naprawić niezamknięty string
            const fixedJson = jsonContent.replace(/:\s*"([^"]*?)$/m, ': "$1"');
            evaluationResult = JSON.parse(fixedJson);
          }
        } else {
          throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
        }
      }

      // Waliduj odpowiedź
      const validation = this.characterService.validateAIResponse(evaluationResult, submissions);
      if (!validation.valid) {
        throw new Error(`AI response validation failed: ${validation.error}`);
      }

      return validation.response;

    } catch (error) {
      logger.error('Failed to parse AI response', {
        error: error.message,
        rawContent: aiResponse.choices?.[0]?.message?.content?.substring(0, 200) + '...'
      });
      throw error;
    }
  }

  /**
   * Fallback evaluation gdy AI zawodzi
   * @param {number} roundId - Round ID
   * @param {string} characterId - Character ID
   * @param {Array} submissions - Submissions
   * @param {string} errorMessage - Original error
   * @returns {Object} Fallback result
   */
  fallbackEvaluation(roundId, characterId, submissions, errorMessage) {
    if (config.logging.testEnv) {
      logger.warn('Using fallback evaluation', {
        roundId,
        characterId,
        submissionsCount: submissions.length,
        originalError: errorMessage
      });
    }

    // Wybierz random zwycięzcę
    const randomIndex = Math.floor(Math.random() * submissions.length);
    const winner = submissions[randomIndex];

    const character = this.characterService.getCharacter(characterId);

    return {
      success: true,
      winnerId: winner.id,
      reasoning: `${character.name}: Due to technical difficulties with AI evaluation, this roast was selected randomly. The wit and creativity shown here caught my attention! (Fallback selection)`,
      scores: {},
      characterId,
      fallback: true,
      originalError: errorMessage,
      duration: 0,
      tokensUsed: 0
    };
  }

  /**
   * Pobiera status serwisu AI
   * @returns {Object} Service status
   */
  getServiceStatus() {
    return {
      initialized: this.isInitialized,
      enabled: config.ai.enabled,
      fallbackEnabled: config.ai.fallbackEnabled,
      model: config.ai.model,
      evaluationTimeout: config.ai.evaluationTimeout,
      openRouter: this.openRouterService.getServiceStatus(),
      characters: Object.keys(this.characterService.getAllCharacters())
    };
  }

  /**
   * Pobiera wszystkie dostępne postacie
   * @returns {Object} All characters
   */
  getAllCharacters() {
    return this.characterService.getAllCharacters();
  }

  /**
   * Pobiera konkretną postać
   * @param {string} characterId - Character ID
   * @returns {Object} Character data
   */
  getCharacter(characterId) {
    return this.characterService.getCharacter(characterId);
  }

  /**
   * Pobiera losową postać do sędziowania
   * @returns {string} Random character ID
   */
  getRandomCharacter() {
    return this.characterService.getRandomCharacter();
  }

  /**
   * Resetuje dzienne liczniki API (może być wywoływane przez cron)
   */
  resetDailyCounters() {
    this.openRouterService.resetDailyCounters();
  }

  /**
   * Cleanup method
   */
  cleanup() {
    if (this.openRouterService) {
      this.openRouterService.cleanup();
    }
    
    if (config.logging.testEnv) {
      logger.info('AI Service cleanup completed');
    }
  }
}

module.exports = { AIService }; 