// ----- Data -----
const TOPICS = [
  {id:'credit', title:'Credit & Trade Finance'},
  {id:'ops', title:'Operations'},
  {id:'ga', title:'General Awareness'},
  {id:'apt', title:'Aptitude'}
];

let questions = [];
(function generateQuestions(){
  let id = 1;
  TOPICS.forEach(t=>{
    for(let i=0;i<50;i++){
      questions.push({
        id,
        topic: t.id,
        topicTitle: t.title,
        text: `${t.title} — Sample question ${i+1} (Q${id})`,
        options: [
          `Option A for Q${id}`,
          `Option B for Q${id}`,
          `Option C for Q${id}`,
          `Option D for Q${id}`
        ],
        correct: Math.floor(Math.random()*4),
        selected: null,
        visited: false,
        marked: false
      });
      id++;
    }
  });
})();

// ----- State -----
let currentTopic = TOPICS[0].id;
let currentIndex = 0;
let totalSeconds = 120*60;
let timerInterval = null;
let timerRunning = false;

// ----- DOM -----
const topicTabs = document.getElementById('topicTabs');
const paletteGrid = document.getElementById('paletteGrid');
const optionsWrapper = document.getElementById('optionsWrapper');
const qText = document.getElementById('qText');
const qIndex = document.getElementById('qIndex');
const topicLabel = document.getElementById('topicLabel');
const mainTimer = document.getElementById('mainTimer');
const countsText = document.getElementById('countsText');
const progressSummary = document.getElementById('progressSummary');

// ----- Helpers -----
function getStatus(q){
  if(!q.visited) return 'not-visited';
  if(q.marked && q.selected !== null) return 'marked-answered';
  if(q.marked && q.selected === null) return 'marked';
  if(!q.marked && q.selected !== null) return 'answered';
  return 'not-answered';
}

function formatTS(s){
  const m = Math.floor(s/60);
  const sec = s%60;
  return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
}

// ----- Tabs -----
function renderTabs(){
  topicTabs.innerHTML = '';
  TOPICS.forEach((t,idx)=>{
    const el = document.createElement('div');
    el.className = 'tab' + (idx===0 ? ' active' : '');
    el.textContent = t.title;
    el.dataset.topic = t.id;
    el.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      currentTopic = t.id;
      // jump to first question of this topic
      const firstIdx = questions.findIndex(q=>q.topic===currentTopic);
      if(firstIdx !== -1){
        renderQuestion(firstIdx);
      }
      renderPalette(); // palette shows only 50 Qs of this topic
    });
    topicTabs.appendChild(el);
  });
}

