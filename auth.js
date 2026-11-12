// ClearCut - Firebase Authentication (Email/Password + Google)
// ---------------------------------------------------------------
// 1. Create a project at https://console.firebase.google.com
// 2. Add a "Web app" and paste its config below.
// 3. Authentication > Sign-in method: enable "Email/Password" and "Google".
// 4. Authentication > Settings > Authorized domains: add your site domain
//    (e.g. shahzaibarshad8688-art.github.io).
// Until the config is filled in, the site keeps working and downloads stay open.
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  appId: "PASTE_YOUR_APP_ID"
};

const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
const $ = id => document.getElementById(id);
const configured = !!firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith('PASTE_');

let auth = null, fb = null;

/* ---------- UI helpers ---------- */
function setMsg(text, ok){
  const m = $('auth-msg');
  m.textContent = text || '';
  m.className = 'auth-msg' + (text ? (ok ? ' ok' : ' err') : '');
}
function setBusy(b){
  $('auth-submit').disabled = b;
  $('auth-google').disabled = b;
  $('auth-submit').textContent = b ? 'Please wait...' : (window.ccAuthMode === 'signup' ? 'Create Account' : 'Log In');
}
function friendly(err){
  const code = (err && err.code) || '';
  const map = {
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/missing-password': 'Please enter your password.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/email-already-in-use': 'An account with this email already exists. Please log in.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/too-many-requests': 'Too many attempts. Please wait a minute and try again.',
    'auth/network-request-failed': 'Network error. Check your internet connection.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Popup was blocked. Please allow popups and try again.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase (Authentication > Settings > Authorized domains).',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase.'
  };
  return map[code] || (err && err.message) || 'Something went wrong. Please try again.';
}

function renderUser(user){
  window.ccAuth.user = user || null;
  $('auth-guest').classList.toggle('hidden', !!user);
  $('auth-user').classList.toggle('hidden', !user);
  if (user){
    const name = user.displayName || (user.email || 'User').split('@')[0];
    $('user-name').textContent = name;
    const av = $('user-avatar');
    if (user.photoURL){ av.style.backgroundImage = 'url("' + user.photoURL + '")'; av.textContent = ''; }
    else { av.style.backgroundImage = ''; av.textContent = name.charAt(0).toUpperCase(); }
  }
}

function afterLogin(){
  setMsg('');
  window.closeAuth();
  window.runPendingAction();
}

/* ---------- Actions (exposed to the page) ---------- */
async function submitAuth(e){
  e.preventDefault();
  if (!configured) return setMsg('Login is not set up yet. Add your Firebase config in auth.js.');
  const email = $('auth-email').value.trim(), pass = $('auth-pass').value;
  setMsg(''); setBusy(true);
  try {
    if (window.ccAuthMode === 'signup'){
      const name = $('auth-name').value.trim();
      if (!name) throw { message: 'Please enter your name.' };
      const cred = await fb.createUserWithEmailAndPassword(auth, email, pass);
      await fb.updateProfile(cred.user, { displayName: name });
      renderUser(auth.currentUser);
    } else {
      await fb.signInWithEmailAndPassword(auth, email, pass);
    }
    afterLogin();
  } catch(err){ setMsg(friendly(err)); }
  finally { setBusy(false); }
}

async function googleLogin(){
  if (!configured) return setMsg('Login is not set up yet. Add your Firebase config in auth.js.');
  setMsg(''); setBusy(true);
  try {
    await fb.signInWithPopup(auth, new fb.GoogleAuthProvider());
    afterLogin();
  } catch(err){ setMsg(friendly(err)); }
  finally { setBusy(false); }
}

async function resetPassword(){
  if (!configured) return setMsg('Login is not set up yet. Add your Firebase config in auth.js.');
  const email = $('auth-email').value.trim();
  if (!email) return setMsg('Enter your email above, then click "Forgot password?" again.');
  try {
    await fb.sendPasswordResetEmail(auth, email);
    setMsg('Password reset link sent to ' + email + '. Check your inbox.', true);
  } catch(err){ setMsg(friendly(err)); }
}

async function logout(){
  if (auth) await fb.signOut(auth);
  renderUser(null);
}

$('auth-form').addEventListener('submit', submitAuth);
$('auth-google').addEventListener('click', googleLogin);
$('auth-forgot').addEventListener('click', resetPassword);
$('btn-logout').addEventListener('click', logout);

/* ---------- Init ---------- */
if (!configured){
  console.warn('[ClearCut] Firebase config missing in auth.js - login disabled, downloads stay open.');
} else {
  try {
    const [appMod, authMod] = await Promise.all([
      import(SDK + 'firebase-app.js'),
      import(SDK + 'firebase-auth.js')
    ]);
    fb = authMod;
    auth = authMod.getAuth(appMod.initializeApp(firebaseConfig));
    window.ccAuth.configured = true;
    authMod.onAuthStateChanged(auth, user => {
      renderUser(user);
      if (user && window.hasPendingAction()) afterLogin();
    });
  } catch(err){
    console.error('[ClearCut] Could not start Firebase auth:', err);
  }
}
