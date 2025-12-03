const raw = localStorage.getItem('lastResult');
const container = document.getElementById('reviewContainer');
const goRes = document.getElementById('goResult');
const goDash = document.getElementById('goDashboard');

if(!raw){
  container.innerHTML = '<p>No test data found. Please take a test first.</p>';
}else{
  const r = JSON.parse(raw);
  const qs = r.questions || [];
  let html = '';
  const letters = ['A','B','C','D'];
  qs.forEach(q=>{
    const your = q.selected;
    const correct = q.correct;
    const isCorrect = your === correct;
    html += `
      <div class="review-q">
        <div class="small-muted">${q.topicTitle}</div>
        <p><strong>Q${q.id}.</strong> ${q.text}</p>
        <ul style="list-style:none;padding-left:0">
    `;
    q.options.forEach((opt,idx)=>{
      const isUser = your === idx;
      const isCorr = correct === idx;
      let line = '';
      if(isCorr) line += '<span class="review-correct">✔ </span>';
      if(isUser && !isCorr) line += '<span class="review-wrong">✖ </span>';
      html += `<li>${line}<strong>${letters[idx]}.</strong> ${opt}</li>`;
    });
    html += `
        </ul>
        <p><strong>Your answer:</strong> ${
          your===null || your===undefined ? '<span class="review-wrong">Not answered</span>' :
          (isCorrect ? '<span class="review-correct">Correct</span>' : '<span class="review-wrong">Wrong</span>')
        }</p>
        <p><strong>Correct answer:</strong> ${letters[correct]}</p>
        <p class="small-muted">Explanation: Placeholder explanation for this question. You can replace this text with real solutions later.</p>
      </div>
    `;
  });
  container.innerHTML = html;
}

goRes.addEventListener('click', ()=> window.location.href='result.html');
goDash.addEventListener('click', ()=> window.location.href='dashboard.html');
