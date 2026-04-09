import { useState, useMemo } from 'react'

// ─────────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────────

const E24 = [1.0,1.1,1.2,1.3,1.5,1.6,1.8,2.0,2.2,2.4,2.7,3.0,
             3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1]
const DECADES = [1,10,100,1000,10000,100000,1000000]

function allE24() {
  const v = []
  for (const d of DECADES) for (const e of E24) v.push(parseFloat((e*d).toPrecision(3)))
  return v
}
const E24_ALL = allE24()

function nearestE24(target) {
  return E24_ALL.reduce((best, v) =>
    Math.abs(v - target) < Math.abs(best - target) ? v : best, E24_ALL[0])
}

function fmtR(r) {
  if (r >= 1e6) return `${(r/1e6).toPrecision(3)} MΩ`
  if (r >= 1e3) return `${(r/1e3).toPrecision(3)} kΩ`
  return `${r.toPrecision(3)} Ω`
}
function fmtF(f) {
  if (f >= 1e6) return `${(f/1e6).toFixed(3)} MHz`
  if (f >= 1e3) return `${(f/1e3).toFixed(3)} kHz`
  return `${f.toFixed(3)} Hz`
}
function fmtT(s) {
  if (s >= 1)      return `${s.toFixed(4)} s`
  if (s >= 1e-3)   return `${(s*1e3).toFixed(4)} ms`
  if (s >= 1e-6)   return `${(s*1e6).toFixed(4)} µs`
  return `${(s*1e9).toFixed(4)} ns`
}
function fmtC(c) {
  if (c >= 1e-3) return `${(c*1e3).toPrecision(3)} mF`
  if (c >= 1e-6) return `${(c*1e6).toPrecision(3)} µF`
  if (c >= 1e-9) return `${(c*1e9).toPrecision(3)} nF`
  return `${(c*1e12).toPrecision(3)} pF`
}

function SliderInput({ label, value, set, min, max, step, unit, color='var(--accent)', logScale=false }) {
  const toSlider = v => logScale ? Math.log10(v) : v
  const fromSlider = v => logScale ? Math.pow(10, v) : v
  return (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--mono)',
        fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase',
        color:'var(--text-dim)', marginBottom:'6px' }}>
        <span>{label}</span>
        <span style={{ color }}>{typeof value === 'number' && value < 0.01 ? value.toExponential(2) : value} {unit}</span>
      </label>
      <div style={{ display:'flex', gap:'8px' }}>
        <input type="range"
          min={logScale ? Math.log10(min) : min}
          max={logScale ? Math.log10(max) : max}
          step={logScale ? 0.001 : step}
          value={toSlider(value)}
          onChange={e => set(parseFloat(fromSlider(e.target.value).toPrecision(3)))}
          style={{ flex:1, cursor:'pointer' }} />
        <input type="number" min={min} max={max} step={step} value={value}
          onChange={e => set(Number(e.target.value))}
          style={{ width:'80px', fontFamily:'var(--mono)', fontSize:'12px', padding:'4px 6px',
            background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px',
            color:'var(--text)', outline:'none', textAlign:'right' }} />
      </div>
    </div>
  )
}

function ResultBox({ label, value, sub, color='var(--accent)', size=28 }) {
  return (
    <div style={{ background:'var(--bg3)', border:`1px solid color-mix(in srgb, ${color} 20%, var(--border))`,
      borderLeft:`3px solid ${color}`, borderRadius:'2px', padding:'12px 16px' }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)',
        letterSpacing:'2px', textTransform:'uppercase', marginBottom:'4px' }}>{label}</div>
      <div style={{ fontFamily:'var(--mono)', fontSize:`${size}px`, fontWeight:700, color, lineHeight:1.2 }}>{value}</div>
      {sub && <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text-dim)', marginTop:'4px' }}>{sub}</div>}
    </div>
  )
}

function StatRow({ label, value, color='var(--text)' }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
      padding:'6px 0', borderBottom:'1px solid var(--border)' }}>
      <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text-dim)' }}>{label}</span>
      <span style={{ fontFamily:'var(--mono)', fontSize:'13px', color }}>{value}</span>
    </div>
  )
}

function FormulaBox({ formula, color='var(--accent3)' }) {
  return (
    <div style={{
      background:'color-mix(in srgb, var(--accent3) 5%, var(--panel))',
      border:`1px solid color-mix(in srgb, ${color} 20%, var(--border))`,
      borderLeft:`3px solid ${color}`, borderRadius:'2px',
      padding:'10px 14px', marginBottom:'12px', fontFamily:'var(--mono)', fontSize:'13px',
      color:'var(--text-bright)', letterSpacing:'0.5px', lineHeight:1.8
    }}>{formula}</div>
  )
}

// ─────────────────────────────────────────────────────────────────
// 1. PWM / RC FILTER CALCULATOR  (unchanged)
// ─────────────────────────────────────────────────────────────────

const COMMON_FREQS = [
  { label:'490 Hz (Arduino default)', f:490 },
  { label:'1 kHz', f:1000 },
  { label:'10 kHz', f:10000 },
  { label:'20 kHz (inaudible)', f:20000 },
  { label:'100 kHz', f:100000 },
]

const STD_CAPS = [10e-12,22e-12,47e-12,100e-12,220e-12,470e-12,
  1e-9,2.2e-9,4.7e-9,10e-9,22e-9,47e-9,100e-9,220e-9,470e-9,
  1e-6,2.2e-6,4.7e-6,10e-6,22e-6,47e-6,100e-6]

