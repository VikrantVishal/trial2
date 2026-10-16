import { FIREBASE_CONFIG, DEMO } from "./quiz-firebase.js";
import { parseJS, checkQ } from "./quiz-parse.js";
const root = document.getElementById("root");
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const $ = (id) => document.getElementById(id),
  LET = ["A", "B", "C", "D"],
  PER = 40;
const toast = (m, bad) => {
  const d = document.createElement("div");
  d.className = bad ? "qz-err" : "qz-info";
  d.style.cssText =
    "position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2000;max-width:90vw";
  d.textContent = m;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 3500);
};
const showDialog = ({ title, message, value = "", input = false, confirmLabel = "Continue" }) =>
  new Promise((resolve) => {
    const ov = document.createElement("div");
    ov.className = "qz-ov";
    ov.setAttribute("role", "presentation");
    ov.innerHTML = `<section class="qz-modal" role="dialog" aria-modal="true" aria-labelledby="qz-dialog-title">
      <h3 id="qz-dialog-title">${esc(title)}</h3>
      ${message ? `<p>${esc(message)}</p>` : ""}
      ${input ? `<textarea id="qz-dialog-input" style="width:100%;min-height:180px">${esc(value)}</textarea>` : ""}
      <div class="qz-row" style="margin-top:14px"><button class="qz-btn ghost" id="qz-dialog-cancel">Cancel</button><button class="qz-btn ok" id="qz-dialog-confirm">${esc(confirmLabel)}</button></div>
    </section>`;
    document.body.appendChild(ov);
    const finish = (result) => {
      document.removeEventListener("keydown", onKeydown);
      ov.remove();
      resolve(result);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") finish(null);
      if (event.key === "Enter" && !event.shiftKey && !input) finish(true);
    };
    document.addEventListener("keydown", onKeydown);
    ov.querySelector("#qz-dialog-cancel").onclick = () => finish(null);
    ov.querySelector("#qz-dialog-confirm").onclick = () =>
      finish(input ? ov.querySelector("#qz-dialog-input").value : true);
    ov.addEventListener("click", (event) => {
      if (event.target === ov) finish(null);
    });
    (input ? ov.querySelector("#qz-dialog-input") : ov.querySelector("#qz-dialog-confirm")).focus();
  });
const askConfirm = (message) => showDialog({ title: "Please confirm", message });
const askText = (title, value) => showDialog({ title, value, input: true, confirmLabel: "Save" });
const pager = (n, pg) => {
  const t = Math.max(1, Math.ceil(n / PER));
  return `<div class="qz-row" style="margin:8px 0;align-items:center"><button class="qz-btn ghost sm" data-pg="-1" ${pg <= 0 ? "disabled" : ""}>‹</button><span class="qz-muted" style="text-align:center">Page ${pg + 1} / ${t} (${n})</span><button class="qz-btn ghost sm" data-pg="1" ${pg + 1 >= t ? "disabled" : ""}>›</button></div>`;
};
if (DEMO)
  root.innerHTML = `<h2>Quiz Admin</h2><div class="qz-info">Paste your Firebase config into <b>js/quiz-firebase.js</b> first.</div>`;
else start();

