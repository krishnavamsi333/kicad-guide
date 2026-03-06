import { useState } from 'react'

const MISTAKES = [
  {
    id: 'wrong-footprint',
    category: 'Components',
    severity: 'critical',
    title: 'Wrong footprint assigned to component',
    symptom: 'Component physically does not fit the pads. Leads hang in the air, or the component is too small and bridges pads.',
    why: 'Schematic symbols are abstract (just a box with pins). Footprints must exactly match the physical component you ordered — same pad pitch, pad size, and package. A 0805 resistor will NOT fit a 0603 footprint.',
    fix: 'Always verify footprint against the component datasheet mechanical drawing BEFORE ordering. Search the datasheet for "Package Outline" or "Land Pattern". Cross-reference footprint dimensions in KiCad against the datasheet.',
    prevent: [
      'Order components FIRST, then assign footprints from their datasheets',
      'Use KiCad\'s 3D viewer to visually confirm components look right',
      'Run DRC — courtyard violations often reveal wrong footprints',
      'Check the fab preview — mismatched footprints are visible as weirdly-sized pads',
    ],
    kicad: 'Edit → Footprint Properties → check "Footprint" field matches your purchased part number exactly.',
    color: 'var(--red)',
  },
  {
    id: 'no-decoupling',
    category: 'Power',
    severity: 'critical',
    title: 'Missing decoupling capacitors on IC power pins',
    symptom: 'Board works intermittently. MCU resets randomly. ADC readings are noisy. Circuit works on a bench but fails in the field.',
    why: 'When a digital IC switches, it draws short pulses of current from the supply. Without a local capacitor, this creates a voltage drop (noise) on the power rail that can corrupt nearby signals or cause the IC to reset.',
    fix: 'Place a 100nF ceramic capacitor between VCC and GND on EVERY IC power pin. The capacitor must be as close to the pin as possible (< 1mm). Also add one 10µF bulk capacitor per power rail.',
    prevent: [
      'Add decoupling cap as part of the symbol in schematic (before starting layout)',
      'In PCB layout: place caps FIRST before any routing',
      'Check the checklist: "Decoupling caps within 0.5–1mm of IC power pins"',
      'Use power symbols in schematic — they make it obvious which nets need decoupling',
    ],
    kicad: 'In schematic: add C_Small symbol on VCC line next to each IC. In PCB: use the "Highlight Net" tool on VCC to find all power pins.',
    color: 'var(--red)',
  },
  {
    id: 'silkscreen-on-pads',
    category: 'Silkscreen',
    severity: 'high',
    title: 'Silkscreen text/lines printed on top of solder pads',
    symptom: 'Fab either moves or removes silkscreen, changing your layout. Pads have ink residue that prevents proper soldering. Board looks unprofessional.',
    why: 'Fabs cannot print silkscreen on top of exposed copper pads. The silkscreen layer sits on top of the solder mask, but pads are "windows" cut into the solder mask — there\'s no surface to print on. Fabs will clip or remove offending silk.',
    fix: 'Move all silkscreen text and lines so they don\'t overlap any pad. DRC will catch this — run it before ordering.',
    prevent: [
      'Run DRC — "Silkscreen clipped by solder mask" is a DRC error in KiCad',
      'Visually zoom in on each component after placing',
      'Keep reference designators (R1, C3) outside the component courtyard',
      'Use smaller font size (0.5mm height, 0.1mm line width) to fit in tight spaces',
    ],
    kicad: 'Inspect → Board Statistics, then Inspect → Design Rules Checker → Run. Filter for "silk" errors.',
    color: 'var(--accent2)',
  },
  {
    id: 'no-ground-plane',
    category: 'Layout',
    severity: 'high',
    title: 'No ground plane — individual GND traces instead',
    symptom: 'Noisy analog signals. Unexpected digital glitches. EMI failures. Ground bounce. System works on bench but fails FCC/CE testing.',
    why: 'Every signal has a return current path through GND. If there\'s no solid copper pour, return currents take long, winding paths through thin traces, creating ground inductance and voltage drops. A solid ground plane gives a direct, low-impedance return path.',
    fix: 'Add a copper pour zone on B.Cu connected to GND. Press B to fill. Pour covers the entire board back side.',
    prevent: [
      'Add GND copper zone as one of your first PCB layout steps',
      'Connect all GND pads to the pour (verify with ratsnest = 0)',
      'On 4-layer boards: dedicate In1.Cu entirely to GND',
      'Via stitch the top copper GND islands down to the bottom pour',
    ],
    kicad: 'Place → Add Rule Area (or copper pour). Set layer B.Cu, net GND. Draw the board outline. Press B to fill all zones.',
    color: 'var(--accent2)',
  },
  {
    id: 'wrong-connector-orientation',
    category: 'Components',
    severity: 'high',
    title: 'Connector pins are mirrored / reversed',
    symptom: 'You plug in a cable and pin 1 on the board connects to pin N on the other end. Power connects to GND. Board is destroyed or doesn\'t work.',
    why: 'Connectors are directional. Looking at the board from the top vs the bottom, or comparing a plug to a receptacle, will mirror the pin order. This is especially common with JST connectors and ribbon cables.',
    fix: 'Always verify connector pin 1 in the 3D viewer. Check that your footprint\'s pin 1 matches the mating connector\'s pin 1 when the cable is connected in its real-world orientation.',
    prevent: [
      'Use KiCad 3D viewer to mentally plug the cable in and trace pin 1',
      'Mark pin 1 clearly on silkscreen with a dot or triangle',
      'Use polarised connectors (keyed) to make wrong insertion impossible',
      'Order a "prototype run" first before full production',
    ],
    kicad: 'Press Alt+3 to open 3D viewer. Rotate the board and inspect connector orientation.',
    color: 'var(--accent2)',
  },
  {
    id: 'no-erc',
    category: 'Schematic',
    severity: 'medium',
    title: 'Skipping ERC before layout',
    symptom: 'Unconnected pins you thought were connected. Two outputs shorted together. Power pin left floating. Caught only after PCBs arrive.',
    why: 'The Electrical Rules Check catches common wiring mistakes: unconnected pins, missing power symbols, output-to-output connections, nets with no driver. Many beginners skip it and proceed directly to layout.',
    fix: 'Run ERC (Inspect → Electrical Rules Checker) before exporting netlist. Fix every error, understand every warning.',
    prevent: [
      'Run ERC after every major schematic change',
      'Place "no-connect" flags (X) on intentionally unused pins to suppress false warnings',
      'Assign power symbols to all VCC/GND pins — "PWR_FLAG" component prevents false "power pin unconnected" warnings',
      'Zero ERC errors is the gate to starting PCB layout',
    ],
    kicad: 'Inspect → Electrical Rules Checker → Run. Add PWR_FLAG to VCC and GND nets to clear false positives.',
    color: 'var(--accent4)',
  },
  {
    id: 'trace-width',
    category: 'Layout',
    severity: 'medium',
    title: 'Using the same trace width for everything',
    symptom: 'Power traces overheat and burn. Thin power traces cause voltage drop under load. Board fails under normal operating current.',
    why: 'A 0.15mm trace can carry about 300mA safely. A 1A power rail on a 0.15mm trace will cause a 3–5°C temperature rise at best, and may melt the trace or cause solder mask cracking at worst.',
    fix: 'Use the trace width calculator (Calculators tab). Rule of thumb: signal = 0.15–0.25mm, power = 0.5mm minimum, > 1A = calculate properly.',
    prevent: [
      'Use net classes — assign "Power" net class to VCC, GND, VBAT nets with min width 0.5mm',
      'Run the IPC-2221 trace width calculator before routing power traces',
      'Ground plane eliminates most ground trace width concerns',
      'Add 20–30% margin to calculated width',
    ],
    kicad: 'File → Board Setup → Net Classes. Add "Power" class with 0.5mm min width. Assign power nets to this class.',
    color: 'var(--accent4)',
  },
  {
    id: 'missing-teardrops',
    category: 'Layout',
    severity: 'low',
    title: 'No teardrops on via/pad connections',
    symptom: 'Traces snap off at pad/via connections during manufacturing stress or thermal cycling. Trace-to-pad failures in production.',
    why: 'Where a thin trace meets a large pad or via, there\'s a stress concentration point. A teardrop gradually widens the trace as it approaches the pad, distributing stress and making the joint mechanically stronger.',
    fix: 'Add teardrops. In KiCad 7+: Edit → Edit Teardrops (or Teardrops in PCB menu). Enable for all vias and pads.',
    prevent: [
      'Add teardrops as a final step before generating Gerbers',
      'Most fab houses recommend teardrops for any board that will experience vibration or thermal cycling',
      'Teardrops also improve impedance continuity at via transitions',
    ],
    kicad: 'Edit → Edit Teardrops → Add Teardrops. Check "Add to Vias" and "Add to Pads". Apply.',
    color: 'var(--accent3)',
  },
  {
    id: 'bad-gerbers',
    category: 'Export',
    severity: 'critical',
    title: 'Unverified Gerber files sent to fab',
    symptom: 'Board arrives with missing copper, wrong drill sizes, swapped layers, or missing silkscreen — exactly as your bad Gerbers described.',
    why: 'Gerbers are the final truth. KiCad might display your board correctly but export incorrect files due to wrong settings (wrong layer mapping, missing drill file, non-merged copper). Fabs fabricate exactly what\'s in the Gerbers.',
    fix: 'After generating Gerbers, open every file in KiCad\'s built-in Gerber viewer (or Gerbv, or your fab\'s own online viewer). Verify: all copper layers present, drill file included, board outline on Edge.Cuts.',
    prevent: [
      'Use the Gerber viewer: File → Fabrication Outputs → Gerber Viewer',
      'Upload Gerbers to your fab\'s preview tool before paying',
      'Check the layer list in the viewer matches what you expect (F.Cu, B.Cu, F.Mask, B.Mask, F.Silk, B.Silk, Edge.Cuts, drill)',
      'Compare board outline in Gerbers to your KiCad design',
    ],
    kicad: 'File → Fabrication Outputs → Gerbers. Then File → Fabrication Outputs → Open in Gerber Viewer. Or use JLCPCB\'s online Gerber viewer.',
    color: 'var(--red)',
  },
]

