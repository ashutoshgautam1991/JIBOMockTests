/* Mock Test engine (200 Qs) */
/* Data generation: 200 sample questions, 50 per topic */
const TOPICS = [
  {id:'credit', title:'Credit & Trade Finance'},
  {id:'ops', title:'Operations'},
  {id:'ga', title:'General Awareness'},
  {id:'apt', title:'Aptitude'}
];

let questions = [];
(function generate(){
  let id = 1;
  TOPICS.forEach((t,ti)=>{
    for(let i=0;i<50;i++){
      questions.push({
        id: id,
        topic: t.id,
        topicTitle: t.title,
        text: `${t.title} — Sample question ${i+1} (Q${id})`,
        options: [
          `Option A for Q${id}`,
          `Option B for Q${id}`,
          `Option C for Q${id}`,
          `Option D for Q${id}`
        ],
        correct: Math.floor(Math.random()*4), // placeholder
        selected: null,
        status: 'not-visited' // not-visited | visited | answered | marked
      });
      id++;
    }
  });
})();

/* State */
let currentIndex = 0; // absolute index in questions array (0..199)
let currentTopic = TOPICS[0].id;
let filteredIndexes = []; // indexes of current topic
let totalSeconds = 120*60; // 120 minutes
let timerInterval = null;
let timerRunning = false;

/* DOM refs */
const topicTabs = document.getElementById('topicTabs');
const paletteGrid = document.getElementById('paletteGrid');
const optionsWrapper = document.getElementById('optionsWrapper');
const qText = document.getElementById('qText');
const qIndex = document.getElementById('qIndex');
const topicLabel = document.getElementById('topicLabel');
const mainTimer = document.getElementById('mainTimer');
const miniTimer = document.getElementById('mainTimer'); // same display
const countsText = document.getElementById('countsText');
const progressSummary = document.getElementById('progressSummary');

/* Render tabs */
function renderTabs(){
  topicTabs.innerHTML = '';
  TOPICS.forEach((t, i)=>{
    const el = document.createElement('div');
    el.className = 'tab' + (i===0 ? ' active' : '');
    el.textContent = t.title;
    el.dataset.topic = t.id;
    el.addEventListener('click', ()=>{
      document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
      currentTopic = t.id;
      // jump to first question of that topic
      const idx = questions.findIndex(q=>q.topic===t.id);
      if(idx>=0){ goToQuestion(idx); }
      renderPalette(); // update palette to show range
    });
    topicTabs.appendChild(el);
  });
}
renderTabs();

/* Palette render (200 buttons) */
function renderPalette(){
  paletteGrid.innerHTML = '';
  questions.forEach((q, idx)=>{
    const b = document.createElement('div');
    b.className = 'q-btn ' + (q.status==='not-visited' ? 'not-visited' : (q.status==='answered' ? 'answered' : (q.status==='marked' ? 'marked' : 'not-answered')));
    b.textContent = q.id;
    b.dataset.index = idx;
    b.addEventListener('click', ()=> goToQuestion(idx));
    paletteGrid.appendChild(b);
  });
  updateCounts();
}

/* Update counts */
function updateCounts(){
  const total = questions.length;
  let visited=0, answered=0, marked=0, notAnswered=0;
  questions.forEach(q=>{
    if(q.status!=='not-visited') visited++;
    if(q.status==='answered') answered++;
    if(q.status==='marked') marked++;
    if(q.status!=='answered') notAnswered++;
  });
  countsText.textContent = `Visited: ${visited} | Answered: ${answered} | Marked: ${marked} | Not Answered: ${notAnswered}`;
  progressSummary.textContent = `${answered} / ${total}`;
}

/* Render a question by absolute index */
function renderQuestionByIndex(absIndex){
  if(absIndex<0 || absIndex>=questions.length) return;
  currentIndex = absIndex;
  const q = questions[absIndex];
  // if first time, set visited
  if(q.status==='not-visited') q.status='visited';
  topicLabel.textContent = q.topicTitle;
  qText.textContent = q.text;
  qIndex.textContent = `${q.id} / ${questions.length}`;

  // options
  optionsWrapper.innerHTML = '';
  q.options.forEach((opt, i)=>{
    const row = document.createElement('label');
    row.className = 'option';
    row.innerHTML = `<input type="radio" name="opt" value="${i}" ${q.selected===i? 'checked':''}/>
                     <div>${opt}</div>`;
    row.querySelector('input').addEventListener('change', (e)=>{
      q.selected = parseInt(e.target.value);
      q.status = 'answered';
      saveState();
      updatePaletteButton(absIndex);
      updateCounts();
    });
    optionsWrapper.appendChild(row);
  });
  updatePaletteButton(absIndex);
  updateCounts();
  // set filteredIndexes for current topic
  filteredIndexes = questions.map((qq,ii)=> qq.topic===currentTopic ? ii : -1).filter(i=>i>=0);
  // ensure navigation within filtered section uses proper bounds (we'll handle in next/prev)
}