async function start() {
  const V = "10.12.2";
  const { initializeApp, getApps } = await import(
    `https://www.gstatic.com/firebasejs/${V}/firebase-app.js`
  );
  const A = await import(
    `https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`
  );
  const F = await import(
    `https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`
  );
  const app = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG);
  const auth = A.getAuth(app),
    db = F.getFirestore(app),
    col = (n) => F.collection(db, n),
    dref = (c, i) => F.doc(db, c, i);
  A.setPersistence(auth, A.browserSessionPersistence).catch(() => {});
  const depts = Object.keys(DEPTS),
    bankKey = (d, t) => `${d}__${t}`,
    dateStr = (ms) => (ms ? new Date(ms).toLocaleString("en-IN") : "");
  const deptOpts = (c) =>
    depts
      .map(
        (d) =>
          `<option value="${d}" ${d === c ? "selected" : ""}>${DEPTS[d].en}</option>`,
      )
      .join("");
  const topicOpts = (d, c) =>
    DEPTS[d].equipment
      .map(
        (e) =>
          `<option value="${e.id}" ${e.id === c ? "selected" : ""}>${esc(e.en)}</option>`,
      )
      .join("");
  const topicName = (d, t) =>
    (DEPTS[d]?.equipment.find((e) => e.id === t) || { en: t }).en;
  const SYN = (u) => `${u}@quizadmin.sop.local`;
  let tab = "pw",
    me = null,
    boot = false;

  /* ---------- auth: username -> adminLogins/{username}.email -> Firebase Auth (no passwords stored by us) ---------- */
  A.onAuthStateChanged(auth, async (u) => {
    if (boot) return;
    if (!u) return loginView();
    const s = await F.getDoc(dref("quizAdmins", u.uid)).catch(() => null);
    if (!s || !s.exists())
      return loginView(
        `Signed in as ${u.email}, but this account is not a quiz admin.`,
      );
    me = { uid: u.uid, email: u.email, ...s.data() };
    if (me.mustChange) tab = "pw";
    shell();
  });
  function loginView(msg) {
    root.innerHTML = `<h2>Admin Login</h2><div class="qz-card" style="max-width:420px;margin:auto">
      <label class="f">Username</label>
      <input id="lU" type="text" autocomplete="off" autocapitalize="none" />
      <label class="f">Password</label>
      <input id="lP" type="password" autocomplete="off" />
      ${msg ? `<div class="qz-err">${esc(msg)}</div>` : ""}<div id="lErr"></div>
      <button class="qz-btn block" id="lGo" style="margin-top:14px">Login</button>
      ${msg ? `<button class="qz-btn ghost block" id="lOut" style="margin-top:8px">Sign out</button>` : ""}
    </div>`;

    const go = async () => {
      $("lGo").disabled = true;
      try {
        await login($("lU").value.trim().toLowerCase(), $("lP").value);
      } catch (e) {
        $("lErr").innerHTML =
          `<div class="qz-err">${e.message === "bad" ? "Invalid username or password." : "Login failed: " + esc(e.code || e.message)}</div>`;
      }
      if ($("lP")) {
        $("lP").value = "";
        $("lP").focus();
      }
      if ($("lGo")) $("lGo").disabled = false;
    };

    $("lGo").onclick = go;
    if ($("lOut")) $("lOut").onclick = () => A.signOut(auth);

    // Prevent js/app.js global keydown/keypress listeners from blocking typing or Backspace
    [$("lU"), $("lP")].forEach((inp) => {
      ["keydown", "keypress", "keyup", "input"].forEach((ev) => {
        inp.addEventListener(ev, (e) => {
          e.stopPropagation();
          if (ev === "keydown" && e.key === "Enter" && inp.id === "lP") go();
        });
      });
    });
  }

  async function login(u, p) {
    if (!u || !p) throw Error("bad");
    let email = u.includes("@")
      ? u
      : null; /* full e-mail kept so admins created by the old panel still work */
    if (!email) {
      const s = await F.getDoc(dref("adminLogins", u)).catch(() => null);
      email = s && s.exists() ? s.data().email : null;
    }
    if (!email) {
      if (u === "vikrant" && p === "140795") return bootstrap();
      throw Error("bad");
    }
    try {
      await A.signInWithEmailAndPassword(auth, email, p);
    } catch (e) {
      if (/invalid|wrong|user-not-found/.test(e.code)) throw Error("bad");
      throw e;
    }
  }
  async function bootstrap() {
    /* first-time setup only: allowed by rules while quizMeta/bootstrap does not exist */
    const meta = await F.getDoc(dref("quizMeta", "bootstrap")).catch(
      () => null,
    );
    if (meta && meta.exists()) throw Error("bad");
    boot = true;
    try {
      let c;
      try {
        c = await A.createUserWithEmailAndPassword(
          auth,
          SYN("vikrant"),
          "140795",
        );
      } catch (e) {
        if (e.code !== "auth/email-already-in-use") throw e;
        c = await A.signInWithEmailAndPassword(auth, SYN("vikrant"), "140795");
      }
      const b = F.writeBatch(db),
        now = Date.now();
      b.set(dref("quizMeta", "bootstrap"), { by: c.user.uid, at: now });
      b.set(dref("quizAdmins", c.user.uid), {
        username: "vikrant",
        email: SYN("vikrant"),
        mustChange: true,
        createdAt: now,
      });
      b.set(dref("adminLogins", "vikrant"), {
        email: SYN("vikrant"),
        uid: c.user.uid,
      });
      await b.commit();
      me = {
        uid: c.user.uid,
        email: SYN("vikrant"),
        username: "vikrant",
        mustChange: true,
      };
      tab = "pw";
    } finally {
      boot = false;
    }
    shell();
  }
  function shell() {
    const tabs = [
      ["emp", "Manage Employees"],
      ["ques", "Manage Questions"],
      ["eng", "Quiz Engagement"],
      ["pw", "Manage Passwords"],
    ];
    root.innerHTML = `<div class="qz-who"><h2 style="margin:0">Quiz Admin</h2><span class="qz-muted">${esc((me.username || me.email).toUpperCase())} <button class="qz-btn ghost sm" id="so">Sign out</button></span></div>
      <div class="tabs">${tabs.map(([k, l]) => `<button class="qz-btn sm ${tab === k ? "on" : "ghost"}" data-t="${k}">${l}</button>`).join("")}</div><div id="pane"></div>`;
    $("so").onclick = () => A.signOut(auth);
    root.querySelectorAll("[data-t]").forEach(
      (b) =>
        (b.onclick = () => {
          tab = b.dataset.t;
          shell();
        }),
    );
    ({
      pw: () => {
        password();
        admins();
      },
      emp: employees,
      ques: questions,
      eng: engagement,
    })[tab]();
  }
  const pane = () => $("pane");

  /* ---------- 1. password management ---------- */
  function password() {
    pane().innerHTML = `${me.mustChange ? `<div class="qz-info">You are using the initial credentials. Please set a new password now.</div>` : ""}<div class="qz-card pw-card">
      <div class="pw-row"><label class="f">Current username</label><input type="text" value="${esc((me.username || me.email).toUpperCase())}" readonly /></div>
      <div class="pw-row"><label class="f">Current password (required for any change)</label><input id="pC" type="password" autocomplete="current-password" /></div>
      <div class="pw-row"><label class="f">New username (leave blank to keep)</label><input id="pU" type="text" autocapitalize="characters" /></div>
      <div class="pw-row"><label class="f">New password (min 6, leave blank to keep)</label><input id="pN" type="password" autocomplete="new-password" /></div>
      <div class="pw-row"><label class="f">Confirm new password</label><input id="pN2" type="password" autocomplete="new-password" /></div>
      <button class="qz-btn block" id="pGo" style="margin-top:14px">Save changes</button></div>`;
    $("pGo").onclick = async () => {
      const cur = $("pC").value,
        nu = $("pU").value.trim().toLowerCase(),
        np = $("pN").value;
      if (!cur) return toast("Enter your current password.", 1);
      if (np && np.length < 6)
        return toast("New password must be at least 6 characters.", 1);
      if (np !== $("pN2").value) return toast("New passwords do not match.", 1);
      if (!nu && !np) return toast("Nothing to change.", 1);
      if (nu && !/^[a-z0-9._-]{3,30}$/.test(nu))
        return toast("Username: 3-30 letters/numbers . _ -", 1);
      try {
        await A.reauthenticateWithCredential(
          auth.currentUser,
          A.EmailAuthProvider.credential(auth.currentUser.email, cur),
        );
        if (np) await A.updatePassword(auth.currentUser, np);
        const upd = { mustChange: false, updatedAt: Date.now() };
        if (nu && nu !== me.username) {
          if ((await F.getDoc(dref("adminLogins", nu))).exists())
            return toast("That username is already taken.", 1);
          const b = F.writeBatch(db);
          b.set(dref("adminLogins", nu), {
            email: auth.currentUser.email,
            uid: me.uid,
          });
          if (me.username) b.delete(dref("adminLogins", me.username));
          b.update(dref("quizAdmins", me.uid), { ...upd, username: nu });
          await b.commit();
          me.username = nu;
        } else await F.updateDoc(dref("quizAdmins", me.uid), upd);
        me.mustChange = false;
        toast("Saved. Use the new credentials next time.");
        shell();
      } catch (e) {
        toast(
          /wrong|invalid/.test(e.code || "")
            ? "Current password is incorrect."
            : "Failed: " + (e.code || e.message),
          1,
        );
      }
    };
  }

  /* ---------- multiple administrators: any admin can add/remove others ---------- */
  async function admins() {
    const box = document.createElement("div");
    pane().appendChild(box);
    box.innerHTML = `<p class="qz-muted">Loading administrators…</p>`;
    const snap = await F.getDocs(col("quizAdmins")).catch(() => null),
      list = snap ? snap.docs.map((d) => ({ uid: d.id, ...d.data() })) : [];
    box.innerHTML = `<h3>Administrators</h3><div class="scroll"><table class="tbl"><tr><th>Username</th><th>Created</th><th></th></tr>${list.map((a) => `<tr><td>${esc((a.username || a.email || "").toUpperCase())}${a.uid === me.uid ? " (you)" : ""}</td><td>${dateStr(a.createdAt)}</td><td>${a.uid === me.uid ? "" : `<button class="qz-btn ghost sm" data-rm="${a.uid}">Remove</button>`}</td></tr>`).join("")}</table></div>
      <div class="qz-card pw-card" style="margin-top:10px"><b>Add administrator</b><div class="pw-row"><label class="f">Username</label><input id="aU" type="text" autocapitalize="characters" autocomplete="off"></div><div class="pw-row"><label class="f">Password (min 6)</label><input id="aP" type="password" autocomplete="new-password"></div><div class="pw-row"><label class="f">Confirm password</label><input id="aP2" type="password" autocomplete="new-password"></div>
      <button class="qz-btn block" id="aGo" style="margin-top:12px">Add administrator</button></div>`;
    box.querySelectorAll("[data-rm]").forEach(
      (b) =>
        (b.onclick = async () => {
          const a = list.find((x) => x.uid === b.dataset.rm);
          if (
            !(await askConfirm(
              `Remove administrator ${(a.username || a.email).toUpperCase()}? They will lose access immediately.`,
            ))
          )
            return;
          try {
            const w = F.writeBatch(db);
            w.delete(dref("quizAdmins", a.uid));
            if (a.username) w.delete(dref("adminLogins", a.username));
            await w.commit();
            toast("Administrator removed.");
            shell();
          } catch (e) {
            toast("Failed: " + e.code, 1);
          }
        }),
    );
    $("aGo").onclick = async () => {
      const u = $("aU").value.trim().toLowerCase(),
        p = $("aP").value;
      if (!/^[a-z0-9._-]{3,30}$/.test(u))
        return toast("Username: 3-30 letters/numbers . _ -", 1);
      if (p.length < 6)
        return toast("Password must be at least 6 characters.", 1);
      if (p !== $("aP2").value) return toast("Passwords do not match.", 1);
      $("aGo").disabled = true;
      try {
        if ((await F.getDoc(dref("adminLogins", u))).exists())
          throw Error("That username is already taken.");
        const email = `${u}.${Date.now().toString(36)}@quizadmin.sop.local`,
          sec = initializeApp(FIREBASE_CONFIG, "sec" + Date.now()),
          sa =
            A.getAuth(
              sec,
            ); /* separate app so the current admin stays signed in */
        const c = await A.createUserWithEmailAndPassword(sa, email, p);
        await A.signOut(sa);
        const w = F.writeBatch(db),
          now = Date.now();
        w.set(dref("quizAdmins", c.user.uid), {
          username: u,
          email,
          mustChange: true,
          createdAt: now,
          createdBy: me.uid,
        });
        w.set(dref("adminLogins", u), { email, uid: c.user.uid });
        await w.commit();
        toast(`Administrator ${u.toUpperCase()} added.`);
        shell();
      } catch (e) {
        toast(
          e.message.startsWith("That")
            ? e.message
            : "Failed: " + (e.code || e.message),
          1,
        );
        $("aGo").disabled = false;
      }
    };
  }

  /* ---------- 2. employee management ---------- */
  const normStatus = (v) => {
    const s = String(v ?? "")
      .trim()
      .toUpperCase();
    return ["ACTIVE", "A", "YES", "Y", "1"].includes(s)
      ? "Active"
      : ["INACTIVE", "I", "NO", "N", "0"].includes(s)
        ? "Inactive"
        : "";
  };
  const cleanId = (v) =>
    String(v ?? "")
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 12);
  async function employees() {
    pane().innerHTML = `<div class="qz-card"><b>Add / update employee</b><div class="f2"><div><label class="f">Employee ID</label><input id="eS" type="text" maxlength="12" /></div><div><label class="f">Name</label><input id="eN" type="text" /></div></div>
      <label class="f">Status</label><select id="eT"><option>Active</option><option>Inactive</option></select><div class="qz-row" style="margin-top:10px"><button class="qz-btn" id="eSave">Save</button><button class="qz-btn ghost" id="eClr">Clear</button></div>
      <hr><b>Import from Excel</b> <span class="qz-muted">columns: Employee ID, Employee Name, Status. Existing IDs are updated, never duplicated.</span><input type="file" id="eFile" accept=".xlsx,.xls,.csv" style="display:block;margin:6px 0"><div id="eMsg"></div></div>
      <div id="eKpi" class="kpi" style="margin-bottom:8px"></div><div class="f2" style="margin-bottom:8px"><input id="eQ" type="text" placeholder="Search ID or name" /><select id="eF"><option value="">All statuses</option><option>Active</option><option>Inactive</option></select></div><div class="scroll" id="eList">Loading…</div><div id="ePg"></div>`;
    const snap = await F.getDocs(F.query(col("employees"), F.limit(5000)));
    const rows = snap.docs
      .map((d) => {
        const x = d.data();
        return {
          id: d.id,
          name: x.name || "",
          status: x.status || (x.active === false ? "Inactive" : "Active"),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    let pg = 0;
    const get = () => {
      const q = $("eQ").value.trim().toLowerCase(),
        f = $("eF").value;
      return rows.filter(
        (x) =>
          (!q ||
            x.id.toLowerCase().includes(q) ||
            x.name.toLowerCase().includes(q)) &&
          (!f || x.status === f),
      );
    };
    const draw = () => {
      const r = get(),
        na = rows.filter((x) => x.status === "Active").length;
      pg = Math.min(pg, Math.max(0, Math.ceil(r.length / PER) - 1));
      $("eKpi").innerHTML =
        `<div><span>Total</span><b>${rows.length}</b></div><div><span>Active</span><b>${na}</b></div><div><span>Inactive</span><b>${rows.length - na}</b></div>`;
      $("eList").innerHTML =
        `<table class="tbl"><tr><th>ID</th><th>Name</th><th>Status</th><th></th></tr>${r
          .slice(pg * PER, pg * PER + PER)
          .map(
            (x) =>
              `<tr><td>${esc(x.id)}</td><td>${esc(x.name)}</td><td>${x.status}</td><td><button class="qz-btn ghost sm" data-ed="${esc(x.id)}">Edit</button> <button class="qz-btn ghost sm" data-tg="${esc(x.id)}">${x.status === "Active" ? "Deactivate" : "Activate"}</button></td></tr>`,
          )
          .join("")}</table>`;
      $("ePg").innerHTML = pager(r.length, pg);
      $("ePg")
        .querySelectorAll("[data-pg]")
        .forEach(
          (b) =>
            (b.onclick = () => {
              pg += +b.dataset.pg;
              draw();
            }),
        );
      $("eList")
        .querySelectorAll("[data-ed]")
        .forEach(
          (b) =>
            (b.onclick = () => {
              const x = rows.find((y) => y.id === b.dataset.ed);
              $("eS").value = x.id;
              $("eN").value = x.name;
              $("eT").value = x.status;
              window.scrollTo(0, 0);
            }),
        );
      $("eList")
        .querySelectorAll("[data-tg]")
        .forEach(
          (b) =>
            (b.onclick = async () => {
              const x = rows.find((y) => y.id === b.dataset.tg),
                s = x.status === "Active" ? "Inactive" : "Active";
              if (
                !(await askConfirm(
                  `${s === "Inactive" ? "Deactivate" : "Activate"} ${x.name}?`,
                ))
              )
                return;
              await F.setDoc(
                dref("employees", x.id),
                { status: s, active: s === "Active", updatedAt: Date.now() },
                { merge: true },
              );
              x.status = s;
              draw();
              toast("Updated.");
            }),
        );
    };
    draw();
    $("eQ").oninput = $("eF").onchange = () => {
      pg = 0;
      draw();
    };
    $("eClr").onclick = () => {
      $("eS").value = $("eN").value = "";
    };
    const put = (id, name, status, b) =>
      (b || F).set(
        dref("employees", id),
        {
          sapId: id,
          name,
          status,
          active: status === "Active",
          updatedAt: Date.now(),
        },
        { merge: true },
      );
    $("eSave").onclick = async () => {
      const id = cleanId($("eS").value),
        name = $("eN").value.trim();
      if (!id || !name) return toast("Enter employee ID and name.", 1);
      try {
        await F.setDoc(
          dref("employees", id),
          {
            sapId: id,
            name,
            status: $("eT").value,
            active: $("eT").value === "Active",
            updatedAt: Date.now(),
          },
          { merge: true },
        );
        toast("Saved.");
        employees();
      } catch (e) {
        toast("Save failed: " + e.code, 1);
      }
    };
    $("eFile").onchange = async (ev) => {
      const f = ev.target.files[0];
      if (!f) return;
      const wb = XLSX.read(await f.arrayBuffer()),
        data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {
          defval: "",
        });
      const pick = (r, ks) => {
        const k = Object.keys(r).find((c) =>
          ks.includes(c.toLowerCase().replace(/[^a-z]/g, "")),
        );
        return k ? r[k] : "";
      };
      const have = new Set(rows.map((r) => r.id)),
        seen = new Set(),
        list = [];
      data.forEach((r, n) => {
        const id = cleanId(pick(r, ["employeeid", "empid", "sapid", "sap"])),
          name = String(pick(r, ["employeename", "name", "empname"])).trim(),
          st = normStatus(pick(r, ["status"]));
        const e = { row: n + 2, id, name, st };
        e.err = !id
          ? "Missing ID"
          : !name
            ? "Missing name"
            : !st
              ? "Status must be Active/Inactive"
              : seen.has(id)
                ? "Duplicate ID in file"
                : "";
        if (id) seen.add(id);
        e.kind = e.err ? "invalid" : have.has(id) ? "update" : "new";
        list.push(e);
      });
      const ok = list.filter((x) => !x.err),
        cnt = (k) => list.filter((x) => x.kind === k).length;
      $("eMsg").innerHTML =
        `<div class="qz-info">Preview: ${cnt("new")} new, ${cnt("update")} to update, ${cnt("invalid")} invalid/duplicate (skipped).</div><div class="scroll" style="max-height:30vh"><table class="tbl"><tr><th>Row</th><th>ID</th><th>Name</th><th>Status</th><th>Action</th></tr>${list
          .slice(0, 300)
          .map(
            (x) =>
              `<tr style="${x.err ? "background:#fee2e2" : ""}"><td>${x.row}</td><td>${esc(x.id)}</td><td>${esc(x.name)}</td><td>${x.st}</td><td>${x.err || x.kind}</td></tr>`,
          )
          .join(
            "",
          )}</table></div><button class="qz-btn ok block" id="eGo" style="margin-top:8px" ${ok.length ? "" : "disabled"}>Import ${ok.length} records</button>`;
      $("eGo").onclick = async () => {
        $("eGo").disabled = true;
        try {
          for (let i = 0; i < ok.length; i += 400) {
            const b = F.writeBatch(db);
            ok.slice(i, i + 400).forEach((x) => put(x.id, x.name, x.st, b));
            await b.commit();
          }
          toast(`Imported ${ok.length} employees.`);
          employees();
        } catch (e) {
          toast("Import failed: " + e.code, 1);
          $("eGo").disabled = false;
        }
      };
    };
  }

  /* ---------- 3. question management ---------- */
  const refreshBank = async (d, t) => {
    const k = bankKey(d, t),
      n = (
        await F.getCountFromServer(
          F.query(
            col("questions"),
            F.where("bankKey", "==", k),
            F.where("status", "==", "approved"),
          ),
        )
      ).data().count;
    await F.setDoc(
      dref("quizBanks", k),
      { dept: d, topic: t, approved: n, updatedAt: Date.now() },
      { merge: true },
    );
  };
  const qCard = (
    q,
    n,
  ) => `<div class="q-adm ${q.status || "approved"}"><b>${n ? n + ". " : ""}${esc(q.q.en)}</b><br><span class="qz-muted">${esc(q.q.hi)}</span>${q.options.en.map((o, i) => `<div class="o ${q.correct.includes(i) ? "r" : ""}">${LET[i]}. ${esc(o)} <span class="qz-muted">/ ${esc(q.options.hi[i])}</span></div>`).join("")}
    <div><b>Why:</b> ${esc(q.explanation.en)} <span class="qz-muted">/ ${esc(q.explanation.hi)}</span></div><div class="qz-muted">Ref: ${esc((q.ref || {}).text || "–")} ${esc((q.ref || {}).dgms || "")} · ${q.correct.length > 1 ? "multi-correct" : "single-correct"}</div>`;
  const sub = { v: "manual" };
  function questions() {
    pane().innerHTML = `<div class="qz-row" style="margin-bottom:10px">${[
      ["manual", "Enter Question"],
      ["bulk", "Enter Question (JS file)"],
      ["manage", "Manage Question"],
    ]
      .map(
        ([k, l]) =>
          `<button class="qz-btn sm ${sub.v === k ? "on" : "ghost"}" data-s="${k}">${l}</button>`,
      )
      .join("")}</div><div id="sp"></div>`;
    pane()
      .querySelectorAll("[data-s]")
      .forEach(
        (b) =>
          (b.onclick = () => {
            sub.v = b.dataset.s;
            questions();
          }),
      );
    ({ manual: manualQ, bulk: bulkQ, manage: manageQ })[sub.v]();
  }
  const mk = (d, t, q, extra) => {
    const correct = [...new Set(q.correct)].sort();
    return {
      bankKey: bankKey(d, t),
      dept: d,
      topic: t,
      q: q.q,
      options: q.options,
      correct,
      multi: correct.length > 1,
      explanation: q.explanation,
      ref: q.ref || {},
      status: "approved",
      createdBy: me.uid,
      createdAt: Date.now(),
      ...extra,
    };
  };
  async function loadSops() {
    if (!window.SOPS)
      await new Promise((res) => {
        const s = document.createElement("script");
        s.src = "js/sops.js";
        s.onload = res;
        s.onerror = res;
        document.head.appendChild(s);
      });
  }
  async function manualQ() {
    await loadSops();
    $("sp").innerHTML =
      `<div class="f2"><div><label class="f">Department</label><select id="mD">${deptOpts("mining")}</select></div><div><label class="f">Quiz topic</label><select id="mT">${topicOpts("mining")}</select></div></div>
      <div class="qz-card" style="margin-top:10px"><label class="f">Question (English)</label><textarea id="mqe"></textarea><label class="f">Question (Hindi)</label><textarea id="mqh"></textarea>
      <label class="f">Type</label><select id="mTy"><option value="s">Single correct (radio)</option><option value="m">Multiple correct (checkbox)</option></select><div id="mO"></div>
      <label class="f">Explanation (English)</label><textarea id="mee"></textarea><label class="f">Explanation (Hindi)</label><textarea id="meh"></textarea>
      <label class="f">Reference</label><select id="mRt"><option value="sop">SOP reference</option><option value="ext">External reference</option></select><div id="mR"></div></div>
      <div class="qz-row"><button class="qz-btn ghost" id="mPv">Preview</button><button class="qz-btn ok" id="mUp">Upload</button></div><div id="mPrev" style="margin-top:10px"></div>`;
    const drawO = () => {
      const m = $("mTy").value === "m";
      $("mO").innerHTML = LET.map(
        (L, i) =>
          `<div class="f2"><div><label class="f"><input type="${m ? "checkbox" : "radio"}" name="mc" id="mc${i}"> ${L} correct – English</label><input type="text" id="moe${i}"></div><div><label class="f">${L} – Hindi</label><input type="text" id="moh${i}"></div></div>`,
      ).join("");
    };
    const drawR = () => {
      const sop = $("mRt").value === "sop",
        s = window.SOPS && window.SOPS[$("mT").value];
      $("mR").innerHTML = sop
        ? s
          ? `<select id="mRs">${s.en.map((r, n) => `<option value="${n}">${n + 1}. ${esc(r[0])}</option>`).join("")}</select>`
          : `<div class="qz-info">No SOP text for this topic yet – use External reference.</div>`
        : `<input type="text" id="mRx" placeholder="Document / standard / circular / URL">`;
    };
    $("mD").onchange = () => {
      $("mT").innerHTML = topicOpts($("mD").value);
      drawR();
    };
    $("mT").onchange = drawR;
    $("mRt").onchange = drawR;
    $("mTy").onchange = drawO;
    drawO();
    drawR();
    const build = () => {
      const g = (i) => $(i).value.trim(),
        correct = [0, 1, 2, 3].filter((i) => $("mc" + i).checked),
        d = $("mD").value,
        t = $("mT").value;
      const q = {
        q: { en: g("mqe"), hi: g("mqh") },
        options: {
          en: [0, 1, 2, 3].map((i) => g("moe" + i)),
          hi: [0, 1, 2, 3].map((i) => g("moh" + i)),
        },
        correct,
        explanation: { en: g("mee"), hi: g("meh") },
      };
      if ($("mRt").value === "sop") {
        const s = window.SOPS && window.SOPS[t];
        if ($("mRs"))
          q.ref = {
            sec: +$("mRs").value,
            text: `${topicName(d, t)} SOP – Section ${+$("mRs").value + 1}: ${s.en[+$("mRs").value][0]}`,
            dgms: "",
          };
      } else q.ref = { text: g("mRx"), dgms: "" };
      const miss = [];
      if (!q.q.en || !q.q.hi) miss.push("question (both languages)");
      if (q.options.en.some((x) => !x) || q.options.hi.some((x) => !x))
        miss.push("all options (both languages)");
      if (!correct.length) miss.push("a correct answer");
      if (!q.explanation.en || !q.explanation.hi)
        miss.push("explanation (both languages)");
      if (!q.ref || !q.ref.text) miss.push("reference");
      return { d, t, q, miss };
    };
    $("mPv").onclick = () => {
      const { q, miss } = build();
      $("mPrev").innerHTML =
        (miss.length
          ? `<div class="qz-err">Missing: ${miss.join(", ")}</div>`
          : "") + qCard(q);
    };
    $("mUp").onclick = async () => {
      const { d, t, q, miss } = build();
      if (miss.length) return toast("Missing: " + miss.join(", "), 1);
      try {
        await F.addDoc(col("questions"), mk(d, t, q, { source: "manual" }));
        await refreshBank(d, t);
        toast("Question uploaded.");
        manualQ();
      } catch (e) {
        toast("Upload failed: " + e.code, 1);
      }
    };
  }
  function bulkQ() {
    $("sp").innerHTML =
      `<div class="qz-card"><b>Bulk upload (quiz-sample.js format)</b><p class="qz-muted">Parsed safely as data – the script is never executed. Dept/topic are read from each question; if missing, the selection below is used.</p>
      <div class="f2"><div><label class="f">Default department</label><select id="bD">${deptOpts("mining")}</select></div><div><label class="f">Default topic</label><select id="bT">${topicOpts("mining")}</select></div></div>
      <label class="f">Upload .js file</label><input type="file" id="bF" accept=".js,.txt"><label class="f">…or paste code</label><textarea id="bX" style="min-height:120px"></textarea><button class="qz-btn block" id="bGo" style="margin-top:10px">Parse &amp; preview</button></div><div id="bOut"></div>`;
    $("bD").onchange = () => ($("bT").innerHTML = topicOpts($("bD").value));
    $("bF").onchange = async (e) => {
      if (e.target.files[0]) $("bX").value = await e.target.files[0].text();
    };
    $("bGo").onclick = async () => {
      let arr;
      try {
        arr = parseJS($("bX").value);
      } catch (e) {
        return ($("bOut").innerHTML =
          `<div class="qz-err">Could not parse: ${esc(e.message)}</div>`);
      }
      const dd = $("bD").value,
        dt = $("bT").value,
        seen = new Set(),
        seenQ = new Set();
      const ex = new Set(
        (await F.getDocs(F.query(col("questions"), F.limit(5000)))).docs.map(
          (d) => d.id,
        ),
      );
      const L = arr.map((q, i) => {
        q = q || {};
        q.dept = q.dept || dd;
        q.topic = q.topic || (q.dept === dd ? dt : "");
        const p = checkQ(q, DEPTS);
        if (!q.topic) p.push("Topic missing");
        const id = q.id ? String(q.id).replace(/[\/\s]/g, "_") : "";
        if (id && seen.has(id)) p.push("Duplicate ID in file");
        if (id) seen.add(id);
        const key = (q.q?.en || "").trim().toLowerCase();
        if (key && seenQ.has(key)) p.push("Duplicate question text");
        seenQ.add(key);
        return { i, q, id, p, upd: id && ex.has(id) };
      });
      const draw = () => {
        $("bOut").innerHTML =
          `<p class="qz-muted">${L.length} found · ${L.filter((x) => !x.p.length).length} valid · ${L.filter((x) => x.upd).length} will overwrite an existing ID</p><label><input type="checkbox" id="bAll" checked> Select all valid</label>
        ${L.map((x) => `<div class="q-adm ${x.p.length ? "rejected" : "approved"}"><label><input type="checkbox" data-sel="${x.i}" ${x.p.length ? "disabled" : x.sel === false ? "" : "checked"}> <b>${esc(x.id || "#" + (x.i + 1))}</b> · ${esc(x.q.dept)} / ${esc(x.q.topic)} ${x.upd ? '<span class="badge warn">exists</span>' : ""}</label><div>${esc(x.q.q?.en || "")}</div>${x.p.length ? `<div class="qz-err">${x.p.map(esc).join("; ")}</div>` : ""}<button class="qz-btn ghost sm" data-e="${x.i}">Edit</button></div>`).join("")}
        <button class="qz-btn ok block" id="bUp">Upload selected</button>`;
        $("bAll").onchange = (e) => {
          L.forEach((x) => (x.sel = !x.p.length && e.target.checked));
          draw();
        };
        $("bOut")
          .querySelectorAll("[data-sel]")
          .forEach(
            (c) => (c.onchange = () => (L[+c.dataset.sel].sel = c.checked)),
          );
        $("bOut")
          .querySelectorAll("[data-e]")
          .forEach(
            (b) =>
              (b.onclick = async () => {
                const x = L[+b.dataset.e],
                  t = await askText(
                    "Edit question as JSON",
                    JSON.stringify(x.q, null, 2),
                  );
                if (t == null) return;
                try {
                  x.q = JSON.parse(t);
                  x.p = checkQ(x.q, DEPTS);
                  draw();
                } catch (e) {
                  toast("Invalid JSON", 1);
                }
              }),
          );
        $("bUp").onclick = async () => {
          const pick = L.filter(
            (x) =>
              !x.p.length &&
              x.sel !== false &&
              $("bOut").querySelector(`[data-sel="${x.i}"]`).checked,
          );
          if (!pick.length) return toast("Nothing selected.", 1);
          try {
            for (let i = 0; i < pick.length; i += 400) {
              const b = F.writeBatch(db);
              pick
                .slice(i, i + 400)
                .forEach((x) =>
                  b.set(
                    x.id ? dref("questions", x.id) : F.doc(col("questions")),
                    mk(x.q.dept, x.q.topic, x.q, { source: "bulk" }),
                  ),
                );
              await b.commit();
            }
            for (const k of new Set(
              pick.map((x) => x.q.dept + "|" + x.q.topic),
            ))
              await refreshBank(...k.split("|"));
            toast(`Uploaded ${pick.length} questions.`);
            bulkQ();
          } catch (e) {
            toast("Upload failed: " + e.code, 1);
          }
        };
      };
      draw();
    };
  }
  async function manageQ() {
    $("sp").innerHTML = `<p class="qz-muted">Loading…</p>`;
    const all = (
      await F.getDocs(F.query(col("questions"), F.limit(5000)))
    ).docs.map((d) => ({ id: d.id, ...d.data() }));
    let sel = null,
      pg = 0;
    const cnt = {};
    all.forEach((q) => (cnt[q.bankKey] = (cnt[q.bankKey] || 0) + 1));
    const rows = depts.flatMap((d) =>
      DEPTS[d].equipment.map((e) => ({
        d,
        t: e.id,
        n: cnt[bankKey(d, e.id)] || 0,
      })),
    );
    const draw = () => {
      if (!sel) {
        $("sp").innerHTML =
          `<div class="scroll"><table class="tbl"><tr><th>Department</th><th>Topic</th><th>Total questions</th><th></th></tr>${rows.map((r, i) => `<tr><td>${DEPTS[r.d].en}</td><td>${esc(topicName(r.d, r.t))}</td><td>${r.n}</td><td><button class="qz-btn ghost sm" data-o="${i}">Open</button></td></tr>`).join("")}</table></div>`;
        $("sp")
          .querySelectorAll("[data-o]")
          .forEach(
            (b) =>
              (b.onclick = () => {
                sel = rows[+b.dataset.o];
                pg = 0;
                draw();
              }),
          );
        return;
      }
      const key = bankKey(sel.d, sel.t);
      $("sp").innerHTML =
        `<button class="qz-btn ghost sm" id="qb">← All topics</button> <b>${DEPTS[sel.d].en} › ${esc(topicName(sel.d, sel.t))}</b><input id="qs" type="text" placeholder="Search question text" style="margin:8px 0" value="${esc(sel.s || "")}"><div id="ql"></div><div id="qp"></div>`;
      $("qb").onclick = () => {
        sel = null;
        draw();
      };
      $("qs").oninput = (e) => {
        sel.s = e.target.value;
        pg = 0;
        list();
      };
      const list = () => {
        const s = (sel.s || "").toLowerCase(),
          r = all.filter(
            (q) =>
              q.bankKey === key &&
              (!s || (q.q.en + q.q.hi).toLowerCase().includes(s)),
          );
        $("ql").innerHTML =
          r
            .slice(pg * PER, pg * PER + PER)
            .map(
              (q, i) =>
                qCard(q, pg * PER + i + 1) +
                `<div class="acts"><button class="qz-btn ghost sm" data-ed="${q.id}">Edit</button><button class="qz-btn ghost sm" data-del="${q.id}">Delete</button></div></div>`,
            )
            .join("") || `<p class="qz-muted">No questions.</p>`;
        $("qp").innerHTML = pager(r.length, pg);
        $("qp")
          .querySelectorAll("[data-pg]")
          .forEach(
            (b) =>
              (b.onclick = () => {
                pg += +b.dataset.pg;
                list();
              }),
          );
        $("ql")
          .querySelectorAll("[data-ed]")
          .forEach(
            (b) =>
              (b.onclick = () =>
                editQ(
                  all.find((q) => q.id === b.dataset.ed),
                  async () => {
                    await refreshBank(sel.d, sel.t);
                    manageQ();
                  },
                )),
          );
        $("ql")
          .querySelectorAll("[data-del]")
          .forEach(
            (b) =>
              (b.onclick = async () => {
                if (
                  !(await askConfirm(
                    "Delete this question permanently? Past quiz attempts keep their own snapshot.",
                  ))
                )
                  return;
                await F.deleteDoc(dref("questions", b.dataset.del));
                all.splice(
                  all.findIndex((q) => q.id === b.dataset.del),
                  1,
                );
                rows.find((r) => r.d === sel.d && r.t === sel.t).n--;
                await refreshBank(sel.d, sel.t);
                toast("Deleted.");
                list();
              }),
          );
      };
      list();
    };
    draw();
  }
  function editQ(q, done) {
    const ov = document.createElement("div");
    ov.className = "qz-ov";
    const f = (id, v, ta) =>
      ta
        ? `<textarea id="${id}">${esc(v)}</textarea>`
        : `<input type="text" id="${id}" value="${esc(v)}">`;
    ov.innerHTML = `<div class="qz-modal" style="max-width:720px"><h3>Edit question</h3><label class="f">Question (English)</label>${f("xqe", q.q.en, 1)}<label class="f">Question (Hindi)</label>${f("xqh", q.q.hi, 1)}
      ${[0, 1, 2, 3].map((i) => `<div class="f2"><div><label class="f"><input type="checkbox" id="xc${i}" ${q.correct.includes(i) ? "checked" : ""}> ${LET[i]} correct – English</label>${f("xoe" + i, q.options.en[i])}</div><div><label class="f">${LET[i]} – Hindi</label>${f("xoh" + i, q.options.hi[i])}</div></div>`).join("")}
      <label class="f">Explanation (English)</label>${f("xee", q.explanation.en, 1)}<label class="f">Explanation (Hindi)</label>${f("xeh", q.explanation.hi, 1)}<div class="f2"><div><label class="f">Reference</label>${f("xrt", (q.ref || {}).text || "")}</div><div><label class="f">DGMS / external detail</label>${f("xrd", (q.ref || {}).dgms || "")}</div></div>
      <div class="qz-row" style="margin-top:14px"><button class="qz-btn ghost" id="xCancel">Cancel</button><button class="qz-btn ok" id="xSave">Save</button></div></div>`;
    document.body.appendChild(ov);
    $("xCancel").onclick = () => ov.remove();
    $("xSave").onclick = async () => {
      const correct = [0, 1, 2, 3].filter((i) => $("xc" + i).checked),
        g = (id) => $(id).value.trim(),
        o = (p) => [0, 1, 2, 3].map((i) => g(p + i));
      if (!correct.length) return toast("Mark at least one correct option.", 1);
      if (
        !g("xqe") ||
        !g("xqh") ||
        o("xoe").some((x) => !x) ||
        o("xoh").some((x) => !x) ||
        !g("xee") ||
        !g("xeh")
      )
        return toast(
          "Fill question, options and explanation in both languages.",
          1,
        );
      try {
        await F.updateDoc(dref("questions", q.id), {
          q: { en: g("xqe"), hi: g("xqh") },
          options: { en: o("xoe"), hi: o("xoh") },
          correct,
          multi: correct.length > 1,
          explanation: { en: g("xee"), hi: g("xeh") },
          ref: { ...(q.ref || {}), text: g("xrt"), dgms: g("xrd") },
          editedAt: Date.now(),
        });
        ov.remove();
        toast("Saved.");
        done();
      } catch (e) {
        toast("Save failed: " + e.code, 1);
      }
    };
  }

  /* ---------- 4. employee quiz engagement ---------- */
  function engagement() {
    const today = new Date().toISOString().slice(0, 10),
      m0 = new Date(Date.now() - 90 * 864e5).toISOString().slice(0, 10);
    pane().innerHTML = `<div class="qz-card"><div class="f2"><div><label class="f">Employee ID</label><input id="gS" type="text"></div><div><label class="f">Employee name</label><input id="gN" type="text"></div>
      <div><label class="f">Department</label><select id="gD"><option value="">All</option>${deptOpts("")}</select></div><div><label class="f">Topic</label><select id="gT"><option value="">All</option></select></div>
      <div><label class="f">Quiz no.</label><select id="gQ"><option value="">All</option><option>1</option><option>2</option><option>3</option><option>4</option></select></div><div><label class="f">Result</label><select id="gR"><option value="">All</option><option value="p">Pass</option><option value="f">Fail</option></select></div>
      <div><label class="f">From</label><input type="date" id="gF" value="${m0}"></div><div><label class="f">To</label><input type="date" id="gE" value="${today}"></div></div>
      <div class="qz-row" style="margin-top:10px"><button class="qz-btn" id="gGo">Load</button><button class="qz-btn ghost" id="gX" disabled>Export Excel</button></div><div class="qz-row" style="margin-top:8px"><button class="qz-btn ghost sm" id="gNo" disabled>Never attempted</button><button class="qz-btn ghost sm" id="gRep" disabled>Repeat failures</button></div></div><div id="gOut"></div>`;
    $("gD").onchange = () =>
      ($("gT").innerHTML =
        `<option value="">All</option>` +
        ($("gD").value ? topicOpts($("gD").value) : ""));
    let att = [],
      view = [],
      pg = 0;
    $("gGo").onclick = async () => {
      const from = new Date($("gF").value).getTime(),
        to = new Date($("gE").value).getTime() + 864e5,
        sap = cleanId($("gS").value);
      $("gOut").textContent = "Loading…";
      try {
        const cs = sap
          ? [F.where("sapId", "==", sap)]
          : [
              F.where("startedAt", ">=", from),
              F.where("startedAt", "<", to),
              F.orderBy("startedAt", "desc"),
            ];
        att = (
          await F.getDocs(F.query(col("quizAttempts"), ...cs, F.limit(5000)))
        ).docs
          .map((d) => ({ _id: d.id, ...d.data() }))
          .filter((a) => a.status !== "in_progress");
      } catch (e) {
        return ($("gOut").innerHTML =
          `<div class="qz-err">${esc(e.code || e.message)}</div>`);
      }
      const nm = $("gN").value.trim().toLowerCase(),
        d = $("gD").value,
        t = $("gT").value,
        qn = $("gQ").value,
        r = $("gR").value;
      view = att.filter(
        (a) =>
          (!nm || (a.name || "").toLowerCase().includes(nm)) &&
          (!d || a.dept === d) &&
          (!t || a.topic === t) &&
          (!qn || a.quizNo === +qn) &&
          (!r || (r === "p") === !!a.passed) &&
          (!sap || (a.startedAt >= from && a.startedAt < to)),
      );
      view.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));
      pg = 0;
      $("gX").disabled = $("gNo").disabled = $("gRep").disabled = false;
      draw(sap);
    };
    const tot = (a) => a.total || (a.questionIds || []).length || 7,
      cor = (a) => a.correct || 0,
      pct = (a) => Math.round((cor(a) / tot(a)) * 100);
    const draw = (sap) => {
      const p = view.filter((a) => a.passed).length,
        c = view.reduce((s, a) => s + cor(a), 0),
        q = view.reduce((s, a) => s + tot(a), 0);
      $("gOut").innerHTML =
        `${sap && view[0] ? `<p><b>${esc(view[0].sapId)} – ${esc(view[0].name)}</b> · ${[...new Set(view.map((a) => DEPTS[a.dept]?.en))].join(", ")}</p>` : ""}<div class="kpi"><div><span>Total attempts</span><b>${view.length}</b></div><div><span>Passed</span><b>${p}</b></div><div><span>Failed</span><b>${view.length - p}</b></div><div><span>Correct / Incorrect</span><b style="font-size:1.3rem">${c} / ${q - c}</b></div><div><span>Overall accuracy</span><b>${q ? Math.round((c / q) * 100) : 0}%</b></div></div>
        <div class="scroll" style="margin-top:10px"><table class="tbl"><tr><th>ID</th><th>Name</th><th>Dept</th><th>Topic</th><th>Quiz</th><th>Att.</th><th>Date</th><th>Qs</th><th>Right</th><th>Wrong</th><th>Score</th><th>Result</th></tr>${view
          .slice(pg * PER, pg * PER + PER)
          .map(
            (a) =>
              `<tr data-a="${a._id}" style="cursor:pointer"><td>${esc(a.sapId)}</td><td>${esc(a.name)}</td><td>${DEPTS[a.dept]?.en || ""}</td><td>${esc(topicName(a.dept, a.topic))}</td><td>${a.quizNo}</td><td>${a.attemptNo}</td><td>${dateStr(a.submittedAt)}</td><td>${tot(a)}</td><td>${cor(a)}</td><td>${tot(a) - cor(a)}</td><td>${pct(a)}%</td><td>${a.passed ? "Pass" : "Fail"}</td></tr>`,
          )
          .join(
            "",
          )}</table></div>${pager(view.length, pg)}<div id="gDet"></div>`;
      $("gOut")
        .querySelectorAll("[data-pg]")
        .forEach(
          (b) =>
            (b.onclick = () => {
              pg += +b.dataset.pg;
              draw(sap);
            }),
        );
      $("gOut")
        .querySelectorAll("[data-a]")
        .forEach(
          (r) =>
            (r.onclick = () => detail(view.find((a) => a._id === r.dataset.a))),
        );
    };
    async function detail(a) {
      let snap = a.snapshot;
      if (!snap) {
        snap = {};
        for (const id of a.questionIds || []) {
          const s = await F.getDoc(dref("questions", id)).catch(() => null);
          if (s && s.exists()) snap[id] = s.data();
        }
      }
      $("gDet").innerHTML =
        `<h3>${esc(a.name)} – ${esc(topicName(a.dept, a.topic))} Quiz ${a.quizNo} (attempt ${a.attemptNo})</h3><p>Score ${cor(a)}/${tot(a)} · ${pct(a)}% · <b>${a.passed ? "PASS" : "FAIL"}</b></p>` +
        (a.questionIds || [])
          .map((id, i) => {
            const q = snap[id],
              y = (a.answers || {})[id] || [];
            if (!q)
              return `<div class="q-adm rejected">Q${i + 1}: question no longer available (this attempt was made before snapshots were stored).</div>`;
            const ok =
              y.length === q.correct.length &&
              q.correct.every((k) => y.includes(k));
            return `<div class="q-adm ${ok ? "approved" : "rejected"}"><b>Q${i + 1}. ${esc(q.q.en)}</b> <span class="badge ${ok ? "" : "bad"}">${ok ? "Correct" : "Incorrect"}</span>${q.options.en.map((o, k) => `<div class="o ${q.correct.includes(k) ? "r" : ""}">${LET[k]}. ${esc(o)}${y.includes(k) ? " ◀ selected" : ""}</div>`).join("")}<div class="qz-muted">Selected: ${y.map((k) => LET[k]).join(", ") || "none"} · Correct: ${q.correct.map((k) => LET[k]).join(", ")}</div><div><b>Why:</b> ${esc((q.explanation || {}).en || "")}</div></div>`;
          })
          .join("");
      $("gDet").scrollIntoView({ behavior: "smooth" });
    }
    $("gX").onclick = () => {
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.json_to_sheet(
          view.map((a) => ({
            "Employee ID": a.sapId,
            Name: a.name,
            Department: DEPTS[a.dept]?.en,
            Topic: topicName(a.dept, a.topic),
            "Quiz No": a.quizNo,
            Attempt: a.attemptNo,
            Date: dateStr(a.submittedAt),
            Total: tot(a),
            Correct: cor(a),
            Incorrect: tot(a) - cor(a),
            "Score %": pct(a),
            Result: a.passed ? "Pass" : "Fail",
          })),
        ),
        "Attempts",
      );
      XLSX.writeFile(
        wb,
        `Quiz-Engagement-${$("gF").value}-to-${$("gE").value}.xlsx`,
      );
    };
    $("gNo").onclick = async () => {
      const ids = new Set(att.map((a) => a.sapId)),
        emps = (
          await F.getDocs(F.query(col("employees"), F.limit(5000)))
        ).docs.filter(
          (d) => (d.data().status || "Active") === "Active" && !ids.has(d.id),
        );
      $("gDet")
        ? ($("gDet").innerHTML =
            `<h3>Active employees with no attempts in this period (${emps.length})</h3><div class="scroll"><table class="tbl">${emps.map((d) => `<tr><td>${esc(d.id)}</td><td>${esc(d.data().name)}</td></tr>`).join("")}</table></div>`)
        : 0;
    };
    $("gRep").onclick = () => {
      const m = {};
      att
        .filter((a) => !a.passed)
        .forEach((a) => {
          const k = `${a.sapId}|${a.dept}|${a.topic}`;
          (m[k] ||= { a, n: 0 }).n++;
        });
      const r = Object.values(m)
        .filter((x) => x.n >= 2)
        .sort((a, b) => b.n - a.n);
      if (!$("gDet")) draw();
      $("gDet").innerHTML =
        `<h3>Failed the same topic 2+ times (${r.length})</h3><div class="scroll"><table class="tbl"><tr><th>ID</th><th>Name</th><th>Topic</th><th>Fails</th></tr>${r.map((x) => `<tr><td>${esc(x.a.sapId)}</td><td>${esc(x.a.name)}</td><td>${esc(topicName(x.a.dept, x.a.topic))}</td><td>${x.n}</td></tr>`).join("")}</table></div>`;
    };
  }
}
