import { useState } from 'react'

// ─────────────────────────────────────────────────────────────────
// FUSE CALCULATOR
// ─────────────────────────────────────────────────────────────────

const FUSE_TYPES = [
  { type: 'Fast-blow (F)', holdFactor: 1.1, blowFactor: 1.35 },
  { type: 'Slow-blow (T)', holdFactor: 1.25, blowFactor: 1.6 },
  { type: 'Very fast (FF)', holdFactor: 1.05, blowFactor: 1.25 },
  { type: 'Time-delay (TT)', holdFactor: 1.35, blowFactor: 1.75 },
]

const STANDARD_FUSES = [0.1, 0.2, 0.25, 0.315, 0.4, 0.5, 0.63, 0.8, 1, 1.25, 1.6, 2, 2.5, 3.15, 4, 5, 6.3, 8, 10, 12, 16, 20]

function FuseCalculator() {
  const [loadCurrent, setLoad] = useState(1.0)
  const [fuseTypeIdx, setFuseType] = useState(0)
  const [tempDerating, setTemp] = useState(25)

  const ft = FUSE_TYPES[fuseTypeIdx]

  // Temperature derating (IEC 60127): derate above 25°C
  const tempFactor = tempDerating <= 25 ? 1 : 1 + (tempDerating - 25) * 0.004
  const adjustedLoad = loadCurrent * tempFactor

  const minRating = adjustedLoad * ft.holdFactor
  const recommended = STANDARD_FUSES.find(f => f >= minRating) || STANDARD_FUSES[STANDARD_FUSES.length - 1]
  const blowCurrent = recommended * ft.blowFactor

  const color = recommended <= minRating * 1.3 ? 'var(--accent3)'
    : recommended <= minRating * 1.6 ? 'var(--accent)'
    : 'var(--accent4)'

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Inputs */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Load Current</span><span style={{ color: 'var(--accent)' }}>{loadCurrent} A</span>
            </label>
            <input type="range" min={0.05} max={20} step={0.05} value={loadCurrent}
              onChange={e => setLoad(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Ambient Temp</span><span style={{ color: 'var(--accent)' }}>{tempDerating}°C</span>
            </label>
            <input type="range" min={-10} max={85} step={1} value={tempDerating}
              onChange={e => setTemp(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
              <span>-10°C</span><span>85°C</span>
            </div>
          </div>

          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '8px' }}>Fuse Type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {FUSE_TYPES.map((f, i) => (
                <button key={i} onClick={() => setFuseType(i)} style={{
                  textAlign: 'left', fontFamily: 'var(--mono)', fontSize: '11px',
                  padding: '7px 12px', borderRadius: '2px', cursor: 'pointer',
                  border: `1px solid ${fuseTypeIdx === i ? 'var(--accent2)' : 'var(--border)'}`,
                  background: fuseTypeIdx === i ? 'color-mix(in srgb, var(--accent2) 8%, var(--bg3))' : 'var(--bg3)',
                  color: fuseTypeIdx === i ? 'var(--accent2)' : 'var(--text-dim)',
                  transition: 'all 0.15s',
                }}>{f.type}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: 'var(--bg3)', border: `1px solid color-mix(in srgb, ${color} 25%, var(--border))`, borderLeft: `3px solid ${color}`, borderRadius: '2px', padding: '16px 18px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px' }}>Recommended Fuse</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 700, color }}>{recommended} <span style={{ fontSize: '14px', opacity: 0.7 }}>A</span></div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{ft.type}</div>
          </div>

          {[
            ['Min rating needed', `${minRating.toFixed(3)} A`, 'var(--text-dim)'],
            ['Blow current', `~${blowCurrent.toFixed(2)} A`, 'var(--accent2)'],
            ['Temp derating factor', `×${tempFactor.toFixed(3)}`, 'var(--text-dim)'],
            ['Adjusted load', `${adjustedLoad.toFixed(3)} A`, 'var(--text)'],
          ].map(([k, v, c]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '10px 14px', fontSize: '12px' }}>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--mono)', color: c }}>{v}</span>
            </div>
          ))}

          <div className="callout tip" style={{ fontSize: '12px' }}>
            Rule: fuse rating ≥ 125% of max load current. Add temperature derating above 25°C.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// NET CLASS PRESETS
// ─────────────────────────────────────────────────────────────────

