import React, { useState, useEffect } from "react";
import { submitVote, getVoteStats } from "../firebase/config";

const Vote = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [voteStats, setVoteStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    loadVoteStats();
    
    // Refresh stats every 10 seconds
    const interval = setInterval(loadVoteStats, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const loadVoteStats = async () => {
    try {
      const stats = await getVoteStats();
      setVoteStats(stats);
      
      // If user has already voted, pre-select their vote
      if (stats.hasVoted && stats.userVote) {
        setSelectedOption(stats.userVote);
      }
    } catch (error) {
      console.error("Error loading vote stats:", error);
    }
  };
  
  const voteOptions = [
    {
      id: "help_community",
      title: "Help the Community",
      description: "Tomorrow's button will give 2 points per click",
      icon: "🤝",
      color: "bg-success/10 text-success"
    },
    {
      id: "make_harder",
      title: "Make It Harder",
      description: "Tomorrow's button will give only 0.5 points per click",
      icon: "😈",
      color: "bg-warning/10 text-warning"
    },
    {
      id: "limit_clicks",
      title: "Limit Clicks",
      description: "Limit tomorrow's total clicks to 100",
      icon: "⏰",
      color: "bg-primary/10 text-primary"
    }
  ];
  
  const handleVote = async () => {
    if (!selectedOption) return;
    
    setSubmitting(true);
    setMessage(null);
    
    try {
      const result = await submitVote(selectedOption);
      
      if (result.success) {
        setMessage({
          type: "success",
          text: result.message
        });
        // Reload stats to update UI
        await loadVoteStats();
      } else {
        setMessage({
          type: "danger",
          text: result.message
        });
      }
    } catch (error) {
      setMessage({
        type: "danger",
        text: "Failed to submit vote. Please try again."
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (!voteStats) {
    return (
      <div className="text-center p-8">
        <div className="loading mx-auto mb-4"></div>
        <p className="text-secondary">Loading vote data...</p>
      </div>
    );
  }
  
  const totalVotes = voteStats.totalVotes || 0;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2">Vote for Tomorrow</h1>
        <p className="text-secondary">
          Choose how tomorrow's button will behave for everyone
        </p>
      </div>
      
      {/* Vote Stats */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="card-title">Today's Voting</h3>
            <p className="card-subtitle">
              {voteStats.hasVoted 
                ? "Thank you for voting! Results update in real-time."
                : "Cast your vote below. Each user can vote once per day."}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalVotes}</div>
            <div className="text-sm text-secondary">Total Votes</div>
          </div>
        </div>
        
        {message && (
          <div className={`mt-4 alert alert-${message.type}`}>
            {message.text}
          </div>
        )}
        
        {voteStats.hasVoted && (
          <div className="mt-4 p-4 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-success font-medium">
              ✓ You have already voted today. Thank you for participating!
            </p>
          </div>
        )}
      </div>
      
      {/* Vote Options */}
      <div className="vote-options">
        {voteOptions.map((option) => {
          const voteCount = voteStats.counts[option.id] || 0;
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
          
          return (
            <div
              key={option.id}
              className={`vote-option ${selectedOption === option.id ? "selected" : ""} ${
                voteStats.hasVoted ? "cursor-default" : "cursor-pointer"
              }`}
              onClick={() => !voteStats.hasVoted && setSelectedOption(option.id)}
            >
              <div className="vote-option-header">
                <div className={`vote-option-icon ${option.color}`}>
                  {option.icon}
                </div>
                <div>
                  <h3 className="vote-option-title">{option.title}</h3>
                  <p className="vote-option-description">{option.description}</p>
                </div>
              </div>
              
              {/* Vote Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-secondary">
                    {voteCount} vote{voteCount !== 1 ? "s" : ""}
                  </span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-border-color rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: option.color.includes("success") ? "#10b981" :
                                     option.color.includes("warning") ? "#f59e0b" : "#2563eb"
                    }}
                  ></div>
                </div>
              </div>
              
              {/* Show checkmark if this was user's vote */}
              {voteStats.hasVoted && voteStats.userVote === option.id && (
                <div className="absolute top-4 right-4 text-success">
                  ✓ Your Vote
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Submit Button */}
      {!voteStats.hasVoted && (
        <div className="text-center">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleVote}
            disabled={!selectedOption || submitting}
          >
            {submitting ? (
              <>
                <div className="loading"></div>
                Submitting...
              </>
            ) : (
              "Submit Vote"
            )}
          </button>
          <p className="mt-2 text-sm text-secondary">
            Voting closes at 11:59 PM UTC
          </p>
        </div>
      )}
      
      {/* Voting Info */}
      <div className="card">
        <h3 className="card-title mb-4">How Voting Works</h3>
        <div className="space-y-3">
          <p className="text-secondary">
            • Each user can vote once per day
          </p>
          <p className="text-secondary">
            • The winning option determines tomorrow's button behavior
          </p>
          <p className="text-secondary">
            • Voting results update in real-time
          </p>
          <p className="text-secondary">
            • If there's a tie, the "Help the Community" option wins
          </p>
          <div className="mt-4 text-sm text-tertiary">
            <p>
              <strong>Note:</strong> Today's votes will be processed at midnight UTC and 
              the results will take effect tomorrow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Vote;
