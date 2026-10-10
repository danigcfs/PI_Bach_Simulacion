/* ==========================================================
   fisica.js
   Bucle principal: física del cohete y actualización de la
   pantalla en cada tick (ver INTERVALO_MS y DT en estado.js).

   Orden de cada tick (bucleFisico):
     1. Habilitar botones     5. Minimapa y posición en pantalla
     2. Potencia del motor    6. Viento y TVC
     3. Combustible y empuje  7. Max-Q (presión dinámica), capas y avisos
     4. Movimiento (Tsiolkovski)  8. Telemetría, cielo y barras + historial
   Las funciones que pueden terminar la misión devuelven un
   valor para que el bucle se detenga (equivale al antiguo `return`).
   ========================================================== */

/** Un tick de simulación. */
function bucleFisico() {
    tiempo += DT;

    habilitarBotones();

    // 2. Potencia (null = simulación en pausa por el modal didáctico)
    let potenciaReal = calcularPotencia();
    if (potenciaReal === null) return;

    // 3-4. Motor (empuje y Ve efectiva) y movimiento (Tsiolkovski + gravedad + rozamiento)
    quemarCombustible(potenciaReal);
    let estrellado = integrarMovimiento();
    if (estrellado) return;

    let alt = altitud;

    // 5. Pantalla: minimapa, altura del cohete y etapa 1 cayendo
    actualizarMinimapa(alt);
    let screenYCohete = 60 + Math.min(70, alt / 500);   // px sobre el suelo (2 px por cada 1000 m); se estabiliza a los 35000 m
    actualizarEtapaCayendo(screenYCohete);

    // 6. Viento / TVC
    let perdioControl = actualizarViento(alt);
    if (perdioControl) return;

    // 7. Max-Q, capas y avisos (null = misión terminada por Max-Q)
    let capaTexto = actualizarCapasYAvisos(alt);
    if (capaTexto === null) return;

    // 8. Telemetría, cielo, posición y barras
    actualizarTelemetria(alt, capaTexto, screenYCohete);
    registrarHistorial(alt);
}

// ----------------------------------------------------------
// 1. BOTONES
// ----------------------------------------------------------

/** Enciende los botones de separar (sin combustible en etapa 1) y de carga (>= ALT_CARGA). */
function habilitarBotones() {
    let alt = altitud;
    if (etapa1Acoplada && masaProp1 <= 0) {
        document.getElementById('btn-separar').classList.remove('btn-apagado');
    }
    if (cargaAcoplada && alt >= ALT_CARGA) {
        document.getElementById('btn-carga').classList.remove('btn-apagado');
    }
}

// ----------------------------------------------------------
// 2. POTENCIA
// ----------------------------------------------------------

/**
 * Devuelve la potencia (0 a 1).
 * - Líquido/Híbrido: la palanca del jugador.
 * - Sólido: 100 %, salvo SOLIDO_POTENCIA_REDUCIDA mientras se quema el tramo del grano en estrella
 *   (entre SOLIDO_GRANO_INICIO y SOLIDO_GRANO_FIN del propelente de la etapa 1), que coincide con el Max-Q.
 *   La primera vez pausa el juego para mostrar el modal didáctico (devuelve null).
 */
function calcularPotencia() {
    if (selectorMotor.value === 'solido') {
        const fraccionQuemada = 1 - masaProp1 / masaProp1Inicial;
        if (fraccionQuemada >= SOLIDO_GRANO_INICIO && fraccionQuemada <= SOLIDO_GRANO_FIN) {
            if (!infoSolidoMostrada) {
                infoSolidoMostrada = true;
                clearInterval(timer);
                document.getElementById('modal-info').style.display = 'flex';
                return null;
            }
            document.getElementById('txt-pot-solido').innerText = Math.round(SOLIDO_POTENCIA_REDUCIDA * 100) + " (AUTO MAX-Q)";
            return SOLIDO_POTENCIA_REDUCIDA;
        }
        document.getElementById('txt-pot-solido').innerText = "100";
        return 1.0;
    }
    return parseInt(acelerador.value) / 100;
}

// ----------------------------------------------------------
// 3. COMBUSTIBLE Y EMPUJE
// ----------------------------------------------------------

