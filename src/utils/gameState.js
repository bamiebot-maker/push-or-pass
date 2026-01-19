// Simple game state management with SIMULATED community data
const getToday = () => new Date().toISOString().split('T')[0];

// Base state for each user
let userState = {
  votes: [],
  outcomes: [],
  todaysConfig: {
    behavior: 'help_community',
    maxClicks: null,
    difficulty: 'normal',
    description: 'Each click adds 1 to community score'
  },
  dailyStats: {
    totalClicks: 0,
    uniquePlayers: 0,
    communityScore: 0,
    todaysDate: getToday()
  },
  lastResetDate: getToday()
};

// SIMULATED community data (for MVP demo)
// In a real app, this would come from a database
const simulatedCommunityData = {
  // Simulated community votes (randomized)
  getCommunityVotes: () => {
    const today = getToday();
    return {
      help_community: Math.floor(Math.random() * 50) + 30,
      make_harder: Math.floor(Math.random() * 40) + 20,
      limit_clicks: Math.floor(Math.random() * 60) + 10,
      total: Math.floor(Math.random() * 150) + 50
    };
  },
  
  // Simulated community stats
  getCommunityStats: () => {
    return {
      communityScore: Math.floor(Math.random() * 1000) + 500,
      totalClicks: Math.floor(Math.random() * 2000) + 1000,
      uniquePlayers: Math.floor(Math.random() * 100) + 50
    };
  },
  
  // Simulated leaderboard
  getCommunityLeaderboard: () => {
    const players = [];
    const names = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Drew', 'Sam', 'Jamie'];
    
    for (let i = 0; i < 10; i++) {
      players.push({
        userId: `user_${names[i]}_${Math.random().toString(36).substr(2, 5)}`,
        clicks: Math.floor(Math.random() * 500) + 100,
        score: Math.floor(Math.random() * 750) + 250
      });
    }
    
    return players.sort((a, b) => b.clicks - a.clicks);
  }
};

// Load user state from localStorage
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('pushOrPassUserState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      const today = getToday();
      
      // Reset if it's a new day
      if (parsed.lastResetDate !== today) {
        // Apply yesterday's votes (simulated community result)
        applyVotesToConfig();
        parsed.dailyStats = {
          totalClicks: 0,
          uniquePlayers: 0,
          communityScore: 0,
          todaysDate: today
        };
        parsed.lastResetDate = today;
      }
      userState = parsed;
    } catch (e) {
      console.log('Failed to load user state');
    }
  }
}

function applyVotesToConfig() {
  // Use simulated community votes to decide config
  const communityVotes = simulatedCommunityData.getCommunityVotes();
  
  // Determine winning option from simulated community
  let winningOption = 'help_community';
  let maxVotes = 0;
  
  if (communityVotes.help_community > maxVotes) {
    maxVotes = communityVotes.help_community;
    winningOption = 'help_community';
  }
  if (communityVotes.make_harder > maxVotes) {
    maxVotes = communityVotes.make_harder;
    winningOption = 'make_harder';
  }
  if (communityVotes.limit_clicks > maxVotes) {
    winningOption = 'limit_clicks';
  }
  
  switch(winningOption) {
    case 'help_community':
      userState.todaysConfig = {
        behavior: 'help_community',
        maxClicks: null,
        difficulty: 'easy',
        description: 'Each click adds 2 to community score'
      };
      break;
    case 'make_harder':
      userState.todaysConfig = {
        behavior: 'make_harder',
        maxClicks: null,
        difficulty: 'hard',
        description: 'Each click adds only 0.5 to community score'
      };
      break;
    case 'limit_clicks':
      userState.todaysConfig = {
        behavior: 'limit_clicks',
        maxClicks: 50,
        difficulty: 'normal',
        description: 'Limited to 50 total clicks today'
      };
      break;
  }
}

function saveUserState() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pushOrPassUserState', JSON.stringify(userState));
  }
}

// Public API
export function getGameState() {
  const today = getToday();
  if (userState.lastResetDate !== today) {
    applyVotesToConfig();
    userState.dailyStats = {
      totalClicks: 0,
      uniquePlayers: 0,
      communityScore: 0,
      todaysDate: today
    };
    userState.lastResetDate = today;
    saveUserState();
  }
  return userState;
}

