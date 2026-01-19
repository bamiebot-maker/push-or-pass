import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initFirebase } from "./firebase/config";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Play from "./components/Play";
import Vote from "./components/Vote";
import Leaderboard from "./components/Leaderboard";
import "./App.css";

function App() {
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    const initialize = async () => {
      await initFirebase();
      setInitialized(true);
    };
    
    initialize();
  }, []);
  
  if (!initialized) {
    return (
      <div className="loading-container">
        <div className="loading"></div>
        <p className="text-secondary">Initializing game...</p>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="min-h-screen bg-background-color">
        <Navbar />
        <main className="container py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/play" element={<Play />} />
            <Route path="/vote" element={<Vote />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-links">
                <a href="#" className="footer-link">Privacy Policy</a>
                <a href="#" className="footer-link">Terms of Service</a>
                <a href="#" className="footer-link">Contact</a>
                <a href="#" className="footer-link">GitHub</a>
              </div>
              <p className="footer-copyright">
                © 2026 Push or Pass. A community-driven daily game.
              </p>
              <p className="footer-copyright">Developed By <a color="white" href="https://bamietechdev.vercel.app">Bamietech</a></p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
