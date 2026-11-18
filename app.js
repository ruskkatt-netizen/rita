"use strict";

const FASER = ["Grundform", "Skuggning", "Detaljer", "Slutfinish"];
const FÄRGER = ["#4a3728", "#e53935", "#fb8c00", "#fdd835", "#43a047", "#1e88e5", "#8e24aa", "#ec407a", "#795548", "#ffffff"];
const GALLERI_MAX = 12;

const $ = (id) => document.getElementById(id);

function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* localStorage fullt eller otillgängligt – ignorera tyst */
  }
}

const state = {
  djur: null,
  steg: 1,
  tab: "video",
  videoLaddad: false,
  quiz: null,
  ritFärg: FÄRGER[0],
  ritStorlek: 8,
  suddar: false,
  ritar: false,
  senaste: null
};

function djurSVG(d, uppTill) {
  const n = uppTill === undefined ? d.steg.length : uppTill;
  const inner = d.steg.slice(0, n).join("");
  return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#4a3728" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="' + d.namn + '">' + inner + "</svg>";
}

function hittaDjur(id) {
  return DJUR.find((d) => d.id === id) || null;
}

function stjärnor() {
  const ritade = lsGet("rita-ritade", []);
  const quiz = lsGet("rita-quiz", []);
  return ritade.length + quiz.length;
}

function uppdateraStjärnor() {
  $("starCount").textContent = stjärnor();
}

/* ---------- Routing ---------- */

function route() {
  const hash = location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/");
  document.querySelectorAll(".view").forEach((v) => (v.hidden = true));
  document.querySelectorAll(".nav-link").forEach((a) => a.classList.remove("active"));

  if (parts[0] === "quiz") {
    $("view-quiz").hidden = false;
    document.querySelector('[data-nav="quiz"]').classList.add("active");
    startaQuiz();
  } else if (parts[0] === "djur" && parts[1]) {
    const d = hittaDjur(parts[1]);
    if (d) {
      visaDjur(d);
    } else {
      location.hash = "#/";
    }
  } else {
    $("view-home").hidden = false;
    document.querySelector('[data-nav="home"]').classList.add("active");
    renderaGrid();
    renderaGalleri();
  }
  uppdateraStjärnor();
  window.scrollTo(0, 0);
}

/* ---------- Hem: rutnät + sök + galleri ---------- */

function renderaGrid() {
  const q = $("searchInput").value.trim().toLowerCase();
  const ritade = lsGet("rita-ritade", []);
  const grid = $("animalGrid");
  grid.innerHTML = "";
  DJUR.filter((d) => d.namn.toLowerCase().includes(q)).forEach((d) => {
    const btn = document.createElement("button");
    btn.className = "card";
    btn.type = "button";
    const klar = ritade.includes(d.id);
    btn.innerHTML =
      '<span class="card-art">' + djurSVG(d) + "</span>" +
      '<span class="card-name">' + d.emoji + " " + d.namn + "</span>" +
      '<span class="card-level">' + "★".repeat(d.nivå) + "☆".repeat(3 - d.nivå) + "</span>" +
      (klar ? '<span class="card-done">⭐ klar</span>' : "");
    btn.addEventListener("click", () => {
      location.hash = "#/djur/" + d.id;
    });
    grid.appendChild(btn);
  });
  if (!grid.children.length) {
    grid.innerHTML = '<p class="empty">Hittade inget djur som heter så – prova ett annat ord! 🔍</p>';
  }
}

