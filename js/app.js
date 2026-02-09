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
  video: document.getElementById("screenVideo"),
};

const supabaseStatus = document.getElementById("supabaseStatus");

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

// ---- Configuration gameplay ----
const MAX_NO_CLICKS = 5;
let noClicks = 0;

let yesScale = 1;
let noScale = 1;

// ---- Fallback local si Supabase pas configuré ----
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

async function goToYesThenVideo() {
  showScreen("yes");
  await sleep(1200);

  showScreen("video");

  // couper la musique de fond définitivement
  try {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  } catch (e) {}

  // sécurité mobile : forcer volume + play
  try {
    finalVideo.volume = 1;
    finalVideo.muted = false;

    const playPromise = finalVideo.play();

    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // si le navigateur bloque, on laisse les controls faire le job
        finalVideo.controls = true;
      });
    }
  } catch (e) {}
}


function setupVideoErrorHandling() {
  finalVideo.addEventListener("error", () => {
    videoFallback.classList.remove("is-hidden");
  });

  btnTryPlay?.addEventListener("click", async () => {
    try {
      await finalVideo.play();
      videoFallback.classList.add("is-hidden");
    } catch (e) {}
  });
}

// --- Supabase content loading ---
async function loadContentFromSupabase() {
  const client = window.getSupabaseClient?.();
  if (!client) {
    supabaseStatus.textContent = "Supabase: non configuré (fallback local).";
    return;
  }

  supabaseStatus.textContent = "Supabase: connexion…";

  try {
    const { data, error } = await client
      .from("site_content")
      .select("key,value");

    if (error) throw error;

    const map = {};
    for (const row of data || []) {
      map[row.key] = row.value;
    }

    CONTENT = {
      letter_text: map.letter_text ?? FALLBACK.letter_text,
      question_text: map.question_text ?? FALLBACK.question_text,
      yes_intermediate: map.yes_intermediate ?? FALLBACK.yes_intermediate,
    };

    supabaseStatus.textContent = "❤️❤️";
  } catch (e) {
    supabaseStatus.textContent = "Supabase: erreur (fallback local).";
    CONTENT = { ...FALLBACK };
  }
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

// ⬇️ démarre à un passage précis (en secondes)
const START_AT = 32; 
denyAudio.currentTime = START_AT;

await denyAudio.play();
} catch (e) {
}
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

  await goToYesThenVideo();
});

btnRestart.addEventListener("click", async () => {
  try { finalVideo.pause(); finalVideo.currentTime = 0; } catch (e) {}
  try { bgMusic.currentTime = 0; bgMusic.volume = 1; } catch (e) {}
  btnStart.disabled = false;
  btnStart.textContent = "▶ Start the music";
  questionBlock.classList.add("is-hidden");
  videoFallback.classList.add("is-hidden");
  showScreen("intro");
});

window.addEventListener("load", async () => {
  setupVideoErrorHandling();
  showScreen("intro");
  await loadContentFromSupabase();
});
