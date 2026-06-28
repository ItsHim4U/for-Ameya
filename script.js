const FRIEND_NAME = "Ameya"; // Change this one line if you want to personalize the site again.

// Customize the fake boot sequence here.
const LOADING_MESSAGES = [
  "SYSTEM ONLINE",
  "Connecting to Happiness Servers...",
  "Loading Smile Detection Engine...",
  "Searching Earth's population...",
  "Comparing 8,000,000,000 humans...",
  "Running Personality Analysis...",
  "Running Kindness Detection...",
  "Running Smile Prediction...",
  "Wait...",
  "That's strange.",
  "Running verification again...",
  "Confirmed."
];

// Customize the smile generator messages here.
const SMILE_REASONS = [
  "Because you're literally the reason this website exists.",
  "Because even the AI gave up and said: she's too special.",
  "Because somewhere, someone is hoping this made your day better.",
  "Because your smile deserves its own loading screen.",
  "Because today needed a little more you in it."
];

const TYPEWRITER_COPY = "This website exists for one reason.";
const BOOT_MESSAGE_DELAY = 560;
const POST_TERMINAL_PAUSE = 1200;
const MISSION_REPORT_HOLD = 3800;
const SKIPPED_POST_TERMINAL_PAUSE = 180;
const SKIPPED_MISSION_REPORT_HOLD = 1200;
const BLACKOUT_DURATION = 700;
const SECRET_UNLOCK_CLICKS = 5;

const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
const touchQuery = window.matchMedia("(hover: none), (pointer: coarse)");
const mobilePerformanceQuery = window.matchMedia("(max-width: 640px)");

const loadingScreen = document.querySelector("#loadingScreen");
const revealScreen = document.querySelector("#revealScreen");
const revealStage = document.querySelector(".reveal-stage");
const missionDeck = document.querySelector("#missionDeck");
const terminalCard = document.querySelector(".terminal-card");
const terminalLog = document.querySelector("#terminalLog");
const progressBar = document.querySelector("#progressBar");
const missionReport = document.querySelector("#missionReport");
const cinematicWipe = document.querySelector("#cinematicWipe");
const nameParticleLayer = document.querySelector("#nameParticleLayer");
const friendName = document.querySelector("#friendName");
const typewriterText = document.querySelector("#typewriterText");
const beginMission = document.querySelector("#beginMission");
const generateSmile = document.querySelector("#generateSmile");
const smileReason = document.querySelector("#smileReason");
const openBooster = document.querySelector("#openBooster");
const boosterMessage = document.querySelector("#boosterMessage");
const chapterCounter = document.querySelector("#chapterCounter");
const chapterBack = document.querySelector("#chapterBack");
const chapterNext = document.querySelector("#chapterNext");
const replayMission = document.querySelector("#replayMission");
const navDots = Array.from(document.querySelectorAll(".nav-dot"));
const chapters = Array.from(document.querySelectorAll(".chapter"));
const nextButtons = Array.from(document.querySelectorAll("[data-next-chapter]"));
const floatLayer = document.querySelector("#floatLayer");
const confettiCanvas = document.querySelector("#confettiCanvas");
const confettiContext = confettiCanvas.getContext("2d");
const musicToggle = document.querySelector("#musicToggle");
const skipIntro = document.querySelector("#skipIntro");
const secretHeart = document.querySelector("#secretHeart");
const secretNote = document.querySelector("#secretNote");

let currentReasonIndex = -1;
let activeChapterIndex = 0;
let finalConfettiPlayed = false;
let bootFinished = false;
let secretClicks = 0;
let audioContext;
let cursorSparkTimer = 0;
let nameParticleCleanupTimer = 0;

function motionOK() {
  return !reducedMotionQuery.matches;
}

function isMobilePerformanceMode() {
  return mobilePerformanceQuery.matches || touchQuery.matches;
}

function canUseDesktopEffects() {
  return motionOK() && !isMobilePerformanceMode() && finePointerQuery.matches;
}