function renderaGalleri() {
  const g = lsGet("rita-galleri", []);
  const box = $("gallery");
  box.innerHTML = "";
  if (!g.length) {
    box.innerHTML = '<p class="empty">Inga bilder än – rita något och spara det! ✏️</p>';
    return;
  }
  g.forEach((item, i) => {
    const el = document.createElement("div");
    el.className = "gallery-item";
    el.innerHTML =
      '<img src="' + item.data + '" alt="Ritad bild av ' + item.namn + '" />' +
      '<div class="cap">' + item.emoji + " " + item.namn + "</div>";
    const del = document.createElement("button");
    del.className = "btn ghost del";
    del.type = "button";
    del.textContent = "🗑️ Ta bort";
    del.addEventListener("click", () => {
      const gg = lsGet("rita-galleri", []);
      gg.splice(i, 1);
      lsSet("rita-galleri", gg);
      renderaGalleri();
    });
    el.appendChild(del);
    box.appendChild(el);
  });
}

/* ---------- Djursida ---------- */

function visaDjur(d) {
  state.djur = d;
  state.steg = 1;
  state.tab = "video";
  state.videoLaddad = false;

  $("view-animal").hidden = false;
  $("animalTitle").textContent = d.emoji + " " + d.namn;
  $("animalLevel").textContent = "★".repeat(d.nivå) + "☆".repeat(3 - d.nivå);
  $("animalPreview").innerHTML = djurSVG(d);
  $("resultPreview").innerHTML = djurSVG(d);
  $("ytLink").href = "https://www.youtube.com/watch?v=" + d.video;
  $("ytSearch").href = "https://www.youtube.com/results?search_query=" + encodeURIComponent(d.sök);

  uppdateraKlarKnapp();
  växlaTab("video");
  renderaSteg();
  förberedRityta();
}

function uppdateraKlarKnapp() {
  const ritade = lsGet("rita-ritade", []);
  const btn = $("doneBtn");
  const klar = ritade.includes(state.djur.id);
  btn.textContent = klar ? "⭐ Klar! (klicka för att ångra)" : "⭐ Jag klarade den!";
  btn.classList.toggle("done", klar);
}

$("doneBtn").addEventListener("click", () => {
  let ritade = lsGet("rita-ritade", []);
  if (ritade.includes(state.djur.id)) {
    ritade = ritade.filter((x) => x !== state.djur.id);
  } else {
    ritade.push(state.djur.id);
  }
  lsSet("rita-ritade", ritade);
  uppdateraKlarKnapp();
  uppdateraStjärnor();
});

$("backBtn").addEventListener("click", () => {
  location.hash = "#/";
});

/* ---------- Flikar ---------- */

function växlaTab(tab) {
  state.tab = tab;
  document.querySelectorAll(".tab").forEach((t) => {
    const aktiv = t.dataset.tab === tab;
    t.classList.toggle("active", aktiv);
    t.setAttribute("aria-selected", aktiv ? "true" : "false");
  });
  $("tab-video").hidden = tab !== "video";
  $("tab-steg").hidden = tab !== "steg";
  $("tab-rita").hidden = tab !== "rita";
  if (tab === "video") laddaVideo();
}

document.querySelectorAll(".tab").forEach((t) => {
  t.addEventListener("click", () => växlaTab(t.dataset.tab));
});

function laddaVideo() {
  if (state.videoLaddad || !state.djur) return;
  state.videoLaddad = true;
  $("videoMount").innerHTML =
    '<iframe src="https://www.youtube-nocookie.com/embed/' + state.djur.video + '?rel=0" title="Video: så ritar du ' + state.djur.namn + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>';
}

/* ---------- Steg för steg ---------- */

function renderaSteg() {
  const d = state.djur;
  if (!d) return;
  const max = d.steg.length;
  state.steg = Math.min(Math.max(state.steg, 1), max);
  $("stepStage").innerHTML = djurSVG(d, state.steg);
  $("stepPhase").textContent = "Steg " + state.steg + " · " + FASER[state.steg - 1];
  $("stepCount").textContent = state.steg + " / " + max;
  $("stepBar").style.width = (state.steg / max) * 100 + "%";
  $("stepText").textContent = d.stegText[state.steg - 1];
  $("stepTip").textContent = d.tips || "";
  $("prevStep").disabled = state.steg === 1;
  $("nextStep").disabled = state.steg === max;
  $("nextStep").textContent = state.steg === max ? "🎉 Klart!" : "Nästa ➡";
}

