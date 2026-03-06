import { useState, useCallback } from 'react'

// ── Impedance Formulas (IPC-2141A) ─────────────────────────────────

// Microstrip: single-ended
function calcMicrostrip(W, H, T, Er) {
  // W, H, T in mm; Er = dielectric constant
  const Weff = W + (T / Math.PI) * Math.log((4 * Math.E) / Math.sqrt(Math.pow(T / H, 2) + Math.pow(T / (Math.PI * W), 2)))
  const Z = (87 / Math.sqrt(Er + 1.41)) * Math.log((5.98 * H) / (0.8 * Weff + T))
  return Math.max(1, Z).toFixed(1)
}

// Stripline: single-ended (centered)
function calcStripline(W, B, T, Er) {
  // B = total dielectric thickness
  const Z = (60 / Math.sqrt(Er)) * Math.log((4 * B) / (0.67 * Math.PI * (0.8 * W + T)))
  return Math.max(1, Z).toFixed(1)
}

// Differential microstrip
function calcDiffMicrostrip(W, H, T, Er, S) {
  const Z0 = parseFloat(calcMicrostrip(W, H, T, Er))
  const Zdiff = 2 * Z0 * (1 - 0.347 * Math.exp(-2.9 * S / H))
  return Math.max(1, Zdiff).toFixed(1)
}

// Differential stripline
function calcDiffStripline(W, B, T, Er, S) {
  const Z0 = parseFloat(calcStripline(W, B, T, Er))
  const Zdiff = 2 * Z0 * (1 - 0.374 * Math.exp(-2.9 * S / (B / 2)))
  return Math.max(1, Zdiff).toFixed(1)
}

// Common target impedances
const TARGETS = [
  { label: 'USB 2.0 diff', Z: 90, type: 'diff' },
  { label: 'USB 3.0 diff', Z: 90, type: 'diff' },
  { label: 'HDMI diff',    Z: 100, type: 'diff' },
  { label: 'PCIe diff',    Z: 85, type: 'diff' },
  { label: 'RF / coax',   Z: 50, type: 'single' },
  { label: 'DDR signal',  Z: 50, type: 'single' },
]

const MODES = ['Microstrip', 'Stripline', 'Diff Microstrip', 'Diff Stripline']

// ── Shared UI ──────────────────────────────────────────────────────

function NumInput({ label, unit, value, onChange, min, max, step, hint }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '1.5px',
        textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px',
      }}>
        <span>{label} {hint && <span style={{ opacity: 0.6, fontSize: '10px' }}>— {hint}</span>}</span>
        <span style={{ color: 'var(--accent)' }}>{value} {unit}</span>
      </label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1, cursor: 'pointer' }}
        />
        <input
          type="number" min={min} max={max} step={step} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            width: '72px', fontFamily: 'var(--mono)', fontSize: '13px',
            padding: '5px 8px', background: 'var(--bg3)',
            border: '1px solid var(--border)', borderRadius: '2px',
            color: 'var(--text)', outline: 'none',
            textAlign: 'right',
          }}
        />
      </div>
    </div>
  )
}

function ImpedanceGauge({ value, target = 50 }) {
  const Z = parseFloat(value)
  const diff = Math.abs(Z - target)
  const pct = diff / target

  const color = pct < 0.05 ? 'var(--accent3)'
    : pct < 0.1  ? 'var(--accent4)'
    : pct < 0.2  ? 'var(--accent2)'
    : 'var(--red)'

  const label = pct < 0.05 ? 'Within 5% ✓'
    : pct < 0.1  ? 'Within 10%'
    : pct < 0.2  ? 'Within 20%'
    : `Off by ${Math.round(pct * 100)}%`

  return (
    <div style={{
      background: 'var(--bg3)',
      border: `1px solid color-mix(in srgb, ${color} 25%, var(--border))`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '2px',
      padding: '18px 20px',
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px' }}>
            Characteristic Impedance
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '36px', fontWeight: 700, color, lineHeight: 1 }}>
            {value}<span style={{ fontSize: '16px', marginLeft: '4px', opacity: 0.7 }}>Ω</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '4px' }}>vs {target}Ω target</div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color }}>{label}</div>
        </div>
      </div>

      {/* Deviation bar */}
      <div style={{ marginTop: '14px' }}>
        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
          {/* Center marker */}
          <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'var(--accent3)', opacity: 0.5 }} />
          {/* Indicator */}
          <div style={{
            position: 'absolute',
            left: `${Math.min(95, Math.max(5, 50 + ((Z - target) / target) * 50))}%`,
            top: '-2px', bottom: '-2px',
            width: '4px', background: color, borderRadius: '2px',
            transform: 'translateX(-50%)',
            transition: 'left 0.3s ease',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' }}>
          <span>Low</span>
          <span style={{ color: 'var(--accent3)' }}>{target}Ω</span>
          <span>High</span>
        </div>
      </div>
    </div>
  )
}

