/* 눈으로 하는 디버깅 — 부스 진행 화면
   조작은 전부 마우스 클릭입니다. 상태는 슬라이드 4개뿐입니다. */

const TIME_LIMIT = { easy: 30, hard: 60 };
const LEVEL_NAME = { easy: "초급", hard: "고급" };

const $ = (id) => document.getElementById(id);

const el = {
  stage:      document.querySelector("#slide-quiz .stage"),
  codebox:    document.querySelector("#slide-quiz .codebox"),
  work:       $("work"),
  ioAbout:    $("io-about"),
  aboutText:  $("about-text"),
  ioInput:    $("io-input"),
  ioOutput:   $("io-output"),
  ioGuess:    $("io-guess"),
  guess:      $("guess"),
  inputText:  $("input-text"),
  outputText: $("output-text"),
  readyLevel: $("ready-level"),
  readyTime:  $("ready-time"),
  quizLevel:  $("quiz-level"),
  timer:      $("timer"),
  timeup:     $("timeup"),
  prompt:     $("prompt"),
  lang:       $("lang"),
  code:       $("code"),
  reveal:     $("reveal"),
  answer:     $("answer"),
  note:       $("note"),
  btnStart:   $("btn-start"),
  btnReveal:  $("btn-reveal"),
  btnHome:    $("btn-home"),
};

let level = "easy";
let current = null;
let deadline = 0;
let ticker = null;

/* ── 슬라이드 전환 ──────────────────────────────────────── */

function show(name) {
  for (const s of document.querySelectorAll(".slide")) s.classList.remove("active");
  $("slide-" + name).classList.add("active");
}

/* ── 문제 뽑기: 난이도별로 한 바퀴 돌 때까지 중복 없음 ──── */

const pools = { easy: [], hard: [] };

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestion(lv) {
  if (pools[lv].length === 0) {
    pools[lv] = shuffle(
      QUESTIONS.map((q, i) => (q.level === lv ? i : -1)).filter((i) => i >= 0)
    );
  }
  if (pools[lv].length === 0) return null;   // 해당 난이도에 문제가 없을 때입니다
  return QUESTIONS[pools[lv].pop()];
}

/* ── 렌더링 ─────────────────────────────────────────────── */

function renderCode(q) {
  el.code.textContent = "";
  q.code.split("\n").forEach((text, i) => {
    const span = document.createElement("span");
    span.className = "line";
    span.dataset.n = i + 1;
    span.textContent = text;
    el.code.appendChild(span);
  });
}

/* 화면에 딱 맞을 때까지 코드 글자 크기를 줄입니다.
   정답 영역까지 미리 자리를 잡아 놓고 재기 때문에,
   정답을 공개해도 코드 크기가 다시 바뀌지 않습니다. */

const CODE_MAX = 34;
const CODE_MIN = 13;

function fitCode() {
  const hidden = el.reveal.hidden;
  if (hidden) {
    el.reveal.hidden = false;
    el.reveal.classList.add("measuring");
  }

  let size = CODE_MAX;
  el.code.style.fontSize = size + "px";

  const overflows = () =>
    el.stage.scrollHeight > el.stage.clientHeight + 1 ||
    el.codebox.scrollWidth > el.codebox.clientWidth + 1;

  while (size > CODE_MIN && overflows()) {
    size -= 1;
    el.code.style.fontSize = size + "px";
  }

  if (hidden) {
    el.reveal.hidden = true;
    el.reveal.classList.remove("measuring");
  }
}

/* 정답이 대부분 한글이면 본문 폰트로 보여 줍니다.
   "63 62 60 ... (한 줄에 하나씩)" 처럼 코드나 숫자가 섞인 정답은
   등폭이라야 읽히므로, 한글 비율로 가릅니다. */
function isMostlyKorean(text) {
  const chars = text.replace(/\s/g, "");
  if (!chars) return false;
  const hangul = chars.match(/[가-힣]/g);
  return (hangul ? hangul.length : 0) / chars.length > 0.5;
}

/* 적은 만큼 칸이 늘어나게 합니다. 여러 줄짜리 답이 잘려 보이면
   정답과 나란히 비교할 수가 없기 때문입니다. */
function growGuess() {
  el.guess.style.height = "auto";
  el.guess.style.height = el.guess.scrollHeight + "px";
}

/* 입력/출력 칸 하나를 채우거나, 내용이 없으면 숨깁니다. */
function fillIO(box, pre, text) {
  if (!text) {
    box.hidden = true;
    return;
  }
  pre.textContent = text;
  // 프로그램 값은 등폭으로, 한글 설명은 본문 폰트로 보여 줍니다
  pre.classList.toggle("prose", /[가-힣]/.test(text));
  box.hidden = false;
}

