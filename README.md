<div align="center">

# Filmteca

**Buscador de películas y series** que consume la API de **TMDB** con **AJAX puro**.

JavaScript puro. Sin frameworks, sin librerías externas.

[![Ver sitio](https://img.shields.io/badge/VER_SITIO-EN_VIVO-E5A13C?style=for-the-badge&logo=googlechrome&logoColor=white)](https://corecodev618.github.io/buscador-peliculas-series/)

</div>

---

## Funcionalidades

| Función | Descripción |
|---------|-------------|
| **Tendencias** | Pósters reales de la semana, navegable en fila horizontal |
| **Búsqueda en vivo** | Resultados al escribir con debounce (380 ms) y AbortController |
| **Filtros** | Por tipo: películas, series o ambas |
| **Orden** | Por popularidad, valoración o fecha de estreno |
| **Paginación** | Botón "Cargar más" para resultados adicionales |
| **Detalle** | Sinopsis, géneros, duración, presupuesto y tráiler de YouTube |
| **Favoritos** | Guardados en `localStorage` con sección dedicada |

## Cómo funciona (AJAX)

- `fetch` + `async/await` con `try/catch`.
- URLs dinámicas con `URLSearchParams` (clave, idioma, página, orden...).
- **Debounce** para no saturar la API y **AbortController** para cancelar búsquedas obsoletas.
- Tres modos de carga:

| Modo | Endpoint | Uso |
|------|----------|-----|
| Tendencias | `/trending/all/week` | Portada principal |
| Búsqueda | `/search/movie`, `/search/tv`, `/search/multi` | Buscador en vivo |
| Catálogo | `/discover/movie`, `/discover/tv` | Explorar con filtros y orden |

- Detalle con `append_to_response=videos` para obtener tráilers de YouTube.

## Tecnologías

- **HTML5** — Semántica, roles ARIA, responsive
- **CSS3** — Grid, Flexbox, variables, animaciones, `prefers-reduced-motion`
- **JavaScript ES6+** — `async/await`, `fetch`, `AbortController`, `localStorage`
- **TMDB API** — Películas, series, tráilers

## Archivos

```
buscador-peliculas-series/
├── index.html    → Estructura semántica, modal, toast, skeleton
├── styles.css    → Tema "sala de cine" (ámbar + carbón), responsive
├── config.js     → API key de TMDB (NO se sube a GitHub)
├── script.js     → Toda la lógica AJAX y UI
├── logo.ico      → Favicon de TMDB
└── README.md     → Este archivo
```

## Configuración

1. Cloná el repositorio
2. Creá `config.js` con tu API key:

```js
const TMDB_API_KEY = "TU_API_KEY_AQUI";
```

3. Abrí `index.html` en el navegador

> `config.js` está en `.gitignore` — nunca se sube a GitHub.

---

<div align="center">

**Tarea II · Programación Web II**

Hecho con HTML, CSS y JavaScript puro

[![GitHub](https://img.shields.io/badge/GitHub-repositorio-181717?style=flat&logo=github)](https://github.com/CoreCodev618/buscador-peliculas-series)

</div>
