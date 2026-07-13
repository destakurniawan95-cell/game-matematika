// Math Adventure Indonesia - Application Logic
// Handles state management, UI events, sound synthesis, maps, and game modes.

// --- STATE MANAGEMENT ---
const AppState = {
  profile: {
    name: "Petualang",
    avatar: "robot",
    stars: 0,
    points: 0,
    currentGrade: 1,
    currentTopic: null,
    unlockedLevels: {} // Format: { "grade_topic": max_unlocked_level }
  },
  settings: {
    soundVolume: 0.8,
    speechEnabled: true
  },
  session: {
    activeMode: null, // "adventure", "time", "battle", "daily", "treasure"
    score: 0,
    combo: 0,
    hearts: 3,
    questionsCount: 0,
    correctCount: 0,
    currentLevel: 1,
    currentQuestion: null,
    timerInterval: null,
    timeLeft: 60,
    battle: {
      player1: { name: "Pemain 1", score: 0 },
      player2: { name: "Pemain 2", score: 0 },
      currentPlayer: 1,
      turnsLeft: 10
    },
    treasure: {
      clueIndex: 0,
      chestsUnlocked: 0,
      coordinatePuzzles: []
    }
  },
  scoreboard: []
};

// Available Topics mapping for Grades
const GRADE_TOPICS = {
  1: [
    { id: "mengenal_angka", name: "Mengenal Angka" },
    { id: "penjumlahan", name: "Penjumlahan" },
    { id: "pengurangan", name: "Pengurangan" },
    { id: "tebak_angka", name: "Tebak Angka" },
    { id: "cocokkan_bentuk", name: "Cocokkan Bentuk" }
  ],
  2: [
    { id: "penjumlahan_3_digit", name: "Penjumlahan 3 Digit" },
    { id: "pengurangan", name: "Pengurangan" },
    { id: "perkalian_dasar", name: "Perkalian Dasar" },
    { id: "pembagian_sederhana", name: "Pembagian Sederhana" }
  ],
  3: [
    { id: "perkalian", name: "Perkalian" },
    { id: "pembagian", name: "Pembagian" },
    { id: "pecahan_sederhana", name: "Pecahan Sederhana" },
    { id: "waktu_dan_jam", name: "Waktu dan Jam" }
  ],
  4: [
    { id: "pecahan", name: "Pecahan" },
    { id: "keliling", name: "Keliling" },
    { id: "luas", name: "Luas" },
    { id: "faktor_dan_kelipatan", name: "Faktor dan Kelipatan" }
  ],
  5: [
    { id: "desimal", name: "Desimal" },
    { id: "persentase", name: "Persentase" },
    { id: "volume", name: "Volume Ruang" },
    { id: "operasi_campuran", name: "Operasi Campuran" }
  ],
  6: [
    { id: "bilangan_bulat", name: "Bilangan Bulat" },
    { id: "perbandingan", name: "Perbandingan" },
    { id: "skala", name: "Skala Peta" },
    { id: "kecepatan", name: "Kecepatan" },
    { id: "persiapan_ujian", name: "Persiapan Ujian" }
  ]
};

// SVG Avatar Templates
const AVATARS = {
  robot: `<svg viewBox="0 0 100 100" width="100%" height="100%"><rect x="25" y="35" width="50" height="45" rx="15" fill="var(--secondary)" stroke="var(--text-main)" stroke-width="4"/><rect x="32" y="42" width="36" height="26" rx="8" fill="var(--bg-app)" stroke="var(--text-main)" stroke-width="3"/><circle cx="43" y="55" r="4" fill="var(--accent)"/><circle cx="57" y="55" r="4" fill="var(--accent)"/><line x1="50" y1="35" x2="50" y2="20" stroke="var(--text-main)" stroke-width="4"/><circle cx="50" y="16" r="6" fill="var(--gold)" stroke="var(--text-main)" stroke-width="3"/></svg>`,
  astronaut: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" y="50" r="35" fill="hsl(200, 10%, 90%)" stroke="var(--text-main)" stroke-width="4"/><rect x="28" y="35" width="44" height="30" rx="15" fill="var(--accent)" stroke="var(--text-main)" stroke-width="3"/><circle cx="40" y="50" r="8" fill="var(--bg-app)"/><circle cx="60" y="50" r="8" fill="var(--bg-app)"/><circle cx="40" y="50" r="3" fill="var(--text-main)"/><circle cx="60" y="50" r="3" fill="var(--text-main)"/></svg>`,
  explorer: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" y="50" r="35" fill="hsl(34, 44%, 81%)" stroke="var(--text-main)" stroke-width="4"/><path d="M 15 45 Q 50 15 85 45" fill="hsl(28, 80%, 45%)" stroke="var(--text-main)" stroke-width="4"/><circle cx="38" y="52" r="5" fill="var(--text-main)"/><circle cx="62" y="52" r="5" fill="var(--text-main)"/><path d="M 42 68 Q 50 74 58 68" stroke="var(--text-main)" stroke-width="3" fill="none"/></svg>`,
  ninja: `<svg viewBox="0 0 100 100" width="100%" height="100%"><circle cx="50" y="50" r="35" fill="hsl(220, 20%, 15%)" stroke="var(--text-main)" stroke-width="4"/><rect x="25" y="42" width="50" height="16" rx="8" fill="hsl(34, 44%, 81%)"/><circle cx="40" y="50" r="4" fill="var(--text-main)"/><circle cx="60" y="50" r="4" fill="var(--text-main)"/></svg>`
};

