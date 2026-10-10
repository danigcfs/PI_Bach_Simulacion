/* ==========================================================
   graficas.js
   Final de la misión: animación de cierre (explosión/éxito) y
   panel de resultados con las gráficas de Chart.js.
   ========================================================== */

/**
 * Termina la simulación.
 * El tipo de final se deduce del título: contiene "💥" (explosión),
 * "TERMINADA" (éxito) o es 'Misión Abortada' (botón VER GRÁFICAS).
 */
function finalizarMision(titulo, motivo) {
    clearInterval(timer);
    let delay = 0;   // tiempo para que se vea la animación antes de las gráficas

    if (titulo.includes("💥")) {
        coheteVis.style.display = 'none';
        let exp = document.getElementById('explosion');
        exp.style.bottom = coheteVis.style.bottom;
        exp.style.display = 'block';
        setTimeout(() => { exp.style.transform = 'translateX(-50%) scale(4)'; exp.style.opacity = '0'; }, 20);
        delay = 1500;
    } else if (titulo.includes("TERMINADA")) {
        coheteRot.style.transform = 'rotate(90deg)';
        let msj = document.getElementById('mensaje-orbita');
        msj.style.display = 'block';
        setTimeout(() => { msj.style.opacity = '1'; }, 50);
        delay = 3500;
    }

    setTimeout(() => {
        document.getElementById('simulador-ui').style.display = 'none';
        document.getElementById('panel-resultados').style.display = 'flex';
        document.getElementById('res-titulo').innerText = titulo === 'Misión Abortada' ? titulo : "ANÁLISIS DE LA MISIÓN";
        document.getElementById('res-motivo').innerText = motivo;
        rellenarTsiolkovski();
        crearGraficas();
    }, delay);
}

/** Muestra el balance de velocidad del vuelo: Δv ideal de Tsiolkovski menos las pérdidas. */
function rellenarTsiolkovski() {
    document.getElementById('res-dv-ideal').innerText = dvIdeal.toFixed(0) + " m/s";
    document.getElementById('res-dv-grav').innerText = "− " + perdidaGravedad.toFixed(0) + " m/s";
    document.getElementById('res-dv-roce').innerText = "− " + perdidaRozamiento.toFixed(0) + " m/s";
    document.getElementById('res-dv-real').innerText = velocidad.toFixed(0) + " m/s";
}

