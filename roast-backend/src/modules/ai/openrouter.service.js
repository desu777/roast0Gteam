const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');

// Import fetch dla kompatybilności z starszymi wersjami Node.js
const fetch = globalThis.fetch || require('node-fetch');

class OpenRouterService {
  constructor() {
    this.apiKeys = config.ai.apiKeys;
    this.currentKeyIndex = 0;
    this.keyUsageCount = 0;
    this.keyResetTime = null;
    
    // Walidacja kluczy
    if (!this.apiKeys.length) {
      throw new Error('No OpenRouter API keys configured');
    }
    
    this.initializeKeyTracking();
    
    if (config.logging.testEnv) {
      logger.info('OpenRouter service initialized', {
        totalKeys: this.apiKeys.length,
        currentKeyIndex: this.currentKeyIndex,
        maxRequestsPerKey: config.ai.maxRequestsPerKey
      });
    }
  }

  /**
   * Inicjalizacja trackingu użycia kluczy
   */
  initializeKeyTracking() {
    // Sprawdź czy mamy zapisane dane o użyciu kluczy (w production można użyć Redis/DB)
    this.keyResetTime = new Date();
    this.keyResetTime.setHours(this.keyResetTime.getHours() + config.ai.keyResetHours);
  }

  /**
   * Pobiera aktualny klucz API
   * @returns {string} Current API key
   */
  getCurrentApiKey() {
    if (this.keyUsageCount >= config.ai.maxRequestsPerKey) {
      this.rotateToNextKey();
    }
    
    return this.apiKeys[this.currentKeyIndex];
  }

  /**
   * Rotacja do następnego klucza gdy obecny się wyczerpał
   */
  rotateToNextKey() {
    const previousIndex = this.currentKeyIndex;
    
    // Przejdź do następnego klucza
    this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
    this.keyUsageCount = 0;
    
    // Jeśli wróciliśmy do pierwszego klucza, sprawdź czy minęło 24h
    if (this.currentKeyIndex === 0 && previousIndex !== 0) {
      const now = new Date();
      if (now < this.keyResetTime) {
        logger.warn('All API keys exhausted before 24h reset time', {
          currentTime: now,
          resetTime: this.keyResetTime,
          totalKeysUsed: this.apiKeys.length
        });
        
        // Czekaj do reset time lub użyj pierwszy klucz (ryzyko rate limit)
        // Dla teraz używamy pierwszy klucz z logowaniem
      } else {
        // Reset czasu dla nowego cyklu
        this.keyResetTime = new Date();
        this.keyResetTime.setHours(this.keyResetTime.getHours() + config.ai.keyResetHours);
      }
    }
    
    if (config.logging.testEnv) {
      logger.info('API key rotated', {
        fromIndex: previousIndex,
        toIndex: this.currentKeyIndex,
        usageCount: this.keyUsageCount,
        totalKeys: this.apiKeys.length
      });
    }
  }

  /**
   * Oznacza klucz jako użyty
   */
  markKeyUsed() {
    this.keyUsageCount++;
    
    if (config.logging.testEnv) {
      logger.debug('API key usage incremented', {
        keyIndex: this.currentKeyIndex,
        usageCount: this.keyUsageCount,
        maxRequests: config.ai.maxRequestsPerKey
      });
    }
  }

  /**
   * Wywołanie API OpenRouter
   * @param {Array} messages - Chat messages
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} API response
   */
  async callOpenRouter(messages, options = {}) {
    const currentKey = this.getCurrentApiKey();
    
    const requestBody = {
      model: config.ai.model,
      messages: messages,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      stream: false,
      ...options
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentKey}`,
        'HTTP-Referer': config.ai.siteUrl,
        'X-Title': config.ai.siteName,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    };

    try {
      if (config.logging.testEnv) {
        logger.debug('OpenRouter API request', {
          model: config.ai.model,
          messagesCount: messages.length,
          keyIndex: this.currentKeyIndex,
          usageCount: this.keyUsageCount
        });
      }

      const response = await fetch(config.ai.apiBaseUrl, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Oznacz klucz jako użyty po sukcesie
      this.markKeyUsed();
      
      if (config.logging.testEnv) {
        logger.debug('OpenRouter API response received', {
          responseId: data.id,
          model: data.model,
          tokensUsed: data.usage?.total_tokens || 'unknown'
        });
      }

      return data;

    } catch (error) {
      logger.error('OpenRouter API call failed', {
        error: error.message,
        keyIndex: this.currentKeyIndex,
        usageCount: this.keyUsageCount,
        model: config.ai.model
      });
      throw error;
    }
  }

  /**
   * Sprawdza status serwisu
   * @returns {Object} Service status
   */
  getServiceStatus() {
    return {
      available: this.apiKeys.length > 0,
      totalKeys: this.apiKeys.length,
      currentKeyIndex: this.currentKeyIndex,
      keyUsageCount: this.keyUsageCount,
      maxRequestsPerKey: config.ai.maxRequestsPerKey,
      keyResetTime: this.keyResetTime,
      model: config.ai.model
    };
  }

  /**
   * Resetuje liczniki (może być wywoływane przez cron job)
   */
  resetDailyCounters() {
    this.currentKeyIndex = 0;
    this.keyUsageCount = 0;
    this.keyResetTime = new Date();
    this.keyResetTime.setHours(this.keyResetTime.getHours() + config.ai.keyResetHours);
    
    logger.info('OpenRouter API key counters reset', {
      resetTime: this.keyResetTime,
      totalKeys: this.apiKeys.length
    });
  }

  /**
   * Cleanup method
   */
  cleanup() {
    // Cleanup if needed
    if (config.logging.testEnv) {
      logger.info('OpenRouter service cleanup completed');
    }
  }
}

module.exports = { OpenRouterService }; 