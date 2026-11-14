# Block & Bloom · Web

HTML semántico + CSS + módulos ES, sin compilación ni dependencias. Inicio: `python3 -m http.server 8080`, abrir http://localhost:8080. No abrir con file://: los módulos necesitan HTTP.

Personalizá el nombre, Sobre mí y los tres conceptos de muestra en index.html. No son trabajos reales. Reemplazá cada div.sample por un `<img src="./assets/aldea.webp" alt="Descripción de tu construcción" width="800" height="600" loading="lazy">` y añadí `.card img {width:100%;height:225px;object-fit:cover;display:block}` al CSS. Agregá tu enlace de invitación al servidor junto al formulario. Escribí tu aviso de privacidad con identidad/contacto del responsable y plazo de conservación antes de recopilar datos.

En assets/config.js configurá API_URL, por ejemplo https://api.tudominio.com (sin barra final). No hay secretos en la web. El servidor tiene que configurar WEB_ORIGIN con el origen real, sin ruta. Para una web en https://usuario.github.io/minecraft-web/ el origen es https://usuario.github.io.

## Publicación

Para producción comercial: cloná este repositorio como minecraft-web al lado de minecraft-bot. El Caddyfile del bot sirve ambos sitios por HTTPS. No necesitás compilar.

Para una demostración compatible con las reglas de GitHub Pages: Settings → Pages → Source → GitHub Actions, y ejecutar manualmente Publish static demo. La configuración de ejemplo mantiene el envío deshabilitado. El workflow no se ejecuta con cada push.

GitHub Pages restringe sitios orientados a facilitar transacciones comerciales: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits . Usá otro hosting para el formulario del negocio. Las rutas de assets son relativas y compatibles con /nombre-repo/.

## Animaciones

La interfaz usa transform para hover con rebote, float para elementos decorativos, sombras y bordes redondeados. Se respeta prefers-reduced-motion. Para una futura web con múltiples rutas y panel de cliente, migrar a React + Vite y Motion; no es necesario para esta página.

## Envío

assets/app.js contiene el fetch completo: validación nativa, estado de envío, timeout, gestión de error y clave de idempotencia. Se genera un código aleatorio de vinculación y se muestra solo al remitente; guardalo hasta usar /vincular dentro de Discord. El reintento conserva la clave mientras la página esté abierta y el formulario no se edite. Recargar puede generar otra solicitud.

La respuesta 202 indica que el pedido quedó guardado; el embed se procesa en segundo plano. No significa que el creador ya aceptó ni que hubo una compra. No hay integración con la API de Fiverr: el usuario de Fiverr es texto no verificado.
