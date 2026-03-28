const WELCOME_KEY="wedding_wow_intro_v1";

const lines=[
 "Алексей и Екатерина",
 "С любовью приглашаем вас разделить наш день",
 "25 августа 2026 · 16:00"
];

const heroPause=2600;
const heroFade=520;

const prefersReducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initHeroCinematic(){
 const el=document.getElementById("cinematicText");
 if(!el) return;

 const heroImages=Array.from(document.querySelectorAll(".hero-img"));
 const setHeroImage=(idx)=>{
  heroImages.forEach((img,i)=>{
   img.classList.toggle("visible", i===idx);
  });
 };

 let heroIdx=0;

 if(prefersReducedMotion){
  el.style.opacity=1;
  el.textContent=lines.join(" · ");
  setHeroImage(0);
  return;
 }

 el.style.opacity=1;
 el.textContent=lines[heroIdx];
 setHeroImage(heroIdx);

 const scheduleNext=()=>{
  if(heroIdx >= lines.length-1) return;
  setTimeout(()=>{
   el.style.opacity=0;
   setTimeout(()=>{
    heroIdx++;
    el.textContent=lines[heroIdx];
    setHeroImage(heroIdx);
    el.style.opacity=1;
    scheduleNext();
   },heroFade);
  },heroPause);
 };

 scheduleNext();
}

function syncMusicFab(music,fab){
 if(!music || !fab) return;
 const playing=!music.paused;
 fab.classList.toggle("is-playing", playing);
 fab.setAttribute("aria-pressed", String(playing));
}

let musicFabBound=false;
function setupMusicFab(){
 const music=document.getElementById("music");
 const fab=document.getElementById("musicFab");
 if(!music || !fab || musicFabBound) return;
 musicFabBound=true;

 fab.addEventListener("click",()=>{
  if(music.paused){
   music.play().catch(()=>{});
  }else{
   music.pause();
  }
  syncMusicFab(music,fab);
 });

 music.addEventListener("play",()=>syncMusicFab(music,fab));
 music.addEventListener("pause",()=>syncMusicFab(music,fab));
 syncMusicFab(music,fab);
}

function revealMainUi(){
 const fab=document.getElementById("musicFab");
 if(fab) fab.classList.add("is-visible");
}

function openInvitation(withMusic){
 const gate=document.getElementById("welcomeGate");
 if(gate){
  gate.classList.add("is-hidden");
  gate.setAttribute("aria-hidden","true");
 }
 document.body.classList.remove("welcome-active");
 sessionStorage.setItem(WELCOME_KEY,"1");

 const music=document.getElementById("music");
 if(withMusic && music){
  music.play().catch(()=>{});
 }

 initHeroCinematic();
 revealMainUi();
 setupMusicFab();
}

function setupWelcome(){
 const gate=document.getElementById("welcomeGate");
 const openBtn=document.getElementById("welcomeOpen");
 const quietBtn=document.getElementById("welcomeQuiet");

 if(!gate || !openBtn || !quietBtn){
  initHeroCinematic();
  revealMainUi();
  setupMusicFab();
  return;
 }

 if(sessionStorage.getItem(WELCOME_KEY)){
  gate.classList.add("is-hidden");
  gate.setAttribute("aria-hidden","true");
  initHeroCinematic();
  revealMainUi();
  setupMusicFab();
  return;
 }

 document.body.classList.add("welcome-active");
 gate.setAttribute("aria-hidden","false");
 openBtn.focus();

 openBtn.addEventListener("click",()=>openInvitation(true));
 quietBtn.addEventListener("click",()=>openInvitation(false));
}

setupWelcome();

document.getElementById("scrollHint")?.addEventListener("click",()=>{
 document.querySelector(".scene")?.scrollIntoView({behavior: prefersReducedMotion ? "auto" : "smooth"});
});

function formatRemaining(ms){
 const safe=Math.max(0,ms);
 const totalMinutes=Math.floor(safe/60000);
 const days=Math.floor(totalMinutes/(60*24));
 const hours=Math.floor((totalMinutes%(60*24))/60);
 const minutes=totalMinutes%60;
 return `${days} дн ${hours} ч ${minutes} мин`;
}

