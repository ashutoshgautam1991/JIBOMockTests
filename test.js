// Topics
const TOPICS = [
  { id:'credit', title:'Credit & Trade Finance' },
  { id:'ops', title:'Operations' },
  { id:'ga', title:'General Awareness' },
  { id:'apt', title:'Aptitude' }
];

let questions = [];
(function generate(){
  let id = 1;
  TOPICS.forEach(t=>{
    for(let i=0;i<50;i++){
      questions.push({
        id,
        topic:t.id,
        topicTitle:t.title,
        text: `${t.title} — Sample question ${i+1} (Q${id})`,
        options:[
          `Option A for Q${id}`,
          `Option B for Q${id}`,
          `Option C for Q${id}`,
          `Option D for Q${id}`
        ],
        correct: Math.floor(Math.random()*4),
        selected: null,
        visited:false,
        marked:false
      });
      id++;
    }
  });
})();

let currentTopic = TOPICS[0].id;
let currentIndex = 0;
let totalSeconds = 120*60;
let timerInterval = null;
let timerRunning = false;

// DOM
const topicTabs = document.getElementById('topicTabs');
const paletteGrid = document.getElementById('paletteGrid');
const optionsWrapper = document.getElementById('optionsWrapper');
const qText = document.getElementById('qText');
const qIndex = document.getElementById('qIndex');
const topicLabel = document.getElementById('topicLabel');
const mainTimer = document.getElementById('mainTimer');
const countsText = document.getElementById('countsText');
const progressSummary = document.getElementById('progressSummary');
const userEmailEl = document.getElementById('userEmail');

const startModal = document.getElementById('startModal');
const startBtn = document.getElementById('startTestBtn');
const topbarTitle = document.getElementById('topbarTitle');
const testTitleEl = document.getElementById('testTitle');

const currentTestId = localStorage.getItem('currentTestId') || 'treasury_full_1';
topbarTitle.textContent = currentTestId === 'treasury_full_2' ? 'Treasury Full Mock Test #2' : 'Treasury Full Mock Test #1';
testTitleEl.textContent = topbarTitle.textContent;

// Auth guard
auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href = 'index.html';
  }else{
    userEmailEl.textContent = user.email || user.displayName || '';
  }
});

document.getElementById('exitBtn').addEventListener('click', ()=>{
  if(confirm('Exit test and return to dashboard? Your current attempt will be lost.')){
    window.location.href = 'dashboard.html';
  }
});

// Status logic
function getStatus(q){
  if(!q.visited) return 'not-visited';
  if(q.marked && q.selected !== null) return 'marked-answered';
  if(q.marked && q.selected === null) return 'marked';
  if(!q.marked && q.selected !== null) return 'answered';
  return 'not-answered';
}

function formatTS(s){
  const m = Math.floor(s/60), sec = s%60;
  return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
}

// Tabs
function renderTabs(){
  topicTabs.innerHTML='';
  TOPICS.forEach((t,idx)=>{
    const el = document.createElement('div');
    el.className = 'tab' + (idx===0?' active':'');
    el.textContent = t.title;
    el.dataset.topic = t.id;
    el.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      currentTopic = t.id;
      const firstIdx = questions.findIndex(q=>q.topic===currentTopic);
      if(firstIdx!==-1) renderQuestion(firstIdx);
      renderPalette();
    });
    topicTabs.appendChild(el);
  });
}

// Palette
function renderPalette(){
  paletteGrid.innerHTML='';
  questions.forEach((q,idx)=>{
    if(q.topic!==currentTopic) return;
    const btn = document.createElement('div');
    btn.className = 'q-btn ' + getStatus(q);
    btn.textContent = q.id;
    btn.dataset.index = idx;
    btn.addEventListener('click', ()=> renderQuestion(idx));
    paletteGrid.appendChild(btn);
  });
  updateCounts();
}
function updatePaletteButton(idx){
  const q = questions[idx];
  if(q.topic!==currentTopic) return;
  const btn = paletteGrid.querySelector(`[data-index="${idx}"]`);
  if(btn) btn.className = 'q-btn ' + getStatus(q);
}
function updateCounts(){
  const total = questions.length;
  let visited=0, answered=0, marked=0, notAnswered=0;
  questions.forEach(q=>{
    const st = getStatus(q);
    if(st!=='not-visited') visited++;
    if(st==='answered' || st==='marked-answered') answered++;
    if(st==='marked' || st==='marked-answered') marked++;
    if(st==='not-answered' || st==='marked') notAnswered++;
  });
  countsText.textContent = `Visited: ${visited} | Answered: ${answered} | Marked: ${marked} | Not Answered: ${notAnswered}`;
  progressSummary.textContent = `${answered} / ${total}`;
}

// Render question
function renderQuestion(idx){
  if(idx<0 || idx>=questions.length) return;
  currentIndex = idx;
  const q = questions[idx];
  q.visited = true;
  topicLabel.textContent = q.topicTitle;
  qText.textContent = q.text;
  qIndex.textContent = `${q.id} / ${questions.length}`;
  optionsWrapper.innerHTML='';
  q.options.forEach((opt,i)=>{
    const row = document.createElement('label');
    row.className='option';
    row.innerHTML = `
      <input type="radio" name="opt" value="${i}" ${q.selected===i?'checked':''}/>
      <div>${opt}</div>
    `;
    row.querySelector('input').addEventListener('change', e=>{
      q.selected = parseInt(e.target.value);
      updatePaletteButton(idx);
      updateCounts();
    });
    optionsWrapper.appendChild(row);
  });
  renderPalette();
}

