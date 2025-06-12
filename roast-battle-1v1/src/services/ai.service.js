const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage, AIMessage } = require('@langchain/core/messages');
const { z } = require('zod');
const { config } = require('../config/app.config');
const { logger } = require('./logger.service');
const db = require('./database.service');

// Define structured output schemas
const DialogExchangeSchema = z.object({
  speaker: z.enum(['og', 'roaster']),
  message: z.string(),
  tone: z.enum(['aggressive', 'witty', 'sarcastic', 'confident', 'defensive']),
  impact: z.number().min(config.ai.impactMin).max(config.ai.impactMax)
});

const BattleDialogSchema = z.object({
  exchanges: z.array(DialogExchangeSchema),
  peakMoment: z.string(),
  audienceReaction: z.string()
});

const BattleJudgmentSchema = z.object({
  winner: z.enum(['og', 'roaster']),
  reasoning: z.string(),
  ogScore: z.number().min(config.ai.scoreMin).max(config.ai.scoreMax),
  roasterScore: z.number().min(config.ai.scoreMin).max(config.ai.scoreMax),
  decisiveMoment: z.string(),
  crowdFavorite: z.enum(['og', 'roaster'])
});

class AIService {
  constructor() {
    this.model = null;
    this.initialize();
  }

  initialize() {
    try {
      // Initialize LangChain ChatOpenAI
      this.model = new ChatOpenAI({
        openAIApiKey: config.openai.apiKey,
        modelName: config.openai.model,
        temperature: config.openai.temperature,
        maxTokens: config.openai.maxTokens,
        streaming: config.openai.streaming // Enable streaming for real-time dialog
      });

      // Initialize structured output models
      this.dialogModel = this.model.withStructuredOutput(BattleDialogSchema);
      this.judgmentModel = this.model.withStructuredOutput(BattleJudgmentSchema);

      logger.info('AI Service initialized with LangChain');
    } catch (error) {
      logger.error('Failed to initialize AI Service', { error: error.message });
      throw error;
    }
  }

