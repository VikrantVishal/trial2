/* ===== Shared by every page: header, footer, sidebar menu and small helpers ===== */

/* SIDEBAR MENU: add options here, e.g. { label: "About / परिचय", href: "about.html" } */
const MENU = [{ label: "SOP Section / एसओपी अनुभाग", href: "index.html" },{ label: "QUIZ Section/ क्विज़ अनुभाग", href: "quiz.html" }];

const esc = (s) =>
  String(s).replace(
    /[&<>]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
  );

/* Home / Back buttons. back = optional link to the previous page */
function navBar(back) {
  return `<div class="nav">
    <a class="btn-home" href="index.html">🏠 Home / होम</a>
    ${back ? `<a class="btn-back" href="${back}">← Back / वापस</a>` : ""}
  </div>`;
}

function tile(href, en, hi) {
  return `<a class="tile" href="${href}">${en}<small>${hi}</small></a>`;
}

/* Department page (Mining, Mechanical, Electrical): lists its equipment */
function renderDepartment(key) {
  const d = DEPTS[key];
  document.title = `${d.en} – Digital SOP Library`;
  const body = d.equipment.length
    ? `${d.title ? `<div class="dept-title">${d.title}</div>` : ""}<h2>${d.heading || "Select Equipment/Activity  /  उपकरण/कार्य चुनें"}</h2>
       <div class="grid ${d.gridClass || ""}">${d.equipment
         .map((e) => tile(`sop.html?dept=${key}&eq=${e.id}`, e.en, e.hi))
         .join("")}</div>`
    : `<h2>${d.en} / ${d.hi}</h2><div class="note">SOPs for this department will be added soon.<br>इस विभाग के SOP शीघ्र जोड़े जाएंगे।</div>`;
  document.body.classList.toggle(
    "freeze-page",
    !!d.freezeHead && d.equipment.length > 0,
  );
  document.getElementById("app").innerHTML = navBar() + body;
}

/* ----- Header, footer and sidebar (edit once, applies to all pages) ----- */
document.body.insertAdjacentHTML(
  "afterbegin",
  `<header>
      <div class="logo"><img src="assets/nmdc-logo.png" alt="NMDC" /></div>
      <div class="ht">
        <span class="org">BIOM KIRANDUL COMPLEX</span
        ><span class="ttl"
          >DIGITAL SOP LIBRARY<span class="hi">डिजिटल SOP लाइब्रेरी</span></span
        >
      </div>
      <button class="menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>
      </button>
    </header>
    <div class="line"></div>`,
);
document.body.insertAdjacentHTML(
  "beforeend",
  `<footer>NMDC Limited • BIOM Kirandul Complex • Internal Use Only</footer>
    <div class="sb-overlay" id="sbOverlay"></div>
    <aside class="sidebar" id="sidebar" aria-hidden="true" aria-label="Menu">
      <div class="sb-head">
        <span>Menu / मेन्यू</span>
        <button class="sb-close" id="sbClose" type="button" aria-label="Close menu">&#10005;</button>
      </div>
      <nav class="sb-body" id="sbBody"></nav>
      <div class="sb-foot">Designed by Vikrant Vishal</div>
    </aside>`,
);

const sb = document.getElementById("sidebar"),
  sbOv = document.getElementById("sbOverlay"),
  sbBtn = document.getElementById("menuBtn");

document.getElementById("sbBody").innerHTML = MENU.length
  ? MENU.map((m) => `<a class="sb-item" href="${m.href}">${m.label}</a>`).join("")
  : '<p class="sb-empty">Menu options will be added here.<br>मेन्यू विकल्प यहाँ जोड़े जाएंगे।</p>';

/* Single Admin Login button pinned at the bottom */
document
  .getElementById("sbBody")
  .insertAdjacentHTML(
    "beforeend",
    '<a class="sb-item sb-bottom" href="quiz-admin.html">🔐 Admin Login</a>',
  );

function openMenu() {
  sb.classList.add("open");
  sbOv.classList.add("open");
  sb.setAttribute("aria-hidden", "false");
  sbBtn.setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
}
function closeMenu() {
  sb.classList.remove("open");
  sbOv.classList.remove("open");
  sb.setAttribute("aria-hidden", "true");
  sbBtn.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}
sbBtn.addEventListener("click", openMenu);
sbOv.addEventListener("click", closeMenu);
document.getElementById("sbClose").addEventListener("click", closeMenu);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});

