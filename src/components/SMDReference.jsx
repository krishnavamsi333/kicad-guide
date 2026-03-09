import { useState } from 'react'

const PACKAGES = [
  { name: '0201', inch: '0.02" × 0.01"', l: 0.6, w: 0.3, power: '1/20W', desc: 'Ultra tiny passive components used in phones and high density electronics.', color: 'var(--red)' },
  { name: '0402', inch: '0.04" × 0.02"', l: 1.0, w: 0.5, power: '1/16W', desc: 'Very common in modern electronics but difficult to hand solder.', color: 'var(--accent2)' },
  { name: '0603', inch: '0.06" × 0.03"', l: 1.6, w: 0.8, power: '1/10W', desc: 'Best package size for beginners learning SMD soldering.', color: 'var(--accent4)' },
  { name: '0805', inch: '0.08" × 0.05"', l: 2.0, w: 1.25, power: '1/8W', desc: 'Easy to hand solder and widely used in hobby electronics.', color: 'var(--accent3)' },
  { name: '1206', inch: '0.12" × 0.06"', l: 3.2, w: 1.6, power: '1/4W', desc: 'Larger package used when higher power dissipation is required.', color: 'var(--accent)' },
  { name: '1210', inch: '0.12" × 0.10"', l: 3.2, w: 2.5, power: '1/2W', desc: 'High power resistors or large capacitors.', color: 'var(--accent)' },

  { name: 'SOT-23', inch: '-', l: 2.9, w: 1.3, power: '~0.35W', desc: 'Small Outline Transistor package commonly used for transistors and MOSFETs.', color: 'var(--accent2)' },
  { name: 'SOT-23-5', inch: '-', l: 2.9, w: 1.6, power: '~0.5W', desc: 'Extended SOT package used for regulators and op-amps.', color: 'var(--accent2)' },

  { name: 'SOIC-8', inch: '-', l: 5.0, w: 3.9, power: '~1W', desc: 'Small Outline Integrated Circuit used for ICs like op-amps and drivers.', color: 'var(--accent)' },

  { name: 'TSSOP-16', inch: '-', l: 5.0, w: 4.4, power: '~1W', desc: 'Thin shrink package used for dense microcontrollers and logic ICs.', color: 'var(--accent4)' },
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

      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '24px' }}>
        Surface Mount Devices (SMD) are components mounted directly onto a PCB surface.
        These package codes (0603, 0805, etc.) represent the physical size of the component.
      </p>

      {/* Visual Size Comparison */}

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

      {/* Package Details */}

      {sel && (

        <div style={{ marginBottom: '40px' }}>

          <h3>{sel.name} Package</h3>

          <p><b>Inch Code:</b> {sel.inch}</p>
          <p><b>Physical Size:</b> {sel.l} mm × {sel.w} mm</p>
          <p><b>Typical Power Rating:</b> {sel.power}</p>
          <p>{sel.desc}</p>

        </div>

      )}

      {/* What SOT means */}

      <div style={{ marginTop: '40px' }}>

        <div className="sub-header">What does SOT mean?</div>

        <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
          <b>SOT</b> stands for <b>Small Outline Transistor</b>.  
          These packages are used for small transistors, MOSFETs, voltage regulators, and analog ICs.
        </p>

        <ul style={{ fontSize: '13px', color: 'var(--text-dim)' }}>
          <li>SOT-23 → very common transistor package</li>
          <li>SOT-23-5 → used for regulators and op-amps</li>
          <li>SOT-223 → larger version used for power regulators</li>
        </ul>

      </div>

      {/* Resistor Table */}

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

      {/* Decoder Tool */}

      <div style={{ marginTop: '40px' }}>

        <div className="sub-header">SMD Code Decoder</div>

        <input
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value)}
          placeholder="Enter SMD code (103, 472, 4R7)"
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
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>RESISTOR VALUE</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '18px' }}>{resistorValue}</div>
            </div>

            <div style={{ background: 'var(--bg3)', padding: '12px', borderLeft: '3px solid var(--accent4)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>CAPACITOR VALUE</div>
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