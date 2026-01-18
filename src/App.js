import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VotePanel from './components/VotePanel';
import ButtonGame from './components/ButtonGame';
import Leaderboard from './components/Leaderboard';
import { shouldResetDaily, applyDailyReset } from './utils/dailyReset';
import './App.css';

function App() {
  const [lastReset, setLastReset] = useState(localStorage.getItem('lastReset') || '');
  const [gamePhase, setGamePhase] = useState('vote'); // 'vote' or 'play'

  // Check for daily reset
  useEffect(() => {
    const checkReset = () => {
      if (shouldResetDaily(lastReset)) {
        applyDailyReset();
        const now = new Date().toISOString().split('T')[0];
        localStorage.setItem('lastReset', now);
        setLastReset(now);
        setGamePhase('vote');
      } else {
        // After voting period (for demo, we'll use a simple logic)
        // In real app, you'd have time-based logic
        const hasVotedToday = localStorage.getItem('hasVotedToday');
        if (hasVotedToday) {
          setGamePhase('play');
        }
      }
    };

    checkReset();
    const interval = setInterval(checkReset, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [lastReset]);

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <h1>🔥 Push or Pass</h1>
          <p className="tagline">The Daily Community Button Game</p>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/play">Play</Link>
            <Link to="/vote">Vote</Link>
            <Link to="/leaderboard">Leaderboard</Link>
          </div>
          <div className="phase-indicator">
            Current Phase: <span className="phase-badge">{gamePhase.toUpperCase()}</span>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={
              <div className="home-container">
                <h2>Welcome to Push or Pass!</h2>
                <p>Every day, the community votes on tomorrow's button behavior, then everyone plays!</p>
                <div className="action-buttons">
                  <Link to="/vote" className="action-button vote-button">Vote for Tomorrow</Link>
                  <Link to="/play" className="action-button play-button">Play Today's Game</Link>
                </div>
              </div>
            } />
            <Route path="/vote" element={<VotePanel />} />
            <Route path="/play" element={<ButtonGame />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>Push or Pass © {new Date().getFullYear()} | Daily reset at midnight UTC</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
