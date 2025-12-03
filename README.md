# Treasury Mock Test Engine (Final v2)

Features:
- 200 questions (sample text), 50 per section:
  - Credit & Trade Finance
  - Operations
  - General Awareness
  - Aptitude
- 120-minute timer (starts when you click "Start Test")
- Right-side question palette:
  - Shows only 50 questions for the current section
  - Colors:
    - Gray = Not Visited
    - Red = Not Answered
    - Green = Answered
    - Orange = Marked for Review
    - Purple = Marked & Answered
- Mark for Review / Mark & Next / Clear Response / Save & Next
- Auto-save of answers and timer in browser (localStorage)
- Scoring:
  - +1 for each correct answer
  - -0.25 for each wrong answer
  - 0 for unattempted
- Result analysis:
  - Overall score
  - Correct / Wrong / Unattempted
  - Per-topic accuracy
  - Strong and weak area suggestion

## How to use with GitHub Pages

1. Upload `index.html`, `style.css`, and `script.js` to the root of your repository's `main` branch.
2. In the repo, go to Settings → Pages.
3. Set:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: /(root)
4. Save and open the published URL.

To add real questions, edit the `questions` generation in `script.js` and replace the sample text and correct answers.
