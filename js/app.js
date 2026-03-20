/* Isis my love - app.js */

/* =========================
   Vérification d'identité
   ========================= */
const idGate = document.getElementById("idGate");
const btnGateYes = document.getElementById("btnGateYes");
const btnGateNo = document.getElementById("btnGateNo");
const gateLine = document.getElementById("gateLine");
const appRoot = document.getElementById("appRoot");
let denyAudio = null;

// NON -> page blanche + hamster triste
function nukeToBlankPage() {
  // stop media
  const bgMusic = document.getElementById("bgMusic");
  const finalVideo = document.getElementById("finalVideo");
  try { bgMusic.pause(); bgMusic.currentTime = 0; } catch (e) {}
  try { finalVideo.pause(); finalVideo.currentTime = 0; } catch (e) {}

  // remove UI
  try { idGate.remove(); } catch (e) {}
  try { document.querySelector(".bg")?.remove(); } catch (e) {}
  try { appRoot?.remove(); } catch (e) {}

  // page blanche
  document.body.innerHTML = "";
  document.body.style.margin = "0";
  document.body.style.height = "100vh";
  document.body.style.display = "grid";
  document.body.style.placeItems = "center";
  document.body.style.background = "#ffffff";

  // hamster triste
  const sadHamster = document.createElement("div");
  sadHamster.className = "sadHamster";
  sadHamster.textContent = "💔🐹";
  document.body.appendChild(sadHamster);

  const sadText = document.createElement("div");
  sadText.className = "sadHamsterText";
  sadText.textContent = "Accès refusé… ce secret est réservé à Isis.";
  document.body.appendChild(sadText);
}

// OUI -> on laisse passer
function passGate() {
  idGate.classList.remove("gate--active");
  idGate.setAttribute("aria-hidden", "true");
}

/* =========================
   App
   ========================= */
const screens = {
  intro: document.getElementById("screenIntro"),
  letter: document.getElementById("screenLetter"),
  yes: document.getElementById("screenYes"),
  celebrate: document.getElementById("screenCelebrate"), // ✅ nouveau
  video: document.getElementById("screenVideo"),
};

const contentStatus = document.getElementById("contentStatus");

const btnStart = document.getElementById("btnStart");
const bgMusic = document.getElementById("bgMusic");

const typeTarget = document.getElementById("typeTarget");
const questionBlock = document.getElementById("questionBlock");
const questionTextEl = document.getElementById("questionText");
const yesIntermediateEl = document.getElementById("yesIntermediate");

const playground = document.getElementById("playground");
const btnYes = document.getElementById("btnYes");
const btnNo = document.getElementById("btnNo");

const finalVideo = document.getElementById("finalVideo");
const videoFallback = document.getElementById("videoFallback");
const btnTryPlay = document.getElementById("btnTryPlay");
const btnRestart = document.getElementById("btnRestart");

// ✅ layer celebration
const celebrateLayer = document.getElementById("celebrateLayer");

// ---- Configuration gameplay ----
const MAX_NO_CLICKS = 5;
let noClicks = 0;

let yesScale = 1;
let noScale = 1;

// ---- Contenu local ----
const FALLBACK = {
  letter_text:
    "J’ai un truc à te demander…\n\n" +
    "Depuis que tu es dans ma vie, tout est plus doux, plus beau, plus simple.\n" +
    "Et aujourd’hui, j’ai envie de rendre ça officiel, à ma façon.\n\n" +
    "Alors…",
  question_text: "Will you be my valentine's partner ? ❤️",
  yes_intermediate: "YEEEES ❤️",
};

let CONTENT = { ...FALLBACK };

