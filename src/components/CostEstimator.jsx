import { useState, useMemo } from 'react'

// ─────────────────────────────────────────────────────────────────
// PRICING MODELS (approximate as of 2025)
// Always verify at the fab's own site before ordering.
// Indian fab prices in INR; international in USD.
// ─────────────────────────────────────────────────────────────────

const USD_TO_INR = 84  // approximate

// ── International fabs (USD) ──────────────────────────────────────

function estimateJLCPCB({ w, h, layers, qty, finish, thickness, color }) {
  const area = (w * h) / 100
  let base = qty <= 5  ? 2 : qty <= 10 ? 3.8 : qty <= 30 ? 8 : qty <= 100 ? 20 : qty * 0.28
  if (layers === 4) base += qty <= 10 ? 12 : qty * 0.45
  if (layers === 6) base += qty <= 10 ? 30 : qty * 1.2
  if (layers >= 8)  base += qty <= 10 ? 60 : qty * 2.5
  if (area > 100)   base += (area - 100) * 0.015 * qty
  if (finish === 'ENIG')      base += qty <= 10 ? 5 : qty * 0.08
  if (finish === 'Hard Gold') base += qty * 0.5
  if (thickness !== 1.6)      base += 5
  if (color !== 'Green')      base += qty <= 10 ? 2 : 5
  return { name:'JLCPCB', flag:'🌐', region:'China', currency:'USD', total:base, unit:base/qty, ship:3.5, lead:'3–7 days', url:'https://jlcpcb.com', note:"World's cheapest prototype fab. Fast DHL shipping to India.", accentColor:'var(--accent)' }
}

function estimatePCBWay({ w, h, layers, qty, finish, thickness, color }) {
  const area = (w * h) / 100
  let base = qty <= 5 ? 5 : qty <= 10 ? 8 : qty <= 30 ? 18 : qty <= 100 ? 40 : qty * 0.45
  if (layers === 4) base += qty <= 10 ? 18 : qty * 0.6
  if (layers === 6) base += qty <= 10 ? 45 : qty * 1.8
  if (layers >= 8)  base += qty <= 10 ? 90 : qty * 3.5
  if (area > 100)   base += (area - 100) * 0.02 * qty
  if (finish === 'ENIG')      base += qty <= 10 ? 8 : qty * 0.12
  if (finish === 'Hard Gold') base += qty * 0.8
  if (thickness !== 1.6)      base += 8
  if (color !== 'Green')      base += qty <= 10 ? 3 : 6
  return { name:'PCBWay', flag:'🌐', region:'China', currency:'USD', total:base, unit:base/qty, ship:5, lead:'5–10 days', url:'https://www.pcbway.com', note:'More options than JLCPCB. Good for RF and special materials.', accentColor:'var(--accent2)' }
}

function estimateOSHPark({ w, h, layers, qty }) {
  const areaIn2 = (w * h) / 645.16
  const rateMap = { 2:5, 4:10, 6:15, 8:20 }
  const rate    = rateMap[Math.min(layers,8)] || 20
  const panels  = Math.ceil(qty/3)
  const total   = areaIn2 * panels * 3 * rate
  return { name:'OSHPark', flag:'🇺🇸', region:'USA', currency:'USD', total, unit:total/(panels*3), ship:0, lead:'12–16 days', url:'https://oshpark.com', note:'US-made. Sells in multiples of 3. Free US shipping.', accentColor:'var(--accent4)' }
}

// ── Indian fabs (INR) ─────────────────────────────────────────────

