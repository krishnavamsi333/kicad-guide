import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────

const PROTOCOLS = [
  {
    id: 'i2c_std',
    name: 'I²C Standard Mode',
    freq: 100e3,
    type: 'i2c',
    color: 'var(--accent)',
    maxLen: 4000,   // mm — practical limit
    traces: 'SDA, SCL',
    routing: 'Open-drain, single-ended',
    riseTime: 1000, // ns
    maxCap: 400,    // pF bus capacitance
    pullup: '4.7kΩ to VCC',
    termination: 'Pull-up resistors only',
    notes: [
      'Max bus capacitance 400pF — limits total trace length across all devices',
      'Each device on bus adds ~10pF; connectors add ~5–50pF',
      'Pull-up value: R_pullup ≤ (VCC − 0.4) / 3mA (sink current)',
      'Pull-up value: R_pullup ≥ t_rise / (0.8473 × C_bus)',
      'At 100kHz, rise time ≤ 1000ns → C_bus × R ≤ 1000ns / 0.8473',
    ],
  },
  {
    id: 'i2c_fast',
    name: 'I²C Fast Mode',
    freq: 400e3,
    type: 'i2c',
    color: 'var(--accent)',
    maxLen: 1000,
    traces: 'SDA, SCL',
    routing: 'Open-drain, single-ended',
    riseTime: 300,
    maxCap: 400,
    pullup: '1kΩ–2.2kΩ to VCC',
    termination: 'Pull-up resistors only',
    notes: [
      'Max bus capacitance still 400pF, but shorter rise time means lower R pull-up',
      '1kΩ pull-up with 400pF cap → rise time = 0.8473 × 1000 × 400e-12 = 339ns ✓',
      'Current through pull-up at logic low: Vcc/R must be ≥ 3mA sink minimum',
      'Active pull-up (current source) can extend range beyond passive pull-up limits',
      'Keep SDA and SCL traces close together and away from noisy signals',
    ],
  },
  {
    id: 'i2c_fastplus',
    name: 'I²C Fast Mode Plus',
    freq: 1e6,
    type: 'i2c',
    color: 'var(--accent)',
    maxLen: 300,
    traces: 'SDA, SCL',
    routing: 'Open-drain, single-ended',
    riseTime: 120,
    maxCap: 550,
    pullup: '220Ω–470Ω (active driver required)',
    termination: 'Active current-source pull-up recommended',
    notes: [
      'Requires a Fast Mode Plus capable driver — not all I²C peripherals support it',
      'Bus capacitance budget is tighter: reduced R pull-up means more current drain',
      'Board-only (no long cables) at this speed — stay under 100mm if possible',
      'Consider series resistor (10–22Ω) on SCL and SDA for EMI reduction',
    ],
  },
  {
    id: 'spi_1',
    name: 'SPI ≤ 1 MHz',
    freq: 1e6,
    type: 'spi',
    color: 'var(--accent2)',
    maxLen: 500,
    traces: 'MOSI, MISO, SCK, CS',
    routing: 'Push-pull, single-ended',
    riseTime: null,
    maxCap: null,
    pullup: 'CS: pull-up to VCC (10kΩ)',
    termination: 'Usually none needed',
    notes: [
      'At 1MHz, trace length < 150mm easily. No termination needed.',
      'Route all SPI traces similar length — especially for multi-slave buses',
      'CS (chip select) lines: pull-up to VCC to prevent false selection at startup',
      'MISO is driven by slave — ensure output drive strength is sufficient over trace length',
    ],
  },
  {
    id: 'spi_10',
    name: 'SPI 10–50 MHz',
    freq: 25e6,
    type: 'spi',
    color: 'var(--accent2)',
    maxLen: 150,
    traces: 'MOSI, MISO, SCK, CS',
    routing: 'Push-pull, single-ended',
    riseTime: null,
    maxCap: null,
    pullup: 'CS: pull-up 10kΩ',
    termination: '33Ω series on SCK and MOSI at the driver',
    notes: [
      'At 25MHz, λ/10 in FR4 ≈ 240mm — keep all SPI traces < 150mm',
      'Add 22–33Ω series resistors on SCK and MOSI at the MCU — dampens ringing',
      'Avoid stubs (traces that dead-end) — they cause reflections',
      'Ground plane under all SPI traces is mandatory',
      'Keep SPI traces away from sensitive analog — SCK is a strong noise source',
    ],
  },
  {
    id: 'spi_100',
    name: 'SPI > 50 MHz',
    freq: 80e6,
    type: 'spi',
    color: 'var(--accent2)',
    maxLen: 50,
    traces: 'MOSI, MISO, SCK, CS',
    routing: 'Push-pull, controlled impedance',
    riseTime: null,
    maxCap: null,
    pullup: 'CS: 10kΩ pull-up',
    termination: '33–50Ω series at driver, consider 50Ω parallel at receiver',
    notes: [
      'Treat all traces as transmission lines — 50Ω controlled impedance required',
      'Source termination: 33Ω in series at driver output (pad to resistor = < 5mm)',
      'Length match SCK and MOSI to within 2mm',
      'Keep total trace length < 50mm — use a PCB-level SPI, not off-board cable',
      'Rise time < 2ns — critically review ground plane continuity',
    ],
  },
  {
    id: 'uart_std',
    name: 'UART 115200 baud',
    freq: 115200,
    type: 'uart',
    color: 'var(--accent4)',
    maxLen: 5000,
    traces: 'TX, RX (+ optional RTS, CTS)',
    routing: 'Push-pull or open-drain, single-ended',
    riseTime: null,
    maxCap: null,
    pullup: 'TX: pull-up optional for idle-high. RX: match level if cross-voltage',
    termination: 'None needed',
    notes: [
      '115200 baud is very slow electrically — almost no trace length concern on-board',
      'Main concern: voltage level matching. 3.3V UART ↔ 5V UART needs level shifter',
      'For long cables: use RS-232 (±12V) or RS-485 (differential) instead',
      'Add 100Ω series on TX for EMI at board edge connectors',
    ],
  },
  {
    id: 'uart_fast',
    name: 'UART 3–12 Mbps',
    freq: 6e6,
    type: 'uart',
    color: 'var(--accent4)',
    maxLen: 200,
    traces: 'TX, RX',
    routing: 'Push-pull, single-ended',
    riseTime: null,
    maxCap: null,
    pullup: 'TX idle-high pull-up: 10kΩ',
    termination: '33Ω series at TX if > 100mm',
    notes: [
      'At 6Mbps, bit period = 167ns — trace critical length ≈ 25mm in FR4',
      'Keep traces < 100mm or add series termination at TX end',
      'Ensure matching baud rate tolerance: UART typically allows ±2% baud error',
    ],
  },
]

