/* ==========================================================
   controles.js
   Entrada del jugador: TVC (botones y teclado), selector de
   motor, arranque de la simulación y panel del copiloto.
   ========================================================== */

// ---------- TVC (control del vector de empuje) ----------

/** Traduce el estado de las teclas/botones a fuerzaTVC y marca el botón activo. */
function actualizarTVC() {
    if (teclas.izq && !teclas.der) {
        fuerzaTVC = -FUERZA_TVC_MAX;
        document.getElementById('btn-izq').classList.add('activo');
        document.getElementById('btn-der').classList.remove('activo');
    } else if (teclas.der && !teclas.izq) {
        fuerzaTVC = FUERZA_TVC_MAX;
        document.getElementById('btn-der').classList.add('activo');
        document.getElementById('btn-izq').classList.remove('activo');
    } else {
        fuerzaTVC = 0;
        document.getElementById('btn-izq').classList.remove('activo');
        document.getElementById('btn-der').classList.remove('activo');
    }
}

// Teclado: solo responde con el tutorial cerrado y entre ALT_AVISO_TVC y ALT_VIENTO_FIN (zona de vientos)
document.addEventListener('keydown', function (event) {
    if (pasoActual >= pasosTutorial.length && altitud >= ALT_AVISO_TVC && altitud <= ALT_VIENTO_FIN) {
        if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") { teclas.izq = true; event.preventDefault(); }
        if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") { teclas.der = true; event.preventDefault(); }
        actualizarTVC();
    }
});

document.addEventListener('keyup', function (event) {
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") teclas.izq = false;
    if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") teclas.der = false;
    actualizarTVC();
});

// ---------- Foco ----------
// Quitar el foco tras interactuar para que las flechas del teclado no muevan la palanca/selector
acelerador.addEventListener('mouseup', () => { acelerador.blur(); window.focus(); });
acelerador.addEventListener('touchend', () => { acelerador.blur(); window.focus(); });
document.querySelectorAll('button').forEach(btn => btn.addEventListener('mouseup', () => { btn.blur(); window.focus(); }));

// ---------- Copiloto ----------

/** Muestra un mensaje en el panel del copiloto. clase: normal | aviso | exito | peligro */
function setAlerta(texto, clase) {
    panelAlertas.innerHTML = texto;
    panelAlertas.className = '';
    panelAlertas.classList.add('alerta-' + clase);
}

// ---------- Selector de motor ----------
// Sólido: se oculta la palanca y aparece el botón START (potencia fija).
// Líquido/Híbrido: palanca manual. (Nota: híbrido se comporta igual que líquido.)
selectorMotor.addEventListener('change', (e) => {
    if (e.target.value === 'solido') {
        document.getElementById('contenedor-palanca').style.display = 'none';
        document.getElementById('panel-solido-start').style.display = 'flex';
        setAlerta("MOTOR SÓLIDO SELECCIONADO.<br>Pulsa START para un despegue incontrolable a máxima potencia.", "aviso");
    } else {
        document.getElementById('contenedor-palanca').style.display = 'flex';
        document.getElementById('panel-solido-start').style.display = 'none';
        acelerador.value = 0;
        document.getElementById('txt-pot').innerText = "0";
        acelerador.disabled = false;
        setAlerta("SISTEMAS NOMINALES.<br>Suba la palanca de potencia para despegar.", "normal");
    }
    selectorMotor.blur();
    window.focus();
});

// ---------- Arranque de la simulación ----------

/** Botón START del motor sólido. */
function iniciarSolido() {
    document.getElementById('btn-start-solido').style.display = 'none';
    document.getElementById('txt-pot-solido').innerText = "100";
    iniciarSimulacion();
}

// Líquido/híbrido: la simulación arranca al mover la palanca por encima de 0
acelerador.addEventListener('input', (e) => {
    document.getElementById('txt-pot').innerText = e.target.value;
    if (!simulacionIniciada && e.target.value > 0) iniciarSimulacion();
});

/** Bloquea el selector de motor y lanza el bucle físico. */
function iniciarSimulacion() {
    simulacionIniciada = true;
    selectorMotor.disabled = true;
    setAlerta("DESPEGUE.<br>Troposfera: Densidad atmosférica máxima.", "normal");
    timer = setInterval(bucleFisico, INTERVALO_MS);
}

/** Cierra el modal didáctico del motor sólido y reanuda el vuelo. */
function reanudarSimulacion() {
    document.getElementById('modal-info').style.display = 'none';
    document.getElementById('txt-pot-solido').innerText = "55 (AUTO)";
    timer = setInterval(bucleFisico, INTERVALO_MS);
    window.focus();
}
