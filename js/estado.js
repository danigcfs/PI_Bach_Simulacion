/* ==========================================================
   estado.js
   Parámetros del cohete, estado de la simulación y referencias
   a elementos del DOM. Todo se comparte con el resto de scripts.
   ========================================================== */

// ---------- Constantes físicas / de juego ----------
const GRAVEDAD = 9.81;          // m/s² (se mantiene constante en toda la simulación)
const DT = 0.1;                 // paso de tiempo de la simulación (s)
const INTERVALO_MS = 42;        // cada cuántos ms real se ejecuta un paso (42 ms real = 0.1 s simulado -> la simulación va x2,4; con 50 ms iba x2)
const DENSIDAD_NIVEL_MAR = 1.225;   // kg/m³
const PRESION_NIVEL_MAR = 1013.25;  // hPa
const ESCALA_ATM = 8000;        // altura de escala de la atmósfera (m), modelo exponencial
const AREA_CD = 0.5 * 10;       // Cd · Área frontal (m²): Cd = 0,5 y 10 m² de sección. Fuerza de rozamiento = q · AREA_CD
const VEL_ESCAPE_GASES = 3000;          // m/s, velocidad efectiva de salida (motor líquido/híbrido). El informe habla de "más de 10.000 km/h" (≈ 2.800 m/s)
const VEL_ESCAPE_GASES_SOLIDO = 2800;   // m/s, motor sólido (menor impulso específico que el líquido)
const TIEMPO_QUEMADO_ETAPA1 = 100;      // s que tarda en agotarse el propelente de la etapa 1 a potencia máxima
const TIEMPO_QUEMADO_ETAPA2 = 70;       // s que tarda en agotarse el propelente de la etapa 2 a potencia máxima

// ---------- Empuje: F = ṁ·Ve + Ae·(pe − p0)  (informe, apartado 6) ----------
// ṁ = caudal de propelente, Ve = velocidad de salida de los gases, Ae = área de salida de la tobera,
// pe = presión de los gases a la salida (proporcional a la potencia, como la presión de la cámara) y p0 = presión exterior.
const AREA_SALIDA_ETAPA1 = 1.2;         // m²: tobera de nivel del mar
const AREA_SALIDA_ETAPA2 = 3.0;         // m²: tobera de vacío (más grande)
const PRESION_SALIDA_ETAPA1 = 70000;    // Pa a potencia máxima: algo por debajo de la atmósfera al nivel del mar (101 kPa)
const PRESION_SALIDA_ETAPA2 = 5000;     // Pa a potencia máxima

// ---------- Max-Q (presión dinámica) ----------
// q = ½·ρ·v². Si q supera el límite estructural el chasis se destruye (en cualquier motor).
const Q_MAX = 17500;            // Pa (17,5 kPa): límite estructural del lanzador
const Q_AVISO = 0.35;           // fracción de Q_MAX a partir de la cual el copiloto avisa de la aproximación a Max-Q
const Q_PELIGRO = 0.6;          // fracción de Q_MAX a partir de la cual hay que reducir potencia YA
const POTENCIA_SEGURA_MAXQ = 0.65;      // potencia recomendada durante el Max-Q: con ≤ 65 % q deja de crecer (empuje ≈ peso + rozamiento)
const ALT_FIN_MAXQ = 16000;     // m: por encima de esta altitud se puede volver a acelerar al 100 % sin riesgo de un segundo pico de q (comprobado con potencias de 40-65 %)

// ---------- Motor sólido: forma del grano ----------
// El hueco en estrella del grano reduce el empuje cuando se ha quemado entre el 18 % y el 75 % del propelente de la etapa 1,
// que es justo el tramo en el que se produce el Max-Q.
const SOLIDO_GRANO_INICIO = 0.18;       // fracción quemada a la que empieza la reducción
const SOLIDO_GRANO_FIN = 0.75;          // fracción quemada a la que termina
const SOLIDO_POTENCIA_REDUCIDA = 0.55;  // potencia (0-1) durante la reducción

