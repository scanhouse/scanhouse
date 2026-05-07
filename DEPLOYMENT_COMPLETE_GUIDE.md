# SCANHOUSE MVP - DEPLOYMENT GUIDE
## PWA + Claude Vision API + Netlify Functions

---

## PARTE 0: PREPARACIÓN (5 minutos)

### 0.1 Obtener Claude API Key
1. Ve a https://console.anthropic.com
2. Click "API Keys" en la sidebar
3. Click "Create Key"
4. **Copia la clave** (empieza con `sk-ant-`)
5. **Guárdala en un sitio seguro** - la necesitarás en paso 2.3

### 0.2 Crear cuenta Netlify
1. Ve a https://app.netlify.com
2. Signup con GitHub o email
3. Listo

---

## PARTE 1: ESTRUCTURA DE CARPETAS

Crea esta estructura en tu PC:

```
scanhouse-pwa/
├── netlify/
│   └── functions/
│       └── analyze.js          ← Función Claude Vision
├── index.html                   ← PWA (renombrado desde HTML)
├── manifest.json                ← PWA metadata
├── sw.js                        ← Service Worker
└── .gitignore                   ← (crear)
```

---

## PARTE 2: CONFIGURACIÓN LOCAL

### 2.1 Copiar archivos
1. **Descarga los 3 archivos de arriba**
2. Renombra `scanhouse_pwa_with_claude_vision.html` → `index.html`
3. Copia `netlify_function_analyze.js` → `netlify/functions/analyze.js`
4. Copia `manifest.json` → raíz
5. Copia `sw.js` → raíz

### 2.2 Crear `.gitignore`
```
node_modules/
.env
.env.local
dist/
```

### 2.3 Crear `.env` (para desarrollo local)
```
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxx
```
**IMPORTANTE:** Este archivo es LOCAL. En Netlify lo configurarás en dashboard.

### 2.4 Instalar dependencias
Si quieres testear localmente:

```bash
cd scanhouse-pwa
npm init -y
npm install --save-dev netlify-cli
npm install @anthropic-ai/sdk
```

---

## PARTE 3: GITHUB

### 3.1 Crear repositorio
1. Ve a https://github.com/new
2. Nombre: `scanhouse-pwa-v7-mvp`
3. Descripción: "ScanHouse MVP - PWA + Claude Vision"
4. Público
5. Click "Create repository"

### 3.2 Push a GitHub
```bash
git init
git add .
git commit -m "Initial commit: ScanHouse MVP with Claude Vision"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/scanhouse-pwa-v7-mvp.git
git push -u origin main
```

---

## PARTE 4: NETLIFY DEPLOYMENT

### 4.1 Conectar GitHub a Netlify
1. Ve a https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Elige **GitHub**
4. Autoriza Netlify en GitHub
5. Selecciona el repo `scanhouse-pwa-v7-mvp`

### 4.2 Configurar build
En la pantalla de configuración:

```
Build command:     (dejar vacío)
Publish directory: .
Functions directory: netlify/functions
```

Click **Deploy site**

### 4.3 Esperar deploy (2-3 minutos)

Verás:
```
✓ Site deployed successfully
Your site is now live at: https://[random-name].netlify.app
```

### 4.4 Configurar variables de entorno
1. Ve a **Site settings** → **Environment variables**
2. Click **Add a variable** (o Edit variables)
3. Añade:
   ```
   CLAUDE_API_KEY = sk-ant-xxxxxxx
   ```
4. Click **Save**
5. **Netlify redeploy automático** en 1 minuto

---

## PARTE 5: TESTEAR

### 5.1 Acceder a la app
1. Ve a `https://[tu-site].netlify.app`
2. Debería cargar la PWA

### 5.2 Testear análisis
1. Click **"Comenzar análisis"**
2. **Sube 1-3 fotos de una vivienda** (interior, escritorio, pared, etc.)
3. Escribe dirección: **"Calle Gran Vía 28, Madrid"**
4. Click **"Analizar gratis"**

### 5.3 Verificar que funciona
Debería:
- ✅ Ver spinner de carga (3-8 segundos)
- ✅ Recibir análisis con hallazgos reales
- ✅ Ver score (0-10) basado en hallazgos
- ✅ Ver costes estimados en euros