const SEVERITIES = {
  critical: { label: 'Critical', color: 'var(--red)' },
  high:     { label: 'High',     color: 'var(--accent2)' },
  medium:   { label: 'Medium',   color: 'var(--accent4)' },
  low:      { label: 'Low',      color: 'var(--accent3)' },
}

const ALL_CATEGORIES = ['All', ...new Set(MISTAKES.map(m => m.category))]

export default function CommonMistakes() {
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(0)

  const filtered = filter === 'All' ? MISTAKES : MISTAKES.filter(m => m.category === filter)
  const mistake = filtered[Math.min(selected, filtered.length - 1)]

  return (
    <div className="fade-in">
      <div className="section-title">Common Mistakes</div>
      <p className="section-desc">
        The most common reasons first PCBs fail — with explanations of why they happen and exactly how to prevent them.
      </p>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {ALL_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => { setFilter(cat); setSelected(0) }} style={{
            fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '6px 14px', borderRadius: '2px', cursor: 'pointer',
            border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border)'}`,
            background: filter === cat ? 'var(--tab-active-bg)' : 'var(--panel)',
            color: filter === cat ? 'var(--accent)' : 'var(--text-dim)',
            transition: 'all 0.15s',
          }}>{cat}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px', alignItems: 'start' }}>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {filtered.map((m, i) => {
            const sev = SEVERITIES[m.severity]
            return (
              <button key={m.id} onClick={() => setSelected(i)} style={{
                textAlign: 'left', padding: '11px 14px',
                background: selected === i ? 'var(--hover-bg)' : 'var(--panel)',
                border: `1px solid ${selected === i ? 'var(--hover-border)' : 'var(--border)'}`,
                borderLeft: `3px solid ${sev.color}`,
                borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '9px', color: sev.color, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {sev.label} · {m.category}
                </div>
                <div style={{ fontSize: '12px', color: selected === i ? 'var(--text-bright)' : 'var(--text)', lineHeight: 1.4 }}>
                  {m.title}
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail */}
        {mistake && (
          <div>
            <div style={{ background: 'var(--panel)', borderTop: `3px solid ${mistake.color}`, border: '1px solid var(--border)', borderRadius: '2px', padding: '20px 24px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontFamily: 'var(--cond)', fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', lineHeight: 1.3 }}>{mistake.title}</div>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: mistake.color, border: `1px solid ${mistake.color}`, borderRadius: '2px', padding: '3px 10px', flexShrink: 0, marginLeft: '12px' }}>
                  {SEVERITIES[mistake.severity].label}
                </span>
              </div>
            </div>

            <MistakeSection title="🔍 Symptom" color="var(--accent)">
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>{mistake.symptom}</p>
            </MistakeSection>

            <MistakeSection title="💡 Why it happens" color="var(--accent4)">
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>{mistake.why}</p>
            </MistakeSection>

            <MistakeSection title="🔧 Fix" color="var(--accent3)">
              <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8 }}>{mistake.fix}</p>
            </MistakeSection>

            <MistakeSection title="✓ How to prevent it" color={mistake.color}>
              {mistake.prevent.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text)', padding: '5px 0', borderBottom: i < mistake.prevent.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ color: 'var(--accent3)', flexShrink: 0, fontFamily: 'var(--mono)' }}>✓</span>
                  {p}
                </div>
              ))}
            </MistakeSection>

            <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '2px', padding: '12px 16px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>In KiCad</div>
              <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7, fontFamily: 'var(--mono)' }}>{mistake.kicad}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MistakeSection({ title, color, children }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderLeft: `3px solid ${color}`, borderRadius: '2px', padding: '14px 18px', marginBottom: '8px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '8px' }}>{title}</div>
      {children}
    </div>
  )
}