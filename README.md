# Landing BOQV

Landing estática para pauta de Google Ads Search, basada en los lineamientos del PDF y la identidad visual del Instagram de BOQV.

## Antes de publicar

1. `CONFIG.whatsappNumber` ya usa `5492215942574`.
2. `CONFIG.emailRecipient` ya usa `info@boqv.com.ar`; si se completa `CONFIG.formEndpoint`, el formulario enviará por backend en lugar de abrir email.
3. Reemplazar `GTM-XXXXXXX` en `index.html` por el ID real de Google Tag Manager y descomentar los bloques.
4. Completar la URL final del sitio en los metadatos `og:url`, canonical y JSON-LD cuando exista dominio definitivo.
5. Reemplazar el texto de política de privacidad del footer por un enlace real.
6. Probar la URL final con parámetros `utm_*`, `gclid`, `gbraid`, `wbraid`, `msclkid` y `fbclid` antes de lanzar campaña.

## Archivos principales

- `index.html`: estructura y contenido de la landing.
- `styles.css`: identidad visual y responsive.
- `script.js`: preservación de UTMs, IDs de clic publicitario, eventos para `dataLayer` y envío de formulario.
- Las cards de servicios llevan al formulario con el servicio preseleccionado y registran `service_card_click` en `dataLayer`.
- `assets/Alvaro Ortiz Quesada.jpg`, `assets/juan cruz berridi.jpg` y `assets/maximiliano vaccari.jpg`: fotos de integrantes del estudio usadas en la sección institucional.
