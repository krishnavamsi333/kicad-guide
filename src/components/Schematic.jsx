import React from 'react'

const cards = [
  { color: 'cyan',   label: 'Add Components',     title: 'Press A',             body: 'Search by name (e.g., "555", "ATmega328", "LM7805"). Filter by library. Place multiple instances of the same component without reopening.' },
  { color: 'orange', label: 'Power Symbols',       title: 'Press P',             body: 'Add VCC, +5V, +3.3V, GND, VBUS etc. These are not components — they are net labels. Every GND symbol connects to the same GND net automatically.' },
  { color: 'green',  label: 'Net Labels',          title: 'Press L',             body: 'Name a wire. Two wires with the same label are connected even if not drawn together. Essential for clean schematics — avoids wire spaghetti across the sheet.' },
  { color: 'yellow', label: 'No Connect Flag',     title: 'Press Q',             body: 'Place on unused pins. Tells ERC "this pin is intentionally unconnected." Without this, ERC throws an error on every unconnected pin.' },
  { color: 'cyan',   label: 'Component Properties',title: 'Press E',             body: 'Edit value, reference, footprint, and datasheet link. Always fill in the VALUE field (e.g., 10k, 100nF, LM358). Reference auto-generates (R1, C1, U1…).' },
  { color: 'orange', label: 'Annotate Schematic',  title: 'Tools → Annotate',    body: 'Automatically assigns reference numbers to all components (R1, R2, R3…). Do this before assigning footprints. Always re-annotate if you add new components.' },
]

const callouts = [
  { type: 'tip',    text: 'Draw schematics for humans to read, not just for the computer. A clean schematic signals flow left→right, top→bottom. Power comes from the top, GND goes to the bottom.' },
  { type: 'warn',   text: 'Never connect wires by overlapping them. A junction dot (J key) is required for T-junctions. Without it, crossing wires are NOT connected in KiCad.' },
  { type: 'tip',    text: 'Use hierarchical sheets for complex designs. Split your design into sub-sheets (Power, MCU, Sensors, etc.) and connect with hierarchical labels.' },
  { type: 'danger', text: 'ERC errors = broken netlist = broken PCB. Fix every ERC error before updating the PCB. A missing GND connection in the schematic means floating ground in your PCB.' },
]

export default function Schematic() {
  return (
    <div className="fade-in">
      <div className="section-title">Schematic Editor</div>
      <p className="section-desc">Eeschema — where you draw the logical circuit. Get this right before touching the PCB.</p>

      <div className="sub-header">Core Actions</div>
      <div className="cards">
        {cards.map((c, i) => (
          <div className={`card ${c.color}`} key={i}>
            <div className={`card-label ${c.color}`}>{c.label}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>

      <div className="sub-header">Schematic Best Practices</div>
      {callouts.map((c, i) => (
        <div className={`callout ${c.type}`} key={i}>{c.text}</div>
      ))}
    </div>
  )
}