import React from 'react'

const steps = [
  {
    n: '01', title: 'Create New Project',
    body: <>File → New Project. KiCad creates a folder with <code>.kicad_pro</code>, <code>.kicad_sch</code>, and <code>.kicad_pcb</code> files. Keep everything in this folder.</>,
  },
  {
    n: '02', title: 'Draw Schematic (Eeschema)',
    body: 'Double-click the .kicad_sch file or open from Project Manager. This is where you design the circuit logically — no physical placement yet.',
    list: [
      'Add symbols with A — search by part name or value',
      'Connect with wires using W',
      'Add power symbols (VCC, GND) with P',
      'Add labels to name nets using L',
      'Add values and references to every component',
    ],
  },
  {
    n: '03', title: 'Assign Footprints',
    body: 'Tools → Assign Footprints. Every symbol needs a physical footprint (the copper pads on the board). This step links logical symbols to real-world package sizes.',
    list: [
      'Resistors: R_0805, R_0603, R_0402 etc.',
      'ICs: match exact package — SOIC-8, TQFP-32, etc.',
      'Connectors: match your actual connector datasheet',
    ],
  },
  {
    n: '04', title: 'Run ERC (Electrical Rules Check)',
    body: 'Inspect → Electrical Rules Checker. Fix ALL errors before moving to layout. Warnings can sometimes be ignored (e.g., unconnected power pins you intentionally left open), but errors must be resolved.',
  },
  {
    n: '05', title: 'Update PCB from Schematic',
    body: 'In the PCB editor: Tools → Update PCB from Schematic (or press F8). All components appear as a ratsnest (thin lines showing connections). Now the layout work begins.',
  },
  {
    n: '06', title: 'Place Components (PCB Layout)',
    body: 'Arrange components on the board. This is an art — placement determines routing difficulty. Follow these placement rules:',
    list: [
      'Place decoupling caps RIGHT next to IC power pins first',
      'Group components by function/circuit block',
      'Keep high-current paths short and wide',
      'Keep oscillators/crystals close to their IC',
      'Place connectors on board edges',
    ],
  },
  {
    n: '07', title: 'Route Traces',
    body: 'Press X to start routing. Click a pad to start, click another pad to end. Route signal traces first, then power. Add copper pours for GND last.',
  },
  {
    n: '08', title: 'Add Copper Pours (Ground Plane)',
    body: 'Use Add Filled Zone (shortcut Ctrl+Shift+Z). Select GND net. Draw a rectangle covering your board. Press B to fill all zones. This is your ground plane.',
  },
  {
    n: '09', title: 'Run DRC (Design Rules Check)',
    body: "Inspect → Design Rules Checker. This catches: trace-to-trace clearance violations, traces too close to board edge, unrouted nets, silkscreen on pads, and more. Fix all errors.",
  },
  {
    n: '10', title: 'Review 3D View',
    body: 'View → 3D Viewer (or Alt+3). Check that components look correct, no overlaps, connectors are accessible, and the board looks how you expect it to.',
  },
  {
    n: '11', title: 'Export Gerbers & Order',
    body: 'File → Fabrication Outputs → Gerbers. Generate all layers + drill files. Zip and upload to JLCPCB, PCBWay, or OSH Park.',
  },
]

export default function Workflow() {
  return (
    <div className="fade-in">
      <div className="section-title">The KiCad Workflow</div>
      <p className="section-desc">KiCad splits design into separate tools. Follow this exact order every time — no shortcuts.</p>

      <div className="steps">
        {steps.map((s, i) => (
          <div className="step" key={i}>
            <div className="step-num">{s.n}</div>
            <div className="step-content">
              <h3>{s.title}</h3>
              <p>{s.body}</p>
              {s.list && (
                <ul>{s.list.map((item, j) => <li key={j}>{item}</li>)}</ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}