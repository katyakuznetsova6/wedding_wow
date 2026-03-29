const WELCOME_KEY="wedding_wow_intro_v1";

const prefersReducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let heroWordsReady=false;

function initHeroWords(){
 if(heroWordsReady) return;
 const root=document.querySelector(".hero-content");
 if(!root){
  heroWordsReady=true;
  return;
 }
 /* цельный текст без разбиения — меньше узлов и анимаций */
 heroWordsReady=true;
}

function initRevealStagger(){
 if(prefersReducedMotion) return;
 document.querySelectorAll(".reveal").forEach((el,i)=>{
  el.style.setProperty("--reveal-delay",`${i*0.12}s`);
 });
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

 music.volume=0.4;

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

function openInvitation(){
 const gate=document.getElementById("welcomeGate");
 if(gate){
  gate.classList.add("is-hidden");
  gate.setAttribute("aria-hidden","true");
 }
 document.body.classList.remove("welcome-active");
 sessionStorage.setItem(WELCOME_KEY,"1");

 initHeroWords();
 revealMainUi();
 setupMusicFab();

 const music=document.getElementById("music");
 const fab=document.getElementById("musicFab");
 syncMusicFab(music,fab);
}

/** Вызов play() только из этого обработчика — в том же синхронном стеке, что и клик (Safari / iOS). */
function startMusicFromUserGesture(){
 const music=document.getElementById("music");
 const fab=document.getElementById("musicFab");
 if(!music) return;
 music.volume=0.4;
 const playAttempt=music.play();
 if(playAttempt!==undefined){
  playAttempt
   .then(()=>syncMusicFab(music,fab))
   .catch(()=>{
    music.load();
    music.play().then(()=>syncMusicFab(music,fab)).catch(()=>syncMusicFab(music,fab));
   });
 }else{
  syncMusicFab(music,fab);
 }
}

function setupWelcome(){
 const gate=document.getElementById("welcomeGate");
 const openBtn=document.getElementById("welcomeOpen");
 const quietBtn=document.getElementById("welcomeQuiet");

 if(!gate || !openBtn){
  initHeroWords();
  revealMainUi();
  setupMusicFab();
  return;
 }

 if(sessionStorage.getItem(WELCOME_KEY)){
  gate.classList.add("is-hidden");
  gate.setAttribute("aria-hidden","true");
  initHeroWords();
  revealMainUi();
  setupMusicFab();
  return;
 }

 document.body.classList.add("welcome-active");
 gate.setAttribute("aria-hidden","false");
 openBtn.focus();

 openBtn.addEventListener("click",()=>{
  startMusicFromUserGesture();
  openInvitation();
 });
 if(quietBtn){
  quietBtn.addEventListener("click",()=>{
   startMusicFromUserGesture();
   openInvitation();
  });
 }
}

initRevealStagger();
setupWelcome();

document.getElementById("scrollHint")?.addEventListener("click",()=>{
 document.querySelector(".scene")?.scrollIntoView({behavior: prefersReducedMotion ? "auto" : "smooth"});
});

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

(function setupRsvpGoogleForm(){
 const rsvpForm=document.getElementById("rsvpForm");
 const statusEl=document.getElementById("status");
 if(!rsvpForm || !statusEl) return;

 rsvpForm.addEventListener("submit",()=>{
  statusEl.textContent="Спасибо! Мы получили ваш ответ 💌";
  window.setTimeout(()=>{
   rsvpForm.style.display="none";
  },500);
 });
})();

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

const revealBlocks=document.querySelectorAll(".reveal-block");
const revealObserver=new IntersectionObserver(
 (entries)=>{
  entries.forEach((entry)=>{
   if(entry.isIntersecting){
    entry.target.classList.add("visible");
   }
  });
 },
 {threshold:0.15, rootMargin:"0px 0px -5% 0px"}
);

revealBlocks.forEach((block)=>{
 revealObserver.observe(block);
});

const parallaxScenes=document.querySelectorAll(".scene");
let parallaxScheduled=false;

function updateParallax(){
 parallaxScheduled=false;
 if(prefersReducedMotion) return;
 const scrollY=window.scrollY;
 const speed=0.12;
 parallaxScenes.forEach((scene)=>{
  const rect=scene.getBoundingClientRect();
  const offset=rect.top+scrollY;
  const yPos=(scrollY-offset)*speed;
  scene.style.setProperty("--parallax-offset",`${yPos}px`);
 });
}

function requestParallax(){
 if(prefersReducedMotion) return;
 if(parallaxScheduled) return;
 parallaxScheduled=true;
 requestAnimationFrame(updateParallax);
}

window.addEventListener("scroll",requestParallax,{passive:true});
if(!prefersReducedMotion) updateParallax();

const finalScene=document.querySelector(".final");

const finalObserver=new IntersectionObserver(
 (entries)=>{
  entries.forEach((entry)=>{
   if(entry.isIntersecting){
    document.body.classList.add("final-active");
   }else{
    document.body.classList.remove("final-active");
   }
  });
 },
 {threshold:0.6}
);

if(finalScene){
 finalObserver.observe(finalScene);
}
