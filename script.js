const API = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";
const LANG = "es-ES";
const CLAVE_PLACEHOLDER = "PEGA_AQUI_TU_API_KEY";

const estado = {
  modo: "tendencias",
  query: "",
  filtro: "multi",
  orden: "popularity.desc",
  pagina: 1,
  totalPaginas: 1,
  cargando: false,
  controlador: null,
};

const DOM = {
  buscador: document.getElementById("buscador"),
  btnLimpiar: document.getElementById("btn-limpiar"),
  chips: document.querySelectorAll(".chip[data-filtro]"),
  ordenar: document.getElementById("ordenar"),
  heroHint: document.getElementById("hero-hint"),
  seccionTendencias: document.getElementById("tendencias"),
  filaTendencias: document.getElementById("fila-tendencias"),
  btnVerTodo: document.getElementById("btn-ver-todo"),
  seccionResultados: document.getElementById("resultados"),
  tituloResultados: document.getElementById("titulo-resultados"),
  contadorResultados: document.getElementById("contador-resultados"),
  gridResultados: document.getElementById("grid-resultados"),
  estadoResultados: document.getElementById("estado-resultados"),
  btnCargarMas: document.getElementById("btn-cargar-mas"),
  gridFavoritos: document.getElementById("grid-favoritos"),
  contadorFavoritos: document.getElementById("contador-favoritos"),
  vacioFavoritos: document.getElementById("vacio-favoritos"),
  navLinks: document.querySelectorAll(".nav-link[data-nav]"),
  modal: document.getElementById("modal"),
  modalCerrar: document.getElementById("modal-cerrar"),
  modalPoster: document.getElementById("modal-poster"),
  modalGrupo: document.getElementById("modal-grupo"),
  modalTitulo: document.getElementById("modal-titulo"),
  modalMeta: document.getElementById("modal-meta"),
  modalOverview: document.getElementById("modal-overview"),
  modalExtra: document.getElementById("modal-extra"),
  btnTrailer: document.getElementById("btn-trailer"),
  modalFavorito: document.getElementById("modal-favorito"),
  textoFavorito: document.getElementById("favorito-texto"),
  modalTrailer: document.getElementById("modal-trailer"),
  trailerIframe: document.getElementById("trailer-iframe"),
  toast: document.getElementById("toast"),
};

let detalleActual = null;
let timerToast = null;

function claveValida() {
  return typeof TMDB_API_KEY === "string" && TMDB_API_KEY !== CLAVE_PLACEHOLDER;
}

async function pedirTMDB(ruta, params = {}, signal) {
  if (!claveValida()) {
    throw new Error("NO_KEY");
  }
  const qs = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: LANG,
    ...params,
  });
  const res = await fetch(`${API}${ruta}?${qs}`, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

function tituloDe(item) {
  return item.title || item.name || "Sin título";
}

function mediaTypeDe(item) {
  return item.media_type || (item.title ? "movie" : "tv");
}

function anioDe(item) {
  return (item.release_date || item.first_air_date || "").slice(0, 4);
}

function ratingDe(item) {
  return typeof item.vote_average === "number"
    ? item.vote_average.toFixed(1)
    : "—";
}

function esFavorito(id, media_type) {
  return obtenerFavoritos().some(
    (f) => f.id === id && f.media_type === media_type
  );
}

function obtenerFavoritos() {
  try {
    return JSON.parse(localStorage.getItem("filmteca_favoritos") || "[]");
  } catch {
    return [];
  }
}

function guardarFavoritos(lista) {
  localStorage.setItem("filmteca_favoritos", JSON.stringify(lista));
}

function crearTarjeta(item) {
  const tipo = mediaTypeDe(item);
  const titulo = tituloDe(item);
  const esPref = esFavorito(item.id, tipo);

  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta";
  tarjeta.tabIndex = 0;
  tarjeta.setAttribute("role", "button");
  tarjeta.setAttribute("aria-label", `Ver detalles de ${titulo}`);

  const poster = document.createElement("div");
  poster.className = "tarjeta-poster";

  if (item.poster_path) {
    const img = document.createElement("img");
    img.src = `${IMG}${item.poster_path}`;
    img.alt = titulo;
    img.loading = "lazy";
    img.onerror = () => {
      img.style.display = "none";
    };
    poster.appendChild(img);
  }

  const ver = document.createElement("div");
  ver.className = "tarjeta-ver";
  const verTexto = document.createElement("span");
  verTexto.textContent = "Ver";
  ver.appendChild(verTexto);
  poster.appendChild(ver);

  const favorito = document.createElement("button");
  favorito.className = "tarjeta-favorito";
  favorito.type = "button";
  favorito.setAttribute("aria-label", "Alternar favorito");
  if (esPref) favorito.classList.add("activo");
  favorito.textContent = "\u2605";
  favorito.addEventListener("click", (e) => {
    e.stopPropagation();
    alternarFavorito(item, favorito);
  });
  poster.appendChild(favorito);

  const cuerpo = document.createElement("div");
  cuerpo.className = "tarjeta-cuerpo";

  const tituloEl = document.createElement("p");
  tituloEl.className = "tarjeta-titulo";
  tituloEl.textContent = titulo;
  cuerpo.appendChild(tituloEl);

  const sub = document.createElement("div");
  sub.className = "tarjeta-sub";

  const meta = document.createElement("span");
  meta.textContent = [anioDe(item), tipo === "tv" ? "Serie" : "Película"]
    .filter(Boolean)
    .join(" · ");

  const rating = document.createElement("span");
  rating.className = "tarjeta-rating";
  rating.textContent = `\u2605 ${ratingDe(item)}`;

  sub.append(meta, rating);
  cuerpo.appendChild(sub);

  tarjeta.append(poster, cuerpo);

  const abrir = () => abrirDetalle(item.id, tipo);
  tarjeta.addEventListener("click", abrir);
  tarjeta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      abrir();
    }
  });

  return tarjeta;
}

