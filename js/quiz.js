import { api, DEMO, QUIZ } from "./quiz-firebase.js";

const $app = document.getElementById("app");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const LET = ["A", "B", "C", "D"];

let lang = "hi";
try { lang = sessionStorage.getItem("sopLang") || "hi"; } catch (e) {}

const T = {
  hi: {
    title: "क्विज़ पोर्टल", sap: "SAP ID दर्ज करें", sapPh: "जैसे 100001", dept: "विभाग चुनें", topic: "क्विज़ विषय चुनें", sel: "-- चुनें --",
    cont: "आगे बढ़ें", checking: "जांच हो रही है…", needAll: "कृपया SAP ID, विभाग और विषय चुनें।",
    SAP_NOT_FOUND: "यह SAP ID रजिस्टर्ड नहीं है। कृपया सही SAP ID डालें या अपने अधिकारी से संपर्क करें।",
    SAP_INACTIVE: "यह SAP ID सक्रिय नहीं है। कृपया अपने अधिकारी से संपर्क करें।",
    BANK_EXHAUSTED: "इस विषय के सभी उपलब्ध प्रश्न आप हल कर चुके हैं। नए प्रश्न जुड़ने की प्रतीक्षा करें (प्रश्न बैंक अपडेट होना है)।",
    BANK_EMPTY: "इस विषय के प्रश्न अभी उपलब्ध नहीं हैं।", ATTEMPT_NOT_FOUND: "प्रयास नहीं मिला।", NETWORK: "इंटरनेट/सर्वर में समस्या है। कृपया दोबारा प्रयास करें।",
    hello: "नमस्ते", change: "बदलें", quiz: "क्विज़", avail: "उपलब्ध", attempted: "प्रयास किया गया", already: "क्विज़ पहले ही हल किया जा चुका है",
    enter: "क्विज़ शुरू करें", resume: "क्विज़ जारी रखें", reattempt: "पुनः प्रयास", viewRes: "परिणाम देखें", qm: "7 प्रश्न · 4 मिनट", notReady: "इस विषय का क्विज़ अभी उपलब्ध नहीं है।",
    pass: "उत्तीर्ण", fail: "अनुत्तीर्ण", timeOver: "समय समाप्त", back: "वापस", goBack: "वापस जाएं", instr: "क्विज़ निर्देश", welcomeTo: "में आपका स्वागत है", readCarefully: "कृपया शुरू करने से पहले निर्देश ध्यान से पढ़ें।",
    r1: ["समय सीमा", "क्विज़ पूरा करने के लिए 4 मिनट।"], r2: ["कुल प्रश्न", "7 बहुविकल्पीय प्रश्न।"], r3: ["प्रश्न का प्रकार", "एक सही उत्तर या एक से अधिक सही उत्तर।"], r4: ["उत्तीर्ण अंक", "7 में से कम से कम 5 सही।"],
    rules: ["सबमिट करने से पहले आप उत्तर बदल सकते हैं।", "जिन प्रश्नों का उत्तर नहीं दिया गया उन्हें गलत माना जाएगा।", "टाइमर शून्य होने पर क्विज़ अपने-आप सबमिट हो जाएगा।", "सबमिट करने के बाद उत्तर बदले नहीं जा सकते।", "क्विज़ के दौरान ब्राउज़र को रिफ्रेश या बंद न करें।", "एक से अधिक सही उत्तर वाले प्रश्न में सभी सही विकल्प चुनें; एक भी गलत विकल्प चुनने पर अंक नहीं मिलेगा।"],
    ready: "क्विज़ तभी शुरू करें जब आप तैयार हों। टाइमर तुरंत शुरू हो जाएगा।", starting: "शुरू हो रहा है…",
    qn: (a, b) => `प्रश्न ${a} / ${b}`, one: "सही उत्तर चुनें।", many: "सभी सही उत्तर चुनें।", prev: "पिछला", next: "अगला", submit: "सबमिट करें", answered: (a, b) => `उत्तर दिए: ${a} / ${b}`,
    confirm: (n) => (n ? `${n} प्रश्न अनुत्तरित हैं (गलत गिने जाएंगे)। क्या आप सबमिट करना चाहते हैं?` : "क्या आप क्विज़ सबमिट करना चाहते हैं? सबमिट के बाद उत्तर नहीं बदल सकेंगे।"),
    inProg: "क्विज़ जारी है", submitting: "सबमिट हो रहा है…", retry: "दोबारा सबमिट करें", congrats: "बधाई हो!", passed: "आप उत्तीर्ण हुए", failed: "आप उत्तीर्ण नहीं हुए", failMsg: "चिंता न करें, SOP पढ़ें और फिर प्रयास करें।",
    correctAns: "सही उत्तर", passing: "उत्तीर्ण अंक: 7 में से 5", total: "कुल प्रश्न", att: "हल किए", cor: "सही", inc: "गलत", unatt: "अनुत्तरित", review: "प्रश्नवार समीक्षा",
    your: "आपका उत्तर", right: "सही उत्तर", none: "कोई उत्तर नहीं", expl: "व्याख्या", ref: "संदर्भ", readSop: "SOP का यह भाग पढ़ें", ok: "सही", wrong: "गलत", home: "क्विज़ चयन पर जाएं", demo: "डेमो मोड: नमूना डम्पर प्रश्न · SAP ID 100001 आज़माएं · डेटा सिर्फ इसी ब्राउज़र में रहेगा",
    leave: "क्विज़ चल रहा है। क्या आप सचमुच पेज छोड़ना चाहते हैं?",
  },
  en: {
    title: "Quiz Portal", sap: "Enter SAP ID", sapPh: "e.g. 100001", dept: "Select Department", topic: "Select Quiz Topic", sel: "-- Select --",
    cont: "Continue", checking: "Checking…", needAll: "Please enter SAP ID and select department and topic.",
    SAP_NOT_FOUND: "This SAP ID is not registered. Please check it or contact your officer.",
    SAP_INACTIVE: "This SAP ID is not active. Please contact your officer.",
    BANK_EXHAUSTED: "You have already seen all available questions of this topic. The question bank needs to be refreshed with new approved questions.",
    BANK_EMPTY: "Questions for this topic are not available yet.", ATTEMPT_NOT_FOUND: "Attempt not found.", NETWORK: "Network/server problem. Please try again.",
    hello: "Hello", change: "Change", quiz: "Quiz", avail: "Available", attempted: "Attempted", already: "Quiz Already Attempted",
    enter: "Enter Quiz", resume: "Resume Quiz", reattempt: "Reattempt", viewRes: "View Results", qm: "7 Questions · 4 Minutes", notReady: "Quiz for this topic is not available yet.",
    pass: "PASS", fail: "FAIL", timeOver: "Time over", back: "Back", goBack: "Go Back", instr: "QUIZ INSTRUCTIONS", welcomeTo: "Welcome to the", readCarefully: "Please read the following instructions carefully before starting.",
    r1: ["Time Duration", "4 minutes to complete the assessment."], r2: ["Total Questions", "7 multiple-choice questions."], r3: ["Question Type", "Single-correct or multiple-correct answers."], r4: ["Passing Marks", "At least 5 correct out of 7."],
    rules: ["You may change your answers before final submission.", "Unanswered questions will be treated as incorrect.", "The quiz will automatically submit when the timer reaches zero.", "Once submitted, answers cannot be modified.", "Do not refresh or close the browser during an active quiz.", "In multiple-correct questions select ALL correct options; any wrong option means no mark."],
    ready: "Click Enter Quiz only when you are ready to begin. The timer starts immediately.", starting: "Starting…",
    qn: (a, b) => `Question ${a} of ${b}`, one: "Select the correct answer.", many: "Select all correct answers.", prev: "Previous", next: "Next", submit: "Submit Quiz", answered: (a, b) => `Answered: ${a} / ${b}`,
    confirm: (n) => (n ? `${n} question(s) are unanswered and will be marked incorrect. Submit the quiz?` : "Submit the quiz? Answers cannot be changed after submission."),
    inProg: "Quiz in Progress", submitting: "Submitting…", retry: "Retry submit", congrats: "CONGRATULATIONS!", passed: "YOU HAVE PASSED", failed: "YOU DID NOT PASS", failMsg: "Don't worry — read the SOP and try again.",
    correctAns: "Correct Answers", passing: "Passing marks: 5 out of 7", total: "Total Questions", att: "Attempted", cor: "Correct", inc: "Incorrect", unatt: "Unattempted", review: "Question-wise Review",
    your: "Your answer", right: "Correct answer", none: "No answer", expl: "Explanation", ref: "Reference", readSop: "Read this SOP section", ok: "Correct", wrong: "Incorrect", home: "Back to quiz selection", demo: "DEMO MODE: sample Dumper questions · try SAP ID 100001 · data stays in this browser only",
    leave: "A quiz is in progress. Leave this page?",
  },
};
const t = (k, ...a) => { const v = T[lang][k]; return typeof v === "function" ? v(...a) : v; };

