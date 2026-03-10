import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────
// PANELISATION GUIDE
// ─────────────────────────────────────────────────────────────────

const PANEL_METHODS = [
  {
    id: 'vscore',
    name: 'V-Score (V-Cut)',
    color: 'var(--accent)',
    suitable: 'Rectangular boards, straight edges only',
    notSuitable: 'Boards with irregular edges, notches, or protruding connectors',
    pros: [
      'Clean, flat edges after separation',
      'Cheapest method — no extra routing needed',
      'Fast depanelling — score and snap by hand or with a depanelling tool',
      'Minimal board waste',
    ],
    cons: [
      'Straight lines only — no curves, notches, or L-shapes',
      'Boards must be rectangular',
      'Slight stress during snapping can crack solder joints near the score line',
      'Keep components ≥2mm from V-score line to avoid stress damage',
    ],
    rules: [
      'Score depth: typically 1/3 of board thickness each side',
      'Minimum board width: 75mm (fab-dependent)',
      'Keep all components ≥2mm from score line',
      'Via-in-pad and large BGAs: keep ≥5mm from score line',
      'Specify V-score in fab notes: "V-score between boards, 45° blade angle"',
    ],
    kicad: 'Draw the full panel Edge.Cuts outline. Add V-score lines on a separate "User.1" layer and note them in fab notes. Some fabs accept a separate Gerber layer for V-score.',
  },
  {
    id: 'mousebites',
    name: 'Mouse Bites (Tab + Break)',
    color: 'var(--accent2)',
    suitable: 'Any board shape, irregular outlines, boards with edge components',
    notSuitable: 'High-volume production where depanelling speed matters',
    pros: [
      'Works for any board outline — curved, irregular, notched',
      'Boards with edge-mounted connectors can have tabs away from connectors',
      'Less mechanical stress than V-score when properly placed',
      'Can combine with V-score on same panel',
    ],
    cons: [
      'Rough edge after breakout — small bumps remain from drill holes',
      'Requires manual or automated breaking — more labour than V-score',
      'Tab width must be sufficient to hold boards during assembly',
      'Drill holes weaken the tab — too thin = breaks in reflow',
    ],
    rules: [
      'Mouse bite hole diameter: typically 0.5mm',
      'Hole spacing: 0.8–1.0mm centre-to-centre',
      'Number of holes per tab: 5–7 (more = cleaner break)',
      'Tab width: 3–5mm minimum',
      'Keep mouse bites ≥1.5mm from any copper',
      'Place tabs at corners and every 50–80mm along long edges',
    ],
    kicad: 'Draw tabs in Edge.Cuts layer. Add drill hits (0.5mm NPTH holes) spaced 0.8mm apart across the tab width. Mark tabs on silkscreen with "BREAK HERE" text.',
  },
  {
    id: 'routing',
    name: 'Routed Tab (Full Breakout)',
    color: 'var(--accent3)',
    suitable: 'Prototype quantities, complex shapes, boards needing very clean edges',
    notSuitable: 'Cost-sensitive production (routing adds cost)',
    pros: [
      'Cleanest edges — fully routed separation',
      'No snapping force required',
      'Any shape supported',
    ],
    cons: [
      'Most expensive — routing takes fab time',
      'Slightly more board waste (routing allowance)',
      'Not ideal for high-volume automated assembly (boards fall apart)',
    ],
    rules: [
      'Minimum routing clearance: 2mm between adjacent board edges',
      'Add small tabs (3mm wide, 0.5mm depth V-score) to hold boards during assembly',
      'Routing bit diameter: typically 1.6mm — round internal corners accordingly',
      'Specify "route out" in fab notes',
    ],
    kicad: 'Draw individual board outlines in Edge.Cuts separated by ≥2mm. Fabs will route between them. Add mouse-bite tabs to hold boards during assembly.',
  },
]

const FIDUCIAL_RULES = [
  'Minimum 3 fiducials per panel (not per board) — asymmetrically placed',
  'Fiducial copper diameter: 1.0mm circle, solder mask opening: 3.0mm (3× pad size)',
  'Keep 5mm clear zone around each fiducial (no copper, silkscreen, or components)',
  'Place at panel corners — not on individual boards (panel-level fiducials only)',
  'For fine-pitch ICs (<0.5mm pitch): add local fiducials on the individual board near the IC',
  'Surface: bare copper or ENIG (not HASL — too uneven for optical recognition)',
]