function syncPerformanceModeClass() {
  document.documentElement.classList.toggle("mobile-performance", isMobilePerformanceMode());
}

function sleep(ms) {
  if (!motionOK()) {
    return Promise.resolve();
  }

  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function setProgress(percent) {
  progressBar.style.width = `${Math.min(percent, 100)}%`;
}

function addTerminalLine(message, className = "") {
  const line = document.createElement("div");
  line.className = `terminal-line ${className}`.trim();
  line.textContent = message;
  terminalLog.appendChild(line);
  terminalLog.scrollTop = terminalLog.scrollHeight;
}

async function triggerGlitch() {
  if (!motionOK()) {
    return;
  }

  terminalCard.classList.add("is-glitching");
  await sleep(520);
  terminalCard.classList.remove("is-glitching");
}

async function runBootSequence() {
  friendName.textContent = FRIEND_NAME;

  for (let index = 0; index < LOADING_MESSAGES.length; index += 1) {
    if (bootFinished) {
      return;
    }

    const message = LOADING_MESSAGES[index];

    if (message === "Confirmed.") {
      await triggerGlitch();
    }

    addTerminalLine(message, message === "Confirmed." ? "is-confirmed" : "");
    setProgress(((index + 1) / LOADING_MESSAGES.length) * 100);
    await sleep(motionOK() ? BOOT_MESSAGE_DELAY : 0);
  }

  await completeBootSequence();
}

async function completeBootSequence({ skipped = false } = {}) {
  if (bootFinished) {
    return;
  }

  bootFinished = true;
  skipIntro.disabled = true;
  skipIntro.style.opacity = "0";
  skipIntro.style.pointerEvents = "none";
  setProgress(100);

  const hasConfirmed = Array.from(terminalLog.children).some((line) => line.textContent === "Confirmed.");

  if (skipped && !hasConfirmed) {
    addTerminalLine("Intro skipped. Verification still mandatory.");
    addTerminalLine("Confirmed.", "is-confirmed");
  }

  const terminalPause = skipped ? SKIPPED_POST_TERMINAL_PAUSE : POST_TERMINAL_PAUSE;
  const reportHold = skipped ? SKIPPED_MISSION_REPORT_HOLD : MISSION_REPORT_HOLD;

  await sleep(terminalPause);

  missionReport.hidden = false;
  requestAnimationFrame(() => missionReport.classList.add("is-visible"));

  launchConfetti({
    duration: skipped ? 650 : 950,
    intensity: skipped ? 36 : 80
  });

  await sleep(reportHold);
  await transitionToRevealScreen();
}

async function transitionToRevealScreen() {
  if (motionOK()) {
    cinematicWipe.classList.add("is-active");
    await sleep(BLACKOUT_DURATION);
  }

  showRevealScreen();
  createNameParticles();

  await sleep(120);
  cinematicWipe.classList.remove("is-active");

  window.setTimeout(() => {
    typeText(TYPEWRITER_COPY, typewriterText);
  }, motionOK() ? 560 : 0);
}

function showRevealScreen() {
  loadingScreen.classList.remove("is-active");
  loadingScreen.classList.add("is-gone");
  revealScreen.classList.remove("is-gone");
  revealScreen.classList.add("is-active");
  revealStage.classList.remove("is-arriving");
  void revealStage.offsetWidth;
  revealStage.classList.add("is-arriving");
  typewriterText.textContent = "";
}

async function typeText(copy, target) {
  target.textContent = "";

  if (!motionOK()) {
    target.textContent = copy;
    return;
  }

  for (const character of copy) {
    target.textContent += character;
    await sleep(character === " " ? 32 : 48);
  }
}

function beginMissionFlow() {
  revealScreen.classList.remove("is-active");
  revealScreen.classList.add("is-gone");
  missionDeck.classList.add("is-active");
  finalConfettiPlayed = false;
  showChapter(0, { force: true });
  scrollToMissionDeck();
}

function scrollToMissionDeck() {
  missionDeck.scrollIntoView({ behavior: motionOK() ? "smooth" : "auto", block: "start" });
}

function showChapter(index, options = {}) {
  const boundedIndex = Math.max(0, Math.min(index, chapters.length - 1));
  const direction = boundedIndex >= activeChapterIndex ? "forward" : "back";
  activeChapterIndex = boundedIndex;

  chapters.forEach((chapter, chapterIndex) => {
    const isActive = chapterIndex === boundedIndex;
    chapter.classList.remove("scene-forward", "scene-back", "is-active");

    if (isActive) {
      chapter.classList.add("is-active");
      if (motionOK() && !options.force) {
        chapter.classList.add(direction === "forward" ? "scene-forward" : "scene-back");
      }
    }
  });

  if (motionOK() && !options.force) {
    missionDeck.classList.add("is-scene-shifting");
    window.setTimeout(() => missionDeck.classList.remove("is-scene-shifting"), 760);
  }

  updateChapterControls();

  if (boundedIndex === chapters.length - 1 && !finalConfettiPlayed) {
    finalConfettiPlayed = true;
    window.setTimeout(() => launchConfetti({ duration: 1700, intensity: 165 }), motionOK() ? 420 : 0);
  }
}

function updateChapterControls() {
  navDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === activeChapterIndex);
  });

  chapterCounter.textContent = `${String(activeChapterIndex + 1).padStart(2, "0")} / ${String(chapters.length).padStart(2, "0")}`;
  chapterBack.disabled = activeChapterIndex === 0;

  if (chapterNext) {
    chapterNext.disabled = activeChapterIndex === chapters.length - 1;
    chapterNext.textContent = activeChapterIndex === chapters.length - 1 ? "Done" : "Next";
  }
}