export function submitVote(userId, voteOption) {
  const today = getToday();
  const state = getGameState();
  
  // Check if already voted today
  const alreadyVoted = state.votes.some(v => v.userId === userId && v.date === today);
  if (alreadyVoted) return false;
  
  state.votes.push({
    userId,
    voteOption,
    date: today,
    timestamp: new Date().toISOString()
  });
  
  saveUserState();
  return true;
}

export function recordClick(userId) {
  const state = getGameState();
  const today = getToday();
  
  // Check max clicks
  if (state.todaysConfig.maxClicks && state.dailyStats.totalClicks >= state.todaysConfig.maxClicks) {
    return { success: false, message: 'Daily click limit reached!' };
  }
  
  // Calculate points
  let points = 1;
  if (state.todaysConfig.difficulty === 'easy') points = 2;
  if (state.todaysConfig.difficulty === 'hard') points = 0.5;
  
  // Check if new player today
  const isNewPlayer = !state.outcomes.some(o => o.userId === userId && o.date === today);
  if (isNewPlayer) {
    state.dailyStats.uniquePlayers++;
  }
  
  // Update stats
  state.dailyStats.totalClicks++;
  state.dailyStats.communityScore += points;
  
  // Record outcome
  state.outcomes.push({
    userId,
    date: today,
    timestamp: new Date().toISOString(),
    points,
    config: state.todaysConfig.behavior
  });
  
  saveUserState();
  
  return {
    success: true,
    points,
    totalScore: state.dailyStats.communityScore,
    totalClicks: state.dailyStats.totalClicks,
    uniquePlayers: state.dailyStats.uniquePlayers,
    config: state.todaysConfig
  };
}

// Combine user data with simulated community data
export function getVoteStats() {
  const state = getGameState();
  const today = getToday();
  const userVotesToday = state.votes.filter(v => v.date === today);
  
  // Get simulated community votes
  const communityVotes = simulatedCommunityData.getCommunityVotes();
  
  // Combine user votes with community (for demo)
  const combinedCounts = {
    help_community: communityVotes.help_community + userVotesToday.filter(v => v.voteOption === 'help_community').length,
    make_harder: communityVotes.make_harder + userVotesToday.filter(v => v.voteOption === 'make_harder').length,
    limit_clicks: communityVotes.limit_clicks + userVotesToday.filter(v => v.voteOption === 'limit_clicks').length
  };
  
  let winning = 'help_community';
  let max = 0;
  for (const [option, count] of Object.entries(combinedCounts)) {
    if (count > max) {
      max = count;
      winning = option;
    }
  }
  
  return {
    counts: combinedCounts,
    winning,
    total: communityVotes.total + userVotesToday.length,
    userVoted: userVotesToday.length > 0
  };
}

export function getLeaderboard() {
  const state = getGameState();
  const userPlayers = {};
  
  // Get user's own outcomes
  state.outcomes.forEach(outcome => {
    if (!userPlayers[outcome.userId]) {
      userPlayers[outcome.userId] = {
        userId: outcome.userId,
        clicks: 0,
        score: 0,
        isCurrentUser: true
      };
    }
    userPlayers[outcome.userId].clicks++;
    userPlayers[outcome.userId].score += outcome.points;
  });
  
  // Get simulated community leaderboard
  const communityPlayers = simulatedCommunityData.getCommunityLeaderboard();
  
  // Combine and sort (community players first, then user)
  const allPlayers = [...communityPlayers];
  
  Object.values(userPlayers).forEach(userPlayer => {
    // Check if user already in list
    const exists = allPlayers.some(p => p.userId === userPlayer.userId);
    if (!exists) {
      allPlayers.push(userPlayer);
    }
  });
  
  return allPlayers
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)
    .map((player, index) => ({
      ...player,
      rank: index + 1,
      displayName: player.userId.includes('user_') 
        ? player.userId.split('_')[1] || 'Player'
        : player.userId.substring(0, 8)
    }));
}

export function getCommunityStats() {
  const userState = getGameState();
  const communityStats = simulatedCommunityData.getCommunityStats();
  
  // Combine user stats with community stats
  return {
    communityScore: communityStats.communityScore + userState.dailyStats.communityScore,
    totalClicks: communityStats.totalClicks + userState.dailyStats.totalClicks,
    uniquePlayers: communityStats.uniquePlayers + (userState.dailyStats.uniquePlayers > 0 ? 1 : 0),
    isSimulated: true // Flag to indicate this is simulated data
  };
}
