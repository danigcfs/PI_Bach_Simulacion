# Registro de cambios — Correcciones C1, C2 y C3

**Fecha:** 2026-10-09
**Alcance:** correcciones C1 (velocidad de escape), C2 (capas atmosféricas) y C3 (Max-Q basado en presión dinámica) del [PLAN_MEJORAS.md](PLAN_MEJORAS.md).
**Origen:** discrepancias detectadas al comparar el simulador con el informe ([INFORME_RESUMEN.md](INFORME_RESUMEN.md)).

---

## 1. Resumen ejecutivo

| Corrección | Qué se hizo | Estado |
|---|---|---|
| **C1** Velocidad de escape | `VEL_ESCAPE_GASES` de 28000 a **3000 m/s** (el informe dice ">10.000 km/h" ≈ 2.800 m/s). Para que el cohete siguiera llegando a la exosfera se reajustaron masas secas, tiempos de quemado y rozamiento. | ✅ Hecho y probado |
| **C2** Capas atmosféricas | Una única tabla `CAPAS` usada por el minimapa, la telemetría y los avisos. Ya no hay desacuerdo entre paneles. | ✅ Hecho y probado |
| **C3** Max-Q | La destrucción por Max-Q ahora depende de la **presión dinámica q = ½·ρ·v²** y no de una regla fija de altitud y potencia. | ✅ Hecho y probado |

**Importante:** las pruebas se hicieron ejecutando el código real (`estado.js`, `acciones.js`, `graficas.js`, `fisica.js`) en Node con un DOM simulado. **No se ha probado en un navegador**, así que conviene una pasada manual (ver apartado 7).

---

## 2. C1 — Velocidad de escape de los gases

### Problema
El informe (apartado 6) dice que los gases salen a "más de 10.000 km/h" (≈ 2.800 m/s). El código usaba 28000 m/s, unas 10 veces más. Con los caudales de combustible originales, el empuje era 35 veces el peso del cohete (~35 g de aceleración) y la velocidad al llegar a la exosfera superaba los 20 km/s, cuando la velocidad orbital ronda los 7,8 km/s. El rozamiento (Cd·A = 15 m²) estaba sobredimensionado y compensaba parte de ese exceso.

### Decisión
Se descartó la **opción A** del plan (subir a ~7800 m/s para mantener la jugabilidad), porque seguía contradiciendo el informe. Se eligió la **opción B**: usar el valor del informe y reajustar el resto para que el cohete siga llegando a 500 km con una aceleración creíble.

### Cambios ([js/estado.js](js/estado.js))

| Constante | Antes | Ahora | Motivo |
|---|---|---|---|
| `VEL_ESCAPE_GASES` | 28000 m/s | **3000 m/s** | Coincide con el informe (3000 m/s = 10.800 km/h). |
| `VEL_ESCAPE_GASES_SOLIDO` | 26000 m/s | **2800 m/s** | Menor impulso específico que el líquido. |
| `masaVacia1` | 15000 kg | **4000 kg** | Con la velocidad de escape real, una estructura que pesa la mitad que su propelente no permite llegar a la exosfera. El informe habla de materiales ligeros (aluminio-litio). |
| `masaVacia2` | 2000 kg | **1500 kg** | Mismo motivo. |
| `AREA_CD` | 1,5 × 10 = 15 m² | **0,5 × 10 = 5 m²** | Cd = 0,5 es un valor típico de cohete; antes (Cd = 1,5) frenaba demasiado. |
| Tiempo de quemado etapa 1 | 40 s (número fijo en `fisica.js`) | **`TIEMPO_QUEMADO_ETAPA1 = 100` s** | Relación empuje/peso inicial de 1,9 (antes 35). Ahora es una constante con nombre. |
| Tiempo de quemado etapa 2 | 30 s (número fijo) | **`TIEMPO_QUEMADO_ETAPA2 = 70` s** | Ídem. |

Efecto en [js/fisica.js](js/fisica.js): `quemarCombustible()` usa las constantes `TIEMPO_QUEMADO_ETAPAx` en lugar de los números 40 y 30.