function generateSmileReason() {
  let nextIndex = Math.floor(Math.random() * SMILE_REASONS.length);

  if (SMILE_REASONS.length > 1) {
    while (nextIndex === currentReasonIndex) {
      nextIndex = Math.floor(Math.random() * SMILE_REASONS.length);
    }
  }

  currentReasonIndex = nextIndex;
  smileReason.classList.remove("is-changing");
  void smileReason.offsetWidth;
  smileReason.textContent = SMILE_REASONS[nextIndex];
  smileReason.classList.add("is-changing");
  launchConfetti({ duration: 520, intensity: 34 });
}

function revealBooster() {
  boosterMessage.hidden = false;
  requestAnimationFrame(() => boosterMessage.classList.add("is-visible"));
}

function replayMissionFlow() {
  missionDeck.classList.remove("is-active");
  revealScreen.classList.remove("is-gone");
  revealScreen.classList.add("is-active");
  finalConfettiPlayed = false;
  activeChapterIndex = 0;
  showChapter(0, { force: true });
  showRevealScreen();
  createNameParticles();
  typeText(TYPEWRITER_COPY, typewriterText);
  window.scrollTo({ top: 0, behavior: motionOK() ? "smooth" : "auto" });
}

function createFloatingGlyphs() {
  if (!motionOK()) {
    return;
  }

  const glyphs = ["\u2661", "\u2726", "\u2606", "\u00B7", "\u2665"];
  const amount = isMobilePerformanceMode() ? 10 : 38;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < amount; index += 1) {
    const glyph = document.createElement("span");
    glyph.className = "floating-glyph";
    glyph.textContent = glyphs[index % glyphs.length];
    glyph.style.setProperty("--x", `${Math.random() * 100}%`);
    glyph.style.setProperty("--size", `${0.75 + Math.random() * 1.35}rem`);
    glyph.style.setProperty("--alpha", `${0.18 + Math.random() * 0.38}`);
    glyph.style.setProperty("--duration", `${10 + Math.random() * 14}s`);
    glyph.style.setProperty("--delay", `${Math.random() * -18}s`);
    glyph.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
    glyph.style.setProperty("--rotate", `${-90 + Math.random() * 180}deg`);
    fragment.appendChild(glyph);
  }

  floatLayer.appendChild(fragment);
}

