import { useState } from 'react'

const LAYERS = [
  {
    id: 'silkscreen',
    name: 'Silkscreen',
    color: '#ffffff',
    stroke: '#aaaaaa',
    kicad: 'F.Silkscreen / B.Silkscreen',
    desc: 'White ink printed on top of the solder mask. Used for component labels (R1, C3), pin 1 markers, logos, and assembly notes. Has no electrical function — it\'s purely informational.',
    beginner: 'Think of it as the "label maker" layer. It tells assemblers where each part goes.',
  },
  {
    id: 'soldermask',
    name: 'Solder Mask',
    color: '#1a7a3a',
    stroke: '#0d5528',
    kicad: 'F.Mask / B.Mask',
    desc: 'A thin polymer coating (usually green, but also black, blue, red) that covers the entire board EXCEPT the pads where components solder. Prevents solder bridges between adjacent traces and protects copper from oxidation.',
    beginner: 'This is the green (or black) color you see on most PCBs. The exposed copper pads are "windows" cut into this layer.',
  },
  {
    id: 'copper_top',
    name: 'Top Copper (F.Cu)',
    color: '#c8860a',
    stroke: '#8a5a00',
    kicad: 'F.Cu',
    desc: 'The primary signal layer on top. Contains component pads, traces connecting them, copper pours (ground planes), and vias. This is where most routing happens on 2-layer boards.',
    beginner: 'The actual electrical wires of your circuit. Copper traces carry current between components.',
  },
  {
    id: 'substrate',
    name: 'FR4 Substrate',
    color: '#d4a84b',
    stroke: '#a07830',
    kicad: '(not a KiCad layer)',
    desc: 'The physical board material — fibreglass (glass-reinforced epoxy). FR4 is the most common grade. Standard thickness is 1.6mm. This is the insulating core that all copper layers are laminated onto.',
    beginner: 'The "bread" of the PCB sandwich. It holds everything together and insulates the copper layers from each other.',
  },
  {
    id: 'copper_bottom',
    name: 'Bottom Copper (B.Cu)',
    color: '#c8860a',
    stroke: '#8a5a00',
    kicad: 'B.Cu',
    desc: 'The copper layer on the bottom of the board. On 2-layer boards this is usually a solid ground plane. On 4+ layer boards, inner layers (In1.Cu, In2.Cu…) are added between the substrate layers.',
    beginner: 'The bottom side copper. Often used as a ground plane — a solid sheet of copper connected to GND.',
  },
  {
    id: 'drill',
    name: 'Drill Holes',
    color: '#1a1a2e',
    stroke: '#333366',
    kicad: 'Edge.Cuts (outline) + drill files',
    desc: 'Physical holes drilled through the board. PTH (Plated Through-Hole) holes have copper inside — these connect layers and are used for through-hole components. NPTH (Non-Plated) are mechanical holes (mounting, alignment).',
    beginner: 'Holes for through-hole components (like connectors and big capacitors) and for vias — tiny holes that connect the top and bottom copper layers.',
  },
]

const PCB_CONCEPTS = [
  {
    term: 'Via',
    icon: '○',
    color: 'var(--accent)',
    desc: 'A small drilled hole with copper plating inside that connects two different copper layers. Think of it as a tiny vertical wire through the board. A "blind via" goes from surface to an inner layer; a "buried via" connects only inner layers.',
    visual: 'top copper → drill → bottom copper',
  },
  {
    term: 'Pad',
    icon: '□',
    color: 'var(--accent2)',
    desc: 'The exposed copper area where a component leg makes electrical contact. SMD pads are flat (surface mount). PTH pads are copper-lined holes (through-hole). Pad size must match the component footprint exactly.',
    visual: 'component pin lands here',
  },
  {
    term: 'Trace',
    icon: '—',
    color: 'var(--accent4)',
    desc: 'A copper line connecting two pads — the PCB equivalent of a wire. Width determines how much current it can carry. Thicker = more current, more heat dissipation. Signal traces: 0.15–0.25mm. Power traces: 0.5mm+.',
    visual: 'pad → copper path → pad',
  },
  {
    term: 'Footprint',
    icon: '⊞',
    color: 'var(--accent3)',
    desc: 'The physical pattern of pads, silkscreen, and courtyard that represents one component on the PCB. A footprint must match the real component\'s datasheet dimensions exactly. Wrong footprint = component doesn\'t fit.',
    visual: 'pads + courtyard + silkscreen outline',
  },
  {
    term: 'Ratsnest',
    icon: '∿',
    color: 'var(--accent)',
    desc: 'Thin lines (usually yellow in KiCad) showing which pads need to be connected but haven\'t been routed yet. A ratsnest line is a reminder, not an actual trace. Your goal: zero ratsnest lines before ordering.',
    visual: 'unrouted connection → needs a trace',
  },
  {
    term: 'Ground Plane',
    icon: '▬',
    color: 'var(--text-dim)',
    desc: 'A large filled copper area connected to GND (0V). Provides a low-impedance return path for all signals, reduces noise, improves thermal performance, and makes routing easier. Almost every PCB has one — usually on B.Cu.',
    visual: 'solid copper fill → all GND pins connect',
  },
  {
    term: 'Courtyard',
    icon: '⬜',
    color: 'var(--accent2)',
    desc: 'An invisible boundary around a component defining its exclusive "keep-out" zone. No other component\'s courtyard can overlap — KiCad\'s DRC catches courtyard violations. It includes the component body plus a small clearance.',
    visual: 'component boundary + clearance margin',
  },
  {
    term: 'Annular Ring',
    icon: '◎',
    color: 'var(--accent3)',
    desc: 'The copper ring that remains around a drill hole after drilling. Must be wide enough that the drill doesn\'t break through the pad edge. Typical minimum: 0.15mm. Fabs specify minimum annular ring in their design rules.',
    visual: 'pad diameter − drill diameter) / 2',
  },
]

