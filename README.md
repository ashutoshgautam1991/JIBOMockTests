Treasury Mock Test Portal (Flat Structure)

Files:
- index.html        : Login (Google + Email/Password via Firebase)
- dashboard.html    : Test list / dashboard
- test.html         : Full 200-question mock test
- result.html       : Result and section-wise analysis
- review.html       : Question-by-question review
- style.css         : Shared styling
- firebase-config.js: Put your Firebase config here
- auth.js           : Login / signup logic
- dashboard.js      : Dashboard behaviour
- test.js           : Test engine logic
- result.js         : Result screen logic
- review.js         : Review screen logic

Usage:
1. Create a Firebase project, enable Email/Password and Google sign-in, and paste your config into firebase-config.js.
2. Upload all these files to the ROOT of your GitHub repo (main branch).
3. Enable GitHub Pages (Settings → Pages → Deploy from branch → main → /(root)).
4. Open your GitHub Pages URL + `/index.html` to access the login page.
