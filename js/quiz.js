(function () {
  "use strict";
  var cfg = window.ADIOS_CHUPON_CONFIG || {};
  var app = document.getElementById("app");
  var topbar = document.getElementById("topbar");
  var bar = document.getElementById("bar");
  var progtxt = document.getElementById("progtxt");
  var backBtn = document.getElementById("back");

  var state = { i: 0, a: {}, nombre: "", locked: false };

  /* ---------- helpers ---------- */
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
  function nom() { return state.nombre ? state.nombre : "tu peque"; }
  function edadTxt() { return { "2": "2 años", "3": "3 años", "4": "4 años", "5": "más de 4 años" }[state.a.edad] || "esta edad"; }

  /* ---------- analítica (panel de admin) ----------
     Envía eventos del embudo al Web App de Google Apps Script (cfg.analyticsUrl).
     Si no hay URL, solo guarda un registro local (localStorage) para la demo del panel.
     Mide: a qué pantalla llega cada visitante, cuánto tarda en cada una y si llega al final. */
  var AN = (typeof cfg.analyticsUrl === "string" && /^https:\/\//i.test(cfg.analyticsUrl.trim())) ? cfg.analyticsUrl.trim() : "";
  var AKEY = cfg.analyticsKey || "";
  var SID = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  var lastT = Date.now();
  var maxReached = -1;
  var prevScreen = "";
  function track(ev, extra) {
    var now = Date.now(), ms = now - lastT; lastT = now;
    var p = { sid: SID, ev: ev, ms: ms, ts: now, k: AKEY };
    if (extra) for (var key in extra) p[key] = extra[key];
    try { var L = JSON.parse(localStorage.getItem("ac_log") || "[]"); L.push(p); if (L.length > 800) L = L.slice(-800); localStorage.setItem("ac_log", JSON.stringify(L)); } catch (e) {}
    if (AN) { try {
      var body = JSON.stringify(p);
      if (navigator.sendBeacon) navigator.sendBeacon(AN, new Blob([body], { type: "text/plain;charset=UTF-8" }));
      else fetch(AN, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: body });
    } catch (e) {} }
  }
  function screenId(i) { var s = steps[i]; if (!s) return "?"; if (s.type === "choice") return s.id; if (s.type === "insight") return "insight_" + i; return s.type; }

  /* ---------- imágenes ---------- */
  var IMG = { hero: "img/quiz/hero.jpg", dia: "img/quiz/dia.jpg", vinculo: "img/quiz/vinculo.jpg", sueno: "img/quiz/sueno.jpg" };

  /* ---------- preguntas ---------- */
  function questions() {
    return {
      edad: { q: "¿Qué edad tiene " + nom() + "?", opts: [
        { t: "2 años", v: "2" }, { t: "3 años", v: "3" }, { t: "4 años", v: "4" }, { t: "Más de 4 años", v: "5" } ] },
      cuando: { q: "¿Cuándo usa más el chupón " + nom() + "?", opts: [
        { t: "Solo para dormir", v: "dormir" }, { t: "También en las siestas", v: "siesta" },
        { t: "También de día, a ratos", v: "dia" }, { t: "Casi todo el tiempo", v: "todo" } ] },
      intento: { q: "¿Qué pasa cuando intentas que duerma sin chupón?", opts: [
        { t: "Le cuesta mucho dormirse", v: "cuesta" }, { t: "Se despierta y lo pide de noche", v: "despierta" },
        { t: "Llora y lo pide", v: "llora" }, { t: "Todavía no lo he intentado", v: "noint" } ] },
      probado: { q: "¿Qué has intentado hasta ahora?", opts: [
        { t: "Quitárselo poco a poco", v: "gradual" }, { t: "Esconderlo o guardarlo", v: "esconder" },
        { t: "Explicarle que ya es momento", v: "explicar" }, { t: "Todavía no he intentado nada", v: "nada" } ] },
      preocupa: { q: "¿Qué es lo que más te preocupa?", opts: [
        { t: "Las noches y el llanto", v: "noches" }, { t: "Los dientes", v: "dientes" },
        { t: "Que ya va a la guardería", v: "guarderia" }, { t: "Las peleas de cada día", v: "peleas" } ] },
      meta: { q: "¿Qué te gustaría lograr primero?", opts: [
        { t: "Que no dependa del chupón para dormir", v: "nodep" }, { t: "Noches más tranquilas", v: "noches" },
        { t: "Bajar el uso de día, poco a poco", v: "dia" }, { t: "Una rutina más organizada", v: "rutina" } ] },
      formato: { q: "¿Cómo prefieres recibir tu guía?",
        sub: "Son tres formas de ver la misma guía. Elijas la que elijas, recibes el producto completo.", opts: [
        { t: "Guía paso a paso", d: "El método completo, en orden, de principio a fin.", v: "paso" },
        { t: "Plan para el día y la noche", d: "Enfocada en la rutina de día, siesta y noche.", v: "plan" },
        { t: "Con actividades e imprimibles", d: "La guía + los materiales listos para imprimir.", v: "imprimibles" } ] }
    };
  }

  /* ---------- pantallas de insight ---------- */
  function insightEdad() {
    return { img: IMG.dia, icon: "i-star", html:
      "<p>A los <strong>" + esc(edadTxt()) + "</strong>, dejar el chupón es de lo más común — y totalmente posible. 👶</p>" +
      "<p>A esta edad el chupón ya es sobre todo un <strong>hábito de consuelo</strong>, no una necesidad. Por eso el cambio funciona mejor <strong>paso a paso</strong>, dándole a " + esc(nom()) + " otra forma de calmarse.</p>" +
      "<p>Los odontopediatras suelen recomendar ir dejando el chupón a partir de los 2–3 años para cuidar la mordida y los dientes.</p>" };
  }
  function insightReassure() {
    return { img: IMG.vinculo, icon: "i-heart", html:
      "<p><strong>No es que estés haciendo algo mal.</strong> 💛</p>" +
      "<p>Cuando un peque vuelve a pedir el chupón, casi siempre es porque todavía no tiene <strong>otra forma de calmarse</strong> — no por falta de límites.</p>" +
      "<p>En cuanto " + esc(nom()) + " aprende a tranquilizarse de otra manera, el chupón deja de hacer falta.</p>" };
  }
  function insightPre() {
    return { icon: "i-wand", html:
      "<p>Ya casi, mamá. 🙌</p>" +
      "<p>Con lo que nos contaste, ya podemos decirte <strong>por dónde empezar</strong> con " + esc(nom()) + ", según su edad y su rutina de hoy.</p>" };
  }

  /* ---------- secuencia ---------- */
  var steps = [
    { type: "intro" },
    { type: "choice", id: "edad" },
    { type: "insight", data: insightEdad },
    { type: "choice", id: "cuando" },
    { type: "choice", id: "intento" },
    { type: "insight", data: insightReassure },
    { type: "choice", id: "probado" },
    { type: "choice", id: "preocupa" },
    { type: "choice", id: "meta" },
    { type: "choice", id: "formato" },
    { type: "insight", data: insightPre },
    { type: "loader" },
    { type: "result" }
  ];
  var countable = steps.map(function (s, i) { return (s.type === "choice" || s.type === "insight") ? i : -1; }).filter(function (i) { return i >= 0; });

  function updateTop() {
    var st = steps[state.i];
    var show = st && (st.type === "choice" || st.type === "insight");
    topbar.hidden = !show;
    if (!show) return;
    var k = countable.indexOf(state.i) + 1, n = countable.length;
    bar.style.width = Math.round(k / n * 100) + "%";
    progtxt.textContent = Math.round(k / n * 100) + "%";
  }

  /* ---------- renderers ---------- */
  function renderIntro() {
    app.innerHTML =
      '<div class="screen">' +
      '<img class="photo" src="' + IMG.hero + '" alt="Peque durmiendo con chupón mientras su mamá lo acompaña">' +
      "<h1>¿Tu peque solo se duerme con el chupón?</h1>" +
      '<p class="lead">Responde unas preguntas rápidas y te decimos el mejor primer paso para acompañarlo a dejarlo, según su edad y su rutina. Sin pedir teléfono ni correo.</p>' +
      '<div class="namewrap"><label for="nm">¿Cómo se llama tu peque? <span style="color:var(--soft);font-weight:600">(opcional)</span></label>' +
      '<input class="field" id="nm" type="text" autocomplete="off" maxlength="24" placeholder="Nombre de tu peque" value="' + esc(state.nombre) + '"></div>' +
      '<button class="btn btn--big btn--full btn--nav" id="go">Empezar el test</button>' +
      '<button class="skip" id="skip" type="button">Prefiero no decirlo</button>' +
      "</div>";
    var input = document.getElementById("nm");
    function start() {
      state.nombre = (input.value || "").trim().slice(0, 24);
      fbqSafe("trackCustom", "QuizStart");
      state.i++; render();
    }
    document.getElementById("go").addEventListener("click", start);
    document.getElementById("skip").addEventListener("click", function () { input.value = ""; state.nombre = ""; start(); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") start(); });
  }

  function renderChoice(st) {
    var qq = questions()[st.id];
    var html = '<div class="screen"><h2>' + esc(qq.q) + "</h2>";
    if (qq.sub) html += '<p class="lead" style="font-size:1rem;margin-top:0">' + esc(qq.sub) + "</p>";
    html += '<div class="pills">';
    qq.opts.forEach(function (o) {
      var sel = state.a[st.id] === o.v;
      var inner = esc(o.t) + (o.d ? "<small>" + esc(o.d) + "</small>" : "");
      html += '<button class="pill' + (sel ? " is-sel" : "") + '" data-v="' + esc(o.v) + '">' + inner + "</button>";
    });
    html += "</div></div>";
    app.innerHTML = html;
    app.querySelectorAll(".pill").forEach(function (b) {
      b.addEventListener("click", function () {
        if (state.locked) return;
        state.locked = true;
        app.querySelectorAll(".pill").forEach(function (x) { x.classList.remove("is-sel"); });
        b.classList.add("is-sel");
        var v = b.getAttribute("data-v");
        state.a[st.id] = v;
        fbqSafe("trackCustom", "QuizStep", { id: st.id });
        track("answer", { screen: st.id, val: v });
        setTimeout(function () { state.locked = false; state.i++; render(); }, 220);
      });
    });
  }

  function renderInsight(st) {
    var d = st.data();
    var photo = d.img ? '<img class="photo" src="' + d.img + '" alt="">' : "";
    app.innerHTML =
      '<div class="screen"><div class="insight">' + photo +
      '<div class="insight__row"><span class="insight__ico"><svg aria-hidden="true"><use href="#' + (d.icon || "i-star") + '"/></svg></span>' +
      '<div class="insight__tx">' + d.html + "</div></div></div>" +
      '<button class="btn btn--big btn--full btn--nav" id="go">Continuar</button></div>';
    document.getElementById("go").addEventListener("click", function () { state.i++; render(); });
  }

  function renderLoader() {
    app.innerHTML = '<div class="screen"><div class="loader"><div class="loader__spin"></div><p>Preparando el plan de ' + esc(nom()) + '…</p></div></div>';
    setTimeout(function () { state.i++; render(); }, 1600);
  }

  function resultData() {
    var a = state.a;
    var uso = { dormir: "usa el chupón sobre todo para dormir", siesta: "lo usa en las siestas y para dormir",
      dia: "lo usa también de día", todo: "lo usa casi todo el tiempo" }[a.cuando] || "usa el chupón";
    var inicio = { dormir: "empezar directo por una rutina nueva y clara para la noche",
      siesta: "empezar por las siestas y luego la noche", dia: "bajar primero el uso de día, poco a poco",
      todo: "ir por etapas: primero el día, luego la noche, sin prisas" }[a.cuando] || "empezar con un plan claro, un paso a la vez";
    var intento = { cuesta: "Como ahora le cuesta dormirse sin él, la guía trae un Plan B para esas noches, sin métodos bruscos.",
      despierta: "Como se despierta y lo pide de noche, la guía trae un Plan B para la madrugada, sin dejarlo llorar solo.",
      llora: "Como llora y lo pide, verás cómo acompañar ese momento y darle otra forma de calmarse, sin peleas.",
      noint: "Como todavía no lo has intentado, puedes empezar bien desde la primera vez, sin pasos en falso." }[a.intento] ||
      "La guía te acompaña paso a paso, sin métodos bruscos.";
    var tag = { noches: "Tu plan: noches más tranquilas", dientes: "Tu plan: cuidar los dientes",
      guarderia: "Tu plan: listo para la guardería", peleas: "Tu plan: menos peleas de cada día" }[a.preocupa] ||
      { nodep: "Tu plan: dormir sin depender del chupón", noches: "Tu plan: noches más tranquilas",
        dia: "Tu plan: bajar el uso de día", rutina: "Tu plan: una rutina más organizada" }[a.meta] || "Tu plan personalizado";
    var bullets = [
      "El paso a paso para el día, la siesta y la noche, para avanzar al ritmo de " + nom() + ".",
      "Un Plan B para las noches difíciles: qué hacer si llora o lo pide de madrugada." ];
    if (a.preocupa === "dientes") bullets.push("Cuándo conviene consultar al odontopediatra, sin alarmarte.");
    else if (a.preocupa === "guarderia") bullets.push("Qué hacer si tienes poco tiempo y cómo coordinarte con la guardería.");
    else if (a.preocupa === "peleas") bullets.push("Frases listas para usar y cómo evitar las peleas de cada día.");
    else bullets.push("Una rutina ilustrada para que " + nom() + " entienda qué sigue antes de dormir.");
    bullets.push("Materiales imprimibles incluidos para acompañar el proceso.");
    var p1 = (state.nombre ? "Para " + esc(state.nombre) : "Para tu peque") + ", con " + esc(edadTxt()) +
      " y como " + esc(uso) + ", el mejor primer paso es " + esc(inicio) + ".";
    return { tag: tag, p1: p1, p2: intento, bullets: bullets };
  }

  function renderResult() {
    fbqSafe("trackCustom", "QuizComplete", { preocupa: state.a.preocupa, meta: state.a.meta, edad: state.a.edad });
    var r = resultData();
    var buyHref = hasCheckout ? withVisitParams(cfg.checkoutUrl.trim()) : "#";
    var badge = function (t) { return '<span><svg aria-hidden="true"><use href="#i-check"/></svg>' + t + "</span>"; };
    app.innerHTML =
      '<div class="screen">' +
      '<img class="photo" src="' + IMG.sueno + '" alt="Peque durmiendo tranquilo">' +
      '<span class="result__tag" style="margin-top:16px">' + esc(r.tag) + "</span>" +
      "<h2>Ya sabemos por dónde empezar con " + esc(nom()) + "</h2>" +
      '<p class="result__p">' + esc(r.p1) + "</p>" +
      '<p class="result__p">' + esc(r.p2) + "</p>" +
      '<p class="result__p"><strong>Adiós Chupón</strong> es la guía digital en PDF que te lleva justo por ese camino, paso a paso — y te llega al instante.</p>' +
      '<div class="offerbox">' +
        "<h3>Esto es todo lo que incluye</h3>" +
        '<ul class="stack">' +
          "<li>La <strong>guía paso a paso</strong> para el día, la siesta y la noche</li>" +
          "<li>El <strong>Plan B</strong> para las noches difíciles y la madrugada</li>" +
          "<li><strong>Rutina ilustrada</strong> para imprimir y pegar en casa</li>" +
          "<li><strong>Tabla de logros</strong> con premios para motivar a " + esc(nom()) + "</li>" +
          "<li><strong>Cuento para dormir</strong> sobre dejar el chupón</li>" +
          "<li><strong>Carta y certificado</strong> “Adiós Chupón” para celebrar el logro</li>" +
        "</ul>" +
        '<p class="offerbox__price">$149 <span>MXN</span></p>' +
        '<p class="offerbox__terms">Un solo pago · IVA incluido · sin mensualidades</p>' +
        '<a class="btn btn--big btn--full btn--buy pulse" id="buy" href="' + esc(buyHref) + '" rel="noopener">QUIERO MI GUÍA POR $149 MXN</a>' +
        '<div class="offer__badges">' + badge("Garantía de 7 días") + badge("Pago seguro en Hotmart") + badge("Acceso inmediato") + "</div>" +
      "</div>" +
      "</div>";
    var buy = document.getElementById("buy");
    if (buy) buy.addEventListener("click", function (e) {
      track("checkout", { screen: "result" });
      if (!hasCheckout) { e.preventDefault(); return; }
      buy.setAttribute("href", withVisitParams(cfg.checkoutUrl.trim()));
      fbqSafe("track", "InitiateCheckout", { value: 149, currency: "MXN" });
    });
  }

  /* ---------- motor ---------- */
  function render() {
    updateTop();
    var st = steps[state.i];
    if (st.type === "intro") renderIntro();
    else if (st.type === "choice") renderChoice(st);
    else if (st.type === "insight") renderInsight(st);
    else if (st.type === "loader") renderLoader();
    else renderResult();
    if (state.i > maxReached) {
      var scr = screenId(state.i);
      track("view", { screen: scr, from: prevScreen, idx: state.i });
      prevScreen = scr; maxReached = state.i;
    }
    try { window.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) { window.scrollTo(0, 0); }
  }

  backBtn.addEventListener("click", function () {
    if (state.locked || state.i <= 0) return;
    state.i--;
    if (steps[state.i] && steps[state.i].type === "loader") state.i--;
    render();
  });

  render();
})();
