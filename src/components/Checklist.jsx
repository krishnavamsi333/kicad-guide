import React from 'react'

const sections = [
  {
    label: 'Schematic',
    items: [
      'All components have correct values and references',
      'All components have footprints assigned',
      'ERC runs with zero errors',
      'No-connect flags placed on all intentionally unused pins',
      'Power symbols used correctly (VCC, GND, etc.)',
      'Net labels used instead of long crossing wires',
      'Junction dots placed at all T-wire junctions',
      'Decoupling capacitors placed on all IC power pins',
    ],
  },
  {
    label: 'PCB Layout',
    items: [
      'Board outline drawn on Edge.Cuts layer (closed shape)',
      'All components placed (no components off-board)',
      'All ratsnest lines gone (zero unrouted connections)',
      'Ground plane added and filled (press B)',
      'Copper zones refilled after last change (press B again)',
      'No 90° trace bends — all bends are 45°',
      'Power traces are wider than signal traces',
      'Decoupling caps are within 0.5–1mm of IC power pins',
      'Via stitching added around ground pour edges',
      'All silkscreen labels are readable and not on pads',
      'Polarity marked on polarized components (caps, LEDs, diodes)',
      'Pin 1 marked on ICs, connectors',
      'Mounting holes added if needed',
    ],
  },
  {
    label: 'Checks',
    items: [
      'DRC runs with zero errors',
      'DRC warnings reviewed and understood',
      '3D view looks correct — no overlapping components',
      'Board dimensions verified (measure with ruler tool)',
      'Footprints verified against actual component datasheets',
      'Connector orientation is correct in 3D view',
    ],
  },
  {
    label: 'Export',
    items: [
      'Gerbers generated for all required layers',
      'Drill files generated (PTH + NPTH)',
      'Gerbers previewed in KiCad Gerber viewer',
      'Gerbers uploaded to fab site and previewed there',
      'Board color, surface finish, and thickness selected',
      'Quantity correct',
    ],
  },
]

export default function Checklist() {
  return (
    <div className="fade-in">
      <div className="section-title">Pre-Fabrication Checklist</div>
      <p className="section-desc">Run through this before every board order. Print it out. These are the most common beginner mistakes.</p>

      {sections.map((s, i) => (
        <div key={i}>
          <div className="sub-header">{s.label}</div>
          <ul className="checklist">
            {s.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}