function createNameParticles() {
  window.clearTimeout(nameParticleCleanupTimer);
  nameParticleLayer.replaceChildren();

  if (!motionOK()) {
    return;
  }

  const colors = ["#ff9ccc", "#ff4fa3", "#93d8ff", "#ffffff", "#ffe69c"];
  const particleCount = isMobilePerformanceMode() ? 24 : finePointerQuery.matches ? 82 : 42;
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    particle.className = "name-particle";
    particle.style.setProperty("--particle-color", colors[index % colors.length]);
    particle.style.setProperty("--particle-size", `${2 + Math.random() * 5}px`);
    particle.style.setProperty("--particle-delay", `${Math.random() * 460}ms`);
    particle.style.setProperty("--start-x", `${-54 + Math.random() * 108}vw`);
    particle.style.setProperty("--start-y", `${-42 + Math.random() * 84}vh`);
    particle.style.setProperty("--end-x", `${-42 + Math.random() * 84}px`);
    particle.style.setProperty("--end-y", `${-18 + Math.random() * 36}px`);
    fragment.appendChild(particle);
  }

  nameParticleLayer.appendChild(fragment);

  window.clearTimeout(nameParticleCleanupTimer);
  nameParticleCleanupTimer = window.setTimeout(() => {
    nameParticleLayer.replaceChildren();
  }, isMobilePerformanceMode() ? 1700 : 2300);
}

function resizeConfettiCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  confettiCanvas.width = Math.floor(window.innerWidth * pixelRatio);
  confettiCanvas.height = Math.floor(window.innerHeight * pixelRatio);
  confettiCanvas.style.width = `${window.innerWidth}px`;
  confettiCanvas.style.height = `${window.innerHeight}px`;
  confettiContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}

function launchConfetti({ duration = 1200, intensity = 110 } = {}) {
  if (!motionOK()) {
    return;
  }

  const colors = ["#ff4fa3", "#ff9ccc", "#38a8ff", "#93d8ff", "#ffffff", "#ffe69c"];
  const effectiveIntensity = Math.max(12, Math.round(intensity * (isMobilePerformanceMode() ? 0.5 : 1)));
  const pieces = Array.from({ length: effectiveIntensity }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.25,
    size: 5 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 2.8 + Math.random() * 4.8,
    drift: -2.4 + Math.random() * 4.8,
    rotation: Math.random() * Math.PI,
    rotationSpeed: -0.18 + Math.random() * 0.36,
    shape: Math.random() > 0.72 ? "heart" : "rect"
  }));
  const startedAt = performance.now();

  function drawHeart(piece) {
    const size = piece.size * 0.9;
    confettiContext.save();
    confettiContext.translate(piece.x, piece.y);
    confettiContext.rotate(piece.rotation);
    confettiContext.fillStyle = piece.color;
    confettiContext.beginPath();
    confettiContext.moveTo(0, size * 0.35);
    confettiContext.bezierCurveTo(-size, -size * 0.25, -size * 0.85, -size, 0, -size * 0.45);
    confettiContext.bezierCurveTo(size * 0.85, -size, size, -size * 0.25, 0, size * 0.35);
    confettiContext.fill();
    confettiContext.restore();
  }

  function frame(now) {
    const elapsed = now - startedAt;
    confettiContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

    pieces.forEach((piece) => {
      piece.x += piece.drift;
      piece.y += piece.speed;
      piece.rotation += piece.rotationSpeed;

      if (piece.shape === "heart") {
        drawHeart(piece);
        return;
      }

      confettiContext.save();
      confettiContext.translate(piece.x, piece.y);
      confettiContext.rotate(piece.rotation);
      confettiContext.fillStyle = piece.color;
      confettiContext.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
      confettiContext.restore();
    });

    if (elapsed < duration) {
      requestAnimationFrame(frame);
    } else {
      confettiContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  requestAnimationFrame(frame);
}

async function playSoftChime() {
  if (!(window.AudioContext || window.webkitAudioContext)) {
    return;
  }

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  musicToggle.classList.add("is-on");
  window.setTimeout(() => musicToggle.classList.remove("is-on"), 620);

  const now = audioContext.currentTime;
  const master = audioContext.createGain();
  master.gain.value = 0.035;
  master.connect(audioContext.destination);

  [523.25, 659.25, 783.99].forEach((frequency, index) => {
    const start = now + index * 0.105;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = index === 2 ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + 0.44);
  });

  window.setTimeout(() => master.disconnect(), 900);
}