const S = { sap: "", name: "", dept: "", topic: "", status: null, att: null, answers: {}, cur: 0, endAt: 0, timer: null, busy: false, screen: "entry", modal: null, result: null, err: "" };
const deptOf = (k) => DEPTS[k];
const topicOf = () => (S.dept && DEPTS[S.dept] ? DEPTS[S.dept].equipment.find((e) => e.id === S.topic) : null);
const name2 = (o) => (lang === "hi" ? o.hi : o.en);
const topicName = () => { const e = topicOf(); return e ? (lang === "hi" ? e.hi : e.en) : ""; };
const deptName = () => (S.dept ? (lang === "hi" ? DEPTS[S.dept].hi : DEPTS[S.dept].en) : "");
const errMsg = (e) => t(e && T.hi[e.message] ? e.message : "NETWORK");

function langBar() {
  return `<div class="qz-langbar"><div class="lang"><button data-lang="hi" class="${lang === "hi" ? "on" : ""}">हिंदी</button><button data-lang="en" class="${lang === "en" ? "on" : ""}">English</button></div></div>`;
}
const wrap = (inner) => `<div class="qz">${DEMO ? `<div class="qz-demo">${t("demo")}</div>` : ""}${inner}</div>`;
const spinner = '<span class="qz-spin"></span>';

