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
  { id: 'resources',   label: 'Resources',     icon: '◉' },
]

export default function Tabs({ active, onChange }) {
  const [inkStyle, setInkStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef({})

  useEffect(() => {
    const el = tabRefs.current[active]
    if (el) {
      const parent = el.parentElement.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      setInkStyle({ left: rect.left - parent.left, width: rect.width })
    }
  }, [active])

  return (
    <div style={{ position: 'relative', margin: '32px 0 40px' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        gap: '2px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0',
        position: 'relative',
      }}>
        {/* Sliding ink underline */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: inkStyle.left,
          width: inkStyle.width,
          height: '2px',
          background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
          boxShadow: '0 0 12px rgba(0,229,255,0.6)',
          transition: 'left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)',
          borderRadius: '2px 2px 0 0',
          zIndex: 2,
        }} />

        {TABS.map(tab => {
          const isActive = active === tab.id
          return (
            <button
              key={tab.id}
              ref={el => tabRefs.current[tab.id] = el}
              onClick={() => onChange(tab.id)}
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                padding: '12px 16px',
                border: 'none',
                background: isActive ? 'rgba(0,229,255,0.04)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-dim)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                transition: 'color 0.2s, background 0.2s',
                position: 'relative',
                marginBottom: '-1px',
                borderRadius: '3px 3px 0 0',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--text-dim)' }}
            >
              <span style={{
                fontSize: '11px',
                opacity: isActive ? 1 : 0.5,
                transition: 'opacity 0.2s',
              }}>{tab.icon}</span>
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}