### Resultado
- Relación empuje/peso al despegue: de ~35 a ~1,9. Aceleración máxima inicial de ~9 m/s² en vez de ~340 m/s².
- La etapa 1 se agota a unos **55 km** con motor líquido (mesosfera), como describe el informe y como anuncia el copiloto.
- Duración de la misión: de ~53 s a ~230 s simulados (unos 2 minutos reales, porque la simulación va ×2).
- Δv ideal de Tsiolkovski con los nuevos valores: etapa 1 ≈ 2,9 km/s y etapa 2 ≈ 2,4 km/s (≈ 5,3 km/s en total).

---

## 3. C2 — Capas atmosféricas

### Problema
El minimapa cambiaba de capa a 12 km (como el informe), pero la telemetría y los avisos lo hacían a 16 km. Entre 12 y 16 km un panel decía "Troposfera" y el otro "Estratosfera".

### Cambios
- **[js/estado.js](js/estado.js):** nueva tabla `CAPAS` con `id` del minimapa, `nombre` y `hasta` (altitud en km donde termina): Troposfera 12, Estratosfera 50, Mesosfera 90, Termosfera 500, Exosfera 1000.
- **[js/fisica.js](js/fisica.js):**
  - Nueva función `indiceCapa(altKm)`, que devuelve la capa a partir de la tabla.
  - `actualizarMinimapa()` se reescribió con la tabla (la posición del marcador se calcula igual que antes: 20 % de la barra por capa).
  - `actualizarCapasYAvisos()` usa un `switch` sobre la capa en lugar de una cadena de `if/else` con altitudes repetidas. Los avisos del viento, la mesosfera, la termosfera y la exosfera se mantienen, ahora ligados a la capa.
  - El brillo rojo del cohete (calentamiento) se activa solo en la mesosfera y se quita fuera de ella.

### Resultado
En todas las pruebas, la capa del minimapa y la de la telemetría coincidieron en cada tick. Ahora las capas son las del informe: troposfera hasta 12 km y estratosfera de 12 a 50 km.

---

## 4. C3 — Max-Q calculado a partir de la presión dinámica

### Problema
El cohete se destruía si, entre 11 y 14 km, la potencia superaba el 65 %. El código no calculaba q. Además, la q real del simulador tenía su máximo a ~6,5 km, fuera de esa zona. El informe presenta el Max-Q como consecuencia de q = ½·ρ·v².

### Cambios

**[js/estado.js](js/estado.js)** — constantes nuevas, agrupadas por tema:

| Constante | Valor | Significado |
|---|---|---|
| `Q_MAX` | 17.500 Pa | Límite estructural: si q lo supera, el chasis se destruye (cualquier motor). |
| `Q_AVISO` | 0,35 | A partir de 0,35·`Q_MAX`, el copiloto avisa de que se acerca el Max-Q. |
| `Q_PELIGRO` | 0,60 | A partir de 0,60·`Q_MAX` con q subiendo, alerta roja: reducir ya. |
| `POTENCIA_SEGURA_MAXQ` | 0,65 | Potencia recomendada durante el Max-Q (aparece en los avisos). |
| `ALT_FIN_MAXQ` | 16 km | Pasada esta altitud se puede volver a acelerar. |
| `SOLIDO_GRANO_INICIO / FIN` | 0,18 / 0,60 | Tramo del propelente de la etapa 1 en el que el grano en estrella reduce el empuje. |
| `SOLIDO_POTENCIA_REDUCIDA` | 0,55 | Potencia del sólido durante ese tramo. |

Variables nuevas: `presionDinamica`, `presionDinamicaAnterior`, `presionDinamicaPico` y `faseMaxQ`. Se eliminó `POTENCIA_MAX_MAXQ` y la variable `avisoMaxQ`, que ya no se usan.

**[js/fisica.js](js/fisica.js):**
- `calcularPresionDinamica(h, v)` calcula q = ½·ρ·v².
- `integrarMovimiento()` calcula q en cada tick y la usa para el rozamiento (`q · Cd·A`, equivalente a la fórmula anterior). Guarda también el valor anterior y el pico.
- `comprobarMaxQ()` (nueva) hace tres cosas:
  1. Destruye el cohete si `q > Q_MAX`, con un mensaje que indica la q alcanzada y el límite.
  2. Muestra los avisos en pantalla y en el copiloto según q/`Q_MAX` y si q sube o baja: *aproximación*, *peligro*, *potencia óptima*, *Max-Q superado*. Solo se cambia el panel cuando cambia la fase.
  3. Pasados 16 km marca el Max-Q como superado y deja de avisar.