function crearEsqueleto() {
  const caja = document.createElement("div");
  caja.className = "tarjeta";
  caja.setAttribute("aria-hidden", "true");
  const sk = document.createElement("div");
  sk.className = "skeleton skeleton-tarjeta";
  caja.appendChild(sk);
  return caja;
}

function mostrarEsqueletos(contenedor, cantidad = 12) {
  contenedor.replaceChildren();
  for (let i = 0; i < cantidad; i++) {
    contenedor.appendChild(crearEsqueleto());
  }
}

function solicitarNueva() {
  if (estado.controlador) {
    estado.controlador.abort();
  }
  estado.controlador = new AbortController();
  return estado.controlador.signal;
}

async function cargarTendencias() {
  const signal = solicitarNueva();
  estado.modo = "tendencias";
  mostrarEsqueletos(DOM.filaTendencias, 10);
  DOM.btnVerTodo.hidden = true;
  DOM.heroHint.hidden = true;

  try {
    const datos = await pedirTMDB("/trending/all/week", {}, signal);
    const items = datos.results || [];
    if (!items.length) {
      DOM.filaTendencias.textContent = "No hay tendencias disponibles.";
      return;
    }
    DOM.filaTendencias.replaceChildren(...items.slice(0, 12).map(crearTarjeta));
    DOM.btnVerTodo.hidden = false;
  } catch (err) {
    if (err.name === "AbortError") return;
    mostrarError(DOM.filaTendencias, err.message === "NO_KEY"
      ? "No hay API key configurada en config.js."
      : "No se pudo cargar las tendencias. Revisá tu conexión y volvé a intentar.");
  }
}

async function ejecutarBusqueda(texto) {
  const q = texto.trim();
  estado.modo = "busqueda";
  estado.query = q;
  estado.pagina = 1;

  if (!q) {
    DOM.heroHint.hidden = true;
    DOM.seccionResultados.hidden = true;
    DOM.seccionTendencias.hidden = false;
    return;
  }

  const signal = solicitarNueva();
  const grid = DOM.gridResultados;
  const estadoEl = DOM.estadoResultados;
  mostrarEsqueletos(grid, 12);
  estadoEl.hidden = true;
  DOM.btnCargarMas.hidden = true;
  DOM.heroHint.textContent = `Buscando «${q}»…`;
  DOM.heroHint.hidden = false;
  DOM.seccionTendencias.hidden = true;
  DOM.seccionResultados.hidden = false;
  DOM.tituloResultados.textContent = `Resultados para «${q}»`;

  const ruta =
    estado.filtro === "movie"
      ? "/search/movie"
      : estado.filtro === "tv"
        ? "/search/tv"
        : "/search/multi";

  try {
    const datos = await pedirTMDB(
      ruta,
      { query: q, page: 1, include_adult: false },
      signal
    );
    if (signal.aborted) return;
    const items = datos.results || [];
    estado.totalPaginas = datos.total_pages || 1;
    DOM.contadorResultados.textContent = `${datos.total_results || 0} títulos`;
    DOM.contadorResultados.hidden = false;
    DOM.heroHint.hidden = true;

    if (!items.length) {
      grid.replaceChildren();
      estadoEl.innerHTML = "";
      const strong = document.createElement("strong");
      strong.textContent = `No encontramos resultados para «${q}».`;
      estadoEl.append(strong, document.createElement("br"), "Probá con otro título o revisá la ortografía.");
      estadoEl.hidden = false;
      DOM.btnCargarMas.hidden = true;
      return;
    }

    grid.replaceChildren(...items.map(crearTarjeta));
    actualizarBotonCargarMas();
  } catch (err) {
    if (err.name === "AbortError") return;
    grid.replaceChildren();
    estadoEl.hidden = false;
    estadoEl.textContent = err.message === "NO_KEY"
      ? "No hay API key configurada en config.js."
      : "Ocurrió un error al buscar. Volvé a intentar en unos segundos.";
    DOM.btnCargarMas.hidden = true;
  }
}

