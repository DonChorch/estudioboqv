# Landing BOQV

Landing estática para pauta de Google Ads Search, basada en los lineamientos del PDF y la identidad visual del Instagram de BOQV.

## Antes de publicar / lanzar campañas

1. `CONFIG.whatsappNumber` ya usa `5492215942574`.
2. `CONFIG.emailRecipient` ya usa `administracion@boqv.com.ar`. **Recomendado:** completar `CONFIG.formEndpoint` con un endpoint real (Formspree, Getform, Apps Script o backend propio) — el fallback `mailto:` pierde leads en dispositivos sin app de correo configurada.
3. Reemplazar `GTM-XXXXXXX` en `index.html` por el ID real de Google Tag Manager y descomentar el bloque (script + noscript).
4. Reemplazar `META_PIXEL_ID` en `index.html` por el ID real del Meta Pixel y descomentar el bloque.
5. En GTM, mapear los eventos del `dataLayer` a conversiones: `lead_form_success` (conversión principal), `whatsapp_click` (conversión secundaria), `lead_form_submit` (intento), `service_card_click` y `section_view` (micro-eventos).
6. La URL base usada en canonical, `og:url`, sitemap y JSON-LD es `https://boqv.com.ar/`. Si el dominio final cambia, buscar y reemplazar en `index.html`, `privacidad.html`, `robots.txt` y `sitemap.xml`.
7. Revisar el texto de `privacidad.html` (borrador según Ley 25.326) con el criterio del estudio.
8. Probar la URL final con parámetros `utm_*`, `gclid`, `gbraid`, `wbraid`, `msclkid` y `fbclid` antes de lanzar campaña (se persisten 30 días en `localStorage` y se adjuntan al lead).
9. Validar el compartido social con el Sharing Debugger de Meta y los datos estructurados con la prueba de resultados enriquecidos de Google.

## Archivos principales

- `index.html`: estructura y contenido de la landing.
- `privacidad.html`: política de privacidad (requisito de Google Ads y Meta para formularios de leads).
- `styles.css`: identidad visual y responsive.
- `script.js`: preservación de UTMs e IDs de clic publicitario (30 días), eventos para `dataLayer` y envío de formulario.
- `robots.txt` y `sitemap.xml`: indexación.
- Las cards de servicios llevan al formulario con el servicio preseleccionado y registran `service_card_click` en `dataLayer`.
- `assets/`: imágenes optimizadas (fotos del equipo ~60 KB c/u, `hero.jpg`, `og-image.jpg` 1200×630 para redes, `favicon.svg`).