- `avisarMaxQ()` (nueva) evita reescribir el panel del copiloto en cada tick.
- **Motor sólido:** `calcularPotencia()` ya no usa la altitud (10–15 km). Reduce a 55 % mientras se quema entre el 18 % y el 60 % del propelente de la etapa 1, que es como actúa el grano en estrella del informe (la forma del grano fija la curva de empuje según lo quemado, no según la altitud). La pausa didáctica aparece al empezar esa reducción.
- La telemetría muestra q y el límite (`t-q`), en naranja o rojo según la proximidad.

**[index.html](index.html):** nueva fila "PRES. DINÁMICA (q)" en la telemetría y el texto del modal del motor sólido (ya no cita "11-14 km").

**[js/tutorial.js](js/tutorial.js):** el paso 2 explica ahora que el Max-Q es el máximo de q = ½·ρ·v² y que hay que vigilar q en la telemetría.

### Cómo se calibraron los valores
`Q_MAX = 17,5 kPa` se eligió con una réplica del bucle físico para que se cumpla lo que dice el informe, que sobrepasar el 65 % de potencia en Max-Q destruye el cohete:

- Con 100 % de potencia, q llegaría a ~35 kPa: el cohete se destruye siempre.
- Reduciendo a **≤ 65 %** al saltar el aviso, el cohete sobrevive.
- Reduciendo solo a **70 %** (o más), q sigue creciendo y el cohete se destruye si la reacción es lenta.
- Con ≤ 65 % la fuerza neta sobre el cohete se anula (empuje ≈ peso + rozamiento) y q deja de crecer. Eso da una explicación física al 65 % del informe.
- `ALT_FIN_MAXQ = 16 km`: se comprobó que, volviendo a 100 % a partir de esa altitud, ningún caso con 40–65 % de potencia supera 14,8 kPa (a 14 km se llegaba a 16,5 kPa, demasiado cerca del límite). Más abajo, volver a acelerar demasiado pronto produce un segundo pico de q que destruye el cohete (con 40 % ocurre al reanudar a 8 o 12 km).
- El sólido, sin intervención del jugador, alcanza como máximo 12,4 kPa.

---

## 5. Pruebas realizadas

Se ejecutó el código real en Node con un DOM simulado y un "jugador" automático que ajusta la palanca, separa la etapa 1 cuando se agota, suelta la carga a 90 km y compensa el viento con el TVC.

| Escenario | Resultado | q máxima |
|---|---|---|
| Líquido, siempre al 100 % | 💥 Desintegración en Max-Q a los 20,6 s (2,0 km) | 17,5 kPa |
| Líquido, baja a 60 % 1,5 s después de la alerta roja | ✅ Llega a la exosfera (239 s) | 13,4 kPa |
| Líquido, baja a 65 % 1,5 s después de la alerta roja | ✅ Llega a la exosfera (233 s) | 14,8 kPa |
| Líquido, baja a 70 % | 💥 Desintegración (45,8 s, 7,3 km) | 17,5 kPa |
| Líquido, baja a 80 % | 💥 Desintegración (25,5 s, 2,9 km) | 17,5 kPa |
| Híbrido, baja a 65 % | ✅ Idéntico al líquido | 14,8 kPa |
| Sólido, sin tocar nada | ✅ Llega a la exosfera (266 s) | 12,4 kPa |

**Margen de reacción** (líquido, potencia mantenida hasta superar 16 km):
- Si se reacciona hasta ~6 s simulados (unos 3 s reales) después del primer aviso, bajando a ≤ 65 %: se sobrevive siempre.
- Bajando solo a 70 %: se sobrevive si se reacciona en menos de ~4 s, y se destruye si se tarda 6 s o más.
- Bajar a 70 % 1,5 s después de la alerta roja (q ≥ 0,6·`Q_MAX`) ya destruye el cohete; con reacción inmediata se llega a 17,2 kPa, rozando el límite.