function actualizarBotonCargarMas() {
  const puede = estado.pagina < estado.totalPaginas;
  DOM.btnCargarMas.hidden = !puede;
}

async function cargarMas() {
  if (estado.cargando) return;
  estado.cargando = true;
  DOM.btnCargarMas.disabled = true;
  const siguiente = estado.pagina + 1;

  try {
    let datos;
    if (estado.modo === "busqueda") {
      const ruta =
        estado.filtro === "movie"
          ? "/search/movie"
          : estado.filtro === "tv"
            ? "/search/tv"
            : "/search/multi";
      datos = await pedirTMDB(
        ruta,
        { query: estado.query, page: siguiente, include_adult: false }
      );
    } else {
      const tipo = estado.filtro === "tv" ? "tv" : "movie";
      datos = await pedirTMDB(
        `/discover/${tipo}`,
        { sort_by: estado.orden, page: siguiente, include_adult: false }
      );
    }

    estado.pagina = siguiente;
    estado.totalPaginas = datos.total_pages || 1;
    const items = datos.results || [];
    items.forEach((it) => DOM.gridResultados.appendChild(crearTarjeta(it)));
  } catch {
    mostrarToast("No se pudieron cargar más resultados.");
  } finally {
    estado.cargando = false;
    DOM.btnCargarMas.disabled = false;
    actualizarBotonCargarMas();
  }
}

async function explorar(filtro, orden) {
  estado.modo = "explorar";
  estado.filtro = filtro;
  estado.orden = orden;
  estado.pagina = 1;

  const tipo = filtro === "tv" ? "tv" : "movie";
  const signal = solicitarNueva();
  const grid = DOM.gridResultados;
  const estadoEl = DOM.estadoResultados;

  mostrarEsqueletos(grid, 12);
  estadoEl.hidden = true;
  DOM.btnCargarMas.hidden = true;
  DOM.contadorResultados.hidden = true;
  DOM.heroHint.hidden = true;
  DOM.seccionTendencias.hidden = true;
  DOM.seccionResultados.hidden = false;
  DOM.tituloResultados.textContent =
    tipo === "tv" ? "Series del catálogo" : "Películas del catálogo";

  try {
    const datos = await pedirTMDB(
      `/discover/${tipo}`,
      { sort_by: orden, page: 1, include_adult: false },
      signal
    );
    if (signal.aborted) return;
    const items = datos.results || [];
    estado.totalPaginas = datos.total_pages || 1;

    if (!items.length) {
      grid.replaceChildren();
      estadoEl.textContent = "No hay títulos para mostrar en este momento.";
      estadoEl.hidden = false;
      DOM.btnCargarMas.hidden = true;
      return;
    }

    grid.replaceChildren(...items.map(crearTarjeta));
    actualizarBotonCargarMas();
  } catch (err) {
    if (err.name === "AbortError") return;
    grid.replaceChildren();
    estadoEl.hidden = false;
    estadoEl.textContent = err.message === "NO_KEY"
      ? "No hay API key configurada en config.js."
      : "No se pudo cargar el catálogo. Volvé a intentar.";
  }
}