/* Navigation helpers */
function goToQuestion(idx){
  renderQuestionByIndex(idx);
  // if clicked from tab, ensure we show first of that section if idx not in that topic (handled by tab)
}

/* Update a single palette button */
function updatePaletteButton(i){
  const btn = paletteGrid.querySelector(`[data-index="${i}"]`);
  if(!btn) return;
  const q = questions[i];
  btn.className = 'q-btn ' + (q.status==='not-visited' ? 'not-visited' : (q.status==='answered' ? 'answered' : (q.status==='marked' ? 'marked' : 'not-answered')));
}

/* Controls wiring */
document.getElementById('nextBtn').addEventListener('click', ()=>{
  // move to next within same topic
  const curTopic = questions[currentIndex].topic;
  // find current position within topic
  const idxInTopic = questions.findIndex((q,i)=> q.topic===curTopic && i===currentIndex);
  // find next index in same topic
  let next = -1;
  for(let i=currentIndex+1;i<questions.length;i++){
    if(questions[i].topic===curTopic){ next=i; break; }
  }
  if(next===-1){
    // wrap to first in topic
    next = questions.findIndex(q=>q.topic===curTopic);
  }
  if(next!==-1) goToQuestion(next);
});

document.getElementById('prevBtn').addEventListener('click', ()=>{
  const curTopic = questions[currentIndex].topic;
  let prev = -1;
  for(let i=currentIndex-1;i>=0;i--){
    if(questions[i].topic===curTopic){ prev=i; break; }
  }
  if(prev===-1){
    // wrap to last in topic
    for(let i=questions.length-1;i>=0;i--){
      if(questions[i].topic===curTopic){ prev=i; break; }
    }
  }
  if(prev!==-1) goToQuestion(prev);
});

document.getElementById('clearBtn').addEventListener('click', ()=>{
  const q = questions[currentIndex];
  q.selected = null;
  if(q.status==='answered') q.status='visited';
  // uncheck inputs
  document.querySelectorAll('input[name="opt"]').forEach(i=>i.checked=false);
  updatePaletteButton(currentIndex);
  updateCounts();
  saveState();
});

document.getElementById('reviewBtn').addEventListener('click', ()=>{
  const q = questions[currentIndex];
  q.status = (q.status==='marked') ? 'visited' : 'marked';
  updatePaletteButton(currentIndex);
  updateCounts();
  saveState();
});

document.getElementById('markReviewNextBtn').addEventListener('click', ()=>{
  const q = questions[currentIndex];
  q.status = 'marked';
  updatePaletteButton(currentIndex);
  updateCounts();
  saveState();
  // move next in same topic
  document.getElementById('nextBtn').click();
});

document.getElementById('clearResponseBtn').addEventListener('click', ()=>{
  document.getElementById('clearBtn').click();
});

document.getElementById('saveNextBtn').addEventListener('click', ()=>{
  document.getElementById('nextBtn').click();
});

document.getElementById('submitBtn').addEventListener('click', submitTest);

/* Timer: starts after pressing Start Test */
const startModal = document.getElementById('startModal');
document.getElementById('startTestBtn').addEventListener('click', ()=>{
  startModal.style.display = 'none';
  startTimer();
  // start at first question of current topic
  const firstIdx = questions.findIndex(q=> q.topic===currentTopic);
  if(firstIdx>=0) goToQuestion(firstIdx);
});

/* Timer logic with persistence */
function formatTS(s){
  const mm = Math.floor(s/60);
  const ss = s%60;
  return String(mm).padStart(2,'0') + ':' + String(ss).padStart(2,'0');
}

function startTimer(){
  if(timerRunning) return;
  timerRunning = true;
  // try load saved time if exists and started previously
  const saved = localStorage.getItem('treasury_timer_ts');
  if(saved){
    const rem = parseInt(saved);
    if(!isNaN(rem)) totalSeconds = rem;
  }
  timerInterval = setInterval(()=>{
    if(totalSeconds<=0){
      clearInterval(timerInterval);
      alert('Time is up — test will be submitted automatically.');
      submitTest();
      return;
    }
    mainTimer.textContent = formatTS(totalSeconds);
    localStorage.setItem('treasury_timer_ts', String(totalSeconds));
    totalSeconds--;
  },1000);
}

/* Persistence: save answers & statuses */
function saveState(){
  const data = {
    qstate: questions.map(q=>({selected:q.selected,status:q.status})),
    currentIndex,
    totalSeconds
  };
  localStorage.setItem('treasury_state_v1', JSON.stringify(data));
}