/** Masa total del cohete (kg): carga + etapa 1 (si sigue acoplada) + etapa 2. */
function masaTotal() {
    return (cargaAcoplada ? masaCargaUtil : 0)
         + (etapa1Acoplada ? masaVacia1 + masaProp1 : 0)
         + masaVacia2 + masaProp2;
}

/**
 * Consume propelente de la etapa activa y calcula el empuje con la fórmula del informe:
 *   caudal           ṁ  = (propelente inicial / tiempo de quemado) · potencia
 *   empuje           F  = ṁ · Ve + Ae · (pe − p0)
 *   Ve efectiva      Ve_ef = F / ṁ   (es la "velocidad de salida efectiva" que usa Tsiolkovski)
 * Deja el resultado en las variables globales empuje y veEfectiva.
 * Si la presión de salida no compensa la exterior (potencia muy baja a baja altura) el término de presión
 * puede anular el empuje; se limita a 0 (una tobera real tendría desprendimiento de flujo).
 */
function quemarCombustible(potenciaReal) {
    masaInicioTick = masaTotal();
    empuje = 0;
    veEfectiva = 0;
    let propActual = etapa1Acoplada ? masaProp1 : masaProp2;

    if (propActual > 0 && potenciaReal > 0) {
        // Llama de la etapa activa
        fuego1.style.display = etapa1Acoplada ? 'block' : 'none';
        fuego2.style.display = etapa1Acoplada ? 'none' : 'block';

        // Cada etapa agota su propelente en TIEMPO_QUEMADO_ETAPAx segundos a potencia máxima
        let flujoBase = etapa1Acoplada ? (masaProp1Inicial / TIEMPO_QUEMADO_ETAPA1) : (masaProp2Inicial / TIEMPO_QUEMADO_ETAPA2);
        let masaQuemada = Math.min(flujoBase * potenciaReal * DT, propActual);   // kg quemados en este tick
        let flujo = masaQuemada / DT;                                           // kg/s (ṁ)

        if (etapa1Acoplada) masaProp1 -= masaQuemada;
        else masaProp2 -= masaQuemada;

        let ve = (selectorMotor.value === 'solido') ? VEL_ESCAPE_GASES_SOLIDO : VEL_ESCAPE_GASES;
        let areaSalida = etapa1Acoplada ? AREA_SALIDA_ETAPA1 : AREA_SALIDA_ETAPA2;
        let presionSalida = (etapa1Acoplada ? PRESION_SALIDA_ETAPA1 : PRESION_SALIDA_ETAPA2) * potenciaReal;   // Pa
        let presionExterior = presionAire(altitud) * 100;                       // hPa -> Pa

        empuje = Math.max(0, flujo * ve + areaSalida * (presionSalida - presionExterior));
        veEfectiva = empuje / flujo;
    } else {
        fuego1.style.display = 'none';
        fuego2.style.display = 'none';
    }
}

// ----------------------------------------------------------
// 4. MOVIMIENTO
// ----------------------------------------------------------

/** Densidad del aire (kg/m³) a la altitud h (m): modelo exponencial. */
function densidadAire(h) { return DENSIDAD_NIVEL_MAR * Math.exp(-h / ESCALA_ATM); }

/** Presión atmosférica (hPa) a la altitud h (m). */
function presionAire(h) { return PRESION_NIVEL_MAR * Math.exp(-h / ESCALA_ATM); }

/** Presión dinámica q = ½·ρ·v² (Pa) a la altitud h (m) y velocidad v (m/s). */
function calcularPresionDinamica(h, v) { return 0.5 * densidadAire(h) * v * v; }

/** Índice (en CAPAS) de la capa atmosférica a la altitud alt (m). */
function indiceCapa(alt) {
    const i = CAPAS.findIndex(c => alt < c.hasta);
    return i === -1 ? CAPAS.length - 1 : i;
}

/**
 * Integra el movimiento vertical sumando, en cada tick, tres variaciones de velocidad:
 *   Δv empuje    = Ve_ef · ln(m0 / mf)        ecuación de Tsiolkovski aplicada al propelente quemado en el tick
 *   Δv gravedad  = −g · dt
 *   Δv rozamiento = (rozamiento / masa) · dt   con rozamiento = q · Cd·A, opuesto a la velocidad
 * y después h = h + v·dt. Devuelve true si el cohete se estrella (y termina la misión).
 */
