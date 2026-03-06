import React from 'react'

const traceRows = [
  { current: 'Signal / <0.5A', internal: '0.127mm', external: '0.127mm', note: 'Minimum fab capability' },
  { current: '0.5A – 1A',      internal: '0.2mm',   external: '0.2mm',   note: 'Standard signal traces' },
  { current: '1A – 2A',        internal: '0.5mm',   external: '0.5mm',   note: 'Small power rails' },
  { current: '2A – 5A',        internal: '1.0mm',   external: '0.8mm',   note: 'Power distribution' },
  { current: '5A – 10A',       internal: '2.0mm',   external: '1.5mm',   note: 'Motor drivers, battery' },
  { current: '>10A',           internal: 'Copper pour', external: 'Copper pour', note: 'Fill entire region', isGood: true },
]

const clearanceRows = [
  { situation: 'Trace to trace (signal)',   min: '0.1mm',               rec: '0.2mm',           recClass: 'good' },
  { situation: 'Trace to board edge',       min: '0.3mm',               rec: '0.5mm',           recClass: 'good' },
  { situation: 'Copper to board edge',      min: '0.3mm',               rec: '0.5mm',           recClass: 'good' },
  { situation: 'High voltage (>50V)',        min: '0.5mm/100V rule',     rec: 'More is better',  recClass: 'warn' },
  { situation: 'Trace under IC',            min: 'Check datasheet',     rec: 'Avoid if possible', recClass: '' },
  { situation: 'Pad to pad (SMD)',           min: '0.1mm',               rec: '0.15mm',          recClass: 'good' },
]

const viaRows = [
  { type: 'Standard (JLCPCB default)', drill: '0.3mm', pad: '0.6mm',  use: 'Signal routing' },
  { type: 'Power via',                 drill: '0.4–0.6mm', pad: '0.8–1.0mm', use: 'Power/GND' },
  { type: 'Thermal via',               drill: '0.3mm', pad: '0.6mm',  use: 'Under hot ICs (tented)' },
  { type: 'Through-hole component',    drill: 'Lead Ø + 0.2mm', pad: 'Drill + 0.6mm', use: 'Standard TH parts' },
]

const componentCards = [
  { color: 'cyan',   label: 'Decoupling Caps',       title: 'Place < 0.5mm from IC VCC pin',         body: '100nF cap on every IC power pin. 10µF bulk cap on each power rail. Route: VCC → Cap → IC pin, never the other way. Keep GND via right next to cap.' },
  { color: 'orange', label: 'Crystal / Oscillator',  title: 'Keep traces < 10mm, no other traces under it', body: 'Load caps go directly to crystal pads, short return to GND. Surround with GND pour. Never route signals under a crystal footprint.' },
  { color: 'green',  label: 'USB Differential Pair', title: 'D+ and D− must be length-matched',      body: 'Max length mismatch: 0.2mm for USB FS, 0.05mm for USB HS. Keep as 90Ω differential impedance (check with your fab). No sharp turns.' },
  { color: 'yellow', label: 'Power Jack / Connectors',title: 'Place on board edges',                 body: 'Fuse close to input. TVS diode right after connector for protection. Wide traces from connector to regulator. Mount hole near connectors for mechanical strain relief.' },
]

export default function Rules() {
  return (
    <div className="fade-in">
      <div className="section-title">Design Rules & Thumb Rules</div>
      <p className="section-desc">Numbers every PCB designer must know by heart. These are for standard 2-layer boards ordered from JLCPCB / PCBWay.</p>

      <div className="sub-header">Trace Width vs Current</div>
      <table className="rule-table">
        <thead>
          <tr><th>Current</th><th>Min Width (Internal)</th><th>Min Width (External)</th><th>Note</th></tr>
        </thead>
        <tbody>
          {traceRows.map((r, i) => (
            <tr key={i}>
              <td>{r.current}</td>
              <td className={r.isGood ? 'good' : 'val'}>{r.internal}</td>
              <td className={r.isGood ? 'good' : 'val'}>{r.external}</td>
              <td>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sub-header">Clearances</div>
      <table className="rule-table">
        <thead>
          <tr><th>Situation</th><th>Minimum Clearance</th><th>Recommended</th></tr>
        </thead>
        <tbody>
          {clearanceRows.map((r, i) => (
            <tr key={i}>
              <td>{r.situation}</td>
              <td className="val">{r.min}</td>
              <td className={r.recClass || 'val'}>{r.rec}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sub-header">Via Sizes</div>
      <table className="rule-table">
        <thead>
          <tr><th>Type</th><th>Drill</th><th>Pad Diameter</th><th>Use Case</th></tr>
        </thead>
        <tbody>
          {viaRows.map((r, i) => (
            <tr key={i}>
              <td>{r.type}</td>
              <td className="val">{r.drill}</td>
              <td className="val">{r.pad}</td>
              <td>{r.use}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="sub-header">Component-Specific Rules</div>
      <div className="cards">
        {componentCards.map((c, i) => (
          <div className={`card ${c.color}`} key={i}>
            <div className={`card-label ${c.color}`}>{c.label}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}