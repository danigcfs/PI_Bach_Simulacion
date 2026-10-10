/* ==========================================================
   tutorial.js
   Tutorial inicial paso a paso: caja flotante con flecha que
   señala y resalta cada panel de la interfaz.
   ========================================================== */

/* Cada paso define:
     titulo     -> título (admite HTML)
     html       -> texto del paso
     clase      -> posición de la caja (.pos-*) y lado de la flecha (.flecha-*)
     arrowPos   -> altura de la flecha dentro de la caja (mueve solo la flecha)
     highlights -> elementos a iluminar y el panel padre que se eleva sobre la capa oscura */
const pasosTutorial = [
    { titulo: "🚀 Simulador de Vuelo", html: "<p>Te damos la bienvenida al Centro de Control.</p><p>Como responsable de la misión, deberás aplicar los conceptos de física y aerodinámica para guiar este cohete hasta la órbita de forma segura.</p>", clase: "pos-center", arrowPos: "50%", highlights: [] },
    { titulo: "<span style='color:#4da6ff;'>1. Tipo de Motor</span>", html: "<p>Antes de despegar, elige el <strong>tipo de motor</strong>: Líquido (control manual total), Híbrido (mixto) o Sólido (automático, no se puede apagar ni regular).</p><p>Cada uno se pilota de forma distinta, ¡elige con cuidado!</p>", clase: "pos-motor flecha-izq", arrowPos: "15%", highlights: [{ elemento: "box-motor", panel: "panel-izq" }] },
    { titulo: "<span style='color:#ff4444;'>2. Palanca y MAX-Q</span>", html: "<p>Utiliza la <strong>Palanca de Cambios</strong> de la derecha para despegar.</p><p>Mientras asciendes, la <strong>presión dinámica (q = ½·ρ·v²)</strong> sube hasta un máximo: el <strong>Max-Q</strong>. Vigila el valor <em>q</em> en la telemetría. <strong>¡REDUCE LA POTENCIA por debajo del 65 %</strong> cuando salte la alerta o el cohete se desintegrará por la fricción!</p>", clase: "pos-palanca flecha-der", arrowPos: "25%", highlights: [{ elemento: "contenedor-general-motor", panel: "panel-der" }] },
    { titulo: "<span style='color:#ffeb3b;'>3. Copiloto (Avisos)</span>", html: "<p>Justo debajo de la configuración del motor tienes el panel del <strong>Copiloto</strong>.</p><p>Ahí te avisará de cada evento importante del vuelo (Max-Q, vientos, separaciones...). ¡Mantente atento a sus mensajes durante toda la misión!</p>", clase: "pos-avisos flecha-izq", arrowPos: "15%", highlights: [{ elemento: "panel-alertas", panel: "panel-izq" }] },
    { titulo: "<span style='color:#00ff00;'>4. Telemetría</span>", html: "<p>Este panel te da los datos en vivo del vuelo: <strong>capa atmosférica, presión, tiempo, altitud, velocidad</strong> y <strong>estabilidad</strong> (el ángulo de inclinación del cohete).</p><p>Vigílalo para saber cuándo actuar.</p>", clase: "pos-telemetria flecha-izq", arrowPos: "25%", highlights: [{ elemento: "box-telemetria", panel: "panel-izq" }] },
    { titulo: "<span style='color:orange;'>5. Sistema TVC</span>", html: "<p>A los 20000 m (Estratosfera) aparecerán vientos cruzados.</p><p>Usarás las <strong>FLECHAS de tu teclado (← y →)</strong> o los botones en pantalla para estabilizar el cohete empujando contra el viento.</p>", clase: "pos-tvc flecha-der", arrowPos: "50%", highlights: [{ elemento: "panel-tvc", panel: "panel-der" }] },
    { titulo: "<span style='color:#4da6ff;'>6. Minimapa y Capas</span>", html: "<p>Sigue tu altitud y la capa atmosférica iluminada en el minimapa de la izquierda de la pantalla central.</p><p>Te indica en todo momento en qué capa te encuentras, de la Troposfera a la Exosfera.</p>", clase: "pos-mapa flecha-izq", arrowPos: "70%", highlights: [{ elemento: "minimapa", panel: "pantalla-central" }] },
    { titulo: "<span style='color:#ff4444;'>7. Separación y Carga Útil</span>", html: "<p>Cuando se agote el combustible de la Etapa 1, se encenderá el botón <strong>Separar Etapa 1</strong> para soltar el peso muerto.</p><p>Más adelante, al llegar a la Termosfera, se habilitará <strong>Soltar Carga Útil</strong> para completar la misión.</p>", clase: "pos-separar flecha-der", arrowPos: "85%", highlights: [{ elemento: "panel-der", panel: "panel-der" }] }
];

let pasoActual = 0;

// IDs que pueden recibir el resalte (se limpian en cada cambio de paso)
const elementosIluminables = ["contenedor-general-motor", "panel-tvc", "minimapa", "panel-der", "box-motor", "panel-alertas", "box-telemetria"];
// Paneles cuyo z-index se eleva temporalmente para quedar por encima del fondo oscuro
const panelesElevables = ["panel-der", "pantalla-central", "panel-izq"];

/** Avanza (dir = 1) o retrocede (dir = -1) un paso del tutorial. Al pasar el último, lo cierra. */
function cambiarPaso(dir) {
    // 1. Limpiar el estado visual del paso anterior
    elementosIluminables.forEach(id => document.getElementById(id).classList.remove('highlight-tutorial'));
    document.getElementById('panel-tvc').style.display = 'none';
    panelesElevables.forEach(id => document.getElementById(id).style.zIndex = (id === 'pantalla-central' ? "1" : "10"));

    pasoActual += dir;
    if (pasoActual < 0) pasoActual = 0;

    let box = document.getElementById('box-tutorial');
    let modalOverlay = document.getElementById('modal-inicio');

    if (pasoActual >= pasosTutorial.length) {
        // 2a. Fin del tutorial: desvanecer y ocultar
        modalOverlay.style.opacity = '0';
        box.style.opacity = '0';
        setTimeout(() => { modalOverlay.style.display = 'none'; box.style.display = 'none'; }, 500);
        window.focus();
    } else {
        // 2b. Mostrar el paso actual
        let data = pasosTutorial[pasoActual];
        document.getElementById('tut-titulo').innerHTML = data.titulo;
        document.getElementById('texto-paso-container').innerHTML = data.html;

        // Posición base de la caja y posición interna de la flecha
        box.className = "instrucciones-box " + data.clase;
        box.style.setProperty('--arrow-pos', data.arrowPos || '50%');

        (data.highlights || []).forEach(h => {
            if (h.elemento === 'panel-tvc') document.getElementById('panel-tvc').style.display = 'block';
            document.getElementById(h.elemento).classList.add('highlight-tutorial');
            document.getElementById(h.panel).style.zIndex = "10002";
        });

        document.getElementById('btn-ant').style.display = pasoActual === 0 ? 'none' : 'block';
        document.getElementById('btn-saltar').style.display = pasoActual === pasosTutorial.length - 1 ? 'none' : 'block';
        document.getElementById('btn-sig').innerText = pasoActual === pasosTutorial.length - 1 ? "¡ENTENDIDO!" : "Siguiente";
    }
}

// ---------- Saltar el tutorial ----------
// Solo cierra el tutorial de esta partida: al recargar la página (VOLVER A JUGAR) siempre vuelve a mostrarse.

/** Cierra el tutorial de golpe desde cualquier paso. */
function saltarTutorial() {
    pasoActual = pasosTutorial.length - 1;
    cambiarPaso(1);
}
