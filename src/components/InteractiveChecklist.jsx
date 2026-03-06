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
    label: 'Checks',
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
const STORAGE_KEY = 'kicad-checklist-v1'

export default function InteractiveChecklist() {
  // ── Load from localStorage ──────────────────────────────────────
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // ── Persist to localStorage on every change ─────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checked))
    } catch {
      // Storage unavailable — silently ignore
    }
  }, [checked])

  const toggle = useCallback((item) => {
    setChecked(prev => ({ ...prev, [item]: !prev[item] }))
  }, [])

  const reset = useCallback(() => {
    setChecked({})
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  const totalDone  = ALL_ITEMS.filter(i => checked[i]).length
  const totalCount = ALL_ITEMS.length
  const pct        = Math.round((totalDone / totalCount) * 100)

  const barColor = pct === 100 ? 'var(--accent3)'
    : pct > 60  ? 'var(--accent)'
    : pct > 30  ? 'var(--accent4)'
    : 'var(--accent2)'

  return (
    <div className="fade-in">
      <div className="section-title">Pre-Fab Checklist</div>
      <p className="section-desc">
        Tick off each item before ordering.{' '}
        <span style={{ color: 'var(--accent3)', fontFamily: 'var(--mono)', fontSize: '11px' }}>
          ✓ Progress saved automatically
        </span>
      </p>

      {/* ── Progress bar ─────────────────────────────────────────── */}
      <div style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: '2px',
        padding: '20px 24px',
        marginBottom: '32px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
            Progress
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '24px', fontWeight: 700, color: barColor }}>
              {pct}%
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dim)' }}>
              {totalDone}/{totalCount}
            </span>
            <button
              onClick={reset}
              style={{
                fontFamily: 'var(--mono)', fontSize: '10px',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '6px 14px', border: '1px solid var(--border)',
                background: 'var(--bg3)', color: 'var(--text-dim)',
                cursor: 'pointer', borderRadius: '2px',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--red)'
                e.currentTarget.style.color = 'var(--red)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.color = 'var(--text-dim)'
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* Track */}
        <div style={{ height: '6px', background: 'var(--bg3)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: barColor,
            borderRadius: '3px',
            transition: 'width 0.3s ease, background 0.3s ease',
          }} />
        </div>

        {pct === 100 && (
          <div style={{
            marginTop: '12px',
            fontFamily: 'var(--mono)',
            fontSize: '12px',
            color: 'var(--accent3)',
            letterSpacing: '1px',
          }}>
            ✓ ALL CHECKS PASSED — READY TO ORDER
          </div>
        )}
      </div>

      {/* ── Sections ─────────────────────────────────────────────── */}
      {SECTIONS.map((section, si) => {
        const sectionDone = section.items.filter(i => checked[i]).length
        const sectionComplete = sectionDone === section.items.length

        return (
          <div key={si} style={{ marginBottom: '28px' }}>
            <div className="sub-header" style={{ color: section.color, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{section.label}</span>
              <span style={{
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                color: sectionComplete ? 'var(--accent3)' : 'var(--text-dim)',
                letterSpacing: '1px',
              }}>
                {sectionComplete ? '✓ DONE' : `${sectionDone}/${section.items.length}`}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {section.items.map((item, ii) => {
                const done = !!checked[item]
                return (
                  <CheckItem
                    key={ii}
                    item={item}
                    done={done}
                    sectionColor={section.color}
                    onToggle={toggle}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Extracted to avoid inline style churn on every render ──────────
function CheckItem({ item, done, sectionColor, onToggle }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onToggle(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '10px 16px',
        // Use CSS vars — works in both themes
        background: done ? 'var(--check-done-bg)' : hovered ? 'var(--hover-bg)' : 'var(--panel)',
        border: `1px solid ${
          done    ? 'var(--check-done-border)' :
          hovered ? 'var(--hover-border)'      :
          'var(--border)'
        }`,
        borderRadius: '2px',
        cursor: 'pointer',
        transition: 'background 0.12s, border-color 0.12s',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Checkbox */}
      <div style={{
        width: '18px',
        height: '18px',
        flexShrink: 0,
        border: `1px solid ${done ? 'var(--accent3)' : 'var(--border2)'}`,
        borderRadius: '2px',
        background: done ? 'var(--accent3)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        lineHeight: 1.4,
      }}>
        {item}
      </span>
    </div>
  )
}