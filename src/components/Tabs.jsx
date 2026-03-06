import { useRef, useEffect, useState } from 'react'

const TAB_GROUPS = [
  {
    label: 'Learn',
    color: 'var(--accent3)',
    tabs: [
      { id: 'start',      label: 'What is a PCB?',   icon: '◈' },
      { id: 'components', label: 'Components',        icon: '⬡' },
      { id: 'mistakes',   label: 'Mistakes',          icon: '⚠' },
      { id: 'guides',     label: 'Ref Guides',        icon: '∷' },
    ],
  },
  {
    label: 'Design',
    color: 'var(--accent)',
    tabs: [
      { id: 'workflow',  label: 'Workflow',      icon: '◈' },
      { id: 'schematic', label: 'Schematic',     icon: '⬡' },
      { id: 'layout',    label: 'PCB Layout',    icon: '▦' },
      { id: 'shortcuts', label: 'Shortcuts',     icon: '⌨' },
      { id: 'rules',     label: 'Design Rules',  icon: '◻' },
      { id: 'export',    label: 'Export & Fab',  icon: '⬆' },
    ],
  },
  {
    label: 'Tools',
    color: 'var(--accent2)',
    tabs: [
      { id: 'checklist',   label: 'Checklist',     icon: '✓' },
      { id: 'calculators', label: 'Calculators',   icon: '⚡' },
      { id: 'impedance',   label: 'Impedance',     icon: '∿' },
      { id: 'cost',        label: 'Cost Est.',     icon: '$' },
      { id: 'designtools', label: 'Design Tools',  icon: '⌬' },
      { id: 'resources',   label: 'Resources',     icon: '◉' },
    ],
  },
]

const ALL_TABS = TAB_GROUPS.flatMap(g => g.tabs)

export default function Tabs({ active, onChange }) {
  const [inkStyle, setInkStyle] = useState({ left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const tabRefs = useRef({})

  useEffect(() => {
    const el = tabRefs.current[active]
    if (el) {
      const parent = el.closest('[data-tabbar]')
      if (!parent) return
      const parentRect = parent.getBoundingClientRect()
      const rect = el.getBoundingClientRect()
      setInkStyle({ left: rect.left - parentRect.left, width: rect.width })
      if (!mounted) setMounted(true)
    }
  }, [active])

  return (
    <div style={{ margin: '28px 0 40px' }}>
      {TAB_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: '4px' }}>
          {/* Group label */}
          <div style={{
            fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '2px',
            textTransform: 'uppercase', color: group.color,
            marginBottom: '2px', paddingLeft: '4px', opacity: 0.7,
          }}>
            {group.label}
          </div>

          {/* Tab bar for this group */}
          <div
            data-tabbar="true"
            style={{
              display: 'flex', gap: '2px', flexWrap: 'wrap',
              borderBottom: '1px solid var(--border)',
              position: 'relative', marginBottom: '6px',
            }}
          >
            {/* Sliding ink — only for the group containing the active tab */}
            {group.tabs.some(t => t.id === active) && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute', bottom: 0,
                  left: inkStyle.left, width: inkStyle.width,
                  height: '2px',
                  background: `linear-gradient(90deg, ${group.color}, var(--accent2))`,
                  boxShadow: `0 0 10px var(--ink-glow)`,
                  transition: mounted
                    ? 'left 0.3s cubic-bezier(0.4,0,0.2,1), width 0.3s cubic-bezier(0.4,0,0.2,1)'
                    : 'none',
                  borderRadius: '2px 2px 0 0', zIndex: 2,
                }}
              />
            )}

            {group.tabs.map(tab => {
              const isActive = active === tab.id
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  ref={el => tabRefs.current[tab.id] = el}
                  onClick={() => onChange(tab.id)}
                  style={{
                    fontFamily: 'var(--mono)', fontSize: '10px',
                    letterSpacing: '1.5px', textTransform: 'uppercase',
                    padding: '9px 14px', border: 'none',
                    background: isActive ? 'var(--tab-active-bg)' : 'transparent',
                    color: isActive ? group.color : 'var(--text-dim)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'color 0.15s, background 0.15s',
                    position: 'relative', marginBottom: '-1px',
                    borderRadius: '3px 3px 0 0',
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
                  <span style={{ fontSize: '11px', opacity: isActive ? 1 : 0.4 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Keyboard hint */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px',
        fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', opacity: 0.4,
        marginTop: '4px',
      }}>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 5px' }}>←</span>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 5px' }}>→</span>
        <span style={{ marginLeft: '4px' }}>navigate</span>
      </div>
    </div>
  )
}