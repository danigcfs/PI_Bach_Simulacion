# La ciencia detrás del despegue — Resumen del informe

Resumen de la información importante del informe *"La ciencia detrás del despegue"* ([INFORME/PI Bach Clara García.pdf](INFORME/PI%20Bach%20Clara%20García.pdf)), Proyecto de Investigación de **Clara García Casillas**, tutor **Enrique Vargas** (32 páginas). El simulador de este repositorio es la **parte práctica** del informe.

---

## 1. Descripción del trabajo

### Objetivo
- Aprender cómo funciona un cohete, sus subsistemas y la física e ingeniería del despegue y la trayectoria.
- Conocer los puntos críticos del vuelo y los materiales que los resisten (p. ej. altas temperaturas).
- Introducirse en la aeronáutica y orientar la elección de carrera universitaria.

**Hipótesis de investigación:** es posible demostrar, mediante un simulador, los elementos que afectan al viaje espacial: la presión dinámica del aire, la masa del cohete y la ecuación de Tsiolkovski, teniendo en cuenta momentos clave como el **Max-Q** y el desprendimiento de las etapas.

### Metodología
- Metodología **en cascada** (fases secuenciales y lineales).
- Primero se leyeron fuentes para elegir los temas y hacer un índice; luego se investigó tema a tema (leer artículos → analizar lo importante → redactar).
- Fuentes fiables: trabajos universitarios (Google Académico) y la NASA.

### Dificultades
- Poca base previa y vocabulario técnico; poca información hasta descubrir Google Académico.
- Se intentó construir un **hidrocohete** como parte práctica, pero tras tres días no se logró lanzarlo, y se optó por otra idea (el simulador).

### Agradecimientos
Al tutor Enrique Vargas, a Paula González (alumna de la ETSI Aeronáutica y del Espacio, UPM) y a la familia.

---

## 2. Palabras clave

| Término | Significado |
|---|---|
| Cohete | Vehículo que se mueve por propulsión a chorro. |
| Empuje | Fuerza con la que el cohete se propulsa. |
| Cohete sonda | Cohete de investigación, pequeño, misiones de minutos u horas; normalmente no entra en órbita. |
| Propelente | Sustancia que genera gases a alta presión y temperatura para producir empuje. |
| Amerizaje | Aterrizaje sobre el agua. |
| Etapas | Partes del cohete que reducen peso, optimizan motores y aumentan la aceleración. |
| Falcon 9 | Lanzador de SpaceX, de dos etapas y reutilizable. |
| Densidad | Masa por unidad de volumen (kg/m³). |
| Presión dinámica | Energía cinética por volumen de un fluido debida a su velocidad. |
| Órbita | Recorrido de un objeto alrededor de otro mayor. |

---

## 3. Introducción a los cohetes

### Historia
- **1250**: los mongoles usan pólvora (combustible sólido) en la conquista de Bagdad; muy imprecisos. En el **siglo XIX** se añaden aletas para estabilizarlos.
- **Principios del siglo XX**: **Tsiolkovsky** plantea las leyes del movimiento de cohetes en el vacío y defiende el combustible líquido (mejor control de potencia); **Oberth** demuestra teóricamente los viajes en el vacío.
- **1926**: **Goddard** lanza en Massachusetts el primer cohete de combustible líquido (12,5 m, 2,5 s). En **1935** alcanza 2500 m y 1100 km/h.
- **Segunda Guerra Mundial**: Alemania desarrolla el **A-4 / V-2** (cae sobre Londres en 1944 a 5600 km/h).
- **Carrera espacial (1957–1975)**: Sputnik I (4 oct 1957), Yuri Gagarin (12 abr 1961), Apolo 11 / Neil Armstrong en la Luna (20 jul 1969).
- Hoy los cohetes de propelente líquido son los más usados y se trabaja en eficiencia y reducción de costes.

### Aplicaciones
1. Vehículos de lanzamiento (satélites, GPS, personas a la Estación Espacial).
2. Investigación científica y de la atmósfera.
3. Aplicaciones militares (ojivas, asientos eyectables).
4. Rescates (bengalas de barcos).
5. Transporte ultrarrápido de materiales (programa *Rocket Cargo*, EE. UU.).