// ─────────────────────────────────────────────────────────────────
// CALCULATORS
// ─────────────────────────────────────────────────────────────────

// Propagation delay in FR4: ~170 ps/mm (Vp ≈ c/√Er, Er≈4.5)
const VP_MM_PS = 170  // ps per mm

function criticalLength(riseTimeNs) {
  // λ/10 rule: trace becomes transmission line when length > rise_time / (6 × td)
  // td = propagation delay per unit length
  const td_ns_mm = VP_MM_PS / 1000  // ns per mm
  return riseTimeNs / (6 * td_ns_mm)  // mm
}

function i2cMaxLength(freq, pullupR, extraCapPF) {
  // Rise time limit: t_rise = 0.8473 × R × C_bus ≤ limit
  const riseLimit_ns = freq <= 100e3 ? 1000 : freq <= 400e3 ? 300 : 120
  const maxC_pF = 400 + (freq >= 1e6 ? 150 : 0)
  // Remaining capacitance after connectors/devices
  const availableCap = maxC_pF - extraCapPF
  // Trace capacitance in FR4: ~100 pF/m = 0.1 pF/mm for microstrip
  const traceCap_pF_mm = 0.1
  const maxLen_mm = availableCap / traceCap_pF_mm
  return Math.min(maxLen_mm, 4000)
}

// ─────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────