// Navigation within topic
function nextInTopic(){
  const topic = questions[currentIndex].topic;
  for(let i=currentIndex+1;i<questions.length;i++){
    if(questions[i].topic===topic) return i;
  }
  for(let i=0;i<currentIndex;i++){
    if(questions[i].topic===topic) return i;
  }
  return currentIndex;
}
function prevInTopic(){
  const topic = questions[currentIndex].topic;
  for(let i=currentIndex-1;i>=0;i--){
    if(questions[i].topic===topic) return i;
  }
  for(let i=questions.length-1;i>currentIndex;i--){
    if(questions[i].topic===topic) return i;
  }
  return currentIndex;
}

// Controls
document.getElementById('nextBtn').addEventListener('click', ()=> renderQuestion(nextInTopic()));
document.getElementById('prevBtn').addEventListener('click', ()=> renderQuestion(prevInTopic()));
document.getElementById('clearBtn').addEventListener('click', ()=>{
  questions[currentIndex].selected=null;
  renderQuestion(currentIndex);
});
document.getElementById('clearResponseBtn').addEventListener('click', ()=>{
  questions[currentIndex].selected=null;
  renderQuestion(currentIndex);
});
document.getElementById('reviewBtn').addEventListener('click', ()=>{
  questions[currentIndex].marked = !questions[currentIndex].marked;
  renderQuestion(currentIndex);
});
document.getElementById('markReviewNextBtn').addEventListener('click', ()=>{
  questions[currentIndex].marked = true;
  renderQuestion(nextInTopic());
});
document.getElementById('saveNextBtn').addEventListener('click', ()=>{
  renderQuestion(nextInTopic());
});

// Timer
function startTimer(){
  if(timerRunning) return;
  timerRunning = true;
  mainTimer.textContent = formatTS(totalSeconds);
  timerInterval = setInterval(()=>{
    if(totalSeconds<=0){
      clearInterval(timerInterval);
      alert('Time is up. Test will be submitted.');
      submitTest(true);
      return;
    }
    totalSeconds--;
    mainTimer.textContent = formatTS(totalSeconds);
  },1000);
}
startBtn.addEventListener('click', ()=>{
  startModal.style.display='none';
  startTimer();
  const firstIdx = questions.findIndex(q=>q.topic===currentTopic);
  if(firstIdx!==-1) renderQuestion(firstIdx);
});

// Submit
document.getElementById('submitBtn').addEventListener('click', ()=> submitTest(false));
document.getElementById('goToResult').addEventListener('click', ()=>{
  window.location.href = 'result.html';
});

function submitTest(auto){
  if(!auto){
    if(!confirm('Are you sure you want to submit the test?')) return;
  }
  if(timerInterval) clearInterval(timerInterval);

  const total = questions.length;
  let correct=0, wrong=0, unattempted=0;
  const breakdown = {};
  TOPICS.forEach(t=> breakdown[t.id] = {title:t.title,total:0,attempted:0,correct:0});

  questions.forEach(q=>{
    breakdown[q.topic].total++;
    if(q.selected===null || q.selected===undefined){
      unattempted++;
    }else{
      breakdown[q.topic].attempted++;
      if(q.selected===q.correct){
        correct++;
        breakdown[q.topic].correct++;
      }else{
        wrong++;
      }
    }
  });

  const score = correct*1 - wrong*0.25;

  const areas = Object.values(breakdown).map(b=>{
    const acc = b.attempted ? b.correct/b.attempted : 0;
    return {title:b.title,accuracy:acc,correct:b.correct,total:b.total};
  }).sort((a,b)=> b.accuracy-a.accuracy);

  const strong = areas[0];
  const weak = areas[areas.length-1];

  const resultPayload = {
    testId: currentTestId,
    score,
    correct,
    wrong,
    unattempted,
    total,
    breakdown,
    areas,
    strong,
    weak,
    questions: questions.map(q=>({
      id:q.id,
      topic:q.topic,
      topicTitle:q.topicTitle,
      text:q.text,
      options:q.options,
      correct:q.correct,
      selected:q.selected
    }))
  };

  localStorage.setItem('lastResult', JSON.stringify(resultPayload));

  const rs = document.getElementById('resultSummary');
  rs.innerHTML = `
    <p class="small-muted">Total Questions: ${total}</p>
    <p style="font-size:18px;font-weight:800">Score: ${score.toFixed(2)} / ${total}</p>
    <p>Correct: ${correct} | Wrong: ${wrong} | Unattempted: ${unattempted}</p>
    <p class="small-muted">Click "View Detailed Result" for section-wise analysis &amp; review.</p>
  `;
  document.getElementById('resultModal').style.display='flex';
}

// Init
renderTabs();
const firstIdx = questions.findIndex(q=>q.topic===currentTopic);
if(firstIdx!==-1) renderQuestion(firstIdx);
renderPalette();
