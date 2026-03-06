import { useState, useMemo } from 'react'

// ── Pricing models (approximate as of 2025) ────────────────────────
// These are rough estimates — actual prices vary. Users are told this clearly.

function estimateJLCPCB({ w, h, layers, qty, finish, thickness, color }) {
  const area = (w * h) / 100  // cm²
  // Base price tiers
  let base = qty <= 5   ? 2
    : qty <= 10  ? 3.8
    : qty <= 30  ? 8
    : qty <= 100 ? 20
    : qty * 0.28

  // Layer surcharge
  if (layers === 4)  base += qty <= 10 ? 12 : qty * 0.45
  if (layers === 6)  base += qty <= 10 ? 30 : qty * 1.2
  if (layers >= 8)   base += qty <= 10 ? 60 : qty * 2.5

  // Size surcharge (> 100cm²)
  if (area > 100) base += (area - 100) * 0.015 * qty

  // Finish surcharge
  if (finish === 'ENIG') base += qty <= 10 ? 5 : qty * 0.08
  if (finish === 'Hard Gold') base += qty * 0.5

  // Thickness (non-standard)
  if (thickness !== 1.6) base += 5

  // Color (non-standard)
  if (color !== 'Green') base += qty <= 10 ? 2 : 5

  return { total: base, unit: base / qty, ship: 3.5, name: 'JLCPCB' }
}

function estimatePCBWay({ w, h, layers, qty, finish, thickness, color }) {
  const area = (w * h) / 100
  let base = qty <= 5   ? 5
    : qty <= 10  ? 8
    : qty <= 30  ? 18
    : qty <= 100 ? 40
    : qty * 0.45

  if (layers === 4)  base += qty <= 10 ? 18 : qty * 0.6
  if (layers === 6)  base += qty <= 10 ? 45 : qty * 1.8
  if (layers >= 8)   base += qty <= 10 ? 90 : qty * 3.5

  if (area > 100) base += (area - 100) * 0.02 * qty
  if (finish === 'ENIG') base += qty <= 10 ? 8 : qty * 0.12
  if (finish === 'Hard Gold') base += qty * 0.8
  if (thickness !== 1.6) base += 8
  if (color !== 'Green') base += qty <= 10 ? 3 : 6

  return { total: base, unit: base / qty, ship: 5, name: 'PCBWay' }
}

function estimateOSHPark({ w, h, layers, qty }) {
  // OSHPark: $5/in² for 2-layer, $10/in² for 4-layer, $15/in² for 6-layer
  const areaIn2 = (w * h) / 645.16
  const rateMap = { 2: 5, 4: 10, 6: 15, 8: 20 }
  const rate = rateMap[Math.min(layers, 8)] || 20
  const totalArea = areaIn2 * Math.ceil(qty / 3) * 3  // OSHPark sells in multiples of 3
  const total = totalArea * rate
  return { total, unit: total / Math.ceil(qty / 3) / 3, ship: 0, name: 'OSHPark', note: 'Ships in 3s, free ship (US)' }
}

// ── Helpers ────────────────────────────────────────────────────────

function fmt(n) { return `$${Math.max(0, n).toFixed(2)}` }

const COLORS = ['Green', 'Black', 'Blue', 'Red', 'White', 'Yellow']
const FINISHES = ['HASL', 'Lead-free HASL', 'ENIG', 'Hard Gold']
const THICKNESSES = [0.6, 0.8, 1.0, 1.2, 1.6, 2.0]
const LAYER_OPTIONS = [2, 4, 6, 8]

// ── UI components ──────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function ChipSelect({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const val = typeof opt === 'object' ? opt.value : opt
        const lbl = typeof opt === 'object' ? opt.label : String(opt)
        const active = value === val
        return (
          <button key={val} onClick={() => onChange(val)} style={{
            fontFamily: 'var(--mono)', fontSize: '11px', padding: '5px 12px',
            border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
            background: active ? 'var(--tab-active-bg)' : 'var(--bg3)',
            color: active ? 'var(--accent)' : 'var(--text-dim)',
            borderRadius: '2px', cursor: 'pointer', transition: 'all 0.15s',
          }}>{lbl}</button>
        )
      })}
    </div>
  )
}

function NumBox({ label, value, onChange, min, max, unit }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '6px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input type="number" min={min} max={max} value={value}
          onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
          style={{
            width: '80px', fontFamily: 'var(--mono)', fontSize: '14px',
            padding: '7px 10px', background: 'var(--bg3)',
            border: '1px solid var(--border)', borderRadius: '2px',
            color: 'var(--text)', outline: 'none', textAlign: 'center',
          }}
        />
        <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>{unit}</span>
      </div>
    </div>
  )
}