/* ---------- screens ---------- */
function renderEntry() {
  S.screen = "entry";
  const opts = (arr, cur) => `<option value="">${t("sel")}</option>` + arr.map(([v, l]) => `<option value="${esc(v)}" ${v === cur ? "selected" : ""}>${esc(l)}</option>`).join("");
  const depts = Object.keys(DEPTS).map((k) => [k, `${DEPTS[k].en} / ${DEPTS[k].hi}`]);
  const tops = S.dept ? DEPTS[S.dept].equipment.map((e) => [e.id, `${e.en} / ${e.hi}`]) : [];
  $app.innerHTML = wrap(`${langBar()}<h2>${t("title")}</h2>
    <div class="qz-card">
      <label class="f" for="fSap">${t("sap")}</label>
      <input id="fSap" type="text" inputmode="text" autocomplete="off" autocapitalize="characters" maxlength="12" placeholder="${t("sapPh")}" value="${esc(S.sap)}" />
      <label class="f" for="fDept">${t("dept")}</label>
      <select id="fDept">${opts(depts, S.dept)}</select>
      <label class="f" for="fTopic">${t("topic")}</label>
      <select id="fTopic" ${S.dept ? "" : "disabled"}>${opts(tops, S.topic)}</select>
      ${S.err ? `<div class="qz-err">${esc(S.err)}</div>` : ""}
      <button class="qz-btn block" id="bGo" style="margin-top:16px" ${S.busy ? "disabled" : ""}>${S.busy ? spinner + " " + t("checking") : t("cont")}</button>
    </div>`);
}

async function goContinue() {
  S.sap = document.getElementById("fSap").value.trim().toUpperCase();
  S.dept = document.getElementById("fDept").value;
  S.topic = document.getElementById("fTopic").value;
  S.err = "";
  if (!S.sap || !S.dept || !S.topic) { S.err = t("needAll"); return renderEntry(); }
  S.busy = true; renderEntry();
  try {
    const v = await api.verifyEmployee(S.sap);
    S.name = v.name;
    S.status = await api.getStatus(S.sap, S.dept, S.topic);
    try { sessionStorage.setItem("quizSap", S.sap); } catch (e) {}
    S.busy = false;
    renderQuizzes();
  } catch (e) { S.busy = false; S.err = errMsg(e); renderEntry(); }
}

