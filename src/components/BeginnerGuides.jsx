import { useState, useMemo } from 'react'

// ─────────────────────────────────────────────────────────────────
// GLOSSARY
// ─────────────────────────────────────────────────────────────────

const GLOSSARY_TERMS = [
  { term: 'Annular Ring', def: 'The copper ring left around a drilled hole after drilling. Must be wide enough that drill breakout is prevented. Typical minimum: 0.15mm.', cat: 'Layout' },
  { term: 'BOM', def: 'Bill of Materials. A list of every component in your design with references, values, quantities, and part numbers. Used by assembly houses.', cat: 'Process' },
  { term: 'Buried Via', def: 'A via connecting only internal copper layers — not visible from either board surface. Expensive; requires sequential lamination during fabrication.', cat: 'Layout' },
  { term: 'Controlled Impedance', def: 'Specifying trace width/stackup so that signal lines have a precise characteristic impedance (usually 50Ω or 100Ω differential). Required for RF, USB, DDR, HDMI.', cat: 'Signal' },
  { term: 'Copper Pour / Fill', def: 'A large area of copper on a PCB layer connected to a net (usually GND). Provides low-impedance return path, heat spreading, and fills dead space.', cat: 'Layout' },
  { term: 'Courtyard', def: 'The keep-out boundary around a component footprint. No other component courtyard may overlap. Checked by DRC.', cat: 'Layout' },
  { term: 'Creepage', def: 'The shortest path along the surface of a PCB between two conductors. High-voltage designs require minimum creepage distances per IEC 60950.', cat: 'Safety' },
  { term: 'DRC', def: 'Design Rule Check. KiCad\'s automated check for clearance violations, unconnected nets, silkscreen on pads, and other fabrication errors. Run before ordering.', cat: 'Process' },
  { term: 'Decoupling Cap', def: 'A small ceramic capacitor (typically 100nF) placed directly on an IC\'s power pin to absorb high-frequency switching noise from the power supply.', cat: 'Power' },
  { term: 'Differential Pair', def: 'Two traces carrying equal and opposite signals. Used for high-speed interfaces (USB, HDMI, Ethernet) to cancel common-mode noise. Must be length-matched and routed together.', cat: 'Signal' },
  { term: 'Edge.Cuts', def: 'KiCad layer defining the board outline. Must be a closed shape. The fab cuts the board along this line using a router.', cat: 'Layers' },
  { term: 'EMI', def: 'Electromagnetic Interference. Noise emitted by your board that can affect other electronics. Caused by fast switching currents and loops. Reduced by ground planes and careful layout.', cat: 'Signal' },
  { term: 'ENIG', def: 'Electroless Nickel Immersion Gold. A PCB surface finish: flat, solderable, long shelf life. More expensive than HASL. Required for fine-pitch components.', cat: 'Fab' },
  { term: 'ERC', def: 'Electrical Rules Check. KiCad\'s schematic checker — finds unconnected pins, power conflicts, and missing PWR_FLAGs. Run before starting PCB layout.', cat: 'Process' },
  { term: 'Fab Notes', def: 'Text added to the board (usually on a notes layer or in the Gerber order form) specifying stackup, impedance, surface finish, and special requirements.', cat: 'Process' },
  { term: 'Fiducial', def: 'A copper target mark (usually 1mm circle) used by pick-and-place machines to calibrate positioning for SMD assembly.', cat: 'Layout' },
  { term: 'Footprint', def: 'The PCB land pattern for one component: pads, courtyard, silkscreen outline, and 3D model. Must match the physical component dimensions exactly.', cat: 'Schematic' },
  { term: 'Gerbers', def: 'The industry-standard file format for PCB layer data (RS-274X). Each layer has its own .gbr file. Drill file is separate (.drl or .xln). What fabs use to manufacture your board.', cat: 'Fab' },
  { term: 'Ground Loop', def: 'A circuit path that creates an unintended loop carrying stray currents, causing noise and hum. Common in mixed-signal boards with split grounds.', cat: 'Signal' },
  { term: 'HASL', def: 'Hot Air Solder Leveling. A cheap PCB surface finish where the copper is coated with solder. Can be uneven (not ideal for fine pitch). Lead-free HASL is the common variant.', cat: 'Fab' },
  { term: 'Impedance', def: 'The opposition to AC current flow in a circuit. Characteristic impedance of a PCB trace depends on trace width, copper thickness, and dielectric material/height.', cat: 'Signal' },
  { term: 'JLCPCB / PCBWay', def: 'Popular low-cost PCB fabrication services. JLCPCB: fast, cheap, popular for 2-layer. PCBWay: more options, slightly higher quality. Both offer online Gerber preview.', cat: 'Fab' },
  { term: 'Keep-out Zone', def: 'An area on the PCB where routing, components, or copper is prohibited. Used under antennas, in mechanical mounting areas, or near high-voltage.', cat: 'Layout' },
  { term: 'KiCad', def: 'Free, open-source PCB EDA (Electronic Design Automation) software. Includes schematic editor (Eeschema), PCB layout editor (Pcbnew), Gerber viewer, and 3D viewer.', cat: 'Tools' },
  { term: 'Netlist', def: 'A file describing all electrical connections (nets) in a schematic. Transferred from schematic to PCB editor to show which pads must be connected.', cat: 'Process' },
  { term: 'NPTH', def: 'Non-Plated Through-Hole. A drill hole with no copper inside — used for mounting screws, alignment pins, or mechanical features.', cat: 'Layout' },
  { term: 'PTH', def: 'Plated Through-Hole. A drilled hole with copper plating inside, connecting layers. Used for through-hole component legs and vias.', cat: 'Layout' },
  { term: 'Ratsnest', def: 'Thin lines (usually yellow in KiCad) showing unrouted connections — pads that should be connected but don\'t have a trace yet. Ratsnest = 0 before ordering.', cat: 'Layout' },
  { term: 'Reflow Soldering', def: 'Soldering SMD components by applying solder paste and heating the entire board in an oven (or with a heat gun). Solder melts ("reflows") and connects components to pads.', cat: 'Assembly' },
  { term: 'Schematic', def: 'The logical diagram showing components and their electrical connections. Does not represent physical layout — it\'s abstract. First step of PCB design.', cat: 'Process' },
  { term: 'SMD / SMT', def: 'Surface Mount Device / Surface Mount Technology. Components with flat leads or no leads that solder to pads on the board surface. Smaller and cheaper to assemble than THT.', cat: 'Components' },
  { term: 'Solder Mask', def: 'Polymer coating covering the board except for pads. Prevents solder bridges between adjacent traces. Usually green, but available in many colors.', cat: 'Layers' },
  { term: 'Stackup', def: 'The layer structure of the PCB: how many copper layers, their order, the dielectric material and thickness between them. Stackup determines trace impedance.', cat: 'Fab' },
  { term: 'Stencil', def: 'A thin metal sheet with cutouts matching pad positions, used to apply solder paste precisely before reflow. Required for reliable SMD assembly.', cat: 'Assembly' },
  { term: 'THT', def: 'Through-Hole Technology. Components with wire legs inserted through drilled holes and soldered on the opposite side. More robust but larger than SMD.', cat: 'Components' },
  { term: 'Trace', def: 'A copper line on a PCB layer that makes an electrical connection between two points. Width determines current capacity.', cat: 'Layout' },
  { term: 'Via', def: 'A drilled hole with copper plating that electrically connects two or more copper layers. Signal vias (small) vs thermal/power vias (larger).', cat: 'Layout' },
  { term: 'Via Stitching', def: 'Adding many vias around the board perimeter or along a zone boundary to connect ground copper fills on different layers, reducing inductance.', cat: 'Layout' },
  { term: 'Wave Soldering', def: 'A soldering process for THT boards: the board passes over a wave of molten solder that wets all through-hole joints simultaneously.', cat: 'Assembly' },
]

