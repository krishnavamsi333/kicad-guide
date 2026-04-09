import tvsSymbol from '../assets/tvs-symbols.png'
import tvsPlacement from '../assets/tvs-placement-esd.png'
import tvsConnection from '../assets/tvs-connection.png'
import tvsDataLines from '../assets/tvs-data-lines.png'
import tvsCurrent from '../assets/tvs-current.png'

export const CATEGORIES = ['Passives', 'Semiconductors', 'ICs & Modules', 'Connectors', 'Electromechanical']

export const COMPONENTS = [
  // ── PASSIVES ──────────────────────────────────────────────────────
  {
    category: 'Passives',
    name: 'Resistor',
    symbol: 'R',
    color: 'var(--accent4)',
    icon: '▭',
    oneLiner: 'Limits current, sets voltage levels, pulls signals up or down.',
    what: 'A resistor opposes the flow of electric current. The higher the resistance (in Ohms, Ω), the less current flows for a given voltage (V = I × R).',
    when: [
      'Current limiting for LEDs: R = (VCC − Vf) / I_LED',
      'Pull-up / pull-down resistors on GPIO, I²C, open-drain lines',
      'Voltage dividers to scale down voltages for ADC inputs',
      'Feedback networks in op-amps and regulators',
      'Termination resistors on high-speed lines (typically 50Ω or 100Ω)',
    ],
    picking: 'For LED current limiting: use 330Ω at 3.3V or 470Ω at 5V as a starting point. For pull-ups: 4.7kΩ–10kΩ. For I²C: 4.7kΩ is standard.',
    footprints: ['0402 (most common SMD)', '0603 (easier to hand-solder)', '0805 (beginner-friendly)', 'THT axial (through-hole)'],
    gotchas: 'Resistor tolerance matters for precision circuits. Default 5% (gold band) is fine for most uses. Use 1% for voltage dividers on ADC inputs.',
    packages: '0402, 0603, 0805, 1206',
  },
  {
    category: 'Passives',
    name: 'Capacitor',
    symbol: 'C',
    color: 'var(--accent)',
    icon: '⊣⊢',
    oneLiner: 'Stores charge, filters noise, decouples power supplies, blocks DC.',
    what: 'A capacitor stores electrical energy in an electric field. It blocks DC and passes AC — meaning it\'s invisible at DC but conducts high-frequency signals. Measured in Farads (F), usually µF or nF.',
    when: [
      'Decoupling caps (100nF) on every IC power pin — absorbs switching noise',
      'Bulk caps (10µF–100µF) near power entry — reserves charge during transients',
      'Filter caps in RC low-pass filters',
      'Coupling caps to pass AC while blocking DC between stages',
      'Timing in RC oscillators',
    ],
    picking: '100nF (0.1µF) ceramic for every IC VCC pin, placed as close as possible. Add one 10µF per power rail. Electrolytic for bulk storage, ceramic for decoupling.',
    footprints: ['0402 / 0603 ceramic (SMD)', 'Electrolytic radial (THT)', 'Tantalum SMD'],
    gotchas: 'Electrolytic caps are POLARISED — wrong orientation destroys them. Ceramic caps lose capacitance under DC bias (X5R/X7R are better than Y5V). Check voltage rating — always use at least 2× the working voltage.',
    packages: '0402, 0603, 0805 (ceramic); radial (electrolytic)',
  },
  {
    category: 'Passives',
    name: 'Inductor',
    symbol: 'L',
    color: 'var(--accent2)',
    icon: '∿',
    oneLiner: 'Stores energy in a magnetic field, filters high-frequency noise, used in power conversion.',
    what: 'An inductor resists changes in current. It\'s the opposite of a capacitor — it blocks high frequencies and passes low frequencies. Measured in Henries (H), usually µH.',
    when: [
      'Power inductors in buck/boost converters (switching regulators)',
      'EMI filter beads (ferrite beads) on power rails near noisy ICs',
      'LC filters for RF circuits',
      'Common-mode chokes on USB/HDMI lines',
    ],
    picking: 'For a buck converter: the datasheet will specify the inductor value. Use the recommended value ±20%. For ferrite beads: pick impedance at your noise frequency (e.g. 600Ω at 100MHz for BLM18).',
    footprints: ['0402 / 0603 / 0805 power inductors', 'Larger shielded (1210, 1806) for higher current', 'THT for transformers'],
    gotchas: 'Inductors saturate at high currents — always check the saturation current rating. Unshielded inductors radiate EMI; use shielded types near sensitive analog circuits.',
    packages: '0402–1210 (SMD), various THT',
  },
  {
    category: 'Passives',
    name: 'Crystal / Oscillator',
    symbol: 'Y / X',
    color: 'var(--accent3)',
    icon: '◇',
    oneLiner: 'Provides a precise clock frequency for microcontrollers and communication peripherals.',
    what: 'A crystal uses the piezoelectric effect of quartz to oscillate at a very precise frequency. An oscillator is a crystal + clock circuit in one package (3-pin or 4-pin).',
    when: [
      'MCU clock source when precise timing is needed (UART, USB, Ethernet)',
      'RTC (Real-Time Clock) — 32.768kHz crystal keeps time',
      'USB requires 48MHz (or a multiple) — usually from a PLL + crystal',
    ],
    picking: 'Match the crystal to your MCU datasheet spec exactly — frequency, load capacitance (CL), and ESR. Two external load capacitors are needed: C = 2 × (CL − Cstray), where Cstray ≈ 3–5pF.',
    footprints: ['HC-49 (THT, large)', 'HC-49S (THT, low profile)', '3225, 2520, 1610 (SMD)', '4-pad oscillator module'],
    gotchas: 'Keep crystal traces SHORT (< 5mm) and away from noisy signals. Add a guard ring connected to GND. Do not route other signals under the crystal.',
    packages: 'HC-49 (THT), 3225/2520 (SMD)',
  },

  // ── SEMICONDUCTORS ─────────────────────────────────────────────────
  {
    category: 'Semiconductors',
    name: 'Diode',
    symbol: 'D',
    color: 'var(--accent2)',
    icon: '▷|',
    oneLiner: 'Allows current in one direction only. Used for rectification, protection, and voltage clamping.',
    what: 'A diode has two terminals: Anode (+) and Cathode (−, marked with a stripe). Current flows from anode to cathode when forward-biased. Blocks reverse current.',
    when: [
      'Reverse polarity protection on power inputs',
      'Freewheeling diode across motor / relay coils (prevents back-EMF spikes)',
      'Rectifier in AC-to-DC conversion',
      'Schottky diodes for fast switching, lower forward voltage (0.3V vs 0.7V)',
      'Zener diodes for voltage reference or overvoltage clamping',
    ],
    picking: 'For reverse polarity: 1N4007 (THT) or SS14 Schottky (SMD). For protection diodes: choose Vf < 0.5V (Schottky) and reverse voltage > 2× your supply. For Zener: pick Vz = your clamp voltage.',
    footprints: ['SOD-123 (SMD, most common)', 'SOD-323 (smaller)', '1N4xxx (THT, DO-41)'],
    gotchas: 'Mark polarity clearly on silkscreen — the cathode stripe on the component must match the bar on your footprint. Schottky diodes have higher leakage current; avoid in precision circuits.',
    packages: 'SOD-123, SOD-323, DO-41 (THT)',
  },
  {
    category: 'Semiconductors',
    name: 'TVS Diode (Transient Voltage Suppressor)',
    symbol: 'D (TVS)',
    color: 'var(--accent3)',
    icon: '🛡️',

    images: [
      { src: tvsSymbol, label: 'TVS diode symbols' },
      { src: tvsConnection, label: 'Typical TVS connection' },
      { src: tvsPlacement, label: 'Correct placement near connector' },
      { src: tvsDataLines, label: 'TVS protection on data lines' },
      { src: tvsCurrent, label: 'Current flow during surge' },
    ],
    oneLiner: 'Ultra-fast protection device that clamps voltage spikes and protects circuits from ESD, surges, and transients.',

    what: `A TVS (Transient Voltage Suppressor) diode is a protection device that operates in avalanche breakdown. 
  When voltage exceeds its breakdown threshold, it rapidly switches to a low-impedance state and diverts surge current to ground, clamping the voltage to a safe level.

  It reacts extremely fast (picoseconds to nanoseconds), making it ideal for protecting sensitive electronics from:
  - Electrostatic Discharge (ESD)
  - Inductive switching spikes (back-EMF)
  - Automotive load dump
  - Lightning-induced transients`,

    when: [
      'Power input protection (battery, DC jack, USB)',
      'Communication lines (CAN, UART, USB, I2C, Ethernet)',
      'Motor drivers, relays, and inductive loads (back-EMF protection)',
      'External connectors exposed to environment',
      'ESD protection for GPIO and sensor inputs',
      'Automotive systems (load dump and battery transients)',
    ],

    types: [
      'Unidirectional (DC power rails)',
      'Bidirectional (AC or differential signals)',
      'TVS diode arrays (multi-line ESD protection)',
    ],

    picking: `
  KEY PARAMETERS (CRITICAL):

  - VRWM (Stand-off Voltage):
    Normal operating voltage → TVS remains OFF

  - VBR (Breakdown Voltage):
    Voltage where TVS starts conducting

  - VC (Clamping Voltage):
    Maximum voltage seen by circuit during surge
    MUST be lower than IC absolute max rating

  - IPP (Peak Pulse Current):
    Maximum surge current capability

  - PPP (Peak Pulse Power):
    Energy absorption capability (e.g., 600W, 1500W)

  - Capacitance:
    Low (<5pF) required for high-speed signals (USB, CAN)

  DESIGN RULE:
  VRWM ≥ Vsystem
  VC < IC maximum rating
  `,

    footprints: [
      'SOD-323 (ESD / signal lines)',
      'SOD-123 (general purpose)',
      'SMA (DO-214AC)',
      'SMBJ (DO-214AA)',
      'SMC (DO-214AB high power)',
    ],

    packages: 'SOD-323, SOD-123, SMA, SMBJ, SMC',

    placement: `
  CRITICAL PCB DESIGN RULES:

  1. TVS must be FIRST component after connector
  2. Place VERY CLOSE to entry point
  3. Keep trace length extremely SHORT (minimize inductance)
  4. Provide LOW-IMPEDANCE path to ground
  5. Place BEFORE sensitive ICs (Connector → TVS → Circuit)
  6. Avoid vias in surge path if possible
  7. Use wide traces for surge current

  Correct:
  Connector → TVS → Circuit

  Wrong:
  Connector → Circuit → TVS
  `,

    layoutTips: [
      'Minimize loop area to reduce parasitic inductance',
      'Use solid ground plane for fast current return',
      'Place ground via very close to TVS diode',
      'Avoid routing protected and unprotected traces together',
      'Place TVS before filters and ICs',
    ],

    behavior: `
  NORMAL CONDITION:
  - TVS is OFF (high impedance)
  - No current flows

  SURGE CONDITION:
  - Voltage exceeds breakdown
  - TVS turns ON instantly
  - Clamps voltage and diverts current to ground
  `,

    designInsight: `
  TVS performance depends more on PCB layout than the component itself.

  Long traces increase inductance → higher voltage spike → reduced protection.

  Even a perfect TVS diode will fail if placed far from the connector.

  Key idea:
  Protection = placement + grounding + component
  `,

    comparison: `
  TVS vs Other Protection Devices:

  TVS:
  - Extremely fast (ps response)
  - Low energy handling
  - Best for electronics protection

  MOV:
  - Slower response
  - Higher energy absorption
  - Used in mains protection

  GDT:
  - Very slow
  - Very high energy capability
  - Used for lightning protection

  Best practice:
  Use TVS + MOV combination for robust systems
  `,

    gotchas: `
  - Wrong voltage selection → no protection
  - Long PCB traces → reduced effectiveness
  - Poor grounding → surge not diverted
  - High capacitance → signal distortion (USB/CAN)
  - Overstress → TVS failure (short/open)
  `,

    example: `
  EXAMPLE 1: 24V System
  - VRWM: ~26–30V
  - VC: < 40V
  - Package: SMBJ / SMC

  EXAMPLE 2: USB 5V Line
  - Use low-capacitance TVS (<5pF)
  - Package: SOD-323
  - Type: ESD diode array

  EXAMPLE 3: CAN Bus
  - Use bidirectional TVS
  - Low capacitance required
  `,
  },
  {
    category: 'Semiconductors',
    name: 'LED',
    symbol: 'D (LED)',
    color: 'var(--accent3)',
    icon: '▷|▸',
    oneLiner: 'Emits light when forward current flows. Needs a current-limiting resistor.',
    what: 'A Light Emitting Diode converts electrical energy to light. Forward voltage (Vf) varies by color: red ~2V, green/yellow ~2.1V, blue/white ~3.2V. Typical drive current: 5–20mA.',
    when: ['Status indicators', 'Power-on indication', 'RGB LEDs for user feedback', 'Backlighting'],
    picking: 'R = (VCC − Vf) / I_LED. Example: 3.3V supply, red LED (Vf=2V), 10mA → R = (3.3−2) / 0.01 = 130Ω → use 150Ω. For bright indicators 5mA is plenty.',
    footprints: ['0603 / 0805 (SMD)', '3mm / 5mm round (THT)', 'WS2812B (addressable RGB)'],
    gotchas: 'LEDs are polarised — cathode is the shorter leg or flat side. Never connect LED directly to VCC without a resistor. Reduce current for signal LEDs — 1mA is bright enough for most status indicators.',
    packages: '0603, 0805 (SMD); 3mm, 5mm (THT)',
  },
  {
    category: 'Semiconductors',
    name: 'MOSFET',
    symbol: 'Q',
    color: 'var(--accent)',
    icon: '⊳|',
    oneLiner: 'Voltage-controlled switch or amplifier. Used to switch loads that a microcontroller pin cannot drive directly.',
    what: 'A MOSFET has three pins: Gate (G), Drain (D), Source (S). Gate voltage controls whether current flows from Drain to Source. N-channel MOSFETs are most common: Vgs > threshold = ON.',
    when: [
      'Switching motors, solenoids, relays from a 3.3V MCU',
      'High-side or low-side power switching',
      'PWM motor speed control',
      'Load switches (turn a peripheral on/off under software control)',
    ],
    picking: 'For logic-level switching from 3.3V MCU: choose a logic-level MOSFET (Vgs(th) < 2V, Vgs rating > 10V). Check Rds(on) — lower is better for efficiency. Check Id (drain current) > 2× your load current.',
    footprints: ['SOT-23 (small signal, 3-pin)', 'DPAK / D2PAK (high current)', 'SOT-223', 'THT TO-220'],
    gotchas: 'Add a 10kΩ pull-down on the gate — a floating gate causes unpredictable switching. Add a 100Ω series gate resistor to prevent ringing. Check the gate charge Qg and your driver capability.',
    packages: 'SOT-23, SOT-223, DPAK, TO-220',
  },
  {
    category: 'Semiconductors',
    name: 'Voltage Regulator (LDO)',
    symbol: 'U (VReg)',
    color: 'var(--accent4)',
    icon: '⧖',
    oneLiner: 'Takes a higher input voltage and outputs a stable lower voltage. Essential for powering 3.3V or 5V rails.',
    what: 'A Low-Dropout (LDO) regulator maintains a stable output voltage regardless of input voltage or load current variations (within its specs). Linear regulation — excess power is dissipated as heat.',
    when: [
      'Converting USB 5V → 3.3V for MCU',
      'Providing clean analog supply for ADC, op-amps',
      'Post-regulating after a noisy switching supply',
    ],
    picking: 'Choose output voltage, max current (≥ 2× expected load), and dropout voltage (Vin − Vout). Common: AMS1117-3.3 (1A, cheap), MCP1700 (250mA, low quiescent current for battery). Need input AND output capacitors per datasheet.',
    footprints: ['SOT-23-5', 'SOT-223', 'TO-252 (DPAK)', 'TO-92 (THT)'],
    gotchas: 'Power dissipation = (Vin − Vout) × Iout. At 5V in, 3.3V out, 500mA: P = 1.7 × 0.5 = 0.85W — needs a heatsink or copper pour. If Vin−Vout is large and current is high, use a buck converter instead.',
    packages: 'SOT-23-5, SOT-223, TO-252',
  },

  // ── CURRENT-CONTROLLED DEVICES ───────────────────────────────────

  {
    category: 'Semiconductors',
    name: 'BJT Transistor (NPN/PNP)',
    symbol: 'Q',
    color: 'var(--accent2)',
    icon: '⊲',
    oneLiner: 'Current-controlled switch or amplifier. Base current controls collector current — β times larger.',
    what: `A BJT (Bipolar Junction Transistor) has three terminals: Base (B), Collector (C), Emitter (E).

Current-controlled device: a small base current (IB) controls a much larger collector current (IC).

Key relationship:  IC = β × IB  (β = hFE = current gain, typically 50–300)

NPN (most common):
  Apply +V to base → current flows Collector → Emitter
  Collector is the "drain" (high voltage side)
  Emitter to GND

PNP (complementary):
  Apply 0V (sink) to base → current flows Emitter → Collector
  Emitter to VCC, Collector to load`,
    when: [
      'Switching LEDs, relays, buzzers from a microcontroller GPIO',
      'Amplifying small analog signals (mic, sensor)',
      'Level shifting open-collector outputs',
      'Audio amplifier stages',
      'Current mirror circuits',
      'Driving base of a power transistor (Darlington pair)',
    ],
    picking: `For switching: choose β × IB > IC × 10 (ensure saturation). 
Example: Drive relay at 50mA with MCU 3.3V GPIO:
  IB = 3.3V − 0.7V) / Rb = target ~5mA
  Rb = (3.3 − 0.7) / 0.005 = 520Ω → use 470Ω
  Verify β ≥ 50mA / 5mA = 10 (easily met)

Common NPN: 2N3904, BC547, S8050 (cheap, TO-92 or SOT-23)
Common PNP: 2N3906, BC557, S8550
High-current NPN: 2N2222 (600mA), TIP31C (3A TO-220)`,
    footprints: [
      'SOT-23 (SMD — BC847, MMBT3904)',
      'TO-92 (THT — 2N3904, BC547)',
      'SOT-89 (SMD, medium power)',
      'TO-220 (THT, high current — TIP31C)',
      'D2PAK (SMD, high current)',
    ],
    gotchas: `Always add a base resistor — never connect base directly to GPIO (current would be uncontrolled).
Add a 1kΩ–10kΩ resistor from GPIO → Base.
For inductive loads (relay, motor): add a freewheeling diode across the load (anode to Collector, cathode to VCC).
BJTs are current-controlled, not voltage-controlled — unlike MOSFETs.
VCE(sat) ≈ 0.2V in saturation — expect small voltage drop across transistor.`,
    packages: 'SOT-23, TO-92, TO-220, D2PAK',
  },

  {
    category: 'Semiconductors',
    name: 'Optocoupler / Optoisolator',
    symbol: 'U (OC)',
    color: 'var(--accent3)',
    icon: '⟵|⊕',
    oneLiner: 'Current-controlled isolation device. LED inside drives a phototransistor, passing signal with no electrical connection.',
    what: `An optocoupler contains an LED and a phototransistor in the same package with no electrical connection between them — only a light path.

Input side: drive the internal LED with current (IF) — typically 5–20mA
Output side: photocurrent flows in the phototransistor proportional to LED light

Key spec: CTR (Current Transfer Ratio) = IC_out / IF_in × 100%
Typical CTR: 50%–300%. If IF = 10mA and CTR = 100%, IC = 10mA.

Isolation voltage: typically 1.5kV–5kV — protects your MCU from high-voltage faults.`,
    when: [
      'Isolating MCU from mains (AC dimmer, relay driver, power meter)',
      'CAN bus / RS-485 isolation to protect against ground faults',
      'Isolating noisy switching supply feedback (flyback converter)',
      'Passing control signals across high-voltage safety barriers',
      'Driving triacs/SCRs from logic-level signals',
      'Level shifting without sharing ground reference',
    ],
    picking: `General-purpose: PC817 / 4N35 — cheap, 80kHz, 1500V isolation. For every basic isolation task.
High-speed: TLP291 / 6N137 — 10Mbit/s+, 5kV isolation. Use for fast digital signals (SPI, UART over isolation).
TRIAC driver: MOC3021 / MOC3041 (with zero-cross detection for less EMI). For AC mains control.
For flyback feedback: TL431 + PC817 is the classic isolated feedback network.

Calculate: IF = (VCC − VLED − Vce) / Rf
Where VLED ≈ 1.2V (infrared LED inside). Rf is the series resistor on input side.`,
    footprints: [
      'DIP-4 (THT — PC817, 4N35)',
      'SOP-4 / DIP-4 SMD (PC817C-SMD)',
      'DIP-6 (THT — 6N137, dual channel)',
      'SOIC-8 (SMD high-speed)',
    ],
    gotchas: `CTR degrades with age and temperature — design for CTR / 3 in worst case.
Output phototransistor needs a pull-up resistor to VCC (typically 1kΩ–10kΩ).
Input side and output side MUST use separate power supplies for true isolation — if they share GND, isolation is defeated.
High-speed optocouplers (> 1MHz) need careful PCB layout — keep input and output sides physically separated.
PC817 is NOT fast — 80kHz max. Don't use for SPI or high-speed serial.`,
    packages: 'DIP-4, DIP-6 (THT); SOP-4, SOIC-8 (SMD)',
  },

  // ── VOLTAGE-CONTROLLED DEVICES ───────────────────────────────────

  {
    category: 'Semiconductors',
    name: 'JFET (Junction FET)',
    symbol: 'Q (J)',
    color: 'var(--accent)',
    icon: '⊳',
    oneLiner: 'Voltage-controlled current source. Gate voltage controls drain current with almost zero gate current — ideal for high-impedance analog inputs.',
    what: `A JFET (Junction Field-Effect Transistor) is a voltage-controlled device with three terminals: Gate (G), Drain (D), Source (S).

Key difference from MOSFET: JFET gate is a reverse-biased PN junction — very high input impedance (GΩ range) with near-zero gate current. No gate oxide that can be damaged by static.

N-channel (most common):
  VGS = 0V → fully ON (maximum drain current, IDSS)
  VGS negative → current decreases
  VGS = VGS(off) (pinch-off) → fully OFF

Voltage-controlled: ID = IDSS × (1 − VGS/VP)²
where VP = pinch-off voltage (negative for N-ch, typically −2V to −8V)`,
    when: [
      'High-impedance buffer / preamplifier (electret mic, piezo sensor)',
      'Analog signal switching with very low Ron',
      'Voltage-controlled resistor in AGC (Automatic Gain Control) circuits',
      'Low-noise amplifier front-end (RF, audio)',
      'Current source circuits',
      'Protection switch (self-limiting with source resistor)',
    ],
    picking: `For audio preamp / electret bias: J113, 2N5457 (N-ch), MPF102
For low-noise RF: NE68019, BF256
For analog switch: 2N5459, J175 (P-ch)
For current source: J111, J112, J113 (adjustable with source resistor)

Key specs: IDSS (max drain current at VGS=0), VP (pinch-off voltage), 
gm (transconductance — higher = more gain), noise figure (for RF/audio)

Bias for common-source amp:
  ID = IDSS/4 at VGS = VP/2 — sets operating point mid-range`,
    footprints: [
      'TO-92 (THT — 2N5457, J113, MPF102)',
      'SOT-23 (SMD — J113, 2SK3557)',
      'SOT-143 / SC-70 (SMD compact)',
    ],
    gotchas: `JFETs are depletion-mode devices — they are ON at VGS=0 and turned OFF by negative VGS (N-channel). This is opposite to enhancement-mode MOSFETs which are OFF at VGS=0.
IDSS varies widely between parts — same part number from different batches can vary 3:1. Design circuits that are tolerant of this variation.
ESD sensitivity: gate junction is more robust than MOSFET oxide but still handle with care.
Not suitable for digital switching — use MOSFET instead. JFETs shine in low-noise analog circuits.`,
    packages: 'TO-92 (THT), SOT-23, SOT-143 (SMD)',
  },

  // ── ICs & Modules ─────────────────────────────────────────────────
  {
    category: 'ICs & Modules',
    name: 'Microcontroller (MCU)',
    symbol: 'U',
    color: 'var(--accent)',
    icon: '▣',
    oneLiner: 'The brain — runs your firmware, reads sensors, controls outputs.',
    what: 'A microcontroller is a complete computer on a chip: CPU, RAM, Flash, GPIO, timers, ADC, communication peripherals (UART, SPI, I²C, USB) all integrated.',
    when: ['Any project that needs firmware / programmable logic'],
    picking: 'ATmega328P (Arduino ecosystem, 5V). RP2040 (Raspberry Pi Pico, fast, cheap, USB). STM32 family (professional, many peripherals). ESP32 (WiFi+BT built in).',
    footprints: ['QFP (flat pack, medium pitch)', 'QFN (no leads, compact)', 'TQFP', 'DIP (THT, breadboard-friendly)'],
    gotchas: '100nF decoupling cap on EVERY VCC pin, placed < 1mm from pin. Add bulk 10µF nearby. Expose the ground paddle under QFN packages — it carries most of the heat and provides a good ground.',
    packages: 'TQFP, QFN, DIP, SOIC',
  },
  {
    category: 'ICs & Modules',
    name: 'Op-Amp',
    symbol: 'U',
    color: 'var(--accent2)',
    icon: '▷',
    oneLiner: 'Amplifies voltage differences. Used in analog signal processing, comparators, filters.',
    what: 'An operational amplifier has two inputs (+ and −) and one output. With feedback, it amplifies the difference between inputs. Rail-to-rail types output the full supply range.',
    when: [
      'Amplifying small sensor signals (strain gauge, thermocouple)',
      'Active filters (low-pass, high-pass, band-pass)',
      'Voltage buffer / unity-gain follower (high impedance input → low impedance output)',
      'Comparator (which input is higher?)',
    ],
    picking: 'LM358 (cheap, 5V, not rail-to-rail). MCP6001 (3.3V, rail-to-rail, low power). TLV2371 (3.3V, rail-to-rail, fast). Always check GBW (gain-bandwidth product) — must be >> your signal frequency × gain.',
    footprints: ['SOT-23-5 (single)', 'SOIC-8 (dual)', 'TSSOP (quad)'],
    gotchas: 'Op-amps need split or rail-to-rail supply depending on output range needed. Bypass both supply pins with 100nF. Stability — check your feedback network for phase margin; add a small capacitor in feedback if oscillating.',
    packages: 'SOT-23-5, SOIC-8',
  },
  {
    category: 'ICs & Modules',
    name: 'Logic Level Shifter',
    symbol: 'U',
    color: 'var(--accent3)',
    icon: '↕',
    oneLiner: 'Translates signals between 3.3V and 5V systems so they can talk to each other.',
    what: 'Many sensors and displays run at 5V but modern MCUs use 3.3V. A level shifter (or level translator) safely converts signals bidirectionally or unidirectionally between voltage levels.',
    when: [
      'Connecting 5V Arduino to 3.3V sensor',
      'I²C level shifting (needs bidirectional)',
      'SPI/UART to 5V peripheral from 3.3V MCU',
    ],
    picking: 'BSS138 MOSFET + resistors for I²C (classic, cheap). TXB0108 for SPI/GPIO (automatic direction, fast). SN74LVC245 for unidirectional bus. TCA9406 for I²C specifically.',
    footprints: ['SOT-23 (BSS138)', 'TSSOP-20 (TXB0108, SN74LVC245)', 'SOIC-8'],
    gotchas: 'I²C requires open-drain level shifters — MOSFET-based, not push-pull. Mixing 5V signals into a 3.3V GPIO without a level shifter WILL damage the MCU over time.',
    packages: 'SOT-23, TSSOP, SOIC',
  },

  // ── CONNECTORS ────────────────────────────────────────────────────
  {
    category: 'Connectors',
    name: 'Pin Header',
    symbol: 'J',
    color: 'var(--text-dim)',
    icon: '⫿',
    oneLiner: 'Generic 2.54mm pitch connectors for jumpers, programming headers, and module connections.',
    what: 'Pin headers are the standard 0.1" (2.54mm) pitch connectors seen on Arduino boards and most hobbyist electronics. Available as male (pins) or female (sockets), 1-row or 2-row.',
    when: ['Programming/debug headers (SWD, JTAG, ISP)', 'Module connections', 'I²C/SPI breakout', 'Power input for prototyping'],
    picking: '1×4 or 2×5 for SWD/JTAG. Keyed (shrouded) headers for power to prevent reverse insertion. Use JST connectors for battery connections.',
    footprints: ['PinHeader_1xNN_P2.54mm', 'PinHeader_2xNN_P2.54mm'],
    gotchas: 'Mark pin 1 clearly on silkscreen. Add a polarity key or shroud on power connectors. 2.54mm pitch is too large for dense boards — consider JST-SH (1mm) or Molex Pico-Lock for compact designs.',
    packages: '2.54mm pitch THT, SMD edge mount',
  },
  {
    category: 'Connectors',
    name: 'USB Connector',
    symbol: 'J',
    color: 'var(--accent)',
    icon: '⊡',
    oneLiner: 'Power and data connection to a host computer or charger.',
    what: 'USB connectors provide 5V power and/or data lines (D+/D−). USB-C is the modern standard. Micro-USB is still common. USB Type-A is host-side.',
    when: ['Power input (USB charging)', 'Programming/flashing firmware via USB-serial', 'HID device (keyboard, gamepad)', 'Mass storage or CDC serial communication'],
    picking: 'USB-C for new designs. GCT USB4125 or HRO TYPE-C-31-M-12 are popular footprints. For USB 2.0 data: D+ and D− need 90Ω differential impedance controlled routing.',
    footprints: ['USB_C_Receptacle_GCT_USB4125', 'USB_Micro-B (legacy)', 'USB_A_Molex'],
    gotchas: 'USB-C requires CC pull-down resistors (5.1kΩ to GND on CC1 and CC2) for the host to identify it as a device and provide 5V. Without these, USB-C chargers may not power the board.',
    packages: 'SMD, THT, hybrid',
  },
  {
    category: 'Connectors',
    name: 'JST Connector',
    symbol: 'J',
    color: 'var(--accent4)',
    icon: '⌂',
    oneLiner: 'Polarised, locking connectors for batteries, sensors, and wiring harnesses.',
    what: 'JST (Japan Solderless Terminal) connectors come in many series. JST-PH (2mm) is standard for LiPo batteries. JST-XH (2.5mm) for larger currents. JST-SH (1mm) for compact sensor connections (Stemma QT / Qwiic).',
    when: ['LiPo battery connection (JST-PH 2-pin)', 'Sensor cables (JST-SH for I²C)', 'Motor connections (JST-XH)'],
    picking: 'For LiPo: JST-PH 2-pin, confirm + and − match your battery cable — different manufacturers swap polarity! Use JST-SH 4-pin for Qwiic/Stemma-QT I²C ecosystem.',
    footprints: ['JST_PH_S2B-PH-K_1x02', 'JST_SH_SM04B-SRSS-TB'],
    gotchas: 'JST polarity is NOT standardised across manufacturers. Always check your specific battery\'s wire colors before connecting. The mating half (wire housing) must be ordered separately.',
    packages: 'SMD, THT vertical, THT right-angle',
  },

  // ── ELECTROMECHANICAL ────────────────────────────────────────────
  {
    category: 'Electromechanical',
    name: 'Tactile Switch',
    symbol: 'SW',
    color: 'var(--accent2)',
    icon: '⊙',
    oneLiner: 'Momentary push button for user input, reset, or boot mode selection.',
    what: 'A tactile switch is a momentary push button — it closes the circuit only while pressed. Used for reset buttons, mode selection, and user input. Internal contacts bounce when pressed (debounce in firmware or with RC filter).',
    when: ['Reset button', 'Boot/programming mode button', 'User input', 'Test points activation'],
    picking: 'Bourns PTS645 or TE 1-1825910 are reliable choices. Check actuation force, height, and whether it\'s sealed (IP-rated) if used in humid environments.',
    footprints: ['SW_Push_SPST_NO_Alps_SKRK', 'SW_SPST_PTS645'],
    gotchas: 'Wire between GPIO and GND, with a pull-up resistor (or internal MCU pull-up enabled). Debounce in firmware: read the button and require 2–5ms stable before registering a press.',
    packages: '6×6mm, 3×4mm, 3×6mm SMD',
  },
  {
    category: 'Electromechanical',
    name: 'Fuse',
    symbol: 'F',
    color: 'var(--red)',
    icon: '⌀',
    oneLiner: 'Protects your circuit from overcurrent — sacrifices itself to save your board.',
    what: 'A fuse is a thin wire that melts and opens the circuit when current exceeds its rating. Resettable polyfuses (PTC thermistors) are popular for PCBs — they reset after the fault is removed.',
    when: [
      'Power input protection on any board',
      'USB power outputs (protect downstream devices)',
      'Battery-powered designs (prevent fire from shorts)',
    ],
    picking: 'For PCBs: Bourns MF-MSMF polyfuses are easy to use and self-resetting. Rating should be 125–150% of max normal current. Place on the positive supply rail, as close to the power entry point as possible.',
    footprints: ['Fuse_0805', 'Fuse_1206', 'Fuse_Littelfuse_Nano2'],
    gotchas: 'Polyfuses have relatively slow response — they won\'t protect against short-duration high-current spikes. For those, use a fast-blow fuse. Always add a fuse on any battery-powered design.',
    packages: '0805, 1206 (SMD); 5×20mm, 3AG (THT)',
  },
]

