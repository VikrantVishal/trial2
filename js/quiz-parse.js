/* Safe parser for the quiz-sample.js format (JS object/array literals). Never executes uploaded code:
   it tokenizes literals only (objects, arrays, strings, numbers, true/false/null, comments, trailing commas). */
export function parseJS(src) {
  const s = String(src); let i = 0;
  const ws = () => { for (;;) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (s.startsWith("//", i)) { while (i < s.length && s[i] !== "\n") i++; }
    else if (s.startsWith("/*", i)) { const e = s.indexOf("*/", i + 2); if (e < 0) throw Error("Unclosed comment"); i = e + 2; }
    else return;
  } };
  const str = () => { const q = s[i++]; let o = "";
    while (i < s.length && s[i] !== q) {
      if (s[i] === "\\") { const c = s[++i]; if (c === "u") { o += String.fromCharCode(parseInt(s.slice(i + 1, i + 5), 16)); i += 4; } else o += ({ n: "\n", t: "\t", r: "\r" })[c] ?? c; i++; }
      else { if (q === "`" && s[i] === "$" && s[i + 1] === "{") throw Error("Template expressions are not supported"); o += s[i++]; }
    }
    if (s[i] !== q) throw Error("Unclosed string"); i++; return o; };
  const val = () => { ws(); const c = s[i];
    if (c === "[") { i++; const a = []; for (;;) { ws(); if (s[i] === "]") { i++; return a; } a.push(val()); ws(); if (s[i] === ",") i++; else if (s[i] !== "]") throw Error("Expected , or ] at " + i); } }
    if (c === "{") { i++; const o = {}; for (;;) { ws(); if (s[i] === "}") { i++; return o; }
      let k; if (/["'`]/.test(s[i])) k = str(); else { const m = /^[A-Za-z_$][\w$]*/.exec(s.slice(i, i + 80)); if (!m) throw Error("Bad key at " + i); k = m[0]; i += k.length; }
      ws(); if (s[i] !== ":") throw Error("Expected : at " + i); i++;
      if (k === "__proto__") throw Error("Forbidden key"); o[k] = val(); ws(); if (s[i] === ",") i++; else if (s[i] !== "}") throw Error("Expected , or } at " + i); } }
    if (/["'`]/.test(c)) return str();
    const m = /^(-?\d+(\.\d+)?|true|false|null)/.exec(s.slice(i, i + 40)); if (!m) throw Error("Unsupported value at position " + i); i += m[0].length; return JSON.parse(m[0]); };
  ws(); const eq = s.indexOf("="); const st = s.indexOf("[");
  if (st < 0) throw Error("No question array found");
  i = st; const out = val(); if (!Array.isArray(out)) throw Error("Expected an array of questions"); return out;
}
/* Validate one parsed question against the portal format. Returns list of problems. */
export function checkQ(q, DEPTS) {
  const p = [], t = (o) => o && typeof o.en === "string" && o.en.trim() && typeof o.hi === "string" && o.hi.trim();
  if (!q || typeof q !== "object") return ["Not an object"];
  if (!t(q.q)) p.push("Question needs English + Hindi");
  const o = q.options || {};
  ["en", "hi"].forEach((l) => { if (!Array.isArray(o[l]) || o[l].length !== 4 || o[l].some((x) => !String(x).trim())) p.push(`Options (${l}) must be 4 non-empty items`); });
  if (!Array.isArray(q.correct) || !q.correct.length || q.correct.some((n) => !Number.isInteger(n) || n < 0 || n > 3)) p.push("correct must be indexes 0-3");
  if (q.multi !== undefined && Array.isArray(q.correct) && !!q.multi !== q.correct.length > 1) p.push("multi flag does not match correct[]");
  if (!t(q.explanation)) p.push("Explanation needs English + Hindi");
  if (q.dept && !DEPTS[q.dept]) p.push("Unknown dept: " + q.dept);
  else if (q.dept && q.topic && !DEPTS[q.dept].equipment.some((e) => e.id === q.topic)) p.push("Unknown topic: " + q.topic);
  return p;
}
