/* ===== Quiz module: 100% FREE Firebase Spark Plan Setup (Direct Firestore) =====
   Uses Cloud Firestore directly from the browser — NO Cloud Functions or paid Blaze plan required! */

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDU48skosp-6mrktIDAWUtlK3Cccu_8idc",
  authDomain: "digital-sop-library.firebaseapp.com",
  projectId: "digital-sop-library",
  storageBucket: "digital-sop-library.firebasestorage.app",
  messagingSenderId: "909666139156",
  appId: "1:909666139156:web:0383d2528ddca6b4593b01",
  measurementId: "G-XWQB2MM9J7"
};
export const FUNCTIONS_REGION = "asia-south1";
export const QUIZ = { total: 7, minutes: 4, passMark: 5, quizzesPerTopic: 4, quizzesByDept: { mining: 4, mech: 2, elec: 2 } };
/* number of quizzes per topic: Mining 4, Mechanical 2, Electrical 2 */
export const quizzesFor = (dept) => QUIZ.quizzesByDept[dept] || QUIZ.quizzesPerTopic;

const qs = new URLSearchParams(location.search);
export const DEMO = qs.get("demo") === "1" || FIREBASE_CONFIG.apiKey.startsWith("PASTE");

const KNOWN = ["SAP_NOT_FOUND", "SAP_INACTIVE", "BANK_EXHAUSTED", "BANK_EMPTY", "ATTEMPT_NOT_FOUND", "FORBIDDEN"];
const norm = (e) => {
  const m = (e && e.message) || "";
  if (!KNOWN.includes(m)) console.error("[Quiz] Firestore call failed:", e && e.code, m, e);
  return new Error(KNOWN.includes(m) ? m : "NETWORK");
};