function estimateLionCircuits({ w, h, layers, qty, finish, thickness, color }) {
  const area = (w * h) / 100
  let ppb = layers === 2 ? Math.max(50, area * 1.5) : layers === 4 ? Math.max(180, area * 4.5) : Math.max(350, area * 8)
  const qf = qty <= 5 ? 1.4 : qty <= 10 ? 1.2 : qty <= 25 ? 1.0 : qty <= 50 ? 0.88 : qty <= 100 ? 0.75 : 0.6
  let total = ppb * qty * qf
  if (finish === 'ENIG')       total += qty * 80
  if (finish === 'Hard Gold')  total += qty * 200
  if (thickness !== 1.6)       total += 300
  if (color !== 'Green')       total += qty * 30
  return { name:'LionCircuits', flag:'🇮🇳', region:'Bengaluru, India', currency:'INR', total, unit:total/qty, ship: qty <= 10 ? 120 : 0, lead:'7–15 days', url:'https://www.lioncircuits.com', note:'Leading Indian fab. Instant online quote. ISO 9001. 2–6 layer. PCBA available.', accentColor:'#FF9933' }
}

function estimatePCBPower({ w, h, layers, qty, finish, thickness, color }) {
  const area = (w * h) / 100
  let ppb = layers === 2 ? Math.max(60, area * 1.8) : layers === 4 ? Math.max(200, area * 5.5) : Math.max(400, area * 10)
  const qf = qty <= 5 ? 1.5 : qty <= 10 ? 1.25 : qty <= 25 ? 1.05 : qty <= 50 ? 0.90 : qty <= 100 ? 0.78 : 0.65
  let total = ppb * qty * qf
  if (finish === 'ENIG')       total += qty * 90
  if (finish === 'Hard Gold')  total += qty * 220
  if (thickness !== 1.6)       total += 400
  if (color !== 'Green')       total += qty * 35
  return { name:'PCBPower', flag:'🇮🇳', region:'Gandhinagar, India', currency:'INR', total, unit:total/qty, ship:150, lead:'7–14 days', url:'https://www.pcbpower.com', note:'Est. 1996. Industrial grade. Up to 12 layers. GST invoice provided.', accentColor:'#138808' }
}

function estimateRobu({ w, h, layers, qty, finish, thickness, color }) {
  const area = (w * h) / 100
  let ppb = layers === 2 ? Math.max(45, area * 1.3) : layers === 4 ? Math.max(160, area * 4.0) : Math.max(300, area * 7)
  const qf = qty <= 5 ? 1.6 : qty <= 10 ? 1.35 : qty <= 25 ? 1.1 : qty <= 50 ? 0.92 : qty <= 100 ? 0.80 : 0.65
  let total = ppb * qty * qf
  if (finish === 'ENIG')       total += qty * 70
  if (finish === 'Hard Gold')  total += qty * 180
  if (thickness !== 1.6)       total += 250
  if (color !== 'Green')       total += qty * 25
  return { name:'Robu.in', flag:'🇮🇳', region:'Mumbai, India', currency:'INR', total, unit:total/qty, ship:80, lead:'10–20 days', url:'https://robu.in', note:'Popular with Indian makers & hobbyists. COD available. Wide colour selection.', accentColor:'#FF9933' }
}

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const fmtUSD = n => `$${Math.max(0, n).toFixed(2)}`
const fmtINR = n => `₹${Math.max(0, Math.round(n)).toLocaleString('en-IN')}`
const fmt = (n, cur) => cur === 'INR' ? fmtINR(n) : fmtUSD(n)
const toUSD = r => { const t = r.total + r.ship; return r.currency === 'INR' ? t / USD_TO_INR : t }

function display(r, showCur) {
  if (showCur === 'INR' && r.currency === 'USD')
    return { ...r, dTotal: r.total * USD_TO_INR, dUnit: r.unit * USD_TO_INR, dShip: r.ship * USD_TO_INR, dCur: 'INR' }
  if (showCur === 'USD' && r.currency === 'INR')
    return { ...r, dTotal: r.total / USD_TO_INR, dUnit: r.unit / USD_TO_INR, dShip: r.ship / USD_TO_INR, dCur: 'USD' }
  return { ...r, dTotal: r.total, dUnit: r.unit, dShip: r.ship, dCur: r.currency }
}

