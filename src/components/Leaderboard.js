import React, { useState, useEffect } from 'react';
import './Leaderboard.css';

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeFilter, setTimeFilter] = useState('today'); // today, week, alltime
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    // Generate sample leaderboard data (in real app, this would come from backend)
    const generateLeaderboard = () => {
      const sampleNames = ['ButtonMaster', 'PushKing', 'ClickQueen', 'DailyPusher', 'ScoreHunter', 
                          'StreakLord', 'CommunityHero', 'VoteChampion', 'GameLegend', 'TopPusher'];
      
      const today = new Date().toISOString().split('T')[0];
      
      return sampleNames.map((name, index) => {
        let score, pushes, streak;
        
        if (timeFilter === 'today') {
          score = Math.floor(Math.random() * 500) + 100;
          pushes = Math.floor(Math.random() * 50) + 10;
          streak = Math.floor(Math.random() * 3) + 1;
        } else if (timeFilter === 'week') {
          score = Math.floor(Math.random() * 3000) + 500;
          pushes = Math.floor(Math.random() * 300) + 50;
          streak = Math.floor(Math.random() * 7) + 1;
        } else {
          score = Math.floor(Math.random() * 15000) + 2000;
          pushes = Math.floor(Math.random() * 1500) + 200;
          streak = Math.floor(Math.random() * 30) + 1;
        }
        
        return {
          rank: index + 1,
          name,
          score,
          pushes,
          streak,
          lastActive: today
        };
      });
    };

    // Get user's data from localStorage
    const gameState = JSON.parse(localStorage.getItem('pushpass_gameState') || '{}');
    const userData = {
      name: 'You',
      score: gameState.communityScore || 1000,
      pushes: gameState.playerPushes || 0,
      streak: gameState.playerStreak || 0,
      isUser: true
    };

    const leaderboardData = generateLeaderboard();
    
    // Insert user at appropriate rank (simulated)
    const userRankIndex = Math.min(Math.floor(Math.random() * 5) + 3, leaderboardData.length);
    leaderboardData.splice(userRankIndex, 0, { ...userData, rank: userRankIndex + 1 });
    
    // Update ranks
    const updatedLeaderboard = leaderboardData.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
    
    setLeaderboard(updatedLeaderboard);
    setUserRank(userRankIndex + 1);
  }, [timeFilter]);

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return '#FFD700'; // Gold
      case 2: return '#C0C0C0'; // Silver
      case 3: return '#CD7F32'; // Bronze
      default: return '#666';
    }
  };

  const getRankEmoji = (rank) => {
    switch(rank) {
      case 1: return '👑';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏆';
    }
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <h2>🏆 Community Leaderboard</h2>
        <p className="leaderboard-subtitle">Top players and pushers</p>
        
        {userRank && (
          <div className="user-rank-card">
            <span className="user-rank-label">Your Rank</span>
            <span className="user-rank-value">#{userRank}</span>
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
              key={player.rank} 
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

      <div className="leaderboard-stats">
        <div className="stat-summary">
          <h3>Community Stats</h3>
          <div className="stat-grid">
            <div className="summary-stat">
              <div className="summary-value">1,234</div>
              <div className="summary-label">Active Players Today</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">45,678</div>
              <div className="summary-label">Total Pushes</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">987,654</div>
              <div className="summary-label">Community Score</div>
            </div>
            <div className="summary-stat">
              <div className="summary-value">85%</div>
              <div className="summary-label">Daily Participation</div>
            </div>
          </div>
        </div>

        <div className="rank-benefits">
          <h3>Rank Benefits</h3>
          <ul>
            <li><strong>Top 3:</strong> Special badge and voting power ×2</li>
            <li><strong>Top 10:</strong> Extra push limit (+5 per day)</li>
            <li><strong>Top 50:</strong> Voting power ×1.5</li>
            <li><strong>All players:</strong> Daily participation rewards</li>
          </ul>
        </div>
      </div>

      <div className="leaderboard-info">
        <h4>How Rankings Work:</h4>
        <ul>
          <li>Rankings update daily at midnight UTC</li>
          <li>Scores are based on community contributions</li>
          <li>Streaks provide bonus multipliers</li>
          <li>Top players get special privileges in voting</li>
        </ul>
      </div>
    </div>
  );
}

export default Leaderboard;
