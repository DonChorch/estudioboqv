/* Capa de movimiento. No toca el tracking ni el envío del formulario (eso vive en script.js).
   Entradas ligadas al scroll: cada pieza avanza con el desplazamiento, entra desde un costado
   o desde abajo y se deshace al volver. Sin librerías. Sin JavaScript todo queda visible. */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = () => window.matchMedia("(max-width: 720px)").matches;

  /* ── Encabezado fijo: al bajar pasa de claro a verde oscuro sólido ── */
  const header = document.querySelector(".site-header");
  if (header) {
    const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  /* ── Barra móvil: se aparta al bajar leyendo y vuelve al subir ── */
  const bar = document.querySelector(".mobile-bar");
  if (bar) {
    let lastY = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        const away = y > 480 && y > lastY + 4;
        if (away || y < lastY - 4 || y <= 480) bar.classList.toggle("is-away", away);
        lastY = y;
      },
      { passive: true }
    );
  }

  if (reduced) return;

  /* ── Qué se mueve y cómo: izquierda, derecha o desde abajo ── */
  const plan = [
    [".areas h2", "left"],
    [".area:nth-child(odd)", "left"],
    [".area:nth-child(even)", "right"],
    [".studio__lead", "left"],
    [".studio__more", "up"],
    [".trio__item:nth-child(1)", "left"],
    [".trio__item:nth-child(2)", "up"],
    [".trio__item:nth-child(3)", "right"],
    [".flow__text h2", "left"],
    [".flow__text p", "right"],
    [".flow__steps li:nth-child(1)", "left"],
    [".flow__steps li:nth-child(2)", "up"],
    [".flow__steps li:nth-child(3)", "right"],
    [".contact__intro", "left"],
    [".lead-form", "right"],
    [".qa", "left"],
    [".area p", "up"],
    [".qa p", "up"],
    [".contact__note", "up"],
    [".contact__direct", "up"],
    [".flow__steps p", "up"],
  ];

  const items = [];
  plan.forEach(([selector, dir]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (el.__fx) return;
      el.__fx = true;
      items.push({ el, dir, y: 0, p: -1, top: 0 });
    });
  });
  if (!items.length) return;

  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2); // power1.inOut
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const parallax = document.querySelector(".hero__photo");
  const heroBox = document.querySelector(".hero__media");

  let vh = window.innerHeight;
  let docH = document.documentElement.scrollHeight;

  function measure() {
    vh = window.innerHeight;
    docH = document.documentElement.scrollHeight;
    const maxScroll = Math.max(0, docH - vh);
    items.forEach((it) => {
      // posición real en la página, sin el desplazamiento que le damos nosotros
      it.top = it.el.getBoundingClientRect().top + window.scrollY - it.y;
      // si el final de la página no deja subirlo hasta el 62 %, que igual llegue a su sitio
      it.minTop = it.top - maxScroll;
    });
  }

  function apply() {
    const sy = window.scrollY;
    const startLine = vh * 0.93;
    const sm = small();
    const dx = sm ? 36 : 100;
    const dy = sm ? 36 : 50;
    items.forEach((it) => {
      if (it.done) return;
      const top = it.top - sy;
      const end = Math.max(vh * 0.62, it.minTop);
      const range = Math.max(startLine - end, 80);
      const p = ease(clamp((startLine - top) / range));
      if (p >= 0.999) {
        // ya llegó a su lugar: queda fijo y no vuelve a desvanecerse
        it.done = true;
        it.y = 0;
        it.el.style.translate = "";
        it.el.style.opacity = "";
        return;
      }
      if (Math.abs(p - it.p) < 0.002) return;
      it.p = p;
      const k = 1 - p;
      const x = it.dir === "left" ? -dx * k : it.dir === "right" ? dx * k : 0;
      const y = it.dir === "up" ? dy * k : 0;
      it.y = y;
      it.el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      it.el.style.opacity = p.toFixed(3);
    });
    if (parallax && heroBox) {
      const r = heroBox.getBoundingClientRect();
      if (r.bottom > 0) parallax.style.setProperty("--py", `${Math.min(48, Math.max(0, sy * 0.12)).toFixed(1)}px`);
    }
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      apply();
    });
  };

  root.classList.add("js");
  measure();
  apply();
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => { measure(); apply(); });
  window.addEventListener("load", () => { measure(); apply(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); apply(); });
  // si cambia el alto de la página (formulario, campos ART), se vuelve a medir
  if ("ResizeObserver" in window) new ResizeObserver(() => { measure(); apply(); }).observe(document.body);

  window.addEventListener("beforeprint", () => {
    items.forEach((it) => { it.el.style.translate = "none"; it.el.style.opacity = "1"; });
  });
})();