function updateTimer(){
 const eventDate=new Date("2026-08-25T16:00:00+05:00");
 const diff=eventDate-new Date();
 const timerEl=document.getElementById("timer");
 if(!timerEl) return;

 if(diff<=0){
  timerEl.textContent="Время встречи наступило!";
  return;
 }

 const totalSeconds=Math.floor(diff/1000);
 const days=Math.floor(totalSeconds/(24*60*60));
 const hours=Math.floor((totalSeconds%(24*60*60))/(60*60));
 const minutes=Math.floor((totalSeconds%(60*60))/60);
 const seconds=totalSeconds%60;
 const pad2=(n)=>String(n).padStart(2,"0");

 timerEl.innerHTML=
  `<div class="timer-units" role="status" aria-live="polite">
    <div class="t-unit"><span class="t-num">${days}</span><span class="t-label">дн</span></div>
    <div class="t-unit"><span class="t-num">${pad2(hours)}</span><span class="t-label">ч</span></div>
    <div class="t-unit"><span class="t-num">${pad2(minutes)}</span><span class="t-label">мин</span></div>
    <div class="t-unit"><span class="t-num">${pad2(seconds)}</span><span class="t-label">сек</span></div>
  </div>`;
}

setInterval(updateTimer,1000);
updateTimer();

const obs=new IntersectionObserver((e)=>e.forEach((x)=>x.isIntersecting&&x.target.classList.add("visible")));
document.querySelectorAll(".scene").forEach((s)=>obs.observe(s));

const form=document.getElementById("rsvpForm");
const nameInput=document.getElementById("nameInput");
const statusEl=document.getElementById("status");

if(form && nameInput && statusEl){
 const savedGuestRaw=localStorage.getItem("guest");
 if(savedGuestRaw){
  let savedGuest;
  try{
   savedGuest=JSON.parse(savedGuestRaw);
  }catch{
   savedGuest={name:savedGuestRaw,attendance:"",drinks:[]};
  }
  nameInput.value=savedGuest.name || "";
  if(savedGuest.attendance){
   const attendanceInput=form.querySelector(`input[name="attendance"][value="${savedGuest.attendance}"]`);
   if(attendanceInput) attendanceInput.checked=true;
  }
  if(Array.isArray(savedGuest.drinks)){
   form.querySelectorAll('input[name="drink"]').forEach((input)=>{
    input.checked=savedGuest.drinks.includes(input.value);
   });
  }
  const drinksText=savedGuest.drinks && savedGuest.drinks.length ? savedGuest.drinks.join(", ") : "без предпочтений";
  const attendanceText=savedGuest.attendance==="yes" ? "придет" : savedGuest.attendance==="no" ? "не придет" : "не выбран";
  statusEl.textContent=`Снова рады вас видеть, ${savedGuest.name || "гость"}! Ваш ответ сохранен ✔ (вы ${attendanceText}). Напитки: ${drinksText}.`;
 }

 form.addEventListener("submit",(e)=>{
  e.preventDefault();
  const name=nameInput.value.trim();
  const attendance=form.querySelector('input[name="attendance"]:checked');
  const drinks=[...form.querySelectorAll('input[name="drink"]:checked')].map((item)=>item.value);
  if(!name){
   statusEl.textContent="Пожалуйста, напишите, как к вам обращаться";
   return;
  }
  if(!attendance){
   statusEl.textContent="Пожалуйста, выберите ответ: придете или нет";
   return;
  }
  const payload={name,attendance:attendance.value,drinks,timestamp:new Date().toISOString()};
  localStorage.setItem("guest",JSON.stringify(payload));
  const drinksText=drinks.length ? drinks.join(", ") : "без предпочтений";
  const attendanceText=attendance.value==="yes" ? "придет" : "не придет";
  statusEl.textContent=`Спасибо, ${name}! Ваш ответ сохранен ✔ (вы ${attendanceText}). Напитки: ${drinksText}.`;
 });
}

document.querySelectorAll(".slider-btn").forEach((btn)=>{
 btn.addEventListener("click",()=>{
  const targetId=btn.getAttribute("data-target");
  const dir=Number(btn.getAttribute("data-dir"));
  const slider=document.getElementById(targetId);
  if(!slider) return;
  const card=slider.querySelector(".image-card");
  const cardWidth=card ? card.getBoundingClientRect().width : 280;
  const gap=parseFloat(getComputedStyle(slider).gap || "0") || 0;
  slider.scrollBy({left:dir*(cardWidth+gap),behavior:"smooth"});
 });
});

const cursor=document.querySelector(".cursor");
if(cursor && window.matchMedia("(pointer: fine)").matches){
 document.addEventListener("mousemove",(e)=>{
  cursor.style.left=e.clientX+"px";
  cursor.style.top=e.clientY+"px";
 });
}else if(cursor){
 cursor.style.display="none";
}
