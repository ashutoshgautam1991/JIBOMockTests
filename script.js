let t=7200;
let current=0;

let questions = Array.from({length:25}, (_,i)=>({
    text:'Sample question '+(i+1),
    options:['A','B','C','D'],
    correct:0,
    selected:null,
    status:'not-visited'
}));

function updateTimer(){
  t--;
  document.getElementById('timer').innerText=
    Math.floor(t/60)+':'+String(t%60).padStart(2,'0');
}
setInterval(updateTimer,1000);

function loadQuestion(){
  let q=questions[current];
  q.status = q.status==="not-visited" ? "not-answered" : q.status;

  document.getElementById("q-title").innerText="Question "+(current+1);
  document.getElementById("q-text").innerText=q.text;

  let optHTML="";
  q.options.forEach((o,i)=>{
    optHTML += '<label><input type="radio" name="opt" onclick="selectOption('+i+')" '+(q.selected===i?'checked':'')+'> '+o+'</label><br>';
  });
  document.getElementById("options").innerHTML=optHTML;

  renderGrid();
}

function selectOption(i){
  questions[current].selected=i;
  questions[current].status="answered";
}

function saveNext(){
  if(current<24){current++;loadQuestion();}
}

function clearResponse(){
  questions[current].selected=null;
  questions[current].status="not-answered";
  loadQuestion();
}

function markForReview(){
  questions[current].status="review";
  if(current<24){current++;loadQuestion();}
}

function renderGrid(){
  let g=document.getElementById("q-grid");
  g.innerHTML="";
  questions.forEach((q,i)=>{
    let c="not-visited";
    if(q.status==="answered") c="answered";
    else if(q.status==="not-answered") c="not-answered";
    else if(q.status==="review") c="review";

    g.innerHTML += '<button onclick="goTo('+i+')" class="'+c+'">'+(i+1)+'</button>';
  });
}

function goTo(i){
  current=i;
  loadQuestion();
}

function submitTest(){
  let total=25, correct=0, wrong=0, unattempted=0;

  questions.forEach(q=>{
    if(q.selected===null) unattempted++;
    else if(q.selected===q.correct) correct++;
    else wrong++;
  });

  let score = correct*1 - wrong*0.25;

  document.getElementById("result").classList.remove("hidden");
  document.getElementById("result").innerHTML = 
    "<h2>Result</h2>"+
    "<p>Correct: "+correct+"</p>"+
    "<p>Wrong: "+wrong+"</p>"+
    "<p>Unattempted: "+unattempted+"</p>"+
    "<p><b>Score: "+score+"</b></p>"+
    "<h3>Weak Areas</h3><p>Coming soon</p>"+
    "<h3>Strong Areas</h3><p>Coming soon</p>";
}

loadQuestion();
