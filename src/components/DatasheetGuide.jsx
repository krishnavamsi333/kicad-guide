import { useState } from 'react'

const SECTIONS = [
  {
    id: 'overview',
    title: '1. First 30 Seconds',
    icon: '◈',
    color: 'var(--accent)',
    summary: 'What to check before reading anything else.',
    content: `When you open a datasheet, these are the first things to locate:

**Part Number Variants** — The title page lists all variants. e.g. "STM32F103C8T6" — each letter/digit means something (package, flash size, temperature grade). Make sure your schematic uses the exact part number you're ordering.

**Key Specifications Block** — Usually a table on page 1 or 2. Find: supply voltage range (VCC min/max), absolute maximum ratings, operating temperature. If your VCC is outside the range, stop — wrong part.

**Absolute Maximum Ratings** — A table labelled exactly this. These are the limits you must NEVER exceed — not even briefly. VCC max, max pin voltage, max current per pin. Exceeding these destroys the chip.

**Package / Ordering Information** — Near the front or back. Lists every package variant (QFN, TQFP, DIP...) with their ordering codes. Confirms which package matches your footprint.`,
    checklist: [
      'Confirm VCC range includes your supply voltage',
      'Note absolute max ratings for VCC and I/O pins',
      'Confirm package code matches your ordered part',
      'Note operating temperature range for your application',
    ],
    highlight: 'Absolute Maximum Ratings',
  },
  {
    id: 'pinout',
    title: '2. Pinout & Pin Description',
    icon: '⬡',
    color: 'var(--accent2)',
    summary: 'Finding and understanding the pin diagram.',
    content: `**Pin Diagram / Package Drawing** — Find the section titled "Pin Configuration", "Pinout", or "Package Pinout". This shows the physical package with pin numbers labelled. The IC diagram in KiCad must match this exactly.

**Pin Description Table** — A table with columns: Pin Number, Pin Name, Type (I/O/Power/GND), Function. Read the "Type" column carefully:
- **I** = Input only — never drive above VCC
- **O** = Output — current source/sink limited
- **I/O** = Bidirectional — configured by firmware
- **PWR** = Power supply pin — needs decoupling cap
- **GND** = Ground — connect ALL ground pins
- **NC** = No Connect — leave unconnected or add no-connect flag in KiCad

**Multiple Ground Pins** — Many ICs have AGND (analog ground), DGND (digital ground), and PGND (power ground). Read the datasheet to understand if they should be connected together or kept separate on the PCB.

**Exposed Pad (EP)** — QFN and DFN packages often have a large metal pad on the bottom. The datasheet will say whether it's GND, a separate potential, or floating. Usually it's GND and must be connected to the ground plane with vias.`,
    checklist: [
      'Find the pin diagram — record pin 1 location',
      'Identify all VCC/VDD pins (need decoupling caps)',
      'Identify all GND pins (connect ALL of them)',
      'Check for exposed pad — connect if GND',
      'Note NC pins — add no-connect flags in schematic',
    ],
    highlight: 'Pin Description Table',
  },
  {
    id: 'electrical',
    title: '3. Electrical Characteristics',
    icon: '⚡',
    color: 'var(--accent4)',
    summary: 'Voltage levels, current limits, timing — what the chip can actually do.',
    content: `**DC Electrical Characteristics** — The most important table for circuit design. Key parameters:

- **VIH / VIL** — Input High/Low voltage thresholds. Your driving signal must exceed VIH for a logic 1, and be below VIL for a logic 0. Critical for 3.3V-to-5V interfacing.
- **VOH / VOL** — Output High/Low voltage. What voltage the output actually drives. VOH should be above the receiver's VIH.
- **IOH / IOL** — Output current capability (source/sink). If driving an LED: check IOL ≥ your LED current. If driving multiple inputs: check IOH ≥ sum of input currents.
- **IIH / IIL** — Input leakage current. Usually µA. Relevant for high-impedance analog inputs.
- **ICC / IDD** — Supply current. Active vs standby. Use for power budget calculations.

**Timing Diagrams** — For communication interfaces (SPI, I²C, UART): find the timing diagram section. It shows setup time, hold time, clock frequency limits. Your MCU must meet these requirements.

**AC Characteristics** — Rise/fall times of outputs, maximum operating frequency, propagation delay. If the rise time is slow, you may need a stronger pull-up or a buffer.`,
    checklist: [
      'Check VIH/VIL vs your driving voltage levels',
      'Check VOH/VOL vs receiver thresholds',
      'Verify IOH/IOL meets your load requirements',
      'Note ICC (supply current) for power budget',
      'Check max clock frequency for SPI/I²C interfaces',
    ],
    highlight: 'DC Electrical Characteristics',
  },
  {
    id: 'decoupling',
    title: '4. Decoupling & Power',
    icon: '◉',
    color: 'var(--accent3)',
    summary: 'Finding the exact capacitor values the datasheet demands.',
    content: `**Application Circuit / Typical Application** — Almost every datasheet has a section called "Typical Application Circuit" or "Application Information". This is the most valuable diagram — it shows exactly how the manufacturer expects you to connect the chip, including all bypass capacitors, pull-up resistors, and external components.

**Bypass Capacitor Values** — The application circuit will show specific capacitor values on the VCC pins. Follow them. Common patterns:
- 100nF ceramic (0402/0603) directly on VCC pin — absorbs fast transients
- 10µF electrolytic or tantalum nearby — bulk reservoir
- Some ICs specify additional caps on VREF, AVCC, or VDDIO pins separately

**Power Sequencing** — Multi-rail ICs (FPGAs, processors) often require VCC rails to power up in a specific order. The datasheet will have a "Power Sequencing" section. Violating this can permanently damage the chip.

**VREF / AVCC Pins** — ADC-equipped ICs often have a separate analog supply. The datasheet will specify: separate trace from digital VCC, additional RC filter (e.g. 10Ω + 1µF), or connection to a reference IC.`,
    checklist: [
      'Find "Typical Application Circuit" — copy it exactly',
      'Note all bypass cap values and locations',
      'Check for AVCC/VREF — separate supply or filter needed?',
      'Check power sequencing requirements',
      'Note any required external resistors (reset, boot, etc.)',
    ],
    highlight: 'Typical Application Circuit',
  },
  {
    id: 'footprint',
    title: '5. Package & Footprint',
    icon: '⊞',
    color: 'var(--accent)',
    summary: 'Extracting dimensions to verify or create the KiCad footprint.',
    content: `**Package Mechanical Drawing** — Find the section titled "Package Dimensions", "Mechanical Data", or "Package Outline Drawing". This is a dimensioned drawing of the physical IC.

**Key Dimensions to Extract:**
- **e** (pin pitch) — spacing between adjacent pins centre-to-centre. e.g. 0.5mm for QFN-32
- **b** (lead width) — width of each pin/pad
- **L** (lead length) — how far the pin extends from the package body
- **D × E** — package body dimensions (length × width)
- **A** (height/thickness) — important for clearance checks

**Land Pattern / Recommended PCB Layout** — Many datasheets include a "Recommended Land Pattern" or "PCB Layout Recommendation" section with exact pad sizes and spacing. Always use this over any calculated footprint — the manufacturer has already done thermal and mechanical optimisation.

**Comparing to KiCad Footprint:**
1. Open the KiCad footprint in the editor (press E on footprint)
2. Check pad pitch (e) matches datasheet
3. Check pad size matches recommended land pattern
4. Check courtyard is large enough for the package body

**Tolerance Note** — Datasheets give min/typ/max dimensions. Use the "nominal" column for KiCad. If only min/max given, use the midpoint.`,
    checklist: [
      'Find package mechanical drawing',
      'Record pin pitch (e), pad width (b), body dimensions (D×E)',
      'Find recommended land pattern if available',
      'Compare pitch and pad size to KiCad footprint',
      'Verify 3D model matches package height',
    ],
    highlight: 'Package Dimensions',
  },
  {
    id: 'layout',
    title: '6. PCB Layout Guidelines',
    icon: '▦',
    color: 'var(--accent2)',
    summary: 'Manufacturer placement and routing rules for the component.',
    content: `Many datasheets include a "PCB Layout Guidelines" or "Layout Considerations" section. This is often ignored by beginners but contains critical information:

**Decoupling Cap Placement** — "Place bypass capacitors as close as possible to the VCC pin" is universal advice. Some datasheets specify maximum distance (e.g. "within 0.5mm of pin").

**Ground Connection** — Power ICs and RF components often specify: "use a solid ground plane", "connect GND pin directly to via", "avoid shared ground return paths with noisy circuits".

**Thermal Management** — Power ICs specify copper pour area for the exposed pad: "minimum 2cm² of copper connected to thermal pad" or "add 4 vias of 0.3mm drill under thermal pad".

**Sensitive Signal Routing** — Oscillator/crystal layouts are almost always in the datasheet with very specific rules: trace length limits, guard rings, no other signals underneath.

**Keep-out Areas** — RF ICs and antenna modules specify "no copper under antenna", "minimum clearance from other components", or "ground plane cutout required".

**Signal Integrity Notes** — High-speed ICs mention: differential pair routing, length matching requirements, termination resistor placement.`,
    checklist: [
      'Find "PCB Layout Guidelines" section',
      'Note any required copper pour areas or keep-outs',
      'Follow crystal/oscillator routing rules exactly',
      'Follow thermal pad via requirements',
      'Note any differential pair requirements',
    ],
    highlight: 'PCB Layout Guidelines',
  },
]