// --- AUDIO SYNTHESIZER (Web Audio API) ---
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTone(freq, duration, type = "sine", gainVal = 0.1) {
  try {
    initAudio();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(gainVal * AppState.settings.soundVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio synth error", e);
  }
}

const Sounds = {
  click() {
    playTone(600, 0.08, "triangle", 0.15);
  },
  correct() {
    playTone(523.25, 0.1, "sine", 0.15); // C5
    setTimeout(() => playTone(659.25, 0.1, "sine", 0.15), 80); // E5
    setTimeout(() => playTone(783.99, 0.25, "sine", 0.15), 160); // G5
  },
  wrong() {
    playTone(180, 0.2, "sawtooth", 0.2);
    setTimeout(() => playTone(120, 0.3, "sawtooth", 0.2), 120);
  },
  levelUp() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.2, "sine", 0.2), idx * 100);
    });
  },
  treasure() {
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760];
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 0.15, "triangle", 0.15), idx * 75);
    });
  }
};

// --- CONFETTI ANIMATION ---
const Confetti = {
  canvas: null,
  ctx: null,
  particles: [],
  active: false,

  init() {
    this.canvas = document.getElementById("confetti-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
  },

  resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  },

  spawn(count = 100) {
    this.initAudioContext();
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: -20 - Math.random() * 100,
        r: Math.random() * 6 + 4,
        color: `hsl(${Math.random() * 360}, 90%, 60%)`,
        vx: Math.random() * 4 - 2,
        vy: Math.random() * 5 + 3,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }
    if (!this.active) {
      this.active = true;
      this.loop();
    }
  },

  initAudioContext() {
    // Just to ensure contexts are active on trigger
    initAudio();
  },

  loop() {
    if (!this.active) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let alive = false;
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;

      if (p.y < this.canvas.height + 20) {
        alive = true;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
        this.ctx.restore();
      }
    });

    if (alive) {
      requestAnimationFrame(() => this.loop());
    } else {
      this.active = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
};

// --- DATA PERSISTENCE ---
function loadProgress() {
  const savedProfile = localStorage.getItem("math_adv_profile");
  if (savedProfile) {
    AppState.profile = JSON.parse(savedProfile);
  }
  const savedScoreboard = localStorage.getItem("math_adv_scoreboard");
  if (savedScoreboard) {
    AppState.scoreboard = JSON.parse(savedScoreboard);
  }
  updateHeaderStats();
}

function saveProgress() {
  localStorage.setItem("math_adv_profile", JSON.stringify(AppState.profile));
  localStorage.setItem("math_adv_scoreboard", JSON.stringify(AppState.scoreboard));
  updateHeaderStats();
}

// --- UTILS & CORE NAV ---
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }
}

function updateHeaderStats() {
  document.getElementById("header-stars").textContent = AppState.profile.stars;
  document.getElementById("header-points").textContent = AppState.profile.points;
}

// --- MASCOT SPEAKERS ---
function mascotTalk(elementId, text) {
  const speechBubble = document.getElementById(elementId);
  if (speechBubble) {
    speechBubble.textContent = text;
    speechBubble.style.animation = "pop 0.3s ease";
    setTimeout(() => { speechBubble.style.animation = ""; }, 300);
  }
  
  // Custom Speech Synthesis
  if (AppState.settings.speechEnabled && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }
}

// --- PROFILE AVATARS LIST RENDERING ---
function setupAvatarSelection() {
  const grid = document.getElementById("avatar-selection-grid");
  grid.innerHTML = "";
  Object.keys(AVATARS).forEach(key => {
    const wrapper = document.createElement("div");
    wrapper.className = `avatar-option ${AppState.profile.avatar === key ? 'selected' : ''}`;
    wrapper.dataset.avatar = key;
    wrapper.innerHTML = AVATARS[key];
    
    wrapper.addEventListener("click", () => {
      Sounds.click();
      document.querySelectorAll(".avatar-option").forEach(o => o.classList.remove("selected"));
      wrapper.classList.add("selected");
      AppState.profile.avatar = key;
    });
    grid.appendChild(wrapper);
  });

  // Load name to input
  document.getElementById("profile-name-input").value = AppState.profile.name;
}

