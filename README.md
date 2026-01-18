# Push or Pass - Daily Community Button Game

A React-based daily game where the community votes on tomorrow's button behavior, then everyone plays with today's button.

## 🎮 Features

- **Daily Voting**: Vote on 3 different button behaviors for tomorrow
- **Interactive Gameplay**: Push the button to earn points and help the community
- **Daily Reset**: Game resets automatically at midnight UTC
- **Leaderboard**: Track top players and your ranking
- **Community Score**: Collective score that everyone contributes to

## 📁 Project Structure
pushpass/
├── public/ # Static assets
├── src/
│ ├── components/ # React components
│ │ ├── VotePanel.js # Voting interface
│ │ ├── ButtonGame.js # Game interface
│ │ └── Leaderboard.js # Leaderboard display
│ ├── utils/ # Utility functions
│ │ ├── dailyReset.js # Daily reset logic
│ │ └── tallyVotes.js # Vote tallying logic
│ ├── data/ # Sample data files
│ │ ├── votes.json # Vote history
│ │ └── outcomes.json # Game outcomes
│ ├── App.js # Main app component
│ └── index.js # App entry point
├── package.json
└── README.md

text

## 🚀 Getting Started

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd pushpass
   npm install
Run development server:

bash
npm start
Open http://localhost:3000 in your browser.

Build for production:

bash
npm run build
📊 Game Flow
Voting Phase (Daily):

Users vote on one of three options for tomorrow's button behavior

Options: "Help the community", "Make it harder", "Limit clicks"

Votes are tallied at midnight UTC

Play Phase (Next Day):

Button behavior is determined by yesterday's vote results

Users can push the button a limited number of times

Each push contributes to the community score

Daily Reset:

Game resets automatically at midnight UTC

New button behavior applied based on votes

Player daily counters reset

🎯 Game Modes
Based on community votes:

Help the Community:

Each push adds bonus points to community score

Generous push limits

Make it Harder:

Fewer pushes allowed

Higher points per push

Challenge mode

Limit Clicks:

Strict push limits per player

Strategic gameplay

Efficient pushing required

🌐 Deployment
Deploy to Vercel:
Push your code to GitHub

Connect your repository to Vercel

Configure build settings:

Build Command: npm run build

Output Directory: build

Install Command: npm install

Deploy!

Environment Variables:
No environment variables required for MVP.

🛠 Technologies Used
React 18

React Router DOM

LocalStorage for data persistence

CSS3 with modern features

Responsive design

📱 Features in Detail
VotePanel Component:
Three voting options with descriptions

Real-time vote statistics

One vote per user per day

Visual feedback on selection

ButtonGame Component:
Interactive push button with animations

Real-time score updates

Daily push limits

Streak tracking

Recent activity feed

Leaderboard Component:
Top player rankings

Multiple time filters

User rank display

Community statistics

🔄 Data Persistence
LocalStorage: Used for MVP data persistence

votes.json: Sample vote data

outcomes.json: Sample game outcomes

🎨 Design Principles
Clean, playful interface

Gradient backgrounds

Smooth animations

Mobile-responsive

Intuitive navigation

🤝 Contributing
Fork the repository

Create a feature branch

Commit your changes

Push to the branch

Open a Pull Request

📄 License
MIT License - see LICENSE file for details.

🙏 Acknowledgments
Inspired by Reddit's daily games community

Built with React and modern web technologies

Designed for community interaction

Made with ❤️ for the Devvit Hackathon