const PANEL_MARGINS = [
  { name: 'Top / Bottom rail', value: '5mm minimum', note: 'Conveyor grip area — no components' },
  { name: 'Left / Right margin', value: '3mm minimum', note: 'Conveyor edge clearance' },
  { name: 'Board-to-board gap (V-score)', value: '0mm', note: 'Boards share the score line' },
  { name: 'Board-to-board gap (routed)', value: '2mm minimum', note: 'Routing bit clearance' },
  { name: 'Board-to-panel edge', value: '3–5mm', note: 'Depends on depanelling method' },
  { name: 'Min panel size (JLCPCB)', value: '70×70mm', note: 'Most fabs have a minimum panel size' },
  { name: 'Max panel size (JLCPCB)', value: '480×480mm', note: 'Check your fab\'s limits' },
]

function PanelGuide() {
  const [method, setMethod] = useState('vscore')
  const m = PANEL_METHODS.find(p => p.id === method)

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '24px' }}>
        Panelisation groups multiple boards into one larger panel for efficient assembly and handling. Required when boards are smaller than your assembler's minimum size or when running pick-and-place assembly.
      </p>

      {/* Method selector */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {PANEL_METHODS.map(p => (
          <button key={p.id} onClick={() => setMethod(p.id)} style={{
            fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '9px 18px', borderRadius: '2px', cursor: 'pointer',
            border: `1px solid ${method === p.id ? p.color : 'var(--border)'}`,
            background: method === p.id ? `color-mix(in srgb, ${p.color} 10%, var(--panel))` : 'var(--panel)',
            color: method === p.id ? p.color : 'var(--text-dim)',
            transition: 'all 0.15s',
          }}>{p.name}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderTop: `3px solid ${m.color}`, borderRadius: '2px', padding: '18px 20px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: m.color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>✓ Pros</div>
          {m.pros.map((p, i) => <div key={i} style={{ fontSize: '12px', color: 'var(--text)', padding: '4px 0', borderBottom: i < m.pros.length-1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>+ {p}</div>)}
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent3)', letterSpacing: '1px', marginTop: '10px', marginBottom: '4px' }}>SUITABLE FOR</div>
          <div style={{ fontSize: '12px', color: 'var(--accent3)' }}>{m.suitable}</div>
        </div>
        <div style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderTop: `3px solid var(--red)`, borderRadius: '2px', padding: '18px 20px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>✗ Cons</div>
          {m.cons.map((c, i) => <div key={i} style={{ fontSize: '12px', color: 'var(--text)', padding: '4px 0', borderBottom: i < m.cons.length-1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>− {c}</div>)}
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '1px', marginTop: '10px', marginBottom: '4px' }}>NOT FOR</div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{m.notSuitable}</div>
        </div>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 20px', marginBottom: '16px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: m.color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Design Rules</div>
        {m.rules.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text)', padding: '5px 0', borderBottom: i < m.rules.length-1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>
            <span style={{ color: m.color, flexShrink: 0, fontFamily: 'var(--mono)' }}>→</span>{r}
          </div>
        ))}
        <div style={{ marginTop: '12px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--accent)', background: 'var(--bg3)', padding: '8px 12px', borderRadius: '2px' }}>
          In KiCad: {m.kicad}
        </div>
      </div>

      {/* Panel margins */}
      <div style={{ marginBottom: '20px' }}>
        <div className="sub-header" style={{ marginBottom: '12px' }}>Panel Margins & Dimensions</div>
        {PANEL_MARGINS.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 140px 1fr', gap: '16px', fontSize: '12px', padding: '7px 0', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>{r.name}</span>
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)', fontWeight: 600 }}>{r.value}</span>
            <span style={{ color: 'var(--text-dim)' }}>{r.note}</span>
          </div>
        ))}
      </div>

      {/* Fiducials */}
      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent4)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>Fiducial Marks</div>
        {FIDUCIAL_RULES.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text)', padding: '5px 0', borderBottom: i < FIDUCIAL_RULES.length-1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--accent4)', flexShrink: 0, fontFamily: 'var(--mono)' }}>◎</span>{r}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// SYMBOL & FOOTPRINT CREATION
// ─────────────────────────────────────────────────────────────────

