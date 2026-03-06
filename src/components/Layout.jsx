import React from 'react'

const layerCards = [
  { color: 'cyan',   label: 'F.Cu / B.Cu',    title: 'Copper Layers',    body: 'Front and back copper. This is where traces live. 2-layer board = F.Cu + B.Cu only. Switch layers while routing with / — it auto-adds a via.' },
  { color: 'orange', label: 'F.Mask / B.Mask', title: 'Solder Mask',      body: 'The green (or any color) coating. Mask is REMOVED over pads so solder sticks. You don\'t draw this — KiCad generates it from footprints automatically.' },
  { color: 'green',  label: 'F.Paste / B.Paste',title: 'Solder Paste',    body: 'Used to make stencils for SMD assembly. Only needed if getting boards assembled. Auto-generated for SMD pads.' },
  { color: 'yellow', label: 'F.Silkscreen',    title: 'Silkscreen',       body: 'The white printed labels. Component references, polarity markers, logos. Keep silkscreen OFF pads — fab houses will remove it anyway.' },
  { color: 'cyan',   label: 'Edge.Cuts',       title: 'Board Outline',    body: 'Draw your board shape on this layer. This is exactly where the fab will cut. Must be a closed shape — no gaps. Use rectangle or draw custom shapes.' },
  { color: 'orange', label: 'B.Cu Pour',       title: 'Ground Plane',     body: 'Fill the entire bottom layer with GND copper. Best practice for noise, EMI, and signal integrity. Press B to refill after any changes.' },
]

const routingCallouts = [
  { type: 'tip',    text: 'Route power traces first (wider), then signal traces. Power: 0.5–1mm+. Signal: 0.2–0.25mm for most cases.' },
  { type: 'tip',    text: '45° angles only. Never use 90° bends. In KiCad, hold Ctrl while routing or set interactive router to 45° mode.' },
  { type: 'warn',   text: 'Via stitching: Add extra vias around your ground pour to connect F.Cu and B.Cu GND. Place them every ~10mm near board edges and under ICs.' },
  { type: 'tip',    text: 'Interactive Router (default): KiCad\'s router automatically pushes traces out of the way. If it\'s fighting you, try holding Ctrl to temporarily override.' },
  { type: 'danger', text: 'Never route underneath crystals/oscillators. The pad under a crystal often connects to nothing intentionally — don\'t put traces there. Check the datasheet.' },
]

const pourRows = [
  { action: 'Add filled zone',    how: 'Place → Add Rule Area OR press Ctrl+Shift+Z' },
  { action: 'Set net',            how: 'Select GND in the dialog' },
  { action: 'Refill all zones',   how: 'Press B (do this after every change)' },
  { action: 'Remove fill (view ratsnest)', how: 'Press Ctrl+B (unfill)' },
  { action: 'Thermal relief',     how: 'Keep enabled for hand-soldered through-hole pads' },
  { action: 'Clearance',          how: '0.2–0.3mm from pour to traces' },
]

export default function Layout() {
  return (
    <div className="fade-in">
      <div className="section-title">PCB Layout</div>
      <p className="section-desc">Where your schematic becomes a physical board. The hardest and most important part of PCB design.</p>

      <div className="sub-header">Layers You Need to Know</div>
      <div className="cards">
        {layerCards.map((c, i) => (
          <div className={`card ${c.color}`} key={i}>
            <div className={`card-label ${c.color}`}>{c.label}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>

      <div className="sub-header">Routing Tips</div>
      {routingCallouts.map((c, i) => (
        <div className={`callout ${c.type}`} key={i}>{c.text}</div>
      ))}

      <div className="sub-header">Copper Pour (Ground Plane)</div>
      <table className="rule-table">
        <thead>
          <tr><th>Action</th><th>How To</th></tr>
        </thead>
        <tbody>
          {pourRows.map((r, i) => (
            <tr key={i}>
              <td>{r.action}</td>
              <td className="val">{r.how}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}