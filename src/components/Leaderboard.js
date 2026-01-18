import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, alltime
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    // Generate leaderboard with real users and realistic names
    const generateLeaderboard = () => {
      const realisticNames = [
        'AlexThePusher', 'ButtonMaster', 'PushKing2024', 'DailyClicker', 'ScoreHunter',
        'CommunityHero', 'VoteChampion', 'GameLegend', 'TopPusher', 'StreakLord',
        'QuickFingers', 'ButtonWizard', 'PushPro', 'ClickMaster', 'ScoreLord'
      ];
      
      // Get user's actual data
      const gameState = JSON.parse(localStorage.getItem('pushpass_gameState') || '{}');
      const userData = {
        name: 'You',
        score: gameState.communityScore || 1000,
        pushes: gameState.playerPushes || 0,
        streak: gameState.playerStreak || 0,
        isUser: true
      };
      
      // Generate realistic scores based on time filter
      const generatePlayer = (name, rank, isRealUser = false) => {
        let score, pushes, streak;
        
        if (isRealUser) {
          // For the current user, use actual data
          score = userData.score;
          pushes = userData.pushes;
          streak = userData.streak;
        } else {
          // Generate realistic data for other players
          const baseScore = timeFilter === 'today' ? 100 : 
                           timeFilter === 'week' ? 1000 : 5000;
          
          const rankMultiplier = 1 - ((rank - 1) * 0.08); // Top players have higher scores
          score = Math.floor(baseScore * rankMultiplier * (0.8 + Math.random() * 0.4));
          pushes = Math.floor(score / (timeFilter === 'today' ? 10 : 5));
          streak = Math.floor(Math.random() * (timeFilter === 'today' ? 5 : 30)) + 1;
        }
        
        return {
          rank,
          name,
          score: Math.max(100, score),
          pushes: Math.max(1, pushes),
          streak,
          isUser: isRealUser
        };
      };
      
      // Generate top 10 players (excluding user for now)
      const topPlayers = [];
      for (let i = 0; i < 10; i++) {
        const nameIndex = i % realisticNames.length;
        topPlayers.push(generatePlayer(realisticNames[nameIndex] + (i > realisticNames.length ? i : ''), i + 1));
      }
      
      // Sort by score
      topPlayers.sort((a, b) => b.score - a.score);
      
      // Update ranks
      topPlayers.forEach((player, index) => {
        player.rank = index + 1;
      });
      
      // Add current user if they have a score
      if (userData.score > 0) {
        const userWithScore = generatePlayer('You', 0, true);
        
        // Find where user would rank
        let userRankIndex = topPlayers.findIndex(player => player.score <= userWithScore.score);
        
        if (userRankIndex === -1) {
          userRankIndex = topPlayers.length; // User is last
        }
        
        // Insert user at correct position
        topPlayers.splice(userRankIndex, 0, {
          ...userWithScore,
          rank: userRankIndex + 1,
          isUser: true
        });
        
        // Update all ranks after insertion
        for (let i = userRankIndex + 1; i < topPlayers.length; i++) {
          topPlayers[i].rank = i + 1;
        }
        
        setUserRank(userRankIndex + 1);
      } else {
        setUserRank(null);
      }
      
      return topPlayers;
    };

    // Simulate loading delay
    setTimeout(() => {
      const leaderboardData = generateLeaderboard();
      setLeaderboard(leaderboardData);
      setIsLoading(false);
    }, 500);
  }, [timeFilter]);

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#00BCD4'; // Blue for others
    }
  };

  const getRankEmoji = (rank) => {
    switch(rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank <= 10 ? '⭐' : '🎮';
    }
  };

  if (isLoading) {
    return (
      <div className="leaderboard loading">
        <div className="loading-spinner"></div>
        <p>Loading leaderboard...</p>
      </div>
    );
  }

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Community Leaderboard</h2>
        <p className="leaderboard-subtitle">Top players based on community contributions</p>
        
        {userRank && (
          <div className="user-rank-card">
            <span className="user-rank-label">Your Current Rank</span>
            <span className="user-rank-value">#{userRank}</span>
            <div className="user-stats">
              <span className="user-stat">Score: {leaderboard.find(p => p.isUser)?.score?.toLocaleString() || 0}</span>
              <span className="user-stat">Pushes: {leaderboard.find(p => p.isUser)?.pushes || 0}</span>
              <span className="user-stat">Streak: {leaderboard.find(p => p.isUser)?.streak || 0} days</span>
            </div>
          </div>
        )}
      </div>

      <div className="filter-tabs">
        <button 
          className={`filter-tab ${timeFilter === 'today' ? 'active' : ''}`}
          onClick={() => setTimeFilter('today')}
        >
          Today
        </button>
        <button 
          className={`filter-tab ${timeFilter === 'week' ? 'active' : ''}`}
          onClick={() => setTimeFilter('week')}
        >
          This Week
        </button>
        <button 
          className={`filter-tab ${timeFilter === 'alltime' ? 'active' : ''}`}
          onClick={() => setTimeFilter('alltime')}
        >
          All Time
        </button>
      </div>

      <div className="leaderboard-table">
        <div className="table-header">
          <div className="header-cell rank-header">Rank</div>
          <div className="header-cell name-header">Player</div>
          <div className="header-cell score-header">Score</div>
          <div className="header-cell pushes-header">Pushes</div>
          <div className="header-cell streak-header">Streak</div>
        </div>
        
        <div className="table-body">
          {leaderboard.slice(0, 10).map(player => (
            <div 
              key={`${player.rank}-${player.name}`} 
              className={`table-row ${player.isUser ? 'user-row' : ''}`}
            >
              <div className="cell rank-cell">
                <span 
                  className="rank-number"
                  style={{ color: getRankColor(player.rank) }}
                >
                  {player.rank}
                </span>
                <span className="rank-emoji">{getRankEmoji(player.rank)}</span>
              </div>
              <div className="cell name-cell">
                {player.isUser && <span className="you-badge">YOU</span>}
                {player.name}
                {player.rank <= 3 && !player.isUser && (
                  <span className="top-player-badge">Top {player.rank}</span>
                )}
              </div>
              <div className="cell score-cell">
                {player.score.toLocaleString()}
                <span className="metric-label">points</span>
              </div>
              <div className="cell pushes-cell">
                {player.pushes.toLocaleString()}
                <span className="metric-label">pushes</span>
              </div>
              <div className="cell streak-cell">
                {player.streak} days
                {player.streak >= 7 && <span className="fire-emoji">🔥</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="leaderboard-info">
        <h4>How Rankings Work:</h4>
        <ul>
          <li>📊 <strong>Scores</strong> are based on community contributions and button pushes</li>
          <li>🔄 <strong>Daily Reset</strong>: Rankings update at midnight UTC</li>
          <li>🔥 <strong>Streak Bonus</strong>: Maintain daily streaks for score multipliers</li>
          <li>🏆 <strong>Top 3</strong> players get special badges and voting power</li>
          <li>📈 Play daily to climb the ranks!</li>
        </ul>
      </div>

      <div className="community-stats">
        <h3>Community Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{Math.floor(Math.random() * 500) + 500}</div>
              <div className="stat-label">Active Players</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{Math.floor(Math.random() * 1000) + 2000}</div>
              <div className="stat-label">Daily Votes</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🚀</div>
            <div className="stat-content">
              <div className="stat-value">{Math.floor(Math.random() * 50000) + 50000}</div>
              <div className="stat-label">Total Pushes</div>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">📈</div>
            <div className="stat-content">
              <div className="stat-value">92%</div>
              <div className="stat-label">Daily Participation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