const COMPONENT_TYPES = [
  {
    name: 'Microcontroller',
    color: 'var(--accent)',
    tips: [
      'Find the "Block Diagram" first — understand all functional blocks before pin details',
      'Check for multiple VCC domains (core, I/O, USB, ADC) — each needs separate decoupling',
      '"Boot" or "BOOT0" pins — critical for programming mode. Datasheet explains required states.',
      'Clock tree section — find which pins need an external crystal and what load capacitance',
      'Reset circuit — many MCUs need RC on NRST or a specific reset supervisor IC',
    ],
  },
  {
    name: 'Voltage Regulator (LDO)',
    color: 'var(--accent4)',
    tips: [
      'Find "Input/Output Capacitor Requirements" — non-compliance causes oscillation',
      'Check "Dropout Voltage" — Vin must exceed Vout + Vdropout at your max current',
      'Check "Enable" pin logic — active high or active low?',
      'Find "Quiescent Current" — important for battery-powered designs',
      '"Adjust" pin resistors (for adjustable LDOs) — formula in datasheet',
    ],
  },
  {
    name: 'Sensor (I²C/SPI)',
    color: 'var(--accent3)',
    tips: [
      'Find I²C address table — check if address is fixed or configurable via ADDR pin',
      'Find "Electrical Specifications" for I²C — does it need 3.3V or 5V pull-ups?',
      'Check "Power-On Reset" time — MCU must wait before first communication',
      'Find register map — understand which registers need initialisation',
      'Check "Self-Test" register — useful for verifying hardware connection in firmware',
    ],
  },
  {
    name: 'Power IC / MOSFET Driver',
    color: 'var(--accent2)',
    tips: [
      'Find "Gate Charge" (Qg) — determines gate driver current requirement',
      'Check "Bootstrap Capacitor" requirements for high-side drivers',
      'Find "Dead Time" specifications for H-bridge drivers',
      'Check "Thermal Resistance" (θJA, θJC) — needed for thermal calculations',
      'Find "Shutdown / Fault" pin behaviour — what happens on overcurrent?',
    ],
  },
  {
    name: 'RF / Wireless Module',
    color: 'var(--red)',
    tips: [
      'Find "RF Layout Guidelines" — usually a full section, follow it exactly',
      'Check antenna matching network values — copy the reference design',
      'Find "Crystal / TCXO Requirements" — frequency accuracy often critical',
      'Check regulatory certifications (FCC, CE) — certified modules simplify compliance',
      'Find "Current Consumption" table — TX/RX/sleep modes for power budget',
    ],
  },
]

