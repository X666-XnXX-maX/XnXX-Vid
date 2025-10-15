// script.js — module
// Client-side PIN protection (not a substitute for server-side auth).

const PIN_HASH = "0df727a50f5e4826c0298aa741030c8771c9394c3f798ad994e10277c5869a07";
const SALT = 'static-site-salt-v1';
const MAX_ATTEMPTS = 3;
const ATTEMPTS_KEY = 'pin_attempts_v1';
const STORAGE_KEY = 'unlocked_v1';

async function deriveHash(pin){
  const enc = new TextEncoder();
  const base = enc.encode(pin + SALT);
  const imported = await crypto.subtle.importKey('raw', base, {name:'PBKDF2'}, false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', iterations:150000, salt:enc.encode('pepper')}, imported, 256);
  const arr = new Uint8Array(derived);
  return Array.from(arr).map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function checkPin(pin){
  const h = await deriveHash(pin);
  return h === PIN_HASH;
}

function getAttempts(){ return parseInt(sessionStorage.getItem(ATTEMPTS_KEY) || '0', 10); }
function increaseAttempts(){ const n = getAttempts() + 1; sessionStorage.setItem(ATTEMPTS_KEY, n); return n; }
function resetAttempts(){ sessionStorage.removeItem(ATTEMPTS_KEY); }

function showGrid(videos){
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  videos.forEach(v=>{
    const card = document.createElement('div'); card.className='card';
    const thumb = document.createElement('div'); thumb.className='thumb'; thumb.textContent = '▶';
    const title = document.createElement('div'); title.className='title'; title.textContent = v.title || v.file;
    const a = document.createElement('a'); a.className='btn-play'; a.href = 'video.html?file=' + encodeURIComponent(v.file); a.textContent='تشغيل';
    card.appendChild(thumb); card.appendChild(title); card.appendChild(a); grid.appendChild(card);
  });
}

async function loadVideos(){
  try{
    const res = await fetch('videos.json', {cache:'no-store'});
    const data = await res.json();
    showGrid(data);
  }catch(e){
    console.error(e);
    document.getElementById('grid').textContent = 'خطأ في تحميل قائمة الفيديوهات.';
  }
}

async function init(){
  const overlay = document.getElementById('pin-overlay');
  const input = document.getElementById('pin-input');
  const submit = document.getElementById('pin-submit');
  const err = document.getElementById('pin-error');
  const info = document.getElementById('attempt-info');

  function updateInfo(){ const a = getAttempts(); info.textContent = a ? `تمت المحاولات: ${a} / ${MAX_ATTEMPTS}` : ''; }
  updateInfo();

  async function unlockFlow(){
    try{
      const val = input.value.trim();
      if(!val){ err.textContent = 'ادخل الرمز'; return; }
      const ok = await checkPin(val);
      if(ok){
        // ✅ حفظ حالة الدخول في sessionStorage بدل localStorage
        sessionStorage.setItem(STORAGE_KEY, '1');
        overlay.style.display = 'none';
        resetAttempts();
        updateInfo();
        loadVideos();
      } else {
        const attempts = increaseAttempts();
        updateInfo();
        if(attempts >= MAX_ATTEMPTS){ location.href = 'red-ping.html'; return; }
        err.textContent = 'الرمز غير صحيح';
      }
    }catch(e){ console.error(e); err.textContent = 'حدث خطأ داخلي'; }
  }

  submit.addEventListener('click', unlockFlow);
  input.addEventListener('keydown', e => { if(e.key === 'Enter') unlockFlow(); });

  // ✅ تحقق من الجلسة الحالية فقط (سيُطلب تسجيل الدخول مجددًا بعد الغلق)
  if(sessionStorage.getItem(STORAGE_KEY) === '1'){
    overlay.style.display = 'none';
    loadVideos();
  }
}

init();