function integrarMovimiento() {
    let m0 = masaInicioTick;     // masa antes de quemar en este tick
    let mf = masaTotal();        // masa después de quemar
    masaActual = mf;

    // Presión dinámica q = ½·ρ·v² (Pa); es la que decide si el cohete sobrevive al Max-Q (ver comprobarMaxQ)
    presionDinamicaAnterior = presionDinamica;
    presionDinamica = calcularPresionDinamica(altitud, velocidad);
    if (presionDinamica > presionDinamicaPico) { presionDinamicaPico = presionDinamica; tiempoPicoQ = tiempo; }

    // Rozamiento aerodinámico: q·(Cd·A), siempre opuesto a la velocidad
    let roce = presionDinamica * AREA_CD * -Math.sign(velocidad);

    let dvEmpuje = (empuje > 0 && mf < m0) ? veEfectiva * Math.log(m0 / mf) : 0;
    let dvGravedad = -GRAVEDAD * DT;
    let dvRoce = (roce / ((m0 + mf) / 2)) * DT;

    let velocidadAnterior = velocidad;
    velocidad += dvEmpuje + dvGravedad + dvRoce;
    aceleracion = (velocidad - velocidadAnterior) / DT;
    altitud += velocidad * DT;

    // Contacto con el suelo
    if (altitud < 0) {
        if (velocidad < -5) {
            finalizarMision("💥 COHETE ESTRELLADO 💥", "Impacto contra el suelo a gran velocidad.");
            return true;
        }
        altitud = 0; velocidad = 0; aceleracion = 0;   // en la plataforma: no se acumula nada
    } else {
        dvIdeal += dvEmpuje;
        perdidaGravedad -= dvGravedad;
        perdidaRozamiento -= dvRoce;
    }
    return false;
}

// ----------------------------------------------------------
// 5. MINIMAPA Y ETAPA 1 CAYENDO
// ----------------------------------------------------------

/** Ilumina la capa atmosférica actual y coloca el marcador (cada capa ocupa un 20 % de la barra). */
function actualizarMinimapa(alt) {
    const i = indiceCapa(alt);
    document.querySelectorAll('.mini-capa').forEach(el => el.classList.remove('activa'));
    document.getElementById(CAPAS[i].id).classList.add('activa');

    // Posición vertical (%) del marcador: interpolación lineal dentro de la capa
    const desde = i === 0 ? 0 : CAPAS[i - 1].hasta;
    const pct = i * 20 + ((alt - desde) / (CAPAS[i].hasta - desde)) * 20;

    document.getElementById('mini-marcador').style.bottom = Math.min(95, Math.max(0, pct)) + '%';
}

/** Anima la etapa 1 ya separada: caída libre (solo gravedad) respecto al cohete. */
function actualizarEtapaCayendo(screenYCohete) {
    if (etapa1Acoplada || altitudEtapa1 <= 0) return;

    velocidadEtapa1 -= GRAVEDAD * DT;
    altitudEtapa1 += velocidadEtapa1 * DT;

    let diffMetros = altitud - altitudEtapa1;
    let diffPx = (diffMetros / 100) * 15;   // 15 px por cada 100 m de diferencia
    document.getElementById('etapa1-cayendo').style.bottom = (screenYCohete - diffPx - 60) + 'px';

    // Desaparece al salir de pantalla o tocar el suelo
    if (screenYCohete - diffPx < -300 || altitudEtapa1 <= 0) {
        document.getElementById('etapa1-cayendo').style.display = 'none';
        altitudEtapa1 = 0;
    }
}

// ----------------------------------------------------------
// 6. VIENTO Y TVC
// ----------------------------------------------------------

/**
 * Entre ALT_VIENTO_INICIO y ALT_VIENTO_FIN (20000-40000 m) el viento empuja el cohete (cambia de sentido cada PERIODO_VIENTO s) y el
 * jugador lo corrige con el TVC:  ángulo += (viento + TVC - ESTABILIDAD_PASIVA·ángulo) · dt.
 * Fuera de esa zona el ángulo se amortigua hacia 0.
 * Devuelve true si el ángulo supera el límite (pérdida de control).
 */
