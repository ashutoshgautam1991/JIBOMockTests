// Replace this config with your own Firebase project settings
// 1. Go to https://console.firebase.google.com
// 2. Create a project
// 3. Add a Web app
// 4. Copy the config object and paste it below

const firebaseConfig = {
  apiKey: "AIzaSyAHQbxW3pJyfEO287v3z7JsVyVYCxZxjm4",
  authDomain: "mocktests-4a6fd.firebaseapp.com",
  projectId: "mocktests-4a6fd",
  storageBucket: "mocktests-4a6fd.firebasestorage.app",
  messagingSenderId: "197235465736",
  appId: "1:197235465736:web:ea6959f1ba9009b1e67bbd"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