/* ---------------- REAL BACKEND (100% Free Spark Plan - Direct Firestore) ---------------- */
async function realApi() {
  const V = "10.12.2";
  const { initializeApp, getApps } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
  const F = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  const db = F.getFirestore(app);

  const durationMs = QUIZ.minutes * 60 * 1000;
  const graceMs = 15 * 1000;
  const DEPTS_LIST = ["mining", "mech", "elec"];

  const cleanSap = (s) => {
    const v = String(s || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
    if (!v) throw new Error("SAP_NOT_FOUND");
    return v;
  };

  const bankKeyOf = (dept, topic) => {
    if (!DEPTS_LIST.includes(dept) || !/^[a-z0-9_]{1,80}$/.test(String(topic))) throw new Error("BANK_EMPTY");
    return `${dept}__${topic}`;
  };

  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

  async function getEmployee(sap) {
    const snap = await F.getDoc(F.doc(db, "employees", sap));
    if (!snap.exists()) throw new Error("SAP_NOT_FOUND");
    const e = snap.data();
    if (e.active === false || e.status === "Inactive") throw new Error("SAP_INACTIVE");
    return e;
  }

  async function fetchQuestions(ids) {
    if (!ids || !ids.length) return [];
    const snaps = await Promise.all(ids.map((id) => F.getDoc(F.doc(db, "questions", id))));
    return snaps.filter((s) => s.exists()).map((s) => ({ id: s.id, ...s.data() }));
  }

  async function finalize(ref, att, answers, status) {
    const qs = await fetchQuestions(att.questionIds);
    const byId = Object.fromEntries(qs.map((q) => [q.id, q]));
    if (att.snapshot) Object.assign(byId, att.snapshot);
    let attempted = 0, correct = 0;
    const saved = {};
    att.questionIds.forEach((id) => {
      const q = byId[id];
      const raw = (answers && answers[id]) || [];
      const yours = [...new Set(raw.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < 4))].sort();
      saved[id] = yours;
      if (yours.length) attempted++;
      if (q && sameSet(yours, [...q.correct].sort())) correct++;
    });
    const snapshot = att.snapshot || {};
    att.questionIds.forEach((id) => { const q = byId[id]; if (q && !snapshot[id]) snapshot[id] = { q: q.q, options: q.options, correct: q.correct, multi: !!q.multi, explanation: q.explanation || {}, ref: q.ref || {} }; });
    const total = att.questionIds.length;
    const upd = { status, answers: saved, attempted, correct, total, incorrect: total - correct, score: Math.round((correct / total) * 100), snapshot, passed: correct >= QUIZ.passMark, submittedAt: Date.now() };
    await F.updateDoc(ref, upd);
    return { ...att, ...upd };
  }

  async function buildResult(attemptId, att) {
    const qs = await fetchQuestions(att.questionIds);
    const byId = Object.fromEntries(qs.map((q) => [q.id, q]));
    if (att.snapshot) Object.assign(byId, att.snapshot);
    return {
      attemptId, dept: att.dept, topic: att.topic, quizNo: att.quizNo, name: att.name,
      total: QUIZ.total, attempted: att.attempted, unattempted: QUIZ.total - att.attempted,
      correct: att.correct, incorrect: att.attempted - att.correct, passed: att.passed, passMark: QUIZ.passMark,
      review: att.questionIds.map((id) => {
        const q = byId[id] || { q: { en: "", hi: "" }, options: { en: [], hi: [] }, correct: [], explanation: {}, ref: {} };
        const yours = (att.answers && att.answers[id]) || [];
        return {
          id, q: q.q, options: q.options, multi: !!q.multi, yours, correct: q.correct,
          isCorrect: sameSet(yours, [...q.correct].sort()) && yours.length > 0,
          explanation: q.explanation || {}, ref: q.ref || {}
        };
      }),
    };
  }

  async function loadAttempts(sap, bankKey) {
    const q = F.query(F.collection(db, "quizAttempts"), F.where("sapId", "==", sap), F.where("bankKey", "==", bankKey));
    const snap = await F.getDocs(q);
    return snap.docs.map((d) => ({ _ref: d.ref, _id: d.id, ...d.data() }));
  }

  async function sweep(list) {
    for (const a of list) {
      if (a.status === "in_progress" && Date.now() - a.startedAt > durationMs + graceMs) {
        Object.assign(a, await finalize(a._ref, a, {}, "expired"));
      }
    }
  }

  const summary = (a) => ({
    attemptId: a._id, quizNo: a.quizNo, attemptNo: a.attemptNo, status: a.status,
    score: a.correct ?? 0, total: QUIZ.total, passed: !!a.passed, submittedAt: a.submittedAt || null
  });

  const wrapCall = (fn) => async (...args) => {
    try { return await fn(...args); } catch (e) { throw norm(e); }
  };

  return {
    verifyEmployee: wrapCall(async (sapId) => {
      const e = await getEmployee(cleanSap(sapId));
      return { name: e.name };
    }),

    getStatus: wrapCall(async (sapId, dept, topic) => {
      const sap = cleanSap(sapId);
      await getEmployee(sap);
      const bankKey = bankKeyOf(dept, topic);
      const list = await loadAttempts(sap, bankKey);
      await sweep(list);
      const used = new Set(list.flatMap((a) => a.questionIds || []));
      const q = F.query(F.collection(db, "questions"), F.where("bankKey", "==", bankKey), F.where("status", "==", "approved"));
      const qsnap = await F.getDocs(q);
      const ids = qsnap.docs.map((d) => d.id);
      return { attempts: list.map(summary), approved: ids.length, unused: ids.filter((id) => !used.has(id)).length };
    }),

    startQuiz: wrapCall(async (p) => {
      const sap = cleanSap(p.sapId);
      const emp = await getEmployee(sap);
      const { dept, topic } = p;
      const bankKey = bankKeyOf(dept, topic);
      const quizNo = Number(p.quizNo);
      if (!Number.isInteger(quizNo) || quizNo < 1 || quizNo > quizzesFor(dept)) throw new Error("BANK_EMPTY");

      const list = await loadAttempts(sap, bankKey);
      await sweep(list);

      let att = list.find((a) => a.quizNo === quizNo && a.status === "in_progress");
      let attemptId = att && att._id;

      if (!att) {
        /* Reattempt: reuse the SAME questions (same order) assigned in the first attempt of this quiz */
        const first = list.filter((a) => a.quizNo === quizNo && a.questionIds && a.questionIds.length).sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0))[0];
        let pick;
        if (first) pick = [...first.questionIds];
        else {
          const used = new Set(list.flatMap((a) => a.questionIds || []));
          const q = F.query(F.collection(db, "questions"), F.where("bankKey", "==", bankKey), F.where("status", "==", "approved"));
          const qsnap = await F.getDocs(q);
          const ids = qsnap.docs.map((d) => d.id);
          if (!ids.length) throw new Error("BANK_EMPTY");
          const pool = ids.filter((id) => !used.has(id));
          if (pool.length < QUIZ.total) throw new Error("BANK_EXHAUSTED");
          pick = shuffle(pool).slice(0, QUIZ.total);
        }
        const doc = {
          sapId: sap, name: emp.name, dept, topic, bankKey, quizNo,
          attemptNo: list.filter((a) => a.quizNo === quizNo).length + 1,
          questionIds: pick, status: "in_progress", startedAt: Date.now(), lang: p.lang === "en" ? "en" : "hi",
        };
        /* keep the first attempt's question snapshot so a later edit/delete cannot change a reattempt */
        if (first && first.snapshot && pick.every((id) => first.snapshot[id])) doc.snapshot = first.snapshot;
        const ref = await F.addDoc(F.collection(db, "quizAttempts"), doc);
        att = doc;
        attemptId = ref.id;
      }

      const qs = await fetchQuestions(att.questionIds);
      const byId = Object.fromEntries(qs.map((q) => [q.id, q]));
      if (att.snapshot) Object.assign(byId, att.snapshot);
      if (att.questionIds.some((id) => !byId[id])) throw new Error("BANK_EMPTY");
      return {
        attemptId, quizNo,
        remainingSec: Math.max(1, Math.round((att.startedAt + durationMs - Date.now()) / 1000)),
        questions: att.questionIds.map((id) => ({ id, q: byId[id].q, options: byId[id].options, multi: !!byId[id].multi })),
      };
    }),

    submitQuiz: wrapCall(async (p) => {
      const sap = cleanSap(p.sapId);
      const id = String(p.attemptId || "");
      if (!id) throw new Error("ATTEMPT_NOT_FOUND");
      const ref = F.doc(db, "quizAttempts", id);
      const snap = await F.getDoc(ref);
      if (!snap.exists() || snap.data().sapId !== sap) throw new Error("ATTEMPT_NOT_FOUND");
      let att = snap.data();
      if (att.status === "in_progress") {
        const late = Date.now() - att.startedAt > durationMs + graceMs;
        att = await finalize(ref, att, late ? {} : p.answers, late ? "expired" : "submitted");
      }
      return buildResult(id, att);
    }),

    getResult: wrapCall(async (sapId, attemptId) => {
      const sap = cleanSap(sapId);
      const id = String(attemptId || "");
      if (!id) throw new Error("ATTEMPT_NOT_FOUND");
      const snap = await F.getDoc(F.doc(db, "quizAttempts", id));
      if (!snap.exists() || snap.data().sapId !== sap || snap.data().status === "in_progress") {
        throw new Error("ATTEMPT_NOT_FOUND");
      }
      return buildResult(id, snap.data());
    }),
  };
}