function actualizarViento(alt) {
    const panelTvc = document.getElementById('panel-tvc');
    const indViento = document.getElementById('ind-viento');

    // Aviso previo (ALT_AVISO_TVC): aparece el panel TVC
    if (alt >= ALT_AVISO_TVC && alt < ALT_VIENTO_INICIO && !avisoVientoPre) {
        avisoVientoPre = true;
        panelTvc.style.display = 'block';
        setAlerta("¡PREPARACIÓN TVC!<br>Cizalladuras inminentes a los " + ALT_VIENTO_INICIO + " m.", "aviso");
        indViento.innerText = "VIENTO: ALERTA INMINENTE";
        panelTvc.style.borderColor = "yellow";
        indViento.style.color = "yellow";
    }

    if (alt >= ALT_VIENTO_INICIO && alt <= ALT_VIENTO_FIN) {
        panelTvc.style.borderColor = "orange";
        indViento.style.color = "orange";

        // Alterna el sentido del viento cada PERIODO_VIENTO s de tiempo simulado
        let ciclo = Math.floor(tiempo / PERIODO_VIENTO) % 2;
        if (ciclo === 0) {
            fuerzaViento = FUERZA_VIENTO;
            indViento.innerText = "VIENTO ▶▶▶ (Usa Izquierda)";
        } else {
            fuerzaViento = -FUERZA_VIENTO;
            indViento.innerText = "VIENTO ◀◀◀ (Usa Derecha)";
        }

        anguloCohete += (fuerzaViento + fuerzaTVC - ESTABILIDAD_PASIVA * anguloCohete) * DT;
        coheteRot.style.transform = `rotate(${anguloCohete}deg)`;

        if (Math.abs(anguloCohete) > ANGULO_LIMITE) {
            finalizarMision("💥 PÉRDIDA DE CONTROL 💥", "Las cizalladuras de viento volcaron el cohete (>35º).");
            return true;
        }
    } else if (alt > ALT_VIENTO_FIN || alt < ALT_AVISO_TVC) {
        // Sin viento: se oculta el panel y el cohete se endereza
        panelTvc.style.display = 'none';
        panelTvc.style.borderColor = "#555";
        indViento.innerText = "VIENTO: CALMA (0 m/s)";
        indViento.style.color = "#aaa";
        if (anguloCohete !== 0) {
            anguloCohete *= 0.9;
            coheteRot.style.transform = `rotate(${anguloCohete}deg)`;
        }
    }
    document.getElementById('t-ang').innerText = anguloCohete.toFixed(1) + "°";
}

// ----------------------------------------------------------
// 7. MAX-Q, CAPAS Y AVISOS
// ----------------------------------------------------------

/**
 * Max-Q: momento de máxima presión dinámica q = ½·ρ·v² (informe, apartado 8).
 * - Si q supera Q_MAX el chasis se destruye (cualquier motor).
 * - Avisos al jugador según q/Q_MAX y según q suba o baje:
 *     previa  -> q sube y supera Q_AVISO·Q_MAX: prepararse para reducir potencia
 *     peligro -> q sube y supera Q_PELIGRO·Q_MAX: reducir ya (la palanca por debajo de POTENCIA_SEGURA_MAXQ)
 *     optima  -> q ya no sube: la potencia es correcta
 *     superado-> pasada ALT_FIN_MAXQ: se puede volver a acelerar (antes, un segundo pico de q puede destruir el cohete);
 *                a partir de ahí ya no hay avisos de Max-Q, pero q > Q_MAX sigue destruyendo el cohete
 * Devuelve true si el cohete se destruye.
 */
