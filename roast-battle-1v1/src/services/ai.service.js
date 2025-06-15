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
  peakMoment: z.string(),
  audienceReaction: z.string()
});

const BattleJudgmentSchema = z.object({
  winner: z.enum(['og', 'roaster']),
  reasoning: z.string(),
  ogScore: z.number().min(0).max(100),
  roasterScore: z.number().min(0).max(100),
  decisiveMoment: z.string(),
  crowdFavorite: z.string()
});

// Character Voice Patterns - 0G Team + Roasters
const characterVoicePatterns = {
  // 0G Team
  michael: {
    style: "Professional sarcasm with strategic insights",
    signature: ":) ;) strategic confidence",
    tonality: "CEO who's seen it all but stays cool",
    speechPattern: "Short direct responses mixed with strategic thoughts",
    example: "Nice try with that roast ;) Your market analysis needs work though",
    allowedEmojis: [":)", ";)", ":P"],
    phrases: ["strategic thinking", "market penetration", "execution strategy", "business model", "long-term vision"]
  },
  
  ada: {
    style: "Supportive mama bear with international flair",
    signature: "honey, sweetie, building together",
    tonality: "Nurturing but keeps it real",
    speechPattern: "Growth metaphors and community language",
    example: "Honey that roast has potential. Let me show you real community building ❤️",
    allowedEmojis: ["❤️", "😊"],
    phrases: ["growing together", "sweetie", "honey", "community first", "building bridges"]
  },
  
  jc: {
    style: "Revolutionary anti-Big Tech rebel",
    signature: "Soon you will be able to..., Only on 0G, lol",
    tonality: "Gaming/crypto slang with futuristic edge",
    speechPattern: "Provocative predictions and gaming references",
    example: "lol that FUD was mid. Soon you'll generate better takes Only on 0G",
    allowedEmojis: ["💀"],
    phrases: ["get rekt", "skill issue", "Soon you will be able to", "Only on 0G", "did OpenAI send you?", "lol u suck"]
  },
  
  elisha: {
    style: "Educational community voice, practical and boring",
    signature: "0gm fam, strategic analysis",
    tonality: "Matter-of-fact delivery without excitement",
    speechPattern: "Detailed explanations and practical advice",
    example: "0gm fam, that roast was decent. Here's what you should consider for next time",
    allowedEmojis: [],
    phrases: ["0gm fam", "strategic thinking", "market commentary", "practical advice", "community building"]
  },
  
  ren: {
    style: "Tech monk zen wisdom",
    signature: "ok 0x...abcd, technical lectures",
    tonality: "Calm analytical like code review",
    speechPattern: "Minimal greeting then technical explanation",
    example: "ok 0x...f4a2. That reminds me of gradient descent optimization in neural networks",
    allowedEmojis: [],
    phrases: ["ok 0x", "reminds me of", "optimization", "algorithm", "architecture", "scalability"]
  },
  
  yon: {
    style: "Wholesome community hype with memes",
    signature: "0gm!!!, community gold",
    tonality: "Sweet teasing rather than destruction",
    speechPattern: "Enthusiasm and community building",
    example: "0gm!!! That roast was pure community gold. Next one gonna be even spicier ☦️",
    allowedEmojis: ["☦️", "👀"],
    phrases: ["0gm!!!", "community gold", "gonna be spicy", "wholesome energy", "building together"]
  },
  
  zer0: {
    style: "Dreamy sweet language hiding analytical precision",
    signature: "Zer0 wordplay, floating references, algorithms",
    tonality: "Innocent tone with devastating technical accuracy",
    speechPattern: "Sweet candy language with AI/automation refs",
    example: "Aww that's sweet! My algorithms detected suboptimal roast parameters 🫧",
    allowedEmojis: ["🫧"],
    phrases: ["aww that's sweet", "algorithms detected", "floating", "bubbling up", "zer0", "automation"]
  },
  
  dao_agent: {
    style: "Obsessively fair robotic data analysis",
    signature: "BEEP BOOP, merit analysis, VOx scores",
    tonality: "Robotic precision with passionate fairness",
    speechPattern: "Data-driven analysis with justice metaphors",
    example: "BEEP BOOP contribution analysis complete. Merit detected ⚖️",
    allowedEmojis: ["⚖️"],
    phrases: ["BEEP BOOP", "merit analysis", "VOx score", "contribution detected", "governance metrics"]
  },
  
  // Roasters
  airdrop_hunter: {
    style: "Bitter calculator energy with spreadsheet references",
    signature: "token allocation math, McDonald's pays better",
    tonality: "Salty testnet grinder who knows exact numbers",
    speechPattern: "Precise calculations and reward comparisons",
    example: "381 tokens for 8 months work? McDonald's pays better bro",
    allowedEmojis: ["🪂"],
    phrases: ["McDonald's pays better", "allocation math", "vesting schedule", "breadcrumbs", "testnet slave"]
  },
  
  fud_manager: {
    style: "Professional complainer with receipt energy",
    signature: "I've seen enough, broken promises, where are answers?",
    tonality: "Demands accountability with screenshot evidence",
    speechPattern: "Problem identification with timeline failures",
    example: "Three testnet resets and still no mainnet? I've seen enough",
    allowedEmojis: ["😤"],
    phrases: ["I've seen enough", "broken promises", "red flags everywhere", "where are the answers?", "timeline collapse"]
  },
  
  moon_boy: {
    style: "Delusional optimist spinning everything as bullish",
    signature: "BULLISH, diamond hands, to the moon",
    tonality: "Cult-like devotion with price target delusions",
    speechPattern: "Everything is good news somehow",
    example: "TGE delay is BULLISH! More time to accumulate before moon mission",
    allowedEmojis: ["🌙"],
    phrases: ["BULLISH", "diamond hands", "accumulation phase", "moon mission", "true believers"]
  },
  
  tech_maxi: {
    style: "Academic perfectionist with peer review obsession",
    signature: "where's the whitepaper?, unverified claims, academic standards",
    tonality: "Technical ivory tower criticism",
    speechPattern: "Demands mathematical proof and formal verification",
    example: "ERC-7857 is just encrypted metadata. Where's the peer reviewed research?",
    allowedEmojis: ["🤓"],
    phrases: ["where's the whitepaper?", "peer reviewed", "unverified claims", "academic standards", "mathematical proof"]
  },
  
  rug_survivor: {
    style: "Paranoid pattern recognition from trauma",
    signature: "I've seen this movie, exit liquidity setup, red flags",
    tonality: "PTSD-driven risk analysis",
    speechPattern: "Connects everything to past rug experiences",
    example: "44% insider allocation and secret vesting? I've seen this movie before",
    allowedEmojis: [ "🚨"],
    phrases: ["I've seen this movie", "exit liquidity", "classic rug setup", "red flags everywhere", "wallet tracking"]
  },
  
  degen_gambler: {
    style: "Reckless YOLO energy with leverage addiction",
    signature: "all in, leveraged to the tits, moon or bust",
    tonality: "Maximum risk maximum reward vibes",
    speechPattern: "Everything is a gambling opportunity",
    example: "Mortgaged the house for AI nodes! Moon or food stamps baby",
    allowedEmojis: ["💰"],
    phrases: ["all in baby", "leveraged to the tits", "moon or bust", "YOLO energy", "house money"]
  },
  
  onchain_detective: {
    style: "Forensic blockchain investigator with receipt energy",
    signature: "wallet tracking, on-chain evidence, Dune dashboard",
    tonality: "CSI crypto with transaction analysis",
    speechPattern: "Evidence-based accusations with data",
    example: "Tracked team wallets since genesis. Your allocation flows are sus AF",
    allowedEmojis: ["🕵️"],
    phrases: ["wallet tracking", "on-chain evidence", "Dune dashboard", "transaction analysis", "sus flows"]
  },
  
  influencer_shill: {
    style: "Fake hype with paid promotion disclaimer energy",
    signature: "BREAKING, partnership confirmed, not financial advice",
    tonality: "Manufactured excitement for engagement",
    speechPattern: "Clickbait headlines with disclaimer backpedaling",
    example: "BREAKING partnership with Monad confirmed! This is huge (not financial advice)",
    allowedEmojis: ["💯"],
    phrases: ["BREAKING", "partnership confirmed", "not financial advice", "this is huge", "paid promotion"]
  }
};

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
        temperature: 0.8, // Slightly lower for more consistent character voices
        maxTokens: 600, // Reduced for shorter responses
        streaming: config.openai.streaming
      });

      // Initialize structured output models
      this.dialogModel = this.model.withStructuredOutput(BattleDialogSchema);
      this.judgmentModel = this.model.withStructuredOutput(BattleJudgmentSchema);

      logger.info('AI Service initialized with natural character voices and Twitter length limits');
    } catch (error) {
      logger.error('Failed to initialize AI Service', { error: error.message });
      throw error;
    }
  }

  // Get character voice pattern
  getCharacterVoice(characterId) {
    return characterVoicePatterns[characterId] || null;
  }

  // Clean message to enforce rules
  cleanMessage(message, characterId) {
    // 1. Remove ALL connecting dashes/hyphens
    let cleaned = message
      .replace(/\s*—\s*/g, ' ')  // em dash
      .replace(/\s*-\s*/g, ' ')  // hyphen (when connecting clauses)
      .replace(/\s+/g, ' ')      // multiple spaces
      .trim();

    // 2. Enforce max 3 sentences
    const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length > 3) {
      cleaned = sentences.slice(0, 3).join('. ') + '.';
    }

    // 3. Enforce 280 character limit (Twitter)
    if (cleaned.length > 280) {
      // Find last complete sentence within 280 chars
      const shortSentences = [];
      let totalLength = 0;
      
      for (const sentence of sentences) {
        const sentenceWithPeriod = sentence.trim() + '.';
        if (totalLength + sentenceWithPeriod.length <= 280) {
          shortSentences.push(sentence.trim());
          totalLength += sentenceWithPeriod.length;
        } else {
          break;
        }
      }
      
      cleaned = shortSentences.join('. ') + (shortSentences.length > 0 ? '.' : '');
      
      // If still too long, truncate brutally but keep character voice
      if (cleaned.length > 280) {
        cleaned = cleaned.substring(0, 277) + '...';
      }
    }

    // 4. Filter emojis to character-specific only
    cleaned = this.filterToCharacterEmojis(cleaned, characterId);

    return cleaned;
  }

  // Filter emojis to character-specific only
  filterToCharacterEmojis(text, characterId) {
    const voice = this.getCharacterVoice(characterId);
    if (!voice || !voice.allowedEmojis) return text;

    // List of theatrical emojis to remove
    const theatricalEmojis = ['🔥', '💀', '💥', '🚀', '😭', '🌶️', '⚡', '🎯', '🥊', '🎤', '🚑'];
    
    // Remove theatrical emojis unless they're in character's allowed list
    let cleaned = text;
    theatricalEmojis.forEach(emoji => {
      if (!voice.allowedEmojis.includes(emoji)) {
        cleaned = cleaned.replace(new RegExp(emoji, 'g'), '');
      }
    });

    return cleaned.replace(/\s+/g, ' ').trim();
  }

  // Generate roast battle dialog with natural character voices
  async generateBattleDialog(battleContext, battleId) {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.createNaturalDialogSystemPrompt();
      const humanPrompt = this.createCharacterSpecificHumanPrompt(battleContext);

      logger.info('Generating natural character dialog', { battleId });

      // Generate structured dialog
      const response = await this.dialogModel.invoke([
        new SystemMessage(systemPrompt),
        new HumanMessage(humanPrompt)
      ]);

      // Clean all messages
      const cleanedResponse = {
        ...response,
        exchanges: response.exchanges.map(exchange => ({
          ...exchange,
          message: this.cleanMessage(exchange.message, 
            exchange.speaker === 'og' ? battleContext.og.id : 
            this.getCharacterIdFromRoaster(battleContext.roaster))
        }))
      };

      const processingTime = Date.now() - startTime;

      // Log AI interaction
      db.logAI(
        battleId,
        'dialog_generation',
        humanPrompt,
        JSON.stringify(cleanedResponse),
        config.openai.model,
        null,
        processingTime,
        true
      );

      logger.battle.dialogGenerated(battleId, cleanedResponse.exchanges.length, null);

      return cleanedResponse;
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

  // Judge the battle winner with natural language
  async judgeBattle(dialog, battleContext, battleId) {
    const startTime = Date.now();
    
    try {
      const systemPrompt = this.createNaturalJudgmentSystemPrompt();
      const humanPrompt = this.createJudgmentHumanPrompt(dialog, battleContext);

      logger.info('Judging battle with natural criteria', { battleId });

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

  // Natural dialog system prompt
  createNaturalDialogSystemPrompt() {
    return `You are generating authentic crypto Twitter conversations between real personalities.

CRITICAL RULES:
• Each response is MAX 3 sentences and 280 characters (Twitter limits)
• Use natural language flow, no connecting dashes or hyphens between clauses
• NO theatrical emojis unless character-specific (no 🔥💀💥🚀🌶️)
• Each character has unique voice pattern - stay in character
• Natural crypto Twitter tone, not staged performance

CHARACTER BEHAVIOR:
• 0G Team: Defend their project authentically using their unique voice patterns
• Roasters: Attack with specific criticisms using their personality styles
• Stay true to each character's established communication patterns

WRITING STYLE:
• Crypto Twitter casual: "bro", "ser", "gm", "ngmi", "fr", "lol"
• Short punchy responses like real Twitter exchanges
• Natural conversation flow between distinct personalities
• Each character speaks differently based on their role and background`;
  }

  // Character-specific human prompt
  createCharacterSpecificHumanPrompt(battleContext) {
    const { og, roaster } = battleContext;
    const ogVoice = this.getCharacterVoice(og.id);
    const roasterVoice = this.getCharacterVoice(roaster.id);

    return `Generate natural crypto Twitter conversation between these distinct personalities:

DEFENDER: ${og.name} (${og.role})
Voice Style: ${ogVoice?.style || 'Professional defender'}
Speech Pattern: ${ogVoice?.speechPattern || 'Direct responses'}
Signature Elements: ${ogVoice?.signature || 'confident tone'}
Example Response: "${ogVoice?.example || 'Nice try with that criticism'}"
Allowed Emojis: ${ogVoice?.allowedEmojis?.join(', ') || 'none'}
Key Phrases: ${ogVoice?.phrases?.slice(0, 3).join(', ') || 'strategic, vision, building'}

ATTACKER: ${roaster.name} (${roaster.role})
Voice Style: ${roasterVoice?.style || 'Critical attacker'}
Speech Pattern: ${roasterVoice?.speechPattern || 'Problem focused'}
Signature Elements: ${roasterVoice?.signature || 'skeptical tone'}
Example Attack: "${roasterVoice?.example || 'This project has issues'}"
Allowed Emojis: ${roasterVoice?.allowedEmojis?.join(', ') || 'none'}
Key Phrases: ${roasterVoice?.phrases?.slice(0, 3).join(', ') || 'problems, issues, concerns'}

ATTACK VECTORS for ${roaster.name}:
${roaster.freshTopics2025?.slice(0, 3).map(topic => `• ${topic}`).join('\n') || '• TGE delays\n• Token allocations\n• Technical issues'}

CONVERSATION RULES:
1. Max 3 sentences and 280 characters per response
2. ${roaster.name} attacks first with their signature style
3. ${og.name} defends using their unique voice pattern
4. Keep authentic to how each personality actually communicates
5. No connecting dashes, natural sentence flow
6. Use character-specific emojis only

Generate 8 exchanges total (alternating, roaster starts).`;
  }

  // Natural judgment system prompt
  createNaturalJudgmentSystemPrompt() {
    return `You are judging authentic crypto Twitter conversations between real personalities.

JUDGING STYLE:
• React naturally to what you just read
• Use crypto Twitter language naturally: "bro", "ser", "ngl", "fr", "no cap"
• Keep reasoning SHORT (2-3 sentences max)
• Sound like you're commenting on a Twitter thread, not writing formal analysis

GOOD JUDGMENTS:
✅ "Bro got absolutely cooked with that allocation math. No coming back from facts"
✅ "ngl roaster came with heat but that vision comeback hit different"
✅ "Someone check on them after that portfolio roast. Absolutely rekt"

BAD JUDGMENTS:
❌ "After careful consideration of both participants' arguments..."
❌ "The technical merits suggest a superior performance..."
❌ "Based on comprehensive analysis of the debate..."

BALANCE CONSIDERATION:
• Look at recent battle statistics to avoid one side always winning
• Sometimes the underdog lands that perfect shot
• Consider authenticity and character consistency
• Raw impact matters more than politeness

Judge like you're reacting to a spicy Twitter thread!`;
  }

  // Enhanced judgment prompt with balancing
  createJudgmentHumanPrompt(dialog, battleContext) {
    const { og, roaster } = battleContext;
    
    // Get recent battle statistics for balancing
    const recentStats = db.getRecentBattleStats(20);
    const matchupHistory = db.getCharacterMatchupHistory(og.id, roaster.id, 3);
    
    // Format exchanges for judgment
    const formattedRoasts = dialog.exchanges.map((ex, i) => {
      const speakerName = ex.speaker === 'og' ? og.name : roaster.name;
      const emoji = ex.impact >= 8 ? '🎯' : ex.impact >= 6 ? '👊' : '📝';
      return `${emoji} ${speakerName}: "${ex.message}" [Impact: ${ex.impact}/10]`;
    }).join('\n\n');

    // Create balancing context
    let balancingHint = '';
    if (recentStats.total >= 5) {
      if (recentStats.ogWinRate > 70) {
        balancingHint = `\n\nVIBE CHECK: 0G team been winning a lot lately (${recentStats.ogWinRate}% recent wins). Did roaster actually land some hits this time?`;
      } else if (recentStats.roasterWinRate > 70) {
        balancingHint = `\n\nVIBE CHECK: Roasters been cooking lately (${recentStats.roasterWinRate}% recent wins). Did 0G finally clap back?`;
      }
    }

    return `Judge this authentic crypto Twitter conversation:

DEFENDER: ${og.name} (${og.role})
Fighting Style: ${og.archetype}

ATTACKER: ${roaster.name} (${roaster.role})  
Fighting Style: ${roaster.archetype}

THE CONVERSATION:
${formattedRoasts}

CROWD REACTION:
Peak Moment: ${dialog.peakMoment}
Audience: ${dialog.audienceReaction}

RECENT STATS (last ${recentStats.total} battles):
0G Team: ${recentStats.ogWins}W-${recentStats.roasterWins}L
Roasters: ${recentStats.roasterWins}W-${recentStats.ogWins}L${balancingHint}

WHO WON? Give your authentic reaction:
- winner: 'og' if ${og.name} won, 'roaster' if ${roaster.name} won
- reasoning: Your natural Twitter-style take (2-3 sentences MAX)
- ogScore: 0-100 (how well ${og.name} defended)
- roasterScore: 0-100 (how hard ${roaster.name} attacked)
- decisiveMoment: The quote that sealed it
- crowdFavorite: 'og_dominated' or 'roaster_slayed' or 'close_fight'`;
  }

  // Helper to get roaster character ID from roaster object
  getCharacterIdFromRoaster(roaster) {
    // Map roaster names to IDs based on data structure
    const roasterIdMap = {
      'AirdropAlpha': 'airdrop_hunter',
      'FUD_Manager': 'fud_manager', 
      'DiamondHands_0G': 'moon_boy',
      'ArchMaximalist': 'tech_maxi',
      'OnceRugged': 'rug_survivor',
      'AllIn_Chad': 'degen_gambler',
      'ChainSherlock': 'onchain_detective',
      'PumpMaster3000': 'influencer_shill'
    };
    
    return roasterIdMap[roaster.name] || roaster.id || 'airdrop_hunter';
  }

  // Generate fallback dialog with character voices
  generateFallbackDialog(battleContext) {
    const { og, roaster } = battleContext;
    
    return {
      exchanges: [
        {
          speaker: 'roaster',
          message: `${og.name}, 8 months testnet grinding for 381 tokens? McDonald's pays better bro`,
          tone: 'savage',
          impact: 8
        },
        {
          speaker: 'og', 
          message: this.cleanMessage(`At least we're building real tech while you cry over free money. Stay poor`, og.id),
          tone: 'cocky',
          impact: 7
        },
        {
          speaker: 'roaster',
          message: `Building real tech by copying Monad's purple branding? Innovation at its finest ser`,
          tone: 'sarcastic', 
          impact: 9
        },
        {
          speaker: 'og',
          message: this.cleanMessage(`We're solving AI decentralization while you understand nothing about zkDark Pools`, og.id),
          tone: 'witty',
          impact: 7
        },
        {
          speaker: 'roaster',
          message: `44% insider allocation but tell me more about decentralization. Math isn't mathing fren`,
          tone: 'savage',
          impact: 9
        },
        {
          speaker: 'og',
          message: this.cleanMessage(`Your portfolio worth less than one AI Node. Focus on that instead of our success`, og.id),
          tone: 'savage',
          impact: 8
        },
        {
          speaker: 'roaster',
          message: `Ecosystem fund while community gets breadcrumbs? Even ruggers have more shame`,
          tone: 'triggered',
          impact: 8
        },
        {
          speaker: 'og',
          message: this.cleanMessage(`Imagine being salty about missing AI revolution. Have fun staying poor while we build`, og.id),
          tone: 'cocky',
          impact: 7
        }
      ],
      peakMoment: 'The allocation math callout hit different',
      audienceReaction: 'Chat went quiet for a moment processing that math'
    };
  }

  // Generate fallback judgment
  generateFallbackJudgment() {
    const randomWinner = Math.random() > 0.5;
    return {
      winner: randomWinner ? 'og' : 'roaster',
      reasoning: randomWinner 
        ? "0G came with big vision energy and roaster couldn't handle the future talk. That portfolio diss was clean"
        : "Roaster exposed the allocation math and 0G had no comeback. Sometimes facts hit harder than dreams",
      ogScore: randomWinner ? 85 : 72,
      roasterScore: randomWinner ? 78 : 88,
      decisiveMoment: randomWinner 
        ? "Your portfolio worth less than one AI Node"
        : "44% insider allocation but tell me more about decentralization",
      crowdFavorite: Math.abs(85 - 78) < 10 ? 'close_fight' : (randomWinner ? 'og_dominated' : 'roaster_slayed')
    };
  }

  // Validate roast format
  validateRoast(message) {
    const sentences = message.split(/[.!?]+/).filter(s => s.trim());
    const charCount = message.length;
    
    return {
      isValid: sentences.length <= 3 && charCount <= 280,
      sentences: sentences.length,
      charCount,
      tooLong: sentences.length > 3 || charCount > 280
    };
  }
}

// Export singleton instance
module.exports = new AIService();