// ---------- Capas de la atmósfera (misma tabla para minimapa, telemetría y avisos) ----------
// "hasta" = altitud (m) donde termina la capa. Cada capa ocupa un 20 % de la barra del minimapa.
const CAPAS = [
    { id: 'm-tro', nombre: 'TROPOSFERA',   hasta: 12000 },
    { id: 'm-est', nombre: 'ESTRATOSFERA', hasta: 50000 },
    { id: 'm-mes', nombre: 'MESOSFERA',    hasta: 90000 },
    { id: 'm-ter', nombre: 'TERMOSFERA',   hasta: 500000 },
    { id: 'm-exo', nombre: 'EXOSFERA',     hasta: 1000000 }
];
const ANGULO_LIMITE = 35;       // grados: por encima el cohete pierde el control
// ---------- Altitudes de los eventos (m) ----------
const ALT_AVISO_TVC = 18000;            // aparece el panel TVC (aviso previo del viento); el teclado ya responde
const ALT_VIENTO_INICIO = 20000;        // empieza el viento cruzado
const ALT_VIENTO_FIN = 40000;           // termina el viento cruzado
const ALT_CARGA = 90000;                // se habilita soltar la carga útil
const ALT_AVISO_TERMOSFERA = 100000;    // el copiloto recuerda soltar la carga

// ---------- Viento y TVC ----------
const FUERZA_VIENTO = 12;       // °/s de giro que provoca el viento
const FUERZA_TVC_MAX = 16;      // °/s de giro que corrige el TVC
const PERIODO_VIENTO = 6;       // s simulados que dura el viento en cada sentido antes de invertirse
const ESTABILIDAD_PASIVA = 0.15;    // 1/s: las aletas (centro de presión bajo el de gravedad) enderezan el cohete en proporción al ángulo

// ---------- Flags de eventos (cada aviso/hito solo ocurre una vez) ----------
let timer = null;               // id del setInterval del bucle físico
let simulacionIniciada = false;
let etapa1Acoplada = true;
let cargaAcoplada = true;
let maxQSuperado = false;
let faseMaxQ = '';              // último aviso de Max-Q mostrado: previa | peligro | optima | solido | superado
let avisoVientoPre = false;
let avisoViento = false;
let avisoSeparacion = false;
let avisoTermosfera = false;
let infoSolidoMostrada = false;
let basuraMostrada = false;

// ---------- Orientación y control ----------
let anguloCohete = 0;   // inclinación actual (°)
let fuerzaViento = 0;   // empuje lateral del viento en el tick actual
let fuerzaTVC = 0;      // corrección aplicada por el jugador
let teclas = { izq: false, der: false };

// ---------- Etapa 1 una vez separada (caída libre) ----------
let altitudEtapa1 = 0;
let velocidadEtapa1 = 0;

// ---------- Masas (kg) ----------
let masaCargaUtil = 5000;
let masaVacia1 = 4000,  masaProp1Inicial = 30000, masaProp1 = 30000;
let masaVacia2 = 1500,  masaProp2Inicial = 8000,  masaProp2 = 8000;
let masaTotalInicial = masaCargaUtil + masaVacia1 + masaProp1Inicial + masaVacia2 + masaProp2Inicial;
let masaActual = masaTotalInicial;

// ---------- Propulsión del tick actual (los calcula quemarCombustible) ----------
let empuje = 0;                 // N: F = ṁ·Ve + Ae·(pe − p0)
let veEfectiva = 0;             // m/s: velocidad de salida efectiva = F / ṁ
let masaInicioTick = masaTotalInicial;  // kg: masa justo antes de quemar propelente en este tick

// ---------- Ecuación de Tsiolkovski acumulada durante el vuelo (m/s) ----------
let dvIdeal = 0;                // Σ Ve_ef · ln(m0/mf): lo que daría el motor sin gravedad ni aire
let perdidaGravedad = 0;        // Σ g · dt
let perdidaRozamiento = 0;      // Σ (rozamiento / masa) · dt

// ---------- Cinemática ----------
let altitud = 0, velocidad = 0, aceleracion = 0, tiempo = 0;   // unidades del programa: altitud en m, velocidad en m/s, aceleración en m/s², tiempo en s
let tiempoSeparacion = null, tiempoCarga = null, tiempoPicoQ = null;   // s: instantes de los hitos del vuelo (para marcarlos en las gráficas)
let presionDinamica = 0, presionDinamicaAnterior = 0, presionDinamicaPico = 0;   // Pa: q del tick actual, del anterior y máximo del vuelo
let tiempoGrafica = 0;  // acumulador para muestrear las gráficas cada 1 s
let histTiempo = [], histAlt = [], histVel = [], histComb = [], histMasa = [], histAcc = [];

// ---------- Referencias al DOM usadas con frecuencia ----------
const acelerador = document.getElementById('acelerador');
const selectorMotor = document.getElementById('selector-motor');
const panelAlertas = document.getElementById('panel-alertas');
const coheteVis = document.getElementById('cohete-ensamblaje');
const coheteRot = document.getElementById('cohete-rotacion');
const alertaPantalla = document.getElementById('alerta-pantalla');
const fuego1 = document.getElementById('fuego-motor1');
const fuego2 = document.getElementById('fuego-motor2');
