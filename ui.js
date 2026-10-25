/* Capa de interfaz: entradas al hacer scroll y la carátula del expediente.
   No toca el tracking ni el envío del formulario (eso vive en script.js). */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Carátula: el nombre y el área se reflejan mientras se completa el formulario ── */
  const form = document.getElementById("leadForm");
  const nameOut = document.querySelector("[data-caratula-name]");
  const matterOut = document.querySelector("[data-caratula-matter]");
  const matters = {
    "Derecho Comercial": "s/ consulta comercial",
    "Derecho Laboral y ART": "s/ reclamo laboral o accidente de trabajo",
    "Derecho Administrativo": "s/ reclamo administrativo",
    "Derecho de Daños": "s/ daños y perjuicios",
    Sucesiones: "s/ sucesión",
    "Asesoramiento Empresarial": "s/ asesoramiento empresarial",
    "Otro tema legal": "s/ consulta legal",
  };
  const FALLBACK_NAME = "Tu nombre";
  const FALLBACK_MATTER = "s/ consulta legal";

  function syncCaratula() {
    if (!form || !nameOut || !matterOut) return;
    const name = form.elements.nombre?.value.trim().replace(/\s+/g, " ") || "";
    const service = form.elements.servicio?.value || "";
    nameOut.textContent = name ? name.toUpperCase() : FALLBACK_NAME;
    nameOut.classList.toggle("is-empty", !name);
    matterOut.textContent = matters[service] || FALLBACK_MATTER;
  }

  form?.addEventListener("input", syncCaratula);
  form?.addEventListener("change", syncCaratula);
  syncCaratula();

  /* ── Entradas: título, texto y pieza de cada sección, escalonados ── */
  const groups = [
    [".hero__head > *", 0],
    [".folder", 0],
    [".front__action > *", 0],
    [".areas h2", 0],
    [".areas__aside > *", 0],
    [".area", 0],
    [".team h2", 0],
    [".team__lead", 0],
    [".tile", 0],
    [".process__text > *", 0],
    [".slip__stage", 0],
    [".slip__total", 0],
    [".coupon__intro > *", 0],
    [".lead-form", 0],
    [".faq h2", 0],
    [".faq__text p", 0],
    [".card-back > *", 0],
  ];

  const targets = [];
  groups.forEach(([selector]) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      if (el.hasAttribute("data-reveal")) return;
      el.setAttribute("data-reveal", "");
      el.style.setProperty("--d", `${Math.min(i, 6) * 70}ms`);
      targets.push(el);
    });
  });

  if (reduced || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }

  root.classList.add("js");

  const show = (el) => {
    el.classList.add("is-in");
    if (el.classList.contains("folder")) {
      window.setTimeout(() => el.classList.add("is-settled"), 900);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );

  targets.forEach((el) => observer.observe(el));

  /* Si algo impide observar (pestaña en segundo plano, impresión), nada queda oculto. */
  window.setTimeout(() => {
    targets.forEach((el) => {
      if (!el.classList.contains("is-in") && el.getBoundingClientRect().top < window.innerHeight) show(el);
    });
  }, 1200);
  window.addEventListener("beforeprint", () => targets.forEach(show));
})();