// --- GRADE SCREEN & TOPICS ---
function loadTopics(gradeNum) {
  AppState.profile.currentGrade = parseInt(gradeNum);
  const container = document.getElementById("topics-list-container");
  container.innerHTML = "";
  document.getElementById("topics-grade-title").textContent = `Kelas ${gradeNum}`;

  const topics = GRADE_TOPICS[gradeNum];
  topics.forEach(t => {
    const card = document.createElement("div");
    card.className = "grade-card";
    
    // Check unlocked state
    const progressKey = `${gradeNum}_${t.id}`;
    const levelUnlocked = AppState.profile.unlockedLevels[progressKey] || 1;

    card.innerHTML = `
      <div class="grade-badge">Topik</div>
      <h3 class="grade-title">${t.name}</h3>
      <p class="grade-desc">Selesaikan petualangan bertahap. Level Terbuka: Level ${levelUnlocked}/5</p>
    `;

    card.addEventListener("click", () => {
      Sounds.click();
      AppState.profile.currentTopic = t;
      showScreen("modes-screen");
      document.getElementById("modes-title").textContent = `${t.name} - Kelas ${gradeNum}`;
    });

    container.appendChild(card);
  });
}

// --- ADVENTURE MAP RENDERING ---
function drawAdventureMap() {
  const progressKey = `${AppState.profile.currentGrade}_${AppState.profile.currentTopic.id}`;
  const maxUnlocked = AppState.profile.unlockedLevels[progressKey] || 1;
  
  document.getElementById("map-title-text").textContent = `Pulau ${AppState.profile.currentTopic.name}`;
  
  // Calculate completion percentage
  const completedLevels = maxUnlocked - 1;
  const progressPct = Math.min(Math.round((completedLevels / 5) * 100), 100);
  document.getElementById("map-progress-percent").textContent = `Progress: ${progressPct}%`;

  const container = document.getElementById("map-nodes-container");
  const svg = document.getElementById("map-svg-connections");
  container.innerHTML = "";
  svg.innerHTML = "";

  // Coords for 5 levels arranged in an S-curve path
  const nodes = [
    { level: 1, x: 20, y: 70 },
    { level: 2, x: 35, y: 35 },
    { level: 3, x: 55, y: 65 },
    { level: 4, x: 70, y: 30 },
    { level: 5, x: 88, y: 55 }
  ];

  // Draw connection lines in SVG first
  let pathD = `M ${nodes[0].x}% ${nodes[0].y}%`;
  for (let i = 1; i < nodes.length; i++) {
    pathD += ` L ${nodes[i].x}% ${nodes[i].y}%`;
  }

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathD);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "rgba(255, 255, 255, 0.4)");
  path.setAttribute("stroke-width", "6");
  path.setAttribute("stroke-dasharray", "8,8");
  svg.appendChild(path);

  // Render HTML Node Buttons
  nodes.forEach(n => {
    const nodeEl = document.createElement("div");
    nodeEl.className = "map-node";
    nodeEl.style.left = `${n.x}%`;
    nodeEl.style.top = `${n.y}%`;
    nodeEl.textContent = n.level;

    if (n.level < maxUnlocked) {
      nodeEl.classList.add("completed");
    } else if (n.level === maxUnlocked) {
      nodeEl.classList.add("unlocked", "active-node");
    } else {
      nodeEl.classList.add("locked");
    }

    nodeEl.addEventListener("click", () => {
      if (n.level <= maxUnlocked) {
        Sounds.click();
        startQuizSession("adventure", n.level);
      } else {
        Sounds.wrong();
      }
    });

    container.appendChild(nodeEl);
  });
}

// --- QUIZ & GAME SESSIONS CONTROLLER ---
function startQuizSession(mode, level = 1) {
  AppState.session.activeMode = mode;
  AppState.session.score = 0;
  AppState.session.combo = 0;
  AppState.session.hearts = 3;
  AppState.session.questionsCount = 0;
  AppState.session.correctCount = 0;
  AppState.session.currentLevel = level;

  const timerBar = document.getElementById("timer-bar-container");
  const levelIndicator = document.getElementById("game-level-indicator");
  
  if (mode === "time") {
    timerBar.style.display = "block";
    levelIndicator.textContent = "Time Challenge ⚡";
    AppState.session.timeLeft = 60;
    startTimer();
  } else if (mode === "daily") {
    timerBar.style.display = "none";
    levelIndicator.textContent = "Daily Challenge ⭐";
  } else {
    timerBar.style.display = "none";
    levelIndicator.textContent = `Level ${level}`;
  }

  updateHeartsDisplay();
  updateGameScoreDisplay();
  showNextQuestion();
  showScreen("game-screen");
}

