<div align="center">

# Filmteca

**Buscador de películas y series** que consume la API de **TMDB** con **AJAX**.

JavaScript puro. Sin frameworks, sin librerías externas.

[Ver el sitio en vivo](https://corecodev618.github.io/buscador-peliculas-series/)

---

</div>

## Qué hace

- Al abrir muestra las **tendencias de la semana** (pósters reales, navegable en fila horizontal).
- **Búsqueda en vivo**: escribí y los resultados aparecen al instante (con debounce, sin botón).
- **Filtros** por tipo (películas / series / ambas) y **orden** por popularidad, valoración o fecha.
- Botón **"Cargar más"** para paginar los resultados.
- Modal de **detalle**: sinopsis, géneros, duración (o temporadas/episodios), presupuesto y **tráiler de YouTube**.
- **Favoritos** guardados en `localStorage`, con su propia sección.

## Cómo está hecho (AJAX)

- `fetch` + `async/await` con `try/catch`.
- Generación de URLs con `URLSearchParams` (clave, idioma, página, orden…).
- **Debounce** para no saturar la API mientras escribís y **AbortController** para cancelar las búsquedas que quedan viejas.
- Tres modos de carga:
  - `/trending/all/week` → tendencias
  - `/search/movie|tv|multi` → búsqueda
  - `/discover/movie|tv` → catálogo con orden
- Detalle con `append_to_response=videos` para obtener los tráilers.

## Estructura del archivo `script.js`

1. Configuración y referencia al DOM
2. Cliente de API (AJAX)
3. Utilidades (títulos, años, ratings)
4. Favoritos (`localStorage`)
5. Tarjetas y esqueletos de carga
6. Búsqueda y paginación
7. Catálogo y orden
8. Modal de detalle + reproductor de YouTube
9. Eventos e inicio

## Archivos

```
buscador-peliculas-series/
├── index.html       → Estructura de la página y el modal
├── styles.css       → Tema "sala de cine" (ámbar sobre carbón), responsive
├── config.js        → Tu API key de TMDB (NO se sube a GitHub)
├── script.js        → Toda la lógica AJAX
└── README.md        → Este archivo
```

Para dejar tu clave: creá `config.js` con tu API key de TMDB (ver `index.html`, se carga antes que `script.js`).

---

<div align="center">

**Tarea II · Programación Web II**

Hecho con HTML, CSS y JavaScript puro

</div>