function alternarFavorito(item, boton = null) {
  const tipo = mediaTypeDe(item);
  const lista = obtenerFavoritos();
  const indice = lista.findIndex((f) => f.id === item.id && f.media_type === tipo);
  const esNuevo = indice === -1;

  if (esNuevo) {
    lista.push({
      id: item.id,
      media_type: tipo,
      title: tituloDe(item),
      year: anioDe(item),
      rating: item.vote_average || 0,
      poster_path: item.poster_path || null,
    });
    mostrarToast(`«${tituloDe(item)}» guardado en favoritos.`);
  } else {
    lista.splice(indice, 1);
    mostrarToast(`«${tituloDe(item)}» se quitó de favoritos.`);
  }

  guardarFavoritos(lista);
  renderizarFavoritos();
  if (boton) boton.classList.toggle("activo", esNuevo);
  if (detalleActual && detalleActual.id === item.id && detalleActual.media_type === tipo) {
    actualizarBotonFavoritoModal();
  }
}

function renderizarFavoritos() {
  const lista = obtenerFavoritos();
  DOM.gridFavoritos.replaceChildren();
  DOM.contadorFavoritos.textContent =
    lista.length ? `${lista.length} ${lista.length === 1 ? "título" : "títulos"}` : "";
  DOM.contadorFavoritos.hidden = !lista.length;

  if (!lista.length) {
    DOM.gridFavoritos.appendChild(DOM.vacioFavoritos);
    return;
  }
  lista.forEach((f) => DOM.gridFavoritos.appendChild(crearTarjeta(f)));
}

async function abrirDetalle(id, media_type) {
  const overlay = DOM.modal;
  overlay.hidden = false;
  document.body.style.overflow = "hidden";

  detalleActual = { id, media_type };
  DOM.modalTitulo.textContent = "Cargando…";
  DOM.modalMeta.replaceChildren();
  DOM.modalOverview.textContent = "";
  DOM.modalExtra.replaceChildren();
  DOM.modalPoster.src = "";
  DOM.btnTrailer.hidden = true;
  DOM.modalTrailer.hidden = true;
  DOM.trailerIframe.src = "";
  actualizarBotonFavoritoModal();

  try {
    const d = await pedirTMDB(`/${media_type}/${id}`, { append_to_response: "videos" });
    renderDetalle(d, media_type);
  } catch {
    DOM.modalTitulo.textContent = "No se pudo cargar el detalle.";
    DOM.modalOverview.textContent = "Volvé a intentar en unos momentos.";
  }
}

function renderDetalle(d, media_type) {
  const titulo = tituloDe(d);
  detalleActual = { id: d.id, media_type };

  DOM.modalPoster.src = d.poster_path ? `${IMG}${d.poster_path}` : "";
  DOM.modalPoster.alt = titulo;
  DOM.modalGrupo.textContent = media_type === "tv" ? "Serie" : "Película";
  DOM.modalTitulo.textContent = titulo;
  DOM.modalOverview.textContent = d.overview || "Sin sinopsis disponible.";
  actualizarBotonFavoritoModal();

  const meta = document.createElement("ul");
  meta.className = "modal-meta";
  const agregar = (texto, estrella = false) => {
    const li = document.createElement("li");
    if (estrella) {
      const s = document.createElement("span");
      s.className = "estrella";
      s.setAttribute("aria-hidden", "true");
      s.textContent = "\u2605";
      li.appendChild(s);
    }
    li.appendChild(document.createTextNode(texto));
    meta.appendChild(li);
  };
  if (typeof d.vote_average === "number") agregar(d.vote_average.toFixed(1) + " votación", true);
  if (anioDe(d)) agregar(anioDe(d));
  agregar(media_type === "tv" ? "Serie" : "Película");
  DOM.modalMeta.replaceChildren(meta);

  const extra = document.createElement("div");
  extra.className = "modal-extra";
  const bloque = (etiqueta, valor) => {
    const div = document.createElement("div");
    const b = document.createElement("b");
    b.textContent = etiqueta + ": ";
    div.append(b, document.createTextNode(valor));
    extra.appendChild(div);
  };
  if (d.genres && d.genres.length) bloque("Géneros", d.genres.map((g) => g.name).join(", "));
  if (media_type === "movie" && d.runtime) bloque("Duración", `${d.runtime} min`);
  if (media_type === "tv") {
    if (d.number_of_seasons) bloque("Temporadas", String(d.number_of_seasons));
    if (d.number_of_episodes) bloque("Episodios", String(d.number_of_episodes));
  }
  if (media_type === "movie" && d.budget > 0) bloque("Presupuesto", `$${d.budget.toLocaleString("en-US")}`);
  DOM.modalExtra.replaceChildren(extra);

  const videos = (d.videos && d.videos.results) || [];
  const trailer = videos.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  ) || videos.find((v) => v.site === "YouTube");
  if (trailer) {
    DOM.btnTrailer.hidden = false;
    DOM.btnTrailer.onclick = () => {
      DOM.trailerIframe.src = `https://www.youtube-nocookie.com/embed/${trailer.key}`;
      DOM.modalTrailer.hidden = false;
      DOM.modalTrailer.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
  }
}