function startTimer() {
  clearInterval(AppState.session.timerInterval);
  const timerBarEl = document.getElementById("game-timer-bar");
  timerBarEl.style.width = "100%";

  AppState.session.timerInterval = setInterval(() => {
    AppState.session.timeLeft--;
    const pct = (AppState.session.timeLeft / 60) * 100;
    timerBarEl.style.width = `${pct}%`;

    if (AppState.session.timeLeft <= 0) {
      clearInterval(AppState.session.timerInterval);
      endGameSession();
    }
  }, 1000);
}

function updateHeartsDisplay() {
  const container = document.getElementById("game-hearts-container");
  container.innerHTML = "";
  if (AppState.session.activeMode === "time") {
    container.innerHTML = "<span>⏳ 60s</span>";
    return;
  }
  for (let i = 0; i < 3; i++) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = i < AppState.session.hearts ? "❤️" : "🖤";
    container.appendChild(heart);
  }
}

function updateGameScoreDisplay() {
  document.getElementById("game-score-indicator").textContent = `Skor: ${AppState.session.score}`;
}

function showNextQuestion() {
  const { currentGrade, currentTopic } = AppState.profile;
  const qObj = QuestionsGenerator.generate(currentGrade, currentTopic ? currentTopic.id : null);
  AppState.session.currentQuestion = qObj;

  // Render question text
  document.getElementById("game-question-text").textContent = qObj.question;

  // Render buttons
  const optionsContainer = document.getElementById("game-options-container");
  optionsContainer.innerHTML = "";
  
  qObj.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleAnswerSelection(btn, opt));
    optionsContainer.appendChild(btn);
  });

  // Hint button setup
  document.getElementById("game-hint-btn").onclick = () => {
    Sounds.click();
    alert(`Bantuan: ${qObj.hint}`);
  };
}

function handleAnswerSelection(buttonEl, selectedVal) {
  // Disable all buttons to prevent double tapping
  const buttons = document.querySelectorAll("#game-options-container .option-btn");
  buttons.forEach(btn => btn.style.pointerEvents = "none");

  const correctVal = AppState.session.currentQuestion.answer;
  AppState.session.questionsCount++;

  if (selectedVal === correctVal) {
    // Correct
    buttonEl.classList.add("correct");
    Sounds.correct();
    
    // Reward points
    let pointsEarned = 10;
    AppState.session.combo++;
    AppState.session.correctCount++;

    if (AppState.session.combo >= 5) {
      pointsEarned += 20; // Combo bonus!
      const comboText = document.getElementById("game-combo-text");
      comboText.textContent = `Combo x${AppState.session.combo}! 🔥`;
      comboText.style.visibility = "visible";
      setTimeout(() => { comboText.style.visibility = "hidden"; }, 1500);
      Confetti.spawn(30);
    }
    
    AppState.session.score += pointsEarned;
    updateGameScoreDisplay();
  } else {
    // Incorrect
    buttonEl.classList.add("incorrect");
    Sounds.wrong();
    AppState.session.combo = 0; // Reset combo

    // Find correct button and flash it green
    buttons.forEach(btn => {
      if (btn.textContent === correctVal) {
        btn.classList.add("correct");
      }
    });

    if (AppState.session.activeMode !== "time") {
      AppState.session.hearts--;
      updateHeartsDisplay();
    }
  }

  // Next steps delay
  setTimeout(() => {
    if (AppState.session.activeMode !== "time" && AppState.session.hearts <= 0) {
      endGameSession();
      return;
    }

    if (AppState.session.activeMode === "adventure" && AppState.session.questionsCount >= 5) {
      // 5 questions per level in adventure mode
      endGameSession();
    } else {
      showNextQuestion();
    }
  }, 1200);
}