// ----- Palette -----
function renderPalette(){
  paletteGrid.innerHTML = '';
  questions.forEach((q,idx)=>{
    if(q.topic !== currentTopic) return; // only 50 of current section
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
  const status = getStatus(q);
  const btn = paletteGrid.querySelector(`[data-index="${idx}"]`);
  if(btn){
    btn.className = 'q-btn ' + status;
  }
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

// ----- Question render -----
function renderQuestion(idx){
  if(idx<0 || idx>=questions.length) return;
  currentIndex = idx;
  const q = questions[idx];
  q.visited = true;

  topicLabel.textContent = q.topicTitle;
  qText.textContent = q.text;
  qIndex.textContent = `${q.id} / ${questions.length}`;

  optionsWrapper.innerHTML = '';
  q.options.forEach((opt,i)=>{
    const row = document.createElement('label');
    row.className = 'option';
    row.innerHTML = `
      <input type="radio" name="opt" value="${i}" ${q.selected===i ? 'checked':''}/>
      <div>${opt}</div>
    `;
    row.querySelector('input').addEventListener('change', (e)=>{
      q.selected = parseInt(e.target.value);
      saveState();
      updatePaletteButton(idx);
      updateCounts();
    });
    optionsWrapper.appendChild(row);
  });
  updatePaletteButton(idx);
  updateCounts();
}

// ----- Navigation within topic -----
function nextInTopic(){
  const curTopic = questions[currentIndex].topic;
  for(let i=currentIndex+1;i<questions.length;i++){
    if(questions[i].topic === curTopic) return i;
  }
  // wrap
  for(let i=0;i<currentIndex;i++){
    if(questions[i].topic === curTopic) return i;
  }
  return currentIndex;
}
function prevInTopic(){
  const curTopic = questions[currentIndex].topic;
  for(let i=currentIndex-1;i>=0;i--){
    if(questions[i].topic === curTopic) return i;
  }
  // wrap from bottom
  for(let i=questions.length-1;i>currentIndex;i--){
    if(questions[i].topic === curTopic) return i;
  }
  return currentIndex;
}

// ----- Controls -----
document.getElementById('nextBtn').addEventListener('click', ()=>{
  renderQuestion(nextInTopic());
});
document.getElementById('prevBtn').addEventListener('click', ()=>{
  renderQuestion(prevInTopic());
});
document.getElementById('clearBtn').addEventListener('click', ()=>{
  const q = questions[currentIndex];
  q.selected = null;
  saveState();
  renderQuestion(currentIndex);
});
document.getElementById('clearResponseBtn').addEventListener('click', ()=>{
  const q = questions[currentIndex];
  q.selected = null;
  saveState();
  renderQuestion(currentIndex);
});
document.getElementById('reviewBtn').addEventListener('click', ()=>{
  const q = questions[currentIndex];
  q.marked = !q.marked; // toggle
  saveState();
  renderQuestion(currentIndex);
});
document.getElementById('markReviewNextBtn').addEventListener('click', ()=>{
  const q = questions[currentIndex];
  q.marked = true;
  saveState();
  renderQuestion(nextInTopic());
});
document.getElementById('saveNextBtn').addEventListener('click', ()=>{
  saveState();
  renderQuestion(nextInTopic());
});

// ----- Timer & start -----
const startModal = document.getElementById('startModal');
document.getElementById('startTestBtn').addEventListener('click', ()=>{
  startModal.style.display='none';
  startTimer();
});

function startTimer(){
  if(timerRunning) return;
  timerRunning = true;
  const saved = localStorage.getItem('treasury_timer_ts');
  if(saved){
    const rem = parseInt(saved);
    if(!isNaN(rem)) totalSeconds = rem;
  }
  mainTimer.textContent = formatTS(totalSeconds);
  timerInterval = setInterval(()=>{
    if(totalSeconds<=0){
      clearInterval(timerInterval);
      alert('Time is up. Test will be submitted.');
      submitTest(true);
      return;
    }
    mainTimer.textContent = formatTS(totalSeconds);
    localStorage.setItem('treasury_timer_ts', String(totalSeconds));
    totalSeconds--;
  },1000);
}

// ----- Persistence -----
function saveState(){
  const data = {
    questions: questions.map(q=>({
      selected:q.selected,
      visited:q.visited,
      marked:q.marked
    })),
    currentIndex,
    totalSeconds
  };
  localStorage.setItem('treasury_state_v2', JSON.stringify(data));
}

function loadState(){
  const raw = localStorage.getItem('treasury_state_v2');
  if(!raw) return;
  try{
    const data = JSON.parse(raw);
    if(data && Array.isArray(data.questions)){
      data.questions.forEach((s,idx)=>{
        if(idx<questions.length){
          questions[idx].selected = s.selected;
          questions[idx].visited = !!s.visited;
          questions[idx].marked = !!s.marked;
        }
      });
    }
    if(typeof data.currentIndex === 'number') currentIndex = data.currentIndex;
    if(typeof data.totalSeconds === 'number') totalSeconds = data.totalSeconds;
  }catch(e){
    console.warn('Failed to load saved state', e);
  }
}
loadState();

window.addEventListener('beforeunload', ()=>{
  saveState();
  localStorage.setItem('treasury_timer_ts', String(totalSeconds));
});

// ----- Submit & results -----
function submitTest(auto){
  if(!auto){
    if(!confirm('Are you sure you want to submit the test?')) return;
  }
  if(timerInterval) clearInterval(timerInterval);

  const total = questions.length;
  let correct = 0, wrong = 0, unattempted = 0;
  const breakdown = {};
  TOPICS.forEach(t=>{
    breakdown[t.id] = {title:t.title,total:0,attempted:0,correct:0};
  });

  questions.forEach(q=>{
    breakdown[q.topic].total++;
    if(q.selected === null || q.selected === undefined){
      unattempted++;
    }else{
      breakdown[q.topic].attempted++;
      if(q.selected === q.correct){
        correct++;
        breakdown[q.topic].correct++;
      }else{
        wrong++;
      }
    }
  });

  const score = correct*1 - wrong*0.25;

  // strong / weak areas by accuracy
  const areas = Object.values(breakdown).map(b=>{
    const acc = b.attempted ? b.correct / b.attempted : 0;
    return {title:b.title, accuracy:acc, correct:b.correct, total:b.total};
  }).sort((a,b)=> b.accuracy - a.accuracy);
  const strong = areas[0];
  const weak = areas[areas.length-1];

  let html = `
    <p class="small-muted">Total Questions: ${total}</p>
    <p style="font-size:18px;font-weight:800">Score: ${score.toFixed(2)} / ${total}</p>
    <p>Correct: ${correct} | Wrong: ${wrong} | Unattempted: ${unattempted}</p>
    <h4>Per-topic breakdown</h4>
    <ul>
  `;
  areas.forEach(a=>{
    html += `<li><strong>${a.title}</strong> — Accuracy: ${(a.accuracy*100).toFixed(1)}% (Correct: ${a.correct} / ${a.total})</li>`;
  });
  html += `</ul>
    <h4>Insights</h4>
    <p><strong>Strong Area:</strong> ${strong.title}</p>
    <p><strong>Weak Area:</strong> ${weak.title}</p>
    <p class="small-muted">Tip: Focus first on your weakest area. Re-attempt those questions and analyze why you got them wrong.</p>
  `;
  document.getElementById('resultSummary').innerHTML = html;
  document.getElementById('resultModal').style.display='flex';
}

// submit & modal close listeners
document.getElementById('submitBtn').addEventListener('click', ()=>submitTest(false));
document.getElementById('closeModal').addEventListener('click', ()=>{
  document.getElementById('resultModal').style.display='none';
});

// ----- Initial render -----
renderTabs();
// start at first question of first topic
const firstIdx = questions.findIndex(q=>q.topic===currentTopic);
if(firstIdx !== -1) renderQuestion(firstIdx);
renderPalette();