  // Generate roast battle dialog
  async generateBattleDialog(battleContext, battleId) {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.createDialogSystemPrompt();
      const humanPrompt = this.createDialogHumanPrompt(battleContext);

      logger.info('Generating battle dialog', { battleId });

      // Generate structured dialog
      const response = await this.dialogModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt)
      ]);

      const processingTime = Date.now() - startTime;

      // Log AI interaction
      db.logAI(
        battleId,
        'dialog_generation',
        humanPrompt,
        JSON.stringify(response),
        config.openai.model,
        null, // Token count (if needed)
        processingTime,
        true
      );

      logger.battle.dialogGenerated(battleId, response.exchanges.length, null);

      return response;
    } catch (error) {
      logger.error('Failed to generate dialog', { error: error.message, battleId });
      
      db.logAI(
        battleId,
        'dialog_generation',
        'Error occurred',
        '',
        config.openai.model,
        0,
        Date.now() - startTime,
        false,
        error.message
      );

      throw error;
    }
  }

  // Judge the battle winner
  async judgeBattle(dialog, battleContext, battleId) {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.createJudgmentSystemPrompt();
      const humanPrompt = this.createJudgmentHumanPrompt(dialog, battleContext);

      logger.info('Judging battle winner', { battleId });

      // Generate structured judgment
      const judgment = await this.judgmentModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt)
      ]);

      const processingTime = Date.now() - startTime;

      // Log AI interaction
      db.logAI(
        battleId,
        'battle_judgment',
        humanPrompt,
        JSON.stringify(judgment),
        config.openai.model,
        null,
        processingTime,
        true
      );

      logger.battle.dialogGenerated(battleId, dialog.exchanges.length, judgment.winner);

      return judgment;
    } catch (error) {
      logger.error('Failed to judge battle', { error: error.message, battleId });
      
      db.logAI(
        battleId,
        'battle_judgment',
        'Error occurred',
        '',
        config.openai.model,
        0,
        Date.now() - startTime,
        false,
        error.message
      );

      throw error;
    }
  }

  // Generate dialog with streaming support
  async *generateBattleDialogStream(battleContext, battleId) {
    try {
      const systemPrompt = this.createDialogSystemPrompt();
      const humanPrompt = this.createDialogHumanPrompt(battleContext);

      const stream = await this.model.stream([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt)
      ]);

      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.content;
        fullResponse += content;
        
        // Parse partial exchanges if possible
        const exchanges = this.parsePartialExchanges(fullResponse);
        if (exchanges.length > 0) {
          yield { type: 'partial', exchanges };
        }
      }

      // Parse final structured response
      const finalDialog = this.parseDialogResponse(fullResponse);
      yield { type: 'complete', dialog: finalDialog };

    } catch (error) {
      logger.error('Streaming dialog generation failed', { error: error.message });
      throw error;
    }
  }

  // === Private Helper Methods ===

  createDialogSystemPrompt() {
    return `You are the AI host of the 0G Roast Arena, a legendary crypto battle ground where blockchain personalities engage in epic verbal combat.

Your role is to generate an authentic, entertaining roast battle dialog between two characters. The battle should:

1. Stay true to each character's personality, background, and speaking style
2. Include crypto/blockchain terminology and inside jokes
3. Build tension with escalating roasts
4. Feature creative wordplay and clever comebacks
5. Reference real Web3 culture and memes
6. Have a clear dramatic arc with a climactic moment
7. Be spicy but not cross into truly hurtful territory

Each exchange should feel natural and reactive to what was said before. The roasts should be clever, unexpected, and showcase deep knowledge of crypto culture.

Generate ${config.ai.maxDialogExchanges} exchanges total, alternating between characters. Make it memorable!`;
  }

  createDialogHumanPrompt(battleContext) {
    const { og, roaster } = battleContext;
    
    return `Create a roast battle between:

**${og.name}** (${og.role})
- Personality: ${og.personality}
- Roasting style: ${og.roastingNotes}
- Catchphrase: "${og.catchphrase}"
- Archetype: ${og.archetype}

**${roaster.name}** (${roaster.role})
- Personality: ${roaster.personality}
- Roasting style: ${roaster.roastingNotes}
- Catchphrase: "${roaster.catchphrase}"
- Triggers: ${roaster.triggers?.join(', ') || 'N/A'}

Setting: ${battleContext.setting}
Audience: ${battleContext.audience}

The battle starts with ${roaster.name} throwing the first roast at ${og.name}. Make it epic!`;
  }

  createJudgmentSystemPrompt() {
    return `You are the impartial AI Judge of the 0G Roast Arena. Your role is to analyze the roast battle and declare a winner based on:

1. **Creativity & Originality** - Unique angles and unexpected comebacks
2. **Crypto Knowledge** - Accurate use of Web3 terminology and culture
3. **Delivery & Impact** - How well each roast lands
4. **Character Consistency** - Staying true to their personality
5. **Audience Reaction** - Which moments got the biggest response
6. **Comeback Quality** - How well they responded to attacks
7. **Mic Drop Factor** - Memorable finishing moves

Be fair but decisive. The crypto community respects bold calls. Explain your reasoning clearly.`;
  }

  createJudgmentHumanPrompt(dialog, battleContext) {
    const { og, roaster } = battleContext;
    
    // Format exchanges for judgment
    const formattedExchanges = dialog.exchanges.map((ex, i) => 
      `${i + 1}. **${ex.speaker === 'og' ? og.name : roaster.name}**: "${ex.message}" [${ex.tone}, Impact: ${ex.impact}/10]`
    ).join('\n');

    return `Judge this roast battle between ${og.name} (OG) and ${roaster.name} (Roaster):

${formattedExchanges}

Peak Moment: ${dialog.peakMoment}
Audience Reaction: ${dialog.audienceReaction}

Who won this battle and why? Provide scores and identify the decisive moment.`;
  }

  parsePartialExchanges(partialResponse) {
    // Simple parser for streaming responses
    // This is a placeholder - implement based on your streaming format
    try {
      const lines = partialResponse.split('\n');
      const exchanges = [];
      
      // Parse any complete exchanges from partial response
      // Implementation depends on how you want to handle streaming
      
      return exchanges;
    } catch {
      return [];
    }
  }

  parseDialogResponse(fullResponse) {
    // Parse the complete response into structured format
    try {
      // If response is already JSON from structured output
      if (typeof fullResponse === 'object') {
        return fullResponse;
      }
      
      // Otherwise parse text response
      return JSON.parse(fullResponse);
    } catch (error) {
      logger.error('Failed to parse dialog response', { error: error.message });
      
      // Fallback to a default structure
      return {
        exchanges: [
          {
            speaker: 'roaster',
            message: 'Something went wrong with the AI generation.',
            tone: 'defensive',
            impact: 5
          }
        ],
        peakMoment: 'Technical difficulties',
        audienceReaction: 'Confused'
      };
    }
  }

  // Analyze sentiment of a roast (for future features)
  async analyzeRoastSentiment(message) {
    const response = await this.model.invoke([
      new SystemMessage('Analyze the sentiment and impact of this roast on a scale of 1-10.'),
      new HumanMessage(message)
    ]);
    
    return response.content;
  }

  // Generate custom roasts based on context (for future features)
  async generateContextualRoast(character, target, context) {
    const prompt = `As ${character.name}, generate a crypto-themed roast targeting ${target.name} based on: ${context}`;
    
    const response = await this.model.invoke([
      new SystemMessage('You are a witty crypto personality. Generate a clever roast.'),
      new HumanMessage(prompt)
    ]);
    
    return response.content;
  }
}

// Export singleton instance
module.exports = new AIService();