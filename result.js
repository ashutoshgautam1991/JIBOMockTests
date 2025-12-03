const dataRaw = localStorage.getItem('lastResult');
const scoreDiv = document.getElementById('scoreSummary');
const topicDiv = document.getElementById('topicSummary');
const goDash = document.getElementById('goDashboard');
const goRev = document.getElementById('goReview');

if(!dataRaw){
  scoreDiv.innerHTML = '<p>No result found. Please take a test first.</p>';
}else{
  const r = JSON.parse(dataRaw);
  scoreDiv.innerHTML = `
    <p class="small-muted">${r.testId}</p>
    <p style="font-size:22px;font-weight:800">Score: ${r.score.toFixed(2)} / ${r.total}</p>
    <p>Correct: ${r.correct} | Wrong: ${r.wrong} | Unattempted: ${r.unattempted}</p>
    <p><strong>Strong Area:</strong> ${r.strong.title} &nbsp; | &nbsp;
       <strong>Weak Area:</strong> ${r.weak.title}</p>
  `;
  topicDiv.innerHTML = '';
  r.areas.forEach(a=>{
    const div = document.createElement('div');
    div.className='summary-card';
    div.innerHTML = `
      <h4>${a.title}</h4>
      <p>Correct: ${a.correct} / ${a.total}</p>
      <p>Accuracy: ${(a.accuracy*100).toFixed(1)}%</p>
    `;
    topicDiv.appendChild(div);
  });
}

goDash.addEventListener('click', ()=> window.location.href='dashboard.html');
goRev.addEventListener('click', ()=> window.location.href='review.html');
