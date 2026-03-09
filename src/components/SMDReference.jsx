import { useState } from 'react'

const PACKAGES = [
  { name: '0201', inch: '0.02" × 0.01"', l: 0.6, w: 0.3, power: '1/20W', desc: 'Ultra tiny. Machine placement only.', color: 'var(--red)' },
  { name: '0402', inch: '0.04" × 0.02"', l: 1.0, w: 0.5, power: '1/16W', desc: 'Very small. Expert hand soldering.', color: 'var(--accent2)' },
  { name: '0603', inch: '0.06" × 0.03"', l: 1.6, w: 0.8, power: '1/10W', desc: 'Recommended beginner SMD size.', color: 'var(--accent4)' },
  { name: '0805', inch: '0.08" × 0.05"', l: 2.0, w: 1.25, power: '1/8W', desc: 'Easy hand soldering.', color: 'var(--accent3)' },
  { name: '1206', inch: '0.12" × 0.06"', l: 3.2, w: 1.6, power: '1/4W', desc: 'Higher power resistors.', color: 'var(--accent)' },
  { name: '1210', inch: '0.12" × 0.10"', l: 3.2, w: 2.5, power: '1/2W', desc: 'High power / large capacitors.', color: 'var(--accent)' },
  { name: 'SOT-23', inch: '-', l: 2.9, w: 1.3, power: '~0.35W', desc: 'Small transistor / regulator package.', color: 'var(--accent2)' },
  { name: 'SOT-23-5', inch: '-', l: 2.9, w: 1.6, power: '~0.5W', desc: '5-pin regulators / op-amps.', color: 'var(--accent2)' },
  { name: 'SOIC-8', inch: '-', l: 5.0, w: 3.9, power: '~1W', desc: 'Common IC package.', color: 'var(--accent)' },
  { name: 'TSSOP-16', inch: '-', l: 5.0, w: 4.4, power: '~1W', desc: 'Dense microcontrollers / ICs.', color: 'var(--accent4)' },
]

const RESISTOR_CODES = [
  { code: '000', value: '0Ω jumper' },
  { code: '100', value: '10Ω' },
  { code: '220', value: '22Ω' },
  { code: '330', value: '33Ω' },
  { code: '470', value: '47Ω' },
  { code: '101', value: '100Ω' },
  { code: '102', value: '1kΩ' },
  { code: '103', value: '10kΩ' },
  { code: '104', value: '100kΩ' },
  { code: '105', value: '1MΩ' },
]

const SCALE = 28

function decodeResistor(code) {
  if (!code) return null

  code = code.toUpperCase()

  if (code === '000') return '0Ω jumper'

  if (code.includes('R')) {
    return code.replace('R', '.') + ' Ω'
  }

  if (code.length === 3) {
    const base = parseInt(code.slice(0, 2))
    const multiplier = parseInt(code[2])

    const value = base * Math.pow(10, multiplier)

    if (value >= 1000000) return value / 1000000 + ' MΩ'
    if (value >= 1000) return value / 1000 + ' kΩ'
    return value + ' Ω'
  }

  return 'Unknown'
}

function decodeCapacitor(code) {
  if (!code || code.length !== 3) return null

  const base = parseInt(code.slice(0, 2))
  const multiplier = parseInt(code[2])

  const value = base * Math.pow(10, multiplier)

  if (value >= 1000000) return value / 1000000 + ' µF'
  if (value >= 1000) return value / 1000 + ' nF'
  return value + ' pF'
}

export default function SMDReference() {
  const [selected, setSelected] = useState('0603')
  const [searchCode, setSearchCode] = useState('')

  const sel = PACKAGES.find(p => p.name === selected)

  const resistorValue = decodeResistor(searchCode)
  const capacitorValue = decodeCapacitor(searchCode)

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '28px' }}>

      <div className="sub-header">SMD Package Size Reference</div>

      <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '24px' }}>
        Click a package to inspect size, inch code, and power rating.
      </p>

      <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', padding: '24px', marginBottom: '24px', overflowX: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', minWidth: 'max-content' }}>

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
                borderRadius: '2px'
              }} />

              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                color: selected === pkg.name ? pkg.color : 'var(--text-dim)'
              }}>
                {pkg.name}
              </span>

            </div>

          ))}

        </div>

      </div>

      {sel && (

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: '12px' }}>

          {[
            { label: 'Package', val: sel.name, color: sel.color },
            { label: 'Inch Code', val: sel.inch, color: 'var(--accent4)' },
            { label: 'Length', val: `${sel.l} mm`, color: 'var(--accent)' },
            { label: 'Width', val: `${sel.w} mm`, color: 'var(--accent)' },
            { label: 'Power Rating', val: sel.power, color: 'var(--accent3)' }
          ].map((item, i) => (

            <div key={i} style={{
              background: 'var(--bg3)',
              borderLeft: `3px solid ${item.color}`,
              padding: '12px'
            }}>

              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                {item.label}
              </div>

              <div style={{ fontFamily: 'var(--mono)', fontSize: '18px', color: item.color }}>
                {item.val}
              </div>

            </div>

          ))}

        </div>

      )}

      <div style={{ marginTop: '40px' }}>

        <div className="sub-header">Common SMD Resistor Codes</div>

        <table style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: '12px' }}>
          <tbody>

            {RESISTOR_CODES.map(r => (
              <tr key={r.code}>
                <td>{r.code}</td>
                <td>{r.value}</td>
              </tr>
            ))}

          </tbody>
        </table>

      </div>

      <div style={{ marginTop: '40px' }}>

        <div className="sub-header">SMD Code Decoder</div>

        <input
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Enter code (103, 472, 4R7)"
          style={{
            padding: '10px',
            border: '1px solid var(--border)',
            background: 'var(--bg3)',
            fontFamily: 'var(--mono)',
            marginBottom: '20px'
          }}
        />

        {searchCode && (

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>

            <div style={{ background: 'var(--bg3)', padding: '12px', borderLeft: '3px solid var(--accent)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>RESISTOR</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '18px' }}>{resistorValue}</div>
            </div>

            <div style={{ background: 'var(--bg3)', padding: '12px', borderLeft: '3px solid var(--accent4)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>CAPACITOR</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '18px' }}>
                {capacitorValue || 'Unknown'}
              </div>
            </div>

          </div>

        )}

      </div>

    </div>
  )
}