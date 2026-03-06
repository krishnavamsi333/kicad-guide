import { useState } from 'react'

const PACKAGES = [
  { name: '0201', l: 0.6,  w: 0.3,  desc: 'Ultra tiny, machine placement only', color: 'var(--red)' },
  { name: '0402', l: 1.0,  w: 0.5,  desc: 'Very small, expert hand solder', color: 'var(--accent2)' },
  { name: '0603', l: 1.6,  w: 0.8,  desc: 'Recommended for beginners', color: 'var(--accent4)' },
  { name: '0805', l: 2.0,  w: 1.25, desc: 'Easy hand soldering', color: 'var(--accent3)' },
  { name: '1206', l: 3.2,  w: 1.6,  desc: 'Easy, good for high power', color: 'var(--accent)' },
  { name: '1210', l: 3.2,  w: 2.5,  desc: 'High power / large caps', color: 'var(--accent)' },
  { name: 'SOT-23', l: 2.9, w: 1.3, desc: 'Small transistors / regulators', color: 'var(--accent2)' },
  { name: 'SOT-23-5', l: 2.9, w: 1.6, desc: '5-pin regulators, op-amps', color: 'var(--accent2)' },
  { name: 'SOIC-8',  l: 5.0, w: 3.9, desc: 'Common ICs, op-amps, drivers', color: 'var(--accent)' },
  { name: 'TSSOP-16',l: 5.0, w: 4.4, desc: 'Dense ICs, microcontrollers', color: 'var(--accent4)' },
]

const SCALE = 28 // px per mm

export default function SMDReference() {
  const [selected, setSelected] = useState('0603')
  const sel = PACKAGES.find(p => p.name === selected)

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '28px' }}>
      <div className="sub-header" style={{ marginTop: 0 }}>SMD Package Size Reference</div>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '24px' }}>Actual sizes to scale. Click any package to inspect.</p>

      {/* Visual canvas */}
      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '2px', padding: '24px', marginBottom: '24px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', minWidth: 'max-content', padding: '8px 0' }}>
          {PACKAGES.map(pkg => (
            <div key={pkg.name}
              onClick={() => setSelected(pkg.name)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <div style={{
                width: `${pkg.l * SCALE}px`,
                height: `${pkg.w * SCALE}px`,
                background: selected === pkg.name ? pkg.color : pkg.color + '33',
                border: `2px solid ${pkg.color}`,
                borderRadius: '2px',
                transition: 'all 0.2s',
                boxShadow: selected === pkg.name ? `0 0 12px ${pkg.color}66` : 'none',
              }} />
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '10px',
                color: selected === pkg.name ? pkg.color : 'var(--text-dim)',
                letterSpacing: '1px',
              }}>{pkg.name}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
          ← Scale: 1mm = {SCALE}px &nbsp;|&nbsp; All sizes to scale relative to each other →
        </div>
      </div>

      {/* Selected info */}
      {sel && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Package',   val: sel.name,        color: sel.color },
            { label: 'Length',    val: `${sel.l} mm`,   color: 'var(--accent)' },
            { label: 'Width',     val: `${sel.w} mm`,   color: 'var(--accent)' },
            { label: 'Solderable',val: sel.l >= 1.6 ? 'Hand ✓' : sel.l >= 1.0 ? 'Expert' : 'Machine only', color: sel.l >= 1.6 ? 'var(--accent3)' : sel.l >= 1.0 ? 'var(--accent4)' : 'var(--red)' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--bg3)', border: `1px solid ${item.color}33`, borderLeft: `3px solid ${item.color}`, borderRadius: '2px', padding: '12px 16px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 700, color: item.color }}>{item.val}</div>
            </div>
          ))}
          <div style={{ gridColumn: '1/-1', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '2px', padding: '12px 16px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dim)' }}>
            💬 {sel.desc}
          </div>
        </div>
      )}
    </div>
  )
}