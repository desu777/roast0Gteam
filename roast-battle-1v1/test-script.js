// test-battle.js - Skrypt testowy dla systemu bitew
const io = require('socket.io-client');
const axios = require('axios');

const API_URL = 'http://localhost:3002';
const WS_URL = 'http://localhost:3002';

// Test configuration
const TEST_WALLET_1 = '0x1234567890123456789012345678901234567890';
const TEST_WALLET_2 = '0x0987654321098765432109876543210987654321';

// Generate valid test transaction hash (66 characters)
function generateTestTxHash() {
  const randomHex = Math.random().toString(16).substring(2) + 
                   Math.random().toString(16).substring(2) + 
                   Math.random().toString(16).substring(2);
  return '0x' + randomHex.padEnd(64, '0').substring(0, 64);
}

class BattleSystemTester {
  constructor() {
    this.socket = null;
    this.currentBattle = null;
  }

  // Connect to WebSocket
  async connectWebSocket() {
    console.log('🔌 Connecting to WebSocket...');
    
    return new Promise((resolve, reject) => {
      this.socket = io(WS_URL, {
        transports: ['websocket'],
        reconnection: true
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected:', this.socket.id);
        this.setupEventListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error.message);
        reject(error);
      });
    });
  }

  // Setup event listeners
  setupEventListeners() {
    // Battle events
    this.socket.on('battle_created', (data) => {
      console.log('🎯 Battle created:', data);
      this.currentBattle = data;
    });

    this.socket.on('bet_placed', (data) => {
      console.log('💰 Bet placed:', {
        player: data.playerAddress.substring(0, 10) + '...',
        side: data.betSide,
        amount: data.betAmount
      });
    });

    this.socket.on('countdown_started', (data) => {
      console.log('⏱️  Countdown started:', data.duration + ' seconds');
    });

    this.socket.on('countdown_tick', (data) => {
      if (data.secondsRemaining % 10 === 0 || data.secondsRemaining <= 5) {
        console.log('⏰ Countdown:', data.secondsRemaining + 's');
      }
    });

    this.socket.on('battle_generating', (data) => {
      console.log('🤖 AI generating dialog...');
    });

    this.socket.on('dialog_exchange', (data) => {
      const speaker = data.exchange.speaker === 'og' ? '🔵' : '🔴';
      console.log(`${speaker} ${data.exchange.speaker}: "${data.exchange.message}"`);
      console.log(`   [${data.exchange.tone}, Impact: ${data.exchange.impact}/10]`);
    });

    this.socket.on('battle_complete', (data) => {
      console.log('🏆 Battle complete!');
      console.log('Winner:', data.winner);
      console.log('Reasoning:', data.reasoning);
      console.log('Scores:', data.scores);
      console.log('Payouts:', data.payouts);
    });

    this.socket.on('error', (data) => {
      console.error('❌ Error:', data);
    });
  }

  // Join battle room
  async joinBattleRoom() {
    console.log('🚪 Joining battle room...');
    
    return new Promise((resolve) => {
      this.socket.emit('join_battle_room');
      
      this.socket.once('joined_battle_room', (data) => {
        console.log('✅ Joined battle room:', data.message);
        console.log('📊 Connected users:', data.connectedUsers);
        resolve(data);
      });
    });
  }

  // Get current battle via API
  async getCurrentBattle() {
    try {
      console.log('📡 Fetching current battle...');
      const response = await axios.get(`${API_URL}/api/battle/current`);
      console.log('✅ Current battle:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get current battle:', error.message);
      throw error;
    }
  }

  // Place a bet via API
  async placeBet(playerAddress, betSide, amount = 0.5) {
    try {
      console.log(`💸 Placing bet: ${playerAddress} bets ${amount} on ${betSide}`);
      
      const response = await axios.post(`${API_URL}/api/battle/bet`, {
        playerAddress,
        betSide,
        betAmount: amount,
        txHash: generateTestTxHash()
      });
      
      console.log('✅ Bet placed successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Failed to place bet:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get player stats
  async getPlayerStats(address) {
    try {
      const response = await axios.get(`${API_URL}/api/battle/stats/${address}`);
      console.log(`📊 Stats for ${address.substring(0, 10)}...:`);
      console.log(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get stats:', error.message);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard() {
    try {
      const response = await axios.get(`${API_URL}/api/battle/leaderboard`);
      console.log('🏆 Leaderboard:');
      response.data.data.forEach((player, index) => {
        console.log(`${index + 1}. ${player.player_address.substring(0, 10)}... - ${player.total_winnings} 0G (${player.win_rate}% win rate)`);
      });
      return response.data.data;
    } catch (error) {
      console.error('❌ Failed to get leaderboard:', error.message);
      throw error;
    }
  }

  // Run complete test scenario
  async runTestScenario() {
    console.log('\n🎮 Starting Battle System Test Scenario\n');

    try {
      // 1. Connect to WebSocket
      await this.connectWebSocket();
      await this.joinBattleRoom();

      // 2. Get current battle
      const battle = await this.getCurrentBattle();
      console.log('\n📋 Battle Setup:');
      console.log(`OG: ${battle.ogCharacter.name} (${battle.ogCharacter.role})`);
      console.log(`Roaster: ${battle.roasterCharacter.name} (${battle.roasterCharacter.role})`);

      // 3. Place bets from both sides
      console.log('\n💰 Placing bets...');
      await this.placeBet(TEST_WALLET_1, 'og');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.placeBet(TEST_WALLET_2, 'roaster');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Wait for battle to complete
      console.log('\n⏳ Waiting for battle to complete...');
      console.log('(This will take ~2 minutes for countdown + dialog generation)');

      // Wait for battle completion
      await new Promise((resolve) => {
        this.socket.once('battle_complete', () => {
          resolve();
        });
      });

      // 5. Get final stats
      console.log('\n📊 Final Statistics:');
      await this.getPlayerStats(TEST_WALLET_1);
      await this.getPlayerStats(TEST_WALLET_2);
      
      console.log('\n🏆 Updated Leaderboard:');
      await this.getLeaderboard();

      console.log('\n✅ Test scenario completed successfully!');

    } catch (error) {
      console.error('\n❌ Test scenario failed:', error.message);
    } finally {
      // Disconnect
      if (this.socket) {
        this.socket.disconnect();
        console.log('\n👋 Disconnected from server');
      }
    }
  }

  // Interactive test mode
  async runInteractive() {
    console.log('\n🎮 Interactive Battle System Test\n');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query) => new Promise(resolve => readline.question(query, resolve));

    try {
      await this.connectWebSocket();
      await this.joinBattleRoom();

      while (true) {
        console.log('\n📋 Choose action:');
        console.log('1. Get current battle');
        console.log('2. Place bet');
        console.log('3. Get player stats');
        console.log('4. Get leaderboard');
        console.log('5. Exit');

        const choice = await question('\nYour choice (1-5): ');

        switch (choice) {
          case '1':
            await this.getCurrentBattle();
            break;
            
          case '2':
            const address = await question('Wallet address: ');
            const side = await question('Bet side (og/roaster): ');
            await this.placeBet(address || TEST_WALLET_1, side || 'og');
            break;
            
          case '3':
            const statsAddress = await question('Wallet address: ');
            await this.getPlayerStats(statsAddress || TEST_WALLET_1);
            break;
            
          case '4':
            await this.getLeaderboard();
            break;
            
          case '5':
            console.log('👋 Goodbye!');
            readline.close();
            this.socket.disconnect();
            return;
            
          default:
            console.log('Invalid choice');
        }
      }
    } catch (error) {
      console.error('Error:', error.message);
      readline.close();
    }
  }
}

// Main execution
if (require.main === module) {
  const tester = new BattleSystemTester();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    tester.runInteractive();
  } else {
    tester.runTestScenario();
  }
}

module.exports = BattleSystemTester;