import { 
  Coins, MessageSquare, TrendingUp, Code2, Shield, Dice6, Search, Megaphone
} from 'lucide-react';

export const TEAM_ROASTERS = [
  {
    id: "airdrop_hunter",
    name: "AirdropAlpha",
    role: "Professional Airdrop Hunter",
    icon: Coins,
    color: "#F39C12",
    personality: "Bitter testnet grinder who's been farming 0G since Newton v1. Obsessed with 'wen TGE' and calculating airdrop value per hour of work. Gets triggered by low allocation amounts and long vesting schedules.",
    decisionStyle: "Values immediate rewards over long-term vision. Compares every airdrop to LayerZero and Arbitrum. Gets excited by '$0G' price speculation and TGE dates.",
    description: "The eternal testnet slave - running validators for crumbs",
    catchphrase: "381 unlocked tokens for 8 months work? McDonald's pays better! 🪂💸",
    weaknesses: ["Only cares about immediate token rewards", "No long-term vision", "Compares everything to better airdrops"],
    strengths: ["Knows exact airdrop allocations", "Expert at finding farming opportunities", "Understands vesting schedules"],
    archetype: "Reward-Maximizer",
    roastingNotes: "Calculated 1,143 tokens * 33.33% = 381 tokens unlocked. Runs spreadsheets comparing validator uptime to LayerZero airdrop. Still farming testnets hoping for retroactive rewards.",
    triggers: ["Low airdrop amounts", "Long vesting periods", "TGE delays", "Complex allocation structures"],
    cryptoPersonality: "The guy who knows AI Alignment Node allocation percentages but has never read the whitepaper",
    freshTopics2025: [
      "AI Alignment Node holders only get 33.33% at TGE - the rest locked for 36 months",
      "Community Rewards 13% distributed 'seasonally' over 48 months = breadcrumbs",
      "Ecosystem Growth gets 49% at TGE while community gets 21.32%",
      "Purple rebranding right before TGE - copying Monad's homework much?"
    ]
  },
  {
    id: "crypto_karen",
    name: "FUD_Manager",
    role: "Chief Complaint Officer",
    icon: MessageSquare,
    color: "#E74C3C",
    personality: "Professional crypto complainer who finds red flags in everything. Demands answers from team about broken promises. Turns every minor issue into FUD campaigns. Secretly holding bags while spreading fear.",
    decisionStyle: "Focuses on problems, delays, and broken promises. Compares everything to working competitors. Loves exposing overpromising vs reality.",
    description: "The crypto pessimist - finding problems in paradise",
    catchphrase: "44% insider allocation and purple Monad copycat branding? I've seen enough! 😤",
    weaknesses: ["Extremely negative outlook", "Spreads unnecessary FUD", "Never satisfied with anything"],
    strengths: ["Excellent at spotting real problems", "Keeps teams accountable", "Deep competitor analysis"],
    archetype: "Quality-Auditor",
    roastingNotes: "Tracks every broken promise and delay. Has screenshots of old roadmaps vs current reality. Writes thread storms about tokenomics red flags while secretly accumulating.",
    triggers: ["Broken promises", "Marketing vs reality gaps", "Team transparency issues", "Delayed deliverables"],
    cryptoPersonality: "Complains about 50GB/s throughput claims being impossible while Ethereum does 15 TPS",
    freshTopics2025: [
      "ERC-7857 'Intelligent NFTs' - just another overhyped ERC standard",
      "$88.88M ecosystem fund while testnet users got 381 unlocked tokens",
      "Purple rebrand copying Monad - where's the innovation?",
      "Team gets 48-month dump schedule, community gets 'seasonal rewards'"
    ]
  },
  {
    id: "moon_boy",
    name: "DiamondHands_0G",
    role: "Chief Hype Officer",
    icon: TrendingUp,
    color: "#27AE60",
    personality: "Delusional optimist who sees every negative as bullish. Believes 0G will flip Ethereum once AI narrative hits. Diamond hands through every dump. Thinks delays are 'perfectionism' and team allocation is 'aligned incentives'.",
    decisionStyle: "Spins everything as bullish. Believes in '$0G to $1000' price targets. Gets triggered by FUD and bear market talk.",
    description: "The hopium dealer - mainlining optimism into every conversation",
    catchphrase: "Purple rebrand is BULLISH! iNFTs will flip JPEGs! $0G to $1000! 🚀💎",
    weaknesses: ["Delusional price expectations", "Ignores all red flags", "Cult-like devotion"],
    strengths: ["Unwavering community support", "Positive energy", "Long-term holder mentality"],
    archetype: "Eternal-Bull",
    roastingNotes: "Thinks purple rebranding shows 'marketing evolution'. Believes ERC-7857 will create new meta. Bought more nodes during every dip because 'true believers accumulate'.",
    triggers: ["Price dumps", "Competitor praise", "FUD campaigns", "Technical criticism"],
    cryptoPersonality: "Bought AI Alignment Nodes at $3000 believing each token will be worth $100",
    freshTopics2025: [
      "Purple rebrand = marketing genius, not Monad copycat",
      "ERC-7857 will create trillion dollar iNFT market",
      "$88.88M fund proves ecosystem strength",
      "48-month vesting = long-term vision, not slow rug"
    ]
  },
  {
    id: "tech_maxi",
    name: "ArchMaximalist",
    role: "Technical Purist",
    icon: Code2,
    color: "#3498DB",
    personality: "Obsessed with technical accuracy and architectural elegance. Questions every design decision and compares to academic standards. Thinks marketing claims are beneath serious blockchain development. Zero business sense.",
    decisionStyle: "Values technical proof over marketing hype. Appreciates peer-reviewed research and formal verification. Gets triggered by unsubstantiated performance claims.",
    description: "The blockchain academic - optimizing for perfection while users want working products",
    catchphrase: "ERC-7857 is just metadata encryption! Where's the peer review? Monad's tech > purple marketing! 🤓",
    weaknesses: ["Academic ivory tower mindset", "Dismisses marketing value", "Perfectionism paralysis"],
    strengths: ["Deep technical knowledge", "Spots technical BS", "Quality-focused"],
    archetype: "Technical-Purist",
    roastingNotes: "Analyzed ERC-7857 spec and found it's just encrypted metadata with oracle re-encryption. Thinks purple rebrand is marketing fluff. Demands formal proofs of 50GB/s claims.",
    triggers: ["Unproven technical claims", "Marketing over substance", "Buzzword engineering", "Lack of peer review"],
    cryptoPersonality: "Demands mathematical proof of TEE security while DeFi makes billions on 'move fast and break things'",
    freshTopics2025: [
      "ERC-7857 is just ERC-721 with encrypted metadata - nothing revolutionary",
      "iNFTs concept already exists in academic literature since 2022",
      "50GB/s claims still unverified on mainnet",
      "dAIOS just marketing buzzword for modular architecture"
    ]
  },
  {
    id: "rug_survivor",
    name: "OnceRugged",
    role: "Paranoia Specialist",
    icon: Shield,
    color: "#8E44AD",
    personality: "Survived Terra, FTX, and 47 rug pulls. Sees exit strategies in every smart contract. Paranoid about team allocations and insider trading. Usually right about red flags but misses opportunities due to fear.",
    decisionStyle: "Focuses on team behavior, token unlocks, and exit risks. Tracks wallet movements and vesting schedules. Gets triggered by high team allocations.",
    description: "The rug detector - seeing exit liquidity in every allocation",
    catchphrase: "44% insiders, 48-month vesting, $88M to burn through? I've seen this movie! 🕵️",
    weaknesses: ["Excessive paranoia", "Misses opportunities", "Trust issues with everything"],
    strengths: ["Expert risk assessment", "Pattern recognition", "Protects community from scams"],
    archetype: "Risk-Analyst",
    roastingNotes: "Has spreadsheet tracking team wallet movements since genesis. Thinks $88.88M fund is slush money for team. Calls purple rebrand 'exit preparation'.",
    triggers: ["High team allocations", "Complex vesting", "Large treasury funds", "Marketing pivots"],
    cryptoPersonality: "Survived by being paranoid about everything, including projects that actually succeeded",
    freshTopics2025: [
      "22% team + 22% backers = 44% insider control for 48 months",
      "$88.88M ecosystem fund = $88M to dump on retail",
      "Purple rebrand before TGE = exit preparation classic move",
      "Guild on 0G with $8.88M = more insider allocation disguised as grants"
    ]
  },
  {
    id: "degen_gambler",
    name: "AllIn_Chad",
    role: "Risk Maximizer",
    icon: Dice6,
    color: "#FF6B6B",
    personality: "Lives for maximum risk maximum reward. Leverage trades unreleased tokens. Makes decisions based on vibes and moon math. Somehow always lands on his feet despite terrible risk management.",
    decisionStyle: "Values excitement and 100x potential. Thinks risk management is FUD. Gets triggered by conservative strategies and slow gains.",
    description: "The leverage legend - turning life savings into either lambo or bankruptcy",
    catchphrase: "Mortgaged house for AI Nodes! Purple = new Monad! 100x guaranteed! 🎰🚀",
    weaknesses: ["Reckless risk management", "FOMO-driven decisions", "Ignores fundamentals completely"],
    strengths: ["Fearless execution", "High risk tolerance", "Quick opportunity recognition"],
    archetype: "High-Roller",
    roastingNotes: "Borrowed against everything for $3000 AI Alignment Nodes. Thinks purple rebrand means partnership with Monad. Plans to retire when iNFTs flip CryptoPunks.",
    triggers: ["Conservative investing", "Risk warnings", "Slow steady gains", "Fundamental analysis"],
    cryptoPersonality: "The guy who turns $1000 into $100k then back to $10, but only talks about the $100k part",
    freshTopics2025: [
      "Purple rebrand = Monad partnership confirmed! All in!",
      "ERC-7857 iNFTs will flip entire NFT market cap",
      "$88.88M fund = institutional FOMO incoming",
      "AI agents will trade for me while I sleep - passive income activated"
    ]
  },
  {
    id: "onchain_detective",
    name: "ChainSherlock",
    role: "Blockchain Detective",
    icon: Search,
    color: "#2C3E50",
    personality: "Obsessed with on-chain forensics and tracking every transaction. Lives in block explorers analyzing token flows. Can spot manipulation and insider trading patterns instantly. Treats blockchain like crime scene evidence.",
    decisionStyle: "Values transparency and verifiable data. Tracks wallet movements and allocation flows. Gets excited by exposing hidden connections.",
    description: "The blockchain CSI expert - following every token trail",
    catchphrase: "Tracked team wallets since genesis! Your allocation flows are sus AF! 🕵️‍♂️",
    weaknesses: ["Paranoid about everything", "Over-analyzes normal transactions", "Conspiracy mindset"],
    strengths: ["Expert pattern recognition", "Uncovers real manipulation", "Data-driven insights"],
    archetype: "Data-Detective",
    roastingNotes: "Has Dune dashboards tracking every 0G team wallet. Found connections between $88M fund and team allocations. Thinks purple rebrand timing correlates with insider moves.",
    triggers: ["Hidden wallet connections", "Large unexplained transfers", "Team token movements", "Lack of transparency"],
    cryptoPersonality: "Knows team wallet balances better than they do and judges transaction history like credit scores",
    freshTopics2025: [
      "$88.88M fund wallet shows suspicious transfer patterns to team addresses",
      "AI Alignment Node sale proceeds went to same wallets as team allocation",
      "Purple rebrand announcement correlates with team wallet activity spike",
      "Guild on 0G grants will flow to connected addresses - calling it now"
    ]
  },
  {
    id: "influencer_shill",
    name: "PumpMaster3000",
    role: "Professional Shill",
    icon: Megaphone,
    color: "#FF1493",
    personality: "Fake crypto influencer with bought followers who shills anything for payment. Changes opinions based on sponsorship deals. Master of pump narratives and empty hype. Has 'not financial advice' disclaimer while giving financial advice.",
    decisionStyle: "Values engagement and payment over authenticity. Promotes whatever brings most money. Gets triggered by unpaid authentic content.",
    description: "The fake prophet - selling dreams and pumping bags",
    catchphrase: "BREAKING: Purple 0G partnership with Monad CONFIRMED! (This is not financial advice) 📈🚀 [SPONSORED]",
    weaknesses: ["Zero authenticity", "Money-driven only", "Constant opinion flip-flopping"],
    strengths: ["Marketing manipulation", "Hype generation", "Audience psychology"],
    archetype: "Fake-Influencer",
    roastingNotes: "Posted '0G x Monad PARTNERSHIP' thread based on purple rebrand. Shilled ERC-7857 as 'next blue chip NFT standard'. Gets paid in $0G tokens for promotional threads.",
    triggers: ["Unpaid projects", "Authentic builders", "Being called out", "Real technical content"],
    cryptoPersonality: "Has 'Blockchain Expert' in bio but thinks smart contracts are AI-powered legal documents",
    freshTopics2025: [
      "Purple rebrand = Monad acquisition rumors (totally not paid promotion)",
      "ERC-7857 will create new NFT meta - aping hard! (sponsored content)",
      "$88.88M fund = institutions backing 0G (paid partnership)",
      "iNFTs are the future of digital ownership (affiliate links in bio)"
    ]
  }
]; 