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

/* ---------------- shared Firebase SDK loader ----------------
   One memoised load, both SDK files downloaded in parallel (they used to load one after the other),
   shared by the quiz page and the admin page. */
const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
let fbP;
export function loadFirebase() {
  return (fbP ||= (async () => {
    const [{ initializeApp, getApps }, F] = await Promise.all([import(`${SDK}firebase-app.js`), import(`${SDK}firebase-firestore.js`)]);
    const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
    let db;
    /* auto-detect long-polling: avoids multi-second stalls on networks/proxies that buffer Firestore's streaming channel */
    try { db = F.initializeFirestore(app, { experimentalAutoDetectLongPolling: true }); } catch (e) { db = F.getFirestore(app); }
    return { app, F, db, initializeApp };
  })());
}

/* ---------------- REAL BACKEND (100% Free Spark Plan - Direct Firestore) ---------------- */
async function realApi() {
  const { F, db } = await loadFirebase();

  const durationMs = QUIZ.minutes * 60 * 1000;
  const graceMs = 15 * 1000;
  const DEPTS_LIST = ["mining", "mech", "elec"];
  const SNAP = "quizAttemptSnapshots"; /* one small doc per attempt: the questions exactly as assigned */
  const EMP_TTL = 60 * 1000;

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
  const toSnap = (q) => ({ q: q.q, options: q.options, correct: q.correct, multi: !!q.multi, explanation: q.explanation || {}, ref: q.ref || {} });
  const bankQuery = (bankKey) => F.query(F.collection(db, "questions"), F.where("bankKey", "==", bankKey), F.where("status", "==", "approved"));

  /* in-memory only (this page load), never persisted */
  const empCache = new Map(); /* sap -> {t, p}: employee check shared by verify + status (+ in-flight requests) */
  const snapCache = new Map(); /* attemptId -> assigned questions */
  const attCache = new Map(); /* attemptId -> attempt doc we created/loaded in this session */

  function getEmployee(sap, fresh) {
    const hit = empCache.get(sap);
    if (!fresh && hit && Date.now() - hit.t < EMP_TTL) return hit.p;
    const p = (async () => {
      const snap = await F.getDoc(F.doc(db, "employees", sap));
      if (!snap.exists()) throw new Error("SAP_NOT_FOUND");
      const e = snap.data();
      if (e.active === false || e.status === "Inactive") throw new Error("SAP_INACTIVE");
      return e;
    })();
    empCache.set(sap, { t: Date.now(), p });
    p.catch(() => { const c = empCache.get(sap); if (c && c.p === p) empCache.delete(sap); });
    return p;
  }

  async function fetchQuestions(ids) {
    if (!ids || !ids.length) return [];
    const snaps = await Promise.all(ids.map((id) => F.getDoc(F.doc(db, "questions", id))));
    return snaps.filter((s) => s.exists()).map((s) => ({ id: s.id, ...s.data() }));
  }

  /* The questions of an attempt exactly as assigned: memory -> embedded (older attempts) -> snapshot doc -> live questions (very old attempts) */
  async function getSnap(id, att) {
    if (snapCache.has(id)) return snapCache.get(id);
    let m = att && att.snapshot;
    if (!m) { const s = await F.getDoc(F.doc(db, SNAP, id)).catch(() => null); if (s && s.exists()) m = s.data().questions; }
    if (!m) { m = {}; (await fetchQuestions(att.questionIds)).forEach((q) => (m[q.id] = toSnap(q))); }
    snapCache.set(id, m);
    return m;
  }

  async function finalize(ref, att, answers, status) {
    const snap = await getSnap(ref.id, att);
    let attempted = 0, correct = 0;
    const saved = {};
    att.questionIds.forEach((id) => {
      const q = snap[id];
      const raw = (answers && answers[id]) || [];
      const yours = [...new Set(raw.map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n < 4))].sort();
      saved[id] = yours;
      if (yours.length) attempted++;
      if (q && sameSet(yours, [...q.correct].sort())) correct++;
    });
    const total = att.questionIds.length;
    const upd = { status, answers: saved, attempted, correct, total, incorrect: total - correct, score: Math.round((correct / total) * 100), passed: correct >= QUIZ.passMark, submittedAt: Date.now() };
    await F.updateDoc(ref, upd);
    const done = { ...att, ...upd };
    attCache.set(ref.id, done);
    return done;
  }

  async function buildResult(attemptId, att) {
    const snap = await getSnap(attemptId, att);
    return {
      attemptId, dept: att.dept, topic: att.topic, quizNo: att.quizNo, name: att.name,
      total: QUIZ.total, attempted: att.attempted, unattempted: QUIZ.total - att.attempted,
      correct: att.correct, incorrect: att.attempted - att.correct, passed: att.passed, passMark: QUIZ.passMark,
      review: att.questionIds.map((id) => {
        const q = snap[id] || { q: { en: "", hi: "" }, options: { en: [], hi: [] }, correct: [], explanation: {}, ref: {} };
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

  /* close attempts whose time ran out (in parallel, and only when there are any) */
  const sweep = (list) => Promise.all(list
    .filter((a) => a.status === "in_progress" && Date.now() - a.startedAt > durationMs + graceMs)
    .map(async (a) => { Object.assign(a, await finalize(a._ref, a, {}, "expired")); }));

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
      const bankKey = bankKeyOf(dept, topic);
      /* employee check, attempts and question count run in parallel; the count is one tiny aggregate request
         instead of downloading every question document just to count them */
      const [, list, cnt] = await Promise.all([getEmployee(sap), loadAttempts(sap, bankKey), F.getCountFromServer(bankQuery(bankKey))]);
      await sweep(list);
      const used = new Set(list.flatMap((a) => a.questionIds || []));
      const approved = cnt.data().count;
      let unused = approved - used.size; /* lower bound; exact count only needed near the limit */
      if (unused < QUIZ.total) {
        const ids = (await F.getDocs(bankQuery(bankKey))).docs.map((d) => d.id);
        unused = ids.filter((id) => !used.has(id)).length;
      }
      return { attempts: list.map(summary), approved, unused };
    }),

    startQuiz: wrapCall(async (p) => {
      const sap = cleanSap(p.sapId);
      const { dept, topic } = p;
      const bankKey = bankKeyOf(dept, topic);
      const quizNo = Number(p.quizNo);
      if (!Number.isInteger(quizNo) || quizNo < 1 || quizNo > quizzesFor(dept)) throw new Error("BANK_EMPTY");

      /* employee is re-checked fresh here (not from cache), in parallel with the attempts query */
      const [emp, list] = await Promise.all([getEmployee(sap, true), loadAttempts(sap, bankKey)]);
      await sweep(list);

      let att = list.find((a) => a.quizNo === quizNo && a.status === "in_progress");
      let attemptId = att && att._id;
      let snap;

      if (att) snap = await getSnap(attemptId, att);
      else {
        /* Reattempt: reuse the SAME questions (same order) assigned in the first attempt of this quiz */
        const first = list.filter((a) => a.quizNo === quizNo && a.questionIds && a.questionIds.length).sort((a, b) => (a.startedAt || 0) - (b.startedAt || 0))[0];
        let pick;
        if (first) {
          pick = [...first.questionIds];
          snap = await getSnap(first._id, first);
          if (pick.some((id) => !snap[id])) throw new Error("BANK_EMPTY");
        } else {
          const used = new Set(list.flatMap((a) => a.questionIds || []));
          const docs = (await F.getDocs(bankQuery(bankKey))).docs;
          if (!docs.length) throw new Error("BANK_EMPTY");
          const pool = docs.filter((d) => !used.has(d.id));
          if (pool.length < QUIZ.total) throw new Error("BANK_EXHAUSTED");
          const chosen = shuffle(pool).slice(0, QUIZ.total);
          pick = chosen.map((d) => d.id);
          snap = {};
          chosen.forEach((d) => (snap[d.id] = toSnap(d.data()))); /* questions already downloaded by the query: no extra reads */
        }
        const doc = {
          sapId: sap, name: emp.name, dept, topic, bankKey, quizNo,
          attemptNo: list.filter((a) => a.quizNo === quizNo).length + 1,
          questionIds: pick, status: "in_progress", startedAt: Date.now(), lang: p.lang === "en" ? "en" : "hi",
        };
        const attRef = F.doc(F.collection(db, "quizAttempts"));
        const b = F.writeBatch(db); /* attempt + its permanent question snapshot in ONE round-trip */
        b.set(attRef, doc);
        b.set(F.doc(db, SNAP, attRef.id), { sapId: sap, questions: snap, createdAt: Date.now() });
        await b.commit();
        att = { ...doc, _id: attRef.id };
        attemptId = attRef.id;
        snapCache.set(attemptId, snap);
      }
      if (att.questionIds.some((id) => !snap[id])) throw new Error("BANK_EMPTY");
      attCache.set(attemptId, att);

      return {
        attemptId, quizNo,
        remainingSec: Math.max(1, Math.round((att.startedAt + durationMs - Date.now()) / 1000)),
        questions: att.questionIds.map((id) => ({ id, q: snap[id].q, options: snap[id].options, multi: !!snap[id].multi })),
      };
    }),

    submitQuiz: wrapCall(async (p) => {
      const sap = cleanSap(p.sapId);
      const id = String(p.attemptId || "");
      if (!id) throw new Error("ATTEMPT_NOT_FOUND");
      const ref = F.doc(db, "quizAttempts", id);
      let att = attCache.get(id); /* attempt + questions are already in memory from startQuiz: submit is a single write */
      if (!att || att.sapId !== sap) {
        const snap = await F.getDoc(ref);
        if (!snap.exists() || snap.data().sapId !== sap) throw new Error("ATTEMPT_NOT_FOUND");
        att = { _id: id, ...snap.data() };
      }
      if (att.status === "in_progress") {
        const late = Date.now() - att.startedAt > durationMs + graceMs;
        try { att = await finalize(ref, att, late ? {} : p.answers, late ? "expired" : "submitted"); }
        catch (e) { attCache.delete(id); throw e; } /* next retry re-reads the real state from the server */
      }
      return buildResult(id, att);
    }),

    getResult: wrapCall(async (sapId, attemptId) => {
      const sap = cleanSap(sapId);
      const id = String(attemptId || "");
      if (!id) throw new Error("ATTEMPT_NOT_FOUND");
      const [s, ss] = await Promise.all([
        F.getDoc(F.doc(db, "quizAttempts", id)),
        snapCache.has(id) ? null : F.getDoc(F.doc(db, SNAP, id)).catch(() => null),
      ]);
      if (!s.exists() || s.data().sapId !== sap || s.data().status === "in_progress") throw new Error("ATTEMPT_NOT_FOUND");
      if (ss && ss.exists() && !snapCache.has(id)) snapCache.set(id, ss.data().questions);
      return buildResult(id, s.data());
    }),
  };
}

/* The SDK starts loading as soon as this file is imported; the page renders immediately and calls wait only if the SDK is still loading
   (previously a top-level await blocked the whole page until Firebase was ready). */
function lazyApi() {
  const ready = realApi();
  ready.catch(() => {});
  return Object.fromEntries(["verifyEmployee", "getStatus", "startQuiz", "submitQuiz", "getResult"].map((n) => [n, async (...a) => {
    let impl;
    try { impl = await ready; } catch (e) { console.error("[Quiz] Firebase failed to load:", e); throw new Error("NETWORK"); }
    return impl[n](...a);
  }]));
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

export const api = DEMO ? demoApi() : lazyApi();
