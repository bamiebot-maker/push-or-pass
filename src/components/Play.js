import React, { useState, useEffect } from "react";
import { recordClick, getTodayConfig, getDailyStats, getUserId } from "../firebase/config";

const Play = () => {
  const [config, setConfig] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [userClicks, setUserClicks] = useState(0);
  
  useEffect(() => {
    const loadData = async () => {
      const todayConfig = await getTodayConfig();
      setConfig(todayConfig);
    };
    
    loadData();
    
    const unsubscribe = getDailyStats((dailyStats) => {
      setStats(dailyStats);
    });
    
    return () => unsubscribe();
  }, []);
  
  const handleClick = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await recordClick();
      
      if (result.success) {
        setMessage({
          type: "success",
          text: `+${result.points} points added to community score!`
        });
        setUserClicks(prev => prev + 1);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "danger",
          text: result.message
        });
      }
    } catch (error) {
      setMessage({
        type: "danger",
        text: "An error occurred. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (!config || !stats) {
    return (
      <div className="text-center p-8">
        <div className="loading mx-auto mb-4"></div>
        <p className="text-secondary">Loading game data...</p>
      </div>
    );
  }
  
  const isLimitReached = config.maxClicks && stats.totalClicks >= config.maxClicks;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2">Today's Challenge</h1>
        <p className="text-secondary">
          Based on yesterday's community votes
        </p>
      </div>
      
      {/* Game Rules */}
      <div className="card">
        <h3 className="card-title mb-4">Today's Rules</h3>
        <div className="p-4 bg-surface rounded-lg mb-6">
          <p className="text-lg font-medium">{config.description}</p>
        </div>
        
        {config.maxClicks && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-secondary">Daily Progress</span>
              <span className="font-medium">
                {stats.totalClicks} / {config.maxClicks} clicks
              </span>
            </div>
            <div className="w-full bg-border-color rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${Math.min((stats.totalClicks / config.maxClicks) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Game Button */}
      <div className="game-button-container">
        <button
          className={`game-button ${!isLimitReached ? 'game-button-pulse' : ''}`}
          onClick={handleClick}
          disabled={loading || isLimitReached}
        >
          {loading ? (
            <div className="loading"></div>
          ) : isLimitReached ? (
            "Limit Reached"
          ) : (
            "PUSH"
          )}
        </button>
        
        {message && (
          <div className={`mt-6 alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
      
      {/* Stats */}
      <div className="card">
        <h3 className="card-title mb-6">Live Statistics</h3>
        <div className="stats-grid grid-cols-2 md:grid-cols-4">
          <div className="stat-card">
            <div className="stat-number">
              {stats.communityScore?.toFixed(1) || "0"}
            </div>
            <div className="stat-label">Community Score</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {stats.totalClicks?.toLocaleString() || "0"}
            </div>
            <div className="stat-label">Total Clicks</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">
              {stats.uniquePlayers?.length || "0"}
            </div>
            <div className="stat-label">Active Players</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-number">{userClicks}</div>
            <div className="stat-label">Your Clicks</div>
          </div>
        </div>
      </div>
      
      {/* Game Info */}
      <div className="card">
        <h3 className="card-title mb-4">About Today's Game</h3>
        <div className="space-y-3">
          <p className="text-secondary">
            Today's button behavior was decided by yesterday's community vote results.
          </p>
          <p className="text-secondary">
            Every click contributes to the global community score. The game resets daily at midnight UTC.
          </p>
          <div className="text-sm text-tertiary mt-4">
            <p>Your Player ID: {getUserId().substring(0, 8)}...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Play;