### Etapas de un cohete
Normalmente dos o tres (también existen de una). Cada etapa lleva su propio motor y propelente; se suelta el peso muerto al agotarse el combustible y el motor de la siguiente etapa continúa.
- **Etapa 0**: gran empuje en los primeros minutos para vencer gravedad y resistencia del aire.
- **Primera etapa (booster principal)**: lleva al cohete a través de la atmósfera; es la más pesada. Si es reutilizable vuelve a Tierra.
- **Etapas superiores**: en el vacío, llevan la carga útil a su órbita precisa.

---

## 4. Subsistemas del cohete

Cuatro subsistemas: estructural, carga de pago (útil), estabilizador y propulsión.

### 4.1. Sistema estructural (el "esqueleto")
Funciones: soportar y transmitir cargas, proteger componentes (ordenador de vuelo, sensores) y encajar los subsistemas. Debe ser resistente pero lo más ligero posible (afecta al centro de gravedad, la estabilidad y el empuje necesario).

Partes:
- **Fuselaje**: estructura principal.
- **Ojiva**: parte superior cónica que corta el aire y reparte las cargas de presión.
- **Aletas** (normalmente cuatro, atrás): dan estabilidad y control. En cohetes no reutilizables son fijas; en los reutilizables van recogidas hasta el descenso. Tipos:
  - *Trapezoidales*: muy usadas a baja altitud, mucha estabilidad.
  - *Delta*: regulables en la fase de diseño para simular el tamaño ideal.
  - *De rejilla*: facilitan el control del vector de empuje (TVC); usadas en el Falcon 9.
- **Soporte del motor**: sección tubular que recibe el empuje y lo transmite al cohete.

### 4.2. Carga de pago (o útil)
Es la justificación de la misión; sin ella el cohete solo subiría y caería. Va agrupada cerca de la ojiva (lejos de vibraciones, temperatura y presión del motor). Tipos de cohete:
- **A gran escala**: ojivas nucleares, sondas, cápsulas tripuladas.
- **Cohetes sonda**: sensores, cámaras y ordenadores de vuelo; se activan en el **apogeo** (altura máxima).

### 4.3. Sistema estabilizador
Sin él, el cohete daría volteretas. Depende de dos puntos:
- **Centro de gravedad**: donde se concentra el peso; varía al consumir propelente (se deja un margen de seguridad).
- **Centro de presión**: donde se concentran las fuerzas aerodinámicas. Para volar recto debe estar **por debajo** del centro de gravedad.

Tipos:
- **Pasiva** (cohetes de investigación): modifica la estructura, p. ej. añadir peso en la ojiva.
- **Activa** (gran escala): **TVC (Control de Vector de Empuje)**, con toberas móviles o propulsores auxiliares que desvían los gases y corrigen la trayectoria en tiempo real, incluso fuera de la atmósfera.

En ambos casos la física es la misma: generar un momento de giro alrededor del centro de gravedad.

### 4.4. Sistema de propulsión
Genera el empuje para vencer gravedad y aire. Tres tipos de motor:

| Tipo | Características | Ventajas / inconvenientes |
|---|---|---|
| **Sólido** | Combustible y oxidante mezclados en un bloque (**grano**). Misiles y cohetes de investigación. | Barato y accesible; **no se puede apagar ni regular** hasta que se consume. |
| **Líquido** | Combustible y oxidante en depósitos separados, inyectados con bombas y válvulas. | Se puede apagar y reencender; sufre problemas como el **efecto POGO** (vibraciones, aceleraciones, fallo estructural). |
| **Híbrido** | Combustible sólido y oxidante líquido o gaseoso. | Muy seguro y controlable (se cierra la válvula del oxidante); caro, complejo y ocupa espacio. |

Componentes básicos del motor:
- **Cámara de combustión**: donde reaccionan combustible y oxidante (materiales resistentes al calor).
- **Tobera**: transforma energía térmica en cinética; su **garganta** (parte estrecha) aumenta la velocidad del gas.
- **Sistema de ignición**: genera la chispa de arranque.

---

## 5. Materiales del cohete

