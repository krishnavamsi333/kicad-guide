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
  { id: 'netclass', label: 'Net Class Presets',  icon: '◻' },
  { id: 'vip',      label: 'Via-in-Pad',         icon: '◎' },
]

export default function DesignTools() {
  const [tool, setTool] = useState('fuse')

  return (
    <div className="fade-in">
      <div className="section-title">Design Tools</div>
      <p className="section-desc">Fuse sizing, net class rule presets, and via-in-pad guidance.</p>

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
      {tool === 'netclass' && <NetClassPresets />}
      {tool === 'vip'      && <ViaInPadExplainer />}
    </div>
  )
}