// ── SVG cross-section diagrams ─────────────────────────────────────
// Fixed colors: explicit hex values that work in both light + dark themes
// Copper = amber #c8860a (readable on both), dielectric = blue-tinted fill

const DIAG = {
  copper:     '#b87333',   // copper brown — theme-neutral, universally recognisable
  copperText: '#c8860a',
  gnd:        '#8a6a1a',
  diel:       '#1a6fa0',   // blue = FR4 / glass-epoxy association
  dielFill:   'rgba(26,111,160,0.12)',
  dimText:    '#7a9aaa',
  accentLine: '#0097b2',
}

function MicrostripDiagram({ W, H, T }) {
  const scale = 40 / Math.max(W, H, 1)
  const w = Math.min(120, W * scale * 8)
  const h = Math.min(50, H * scale * 8)
  const t = Math.max(4, T * scale * 8)
  const svgH = 110
  const gndY = 82
  return (
    <svg width="220" height={svgH} style={{ display: 'block', margin: '0 auto', overflow: 'visible' }}>
      {/* Dielectric layer */}
      <rect x="18" y={gndY - h} width="164" height={h} fill={DIAG.dielFill} stroke={DIAG.diel} strokeWidth="0.5" strokeOpacity="0.4" rx="1" />
      {/* H dimension line */}
      <line x1="190" y1={gndY} x2="190" y2={gndY - h} stroke={DIAG.accentLine} strokeWidth="1" opacity="0.5" />
      <line x1="187" y1={gndY} x2="193" y2={gndY} stroke={DIAG.accentLine} strokeWidth="1" opacity="0.5" />
      <line x1="187" y1={gndY - h} x2="193" y2={gndY - h} stroke={DIAG.accentLine} strokeWidth="1" opacity="0.5" />
      <text x="198" y={gndY - h / 2 + 4} fontFamily="monospace" fontSize="9" fill={DIAG.accentLine}>H</text>
      {/* Ground plane */}
      <rect x="18" y={gndY} width="164" height="8" fill={DIAG.gnd} rx="1" />
      <text x="100" y={gndY + 18} textAnchor="middle" fontFamily="monospace" fontSize="9" fill={DIAG.dimText}>GND plane</text>
      {/* Copper trace */}
      <rect x={100 - w / 2} y={gndY - h - t} width={w} height={t} fill={DIAG.copper} rx="1" />
      <text x="100" y={gndY - h - t - 4} textAnchor="middle" fontFamily="monospace" fontSize="9" fill={DIAG.copperText}>W={W}mm</text>
    </svg>
  )
}

