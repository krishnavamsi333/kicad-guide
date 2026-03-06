import { useState } from 'react'

function NumInput({ label, value, onChange, unit, locked, onLock }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <label style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)' }}>{label}</label>
        <button onClick={onLock} style={{
          fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase',
          padding: '3px 10px', border: `1px solid ${locked ? 'var(--accent)' : 'var(--border)'}`,
          background: locked ? 'var(--accent)22' : 'transparent',
          color: locked ? 'var(--accent)' : 'var(--text-dim)',
          cursor: 'pointer', borderRadius: '2px', transition: 'all 0.15s',
        }}>SOLVE</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="number" value={locked ? '' : value} placeholder={locked ? '← solving...' : ''}
          onChange={e => onChange(e.target.value)}
          disabled={locked}
          style={{
            flex: 1, background: locked ? 'var(--bg3)' : 'var(--panel)',
            border: `1px solid ${locked ? 'var(--accent)44' : 'var(--border)'}`,
            borderRadius: '2px', padding: '10px 14px',
            fontFamily: 'var(--mono)', fontSize: '16px',
            color: locked ? 'var(--accent)' : 'var(--text)',
            outline: 'none',
          }}
        />
        <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-dim)', minWidth: '28px' }}>{unit}</span>
      </div>
    </div>
  )
}

function Result({ label, value, unit, color = 'var(--accent)' }) {
  return (
    <div style={{ background: 'var(--bg3)', border: `1px solid ${color}33`, borderLeft: `3px solid ${color}`, borderRadius: '2px', padding: '14px 18px', marginBottom: '10px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '26px', fontWeight: 700, color }}>{isNaN(value) || !isFinite(value) ? '—' : Number(value).toPrecision(4)} <span style={{ fontSize: '13px' }}>{unit}</span></div>
    </div>
  )
}

export default function OhmCalculator() {
  const [V, setV] = useState('5')
  const [I, setI] = useState('0.02')
  const [R, setR] = useState('250')
  const [solve, setSolve] = useState('R')

  const v = parseFloat(V), i = parseFloat(I), r = parseFloat(R)

  const solvedV = i * r
  const solvedI = v / r
  const solvedR = v / i
  const P_v = solve === 'V' ? solvedV * i : solve === 'I' ? v * solvedI : solve === 'R' ? v * v / r : v * i

  const dispV = solve === 'V' ? solvedV : v
  const dispI = solve === 'I' ? solvedI : i
  const dispR = solve === 'R' ? solvedR : r

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '28px' }}>
      <div className="sub-header" style={{ marginTop: 0 }}>Ohm's Law Calculator</div>
      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '24px' }}>Click SOLVE on the unknown. Enter the two known values.</p>

      <NumInput label="Voltage (V)"   unit="V" value={V} onChange={setV} locked={solve==='V'} onLock={() => setSolve('V')} />
      <NumInput label="Current (I)"   unit="A" value={I} onChange={setI} locked={solve==='I'} onLock={() => setSolve('I')} />
      <NumInput label="Resistance (R)"unit="Ω" value={R} onChange={setR} locked={solve==='R'} onLock={() => setSolve('R')} />

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '8px' }}>
        <Result label="Voltage"    value={dispV}  unit="V" color="var(--accent)" />
        <Result label="Current"    value={dispI}  unit="A" color="var(--accent2)" />
        <Result label="Resistance" value={dispR}  unit="Ω" color="var(--accent3)" />
        <Result label="Power (P = V×I)" value={P_v} unit="W" color="var(--accent4)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
        {['V = I × R', 'I = V / R', 'R = V / I', 'P = V × I'].map(f => (
          <div key={f} style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '2px', padding: '8px 12px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)', textAlign: 'center' }}>{f}</div>
        ))}
      </div>
    </div>
  )
}