function PWMCalculator() {
  const [mode, setMode]       = useState('pwm2dac')
  const [pwmFreq, setPwmFreq] = useState(10000)
  const [duty,    setDuty]    = useState(50)
  const [vcc,     setVcc]     = useState(3.3)
  const [ripple,  setRipple]  = useState(50)
  const [rVal,    setRVal]    = useState(10)
  const [cVal,    setCVal]    = useState(100)

  const vout_ideal = vcc * duty / 100
  const rippleV = ripple / 1000
  const d = duty / 100
  const RC_needed = vcc * d * (1-d) / (pwmFreq * rippleV)
  const R_suggested = nearestE24(Math.sqrt(RC_needed / (2 * Math.PI)) * 1e3)
  const R_ohm = R_suggested * 1e3 > 0 ? R_suggested * 1e3 : 10000
  const C_exact = RC_needed / R_ohm
  const C_standard = STD_CAPS.reduce((b,v) => Math.abs(v - C_exact) < Math.abs(b - C_exact) ? v : b, STD_CAPS[0])
  const fc_single  = 1 / (2 * Math.PI * R_ohm * C_standard)
  const ripple_actual_1 = vcc * d * (1-d) / (pwmFreq * R_ohm * C_standard)
  const ripple_2stage = ripple_actual_1 * Math.pow(fc_single / pwmFreq, 2) * 0.5
  const R_given = rVal * 1e3
  const C_given = cVal * 1e-9
  const fc_given = 1 / (2 * Math.PI * R_given * C_given)
  const ripple_given = vcc * d * (1-d) / (pwmFreq * R_given * C_given)
  const settle_99 = -Math.log(0.01) * R_given * C_given * 1e3
  const settle_given_99 = -Math.log(0.01) * R_ohm * C_standard * 1e3

  return (
    <div>
      <p style={{ fontSize:'13px', color:'var(--text)', lineHeight:1.8, marginBottom:'20px' }}>
        PWM signals converted to analog voltage via an RC low-pass filter. Used for DAC outputs, motor speed control, LED dimming, and analog control voltages.
      </p>
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'1px solid var(--border)' }}>
        {[['pwm2dac','Find R,C for target ripple'],['given_rc','Analyse given R,C']].map(([id,lbl]) => (
          <button key={id} onClick={() => setMode(id)} style={{
            fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase',
            padding:'9px 16px', border:'none', background:'transparent', cursor:'pointer',
            color: mode===id ? 'var(--accent)' : 'var(--text-dim)',
            borderBottom: mode===id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s',
          }}>{lbl}</button>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>
        <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px' }}>
          <svg viewBox="0 0 240 80" style={{ width:'100%', marginBottom:'16px', background:'var(--bg3)', borderRadius:'2px' }}>
            {[0,1,2,3].map(i => {
              const x0 = 10 + i*40, onW = 40 * duty/100
              return <g key={i}>
                <line x1={x0} y1={45} x2={x0} y2={20} stroke="var(--accent2)" strokeWidth="1.5"/>
                <line x1={x0} y1={20} x2={x0+onW} y2={20} stroke="var(--accent2)" strokeWidth="1.5"/>
                <line x1={x0+onW} y1={20} x2={x0+onW} y2={45} stroke="var(--accent2)" strokeWidth="1.5"/>
                <line x1={x0+onW} y1={45} x2={x0+40} y2={45} stroke="var(--accent2)" strokeWidth="1.5"/>
              </g>
            })}
            <text x="172" y="35" fontFamily="monospace" fontSize="18" fill="var(--accent)">→</text>
            <path d={`M 195 ${45 - (vout_ideal/vcc)*25} Q 210 ${45-(vout_ideal/vcc)*25-1} 235 ${45-(vout_ideal/vcc)*25}`}
              stroke="var(--accent3)" strokeWidth="2" fill="none"/>
            <text x="195" y="70" fontFamily="monospace" fontSize="8" fill="var(--accent3)">{vout_ideal.toFixed(2)}V</text>
            <text x="10" y="70" fontFamily="monospace" fontSize="8" fill="var(--text-dim)">PWM {duty}%</text>
          </svg>
          <SliderInput label="PWM Frequency" value={pwmFreq} set={setPwmFreq} min={100} max={1000000} step={100} unit="Hz" logScale color="var(--accent)" />
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'14px' }}>
            {COMMON_FREQS.map(f => (
              <button key={f.f} onClick={() => setPwmFreq(f.f)} style={{
                fontFamily:'var(--mono)', fontSize:'10px', padding:'3px 9px', borderRadius:'2px', cursor:'pointer',
                border:`1px solid ${pwmFreq===f.f ? 'var(--accent)':'var(--border)'}`,
                background: pwmFreq===f.f ? 'var(--tab-active-bg)':'var(--bg3)',
                color: pwmFreq===f.f ? 'var(--accent)':'var(--text-dim)',
              }}>{f.label}</button>
            ))}
          </div>
          <SliderInput label="Duty Cycle" value={duty} set={setDuty} min={1} max={99} step={1} unit="%" color="var(--accent2)" />
          <SliderInput label="VCC" value={vcc} set={setVcc} min={1.8} max={24} step={0.1} unit="V" color="var(--accent4)" />
          {mode === 'pwm2dac' && (
            <SliderInput label="Max Ripple (pk-pk)" value={ripple} set={setRipple} min={1} max={500} step={1} unit="mV" color="var(--accent3)" />
          )}
          {mode === 'given_rc' && <>
            <SliderInput label="R value" value={rVal} set={setRVal} min={0.1} max={1000} step={0.1} unit="kΩ" color="var(--accent3)" />
            <SliderInput label="C value" value={cVal} set={setCVal} min={1} max={100000} step={1} unit="nF" color="var(--accent2)" logScale />
          </>}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {mode === 'pwm2dac' && <>
            <ResultBox label="Recommended R" value={fmtR(R_ohm)} color="var(--accent4)" />
            <ResultBox label="Recommended C (nearest E24)" value={fmtC(C_standard)} color="var(--accent3)" />
            <ResultBox label="Filter cutoff (fc)" value={fmtF(fc_single)} sub="−3dB point" color="var(--accent)" size={20} />
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
              <StatRow label="Target ripple" value={`${ripple} mV`} />
              <StatRow label="1-stage actual ripple" value={`${(ripple_actual_1*1000).toFixed(1)} mV`} color={ripple_actual_1*1000 <= ripple ? 'var(--accent3)':'var(--accent2)'} />
              <StatRow label="2-stage ripple (same RC×2)" value={`${(ripple_2stage*1000).toFixed(2)} mV`} color="var(--accent3)" />
              <StatRow label="DC output (ideal)" value={`${vout_ideal.toFixed(4)} V`} />
              <StatRow label="Settle to 99% (1-stage)" value={`${settle_given_99.toFixed(1)} ms`} />
            </div>
            <div className="callout tip" style={{ fontSize:'12px' }}>
              <strong>2-stage filter</strong>: Use the same R and C values in two cascaded RC stages. Reduces ripple ~40dB at PWM frequency vs 20dB single-stage.
            </div>
          </>}
          {mode === 'given_rc' && <>
            <ResultBox label="Filter cutoff (fc)" value={fmtF(fc_given)} sub="signals above this are attenuated" color="var(--accent)" />
            <ResultBox label="Ripple at this PWM freq" value={`${(ripple_given*1000).toFixed(2)} mV`}
              color={ripple_given*1000 < 10 ? 'var(--accent3)' : ripple_given*1000 < 50 ? 'var(--accent4)' : 'var(--accent2)'} />
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
              <StatRow label="R" value={fmtR(R_given)} />
              <StatRow label="C" value={fmtC(C_given)} />
              <StatRow label="τ (time constant)" value={`${(R_given*C_given*1000).toFixed(3)} ms`} />
              <StatRow label="Settle to 63.2% (1τ)" value={`${(R_given*C_given*1000).toFixed(3)} ms`} />
              <StatRow label="Settle to 99% (4.6τ)" value={`${settle_99.toFixed(1)} ms`} />
              <StatRow label="DC output" value={`${vout_ideal.toFixed(4)} V`} />
              <StatRow label="Attenuation at PWM freq" value={`${(20*Math.log10(fc_given/pwmFreq)).toFixed(1)} dB`} color="var(--accent)" />
            </div>
          </>}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// 2. BATTERY LIFE ESTIMATOR  (unchanged)
// ─────────────────────────────────────────────────────────────────

const BATTERY_PRESETS = [
  { name:'CR2032 (coin)',    mAh:220,  V:3.0 },
  { name:'AA Alkaline',     mAh:2500, V:1.5 },
  { name:'AAA Alkaline',    mAh:1200, V:1.5 },
  { name:'18650 LiIon',     mAh:3000, V:3.7 },
  { name:'LiPo 100mAh',     mAh:100,  V:3.7 },
  { name:'LiPo 500mAh',     mAh:500,  V:3.7 },
  { name:'LiPo 2000mAh',    mAh:2000, V:3.7 },
  { name:'LiFePO4 1000mAh', mAh:1000, V:3.2 },
]
const DERATING = [
  { label:'Ideal (no derating)',  factor:1.00, note:'Lab conditions only' },
  { label:'Mild (room temp, low C-rate)', factor:0.90, note:'Typical embedded device' },
  { label:'Moderate (some temp/load variation)', factor:0.80, note:'Most real-world use' },
  { label:'Harsh (cold, high load, old battery)', factor:0.65, note:'Outdoor, industrial' },
]
function fmtTime(hours) {
  if (hours < 1/60) return `${(hours*3600).toFixed(0)} sec`
  if (hours < 1) return `${(hours*60).toFixed(0)} min`
  if (hours < 24) return `${hours.toFixed(1)} hours`
  if (hours < 24*30) return `${(hours/24).toFixed(1)} days`
  if (hours < 24*365) return `${(hours/(24*30)).toFixed(1)} months`
  return `${(hours/(24*365)).toFixed(2)} years`
}
function BatteryEstimator() {
  const [capacity,    setCapacity]    = useState(500)
  const [voltage,     setVoltage]     = useState(3.7)
  const [derating,    setDerating]    = useState(2)
  const [customPreset, setCustomPreset] = useState(null)
  const [loads, setLoads] = useState([
    { name:'MCU active',  current:15,   dutyPct:10, enabled:true },
    { name:'MCU sleep',   current:0.01, dutyPct:90, enabled:true },
    { name:'Radio TX',    current:30,   dutyPct:1,  enabled:false },
    { name:'Sensor',      current:2,    dutyPct:5,  enabled:false },
    { name:'LED',         current:5,    dutyPct:0,  enabled:false },
  ])
  const addLoad = () => setLoads(l => [...l, { name:'New load', current:1, dutyPct:10, enabled:true }])
  const updateLoad = (i, key, val) => setLoads(l => l.map((x,j) => j===i ? {...x,[key]:val} : x))
  const removeLoad = (i) => setLoads(l => l.filter((_,j) => j!==i))
  const avgCurrent = loads.filter(l => l.enabled).reduce((sum,l) => sum + l.current * (l.dutyPct/100), 0)
  const derFactor  = DERATING[derating].factor
  const effectiveCap = capacity * derFactor
  const lifeHours  = avgCurrent > 0 ? effectiveCap / avgCurrent : Infinity
  const peakCurrent = Math.max(...loads.filter(l => l.enabled).map(l => l.current), 0)
  const energyMWh  = effectiveCap * voltage
  const pickPreset = (p) => { setCapacity(p.mAh); setVoltage(p.V); setCustomPreset(p.name) }
  const totalContrib = loads.filter(l=>l.enabled).reduce((s,l) => s + l.current*(l.dutyPct/100), 0)
  return (
    <div>
      <p style={{ fontSize:'13px', color:'var(--text)', lineHeight:1.8, marginBottom:'20px' }}>
        Estimate battery runtime from component current draw and duty cycles.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>
        <div>
          <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'16px 18px', marginBottom:'12px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px' }}>Battery</div>
            <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'14px' }}>
              {BATTERY_PRESETS.map(p => (
                <button key={p.name} onClick={() => pickPreset(p)} style={{
                  fontFamily:'var(--mono)', fontSize:'9px', padding:'4px 9px', borderRadius:'2px', cursor:'pointer',
                  border:`1px solid ${customPreset===p.name ? 'var(--accent)':'var(--border)'}`,
                  background: customPreset===p.name ? 'var(--tab-active-bg)':'var(--bg3)',
                  color: customPreset===p.name ? 'var(--accent)':'var(--text-dim)',
                }}>{p.name}</button>
              ))}
            </div>
            <SliderInput label="Capacity" value={capacity} set={v=>{setCapacity(v);setCustomPreset(null)}} min={1} max={20000} step={10} unit="mAh" color="var(--accent4)" logScale />
            <SliderInput label="Nominal Voltage" value={voltage} set={v=>{setVoltage(v);setCustomPreset(null)}} min={1.0} max={12} step={0.1} unit="V" color="var(--accent2)" />
            <div style={{ marginBottom:'6px' }}>
              <label style={{ fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase', color:'var(--text-dim)' }}>Derating Factor</label>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              {DERATING.map((d,i) => (
                <button key={i} onClick={() => setDerating(i)} style={{
                  textAlign:'left', padding:'7px 12px', borderRadius:'2px', cursor:'pointer',
                  border:`1px solid ${derating===i ? 'var(--accent3)':'var(--border)'}`,
                  background: derating===i ? 'color-mix(in srgb, var(--accent3) 8%, var(--panel))':'var(--bg3)',
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                }}>
                  <span style={{ fontSize:'11px', color: derating===i ? 'var(--accent3)':'var(--text)' }}>{d.label}</span>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)' }}>{d.note}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'16px 18px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase' }}>Load Profiles</div>
              <button onClick={addLoad} style={{ fontFamily:'var(--mono)', fontSize:'10px', padding:'4px 10px', borderRadius:'2px', cursor:'pointer', border:'1px solid var(--accent)', background:'transparent', color:'var(--accent)' }}>+ Add</button>
            </div>
            {loads.map((l, i) => (
              <div key={i} style={{ background: l.enabled ? 'var(--bg3)':'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'10px 12px', marginBottom:'6px' }}>
                <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px' }}>
                  <input type="checkbox" checked={l.enabled} onChange={e => updateLoad(i,'enabled',e.target.checked)} />
                  <input value={l.name} onChange={e => updateLoad(i,'name',e.target.value)}
                    style={{ flex:1, fontFamily:'var(--mono)', fontSize:'11px', background:'transparent', border:'none', color:'var(--text)', outline:'none' }} />
                  {loads.length > 1 && (
                    <button onClick={() => removeLoad(i)} style={{ fontFamily:'var(--mono)', fontSize:'10px', padding:'2px 7px', borderRadius:'2px', cursor:'pointer', border:'1px solid var(--border)', background:'transparent', color:'var(--red)' }}>✕</button>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                  <div>
                    <label style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)', letterSpacing:'1px', textTransform:'uppercase' }}>Current (mA)</label>
                    <input type="number" value={l.current} min={0.001} step={0.1}
                      onChange={e => updateLoad(i,'current',Number(e.target.value))}
                      disabled={!l.enabled}
                      style={{ width:'100%', fontFamily:'var(--mono)', fontSize:'12px', padding:'4px 8px', marginTop:'3px',
                        background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px',
                        color: l.enabled ? 'var(--text)':'var(--text-dim)', outline:'none' }} />
                  </div>
                  <div>
                    <label style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)', letterSpacing:'1px', textTransform:'uppercase' }}>Duty (%)</label>
                    <input type="number" value={l.dutyPct} min={0} max={100} step={1}
                      onChange={e => updateLoad(i,'dutyPct',Math.min(100,Number(e.target.value)))}
                      disabled={!l.enabled}
                      style={{ width:'100%', fontFamily:'var(--mono)', fontSize:'12px', padding:'4px 8px', marginTop:'3px',
                        background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'2px',
                        color: l.enabled ? 'var(--text)':'var(--text-dim)', outline:'none' }} />
                  </div>
                </div>
                {l.enabled && totalContrib > 0 && (
                  <div style={{ marginTop:'6px' }}>
                    <div style={{ height:'4px', background:'var(--border)', borderRadius:'2px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(100, l.current*(l.dutyPct/100)/totalContrib*100)}%`, background:'var(--accent)', borderRadius:'2px', transition:'width 0.3s' }} />
                    </div>
                    <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)', marginTop:'2px' }}>
                      {(l.current*(l.dutyPct/100)/totalContrib*100).toFixed(1)}% of total draw
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <ResultBox
            label="Estimated Battery Life"
            value={avgCurrent > 0 ? fmtTime(lifeHours) : '∞'}
            sub={avgCurrent > 0 ? `${lifeHours.toFixed(1)} hours total` : 'No active loads'}
            color={lifeHours > 24*30 ? 'var(--accent3)' : lifeHours > 24 ? 'var(--accent4)' : 'var(--accent2)'}
            size={24}
          />
          <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
            <StatRow label="Average current draw" value={`${avgCurrent.toFixed(3)} mA`} color="var(--accent)" />
            <StatRow label="Peak current" value={`${peakCurrent.toFixed(2)} mA`} color="var(--accent2)" />
            <StatRow label="Battery capacity (derated)" value={`${effectiveCap.toFixed(0)} mAh`} />
            <StatRow label="Derating factor" value={`${(derFactor*100).toFixed(0)}%`} />
            <StatRow label="Energy available" value={`${energyMWh.toFixed(0)} mWh`} />
          </div>
          {avgCurrent > 0 && (
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px' }}>Charge Milestones</div>
              {[100,75,50,25,10].map(pct => (
                <div key={pct} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'32px', height:'6px', background:'var(--border)', borderRadius:'2px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${pct}%`, background: pct>50 ? 'var(--accent3)' : pct>20 ? 'var(--accent4)':'var(--red)', borderRadius:'2px' }} />
                    </div>
                    <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text-dim)' }}>{pct}%</span>
                  </div>
                  <span style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--text)' }}>{fmtTime(lifeHours * pct/100)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="callout tip" style={{ fontSize:'12px' }}>
            <strong>Rule of thumb:</strong> For IoT sensors, aim for average current &lt;100µA for multi-year CR2032 life. Put the MCU to sleep aggressively — a 15mA active MCU at 1% duty = 150µA average.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// 3. FREQUENCY / PERIOD SOLVER  ← NEW
// ─────────────────────────────────────────────────────────────────

const FREQ_PRESETS = [
  { label:'32.768 kHz RTC', f:32768 },
  { label:'1 MHz', f:1e6 },
  { label:'8 MHz (MCU)', f:8e6 },
  { label:'16 MHz (Arduino)', f:16e6 },
  { label:'48 MHz (USB)', f:48e6 },
  { label:'100 MHz', f:100e6 },
  { label:'50 Hz (mains EU)', f:50 },
  { label:'60 Hz (mains US)', f:60 },
]

function FreqPeriodCalculator() {
  // solve direction: 'f→t' or 't→f'
  const [mode, setMode] = useState('f→t')

  // f→t inputs
  const [freqVal,  setFreqVal]  = useState(1000)
  const [freqUnit, setFreqUnit] = useState('Hz')   // Hz | kHz | MHz | GHz

  // t→f inputs
  const [periodVal,  setPeriodVal]  = useState(1)
  const [periodUnit, setPeriodUnit] = useState('ms')  // s | ms | µs | ns

  const freqMultipliers  = { Hz:1, kHz:1e3, MHz:1e6, GHz:1e9 }
  const periodMultipliers = { s:1, ms:1e-3, 'µs':1e-6, ns:1e-9 }

  const f_hz = freqVal  * freqMultipliers[freqUnit]
  const t_s  = periodVal * periodMultipliers[periodUnit]

  const result_t = mode === 'f→t' ? (f_hz > 0 ? 1/f_hz  : null) : null
  const result_f = mode === 't→f' ? (t_s  > 0 ? 1/t_s   : null) : null

  const omega   = mode === 'f→t' ? 2 * Math.PI * f_hz : (t_s > 0 ? 2 * Math.PI / t_s : null)
  const f_final = mode === 'f→t' ? f_hz : result_f
  const t_final = mode === 'f→t' ? result_t : t_s

  const pickPreset = (pf) => {
    setMode('f→t')
    if (pf >= 1e9) { setFreqVal(pf/1e9); setFreqUnit('GHz') }
    else if (pf >= 1e6) { setFreqVal(pf/1e6); setFreqUnit('MHz') }
    else if (pf >= 1e3) { setFreqVal(pf/1e3); setFreqUnit('kHz') }
    else { setFreqVal(pf); setFreqUnit('Hz') }
  }

  const NumUnitInput = ({ val, setVal, unit, setUnit, units, color }) => (
    <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
      <input type="number" value={val} min={0} step="any"
        onChange={e => setVal(Number(e.target.value))}
        style={{ flex:1, fontFamily:'var(--mono)', fontSize:'18px', fontWeight:700, padding:'10px 12px',
          background:'var(--bg3)', border:`1px solid color-mix(in srgb, ${color} 30%, var(--border))`,
          borderRadius:'2px', color, outline:'none', textAlign:'right' }} />
      <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
        {units.map(u => (
          <button key={u} onClick={() => setUnit(u)} style={{
            fontFamily:'var(--mono)', fontSize:'10px', padding:'3px 10px', borderRadius:'2px', cursor:'pointer',
            border:`1px solid ${unit===u ? color:'var(--border)'}`,
            background: unit===u ? `color-mix(in srgb, ${color} 12%, var(--panel))` : 'var(--bg3)',
            color: unit===u ? color : 'var(--text-dim)',
          }}>{u}</button>
        ))}
      </div>
    </div>
  )

  return (
    <div>
      <p style={{ fontSize:'13px', color:'var(--text)', lineHeight:1.8, marginBottom:'20px' }}>
        Convert between frequency and period, and derive angular frequency (ω). Essential for oscillator design, timer configuration, and signal analysis.
      </p>

      {/* Formulas */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginBottom:'20px' }}>
        {[
          { f:'T = 1 / f', desc:'Period from frequency' },
          { f:'f = 1 / T', desc:'Frequency from period' },
          { f:'ω = 2π × f', desc:'Angular frequency (rad/s)' },
        ].map(({f,desc}) => (
          <div key={f} style={{ background:'var(--panel)', border:'1px solid var(--border)', borderLeft:'3px solid var(--accent3)', borderRadius:'2px', padding:'10px 14px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'16px', color:'var(--accent3)', marginBottom:'3px' }}>{f}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Presets */}
      <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'20px' }}>
        {FREQ_PRESETS.map(p => (
          <button key={p.label} onClick={() => pickPreset(p.f)} style={{
            fontFamily:'var(--mono)', fontSize:'10px', padding:'4px 10px', borderRadius:'2px', cursor:'pointer',
            border:'1px solid var(--border)', background:'var(--bg3)', color:'var(--text-dim)',
          }}>{p.label}</button>
        ))}
      </div>

      {/* Mode toggle */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', alignItems:'center' }}>
        <button onClick={() => setMode('f→t')} style={{
          fontFamily:'var(--mono)', fontSize:'12px', padding:'8px 20px', borderRadius:'2px', cursor:'pointer',
          border:`1px solid ${mode==='f→t' ? 'var(--accent)':'var(--border)'}`,
          background: mode==='f→t' ? 'var(--tab-active-bg)':'var(--bg3)',
          color: mode==='f→t' ? 'var(--accent)':'var(--text-dim)',
        }}>f → T &nbsp; (enter frequency)</button>
        <span style={{ color:'var(--text-dim)', fontFamily:'var(--mono)' }}>or</span>
        <button onClick={() => setMode('t→f')} style={{
          fontFamily:'var(--mono)', fontSize:'12px', padding:'8px 20px', borderRadius:'2px', cursor:'pointer',
          border:`1px solid ${mode==='t→f' ? 'var(--accent2)':'var(--border)'}`,
          background: mode==='t→f' ? 'color-mix(in srgb, var(--accent2) 8%, var(--panel))':'var(--bg3)',
          color: mode==='t→f' ? 'var(--accent2)':'var(--text-dim)',
        }}>T → f &nbsp; (enter period)</button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>
        {/* Input */}
        <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px' }}>
          <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'12px' }}>
            {mode === 'f→t' ? 'Enter Frequency' : 'Enter Period'}
          </div>
          {mode === 'f→t'
            ? <NumUnitInput val={freqVal} setVal={setFreqVal} unit={freqUnit} setUnit={setFreqUnit} units={['Hz','kHz','MHz','GHz']} color="var(--accent)" />
            : <NumUnitInput val={periodVal} setVal={setPeriodVal} unit={periodUnit} setUnit={setPeriodUnit} units={['s','ms','µs','ns']} color="var(--accent2)" />
          }

          {/* Visual waveform */}
          <div style={{ marginTop:'20px' }}>
            <svg viewBox="0 0 280 80" style={{ width:'100%', background:'var(--bg3)', borderRadius:'2px', padding:'4px' }}>
              {/* draw 3 cycles */}
              {[0,1,2].map(i => {
                const w = 70, x0 = 20 + i*w
                return <g key={i}>
                  <line x1={x0} y1={55} x2={x0} y2={20} stroke="var(--accent)" strokeWidth="1.5"/>
                  <line x1={x0} y1={20} x2={x0+w/2} y2={20} stroke="var(--accent)" strokeWidth="1.5"/>
                  <line x1={x0+w/2} y1={20} x2={x0+w/2} y2={55} stroke="var(--accent)" strokeWidth="1.5"/>
                  <line x1={x0+w/2} y1={55} x2={x0+w} y2={55} stroke="var(--accent)" strokeWidth="1.5"/>
                </g>
              })}
              {/* T arrow */}
              <line x1={20} y1={68} x2={90} y2={68} stroke="var(--accent3)" strokeWidth="1" markerEnd="url(#arr)"/>
              <line x1={90} y1={68} x2={20} y2={68} stroke="var(--accent3)" strokeWidth="1"/>
              <text x="55" y="77" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="var(--accent3)">
                T = {t_final ? fmtT(t_final) : '?'}
              </text>
              <text x="145" y="12" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="var(--text-dim)">
                f = {f_final ? fmtF(f_final) : '?'}
              </text>
            </svg>
          </div>
        </div>

        {/* Results */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {mode === 'f→t' && result_t !== null && <>
            <ResultBox label="Period (T)" value={fmtT(result_t)} sub={`${result_t.toExponential(4)} seconds`} color="var(--accent3)" size={24} />
          </>}
          {mode === 't→f' && result_f !== null && <>
            <ResultBox label="Frequency (f)" value={fmtF(result_f)} sub={`${result_f.toExponential(4)} Hz`} color="var(--accent)" size={24} />
          </>}
          {omega !== null && (
            <ResultBox label="Angular Frequency (ω)" value={`${omega.toExponential(4)} rad/s`} sub="ω = 2πf" color="var(--accent2)" size={18} />
          )}

          {/* All unit conversions */}
          {f_final && t_final && (
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>All Units</div>
              <StatRow label="Frequency"  value={fmtF(f_final)} color="var(--accent)" />
              <StatRow label="  in Hz"    value={`${f_final.toExponential(4)} Hz`} />
              <StatRow label="  in kHz"   value={`${(f_final/1e3).toPrecision(5)} kHz`} />
              <StatRow label="  in MHz"   value={`${(f_final/1e6).toPrecision(5)} MHz`} />
              <StatRow label="Period"     value={fmtT(t_final)} color="var(--accent3)" />
              <StatRow label="  in s"     value={`${t_final.toExponential(4)} s`} />
              <StatRow label="  in ms"    value={`${(t_final*1e3).toPrecision(5)} ms`} />
              <StatRow label="  in µs"    value={`${(t_final*1e6).toPrecision(5)} µs`} />
              <StatRow label="  in ns"    value={`${(t_final*1e9).toPrecision(5)} ns`} />
              <StatRow label="ω (rad/s)"  value={omega ? omega.toExponential(4) : '-'} color="var(--accent2)" />
              <StatRow label="Half period (T/2)" value={fmtT(t_final/2)} />
              <StatRow label="Quarter period (T/4)" value={fmtT(t_final/4)} />
            </div>
          )}

          <div className="callout tip" style={{ fontSize:'12px' }}>
            <strong>MCU timer tip:</strong> Timer period = T × f_clock. For 1ms tick at 16MHz: reload = 16MHz × 1ms = 16,000 counts. For 50Hz PWM at 8MHz with prescaler 8: reload = (8MHz/8)/50 = 20,000.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// 4. RC TIME CONSTANT CALCULATOR  ← NEW
// ─────────────────────────────────────────────────────────────────

function RCTimeConstantCalculator() {
  const [mode, setMode] = useState('rc')   // 'rc' | 'charge' | 'discharge'
  const [rKohm, setRKohm] = useState(10)   // kΩ
  const [cNf,   setCNf]   = useState(100)  // nF
  const [vcc,   setVcc]   = useState(3.3)
  const [vInit, setVInit] = useState(0)    // V for charge
  const [targetPct, setTargetPct] = useState(63.2) // %

  const R = rKohm * 1e3
  const C = cNf * 1e-9
  const tau = R * C

  // Charge: V(t) = Vcc × (1 − e^(−t/τ))
  // Discharge: V(t) = V0 × e^(−t/τ)
  // Time to reach %: t = −τ × ln(1 − pct/100) [charge] or t = −τ × ln(pct/100) [discharge]

  const fc_hz = 1 / (2 * Math.PI * tau)

  // Percentage milestones
  const milestones = [10, 20, 36.8, 50, 63.2, 80, 90, 95, 99, 99.9]
  // For charge: t = -tau * ln(1 - pct/100)
  // For discharge: t = -tau * ln(pct/100)   (pct = remaining %)

  const chargeTimes    = milestones.map(p => ({ pct:p, t: -tau * Math.log(1 - p/100) }))
  const dischargeTimes = milestones.map(p => ({ pct:100-p, t: -tau * Math.log(p/100), fromPct:p }))

  // Custom target
  const tTarget_charge    = -tau * Math.log(1 - targetPct/100)
  const vTarget_charge    = vcc * (1 - Math.exp(-tTarget_charge / tau))
  const tTarget_discharge = targetPct < 100 ? -tau * Math.log(targetPct/100) : Infinity
  const vTarget_discharge = vcc * Math.exp(-tTarget_discharge / tau)

  // SVG curve data
  const SVG_W = 260, SVG_H = 90
  const tMax = 5 * tau
  const N = 60
  const chargePoints = Array.from({length:N+1}, (_,i) => {
    const t = (i/N) * tMax
    const v = vcc * (1 - Math.exp(-t/tau))
    return `${10 + (i/N)*(SVG_W-20)},${SVG_H - 10 - (v/vcc)*(SVG_H-20)}`
  }).join(' ')
  const dischargePoints = Array.from({length:N+1}, (_,i) => {
    const t = (i/N) * tMax
    const v = vcc * Math.exp(-t/tau)
    return `${10 + (i/N)*(SVG_W-20)},${SVG_H - 10 - (v/vcc)*(SVG_H-20)}`
  }).join(' ')

  // τ markers on SVG
  const tauX = 10 + (1/5)*(SVG_W-20)  // at t=τ (1 of 5τ)
  const tauY_c  = SVG_H - 10 - (0.632)*(SVG_H-20)
  const tauY_d  = SVG_H - 10 - (0.368)*(SVG_H-20)

  return (
    <div>
      <p style={{ fontSize:'13px', color:'var(--text)', lineHeight:1.8, marginBottom:'20px' }}>
        Calculate RC time constant τ, charge/discharge curves, and the time to reach any voltage percentage. Used for filter design, debounce circuits, timer networks, and power-on delays.
      </p>

      {/* Formula strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'8px', marginBottom:'20px' }}>
        {[
          { f:'τ = R × C', desc:'Time constant' },
          { f:'fc = 1/(2πRC)', desc:'−3dB cutoff' },
          { f:'V(t) = Vcc(1−e^(−t/τ))', desc:'Charging' },
          { f:'V(t) = V₀ × e^(−t/τ)', desc:'Discharging' },
        ].map(({f,desc}) => (
          <div key={f} style={{ background:'var(--panel)', border:'1px solid var(--border)', borderLeft:'3px solid var(--accent2)', borderRadius:'2px', padding:'8px 12px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--accent2)', marginBottom:'2px' }}>{f}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)' }}>{desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>
        {/* Inputs */}
        <div>
          <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px', marginBottom:'12px' }}>
            <SliderInput label="Resistance R" value={rKohm} set={setRKohm} min={0.1} max={10000} step={0.1} unit="kΩ" color="var(--accent4)" logScale />
            <SliderInput label="Capacitance C" value={cNf} set={setCNf} min={0.001} max={1000000} step={0.001} unit="nF" color="var(--accent3)" logScale />
            <SliderInput label="Supply Voltage" value={vcc} set={setVcc} min={1.0} max={36} step={0.1} unit="V" color="var(--accent)" />

            <div style={{ marginTop:'8px' }}>
              <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px' }}>Target %</div>
              <SliderInput label="Target voltage %" value={targetPct} set={setTargetPct} min={1} max={99} step={0.1} unit="%" color="var(--accent2)" />
            </div>
          </div>

          {/* Curve type */}
          <div style={{ display:'flex', gap:'6px', marginBottom:'12px' }}>
            {[['rc','Summary'],['charge','Charge curve'],['discharge','Discharge curve']].map(([id,lbl]) => (
              <button key={id} onClick={() => setMode(id)} style={{
                flex:1, fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1px', textTransform:'uppercase',
                padding:'8px', borderRadius:'2px', cursor:'pointer',
                border:`1px solid ${mode===id ? 'var(--accent)':'var(--border)'}`,
                background: mode===id ? 'var(--tab-active-bg)':'var(--bg3)',
                color: mode===id ? 'var(--accent)':'var(--text-dim)',
              }}>{lbl}</button>
            ))}
          </div>

          {/* SVG curves */}
          <div style={{ background:'var(--bg3)', borderRadius:'2px', padding:'8px' }}>
            <svg viewBox={`0 0 ${SVG_W} ${SVG_H+10}`} style={{ width:'100%' }}>
              {/* Axes */}
              <line x1={10} y1={SVG_H-10} x2={SVG_W-5} y2={SVG_H-10} stroke="var(--border)" strokeWidth="1"/>
              <line x1={10} y1={10} x2={10} y2={SVG_H-10} stroke="var(--border)" strokeWidth="1"/>
              {/* τ markers */}
              {[1,2,3,4,5].map(n => (
                <g key={n}>
                  <line x1={10+(n/5)*(SVG_W-20)} y1={SVG_H-12} x2={10+(n/5)*(SVG_W-20)} y2={SVG_H-8} stroke="var(--border)" strokeWidth="1"/>
                  <text x={10+(n/5)*(SVG_W-20)} y={SVG_H+2} textAnchor="middle" fontFamily="monospace" fontSize="7" fill="var(--text-dim)">{n}τ</text>
                </g>
              ))}
              {/* Charge curve */}
              {(mode === 'rc' || mode === 'charge') && (
                <polyline points={chargePoints} fill="none" stroke="var(--accent3)" strokeWidth="2"/>
              )}
              {/* Discharge curve */}
              {(mode === 'rc' || mode === 'discharge') && (
                <polyline points={dischargePoints} fill="none" stroke="var(--accent2)" strokeWidth="2"/>
              )}
              {/* 63.2% / 36.8% τ dot */}
              {(mode === 'rc' || mode === 'charge') && (
                <circle cx={tauX} cy={tauY_c} r="3" fill="var(--accent3)"/>
              )}
              {(mode === 'rc' || mode === 'discharge') && (
                <circle cx={tauX} cy={tauY_d} r="3" fill="var(--accent2)"/>
              )}
              {/* Legend */}
              {mode === 'rc' && <>
                <circle cx={15} cy={12} r="3" fill="var(--accent3)"/>
                <text x={21} y={15} fontFamily="monospace" fontSize="7" fill="var(--accent3)">charge</text>
                <circle cx={65} cy={12} r="3" fill="var(--accent2)"/>
                <text x={71} y={15} fontFamily="monospace" fontSize="7" fill="var(--accent2)">discharge</text>
              </>}
            </svg>
          </div>
        </div>

        {/* Results */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          <ResultBox label="Time Constant τ" value={fmtT(tau)} sub={`R × C = ${(rKohm).toPrecision(3)}kΩ × ${fmtC(C)}`} color="var(--accent4)" size={22} />
          <ResultBox label="Filter Cutoff (fc)" value={fmtF(fc_hz)} sub="−3dB frequency = 1/(2πRC)" color="var(--accent)" size={18} />

          <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'8px' }}>Key Milestones</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0' }}>
              <div>
                <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--accent3)', letterSpacing:'1px', textTransform:'uppercase', padding:'4px 0', borderBottom:'1px solid var(--border)' }}>Charging to %</div>
                {chargeTimes.filter(m => [36.8,63.2,90,99,99.9].includes(m.pct)).map(m => (
                  <StatRow key={m.pct} label={`${m.pct}%`} value={fmtT(m.t)} color={m.pct===63.2 ? 'var(--accent3)' : 'var(--text)'} />
                ))}
              </div>
              <div style={{ paddingLeft:'12px', borderLeft:'1px solid var(--border)' }}>
                <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--accent2)', letterSpacing:'1px', textTransform:'uppercase', padding:'4px 0', borderBottom:'1px solid var(--border)' }}>Discharging to %</div>
                {dischargeTimes.filter(m => [63.2,36.8,10,1,0.1].includes(m.pct)).map(m => (
                  <StatRow key={m.pct} label={`${m.pct.toFixed(1)}%`} value={fmtT(m.t)} color={m.pct===36.8 ? 'var(--accent2)' : 'var(--text)'} />
                ))}
              </div>
            </div>
          </div>

          {/* Custom target */}
          <div style={{ background:'var(--bg3)', border:'1px solid color-mix(in srgb, var(--accent2) 20%, var(--border))', borderLeft:'3px solid var(--accent2)', borderRadius:'2px', padding:'12px 16px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'10px', color:'var(--text-dim)', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'6px' }}>Custom Target ({targetPct}%)</div>
            <StatRow label="Charge: time to reach target" value={fmtT(tTarget_charge)} color="var(--accent3)" />
            <StatRow label="Charge: voltage at target time" value={`${vTarget_charge.toFixed(4)} V`} />
            <StatRow label="Discharge: time to reach target" value={targetPct < 100 ? fmtT(tTarget_discharge) : '∞'} color="var(--accent2)" />
            <StatRow label="Discharge: voltage at target time" value={targetPct < 100 ? `${vTarget_discharge.toFixed(4)} V` : '0.000 V'} />
          </div>

          <div className="callout tip" style={{ fontSize:'12px' }}>
            <strong>Debounce tip:</strong> For a 10ms debounce on a button with 3.3V pull-up: use 10kΩ + 100nF → τ = 1ms. Schmitt trigger input reads stable after ~5τ = 5ms. Add 0.1µF directly at GPIO for simple RC debounce.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// 5. VOLTAGE DIVIDER CALCULATOR  ← NEW
// ─────────────────────────────────────────────────────────────────

const VD_PRESETS = [
  { label:'5V → 3.3V (ADC)', vin:5, vout:3.3 },
  { label:'12V → 3.3V', vin:12, vout:3.3 },
  { label:'24V → 3.3V', vin:24, vout:3.3 },
  { label:'5V → 1.65V (half)', vin:5, vout:2.5 },
  { label:'3.3V → 1.8V', vin:3.3, vout:1.8 },
  { label:'12V → 5V', vin:12, vout:5 },
]

function VoltageDividerCalculator() {
  const [mode, setMode] = useState('find') // 'find' | 'analyse'

  // find mode
  const [vin, setVin]   = useState(5)
  const [vout, setVout] = useState(3.3)
  const [r1_base, setR1Base] = useState(10)   // kΩ — R1 (top, from Vin to Vout)

  // analyse mode
  const [r1a, setR1a] = useState(10)   // kΩ
  const [r2a, setR2a] = useState(20)   // kΩ
  const [vina, setVina] = useState(5)

  // find mode calculations
  // Vout = Vin × R2 / (R1 + R2)
  // R2/R1 = Vout / (Vin - Vout)
  const ratio = vout > 0 && vin > vout ? vout / (vin - vout) : null
  const R1_ohm = r1_base * 1e3
  const R2_exact = ratio !== null ? R1_ohm * ratio : null
  const R2_std = R2_exact !== null ? nearestE24(R2_exact / 1000) * 1000 : null
  const R2_std_e24 = R2_exact !== null ? nearestE24(R2_exact / 1000) : null
  const vout_actual = R2_std !== null ? vin * R2_std / (R1_ohm + R2_std) : null
  const vout_error  = vout_actual !== null ? ((vout_actual - vout) / vout * 100) : null
  const current_ma  = R2_std !== null ? (vin / (R1_ohm + R2_std)) * 1000 : null
  const power_mw    = current_ma !== null ? current_ma * vin : null

  // analyse mode
  const R1a_ohm = r1a * 1e3
  const R2a_ohm = r2a * 1e3
  const vout_an = vina * R2a_ohm / (R1a_ohm + R2a_ohm)
  const cur_an  = vina / (R1a_ohm + R2a_ohm) * 1000
  const pow_an  = cur_an * vina

  const pickPreset = (p) => {
    setMode('find')
    setVin(p.vin)
    setVout(p.vout)
  }

  // SVG divider diagram
  const DiagramSVG = ({ r1, r2, vin: vd_in, vout: vd_out }) => {
    const r1val = typeof r1 === 'number' ? fmtR(r1) : '?'
    const r2val = typeof r2 === 'number' ? fmtR(r2) : '?'
    return (
      <svg viewBox="0 0 160 160" style={{ width:'100%', maxWidth:'180px', display:'block', margin:'0 auto' }}>
        {/* Vin label */}
        <text x="20" y="18" fontFamily="monospace" fontSize="10" fill="var(--accent4)">{vd_in}V</text>
        {/* Top wire */}
        <line x1="80" y1="15" x2="80" y2="30" stroke="var(--accent4)" strokeWidth="2"/>
        {/* R1 box */}
        <rect x="60" y="30" width="40" height="30" rx="2" fill="var(--bg3)" stroke="var(--accent)" strokeWidth="1.5"/>
        <text x="80" y="49" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="var(--accent)">R1</text>
        {/* R1 value */}
        <text x="110" y="49" fontFamily="monospace" fontSize="8" fill="var(--text-dim)">{r1val}</text>
        {/* Mid wire */}
        <line x1="80" y1="60" x2="80" y2="75" stroke="var(--border2)" strokeWidth="2"/>
        {/* Vout node dot */}
        <circle cx="80" cy="75" r="4" fill="var(--accent3)"/>
        {/* Vout label */}
        <text x="96" y="79" fontFamily="monospace" fontSize="10" fill="var(--accent3)">{vd_out ? vd_out.toFixed(3)+'V' : '?'}</text>
        {/* R2 box */}
        <rect x="60" y="80" width="40" height="30" rx="2" fill="var(--bg3)" stroke="var(--accent2)" strokeWidth="1.5"/>
        <text x="80" y="99" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="var(--accent2)">R2</text>
        <text x="110" y="99" fontFamily="monospace" fontSize="8" fill="var(--text-dim)">{r2val}</text>
        {/* Bottom wire */}
        <line x1="80" y1="110" x2="80" y2="130" stroke="var(--border2)" strokeWidth="2"/>
        {/* GND symbol */}
        <line x1="60" y1="130" x2="100" y2="130" stroke="var(--text-dim)" strokeWidth="2"/>
        <line x1="65" y1="136" x2="95" y2="136" stroke="var(--text-dim)" strokeWidth="1.5"/>
        <line x1="70" y1="142" x2="90" y2="142" stroke="var(--text-dim)" strokeWidth="1"/>
        <text x="20" y="140" fontFamily="monospace" fontSize="9" fill="var(--text-dim)">GND</text>
      </svg>
    )
  }

  return (
    <div>
      <p style={{ fontSize:'13px', color:'var(--text)', lineHeight:1.8, marginBottom:'20px' }}>
        Design resistor voltage dividers for level shifting, ADC input scaling, and reference voltages. Find the nearest standard resistor pair for a target output voltage.
      </p>

      {/* Formula */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'20px' }}>
        {[
          { f:'Vout = Vin × R2/(R1+R2)', desc:'Output voltage' },
          { f:'R2/R1 = Vout/(Vin−Vout)', desc:'Resistor ratio' },
          { f:'I = Vin/(R1+R2)', desc:'Divider current' },
        ].map(({f,desc}) => (
          <div key={f} style={{ background:'var(--panel)', border:'1px solid var(--border)', borderLeft:'3px solid var(--accent4)', borderRadius:'2px', padding:'8px 12px' }}>
            <div style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--accent4)', marginBottom:'2px' }}>{f}</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:'9px', color:'var(--text-dim)' }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Presets */}
      <div style={{ display:'flex', gap:'5px', flexWrap:'wrap', marginBottom:'16px' }}>
        {VD_PRESETS.map(p => (
          <button key={p.label} onClick={() => pickPreset(p)} style={{
            fontFamily:'var(--mono)', fontSize:'10px', padding:'4px 10px', borderRadius:'2px', cursor:'pointer',
            border:'1px solid var(--border)', background:'var(--bg3)', color:'var(--text-dim)',
          }}>{p.label}</button>
        ))}
      </div>

      {/* Mode toggle */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'1px solid var(--border)' }}>
        {[['find','Find R1+R2 for target Vout'],['analyse','Analyse given R1+R2']].map(([id,lbl]) => (
          <button key={id} onClick={() => setMode(id)} style={{
            fontFamily:'var(--mono)', fontSize:'10px', letterSpacing:'1.5px', textTransform:'uppercase',
            padding:'9px 16px', border:'none', background:'transparent', cursor:'pointer',
            color: mode===id ? 'var(--accent)' : 'var(--text-dim)',
            borderBottom: mode===id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s',
          }}>{lbl}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>
        {/* Inputs + diagram */}
        <div>
          <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px', marginBottom:'12px' }}>
            {mode === 'find' && <>
              <SliderInput label="Input Voltage (Vin)" value={vin} set={setVin} min={1} max={60} step={0.1} unit="V" color="var(--accent4)" />
              <SliderInput label="Target Vout" value={vout} set={setVout} min={0.1} max={vin-0.1} step={0.1} unit="V" color="var(--accent3)" />
              <SliderInput label="R1 value" value={r1_base} set={setR1Base} min={0.1} max={10000} step={0.1} unit="kΩ" color="var(--accent)" logScale />
              {vin <= vout && (
                <div style={{ color:'var(--red)', fontFamily:'var(--mono)', fontSize:'11px', padding:'8px', background:'color-mix(in srgb, var(--red) 8%, var(--panel))', borderRadius:'2px', border:'1px solid color-mix(in srgb, var(--red) 20%, var(--border))' }}>
                  ⚠ Vout must be less than Vin for a voltage divider
                </div>
              )}
            </>}
            {mode === 'analyse' && <>
              <SliderInput label="Input Voltage (Vin)" value={vina} set={setVina} min={1} max={60} step={0.1} unit="V" color="var(--accent4)" />
              <SliderInput label="R1 (top resistor)" value={r1a} set={setR1a} min={0.1} max={10000} step={0.1} unit="kΩ" color="var(--accent)" logScale />
              <SliderInput label="R2 (bottom resistor)" value={r2a} set={setR2a} min={0.1} max={10000} step={0.1} unit="kΩ" color="var(--accent2)" logScale />
            </>}
          </div>
          <DiagramSVG
            r1={mode==='find' ? R1_ohm : R1a_ohm}
            r2={mode==='find' ? R2_std : R2a_ohm}
            vin={mode==='find' ? vin : vina}
            vout={mode==='find' ? vout_actual : vout_an}
          />
        </div>

        {/* Results */}
        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
          {mode === 'find' && ratio !== null && R2_std !== null && <>
            <ResultBox label="R1 (use this value)" value={fmtR(R1_ohm)} color="var(--accent)" size={20} />
            <ResultBox label="R2 exact" value={fmtR(R2_exact)} sub="ideal — not a standard value" color="var(--text-dim)" size={18} />
            <ResultBox label="R2 nearest E24" value={`${R2_std_e24} kΩ`} sub={fmtR(R2_std)} color="var(--accent2)" size={20} />
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
              <StatRow label="Actual Vout (with E24 R2)" value={`${vout_actual?.toFixed(4)} V`} color="var(--accent3)" />
              <StatRow label="Error from target" value={`${vout_error?.toFixed(2)}%`} color={Math.abs(vout_error) < 2 ? 'var(--accent3)' : 'var(--accent2)'} />
              <StatRow label="Divider current (Vin/Rtotal)" value={`${current_ma?.toFixed(3)} mA`} />
              <StatRow label="Total power dissipated" value={`${power_mw?.toFixed(2)} mW`} />
              <StatRow label="R1+R2 total" value={fmtR(R1_ohm + R2_std)} />
              <StatRow label="Resistor ratio R2/R1" value={(R2_std/R1_ohm).toFixed(4)} />
            </div>
          </>}

          {mode === 'analyse' && <>
            <ResultBox label="Output Voltage" value={`${vout_an.toFixed(4)} V`} color="var(--accent3)" size={24} />
            <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'14px 16px' }}>
              <StatRow label="R1" value={fmtR(R1a_ohm)} color="var(--accent)" />
              <StatRow label="R2" value={fmtR(R2a_ohm)} color="var(--accent2)" />
              <StatRow label="Vout" value={`${vout_an.toFixed(4)} V`} color="var(--accent3)" />
              <StatRow label="Ratio Vout/Vin" value={(vout_an/vina).toFixed(4)} />
              <StatRow label="Divider current" value={`${cur_an.toFixed(3)} mA`} />
              <StatRow label="Power dissipated" value={`${pow_an.toFixed(2)} mW`} />
              <StatRow label="Voltage across R1" value={`${(vina - vout_an).toFixed(4)} V`} />
            </div>
          </>}

          <div className="callout tip" style={{ fontSize:'12px' }}>
            <strong>Load effect:</strong> If a load resistor RL is connected to Vout, it appears in parallel with R2, lowering the effective R2 and pulling Vout down. Use R1+R2 &lt;&lt; RL for accuracy — typically aim for divider current ≥ 10× load current.
          </div>

          <div className="callout tip" style={{ fontSize:'12px' }}>
            <strong>ADC input tip:</strong> For 5V→3.3V level shift feeding a 3.3V ADC: use 10kΩ + 20kΩ → Vout = 5 × 20/30 = 3.33V ✓. Keep R values high (10–100kΩ) to minimise quiescent current.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COMBINED — all tabs
// ─────────────────────────────────────────────────────────────────

const TABS = [
  { id:'pwm',    label:'PWM / RC Filter',       icon:'∿' },
  { id:'bat',    label:'Battery Life',           icon:'⚡' },
  { id:'freq',   label:'Frequency / Period',     icon:'⏱' },
  { id:'rc',     label:'RC Time Constant',       icon:'τ' },
  { id:'vdiv',   label:'Voltage Divider',        icon:'⊥' },
]

export default function ElectricalCalculators() {
  const [tab, setTab] = useState('pwm')

  return (
    <div className="fade-in">
      <div className="section-title">Electrical Calculators</div>
      <p className="section-desc">PWM filter design, battery runtime, frequency/period conversion, RC time constants, and voltage dividers.</p>

      <div style={{ display:'flex', gap:'4px', marginBottom:'28px', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily:'var(--mono)', fontSize:'11px', letterSpacing:'1.5px', textTransform:'uppercase',
            padding:'10px 18px', border:'none', background:'transparent', cursor:'pointer',
            color: tab===t.id ? 'var(--accent)' : 'var(--text-dim)',
            borderBottom: tab===t.id ? '2px solid var(--accent)' : '2px solid transparent',
            marginBottom:'-1px', transition:'color 0.15s',
            display:'flex', alignItems:'center', gap:'7px',
          }}
          onMouseEnter={e => { if(tab!==t.id) e.currentTarget.style.color='var(--hover-text)' }}
          onMouseLeave={e => { if(tab!==t.id) e.currentTarget.style.color='var(--text-dim)' }}
          >
            <span style={{ opacity: tab===t.id ? 1 : 0.5, fontSize:'14px' }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab==='pwm'  && <PWMCalculator />}
      {tab==='bat'  && <BatteryEstimator />}
      {tab==='freq' && <FreqPeriodCalculator />}
      {tab==='rc'   && <RCTimeConstantCalculator />}
      {tab==='vdiv' && <VoltageDividerCalculator />}
    </div>
  )
}