const SYMBOL_STEPS = [
  { n:1, title:'Open Symbol Editor', body:'Tools → Symbol Editor (or open from schematic: Place → Add Symbol → Edit Symbol). Click "New Symbol" icon. Choose a library to save into (create a project-specific library: File → New Library → Project).' },
  { n:2, title:'Set properties', body:'Edit → Symbol Properties. Set Reference prefix (R, C, U, J...), Value, Datasheet link, and Description. The reference prefix determines how KiCad auto-numbers components.' },
  { n:3, title:'Draw the symbol body', body:'Use the rectangle tool (R) to draw the component body. Conventions: ICs are rectangles, passives use standard symbols. Size each unit in 50mil grid. Keep the symbol readable — not too small, not too large.' },
  { n:4, title:'Add pins', body:'Place → Add Pin. For each pin set: Name (e.g. VCC, GND, PA0), Number (matches datasheet pin number), Type (Input/Output/Bidirectional/Power/Passive). Place pin so the connection end (with the small line) points outward from the symbol body.' },
  { n:5, title:'Group pins logically', body:'Don\'t order pins numerically — group by function: power pins together, inputs on left, outputs on right. Hidden power pins (VCC/GND with "Power Input" type and "Hidden" checked) auto-connect to power nets without visible wires.' },
  { n:6, title:'Assign footprint', body:'Edit → Symbol Properties → Footprint field. Click browse. Navigate to your package (e.g. Package_QFN → QFN-32_5x5mm_P0.5mm). Confirm footprint pin count matches your symbol pin count.' },
  { n:7, title:'Save and verify', body:'File → Save. Return to schematic, add the new symbol. Run ERC to verify no pin type conflicts. Check all pins are connected correctly in a test schematic before using in a real design.' },
]

const FOOTPRINT_STEPS = [
  { n:1, title:'Gather dimensions', body:'From the datasheet "Package Dimensions" / "Land Pattern" section: record pin pitch (e), pad width (b), pad length (L), package body dimensions (D×E), total pin count. If a "Recommended PCB Land Pattern" is given, use those pad dimensions exactly.' },
  { n:2, title:'Open Footprint Editor', body:'Tools → Footprint Editor. New Footprint (Ctrl+N). Set the reference and value text positions. Choose the correct footprint type (SMD, THT, etc.).' },
  { n:3, title:'Place pads', body:'Place → Add Pad (or press P). Set pad size to the land pattern dimensions. For SMD: pad type = SMD, shape = Rectangular or RoundRect. For THT: pad type = Through-hole, set drill diameter. Place pin 1 first, then use "Duplicate and Move" (Ctrl+D) for remaining pads.' },
  { n:4, title:'Verify pitch', body:'After placing two adjacent pads: Edit → Measure → check the distance between pad centres matches the datasheet pitch exactly. This is the most critical check.' },
  { n:5, title:'Add courtyard', body:'Switch to F.Courtyard layer. Draw a rectangle encompassing the entire component including the body + 0.25mm clearance on all sides. The courtyard prevents component overlap during placement.' },
  { n:6, title:'Add silkscreen', body:'Switch to F.Silkscreen layer. Draw the component body outline. Mark pin 1 with a dot or chamfer. Text height: 0.5–1.0mm. Keep all silkscreen outside the courtyard.' },
  { n:7, title:'Add 3D model', body:'Edit → Footprint Properties → 3D Models tab. Browse to the .step or .wrl file (usually in KiCad\'s 3D model library). Adjust offset, rotation, and scale until the 3D model aligns with the pads in the 3D viewer.' },
  { n:8, title:'Run DRC and save', body:'Footprint → Check Footprint. Fix any DRC errors (overlapping pads, courtyard violations, missing reference). Save to your project library. Assign to your symbol via the footprint field.' },
]