function renderQuestion(q) {
  el.quizLevel.textContent = LEVEL_NAME[q.level];
  el.prompt.textContent = q.prompt || "";
  el.lang.textContent = q.lang || "";

  fillIO(el.ioAbout, el.aboutText, q.about);
  fillIO(el.ioInput, el.inputText, q.input);
  fillIO(el.ioOutput, el.outputText, q.output);

  // 원하는 출력을 보여주지 않으면 출력을 묻는 문제로 보고 답 적는 칸을 띄웁니다.
  // 설명만 주는 문제처럼 예외가 필요하면 JSON 에 answerBox 로 지정할 수 있습니다.
  // 맞았는지 비교하지는 않습니다. 적은 값은 정답을 공개해도 그대로 남습니다.
  el.ioGuess.hidden =
    typeof q.answerBox === "boolean" ? !q.answerBox : !!q.output;
  el.guess.value = "";
  el.guess.style.height = "";

  // 왼쪽에 보여줄 게 하나도 없으면 코드만 가운데에 놓습니다
  el.work.classList.toggle(
    "solo",
    el.ioAbout.hidden && el.ioInput.hidden &&
    el.ioOutput.hidden && el.ioGuess.hidden
  );

  renderCode(q);

  // 정답 내용은 미리 채워 두되 감춰 둡니다 (크기를 재는 데 쓰입니다)
  el.answer.textContent = q.answer || "";
  el.answer.classList.toggle("prose", isMostlyKorean(q.answer || ""));
  el.note.textContent = q.note || "";
  el.reveal.hidden = true;
  el.timeup.hidden = true;
  el.btnReveal.hidden = false;
  el.btnHome.hidden = true;
  el.timer.classList.remove("warn");

  fitCode();
}

function revealAnswer() {
  if (!current) return;
  stopTimer();
  if (!el.ioGuess.hidden) growGuess();

  for (const n of current.bad || []) {
    const line = el.code.querySelector('.line[data-n="' + n + '"]');
    if (line) line.classList.add("hit");
  }

  el.reveal.hidden = false;

  el.btnReveal.hidden = true;
  el.btnHome.hidden = false;
}

/* ── 타이머 ─────────────────────────────────────────────── */
/* 남은 시간은 항상 시작 시각을 기준으로 계산합니다.
   1초마다 카운터를 깎으면 창이 가려졌을 때 시간이 어긋납니다. */

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function tick() {
  const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
  el.timer.textContent = formatTime(left);
  el.timer.classList.toggle("warn", left <= 10);

  if (left <= 0) {
    stopTimer();
    el.timeup.hidden = false;   // 정답은 자동으로 공개하지 않습니다
  }
}

function startTimer(seconds) {
  stopTimer();
  deadline = Date.now() + seconds * 1000;
  tick();
  ticker = setInterval(tick, 200);
}

function stopTimer() {
  if (ticker) clearInterval(ticker);
  ticker = null;
}

/* ── 클릭 연결 ──────────────────────────────────────────── */

// data-go="title" 처럼 적힌 버튼은 그 슬라이드로 이동합니다
for (const btn of document.querySelectorAll("[data-go]")) {
  btn.addEventListener("click", () => {
    stopTimer();
    show(btn.dataset.go);
  });
}

// 1슬라이드 시작하기 → 전체화면을 시도합니다 (안 되면 조용히 넘어갑니다)
document.querySelector('#slide-title [data-go="level"]').addEventListener("click", () => {
  const r = document.documentElement.requestFullscreen?.();
  if (r && r.catch) r.catch(() => {});
});

// 난이도 카드
for (const card of document.querySelectorAll(".level-card")) {
  card.addEventListener("click", () => {
    level = card.dataset.level;
    el.readyLevel.textContent = LEVEL_NAME[level];
    el.readyTime.textContent = "제한시간 " + TIME_LIMIT[level] + "초";
    show("ready");
  });
}

// 준비 화면 시작하기 → 문제와 타이머가 동시에 시작됩니다
el.btnStart.addEventListener("click", () => {
  const q = pickQuestion(level);
  if (!q) {
    alert(LEVEL_NAME[level] + " 문제가 questions.js 에 없습니다.");
    return;
  }
  current = q;
  show("quiz");          // 크기를 재려면 화면에 먼저 떠 있어야 합니다
  renderQuestion(q);
  startTimer(TIME_LIMIT[level]);
  if (!el.ioGuess.hidden) el.guess.focus();
});

el.guess.addEventListener("input", growGuess);
el.btnReveal.addEventListener("click", revealAnswer);

window.addEventListener("resize", () => {
  if ($("slide-quiz").classList.contains("active") && current) fitCode();
});

show("title");
