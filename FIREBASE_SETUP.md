# PUSH OR PASS - FIREBASE SETUP INSTRUCTIONS

## 1. CREATE FIREBASE PROJECT
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "push-or-pass"
4. Disable Google Analytics (for simplicity)
5. Click "Create project"

## 2. CREATE WEB APP
1. In Firebase Console, click "Web" icon (</>)
2. Register app: "push-or-pass-web"
3. Copy the Firebase configuration object
4. Replace the config in `src/firebase/config.js` with your actual values

## 3. SET UP FIRESTORE DATABASE
1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in "production mode"
4. Choose location closest to your users
5. Click "Enable"

## 4. SET UP SECURITY RULES
1. Go to "Rules" tab in Firestore
2. Replace with these rules:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

3. Click "Publish"

NOTE: These rules allow anyone to read/write. For production, implement proper authentication rules.

## 5. ENABLE ANONYMOUS AUTH
1. Go to "Authentication" in Firebase Console
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Anonymous" provider
5. Click "Save"

## 6. UPDATE CONFIG FILE
Replace the placeholder values in `src/firebase/config.js`:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

## 7. DEPLOY TO VERCEL
1. Push code to GitHub repository
2. Go to https://vercel.com
3. Import your GitHub repository
4. Deploy!

## 8. TEST THE APP
1. Open your deployed app
2. Test voting (should work across users)
3. Test clicking (should update real-time)
4. Check leaderboard (should show real users)

## TROUBLESHOOTING
- If votes/clicks don't save: Check Firebase console for errors
- If leaderboard empty: Wait for clicks to be recorded
- If authentication fails: Enable Anonymous auth in Firebase
- If Firestore errors: Check security rules

## PRODUCTION NOTES
For production deployment:
1. Implement proper Firestore security rules
2. Add rate limiting
3. Set up Firebase Analytics
4. Configure proper error handling
5. Add loading states and error boundaries
