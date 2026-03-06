import { useState, useCallback } from 'react'
import OhmCalculator from './OhmCalculator'
import SMDReference  from './SMDReference'

// ── Sub-components ─────────────────────────────────────────────────

function InputRow({ label, unit, value, onChange, min, max, step }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        marginBottom: '8px',
      }}>
        <span>{label}</span>
        <span style={{ color: 'var(--accent)' }}>{value} {unit}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', cursor: 'pointer' }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

function CopyButton({ value, unit }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(() => {
    const text = `${value} ${unit}`
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    }).catch(() => {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }, [value, unit])

  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      style={{
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        padding: '5px 12px',
        border: '1px solid var(--border)',
        background: copied ? 'var(--accent3)' : 'var(--bg3)',
        color: copied ? 'var(--bg)' : 'var(--text-dim)',
        cursor: 'pointer',
        borderRadius: '2px',
        transition: 'background 0.2s, color 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!copied) {
          e.currentTarget.style.borderColor = 'var(--hover-border)'
          e.currentTarget.style.color = 'var(--hover-text)'
        }
      }}
      onMouseLeave={e => {
        if (!copied) {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.color = 'var(--text-dim)'
        }
      }}
    >
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  )
}

function ResultBox({ label, value, unit, color = 'var(--accent)', note }) {
  return (
    <div style={{
      background: 'var(--bg3)',
      border: `1px solid color-mix(in srgb, ${color} 20%, var(--border))`,
      borderLeft: `3px solid ${color}`,
      borderRadius: '2px',
      padding: '16px 20px',
      marginBottom: '12px',
    }}>
      <div style={{
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
        marginBottom: '8px',
      }}>
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '28px', fontWeight: 700, color }}>
          {value}
          <span style={{ fontSize: '14px', marginLeft: '6px', opacity: 0.7 }}>{unit}</span>
        </div>
        <CopyButton value={value} unit={unit} />
      </div>

      {note && (
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '8px', lineHeight: 1.5 }}>
          {note}
        </div>
      )}
    </div>
  )
}

// ── Calculations ───────────────────────────────────────────────────

function calcTraceWidth(current, tempRise, copperOz) {
  const thickness = copperOz * 0.0347
  const area = Math.pow(current / (0.048 * Math.pow(tempRise, 0.44)), 1 / 0.725)
  const width = area / (thickness * 25.4)
  return Math.max(0.1, width).toFixed(3)
}

function calcViaCurrent(drillMm, copperOz, tempRise) {
  const drillMil = drillMm * 39.3701
  const thickness = copperOz * 1.378
  const area = Math.PI * drillMil * thickness
  const current = 0.048 * Math.pow(tempRise, 0.44) * Math.pow(area, 0.725)
  return current.toFixed(2)
}

// ── Sub-tab bar ────────────────────────────────────────────────────

const SUB_TABS = ['Trace Width', 'Via Current', "Ohm's Law", 'SMD Sizes']