function FootprintCreation() {
  const [tab, setTab]   = useState('symbol')
  const [open, setOpen] = useState(null)

  const steps = tab === 'symbol' ? SYMBOL_STEPS : FOOTPRINT_STEPS

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '20px' }}>
        When KiCad's library doesn't have your component, you need to create it. Symbol = the schematic representation. Footprint = the PCB land pattern.
      </p>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)' }}>
        {[['symbol','Schematic Symbol','var(--accent)'],['footprint','PCB Footprint','var(--accent2)']].map(([id,label,color]) => (
          <button key={id} onClick={() => { setTab(id); setOpen(null) }} style={{
            fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '9px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: tab === id ? color : 'var(--text-dim)',
            borderBottom: tab === id ? `2px solid ${color}` : '2px solid transparent',
            marginBottom: '-1px', transition: 'color 0.15s',
          }}>{label}</button>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {steps.map((step, i) => (
          <div key={i} onClick={() => setOpen(open === i ? null : i)} style={{
            background: open === i ? 'var(--hover-bg)' : 'var(--panel)',
            border: `1px solid ${open === i ? 'var(--hover-border)' : 'var(--border)'}`,
            borderLeft: `3px solid ${tab === 'symbol' ? 'var(--accent)' : 'var(--accent2)'}`,
            borderRadius: '2px', cursor: 'pointer', padding: '12px 16px', transition: 'all 0.15s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: tab === 'symbol' ? 'var(--accent)' : 'var(--accent2)', flexShrink: 0, width: '22px' }}>
                {step.n < 10 ? `0${step.n}` : step.n}
              </span>
              <span style={{ fontSize: '13px', color: open === i ? 'var(--text-bright)' : 'var(--text)', fontWeight: open === i ? 600 : 400 }}>{step.title}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '11px' }}>{open === i ? '▲' : '▼'}</span>
            </div>
            {open === i && <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginTop: '10px', marginLeft: '36px' }}>{step.body}</p>}
          </div>
        ))}
      </div>
      <div className="callout tip" style={{ marginTop: '16px' }}>
        Before creating from scratch: check <strong>snapeda.com</strong>, <strong>ultralibrarian.com</strong>, and <strong>componentsearchengine.com</strong> — they offer free KiCad symbols and footprints for millions of parts.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// ESD PROTECTION
// ─────────────────────────────────────────────────────────────────

const ESD_SCENARIOS = [
  {
    title: 'USB D+ / D− Lines',
    color: 'var(--accent)',
    threat: '±8kV contact discharge (IEC 61000-4-2 Level 4)',
    solution: 'Dual TVS array (e.g. PRTR5V0U2X, SP0503BAHTG)',
    why: 'USB connectors are directly touched by users. D+ and D− must be protected against ESD before any other circuitry.',
    rules: [
      'Place TVS as close as possible to the USB connector — before any series resistors',
      'Keep protection device between connector pad and series resistor',
      'Use a device with low capacitance (< 1pF per line) to avoid distorting USB 2.0 signal',
      'Connect TVS GND directly to chassis/shield GND with minimum trace length',
      'Recommended: PRTR5V0U2X (dual line, 0.35pF, SOT363) or USBLC6-2SC6',
    ],
  },
  {
    title: 'GPIO / Connector Pins',
    color: 'var(--accent2)',
    threat: '±2kV HBM (human body model) for general I/O',
    solution: 'TVS diode array (e.g. PRXV5V0U4Y, ESD5V0D5 for single line)',
    why: 'External connector pins (headers, test points, sensor interfaces) can be touched during normal use or installation. MCU I/O pins are rarely rated above ±2kV HBM.',
    rules: [
      'Place TVS between connector and MCU pin',
      'Clamp voltage (Vc) must be below MCU absolute max pin voltage',
      'For 3.3V MCU: use 3.3V working voltage TVS (Vc typically 5–7V)',
      'For bidirectional I/O: use bidirectional TVS',
      'Check TVS capacitance vs signal frequency — high cap degrades fast signals',
    ],
  },
  {
    title: 'Power Input (VCC)',
    color: 'var(--accent4)',
    threat: 'Voltage transients, reverse polarity, load dump',
    solution: 'TVS on power rail + reverse polarity diode',
    why: 'Power connectors can receive ESD from cable attachment. Industrial environments see large transients. Reverse polarity destroys unprotected circuits.',
    rules: [
      'TVS working voltage > max VCC (e.g. 5.6V TVS for 5V rail)',
      'TVS clamping voltage < regulator input absolute max',
      'Add 100nF bypass cap in parallel with TVS to absorb fast transients',
      'Reverse polarity: P-channel MOSFET (low Vf) or series Schottky (low dropout)',
      'For industrial: consider transient voltage suppressor + common mode choke on power entry',
    ],
  },
  {
    title: 'RF / Antenna',
    color: 'var(--accent3)',
    threat: 'Electrostatic discharge during antenna connection/disconnection',
    solution: 'ESD protection rated for RF frequencies (< 0.1pF)',
    why: 'Antennas are connected and disconnected in the field. Normal TVS have too much capacitance (1–10pF) which severely attenuates RF signals.',
    rules: [
      'Use dedicated RF ESD devices: e.g. ST ESD010N1U, Murata ESD-RF series',
      'Capacitance must be < 0.1pF for frequencies > 1GHz',
      'Place on the antenna trace before the matching network',
      'Maintain 50Ω trace impedance through the protection device',
      'Some RF modules have built-in ESD protection — check datasheet before adding external',
    ],
  },
]

const ESD_LAYOUT = [
  'Protection device must be the FIRST thing a signal hits after entering the board — between connector pad and all other circuitry',
  'Keep ESD device GND connection as short as possible — use a via directly to ground plane, not a trace',
  'Do not share the ESD return path with signal ground — use a direct via per device',
  'Keep protected trace length short between connector and TVS — every mm adds inductance',
  'For multi-line protection arrays: one device per connector, not shared between connectors',
  'TVS GND pad should be on the board-entry side, not the circuit side',
  'Keep ESD devices away from sensitive analog circuits — they add capacitance and noise',
]

function ESDGuide() {
  const [selected, setSelected] = useState(0)
  const s = ESD_SCENARIOS[selected]

  return (
    <div>
      <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '20px' }}>
        ESD (Electrostatic Discharge) can destroy ICs instantly or cause latent damage that shortens product life. Protection is essential on any externally-accessible pin.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {ESD_SCENARIOS.map((sc, i) => (
            <button key={i} onClick={() => setSelected(i)} style={{
              textAlign: 'left', padding: '10px 14px',
              background: selected === i ? 'var(--hover-bg)' : 'var(--panel)',
              border: `1px solid ${selected === i ? 'var(--hover-border)' : 'var(--border)'}`,
              borderLeft: `3px solid ${selected === i ? sc.color : 'transparent'}`,
              borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
              fontSize: '12px', color: selected === i ? 'var(--text-bright)' : 'var(--text)',
            }}>{sc.title}</button>
          ))}
        </div>

        <div>
          <div style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderTop: `3px solid ${s.color}`, borderRadius: '2px', padding: '18px 22px', marginBottom: '10px' }}>
            <div style={{ fontFamily: 'var(--cond)', fontSize: '18px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>{s.title}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div style={{ background: 'var(--bg3)', borderRadius: '2px', padding: '10px 14px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Threat</div>
                <div style={{ fontSize: '12px', color: 'var(--text)' }}>{s.threat}</div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: '2px', padding: '10px 14px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: s.color, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>Solution</div>
                <div style={{ fontSize: '12px', color: 'var(--text)', fontFamily: 'var(--mono)' }}>{s.solution}</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '14px' }}>{s.why}</p>
            {s.rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text)', padding: '5px 0', borderBottom: i < s.rules.length-1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>
                <span style={{ color: s.color, flexShrink: 0, fontFamily: 'var(--mono)' }}>→</span>{r}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 20px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>PCB Layout Rules (All Cases)</div>
        {ESD_LAYOUT.map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text)', padding: '5px 0', borderBottom: i < ESD_LAYOUT.length-1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0, fontFamily: 'var(--mono)' }}>◈</span>{r}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COMBINED
// ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'panel',     label: 'Panelisation',     icon: '⬡' },
  { id: 'footprint', label: 'Symbol/Footprint',  icon: '⊞' },
  { id: 'esd',       label: 'ESD Protection',   icon: '⚡' },
]

export default function ProductionGuide() {
  const [tab, setTab] = useState('panel')

  return (
    <div className="fade-in">
      <div className="section-title">Production & Protection</div>
      <p className="section-desc">Panelisation for assembly, creating custom symbols and footprints, and ESD protection design.</p>

      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: tab === t.id ? 'var(--accent2)' : 'var(--text-dim)',
            borderBottom: tab === t.id ? '2px solid var(--accent2)' : '2px solid transparent',
            marginBottom: '-1px', transition: 'color 0.15s',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}
          onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--hover-text)' }}
          onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.color = 'var(--text-dim)' }}
          >
            <span style={{ opacity: tab === t.id ? 1 : 0.5 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab === 'panel'     && <PanelGuide />}
      {tab === 'footprint' && <FootprintCreation />}
      {tab === 'esd'       && <ESDGuide />}
    </div>
  )
}