function endGameSession() {
  clearInterval(AppState.session.timerInterval);
  showScreen("result-screen");

  const mode = AppState.session.activeMode;
  const score = AppState.session.score;
  const finalCombo = AppState.session.combo;
  let medalIcon = "🥉";
  let medalName = "Medali Perunggu";
  let starReward = 1;

  // Determine Medals based on performance/scores
  if (mode === "adventure") {
    const accuracy = AppState.session.correctCount / AppState.session.questionsCount;
    if (accuracy === 1.0) {
      medalIcon = "🥇";
      medalName = "Medali Emas";
      starReward = 3;
    } else if (accuracy >= 0.8) {
      medalIcon = "🥈";
      medalName = "Medali Perak";
      starReward = 2;
    } else {
      medalIcon = "🥉";
      medalName = "Medali Perunggu";
      starReward = 1;
    }

    // Save Progress: unlock next level on adventure map
    const progressKey = `${AppState.profile.currentGrade}_${AppState.profile.currentTopic.id}`;
    const maxUnlocked = AppState.profile.unlockedLevels[progressKey] || 1;
    if (AppState.session.currentLevel === maxUnlocked && maxUnlocked < 5) {
      AppState.profile.unlockedLevels[progressKey] = maxUnlocked + 1;
    }
    
    // Add stars & overall points
    AppState.profile.stars += starReward;
    AppState.profile.points += score;
    Sounds.levelUp();
    Confetti.spawn(100);
    
    document.getElementById("result-title").textContent = `Level ${AppState.session.currentLevel} Selesai!`;
    mascotTalk("result-mascot-speech", `Selamat! Kamu menyelesaikan level ini dan mendapatkan ${starReward} bintang!`);
  } else if (mode === "time") {
    if (score >= 100) {
      medalIcon = "🥇";
      medalName = "Time Master Emas";
      starReward = 5;
    } else if (score >= 60) {
      medalIcon = "🥈";
      medalName = "Time Master Perak";
      starReward = 3;
    } else {
      medalIcon = "🥉";
      medalName = "Time Master Perunggu";
      starReward = 1;
    }

    AppState.profile.stars += starReward;
    AppState.profile.points += score;
    Sounds.levelUp();
    Confetti.spawn(80);
    
    document.getElementById("result-title").textContent = `Waktu Habis!`;
    mascotTalk("result-mascot-speech", `Hebat! Kamu berhasil menjawab dengan cepat dan mendapatkan ${score} poin!`);
  } else if (mode === "daily") {
    medalIcon = "⭐";
    medalName = "Penyeleseian Harian";
    starReward = 10; // Daily reward bonus!
    AppState.profile.stars += starReward;
    AppState.profile.points += score;
    Sounds.treasure();
    Confetti.spawn(100);

    // Save daily timestamp
    localStorage.setItem("math_adv_daily_quiz", new Date().toDateString());

    document.getElementById("result-title").textContent = `Daily Kuis Selesai!`;
    mascotTalk("result-mascot-speech", `Selamat! Kamu berhasil menaklukan tantangan harian dan mendapat bonus 10 bintang!`);
  }

  // Save changes to local storage
  saveScoreToBoard(AppState.profile.name, AppState.profile.currentGrade, score);
  saveProgress();

  document.getElementById("result-medal-icon").textContent = medalIcon;
  document.getElementById("result-medal-name").textContent = medalName;
  document.getElementById("result-score-val").textContent = score;
  document.getElementById("result-combo-val").textContent = finalCombo;

  // Next and Retry actions mapping
  document.getElementById("result-next-btn").onclick = () => {
    Sounds.click();
    if (mode === "adventure") {
      showScreen("map-screen");
      drawAdventureMap();
    } else {
      showScreen("modes-screen");
    }
  };

  document.getElementById("result-retry-btn").onclick = () => {
    Sounds.click();
    startQuizSession(mode, AppState.session.currentLevel);
  };
}

// --- LEADERBOARD & HIGH SCORES ---
function saveScoreToBoard(name, grade, score) {
  if (score <= 0) return;
  AppState.scoreboard.push({
    name: name || "Petualang",
    grade: `Kelas ${grade}`,
    score: score,
    date: new Date().toLocaleDateString("id-ID")
  });
  // Sort descending and keep top 8
  AppState.scoreboard.sort((a, b) => b.score - a.score);
  AppState.scoreboard = AppState.scoreboard.slice(0, 8);
  saveProgress();
}

function renderScoreboard() {
  const container = document.getElementById("scoreboard-rows-container");
  container.innerHTML = "";
  if (AppState.scoreboard.length === 0) {
    container.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Belum ada skor tercatat. Jadilah yang pertama!</td></tr>`;
    return;
  }
  AppState.scoreboard.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>#${index + 1}</strong></td>
      <td>${item.name}</td>
      <td>${item.grade}</td>
      <td style="color: var(--accent); font-weight: 700;">${item.score}</td>
    `;
    container.appendChild(row);
  });
}

// --- BATTLE MODE MULTIPLAYER ---
function startBattleSetup() {
  showScreen("battle-setup-screen");
}