function actualizarBotonFavoritoModal() {
  if (!detalleActual) return;
  const activo = esFavorito(detalleActual.id, detalleActual.media_type);
  DOM.modalFavorito.classList.toggle("activo", activo);
  DOM.modalFavorito.setAttribute("aria-pressed", String(activo));
  DOM.textoFavorito.textContent = activo ? "Quitar de favoritos" : "Guardar en favoritos";
}

function cerrarModal() {
  DOM.modal.hidden = true;
  document.body.style.overflow = "";
  DOM.modalTrailer.hidden = true;
  DOM.trailerIframe.src = "";
  detalleActual = null;
}

function mostrarToast(mensaje) {
  DOM.toast.textContent = mensaje;
  DOM.toast.hidden = false;
  clearTimeout(timerToast);
  timerToast = setTimeout(() => {
    DOM.toast.hidden = true;
  }, 2000);
}

function mostrarError(contenedor, mensaje) {
  contenedor.replaceChildren();
  const p = document.createElement("p");
  p.className = "estado-vacio";
  p.textContent = mensaje;
  contenedor.appendChild(p);
}

let debounceTimer = null;
DOM.buscador.addEventListener("input", () => {
  const valor = DOM.buscador.value;
  DOM.btnLimpiar.hidden = !valor;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => ejecutarBusqueda(valor), 380);
});

DOM.btnLimpiar.addEventListener("click", () => {
  DOM.buscador.value = "";
  DOM.btnLimpiar.hidden = true;
  ejecutarBusqueda("");
  DOM.buscador.focus();
});

DOM.chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    if (chip.classList.contains("activo")) return;
    DOM.chips.forEach((c) => c.classList.remove("activo"));
    chip.classList.add("activo");
    estado.filtro = chip.dataset.filtro;
    if (estado.modo === "busqueda") {
      ejecutarBusqueda(estado.query);
    } else if (estado.modo === "explorar") {
      explorar(estado.filtro, estado.orden);
    }
  });
});

DOM.ordenar.addEventListener("change", () => {
  estado.orden = DOM.ordenar.value;
  if (estado.modo === "explorar") {
    explorar(estado.filtro, estado.orden);
  }
});

DOM.btnCargarMas.addEventListener("click", cargarMas);

DOM.btnVerTodo.addEventListener("click", () => {
  const chip = document.querySelector('.chip[data-filtro="multi"]');
  DOM.chips.forEach((c) => c.classList.remove("activo"));
  if (chip) chip.classList.add("activo");
  estado.filtro = "multi";
  explorar("multi", estado.orden);
  DOM.seccionResultados.scrollIntoView({ behavior: "smooth", block: "start" });
});

DOM.navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const destino = link.dataset.nav;
    DOM.navLinks.forEach((l) => l.classList.remove("activo"));

    if (destino === "tendencias") {
      DOM.seccionTendencias.scrollIntoView({ behavior: "smooth", block: "start" });
      cargarTendencias();
    } else if (destino === "multi" || destino === "tv") {
      link.classList.add("activo");
      const chip = document.querySelector(`.chip[data-filtro="${destino}"]`);
      DOM.chips.forEach((c) => c.classList.remove("activo"));
      if (chip) chip.classList.add("activo");
      estado.filtro = destino;
      explorar(destino, estado.orden);
      DOM.seccionResultados.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (destino === "favoritos") {
      DOM.gridFavoritos.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

DOM.modalCerrar.addEventListener("click", cerrarModal);
DOM.modal.addEventListener("click", (e) => {
  if (e.target === DOM.modal) cerrarModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !DOM.modal.hidden) cerrarModal();
});

DOM.modalFavorito.addEventListener("click", () => {
  if (!detalleActual) return;
  const fake = {
    id: detalleActual.id,
    media_type: detalleActual.media_type,
    title: detalleActual.titulo || DOM.modalTitulo.textContent,
  };
  alternarFavorito(fake, null);
});

function iniciar() {
  if (!claveValida()) {
    mostrarError(DOM.filaTendencias, "Pegá tu API key de TMDB en config.js para usar la app.");
    return;
  }
  cargarTendencias();
  renderizarFavoritos();
}

iniciar();