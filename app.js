// Clave con la que guardamos las sesiones en localStorage.
const CLAVE_ALMACENAMIENTO = "diarioDeEstudio.sesiones";

// Referencias a los elementos del HTML.
const formulario = document.getElementById("formulario");
const fechaInput = document.getElementById("fecha");
const temaInput = document.getElementById("tema");
const minutosInput = document.getElementById("minutos");
const mensajeError = document.getElementById("mensaje-error");
const rachaNumero = document.getElementById("racha-numero");
const rachaTexto = document.getElementById("racha-texto");
const listaSesiones = document.getElementById("lista-sesiones");
const mensajeVacio = document.getElementById("mensaje-vacio");

// Estado de la aplicación: array de sesiones.
let sesiones = cargarSesiones();

// Arranque.
fechaInput.value = fechaLocalISO();
actualizarVista();
formulario.addEventListener("submit", manejarEnvio);

/* ---------- Fechas ---------- */

// Devuelve la fecha de hoy (o la recibida) como "AAAA-MM-DD" usando la hora local,
// nunca UTC, para que el día coincida con el del usuario.
function fechaLocalISO(fecha = new Date()) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Suma (o resta) días a una fecha "AAAA-MM-DD" y devuelve otra fecha "AAAA-MM-DD".
function sumarDias(fechaISO, dias) {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia + dias);
  return fechaLocalISO(fecha);
}

// Convierte "AAAA-MM-DD" en un texto como "lunes, 22 de octubre de 2026".
function formatearFecha(fechaISO) {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* ---------- Almacenamiento ---------- */

function cargarSesiones() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_ALMACENAMIENTO));
    if (!Array.isArray(datos)) return [];
    return datos.filter(
      (sesion) =>
        sesion &&
        typeof sesion.fecha === "string" &&
        typeof sesion.tema === "string" &&
        typeof sesion.minutos === "number"
    );
  } catch {
    return [];
  }
}

function guardarSesiones() {
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(sesiones));
  } catch {
    // Si el navegador bloquea localStorage, la app sigue funcionando en memoria.
  }
}

/* ---------- Racha ---------- */

function calcularRacha(sesiones) {
  const diasConSesion = new Set(sesiones.map((sesion) => sesion.fecha));
  const hoy = fechaLocalISO();
  const ayer = sumarDias(hoy, -1);

  // La racha termina hoy; si hoy aún no hay sesión, sigue viva gracias a ayer.
  let dia;
  if (diasConSesion.has(hoy)) {
    dia = hoy;
  } else if (diasConSesion.has(ayer)) {
    dia = ayer;
  } else {
    return 0;
  }

  let racha = 0;
  while (diasConSesion.has(dia)) {
    racha += 1;
    dia = sumarDias(dia, -1);
  }
  return racha;
}

/* ---------- Formulario ---------- */

function manejarEnvio(evento) {
  evento.preventDefault();
  ocultarError();

  const tema = temaInput.value.trim();
  const minutos = Number(minutosInput.value);

  if (!fechaInput.value) {
    mostrarError("Elige una fecha.");
    return;
  }

  if (tema === "") {
    mostrarError("Escribe el tema de la sesión.");
    temaInput.focus();
    return;
  }

  if (!Number.isFinite(minutos) || minutos <= 0) {
    mostrarError("Los minutos deben ser un número mayor que 0.");
    minutosInput.focus();
    return;
  }

  sesiones.push({
    fecha: fechaInput.value,
    tema: tema,
    minutos: minutos,
  });

  guardarSesiones();
  actualizarVista();

  formulario.reset();
  fechaInput.value = fechaLocalISO();
  temaInput.focus();
}

function mostrarError(texto) {
  mensajeError.textContent = texto;
  mensajeError.hidden = false;
}

function ocultarError() {
  mensajeError.hidden = true;
}

/* ---------- Interfaz ---------- */

function actualizarVista() {
  actualizarRacha();
  actualizarLista();
}

function actualizarRacha() {
  const racha = calcularRacha(sesiones);
  rachaNumero.textContent = racha;
  rachaTexto.textContent = racha === 1 ? "día seguido" : "días seguidos";
}

function actualizarLista() {
  // De la más reciente a la más antigua. Si dos sesiones son del mismo día,
  // la añadida más tarde aparece primero.
  const ordenadas = sesiones
    .map((sesion, posicion) => ({ sesion, posicion }))
    .sort(
      (a, b) =>
        b.sesion.fecha.localeCompare(a.sesion.fecha) || b.posicion - a.posicion
    )
    .map((item) => item.sesion);

  mensajeVacio.hidden = ordenadas.length > 0;

  const fragmento = document.createDocumentFragment();

  for (const sesion of ordenadas) {
    const item = document.createElement("li");
    item.className = "sesion";

    const fila = document.createElement("div");
    fila.className = "sesion-fila";

    const tema = document.createElement("span");
    tema.className = "sesion-tema";
    tema.textContent = sesion.tema;

    const minutos = document.createElement("span");
    minutos.className = "sesion-minutos";
    minutos.textContent = `${sesion.minutos} min`;

    fila.append(tema, minutos);

    const fecha = document.createElement("span");
    fecha.className = "sesion-fecha";
    fecha.textContent = formatearFecha(sesion.fecha);

    item.append(fila, fecha);
    fragmento.append(item);
  }

  listaSesiones.replaceChildren(fragmento);
}