$("prevStep").addEventListener("click", () => { state.steg--; renderaSteg(); });
$("nextStep").addEventListener("click", () => { state.steg++; renderaSteg(); });

/* ---------- Rita själv ---------- */

let ctx = null;
let canvas = null;

function förberedRityta() {
  canvas = $("drawCanvas");
  ctx = canvas.getContext("2d");
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  canvas.addEventListener("pointerdown", börjaRita);
  canvas.addEventListener("pointermove", ritaLinje);
  canvas.addEventListener("pointerup", slutaRita);
  canvas.addEventListener("pointercancel", slutaRita);
  canvas.addEventListener("pointerleave", slutaRita);

  renderaPalett();
}

function börjaRita(e) {
  e.preventDefault();
  canvas.setPointerCapture(e.pointerId);
  state.ritar = true;
  state.senaste = canvasPos(e);
  ritaPrick(state.senaste);
}

function ritaLinje(e) {
  if (!state.ritar) return;
  e.preventDefault();
  const p = canvasPos(e);
  ctx.globalCompositeOperation = state.suddar ? "destination-out" : "source-over";
  ctx.strokeStyle = state.ritFärg;
  ctx.lineWidth = state.suddar ? state.ritStorlek * 2.5 : state.ritStorlek;
  ctx.beginPath();
  ctx.moveTo(state.senaste.x, state.senaste.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  state.senaste = p;
  uppdateraNerladdning();
}

function ritaPrick(p) {
  ctx.globalCompositeOperation = state.suddar ? "destination-out" : "source-over";
  ctx.fillStyle = state.ritFärg;
  ctx.beginPath();
  ctx.arc(p.x, p.y, (state.suddar ? state.ritStorlek * 2.5 : state.ritStorlek) / 2, 0, Math.PI * 2);
  ctx.fill();
}

function slutaRita() {
  state.ritar = false;
  uppdateraNerladdning();
}

function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * canvas.width,
    y: ((e.clientY - r.top) / r.height) * canvas.height
  };
}

function renderaPalett() {
  const pal = $("palette");
  pal.innerHTML = "";
  FÄRGER.forEach((f) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "swatch" + (f === state.ritFärg && !state.suddar ? " active" : "");
    b.style.background = f;
    b.title = f === "#ffffff" ? "Vitt (ljusprickar)" : "Färg " + f;
    b.setAttribute("aria-label", "Välj färg " + f);
    b.addEventListener("click", () => {
      state.ritFärg = f;
      state.suddar = false;
      $("eraserBtn").setAttribute("aria-pressed", "false");
      renderaPalett();
    });
    pal.appendChild(b);
  });
}

$("brushSize").addEventListener("input", (e) => {
  state.ritStorlek = Number(e.target.value);
});

$("eraserBtn").addEventListener("click", () => {
  state.suddar = !state.suddar;
  $("eraserBtn").setAttribute("aria-pressed", String(state.suddar));
  renderaPalett();
});

$("traceBtn").addEventListener("click", () => {
  const overlay = $("traceOverlay");
  const på = overlay.hidden;
  overlay.hidden = !på;
  if (på && state.djur) overlay.innerHTML = djurSVG(state.djur);
  $("traceBtn").setAttribute("aria-pressed", String(på));
  $("traceBtn").textContent = på ? "🙈 Dölj målbild" : "👻 Visa målbild";
});

$("clearBtn").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  $("drawMsg").textContent = "Ytan är ren – kör igång! ✏️";
  uppdateraNerladdning();
});

function bildMedVitBakgrund() {
  const tmp = document.createElement("canvas");
  tmp.width = canvas.width;
  tmp.height = canvas.height;
  const tctx = tmp.getContext("2d");
  tctx.fillStyle = "#ffffff";
  tctx.fillRect(0, 0, tmp.width, tmp.height);
  tctx.drawImage(canvas, 0, 0);
  return tmp.toDataURL("image/png");
}

