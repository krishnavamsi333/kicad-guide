import { useState, useEffect, useCallback } from 'react'

const SECTIONS = [
  {
    label: 'Schematic',
    color: 'var(--accent)',
    items: [
      'All components have correct values and references',
      'All components have footprints assigned',
      'ERC runs with zero errors',
      'No-connect flags placed on all intentionally unused pins',
      'Power symbols used correctly (VCC, GND, etc.)',
      'Net labels used instead of long crossing wires',
      'Junction dots placed at all T-wire junctions',
      'Decoupling capacitors placed on all IC power pins',
    ],
  },
  {
    label: 'PCB Layout',
    color: 'var(--accent2)',
    items: [
      'Board outline drawn on Edge.Cuts layer (closed shape)',
      'All components placed (no components off-board)',
      'All ratsnest lines gone (zero unrouted connections)',
      'Ground plane added and filled (press B)',
      'Copper zones refilled after last change (press B again)',
      'No 90° trace bends — all bends are 45°',
      'Power traces are wider than signal traces',
      'Decoupling caps are within 0.5–1mm of IC power pins',
      'Via stitching added around ground pour edges',
      'All silkscreen labels are readable and not on pads',
      'Polarity marked on polarized components (caps, LEDs, diodes)',
      'Pin 1 marked on ICs, connectors',
      'Mounting holes added if needed',
    ],
  },
  {
    label: 'DRC Checks',
    color: 'var(--accent3)',
    items: [
      'DRC runs with zero errors',
      'DRC warnings reviewed and understood',
      '3D view looks correct — no overlapping components',
      'Board dimensions verified (measure with ruler tool)',
      'Footprints verified against actual component datasheets',
      'Connector orientation is correct in 3D view',
    ],
  },
  {
    label: 'Export',
    color: 'var(--accent4)',
    items: [
      'Gerbers generated for all required layers',
      'Drill files generated (PTH + NPTH)',
      'Gerbers previewed in KiCad Gerber viewer',
      'Gerbers uploaded to fab site and previewed there',
      'Board color, surface finish, and thickness selected',
      'Quantity correct',
    ],
  },
]

const ALL_ITEMS = SECTIONS.flatMap(s => s.items)
const STORAGE_KEY = 'kicad-checklist-v2'

