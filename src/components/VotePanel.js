import React, { useState, useEffect } from "react";
import { submitVote, getVoteStats, getGameState } from "../utils/gameState";

const VotePanel = () => {
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteStats, setVoteStats] = useState(null);
  const [userId, setUserId] = useState("");
  
  useEffect(() => {
    // Get user ID
    let id = localStorage.getItem("pushOrPassUserId");
    if (!id) {
      id = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("pushOrPassUserId", id);
    }
    setUserId(id);
    
    // Check if already voted today
    const state = getGameState();
    const today = new Date().toISOString().split("T")[0];
    const votedToday = state.votes.some(v => v.userId === id && v.date === today);
    setHasVoted(votedToday);
    
    // Load vote stats
    setVoteStats(getVoteStats());
  }, []);
  
  const voteOptions = [
    {
      id: "help_community",
      title: "Help the Community",
      description: "Each push adds more points for everyone tomorrow",
      votes: voteStats ? voteStats.counts.help_community : 0
    },
    {
      id: "make_harder",
      title: "Make It Harder",
      description: "Button requires more pushes but gives bonus points",
      votes: voteStats ? voteStats.counts.make_harder : 0
    },
    {
      id: "limit_clicks",
      title: "Limit Clicks",
      description: "Limit total daily clicks but increase point value",
      votes: voteStats ? voteStats.counts.limit_clicks : 0
    }
  ];
  
  const handleVote = () => {
    if (!selected || !userId) return;
    
    const success = submitVote(userId, selected);
    if (success) {
      setHasVoted(true);
      setVoteStats(getVoteStats());
    }
  };
  
  return (
    <div className="card vote-card">
      <h2>Vote for Tomorrow's Button</h2>
      <p className="vote-description">Choose how the button will behave tomorrow</p>
      
      <div className="vote-stats">
        Today's Votes: {voteStats ? voteStats.total : 0}
      </div>
      
      {hasVoted ? (
        <div style={{ textAlign: "center", padding: "50px 20px" }}>
          <div style={{ fontSize: "4rem", marginBottom: "20px" }}>✅</div>
          <h3 style={{ color: "#38b2ac", marginBottom: "20px", fontSize: "1.8rem" }}>Thanks for voting!</h3>
          <p style={{ color: "#aaa", fontSize: "1.1rem" }}>Your vote has been recorded. Check back tomorrow to see the results!</p>
        </div>
      ) : (
        <>
          <div className="vote-options">
            {voteOptions.map(option => (
              <div
                key={option.id}
                className={`vote-option ${selected === option.id ? "selected" : ""}`}
                onClick={() => setSelected(option.id)}
              >
                <h3>{option.title}</h3>
                <p>{option.description}</p>
                <div className="vote-count">{option.votes} votes</div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <button 
              className="primary-button" 
              onClick={handleVote}
              disabled={!selected}
              style={{ padding: "18px 50px", fontSize: "1.2rem" }}
            >
              Submit Vote
            </button>
          </div>
        </>
      )}
      
      <div className="info-box">
        <h4>Voting Rules</h4>
        <ul>
          <li>Each user can vote once per day</li>
          <li>Voting closes at 6 PM UTC</li>
          <li>Results take effect tomorrow</li>
          <li>Majority vote decides the button behavior</li>
        </ul>
      </div>
    </div>
  );
};

export default VotePanel;
