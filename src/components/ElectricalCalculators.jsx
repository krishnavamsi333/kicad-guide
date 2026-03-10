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
  return `${f.toFixed(2)} Hz`
}
function fmtC(c) {          // c in Farads
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

// ─────────────────────────────────────────────────────────────────
// PWM / RC FILTER CALCULATOR
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
  const [mode, setMode]       = useState('pwm2dac')  // pwm2dac | given_rc | ripple
  const [pwmFreq, setPwmFreq] = useState(10000)      // Hz
  const [duty,    setDuty]    = useState(50)          // %
  const [vcc,     setVcc]     = useState(3.3)         // V
  const [ripple,  setRipple]  = useState(50)          // mV pk-pk
  const [rVal,    setRVal]    = useState(10)          // kΩ
  const [cVal,    setCVal]    = useState(100)         // nF
  const [stages,  setStages]  = useState(1)

  // ── Mode: PWM → DAC (find R,C for target ripple) ──────────────
  const vout_ideal = vcc * duty / 100

  // Single-stage RC: Vripple = Vcc × duty × (1-duty) / (f × R × C)
  // Rearranged for given ripple: RC = Vcc × duty × (1-duty) / (f × Vripple)
  const rippleV = ripple / 1000
  const d = duty / 100
  const RC_needed = vcc * d * (1-d) / (pwmFreq * rippleV)

  // Pick sensible R then find C
  const R_suggested = nearestE24(Math.sqrt(RC_needed / (2 * Math.PI)) * 1e3) // kΩ range
  const R_ohm = R_suggested * 1e3 > 0 ? R_suggested * 1e3 : 10000
  const C_exact = RC_needed / R_ohm
  const C_standard = STD_CAPS.reduce((b,v) => Math.abs(v - C_exact) < Math.abs(b - C_exact) ? v : b, STD_CAPS[0])
  const fc_single  = 1 / (2 * Math.PI * R_ohm * C_standard)
  const ripple_actual_1 = vcc * d * (1-d) / (pwmFreq * R_ohm * C_standard)
  const ripple_actual_2 = ripple_actual_1 / (Math.sqrt(1 + Math.pow(pwmFreq/(fc_single),2)))

  // 2-stage attenuation: ×20dB extra
  const ripple_2stage = ripple_actual_1 * Math.pow(fc_single / pwmFreq, 2) * 0.5

  // ── Mode: Given R,C — show what you get ───────────────────────
  const R_given = rVal * 1e3
  const C_given = cVal * 1e-9
  const fc_given = 1 / (2 * Math.PI * R_given * C_given)
  const ripple_given = vcc * d * (1-d) / (pwmFreq * R_given * C_given)
  const settle_99 = -Math.log(0.01) * R_given * C_given * 1e3  // ms

  const settle_given_99 = -Math.log(0.01) * R_ohm * C_standard * 1e3

  return (
    <div>
      <p style={{ fontSize:'13px', color:'var(--text)', lineHeight:1.8, marginBottom:'20px' }}>
        PWM signals converted to analog voltage via an RC low-pass filter. Used for DAC outputs, motor speed control, LED dimming, and analog control voltages.
      </p>

      {/* Mode toggle */}
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
        {/* Inputs */}
        <div style={{ background:'var(--panel)', border:'1px solid var(--border)', borderRadius:'2px', padding:'20px' }}>
          {/* PWM diagram */}
          <svg viewBox="0 0 240 80" style={{ width:'100%', marginBottom:'16px', background:'var(--bg3)', borderRadius:'2px' }}>
            {/* PWM wave */}
            {[0,1,2,3].map(i => {
              const x0 = 10 + i*40, onW = 40 * duty/100
              return <g key={i}>
                <line x1={x0} y1={45} x2={x0} y2={20} stroke="var(--accent2)" strokeWidth="1.5"/>
                <line x1={x0} y1={20} x2={x0+onW} y2={20} stroke="var(--accent2)" strokeWidth="1.5"/>
                <line x1={x0+onW} y1={20} x2={x0+onW} y2={45} stroke="var(--accent2)" strokeWidth="1.5"/>
                <line x1={x0+onW} y1={45} x2={x0+40} y2={45} stroke="var(--accent2)" strokeWidth="1.5"/>
              </g>
            })}
            {/* Arrow → */}
            <text x="172" y="35" fontFamily="monospace" fontSize="18" fill="var(--accent)">→</text>
            {/* Smooth wave */}
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

        {/* Results */}
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
              <strong>2-stage filter</strong>: Use the same R and C values in two cascaded RC stages. This reduces ripple by ~40dB at the PWM frequency vs 20dB for single-stage. Slightly slower response.
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
// BATTERY LIFE ESTIMATOR
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
  const [capacity,    setCapacity]    = useState(500)   // mAh
  const [voltage,     setVoltage]     = useState(3.7)   // V
  const [derating,    setDerating]    = useState(2)     // index
  const [customPreset, setCustomPreset] = useState(null)

  // Loads
  const [loads, setLoads] = useState([
    { name:'MCU active',  current:15,  dutyPct:10,  enabled:true },
    { name:'MCU sleep',   current:0.01, dutyPct:90, enabled:true },
    { name:'Radio TX',    current:30,  dutyPct:1,   enabled:false },
    { name:'Sensor',      current:2,   dutyPct:5,   enabled:false },
    { name:'LED',         current:5,   dutyPct:0,   enabled:false },
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

  // Bar chart of load contribution
  const totalContrib = loads.filter(l=>l.enabled).reduce((s,l) => s + l.current*(l.dutyPct/100), 0)

  return (
    <div>
      <p style={{ fontSize:'13px', color:'var(--text)', lineHeight:1.8, marginBottom:'20px' }}>
        Estimate battery runtime from component current draw and duty cycles. Add each subsystem and its active duty cycle to find the average current.
      </p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>
        {/* Left — battery + loads */}
        <div>
          {/* Battery presets */}
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

          {/* Loads */}
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
                {/* contribution bar */}
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

        {/* Results */}
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

          {/* Timeline breakdown */}
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
            <strong>Rule of thumb:</strong> For IoT sensors, aim for average current &lt;100µA for multi-year CR2032 life. Put the MCU to sleep aggressively — a 15mA active MCU at 1% duty = 150µA average, cutting life 15×.
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────
// COMBINED
// ─────────────────────────────────────────────────────────────────

const TABS = [
  { id:'pwm', label:'PWM / RC Filter', icon:'∿' },
  { id:'bat', label:'Battery Life',    icon:'⚡' },
]

export default function ElectricalCalculators() {
  const [tab, setTab] = useState('pwm')

  return (
    <div className="fade-in">
      <div className="section-title">Electrical Calculators</div>
      <p className="section-desc">PWM-to-analog RC filter design and battery runtime estimation.</p>

      <div style={{ display:'flex', gap:'4px', marginBottom:'28px', borderBottom:'1px solid var(--border)' }}>
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
            <span style={{ opacity: tab===t.id ? 1 : 0.5 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {tab==='pwm' && <PWMCalculator />}
      {tab==='bat' && <BatteryEstimator />}
    </div>
  )
}