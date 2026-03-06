import React from 'react'

const gerberSteps = [
  {
    n: '1', title: 'Open Gerber Export',
    body: <>File → Fabrication Outputs → Gerbers (.gbr). Create a subfolder called <code>gerbers/</code> inside your project folder.</>,
  },
  {
    n: '2', title: 'Select These Layers',
    list: [
      'F.Cu — Front copper',
      'B.Cu — Back copper',
      'F.Mask — Front solder mask',
      'B.Mask — Back solder mask',
      'F.Silkscreen — Front silkscreen',
      'B.Silkscreen — Back silkscreen (optional)',
      'Edge.Cuts — Board outline (REQUIRED)',
      'F.Paste — Only if getting SMD assembled',
    ],
  },
  {
    n: '3', title: 'Generate Drill Files',
    body: 'File → Fabrication Outputs → Drill Files (.drl). Use Excellon format. Generate both PTH (plated) and NPTH (non-plated) files. Save to the same gerbers/ folder.',
  },
  {
    n: '4', title: 'Zip All Files',
    body: 'Select all files in the gerbers/ folder and create a ZIP archive. The ZIP should contain .gbr files + .drl files directly (no subfolders inside the ZIP).',
  },
  {
    n: '5', title: 'Upload & Verify',
    body: 'Upload to JLCPCB or PCBWay. Their Gerber viewer will show a preview. Check that every layer looks correct before paying. Verify board outline, copper layers, and silkscreen.',
  },
]

const fabRows = [
  { name: 'JLCPCB', badge: { cls: 'free', label: 'best value' }, price: '~$2 USD',    trace: '0.1/0.1mm', time: '2–3 days + shipping', best: 'Prototypes, beginners' },
  { name: 'PCBWay',  badge: null,                                  price: '~$5 USD',    trace: '0.1/0.1mm', time: '3–5 days + shipping', best: 'Quality, SMD assembly' },
  { name: 'OSH Park',badge: { cls: 'pro', label: 'US' },           price: '~$10–15 USD',trace: '0.1/0.1mm', time: '2 weeks',             best: 'Small qty, purple boards' },
  { name: 'Eurocircuits', badge: null,                             price: '€30+',       trace: '0.075mm',   time: '1 week',              best: 'EU, professional quality' },
]

export default function Export() {
  return (
    <div className="fade-in">
      <div className="section-title">Export & Fabrication</div>
      <p className="section-desc">Getting your files from KiCad to a physical board. This trips up nearly every beginner.</p>

      <div className="sub-header">Gerber Export (Standard)</div>
      <div className="steps">
        {gerberSteps.map((s, i) => (
          <div className="step" key={i}>
            <div className="step-num">{s.n}</div>
            <div className="step-content">
              <h3>{s.title}</h3>
              {s.body && <p>{s.body}</p>}
              {s.list && <ul>{s.list.map((item, j) => <li key={j}>{item}</li>)}</ul>}
            </div>
          </div>
        ))}
      </div>

      <div className="sub-header">Fabrication Houses Comparison</div>
      <table className="rule-table">
        <thead>
          <tr><th>Fab House</th><th>Price (5 boards)</th><th>Min Trace/Space</th><th>Lead Time</th><th>Best For</th></tr>
        </thead>
        <tbody>
          {fabRows.map((r, i) => (
            <tr key={i}>
              <td>
                {r.name}
                {r.badge && <span className={`badge ${r.badge.cls}`}>{r.badge.label}</span>}
              </td>
              <td className="val">{r.price}</td>
              <td className="val">{r.trace}</td>
              <td>{r.time}</td>
              <td>{r.best}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="callout warn">JLCPCB also offers SMD Assembly (PCBA). Upload Gerbers + BOM + CPL (component placement list). They solder SMD parts for you. Huge time saver for complex boards.</div>
      <div className="callout tip">KiCad 7+ has built-in Gerber viewer: File → Open Gerber Viewer. Check your files before uploading. A 5-minute check can save a $10 mistake.</div>
    </div>
  )
}