export default function BusGuide() {
  const [selected, setSelected] = useState('i2c_fast')
  const [pullupR,  setPullupR]  = useState(4.7)   // kΩ
  const [extraCap, setExtraCap] = useState(50)    // pF (devices + connectors)
  const [traceLen, setTraceLen] = useState(100)   // mm

  const proto = PROTOCOLS.find(p => p.id === selected)

  // I2C calculations
  const i2cMaxLen = proto?.type === 'i2c' ? i2cMaxLength(proto.freq, pullupR*1e3, extraCap) : null
  const riseTimeActual = proto?.type === 'i2c' ? 0.8473 * (pullupR*1e3) * ((extraCap + traceLen*0.1) * 1e-12) * 1e9 : null
  const riseLimit = proto?.type === 'i2c' ? (proto.freq <= 100e3 ? 1000 : proto.freq <= 400e3 ? 300 : 120) : null
  const riseOk = riseTimeActual !== null ? riseTimeActual <= riseLimit : true

  // Transmission line check
  const tdTrace_ns = (traceLen * VP_MM_PS) / 1e6  // ns
  const isTLine = proto ? tdTrace_ns > (1 / proto.freq) / 10 * 1e9 : false

  // Group tabs by type
  const GROUPS = [
    { label: 'I²C', color: 'var(--accent)',  ids: PROTOCOLS.filter(p=>p.type==='i2c').map(p=>p.id) },
    { label: 'SPI', color: 'var(--accent2)', ids: PROTOCOLS.filter(p=>p.type==='spi').map(p=>p.id) },
    { label: 'UART',color: 'var(--accent4)', ids: PROTOCOLS.filter(p=>p.type==='uart').map(p=>p.id) },
  ]

  return (
    <div className="fade-in">
      <div className="section-title">I²C / SPI / UART Trace Guide</div>
      <p className="section-desc">
        Speed-dependent trace length limits, termination requirements, and pull-up calculations for common serial buses.
      </p>

      {/* Protocol selector */}
      <div style={{ marginBottom: '24px' }}>
        {GROUPS.map(g => (
          <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: g.color, letterSpacing: '2px', textTransform: 'uppercase', width: '36px' }}>{g.label}</span>
            {PROTOCOLS.filter(p => g.ids.includes(p.id)).map(p => (
              <button key={p.id} onClick={() => setSelected(p.id)} style={{
                fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
                padding: '6px 12px', borderRadius: '2px', cursor: 'pointer',
                border: `1px solid ${selected===p.id ? g.color : 'var(--border)'}`,
                background: selected===p.id ? `color-mix(in srgb, ${g.color} 10%, var(--panel))` : 'var(--panel)',
                color: selected===p.id ? g.color : 'var(--text-dim)',
                transition: 'all 0.15s',
              }}>{p.name}</button>
            ))}
          </div>
        ))}
      </div>

      {proto && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

          {/* Left — spec summary + interactive */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Spec card */}
            <div style={{ background: 'var(--panel)', border: `1px solid var(--border)`, borderTop: `3px solid ${proto.color}`, borderRadius: '2px', padding: '18px 20px' }}>
              <div style={{ fontFamily: 'var(--cond)', fontSize: '18px', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '12px' }}>{proto.name}</div>
              {[
                ['Frequency',       proto.freq >= 1e6 ? `${proto.freq/1e6} MHz` : `${proto.freq/1e3} kHz`],
                ['Traces',          proto.traces],
                ['Routing style',   proto.routing],
                ['Max trace length',`${proto.maxLen} mm practical`],
                ['Pull-up / Termination', proto.termination],
                ['Recommended pull-up', proto.pullup],
                ...(proto.riseTime ? [['Max rise time', `${proto.riseTime} ns`]] : []),
                ...(proto.maxCap   ? [['Max bus capacitance', `${proto.maxCap} pF`]] : []),
              ].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)', flexShrink: 0 }}>{k}</span>
                  <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)', textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* I2C interactive */}
            {proto.type === 'i2c' && (
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 18px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>I²C Sizing Calculator</div>

                {[
                  { label:'Pull-up R', val:pullupR, set:setPullupR, min:0.1, max:47, step:0.1, unit:'kΩ', color:'var(--accent)' },
                  { label:'Extra cap (devices+connectors)', val:extraCap, set:setExtraCap, min:0, max:390, step:5, unit:'pF', color:'var(--accent4)' },
                  { label:'Trace length', val:traceLen, set:setTraceLen, min:5, max:5000, step:5, unit:'mm', color:'var(--accent2)' },
                ].map(f => (
                  <div key={f.label} style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '5px' }}>
                      <span>{f.label}</span><span style={{ color: f.color }}>{f.val} {f.unit}</span>
                    </label>
                    <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                      onChange={e => f.set(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                  </div>
                ))}

                <div style={{ marginTop: '8px', background: riseOk ? 'color-mix(in srgb, var(--accent3) 8%, var(--bg3))' : 'color-mix(in srgb, var(--red) 8%, var(--bg3))',
                  border: `1px solid ${riseOk ? 'color-mix(in srgb, var(--accent3) 30%, var(--border))' : 'color-mix(in srgb, var(--red) 30%, var(--border))'}`,
                  borderLeft: `3px solid ${riseOk ? 'var(--accent3)':'var(--red)'}`,
                  borderRadius: '2px', padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: riseOk ? 'var(--accent3)' : 'var(--red)', marginBottom: '4px' }}>
                    {riseOk ? '✓ Rise time OK' : '✗ Rise time too slow!'}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                    Actual: {riseTimeActual?.toFixed(1)} ns &nbsp;|&nbsp; Limit: {riseLimit} ns
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
                    Max trace length with these settings: {i2cMaxLen?.toFixed(0)} mm
                  </div>
                </div>
              </div>
            )}

            {/* SPI trace check */}
            {proto.type === 'spi' && (
              <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 18px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Trace Length Check</div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '5px' }}>
                    <span>Your trace length</span><span style={{ color: 'var(--accent2)' }}>{traceLen} mm</span>
                  </label>
                  <input type="range" min={5} max={1000} step={5} value={traceLen}
                    onChange={e => setTraceLen(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer' }} />
                </div>
                <div style={{ background: isTLine ? 'color-mix(in srgb, var(--accent4) 8%, var(--bg3))' : 'color-mix(in srgb, var(--accent3) 8%, var(--bg3))',
                  border: `1px solid ${isTLine ? 'color-mix(in srgb, var(--accent4) 30%, var(--border))' : 'color-mix(in srgb, var(--accent3) 30%, var(--border))'}`,
                  borderLeft: `3px solid ${isTLine ? 'var(--accent4)':'var(--accent3)'}`,
                  borderRadius: '2px', padding: '10px 14px' }}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: isTLine ? 'var(--accent4)':'var(--accent3)', marginBottom: '4px' }}>
                    {isTLine ? '⚠ Transmission line effects possible — use termination' : '✓ Short enough — no termination needed'}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                    Trace delay: {(tdTrace_ns * 1000).toFixed(1)} ps &nbsp;|&nbsp; Max recommended: {proto.maxLen} mm
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right — notes */}
          <div>
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '18px 20px', marginBottom: '12px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: proto.color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Design Notes</div>
              {proto.notes.map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text)', padding: '7px 0', borderBottom: i < proto.notes.length-1 ? '1px solid var(--border)' : 'none', lineHeight: 1.7 }}>
                  <span style={{ color: proto.color, flexShrink: 0, fontFamily: 'var(--mono)' }}>→</span>{n}
                </div>
              ))}
            </div>

            {/* PCB layout rules — common to all */}
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 20px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--accent3)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>PCB Layout Rules (All Speeds)</div>
              {[
                'Ground plane under all bus traces — mandatory for signal quality',
                'Route bus traces away from high-current power lines and switching signals',
                'Avoid acute angles and right-angle bends on traces > 10MHz',
                'Keep stub lengths zero — no unused branches on bus traces',
                'Series resistors: place them close to the driver output, not near the receiver',
                'Cross traces at 90° when layers change to minimise coupling',
                'For I²C over long wires: use I²C bus extender ICs (PCA9600, P82B715)',
              ].map((r, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '12px', color: 'var(--text)', padding: '5px 0', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>
                  <span style={{ color: 'var(--accent3)', flexShrink: 0 }}>◈</span>{r}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}