// SVG ring progress component
function ProgressRing({ pct, size = 80, stroke = 5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  const color = pct === 100 ? 'var(--accent3)'
    : pct > 60  ? 'var(--accent)'
    : pct > 30  ? 'var(--accent4)'
    : 'var(--accent2)'

  return (
    <svg width={size} height={size} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      {/* Track */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--border2)"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.45s ease, stroke 0.3s ease' }}
      />
    </svg>
  )
}

export default function InteractiveChecklist() {
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)) }
    catch {}
  }, [checked])

  const toggle = useCallback((item) => {
    setChecked(prev => ({ ...prev, [item]: !prev[item] }))
  }, [])

  const reset = useCallback(() => {
    if (!window.confirm('Reset all checklist progress?')) return
    setChecked({})
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const totalDone  = ALL_ITEMS.filter(i => checked[i]).length
  const totalCount = ALL_ITEMS.length
  const pct        = Math.round((totalDone / totalCount) * 100)

  return (
    <div className="fade-in">
      <div className="section-title">Pre-Fab Checklist</div>
      <p className="section-desc">
        Tick off every item before ordering. Progress is saved automatically in your browser.
      </p>

      {/* ── Progress header ─────────────────────────── */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '4px',
        padding: '22px 26px',
        marginBottom: '34px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Ring */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <ProgressRing pct={pct} size={72} stroke={5} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 700,
            color: pct === 100 ? 'var(--accent3)' : pct > 60 ? 'var(--accent)' : 'var(--text-bright)',
            transform: 'rotate(90deg)',
          }}>
            {pct}%
          </div>
        </div>

        {/* Stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--text-dim)', marginBottom: '6px',
          }}>
            Progress
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: 700, color: 'var(--text-bright)' }}>
              {totalDone}
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text-dim)' }}>
              / {totalCount} items
            </span>
            {pct === 100 && (
              <span style={{
                fontFamily: 'var(--mono)', fontSize: '11px',
                color: 'var(--accent3)', letterSpacing: '1px',
                animation: 'fadeUp 0.4s ease both',
              }}>
                ✓ READY TO ORDER
              </span>
            )}
          </div>

          {/* Section quick-status */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            {SECTIONS.map(s => {
              const done = s.items.filter(i => checked[i]).length
              const complete = done === s.items.length
              return (
                <div key={s.label} style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  fontFamily: 'var(--mono)', fontSize: '9px',
                  letterSpacing: '1px', textTransform: 'uppercase',
                  color: complete ? s.color : 'var(--text-dim)',
                  opacity: complete ? 1 : 0.6,
                  transition: 'color 0.2s, opacity 0.2s',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: complete ? s.color : 'var(--border2)',
                    transition: 'background 0.2s',
                  }} />
                  {s.label} {complete ? '✓' : `${done}/${s.items.length}`}
                </div>
              )
            })}
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={reset}
          style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '7px 16px', border: '1px solid var(--border)',
            background: 'var(--bg3)', color: 'var(--text-dim)',
            cursor: 'pointer', borderRadius: '2px',
            transition: 'border-color 0.15s, color 0.15s',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--red)'; e.currentTarget.style.color = 'var(--red)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)' }}
        >
          ↺ Reset
        </button>
      </div>

      {/* ── Sections ─────────────────────────────────── */}
      {SECTIONS.map((section, si) => {
        const sectionDone = section.items.filter(i => checked[i]).length
        const sectionComplete = sectionDone === section.items.length

        return (
          <div key={si} style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <div className="sub-header" style={{
                color: section.color, margin: '0', padding: '0',
                border: 'none', flex: 1,
              }}>
                {section.label}
              </div>
              <div style={{
                fontFamily: 'var(--mono)', fontSize: '10px',
                letterSpacing: '1px', textTransform: 'uppercase',
                color: sectionComplete ? section.color : 'var(--text-dim)',
                transition: 'color 0.2s',
                marginLeft: '12px', flexShrink: 0,
              }}>
                {sectionComplete ? '✓ Done' : `${sectionDone} / ${section.items.length}`}
              </div>
            </div>

            {/* Thin section progress bar */}
            <div style={{
              height: '2px',
              background: 'var(--border)',
              borderRadius: '1px',
              marginBottom: '10px',
              overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${(sectionDone / section.items.length) * 100}%`,
                background: section.color,
                borderRadius: '1px',
                transition: 'width 0.35s ease',
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item, ii) => (
                <CheckItem
                  key={ii}
                  item={item}
                  done={!!checked[item]}
                  sectionColor={section.color}
                  onToggle={toggle}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function CheckItem({ item, done, sectionColor, onToggle }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      role="checkbox"
      aria-checked={done}
      tabIndex={0}
      onClick={() => onToggle(item)}
      onKeyDown={e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); onToggle(item) } }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '13px',
        padding: '10px 16px',
        background: done ? 'var(--check-done-bg)' : hovered ? 'var(--hover-bg)' : 'var(--panel)',
        border: `1px solid ${
          done    ? 'var(--check-done-border)' :
          hovered ? 'var(--hover-border)'      : 'var(--border)'
        }`,
        borderRadius: '3px',
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        userSelect: 'none',
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: '18px', height: '18px', flexShrink: 0,
        border: `1px solid ${done ? 'var(--accent3)' : hovered ? 'var(--border2)' : 'var(--border2)'}`,
        borderRadius: '2px',
        background: done ? 'var(--accent3)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.12s, border-color 0.12s',
        fontSize: '11px',
        color: 'var(--bg)',
        fontFamily: 'var(--mono)',
      }}>
        {done ? '✓' : ''}
      </div>

      <span style={{
        fontSize: '13px',
        color: done ? 'var(--text-dim)' : 'var(--text)',
        textDecoration: done ? 'line-through' : 'none',
        transition: 'color 0.12s',
        lineHeight: 1.45,
      }}>
        {item}
      </span>
    </div>
  )
}