function loadState(){
  const raw = localStorage.getItem('treasury_state_v1');
  if(!raw) return;
  try{
    const data = JSON.parse(raw);
    if(data && data.qstate){
      data.qstate.forEach((s,idx)=>{
        if(typeof s.selected!=='undefined') questions[idx].selected = s.selected;
        if(typeof s.status==='string') questions[idx].status = s.status;
      });
    }
    if(typeof data.currentIndex==='number') currentIndex = data.currentIndex;
    if(typeof data.totalSeconds==='number') totalSeconds = data.totalSeconds;
  }catch(e){ console.warn('loadState failed', e); }
}
loadState();
renderPalette();
/* If there is a saved currentIndex, jump to it; else first topic first q */
if(questions[currentIndex] && questions[currentIndex].topic===currentTopic){
  // show saved pos but do not start timer until user clicks Start
  renderQuestionByIndex(currentIndex);
} else {
  const firstIdx = questions.findIndex(q=>q.topic===currentTopic);
  if(firstIdx>=0) renderQuestionByIndex(firstIdx);
}

/* Autosave before unload */
window.addEventListener('beforeunload', ()=>{
  saveState();
  localStorage.setItem('treasury_timer_ts', String(totalSeconds));
});

/* Submit & scoring */
function submitTest(auto=false){
  if(!auto && !confirm('Are you sure you want to submit the test?')) return;
  // stop timer
  if(timerInterval) clearInterval(timerInterval);
  // compute score and breakdown
  const total = questions.length;
  let correct=0, wrong=0, unattempted=0;
  const breakdown = {};
  TOPICS.forEach(t=> breakdown[t.id] = {title:t.title,total:0,correct:0,attempted:0});
  questions.forEach(q=>{
    breakdown[q.topic].total++;
    if(q.selected===null){ unattempted++; }
    else {
      breakdown[q.topic].attempted++;
      if(q.selected===q.correct){ correct++; breakdown[q.topic].correct++; }
      else { wrong++; }
    }
  });
  const score = (correct*1) - (wrong*0.25);
  // identify strong & weak areas: accuracy per topic
  const areas = [];
  TOPICS.forEach(t=>{
    const b = breakdown[t.id];
    const acc = b.attempted ? (b.correct / b.attempted) : 0;
    areas.push({topic:b.title, accuracy:acc, correct:b.correct, total:b.total});
  });
  areas.sort((a,b)=> b.accuracy - a.accuracy);
  const strong = areas[0].topic;
  const weak = areas[areas.length-1].topic;

  // prepare result HTML
  let html = `<p class="small-muted">Total Questions: ${total}</p>
              <p style="font-size:18px;font-weight:800">Score: ${score.toFixed(2)} / ${total}</p>
              <p>Correct: ${correct} | Wrong: ${wrong} | Unattempted: ${unattempted}</p>
              <h4>Per-topic breakdown</h4>
              <ul>`;
  areas.forEach(a=>{
    html += `<li><strong>${a.topic}</strong> — Accuracy: ${(a.accuracy*100).toFixed(1)}% (Correct: ${a.correct} / ${a.total})</li>`;
  });
  html += `</ul>
           <h4>Insights</h4>
           <p><strong>Strong Area:</strong> ${strong}</p>
           <p><strong>Weak Area:</strong> ${weak}</p>
           <p class="small-muted">Suggestions: Focus on the weak area first. Review incorrect questions in that section and practice topic-wise tests.</p>`;
  document.getElementById('resultSummary').innerHTML = html;
  document.getElementById('resultModal').style.display = 'flex';
  // clear saved state so next run is fresh (optional)
  // localStorage.removeItem('treasury_state_v1');
}

/* close modal */
document.getElementById('closeModal').addEventListener('click', ()=>{
  document.getElementById('resultModal').style.display = 'none';
});

/* helper: renderQuestionByIndex used earlier but forward declaration wasnt hoisted */
function renderQuestionByIndex(absIndex){
  if(absIndex<0 || absIndex>=questions.length) return;
  currentIndex = absIndex;
  const q = questions[absIndex];
  if(q.status==='not-visited') q.status='visited';
  topicLabel.textContent = q.topicTitle;
  qText.textContent = q.text;
  qIndex.textContent = `${q.id} / ${questions.length}`;

  // render options
  optionsWrapper.innerHTML = '';
  q.options.forEach((opt, i)=>{
    const row = document.createElement('label');
    row.className = 'option';
    row.innerHTML = `<input type="radio" name="opt" value="${i}" ${q.selected===i? 'checked':''}/>
                     <div>${opt}</div>`;
    row.querySelector('input').addEventListener('change', (e)=>{
      q.selected = parseInt(e.target.value);
      q.status = 'answered';
      updatePaletteButton(absIndex);
      updateCounts();
      saveState();
    });
    optionsWrapper.appendChild(row);
  });
  updatePaletteButton(absIndex);
  updateCounts();
}

/* initial render of palette buttons */
renderPalette();

/* utility: jump to first of current topic when tab clicked handled in renderTabs via goToQuestion on click */

/* ensure palette buttons clickable after initial render (delegation) */
paletteGrid.addEventListener('click', (ev)=>{
  const btn = ev.target.closest('.q-btn');
  if(btn) {
    const idx = parseInt(btn.dataset.index);
    if(!isNaN(idx)) renderQuestionByIndex(idx);
  }
});