function uppdateraNerladdning() {
  try {
    $("downloadBtn").href = bildMedVitBakgrund();
  } catch (e) {
    /* ignorera */
  }
}

$("saveBtn").addEventListener("click", () => {
  const d = state.djur;
  const g = lsGet("rita-galleri", []);
  g.push({ id: d.id, namn: d.namn, emoji: d.emoji, data: bildMedVitBakgrund() });
  while (g.length > GALLERI_MAX) g.shift();
  lsSet("rita-galleri", g);
  renderaGalleri();
  $("drawMsg").textContent = "Sparad i galleriet! 💾 (max " + GALLERI_MAX + " bilder)";
});

/* ---------- Quiz ---------- */

function blanda(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startaQuiz() {
  const frågor = blanda(DJUR).slice(0, 8);
  state.quiz = { frågor, index: 0, rätt: 0, besvarad: false };
  renderaQuizFråga();
}

function renderaQuizFråga() {
  const q = state.quiz;
  const box = $("quizBox");
  if (q.index >= q.frågor.length) {
    box.innerHTML =
      '<p class="quiz-score">🎉 Du fick ' + q.rätt + " av " + q.frågor.length + " rätt!</p>" +
      '<p>Stjärnor från quizet sparas – varje djur ger bara en stjärna, första gången du har rätt.</p>' +
      '<button id="quizIgen" class="btn primary">🔁 Spela igen</button>';
    $("quizIgen").addEventListener("click", startaQuiz);
    uppdateraStjärnor();
    return;
  }
  const d = q.frågor[q.index];
  const alternativ = blanda([d, ...blanda(DJUR.filter((x) => x.id !== d.id)).slice(0, 3)]);
  q.besvarad = false;
  box.innerHTML =
    '<p class="step-count">Fråga ' + (q.index + 1) + " av " + q.frågor.length + "</p>" +
    '<div class="quiz-art">' + djurSVG(d) + "</div>" +
    '<p class="quiz-q">Vilket djur är det här?</p>' +
    '<div class="quiz-options">' +
    alternativ.map((a) => '<button class="btn ghost quiz-opt" data-id="' + a.id + '">' + a.emoji + " " + a.namn + "</button>").join("") +
    "</div>" +
    '<p class="quiz-feedback" id="quizFb"></p>' +
    '<button id="quizNästa" class="btn primary" hidden>Nästa ➡</button>';

  box.querySelectorAll(".quiz-opt").forEach((b) => {
    b.addEventListener("click", () => {
      if (q.besvarad) return;
      q.besvarad = true;
      const rätt = b.dataset.id === d.id;
      box.querySelectorAll(".quiz-opt").forEach((o) => {
        o.disabled = true;
        if (o.dataset.id === d.id) o.classList.add("correct");
        else if (o === b) o.classList.add("wrong");
      });
      const fb = $("quizFb");
      if (rätt) {
        q.rätt++;
        fb.textContent = "✅ Rätt! Det var en " + d.namn.toLowerCase() + "! ⭐";
        fb.style.color = "var(--ok)";
        const quiz = lsGet("rita-quiz", []);
        if (!quiz.includes(d.id)) {
          quiz.push(d.id);
          lsSet("rita-quiz", quiz);
        }
      } else {
        fb.textContent = "❌ Nästan! Det var en " + d.namn.toLowerCase() + ".";
        fb.style.color = "var(--bad)";
      }
      $("quizNästa").hidden = false;
      uppdateraStjärnor();
    });
  });

  $("quizNästa").addEventListener("click", () => {
    q.index++;
    renderaQuizFråga();
  });
}

/* ---------- Init ---------- */

$("searchInput").addEventListener("input", renderaGrid);
window.addEventListener("hashchange", route);
route();