function comprobarMaxQ(alt) {
    const ratio = presionDinamica / Q_MAX;
    const regulable = selectorMotor.value !== 'solido';

    if (presionDinamica > Q_MAX) {
        finalizarMision("💥 DESINTEGRACIÓN EN MAX-Q 💥",
            "La presión dinámica (" + (presionDinamica / 1000).toFixed(1) + " kPa) superó el límite estructural de " +
            (Q_MAX / 1000).toFixed(1) + " kPa. No redujiste la potencia a tiempo y la fricción aerodinámica destrozó el chasis.");
        return true;
    }

    const subiendo = presionDinamica > presionDinamicaAnterior;
    const huboPico = presionDinamicaPico >= Q_AVISO * Q_MAX;

    // Pasada ALT_FIN_MAXQ ya se puede volver a acelerar: el aire es tan poco denso que q no vuelve a ser crítica
    if (huboPico && alt >= ALT_FIN_MAXQ && !maxQSuperado) {
        maxQSuperado = true;
        avisarMaxQ('superado', "¡MAX-Q SUPERADO!<br>La atmósfera pierde densidad. Vuelve a acelerar.", "exito");
    }
    const enZona = huboPico && !maxQSuperado;

    coheteVis.classList.remove('sacudir');
    alertaPantalla.style.display = "none";

    if (enZona && regulable) {
        alertaPantalla.style.display = "block";
        if (subiendo && ratio >= Q_PELIGRO) {
            alertaPantalla.innerText = "¡PELIGRO: REDUCE POTENCIA!";
            alertaPantalla.style.color = "#ff4444";
            coheteVis.classList.add('sacudir');
            avisarMaxQ('peligro', "¡PELIGRO! Presión dinámica crítica.<br>Baja la palanca por debajo del " + (POTENCIA_SEGURA_MAXQ * 100) + " % YA.", "peligro");
        } else if (subiendo) {
            alertaPantalla.innerText = "APROXIMACIÓN A MAX-Q (PREPARA PARA FRENAR)";
            alertaPantalla.style.color = "orange";
            avisarMaxQ('previa', "¡ATENCIÓN! Acercándose a Max-Q (presión dinámica máxima).<br>Reduce la potencia por debajo del " + (POTENCIA_SEGURA_MAXQ * 100) + " %.", "aviso");
        } else {
            alertaPantalla.innerText = "POTENCIA ÓPTIMA. MANTÉN EL RUMBO";
            alertaPantalla.style.color = "#00ff00";
            avisarMaxQ('optima', "ZONA CRÍTICA MAX-Q.<br>Mantén la potencia baja hasta superar los " + ALT_FIN_MAXQ + " m.", "exito");
        }
    } else if (enZona) {
        avisarMaxQ('solido', "MAX-Q con motor sólido.<br>El grano reduce el empuje automáticamente.", "aviso");
    }
    return false;
}

/** Muestra un aviso de Max-Q solo cuando cambia de fase (evita reescribir el panel en cada tick). */
function avisarMaxQ(fase, texto, clase) {
    if (faseMaxQ === fase) return;
    faseMaxQ = fase;
    setAlerta(texto, clase);
}

/**
 * Gestiona el Max-Q y los eventos de cada capa atmosférica.
 * Devuelve el nombre de la capa actual, o null si la misión terminó por Max-Q.
 */
function actualizarCapasYAvisos(alt) {
    if (comprobarMaxQ(alt)) return null;

    const capa = CAPAS[indiceCapa(alt)];

    // Brillo rojo por calentamiento solo en la mesosfera
    coheteVis.style.filter = capa.id === 'm-mes' ? "drop-shadow(0 0 15px red)" : "none";

    switch (capa.id) {
        case 'm-est':
            if (!avisoViento && alt > ALT_VIENTO_INICIO) {
                avisoViento = true;
                setAlerta("ESTRATOSFERA: Cizalladuras de Viento.<br>Usa las FLECHAS (← / →) para estabilizar.", "aviso");
            }
            break;
        case 'm-mes':
            if (!avisoSeparacion) {
                avisoSeparacion = true;
                setAlerta("MESOSFERA (Fricción: 2000ºC).<br>Separa la etapa inactiva cuando te quedes sin combustible.", "normal");
            }
            break;
        case 'm-ter':
            if (alt > ALT_AVISO_TERMOSFERA && cargaAcoplada && !avisoTermosfera) {
                avisoTermosfera = true;
                setAlerta("TERMOSFERA.<br>El aire es casi nulo. Libera la carga útil en esta órbita baja.", "normal");
            }
            break;
        case 'm-exo':
            if (!basuraMostrada) {
                basuraMostrada = true;
                lanzarBasuraEspacial();
                setAlerta("EXOSFERA.<br>¡Cuidado con la basura espacial! Órbita final alcanzada.", "aviso");
                // Se espera 1.5 s para que se vea la basura antes de cerrar la misión
                setTimeout(() => finalizarMision("🚀 MISIÓN TERMINADA 🚀", "Has alcanzado la Exosfera, gestionando el Max-Q, el viento y las etapas a la perfección."), 1500);
            }
            break;
    }
    return capa.nombre;
}