function renderQuizzes() {
  S.screen = "quizzes"; S.modal = null;
  const st = S.status, ready = st.approved >= QUIZ.total;
  const cards = [1, 2, 3, 4].map((n) => {
    const list = st.attempts.filter((a) => a.quizNo === n);
    const open = list.find((a) => a.status === "in_progress");
    const done = list.filter((a) => a.status !== "in_progress").sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))[0];
    let body;
    if (open) {
      body = `<span class="badge warn">${t("inProg")}</span><button class="qz-btn block ok" data-start="${n}" ${ready ? "" : "disabled"}>${t("resume")}</button>`;
    } else if (done) {
      body = `<span class="att">${t("already")}</span><span class="qz-muted">${done.score}/${done.total} · ${done.passed ? t("pass") : t("fail")}${done.status === "expired" ? " (" + t("timeOver") + ")" : ""}${list.length > 2 ? "" : ""}</span>
        <div class="qz-row"><button class="qz-btn ghost sm" data-start="${n}">${t("reattempt")}</button><button class="qz-btn sm" data-view="${done.attemptId}">${t("viewRes")}</button></div>`;
    } else {
      body = `<span class="qz-muted">${t("qm")}</span><button class="qz-btn block" data-start="${n}" ${ready ? "" : "disabled"}>${t("enter")}</button>`;
    }
    return `<div class="qz-qc ${done && !open ? "done" : ""}"><div class="top"><span>${t("quiz")} ${n}</span><span class="badge ${done && !open ? "" : "blue"}">${done && !open ? t("attempted") : t("avail")}</span></div>${body}</div>`;
  }).join("");
  $app.innerHTML = wrap(`${langBar()}
    <div class="qz-who"><div>${t("hello")}, <b>${esc(S.name)}</b><br><span class="qz-muted">${esc(deptName())} › ${esc(topicName())}</span></div><button class="qz-btn ghost sm" data-act="change">${t("change")}</button></div>
    ${ready ? "" : `<div class="qz-info">${t("notReady")}</div>`}
    ${ready && st.unused < QUIZ.total ? `<div class="qz-info">${T[lang].BANK_EXHAUSTED}</div>` : ""}
    <div class="qz-grid">${cards}</div>
    `);
}

function showInstructions(n) {
  S.modal = n;
  const rules = (T[lang].rules || []).map((r) => `<li>${r}</li>`).join("");
  const row = (ic, [a, b]) => `<div class="qz-rule"><span class="ic">${ic}</span><div><b>${a}</b><br><span class="qz-muted">${b}</span></div></div>`;
  const div = document.createElement("div");
  div.className = "qz-ov"; div.id = "qzModal";
  div.innerHTML = `<div class="qz-modal" role="dialog" aria-modal="true">
    <div style="text-align:center;font-size:2.4rem">📋</div><h3>${t("instr")}</h3><div class="sub">NMDC DIGITAL SOP PORTAL</div>
    <p style="margin:6px 0"><b>${t("hello")}, ${esc(S.name)}!</b><br>${lang === "hi" ? `${esc(topicName())} क्विज़ ${n} ${t("welcomeTo")}।` : `${t("welcomeTo")} ${esc(topicName())} Quiz ${n}.`}<br><span class="qz-muted">${t("readCarefully")}</span></p>
    ${row("⏱️", t("r1"))}${row("📝", t("r2"))}${row("☑️", t("r3"))}${row("🏆", t("r4"))}
    <ul class="qz-rules">${rules}</ul>
    <p style="margin:0 0 12px"><b>${t("ready")}</b></p>
    <div class="qz-row"><button class="qz-btn ghost" data-act="closeModal">${t("goBack")}</button><button class="qz-btn ok" id="bStart" data-act="begin">${t("enter")}</button></div>
    <div id="qzModalErr"></div></div>`;
  document.body.appendChild(div);
  document.body.style.overflow = "hidden";
}
function closeModal() {
  const m = document.getElementById("qzModal");
  if (m) m.remove();
  document.body.style.overflow = "";
  S.modal = null;
}