**Otras comprobaciones:**
- Capa del minimapa = capa de la telemetría en todos los ticks de todos los escenarios.
- Separación de la etapa 1 con motor líquido a ~55 km (mesosfera) y con sólido a ~43 km (estratosfera, porque el sólido quema más despacio).
- Orden de los avisos del copiloto correcto en el escenario líquido al 65 %: aproximación → peligro → zona crítica → Max-Q superado → viento → mesosfera → separación → carga → exosfera.

---

## 6. Efectos secundarios y puntos a vigilar

1. **El Max-Q ya no ocurre a 11–14 km.** Con q como criterio, ocurre al empezar el ascenso: a 100 % de potencia q supera el límite a los 2 km; manteniendo el 65 % el máximo de q está entre 6 y 10 km, dentro de la troposfera, que es donde lo sitúa el informe (apartado 8). El texto del informe y de la presentación no debería citar "11–14 km".
2. **Conclusión 2 del informe.** "Sobrepasar el 65 % llevaba al colapso" sigue siendo válida en el simulador, pero ahora es un resultado de la física y depende del tiempo de reacción. Conviene redactarla como "mantener más de ~65–70 % durante el Max-Q lleva a superar el límite de q".
3. **Misión más larga.** Dura unos 2 minutos reales en lugar de ~30 s. La zona de viento (20–40 km) también dura más; su dificultad se ajustó después en el apartado 9.3.
4. **El sólido separa antes de la mesosfera.** El copiloto avisa de separar en la mesosfera, pero con sólido la etapa 1 ya se ha agotado a ~43 km. Es un detalle de textos que se puede ajustar.
5. **La carga útil sigue sin ser obligatoria** para ganar (corrección C4 del plan, sin tocar).
6. **Los cuadros de masa del informe.** Si el informe cita las masas de 15.000/2.000 kg o el rozamiento antiguo, hay que actualizarlas a 4.000/1.500 kg y Cd·A = 5 m².

---

## 7. Comprobación manual recomendada en el navegador

1. Abrir [index.html](index.html), pasar el tutorial y elegir **Líquido**. Subir la palanca al 100 % y mantenerla: debe aparecer el aviso naranja, luego el rojo con el cohete temblando y explotar a los pocos segundos.
2. Repetir bajando la palanca al ~60 % al saltar el aviso: debe verse "POTENCIA ÓPTIMA", luego "MAX-Q SUPERADO" al pasar los 16 km, y se puede volver a subir.
3. Elegir **Sólido** y pulsar START: debe aparecer el modal del grano poco después del despegue (~18 s simulados) y continuar solo.
4. Comprobar que la fila "PRES. DINÁMICA (q)" de la telemetría se actualiza y que minimapa y capa de telemetría coinciden al cruzar 12 km.
5. Revisar que las gráficas finales se dibujan y que la separación de la etapa 1 sigue funcionando.

---

## 8. Archivos modificados

| Archivo | Cambios |
|---|---|
| [js/estado.js](js/estado.js) | Nuevas constantes (velocidad de escape, tiempos de quemado, Max-Q, grano, `CAPAS`), masas y `AREA_CD` ajustados, variables de q. |
| [js/fisica.js](js/fisica.js) | q y rozamiento, `comprobarMaxQ`, `avisarMaxQ`, `indiceCapa`, minimapa y avisos por capa, potencia del sólido por fracción quemada, telemetría de q. |
| [index.html](index.html) | Fila de q en la telemetría; texto del modal del sólido. |
| [js/tutorial.js](js/tutorial.js) | Texto del paso 2 (Max-Q y presión dinámica). |
| [README.md](README.md) | Descripciones actualizadas, errata "platafoma" corregida (parte de C8) y enlace a este documento. |
| [CAMBIOS_C1_C2_C3.md](CAMBIOS_C1_C2_C3.md) | Este registro. |

No se modificaron [js/controles.js](js/controles.js), [js/acciones.js](js/acciones.js), [js/graficas.js](js/graficas.js) ni [css/estilos.css](css/estilos.css).

---

## 9. Ajustes posteriores (tras la primera prueba en el navegador)

Tras probar el simulador se pidieron tres cambios.

### 9.1. Saltar el tutorial
- Nuevo botón **"Saltar tutorial"** ([index.html](index.html), [css/estilos.css](css/estilos.css)), visible en todos los pasos menos el último.
- [js/tutorial.js](js/tutorial.js): `saltarTutorial()` cierra el tutorial desde cualquier paso, solo para esa partida. **No se guarda nada en el navegador**: al recargar la página (por ejemplo con VOLVER A JUGAR) el tutorial siempre vuelve a mostrarse.
- Corrección posterior: una primera versión recordaba el salto en `localStorage` y el tutorial dejaba de salir; se eliminó esa persistencia.