/** Activa la animación de los 4 objetos que cruzan la pantalla en la exosfera. */
function lanzarBasuraEspacial() {
    ['b1', 'b2', 'b3', 'b4'].forEach((id, i) => {
        let obj = document.getElementById(id);
        obj.style.display = 'block';
        obj.style.animation = `pasarBasura ${3 + i * 0.5}s linear forwards ${i * 0.5}s`;
    });
}

// ----------------------------------------------------------
// 8. TELEMETRÍA, CIELO, BARRAS E HISTORIAL
// ----------------------------------------------------------

/** Actualiza panel de telemetría, color del cielo, posición del cohete y barras. */
function actualizarTelemetria(alt, capaTexto, screenYCohete) {
    document.getElementById('t-capa').innerText = capaTexto;
    document.getElementById('t-pres').innerText = presionAire(altitud).toFixed(0) + " hPa";
    const tq = document.getElementById('t-q');
    tq.innerText = (presionDinamica / 1000).toFixed(1) + " / " + (Q_MAX / 1000).toFixed(1) + " kPa";
    tq.style.color = presionDinamica >= Q_PELIGRO * Q_MAX ? "#ff4444" : (presionDinamica >= Q_AVISO * Q_MAX ? "orange" : "");
    document.getElementById('t-emp').innerText = (empuje / 1000).toFixed(0) + " kN";
    document.getElementById('t-dv').innerText = dvIdeal.toFixed(0) + " m/s";
    document.getElementById('t-tiempo').innerText = tiempo.toFixed(1) + " s";
    document.getElementById('t-alt').innerText = alt.toFixed(0) + " m";
    document.getElementById('t-vel').innerText = velocidad.toFixed(1) + " m/s";
    document.getElementById('t-acc').innerText = aceleracion.toFixed(1) + " m/s²";

    // Cielo: azul claro que se oscurece hasta negro a los 100000 m
    let factorOscuro = Math.max(0, 1 - (altitud / 100000));
    let r = Math.floor(135 * factorOscuro);
    let g = Math.floor(206 * factorOscuro);
    let b = Math.floor(235 * factorOscuro);
    document.getElementById('pantalla-central').style.backgroundColor = `rgb(${r},${g},${b})`;

    // Posición del cohete y del suelo (el suelo baja mientras la etapa 1 sigue acoplada)
    document.getElementById('cohete-ensamblaje').style.bottom = screenYCohete + 'px';
    if (etapa1Acoplada) {
        document.getElementById('suelo').style.bottom = Math.max(-100, -(altitud / 100)) + 'px';
    }

    // Barras de masa y combustible (% respecto al inicio)
    document.getElementById('fill-masa').style.height = ((masaActual / masaTotalInicial) * 100) + '%';
    document.getElementById('fill-comb').style.height = (((masaProp1 + masaProp2) / (masaProp1Inicial + masaProp2Inicial)) * 100) + '%';
}

/** Guarda una muestra para las gráficas cada 1 s de tiempo simulado. */
function registrarHistorial(alt) {
    tiempoGrafica += DT;
    if (tiempoGrafica >= 1.0) {
        tiempoGrafica = 0;
        histTiempo.push(tiempo.toFixed(1));
        histAlt.push(alt.toFixed(0));       // m
        histVel.push(velocidad.toFixed(1));   // m/s
        histAcc.push(aceleracion.toFixed(2));            // m/s²
        histComb.push((masaProp1 + masaProp2).toFixed(0));
        histMasa.push(masaActual.toFixed(0));
    }
}
