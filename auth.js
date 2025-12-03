const googleBtn = document.getElementById('googleBtn');
const emailForm = document.getElementById('emailForm');
const signupBtn = document.getElementById('signupBtn');
const msgEl = document.getElementById('authMessage');

function showMsg(text, isError=false){
  msgEl.textContent = text;
  msgEl.style.color = isError ? '#dc3545' : '#555';
}

googleBtn.addEventListener('click', async ()=>{
  try{
    const provider = new firebase.auth.GoogleAuthProvider();
    await auth.signInWithPopup(provider);
    showMsg('Logged in with Google. Redirecting...');
    window.location.href = 'dashboard.html';
  }catch(e){
    console.error(e);
    showMsg(e.message, true);
  }
});

emailForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('emailInput').value.trim();
  const pass = document.getElementById('passwordInput').value.trim();
  try{
    await auth.signInWithEmailAndPassword(email, pass);
    showMsg('Login successful. Redirecting...');
    window.location.href = 'dashboard.html';
  }catch(e){
    showMsg(e.message, true);
  }
});

signupBtn.addEventListener('click', async ()=>{
  const email = document.getElementById('emailInput').value.trim();
  const pass = document.getElementById('passwordInput').value.trim();
  if(!email || !pass){
    showMsg('Enter email and password to sign up.', true);
    return;
  }
  try{
    await auth.createUserWithEmailAndPassword(email, pass);
    showMsg('Sign up successful. Redirecting...');
    window.location.href = 'dashboard.html';
  }catch(e){
    showMsg(e.message, true);
  }
});

// If already logged in, you could auto-redirect to dashboard
auth.onAuthStateChanged(user=>{
  if(user){
    // optional auto redirect:
    // window.location.href = 'dashboard.html';
  }
});