### 9.2. Simulación un 20 % más rápida
- `INTERVALO_MS` pasa de 50 a **42 ms** ([js/estado.js](js/estado.js)). Cada tick sigue simulando 0,1 s, así que la física no cambia: solo el reloj real. La simulación pasa de ×2 a ×2,4 (≈ 1 min 37 s reales en lugar de ≈ 1 min 56 s por misión).

### 9.3. Estabilización con el TVC más fácil
**Diagnóstico.** Con el viento original (20 °/s), el TVC (60 °/s) y el límite de 35°, el cohete llegaba al límite en menos de 2 s simulados si no se corregía, y corregir con la tecla pulsada lo mandaba al otro lado en menos de 1 s. Un modelo de piloto humano con reacción de 0,2 s reales no sobrevivía en ningún intento (0 %), lo que confirma la sensación de que era imposible. Con la simulación un 20 % más rápida habría sido aún peor.

**Cambios** ([js/estado.js](js/estado.js), [js/fisica.js](js/fisica.js)):

| Parámetro | Antes | Ahora |
|---|---|---|
| `FUERZA_VIENTO` | 20 °/s | **12 °/s** |
| `FUERZA_TVC_MAX` | 60 °/s | **16 °/s** |
| Cambio de sentido del viento | cada 4 s (fijo en el código) | **`PERIODO_VIENTO` = 6 s** |
| `ESTABILIDAD_PASIVA` (nuevo) | no existía | **0,15 1/s** |

La estabilidad pasiva representa lo que dice el informe (apartado 4.3): con el centro de presión por debajo del centro de gravedad, las aletas enderezan el cohete en proporción al ángulo. La fórmula del ángulo queda `ángulo += (viento + TVC − 0,15·ángulo) · dt`. `ANGULO_LIMITE` (35°) no cambia.

**Comprobación.** Con el código real y un piloto automático que corrige con retraso de reacción (ángulos de activación de 5°, 8° y 12°):

| Reacción del piloto (s reales) | Resultado |
|---|---|
| 0,2 | ✅ llega a la exosfera |
| 0,35 | ✅ llega a la exosfera |
| 0,5 | ✅ llega a la exosfera |
| 0,7 | 💥 pérdida de control |

Sin tocar el TVC (sin ninguna corrección) el cohete se pierde en las tres pruebas, así que el control sigue siendo necesario.

### Archivos tocados en este apartado
[index.html](index.html), [css/estilos.css](css/estilos.css), [js/tutorial.js](js/tutorial.js), [js/estado.js](js/estado.js), [js/fisica.js](js/fisica.js).

---

## 10. Empuje y ecuación de Tsiolkovski explícitos en el código

### Pregunta
¿El empuje se calcula con la fórmula del informe (`F = ṁ·Ve + Ae·(pe − p0)`) y el movimiento sigue la ecuación de Tsiolkovski (`Δv = Ve·ln(m0/mf)`)?

### Diagnóstico (antes del cambio)
| Fórmula | Estado anterior |
|---|---|
| Empuje | **Parcial.** Solo se usaba la versión simplificada `F = ṁ·Ve`. Faltaba el término de presión `Ae·(pe − p0)`. |
| Tsiolkovski | **No aparecía en el código.** El cohete avanzaba con `a = (F − peso + rozamiento)/masa`. Es equivalente en el límite (Tsiolkovski es la integral de esa ecuación cuando la masa disminuye), pero no se calculaba ni se veía en ningún sitio. |

### Cambios