function StriplineDiagram({ W, B, T }) {
  const w = Math.min(120, W * 30)
  const b = Math.min(60, B * 15)
  const t = Math.max(4, T * 15)
  return (
    <svg width="220" height="120" style={{ display: 'block', margin: '0 auto' }}>
      {/* Dielectric */}
      <rect x="18" y={85 - b} width="164" height={b} fill={DIAG.dielFill} stroke={DIAG.diel} strokeWidth="0.5" strokeOpacity="0.4" rx="1" />
      {/* Bottom ground */}
      <rect x="18" y="85" width="164" height="7" fill={DIAG.gnd} rx="1" />
      {/* Top ground */}
      <rect x="18" y={85 - b - 7} width="164" height="7" fill={DIAG.gnd} rx="1" />
      {/* Trace (centered in dielectric) */}
      <rect x={100 - w / 2} y={85 - b / 2 - t / 2} width={w} height={t} fill={DIAG.copper} rx="1" />
      <text x="100" y="105" textAnchor="middle" fontFamily="monospace" fontSize="9" fill={DIAG.dimText}>Stripline (buried)</text>
      <text x="100" y={85 - b / 2 - t / 2 - 4} textAnchor="middle" fontFamily="monospace" fontSize="9" fill={DIAG.copperText}>W={W}mm</text>
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────

export default function ImpedanceCalculator() {
  const [mode, setMode]       = useState('Microstrip')
  const [W, setW]             = useState(0.2)    // trace width mm
  const [H, setH]             = useState(0.2)    // dielectric height mm
  const [T, setT]             = useState(0.035)  // trace thickness mm (1oz)
  const [Er, setEr]           = useState(4.5)    // FR4 default
  const [B, setB]             = useState(0.4)    // stripline total thickness
  const [S, setS]             = useState(0.2)    // diff pair spacing
  const [target, setTarget]   = useState(50)

  const isDiff = mode.startsWith('Diff')
  const isStrip = mode.includes('Stripline')

  const Z = mode === 'Microstrip'      ? calcMicrostrip(W, H, T, Er)
    : mode === 'Stripline'             ? calcStripline(W, B, T, Er)
    : mode === 'Diff Microstrip'       ? calcDiffMicrostrip(W, H, T, Er, S)
    : /* Diff Stripline */               calcDiffStripline(W, B, T, Er, S)

  return (
    <div className="fade-in">
      <div className="section-title">Impedance Calculator</div>
      <p className="section-desc">
        Controlled impedance for microstrip &amp; stripline — IPC-2141A formulas. Adjust parameters to hit your target.
      </p>

      {/* Target quick-select */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '10px' }}>
          Common Targets
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {TARGETS.map(t => (
            <button
              key={t.label}
              onClick={() => {
                setTarget(t.Z)
                if (t.type === 'diff' && !isDiff) setMode('Diff Microstrip')
                if (t.type === 'single' && isDiff) setMode('Microstrip')
              }}
              style={{
                fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px',
                padding: '5px 12px', borderRadius: '2px', cursor: 'pointer',
                border: `1px solid ${target === t.Z ? 'var(--accent2)' : 'var(--border)'}`,
                background: target === t.Z ? 'color-mix(in srgb, var(--accent2) 12%, var(--panel))' : 'var(--panel)',
                color: target === t.Z ? 'var(--accent2)' : 'var(--text-dim)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (target !== t.Z) { e.currentTarget.style.borderColor = 'var(--hover-border)'; e.currentTarget.style.color = 'var(--hover-text)' } }}
              onMouseLeave={e => { if (target !== t.Z) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)' } }}
            >
              {t.label} <span style={{ opacity: 0.6 }}>{t.Z}Ω</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '24px', alignItems: 'start' }}>
        {/* Left: inputs */}
        <div>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {MODES.map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase',
                padding: '7px 12px', border: 'none', background: 'transparent', cursor: 'pointer',
                color: mode === m ? 'var(--accent)' : 'var(--text-dim)',
                borderBottom: mode === m ? '2px solid var(--accent)' : '2px solid transparent',
                marginBottom: '-1px', transition: 'color 0.15s',
              }}
              onMouseEnter={e => { if (mode !== m) e.currentTarget.style.color = 'var(--hover-text)' }}
              onMouseLeave={e => { if (mode !== m) e.currentTarget.style.color = 'var(--text-dim)' }}
              >{m}</button>
            ))}
          </div>

          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '24px' }}>
            <NumInput label="Trace Width" unit="mm" value={W} onChange={setW} min={0.05} max={5} step={0.05} hint="W" />
            {!isStrip && <NumInput label="Dielectric Height" unit="mm" value={H} onChange={setH} min={0.05} max={2} step={0.05} hint="H" />}
            {isStrip  && <NumInput label="Total Diel. Thickness" unit="mm" value={B} onChange={setB} min={0.1} max={3} step={0.05} hint="B" />}
            <NumInput label="Trace Thickness" unit="mm" value={T} onChange={setT} min={0.01} max={0.2} step={0.005} hint="T" />
            <NumInput label="Dielectric Constant (Er)" unit="" value={Er} onChange={setEr} min={2} max={12} step={0.1} hint="FR4≈4.5" />
            {isDiff && <NumInput label="Pair Spacing" unit="mm" value={S} onChange={setS} min={0.05} max={2} step={0.05} hint="S (edge-to-edge)" />}

            {/* Er quick-select */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Material Presets
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'FR4', er: 4.5 },
                  { label: 'Rogers 4003', er: 3.55 },
                  { label: 'Rogers 4350', er: 3.66 },
                  { label: 'Isola IS400', er: 4.07 },
                ].map(mat => (
                  <button key={mat.label} onClick={() => setEr(mat.er)} style={{
                    fontFamily: 'var(--mono)', fontSize: '10px', padding: '4px 10px',
                    border: `1px solid ${Er === mat.er ? 'var(--accent)' : 'var(--border)'}`,
                    background: Er === mat.er ? 'var(--tab-active-bg)' : 'var(--bg3)',
                    color: Er === mat.er ? 'var(--accent)' : 'var(--text-dim)',
                    borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {mat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: result + diagram */}
        <div>
          <ImpedanceGauge value={Z} target={target} />

          {/* Diagram */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Cross-section
            </div>
            {isStrip
              ? <StriplineDiagram W={W} B={B} T={T} />
              : <MicrostripDiagram W={W} H={H} T={T} />
            }
          </div>

          {/* Summary */}
          <div style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '2px', padding: '14px 16px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Parameters
            </div>
            {[
              ['Mode', mode],
              ['W', `${W} mm`],
              isStrip ? ['B (total)', `${B} mm`] : ['H', `${H} mm`],
              ['T', `${T} mm`],
              ['Er', `${Er} (${Er === 4.5 ? 'FR4' : 'custom'})`],
              ...(isDiff ? [['S (spacing)', `${S} mm`]] : []),
              ['Z₀', `${Z} Ω`],
            ].map(([k, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text-dim)' }}>{k}</span>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="callout tip" style={{ marginTop: '24px' }}>
        IPC-2141A formulas. Accuracy is typically ±5–10% vs field solvers. For production boards, verify with your fab's impedance calculator and specify controlled impedance on your fab notes.
      </div>
    </div>
  )
}