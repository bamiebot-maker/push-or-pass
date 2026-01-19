// Firebase configuration
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, updateDoc, doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBIkbxByAyv8FLailOiCmRIk26hw6EkVEc",
  authDomain: "push-or-pass.firebaseapp.com",
  projectId: "push-or-pass",
  storageBucket: "push-or-pass.firebasestorage.app",
  messagingSenderId: "172996989608",
  appId: "1:172996989608:web:a74beb943249681e22689d",
  measurementId: "G-MSRMXS6JKM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Collections
const VOTES_COLLECTION = "votes";
const CLICKS_COLLECTION = "clicks";
const DAILY_STATS_COLLECTION = "dailyStats";
const GAME_CONFIG_COLLECTION = "gameConfig";

// Helper to get today's date string (YYYY-MM-DD)
export const getToday = () => new Date().toISOString().split('T')[0];

// Initialize user anonymously
export const initUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user.uid;
  } catch (error) {
    console.error("Error initializing user:", error);
    // Fallback to localStorage user ID
    let userId = localStorage.getItem("pushOrPassUserId");
    if (!userId) {
      userId = "user_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("pushOrPassUserId", userId);
    }
    return userId;
  }
};

// Get current user ID
export const getUserId = () => {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }
  let userId = localStorage.getItem("pushOrPassUserId");
  if (!userId) {
    userId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("pushOrPassUserId", userId);
  }
  return userId;
};

// Submit a vote
export const submitVote = async (voteOption) => {
  const userId = getUserId();
  const today = getToday();
  
  try {
    // Check if user already voted today
    const votesQuery = query(
      collection(db, VOTES_COLLECTION),
      where("userId", "==", userId),
      where("date", "==", today)
    );
    const existingVotes = await getDocs(votesQuery);
    
    if (!existingVotes.empty) {
      return { success: false, message: "You have already voted today." };
    }
    
    // Submit vote
    await addDoc(collection(db, VOTES_COLLECTION), {
      userId,
      voteOption,
      date: today,
      timestamp: new Date().toISOString()
    });
    
    return { success: true, message: "Vote submitted successfully!" };
  } catch (error) {
    console.error("Error submitting vote:", error);
    return { success: false, message: "Failed to submit vote. Please try again." };
  }
};

// Record a click
export const recordClick = async () => {
  const userId = getUserId();
  const today = getToday();
  
  try {
    // Get today's config
    const configDoc = await getDoc(doc(db, GAME_CONFIG_COLLECTION, today));
    const config = configDoc.exists() ? configDoc.data() : getDefaultConfig();
    
    // Check max clicks
    const statsDoc = await getDoc(doc(db, DAILY_STATS_COLLECTION, today));
    const stats = statsDoc.exists() ? statsDoc.data() : { totalClicks: 0, uniquePlayers: [], communityScore: 0 };
    
    if (config.maxClicks && stats.totalClicks >= config.maxClicks) {
      return { success: false, message: "Daily click limit reached!" };
    }
    
    // Calculate points
    let points = 1;
    if (config.difficulty === "easy") points = 2;
    if (config.difficulty === "hard") points = 0.5;
    
    // Record click
    await addDoc(collection(db, CLICKS_COLLECTION), {
      userId,
      date: today,
      timestamp: new Date().toISOString(),
      points,
      config: config.behavior
    });
    
    // Update daily stats
    const isNewPlayer = !stats.uniquePlayers.includes(userId);
    const updatedStats = {
      totalClicks: (stats.totalClicks || 0) + 1,
      communityScore: (stats.communityScore || 0) + points,
      uniquePlayers: isNewPlayer ? [...(stats.uniquePlayers || []), userId] : stats.uniquePlayers,
      lastUpdated: new Date().toISOString()
    };
    
    await setDoc(doc(db, DAILY_STATS_COLLECTION, today), updatedStats);
    
    return {
      success: true,
      points,
      totalScore: updatedStats.communityScore,
      totalClicks: updatedStats.totalClicks,
      uniquePlayers: updatedStats.uniquePlayers.length,
      config
    };
  } catch (error) {
    console.error("Error recording click:", error);
    return { success: false, message: "Failed to record click. Please try again." };
  }
};