function startBattleGame() {
  const p1Name = document.getElementById("player1-name-input").value || "Pemain 1";
  const p2Name = document.getElementById("player2-name-input").value || "Pemain 2";

  AppState.session.activeMode = "battle";
  AppState.session.battle = {
    player1: { name: p1Name, score: 0 },
    player2: { name: p2Name, score: 0 },
    currentPlayer: 1,
    turnsLeft: 10 // 5 turns each
  };

  document.getElementById("battle-p1-name").textContent = p1Name;
  document.getElementById("battle-p2-name").textContent = p2Name;
  document.getElementById("battle-p1-score").textContent = "0";
  document.getElementById("battle-p2-score").textContent = "0";

  showScreen("battle-screen");
  showNextBattleQuestion();
}

function showNextBattleQuestion() {
  const activePlayerNum = AppState.session.battle.currentPlayer;
  const activePlayerName = activePlayerNum === 1 ? AppState.session.battle.player1.name : AppState.session.battle.player2.name;

  document.getElementById("battle-turn-indicator").textContent = `Giliran ${activePlayerName}! ⚔️`;

  const { currentGrade, currentTopic } = AppState.profile;
  const qObj = QuestionsGenerator.generate(currentGrade, currentTopic ? currentTopic.id : null);
  AppState.session.currentQuestion = qObj;

  document.getElementById("battle-question-text").textContent = qObj.question;

  const container = document.getElementById("battle-options-container");
  container.innerHTML = "";
  qObj.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleBattleSelection(btn, opt));
    container.appendChild(btn);
  });
}

function handleBattleSelection(buttonEl, selectedVal) {
  const buttons = document.querySelectorAll("#battle-options-container .option-btn");
  buttons.forEach(btn => btn.style.pointerEvents = "none");

  const correctVal = AppState.session.currentQuestion.answer;
  const activePlayerNum = AppState.session.battle.currentPlayer;

  if (selectedVal === correctVal) {
    buttonEl.classList.add("correct");
    Sounds.correct();
    if (activePlayerNum === 1) {
      AppState.session.battle.player1.score += 10;
      document.getElementById("battle-p1-score").textContent = AppState.session.battle.player1.score;
    } else {
      AppState.session.battle.player2.score += 10;
      document.getElementById("battle-p2-score").textContent = AppState.session.battle.player2.score;
    }
  } else {
    buttonEl.classList.add("incorrect");
    Sounds.wrong();
    buttons.forEach(btn => {
      if (btn.textContent === correctVal) btn.classList.add("correct");
    });
  }

  // Next Turn
  AppState.session.battle.turnsLeft--;

  setTimeout(() => {
    if (AppState.session.battle.turnsLeft <= 0) {
      endBattleGame();
    } else {
      // Alternate players
      AppState.session.battle.currentPlayer = activePlayerNum === 1 ? 2 : 1;
      showNextBattleQuestion();
    }
  }, 1200);
}

function endBattleGame() {
  showScreen("result-screen");
  const p1 = AppState.session.battle.player1;
  const p2 = AppState.session.battle.player2;
  let winnerText = "";
  
  if (p1.score > p2.score) {
    winnerText = `${p1.name} MENANG! 🏆`;
    Sounds.levelUp();
    Confetti.spawn(80);
  } else if (p2.score > p1.score) {
    winnerText = `${p2.name} MENANG! 🏆`;
    Sounds.levelUp();
    Confetti.spawn(80);
  } else {
    winnerText = "SERI! 🤝";
    Sounds.treasure();
  }

  document.getElementById("result-title").textContent = winnerText;
  document.getElementById("result-medal-icon").textContent = "⚔️";
  document.getElementById("result-medal-name").textContent = `${p1.name} (${p1.score} pt) vs ${p2.name} (${p2.score} pt)`;
  document.getElementById("result-score-val").textContent = Math.max(p1.score, p2.score);
  document.getElementById("result-combo-val").textContent = "-";
  
  mascotTalk("result-mascot-speech", "Pertarungan yang luar biasa! Kalian berdua sungguh hebat dalam matematika.");

  document.getElementById("result-next-btn").onclick = () => {
    Sounds.click();
    showScreen("modes-screen");
  };
  document.getElementById("result-retry-btn").onclick = () => {
    Sounds.click();
    startBattleGame();
  };
}

// --- TREASURE HUNT MODE ---
function startTreasureHunt() {
  AppState.session.activeMode = "treasure";
  AppState.session.treasure.clueIndex = 0;
  AppState.session.treasure.coordinatePuzzles = [
    { q: "Cari pulau dengan koordinat X: Hasil dari 3 + 4", a: "7", options: ["6", "7", "8", "9"] },
    { q: "Cari pulau dengan koordinat Y: Hasil dari 10 - 6", a: "4", options: ["2", "4", "5", "6"] },
    { q: "Cari gerbang pulau dengan Kode Rahasia: Hasil perkalian 3 × 3", a: "9", options: ["6", "8", "9", "12"] }
  ];

  document.getElementById("treasure-chest-icon").textContent = "🔒🎁";
  showScreen("treasure-screen");
  showNextTreasurePuzzle();
}