**Empuje** ([js/estado.js](js/estado.js), [js/fisica.js](js/fisica.js)):
- `quemarCombustible()` calcula ahora `F = ṁ·Ve + Ae·(pe − p0)`:
  - `ṁ`: caudal de propelente (el de siempre, potencia × propelente inicial / tiempo de quemado).
  - `Ve`: 3000 m/s (líquido/híbrido) o 2800 m/s (sólido).
  - `Ae`: área de salida de la tobera, constante nueva por etapa: `AREA_SALIDA_ETAPA1 = 1,2 m²` (nivel del mar) y `AREA_SALIDA_ETAPA2 = 3,0 m²` (tobera de vacío).
  - `pe`: presión de salida, proporcional a la potencia (como la presión de la cámara): `PRESION_SALIDA_ETAPA1 = 70 kPa` y `PRESION_SALIDA_ETAPA2 = 5 kPa` a potencia máxima.
  - `p0`: presión exterior, la del modelo atmosférico (`presionAire`), en Pa.
- Efecto físico: a nivel del mar la presión exterior (101 kPa) supera a la de salida y resta empuje (~4 % a plena potencia: 900 → 862 kN); a medida que el aire desaparece el término pasa a sumar (983 kN a 43 km). Es el comportamiento real de una tobera, y coincide con la nota del informe: solo cuando `pe ≈ p0` la fórmula se reduce a `F = ṁ·Ve`.
- El empuje se limita a 0 si el término de presión lo hiciera negativo (potencias muy bajas en la baja atmósfera); una tobera real tendría desprendimiento del flujo.
- Se calcula también la **velocidad de salida efectiva** `Ve_ef = F/ṁ`, que es exactamente la `Ve` de la ecuación de Tsiolkovski según el informe.
- Pequeña corrección: el último tick de combustible ya no usa un caudal mayor que el realmente quemado.

**Tsiolkovski** ([js/fisica.js](js/fisica.js)):
- `integrarMovimiento()` ya no usa `a = F/m`. En cada tick suma tres variaciones de velocidad:
  - `Δv empuje = Ve_ef · ln(m0 / mf)`: ecuación de Tsiolkovski aplicada al propelente quemado en ese tick (`m0` y `mf` son las masas antes y después de quemar; la separación de etapas y la carga útil entran porque `m0` se recalcula al inicio de cada tick).
  - `Δv gravedad = −g · dt`.
  - `Δv rozamiento = (q · Cd·A / masa) · dt`.
- Se acumulan tres totales: `dvIdeal` (Σ Δv de Tsiolkovski), `perdidaGravedad` y `perdidaRozamiento`. En el aire cumplen exactamente **velocidad = Δv ideal − pérdidas por gravedad − pérdidas por rozamiento**.
- La plataforma de lanzamiento (mientras el empuje no supera el peso) no acumula nada.

**Visibilidad para el jugador y en el informe:**
- Telemetría: dos filas nuevas, **EMPUJE** (kN) y **Δv IDEAL (Tsiolkovski)** (m/s) ([index.html](index.html)).
- Panel de resultados: recuadro "ECUACIÓN DE TSIOLKOVSKI DEL VUELO" con Δv ideal, pérdidas por gravedad, pérdidas por rozamiento y velocidad final ([index.html](index.html), [css/estilos.css](css/estilos.css), [js/graficas.js](js/graficas.js), función `rellenarTsiolkovski`).

### Comprobaciones (código real en Node)
- El empuje de cada tick coincide con `ṁ·Ve + Ae·(pe − p0)` calculado aparte: error relativo máximo de 1e-14, sobre 1974 ticks con motor encendido.
- La identidad `velocidad = Δv ideal − pérdidas` se cumple con un error máximo de 1e-10 m/s durante todo el vuelo.
- Ejemplo de un vuelo (líquido, 65 % en Max-Q): Δv ideal ≈ 8450 m/s, pérdidas por gravedad ≈ 2315 m/s, pérdidas por rozamiento ≈ 193 m/s, velocidad al llegar a 500 km ≈ 5945 m/s.
- `Ve_ef` medida: 2875 m/s a nivel del mar y hasta 3278 m/s a 43 km, al desaparecer la presión exterior.

### Efecto sobre el equilibrio del juego y recalibración
El término de presión resta empuje abajo y suma arriba, así que el Max-Q y el motor sólido cambiaron un poco y se recalibraron:
- `Q_MAX` se mantiene en **17,5 kPa**: con 100 % de potencia el cohete se destruye (a 2,1 km), con ≤ 65 % sobrevive (pico 16,1 kPa) y con 70 % se destruye. La regla "más del 65 % destruye" sigue cumpliéndose.
- El motor sólido pasó a **18 %–75 %** del propelente de la etapa 1 (`SOLIDO_GRANO_FIN` de 0,60 a 0,75). Con la ventana anterior (18–60 %), el sólido se destruía por un segundo pico de q al volver a 100 %. Ahora su pico es de 9,6 kPa. Esto sustituye lo indicado en el apartado 4 de este documento.
- La misión sigue durando lo mismo (≈ 227–276 s simulados según el motor).

