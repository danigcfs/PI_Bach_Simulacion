# Plan de correcciones y propuestas de mejora

> **Estado:** C1, C2 y C3 están hechas; ver [CAMBIOS_C1_C2_C3.md](CAMBIOS_C1_C2_C3.md).

Basado en la verificación del simulador frente al informe ([INFORME_RESUMEN.md](INFORME_RESUMEN.md)). Las estimaciones de tiempo son para una persona que ya conoce el código, e incluyen probar el cambio en el navegador.

---

## Parte 1 — Correcciones

### Resumen

| # | Corrección | Prioridad | Tiempo estimado | Archivos |
|---|---|---|---|---|
| ✅ C1 | Velocidad de escape de los gases (28000 m/s → valor coherente con el informe) | 🔴 Alta | 1 – 2 h | `estado.js`, `fisica.js` |
| ✅ C2 | Unificar los límites de las capas atmosféricas | 🟠 Media | 30 min | `fisica.js` |
| ✅ C3 | Hacer que el Max-Q dependa de la presión dinámica q | 🟠 Media | 1 – 1,5 h | `fisica.js`, `estado.js` |
| C4 | Hacer necesaria la liberación de la carga útil | 🟠 Media | 30 – 45 min | `fisica.js`, `acciones.js` |
| C5 | El TVC solo debe actuar con el motor encendido | 🟡 Baja | 20 min | `fisica.js` |
| C6 | Ajustar la zona de viento y su duración | 🟡 Baja | 30 min | `estado.js`, `fisica.js` |
| C7 | Revisar coeficiente aerodinámico y gravedad | 🟡 Baja | 30 – 45 min | `estado.js`, `fisica.js` |
| C8 | Corregir textos y errata del README | 🟡 Baja | 10 min | `README.md` |
| | **Total** | | **≈ 5 – 7 h** | |

El orden recomendado es C1 → C2 → C3 → C4 → resto, porque C1 cambia todos los tiempos y alturas del vuelo y conviene fijarlo antes de ajustar lo demás.

---

### C1. Velocidad de escape de los gases 🔴

**Problema.** El informe dice que los gases salen a "más de 10.000 km/h" (≈ 2.800 m/s). El código usa `VEL_ESCAPE_GASES = 28000` m/s (≈ 100.000 km/h) en [estado.js](js/estado.js). El empuje resulta 35 veces el peso, con aceleraciones de ~35 g y velocidades de más de 20 km/s, cuando la velocidad orbital es de unos 7,8 km/s.

**Medido con una réplica del bucle físico:**

| Ve (m/s) | Resultado |
|---|---|
| 28000 (actual) | Gana en 53 s simulados. La etapa 1 se agota a 270 km (termosfera). |
| 7778 | Gana en ~100 s. La etapa 1 se agota a 60 km (mesosfera, como dice el informe). |
| 2800 (valor del informe) | No llega a la exosfera: el apogeo queda en ~289 km. |

**Opciones:**
- **Opción A (rápida, recomendada para empezar):** bajar `VEL_ESCAPE_GASES` a ≈ 7800 m/s y el del sólido en proporción (≈ 7200). Mantiene la jugabilidad y hace que el aviso de separación en la mesosfera sea cierto. Hay que **justificarlo en el informe**: la velocidad de escape se escala por motivos de simulación.
- **Opción B (fiel al informe):** usar Ve ≈ 2800–3000 m/s y ajustar masas, caudales y tiempos de quemado (o añadir una etapa más) hasta que el cohete siga llegando a 500 km con una aceleración creíble (relación empuje/peso de ~1,5–3). Requiere varias iteraciones de prueba.

**Tareas:**
1. Elegir la opción A o la B.
2. Cambiar las constantes en `estado.js`.
3. Volver a comprobar a qué altitud se agota cada etapa y que el aviso de la mesosfera coincide.
4. Comprobar que se puede ganar con los tres motores y que 100 % de potencia en Max-Q sigue destruyendo el cohete.

**Tiempo:** opción A ≈ 1 h; opción B ≈ 2 – 3 h.

---

### C2. Unificar los límites de las capas 🟠