const NET_CLASS_PRESETS = [
  {
    name: 'General Signal',
    desc: 'Default for logic, I²C, SPI, UART, GPIO',
    color: 'var(--accent)',
    rules: {
      'Min Track Width':   '0.15 mm',
      'Min Clearance':     '0.15 mm',
      'Min Via Diameter':  '0.6 mm',
      'Min Via Drill':     '0.3 mm',
      'Min uVia Diameter': '0.3 mm',
      'Min uVia Drill':    '0.1 mm',
    },
    snippet: `(net_class "Signal"
  (clearance 0.15)
  (trace_width 0.15)
  (via_dia 0.6)
  (via_drill 0.3)
  (uvia_dia 0.3)
  (uvia_drill 0.1)
)`,
  },
  {
    name: 'Power',
    desc: '1A+ power rails: VCC, VBAT, 5V, 3V3',
    color: 'var(--accent4)',
    rules: {
      'Min Track Width':  '0.5 mm',
      'Min Clearance':    '0.2 mm',
      'Min Via Diameter': '1.0 mm',
      'Min Via Drill':    '0.6 mm',
    },
    snippet: `(net_class "Power"
  (clearance 0.2)
  (trace_width 0.5)
  (via_dia 1.0)
  (via_drill 0.6)
  (add_net "VCC")
  (add_net "VDD")
  (add_net "+5V")
  (add_net "+3V3")
)`,
  },
  {
    name: 'High Speed (USB / HDMI)',
    desc: 'Differential pairs — USB 2.0 / HDMI / LVDS',
    color: 'var(--accent2)',
    rules: {
      'Min Track Width':    '0.15 mm',
      'Min Clearance':      '0.15 mm',
      'Diff Pair Width':    '0.2 mm',
      'Diff Pair Gap':      '0.2 mm',
      'Length Matching':    '±0.1 mm',
      'Min Via Diameter':   '0.6 mm',
      'Min Via Drill':      '0.3 mm',
    },
    snippet: `(net_class "HighSpeed"
  (clearance 0.15)
  (trace_width 0.2)
  (diff_pair_width 0.2)
  (diff_pair_gap 0.2)
  (via_dia 0.6)
  (via_drill 0.3)
  (add_net "USB_DP")
  (add_net "USB_DM")
)`,
  },
  {
    name: 'RF / 50Ω',
    desc: 'RF traces, antenna feeds, 50Ω controlled impedance',
    color: 'var(--accent3)',
    rules: {
      'Track Width':      'Controlled (calc per stackup)',
      'Min Clearance':    '0.25 mm (3× trace width)',
      'Min Via Diameter': '0.6 mm',
      'Min Via Drill':    '0.3 mm',
      'Via stitching':    'Every 3–5 mm along trace',
    },
    snippet: `(net_class "RF_50R"
  (clearance 0.25)
  (trace_width 0.2)   ; adjust per impedance calc
  (via_dia 0.6)
  (via_drill 0.3)
  (add_net "RF_ANT")
  (add_net "RF_IN")
)`,
  },
  {
    name: 'High Voltage',
    desc: 'Mains or >60V — requires wide creepage',
    color: 'var(--red)',
    rules: {
      'Min Track Width':  '0.5 mm',
      'Min Clearance':    '1.5 mm (IPC-2221 B2)',
      'Via keep-out':     'Avoid vias on HV nets',
      'Creepage':         '≥6.4 mm at 250VAC',
    },
    snippet: `(net_class "HV"
  (clearance 1.5)
  (trace_width 0.5)
  (via_dia 1.2)
  (via_drill 0.8)
  (add_net "MAINS_L")
  (add_net "MAINS_N")
)`,
  },
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800) })
      }}
      style={{
        fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
        padding: '5px 12px', border: '1px solid var(--border)',
        background: copied ? 'var(--accent3)' : 'var(--bg3)',
        color: copied ? 'var(--bg)' : 'var(--text-dim)',
        borderRadius: '2px', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
      }}
    >
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  )
}

