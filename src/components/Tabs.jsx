import { useRef, useEffect, useState } from 'react'

const TABS = [
  { id: 'workflow',     label: 'Workflow',      icon: '◈' },
  { id: 'schematic',   label: 'Schematic',     icon: '⬡' },
  { id: 'layout',      label: 'PCB Layout',    icon: '▦' },
  { id: 'shortcuts',   label: 'Shortcuts',     icon: '⌨' },
  { id: 'rules',       label: 'Design Rules',  icon: '◻' },
  { id: 'export',      label: 'Export & Fab',  icon: '⬆' },
  { id: 'checklist',   label: 'Checklist',     icon: '✓' },
  { id: 'calculators', label: 'Calculators',   icon: '⚡' },
  { id: 'impedance',   label: 'Impedance',     icon: '∿' },
  { id: 'cost',        label: 'Cost Est.',     icon: '$' },
  { id: 'designtools', label: 'Design Tools',  icon: '⌬' },
  { id: 'resources',   label: 'Resources',     icon: '◉' },
]

export default function Tabs({ active, onChange }) {
  const [inkStyle, setInkStyle] = useState({ left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const tabRefs = useRef({})

  useEffect(() => {
    const el = tabRefs.current[active]
    if (el) {
      const parent = el.parentElement.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      setInkStyle({ left: rect.left - parent.left, width: rect.width })
      if (!mounted) setMounted(true)
    }
  }, [active])

  return (
    <div style={{ position: 'relative', margin: '32px 0 40px' }}>
      <div
        role="tablist"
        aria-label="Guide sections"
        style={{
          display: 'flex',
          gap: '2px',
          flexWrap: 'wrap',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        {/* Sliding ink underline */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: inkStyle.left,
            width: inkStyle.width,
            height: '2px',
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            boxShadow: `0 0 10px var(--ink-glow)`,
            // Only animate after first mount — avoids slide-in from 0 on load
            transition: mounted
              ? 'left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)'
              : 'none',
            borderRadius: '2px 2px 0 0',
            zIndex: 2,
          }}
        />

        {TABS.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              ref={el => tabRefs.current[tab.id] = el}
              onClick={() => onChange(tab.id)}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                padding: '12px 16px',
                border: 'none',
                // Use CSS vars so light/dark both work
                background: isActive ? 'var(--tab-active-bg)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'color 0.15s, background 0.15s',
                position: 'relative',
                marginBottom: '-1px',
                borderRadius: '3px 3px 0 0',
                // Prevent blurry sub-pixel text
                WebkitFontSmoothing: 'antialiased',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--hover-text)'
                  e.currentTarget.style.background = 'var(--hover-bg)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = 'var(--text-dim)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <span style={{
                fontSize: '11px',
                opacity: isActive ? 1 : 0.5,
                transition: 'opacity 0.15s',
                // Crisp icon rendering
                imageRendering: 'pixelated',
                fontStyle: 'normal',
              }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Keyboard hint */}
      <div style={{
        position: 'absolute',
        right: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        color: 'var(--text-dim)',
        opacity: 0.5,
        letterSpacing: '1px',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 5px' }}>←</span>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 5px' }}>→</span>
      </div>
    </div>
  )
}