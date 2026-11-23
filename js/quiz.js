(function () {
  "use strict";
  var cfg = window.ADIOS_CHUPON_CONFIG || {};
  var app = document.getElementById("app");
  var prog = document.getElementById("prog");
  var bar = document.getElementById("bar");
  var progtxt = document.getElementById("progtxt");
  var state = { i: -1, a: {} };

  var questions = [
    { id: "edad", q: "¿Qué edad tiene tu peque?", opts: [
      { t: "2 años", v: "2" }, { t: "3 años", v: "3" }, { t: "4 años", v: "4" }, { t: "Más de 4 años", v: "5" } ] },
    { id: "cuando", q: "¿Cuándo usa el chupón?", opts: [
      { t: "Solo para dormir", v: "dormir" }, { t: "También de día, a ratos", v: "dia" }, { t: "Casi todo el tiempo", v: "todo" } ] },
    { id: "dormir", q: "¿Cómo se duerme tu peque?", opts: [
      { t: "Solo si tiene el chupón", v: "chupon" }, { t: "Con pecho o brazos y el chupón", v: "pecho" }, { t: "Se duerme, pero despierta y lo pide", v: "despierta" } ] },
    { id: "intento", q: "¿Ya intentaste quitárselo?", opts: [
      { t: "Sí, de un día para otro", v: "golpe" }, { t: "Sí, cortando la punta o escondiéndolo", v: "trucos" }, { t: "Todavía no", v: "no" } ] },
    { id: "reto", q: "¿Qué es lo que más te preocupa?", opts: [
      { t: "Las noches y el llanto", v: "noches" }, { t: "Los dientes", v: "dientes" }, { t: "Que va a entrar a la guardería", v: "guarderia" }, { t: "Las peleas de cada día", v: "peleas" } ] }
  ];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function withVisitParams(href) {
    try {
      var url = new URL(href);
      new URLSearchParams(location.search).forEach(function (v, k) { if (!url.searchParams.has(k)) url.searchParams.set(k, v); });
      return url.toString();
    } catch (e) { return href; }
  }
  var hasCheckout = typeof cfg.checkoutUrl === "string" && /^https:\/\//i.test(cfg.checkoutUrl.trim());
  function fbqSafe() { if (typeof window.fbq === "function") window.fbq.apply(null, arguments); }

  function updateProgress() {
    if (state.i < 0 || state.i >= questions.length) { prog.hidden = true; return; }
    prog.hidden = false;
    var n = state.i + 1, total = questions.length;
    bar.style.width = (n / total * 100) + "%";
    progtxt.textContent = "Pregunta " + n + " de " + total;
  }

  function renderIntro() {
    app.innerHTML =
      '<p class="quiz__eyebrow">Test rápido · 5 preguntas · 1 minuto</p>' +
      "<h1>Descubre el mejor primer paso para que tu peque deje el chupón</h1>" +
      '<p class="quiz__lead">Responde unas preguntas rápidas y te decimos por dónde empezar, según cómo es tu peque hoy.</p>' +
      '<button class="btn btn--big btn--full" id="start">Empezar el test</button>';
    document.getElementById("start").addEventListener("click", function () {
      fbqSafe("trackCustom", "QuizStart");
      state.i = 0; render();
    });
  }

  function renderQuestion(idx) {
    var qq = questions[idx];
    var html = "<h2>" + esc(qq.q) + '</h2><div class="opts">';
    qq.opts.forEach(function (o, k) {
      html += '<button class="opt" data-v="' + esc(o.v) + '"><span class="opt__k">' + String.fromCharCode(65 + k) + "</span><span>" + esc(o.t) + "</span></button>";
    });
    html += "</div>";
    if (idx > 0) html += '<button class="quiz__back" id="back">← Atrás</button>';
    app.innerHTML = html;
    app.querySelectorAll(".opt").forEach(function (b) {
      b.addEventListener("click", function () { state.a[qq.id] = b.getAttribute("data-v"); state.i++; render(); });
    });
    var back = document.getElementById("back");
    if (back) back.addEventListener("click", function () { state.i--; render(); });
  }

  function renderLoader() {
    prog.hidden = true;
    app.innerHTML = '<div class="loader"><div class="loader__spin"></div><p>Armando tu plan personalizado…</p></div>';
    setTimeout(function () { state.i = questions.length + 1; render(); }, 1600);
  }

  function resultData(a) {
    var edadTxt = { "2": "a los 2 años", "3": "a los 3 años", "4": "a los 4 años", "5": "con más de 4 años" }[a.edad] || "";
    var usoTxt = (a.cuando === "dormir") ? "usa el chupón sobre todo para dormir" : "lo usa también fuera de la hora de dormir";
    var inicio = (a.cuando === "dormir")
      ? "empezar directo por una rutina nueva para la noche"
      : "empezar por el día y bajar el uso poco a poco, antes de tocar la noche";
    var intentoTxt = (a.intento === "golpe" || a.intento === "trucos")
      ? "Ya lo intentaste, y es muy común que así tu peque lo vuelva a pedir: no es que hagas algo mal, es que todavía le falta otra forma de calmarse."
      : "Como todavía no lo has intentado, puedes hacerlo bien desde la primera vez, sin pasos en falso.";
    var retoTag = { noches: "Tu mayor reto: las noches", dientes: "Tu mayor reto: los dientes", guarderia: "Tu mayor reto: la guardería", peleas: "Tu mayor reto: las peleas de cada día" }[a.reto] || "Tu plan personalizado";
    var bullets = [
      "El paso a paso para el día, la siesta y la noche, para avanzar a su ritmo.",
      "Un Plan B para las noches difíciles: qué hacer si llora o lo pide de madrugada."
    ];
    if (a.reto === "dientes") bullets.push("Cuándo conviene consultar al odontopediatra, sin alarmarte.");
    else if (a.reto === "guarderia") bullets.push("Qué hacer si tienes poco tiempo y cómo ponerte de acuerdo con la guardería.");
    else if (a.reto === "peleas") bullets.push("Frases listas para usar y cómo evitar las peleas de cada día.");
    else bullets.push("Una rutina ilustrada para que tu peque entienda qué sigue antes de dormir.");
    if (a.dormir === "pecho") bullets.push("Qué hacer si se duerme con pecho o brazos: un cambio a la vez, sin dejar la lactancia.");
    var p1 = "Por lo que nos cuentas, " + edadTxt + " y como " + usoTxt + ", el mejor primer paso para ti es " + inicio + ".";
    return { tag: retoTag, p1: p1, p2: intentoTxt, bullets: bullets };
  }

  function renderResult() {
    fbqSafe("trackCustom", "QuizComplete", { reto: state.a.reto, edad: state.a.edad });
    var r = resultData(state.a);
    var lis = r.bullets.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("");
    var buyHref = hasCheckout ? withVisitParams(cfg.checkoutUrl.trim()) : "#";
    app.innerHTML =
      '<span class="result__tag">' + esc(r.tag) + "</span>" +
      "<h2>Tu plan para dejar el chupón, paso a paso</h2>" +
      '<p class="result__p">' + esc(r.p1) + "</p>" +
      '<p class="result__p">' + esc(r.p2) + "</p>" +
      '<p class="result__p"><strong>Adiós Chupón</strong> es la guía que te lleva justo por ese camino. Para tu caso incluye:</p>' +
      '<ul class="result__list">' + lis + "</ul>" +
      '<div class="offerbox">' +
        "<h3>Guía Adiós Chupón + 6 imprimibles</h3>" +
        '<p class="offerbox__price">$149 <span>MXN</span></p>' +
        '<p class="offerbox__terms">Pago único · IVA incluido · acceso inmediato</p>' +
        '<a class="btn btn--big btn--full" id="buy" href="' + esc(buyHref) + '" rel="noopener">Quiero mi guía ahora</a>' +
        '<p class="microtrust"><svg aria-hidden="true"><use href="#i-check"/></svg><span>Garantía de 7 días · pago seguro en Hotmart</span></p>' +
      "</div>" +
      '<a class="result__more" href="index.html">Ver todo lo que incluye la guía</a>';
    var buy = document.getElementById("buy");
    if (buy) {
      buy.addEventListener("click", function (e) {
        if (!hasCheckout) { e.preventDefault(); return; }
        buy.setAttribute("href", withVisitParams(cfg.checkoutUrl.trim()));
        fbqSafe("track", "InitiateCheckout", { value: 149, currency: "MXN" });
      });
    }
  }

  function render() {
    updateProgress();
    if (state.i < 0) renderIntro();
    else if (state.i < questions.length) renderQuestion(state.i);
    else if (state.i === questions.length) renderLoader();
    else renderResult();
  }

  render();
})();