function showScreen(name) {
  Object.values(screens).forEach((s) => s.classList.remove("is-active"));
  screens[name].classList.add("is-active");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function typewriter(el, text, speedMs = 26) {
  el.textContent = "";
  for (let i = 0; i < text.length; i++) {
    el.textContent += text[i];
    await sleep(speedMs);
  }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function moveNoButtonRandomly() {
  const pad = 12;
  const rect = playground.getBoundingClientRect();

  const btnW = btnNo.offsetWidth;
  const btnH = btnNo.offsetHeight;

  const maxLeft = rect.width - btnW - pad;
  const maxTop = rect.height - btnH - pad;

  const left = randomInt(pad, Math.max(pad, maxLeft));
  const top = randomInt(pad, Math.max(pad, maxTop));

  btnNo.style.left = `${left}px`;
  btnNo.style.top = `${top}px`;
}

function applyScales() {
  btnYes.style.transform = `scale(${yesScale})`;
  btnNo.style.transform = `scale(${noScale})`;
}

function lockNoButton() {
  btnNo.style.opacity = "0.25";
  btnNo.style.pointerEvents = "none";
  btnNo.textContent = "Nope";
  btnYes.classList.add("is-pulse");
}

async function tryPlayMusic() {
  try {
    bgMusic.currentTime = 23;
    bgMusic.volume = 0.05;
    await bgMusic.play();
  } catch (e) {}
}

async function goToLetterFlow() {
  showScreen("letter");

  await typewriter(typeTarget, CONTENT.letter_text, 70);
  await sleep(250);

  questionTextEl.textContent = CONTENT.question_text;
  yesIntermediateEl.textContent = CONTENT.yes_intermediate;

  questionBlock.classList.remove("is-hidden");

  btnYes.style.left = "22%";
  btnYes.style.top = "78px";
  btnNo.style.left = "58%";
  btnNo.style.top = "78px";

  yesScale = 1;
  noScale = 1;
  noClicks = 0;

  btnYes.classList.remove("is-pulse");
  btnNo.style.opacity = "1";
  btnNo.style.pointerEvents = "auto";
  btnNo.textContent = "No";

  applyScales();
}

/**
 * IMPORTANT MOBILE:
 * On "débloque" la lecture vidéo pendant le geste utilisateur (click).
 * Technique: play très court en muted -> pause -> on remet le son.
 */
async function unlockVideoPlayback() {
  try {
    finalVideo.load();

    finalVideo.muted = true;
    finalVideo.playsInline = true;

    const p = finalVideo.play();
    if (p && typeof p.then === "function") {
      await p;
    }

    finalVideo.pause();
    finalVideo.currentTime = 0;

    finalVideo.muted = false;
    finalVideo.volume = 1;
  } catch (e) {
    // on gèrera via fallback
  }
}

/* =========================
   ✅ Celebration: pluie roses/paillettes
   ========================= */
function clearCelebrateLayer() {
  if (!celebrateLayer) return;
  celebrateLayer.innerHTML = "";
}

function spawnFallingItem() {
  const el = document.createElement("div");
  const isRose = Math.random() < 0.62; // + de roses
  el.className = `fallItem ${isRose ? "fallItem--rose" : "fallItem--sparkle"}`;
  el.textContent = isRose ? "🌹" : "✨";

  // position
  el.style.left = `${Math.random() * 100}%`;

  // durée / rotation naturelle
  const dur = 1.9 + Math.random() * 1.8; // 1.9s -> 3.7s
  el.style.animationDuration = `${dur}s`;

  // légère dérive horizontale via translateX
  const drift = (Math.random() * 120 - 60).toFixed(0); // -60 -> +60
  el.style.transform = `translateX(${drift}px) rotate(${Math.random() * 180}deg)`;

  celebrateLayer.appendChild(el);

  // cleanup
  window.setTimeout(() => {
    try { el.remove(); } catch (e) {}
  }, (dur * 1000) + 200);
}

async function runCelebration(durationMs = 2600) {
  clearCelebrateLayer();

  const start = Date.now();
  const interval = window.setInterval(() => {
    // spawn un petit "burst" à chaque tick
    for (let i = 0; i < 4; i++) spawnFallingItem();
    if (Date.now() - start >= durationMs) {
      window.clearInterval(interval);
    }
  }, 110);

  // laisser vivre jusqu'à la fin
  await sleep(durationMs + 250);
  clearCelebrateLayer();
}

/* =========================
   Flow YES -> Celebration -> Video
   ========================= */
async function goToYesThenCelebrateThenVideo() {
  // YES screen
  showScreen("yes");
  await sleep(1200);

  // ✅ Celebration screen
  showScreen("celebrate");
  await runCelebration(2600);

  // Puis vidéo
  showScreen("video");

  // couper la musique de fond définitivement
  try {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  } catch (e) {}

  // Tentative play
  try {
    finalVideo.volume = 1;
    finalVideo.muted = false;

    const playPromise = finalVideo.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        if (videoFallback) videoFallback.classList.remove("is-hidden");
        finalVideo.controls = true;
      });
    }
  } catch (e) {
    if (videoFallback) videoFallback.classList.remove("is-hidden");
    finalVideo.controls = true;
  }
}