- **Cuerpo**: aleación **aluminio-litio** (baja densidad, alta resistencia; interior) soporta las bajas temperaturas de los depósitos (oxígeno líquido a −183 °C). **Acero inoxidable** en el exterior (alto punto de fusión, económico, útil en la reentrada).
- **Motor** (hasta **3.300 K**): cámara de combustión y toberas en **GRCop-42** (cobre, cromo, niobio): resistencia a alta temperatura + conductividad térmica del cobre.
- **Escudo térmico** de reentrada: **AVCOAT 5026-39** (ablativo; resina con fibras de sílice o vidrio) y **PICA** (ablator de carbono impregnado fenólico, de la NASA; baja densidad y soporta flujos térmicos muy altos).
- **Aletas**: titanio en las de rejilla; aluminio-litio en las delta.

---

## 6. ¿Cómo genera un cohete empuje?

- Analogía del **globo**: el aire sale en un sentido y el globo se mueve en el contrario.
- En un motor líquido se inyectan en la cámara de combustión el combustible (metano, hidrógeno líquido, queroseno) y el oxidante (normalmente oxígeno líquido, porque en el espacio no hay oxígeno). La mezcla se calienta y alcanza gran presión; los gases escapan por la tobera, alcanzan la velocidad del sonido en la garganta (~343 m/s) y siguen acelerando hasta **más de 10.000 km/h**.
- Se explica con la **tercera ley de Newton** (acción-reacción).
- El cohete **pierde masa** al quemar propelente, así que con el mismo empuje **acelera cada vez más**.

### Ecuaciones

**Empuje**

```
F = ṁ · Ve + Ae · (pe − p0)
```
- `F`: empuje · `ṁ`: masa expulsada por segundo · `Ve`: velocidad efectiva de salida de los gases · `Ae`: área de salida de la tobera · `pe`: presión de los gases a la salida · `p0`: presión exterior.
- Si la tobera está diseñada para que `pe ≈ p0`, se simplifica a `F = ṁ · Ve`.

**Ecuación del cohete de Tsiolkovski**

```
Δv = ve · ln(m0 / mf)
```
- `Δv`: variación de velocidad · `ve`: velocidad efectiva de salida · `m0`: masa inicial · `mf`: masa final tras gastar el combustible.
- Relaciona la velocidad alcanzable con la velocidad de los gases y la masa.

Curiosidad: los **calamares** se propulsan igual (expulsan agua tras absorberla).

---

## 7. Regreso a la Tierra

Se recuperan sobre todo la **cápsula** y la **primera etapa**. La segunda etapa suele desintegrarse al reentrar; las **cofias** (carcasas de los satélites) caen en dos mitades con paracaídas y son rescatadas por barcos.

### 7.1. Regreso de la cápsula
1. Se separa de la Estación Espacial o de la nave.
2. Cambia su orientación y enciende motores en sentido contrario al movimiento para frenar y descender.
3. Se orienta con el **escudo térmico** hacia delante. Reentra a unos **28.000 km/h**; el aire comprimido alcanza temperaturas muy altas.
4. Paracaídas guía (frenada suave y estabilización) y después los principales (frenado final).
5. Amerizaje en el océano y rescate (se comprueba que no haya gases tóxicos).

### 7.2. Regreso de la primera etapa (ejemplo Falcon 9)
1. Se separa de la segunda etapa.
2. Se reorienta con propulsores de gas frío.
3. *Boostback burn*: encendido para dirigir la trayectoria al punto de aterrizaje.
4. En la atmósfera reenciende motores para frenar y protegerse del calor.
5. Se apagan los motores y actúan las **aletas de rejilla** para controlar orientación y trayectoria.
6. Cerca del suelo se enciende **un solo motor** (en lugar de tres), se despliegan las **cuatro patas** y se aterriza a muy baja velocidad.

---

## 8. Cómo afectan las capas de la atmósfera al cohete

| Capa | Altitud aprox. | Efectos y eventos clave |
|---|---|---|
| **Troposfera** | 0 – ~12 km | Mayor densidad. Aquí ocurre el **Max-Q** (máxima presión dinámica): la velocidad aumenta mientras la densidad disminuye, y las fuerzas aerodinámicas ponen a prueba la estructura. |
| **Estratosfera** | ~12 – 50 km | La densidad baja notablemente. Mayores **cizalladuras de viento** (entre la alta troposfera y la baja estratosfera). Se realiza el **gravity turn** (giro gravitatorio), que empieza con el *pitchover* y ahorra combustible. |
| **Mesosfera** | 50 – 90 km | Baja densidad y velocidad en aumento. Zona habitual de **separación de etapas**. Cono y aletas superan los **2000 °C** por la compresión del aire. |
| **Termosfera** | > 90 km | Normalmente se **libera la carga útil**, reduciendo masa inútil y mejorando el rendimiento. |
| **Exosfera** | ~500 – 1.000 km en adelante | Rozamiento despreciable. Hay que cruzar los **Cinturones de Van Allen** (dañan la electrónica y agrietan las mantas de aislamiento) y esquivar **basura espacial** (puede perforar tanques o cortar cables; se usan blindajes). Se termina de **ajustar la trayectoria** orientando el motor unos grados mediante el ordenador de abordo. |