function FabCard({ result, rank }) {
  const rankColors = ['var(--accent3)', 'var(--accent)', 'var(--accent4)']
  const c = rankColors[rank] || 'var(--text-dim)'

  return (
    <div style={{
      background: rank === 0 ? 'color-mix(in srgb, var(--accent3) 5%, var(--panel))' : 'var(--panel)',
      border: `1px solid ${rank === 0 ? 'color-mix(in srgb, var(--accent3) 30%, var(--border))' : 'var(--border)'}`,
      borderRadius: '2px',
      padding: '18px 20px',
      position: 'relative',
    }}>
      {rank === 0 && (
        <div style={{
          position: 'absolute', top: '10px', right: '12px',
          fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '1.5px',
          textTransform: 'uppercase', color: 'var(--accent3)',
          border: '1px solid var(--accent3)', borderRadius: '2px',
          padding: '2px 7px',
        }}>Cheapest</div>
      )}

      <div style={{ fontFamily: 'var(--mono)', fontSize: '16px', fontWeight: 700, color: c, marginBottom: '12px' }}>
        {result.name}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
        {[
          ['Total', fmt(result.total)],
          ['Per board', fmt(result.unit)],
          ['Shipping', result.ship === 0 ? 'Free' : fmt(result.ship)],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', marginBottom: '3px' }}>{k}</div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: 'var(--text-bright)' }}>{v}</div>
          </div>
        ))}
      </div>

      {result.note && (
        <div style={{ fontSize: '11px', color: 'var(--text-dim)', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
          {result.note}
        </div>
      )}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────

export default function CostEstimator() {
  const [w, setW]             = useState(50)
  const [h, setH]             = useState(50)
  const [layers, setLayers]   = useState(2)
  const [qty, setQty]         = useState(10)
  const [finish, setFinish]   = useState('HASL')
  const [thickness, setThick] = useState(1.6)
  const [color, setColor]     = useState('Green')

  const params = { w, h, layers, qty, finish, thickness, color }

  const results = useMemo(() => {
    const r = [
      estimateJLCPCB(params),
      estimatePCBWay(params),
      estimateOSHPark(params),
    ].sort((a, b) => (a.total + a.ship) - (b.total + b.ship))
    return r
  }, [w, h, layers, qty, finish, thickness, color])

  const areaIn2 = ((w * h) / 645.16).toFixed(2)
  const areaCm2 = ((w * h) / 100).toFixed(0)

  return (
    <div className="fade-in">
      <div className="section-title">PCB Cost Estimator</div>
      <p className="section-desc">
        Rough price comparison across major fabs. For accurate quotes, always check the fab's own calculator.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px,380px) 1fr', gap: '28px', alignItems: 'start' }}>

        {/* Inputs */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '24px' }}>

          {/* Board size */}
          <Field label="Board Size">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <NumBox label="Width" value={w} onChange={setW} min={5} max={500} unit="mm" />
              <span style={{ fontFamily: 'var(--mono)', fontSize: '16px', color: 'var(--text-dim)', paddingBottom: '8px' }}>×</span>
              <NumBox label="Height" value={h} onChange={setH} min={5} max={500} unit="mm" />
            </div>
            <div style={{ marginTop: '8px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
              {areaCm2} cm² · {areaIn2} in²
            </div>
          </Field>

          <Field label="Layers">
            <ChipSelect options={LAYER_OPTIONS} value={layers} onChange={setLayers} />
          </Field>

          <Field label="Quantity">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <NumBox label="" value={qty} onChange={setQty} min={1} max={10000} unit="pcs" />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[5, 10, 30, 50, 100].map(q => (
                  <button key={q} onClick={() => setQty(q)} style={{
                    fontFamily: 'var(--mono)', fontSize: '11px', padding: '5px 10px',
                    border: `1px solid ${qty === q ? 'var(--accent2)' : 'var(--border)'}`,
                    background: qty === q ? 'color-mix(in srgb, var(--accent2) 10%, var(--bg3))' : 'var(--bg3)',
                    color: qty === q ? 'var(--accent2)' : 'var(--text-dim)',
                    borderRadius: '2px', cursor: 'pointer',
                  }}>{q}</button>
                ))}
              </div>
            </div>
          </Field>

          <Field label="Surface Finish">
            <ChipSelect options={FINISHES} value={finish} onChange={setFinish} />
          </Field>

          <Field label="Thickness">
            <ChipSelect options={THICKNESSES.map(t => ({ value: t, label: `${t}mm` }))} value={thickness} onChange={setThick} />
          </Field>

          <Field label="Solder Mask Color">
            <ChipSelect options={COLORS} value={color} onChange={setColor} />
          </Field>
        </div>

        {/* Results */}
        <div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {results.map((r, i) => (
              <FabCard key={r.name} result={r} rank={i} />
            ))}
          </div>

          {/* Breakdown bar */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: '2px', padding: '16px 20px' }}>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
              Price Comparison
            </div>
            {results.map((r, i) => {
              const maxTotal = Math.max(...results.map(x => x.total + x.ship))
              const barW = ((r.total + r.ship) / maxTotal) * 100
              const colors = ['var(--accent3)', 'var(--accent)', 'var(--accent4)']
              return (
                <div key={r.name} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-dim)' }}>{r.name}</span>
                    <span style={{ color: colors[i] }}>{fmt(r.total + r.ship)} incl. ship</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${barW}%`, background: colors[i], borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="callout warn" style={{ marginTop: '24px' }}>
        Estimates only — prices change frequently. Always verify on JLCPCB.com, PCBWay.com, and OSHPark.com. Does not include stencil, assembly, or import duties.
      </div>
    </div>
  )
}