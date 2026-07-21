#!/usr/bin/env python3
"""
Genera index.html con las imágenes de /public/images/.
- Aspect ratios reales para cada foto (masonry Pinterest via CSS columns)
- Cada 7ma foto es "featured" (column-span: all, ancho completo)
- Polaroid en la foto principal
- Carta con estrofas
"""
import os, urllib.parse

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(ROOT, 'public', 'images')
HTML_PATH = os.path.join(ROOT, 'index.html')

MAIN = 'WhatsApp Image 2026-07-21 at 4.21.12 PM (4).jpeg'

# 3 momentos
MOMENTS = [
    ('WhatsApp Image 2026-07-21 at 4.21.05 PM.jpeg',
     'Capítulo 1', 'El día que nos conocimos',
     'Todavía recuerdo esa primera conversación. Algo hizo clic desde el primer instante.'),
    ('WhatsApp Image 2026-07-21 at 4.21.10 PM.jpeg',
     'Capítulo 2', 'Nuestra primera salida',
     'Ese paseo que no quería terminar. Las horas se volvieron minutos a tu lado.'),
    ('WhatsApp Image 2026-07-21 at 4.21.15 PM.jpeg',
     'Capítulo 3', 'El momento en que supe',
     'Sin anunciarlo, en silencio, entendí que eras tú. Y nunca más lo dudé.'),
]

# Carta con estrofas (texto del usuario)
LETTER_STANZAS = [
    [
        'Dicen que las mejores historias de amor',
        'no se escriben en un solo día,',
        'sino en el detalle de cada página compartida.',
    ],
    [
        'Habrá capítulos difíciles, giros inesperados',
        'o momentos de pausa...',
    ],
    [
        'pero el hilo de nuestra historia siempre encuentra la forma',
        'de seguir escribiendo momentos increíbles.',
    ],
    [
        'Gracias por ser mi lugar favorito en el mundo',
        'y mi historia favorita para contar.',
    ],
]
LETTER_FINAL = 'Feliz aniversario, mi amor.'


def jpeg_size(path):
    try:
        with open(path, 'rb') as f:
            f.read(2)
            while True:
                m = f.read(2)
                if len(m) < 2 or m[0] != 0xFF:
                    return (1200, 1200)
                if 0xC0 <= m[1] <= 0xCF and m[1] not in (0xC4, 0xC8, 0xCC):
                    f.read(3)
                    h = int.from_bytes(f.read(2), 'big')
                    w = int.from_bytes(f.read(2), 'big')
                    return (w, h)
                else:
                    length = int.from_bytes(f.read(2), 'big')
                    if length < 2:
                        return (1200, 1200)
                    f.read(length - 2)
    except Exception:
        return (1200, 1200)


def u(fn):
    return 'public/images/' + urllib.parse.quote(fn)


def img_attrs(fn):
    sz = jpeg_size(os.path.join(IMG_DIR, fn))
    return f'data-pswp-src="{u(fn)}" data-pswp-width="{sz[0]}" data-pswp-height="{sz[1]}"'


def build_moments():
    out = []
    for fn, chip, title, text in MOMENTS:
        src = u(fn)
        out.append(f'''<a href="{src}" {img_attrs(fn)} class="moment-card" target="_blank" rel="noreferrer">
  <div class="moment-image">
    <img src="{src}" alt="{title}" loading="lazy" />
  </div>
  <div class="moment-body">
    <span class="moment-date">{chip}</span>
    <h4>{title}</h4>
    <p>{text}</p>
  </div>
</a>''')
    return '\n'.join(out)


def build_gallery():
    files = sorted(os.listdir(IMG_DIR))
    moment_names = {m[0] for m in MOMENTS}
    gallery_files = [f for f in files if f != MAIN and f not in moment_names]
    items = []
    for i, fn in enumerate(gallery_files):
        src = u(fn)
        sz = jpeg_size(os.path.join(IMG_DIR, fn))
        is_featured = (i % 7 == 0)
        cls = 'gallery-item' + (' gallery-item--featured' if is_featured else '')
        # Aspect ratio inline
        style = f'aspect-ratio: {sz[0]} / {sz[1]};'
        items.append(
            f'  <a href="{src}" {img_attrs(fn)} class="{cls}" '
            f'style="{style}" target="_blank" rel="noreferrer">'
            f'<img src="{src}" alt="" loading="lazy" /></a>'
        )
    return '\n'.join(items), len(gallery_files)


def build_featured():
    src = u(MAIN)
    sz = jpeg_size(os.path.join(IMG_DIR, MAIN))
    return (
        f'<a href="{src}" {img_attrs(MAIN)} class="featured-photo" target="_blank" rel="noreferrer">\n'
        f'  <div class="featured-frame">\n'
        f'    <img src="{src}" alt="Para Daniela" class="featured-image" loading="lazy" decoding="async" />\n'
        f'    <span class="featured-stamp">21 · 07 · 2026</span>\n'
        f'  </div>\n'
        f'</a>'
    )