const COLORS      = ['Green','Black','Blue','Red','White','Yellow']
const FINISHES    = ['HASL','Lead-free HASL','ENIG','Hard Gold']
const THICKNESSES = [0.6,0.8,1.0,1.2,1.6,2.0]
const LAYER_OPT   = [2,4,6,8]

// ─────────────────────────────────────────────────────────────────
// UI ATOMS
// ─────────────────────────────────────────────────────────────────

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:'16px' }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'2px', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:'6px' }}>{label}</div>
      {children}
    </div>
  )
}

function Chips({ options, value, onChange }) {
  return (
    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
      {options.map(opt => {
        const v = typeof opt === 'object' ? opt.value : opt
        const l = typeof opt === 'object' ? opt.label : String(opt)
        const on = value === v
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            fontFamily:'var(--mono)', fontSize:'11px', padding:'5px 12px',
            border:`1px solid ${on ? 'var(--accent)':'var(--border)'}`,
            background: on ? 'var(--tab-active-bg)':'var(--bg3)',
            color: on ? 'var(--accent)':'var(--text-dim)',
            borderRadius:'2px', cursor:'pointer', transition:'all 0.15s',
          }}>{l}</button>
        )
      })}
    </div>
  )
}

function NumBox({ label, value, onChange, min, max, unit }) {
  return (
    <div>
      {label && <div style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text-dim)', marginBottom:'6px' }}>{label}</div>}
      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
        <input type="number" min={min} max={max} value={value}
          onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
          style={{ width:'80px', fontFamily:'var(--mono)', fontSize:'14px', padding:'7px 10px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px', color:'var(--text)', outline:'none', textAlign:'center' }} />
        <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text-dim)' }}>{unit}</span>
      </div>
    </div>
  )
}

function FabCard({ result, rank, showCur }) {
  const d = display(result, showCur)
  const rankColors = ['var(--accent3)','var(--accent)','var(--accent4)','var(--text-dim)','var(--text-dim)','var(--text-dim)']
  const rc = rankColors[rank] || 'var(--text-dim)'
  const isIndian = result.currency === 'INR'

  return (
    <div style={{
      background: rank === 0 ? 'color-mix(in srgb, var(--accent3) 5%, var(--panel))' : 'var(--panel)',
      border: `1px solid ${rank===0 ? 'color-mix(in srgb, var(--accent3) 30%, var(--border))' : isIndian ? `color-mix(in srgb, ${result.accentColor} 35%, var(--border))` : 'var(--border)'}`,
      borderLeft: `3px solid ${isIndian ? result.accentColor : rank===0 ? 'var(--accent3)' : 'transparent'}`,
      borderRadius:'2px', padding:'14px 16px', position:'relative',
    }}>
      {rank === 0 && (
        <div style={{ position:'absolute', top:'10px', right:'12px', fontFamily:'var(--mono)', fontSize:'9px', letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--accent3)', border:'1px solid var(--accent3)', borderRadius:'2px', padding:'2px 7px' }}>
          Cheapest
        </div>
      )}

      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
        <span style={{ fontSize:'16px' }}>{result.flag}</span>
        <div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'13px', fontWeight:700, color:rc }}>{result.name}</div>
          <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)' }}>{result.region} · {result.lead}</div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'8px' }}>
        {[['Total', fmt(d.dTotal, d.dCur)], ['Per board', fmt(d.dUnit, d.dCur)], ['Shipping', d.dShip === 0 ? 'Free' : fmt(d.dShip, d.dCur)]].map(([k,v]) => (
          <div key={k}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', marginBottom:'2px' }}>{k}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'13px', fontWeight:600, color:'var(--text-bright)' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', borderTop:'1px solid var(--border)', paddingTop:'8px' }}>
        <span style={{ fontSize:'11px', color:'var(--text-dim)', lineHeight:1.5, flex:1 }}>{result.note}</span>
        <a href={result.url} target="_blank" rel="noopener noreferrer"
          style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--accent)', border:'1px solid var(--accent)', borderRadius:'2px', padding:'3px 8px', textDecoration:'none', marginLeft:'10px', flexShrink:0 }}>
          Quote →
        </a>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────

