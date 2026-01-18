/**
 * Daily Reset Utilities for Push or Pass game
 */

export const shouldResetDaily = (lastReset) => {
  if (!lastReset) return true;
  
  const today = new Date().toISOString().split('T')[0];
  const lastResetDate = new Date(lastReset).toISOString().split('T')[0];
  
  return today !== lastResetDate;
};

export const applyDailyReset = () => {
  const today = new Date().toISOString().split('T')[0];
  
  // Reset daily voting
  localStorage.removeItem('hasVotedToday');
  
  // Get yesterday's votes to determine today's game mode
  const votes = JSON.parse(localStorage.getItem('pushpass_votes') || '[]');
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const yesterdayVotes = votes.filter(v => v.date === yesterdayStr);
  
  // Determine winning vote from yesterday
  let winningOption = 1; // Default to option 1
  
  if (yesterdayVotes.length > 0) {
    const voteCounts = { 1: 0, 2: 0, 3: 0 };
    yesterdayVotes.forEach(v => {
      voteCounts[v.option] = (voteCounts[v.option] || 0) + 1;
    });
    
    winningOption = Object.keys(voteCounts).reduce((a, b) => 
      voteCounts[a] > voteCounts[b] ? parseInt(a) : parseInt(b)
    );
  }
  
  // Set today's game configuration based on winning vote
  let todaysConfig;
  switch(winningOption) {
    case 1:
      todaysConfig = {
        mode: 'help',
        description: 'Help the community: Each push adds +2 points for everyone',
        multiplier: 2,
        basePoints: 1,
        maxPushes: 50
      };
      break;
    case 2:
      todaysConfig = {
        mode: 'hard',
        description: 'Make it harder: Button requires more effort but gives +5 bonus points',
        multiplier: 1,
        basePoints: 5,
        maxPushes: 30
      };
      break;
    case 3:
      todaysConfig = {
        mode: 'limited',
        description: 'Limit clicks: Each player gets limited pushes (25 max)',
        multiplier: 1.5,
        basePoints: 2,
        maxPushes: 25
      };
      break;
    default:
      todaysConfig = {
        mode: 'help',
        description: 'Help the community: Each push adds +2 points for everyone',
        multiplier: 2,
        basePoints: 1,
        maxPushes: 50
      };
  }
  
  // Save today's configuration
  localStorage.setItem('pushpass_todaysConfig', JSON.stringify(todaysConfig));
  localStorage.setItem('pushpass_configDate', today);
  
  // Reset daily push counter
  const gameState = JSON.parse(localStorage.getItem('pushpass_gameState') || '{}');
  gameState.todaysPushes = 0;
  gameState.maxPushesToday = todaysConfig.maxPushes;
  localStorage.setItem('pushpass_gameState', JSON.stringify(gameState));
  
  // Archive yesterday's outcomes
  archiveYesterdayOutcomes();
  
  console.log(`Daily reset applied. Today's mode: ${todaysConfig.mode}`);
  return todaysConfig;
};

export const archiveYesterdayOutcomes = () => {
  const outcomes = JSON.parse(localStorage.getItem('pushpass_outcomes') || '[]');
  const today = new Date().toISOString().split('T')[0];
  
  if (outcomes.length > 0) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const yesterdayOutcomes = outcomes.filter(o => o.date === yesterdayStr);
    
    if (yesterdayOutcomes.length > 0) {
      // In a real app, you would send this to a backend
      console.log(`Archiving ${yesterdayOutcomes.length} outcomes from ${yesterdayStr}`);
    }
  }
};

export const getCurrentPhase = () => {
  const hasVotedToday = localStorage.getItem('hasVotedToday');
  const lastReset = localStorage.getItem('lastReset');
  const today = new Date().toISOString().split('T')[0];
  
  if (!lastReset || lastReset !== today) {
    return 'vote';
  }
  
  return hasVotedToday ? 'play' : 'vote';
};