function unlockSecretNote() {
  secretHeart.classList.add("is-unlocked");
  secretHeart.textContent = "\u2665";
  secretNote.hidden = false;
  secretNote.classList.remove("is-visible");
  void secretNote.offsetWidth;
  requestAnimationFrame(() => secretNote.classList.add("is-visible"));
  launchConfetti({ duration: 760, intensity: isMobilePerformanceMode() ? 28 : 46 });
  playSoftChime();
}

function handleSecretHeartClick() {
  if (secretClicks >= SECRET_UNLOCK_CLICKS) {
    return;
  }

  secretClicks += 1;
  secretHeart.style.transform = `translateY(-2px) scale(${1 + secretClicks * 0.035})`;

  window.setTimeout(() => {
    secretHeart.style.transform = "";
  }, 160);

  if (secretClicks === SECRET_UNLOCK_CLICKS) {
    unlockSecretNote();
  }
}

function initCursorTrail() {
  if (!canUseDesktopEffects()) {
    return;
  }

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);

  window.addEventListener("pointermove", (event) => {
    glow.style.opacity = "1";
    glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;

    const now = performance.now();
    if (now - cursorSparkTimer < 72) {
      return;
    }

    cursorSparkTimer = now;
    const spark = document.createElement("span");
    spark.className = "cursor-spark";
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    document.body.appendChild(spark);
    window.setTimeout(() => spark.remove(), 720);
  });

  window.addEventListener("pointerleave", () => {
    glow.style.opacity = "0";
  });
}

function initTiltCards() {
  if (!canUseDesktopEffects()) {
    return;
  }

  const tiltTargets = Array.from(
    document.querySelectorAll(".terminal-card, .reveal-stage, .generator-panel, .booster-panel, .final-report")
  );

  tiltTargets.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateX = (-y * 5).toFixed(2);
      const rotateY = (x * 6).toFixed(2);
      card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      window.setTimeout(() => {
        card.style.transform = "";
      }, 220);
    });
  });
}

beginMission.addEventListener("click", beginMissionFlow);
generateSmile.addEventListener("click", generateSmileReason);
openBooster.addEventListener("click", revealBooster);
musicToggle.addEventListener("click", playSoftChime);
skipIntro.addEventListener("click", () => completeBootSequence({ skipped: true }));
secretHeart.addEventListener("click", handleSecretHeartClick);
replayMission.addEventListener("click", replayMissionFlow);

chapterBack.addEventListener("click", () => {
  showChapter(activeChapterIndex - 1);
  scrollToMissionDeck();
});

if (chapterNext) {
  chapterNext.addEventListener("click", () => {
    showChapter(activeChapterIndex + 1);
    scrollToMissionDeck();
  });
}

nextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextChapter = Number(button.dataset.nextChapter);
    showChapter(nextChapter);
    scrollToMissionDeck();
  });
});

window.addEventListener("resize", resizeConfettiCanvas);

syncPerformanceModeClass();
mobilePerformanceQuery.addEventListener?.("change", syncPerformanceModeClass);
touchQuery.addEventListener?.("change", syncPerformanceModeClass);
resizeConfettiCanvas();
createFloatingGlyphs();
initCursorTrail();
initTiltCards();
updateChapterControls();
runBootSequence();