async function begin() {
  const n = S.modal, btn = document.getElementById("bStart");
  btn.disabled = true; btn.innerHTML = spinner + " " + t("starting");
  try {
    const a = await api.startQuiz({ sapId: S.sap, dept: S.dept, topic: S.topic, quizNo: n, lang });
    S.att = a;
    S.endAt = Date.now() + a.remainingSec * 1000;
    S.cur = 0;
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem("quizAns_" + a.attemptId) || "{}"); } catch (e) {}
    S.answers = saved;
    closeModal();
    renderQuiz();
    startTimer();
  } catch (e) {
    btn.disabled = false; btn.textContent = t("enter");
    document.getElementById("qzModalErr").innerHTML = `<div class="qz-err">${esc(errMsg(e))}</div>`;
    if (e.message === "BANK_EXHAUSTED") { try { S.status = await api.getStatus(S.sap, S.dept, S.topic); } catch (x) {} }
  }
}

/* ---------- quiz ---------- */
const mmss = (s) => String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
const answeredCount = () => S.att.questions.filter((q) => (S.answers[q.id] || []).length).length;

function renderQuiz() {
  S.screen = "quiz";
  const qs = S.att.questions, q = qs[S.cur], sel = S.answers[q.id] || [], n = qs.length;
  const opts = q.options[lang].map((o, i) => `<button type="button" class="qz-opt ${q.multi ? "multi" : ""} ${sel.includes(i) ? "on" : ""}" data-opt="${i}"><span class="mk">✓</span><span><b>${LET[i]}.</b> ${esc(o)}</span></button>`).join("");
  const dots = qs.map((x, i) => `<button type="button" data-goto="${i}" class="${(S.answers[x.id] || []).length ? "ans" : ""} ${i === S.cur ? "cur" : ""}">${i + 1}</button>`).join("");
  const last = S.cur === n - 1;
  $app.innerHTML = wrap(`<div class="qz-bar">
      <div class="r1"><span class="tt">${esc(topicName().toUpperCase())} · ${t("quiz")} ${S.att.quizNo}</span><span class="badge">${t("inProg")}</span></div>
      <div class="r2"><span class="qz-muted">${t("qn", S.cur + 1, n)}</span><span class="qz-timer" id="qzTimer">--:--</span></div>
      <div class="qz-prog"><i style="width:${((S.cur + 1) / n) * 100}%"></i></div></div>
    ${langBar()}
    <div class="qz-q">Q${S.cur + 1}. ${esc(q.q[lang])}</div>
    <div class="qz-hint">${q.multi ? t("many") : t("one")}</div>
    ${opts}
    <div class="qz-dots">${dots}</div>
    <div class="qz-nav">
      <button class="qz-btn ghost" data-act="prev" ${S.cur === 0 ? "disabled" : ""}>‹ ${t("prev")}</button>
      <span class="mid">${t("answered", answeredCount(), n)}</span>
      ${last ? `<button class="qz-btn ok" data-act="submit">${t("submit")}</button>` : `<button class="qz-btn" data-act="next">${t("next")} ›</button>`}
    </div>
    ${last ? "" : `<button class="qz-btn ok block" style="margin-top:12px" data-act="submit">${t("submit")}</button>`}`);
  tick();
}

function tick() {
  const left = Math.max(0, Math.round((S.endAt - Date.now()) / 1000));
  const el = document.getElementById("qzTimer");
  if (el) { el.textContent = mmss(left); el.classList.toggle("calm", left > 60); }
  return left;
}
function startTimer() {
  clearInterval(S.timer);
  S.timer = setInterval(() => { if (S.screen === "quiz" && tick() <= 0) { clearInterval(S.timer); doSubmit(true); } }, 500);
}
function persist() { try { sessionStorage.setItem("quizAns_" + S.att.attemptId, JSON.stringify(S.answers)); } catch (e) {} }