function showNextTreasurePuzzle() {
  const idx = AppState.session.treasure.clueIndex;
  const puz = AppState.session.treasure.coordinatePuzzles[idx];

  document.getElementById("treasure-puzzle-box").innerHTML = `
    <h4 style="color: var(--secondary); margin-bottom: 0.5rem;">Kunci Teka-teki #${idx + 1}</h4>
    <p style="font-size: 1.25rem; font-weight: 700;">${puz.q}</p>
  `;

  const container = document.getElementById("treasure-options-container");
  container.innerHTML = "";
  puz.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.addEventListener("click", () => handleTreasureSelection(btn, opt));
    container.appendChild(btn);
  });
}

function handleTreasureSelection(buttonEl, selectedVal) {
  const buttons = document.querySelectorAll("#treasure-options-container .option-btn");
  buttons.forEach(btn => btn.style.pointerEvents = "none");

  const idx = AppState.session.treasure.clueIndex;
  const puz = AppState.session.treasure.coordinatePuzzles[idx];

  if (selectedVal === puz.a) {
    buttonEl.classList.add("correct");
    Sounds.correct();
    AppState.session.treasure.clueIndex++;

    setTimeout(() => {
      if (AppState.session.treasure.clueIndex >= 3) {
        endTreasureHunt(true);
      } else {
        showNextTreasurePuzzle();
      }
    }, 1200);
  } else {
    buttonEl.classList.add("incorrect");
    Sounds.wrong();
    buttons.forEach(btn => {
      if (btn.textContent === puz.a) btn.classList.add("correct");
    });
    setTimeout(() => {
      endTreasureHunt(false);
    }, 1500);
  }
}

function endTreasureHunt(isWin) {
  showScreen("result-screen");
  if (isWin) {
    document.getElementById("result-title").textContent = "Harta Karun Ditemukan! 🎁";
    document.getElementById("result-medal-icon").textContent = "🔓👑";
    document.getElementById("result-medal-name").textContent = "Peti Emas Kebijaksanaan";
    document.getElementById("result-score-val").textContent = "+50 Poin";
    document.getElementById("result-combo-val").textContent = "3/3 Clues";

    AppState.profile.points += 50;
    AppState.profile.stars += 5;
    saveProgress();
    Sounds.treasure();
    Confetti.spawn(120);

    mascotTalk("result-mascot-speech", "Luar biasa! Kamu berhasil memecahkan kode rahasia dan menemukan peti harta karun!");
  } else {
    document.getElementById("result-title").textContent = "Gagal Membuka Peti!";
    document.getElementById("result-medal-icon").textContent = "🔒❌";
    document.getElementById("result-medal-name").textContent = "Coba teka-teki sekali lagi.";
    document.getElementById("result-score-val").textContent = "0";
    document.getElementById("result-combo-val").textContent = "Gagal";

    mascotTalk("result-mascot-speech", "Aduh, kodenya salah. Mari belajar lagi dan coba lagi nanti!");
  }

  document.getElementById("result-next-btn").onclick = () => {
    Sounds.click();
    showScreen("modes-screen");
  };
  document.getElementById("result-retry-btn").onclick = () => {
    Sounds.click();
    startTreasureHunt();
  };
}

// --- DAILY CHALLENGE VALIDATOR ---
function verifyDailyQuizAvailability() {
  const lastPlayed = localStorage.getItem("math_adv_daily_quiz");
  const today = new Date().toDateString();
  
  if (lastPlayed === today) {
    alert("Kamu sudah menyelesaikan Daily Quiz hari ini! Kembali lagi besok ya.");
    return false;
  }
  return true;
}

// --- CHECK COMPLETION FOR CERTIFICATE ---
function checkAllLevelsCompleted() {
  // Check if at least 15 grade_topic elements have progress of 5
  let totalCompletedTopics = 0;
  let totalTopicsCount = 0;
  
  Object.keys(GRADE_TOPICS).forEach(grade => {
    GRADE_TOPICS[grade].forEach(topic => {
      totalTopicsCount++;
      const progressKey = `${grade}_${topic.id}`;
      const levelUnlocked = AppState.profile.unlockedLevels[progressKey] || 1;
      if (levelUnlocked >= 5) {
        totalCompletedTopics++;
      }
    });
  });

  // Certificate unlocks when player finishes at least 6 distinct topics up to level 5
  return totalCompletedTopics >= 6;
}

