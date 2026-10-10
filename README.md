# 🚀 Simulador Espacial — La ciencia detrás del despegue

Simulador interactivo de vuelo de un cohete de dos etapas que se ejecuta directamente en el navegador. Es la **parte práctica** del Proyecto de Investigación *"La ciencia detrás del despegue"* de Clara García Casillas (tutor: Enrique Vargas), cuyo informe completo está en [INFORME/](INFORME/PI%20Bach%20Clara%20Garc%C3%ADa.pdf).

👉 **Pruébalo online: https://danigcfs.github.io/PI_Bach_Simulacion/**

## ¿Qué simula?

El jugador es el responsable de la misión y debe llevar el cohete desde la plataforma hasta la **exosfera** (500000 m de altitud) aplicando la física que explica el informe:

- **Empuje:** se calcula con la fórmula `F = ṁ·Ve + Ae·(pe − p0)` (caudal de propelente, velocidad de salida de los gases y presión de la tobera frente a la atmósfera).
- **Ecuación de Tsiolkovski:** en cada paso de tiempo la velocidad aumenta en `Δv = Ve·ln(m0/mf)`, menos la gravedad y el rozamiento del aire. Al terminar se muestra el balance entre el Δv ideal y las pérdidas.
- **Max-Q:** la presión dinámica `q = ½·ρ·v²` sube durante el ascenso hasta un máximo. Si supera el límite estructural (17,5 kPa) el cohete se desintegra, así que hay que reducir la potencia (por debajo del 65 %) cuando salta la alerta.
- **Viento y TVC:** en la estratosfera aparecen cizalladuras de viento que inclinan el cohete; hay que corregirlas con el control del vector de empuje (TVC).
- **Etapas y carga útil:** hay que separar la etapa 1 cuando se agota su combustible y soltar la carga útil en la termosfera. La masa total cae a saltos, algo que se ve después en las gráficas.
- **Tres tipos de motor:** *líquido* (control manual total), *híbrido* (mixto; se comporta como el líquido) y *sólido* (potencia máxima fija, no se puede apagar ni regular; el empuje baja solo durante el Max-Q gracias a la forma del grano).
- **Capas de la atmósfera:** troposfera (hasta 12000 m), estratosfera (hasta 50000 m), mesosfera (hasta 90000 m), termosfera (hasta 500000 m) y exosfera, con un minimapa que muestra en cuál estás.

Al terminar (misión cumplida, explosión o pérdida de control) aparece un **panel de resultados** con cinco gráficas del vuelo (altitud, velocidad, aceleración, combustible y masa). Si haces clic en una gráfica se amplía y se explica qué muestra y en qué fijarse para interpretarla.

## Cómo usarlo

1. Abre la web (enlace de arriba) o, en local, abre `index.html` en tu navegador. No necesita servidor ni instalación, pero sí conexión a internet para cargar Chart.js.
2. Sigue el **tutorial** inicial de 8 pasos (puedes saltarlo con el botón *Saltar tutorial*; vuelve a aparecer cada vez que recargas la página).
3. Elige el **tipo de motor** en el panel izquierdo.
4. **Despega:**
   - Líquido o híbrido: sube la palanca de potencia del panel derecho.
   - Sólido: pulsa *START MÁXIMO*.
5. **Vigila el Max-Q:** cuando el copiloto avise y la presión dinámica (*q*) de la telemetría se acerque a su límite, baja la palanca por debajo del 65 % y mantenla así hasta pasar los 16000 m. El motor sólido lo hace solo.
6. **Estabiliza el cohete** frente al viento entre los 18000 y los 40000 m con las flechas `←` / `→` (o las teclas `A` / `D`), o con los botones ◀ ▶ de la pantalla.
7. **Separa la etapa 1** con el botón *SEPARAR ETAPA 1* cuando se agote su combustible, y suelta la carga con *SOLTAR CARGA ÚTIL* a partir de los 90000 m.
8. Al acabar, revisa el panel de resultados y haz clic en las gráficas para ampliarlas. Con *VOLVER A JUGAR* empiezas otra partida.

**Unidades:** la altitud va en metros (m), la velocidad en m/s y la aceleración en m/s².

## Tecnologías

