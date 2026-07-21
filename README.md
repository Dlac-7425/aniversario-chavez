# Aniversario — Daniela

Una pequeña página web para celebrar un aniversario. Estática, sin base de datos, mobile-first, con paleta lila claro y animaciones sutiles.

## Estructura

```
aniversario-rosa/
├── index.html      # Estructura principal
├── styles.css      # Paleta lila + responsive + animaciones
├── script.js       # Reveal on scroll (vanilla JS, sin deps)
├── netlify.toml    # Config para desplegar en Netlify
└── README.md
```

## Cómo publicar en Netlify

Tenés 3 caminos. Andá con el que más te guste.

### Opción 1 — Drag & drop (la más rápida, 30 segundos)

1. Entrá a https://app.netlify.com/drop
2. Arrastrá toda esta carpeta (`aniversario-rosa/`) a la página
3. Te da una URL pública al instante

### Opción 2 — Desde GitHub (recomendada, futuras ediciones)

1. Creá un repo en GitHub y subí los archivos
2. En Netlify: **Add new site → Import existing project**
3. Conectá el repo. **Build command** dejalo vacío. **Publish directory** poné `.` (o el nombre de la carpeta si lo subís dentro de un monorepo).
4. Cada `git push` redespliega automáticamente.

Si lo querés rápido desde la terminal:

```bash
cd ~/aniversario-rosa
git init
git add .
git commit -m "feat: sitio aniversario rosa"
# crear repo en github y subir
```

### Opción 3 — Netlify CLI

```bash
npm install -g netlify-cli
cd ~/aniversario-rosa
netlify deploy --prod
```

## Personalización rápida

| Qué querés cambiar              | Dónde tocar                                              |
| ------------------------------- | -------------------------------------------------------- |
| Mensaje del hero                | `index.html` → `<p class="hero-message">`                 |
| Imagen del hero                 | `index.html` → `src` del `<img class="hero-image">`       |
| Imágenes de las 3 cards        | `index.html` → `<img>` dentro de cada `.moment-card`      |
| Imágenes de la galería         | `index.html` → `<img>` dentro de `.gallery-grid`          |
| Texto de la carta               | `index.html` → `<p>` dentro de `.letter-quote`            |
| Colores                         | `styles.css` → variables en `:root`                       |
| Tipografías                     | `index.html` → link de Google Fonts en `<head>`           |

### Cómo reemplazar las imágenes

Las imágenes actuales son placeholders:

- Hero: 1 foto de Unsplash (flores lilas) — reemplazala cuando quieras
- Cards y galería: `https://picsum.photos/seed/rosa-X/W/H` — reemplazá el `src` por tu foto

**Imágenes locales (recomendado para que tu sitio cargue instantáneo):**

1. Creá una carpeta `images/` adentro de esta carpeta
2. Poné tus fotos ahí (nombres simples: `hero.jpg`, `cap1.jpg`, `g1.jpg`, etc.)
3. Cambiá los `src` en `index.html`:
   - De `https://picsum.photos/seed/rosa-g1/600/800` a `images/g1.jpg`

Eso evita depender de internet en el celular del usuario al abrir la página.

## Detalles técnicos

- HTML5 semántico, mobile-first
- CSS custom properties para la paleta (lila del 50 al 900)
- Tipografías: **Cormorant Garamond** (serif elegante para títulos) + **Inter** (sans limpia para cuerpo)
- Animaciones sutiles con CSS nativo + IntersectionObserver
- Sin frameworks ni librerías externas (sólo Google Fonts vía CDN)
- Respeta `prefers-reduced-motion` (las animaciones se desactivan para usuarios con esa preferencia)
- Lazy loading nativo en todas las imágenes excepto la del hero
- Cache headers configurados en `netlify.toml` para `styles.css` y `script.js`

## Vista previa local

Si querés ver la página antes de subirla, basta con abrir `index.html` en el navegador. Pero si querés probar con URLs reales (recomendado), usá un servidor estático:

```bash
cd ~/aniversario-rosa
python3 -m http.server 8080
# Abrí http://localhost:8080 en tu navegador
```

Hecho con cariño. ♥
