import React, { useState, useEffect } from 'react';
import './VotePanel.css';

function VotePanel() {
  const [votes, setVotes] = useState(() => {
    const savedVotes = localStorage.getItem('pushpass_votes');
    return savedVotes ? JSON.parse(savedVotes) : [];
  });
  
  const [userVote, setUserVote] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [voteStats, setVoteStats] = useState({ option1: 0, option2: 0, option3: 0 });

  const voteOptions = [
    {
      id: 1,
      title: "Help the community",
      description: "Each push adds more points for everyone tomorrow",
      color: "#00BCD4",
      emoji: "🤝"
    },
    {
      id: 2,
      title: "Make it harder",
      description: "Button requires more pushes but gives bonus points",
      color: "#FF9800",
      emoji: "🔥"
    },
    {
      id: 3,
      title: "Limit clicks",
      description: "Each player gets limited pushes per day",
      color: "#9C27B0",
      emoji: "⏱️"
    }
  ];

  useEffect(() => {
    // Calculate vote stats
    const stats = { option1: 0, option2: 0, option3: 0 };
    votes.forEach(vote => {
      stats[`option${vote.option}`] = (stats[`option${vote.option}`] || 0) + 1;
    });
    setVoteStats(stats);
    
    // Check if user has already voted today
    const today = new Date().toISOString().split('T')[0];
    const userVoteToday = votes.find(v => v.userId === 'demo-user' && v.date === today);
    if (userVoteToday) {
      setHasVoted(true);
      setUserVote(userVoteToday.option);
    }
  }, [votes]);

  const handleVote = (optionId) => {
    if (hasVoted) return;
    
    setUserVote(optionId);
  };

  const submitVote = () => {
    if (userVote === null || hasVoted) return;

    const today = new Date().toISOString().split('T')[0];
    const newVote = {
      option: userVote,
      date: today,
      userId: 'demo-user', // In real app, use actual user ID
      timestamp: new Date().toISOString()
    };

    const updatedVotes = [...votes, newVote];
    setVotes(updatedVotes);
    localStorage.setItem('pushpass_votes', JSON.stringify(updatedVotes));
    localStorage.setItem('hasVotedToday', 'true');
    setHasVoted(true);

    // Update vote stats
    const stats = { ...voteStats };
    stats[`option${userVote}`] = (stats[`option${userVote}`] || 0) + 1;
    setVoteStats(stats);
  };

  const totalVotes = votes.filter(v => v.date === new Date().toISOString().split('T')[0]).length;

  return (
    <div className="vote-panel">
      <div className="vote-header">
        <h2>🎯 Vote for Tomorrow's Button</h2>
        <p className="vote-subtitle">Choose how the button will behave tomorrow</p>
        <div className="vote-counter">
          <span className="vote-count">Today's Votes: {totalVotes}</span>
          {hasVoted && <span className="voted-badge">You've Voted!</span>}
        </div>
      </div>

      <div className="vote-options">
        {voteOptions.map(option => (
          <div 
            key={option.id}
            className={`vote-card ${userVote === option.id ? 'selected' : ''} ${hasVoted ? 'disabled' : ''}`}
            onClick={() => handleVote(option.id)}
            style={{ borderColor: option.color }}
          >
            <div className="vote-card-header">
              <span className="vote-emoji">{option.emoji}</span>
              <h3 style={{ color: option.color }}>{option.title}</h3>
            </div>
            <p className="vote-description">{option.description}</p>
            <div className="vote-stats">
              <div className="vote-bar">
                <div 
                  className="vote-fill"
                  style={{
                    width: `${(voteStats[`option${option.id}`] / Math.max(totalVotes, 1)) * 100}%`,
                    backgroundColor: option.color
                  }}
                ></div>
              </div>
              <span className="vote-count-number">{voteStats[`option${option.id}`]} votes</span>
            </div>
          </div>
        ))}
      </div>

      {!hasVoted ? (
        <button 
          className="submit-vote-btn"
          onClick={submitVote}
          disabled={userVote === null}
          style={{
            opacity: userVote === null ? 0.5 : 1,
            background: userVote ? voteOptions.find(o => o.id === userVote)?.color : '#666'
          }}
        >
          {userVote ? `Submit Vote for "${voteOptions.find(o => o.id === userVote)?.title}"` : 'Select an option to vote'}
        </button>
      ) : (
        <div className="vote-thanks">
          <h3>✅ Thanks for voting!</h3>
          <p>Your vote has been recorded. Check back tomorrow to play with the new button!</p>
          <p className="vote-selected">
            You selected: <strong>{voteOptions.find(o => o.id === userVote)?.title}</strong>
          </p>
        </div>
      )}

      <div className="vote-info">
        <h4>How Voting Works:</h4>
        <ul>
          <li>Votes are tallied at midnight UTC</li>
          <li>The winning option becomes tomorrow's button behavior</li>
          <li>One vote per user per day</li>
          <li>Voting resets daily</li>
        </ul>
      </div>
    </div>
  );
}

export default VotePanel;