**Presión dinámica**

```
q = ½ · ρ · v²
```
`q`: presión dinámica · `ρ`: densidad del aire · `v`: velocidad.

**Cómo se supera el Max-Q**
- **Líquido e híbrido**: se **reduce la potencia** del motor.
- **Sólido**: no se puede regular, así que se diseña el **grano** con un hueco interior en forma de **estrella**. Al quemarse, el hueco pasa a ser un cilindro, lo que reduce la superficie que arde y, con ello, los gases generados y la potencia justo en la zona crítica.

---

## 9. Artemis II

- Parte del programa **Artemis** de la NASA (Artemis I a V). **Artemis I** (noviembre de 2022): prueba sin astronautas de la nave **Orion**.
- **Artemis II**: primera misión tripulada del programa; lanzada el **1 de abril de 2026** desde el Centro Espacial Kennedy (Florida). Duró casi diez días y la nave rodeó la Luna sin aterrizar y regresó a la Tierra.
- **Récord**: distancia máxima de **252.756 millas** desde la Tierra, la mayor recorrida por humanos.
- **Tripulación**: Reid Wiseman (comandante), Victor Glover (piloto), Christina Koch y Jeremy Hansen (especialistas de misión).
- **Cohete SLS (Sistema de Lanzamiento Espacial)**: etapa central y etapa superior de propelente **líquido** y dos propulsores laterales de combustible **sólido**.
- Artemis III, IV y V están previstas entre 2027 y 2028.
- Relación con la teoría: el empuje permite el movimiento y la masa disminuye al consumirse el combustible.

---

## 10. Conclusión

- El trabajo resolvió preguntas como "¿cómo funciona un cohete?" y mostró cuántos sistemas intervienen para que un lanzamiento salga bien.
- **Teoría**: comprensión de la interacción entre subsistemas y de la importancia de adaptar estructura y materiales (acero inoxidable, aluminio-litio) a temperaturas y presiones extremas.
- **Práctica**: mediante el simulador interactivo de vuelo, programado desde cero, se validó la hipótesis:
  1. La **aceleración no es uniforme**: varía al perder masa, como indica Tsiolkovski.
  2. El **Max-Q es el momento más crítico**: en las pruebas, **superar el 65 % de potencia** llevaba al colapso del vehículo.
  3. Es **necesario soltar la etapa 1 y la carga útil** para alcanzar más velocidad y entrar en órbita.
- Se desarrollaron competencias tecnológicas (uso de IA para apoyos visuales y programación web) y se sacaron conclusiones para el futuro universitario.

---

## Relación entre el informe y el simulador

| Concepto del informe | Dónde aparece en el simulador |
|---|---|
| Tres tipos de motor (sólido, líquido, híbrido) | Selector de motor ([js/controles.js](js/controles.js)) |
| Max-Q y límite del 65 % de potencia | `POTENCIA_MAX_MAXQ` en [js/estado.js](js/estado.js) y comprobación en [js/fisica.js](js/fisica.js) |
| Grano sólido y reducción automática de empuje | Modal didáctico y potencia automática del motor sólido |
| Presión dinámica y densidad atmosférica | Modelo exponencial `densidadAire` y rozamiento en [js/fisica.js](js/fisica.js) |
| Pérdida de masa y Tsiolkovski | Masas por etapa en [js/estado.js](js/estado.js) y gráfica de aceleración |
| Cizalladuras de viento y TVC | Viento (18–40 km) y botones/teclas TVC |
| Separación de etapa 1 y liberación de carga útil | [js/acciones.js](js/acciones.js) |
| Capas de la atmósfera, basura espacial | Minimapa y exosfera (basura espacial) |