function confirmSubmit(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "qz-ov";
    overlay.innerHTML = `<div class="qz-modal" role="dialog" aria-modal="true" aria-labelledby="submitConfirmTitle">
      <h3 id="submitConfirmTitle">${t("submit")}</h3>
      <p>${esc(message)}</p>
      <div class="qz-row"><button class="qz-btn ghost" data-choice="cancel">${t("goBack")}</button><button class="qz-btn ok" data-choice="submit">${t("submit")}</button></div>
    </div>`;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    const finish = (confirmed) => {
      document.removeEventListener("keydown", onKeydown);
      overlay.remove();
      document.body.style.overflow = "";
      resolve(confirmed);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") finish(false);
    };
    document.addEventListener("keydown", onKeydown);
    overlay.querySelector('[data-choice="cancel"]').onclick = () => finish(false);
    overlay.querySelector('[data-choice="submit"]').onclick = () => finish(true);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) finish(false);
    });
    overlay.querySelector('[data-choice="submit"]').focus();
  });
}

function pickOption(i) {
  const q = S.att.questions[S.cur];
  let sel = (S.answers[q.id] || []).slice();
  if (q.multi) sel = sel.includes(i) ? sel.filter((x) => x !== i) : [...sel, i].sort();
  else sel = sel.includes(i) ? [] : [i];
  S.answers[q.id] = sel;
  persist();
  renderQuiz();
}

async function doSubmit(auto) {
  if (S.screen !== "quiz") return;
  if (!auto) {
    const un = S.att.questions.length - answeredCount();
    if (!(await confirmSubmit(t("confirm", un)))) return;
  }
  clearInterval(S.timer);
  S.screen = "submitting";
  $app.innerHTML = wrap(`<div class="qz-card plain" style="text-align:center;margin-top:30px"><div class="qz-spin" style="border-color:#c9d8ee;border-top-color:var(--blue2);width:34px;height:34px"></div><p><b>${t("submitting")}</b></p></div>`);
  try {
    const r = await api.submitQuiz({ sapId: S.sap, attemptId: S.att.attemptId, answers: S.answers });
    try { sessionStorage.removeItem("quizAns_" + S.att.attemptId); } catch (e) {}
    S.result = r;
    S.status = await api.getStatus(S.sap, S.dept, S.topic).catch(() => S.status);
    renderResult();
  } catch (e) {
    S.screen = "submitFail";
    $app.innerHTML = wrap(`<div class="qz-card plain"><div class="qz-err">${esc(errMsg(e))}</div><button class="qz-btn block" style="margin-top:12px" data-act="retrySubmit">${t("retry")}</button></div>`);
  }
}

/* ---------- result ---------- */
function renderResult() {
  S.screen = "result";
  const r = S.result;
  const rev = r.review.map((x, i) => {
    const opts = x.options[lang].map((o, k) => {
      const right = x.correct.includes(k), mine = x.yours.includes(k);
      const cls = right ? "right" : mine ? "wrong" : "";
      return `<div class="o ${cls}">${right ? "✅" : mine ? "❌" : "▫️"} <b>${LET[k]}.</b> ${esc(o)}</div>`;
    }).join("");
    const sec = x.ref && typeof x.ref.sec === "number" ? x.ref.sec : null;
    const link = !x.isCorrect && sec !== null ? `<a class="rd" href="sop.html?dept=${encodeURIComponent(r.dept)}&eq=${encodeURIComponent(r.topic)}&sec=${sec}">📖 ${t("readSop")}</a>` : "";
    return `<div class="qz-rev ${x.isCorrect ? "c" : "w"}"><div class="qt"><span>Q${i + 1}. ${esc(x.q[lang])}</span><span class="badge ${x.isCorrect ? "" : "bad"}">${x.isCorrect ? t("ok") : t("wrong")}</span></div>
      ${opts}
      <div class="qz-muted">${t("your")}: ${x.yours.length ? x.yours.map((k) => LET[k]).join(", ") : t("none")} · ${t("right")}: ${x.correct.map((k) => LET[k]).join(", ")}</div>
      <div class="ex"><b>${t("expl")}:</b> ${esc(x.explanation[lang] || "")}</div>
      ${x.ref && (x.ref.text || x.ref.dgms) ? `<div class="rf">${t("ref")}: ${esc([x.ref.text, x.ref.dgms].filter(Boolean).join(" · "))}</div>` : ""}${link}</div>`;
  }).join("");
  $app.innerHTML = wrap(`${langBar()}
    <div class="qz-hero ${r.passed ? "pass" : "fail"}"><div class="em">${r.passed ? "🏆" : "📘"}</div>
      <h2>${r.passed ? t("congrats") : t("failed")}</h2>${r.passed ? `<b>${t("passed")}</b>` : `<span>${t("failMsg")}</span>`}
      <div class="qz-muted" style="margin-top:4px">${esc(topicName().toUpperCase())} · ${t("quiz")} ${r.quizNo}</div>
      <div class="qz-score" style="color:${r.passed ? "var(--ok)" : "var(--bad)"}">${r.correct} / ${r.total}</div>
      <div class="qz-muted">${t("passing")}</div></div>
    <div class="qz-stats"><div><b>${r.total}</b><span>${t("total")}</span></div><div><b>${r.attempted}</b><span>${t("att")}</span></div>
      <div><b style="color:var(--ok)">${r.correct}</b><span>${t("cor")}</span></div><div><b style="color:var(--bad)">${r.incorrect}</b><span>${t("inc")}</span></div>
      <div style="grid-column:1/-1"><b>${r.unattempted}</b><span>${t("unatt")}</span></div></div>
    <button class="qz-btn block" data-act="home" style="margin-bottom:14px">${t("home")}</button>
    <h2 style="text-align:left">${t("review")}</h2>${rev}
    <button class="qz-btn block" data-act="home">${t("home")}</button>`);
  window.scrollTo(0, 0);
}

