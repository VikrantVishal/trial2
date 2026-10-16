/* ===== Text-to-Speech reader for SOP sections (Web Speech API) =====
   Reads ONE selected section in the currently selected language (hi / en).
   Works by splitting text into short chunks, which is the most reliable way
   to avoid the speech-cut-off bugs of Chrome/Android. Pause = stop + resume
   from the same chunk (the native pause() is unreliable on mobile). */
(function () {
  const synth = window.speechSynthesis;
  const supported = !!synth && "SpeechSynthesisUtterance" in window;
  const LANGS = { hi: { tag: "hi-IN", pre: "hi" }, en: { tag: "en-IN", pre: "en" } };
  const T = {
    hi: { reading: "पढ़ रहा है", paused: "रुका हुआ", listen: "सुनें", stop: "रोकें", pause: "रोकें (Pause)", play: "फिर शुरू करें", speed: "गति", nov: "इस डिवाइस में हिंदी आवाज़ उपलब्ध नहीं है। Settings → Text-to-speech में हिंदी वॉइस इंस्टॉल करें।", fail: (c) => "आवाज़ पढ़ने में त्रुटि (" + c + ")। फ़ोन की Settings → Text-to-speech में Hindi वॉइस इंस्टॉल/अपडेट करें, या इंटरनेट जाँचें।", unsup: "इस ब्राउज़र में आवाज़ पढ़ने की सुविधा उपलब्ध नहीं है।" },
    en: { reading: "Reading", paused: "Paused", listen: "Listen", stop: "Stop", pause: "Pause", play: "Resume", speed: "Speed", nov: "No English voice found on this device. Install one in Settings → Text-to-speech.", fail: (c) => "Speech error (" + c + "). Install/update the voice in Settings → Text-to-speech, or check your internet.", unsup: "Text-to-speech is not supported in this browser." },
  };
  const curLang = () => (typeof lang !== "undefined" && LANGS[lang] ? lang : "hi");

  let voices = [];
  const loadVoices = () => { voices = synth.getVoices() || []; };
  if (supported) {
    loadVoices();
    if (synth.addEventListener) synth.addEventListener("voiceschanged", loadVoices);
    else synth.onvoiceschanged = loadVoices;
  }
  const norm = (v) => v.lang.replace("_", "-").toLowerCase();
  function pickVoice(l) {
    const { tag, pre } = LANGS[l];
    const best = (list) => list.find((v) => v.localService) || list[0]; // on-device voices first: network voices fail on poor signal
    const ex = voices.filter((v) => norm(v) === tag.toLowerCase());
    if (ex.length) return best(ex);
    if (l === "en") {
      for (const t of ["en-gb", "en-us"]) {
        const m = voices.filter((v) => norm(v) === t);
        if (m.length) return best(m);
      }
    }
    const any = voices.filter((v) => norm(v).startsWith(pre));
    return any.length ? best(any) : null;
  }

  /* ---- state ---- */
  let units = [];      // [{el, text}] in reading order
  let chunks = [];     // [{u: unitIndex, text}]
  let idx = 0, sec = -1, state = "idle", token = 0, keep = null, rate = 1;
  try { rate = parseFloat(sessionStorage.getItem("ttsRate")) || 1; } catch (e) {}
  let bar, msgTimer;

  /* ---- text extraction for one section ---- */
  const ownText = (li) => [...li.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(" ");
  function collect(i) {
    const h = document.getElementById("sec-" + i);
    if (!h) return [];
    const out = [];
    const ht = (h.querySelector(".h-txt") || h).textContent.replace(/^\s*\d+\.\s*/, "").trim();
    if (ht) out.push({ el: h, text: ht });
    for (let n = h.nextElementSibling; n && n.tagName !== "H3"; n = n.nextElementSibling) {
      if (n.tagName === "P") out.push({ el: n, text: n.textContent });
      else n.querySelectorAll("li").forEach((li) => out.push({ el: li, text: ownText(li) }));
    }
    return out.map((u) => ({ el: u.el, text: u.text.normalize("NFC").replace(/[\u200B\uFEFF]/g, "").replace(/[•▪●■◆►→]/g, ",").replace(/\s+/g, " ").trim() })).filter((u) => u.text);
  }
  function splitText(t, max = 180) {
    const parts = t.match(/[^।.!?;\n]+[।.!?;]*/g) || [t];
    const res = [];
    let cur = "";
    const push = (s) => { if (s.trim()) res.push(s.trim()); };
    parts.forEach((p) => {
      p = p.trim();
      if (!p) return;
      if (p.length > max) {            // very long sentence: split on commas / words
        push(cur); cur = "";
        let buf = "";
        p.split(/\s+/).forEach((w) => {
          if ((buf + " " + w).length > max) { push(buf); buf = w; } else buf = buf ? buf + " " + w : w;
        });
        push(buf);
      } else if ((cur + " " + p).length > max) { push(cur); cur = p; }
      else cur = cur ? cur + " " + p : p;
    });
    push(cur);
    return res;
  }

  /* ---- UI ---- */
  function ensureBar() {
    if (bar) return bar;
    bar = document.createElement("div");
    bar.id = "ttsBar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Text to speech");
    bar.innerHTML =
      '<div class="tts-info"><span class="tts-state"></span><span class="tts-name"></span></div>' +
      '<div class="tts-ctl"><select class="tts-rate" aria-label="Speed">' +
      [0.75, 1, 1.25, 1.5].map((r) => `<option value="${r}">${r}x</option>`).join("") +
      '</select><button type="button" class="tts-pp" data-act="pp"></button>' +
      '<button type="button" class="tts-x" data-act="stop">⏹</button></div>';
    document.body.appendChild(bar);
    const sel = bar.querySelector(".tts-rate");
    sel.value = String(rate);
    sel.addEventListener("change", () => {
      rate = parseFloat(sel.value) || 1;
      try { sessionStorage.setItem("ttsRate", rate); } catch (e) {}
      if (state === "playing") speakFrom(idx);   // apply new speed immediately
    });
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.act === "stop") stop();
      else if (b.dataset.act === "pp") state === "playing" ? pause() : resume();
    });
    return bar;
  }
  function render() {
    const l = curLang(), tr = T[l];
    document.querySelectorAll(".tts-btn").forEach((b) => {
      const on = state !== "idle" && +b.dataset.sec === sec;
      b.classList.toggle("on", on);
      b.textContent = on ? "⏹" : "🔊";
      b.setAttribute("aria-label", (on ? tr.stop : tr.listen) + (on ? "" : " – " + b.dataset.title));
      b.title = on ? tr.stop : tr.listen;
    });
    document.body.classList.toggle("tts-on", state !== "idle");
    if (state === "idle") { if (bar) bar.classList.remove("show"); return; }
    ensureBar().classList.add("show");
    bar.querySelector(".tts-state").textContent = (state === "paused" ? tr.paused : tr.reading) + ": ";
    const h = document.getElementById("sec-" + sec);
    bar.querySelector(".tts-name").textContent = h ? (h.querySelector(".h-txt") || h).textContent : "";
    const pp = bar.querySelector(".tts-pp");
    pp.textContent = state === "playing" ? "⏸" : "▶";
    pp.title = state === "playing" ? tr.pause : tr.play;
    pp.setAttribute("aria-label", pp.title);
    bar.querySelector(".tts-x").title = tr.stop;
    bar.querySelector(".tts-x").setAttribute("aria-label", tr.stop);
    bar.querySelector(".tts-rate").title = tr.speed;
  }
  function mark(u) {
    document.querySelectorAll(".tts-now").forEach((e) => e.classList.remove("tts-now"));
    if (u != null && units[u]) {
      const el = units[u].el;
      el.classList.add("tts-now");
      const r = el.getBoundingClientRect();
      const top = (document.querySelector(".sop-sticky-header") || { getBoundingClientRect: () => ({ bottom: 0 }) }).getBoundingClientRect().bottom;
      if (r.top < top + 4 || r.bottom > window.innerHeight - 80) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }
  function toast(msg) {
    let t = document.getElementById("ttsToast");
    if (!t) { t = document.createElement("div"); t.id = "ttsToast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => t.classList.remove("show"), 5000);
  }

  /* ---- speech engine ---- */
  let fails = 0;
  function speakFrom(i) {
    token++;
    const my = token;
    idx = i;
    fails = 0;
    state = "playing";
    render();
    const voice = pickVoice(curLang());
    const run = () => nextChunk(my, voice);
    /* cancel() immediately followed by speak() is silently dropped on some Android builds, so wait briefly */
    if (synth.speaking || synth.pending) { synth.cancel(); setTimeout(run, 80); } else run();
  }
  function nextChunk(my, voice) {
    if (my !== token) return;
    if (idx >= chunks.length) { stop(); return; }
    const c = chunks[idx];
    mark(c.u);
    say(c, voice, 0, my);
  }
  function say(c, voice, attempt, my) {
    const l = curLang();
    const u = new SpeechSynthesisUtterance(c.text);
    u.lang = voice ? voice.lang.replace("_", "-") : LANGS[l].tag;
    if (voice && attempt === 0) u.voice = voice;   // retry (attempt 1) uses the language only, letting the browser choose
    u.rate = rate;
    u.onend = () => { if (my === token) { fails = 0; idx++; nextChunk(my, voice); } };
    u.onerror = (e) => {
      if (my !== token || e.error === "canceled" || e.error === "interrupted") return;
      if (attempt === 0) { say(c, voice, 1, my); return; }          // 1st failure: retry without explicit voice
      if (++fails >= 3) { stop(); toast(T[l].fail(e.error || "unknown")); return; }
      idx++; nextChunk(my, voice);                                    // otherwise skip this chunk
    };
    keep = u;                     // keep a reference (prevents early garbage collection)
    synth.speak(u);
  }
  function start(i) {
    if (!supported) { toast(T[curLang()].unsup); return; }
    stop(true);
    units = collect(i);
    chunks = [];
    units.forEach((u, k) => splitText(u.text).forEach((t) => chunks.push({ u: k, text: t })));
    if (!chunks.length) return;
    sec = i;
    loadVoices();
    if (voices.length && !pickVoice(curLang())) toast(T[curLang()].nov);
    speakFrom(0);
  }
  function pause() { if (state !== "playing") return; token++; synth.cancel(); state = "paused"; render(); }
  function resume() { if (state === "paused") speakFrom(idx); }
  function stop(silent) {
    token++;
    if (supported) synth.cancel();
    state = "idle"; sec = -1; units = []; chunks = []; idx = 0;
    mark(null);
    if (!silent) render();
  }

  /* ---- events ---- */
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".tts-btn");
    if (!b) return;
    const i = +b.dataset.sec;
    if (state !== "idle" && sec === i) stop(); else start(i);
  });
  window.addEventListener("pagehide", () => { if (supported) synth.cancel(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && state === "playing") pause(); });

  window.TTS = { supported, stop, render, start };
})();