### Qué conviene actualizar en el informe
- Citar que el simulador usa `F = ṁ·Ve + Ae(pe − p0)` completa, y que la velocidad del cohete se obtiene sumando en cada paso `Ve_ef·ln(m0/mf)` (Tsiolkovski) menos gravedad y rozamiento.
- La conclusión 1 ("la aceleración no es uniforme, tal como establece Tsiolkovski") puede apoyarse ahora en el recuadro del panel de resultados.
- Los valores de `Ae` y `pe` son de diseño (no vienen del informe); conviene presentarlos como parámetros de tobera elegidos para que `pe` quede ligeramente por debajo de la presión al nivel del mar.

### Archivos tocados en este apartado
[js/estado.js](js/estado.js), [js/fisica.js](js/fisica.js), [js/graficas.js](js/graficas.js), [index.html](index.html), [css/estilos.css](css/estilos.css), [README.md](README.md).

---

## 11. Unidades estándar en todo el programa

### Criterio
- **Altitud:** metros (m).
- **Velocidad:** metros por segundo (m/s).
- **Aceleración:** metros por segundo al cuadrado (m/s²).

### Qué estaba mezclado antes
| Dónde | Antes | Ahora |
|---|---|---|
| Telemetría: altitud | km con 2 decimales | **m** (sin decimales) |
| Telemetría: velocidad | km/h | **m/s** (1 decimal) |
| Telemetría: aceleración | no se mostraba | **fila nueva en m/s²** |
| Gráfica de altitud | km | **m** |
| Gráfica de velocidad | km/h | **m/s** |
| Gráfica de aceleración | m/s² | m/s² (sin cambios) |
| Resultado final de Tsiolkovski | m/s y km/h | **solo m/s** |
| Indicador de viento | "0 km/h" | **"0 m/s"** |
| Código interno | altitud en m pero eventos, capas y funciones con `altKm` (km) | **todo en m**; desaparece la conversión `/1000` |

### Cambios en el código
- [js/estado.js](js/estado.js): la tabla `CAPAS` y `ALT_FIN_MAXQ` pasan a metros (12000, 50000, 90000, 500000, 1000000 y 16000). Constantes nuevas con nombre para las alturas de los eventos, antes escritas como números sueltos: `ALT_AVISO_TVC` (18000), `ALT_VIENTO_INICIO` (20000), `ALT_VIENTO_FIN` (40000), `ALT_CARGA` (90000) y `ALT_AVISO_TERMOSFERA` (100000).
- [js/fisica.js](js/fisica.js): todos los parámetros `altKm` pasan a `alt` (en m) y se usan las constantes anteriores. La posición del cohete en pantalla sigue igual (`alt / 500` = 2 px por cada 1000 m). El historial de las gráficas guarda altitud en m y velocidad en m/s.
- [js/controles.js](js/controles.js): el teclado usa `ALT_AVISO_TVC` y `ALT_VIENTO_FIN`.
- [js/graficas.js](js/graficas.js): títulos y ejes en m y m/s; el recuadro de Tsiolkovski ya no muestra km/h.
- [index.html](index.html), [js/tutorial.js](js/tutorial.js): textos iniciales de la telemetría, del viento y del tutorial ("A los 20000 m").
- Los avisos del copiloto citan las alturas en metros (por ejemplo "Cizalladuras inminentes a los 20000 m").
- [README.md](README.md): tabla de capas y rangos en metros, con una nota de unidades.

### Lo que no cambia
- La presión sigue en hPa (atmosférica) y kPa (dinámica), y el empuje en kN, porque no se pidió estandarizarlos.
- El cálculo físico es idéntico: se repitieron todas las pruebas y los resultados no varían (misma masa, mismos picos de q, mismos tiempos de misión, mismas igualdades de Tsiolkovski).

