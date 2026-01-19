import React, { useState, useEffect } from "react";
import { getLeaderboard, getUserId } from "../firebase/config";

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all");
  
  useEffect(() => {
    loadLeaderboard();
    
    // Refresh every 15 seconds
    const interval = setInterval(loadLeaderboard, 15000);
    return () => clearInterval(interval);
  }, [timeframe]);
  
  const loadLeaderboard = async () => {
    try {
      const data = await getLeaderboard(25);
      setLeaderboard(data);
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const currentUserId = getUserId();
  
  if (loading) {
    return (
      <div className="text-center p-8">
        <div className="loading mx-auto mb-4"></div>
        <p className="text-secondary">Loading leaderboard...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="mb-2">Community Leaderboard</h1>
        <p className="text-secondary">
          Top players by total clicks • Updates in real-time
        </p>
      </div>
      
      {/* Timeframe Selector */}
      <div className="card">
        <div className="flex flex-wrap gap-2">
          <button
            className={`btn btn-sm ${timeframe === "all" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTimeframe("all")}
          >
            All Time
          </button>
          <button
            className={`btn btn-sm ${timeframe === "today" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTimeframe("today")}
          >
            Today
          </button>
          <button
            className={`btn btn-sm ${timeframe === "week" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTimeframe("week")}
          >
            This Week
          </button>
          <button
            className={`btn btn-sm ${timeframe === "month" ? "btn-primary" : "btn-outline"}`}
            onClick={() => setTimeframe("month")}
          >
            This Month
          </button>
        </div>
      </div>
      
      {/* Leaderboard Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="leaderboard w-full">
            <thead>
              <tr>
                <th className="leaderboard-rank">Rank</th>
                <th>Player</th>
                <th className="text-right">Clicks</th>
                <th className="text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-secondary">
                    No players yet. Be the first!
                  </td>
                </tr>
              ) : (
                leaderboard.map((player) => (
                  <tr 
                    key={player.userId}
                    className={player.userId === currentUserId ? "bg-primary/5" : ""}
                  >
                    <td className="leaderboard-rank">
                      #{player.rank}
                      {player.rank <= 3 && (
                        <span className="ml-2">
                          {player.rank === 1 && "🥇"}
                          {player.rank === 2 && "🥈"}
                          {player.rank === 3 && "🥉"}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="leaderboard-player">
                        <div className="leaderboard-avatar">
                          {player.displayName?.charAt(0) || "P"}
                        </div>
                        <div>
                          <div className="leaderboard-name">
                            {player.displayName}
                            {player.userId === currentUserId && (
                              <span className="leaderboard-you">You</span>
                            )}
                          </div>
                          <div className="text-xs text-secondary">
                            Last active: {new Date(player.lastActive).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-medium">
                      {player.clicks.toLocaleString()}
                    </td>
                    <td className="text-right">
                      <div className="leaderboard-score">
                        {player.score.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Stats Summary */}
        {leaderboard.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border-color">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-secondary">Total Players</div>
                <div className="text-xl font-semibold">{leaderboard.length}</div>
              </div>
              <div>
                <div className="text-sm text-secondary">Top Score</div>
                <div className="text-xl font-semibold">
                  {leaderboard[0]?.score.toFixed(1) || "0"}
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary">Total Clicks</div>
                <div className="text-xl font-semibold">
                  {leaderboard.reduce((sum, player) => sum + player.clicks, 0).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-secondary">Avg. Score</div>
                <div className="text-xl font-semibold">
                  {(leaderboard.reduce((sum, player) => sum + player.score, 0) / leaderboard.length).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Leaderboard Info */}
      <div className="card">
        <h3 className="card-title mb-4">About the Leaderboard</h3>
        <div className="space-y-3">
          <p className="text-secondary">
            • Players are ranked by total number of clicks
          </p>
          <p className="text-secondary">
            • Score is calculated based on daily button configurations
          </p>
          <p className="text-secondary">
            • Leaderboard updates automatically every 15 seconds
          </p>
          <p className="text-secondary">
            • Top 3 players receive special badges
          </p>
          <div className="mt-4 text-sm text-tertiary">
            <p>
              <strong>Note:</strong> This leaderboard shows data from all players 
              using the application. Your position is highlighted in blue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