function setupVideoErrorHandling() {
  finalVideo.addEventListener("error", () => {
    finalVideo.controls = true;
  });
}

/* =========================
   Local content loading
   ========================= */
function loadContent() {
  CONTENT = { ...FALLBACK };
  if (contentStatus) contentStatus.textContent = "❤️❤️";
}

/* =========================
   Events
   ========================= */
btnGateYes.addEventListener("click", () => {
  passGate();
});

btnGateNo.addEventListener("click", async () => {
  gateLine.textContent = "Dommage.";
  btnGateYes.disabled = true;
  btnGateNo.disabled = true;

  // musique si ce n'est pas Isis (lancée sur geste utilisateur => autorisée)
  try {
    denyAudio = new Audio("./assets/not-isis.mp3");
    denyAudio.loop = true;
    denyAudio.volume = 1;

    const START_AT = 32;
    denyAudio.currentTime = START_AT;

    await denyAudio.play();
  } catch (e) {}

  await sleep(700);
  nukeToBlankPage();
});

btnStart.addEventListener("click", async () => {
  btnStart.disabled = true;
  btnStart.textContent = "♪ Playing...";
  await tryPlayMusic();
  await sleep(250);
  await goToLetterFlow();
});

btnNo.addEventListener("click", () => {
  noClicks += 1;
  yesScale = clamp(yesScale * 1.28, 1, 3.5);
  noScale = clamp(noScale * 0.72, 0.18, 1);
  applyScales();
  moveNoButtonRandomly();
  if (noClicks >= MAX_NO_CLICKS) lockNoButton();
});

btnYes.addEventListener("click", async () => {
  // si la musique était bloquée, on tente de la relancer mais à volume faible
  try { bgMusic.volume = 0.05; } catch (e) {}
  if (bgMusic.paused) {
    try { await bgMusic.play(); } catch (e) {}
  }

  // ✅ Débloque la vidéo sur mobile pendant LE geste utilisateur
  await unlockVideoPlayback();

  // ✅ YES -> Celebration -> Video
  await goToYesThenCelebrateThenVideo();
});

if (btnTryPlay) {
  btnTryPlay.addEventListener("click", async () => {
    try {
      finalVideo.muted = false;
      finalVideo.volume = 1;
      await finalVideo.play();
      if (videoFallback) videoFallback.classList.add("is-hidden");
    } catch (e) {
      finalVideo.controls = true;
    }
  });
}

btnRestart.addEventListener("click", async () => {
  try { finalVideo.pause(); finalVideo.currentTime = 0; } catch (e) {}
  try { bgMusic.currentTime = 0; bgMusic.volume = 1; } catch (e) {}
  btnStart.disabled = false;
  btnStart.textContent = "▶ Start the music";
  questionBlock.classList.add("is-hidden");
  if (videoFallback) videoFallback.classList.add("is-hidden");
  clearCelebrateLayer();
  showScreen("intro");
});

window.addEventListener("load", async () => {
  setupVideoErrorHandling();
  showScreen("intro");
  loadContent();
});