function Glossary() {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')

  const cats = ['All', ...new Set(GLOSSARY_TERMS.map(t => t.cat)).values()]

  const results = useMemo(() => {
    const q = search.toLowerCase()
    return GLOSSARY_TERMS.filter(t =>
      (catFilter === 'All' || t.cat === catFilter) &&
      (t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q))
    ).sort((a, b) => a.term.localeCompare(b.term))
  }, [search, catFilter])

  // Group alphabetically
  const grouped = results.reduce((acc, t) => {
    const letter = t.term[0].toUpperCase()
    if (!acc[letter]) acc[letter] = []
    acc[letter].push(t)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="Search terms…" value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: '200px', fontFamily: 'var(--mono)', fontSize: '13px',
            padding: '9px 14px', background: 'var(--bg3)',
            border: '1px solid var(--border)', borderRadius: '2px',
            color: 'var(--text)', outline: 'none',
          }}
        />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{
          fontFamily: 'var(--mono)', fontSize: '11px', padding: '9px 12px',
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: '2px', color: 'var(--text)', cursor: 'pointer', outline: 'none',
        }}>
          {cats.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', marginBottom: '16px' }}>
        {results.length} term{results.length !== 1 ? 's' : ''}
      </div>

      {Object.entries(grouped).map(([letter, terms]) => (
        <div key={letter} style={{ marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--cond)', fontSize: '22px', fontWeight: 900, color: 'var(--accent)', marginBottom: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
            {letter}
          </div>
          {terms.map((t, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr auto', gap: '16px', padding: '10px 0', borderBottom: '1px solid var(--border)', alignItems: 'baseline' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-bright)', fontWeight: 600 }}>{t.term}</div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>{t.def}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: 'var(--text-dim)', background: 'var(--bg3)', padding: '2px 7px', borderRadius: '2px', whiteSpace: 'nowrap' }}>{t.cat}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// KICAD FIRST-TIME SETUP
// ─────────────────────────────────────────────────────────────────

const SETUP_STEPS = [
  {
    n: 1, title: 'Install KiCad',
    color: 'var(--accent)',
    body: 'Download from kicad.org. Install the full package including 3D models and component libraries. The installer is large (~3GB) but the libraries save you enormous time. Use KiCad 7 or newer.',
    tip: 'On first launch, let KiCad configure its default libraries — don\'t skip this step.',
  },
  {
    n: 2, title: 'Configure global libraries',
    color: 'var(--accent)',
    body: 'Preferences → Manage Symbol Libraries → confirm KiCad\'s built-in library is listed. Same for Footprint Libraries. If they\'re missing, point to the installed library folder (usually C:/Program Files/KiCad/7.0/share/kicad/symbols).',
    tip: 'Global libraries are available in every project. Project-specific libraries override them.',
  },
  {
    n: 3, title: 'Create a new project',
    color: 'var(--accent2)',
    body: 'File → New Project → choose a dedicated folder (one folder per project). KiCad creates a .kicad_pro file, a schematic (.kicad_sch), and a PCB file (.kicad_pcb). Never put multiple projects in the same folder.',
    tip: 'Name your project descriptively: "usb_sensor_v1" not "project1".',
  },
  {
    n: 4, title: 'Set up schematic page',
    color: 'var(--accent2)',
    body: 'Open the schematic editor. File → Page Settings — fill in your project title, revision, date. Choose paper size (A4 is fine for most projects). This info appears on the title block and in your Gerbers.',
    tip: 'Keep a revision history. V1.0 = first order. V1.1 = fixed bug. Makes debugging much easier.',
  },
  {
    n: 5, title: 'Add components from library',
    body: 'Press A (Add Symbol) or Place → Add Symbol. Search by name or filter. Double-click to place. After placing, press E to edit properties: set Value (e.g. 100nF), Reference (C1), and Footprint.',
    color: 'var(--accent3)',
    tip: 'Set footprints during schematic entry, not as an afterthought. Click the footprint field and press the browse button to search KiCad\'s footprint library.',
  },
  {
    n: 6, title: 'Draw connections and add power symbols',
    body: 'Press W to draw wires. Press P to add power symbols (VCC, +3.3V, GND). Use net labels (press L) for signals that would require long crossing wires. Add PWR_FLAG to all power nets to prevent ERC false positives.',
    color: 'var(--accent3)',
    tip: 'Use net labels instead of wires for connections across the schematic. Label both ends with the same name — they\'re connected.',
  },
  {
    n: 7, title: 'Run ERC and fix errors',
    body: 'Inspect → Electrical Rules Checker → Run. Fix every error. Common fixes: add no-connect flags (Q) to unused pins, add PWR_FLAG to power nets, correct unintended pin connections.',
    color: 'var(--accent4)',
    tip: 'Zero ERC errors before starting layout. Warnings are acceptable if you understand and accept each one.',
  },
  {
    n: 8, title: 'Set board outline in PCB editor',
    body: 'Switch to PCB editor. Draw your board outline on Edge.Cuts layer using the rectangle or line tool. This defines the physical size of your board. Add mounting holes if needed.',
    color: 'var(--accent4)',
    tip: 'Board size affects price. Smaller = cheaper. JLCPCB\'s cheapest tier is ≤100×100mm.',
  },
  {
    n: 9, title: 'Update PCB from schematic',
    body: 'In PCB editor: Tools → Update PCB from Schematic (or press F8). Click "Update PCB". All components appear in a pile outside your board outline. This imports your netlist into the PCB.',
    color: 'var(--accent2)',
    tip: 'You can re-run this at any time when you change the schematic. New components get added; deleted components get removed.',
  },
  {
    n: 10, title: 'Place and route',
    body: 'Drag components inside the board outline. Press X to route traces. Press B to fill copper zones. Place decoupling caps near IC power pins first. Route power traces before signal traces. Aim for zero ratsnest.',
    color: 'var(--accent2)',
    tip: 'Use the Workflow and PCB Layout tabs in this guide for detailed placement and routing guidance.',
  },
  {
    n: 11, title: 'Run DRC and fix errors',
    body: 'Inspect → Design Rules Checker → Run. Fix all errors. Common: clearance violations (traces too close), unconnected nets, courtyard overlaps, silkscreen on pads.',
    color: 'var(--red)',
    tip: 'Zero DRC errors before generating Gerbers. Every error is a potential fabrication or assembly problem.',
  },
  {
    n: 12, title: 'Generate and verify Gerbers',
    body: 'File → Fabrication Outputs → Gerbers. Use the default settings, but verify layers include: F.Cu, B.Cu, F.Mask, B.Mask, F.Silkscreen, B.Silkscreen, Edge.Cuts. Also generate drill files. Open everything in the Gerber Viewer to verify.',
    color: 'var(--red)',
    tip: 'Upload Gerbers to your fab\'s online preview tool before paying. JLCPCB and PCBWay both have free Gerber viewers.',
  },
]

function KiCadSetup() {
  const [active, setActive] = useState(null)

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '24px' }}>
        Complete walkthrough from installing KiCad to generating your first Gerbers. Click any step for details.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {SETUP_STEPS.map((step, i) => {
          const isOpen = active === i
          return (
            <div key={i} onClick={() => setActive(isOpen ? null : i)} style={{
              background: isOpen ? 'var(--hover-bg)' : 'var(--panel)',
              border: `1px solid ${isOpen ? 'var(--hover-border)' : 'var(--border)'}`,
              borderLeft: `3px solid ${step.color}`,
              borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
              padding: '12px 16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: step.color, flexShrink: 0, width: '24px' }}>
                  {step.n < 10 ? `0${step.n}` : step.n}
                </div>
                <div style={{ fontSize: '13px', color: isOpen ? 'var(--text-bright)' : 'var(--text)', fontWeight: isOpen ? 600 : 400 }}>{step.title}</div>
                <div style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</div>
              </div>
              {isOpen && (
                <div style={{ marginTop: '12px', marginLeft: '38px' }}>
                  <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '10px' }}>{step.body}</p>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent3)', background: 'var(--bg3)', padding: '8px 12px', borderRadius: '2px' }}>
                    💡 {step.tip}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// TROUBLESHOOTING
// ─────────────────────────────────────────────────────────────────

const TROUBLES = [
  {
    symptom: 'Board doesn\'t power on',
    checks: [
      'Check polarity of power input connector — is + and − correct?',
      'Measure voltage at the regulator output with a multimeter',
      'Check if any component is getting hot immediately (short circuit) — touch each IC briefly',
      'Verify the voltage regulator has correct input AND output capacitors per datasheet',
      'Check USB-C CC resistors (5.1kΩ to GND on CC1 and CC2) if powering from USB-C',
      'Look for solder bridges near power components with a magnifier',
    ],
    color: 'var(--red)',
  },
  {
    symptom: 'MCU won\'t communicate / program',
    checks: [
      'Confirm programming header pinout matches your programmer (SWD: SWDIO, SWDCLK, GND, VCC)',
      'Check BOOT0/BOOT1 pins are pulled to correct state for programming mode',
      'Verify programmer driver is installed and recognised by PC',
      'Confirm VCC to MCU is correct voltage — 3.3V MCU must not receive 5V',
      'Check decoupling caps on all VCC pins of MCU',
      'Test with a multimeter: is every GND pin of MCU actually at 0V?',
      'Try lowering programmer speed (e.g. reduce SWD clock frequency)',
    ],
    color: 'var(--accent2)',
  },
  {
    symptom: 'Noisy ADC / sensor readings',
    checks: [
      'Add or check 100nF decoupling cap on AVCC/VREF pin — must be separate from digital VCC',
      'Route analog traces away from switching signals (PWM, clock lines, switching regulator)',
      'Add a small series resistor (100Ω) on the analog input trace',
      'Measure with a scope — is the noise on the power rail or the signal?',
      'Verify ground plane is solid under analog section',
      'Use separate analog and digital GND areas connected at a single star point',
    ],
    color: 'var(--accent4)',
  },
  {
    symptom: 'Component getting hot',
    checks: [
      'Voltage regulator: calculate power dissipation: P = (Vin − Vout) × Iout — add copper pour heatsink or use a buck converter',
      'MOSFET: check Rds(on) — if high, the MOSFET isn\'t fully turning on (insufficient Vgs). Use logic-level MOSFET for 3.3V drive.',
      'IC: check if correct voltage is being applied — 5V IC connected to 3.3V rail or vice versa?',
      'Resistor: check wattage rating — 0402 rated at 0.0625W, 0805 at 0.125W. Calculate P = I²R or P = V²/R',
      'Check for solder bridges causing short circuits',
    ],
    color: 'var(--accent2)',
  },
  {
    symptom: 'USB not recognised by computer',
    checks: [
      'USB-C: add 5.1kΩ resistors from CC1 and CC2 to GND',
      'Check D+ and D− are not swapped (very common mistake)',
      'Measure D+ and D− with a meter — they should be pulled to specific voltages by the device',
      'Verify USB traces are 90Ω differential impedance controlled',
      'Check the USB series resistors (22–33Ω on D+ and D−) are present',
      'Try USB 2.0 port first — USB 3.0 ports are stricter about signal quality',
    ],
    color: 'var(--accent)',
  },
  {
    symptom: 'Board works on bench, fails in product',
    checks: [
      'Check power supply noise — bench supplies are clean, real supplies aren\'t. Add input filtering.',
      'Check for ESD susceptibility — add TVS diodes on external-facing pins',
      'Test at temperature extremes — components drift. Check electrolytic caps especially.',
      'Vibration: check for cold solder joints — all joints should be shiny, not dull/grainy',
      'Check for intermittent connector contacts — apply pressure to connectors while testing',
    ],
    color: 'var(--accent3)',
  },
]

function Troubleshooting() {
  const [selected, setSelected] = useState(0)
  const t = TROUBLES[selected]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {TROUBLES.map((tr, i) => (
            <button key={i} onClick={() => setSelected(i)} style={{
              textAlign: 'left', padding: '10px 14px',
              background: selected === i ? 'var(--hover-bg)' : 'var(--panel)',
              border: `1px solid ${selected === i ? 'var(--hover-border)' : 'var(--border)'}`,
              borderLeft: `3px solid ${tr.color}`,
              borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
              fontSize: '12px', color: selected === i ? 'var(--text-bright)' : 'var(--text)',
              lineHeight: 1.4,
            }}>{tr.symptom}</button>
          ))}
        </div>

        <div style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderTop: `3px solid ${t.color}`, borderRadius: '2px', padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--cond)', fontSize: '18px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px' }}>{t.symptom}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Check these in order:</div>
          {t.checks.map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 0', borderBottom: i < t.checks.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: t.color, flexShrink: 0, width: '20px' }}>{i + 1}.</div>
              <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>{c}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// SIGNAL INTEGRITY
// ─────────────────────────────────────────────────────────────────

const SI_TOPICS = [
  {
    title: 'When does signal integrity matter?',
    color: 'var(--accent)',
    content: `Signal integrity (SI) is about making sure your signals arrive at the receiver looking like what was sent — not distorted, delayed, or corrupted by noise.

For most hobby projects (Arduino GPIO, I²C at 100kHz, SPI at 1MHz, basic UART), SI is nearly a non-issue. Standard layout practices — decoupling, ground plane, reasonable trace lengths — are sufficient.

SI becomes critical when:
• Signal rise time < 1ns (e.g. USB 3.0, PCIe, HDMI, DDR4)
• Trace length > λ/10 at your signal frequency
• You're doing RF (any signal > ~100MHz)
• Using differential pairs (USB 2.0, Ethernet, LVDS)
• Mixing high-speed digital with analog (ADC, audio, RF)`,
  },
  {
    title: 'Transmission line effects',
    color: 'var(--accent2)',
    content: `At high frequencies, PCB traces behave like transmission lines, not simple wires. If the line isn't terminated properly, signals reflect back from the far end.

The critical length rule: a trace becomes a transmission line when its length exceeds λ/10 at the signal's frequency (or more practically, when trace delay > rise_time / 6).

Example: a 1ns rise-time signal has a critical length of ~15mm in FR4.

Solutions:
• Source termination: 22–33Ω series resistor at the driver output
• End termination: resistor to VCC/2 at the receiver (for high-speed buses)
• For point-to-point connections: source termination is usually sufficient`,
  },
  {
    title: 'Controlled impedance',
    color: 'var(--accent3)',
    content: `Controlled impedance means specifying your trace width (and stackup) so the transmission line has a specific characteristic impedance — usually 50Ω (single-ended) or 90–100Ω (differential).

Required for: USB 2.0 (90Ω diff), USB 3.0 (90Ω diff), HDMI (100Ω diff), PCIe (85Ω diff), RF/antenna (50Ω), Ethernet (100Ω diff).

How to achieve it:
1. Use the Impedance Calculator tab to find the trace width for your stackup
2. Use 4-layer board for controlled impedance — standard JLCPCB 4-layer JLC7628 stackup has known Er
3. Specify "controlled impedance" in your fab notes
4. Many fabs offer impedance testing for a small fee`,
  },
  {
    title: 'Differential pair routing rules',
    color: 'var(--accent4)',
    content: `Differential pairs carry equal and opposite signals. The receiver looks at the difference — so common-mode noise (affecting both signals equally) gets cancelled. This makes them immune to EMI.

Rules for differential pair routing:
• Route both signals together — keep spacing constant (3× trace width is common)
• Match lengths — within 0.1mm for USB 2.0, even tighter for USB 3.0+
• Don't route over gaps in the ground plane
• Avoid right-angle bends — use 45° or curved bends
• Keep differential pairs away from other differential pairs (cross-talk)
• Use KiCad's interactive router with "Differential Pair" mode (press Alt+X in router)`,
  },
  {
    title: 'Crosstalk',
    color: 'var(--red)',
    content: `Crosstalk occurs when a signal on one trace couples electromagnetically into an adjacent trace. It's worst when traces are close together and parallel over a long distance.

Reducing crosstalk:
• Keep trace spacing ≥ 3× trace width (3W rule)
• Reduce parallel trace run length — cross traces at 90° if possible
• Route sensitive signals (analog, clock, RF) away from noisy signals (PWM, motor drive)
• Ground plane provides a return path that reduces the coupling loop area
• Ground guard traces can help for critical analog signals, but add a via to GND every few mm`,
  },
  {
    title: 'Practical SI checklist',
    color: 'var(--accent3)',
    content: `For 99% of hobby and small commercial boards:

✓ Solid ground plane on B.Cu (mandatory)
✓ Decoupling caps on every IC power pin (100nF + 10µF)
✓ Keep clock and high-speed traces short (< 50mm if possible)
✓ No right-angle bends on high-speed traces
✓ Differential pairs routed together, lengths matched
✓ USB D+/D− traces ≤ 25mm, away from switching signals
✓ Crystal traces < 5mm with GND guard ring
✓ Don't route signals over gaps or slots in the ground plane
✓ Series termination on fast signals > ~20mm long

That covers everything for USB, basic RF, and most digital interfaces at typical hobby speeds.`,
  },
]

function SignalIntegrity() {
  const [selected, setSelected] = useState(0)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {SI_TOPICS.map((t, i) => (
            <button key={i} onClick={() => setSelected(i)} style={{
              textAlign: 'left', padding: '10px 14px',
              background: selected === i ? 'var(--hover-bg)' : 'var(--panel)',
              border: `1px solid ${selected === i ? 'var(--hover-border)' : 'var(--border)'}`,
              borderLeft: `3px solid ${selected === i ? t.color : 'transparent'}`,
              borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
              fontSize: '12px', color: selected === i ? 'var(--text-bright)' : 'var(--text)',
              lineHeight: 1.4,
            }}>{t.title}</button>
          ))}
        </div>

        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderLeft: `3px solid ${SI_TOPICS[selected].color}`, borderRadius: '2px', padding: '20px 24px' }}>
          <div style={{ fontFamily: 'var(--cond)', fontSize: '18px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '16px' }}>{SI_TOPICS[selected].title}</div>
          <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.9, whiteSpace: 'pre-line' }}>{SI_TOPICS[selected].content}</div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COMBINED COMPONENT
// ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'glossary',   label: 'Glossary',        icon: '∷' },
  { id: 'setup',      label: 'KiCad Setup',      icon: '⚙' },
  { id: 'troubleshoot', label: 'Troubleshooting', icon: '🔍' },
  { id: 'si',         label: 'Signal Integrity', icon: '∿' },
]

export default function BeginnerGuides() {
  const [tab, setTab] = useState('glossary')

  return (
    <div className="fade-in">
      <div className="section-title">Reference Guides</div>
      <p className="section-desc">
        Glossary of PCB jargon, KiCad first-time setup, board troubleshooting, and signal integrity basics.
      </p>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: tab === t.id ? 'var(--accent)' : 'var(--text-dim)',
            borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom: '-1px', transition: 'color 0.15s',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}
          onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--hover-text)' }}
          onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text-dim)' }}
          >
            <span style={{ fontSize: '12px', opacity: tab === t.id ? 1 : 0.5 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'glossary'     && <Glossary />}
      {tab === 'setup'        && <KiCadSetup />}
      {tab === 'troubleshoot' && <Troubleshooting />}
      {tab === 'si'           && <SignalIntegrity />}
    </div>
  )
}