**Problema.** El minimapa pasa a Estratosfera a 12 km (como el informe), pero la telemetría y los avisos del copiloto lo hacen a 16 km ([fisica.js:282](js/fisica.js#L282), [fisica.js:325](js/fisica.js#L325)). Entre 12 y 16 km un panel dice una capa y el otro la contraria.

**Tareas:**
1. Crear una función única `capaDeAltitud(altKm)` que devuelva la capa y úsala en el minimapa, la telemetría y los avisos.
2. Separar la lógica de capas de la lógica de avisos de Max-Q (que usa 11–14 km, independiente de la capa).

**Tiempo:** 30 min.

---

### C3. Max-Q calculado a partir de q 🟠

**Problema.** La presión dinámica real del simulador tiene su máximo a ~6,5 km, pero el cohete solo se destruye entre 11 y 14 km con una regla fija. El informe presenta el Max-Q como resultado de q = ½ρv².

**Tareas:**
1. Calcular `q = 0.5 * rho * v²` en cada tick y mostrarla en la telemetría (kPa).
2. Definir un límite estructural `Q_MAX` y destruir el cohete si `q > Q_MAX`, en lugar de usar la zona fija. Ajustar `Q_MAX` para que el umbral práctico siga siendo ≈ 65 % de potencia (conclusión del informe).
3. Mostrar el aviso "aproximación a Max-Q" cuando q crezca, no por altitud fija.
4. Marcar en la gráfica de resultados el instante de q máxima.
5. Para el motor sólido, comprobar que el 55 % automático mantiene q bajo el límite.

**Nota:** puede cambiar la altitud real del Max-Q. Si queda lejos de los 11–14 km del informe, ajustar parámetros o documentar la diferencia.

**Tiempo:** 1 – 1,5 h (más si se hace después de C1 y hay que reajustar).

---

### C4. Carga útil necesaria para la misión 🟠

**Problema.** La misión se gana al llegar a 500 km tenga o no la carga. El informe concluye que soltar la carga es necesario.

**Opciones:**
- **Simple:** exigir `cargaAcoplada === false` para dar la misión como completada (si se llega a 500 km con la carga, mensaje "No entregaste la carga").
- **Con física:** que sin soltar la carga el cohete no llegue a la exosfera, ajustando masas.

**Tiempo:** 30 – 45 min.

---

### C5. TVC solo con motor encendido 🟡

**Problema.** El control de vector de empuje desvía los gases del motor; en el código funciona aunque el motor esté apagado.

**Tarea:** multiplicar `fuerzaTVC` por un factor (1 si hay empuje, 0 si no) en `actualizarViento`.

**Tiempo:** 20 min.

---

### C6. Zona de viento y duración 🟡

**Problema.** Con la velocidad actual el cohete cruza los 20–40 km en ~5 s simulados, con poco margen para reaccionar. El informe sitúa las mayores cizalladuras entre la alta troposfera y la baja estratosfera.

**Tareas:**
1. Tras C1, medir cuánto dura la zona de viento y ajustar su rango o el periodo de alternancia (4 s) para dar tiempo al jugador.
2. Opcional: adelantar el inicio del viento (por ejemplo desde ~15 km) para acercarse al informe.
3. Unificar los límites 18/20/40 km en constantes de `estado.js`.

**Tiempo:** 30 min.

---

### C7. Coeficiente aerodinámico y gravedad 🟡

**Problema.** `AREA_CD = 1.5 * 10` implica Cd = 1,5, alto para un cohete (típico 0,3–0,5). La gravedad es constante a 500 km, donde ya baja ~15 %.

**Tareas:**
1. Documentar o ajustar Cd (reajustando el área o la potencia para no romper el equilibrio de C1/C3).
2. Opcional: `g(h) = g0 · (R/(R+h))²`.

**Tiempo:** 30 – 45 min.

---

### C8. README 🟡

**Tareas:**
- Corregir la errata "platafoma" → "plataforma".
- Actualizar la descripción tras los cambios (Ve, Max-Q por q, carga obligatoria).
- Enlazar [INFORME_RESUMEN.md](INFORME_RESUMEN.md) y este plan.

**Tiempo:** 10 min.

---

## Parte 2 — Nuevas ideas y mejoras

Ordenadas de menor a mayor esfuerzo. El tiempo es orientativo.

### Alto valor para el informe / la defensa

| Idea | Descripción | Tiempo |
|---|---|---|
| **Panel de Tsiolkovski** | Mostrar en el resultado final el Δv teórico (`ve·ln(m0/mf)`) frente a la velocidad máxima conseguida, para demostrar visualmente la ecuación del informe. | 1 – 1,5 h |
| **Gráfica de presión dinámica q** | Añadir una sexta gráfica de q frente al tiempo con el máximo marcado: demuestra el Max-Q con datos. | 45 min |
| **Resumen de misión puntuado** | Al terminar, mostrar puntuación y estadísticas: velocidad máxima, q máxima, combustible sobrante, tiempo de reacción al viento. | 1,5 – 2 h |
| **Comparador de motores** | Permitir lanzar con los tres motores y comparar las gráficas de cada intento en la misma pantalla. | 2 – 3 h |

### Realismo y fidelidad física

| Idea | Descripción | Tiempo |
|---|---|---|
| **Gravity turn / pitchover** | Añadir velocidad horizontal: tras el pitchover, el cohete se inclina y se ve cómo la trayectoria se curva (explicado en el informe). | 4 – 6 h |
| **Velocidad orbital** | Exigir velocidad horizontal ≈ 7,8 km/s además de la altitud para dar la órbita por alcanzada. | 3 – 4 h (junto con la anterior) |
| **Empuje dependiente de la presión** | Usar la fórmula completa `F = ṁ·Ve + Ae(pe − p0)`, de modo que el empuje cambie con la altitud. | 1,5 – 2 h |
| **Cinturones de Van Allen** | Evento en la exosfera que daña la electrónica si no se activa un escudo, como cuenta el informe. | 2 h |
| **Basura espacial interactiva** | En vez de ser decorativa, que haya que esquivarla con el TVC. | 2 – 3 h |
| **Centro de gravedad y de presión** | Mostrar un indicador de estabilidad que dependa del consumo de propelente (informe, apartado 4.3). | 3 – 4 h |

### Jugabilidad y presentación

| Idea | Descripción | Tiempo |
|---|---|---|
| **Niveles de dificultad** | Fácil / normal / difícil: cambian el viento, el margen de Max-Q o la ayuda del copiloto. | 1 – 1,5 h |
| **Sonido** | Motor, alertas de Max-Q, explosión y música de éxito. | 1 – 2 h |
| **Pausa y reinicio** | Botón de pausa y botón "Reintentar" en los resultados, sin recargar la página. | 1 h |
| **Modo sin conexión** | Incluir Chart.js en una carpeta local para no depender de internet. | 15 min |
| **Adaptación a móvil/tablet** | Revisar el diseño responsive y los controles táctiles del TVC. | 2 – 3 h |
| **Guardado de mejor marca** | Guardar con `localStorage` la mejor altitud, velocidad o puntuación. | 45 min |

### Parte didáctica (para el informe)

| Idea | Descripción | Tiempo |
|---|---|---|
| **Fases de regreso** | Añadir una fase opcional de regreso de la primera etapa (boostback, aletas de rejilla, aterrizaje con un motor), como en el apartado 7.2. | 6 – 10 h |
| **Escudo térmico** | Modo "reentrada" de la cápsula con paracaídas (apartado 7.1). | 6 – 8 h |
| **Modo Artemis II** | Escenario basado en el SLS (etapa central líquida + dos propulsores sólidos) con sus parámetros. | 4 – 6 h |
| **Panel "¿Sabías que...?"** | Datos del informe (materiales, historia) que aparezcan durante el vuelo. | 1 – 1,5 h |
| **Pruebas automáticas** | Script de Node que ejecute el bucle físico y compruebe condiciones (gana con X, explota con Y) para detectar regresiones al cambiar constantes. | 2 – 3 h |

---

## Propuesta de orden de trabajo

1. **Sesión 1 (≈ 2,5 h):** C1 (opción A), C2 y C8. Deja el simulador coherente con el informe en lo fundamental.
2. **Sesión 2 (≈ 2,5 h):** C3, C4, C5, C6. Max-Q basado en q, carga necesaria, TVC y viento ajustados.
3. **Sesión 3 (≈ 3 h):** gráfica de q, panel de Tsiolkovski y modo sin conexión. Es lo que más aporta de cara a la presentación.
4. **Después, a elección:** gravity turn y velocidad orbital (el cambio de física más grande), o las mejoras de jugabilidad.
