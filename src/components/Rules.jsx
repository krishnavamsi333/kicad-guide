import React from 'react'

const traceRows = [
  { current: 'Signal / <0.5A', internal: '0.127 mm', external: '0.127 mm', note: 'Min fab capability' },
  { current: '0.5A – 1A',      internal: '0.2 mm',   external: '0.2 mm',   note: 'Standard signal traces' },
  { current: '1A – 2A',        internal: '0.5 mm',   external: '0.5 mm',   note: 'Small power rails' },
  { current: '2A – 5A',        internal: '1.0 mm',   external: '0.8 mm',   note: 'Power distribution' },
  { current: '5A – 10A',       internal: '2.0 mm',   external: '1.5 mm',   note: 'Motor drivers, battery' },
  { current: '>10A',           internal: 'Copper pour', external: 'Copper pour', note: 'Fill entire region', isGood: true },
]

const clearanceRows = [
  { situation: 'Trace to trace (signal)',   min: '0.1 mm',              rec: '0.2 mm',          recClass: 'good' },
  { situation: 'Trace to board edge',       min: '0.3 mm',              rec: '0.5 mm',          recClass: 'good' },
  { situation: 'Copper to board edge',      min: '0.3 mm',              rec: '0.5 mm',          recClass: 'good' },
  { situation: 'High voltage (>50V)',        min: '0.5 mm / 100V rule',  rec: 'More is better',  recClass: 'warn' },
  { situation: 'Trace under IC body',       min: 'Check datasheet',     rec: 'Avoid if possible', recClass: '' },
  { situation: 'Pad to pad (SMD)',           min: '0.1 mm',              rec: '0.15 mm',         recClass: 'good' },
]

const viaRows = [
  { type: 'Standard signal',       drill: '0.3 mm',        pad: '0.6 mm',      use: 'General routing' },
  { type: 'Power via',             drill: '0.4–0.6 mm',    pad: '0.8–1.0 mm',  use: 'Power / GND rails' },
  { type: 'Thermal via (tented)',  drill: '0.3 mm',        pad: '0.6 mm',      use: 'Under hot ICs' },
  { type: 'Through-hole component',drill: 'Lead Ø + 0.2 mm', pad: 'Drill + 0.6 mm', use: 'Standard TH parts' },
]

const componentCards = [
  {
    color: 'cyan', label: 'Decoupling Caps',
    title: 'Place < 0.5 mm from IC VCC pin',
    body: '100 nF cap on every IC power pin. 10 µF bulk cap on each power rail. Route: VCC → Cap → IC pin, never the other way around. Keep GND via right next to cap.',
  },
  {
    color: 'orange', label: 'Crystal / Oscillator',
    title: 'Traces < 10 mm, nothing routed underneath',
    body: 'Load caps go directly to crystal pads with short return to GND. Surround with GND pour guard ring. Never route signal traces under the crystal footprint.',
  },
  {
    color: 'green', label: 'USB Differential Pair',
    title: 'D+ and D− must be length-matched',
    body: 'Max mismatch: 0.2 mm (USB FS), 0.05 mm (USB HS). Route as 90 Ω differential pair. Check impedance with your fab. No sharp corners — 45° or curved.',
  },
  {
    color: 'yellow', label: 'Power Connectors',
    title: 'Place on board edges, fuse near input',
    body: 'Fuse close to the input. TVS diode right after connector for ESD/transient protection. Wide traces from connector to regulator. Mounting hole near connectors for strain relief.',
  },
]

export default function Rules() {
  return (
    <div className="fade-in">
      <div className="section-title">Design Rules & Thumb Rules</div>
      <p className="section-desc">
        Numbers every PCB designer must know. Based on standard 2-layer board specs from JLCPCB / PCBWay.
      </p>

      <div className="sub-header">Trace Width vs Current (IPC-2221)</div>
      <div className="table-wrap">
        <table className="rule-table">
          <thead>
            <tr>
              <th>Current</th>
              <th>Internal Layer</th>
              <th>External Layer</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {traceRows.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500, color: 'var(--text-bright)' }}>{r.current}</td>
                <td className={r.isGood ? 'good' : 'val'}>{r.internal}</td>
                <td className={r.isGood ? 'good' : 'val'}>{r.external}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{r.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sub-header">Clearances</div>
      <div className="table-wrap">
        <table className="rule-table">
          <thead>
            <tr>
              <th>Situation</th>
              <th>Minimum</th>
              <th>Recommended</th>
            </tr>
          </thead>
          <tbody>
            {clearanceRows.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{r.situation}</td>
                <td className="val">{r.min}</td>
                <td className={r.recClass || 'val'}>{r.rec}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="sub-header">Via Sizes</div>
      <div className="table-wrap">
        <table className="rule-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Drill</th>
              <th>Pad Diameter</th>
              <th>Use Case</th>
            </tr>
          </thead>
          <tbody>
            {viaRows.map((r, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{r.type}</td>
                <td className="val">{r.drill}</td>
                <td className="val">{r.pad}</td>
                <td style={{ color: 'var(--text-dim)', fontSize: '12px' }}>{r.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

      <div className="callout tip">
        Always run DRC (Design Rule Check) before exporting Gerbers. Zero errors = you can order. DRC warnings still need to be read and understood — don't blindly dismiss them.
      </div>
    </div>
  )
}