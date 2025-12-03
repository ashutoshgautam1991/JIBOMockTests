const TESTS = [{"id": "treasury_full_1", "name": "Treasury Full Mock Test #1", "sections": "Credit, Ops, GA, Aptitude", "duration": "120 min", "questions": 200}, {"id": "treasury_full_2", "name": "Treasury Full Mock Test #2", "sections": "Credit, Ops, GA, Aptitude", "duration": "120 min", "questions": 200}];
const tbody = document.getElementById('testTableBody');
const userEmailEl = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

auth.onAuthStateChanged(user=>{
  if(!user){
    window.location.href = 'index.html';
  }else{
    userEmailEl.textContent = user.email || user.displayName || 'Logged in';
  }
});

function renderTests(){
  tbody.innerHTML = '';
  TESTS.forEach(t=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.name}</td>
      <td>${t.sections}</td>
      <td>${t.duration}</td>
      <td>${t.questions}</td>
      <td><button class="btn small primary" data-id="${t.id}">Start</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('button').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      localStorage.setItem('currentTestId', id);
      window.location.href = 'test.html';
    });
  });
}

logoutBtn.addEventListener('click', async ()=>{
  await auth.signOut();
  window.location.href = 'index.html';
});

renderTests();
