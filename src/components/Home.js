import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDailyStats, getTodayConfig } from "../firebase/config";

const Home = () => {
  const [dailyStats, setDailyStats] = useState(null);
  const [todayConfig, setTodayConfig] = useState(null);
  
  useEffect(() => {
    const loadData = async () => {
      const config = await getTodayConfig();
      setTodayConfig(config);
    };
    
    loadData();
    
    const unsubscribe = getDailyStats((stats) => {
      setDailyStats(stats);
    });
    
    return () => unsubscribe();
  }, []);
  
  const getPhase = () => {
    const hour = new Date().getHours();
    return hour < 12 ? "VOTING" : "PLAYING";
  };
  
  const phase = getPhase();
  const isVotingPhase = phase === "VOTING";
  
  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div className="page-header">
        <h1>Push or Pass</h1>
        <p className="page-description lead">
          A community-driven daily game where your votes shape tomorrow's challenge. 
          Vote today, play tomorrow.
        </p>
      </div>
      
      {/* Phase Indicator */}
      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="card-title">Current Phase</h3>
            <p className="card-subtitle">
              {isVotingPhase 
                ? "Vote now to decide tomorrow's button behavior"
                : "Play today's button based on yesterday's votes"}
            </p>
          </div>
          <div className={`badge ${isVotingPhase ? 'badge-warning' : 'badge-success'}`}>
            {phase}
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="section">
        <h3 className="mb-6 text-center">Get Started</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-3">🎮</div>
                <h4 className="card-title">Play Today's Game</h4>
                <p className="text-secondary">
                  Contribute to today's community score with the button configured by yesterday's votes.
                </p>
              </div>
              <Link to="/play" className="btn btn-primary btn-lg btn-block">
                Play Now
              </Link>
            </div>
          </div>
          
          <div className="card">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-3">🗳️</div>
                <h4 className="card-title">Vote for Tomorrow</h4>
                <p className="text-secondary">
                  Vote now to decide how tomorrow's button will behave for everyone.
                </p>
              </div>
              <Link to="/vote" className="btn btn-secondary btn-lg btn-block">
                Vote Now
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Today's Stats */}
      <div className="section">
        <h3 className="mb-6 text-center">Today's Community Stats</h3>
        <div className="card">
          <div className="stats-grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="stat-number">
                {dailyStats?.communityScore?.toFixed(1) || "0"}
              </div>
              <div className="stat-label">Community Score</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">
                {dailyStats?.totalClicks?.toLocaleString() || "0"}
              </div>
              <div className="stat-label">Total Clicks</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">
                {dailyStats?.uniquePlayers?.length || "0"}
              </div>
              <div className="stat-label">Active Players</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-number">
                {todayConfig?.maxClicks ? `${todayConfig.maxClicks}` : "∞"}
              </div>
              <div className="stat-label">Daily Limit</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="section">
        <h3 className="mb-6 text-center">How It Works</h3>
        <div className="card">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary text-xl font-bold mx-auto">
                1
              </div>
              <h4 className="font-bold">Vote Daily</h4>
              <p className="text-sm text-secondary">
                Choose from 3 options to decide tomorrow's button behavior. Your vote matters!
              </p>
            </div>
            
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary text-xl font-bold mx-auto">
                2
              </div>
              <h4 className="font-bold">Play Daily</h4>
              <p className="text-sm text-secondary">
                Click the button to contribute to the community score. Every click counts!
              </p>
            </div>
            
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center text-primary text-xl font-bold mx-auto">
                3
              </div>
              <h4 className="font-bold">Reset Daily</h4>
              <p className="text-sm text-secondary">
                Game resets at midnight UTC with new rules based on yesterday's votes.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Call to Action */}
      <div className="text-center">
        <p className="text-secondary mb-4">
          Ready to join the community?
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/play" className="btn btn-primary btn-lg">
            Start Playing
          </Link>
          <Link to="/vote" className="btn btn-secondary btn-lg">
            Cast Your Vote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
