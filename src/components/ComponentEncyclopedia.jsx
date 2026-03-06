import { useState } from 'react'

const CATEGORIES = ['Passives', 'Semiconductors', 'ICs & Modules', 'Connectors', 'Electromechanical']

const COMPONENTS = [
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

export default function ComponentEncyclopedia() {
  const [category, setCategory] = useState('Passives')
  const [selected, setSelected] = useState(0)

  const filtered = COMPONENTS.filter(c => c.category === category)
  const comp = filtered[Math.min(selected, filtered.length - 1)]

  const handleCategory = (cat) => {
    setCategory(cat)
    setSelected(0)
  }

  return (
    <div className="fade-in">
      <div className="section-title">Component Encyclopedia</div>
      <p className="section-desc">
        What each component does, when to use it, how to pick the right one, and what footprint to use in KiCad.
      </p>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => handleCategory(cat)} style={{
            fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '9px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: category === cat ? 'var(--accent)' : 'var(--text-dim)',
            borderBottom: category === cat ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: '-1px', transition: 'color 0.15s',
          }}
          onMouseEnter={e => { if (category !== cat) e.currentTarget.style.color = 'var(--hover-text)' }}
          onMouseLeave={e => { if (category !== cat) e.currentTarget.style.color = 'var(--text-dim)' }}
          >{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* Component list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map((c, i) => (
            <button key={i} onClick={() => setSelected(i)} style={{
              textAlign: 'left', padding: '10px 14px',
              background: selected === i ? 'var(--hover-bg)' : 'var(--panel)',
              border: `1px solid ${selected === i ? 'var(--hover-border)' : 'var(--border)'}`,
              borderLeft: `3px solid ${selected === i ? c.color : 'transparent'}`,
              borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: c.color }}>{c.icon}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: selected === i ? 'var(--text-bright)' : 'var(--text)' }}>{c.name}</span>
              </div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', marginLeft: '24px' }}>{c.symbol}</div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {comp && (
          <div>
            {/* Header */}
            <div style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderTop: `3px solid ${comp.color}`, borderRadius: '2px', padding: '20px 24px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '28px', color: comp.color }}>{comp.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--cond)', fontSize: '22px', fontWeight: 700, color: 'var(--text-bright)' }}>{comp.name}</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>Symbol: <span style={{ color: comp.color }}>{comp.symbol}</span> · Packages: {comp.packages}</div>
                </div>
              </div>
              <div style={{ fontSize: '14px', color: 'var(--accent)', fontStyle: 'italic', lineHeight: 1.5 }}>{comp.oneLiner}</div>
            </div>

            {/* What it is */}
            <Section title="What it does" color={comp.color}>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>{comp.what}</p>
            </Section>

            {/* When to use */}
            <Section title="When to use it" color={comp.color}>
              {comp.when.map((w, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text)', padding: '5px 0', borderBottom: i < comp.when.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: comp.color, flexShrink: 0, fontFamily: 'var(--mono)' }}>→</span>
                  {w}
                </div>
              ))}
            </Section>

            {/* How to pick */}
            <Section title="How to pick the right one" color={comp.color}>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>{comp.picking}</p>
            </Section>

            {/* KiCad footprints */}
            <Section title="KiCad footprints" color={comp.color}>
              {comp.footprints.map((f, i) => (
                <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent3)', background: 'var(--bg3)', padding: '5px 10px', borderRadius: '2px', marginBottom: '4px' }}>
                  {f}
                </div>
              ))}
            </Section>

            {/* Gotchas */}
            <div style={{ background: 'color-mix(in srgb, var(--accent4) 6%, var(--panel))', border: '1px solid color-mix(in srgb, var(--accent4) 20%, var(--border))', borderLeft: '3px solid var(--accent4)', borderRadius: '2px', padding: '14px 18px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--accent4)', marginBottom: '8px' }}>⚠ Common Mistakes</div>
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{comp.gotchas}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, color, children }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 20px', marginBottom: '10px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '10px' }}>{title}</div>
      {children}
    </div>
  )
}