// Get vote statistics
export const getVoteStats = async () => {
  const today = getToday();
  
  try {
    const votesQuery = query(
      collection(db, VOTES_COLLECTION),
      where("date", "==", today)
    );
    const votesSnapshot = await getDocs(votesQuery);
    
    const counts = {
      help_community: 0,
      make_harder: 0,
      limit_clicks: 0
    };
    
    votesSnapshot.forEach((doc) => {
      const vote = doc.data();
      if (counts.hasOwnProperty(vote.voteOption)) {
        counts[vote.voteOption]++;
      }
    });
    
    // Determine winning option
    let winningOption = "help_community";
    let maxVotes = 0;
    for (const [option, count] of Object.entries(counts)) {
      if (count > maxVotes) {
        maxVotes = count;
        winningOption = option;
      }
    }
    
    // Check if current user has voted
    const userId = getUserId();
    const userVoteQuery = query(
      collection(db, VOTES_COLLECTION),
      where("userId", "==", userId),
      where("date", "==", today)
    );
    const userVoteSnapshot = await getDocs(userVoteQuery);
    const hasVoted = !userVoteSnapshot.empty;
    
    return {
      counts,
      winningOption,
      totalVotes: votesSnapshot.size,
      hasVoted,
      userVote: hasVoted ? userVoteSnapshot.docs[0].data().voteOption : null
    };
  } catch (error) {
    console.error("Error getting vote stats:", error);
    return {
      counts: { help_community: 0, make_harder: 0, limit_clicks: 0 },
      winningOption: "help_community",
      totalVotes: 0,
      hasVoted: false,
      userVote: null
    };
  }
};

// Get leaderboard data
export const getLeaderboard = async (limitCount = 10) => {
  try {
    // Get all clicks grouped by user
    const clicksQuery = query(
      collection(db, CLICKS_COLLECTION),
      orderBy("timestamp", "desc")
    );
    const clicksSnapshot = await getDocs(clicksQuery);
    
    const playerStats = {};
    clicksSnapshot.forEach((doc) => {
      const click = doc.data();
      if (!playerStats[click.userId]) {
        playerStats[click.userId] = {
          userId: click.userId,
          clicks: 0,
          score: 0,
          lastActive: click.timestamp
        };
      }
      playerStats[click.userId].clicks++;
      playerStats[click.userId].score += click.points;
    });
    
    const leaderboard = Object.values(playerStats)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, limitCount)
      .map((player, index) => ({
        ...player,
        rank: index + 1,
        displayName: `Player_${player.userId.substring(0, 6)}`
      }));
    
    return leaderboard;
  } catch (error) {
    console.error("Error getting leaderboard:", error);
    return [];
  }
};

// Get daily stats with real-time updates
export const getDailyStats = (callback) => {
  const today = getToday();
  
  const unsubscribe = onSnapshot(
    doc(db, DAILY_STATS_COLLECTION, today),
    (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      } else {
        callback({ totalClicks: 0, communityScore: 0, uniquePlayers: [] });
      }
    },
    (error) => {
      console.error("Error listening to daily stats:", error);
      callback({ totalClicks: 0, communityScore: 0, uniquePlayers: [] });
    }
  );
  
  return unsubscribe;
};

// Get today's config
export const getTodayConfig = async () => {
  const today = getToday();
  
  try {
    const configDoc = await getDoc(doc(db, GAME_CONFIG_COLLECTION, today));
    if (configDoc.exists()) {
      return configDoc.data();
    } else {
      // If no config for today, create one based on yesterday's votes
      const defaultConfig = await generateDailyConfig();
      await setDoc(doc(db, GAME_CONFIG_COLLECTION, today), defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.error("Error getting today's config:", error);
    return getDefaultConfig();
  }
};

// Helper functions
const getDefaultConfig = () => ({
  behavior: "help_community",
  maxClicks: null,
  difficulty: "normal",
  description: "Each click adds 1 point to community score"
});

const generateDailyConfig = async () => {
  // Get yesterday's votes
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  try {
    const votesQuery = query(
      collection(db, VOTES_COLLECTION),
      where("date", "==", yesterdayStr)
    );
    const votesSnapshot = await getDocs(votesQuery);
    
    const counts = { help_community: 0, make_harder: 0, limit_clicks: 0 };
    votesSnapshot.forEach((doc) => {
      const vote = doc.data();
      if (counts.hasOwnProperty(vote.voteOption)) {
        counts[vote.voteOption]++;
      }
    });
    
    // Determine winning option
    let winningOption = "help_community";
    let maxVotes = 0;
    for (const [option, count] of Object.entries(counts)) {
      if (count > maxVotes) {
        maxVotes = count;
        winningOption = option;
      }
    }
    
    // Generate config based on winning vote
    switch(winningOption) {
      case "help_community":
        return {
          behavior: "help_community",
          maxClicks: null,
          difficulty: "easy",
          description: "Each click adds 2 points to community score"
        };
      case "make_harder":
        return {
          behavior: "make_harder",
          maxClicks: null,
          difficulty: "hard",
          description: "Each click adds only 0.5 points to community score"
        };
      case "limit_clicks":
        return {
          behavior: "limit_clicks",
          maxClicks: 100,
          difficulty: "normal",
          description: "Limited to 100 total clicks today"
        };
      default:
        return getDefaultConfig();
    }
  } catch (error) {
    console.error("Error generating daily config:", error);
    return getDefaultConfig();
  }
};

// Initialize Firebase on app start
export const initFirebase = async () => {
  await initUser();
  return true;
};

export { db, auth };