async function viewResult(id) {
  $app.innerHTML = wrap(`<div class="qz-card plain" style="text-align:center;margin-top:30px">${spinner.replace("qz-spin", "qz-spin\" style=\"border-color:#c9d8ee;border-top-color:var(--blue2)")}</div>`);
  try { S.result = await api.getResult(S.sap, id); renderResult(); }
  catch (e) { renderQuizzes(); alert(errMsg(e)); }
}

/* ---------- events ---------- */
function rerender() {
  ({ entry: renderEntry, quizzes: renderQuizzes, quiz: renderQuiz, result: renderResult })[S.screen]?.();
  if (S.screen === "quizzes" && S.modal) { const n = S.modal; closeModal(); showInstructions(n); }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.lang) { lang = b.dataset.lang; try { sessionStorage.setItem("sopLang", lang); } catch (x) {} return rerender(); }
  if (b.id === "bGo") return goContinue();
  if (b.dataset.start) return showInstructions(+b.dataset.start);
  if (b.dataset.view) return viewResult(b.dataset.view);
  if (b.dataset.opt !== undefined && S.screen === "quiz") return pickOption(+b.dataset.opt);
  if (b.dataset.goto !== undefined && S.screen === "quiz") { S.cur = +b.dataset.goto; return renderQuiz(); }
  switch (b.dataset.act) {
    case "closeModal": return closeModal();
    case "begin": return begin();
    case "prev": S.cur = Math.max(0, S.cur - 1); return renderQuiz();
    case "next": S.cur = Math.min(S.att.questions.length - 1, S.cur + 1); return renderQuiz();
    case "submit": return doSubmit(false);
    case "retrySubmit": S.screen = "quiz"; return doSubmit(true);
    case "change": S.status = null; return renderEntry();
    case "home": return renderQuizzes();
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "fDept") {
    S.sap = document.getElementById("fSap").value.trim().toUpperCase();
    S.dept = e.target.value; S.topic = ""; S.err = ""; renderEntry();
  }
});
document.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "fSap") goContinue(); });
window.addEventListener("beforeunload", (e) => { if (S.screen === "quiz") { e.preventDefault(); e.returnValue = T[lang].leave; } });

try { S.sap = sessionStorage.getItem("quizSap") || ""; } catch (e) {}
const pre = new URLSearchParams(location.search);
if (pre.get("dept") && DEPTS[pre.get("dept")]) { S.dept = pre.get("dept"); if (pre.get("topic")) S.topic = pre.get("topic"); }
renderEntry();