export default function CostEstimator() {
  const [w,          setW]         = useState(50)
  const [h,          setH]         = useState(50)
  const [layers,     setLayers]    = useState(2)
  const [qty,        setQty]       = useState(10)
  const [finish,     setFinish]    = useState('HASL')
  const [thickness,  setThick]     = useState(1.6)
  const [color,      setColor]     = useState('Green')
  const [showCur,    setShowCur]   = useState('INR')
  const [showIndian, setShowIndian]= useState(true)
  const [showIntl,   setShowIntl]  = useState(true)

  const params = { w, h, layers, qty, finish, thickness, color }

  const results = useMemo(() => {
    const indian = showIndian ? [estimateLionCircuits(params), estimatePCBPower(params), estimateRobu(params)] : []
    const intl   = showIntl   ? [estimateJLCPCB(params), estimatePCBWay(params), estimateOSHPark(params)] : []
    return [...indian, ...intl].sort((a,b) => toUSD(a) - toUSD(b))
  }, [w,h,layers,qty,finish,thickness,color,showIndian,showIntl])

  const maxUSD  = Math.max(...results.map(toUSD), 1)
  const areaCm2 = ((w*h)/100).toFixed(0)
  const areaIn2 = ((w*h)/645.16).toFixed(2)

  return (
    <div className="fade-in">
      <div className="section-title">PCB Cost Estimator</div>
      <p className="section-desc">Price comparison across Indian and international fabs. Always verify on the fab's own calculator before ordering.</p>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(280px,340px) 1fr', gap:'20px', alignItems:'start' }}>

        {/* Inputs */}
        <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px' }}>
          <Field label="Board Size">
            <div style={{ display:'flex', gap:'10px', alignItems:'flex-end' }}>
              <NumBox label="Width" value={w} onChange={setW} min={5} max={500} unit="mm" />
              <span style={{ fontFamily:'var(--mono)', fontSize:'16px', color:'var(--text-dim)', paddingBottom:'8px' }}>×</span>
              <NumBox label="Height" value={h} onChange={setH} min={5} max={500} unit="mm" />
            </div>
            <div style={{ marginTop:'6px', fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text-dim)' }}>{areaCm2} cm² · {areaIn2} in²</div>
          </Field>
          <Field label="Layers"><Chips options={LAYER_OPT} value={layers} onChange={setLayers} /></Field>
          <Field label="Quantity">
            <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
              <NumBox value={qty} onChange={setQty} min={1} max={10000} unit="pcs" />
              <div style={{ display:'flex', gap:'5px', flexWrap:'wrap' }}>
                {[5,10,25,50,100].map(q => (
                  <button key={q} onClick={() => setQty(q)} style={{ fontFamily:'var(--mono)', fontSize:'11px', padding:'5px 9px', border:`1px solid ${qty===q ? 'var(--accent2)':'var(--border)'}`, background: qty===q ? 'color-mix(in srgb, var(--accent2) 10%, var(--bg3))':'var(--bg3)', color: qty===q ? 'var(--accent2)':'var(--text-dim)', borderRadius:'2px', cursor:'pointer' }}>{q}</button>
                ))}
              </div>
            </div>
          </Field>
          <Field label="Surface Finish"><Chips options={FINISHES} value={finish} onChange={setFinish} /></Field>
          <Field label="Board Thickness"><Chips options={THICKNESSES.map(t => ({ value:t, label:`${t}mm` }))} value={thickness} onChange={setThick} /></Field>
          <Field label="Solder Mask Color"><Chips options={COLORS} value={color} onChange={setColor} /></Field>

          {/* Currency + filter */}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:'14px', marginTop:'4px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>Display</div>
            <div style={{ display:'flex', gap:'6px', marginBottom:'10px', alignItems:'center' }}>
              {['INR','USD'].map(c => (
                <button key={c} onClick={() => setShowCur(c)} style={{ fontFamily:'var(--mono)', fontSize:'11px', padding:'5px 14px', border:`1px solid ${showCur===c ? 'var(--accent)':'var(--border)'}`, background: showCur===c ? 'var(--tab-active-bg)':'var(--bg3)', color: showCur===c ? 'var(--accent)':'var(--text-dim)', borderRadius:'2px', cursor:'pointer' }}>
                  {c} {c==='INR' ? '₹':'$'}
                </button>
              ))}
              <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)' }}>1 USD ≈ ₹{USD_TO_INR}</span>
            </div>
            <div style={{ display:'flex', gap:'12px' }}>
              {[['showIndian', showIndian, setShowIndian, '🇮🇳 Indian'], ['showIntl', showIntl, setShowIntl, '🌐 International']].map(([k,v,s,lbl]) => (
                <label key={k} style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', fontFamily:'var(--mono)', fontSize:'11px', color: v ? 'var(--text)':'var(--text-dim)' }}>
                  <input type="checkbox" checked={v} onChange={e => s(e.target.checked)} />{lbl}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div>
          {results.length === 0 ? (
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'24px', fontFamily:'var(--mono)', fontSize:'12px', color:'var(--text-dim)' }}>
              Select at least one fab group to compare.
            </div>
          ) : (
            <>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px' }}>
                {results.map((r,i) => <FabCard key={r.name} result={r} rank={i} showCur={showCur} />)}
              </div>

              {/* Bar chart */}
              <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 18px', marginBottom:'14px' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px' }}>Relative Cost (USD equivalent, incl. shipping)</div>
                {results.map((r,i) => {
                  const usd = toUSD(r)
                  const d   = display(r, showCur)
                  const barColors = ['var(--accent3)','var(--accent)','var(--accent4)','var(--accent2)','var(--text-dim)','var(--text-dim)']
                  return (
                    <div key={r.name} style={{ marginBottom:'9px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)', fontSize:'11px', marginBottom:'3px' }}>
                        <span style={{ color:'var(--text-dim)' }}>{r.flag} {r.name}</span>
                        <span style={{ color:barColors[i] }}>{fmt(d.dTotal + d.dShip, d.dCur)}</span>
                      </div>
                      <div style={{ height:'5px', background:'var(--bg3)', borderRadius:'3px', overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${(usd/maxUSD)*100}%`, background:barColors[i], borderRadius:'3px', transition:'width 0.4s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* India advantages panel */}
              {showIndian && (
                <div style={{ background:'var(--panel)', border:'1px solid color-mix(in srgb, #FF9933 30%, var(--border))', borderLeft:'3px solid #FF9933', borderRadius:'2px', padding:'14px 18px' }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'#FF9933', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>🇮🇳 Why use Indian fabs?</div>
                  {['No import duty or customs delays — saves ₹500–2000+ on small orders','INR pricing with GST invoice — easy company reimbursement','IST timezone support — faster response than China/US fabs','LionCircuits & PCBPower offer PCB assembly (PCBA) in India too','Robu.in: COD available, good for individuals without credit cards','Ideal for Make in India, startup, and university lab projects'].map((p,i,arr) => (
                    <div key={i} style={{ display:'flex', gap:'10px', fontSize:'12px', color:'var(--text)', padding:'4px 0', borderBottom: i<arr.length-1 ? '1px solid var(--border)':'none', lineHeight:1.6 }}>
                      <span style={{ color:'#FF9933', flexShrink:0 }}>→</span>{p}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="callout warn" style={{ marginTop:'18px' }}>
        Estimates only — actual prices change frequently. Indian prices exclude GST (18%). International prices may incur Indian import duty. Always verify at the fab's own site before paying.
      </div>
    </div>
  )
}