### 5.4 Si hay error
1. Abre **Chrome DevTools** (F12)
2. Pestaña **Console**
3. Busca errores
4. Comunes:
   - `403 Unauthorized`: Claude API Key incorrecta
   - `404 not found /.netlify/functions/analyze`: Función no deployada
   - `CORS error`: Problema en la función

---

## PARTE 6: OPTIMIZACIONES

### 6.1 Mejorar visibilidad de errores
En `index.html`, búsqueda y reemplaza:
```javascript
// Línea 390 aprox
const result = await response.json();
console.log('Analysis result:', result);  // Añade esto para debug
```

### 6.2 Cachear resultados
Añade en `sw.js`:
```javascript
// Cachear respuestas de API analysis
if (event.request.url.includes('analyze')) {
  event.respondWith(
    caches.open('api-cache-v1').then(cache => {
      return fetch(event.request).then(response => {
        cache.put(event.request, response.clone());
        return response;
      });
    })
  );
}
```

### 6.3 Agregar soporte para drag-drop de fotos
En `index.html`, busca `upload-area` y añade:
```javascript
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.style.borderColor = 'var(--teal)';
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.style.borderColor = 'var(--teal)';
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files;
  photos = Array.from(files);
  renderPhotos();
});
```

---

## PARTE 7: MONITOREO

### 7.1 Ver logs en Netlify
1. Ve a tu site en Netlify
2. Click **"Functions"** (o **"Deploys"** → últimas)
3. Ver logs de llamadas a la función

### 7.2 Monitorear costos
Claude Vision API cuesta ~$0.003 USD por imagen pequeña.
- 1000 análisis de 3 fotos = ~$9
- Tu margen en €4,99 = €3,50 neto

Profitable desde día 1 si tienes ~3 usuarios/día.

### 7.3 Añadir analytics
En `index.html`, añade (después de </body>):
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXX');
</script>
```

Reemplaza `G-XXXXXX` con tu Google Analytics ID.

---

## PARTE 8: NEXT STEPS

Una vez en producción:

### Semana 1-2
- [ ] Testear con 20-50 usuarios reales
- [ ] Recolectar feedback (formulario en app)
- [ ] Medir: conversion, churn, CAC

### Semana 3-4
- [ ] Implementar Stripe para pagos reales
- [ ] Crear landing page mejor (Vimeo, testimonios)
- [ ] SEO basics (Google Search Console)

### Mes 2-3
- [ ] App iOS/Android nativa
- [ ] B2B outreach a agencias
- [ ] Mejorar motor IA con feedback real

---

## TROUBLESHOOTING

### "Cannot find module @anthropic-ai/sdk"
**Solución:**
```bash
npm install @anthropic-ai/sdk
git add package.json package-lock.json
git push
```

### "CORS error from /.netlify/functions/analyze"
**Solución:**
Comprueba que la función tiene headers CORS:
```javascript
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
```

### "403 Unauthorized" en Claude API
**Solución:**
1. Comprueba que CLAUDE_API_KEY está en variables de entorno de Netlify
2. Comprueba que la clave empieza con `sk-ant-`
3. Comprueba que tu cuenta Anthropic tiene crédito

### Fotos no se envían
**Solución:**
- Max 20 MB por foto
- Asegúrate que `photo-input` tiene `multiple` y `accept="image/*"`
- En DevTools Console, busca errores

---

## CHECKLIST FINAL

- [ ] Repo creado en GitHub
- [ ] Netlify conectado a GitHub
- [ ] CLAUDE_API_KEY añadida en env variables de Netlify
- [ ] Deploy exitoso (sin errores en logs)
- [ ] App carga sin errores
- [ ] Sube fotos correctamente
- [ ] Análisis devuelve hallazgos reales
- [ ] Costes aparecen correctamente

---

## CONTACT & SUPPORT

Si hay problemas:
1. Mira **DevTools → Console** para errores
2. Mira **Netlify Functions logs** para errores de servidor
3. Comprueba **CLAUDE_API_KEY está correcta**
4. Reinicia Netlify deploy (botón en dashboard)

---

**¡Listo para ir a producción!** 🚀

