import React, { useState, useEffect } from "react";
import { recordClick, getGameState } from "../utils/gameState";

const ButtonGame = () => {
  const [userId, setUserId] = useState("");
  const [gameData, setGameData] = useState(null);
  const [userClicks, setUserClicks] = useState(0);
  const [isMaxClicks, setIsMaxClicks] = useState(false);
  
  useEffect(() => {
    // Get or create user ID
    let id = localStorage.getItem("pushOrPassUserId");
    if (!id) {
      id = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("pushOrPassUserId", id);
    }
    setUserId(id);
    
    // Load game state
    const state = getGameState();
    setGameData(state);
    
    // Count user clicks today
    const today = new Date().toISOString().split("T")[0];
    const userTodayClicks = state.outcomes
      .filter(o => o.userId === id && o.date === today)
      .length;
    setUserClicks(userTodayClicks);
    
    // Check max clicks
    if (state.todaysConfig.maxClicks && state.dailyStats.totalClicks >= state.todaysConfig.maxClicks) {
      setIsMaxClicks(true);
    }
  }, []);
  
  const handleClick = () => {
    if (!userId || isMaxClicks) return;
    
    const result = recordClick(userId);
    
    if (result.success) {
      // Update state
      const state = getGameState();
      setGameData(state);
      setUserClicks(prev => prev + 1);
      
      // Check if max clicks reached
      if (result.config.maxClicks && result.totalClicks >= result.config.maxClicks) {
        setIsMaxClicks(true);
      }
      
      // Show success message
      console.log(`+${result.points} points! Total: ${result.totalScore}`);
    } else {
      alert(result.message);
    }
  };
  
  if (!gameData) return <div style={{ color: "#fff", textAlign: "center", padding: "50px" }}>Loading...</div>;
  
  const config = gameData.todaysConfig;
  const stats = gameData.dailyStats;
  
  return (
    <div className="card">
      <h2>Today's Button Challenge</h2>
      <p className="vote-description">
        Based on yesterday's community votes
      </p>
      
      <div className="rule-display">
        <h3>Today's Rule</h3>
        <p>{config.description}</p>
      </div>
      
      <button 
        className="push-button"
        onClick={handleClick}
        disabled={isMaxClicks}
      >
        {isMaxClicks ? "MAX CLICKS REACHED!" : "PUSH!"}
      </button>
      
      {config.maxClicks && (
        <p className="click-counter">
          Clicks: <span>{stats.totalClicks}</span> / <span>{config.maxClicks}</span>
        </p>
      )}
      
      <div className="game-stats">
        <div className="stat-box">
          <h4>Community Score</h4>
          <div className="stat-number">{stats.communityScore.toFixed(1)}</div>
        </div>
        <div className="stat-box">
          <h4>Total Clicks</h4>
          <div className="stat-number">{stats.totalClicks}</div>
        </div>
        <div className="stat-box">
          <h4>Players Today</h4>
          <div className="stat-number">{stats.uniquePlayers}</div>
        </div>
        <div className="stat-box">
          <h4>Your Clicks</h4>
          <div className="stat-number">{userClicks}</div>
        </div>
      </div>
      
      <div className="info-box">
        <h4>How Today's Button Works</h4>
        <ul>
          <li>Each click contributes to the community score</li>
          <li>Point value depends on yesterday's vote results</li>
          <li>Game resets at midnight UTC</li>
          <li>Your user ID: <span style={{ color: "#667eea" }}>{userId.substring(0, 10)}...</span></li>
        </ul>
      </div>
    </div>
  );
};

export default ButtonGame;