/** Configuración común de las gráficas de línea (eje X = tiempo). */
function configGrafica(label, data, color, yAxisLabel) {
    return {
        type: 'line',
        data: { labels: histTiempo, datasets: [{ label: label, data: data, borderColor: color, backgroundColor: color + '33', fill: true, tension: 0.1, pointRadius: 0 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Tiempo (s)', color: '#ccc' }, ticks: { color: '#888' } },
                y: { title: { display: true, text: yAxisLabel, color: '#ccc' }, ticks: { color: '#888' } }
            },
            plugins: { legend: { labels: { color: 'white' } } }
        }
    };
}

// ----------------------------------------------------------
// GRÁFICAS: definición, vista pequeña y vista ampliada
// ----------------------------------------------------------

/**
 * Cada gráfica define: canvas pequeño, datos, color, unidad y la información de la vista ampliada:
 *   muestra  -> qué representa la gráfica (explicación general, válida para cualquier motor y cualquier partida)
 *   fijarse  -> en qué elementos de la curva hay que fijarse para entender lo que pasó y qué significan
 *   informe  -> apartado del informe en el que se basa
 * Los textos están redactados a partir del informe "La ciencia detrás del despegue" (Clara García Casillas).
 */
const GRAFICAS = {
    altitud: {
        canvas: 'grafico-altitud', etiqueta: 'Altitud (m)', color: '#4da6ff', unidad: 'm', datos: () => histAlt,
        titulo: 'Altitud', capas: true,
        muestra: [
            'Altura del cohete sobre la plataforma, en metros, a lo largo del tiempo. Es la gráfica que responde a la pregunta principal de la misión: <strong>¿hasta dónde ha llegado el cohete?</strong>',
            'Las líneas horizontales discontinuas son los límites de las capas de la atmósfera según el informe: troposfera hasta 12000 m, estratosfera hasta 50000 m, mesosfera hasta 90000 m y termosfera hasta 500000 m. A partir de ahí está la exosfera, donde la misión se da por cumplida.'
        ],
        fijarse: [
            '<strong>La pendiente</strong> de la curva es la velocidad vertical: una curva más inclinada significa que el cohete sube más rápido; si se aplana, apenas gana altura.',
            '<strong>En qué capa está:</strong> en la troposfera el aire es más denso y se produce el Max-Q; en la mesosfera se separan normalmente las etapas; en la termosfera se libera la carga útil.',
            '<strong>Los cambios de pendiente</strong> señalan eventos: una bajada de potencia, el agotamiento de una etapa o su separación. Las líneas verticales marcan el Max-Q, la separación de la etapa 1 y la liberación de la carga útil cuando han ocurrido.',
            '<strong>Dónde termina la curva:</strong> si llega a 500000 m el cohete alcanzó la exosfera; si termina antes, la misión acabó antes de lograrlo.'
        ],
        informe: 'Informe: apartado 8 (Cómo afectan las capas de la atmósfera al cohete).'
    },
    velocidad: {
        canvas: 'grafico-velocidad', etiqueta: 'Velocidad (m/s)', color: '#ffaa00', unidad: 'm/s', datos: () => histVel,
        titulo: 'Velocidad',
        muestra: [
            'Velocidad vertical del cohete en m/s. Indica <strong>cuánta velocidad ha conseguido el motor</strong> y cómo la ha ido ganando.',
            'La ganancia teórica de velocidad la da la <strong>ecuación de Tsiolkovski</strong>, Δv = v<sub>e</sub> · ln(m<sub>0</sub> / m<sub>f</sub>): depende de la velocidad de salida de los gases y de cuánta masa pierde el cohete. A ese valor ideal se le restan las pérdidas por gravedad y por rozamiento con el aire, y lo que queda es la velocidad real que muestra la curva.'
        ],
        fijarse: [
            '<strong>Tramos que suben:</strong> el empuje supera al peso y al rozamiento. Cuanto más empinados, mayor es la aceleración.',
            '<strong>Tramos planos o que bajan:</strong> el empuje no compensa el peso y el rozamiento (potencia reducida o motor sin propelente). La gravedad frena al cohete unos 9,8 m/s cada segundo.',
            '<strong>La zona del Max-Q:</strong> la subida se frena porque hay que limitar la presión dinámica (q = ½ρv²). Los motores líquido e híbrido lo consiguen reduciendo la potencia; el sólido, con la forma de su grano.',
            '<strong>Tras separar la etapa 1</strong> el cohete se libera de su peso muerto y la curva vuelve a subir con más fuerza.',
            '<strong>La velocidad máxima y la final</strong>, comparadas con el Δv ideal de Tsiolkovski del recuadro de resultados: la diferencia son las pérdidas.'
        ],
        informe: 'Informe: apartado 6 (ecuación de Tsiolkovski) y apartado 8 (Max-Q).'
    },
    aceleracion: {
        canvas: 'grafico-aceleracion', etiqueta: 'Aceleración (m/s²)', color: '#ff00ff', unidad: 'm/s²', datos: () => histAcc,
        titulo: 'Aceleración',
        muestra: [
            'Cuánto cambia la velocidad cada segundo, en m/s². Es la <strong>pendiente de la gráfica de velocidad</strong> y muestra directamente el efecto del empuje y de la masa.',
            'Se obtiene aproximadamente como a ≈ F/m − g − rozamiento/m: la fuerza del motor dividida entre la masa, menos la gravedad y el aire. Por eso <strong>no es constante</strong>: con el mismo empuje, una masa menor da más aceleración.'
        ],
        fijarse: [
            '<strong>La tendencia a subir</strong> mientras el motor quema propelente: el cohete pesa cada vez menos y acelera cada vez más (conclusión 1 del informe).',
            '<strong>Saltos hacia arriba:</strong> pérdida repentina de masa, como al separar la etapa 1 o al soltar la carga útil.',
            '<strong>Bajadas:</strong> reducción de potencia (por ejemplo, durante el Max-Q) o cambio de etapa.',
            '<strong>El valor ≈ −9,8 m/s²:</strong> no hay empuje y solo actúa la gravedad (motor sin propelente o apagado).',
            '<strong>El valor 0:</strong> el empuje iguala al peso más el rozamiento y la velocidad se mantiene constante.',
            '<strong>Los valores más altos</strong> aparecen al final, cuando queda poca masa.'
        ],
        informe: 'Informe: apartado 6 (el cohete acelera cada vez más al perder masa) y conclusión 1.'
    },
    combustible: {
        canvas: 'grafico-combustible', etiqueta: 'Combustible (kg)', color: '#ff4444', unidad: 'kg', datos: () => histComb,
        titulo: 'Combustible (propelente)',
        muestra: [
            'Propelente que queda a bordo (etapa 1 más etapa 2), en kg. El <strong>propelente</strong> es la sustancia que se convierte en gases a alta presión y temperatura; esos gases, al salir por la tobera, generan el empuje.',
            'La gráfica sirve para ver <strong>cuánto propelente se gasta y a qué ritmo</strong>, que es lo que determina el empuje: F = ṁ·v<sub>e</sub> + A<sub>e</sub>(p<sub>e</sub> − p<sub>0</sub>), donde ṁ es el caudal de propelente.'
        ],
        fijarse: [
            '<strong>La pendiente</strong> es el caudal ṁ (kg/s): más inclinada significa más propelente quemado por segundo y, por tanto, más empuje.',
            '<strong>Un tramo menos inclinado</strong> indica potencia reducida. En los motores líquido e híbrido la decide el piloto; en el sólido no se regula y solo cambia por la forma del grano.',
            '<strong>Los tramos planos</strong> son momentos sin quemar propelente: motor apagado o, por ejemplo, entre que se agota la etapa 1 y se separa para encender la etapa 2.',
            '<strong>El valor final:</strong> si llega a 0 se ha agotado todo el propelente; si queda, había reserva.'
        ],
        informe: 'Informe: palabras clave (propelente), apartado 4.4 (sistema de propulsión) y apartado 6.'
    },
    masa: {
        canvas: 'grafico-masa', etiqueta: 'Masa Total (kg) - Saltos por separación', color: '#00ff00', unidad: 'kg', datos: () => histMasa,
        titulo: 'Masa total del cohete',
        muestra: [
            'Masa total del cohete en kg a lo largo del vuelo. Explica <strong>cuánto peso tiene que empujar el motor en cada momento</strong>.',
            'En la ecuación de Tsiolkovski esta gráfica es la relación m<sub>0</sub> / m<sub>f</sub> (masa inicial entre masa final): cuanta más masa pierde el cohete, mayor es el Δv que consigue.'
        ],
        fijarse: [
            '<strong>El descenso suave y continuo</strong> es el propelente que se va quemando (sigue el mismo ritmo que la gráfica de combustible).',
            '<strong>Los saltos bruscos hacia abajo</strong> son masa que se suelta de golpe: la estructura vacía de la etapa 1 (' + masaVacia1 + ' kg) al separarla y la carga útil (' + masaCargaUtil + ' kg) al liberarla.',
            '<strong>Por qué existen las etapas:</strong> descartar el peso muerto que, si no, seguiría complicando el avance del cohete. Liberar toneladas mejora la eficiencia del vuelo.',
            '<strong>La masa inicial y la final:</strong> su cociente determina el Δv ideal.'
        ],
        informe: 'Informe: apartado 3.3 (etapas de un cohete), apartado 6 (Tsiolkovski) y conclusión 3.'
    }
};

/** Índice de la muestra del historial más cercana al instante t (s). */
function indiceEnTiempo(t) {
    return histTiempo.reduce((im, v, i) => Math.abs(Number(v) - t) < Math.abs(Number(histTiempo[im]) - t) ? i : im, 0);
}

/** Dibuja las 5 gráficas pequeñas con el historial registrado durante el vuelo. */
function crearGraficas() {
    Object.values(GRAFICAS).forEach(g => new Chart(document.getElementById(g.canvas), configGrafica(g.etiqueta, g.datos(), g.color, g.unidad)));
}

// ---------- Vista ampliada ----------
let graficaAmpliada = null;

/** Plugin de Chart.js: marca con líneas verticales los hitos del vuelo (Max-Q, separación, carga útil). */
const pluginHitos = {
    id: 'hitos',
    afterDraw(chart) {
        const hitos = [
            { t: tiempoPicoQ, texto: 'Max-Q', color: '#ffeb3b' },
            { t: tiempoSeparacion, texto: 'Separación etapa 1', color: '#ff8a65' },
            { t: tiempoCarga, texto: 'Carga útil', color: '#4dd0e1' }
        ].filter(h => h.t !== null);
        const { ctx, chartArea, scales } = chart;
        ctx.save();
        ctx.font = '12px Segoe UI, sans-serif';
        hitos.forEach((h, n) => {
            const x = scales.x.getPixelForValue(indiceEnTiempo(h.t));
            ctx.strokeStyle = h.color; ctx.fillStyle = h.color; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke();
            ctx.setLineDash([]);
            const ancho = ctx.measureText(h.texto).width;
            ctx.fillText(h.texto, Math.min(x + 4, chartArea.right - ancho), chartArea.top + 14 + n * 16);
        });
        ctx.restore();
    }
};

/** Plugin de Chart.js (solo altitud): líneas horizontales en los límites de las capas de la atmósfera. */
const pluginCapas = {
    id: 'capas',
    afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        ctx.save();
        ctx.font = '11px Segoe UI, sans-serif'; ctx.setLineDash([2, 4]); ctx.strokeStyle = '#888'; ctx.fillStyle = '#aaa';
        CAPAS.forEach((c, i) => {
            if (i === CAPAS.length - 1) return;
            const y = scales.y.getPixelForValue(c.hasta);
            if (y < chartArea.top || y > chartArea.bottom) return;
            ctx.beginPath(); ctx.moveTo(chartArea.left, y); ctx.lineTo(chartArea.right, y); ctx.stroke();
            ctx.fillText(c.nombre + ' / ' + CAPAS[i + 1].nombre + ' (' + c.hasta + ' m)', chartArea.left + 6, y - 4);
        });
        ctx.restore();
    }
};

/** Abre el recuadro con la gráfica ampliada y su explicación. */
function ampliarGrafica(clave) {
    const g = GRAFICAS[clave];
    if (!g) return;
    document.getElementById('mg-titulo').innerText = g.titulo;
    document.getElementById('mg-descripcion').innerHTML = g.muestra.map(p => '<p>' + p + '</p>').join('');
    document.getElementById('mg-fijarse').innerHTML = g.fijarse.map(d => '<li>' + d + '</li>').join('');
    document.getElementById('mg-informe').innerText = g.informe;
    document.getElementById('modal-grafica').style.display = 'flex';

    if (graficaAmpliada) graficaAmpliada.destroy();
    const config = configGrafica(g.etiqueta, g.datos(), g.color, g.unidad);
    config.plugins = [pluginHitos].concat(g.capas ? [pluginCapas] : []);
    graficaAmpliada = new Chart(document.getElementById('grafico-ampliado'), config);
}

/** Cierra la gráfica ampliada. */
function cerrarGrafica() {
    document.getElementById('modal-grafica').style.display = 'none';
    if (graficaAmpliada) { graficaAmpliada.destroy(); graficaAmpliada = null; }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarGrafica(); });