const BOARD_TYPES = [
  { layers: 2, name: '2-Layer', color: '#c8860a', uses: 'Hobby projects, simple breakout boards, low-frequency circuits', cost: '$2–5', stackup: ['F.Cu (signal)', 'FR4 core (1.6mm)', 'B.Cu (ground plane)'] },
  { layers: 4, name: '4-Layer', color: '#0097b2', uses: 'MCU boards, USB/Bluetooth modules, mixed signal, most commercial products', cost: '$15–40', stackup: ['F.Cu (signal)', 'In1.Cu (GND plane)', 'In2.Cu (power plane)', 'B.Cu (signal)'] },
  { layers: 6, name: '6-Layer', color: '#39ff14', uses: 'High-speed signals, DDR memory, FPGA boards, RF circuits', cost: '$40–100', stackup: ['F.Cu', 'In1.Cu (GND)', 'In2.Cu (signal)', 'In3.Cu (power)', 'In4.Cu (signal)', 'B.Cu (GND)'] },
]

// ── Layer Stack SVG ────────────────────────────────────────────────
function LayerStackSVG({ activeLayer }) {
  const layers = [
    { name: 'Silkscreen', y: 10, h: 8, color: '#e8e8e8', stroke: '#aaa' },
    { name: 'Solder Mask', y: 20, h: 10, color: '#1a6b35', stroke: '#0d4422' },
    { name: 'F.Cu', y: 32, h: 8, color: '#c8860a', stroke: '#8a5a00' },
    { name: 'FR4', y: 42, h: 40, color: '#d4a84b', stroke: '#a07830' },
    { name: 'B.Cu', y: 84, h: 8, color: '#c8860a', stroke: '#8a5a00' },
    { name: 'Solder Mask', y: 94, h: 10, color: '#1a6b35', stroke: '#0d4422' },
  ]
  const layerMap = {
    silkscreen: [0], soldermask: [1, 5], copper_top: [2], substrate: [3], copper_bottom: [4], drill: [],
  }
  const activeIndices = activeLayer ? (layerMap[activeLayer] || []) : []

  return (
    <svg viewBox="0 0 200 120" style={{ width: '100%', maxWidth: '260px', display: 'block' }}>
      {layers.map((l, i) => (
        <g key={i}>
          <rect
            x="20" y={l.y} width="140" height={l.h}
            fill={l.color} stroke={l.stroke} strokeWidth="0.5" rx="1"
            opacity={activeIndices.length === 0 || activeIndices.includes(i) ? 1 : 0.25}
          />
          {activeIndices.includes(i) && (
            <rect x="18" y={l.y - 1} width="144" height={l.h + 2} fill="none" stroke="#fff" strokeWidth="1.5" rx="2" opacity="0.7" />
          )}
          <text x="168" y={l.y + l.h / 2 + 3.5} fontFamily="monospace" fontSize="7" fill={activeIndices.length === 0 || activeIndices.includes(i) ? '#aaa' : '#555'}>
            {l.name}
          </text>
        </g>
      ))}
      {/* Drill hole */}
      <ellipse cx="90" cy="60" rx="5" ry="52" fill="#0a0e12" stroke="#333" strokeWidth="0.5" opacity="0.85" />
      <text x="90" y="116" textAnchor="middle" fontFamily="monospace" fontSize="7" fill="#666">drill</text>
    </svg>
  )
}

