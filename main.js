(function () {
  "use strict";
  var cfg = window.ADIOS_CHUPON_CONFIG || {};
  var toastEl = document.querySelector(".toast");
  var toastTimer;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.hidden = true; }, 4200);
  }

  /* ---- Botones de compra ---- */
  var buyButtons = document.querySelectorAll("[data-buy]");
  var hasCheckout = typeof cfg.checkoutUrl === "string" && /^https:\/\//i.test(cfg.checkoutUrl.trim());

  buyButtons.forEach(function (btn) {
    if (hasCheckout) {
      btn.setAttribute("href", cfg.checkoutUrl.trim());
      btn.setAttribute("rel", "noopener");
    }
    btn.addEventListener("click", function (e) {
      if (!hasCheckout) {
        // Modo revisión: no hay checkout configurado todavía.
        e.preventDefault();
        var target = document.getElementById("comprar");
        if (target && !btn.closest("#comprar")) target.scrollIntoView({ behavior: "smooth" });
        toast("Modo revisión: el enlace de pago todavía no está configurado (js/config.js).");
        return;
      }
      // Evento para el Pixel de Meta, solo si el Pixel ya fue instalado en el <head>.
      if (typeof window.fbq === "function") {
        window.fbq("track", "InitiateCheckout", { value: 149, currency: "MXN" });
      }
    });
  });

  /* ---- Garantía (se oculta si no está configurada) ---- */
  document.querySelectorAll("[data-guarantee]").forEach(function (el) {
    if (!cfg.showGuarantee) el.remove();
  });
  document.querySelectorAll("[data-guarantee-days]").forEach(function (el) {
    if (cfg.guaranteeDays) el.textContent = String(cfg.guaranteeDays);
  });

  /* ---- Enlaces legales ---- */
  var legal = { "Aviso de privacidad": cfg.privacyUrl, "Términos y condiciones": cfg.termsUrl, "Contacto": cfg.contactUrl };
  document.querySelectorAll("[data-pending]").forEach(function (a) {
    var url = legal[a.getAttribute("data-pending")];
    if (url) {
      a.href = url;
      a.removeAttribute("data-pending");
    } else {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        toast("Pendiente: falta agregar el enlace de \"" + a.textContent + "\" en js/config.js.");
      });
    }
  });

  /* ---- Barra fija en celular ---- */
  var bar = document.querySelector(".stickybar");
  var hero = document.querySelector(".hero");
  var priceBox = document.getElementById("comprar");
  if (bar && "IntersectionObserver" in window && hero && priceBox) {
    var heroVisible = true, priceVisible = false;
    var update = function () {
      var show = !heroVisible && !priceVisible;
      bar.classList.toggle("is-visible", show);
      bar.setAttribute("aria-hidden", show ? "false" : "true");
      var link = bar.querySelector("a");
      if (link) link.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(function (ent) { heroVisible = ent[0].isIntersecting; update(); }, { threshold: 0.05 }).observe(hero);
    new IntersectionObserver(function (ent) { priceVisible = ent[0].isIntersecting; update(); }, { threshold: 0.05 }).observe(priceBox);
  }

  /* ---- Visor de páginas ---- */
  var lb = document.querySelector(".lightbox");
  var lbImg = lb && lb.querySelector("img");
  var lbCap = lb && lb.querySelector("figcaption");
  var lbClose = lb && lb.querySelector(".lightbox__close");
  var lastFocus = null;

  function openLb(src, cap) {
    if (!lb) return;
    lastFocus = document.activeElement;
    lbImg.src = src;
    lbImg.alt = cap;
    lbCap.textContent = cap;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }
  function closeLb() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  document.querySelectorAll(".shot__btn").forEach(function (b) {
    b.addEventListener("click", function () { openLb(b.getAttribute("data-full"), b.getAttribute("data-cap")); });
  });
  if (lb) {
    lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }
})();