export default function DatasheetGuide() {
  const [activeSection, setActiveSection] = useState('overview')
  const [activeComp, setActiveComp]       = useState(0)
  const [checkedItems, setCheckedItems]   = useState({})

  const section = SECTIONS.find(s => s.id === activeSection)

  const toggleCheck = (key) => setCheckedItems(p => ({ ...p, [key]: !p[key] }))

  // Bold markdown-style rendering
  const renderContent = (text) => {
    return text.split('\n').map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: '8px' }} />
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <div key={i} style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>
          {parts.map((p, j) =>
            j % 2 === 1
              ? <strong key={j} style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{p}</strong>
              : p
          )}
        </div>
      )
    })
  }

  return (
    <div className="fade-in">
      <div className="section-title">Reading Datasheets</div>
      <p className="section-desc">
        The skill that makes you independent. How to extract exactly what you need from any component datasheet — pinout, footprint, decoupling, and layout rules.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '20px', alignItems: 'start', marginBottom: '48px' }}>
        {/* Section nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              textAlign: 'left', padding: '11px 14px',
              background: activeSection === s.id ? 'var(--hover-bg)' : 'var(--panel)',
              border: `1px solid ${activeSection === s.id ? 'var(--hover-border)' : 'var(--border)'}`,
              borderLeft: `3px solid ${activeSection === s.id ? s.color : 'transparent'}`,
              borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: activeSection === s.id ? s.color : 'var(--text-dim)', marginBottom: '3px' }}>{s.icon} {s.title}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.4 }}>{s.summary}</div>
            </button>
          ))}
        </div>

        {/* Section content */}
        {section && (
          <div>
            <div style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderTop: `3px solid ${section.color}`, borderRadius: '2px', padding: '22px 26px', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--cond)', fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px' }}>{section.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {renderContent(section.content)}
              </div>
            </div>

            {/* Search term tip */}
            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '2px', padding: '10px 14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase' }}>Search for:</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)', background: 'var(--panel)', border: '1px solid var(--border)', padding: '3px 10px', borderRadius: '2px' }}>
                "{section.highlight}"
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>— use Ctrl+F in PDF viewer</span>
            </div>

            {/* Checklist */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Checklist for this section</div>
              {section.checklist.map((item, i) => {
                const key = `${section.id}-${i}`
                const done = !!checkedItems[key]
                return (
                  <div key={i} onClick={() => toggleCheck(key)} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '7px 0',
                    borderBottom: i < section.checklist.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                  }}>
                    <div style={{
                      width: '16px', height: '16px', flexShrink: 0, borderRadius: '2px',
                      border: `1px solid ${done ? 'var(--accent3)' : 'var(--border2)'}`,
                      background: done ? 'var(--accent3)' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: 'var(--bg)',
                    }}>{done ? '✓' : ''}</div>
                    <span style={{ fontSize: '13px', color: done ? 'var(--text-dim)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none' }}>{item}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Component-specific tips */}
      <div className="sub-header">Component-Specific Tips</div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {COMPONENT_TYPES.map((c, i) => (
          <button key={i} onClick={() => setActiveComp(i)} style={{
            fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '7px 14px', borderRadius: '2px', cursor: 'pointer',
            border: `1px solid ${activeComp === i ? c.color : 'var(--border)'}`,
            background: activeComp === i ? `color-mix(in srgb, ${c.color} 10%, var(--panel))` : 'var(--panel)',
            color: activeComp === i ? c.color : 'var(--text-dim)',
            transition: 'all 0.15s',
          }}>{c.name}</button>
        ))}
      </div>
      <div style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderLeft: `3px solid ${COMPONENT_TYPES[activeComp].color}`, borderRadius: '2px', padding: '18px 22px' }}>
        {COMPONENT_TYPES[activeComp].tips.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text)', padding: '6px 0', borderBottom: i < COMPONENT_TYPES[activeComp].tips.length - 1 ? '1px solid var(--border)' : 'none', lineHeight: 1.7 }}>
            <span style={{ color: COMPONENT_TYPES[activeComp].color, flexShrink: 0, fontFamily: 'var(--mono)' }}>→</span>
            {tip}
          </div>
        ))}
      </div>

      <div className="callout tip" style={{ marginTop: '24px' }}>
        Every datasheet is different but they all follow the same structure. The more datasheets you read, the faster you get. Start with simple components (LDOs, logic gates) before tackling complex ones (MCUs, RF ICs).
      </div>
    </div>
  )
}