function NetClassPresets() {
  const [selected, setSelected] = useState(0)
  const preset = NET_CLASS_PRESETS[selected]

  return (
    <div>
      {/* Preset selector */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {NET_CLASS_PRESETS.map((p, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '7px 14px', borderRadius: '2px', cursor: 'pointer',
            border: `1px solid ${selected === i ? p.color : 'var(--border)'}`,
            background: selected === i ? `color-mix(in srgb, ${p.color} 10%, var(--panel))` : 'var(--panel)',
            color: selected === i ? p.color : 'var(--text-dim)',
            transition: 'all 0.15s',
          }}>{p.name}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Rules table */}
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
            {preset.name} — Rules
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', lineHeight: 1.5 }}>{preset.desc}</div>
          {Object.entries(preset.rules).map(([k, v], i, arr) => (
            <div key={k} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', fontSize: '12px',
              background: i % 2 === 0 ? 'var(--bg3)' : 'var(--panel)',
              borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>{k}</span>
              <span style={{ fontFamily: 'var(--mono)', color: preset.color }}>{v}</span>
            </div>
          ))}
        </div>

        {/* KiCad snippet */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              KiCad .kicad_pcb snippet
            </div>
            <CopyBtn text={preset.snippet} />
          </div>
          <pre style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: '2px',
            padding: '14px',
            fontFamily: 'var(--mono)',
            fontSize: '11px',
            color: 'var(--accent3)',
            lineHeight: 1.8,
            overflowX: 'auto',
            whiteSpace: 'pre',
          }}>{preset.snippet}</pre>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px', lineHeight: 1.5 }}>
            Paste into your <code style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>.kicad_pcb</code> file inside the <code style={{ color: 'var(--accent)', fontFamily: 'var(--mono)' }}>board_setup</code> section, or use <strong>File → Board Setup → Net Classes</strong> to set manually.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// VIA-IN-PAD EXPLAINER
// ─────────────────────────────────────────────────────────────────

const VIP_SCENARIOS = [
  {
    title: 'Standard via next to pad',
    status: 'recommended',
    statusLabel: '✓ Best Practice',
    color: 'var(--accent3)',
    desc: 'Place the via adjacent to the pad, connected by a short trace. Solder mask covers the via. This is the default approach and works for all component types.',
    rules: ['Via outside pad boundary', 'Short connecting trace ≤ 0.5mm for decoupling caps', 'No special fab instructions needed', 'Works for all pitches'],
  },
  {
    title: 'Via-in-pad (non-filled)',
    status: 'caution',
    statusLabel: '⚠ Use with caution',
    color: 'var(--accent4)',
    desc: 'Via drilled through a SMD pad. Solder can wick down into the via barrel, causing insufficient solder joints and tombstoning on small components.',
    rules: ['Avoid on 0402 and smaller passives', 'Avoid on fine-pitch ICs (< 0.5mm)', 'May cause solder starvation', 'No extra fab cost, but reliability risk'],
  },
  {
    title: 'Via-in-pad (filled & capped)',
    status: 'ok',
    statusLabel: '✓ OK — specify to fab',
    color: 'var(--accent)',
    desc: 'Via is filled with epoxy resin and copper-plated over. Flat surface allows reliable soldering. Required for BGA, QFN, fine-pitch devices where space is limited.',
    rules: ['Specify "via fill + planarization" in fab notes', 'Adds ~$15–30 to order cost (JLC: IPC Class 2)', 'Required for BGA and 0.4mm pitch QFN', 'Fills listed as "VIPPO" or "filled via" by fabs'],
  },
  {
    title: 'Thermal via array (under pad)',
    status: 'ok',
    statusLabel: '✓ Standard practice',
    color: 'var(--accent2)',
    desc: 'Array of small vias (0.3mm drill) under exposed pad of QFN/DFN/power ICs to conduct heat to inner/bottom ground planes.',
    rules: ['Use 0.3mm drill, 0.6mm pad, 4–9 vias typical', 'Tent vias on bottom side to prevent solder wicking', 'Specify "tented vias" in fab notes or apply solder mask', 'KiCad: place on F.Cu, tent in Pad Properties'],
  },
]

function ViaInPadExplainer() {
  const [selected, setSelected] = useState(0)
  const s = VIP_SCENARIOS[selected]

  return (
    <div>
      {/* Scenario selector */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {VIP_SCENARIOS.map((sc, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '0.5px',
            padding: '7px 14px', borderRadius: '2px', cursor: 'pointer',
            border: `1px solid ${selected === i ? sc.color : 'var(--border)'}`,
            background: selected === i ? `color-mix(in srgb, ${sc.color} 10%, var(--panel))` : 'var(--panel)',
            color: selected === i ? sc.color : 'var(--text-dim)',
            transition: 'all 0.15s',
          }}>{sc.title}</button>
        ))}
      </div>

      <div style={{
        background: 'var(--panel)',
        border: `1px solid color-mix(in srgb, ${s.color} 25%, var(--border))`,
        borderLeft: `4px solid ${s.color}`,
        borderRadius: '2px',
        padding: '20px 24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'var(--cond)', fontSize: '18px', fontWeight: 700, color: 'var(--text-bright)' }}>{s.title}</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: s.color, border: `1px solid ${s.color}`, borderRadius: '2px', padding: '3px 10px', flexShrink: 0, marginLeft: '12px' }}>
            {s.statusLabel}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '16px' }}>{s.desc}</p>

        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
          Key Rules
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {s.rules.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text)', padding: '6px 0', borderBottom: i < s.rules.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ color: s.color, flexShrink: 0, fontFamily: 'var(--mono)' }}>→</span>
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COMBINED COMPONENT
// ─────────────────────────────────────────────────────────────────

const TOOLS = [
  { id: 'fuse',     label: 'Fuse Sizing',       icon: '⚡' },
  { id: 'vdiv',     label: 'Voltage Divider',   icon: '÷' },
  { id: 'opamp',    label: 'Op-Amp',            icon: '▷' },
  { id: 'netclass', label: 'Net Class Presets',  icon: '◻' },
  { id: 'vip',      label: 'Via-in-Pad',         icon: '◎' },
]

export default function DesignTools() {
  const [tool, setTool] = useState('fuse')

  return (
    <div className="fade-in">
      <div className="section-title">Design Tools</div>
      <p className="section-desc">Fuse sizing, voltage divider, op-amp circuits, net class presets, and via-in-pad guidance.</p>

      {/* Tool tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: '1px solid var(--border)' }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={{
            fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '10px 18px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: tool === t.id ? 'var(--accent2)' : 'var(--text-dim)',
            borderBottom: tool === t.id ? '2px solid var(--accent2)' : '2px solid transparent',
            marginBottom: '-1px', transition: 'color 0.15s',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}
          onMouseEnter={e => { if (tool !== t.id) e.currentTarget.style.color = 'var(--hover-text)' }}
          onMouseLeave={e => { if (tool !== t.id) e.currentTarget.style.color = 'var(--text-dim)' }}
          >
            <span style={{ fontSize: '12px', opacity: tool === t.id ? 1 : 0.5 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tool === 'fuse'     && <FuseCalculator />}
      {tool === 'vdiv'     && <VDivCalculator />}
      {tool === 'opamp'    && <OpAmpCalculator />}
      {tool === 'netclass' && <NetClassPresets />}
      {tool === 'vip'      && <ViaInPadExplainer />}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// VOLTAGE DIVIDER CALCULATOR
// IPC-2221A Section 6.3 — resistor network design guidelines
// ─────────────────────────────────────────────────────────────────

// E24 standard resistor series
const E24 = [
  1.0,1.1,1.2,1.3,1.5,1.6,1.8,2.0,2.2,2.4,2.7,3.0,
  3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1,
]
const DECADES = [1,10,100,1000,10000,100000]

function getE24Values() {
  const vals = []
  for (const d of DECADES) for (const e of E24) vals.push(parseFloat((e * d).toPrecision(3)))
  return vals
}
const E24_ALL = getE24Values()

function formatR(r) {
  if (r >= 1e6) return `${(r/1e6).toPrecision(3)}MΩ`
  if (r >= 1e3) return `${(r/1e3).toPrecision(3)}kΩ`
  return `${r.toPrecision(3)}Ω`
}

// Find best E24 pair for desired ratio Vout/Vin
// Vout = Vin × R2 / (R1 + R2)  →  ratio = R2/(R1+R2)  →  R1/R2 = (1-ratio)/ratio
function findBestPair(vin, vout, loadOhms) {
  const ratio = vout / vin
  if (ratio <= 0 || ratio >= 1) return null
  const targetRatio = (1 - ratio) / ratio  // R1/R2

  let best = null
  let bestErr = Infinity

  for (const r2 of E24_ALL) {
    const r1ideal = targetRatio * r2
    // Find nearest E24 for R1
    let nearestR1 = E24_ALL[0], nearestErr = Infinity
    for (const v of E24_ALL) {
      const e = Math.abs(v - r1ideal) / r1ideal
      if (e < nearestErr) { nearestErr = e; nearestR1 = v }
    }
    const r1 = nearestR1

    // Actual Vout with load
    const r2eff = loadOhms ? (r2 * loadOhms) / (r2 + loadOhms) : r2
    const actualVout = vin * r2eff / (r1 + r2eff)
    const err = Math.abs(actualVout - vout) / vout * 100

    // IPC-2221A: total divider impedance should be < load/10 for accuracy
    const totalR = r1 + r2

    if (err < bestErr) {
      bestErr = err
      best = { r1, r2, actualVout, err, totalR,
        current: vin / (r1 + r2),
        power_r1: (vin - actualVout) ** 2 / r1,
        power_r2: actualVout ** 2 / r2,
      }
    }
  }
  return best
}

function CopyBtn2({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(()=>setCopied(false),1800) }) }}
      style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase',
        padding:'4px 10px', border:'1px solid var(--border)', background: copied ? 'var(--accent3)' : 'var(--bg3)',
        color: copied ? 'var(--bg)' : 'var(--text-dim)', borderRadius:'2px', cursor:'pointer', transition:'all 0.2s' }}>
      {copied ? '✓' : '⎘'}
    </button>
  )
}

function VDivCalculator() {
  const [vin,   setVin]   = useState(5.0)
  const [vout,  setVout]  = useState(3.3)
  const [load,  setLoad]  = useState(100000)  // 100kΩ default (high-impedance ADC)
  const [noLoad, setNoLoad] = useState(false)

  const result = findBestPair(vin, vout, noLoad ? Infinity : load)
  const ratio  = vout / vin
  const valid  = vin > 0 && vout > 0 && vout < vin

  // IPC-2221A compliance check
  const ipcOk  = result && (result.totalR <= (noLoad ? Infinity : load / 10))
  const ipcMsg = !result ? '' : ipcOk
    ? 'IPC-2221A ✓ — divider impedance is ≤ load/10'
    : `IPC-2221A ⚠ — divider impedance too high vs load. Reduce R values for better accuracy.`

  return (
    <div>
      <p style={{ fontSize:'13px', color:'var(--text)', lineHeight:1.7, marginBottom:'20px' }}>
        Finds the best E24 standard resistor pair for your voltage divider. Accounts for load impedance.
        IPC-2221A recommends the divider Thevenin impedance be ≤ 1/10th of the load for &lt;1% error.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>

        {/* Inputs */}
        <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px' }}>

          {/* Circuit diagram SVG */}
          <svg viewBox="0 0 220 160" style={{ width:'100%', marginBottom:'16px' }}>
            {/* Vin top */}
            <line x1="40" y1="20" x2="40" y2="50" stroke="var(--accent)" strokeWidth="1.5"/>
            <text x="20" y="18" fontFamily="monospace" fontSize="10" fill="var(--accent)">Vin</text>
            {/* R1 box */}
            <rect x="28" y="50" width="24" height="40" fill="var(--bg3)" stroke="var(--accent4)" strokeWidth="1.5" rx="2"/>
            <text x="40" y="74" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="var(--accent4)">R1</text>
            <text x="60" y="74" fontFamily="monospace" fontSize="8" fill="var(--text-dim)">{result ? formatR(result.r1) : '—'}</text>
            {/* mid wire */}
            <line x1="40" y1="90" x2="40" y2="110" stroke="var(--accent2)" strokeWidth="1.5"/>
            {/* Vout tap */}
            <line x1="40" y1="110" x2="100" y2="110" stroke="var(--accent2)" strokeWidth="1.5" strokeDasharray="3,2"/>
            <text x="104" y="114" fontFamily="monospace" fontSize="10" fill="var(--accent2)">Vout</text>
            {/* R2 box */}
            <rect x="28" y="110" width="24" height="40" fill="var(--bg3)" stroke="var(--accent3)" strokeWidth="1.5" rx="2"/>
            <text x="40" y="134" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="var(--accent3)">R2</text>
            <text x="60" y="134" fontFamily="monospace" fontSize="8" fill="var(--text-dim)">{result ? formatR(result.r2) : '—'}</text>
            {/* GND */}
            <line x1="40" y1="150" x2="40" y2="155" stroke="var(--text-dim)" strokeWidth="1.5"/>
            <line x1="28" y1="155" x2="52" y2="155" stroke="var(--text-dim)" strokeWidth="1.5"/>
            <line x1="32" y1="158" x2="48" y2="158" stroke="var(--text-dim)" strokeWidth="1"/>
            <line x1="36" y1="161" x2="44" y2="161" stroke="var(--text-dim)" strokeWidth="0.7"/>
            <text x="57" y="159" fontFamily="monospace" fontSize="9" fill="var(--text-dim)">GND</text>
            {/* Load (optional) */}
            {!noLoad && <>
              <line x1="100" y1="110" x2="160" y2="110" stroke="var(--text-dim)" strokeWidth="1" strokeDasharray="3,2"/>
              <rect x="148" y="95" width="24" height="30" fill="var(--bg3)" stroke="var(--text-dim)" strokeWidth="1" rx="2"/>
              <text x="160" y="113" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--text-dim)">R_L</text>
              <line x1="160" y1="125" x2="160" y2="155" stroke="var(--text-dim)" strokeWidth="1"/>
              <line x1="152" y1="155" x2="168" y2="155" stroke="var(--text-dim)" strokeWidth="1"/>
            </>}
          </svg>

          {[
            { label:'Input Voltage (Vin)', val:vin, set:setVin, min:0.1, max:50, step:0.1, unit:'V', color:'var(--accent)' },
            { label:'Desired Output (Vout)', val:vout, set:setVout, min:0.1, max:49.9, step:0.1, unit:'V', color:'var(--accent2)' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom:'14px' }}>
              <label style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:'10px',
                letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:'6px' }}>
                <span>{f.label}</span>
                <span style={{ color: f.color }}>{f.val} {f.unit}</span>
              </label>
              <div style={{ display:'flex', gap:'8px' }}>
                <input type="range" min={f.min} max={f.max} step={f.step} value={f.val}
                  onChange={e => f.set(Number(e.target.value))} style={{ flex:1, cursor:'pointer' }} />
                <input type="number" min={f.min} max={f.max} step={f.step} value={f.val}
                  onChange={e => f.set(Number(e.target.value))}
                  style={{ width:'64px', fontFamily:'var(--mono)', fontSize:'12px', padding:'4px 6px',
                    background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px',
                    color:'var(--text)', outline:'none', textAlign:'right' }} />
              </div>
            </div>
          ))}

          <div style={{ marginBottom:'14px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}>
              <label style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text-dim)' }}>
                Load Impedance
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:'6px', fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', cursor:'pointer' }}>
                <input type="checkbox" checked={noLoad} onChange={e => setNoLoad(e.target.checked)} />
                No load
              </label>
            </div>
            {!noLoad && (
              <div style={{ display:'flex', gap:'8px' }}>
                <input type="range" min={1000} max={10000000} step={1000} value={load}
                  onChange={e => setLoad(Number(e.target.value))} style={{ flex:1, cursor:'pointer' }} />
                <input type="number" min={1000} max={10000000} step={1000} value={load}
                  onChange={e => setLoad(Number(e.target.value))}
                  style={{ width:'80px', fontFamily:'var(--mono)', fontSize:'12px', padding:'4px 6px',
                    background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px',
                    color:'var(--text)', outline:'none', textAlign:'right' }} />
              </div>
            )}
            <div style={{ display:'flex', gap:'8px', marginTop:'8px', flexWrap:'wrap' }}>
              {[[10e3,'10kΩ'],[100e3,'100kΩ'],[1e6,'1MΩ']].map(([v,l]) => (
                <button key={l} onClick={() => { setLoad(v); setNoLoad(false) }} style={{
                  fontFamily:'var(--mono)', fontSize:'10px', padding:'4px 10px', borderRadius:'2px', cursor:'pointer',
                  border:`1px solid ${load===v&&!noLoad ? 'var(--accent)':'var(--border)'}`,
                  background: load===v&&!noLoad ? 'var(--tab-active-bg)':'var(--bg3)',
                  color: load===v&&!noLoad ? 'var(--accent)':'var(--text-dim)',
                }}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {!valid && (
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px', padding:'16px', color:'var(--accent2)', fontFamily:'var(--mono)', fontSize:'12px' }}>
              Vout must be less than Vin and greater than 0
            </div>
          )}

          {valid && result && <>
            {/* R1 / R2 result boxes */}
            {[
              { label:'R1 (top resistor)', val:result.r1, color:'var(--accent4)' },
              { label:'R2 (bottom resistor)', val:result.r2, color:'var(--accent3)' },
            ].map(r => (
              <div key={r.label} style={{ background:'var(--bg3)', border:`1px solid color-mix(in srgb, ${r.color} 25%, var(--border))`,
                borderLeft:`3px solid ${r.color}`, borderRadius:'2px', padding:'14px 16px' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px' }}>{r.label}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'28px', fontWeight:700, color:r.color }}>{formatR(r.val)}</span>
                  <CopyBtn2 text={formatR(r.val)} />
                </div>
              </div>
            ))}

            {/* Actual Vout */}
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderLeft:'3px solid var(--accent2)', borderRadius:'2px', padding:'14px 16px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px' }}>Actual Vout (with load)</div>
              <div style={{ fontFamily:'var(--mono)', fontSize:'24px', fontWeight:700, color:'var(--accent2)' }}>
                {result.actualVout.toFixed(4)} V
                <span style={{ fontSize:'12px', color: result.err < 1 ? 'var(--accent3)' : result.err < 5 ? 'var(--accent4)' : 'var(--accent2)', marginLeft:'12px' }}>
                  {result.err < 0.1 ? '< 0.1' : result.err.toFixed(2)}% error
                </span>
              </div>
            </div>

            {/* Stats grid */}
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px' }}>Operating Parameters</div>
              {[
                ['Divider current', `${(result.current * 1000).toFixed(3)} mA`],
                ['Power in R1',     `${(result.power_r1 * 1000).toFixed(2)} mW`],
                ['Power in R2',     `${(result.power_r2 * 1000).toFixed(2)} mW`],
                ['Total R (Thévenin)', formatR(result.totalR)],
                ['Voltage ratio',   `${(ratio * 100).toFixed(1)}%`],
              ].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', padding:'5px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontFamily:'var(--mono)', color:'var(--text-dim)' }}>{k}</span>
                  <span style={{ fontFamily:'var(--mono)', color:'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* IPC-2221A check */}
            <div style={{ background: ipcOk ? 'color-mix(in srgb, var(--accent3) 6%, var(--panel))' : 'color-mix(in srgb, var(--accent4) 6%, var(--panel))',
              border:`1px solid ${ipcOk ? 'color-mix(in srgb, var(--accent3) 25%, var(--border))' : 'color-mix(in srgb, var(--accent4) 25%, var(--border))'}`,
              borderLeft:`3px solid ${ipcOk ? 'var(--accent3)':'var(--accent4)'}`,
              borderRadius:'2px', padding:'12px 16px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color: ipcOk ? 'var(--accent3)':'var(--accent4)', lineHeight:1.6 }}>{ipcMsg}</div>
            </div>
          </>}
        </div>
      </div>

      <div className="callout tip" style={{ marginTop:'20px' }}>
        <strong>IPC-2221A rule:</strong> For a resistive divider driving a load, the Thévenin resistance (R1 ∥ R2) should be ≤ R_load / 10 to keep loading error below 1%. For ADC inputs use the highest practical R values to minimize current draw, but keep Thévenin R below the ADC's input impedance / 10.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// OP-AMP CALCULATOR
// ─────────────────────────────────────────────────────────────────

const OPAMP_MODES = [
  { id: 'inv',     label: 'Inverting Amp',       icon: '−' },
  { id: 'noninv',  label: 'Non-Inverting Amp',   icon: '+' },
  { id: 'diff',    label: 'Difference Amp',      icon: '±' },
  { id: 'integ',   label: 'Integrator',          icon: '∫' },
  { id: 'lpf',     label: 'Active Low-Pass',     icon: '∿' },
]

function OpAmpCalculator() {
  const [mode, setMode]   = useState('inv')
  const [rf,   setRf]     = useState(100)   // kΩ
  const [rin,  setRin]    = useState(10)    // kΩ
  const [r1,   setR1]     = useState(10)    // kΩ
  const [r2,   setR2]     = useState(10)    // kΩ
  const [cf,   setCf]     = useState(10)    // nF
  const [vin,  setVin]    = useState(1.0)   // V

  // Results per mode
  const gain_inv    = -(rf / rin)
  const gain_noninv = 1 + (rf / rin)
  const gain_diff   = rf / r1  // assumes matched R1=R2, Rf=Rg
  const vout_inv    = gain_inv * vin
  const vout_noninv = gain_noninv * vin
  const vout_diff   = gain_diff * vin

  // Integrator: fc = 1/(2π·Rin·Cf)  unity-gain at fc
  const fc_integ = 1 / (2 * Math.PI * rin * 1e3 * cf * 1e-9)
  // LPF: fc = 1/(2π·Rf·Cf), passband gain = 1 + Rf2/Rin (simplified Sallen-Key)
  const fc_lpf   = 1 / (2 * Math.PI * rf * 1e3 * cf * 1e-9)

  function fmtFreq(f) {
    if (f >= 1e6) return `${(f/1e6).toFixed(2)} MHz`
    if (f >= 1e3) return `${(f/1e3).toFixed(2)} kHz`
    return `${f.toFixed(1)} Hz`
  }

  const SliderR = ({ label, val, set, min=1, max=1000, step=1, unit='kΩ', color='var(--accent)' }) => (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:'10px',
        letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:'6px' }}>
        <span>{label}</span>
        <span style={{ color }}>{val} {unit}</span>
      </label>
      <div style={{ display:'flex', gap:'8px' }}>
        <input type="range" min={min} max={max} step={step} value={val}
          onChange={e => set(Number(e.target.value))} style={{ flex:1, cursor:'pointer' }} />
        <input type="number" min={min} max={max} step={step} value={val}
          onChange={e => set(Number(e.target.value))}
          style={{ width:'64px', fontFamily:'var(--mono)', fontSize:'12px', padding:'4px 6px',
            background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px',
            color:'var(--text)', outline:'none', textAlign:'right' }} />
      </div>
    </div>
  )

  const ResultRow = ({ label, value, color='var(--text)', mono=true }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text-dim)' }}>{label}</span>
      <span style={{ fontFamily: mono ? 'var(--mono)':'var(--sans)', fontSize:'14px', fontWeight:600, color }}>{value}</span>
    </div>
  )

  // SVG diagrams per mode
  const diagrams = {
    inv: (
      <svg viewBox="0 0 240 120" style={{ width:'100%' }}>
        {/* Op-amp triangle */}
        <polygon points="110,30 110,90 160,60" fill="var(--bg3)" stroke="var(--accent)" strokeWidth="1.5"/>
        <text x="125" y="57" fontFamily="monospace" fontSize="9" fill="var(--accent)">−</text>
        <text x="125" y="73" fontFamily="monospace" fontSize="9" fill="var(--accent)">+</text>
        {/* Vin → Rin → inv input */}
        <line x1="10" y1="48" x2="60" y2="48" stroke="var(--accent2)" strokeWidth="1.5"/>
        <rect x="60" y="40" width="30" height="16" fill="var(--bg3)" stroke="var(--accent4)" strokeWidth="1.5" rx="1"/>
        <text x="75" y="52" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--accent4)">Rin</text>
        <line x1="90" y1="48" x2="110" y2="48" stroke="var(--accent2)" strokeWidth="1.5"/>
        <text x="6" y="46" fontFamily="monospace" fontSize="9" fill="var(--accent2)">Vin</text>
        {/* Non-inv to GND */}
        <line x1="110" y1="72" x2="90" y2="72" stroke="var(--text-dim)" strokeWidth="1.5"/>
        <line x1="90" y1="72" x2="90" y2="105" stroke="var(--text-dim)" strokeWidth="1.5"/>
        <line x1="82" y1="105" x2="98" y2="105" stroke="var(--text-dim)" strokeWidth="1.5"/>
        <line x1="85" y1="108" x2="95" y2="108" stroke="var(--text-dim)" strokeWidth="0.8"/>
        {/* Rf feedback */}
        <line x1="160" y1="60" x2="190" y2="60" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="190" y1="60" x2="190" y2="30" stroke="var(--accent3)" strokeWidth="1.5"/>
        <rect x="160" y="20" width="30" height="16" fill="var(--bg3)" stroke="var(--accent3)" strokeWidth="1.5" rx="1"/>
        <text x="175" y="32" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--accent3)">Rf</text>
        <line x1="190" y1="30" x2="100" y2="30" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="100" y1="30" x2="100" y2="48" stroke="var(--accent3)" strokeWidth="1.5"/>
        {/* Vout */}
        <line x1="190" y1="60" x2="230" y2="60" stroke="var(--accent2)" strokeWidth="1.5"/>
        <text x="200" y="55" fontFamily="monospace" fontSize="9" fill="var(--accent2)">Vout</text>
      </svg>
    ),
    noninv: (
      <svg viewBox="0 0 240 120" style={{ width:'100%' }}>
        <polygon points="110,30 110,90 160,60" fill="var(--bg3)" stroke="var(--accent)" strokeWidth="1.5"/>
        <text x="125" y="57" fontFamily="monospace" fontSize="9" fill="var(--accent)">−</text>
        <text x="125" y="73" fontFamily="monospace" fontSize="9" fill="var(--accent)">+</text>
        {/* Vin → non-inv */}
        <line x1="10" y1="72" x2="110" y2="72" stroke="var(--accent2)" strokeWidth="1.5"/>
        <text x="6" y="70" fontFamily="monospace" fontSize="9" fill="var(--accent2)">Vin</text>
        {/* Rin to GND */}
        <line x1="90" y1="48" x2="90" y2="30" stroke="var(--text-dim)" strokeWidth="1.5"/>
        <rect x="75" y="10" width="30" height="16" fill="var(--bg3)" stroke="var(--accent4)" strokeWidth="1.5" rx="1"/>
        <text x="90" y="22" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--accent4)">Rin</text>
        <line x1="90" y1="10" x2="90" y2="2" stroke="var(--text-dim)" strokeWidth="1.5"/>
        <line x1="84" y1="2" x2="96" y2="2" stroke="var(--text-dim)" strokeWidth="1.5"/>
        {/* Rf feedback */}
        <line x1="160" y1="60" x2="190" y2="60" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="190" y1="60" x2="190" y2="30" stroke="var(--accent3)" strokeWidth="1.5"/>
        <rect x="160" y="20" width="30" height="16" fill="var(--bg3)" stroke="var(--accent3)" strokeWidth="1.5" rx="1"/>
        <text x="175" y="32" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--accent3)">Rf</text>
        <line x1="190" y1="30" x2="100" y2="30" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="100" y1="30" x2="100" y2="48" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="100" y1="48" x2="110" y2="48" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="190" y1="60" x2="230" y2="60" stroke="var(--accent2)" strokeWidth="1.5"/>
        <text x="200" y="55" fontFamily="monospace" fontSize="9" fill="var(--accent2)">Vout</text>
      </svg>
    ),
    diff: (
      <svg viewBox="0 0 240 130" style={{ width:'100%' }}>
        <polygon points="110,25 110,95 160,60" fill="var(--bg3)" stroke="var(--accent)" strokeWidth="1.5"/>
        <text x="125" y="52" fontFamily="monospace" fontSize="9" fill="var(--accent)">−</text>
        <text x="125" y="78" fontFamily="monospace" fontSize="9" fill="var(--accent)">+</text>
        {/* V1 → R1 → inv */}
        <line x1="10" y1="43" x2="55" y2="43" stroke="var(--accent2)" strokeWidth="1.5"/>
        <rect x="55" y="35" width="25" height="16" fill="var(--bg3)" stroke="var(--accent4)" strokeWidth="1.5" rx="1"/>
        <text x="67" y="47" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--accent4)">R1</text>
        <line x1="80" y1="43" x2="110" y2="43" stroke="var(--accent2)" strokeWidth="1.5"/>
        <text x="4" y="40" fontFamily="monospace" fontSize="9" fill="var(--accent2)">V1</text>
        {/* V2 → R2 → noninv */}
        <line x1="10" y1="77" x2="55" y2="77" stroke="var(--accent)" strokeWidth="1.5"/>
        <rect x="55" y="69" width="25" height="16" fill="var(--bg3)" stroke="var(--accent4)" strokeWidth="1.5" rx="1"/>
        <text x="67" y="81" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--accent4)">R2</text>
        <line x1="80" y1="77" x2="110" y2="77" stroke="var(--accent)" strokeWidth="1.5"/>
        <text x="4" y="74" fontFamily="monospace" fontSize="9" fill="var(--accent)">V2</text>
        {/* Rf */}
        <line x1="160" y1="60" x2="190" y2="60" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="190" y1="60" x2="190" y2="25" stroke="var(--accent3)" strokeWidth="1.5"/>
        <rect x="158" y="12" width="30" height="16" fill="var(--bg3)" stroke="var(--accent3)" strokeWidth="1.5" rx="1"/>
        <text x="173" y="24" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--accent3)">Rf</text>
        <line x1="188" y1="12" x2="92" y2="12" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="92" y1="12" x2="92" y2="43" stroke="var(--accent3)" strokeWidth="1.5"/>
        <line x1="190" y1="60" x2="230" y2="60" stroke="var(--accent2)" strokeWidth="1.5"/>
        <text x="198" y="55" fontFamily="monospace" fontSize="9" fill="var(--accent2)">Vout</text>
        {/* Rg to GND */}
        <line x1="92" y1="77" x2="92" y2="95" stroke="var(--text-dim)" strokeWidth="1.5"/>
        <rect x="80" y="95" width="25" height="14" fill="var(--bg3)" stroke="var(--text-dim)" strokeWidth="1" rx="1"/>
        <text x="92" y="106" textAnchor="middle" fontFamily="monospace" fontSize="8" fill="var(--text-dim)">Rg</text>
        <line x1="92" y1="109" x2="92" y2="120" stroke="var(--text-dim)" strokeWidth="1.5"/>
        <line x1="85" y1="120" x2="99" y2="120" stroke="var(--text-dim)" strokeWidth="1.5"/>
      </svg>
    ),
  }

  return (
    <div>
      {/* Mode selector */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
        {OPAMP_MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase',
            padding:'8px 14px', border:'none', background:'transparent', cursor:'pointer',
            color: mode===m.id ? 'var(--accent)':'var(--text-dim)',
            borderBottom: mode===m.id ? '2px solid var(--accent)':'2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s',
            display:'flex', alignItems:'center', gap:'6px',
          }}
          onMouseEnter={e => { if(mode!==m.id) e.currentTarget.style.color='var(--hover-text)' }}
          onMouseLeave={e => { if(mode!==m.id) e.currentTarget.style.color='var(--text-dim)' }}
          >
            <span style={{ fontSize:'13px', fontWeight:700 }}>{m.icon}</span>{m.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>

        {/* Inputs */}
        <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px' }}>

          {/* Circuit diagram */}
          {diagrams[mode] && (
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px', padding:'12px', marginBottom:'16px' }}>
              {diagrams[mode]}
            </div>
          )}
          {!diagrams[mode] && (
            <div style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px', padding:'12px 16px', marginBottom:'16px', fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text-dim)' }}>
              {mode==='integ' && 'Rf = integrator feedback resistor · Cf = capacitor · Rin = input resistor'}
              {mode==='lpf'   && 'Rf = feedback resistor · Cf = filter capacitor · Rin = input resistor'}
            </div>
          )}

          {/* Common inputs */}
          <SliderR label="Rf (feedback)" val={rf} set={setRf} min={1} max={2000} step={1} unit="kΩ" color="var(--accent3)" />

          {(mode==='inv'||mode==='noninv'||mode==='integ'||mode==='lpf') &&
            <SliderR label="Rin (input)" val={rin} set={setRin} min={1} max={1000} step={1} unit="kΩ" color="var(--accent4)" />
          }
          {mode==='diff' && <>
            <SliderR label="R1 (V1 input)" val={r1} set={setR1} min={1} max={1000} step={1} unit="kΩ" color="var(--accent4)" />
            <SliderR label="R2 (V2 input, =Rg)" val={r2} set={setR2} min={1} max={1000} step={1} unit="kΩ" color="var(--accent)" />
          </>}
          {(mode==='integ'||mode==='lpf') &&
            <SliderR label="Cf (capacitor)" val={cf} set={setCf} min={1} max={10000} step={1} unit="nF" color="var(--accent2)" />
          }
          {(mode==='inv'||mode==='noninv'||mode==='diff') && (
            <SliderR label="Vin" val={vin} set={setVin} min={-24} max={24} step={0.1} unit="V" color="var(--accent2)" />
          )}
        </div>

        {/* Results */}
        <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'14px' }}>Results</div>

          {mode==='inv' && <>
            <ResultRow label="Voltage Gain" value={`${gain_inv.toFixed(3)}×`} color={Math.abs(gain_inv)>1 ? 'var(--accent2)':'var(--accent3)'} />
            <ResultRow label="Vout" value={`${vout_inv.toFixed(4)} V`} color="var(--accent2)" />
            <ResultRow label="Input impedance" value={formatR(rin * 1e3)} />
            <ResultRow label="Phase shift" value="180° (inverted)" />
            <ResultRow label="Bandwidth (GBW/|gain|)" value={`GBW ÷ ${Math.abs(gain_inv).toFixed(1)}×`} />
            <div className="callout tip" style={{ marginTop:'14px', fontSize:'12px' }}>
              Gain = −Rf/Rin. Input tied to virtual ground. For precision: match R_bias = Rin ∥ Rf on non-inverting input.
            </div>
          </>}

          {mode==='noninv' && <>
            <ResultRow label="Voltage Gain" value={`${gain_noninv.toFixed(3)}×`} color="var(--accent3)" />
            <ResultRow label="Vout" value={`${vout_noninv.toFixed(4)} V`} color="var(--accent2)" />
            <ResultRow label="Input impedance" value="Very high (MΩ–GΩ)" />
            <ResultRow label="Phase shift" value="0° (non-inverting)" />
            <ResultRow label="Bandwidth" value={`GBW ÷ ${gain_noninv.toFixed(1)}×`} />
            <div className="callout tip" style={{ marginTop:'14px', fontSize:'12px' }}>
              Gain = 1 + Rf/Rin. High input impedance — ideal as buffer or first stage. Unity gain: short Rf, open Rin.
            </div>
          </>}

          {mode==='diff' && <>
            <ResultRow label="Gain (Rf/R1)" value={`${gain_diff.toFixed(3)}×`} color="var(--accent3)" />
            <ResultRow label="Vout = Gain × (V2−V1)" value={`${vout_diff.toFixed(4)} V`} color="var(--accent2)" />
            <ResultRow label="CMRR (matched Rs)" value="High — depends on resistor matching" />
            <ResultRow label="Resistor matching req." value="Use 0.1% tolerance for best CMRR" />
            <div className="callout tip" style={{ marginTop:'14px', fontSize:'12px' }}>
              For best CMRR: R1=R2, Rf=Rg exactly. Use 0.1% metal film resistors. For high-CMRR use an INA (instrumentation amp) instead.
            </div>
          </>}

          {mode==='integ' && <>
            <ResultRow label="Unity-gain frequency" value={fmtFreq(fc_integ)} color="var(--accent)" />
            <ResultRow label="Rin" value={formatR(rin * 1e3)} />
            <ResultRow label="Cf" value={`${cf} nF`} />
            <ResultRow label="Time constant τ" value={`${(rin*1e3*cf*1e-9*1e3).toFixed(3)} ms`} />
            <div className="callout tip" style={{ marginTop:'14px', fontSize:'12px' }}>
              Vout = −(1/RC) × ∫Vin dt. Add a large feedback resistor (≥10×Rin) in parallel with Cf to prevent DC saturation. fc = 1/(2π·Rin·Cf).
            </div>
          </>}

          {mode==='lpf' && <>
            <ResultRow label="Cutoff frequency (−3dB)" value={fmtFreq(fc_lpf)} color="var(--accent)" />
            <ResultRow label="Passband gain" value={`${(1 + rf/rin).toFixed(3)}×`} color="var(--accent3)" />
            <ResultRow label="Rf" value={formatR(rf * 1e3)} />
            <ResultRow label="Cf" value={`${cf} nF`} />
            <ResultRow label="Roll-off" value="−20 dB/decade (1st order)" />
            <div className="callout tip" style={{ marginTop:'14px', fontSize:'12px' }}>
              fc = 1/(2π·Rf·Cf). Passband gain = 1 + Rf2/Rin. For sharper rolloff use a 2nd-order Sallen-Key filter.
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}