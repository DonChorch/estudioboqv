const CONFIG = {
  whatsappNumber: "5492215942574",
  emailRecipient: "administracion@boqv.com.ar",
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

const TRACKING_KEY = "boqv_tracking";
const TRACKING_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function readStoredTracking() {
  try {
    const raw = JSON.parse(localStorage.getItem(TRACKING_KEY) || "{}");
    if (!raw.savedAt || Date.now() - raw.savedAt > TRACKING_TTL_MS) return {};
    return raw.params || {};
  } catch (error) {
    return {};
  }
}

const query = new URLSearchParams(window.location.search);
const storedParams = readStoredTracking();
const landingMeta = {
  page_location: window.location.href,
  page_path: window.location.pathname,
  page_referrer: document.referrer,
};

trackedParams.forEach((param) => {
  const value = query.get(param) || storedParams[param] || "";
  if (value) storedParams[param] = value;
});

try {
  localStorage.setItem(
    TRACKING_KEY,
    JSON.stringify({ savedAt: Date.now(), params: storedParams })
  );
} catch (error) {
  /* almacenamiento no disponible (modo privado): se sigue sin persistencia */
}

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
    ["Servicio", data.servicio],
    ["Descripcion", data.descripcion],
    ["ART - En blanco", data.art_en_blanco],
    ["ART - Atencion", data.art_atencion],
    ["ART - Alta", data.art_alta],
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
const artFields = document.getElementById("artFields");
const descriptionField = form?.querySelector('textarea[name="descripcion"]');
const phoneField = form?.querySelector('input[name="telefono"]');
const nameField = form?.querySelector('input[name="nombre"]');

phoneField?.addEventListener("input", () => {
  phoneField.value = phoneField.value.replace(/\D/g, "");
});

nameField?.addEventListener("input", () => {
  nameField.value = nameField.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü' -]/g, "");
});

const DEFAULT_DESCRIPTION_PLACEHOLDER = "Ej.: qué ocurrió, cuándo, y qué documentación tenés disponible.";
const descriptionPlaceholders = {
  "Derecho Comercial": "Ej.: tipo de contrato u operación, con quién, y qué problema o duda tenés.",
  "Derecho Laboral y ART": "Ej.: qué ocurrió, cuándo, si ya hubo intimaciones, alta médica o documentación disponible.",
  "Derecho Administrativo": "Ej.: qué trámite o reclamo es, ante qué organismo, y si recibiste alguna notificación o intimación.",
  "Derecho de Daños": "Ej.: qué pasó, cuándo, si hay testigos, denuncia o documentación del hecho.",
  Sucesiones: "Ej.: vínculo con la persona fallecida, si hay testamento, y en qué estado está el trámite.",
  "Asesoramiento Empresarial": "Ej.: qué necesita tu empresa (contratos, sociedad, conflicto) y contexto general.",
};

function syncServiceFields() {
  const value = serviceSelect?.value || "";

  if (artFields) artFields.hidden = value !== "Derecho Laboral y ART";
  if (descriptionField) {
    descriptionField.placeholder = descriptionPlaceholders[value] || DEFAULT_DESCRIPTION_PLACEHOLDER;
  }
}

serviceSelect?.addEventListener("change", syncServiceFields);

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

document.querySelectorAll(".service-card__toggle").forEach((toggle) => {
  const panel = document.getElementById(toggle.getAttribute("aria-controls"));

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    if (panel) panel.hidden = expanded;

    pushLeadEvent("service_card_toggle", {
      service: toggle.querySelector("h3")?.textContent.trim() || "",
      expanded: !expanded,
    });
  });
});

document.querySelectorAll(".service-card__cta[data-service]").forEach((cta) => {
  cta.addEventListener("click", (event) => {
    event.preventDefault();
    goToFormWithService(cta.dataset.service);
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
    }

    pushLeadEvent("lead_form_success", {
      service: data.servicio || "",
      delivery: CONFIG.formEndpoint ? "endpoint" : "mailto",
    });

    if (CONFIG.emailRecipient && !CONFIG.formEndpoint) {
      window.location.href = buildMailtoUrl(data);
      window.setTimeout(() => {
        window.location.href = "gracias.html";
      }, 600);
    } else {
      window.location.href = "gracias.html";
    }
  } catch (error) {
    status.textContent = "No se pudo enviar. Probá nuevamente o contactá por WhatsApp.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar consulta";
  }
});

