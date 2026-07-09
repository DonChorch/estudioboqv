const CONFIG = {
  whatsappNumber: "5492215942574",
  emailRecipient: "info@boqv.com.ar",
  formEndpoint: "",
  defaultMessage:
    "Hola BOQV, quiero hacer una consulta legal. Vengo desde la landing.",
};

const trackedParams = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "gbraid",
  "wbraid",
  "msclkid",
  "fbclid",
];

window.dataLayer = window.dataLayer || [];

const query = new URLSearchParams(window.location.search);
const storedParams = JSON.parse(sessionStorage.getItem("boqv_tracking") || "{}");
const landingMeta = {
  page_location: window.location.href,
  page_path: window.location.pathname,
  page_referrer: document.referrer,
};

trackedParams.forEach((param) => {
  const value = query.get(param) || storedParams[param] || "";
  if (value) storedParams[param] = value;
});

sessionStorage.setItem("boqv_tracking", JSON.stringify(storedParams));

document.querySelectorAll("[data-param]").forEach((input) => {
  input.value = storedParams[input.dataset.param] || "";
});

function pushLeadEvent(eventName, detail = {}) {
  window.dataLayer.push({
    event: eventName,
    ...landingMeta,
    ...storedParams,
    ...detail,
  });
}

pushLeadEvent("landing_page_view");

function buildWhatsappUrl() {
  const text = encodeURIComponent(CONFIG.defaultMessage);
  return `https://wa.me/${CONFIG.whatsappNumber}?text=${text}`;
}

function buildMailtoUrl(data) {
  const subject = encodeURIComponent(`Consulta desde landing BOQV - ${data.servicio || "Sin servicio"}`);
  const rows = [
    ["Nombre y apellido", data.nombre],
    ["Telefono / WhatsApp", data.telefono],
    ["Email", data.email],
    ["Localidad", data.localidad],
    ["Servicio", data.servicio],
    ["Descripcion", data.descripcion],
    ["ART - En blanco", data.art_en_blanco],
    ["ART - Atencion", data.art_atencion],
    ["ART - Alta", data.art_alta],
    ["ART - Lesion", data.art_lesion],
    ["UTM source", data.utm_source],
    ["UTM medium", data.utm_medium],
    ["UTM campaign", data.utm_campaign],
    ["UTM content", data.utm_content],
    ["UTM term", data.utm_term],
    ["gclid", data.gclid],
    ["gbraid", data.gbraid],
    ["wbraid", data.wbraid],
    ["msclkid", data.msclkid],
    ["fbclid", data.fbclid],
    ["Landing", landingMeta.page_location],
    ["Referrer", landingMeta.page_referrer],
  ];
  const body = encodeURIComponent(
    rows
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n")
  );

  return `mailto:${CONFIG.emailRecipient}?subject=${subject}&body=${body}`;
}

document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
  if (CONFIG.whatsappNumber) {
    link.href = buildWhatsappUrl();
    link.target = "_blank";
    link.rel = "noopener";
  }

  link.addEventListener("click", () => {
    pushLeadEvent("whatsapp_click", {
      placement: link.closest(".mobile-bar") ? "mobile_bar" : "page",
      link_text: link.textContent.trim(),
    });
  });
});

document.querySelectorAll('a[href="#consulta"]').forEach((link) => {
  link.addEventListener("click", () => {
    pushLeadEvent("consult_cta_click", {
      placement: link.closest(".conversion-strip")
        ? "conversion_strip"
        : link.closest(".hero")
          ? "hero"
          : link.closest(".mobile-bar")
            ? "mobile_bar"
            : "page",
      link_text: link.textContent.trim(),
    });
  });
});

const observedSections = new Set();
const sectionObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || observedSections.has(entry.target.id)) return;
        observedSections.add(entry.target.id);
        pushLeadEvent("section_view", { section_id: entry.target.id });
      });
    }, { threshold: 0.45 })
  : null;

document.querySelectorAll("main section[id]").forEach((section) => {
  sectionObserver?.observe(section);
});

const form = document.querySelector("#leadForm");
const status = document.querySelector("#formStatus");
const serviceSelect = form?.querySelector('select[name="servicio"]');

function goToFormWithService(service) {
  if (serviceSelect && service) {
    serviceSelect.value = service;
    serviceSelect.dispatchEvent(new Event("change", { bubbles: true }));
  }

  pushLeadEvent("service_card_click", {
    service,
  });

  document.querySelector("#consulta")?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", "#consulta");

  window.setTimeout(() => {
    const firstEmpty = form?.querySelector("input[name='nombre']");
    firstEmpty?.focus({ preventScroll: true });
  }, 450);
}

document.querySelectorAll("[data-service]").forEach((card) => {
  card.addEventListener("click", () => {
    goToFormWithService(card.dataset.service);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    goToFormWithService(card.dataset.service);
  });
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector("button[type='submit']");
  const data = Object.fromEntries(new FormData(form).entries());

  pushLeadEvent("lead_form_submit", {
    service: data.servicio || "",
  });

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";

  try {
    if (CONFIG.formEndpoint) {
      const response = await fetch(CONFIG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("No se pudo enviar la consulta.");
    } else if (CONFIG.emailRecipient) {
      window.location.href = buildMailtoUrl(data);
    }

    status.textContent = CONFIG.formEndpoint ? "Consulta recibida. BOQV se pondrá en contacto para coordinar una primera revisión." : "Se abrió un correo dirigido a BOQV con los datos de tu consulta.";
    form.reset();
    document.querySelectorAll("[data-param]").forEach((input) => {
      input.value = storedParams[input.dataset.param] || "";
    });
  } catch (error) {
    status.textContent = "No se pudo enviar. Probá nuevamente o contactá por WhatsApp.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar consulta";
  }
});

