/* 눈으로 하는 디버깅 — 부스 진행 화면
   조작은 전부 마우스 클릭. 상태는 슬라이드 4개뿐이다. */

const TIME_LIMIT = { easy: 30, medium: 30, hard: 60 };
const LEVEL_NAME = { easy: "초급", medium: "중급", hard: "고급" };

const $ = (id) => document.getElementById(id);

const el = {
  stage:      document.querySelector("#slide-quiz .stage"),
  codebox:    document.querySelector("#slide-quiz .codebox"),
  readyLevel: $("ready-level"),
  readyTime:  $("ready-time"),
  quizLevel:  $("quiz-level"),
  timer:      $("timer"),
  timeup:     $("timeup"),
  prompt:     $("prompt"),
  given:      $("given"),
  givenLabel: $("given-label"),
  givenText:  $("given-text"),
  lang:       $("lang"),
  code:       $("code"),
  reveal:     $("reveal"),
  answer:     $("answer"),
  note:       $("note"),
  btnStart:   $("btn-start"),
  btnReveal:  $("btn-reveal"),
  btnHome:    $("btn-home"),
};

let level = "medium";
let current = null;
let deadline = 0;
let ticker = null;

/* ── 슬라이드 전환 ──────────────────────────────────────── */

function show(name) {
  for (const s of document.querySelectorAll(".slide")) s.classList.remove("active");
  $("slide-" + name).classList.add("active");
}

/* ── 문제 뽑기: 난이도별로 한 바퀴 돌 때까지 중복 없음 ──── */

const pools = { easy: [], medium: [], hard: [] };

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
  if (pools[lv].length === 0) return null;   // 해당 난이도 문제가 없을 때
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

/* 화면에 딱 맞을 때까지 코드 글자 크기를 줄인다.
   정답 영역까지 미리 자리를 잡아놓고 재기 때문에,
   정답을 공개해도 코드 크기가 다시 바뀌지 않는다. */

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

function renderQuestion(q) {
  el.quizLevel.textContent = LEVEL_NAME[q.level];
  el.prompt.textContent = q.prompt || "";
  el.lang.textContent = q.lang || "";

  if (q.given) {
    el.givenLabel.textContent = q.given.label || "";
    el.givenText.textContent = q.given.text || "";
    el.given.classList.toggle("stacked", (q.given.text || "").includes("\n"));
    // 프로그램 출력은 등폭으로, 한글 설명은 본문 폰트로 보여준다
    el.givenText.classList.toggle("prose", /[가-힣]/.test(q.given.text || ""));
    el.given.hidden = false;
  } else {
    el.given.hidden = true;
  }

  renderCode(q);

  // 정답 내용은 미리 채워두되 감춰둔다 (크기 계산에 쓰인다)
  el.answer.textContent = q.answer || "";
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

  for (const n of current.bad || []) {
    const line = el.code.querySelector('.line[data-n="' + n + '"]');
    if (line) line.classList.add("hit");
  }

  el.reveal.hidden = false;

  el.btnReveal.hidden = true;
  el.btnHome.hidden = false;
}

/* ── 타이머 ─────────────────────────────────────────────── */
/* 남은 시간은 항상 시작 시각 기준으로 계산한다.
   1초마다 카운터를 깎으면 창이 가려졌을 때 시간이 어긋난다. */

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
    el.timeup.hidden = false;   // 정답은 자동 공개하지 않는다
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

// data-go="title" 처럼 적힌 버튼은 그 슬라이드로 이동
for (const btn of document.querySelectorAll("[data-go]")) {
  btn.addEventListener("click", () => {
    stopTimer();
    show(btn.dataset.go);
  });
}

// 1슬라이드 시작하기 → 전체화면 시도 (안 되면 조용히 넘어감)
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

// 준비 화면 시작하기 → 문제와 타이머가 동시에 시작
el.btnStart.addEventListener("click", () => {
  const q = pickQuestion(level);
  if (!q) {
    alert(LEVEL_NAME[level] + " 문제가 questions.js 에 없습니다.");
    return;
  }
  current = q;
  show("quiz");          // 크기를 재려면 화면에 먼저 떠 있어야 한다
  renderQuestion(q);
  startTimer(TIME_LIMIT[level]);
});

el.btnReveal.addEventListener("click", revealAnswer);

window.addEventListener("resize", () => {
  if ($("slide-quiz").classList.contains("active") && current) fitCode();
});

show("title");