// --- INITIALIZE & ATTACH HANDLERS ---
document.addEventListener("DOMContentLoaded", () => {
  // Load data
  loadProgress();
  Confetti.init();

  // Logo Click
  document.getElementById("header-brand-logo").addEventListener("click", (e) => {
    e.preventDefault();
    Sounds.click();
    showScreen("home-screen");
  });

  // Home Screen Start Button
  document.getElementById("hero-start-btn").addEventListener("click", () => {
    Sounds.click();
    document.getElementById("grade-selection-grid").scrollIntoView({ behavior: "smooth" });
  });

  // Grade Select Cards
  document.querySelectorAll(".grade-card").forEach(card => {
    card.addEventListener("click", () => {
      Sounds.click();
      const grade = card.dataset.grade;
      loadTopics(grade);
      showScreen("topics-screen");
    });
  });

  // Back Buttons
  document.getElementById("topics-back-btn").addEventListener("click", () => {
    Sounds.click();
    showScreen("home-screen");
  });

  document.getElementById("modes-back-btn").addEventListener("click", () => {
    Sounds.click();
    showScreen("topics-screen");
  });

  document.getElementById("map-back-btn").addEventListener("click", () => {
    Sounds.click();
    showScreen("modes-screen");
  });

  // Game Mode Selection
  document.querySelectorAll(".mode-card").forEach(card => {
    card.addEventListener("click", () => {
      Sounds.click();
      const mode = card.dataset.mode;
      if (mode === "adventure") {
        showScreen("map-screen");
        drawAdventureMap();
      } else if (mode === "time") {
        startQuizSession("time");
      } else if (mode === "battle") {
        startBattleSetup();
      } else if (mode === "daily") {
        if (verifyDailyQuizAvailability()) {
          startQuizSession("daily");
        }
      } else if (mode === "treasure") {
        startTreasureHunt();
      }
    });
  });

  // Game quit button
  document.getElementById("game-quit-btn").addEventListener("click", () => {
    Sounds.click();
    if (confirm("Apakah kamu yakin ingin menyerah dari petualangan ini?")) {
      clearInterval(AppState.session.timerInterval);
      showScreen("modes-screen");
    }
  });

  // Battle Back & Setup Play
  document.getElementById("battle-setup-back-btn").addEventListener("click", () => {
    Sounds.click();
    showScreen("modes-screen");
  });

  document.getElementById("battle-start-play-btn").addEventListener("click", () => {
    Sounds.click();
    startBattleGame();
  });

  document.getElementById("battle-quit-btn").addEventListener("click", () => {
    Sounds.click();
    if (confirm("Apakah kalian ingin menyudahi duel ini?")) {
      showScreen("modes-screen");
    }
  });

  // Treasure Back
  document.getElementById("treasure-back-btn").addEventListener("click", () => {
    Sounds.click();
    showScreen("modes-screen");
  });

  // Theme Toggle (Dark Mode Support)
  document.getElementById("theme-toggle-btn").addEventListener("click", () => {
    Sounds.click();
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const targetTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", targetTheme);
  });

  // Profile Button & Modal Handlers
  document.getElementById("profile-btn").addEventListener("click", () => {
    Sounds.click();
    setupAvatarSelection();
    document.getElementById("profile-modal").classList.add("active");
  });

  document.getElementById("profile-close-btn").addEventListener("click", () => {
    Sounds.click();
    document.getElementById("profile-modal").classList.remove("active");
  });

  document.getElementById("profile-save-btn").addEventListener("click", () => {
    Sounds.click();
    const newName = document.getElementById("profile-name-input").value.trim();
    if (newName) {
      AppState.profile.name = newName;
      saveProgress();
    }
    document.getElementById("profile-modal").classList.remove("active");
    
    // Check if player completed everything for certificate
    if (checkAllLevelsCompleted()) {
      alert("Hebat! Kamu telah membuka Sertifikat Kelulusan Master Matematika!");
      document.getElementById("cert-player-name").textContent = AppState.profile.name;
      document.getElementById("cert-date").textContent = new Date().toLocaleDateString("id-ID");
      showScreen("cert-screen");
    }
  });

  // Scoreboard Button & Modal Handlers
  document.getElementById("scoreboard-btn").addEventListener("click", () => {
    Sounds.click();
    renderScoreboard();
    document.getElementById("scoreboard-modal").classList.add("active");
  });

  document.getElementById("scoreboard-close-btn").addEventListener("click", () => {
    Sounds.click();
    document.getElementById("scoreboard-modal").classList.remove("active");
  });

  // Cert back
  document.getElementById("cert-back-btn").addEventListener("click", () => {
    Sounds.click();
    showScreen("home-screen");
  });
  document.getElementById("cert-home-btn").addEventListener("click", () => {
    Sounds.click();
    showScreen("home-screen");
  });

  // Result screen Home btn
  document.getElementById("result-home-btn").addEventListener("click", () => {
    Sounds.click();
    showScreen("home-screen");
  });
});