- **HTML5** — estructura de la interfaz.
- **CSS3** — estilos y animaciones (sin frameworks).
- **JavaScript** (sin frameworks ni compilación) — toda la física y la lógica del juego.
- **[Chart.js](https://www.chartjs.org/) 4.4.1** (por CDN) — gráficas del panel de resultados.
- **GitHub Pages** — publicación de la web.

## Estructura del proyecto

```
PI_Bach_Simulacion/
├── index.html          # Estructura de la interfaz (paneles, cohete, modales, resultados)
├── css/
│   └── estilos.css     # Todos los estilos y animaciones
├── js/
│   ├── tutorial.js     # Tutorial inicial paso a paso
│   ├── estado.js       # Constantes, estado global y referencias al DOM
│   ├── controles.js    # Entrada del jugador (TVC, teclado, motor, arranque)
│   ├── acciones.js     # Separar etapa 1 y soltar carga útil
│   ├── graficas.js     # Final de misión y gráficas de resultados
│   └── fisica.js       # Bucle principal de física y actualización de pantalla
├── INFORME/            # Informe en PDF del proyecto de investigación
├── INFORME_RESUMEN.md  # Resumen de la información importante del informe
├── PLAN_MEJORAS.md     # Plan de correcciones y propuestas de mejora
└── CAMBIOS_C1_C2_C3.md # Registro de cambios y su justificación
```

Los scripts comparten variables globales, así que **el orden de carga en `index.html` importa**: `tutorial → estado → controles → acciones → graficas → fisica`.

## Qué hace cada archivo

- **[index.html](index.html)**: toda la interfaz. Tutorial, panel izquierdo (motor, copiloto y telemetría), pantalla central (cielo, minimapa, cohete y barras de masa/combustible), panel derecho (palanca, TVC y botones de separar y soltar carga), panel de resultados y los recuadros emergentes (explicación del motor sólido y gráfica ampliada).
- **[css/estilos.css](css/estilos.css)**: estilos organizados por secciones (tutorial, paneles, pantalla central, cohete, controles, resultados y modales).
- **[js/tutorial.js](js/tutorial.js)**: los 8 pasos del tutorial (`pasosTutorial`), con el panel resaltado en cada uno, y `cambiarPaso()` / `saltarTutorial()`.
- **[js/estado.js](js/estado.js)**: constantes físicas y de juego (gravedad, paso de simulación `DT` = 0,1 s, velocidad de la simulación `INTERVALO_MS` = 42 ms → ×2,4, atmósfera, toberas, tiempos de quemado, límite de Max-Q, capas, viento y TVC), masas, cinemática, historiales para las gráficas y referencias al DOM.
- **[js/controles.js](js/controles.js)**: TVC por teclado y botones, selector de motor, arranque de la simulación y panel de avisos del copiloto.
- **[js/acciones.js](js/acciones.js)**: `ejecutarSeparacion()` (suelta la etapa 1 vacía) y `liberarCarga()` (suelta el satélite).
- **[js/graficas.js](js/graficas.js)**: `finalizarMision()` (animación de final y panel de resultados), balance de Tsiolkovski, las 5 gráficas y la vista ampliada con su explicación (`ampliarGrafica()`).
- **[js/fisica.js](js/fisica.js)**: `bucleFisico()`, que en cada tick: habilita botones, calcula la potencia, quema combustible y calcula el empuje, integra el movimiento (Tsiolkovski + gravedad + rozamiento), actualiza minimapa y etapa 1 cayendo, aplica viento y TVC, comprueba Max-Q y capas, y actualiza telemetría e historial.

## Documentación adicional

- [INFORME/PI Bach Clara García.pdf](INFORME/PI%20Bach%20Clara%20Garc%C3%ADa.pdf): informe completo en el que se basa el proyecto.
- [INFORME_RESUMEN.md](INFORME_RESUMEN.md): resumen de la información importante del informe, con una tabla que relaciona sus conceptos con el simulador.
- [PLAN_MEJORAS.md](PLAN_MEJORAS.md): correcciones pendientes y propuestas de mejora.
- [CAMBIOS_C1_C2_C3.md](CAMBIOS_C1_C2_C3.md): registro de cambios realizados en el simulador y por qué.
