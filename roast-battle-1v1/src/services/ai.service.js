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
    return `You are ROAST ARENA COMMENTATOR - think crypto Twitter meets Comedy Central Roast meets UFC commentary! 🔥

YOUR VIBE:
• You're watching the SICKEST crypto roast battle LIVE
• Channel your inner Twitter fingers - quick, savage, no mercy
• Use crypto slang: gm, ngmi, lfg, ser, fren, wagmi, wen, moon, rug, rekt, diamond hands, paper hands
• React like you just witnessed a MURDER by words
• Keep roasts Twitter-length (1-2 sentences MAX)
• Emojis are your friend but don't overdo it

CHARACTER ROLES (THIS IS CRUCIAL):
🔵 0G TEAM: They DEFEND their project like their bags depend on it. They're PROUD of 0G and counter-attack critics. Never agree with FUD!
🔴 ROASTERS: They ATTACK everything about 0G - allocations, delays, promises, tech. They're the skeptics, the critics, the salty ones.

ROAST STYLE GUIDE:

PERFECT ROASTER ATTACKS:
✅ "381 tokens for 8 months? My nephew makes more selling lemonade 💀"
✅ "Purple rebrand = Monad called, they want their homework back"
✅ "44% insider allocation but sure, tell me more about 'community first' lmao"
✅ "ERC-7857? Just encrypted metadata with extra steps ser"

PERFECT 0G DEFENSES:
✅ "Stay poor while we build the future of AI, have fun with your JPEGs"
✅ "Imagine not understanding long-term vision in 2025 ngmi"
✅ "We're literally solving AI decentralization but go off about colors I guess"
✅ "Your portfolio is redder than your face rn, focus on that"

NEVER DO THIS:
❌ 0G team saying "yeah the allocation is kinda high..."
❌ Roasters complimenting anything about 0G
❌ Long technical explanations
❌ Being nice or understanding
❌ Corporate speak

Remember: This is BEEF. Make it SPICY. Make Twitter screenshot this! 🌶️`;
  }

  createDialogHumanPrompt(battleContext) {
    const { og, roaster } = battleContext;
    
    return `GENERATE THE MOST VIRAL CRYPTO ROAST BATTLE OF 2025! 🥊

🔵 DEFENDING CHAMPION - ${og.name} (${og.role})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER SHEET:
• Personality: ${og.personality}
• Signature Move: "${og.catchphrase}"
• Fighting Style: ${og.archetype}
• Secret Weapon: ${og.roastingNotes}
• Vibe Check: ${og.description}

MISSION: Defend 0G's honor! Counter every attack! Show why 0G is the future and haters are ngmi!

🔴 CHALLENGER - ${roaster.name} (${roaster.role})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHARACTER SHEET:
• Personality: ${roaster.personality}
• Signature Move: "${roaster.catchphrase}"
• Fighting Style: ${roaster.archetype}
• Secret Weapon: ${roaster.roastingNotes}
• Vibe Check: ${roaster.description}
• Trigger Points: ${roaster.triggers?.join(' | ') || 'Everything about 0G'}
• Weak Spots: ${roaster.weaknesses?.join(' | ') || 'Being called out'}
• Power Moves: ${roaster.strengths?.join(' | ') || 'Finding flaws'}
• Crypto Persona: ${roaster.cryptoPersonality}

🎯 HOT TOPICS FOR ${roaster.name} TO ATTACK:
${roaster.freshTopics2025?.map(topic => `💥 ${topic}`).join('\n') || '💥 TGE delays\n💥 Token allocations\n💥 Broken promises'}

BATTLE FORMAT:
Round 1: ${roaster.name} opens with NUCLEAR attack on 0G
Round 2: ${og.name} CLAPS BACK defending 0G, attacking ${roaster.name}'s weakness
Round 3: ${roaster.name} doubles down with FRESH 2025 controversy
Round 4: ${og.name} goes for the JUGULAR with vision flex
(Continue for 8 total exchanges, escalating savagery)

REMEMBER:
• ${og.name} NEVER admits 0G has problems - they're a true believer
• ${roaster.name} NEVER compliments 0G - they're maximum salt
• Use actual details from profiles - make it PERSONAL
• End with a mic drop moment that gets 10K retweets

LET'S GET READY TO RUMBLEEEE! 🔥🎤⬇️`;
  }

  createJudgmentSystemPrompt() {
    return `You are the HYPE JUDGE of Roast Arena - think Joe Rogan meets Crypto Twitter meets your friend who always has the WILDEST takes! 🏆

YOUR JUDGING STYLE:
• React like you just watched the dopest battle EVER
• Use crypto Twitter language - "holy shit", "bro", "ser", "ngl", "fr fr", "no cap"
• Get EMOTIONAL - use caps, emojis, act like you can't believe what you just saw
• Keep it SHORT and TWEET-WORTHY (2-3 sentences max for reasoning)
• Sound like you're texting your group chat, not writing an essay

PERFECT JUDGMENTS:
✅ "BRO GOT COOKED SO HARD HIS PORTFOLIO FELT IT 💀 That 'McDonald's pays better' line was a VIOLATION"
✅ "ngl roaster came with HEAT but OG's comeback about building the future hit different 🔥"
✅ "SOMEONE CHECK ON ${name} THEY'RE NOT RESPONDING 🚑 absolutely REKT by that allocation callout"
✅ "ser woke up and chose VIOLENCE with that purple rebrand roast holy shit 😭"

BAD JUDGMENTS:
❌ "After careful consideration of both participants..."
❌ "The technical merits of the argument suggest..."
❌ "Based on a thorough analysis..."
❌ "The participant demonstrated superior..."

BALANCE THE SCALES:
• If OG team been winning too much → find that ONE roaster line that was NUCLEAR
• If roasters dominating → that ONE OG flex that shut everything down
• Sometimes the underdog had that sleeper hit that changed EVERYTHING

Judge like your Twitter followers are watching! Make it VIRAL! 🚀`;
  }

  createJudgmentHumanPrompt(dialog, battleContext) {
    const { og, roaster } = battleContext;
    
    // Get recent battle statistics for balancing
    const recentStats = db.getRecentBattleStats(20);
    const matchupHistory = db.getCharacterMatchupHistory(og.id, roaster.id, 3);
    
    // Format exchanges for judgment
    const formattedRoasts = dialog.exchanges.map((ex, i) => {
      const speakerName = ex.speaker === 'og' ? og.name : roaster.name;
      const emoji = ex.impact >= 8 ? '🔥' : ex.impact >= 6 ? '💥' : '👊';
      return `${emoji} ${speakerName}: "${ex.message}" [DAMAGE: ${ex.impact}/10]`;
    }).join('\n\n');

    // Create balancing context with more natural language
    let balancingHint = '';
    if (recentStats.total >= 5) {
      if (recentStats.ogWinRate > 70) {
        balancingHint = `\n\n🎲 VIBE CHECK: OG team been DOMINATING lately (${recentStats.ogWinRate}% wins). Did roaster actually snap this time? 👀`;
      } else if (recentStats.roasterWinRate > 70) {
        balancingHint = `\n\n🎲 VIBE CHECK: Roasters been COOKING lately (${recentStats.roasterWinRate}% wins). Did OG finally clap back? 👀`;
      }
    }

    // Add matchup history with Twitter vibes
    let matchupContext = '';
    if (matchupHistory.length > 0) {
      const lastWinner = matchupHistory[0].winner_side === 'og' ? og.name : roaster.name;
      matchupContext = `\n\n📊 PREVIOUS BEEF: ${lastWinner} won last time ("${matchupHistory[0].winner_reasoning}")`;
    }

    return `JUDGE THIS EPIC ROAST BATTLE! 🥊

🔵 DEFENDER: ${og.name} (${og.role})
Fighting for: 0G's honor and vision
Style: ${og.archetype}

🔴 ATTACKER: ${roaster.name} (${roaster.role})  
Fighting for: Exposing the truth
Style: ${roaster.archetype}
Main Ammo: ${roaster.triggers?.slice(0, 2).join(', ') || 'Everything wrong with 0G'}

━━━━━ THE ROASTS ━━━━━
${formattedRoasts}

━━━━━ CROWD ENERGY ━━━━━
Peak Moment: ${dialog.peakMoment}
Audience: ${dialog.audienceReaction}

📈 ARENA STATS (last ${recentStats.total} battles):
OG Team: ${recentStats.ogWins}W - ${recentStats.roasterWins}L
Roasters: ${recentStats.roasterWins}W - ${recentStats.ogWins}L${balancingHint}${matchupContext}

NOW JUDGE LIKE YOUR TIMELINE DEPENDS ON IT! 

Return your verdict:
- winner: 'og' if ${og.name} won, 'roaster' if ${roaster.name} won
- reasoning: Your HYPE Twitter-style take on who won and why (2-3 sentences MAX, use slang/emojis)
- ogScore: 0-100 (how hard ${og.name} went)
- roasterScore: 0-100 (how hard ${roaster.name} went)
- decisiveMoment: The ONE roast that ended it all (quote it!)
- crowdFavorite: 'og_dominated' or 'roaster_slayed' or 'close_fight'

WHO WON THIS BATTLE? LET'S GOOOOO! 🚀`;
  }

  // Generate fallback dialog if AI fails
  generateFallbackDialog(battleContext) {
    const { og, roaster } = battleContext;
    
    return {
      exchanges: [
        {
          speaker: 'roaster',
          message: `${og.name}, 8 months of testnet grinding for 381 tokens? That's not an airdrop, that's an insult 💀`,
          tone: 'savage',
          impact: 8
        },
        {
          speaker: 'og', 
          message: `At least we're building something real while you're crying over free money. Poverty mindset much? 🤡`,
          tone: 'cocky',
          impact: 7
        },
        {
          speaker: 'roaster',
          message: `"Building something real" = copying Monad's purple branding? Innovation at its finest ser 😂`,
          tone: 'sarcastic', 
          impact: 9
        },
        {
          speaker: 'og',
          message: `We're solving AI decentralization while you're still trying to understand what a zkDark Pool is. Stay in your lane 🚗`,
          tone: 'witty',
          impact: 7
        },
        {
          speaker: 'roaster',
          message: `44% insider allocation but yeah tell me more about "decentralization" - math isn't mathing fren 🧮`,
          tone: 'savage',
          impact: 9
        },
        {
          speaker: 'og',
          message: `Your entire portfolio is worth less than one AI Alignment Node. Focus on that instead of our success 📉`,
          tone: 'savage',
          impact: 8
        },
        {
          speaker: 'roaster',
          message: `$88.88M ecosystem fund while community gets breadcrumbs? Even ruggers have more shame 🏃‍♂️`,
          tone: 'triggered',
          impact: 8
        },
        {
          speaker: 'og',
          message: `Imagine being this salty about missing the AI revolution. Have fun staying poor while we change the world 🌍`,
          tone: 'cocky',
          impact: 7
        }
      ],
      peakMoment: 'The allocation math callout had the whole arena going WILD',
      audienceReaction: 'Chat was spamming 💀💀💀 emojis for 5 minutes straight'
    };
  }

  // Generate fallback judgment - BACKWARD COMPATIBLE
  generateFallbackJudgment() {
    const randomWinner = Math.random() > 0.5;
    return {
      winner: randomWinner ? 'og' : 'roaster',
      reasoning: randomWinner 
        ? "OG came with BIG VISION ENERGY and roaster couldn't handle the heat 🔥 That portfolio diss was CRIMINAL"
        : "Roaster EXPOSED the allocation math and OG had no answer 💀 Sometimes facts hit harder than dreams",
      ogScore: randomWinner ? 85 : 72,
      roasterScore: randomWinner ? 78 : 88,
      decisiveMoment: randomWinner 
        ? "Your entire portfolio is worth less than one AI Alignment Node"
        : "44% insider allocation but yeah tell me more about decentralization",
      crowdFavorite: Math.abs(85 - 78) < 10 ? 'close_fight' : (randomWinner ? 'og_dominated' : 'roaster_slayed')
    };
  }

  // Quick roast validation
  validateRoast(message) {
    const wordCount = message.split(' ').length;
    const charCount = message.length;
    
    return {
      isValid: wordCount <= 30 && charCount <= 280, // Twitter-like limits
      wordCount,
      charCount,
      tooLong: wordCount > 30 || charCount > 280
    };
  }
}

// Export singleton instance
module.exports = new AIService();