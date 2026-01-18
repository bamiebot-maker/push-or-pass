import React, { useState, useEffect } from 'react';
import './ButtonGame.css';

function ButtonGame() {
  const [gameState, setGameState] = useState(() => {
    const saved = localStorage.getItem('pushpass_gameState');
    return saved ? JSON.parse(saved) : {
      communityScore: 1000,
      playerPushes: 0,
      totalPushes: 0,
      playerStreak: 0,
      lastPushDate: null,
      todaysPushes: 0,
      maxPushesToday: 50
    };
  });

  const [todaysConfig, setTodaysConfig] = useState(() => {
    const saved = localStorage.getItem('pushpass_todaysConfig');
    return saved ? JSON.parse(saved) : {
      mode: 'help', // help, hard, limited
      description: 'Help the community: Each push adds +2 points for everyone',
      multiplier: 2,
      basePoints: 1,
      maxPushes: 50
    };
  });

  const [recentPushes, setRecentPushes] = useState(() => {
    const saved = localStorage.getItem('pushpass_recentPushes');
    return saved ? JSON.parse(saved) : [];
  });

  const [buttonEffects, setButtonEffects] = useState([]);
  const [gameEffects, setGameEffects] = useState([]);

  // Load yesterday's vote result (for demo, we'll simulate it)
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const lastConfigDate = localStorage.getItem('pushpass_configDate');
    
    if (lastConfigDate !== today) {
      // Determine today's config based on yesterday's votes (simulated)
      const votes = JSON.parse(localStorage.getItem('pushpass_votes') || '[]');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      const yesterdayVotes = votes.filter(v => v.date === yesterdayStr);
      
      let newConfig;
      if (yesterdayVotes.length === 0) {
        // Default config if no votes
        newConfig = {
          mode: 'help',
          description: 'Help the community: Each push adds +2 points for everyone',
          multiplier: 2,
          basePoints: 1,
          maxPushes: 50
        };
      } else {
        // Determine winning option (simplified - just pick most frequent)
        const voteCounts = { 1: 0, 2: 0, 3: 0 };
        yesterdayVotes.forEach(v => {
          voteCounts[v.option] = (voteCounts[v.option] || 0) + 1;
        });
        
        const winningOption = Object.keys(voteCounts).reduce((a, b) => 
          voteCounts[a] > voteCounts[b] ? a : b
        );
        
        switch(winningOption) {
          case '1':
            newConfig = {
              mode: 'help',
              description: 'Help the community: Each push adds +2 points for everyone',
              multiplier: 2,
              basePoints: 1,
              maxPushes: 50
            };
            break;
          case '2':
            newConfig = {
              mode: 'hard',
              description: 'Make it harder: Button requires more effort but gives +5 bonus points',
              multiplier: 1,
              basePoints: 5,
              maxPushes: 30
            };
            break;
          case '3':
            newConfig = {
              mode: 'limited',
              description: 'Limit clicks: Each player gets limited pushes (25 max)',
              multiplier: 1.5,
              basePoints: 2,
              maxPushes: 25
            };
            break;
          default:
            newConfig = todaysConfig;
        }
      }
      
      setTodaysConfig(newConfig);
      localStorage.setItem('pushpass_todaysConfig', JSON.stringify(newConfig));
      localStorage.setItem('pushpass_configDate', today);
      
      // Reset daily pushes
      const newGameState = {
        ...gameState,
        todaysPushes: 0,
        maxPushesToday: newConfig.maxPushes
      };
      setGameState(newGameState);
      localStorage.setItem('pushpass_gameState', JSON.stringify(newGameState));
    }
  }, []);

  const handlePush = () => {
    if (gameState.todaysPushes >= todaysConfig.maxPushes) {
      addGameEffect('Maximum pushes reached for today!');
      return;
    }

    // Calculate points based on today's config
    let pointsEarned = todaysConfig.basePoints;
    let communityBonus = 0;
    
    if (todaysConfig.mode === 'help') {
      communityBonus = todaysConfig.multiplier;
    } else if (todaysConfig.mode === 'hard') {
      pointsEarned *= 2; // Bonus points for harder mode
    }

    // Update game state
    const today = new Date().toISOString().split('T')[0];
    const newGameState = {
      ...gameState,
      communityScore: gameState.communityScore + communityBonus,
      playerPushes: gameState.playerPushes + 1,
      totalPushes: gameState.totalPushes + 1,
      todaysPushes: gameState.todaysPushes + 1,
      lastPushDate: new Date().toISOString()
    };

    // Check for streak
    if (gameState.lastPushDate) {
      const lastDate = new Date(gameState.lastPushDate).toISOString().split('T')[0];
      if (lastDate === today) {
        // Already pushed today, no streak increment
      } else {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastDate === yesterdayStr) {
          newGameState.playerStreak = gameState.playerStreak + 1;
        } else {
          newGameState.playerStreak = 1;
        }
      }
    } else {
      newGameState.playerStreak = 1;
    }

    setGameState(newGameState);
    localStorage.setItem('pushpass_gameState', JSON.stringify(newGameState));

    // Add to recent pushes
    const newPush = {
      id: Date.now(),
      points: pointsEarned,
      communityBonus: communityBonus,
      timestamp: new Date().toISOString(),
      playerName: 'You'
    };
    
    const updatedPushes = [newPush, ...recentPushes.slice(0, 9)];
    setRecentPushes(updatedPushes);
    localStorage.setItem('pushpass_recentPushes', JSON.stringify(updatedPushes));

    // Add button effects
    addButtonEffect(pointsEarned, communityBonus);
    
    if (communityBonus > 0) {
      addGameEffect(`+${communityBonus} community points added!`);
    }
    
    if (pointsEarned > todaysConfig.basePoints) {
      addGameEffect(`Bonus points earned: +${pointsEarned}!`);
    }

    // Save outcome
    saveOutcome(newPush);
  };

  const addButtonEffect = (points, communityBonus) => {
    const effectId = Date.now();
    const newEffect = {
      id: effectId,
      points,
      communityBonus,
      top: `${Math.random() * 30 + 35}%`,
      left: `${Math.random() * 30 + 35}%`
    };
    
    setButtonEffects(prev => [...prev, newEffect]);
    
    setTimeout(() => {
      setButtonEffects(prev => prev.filter(e => e.id !== effectId));
    }, 1000);
  };

  const addGameEffect = (message) => {
    const effectId = Date.now();
    const newEffect = {
      id: effectId,
      message,
      type: 'info'
    };
    
    setGameEffects(prev => [...prev, newEffect]);
    
    setTimeout(() => {
      setGameEffects(prev => prev.filter(e => e.id !== effectId));
    }, 3000);
  };

  const saveOutcome = (pushData) => {
    const today = new Date().toISOString().split('T')[0];
    const outcomes = JSON.parse(localStorage.getItem('pushpass_outcomes') || '[]');
    
    const outcome = {
      date: today,
      push: pushData,
      gameState: gameState,
      config: todaysConfig
    };
    
    outcomes.push(outcome);
    localStorage.setItem('pushpass_outcomes', JSON.stringify(outcomes));
  };

  const getButtonStyle = () => {
    switch(todaysConfig.mode) {
      case 'help':
        return { background: 'linear-gradient(45deg, #4CAF50, #45a049)' };
      case 'hard':
        return { background: 'linear-gradient(45deg, #FF9800, #F57C00)' };
      case 'limited':
        return { background: 'linear-gradient(45deg, #2196F3, #1976D2)' };
      default:
        return { background: 'linear-gradient(45deg, #667eea, #764ba2)' };
    }
  };

  const getButtonEmoji = () => {
    switch(todaysConfig.mode) {
      case 'help': return '🤝';
      case 'hard': return '🔥';
      case 'limited': return '⏱️';
      default: return '🎮';
    }
  };

  return (
    <div className="button-game">
      <div className="game-header">
        <h2>🎮 Today's Button Challenge</h2>
        <div className="todays-config">
          <span className="config-badge" style={{
            background: todaysConfig.mode === 'help' ? '#4CAF50' : 
                       todaysConfig.mode === 'hard' ? '#FF9800' : '#2196F3'
          }}>
            {getButtonEmoji()} {todaysConfig.mode.toUpperCase()} MODE
          </span>
          <p className="config-description">{todaysConfig.description}</p>
        </div>
      </div>

      <div className="game-stats">
        <div className="stat-card">
          <div className="stat-value">{gameState.communityScore.toLocaleString()}</div>
          <div className="stat-label">Community Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gameState.playerPushes}</div>
          <div className="stat-label">Your Total Pushes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gameState.playerStreak} days</div>
          <div className="stat-label">Push Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{gameState.todaysPushes}/{todaysConfig.maxPushes}</div>
          <div className="stat-label">Today's Pushes</div>
        </div>
      </div>

      <div className="game-main">
        <div className="button-container">
          <button 
            className="push-button"
            onClick={handlePush}
            disabled={gameState.todaysPushes >= todaysConfig.maxPushes}
            style={getButtonStyle()}
          >
            <span className="button-emoji">{getButtonEmoji()}</span>
            <span className="button-text">PUSH</span>
            <span className="button-subtext">Click to earn points!</span>
          </button>
          
          {buttonEffects.map(effect => (
            <div key={effect.id} className="button-effect" style={{ top: effect.top, left: effect.left }}>
              +{effect.points}
              {effect.communityBonus > 0 && <span className="community-bonus">+{effect.communityBonus} community</span>}
            </div>
          ))}
        </div>

        <div className="game-info">
          <h3>How to Play:</h3>
          <p>Click the button to push! Each push earns points based on today's configuration.</p>
          <ul>
            <li>Today's mode was chosen by yesterday's community vote</li>
            <li>Check the voting page to influence tomorrow's game</li>
            <li>Push as many times as allowed today</li>
            <li>Come back daily to maintain your streak!</li>
          </ul>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Pushes</h3>
        <div className="pushes-list">
          {recentPushes.length > 0 ? (
            recentPushes.map(push => (
              <div key={push.id} className="push-item">
                <span className="push-player">{push.playerName}</span>
                <span className="push-points">+{push.points} points</span>
                {push.communityBonus > 0 && (
                  <span className="push-community">+{push.communityBonus} community</span>
                )}
                <span className="push-time">
                  {new Date(push.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <p className="no-pushes">No pushes yet today. Be the first!</p>
          )}
        </div>
      </div>

      {gameEffects.map(effect => (
        <div key={effect.id} className="game-effect">
          {effect.message}
        </div>
      ))}
    </div>
  );
}

export default ButtonGame;