export default function PCBFundamentals() {
  const [activeLayer, setActiveLayer] = useState(null)
  const [activeConcept, setActiveConcept] = useState(0)

  return (
    <div className="fade-in">
      <div className="section-title">What is a PCB?</div>
      <p className="section-desc">
        A Printed Circuit Board is a sandwich of copper layers and insulating material that mechanically supports and electrically connects electronic components. Start here if you're new.
      </p>

      {/* ── Layer explorer ──────────────────────────────────────── */}
      <div style={{ marginBottom: '48px' }}>
        <div className="sub-header">PCB Layer Stack — click a layer to explore</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '32px', alignItems: 'start' }}>
          <LayerStackSVG activeLayer={activeLayer} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {LAYERS.map(layer => {
              const isActive = activeLayer === layer.id
              return (
                <div
                  key={layer.id}
                  onClick={() => setActiveLayer(isActive ? null : layer.id)}
                  style={{
                    padding: '12px 16px',
                    background: isActive ? 'var(--hover-bg)' : 'var(--panel)',
                    border: `1px solid ${isActive ? 'var(--hover-border)' : 'var(--border)'}`,
                    borderLeft: `3px solid ${layer.color}`,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isActive ? '8px' : '0' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-bright)', fontWeight: 600 }}>{layer.name}</span>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)' }}>{layer.kicad}</span>
                  </div>
                  {isActive && (
                    <>
                      <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '8px' }}>{layer.desc}</p>
                      <div style={{ fontSize: '12px', color: 'var(--accent3)', fontFamily: 'var(--mono)', background: 'var(--bg3)', padding: '8px 12px', borderRadius: '2px' }}>
                        💡 {layer.beginner}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Key concepts ────────────────────────────────────────── */}
      <div style={{ marginBottom: '48px' }}>
        <div className="sub-header">Key Concepts</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px', marginBottom: '20px' }}>
          {PCB_CONCEPTS.map((c, i) => (
            <button key={i} onClick={() => setActiveConcept(i)} style={{
              padding: '10px 12px', background: activeConcept === i ? 'var(--hover-bg)' : 'var(--panel)',
              border: `1px solid ${activeConcept === i ? c.color : 'var(--border)'}`,
              borderRadius: '2px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '16px', color: c.color, marginBottom: '4px' }}>{c.icon}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: activeConcept === i ? 'var(--text-bright)' : 'var(--text-dim)' }}>{c.term}</div>
            </button>
          ))}
        </div>
        {activeConcept !== null && (
          <div style={{ background: 'var(--panel)', border: `1px solid ${PCB_CONCEPTS[activeConcept].color}44`, borderLeft: `3px solid ${PCB_CONCEPTS[activeConcept].color}`, borderRadius: '2px', padding: '20px 24px' }}>
            <div style={{ fontFamily: 'var(--cond)', fontSize: '20px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '10px' }}>
              {PCB_CONCEPTS[activeConcept].term}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '12px' }}>
              {PCB_CONCEPTS[activeConcept].desc}
            </p>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: PCB_CONCEPTS[activeConcept].color, background: 'var(--bg3)', padding: '8px 14px', borderRadius: '2px', display: 'inline-block' }}>
              {PCB_CONCEPTS[activeConcept].visual}
            </div>
          </div>
        )}
      </div>

      {/* ── Layer count guide ───────────────────────────────────── */}
      <div style={{ marginBottom: '48px' }}>
        <div className="sub-header">How Many Layers Do I Need?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {BOARD_TYPES.map((b, i) => (
            <div key={i} style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderTop: `3px solid ${b.color}`, borderRadius: '2px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ fontFamily: 'var(--cond)', fontSize: '20px', fontWeight: 700, color: b.color }}>{b.name}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent3)' }}>{b.cost}</div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '12px' }}>{b.uses}</p>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Stackup</div>
              {b.stackup.map((s, j) => (
                <div key={j} style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: s.includes('GND') ? 'var(--accent3)' : s.includes('power') ? 'var(--accent4)' : 'var(--text-dim)', padding: '3px 0', borderBottom: j < b.stackup.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  {j + 1}. {s}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="callout tip">
        Start with 2-layer boards. Most hobby and educational projects work perfectly on 2 layers. Move to 4 layers when you need a dedicated ground plane for noise reasons, or when routing gets too congested.
      </div>
    </div>
  )
}