export const FOOTPRINT_RULES = [
  {
    type: 'Resistor',
    symbol: 'R',
    color: 'var(--accent4)',
    icon: '▭',
    concept: `A resistor's value (Ω) has **NO relationship** to physical size — 10Ω and 10MΩ share the same 0402 footprint. What drives the package is **power rating (watts)** and **voltage rating**.\n\nEvery value is available in the full SMD range (0201 → 4527) AND THT axial. Same value, completely different footprints.`,
    chooseSMD: 'Any production PCB. Compact layout. Automated pick-and-place. Power < 2W.',
    chooseTHT: 'Breadboard / perfboard prototyping. Power > 2W. High voltage > 200V. User-replaceable fuses/sense resistors.',
    smd: [
      { test: 'P < 31 mW — ultra miniature', package: '0201  (0.6×0.3mm)', kiCad: 'Resistor_SMD:R_0201_0603Metric', note: 'Machine-placement only. Not hand-solderable. RF/ultra-compact.' },
      { test: 'P < 62.5 mW — compact signal', package: '0402  (1.0×0.5mm)', kiCad: 'Resistor_SMD:R_0402_1005Metric', note: 'Very common. Hard to hand-solder without magnification.' },
      { test: 'P < 100 mW — general purpose ★', package: '0603  (1.6×0.8mm)', kiCad: 'Resistor_SMD:R_0603_1608Metric', note: 'Default recommendation. Good hand-solderability + size balance.' },
      { test: 'P < 125 mW — beginner friendly', package: '0805  (2.0×1.25mm)', kiCad: 'Resistor_SMD:R_0805_2012Metric', note: 'Easier to solder than 0603. Slightly larger.' },
      { test: 'P < 250 mW — higher dissipation', package: '1206  (3.2×1.6mm)', kiCad: 'Resistor_SMD:R_1206_3216Metric', note: 'Good for 100–250mW. Larger thermal mass.' },
      { test: 'P < 500 mW — wide body', package: '1210  (3.2×2.5mm)', kiCad: 'Resistor_SMD:R_1210_3225Metric', note: 'Wider than 1206. Handles more power in same length.' },
      { test: 'P < 750 mW — power chip', package: '2010  (5.0×2.5mm)', kiCad: 'Resistor_SMD:R_2010_5025Metric', note: 'Current-sense resistors, shunts. Low resistance values.' },
      { test: 'P < 1 W — large power chip', package: '2512  (6.3×3.2mm)', kiCad: 'Resistor_SMD:R_2512_6332Metric', note: 'Biggest standard chip resistor. Shunt / power resistor.' },
      { test: 'P 1–3 W — open frame power', package: '4527 / TO-263 power', kiCad: 'Resistor_SMD:R_4527_11569Metric', note: 'Large open-frame SMD power resistor. Check datasheet dims.' },
      { test: 'Shunt / current sense (mΩ range)', package: '2512 or 4-terminal Kelvin', kiCad: 'Resistor_SMD:R_2512_6332Metric', note: '4-terminal (Kelvin) package eliminates lead resistance error.' },
      { test: 'Resistor array — 4 or 8 resistors', package: 'convex SOP / concave', kiCad: 'Resistor_SMD:R_Array_SOP-8_P1.27mm', note: 'One footprint, multiple resistors. Saves board space.' },
      { test: 'High-voltage > 200V SMD', package: '1206 HV or 2010 HV', kiCad: 'Resistor_SMD:R_1206_3216Metric', note: 'Must buy HV-rated part. Standard 0402/0603 only rated 50–100V.' },
    ],
    tht: [
      { test: 'P < 250 mW — 1/4W standard', package: 'Axial DO-7 / L6.3mm D2.5mm', kiCad: 'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P7.62mm', note: 'Classic carbon film. Most common resistor on earth.' },
      { test: 'P < 500 mW — 1/2W', package: 'Axial L6.8mm D2.5mm P10.16mm', kiCad: 'Resistor_THT:R_Axial_DIN0207_L6.3mm_D2.5mm_P10.16mm', note: 'Wider pitch for larger body.' },
      { test: 'P < 1 W', package: 'Axial DIN0414 L9.9mm D3.6mm', kiCad: 'Resistor_THT:R_Axial_DIN0414_L9.9mm_D3.6mm_P15.24mm', note: 'Metal film 1W. Check body length in datasheet.' },
      { test: 'P 2–5 W — wirewound', package: 'Wirewound axial L20mm W6.4mm', kiCad: 'Resistor_THT:R_Axial_Power_L20.0mm_W6.4mm_P22.40mm', note: 'Ceramic core wirewound. Inductive at high freq — avoid for RF.' },
      { test: 'P 5–25 W — cement/aluminium', package: 'Cement box or alu-clad SIP', kiCad: 'Resistor_THT:R_Radial_box_L37.0mm_W8.0mm_P28.00mm', note: 'Bolt cement type to chassis. Alu-clad SIP: bolt to heatsink.' },
    ],
    voltage: '0201/0402: 50V rated. 0603: 75V. 0805: 150V. 1206+: 200V. For > 200V buy HV-rated parts explicitly. THT axial: 200–500V standard.',
    example: 'LED limiter 5V/20mA: P=(5−2)×0.02=60mW → 0603 SMD (Resistor_SMD:R_0603). Breadboard: 1/4W axial. 100mΩ current shunt at 5A: P=2.5W → 2512 SMD Kelvin 4-terminal.',
  },
  {
    type: 'Capacitor (Ceramic)',
    symbol: 'C',
    color: 'var(--accent)',
    icon: '⊣⊢',
    concept: `**Both value AND voltage rating** determine the SMD ceramic package. Higher capacitance or higher voltage needs a physically larger package to hold the dielectric.\n\nThe same 100nF value exists in every size from 0201 to 1812. The same value at 100V needs a bigger package than at 10V. Same value in THT = ceramic disc.`,
    chooseSMD: 'Any PCB. Decoupling, bypass, filter, timing. Values 0201–1812 cover 1pF to 100µF.',
    chooseTHT: 'Breadboard, prototyping, high-voltage disc snubbers, mains safety Y/X caps.',
    smd: [
      { test: '1pF – 10nF, up to 25V — RF/timing', package: '0201  (0.6×0.3mm)', kiCad: 'Capacitor_SMD:C_0201_0603Metric', note: 'Machine-place only. RF matching networks, tiny oscillator caps.' },
      { test: '10pF – 100nF, up to 50V — decoupling ★', package: '0402  (1.0×0.5mm)', kiCad: 'Capacitor_SMD:C_0402_1005Metric', note: '100nF X7R 0402 10V = the most ordered capacitor in electronics.' },
      { test: '100nF – 1µF, up to 50V — bypass ★', package: '0603  (1.6×0.8mm)', kiCad: 'Capacitor_SMD:C_0603_1608Metric', note: '1µF 10V X5R 0603 — standard bulk bypass. Easy to hand-solder.' },
      { test: '1µF – 10µF, up to 25V', package: '0805  (2.0×1.25mm)', kiCad: 'Capacitor_SMD:C_0805_2012Metric', note: '10µF 10V X5R 0805 — common LDO output cap.' },
      { test: '10µF – 47µF, up to 25V', package: '1206  (3.2×1.6mm)', kiCad: 'Capacitor_SMD:C_1206_3216Metric', note: '47µF 10V X5R in 1206. Getting large — consider electrolytic.' },
      { test: '100nF – 10µF, up to 100V', package: '1210  (3.2×2.5mm)', kiCad: 'Capacitor_SMD:C_1210_3225Metric', note: 'Wider body handles higher voltage. 4.7µF 100V fits in 1210.' },
      { test: '10µF – 100µF, up to 50V — large value', package: '1812  (4.5×3.2mm)', kiCad: 'Capacitor_SMD:C_1812_4532Metric', note: 'Largest common chip cap. 100µF 10V X5R available in 1812.' },
      { test: '1pF – 1nF, NP0/C0G — precision', package: '0402 or 0603 NP0', kiCad: 'Capacitor_SMD:C_0402_1005Metric', note: 'NP0/C0G: zero tempco, no DC bias shift. Use for oscillators, filters.' },
      { test: 'High ripple current — power supply output', package: '1210 X5R or 1812 X5R', kiCad: 'Capacitor_SMD:C_1210_3225Metric', note: 'X5R/X7R handle ripple better than electrolytic at high freq.' },
      { test: '> 100µF SMD ceramic', package: 'Not practical — use electrolytic', kiCad: '—', note: 'Beyond 100µF, ceramic becomes expensive. Use SMD electrolytic.' },
    ],
    tht: [
      { test: '10pF – 100nF, up to 50V', package: 'Disc D5mm P2.5mm', kiCad: 'Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P2.50mm', note: 'Classic blue/yellow ceramic disc. Ubiquitous on hobby boards.' },
      { test: '100nF – 10nF, up to 100V', package: 'Disc D7.5mm P5mm', kiCad: 'Capacitor_THT:C_Disc_D7.5mm_W2.5mm_P5.00mm', note: 'Larger disc. Read voltage rating printed on body.' },
      { test: '1nF – 100nF, up to 250V', package: 'Disc D4.5mm P2.5mm (HV)', kiCad: 'Capacitor_THT:C_Disc_D4.7mm_W2.5mm_P2.50mm', note: 'High-voltage rated. Common in CRT / mains snubbers.' },
      { test: 'Mains filter — X2 cap 100–470nF', package: 'Box/safety D13mm P7.5mm', kiCad: 'Capacitor_THT:C_Disc_D13.0mm_W3.5mm_P7.50mm', note: 'X2 rated for across-the-line. Fail-safe. NEVER use standard cap.' },
      { test: 'Mains filter — Y1/Y2 cap 4.7–10nF', package: 'Safety disc P5mm', kiCad: 'Capacitor_THT:C_Disc_D7.5mm_W2.5mm_P5.00mm', note: 'Y-cap: line to ground. Must be Y-safety rated. Leakage current controlled.' },
    ],
    voltage: 'CRITICAL: always rate 2× circuit voltage. DC bias effect: X5R/X7R lose capacitance at rated voltage — a "10µF 10V" cap may only have 3µF at 9V. Use NP0 for precision.',
    example: '100nF decoupling on 3.3V MCU pin: 0402 X7R 10V (C_0402). 10µF LDO output on 5V rail: 0805 X5R 10V (C_0805). Breadboard: disc ceramic D5mm P2.5mm. Same schematic, different footprint.',
  },
  {
    type: 'Capacitor (Electrolytic)',
    symbol: 'C',
    color: 'var(--accent)',
    icon: '⊣⊢',
    concept: `Electrolytics exist in **THT radial** (cylindrical, 2 through-hole legs) and **SMD aluminium / polymer / tantalum** versions — same capacitance value available in both.\n\nFootprint is set by **physical body diameter and height** — not capacitance alone. Same 100µF at 16V vs 50V = different diameter. Always read the datasheet mechanical drawing.`,
    chooseSMD: 'Production PCB, height-limited designs, reflow assembly. SMD polymer has excellent ESR.',
    chooseTHT: 'Prototyping, bulk caps > 1000µF, easy hand-replacement, low-cost boards.',
    smd: [
      { test: '1µF – 10µF up to 16V', package: 'SMD Al-Elec D4mm H5.4mm', kiCad: 'Capacitor_SMD:CP_Elec_4x5.4', note: 'Smallest SMD electrolytic. Stripe = negative.' },
      { test: '10µF – 47µF up to 16V', package: 'SMD Al-Elec D5mm H5.4mm', kiCad: 'Capacitor_SMD:CP_Elec_5x5.4', note: 'e.g. Panasonic EEE-FK series. Very common.' },
      { test: '47µF – 100µF up to 25V', package: 'SMD Al-Elec D6.3mm H7.7mm', kiCad: 'Capacitor_SMD:CP_Elec_6.3x7.7', note: 'Common SMD electrolytic size. Check height clearance.' },
      { test: '100µF – 220µF up to 25V', package: 'SMD Al-Elec D8mm H10.2mm', kiCad: 'Capacitor_SMD:CP_Elec_8x10.2', note: 'Larger body. Panasonic EEE-FP / FR series.' },
      { test: '220µF – 470µF up to 16V', package: 'SMD Al-Elec D10mm H12.5mm', kiCad: 'Capacitor_SMD:CP_Elec_10x12.5', note: 'Near max for SMD electrolytic. Consider THT at this size.' },
      { test: '1µF – 100µF — low ESR polymer ★', package: 'SMD Polymer D6.3–10mm', kiCad: 'Capacitor_SMD:CP_Elec_6.3x7.7', note: 'OS-CON / Panasonic SP: 10× lower ESR. Best for SMPS output.' },
      { test: '0.1µF – 1000µF — tantalum, Case A', package: 'Tant Case-A  EIA-3216 (3.2×1.6mm)', kiCad: 'Capacitor_SMD:CP_Tantalum_Case-A_EIA-3216-18', note: '10µF 10V most common. Polarity stripe = positive.' },
      { test: 'Tantalum — Case B (medium)', package: 'Tant Case-B  EIA-3528 (3.5×2.8mm)', kiCad: 'Capacitor_SMD:CP_Tantalum_Case-B_EIA-3528-21', note: '47µF 10V typical. Kemet T491 series.' },
      { test: 'Tantalum — Case C (large)', package: 'Tant Case-C  EIA-6032 (6.0×3.2mm)', kiCad: 'Capacitor_SMD:CP_Tantalum_Case-C_EIA-6032-28', note: '100µF 10V typical. Never exceed 50% of rated voltage.' },
      { test: 'Tantalum — Case D (extra large)', package: 'Tant Case-D  EIA-7343 (7.3×4.3mm)', kiCad: 'Capacitor_SMD:CP_Tantalum_Case-D_EIA-7343-31', note: '330µF 10V. Large SMD tant. Polarity CRITICAL — reverse = failure.' },
    ],
    tht: [
      { test: '1µF – 22µF, ≤16V', package: 'Radial D5mm P2mm', kiCad: 'Capacitor_THT:CP_Radial_D5.0mm_P2.00mm', note: 'Smallest common THT electrolytic. Some 1µF are D4mm — check.' },
      { test: '22µF – 220µF, up to 25V', package: 'Radial D6.3mm P2.5mm', kiCad: 'Capacitor_THT:CP_Radial_D6.3mm_P2.50mm', note: 'Most common. 100µF 16V usually fits here. White stripe = negative.' },
      { test: '220µF – 1000µF, up to 25V', package: 'Radial D8mm P3.5mm', kiCad: 'Capacitor_THT:CP_Radial_D8.0mm_P3.50mm', note: '470µF 16V standard size.' },
      { test: '1000µF – 3300µF, up to 35V', package: 'Radial D10mm P5mm', kiCad: 'Capacitor_THT:CP_Radial_D10.0mm_P5.00mm', note: 'Bulk filter. Mind height — may clash with nearby components.' },
      { test: '> 3300µF or > 50V', package: 'Radial D12.5mm or D16mm P7.5mm', kiCad: 'Capacitor_THT:CP_Radial_D12.5mm_P5.00mm', note: 'Large reservoir cap. Check height and lead pitch from datasheet.' },
    ],
    voltage: 'Same capacitance at higher voltage = bigger body. 100µF 16V ≠ 100µF 50V footprint. Tantalum: never exceed 50% of rated voltage — reverse voltage = instant failure.',
    example: '100µF bulk cap on 5V rail: THT → Nichicon D6.3mm (CP_Radial_D6.3mm). SMD production → Panasonic EEE-FP 6.3×7.7 (CP_Elec_6.3x7.7). SMPS output low-ESR: SMD polymer same footprint.',
  },
  {
    type: 'Inductor',
    symbol: 'L',
    color: 'var(--accent3)',
    icon: '∿',
    concept: `The **same inductance value** (e.g. 10µH) is available as a tiny SMD chip, a shielded SMD power inductor, or a THT axial/toroid — completely different footprints.\n\n**Inductance value alone tells you nothing about size.** A 10µH at 100mA is 0402 size. A 10µH at 10A is the size of a fingernail. The critical spec is **Isat (saturation current)**.`,
    chooseSMD: 'All PCB SMPS designs. Shielded SMD = less EMI. Chip inductors for RF/signal. Power inductors for buck/boost.',
    chooseTHT: 'Prototyping, audio chokes, high-current (>15A) power, hand-wound toroids, isolation transformers.',
    smd: [
      { test: '1nH – 100nH, RF matching', package: '0201 chip  (0.6×0.3mm)', kiCad: 'Inductor_SMD:L_0201_0603Metric', note: 'RF matching. Machine-place only. Murata LQG series.' },
      { test: '1nH – 470nH, RF/HF signal', package: '0402 chip  (1.0×0.5mm)', kiCad: 'Inductor_SMD:L_0402_1005Metric', note: 'RF chokes, bias tees. Murata LQW/LQG. Imax < 300mA.' },
      { test: '1nH – 1µH, signal / EMI bead', package: '0603 chip  (1.6×0.8mm)', kiCad: 'Inductor_SMD:L_0603_1608Metric', note: 'EMI beads in 0603. Würth WE-CBF. < 500mA.' },
      { test: '1µH – 100µH, < 300mA', package: '0805 chip  (2.0×1.25mm)', kiCad: 'Inductor_SMD:L_0805_2012Metric', note: 'Signal inductors, small filters. TDK MLK series.' },
      { test: '1µH – 470µH, < 500mA', package: '1210 chip  (3.2×2.5mm)', kiCad: 'Inductor_SMD:L_1210_3225Metric', note: 'Larger chip. Low-current buck at 1210.' },
      { test: '1µH – 22µH, < 1A — small SMPS', package: 'Shielded 2×2mm (2020)', kiCad: 'Inductor_SMD:L_2.0x2.0_H1.0mm', note: 'e.g. TDK SLF2012. Ultra-compact buck converter.' },
      { test: '1µH – 47µH, 1–2A', package: 'Shielded 3×3mm (3015)', kiCad: 'Inductor_SMD:L_3.0x3.0_H1.5mm', note: 'e.g. Bourns SRR0302. 5V/1A buck.' },
      { test: '1µH – 47µH, 1.5–3A ★', package: 'Shielded 4×4mm (4018)', kiCad: 'Inductor_SMD:L_4.0x4.0_H2.1mm', note: 'Bourns SRR1005, TDK VLF4012. Most common SMPS inductor.' },
      { test: '1µH – 68µH, 3–6A', package: 'Shielded 5×5mm (5020)', kiCad: 'Inductor_SMD:L_5.0x5.0_H2.0mm', note: 'e.g. Bourns SRR1260, Würth WE-MAPI 5040.' },
      { test: '1µH – 100µH, 5–10A', package: 'Shielded 6×6mm (6028)', kiCad: 'Inductor_SMD:L_6.0x6.0_H2.8mm', note: 'e.g. TDK CLF6045, Vishay IHLP-2525. High-current buck.' },
      { test: '1µH – 100µH, 8–15A', package: 'Shielded 8×8mm (8040)', kiCad: 'Inductor_SMD:L_8.0x8.0_H4.0mm', note: 'e.g. Vishay IHLP-2525CZ, Würth WE-LHMI 8040. CPU/GPU power.' },
      { test: '1µH – 22µH, 15–30A — high-power', package: 'Shielded 10×10mm or 12×12mm', kiCad: 'Inductor_SMD:L_10.0x10.0_H4.0mm', note: 'e.g. Vishay IHLP-5050. Large footprint — verify vs datasheet.' },
      { test: 'EMI suppression bead — any size', package: '0402 / 0603 / 0805 bead', kiCad: 'Inductor_SMD:L_0402_1005Metric', note: 'Ferrite bead — same footprint as chip inductor. Use bead library entry in KiCad.' },
    ],
    tht: [
      { test: '< 100µH, < 500mA — prototype', package: 'Axial L5.3mm D2.2mm P10mm', kiCad: 'Inductor_THT:L_Axial_L5.3mm_D2.2mm_P10.16mm', note: 'Bourns 78F series. Same axial footprint family as resistors.' },
      { test: '10µH – 10mH, any current — toroid', package: 'Toroid vertical D10mm P5mm', kiCad: 'Inductor_THT:L_Toroid_Vertical_D10.0mm_P5.00mm', note: 'Hand-wound. Excellent EMI containment. Footprint = outer diameter.' },
      { test: '> 5A high-current — large toroid', package: 'Toroid D13mm or D20mm', kiCad: 'Inductor_THT:L_Toroid_Vertical_D13.0mm_P7.50mm', note: 'Iron powder / ferrite toroid. Common in 10–50A power supplies.' },
      { test: 'Audio choke', package: 'Radial drum D7mm P2.5mm', kiCad: 'Inductor_THT:L_Radial_D7.0mm_P2.50mm', note: 'Drum core. Measure body for correct footprint.' },
    ],
    voltage: 'Key specs to match: **Isat** (saturation current — must exceed your peak current) and **DCR** (DC resistance — lower = less heat). Exceeding Isat = inductance collapses → disaster.',
    example: '4.7µH buck at 2A peak: shielded 4×4mm SMD, Bourns SRR1005-4R7Y (Isat=2.5A) → L_4.0x4.0. 100µH audio choke < 200mA: THT axial Bourns 78F101J → L_Axial. Same value, very different packages.',
  },
  {
    type: 'LED',
    symbol: 'D',
    color: 'var(--accent2)',
    icon: '▷|',
    concept: `The same LED colour/Vf exists in SMD (0402 → 5050 → high-power module) and THT (D3mm, D5mm) packages. Same schematic symbol — completely different footprint.\n\nPackage choice is driven by **brightness requirement**, **assembly method**, and **whether it must be visible outside an enclosure**.`,
    chooseSMD: 'PCB-mounted indicators. Compact boards. RGB addressable strips. Reflow production.',
    chooseTHT: 'Panel-mount visible indicators. Prototyping. Breadboard. Any LED that pokes through an enclosure.',
    smd: [
      { test: 'Ultra-tiny status — any colour', package: '0201  (0.6×0.3mm)', kiCad: 'LED_SMD:LED_0201_0603Metric', note: 'Machine-place only. Hard to distinguish anode/cathode by eye.' },
      { test: 'Compact status indicator', package: '0402  (1.0×0.5mm)', kiCad: 'LED_SMD:LED_0402_1005Metric', note: 'Very common. Cathode = bevelled corner. Needs magnification.' },
      { test: 'Standard status indicator ★', package: '0603  (1.6×0.8mm)', kiCad: 'LED_SMD:LED_0603_1608Metric', note: 'Best default. Hand-solderable. Cathode triangle mark on body.' },
      { test: 'High-brightness indicator', package: '0805  (2.0×1.25mm)', kiCad: 'LED_SMD:LED_0805_2012Metric', note: 'Brighter than 0603. Still compact. 5–20mA typical.' },
      { test: 'Large visible indicator / logo', package: '1206  (3.2×1.6mm)', kiCad: 'LED_SMD:LED_1206_3216Metric', note: 'Very visible. Bright. Good for indicators on panels.' },
      { test: 'Bi-colour or 2-LED package', package: '1206 dual or SOT-23-3', kiCad: 'LED_SMD:LED_1206_3216Metric', note: 'Anode-common or cathode-common. Check datasheet pinout.' },
      { test: 'RGB — WS2812B / NeoPixel', package: '5050  (5.0×5.0mm)', kiCad: 'LED_SMD:LED_5050_5.6x5.0mm_P3.45mm', note: 'Addressable. 4 pads (Vdd, Dout, GND, Din). Orientation matters.' },
      { test: 'RGB — compact board', package: '3535  (3.5×3.5mm)', kiCad: 'LED_SMD:LED_3535_3.5x3.5mm_P2.60mm', note: 'Smaller than 5050. SK6812 mini series.' },
      { test: 'RGB — ultra compact', package: '2020  (2.0×2.0mm)', kiCad: 'LED_SMD:LED_2020_2.0x2.0mm', note: 'SK6812 mini-E. Very small addressable. Machine-place only.' },
      { test: 'High-power LED (>100mW)', package: 'Star / MCPCB module 20mm', kiCad: 'LED_SMD:LED_Cree_XHP70', note: 'Dedicated high-power footprint. MUST solder to thermal pad.' },
      { test: 'Side-emitting (lightguide)', package: '0603 side-view or 0805 side', kiCad: 'LED_SMD:LED_0603SideView', note: 'Emits parallel to board. Used with lightguide pipes to panel.' },
      { test: 'Infrared TX/RX (IR remote)', package: '0603 or 0805 IR', kiCad: 'LED_SMD:LED_0603_1608Metric', note: 'Same 0603/0805 footprint. Verify wavelength (850/940nm).' },
    ],
    tht: [
      { test: 'Prototype / breadboard', package: 'D3mm round', kiCad: 'LED_THT:LED_D3.0mm', note: 'Flat side on body = cathode. Short lead = cathode.' },
      { test: 'Standard hobbyist LED ★', package: 'D5mm round', kiCad: 'LED_THT:LED_D5.0mm', note: 'Most common. Long lead = anode. Flat edge on rim = cathode.' },
      { test: 'Panel-mount 3mm bezel', package: 'D3mm flat-top', kiCad: 'LED_THT:LED_D3.0mm_FlatTop', note: 'Snaps into 3.2mm panel hole.' },
      { test: 'Panel-mount 5mm bezel', package: 'D5mm flat-top', kiCad: 'LED_THT:LED_D5.0mm_FlatTop', note: 'Snaps into 5.2mm panel hole. Standard instrument indicator.' },
      { test: 'Edge-pointing at board edge', package: 'D5mm right-angle', kiCad: 'LED_THT:LED_D5.0mm_Horizontal_O1.27mm_Z3.0mm', note: 'Emits parallel to PCB surface.' },
      { test: 'High-power THT (torch/flood)', package: 'D8mm or D10mm power LED', kiCad: 'LED_THT:LED_D8.0mm', note: 'Typically > 500mW. Needs heatsink or large copper pad.' },
    ],
    voltage: 'Vf by colour: Red/IR ≈2.0V, Yellow/Amber ≈2.1V, Green ≈3.2V, Blue ≈3.3V, White ≈3.2V, UV ≈3.5V. Identical for SMD and THT of same colour.',
    example: 'Blue power LED on 3.3V at 5mA: R=(3.3−3.2)/0.005=20Ω, use 22Ω 0603. LED: SMD 0603 on PCB (LED_0603), or THT D5mm on breadboard. Same R value, swap LED footprint only.',
  },
  {
    type: 'Diode / Zener',
    symbol: 'D',
    color: 'var(--accent3)',
    icon: '▷|',
    concept: `Diodes exist in a huge range of SMD packages and THT axial packages for the **same part number** — 1N4148 comes as SOD-523 (tiny SMD), SOD-323, SOD-123, SOT-23, and DO-35 (THT). All same electrical specs, completely different footprint.\n\nPackage is driven by **peak current** and **reverse voltage**, not "value" — diodes don't have a value in the resistor sense.`,
    chooseSMD: 'Any PCB. Signal, ESD, Schottky, Zener, TVS. SOD-123 is the easiest to hand-solder.',
    chooseTHT: 'Prototyping. High-current rectifiers > 3A. Bridge rectifiers. Breadboard.',
    smd: [
      { test: 'ESD clamp / signal (< 100mA) — tiny', package: 'SOD-523  (1.2×0.8mm)', kiCad: 'Diode_SMD:D_SOD-523', note: 'Smallest SMD diode. Machine-place only. ESD arrays only.' },
      { test: 'Signal diode / Schottky (< 200mA) ★', package: 'SOD-323  (1.7×1.25mm)', kiCad: 'Diode_SMD:D_SOD-323', note: '1N4148W in SOD-323. Most common SMD signal diode package.' },
      { test: 'Signal / Zener (< 500mA) — easy solder ★', package: 'SOD-123  (3.6×1.55mm)', kiCad: 'Diode_SMD:D_SOD-123', note: 'Easiest SMD diode to hand-solder. 1N4148WS, BAT54.' },
      { test: 'General-purpose / Schottky (< 1A)', package: 'SOD-123F  (flat leads)', kiCad: 'Diode_SMD:D_SOD-123', note: 'Flat lead variant. Better reflow solderability than SOD-123.' },
      { test: 'Zener precision reference', package: 'SOT-23-3  (3-pin)', kiCad: 'Diode_SMD:D_SOT-23', note: 'BZX84 Zener in SOT-23. Pin 1=A, pin 3=K. Confirm pinout!' },
      { test: 'Dual diode (common anode or cathode)', package: 'SOT-23-3 or SOT-363', kiCad: 'Diode_SMD:D_SOT-23', note: 'BAV99 (dual serial). BAT54S (dual common cathode).' },
      { test: 'Rectifier 1A — SMD equivalent of 1N4007', package: 'SMA  (DO-214AC, 5.4×2.7mm)', kiCad: 'Diode_SMD:D_SMA', note: 'S1M = 1000V 1A SMA. Most common SMD rectifier.' },
      { test: 'Rectifier 2A', package: 'SMB  (DO-214AA, 5.4×3.6mm)', kiCad: 'Diode_SMD:D_SMB', note: 'Higher current than SMA. Same footprint family.' },
      { test: 'Rectifier 3A', package: 'SMC  (DO-214AB, 8.0×5.8mm)', kiCad: 'Diode_SMD:D_SMC', note: 'Largest of the DO-214 family. 3A sustained.' },
      { test: 'TVS — single line protection', package: 'SMA or SOD-323', kiCad: 'Diode_SMD:D_SMA', note: 'Choose TVS Vbr > max signal voltage. SMAJ5.0A = 5V line.' },
      { test: 'TVS — bidirectional (AC lines)', package: 'SMB or SMC', kiCad: 'Diode_SMD:D_SMB', note: 'Bidirectional TVS. SMBJ series. Protects both polarities.' },
      { test: 'Schottky rectifier < 1A (low Vf)', package: 'SOD-123 or SMA', kiCad: 'Diode_SMD:D_SOD-123', note: 'BAT85 (0.3V Vf). Use for reverse polarity, power ORing.' },
      { test: 'High-speed switching (< 4ns)', package: 'SOD-323 or SOD-123', kiCad: 'Diode_SMD:D_SOD-323', note: '1N4148W trr=4ns. BAS116 trr=1ns. For fast clamp circuits.' },
    ],
    tht: [
      { test: 'Signal / switching (< 200mA) — 1N4148', package: 'DO-35 axial  L3.0mm D1.7mm', kiCad: 'Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal', note: 'Tiny glass bead. Black band = cathode. Standard pitch 7.62mm.' },
      { test: 'Rectifier up to 1A — 1N4001–1N4007', package: 'DO-41 axial  L5.2mm D2.7mm', kiCad: 'Diode_THT:D_DO-41_SOD81_P10.16mm_Horizontal', note: '1N4007 = 1000V 1A. Most used rectifier ever made.' },
      { test: 'Rectifier 3A — 1N5400–1N5408', package: 'DO-201AD axial  L9.5mm D4.5mm', kiCad: 'Diode_THT:D_DO-201AD_P15.24mm_Horizontal', note: 'Bigger than DO-41. 3A sustained. P15.24mm pitch.' },
      { test: 'Schottky THT (< 3A) — 1N5817–1N5819', package: 'DO-41 axial', kiCad: 'Diode_THT:D_DO-41_SOD81_P10.16mm_Horizontal', note: '1N5819: 40V 1A Schottky in DO-41. 0.4V Vf.' },
      { test: 'Zener reference THT', package: 'DO-35 or DO-41', kiCad: 'Diode_THT:D_DO-35_SOD27_P7.62mm_Horizontal', note: 'BZX55 (DO-35) 0.5W. BZX85 (DO-41) 1.3W. Band = cathode.' },
      { test: 'Bridge rectifier 1–35A', package: 'DIP-4 round or square body', kiCad: 'Diode_THT:D_Bridge_Round_Convex_D3.7mm', note: '4 pins: AC, AC, +, −. KBP series (2A), KBPC (35A).' },
    ],
    voltage: '1N4148=75V signal. 1N4001=50V, 1N4007=1000V rectifier. Always check Vr > your peak reverse voltage with margin. TVS clamp voltage must be above normal signal swing.',
    example: 'Flyback protection on 12V relay: THT → 1N4007 DO-41. PCB production → S1M SMA. GPIO ESD protection on 3.3V: SOD-323 TVS (PRTR5V0U2X). Same job, three different footprints.',
  },
  {
    type: 'MOSFET / Transistor',
    symbol: 'Q',
    color: 'var(--accent4)',
    icon: '⊳|',
    concept: `The same transistor type (e.g. 2N7002 MOSFET) exists in SOT-23 SMD and TO-92 THT. Higher-power transistors go from SOT-223 → DPAK → D2PAK → TO-220 → TO-247 as power increases.\n\nPackage is driven by **power dissipation** (P = Id² × Rds_on for MOSFETs; P = Vce × Ic for BJTs). Calculate heat first — then pick the smallest package that can handle it.`,
    chooseSMD: 'All PCB designs. SOT-23 for signal. SOT-223/DPAK/D2PAK for power. PowerPAK/LFPAK for ultra-compact high power.',
    chooseTHT: 'High power > 5W needing heatsink. Prototyping. Replaceable parts. Motor/solenoid drivers on prototype boards.',
    smd: [
      { test: 'Signal switch < 100mA, logic output', package: 'SC-70 / SOT-323  (2.0×2.1mm)', kiCad: 'Package_TO_SOT_SMD:SC-70', note: 'Smaller than SOT-23. Same pinout. BCR10PN, 2SK3018.' },
      { test: 'Signal switch < 200mA ★', package: 'SOT-23-3  (2.9×1.3mm)', kiCad: 'Package_TO_SOT_SMD:SOT-23', note: '2N7002, BSS138, BC847, IRLML2502. Most common small transistor.' },
      { test: '< 500mA, dual MOSFET or BJT', package: 'SOT-23-6  (2.9×1.6mm)', kiCad: 'Package_TO_SOT_SMD:SOT-23-6', note: 'FDG6301N (dual N), BAT54S. 6 pins in SOT-23 footprint.' },
      { test: '< 1A, single channel — compact', package: 'SOT-89  (4.5×2.5mm)', kiCad: 'Package_TO_SOT_SMD:SOT-89-3', note: 'Tab on pin 2 provides some heatsinking. BC857CLT1G.' },
      { test: '1–3A, medium power', package: 'SOT-223  (6.5×3.5mm + tab)', kiCad: 'Package_TO_SOT_SMD:SOT-223-3_TabPin2', note: 'Large exposed tab = thermal path. Solder tab to copper pour.' },
      { test: '3–5A, medium-high power', package: 'DPAK / TO-252  (6.6×6.1mm)', kiCad: 'Package_TO_SOT_SMD:TO-252-3_TabPin2', note: 'Good thermal path. IRF530S, IRFR120. Tab = drain typically.' },
      { test: '5–30A, high power SMD ★', package: 'D2PAK / TO-263  (10×8.7mm)', kiCad: 'Package_TO_SOT_SMD:TO-263-3_TabPin2', note: 'Large tab. Multiple vias to GND plane. IRF3710S.' },
      { test: '> 10A, ultra-low Rds — compact', package: 'PowerPAK SO-8 / LFPAK56', kiCad: 'Package_SO:SOIC-8_EP_3.9x4.9mm_P1.27mm_EP2.29x1.65mm', note: 'Used in phone/laptop chargers. CSD17556Q5B. Very low Rds_on.' },
      { test: '> 20A, dual MOSFET one package', package: 'DirectFET / TOLL / TO-Leadless', kiCad: 'Package_TO_SOT_SMD:TO-Leadless_7.0x6.0mm', note: 'e.g. IPG20N10S4. Flip-chip on copper slug. Max thermal performance.' },
      { test: 'GaN MOSFET (high freq, > 100V)', package: 'GaN module / custom', kiCad: '— (use manufacturer footprint)', note: 'GaN Systems GS61008P. Custom PCB footprint from datasheet.' },
      { test: 'Dual BJT — NPN+PNP pair', package: 'SOT-363 / SC-70-6', kiCad: 'Package_TO_SOT_SMD:SOT-363', note: 'BCM856DS. Dual matched pair. Six-pin SC-70 footprint.' },
    ],
    tht: [
      { test: 'Small signal BJT/MOSFET — prototype', package: 'TO-92  (3-pin, flat-face)', kiCad: 'Package_TO_SOT_THT:TO-92_Inline', note: '2N3904, 2N2222, BS170. Flat face identifies orientation.' },
      { test: 'Medium signal < 1W — larger body', package: 'TO-92L', kiCad: 'Package_TO_SOT_THT:TO-92L_Inline', note: 'Slightly higher Pd than standard TO-92.' },
      { test: 'Medium power with tab < 50W', package: 'TO-220  (3-pin + exposed tab)', kiCad: 'Package_TO_SOT_THT:TO-220-3_Vertical', note: 'Bolt tab to heatsink. IRF540N, TIP31C, BD139.' },
      { test: 'Isolated tab — shared heatsink', package: 'TO-220F  (full-pack isolated tab)', kiCad: 'Package_TO_SOT_THT:TO-220F-3_Vertical', note: 'Tab isolated from circuit. Safe on shared heatsink.' },
      { test: 'High power > 50W', package: 'TO-247  (3-pin, large)', kiCad: 'Package_TO_SOT_THT:TO-247-3_Vertical', note: 'IRFP460, IRFP150N. Larger than TO-220 for lower Rth.' },
      { test: 'Very high power > 200W', package: 'TO-264 / TO-3P', kiCad: 'Package_TO_SOT_THT:TO-3P-3_Vertical', note: 'Large module package. Bolt to massive heatsink.' },
    ],
    voltage: 'Logic-level MOSFETs: Vgs_th < 2.5V → driven by 3.3V MCU directly. Standard MOSFETs: Vgs_th 4–10V → need gate driver or 5–12V drive. Always check Vgs_th in datasheet.',
    example: 'LED PWM at 12V/200mA: P=0.04×0.5Ω=20mW → SOT-23 (2N7002). Motor driver 12V/5A: P=25×0.05=1.25W → DPAK (IRFR024N). Linear reg heatsunk: TO-220 (LM7805). Each needs its own footprint.',
  },
  {
    type: 'IC / Microcontroller',
    symbol: 'U',
    color: 'var(--accent)',
    icon: '▢',
    concept: `For ICs, the **part number suffix encodes the package** — you cannot choose footprint independently of the IC variant you order. STM32F103C8**T6** = LQFP-48; **U6** = QFN-48. Same chip, different footprint, different pin assignment.\n\nMany ICs offer DIP (THT, breadboard-friendly), SOIC (SMD, easy solder), TSSOP (smaller), LQFP/QFN (compact). Each is a different purchase, different footprint.`,
    chooseSMD: 'All production boards. SOIC-8 = hand-solderable. LQFP = reflow/hot air. QFN/BGA = oven only.',
    chooseTHT: 'DIP only for prototyping. Very few modern ICs still come in DIP — check availability first.',
    smd: [
      { test: '5–8 pins — tiny logic, comparators', package: 'SOT-23-5 / SOT-23-6', kiCad: 'Package_TO_SOT_SMD:SOT-23-5', note: 'MCP6001 op-amp in SOT-23-5. TPS61023 in SOT-23-6. Very small.' },
      { test: '≤ 8 pins — op-amps, reg, timer ★', package: 'SOIC-8  (3.9×4.9mm P1.27mm)', kiCad: 'Package_SO:SOIC-8_3.9x4.9mm_P1.27mm', note: 'Best hand-solderable SMD IC package. LM358, NE555, MCP2515.' },
      { test: '≤ 8 pins — power IC with pad', package: 'SOIC-8 EP (exposed pad)', kiCad: 'Package_SO:SOIC-8_EP_3.9x4.9mm_P1.27mm_EP2.29x1.65mm', note: 'Thermal pad on bottom. Common for gate drivers, LDOs.' },
      { test: '8 pins — compact (vs SOIC)', package: 'MSOP-8  (3.0×3.0mm P0.65mm)', kiCad: 'Package_SO:MSOP-8_3x3mm_P0.65mm', note: 'Smaller than SOIC-8. Harder to hand-solder (0.65mm pitch).' },
      { test: '8–16 pins — medium ICs', package: 'SOIC-14 / SOIC-16  (P1.27mm)', kiCad: 'Package_SO:SOIC-16_3.9x9.9mm_P1.27mm', note: '74HC logic chips. Easy to hand-solder. Long narrow body.' },
      { test: '8–24 pins — compact medium ICs', package: 'TSSOP-8/14/16/20  (P0.65mm)', kiCad: 'Package_SO:TSSOP-8_3x3mm_P0.65mm', note: 'Half the width of SOIC. Harder to hand-solder. MCP23017 in SSOP-28.' },
      { test: '16–28 pins — wider ICs', package: 'SOIC-20 / SOIC-24 / SOIC-28', kiCad: 'Package_SO:SOIC-28_7.5x17.9mm_P1.27mm', note: 'Still 1.27mm pitch — manageable by hand with flux.' },
      { test: '20–44 pins — MCUs ★', package: 'LQFP-32/44  (7×7mm P0.8mm)', kiCad: 'Package_QFP:LQFP-32_7x7mm_P0.8mm', note: '0.8mm pitch — solderable with hot air + flux. STM32G031.' },
      { test: '48–64 pins — common MCU ★', package: 'LQFP-48/64  (7×7mm P0.5mm)', kiCad: 'Package_QFP:LQFP-48_7x7mm_P0.5mm', note: '0.5mm pitch. Hot air + flux. STM32F103C8T6 (LQFP-48).' },
      { test: '80–100 pins — MCU/FPGA', package: 'LQFP-100  (14×14mm P0.5mm)', kiCad: 'Package_QFP:LQFP-100_14x14mm_P0.5mm', note: 'Reflow preferred at this size. Still doable with hot air + paste.' },
      { test: '128–144 pins — high pin count', package: 'LQFP-144  (20×20mm P0.5mm)', kiCad: 'Package_QFP:LQFP-144_20x20mm_P0.5mm', note: 'Reflow only for reliability. STM32F4 series.' },
      { test: 'Any pin count — compact footprint', package: 'QFN  (exposed pad, no leads)', kiCad: 'Package_DFN_QFN:QFN-32_5x5mm_P0.5mm', note: 'Smallest footprint. Exposed pad = thermal + GND. Oven required.' },
      { test: 'High I/O count — FPGA / complex SoC', package: 'BGA  (ball grid array)', kiCad: 'Package_BGA:BGA-256_17x17mm_Layout16x16_P1.0mm', note: 'Balls underneath — X-ray inspection needed. Professional production.' },
      { test: 'Wireless SoC (ESP32, nRF52)', package: 'Module (stamp / castellated)', kiCad: '(use module-specific footprint)', note: 'ESP32-S3-WROOM. Castellated pads. Solderable by hand on edges.' },
    ],
    tht: [
      { test: '8 pins — op-amp, timer, ATtiny', package: 'DIP-8  (W7.62mm P2.54mm)', kiCad: 'Package_DIP:DIP-8_W7.62mm', note: 'Breadboard-compatible. LM358, NE555, ATtiny85.' },
      { test: '14–16 pins — logic ICs (74HC)', package: 'DIP-14 / DIP-16  (W7.62mm)', kiCad: 'Package_DIP:DIP-14_W7.62mm', note: '74HC00, 74HC595. Standard 7.62mm body width.' },
      { test: '18–28 pins — MCUs', package: 'DIP-18/20/28  (W7.62mm or W15.24mm)', kiCad: 'Package_DIP:DIP-28_W7.62mm', note: 'ATmega328P-PU = DIP-28 narrow (W7.62mm).' },
      { test: '40 pins — classic MCU', package: 'DIP-40  (W15.24mm P2.54mm)', kiCad: 'Package_DIP:DIP-40_W15.24mm', note: 'ATmega16/32 in DIP-40. Wide body — P15.24mm.' },
      { test: 'Always use a socket for DIP', package: 'DIP socket (same footprint)', kiCad: '(same DIP footprint)', note: 'IC socket allows replacement. Add DIP socket to BOM. Low cost.' },
    ],
    voltage: 'Part suffix → package: STM32 T6=LQFP, U6=QFN. TI -N=DIP, -D=SOIC, -PW=TSSOP, -RGZ=QFN. Microchip -P=DIP, -SO=SOIC, -SS=SSOP, -MV=QFN. Confirm in datasheet "Ordering Info" table.',
    example: 'ATmega328P: prototype → DIP-28 (breadboard). Final PCB → TQFP-32 (Package_QFP:TQFP-32_7x7mm_P0.8mm) — different part suffix, smaller board area. NE555: prototype DIP-8, PCB → SOIC-8 (order NE555D).',
  },
]

export const PACKAGE_SIZES = [
  { name:'0201', w:0.6, h:0.3, color:'var(--accent)' },
  { name:'0402', w:1.0, h:0.5, color:'var(--accent)' },
  { name:'0603', w:1.6, h:0.8, color:'var(--accent2)' },
  { name:'0805', w:2.0, h:1.2, color:'var(--accent2)' },
  { name:'1206', w:3.2, h:1.6, color:'var(--accent3)' },
  { name:'1210', w:3.2, h:2.5, color:'var(--accent3)' },
  { name:'2512', w:6.3, h:3.2, color:'var(--accent4)' },
]