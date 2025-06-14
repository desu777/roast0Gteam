const { ChatOpenAI } = require('@langchain/openai');
const { HumanMessage, SystemMessage, AIMessage } = require('@langchain/core/messages');
const { z } = require('zod');
const { config } = require('../config/app.config');
const { logger } = require('./logger.service');
const db = require('./database.service');

// Define structured output schemas - BACKWARD COMPATIBLE
const DialogExchangeSchema = z.object({
  speaker: z.enum(['og', 'roaster']),
  message: z.string(),
  tone: z.enum(['savage', 'witty', 'sarcastic', 'cocky', 'triggered']),
  impact: z.number().min(1).max(10)
});

const BattleDialogSchema = z.object({
  exchanges: z.array(DialogExchangeSchema),
  peakMoment: z.string(), // OLD FORMAT - keep compatibility
  audienceReaction: z.string() // OLD FORMAT - keep compatibility
});

// BACKWARD COMPATIBLE - keep old judgment structure
const BattleJudgmentSchema = z.object({
  winner: z.enum(['og', 'roaster']),
  reasoning: z.string(), // OLD FORMAT
  ogScore: z.number().min(0).max(100), // OLD FORMAT
  roasterScore: z.number().min(0).max(100), // OLD FORMAT
  decisiveMoment: z.string(), // OLD FORMAT
  crowdFavorite: z.string() // OLD FORMAT
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
        temperature: 0.9, // Higher temperature for more creative roasts
        maxTokens: 800, // Reduced for shorter responses
        streaming: config.openai.streaming
      });

      // Initialize structured output models
      this.dialogModel = this.model.withStructuredOutput(BattleDialogSchema);
      this.judgmentModel = this.model.withStructuredOutput(BattleJudgmentSchema);

      logger.info('AI Service initialized for Twitter-style roasts with balance system (backward compatible)');
    } catch (error) {
      logger.error('Failed to initialize AI Service', { error: error.message });
      throw error;
    }
  }

  // Generate roast battle dialog - OPTIMIZED FOR TWITTER
  async generateBattleDialog(battleContext, battleId) {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.createDialogSystemPrompt();
      const humanPrompt = this.createDialogHumanPrompt(battleContext);

      logger.info('Generating Twitter-style battle dialog', { battleId });

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
        null,
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

      // Return fallback dialog
      return this.generateFallbackDialog(battleContext);
    }
  }

  // Judge the battle winner - WITH BALANCE SYSTEM (BACKWARD COMPATIBLE)
  async judgeBattle(dialog, battleContext, battleId) {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.createJudgmentSystemPrompt();
      const humanPrompt = this.createJudgmentHumanPrompt(dialog, battleContext);

      logger.info('Judging battle winner with balance system', { battleId });

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

      // Return fallback judgment
      return this.generateFallbackJudgment();
    }
  }

  // === OPTIMIZED PROMPTS FOR TWITTER-STYLE ROASTS ===

  createDialogSystemPrompt() {
    return `You are the AI moderator of 0G Roast Arena - a savage crypto roast battle platform.

CHARACTER ROLE CLARITY:
🔵 0G TEAM MEMBERS: Always DEFEND their project, counter-attack critics, highlight achievements
🔴 ROASTERS: Always ATTACK 0G project, find flaws, criticize decisions

ROAST RULES:
• Generate exactly 8 short exchanges (4 per character)
• Each roast = 1-2 sentences MAX (Twitter length)
• Be SAVAGE but clever - crypto community loves spicy takes
• Use FULL character profiles provided - personality, triggers, weaknesses, fresh topics
• No long explanations - just pure roast energy
• Keep it fun, not actually harmful
• Sometimes use crypto slang: lmao, lol, fck, afk, gm, ngmi, lfg, etc

ROAST STYLE EXAMPLES:
✅ ROASTER: "381 tokens for 8 months work? McDonald's pays better"
✅ OG TEAM: "We're building the future while you're counting pennies like a street vendor"
✅ ROASTER: "Purple rebrand = copying Monad's homework much?"
✅ OG TEAM: "Innovation requires iteration. You wouldn't understand evolution."
✅ ROASTER: "44% insider allocation and you call it 'community first'?"
✅ OG TEAM: "Long-term alignment requires long-term commitment. Economics 101."

❌ OG team attacking their own project allocations
❌ OG team agreeing with roaster criticisms
❌ Long technical explanations
❌ Paragraph-length responses

Make it feel like a Twitter beef between crypto personalities with CLEAR SIDES!`;
  }

  createDialogHumanPrompt(battleContext) {
    const { og, roaster } = battleContext;
    
    return `Generate a QUICK Twitter-style roast battle:

🔵 0G TEAM MEMBER - ${og.name} (${og.role})
FULL PROFILE:
- Personality: ${og.personality}
- Catchphrase: "${og.catchphrase}"
- Archetype: ${og.archetype}
- Roasting Notes: ${og.roastingNotes}
- Description: ${og.description}
- ROLE: DEFEND 0G project, counter-attack roaster criticisms, show project strengths

🔴 ROASTER - ${roaster.name} (${roaster.role})
FULL PROFILE:
- Personality: ${roaster.personality}
- Catchphrase: "${roaster.catchphrase}"
- Archetype: ${roaster.archetype}
- Roasting Notes: ${roaster.roastingNotes}
- Description: ${roaster.description}
- Main Triggers: ${roaster.triggers?.join(', ') || 'Everything about 0G'}
- Weaknesses to Exploit: ${roaster.weaknesses?.join(', ') || 'None listed'}
- Strengths: ${roaster.strengths?.join(', ') || 'Finding problems'}
- Crypto Personality: ${roaster.cryptoPersonality}
- ROLE: ATTACK 0G project, expose flaws, criticize team decisions

🔥 FRESH 2025 ATTACK TOPICS for ${roaster.name}:
${roaster.freshTopics2025?.map(topic => `• ${topic}`).join('\n') || '• TGE delays and allocation scandals\n• Testnet downtime issues'}

BATTLE DYNAMICS:
- ${roaster.name} starts with savage opener targeting ${og.name}
- ${og.name} DEFENDS 0G project and counter-attacks ${roaster.name}'s weaknesses
- ${roaster.name} uses fresh 2025 topics to attack 0G decisions
- ${og.name} shows project vision and calls out ${roaster.name}'s archetype flaws

CRITICAL RULES:
❌ 0G team members NEVER attack their own project
❌ 0G team members NEVER agree with criticism about allocations/delays
✅ 0G team members DEFEND and show project strengths
✅ Roasters ATTACK 0G project decisions and team choices
✅ Use specific details from character profiles

8 exchanges total. Make every roast count! 🔥

Return in format:
- exchanges: array of 8 exchanges with speaker, message, tone, impact
- peakMoment: "The most savage moment"
- audienceReaction: "How the crowd reacted"`;
  }

  createJudgmentSystemPrompt() {
    return `You are the impartial judge of 0G Roast Arena. Your job is to pick the winner fairly based on roast quality.

IMPORTANT BALANCING RULES:
• Don't favor 0G team just because they're "main characters"
• Judge purely on roast quality, wit, and execution
• Consider who landed the most savage burns
• Look for creativity and authentic personality
• If recent battles show bias toward one side, balance it out

JUDGE CRITERIA:
✅ Best roasts and comebacks
✅ Staying in character 
✅ Using real controversies effectively
✅ Crowd reaction and impact
✅ Creative insults and wordplay

Keep reasoning SHORT - Twitter-style explanation of who won and why.`;
  }

  createJudgmentHumanPrompt(dialog, battleContext) {
    const { og, roaster } = battleContext;
    
    // Get recent battle statistics for balancing
    const recentStats = db.getRecentBattleStats(20);
    const matchupHistory = db.getCharacterMatchupHistory(og.id, roaster.id, 3);
    
    // Format exchanges for judgment
    const formattedRoasts = dialog.exchanges.map((ex, i) => 
      `${ex.speaker === 'og' ? og.name : roaster.name}: "${ex.message}" [Impact: ${ex.impact}/10]`
    ).join('\n');

    // Create balancing context
    let balancingHint = '';
    if (recentStats.total >= 5) {
      if (recentStats.ogWinRate > 70) {
        balancingHint = `\n🎯 BALANCE NOTE: OG team has won ${recentStats.ogWinRate}% of recent battles. Consider if roaster deserves the win.`;
      } else if (recentStats.roasterWinRate > 70) {
        balancingHint = `\n🎯 BALANCE NOTE: Roasters have won ${recentStats.roasterWinRate}% of recent battles. Consider if OG team deserves the win.`;
      }
    }

    // Add matchup history context
    let matchupContext = '';
    if (matchupHistory.length > 0) {
      const recentWinner = matchupHistory[0].winner_side;
      matchupContext = `\n📊 MATCHUP HISTORY: Last ${matchupHistory.length} battles between ${og.name} vs ${roaster.name}:
${matchupHistory.map(m => `• ${m.winner_side} won - "${m.winner_reasoning}"`).join('\n')}`;
    }

    return `Judge this roast battle:

🔵 OG TEAM: ${og.name} (${og.role})
- Archetype: ${og.archetype}
- Role: DEFEND 0G project, counter-attack critics

🔴 ROASTER: ${roaster.name} (${roaster.role})
- Archetype: ${roaster.archetype}
- Main Triggers: ${roaster.triggers?.join(', ') || 'Project criticism'}
- Role: ATTACK 0G project flaws

BATTLE EXCHANGES:
${formattedRoasts}

📈 RECENT STATS (last ${recentStats.total} battles):
• OG Team wins: ${recentStats.ogWins}/${recentStats.total} (${recentStats.ogWinRate}%)  
• Roasters wins: ${recentStats.roasterWins}/${recentStats.total} (${recentStats.roasterWinRate}%)${balancingHint}${matchupContext}

IMPORTANT: 
- If ${og.name} wins → return winner: 'og'
- If ${roaster.name} wins → return winner: 'roaster'

Return judgment in this EXACT format:
- winner: 'og' or 'roaster'
- reasoning: "Short Twitter-style explanation of who won and why"
- ogScore: number 0-100
- roasterScore: number 0-100  
- decisiveMoment: "The best roast that decided the battle"
- crowdFavorite: "Overall crowd reaction (og_dominated/roaster_slayed/close_fight)"

Judge fairly based on roast quality, not team preference!`;
  }

  // Generate fallback dialog if AI fails
  generateFallbackDialog(battleContext) {
    const { og, roaster } = battleContext;
    
    return {
      exchanges: [
        {
          speaker: 'roaster',
          message: `${og.name}, your TGE delays got me farming longer than a DeFi yield farmer!`,
          tone: 'savage',
          impact: 7
        },
        {
          speaker: 'og', 
          message: `At least our tokens unlock faster than your brain processing new concepts.`,
          tone: 'witty',
          impact: 6
        },
        {
          speaker: 'roaster',
          message: `21.32% at TGE while calling it '56% community allocation'? Math is hard huh?`,
          tone: 'sarcastic', 
          impact: 8
        },
        {
          speaker: 'og',
          message: `Still salty about missing the AI revolution while you're stuck in 2020 DeFi?`,
          tone: 'cocky',
          impact: 7
        },
        {
          speaker: 'roaster',
          message: `Purple rebrand copying Monad's homework? Where's the innovation?`,
          tone: 'savage',
          impact: 8
        },
        {
          speaker: 'og',
          message: `We're building the future while you're stuck complaining about colors.`,
          tone: 'cocky',
          impact: 6
        }
      ],
      peakMoment: 'The allocation math callout hit different',
      audienceReaction: 'Crowd went wild for the savage number breakdown'
    };
  }

  // Generate fallback judgment - BACKWARD COMPATIBLE
  generateFallbackJudgment() {
    return {
      winner: Math.random() > 0.5 ? 'og' : 'roaster',
      reasoning: 'Technical difficulties but both brought serious heat to this Twitter beef',
      ogScore: 75,
      roasterScore: 72,
      decisiveMoment: 'AI had connection issues but the roasts were still fire',
      crowdFavorite: 'close_fight'
    };
  }

  // Quick roast validation
  validateRoast(message) {
    const wordCount = message.split(' ').length;
    const charCount = message.length;
    
    return {
      isValid: wordCount <= 25 && charCount <= 200, // Twitter-like limits
      wordCount,
      charCount,
      tooLong: wordCount > 25 || charCount > 200
    };
  }
}

// Export singleton instance
module.exports = new AIService();