def build_letter():
    parts = []
    for i, stanza in enumerate(LETTER_STANZAS):
        if i > 0:
            parts.append('<div class="letter-divider" aria-hidden="true">·  ·  ·</div>')
        paras = '\n          '.join(f'<p>{line}</p>' for line in stanza)
        parts.append(f'<div class="letter-stanza">\n          {paras}\n        </div>')
    return '\n        '.join(parts)


MOMENTS_HTML = build_moments()
GALLERY_HTML, GALLERY_COUNT = build_gallery()
FEATURED_HTML = build_featured()
LETTER_HTML = build_letter()

HTML = f'''<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#E6D7F5" />
  <meta name="description" content="Feliz aniversario, Daniela — 21 de Julio" />

  <title>Para Daniela · 21 de Julio</title>

  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%E2%9D%A7%3C/text%3E%3C/svg%3E" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Great+Vibes&family=Inter:wght@300;400;500;600&display=swap"
    rel="stylesheet"
  />

  <!-- PhotoSwipe v5 (lightbox) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/photoswipe.css" />

  <link rel="stylesheet" href="styles.css" />
</head>
<body class="intro-active">

  <!-- INTRO OVERLAY -->
  <div class="intro" id="intro" role="dialog" aria-labelledby="introTitle" aria-modal="true">
    <div class="intro-bg" aria-hidden="true">
      <span class="intro-blob intro-blob-1"></span>
      <span class="intro-blob intro-blob-2"></span>
    </div>

    <div class="intro-content">
      <div class="intro-message">
        <h1 class="intro-title" id="introTitle">
          <span class="intro-title-day">21</span>
          <span class="intro-title-month">de Julio</span>
        </h1>
        <p class="intro-subtitle">Para Daniela</p>
        <p class="intro-tagline">un pequeño viaje por nuestro aniversario</p>
      </div>

      <button class="intro-button" id="introButton" type="button">
        <span>Abrir</span>
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 8h12M9 3l5 5-5 5" stroke="currentColor" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  </div>

  <!-- POLAROID + CARTA (combinados, primera sección post-intro) -->
  <section class="featured-and-letter">
    <div class="container">
      <p class="section-eyebrow">Para vos</p>
{FEATURED_HTML}
      <p class="featured-caption">Cada vez que te miro, me enamoro otra vez.</p>

      <div class="featured-letter-divider" aria-hidden="true">·  ·  ·</div>

      <div class="letter-content">
        {LETTER_HTML}
        <p class="letter-final">Feliz aniversario, mi amor.</p>
        <p class="letter-signature">— con amor, para siempre</p>
      </div>
    </div>
  </section>

  <!-- MOMENTOS -->
  <section id="momentos" class="moments">
    <div class="container">
      <p class="section-eyebrow" data-reveal>Momentos</p>
      <h3 class="section-title" data-reveal>Pequeños instantes</h3>
      <p class="section-sub" data-reveal>Algunos recuerdos que guardo en el corazón</p>

      <div class="moments-grid">
{MOMENTS_HTML}
      </div>
    </div>
  </section>

  <!-- GALERÍA (Pinterest masonry via CSS columns) -->
  <section class="gallery">
    <div class="container">
      <p class="section-eyebrow" data-reveal>Galería</p>
      <h3 class="section-title" data-reveal>Cada foto, una historia</h3>
      <p class="section-sub" data-reveal>Tocá una foto para abrirla · {GALLERY_COUNT} momentos</p>

      <div class="gallery-grid">
{GALLERY_HTML}
      </div>
    </div>
  </section>

  <!-- FEATURED (polaroid) -->
  <section class="featured">
    <div class="container">
      <p class="section-eyebrow" data-reveal>Para vos</p>
{FEATURED_HTML}
      <p class="featured-caption" data-reveal>Cada vez que te miro, me enamoro otra vez.</p>
    </div>
  </section>

  <!-- LETTER (estrofas) -->
  <section class="letter">
    <div class="container">
      <p class="section-eyebrow" data-reveal>Carta</p>
      <h3 class="section-title" data-reveal>Lo que quiero decirte</h3>

      <div class="letter-content">
        {LETTER_HTML}
        <p class="letter-final">Feliz aniversario, mi amor.</p>
        <p class="letter-signature">— con amor, para siempre</p>
      </div>
    </div>
  </section>

  <!-- CIERRE -->
  <section class="closing">
    <div class="container">
      <p class="closing-divider" aria-hidden="true">·  ·  ·</p>
      <p class="closing-message">
        Y seguimos creando recuerdos juntos —<br>
        uno más, cada día.
      </p>
    </div>
  </section>

  <!-- PhotoSwipe v5 -->
  <script src="https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/umd/photoswipe.umd.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/photoswipe@5.4.4/dist/umd/photoswipe-lightbox.umd.min.js" defer></script>

  <!-- GSAP + ScrollTrigger -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js" defer></script>

  <script src="script.js" defer></script>
</body>
</html>
'''

with open(HTML_PATH, 'w') as f:
    f.write(HTML)

print(f'OK — {GALLERY_COUNT} fotos en galería, 3 moments, 1 featured.')
print(f'Generado: {HTML_PATH}')