/* ---------------- DEMO BACKEND (browser only) ---------------- */
function demoApi() {
  const EMP = { "100001": "Vikrant Vishal", "100002": "Demo Workman" };
  const KEY = "quizDemoAttempts";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const save = (a) => { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} };
  const bank = (dept, topic) => (window.QUIZ_SAMPLE || []).filter((q) => q.dept === dept && q.topic === topic);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const clean = (s) => String(s || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const mine = (sap, dept, topic) => load().filter((a) => a.sapId === sap && a.dept === dept && a.topic === topic);
  const grace = 15000;
  const grade = (att, answers) => {
    const qs = att.questionIds.map((id) => window.QUIZ_SAMPLE.find((q) => q.id === id));
    let attempted = 0, correct = 0;
    const review = qs.map((q) => {
      const yours = (answers && answers[q.id]) || [];
      if (yours.length) attempted++;
      const ok = yours.length === q.correct.length && q.correct.every((i) => yours.includes(i));
      if (ok) correct++;
      return { id: q.id, q: q.q, options: q.options, multi: q.multi, yours, correct: q.correct, isCorrect: ok, explanation: q.explanation, ref: q.ref };
    });
    return { correct, attempted, review };
  };
  const result = (att) => ({
    attemptId: att.attemptId, dept: att.dept, topic: att.topic, quizNo: att.quizNo, name: att.name,
    total: QUIZ.total, attempted: att.attempted, unattempted: QUIZ.total - att.attempted,
    correct: att.correct, incorrect: att.attempted - att.correct, passed: att.passed, passMark: QUIZ.passMark, review: att.review,
  });
  const finalize = (att, answers, status) => {
    const g = grade(att, answers);
    Object.assign(att, { status, attempted: g.attempted, correct: g.correct, review: g.review, passed: g.correct >= QUIZ.passMark, submittedAt: Date.now() });
  };
  const sweep = (all) => all.forEach((a) => {
    if (a.status === "in_progress" && Date.now() - a.startedAt > QUIZ.minutes * 60000 + grace) finalize(a, {}, "expired");
  });
  const summary = (a) => ({ attemptId: a.attemptId, quizNo: a.quizNo, attemptNo: a.attemptNo, status: a.status, score: a.correct, total: QUIZ.total, passed: a.passed, submittedAt: a.submittedAt });
  return {
    async verifyEmployee(sapId) {
      await sleep(250);
      const id = clean(sapId);
      if (!EMP[id]) throw new Error("SAP_NOT_FOUND");
      return { name: EMP[id] };
    },
    async getStatus(sapId, dept, topic) {
      await sleep(200);
      const sap = clean(sapId), all = load();
      sweep(all); save(all);
      const att = mine(sap, dept, topic);
      const used = new Set(att.flatMap((a) => a.questionIds));
      const b = bank(dept, topic);
      return { attempts: att.map(summary), approved: b.length, unused: b.filter((q) => !used.has(q.id)).length };
    },
    async startQuiz({ sapId, dept, topic, quizNo }) {
      await sleep(250);
      const sap = clean(sapId), all = load();
      sweep(all);
      const mineAll = all.filter((a) => a.sapId === sap && a.dept === dept && a.topic === topic);
      const open = mineAll.find((a) => a.quizNo === quizNo && a.status === "in_progress");
      let att = open;
      if (!att) {
        const first = mineAll.filter((a) => a.quizNo === quizNo)[0];
        const used = new Set(mineAll.flatMap((a) => a.questionIds));
        const pool = bank(dept, topic).filter((q) => !used.has(q.id));
        if (!first) {
          if (!bank(dept, topic).length) throw new Error("BANK_EMPTY");
          if (pool.length < QUIZ.total) throw new Error("BANK_EXHAUSTED");
          pool.sort(() => Math.random() - 0.5);
        }
        att = {
          attemptId: "demo-" + Date.now(), sapId: sap, name: EMP[sap], dept, topic, quizNo,
          attemptNo: mineAll.filter((a) => a.quizNo === quizNo).length + 1,
          questionIds: first ? [...first.questionIds] : pool.slice(0, QUIZ.total).map((q) => q.id), status: "in_progress", startedAt: Date.now(),
        };
        all.push(att);
      }
      save(all);
      const remainingSec = Math.max(1, Math.round((att.startedAt + QUIZ.minutes * 60000 - Date.now()) / 1000));
      const questions = att.questionIds.map((id) => {
        const q = window.QUIZ_SAMPLE.find((x) => x.id === id);
        return { id: q.id, q: q.q, options: q.options, multi: q.multi };
      });
      return { attemptId: att.attemptId, quizNo, remainingSec, questions };
    },
    async submitQuiz({ sapId, attemptId, answers }) {
      await sleep(250);
      const all = load();
      const att = all.find((a) => a.attemptId === attemptId && a.sapId === clean(sapId));
      if (!att) throw new Error("ATTEMPT_NOT_FOUND");
      if (att.status === "in_progress") {
        const late = Date.now() - att.startedAt > QUIZ.minutes * 60000 + grace;
        finalize(att, late ? {} : answers, late ? "expired" : "submitted");
        save(all);
      }
      return result(att);
    },
    async getResult(sapId, attemptId) {
      await sleep(150);
      const att = load().find((a) => a.attemptId === attemptId && a.sapId === clean(sapId));
      if (!att || att.status === "in_progress") throw new Error("ATTEMPT_NOT_FOUND");
      return result(att);
    },
  };
}

export const api = DEMO ? demoApi() : await realApi();