function SubTabBar({ active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      flexWrap: 'wrap',
      marginBottom: '28px',
      borderBottom: '1px solid var(--border)',
    }}>
      {SUB_TABS.map(t => {
        const isActive = active === t
        return (
          <button
            key={t}
            onClick={() => onChange(t)}
            style={{
              fontFamily: 'var(--mono)',
              fontSize: '11px',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              padding: '8px 16px',
              border: 'none',
              background: 'transparent',
              color: isActive ? 'var(--accent2)' : 'var(--text-dim)',
              borderBottom: isActive ? '2px solid var(--accent2)' : '2px solid transparent',
              marginBottom: '-1px',
              cursor: 'pointer',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--hover-text)' }}
            onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-dim)' }}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────

export default function TraceCalculator() {
  const [subTab, setSubTab]       = useState('Trace Width')
  const [current, setCurrent]     = useState(1)
  const [tempRise, setTempRise]   = useState(10)
  const [copperOz, setCopperOz]   = useState(1)
  const [viaDrill, setViaDrill]   = useState(0.3)
  const [viaCopper, setViaCopper] = useState(1)
  const [viaTempRise, setViaTempRise] = useState(10)

  const traceWidth = calcTraceWidth(current, tempRise, copperOz)
  const viaCurrent = calcViaCurrent(viaDrill, viaCopper, viaTempRise)

  const traceColor = traceWidth < 0.2  ? 'var(--accent3)'
    : traceWidth < 1   ? 'var(--accent)'
    : traceWidth < 2   ? 'var(--accent4)'
    : 'var(--accent2)'

  const viaColor = viaCurrent < 0.5 ? 'var(--accent2)'
    : viaCurrent < 2  ? 'var(--accent)'
    : 'var(--accent3)'

  return (
    <div className="fade-in">
      <div className="section-title">Calculators</div>
      <p className="section-desc">
        IPC-2221 trace &amp; via calculators, Ohm's Law, and SMD package reference — all in one place.
      </p>

      <SubTabBar active={subTab} onChange={setSubTab} />

      {subTab === 'Trace Width' && (
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '2px',
          padding: '28px',
          maxWidth: '520px',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '24px', lineHeight: 1.6 }}>
            IPC-2221 formula — external copper layer.
          </p>
          <InputRow label="Current"       unit="A"  value={current}  onChange={setCurrent}  min={0.1} max={20}  step={0.1} />
          <InputRow label="Temp Rise"     unit="°C" value={tempRise} onChange={setTempRise} min={5}   max={50}  step={1}   />
          <InputRow label="Copper Weight" unit="oz" value={copperOz} onChange={setCopperOz} min={0.5} max={3}   step={0.5} />
          <ResultBox
            label="Required Trace Width"
            value={traceWidth}
            unit="mm"
            color={traceColor}
            note={`${current}A · ${tempRise}°C rise · ${copperOz}oz copper`}
          />
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 2, marginTop: '4px' }}>
            <span style={{ color: 'var(--accent3)' }}>■</span> &lt;0.2mm signal &nbsp;
            <span style={{ color: 'var(--accent)' }}>■</span> 0.2–1mm power &nbsp;
            <span style={{ color: 'var(--accent4)' }}>■</span> 1–2mm high power &nbsp;
            <span style={{ color: 'var(--accent2)' }}>■</span> &gt;2mm pour
          </div>
        </div>
      )}

      {subTab === 'Via Current' && (
        <div style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '2px',
          padding: '28px',
          maxWidth: '520px',
        }}>
          <p style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '24px', lineHeight: 1.6 }}>
            Maximum current a single via can safely carry.
          </p>
          <InputRow label="Drill Diameter" unit="mm" value={viaDrill}    onChange={setViaDrill}    min={0.1} max={1.0} step={0.05} />
          <InputRow label="Copper Weight"  unit="oz" value={viaCopper}   onChange={setViaCopper}   min={0.5} max={3}   step={0.5}  />
          <InputRow label="Temp Rise"      unit="°C" value={viaTempRise} onChange={setViaTempRise} min={5}   max={50}  step={1}    />
          <ResultBox
            label="Max Via Current"
            value={viaCurrent}
            unit="A"
            color={viaColor}
            note={`${viaDrill}mm drill · pad = ${(viaDrill + 0.4).toFixed(2)}mm`}
          />

          {/* Common via sizes reference */}
          <div style={{
            background: 'var(--bg3)',
            border: '1px solid var(--border)',
            borderRadius: '2px',
            padding: '12px 16px',
            marginTop: '4px',
          }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              color: 'var(--text-dim)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Common Via Sizes
            </div>
            {[
              { drill: 0.3, pad: 0.6, label: 'Standard signal' },
              { drill: 0.4, pad: 0.8, label: 'Power via' },
              { drill: 0.6, pad: 1.0, label: 'High current' },
            ].map((v, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '12px',
                padding: '6px 0',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              }}>
                <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>
                  {v.drill}mm / {v.pad}mm pad
                </span>
                <span style={{ color: 'var(--text-dim)' }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === "Ohm's Law" && <OhmCalculator />}
      {subTab === 'SMD Sizes'  && <SMDReference />}

      <div className="callout tip" style={{ marginTop: '24px' }}>
        All calculations are based on IPC-2221 standard. Always add 20–30% safety margin to your calculated values.
      </div>
    </div>
  )
}