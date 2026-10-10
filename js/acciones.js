/* ==========================================================
   acciones.js
   Acciones del jugador sobre el cohete: separar la etapa 1 y
   soltar la carga útil.
   ========================================================== */

/** Suelta la etapa 1 vacía: la quita del cohete y la anima cayendo. */
function ejecutarSeparacion() {
    if (!etapa1Acoplada) return;
    etapa1Acoplada = false;
    tiempoSeparacion = tiempo;

    document.getElementById('bloque-etapa1').style.display = 'none';
    document.getElementById('tobera-e2').style.display = 'block';

    // La etapa 1 sigue con la altitud y velocidad que llevaba y cae por gravedad (ver fisica.js)
    altitudEtapa1 = altitud;
    velocidadEtapa1 = velocidad;

    let caidaVis = document.getElementById('etapa1-cayendo');
    caidaVis.style.bottom = coheteVis.style.bottom;
    caidaVis.style.display = 'flex';

    masaActual -= masaVacia1;   // (la masa se recalcula en cada tick; esto solo adelanta el valor)
    document.getElementById('btn-separar').style.display = 'none';
    setAlerta("SEPARACIÓN EXITOSA.<br>Masa inútil liberada. Etapa 2 encendida.", "exito");
}

/** Libera el satélite de la ojiva y lo anima alejándose. */
function liberarCarga() {
    if (!cargaAcoplada) return;
    cargaAcoplada = false;
    tiempoCarga = tiempo;

    document.getElementById('obj-carga').style.opacity = '0';

    let suelta = document.getElementById('carga-suelta');
    suelta.style.bottom = `calc(${coheteVis.style.bottom} + 60px)`;
    suelta.style.left = '50%';
    suelta.style.transform = 'translateX(-50%)';
    suelta.style.display = 'block';
    suelta.style.opacity = '1';

    // Animación de salida (transición CSS de 2 s)
    setTimeout(() => {
        suelta.style.transition = 'all 2s ease-in';
        suelta.style.bottom = '-100px';
        suelta.style.transform = 'translate(100px, 0) rotate(90deg)';
        suelta.style.opacity = '0';
    }, 50);

    setTimeout(() => { suelta.style.display = 'none'; }, 2000);

    masaActual -= masaCargaUtil;
    document.getElementById('btn-carga').style.display = 'none';
    setAlerta("CARGA ÚTIL LIBERADA EN ÓRBITA.<br>Misión científica iniciada.", "exito");
}