### Comprobación
- Telemetría tras unos ticks con 100 % de potencia: `419 m | 84,4 m/s | 8,8 m/s²` → `2068 m | 192,7 m/s | 9,3 m/s²`.
- Historial de las gráficas: altitud `5, 20, 45` (m), velocidad `8,8, 17,8, 26,9` (m/s), aceleración `8,09, 8,20, 8,31` (m/s²).
- Búsqueda en el código: no queda ninguna conversión a km ni a km/h.

---

## 12. Gráficas ampliables con explicación

### Funcionalidad
En el panel de resultados, al hacer clic en cualquiera de las 5 gráficas (altitud, velocidad, aceleración, combustible y masa total) se abre un recuadro con:
- **A la izquierda:** la gráfica ampliada. Cuando han ocurrido, se marcan con líneas verticales discontinuas los hitos **Max-Q**, **Separación etapa 1** y **Carga útil**. La de altitud añade líneas horizontales con los límites de las capas de la atmósfera.
- **A la derecha:** una explicación **genérica**, igual para cualquier partida y para los tres tipos de motor, con tres bloques:
  - **Qué muestra:** qué representa la gráfica y qué fórmula del informe hay detrás.
  - **En qué fijarse:** los elementos de la curva que hay que mirar para entender lo ocurrido (pendientes, saltos, tramos planos, valores de referencia) y qué significa cada uno.
  - La indicación del apartado del informe en el que se basa.
- No incluye un análisis de la partida concreta. En una primera versión se mostraba un bloque "Datos de tu vuelo" con valores de la partida; se eliminó a petición del usuario.
- Se cierra con la ✕, haciendo clic fuera del recuadro o con Esc. Las gráficas pequeñas se resaltan al pasar el ratón y hay una línea de ayuda debajo.

### Contenido y coherencia con el informe
Los textos se redactaron a partir del PDF "La ciencia detrás del despegue":

| Gráfica | Ideas del informe en las que se apoya | En qué se pide fijarse |
|---|---|---|
| Altitud | Capas de la atmósfera y sus límites (apartado 8); la exosfera como destino. | Pendiente = velocidad; en qué capa está; cambios de pendiente ligados a eventos; dónde termina la curva. |
| Velocidad | Ecuación de Tsiolkovski Δv = ve·ln(m0/mf) (apartado 6); Max-Q (apartado 8): reducir potencia en líquido e híbrido y grano en estrella en el sólido. | Tramos que suben, planos o que bajan; zona del Max-Q; efecto de separar la etapa 1; velocidad máxima y final frente al Δv ideal. |
| Aceleración | El cohete acelera más al perder masa (apartado 6) y conclusión 1. | Tendencia creciente; saltos por pérdida de masa; bajadas por reducción de potencia o cambio de etapa; valores de referencia −9,8 m/s² y 0. |
| Combustible | Propelente (palabras clave), sistema de propulsión (4.4) y empuje F = ṁ·Ve + Ae(pe − p0) (apartado 6). | Pendiente = caudal ṁ; tramos menos inclinados o planos; valor final. |
| Masa total | Etapas y peso muerto (3.3), Tsiolkovski (m0/mf) y conclusión 3. | Descenso continuo por propelente; saltos por separación y carga útil; cociente masa inicial/final. |

### Implementación
- [js/graficas.js](js/graficas.js): objeto `GRAFICAS` (configuración y textos `muestra` y `fijarse` de cada gráfica), funciones `ampliarGrafica()` y `cerrarGrafica()` y los plugins `pluginHitos` y `pluginCapas` de Chart.js. `crearGraficas()` usa esa definición.
- [js/estado.js](js/estado.js), [js/acciones.js](js/acciones.js), [js/fisica.js](js/fisica.js): se guardan `tiempoPicoQ`, `tiempoSeparacion` y `tiempoCarga` para dibujar los hitos.
- [index.html](index.html): `onclick` en cada gráfica, línea de ayuda y recuadro `#modal-grafica`.
- [css/estilos.css](css/estilos.css): estilos del recuadro (en pantallas estrechas se apila en vertical) y resaltado de las gráficas.

### Comprobación
Se ejecutó una misión completa en Node con un DOM simulado y se abrieron las 5 vistas ampliadas: se rellenan los textos, los plugins dibujan los hitos y los límites de capa y el recuadro se cierra correctamente. **No se ha probado visualmente en un navegador.**
