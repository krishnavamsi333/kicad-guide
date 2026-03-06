import { useRef, useEffect, useState } from 'react'

const TAB_GROUPS = [
  {
    label: 'Learn',
    color: 'var(--accent3)',
    tabs: [
      { id: 'start',      label: 'What is a PCB?', icon: '◈' },
      { id: 'components', label: 'Components',      icon: '⬡' },
      { id: 'mistakes',   label: 'Mistakes',        icon: '⚠' },
      { id: 'guides',     label: 'Ref Guides',      icon: '∷' },
    ],
  },
  {
    label: 'Design',
    color: 'var(--accent)',
    tabs: [
      { id: 'workflow',  label: 'Workflow',     icon: '◈' },
      { id: 'schematic', label: 'Schematic',    icon: '⬡' },
      { id: 'layout',    label: 'PCB Layout',   icon: '▦' },
      { id: 'shortcuts', label: 'Shortcuts',    icon: '⌨' },
      { id: 'rules',     label: 'Design Rules', icon: '◻' },
      { id: 'export',    label: 'Export & Fab', icon: '⬆' },
    ],
  },
  {
    label: 'Tools',
    color: 'var(--accent2)',
    tabs: [
      { id: 'checklist',   label: 'Checklist',    icon: '✓' },
      { id: 'calculators', label: 'Calculators',  icon: '⚡' },
      { id: 'impedance',   label: 'Impedance',    icon: '∿' },
      { id: 'cost',        label: 'Cost Est.',    icon: '$' },
      { id: 'designtools', label: 'Design Tools', icon: '⌬' },
      { id: 'resources',   label: 'Resources',    icon: '◉' },
    ],
  },
]

export default function Tabs({ active, onChange }) {
  const [inkStyle, setInkStyle] = useState({ left: 0, width: 0 })
  const [mounted, setMounted] = useState(false)
  const tabRefs = useRef({})

  useEffect(() => {
    const el = tabRefs.current[active]
    if (!el) return
    const parent = el.closest('[data-tabbar]')
    if (!parent) return
    const parentRect = parent.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    setInkStyle({ left: rect.left - parentRect.left, width: rect.width })
    if (!mounted) setMounted(true)
    // Scroll active tab into view on mobile
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [active])

  return (
    <div style={{ margin: '30px 0 44px' }}>
      {TAB_GROUPS.map((group) => {
        const isGroupActive = group.tabs.some(t => t.id === active)
        return (
          <div key={group.label} style={{ marginBottom: '4px' }}>
            {/* Group label */}
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '9px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: group.color,
              marginBottom: '2px',
              paddingLeft: '4px',
              opacity: 0.7,
            }}>
              {group.label}
            </div>

            {/* Tab bar */}
            <div
              data-tabbar="true"
              style={{
                display: 'flex',
                gap: '2px',
                flexWrap: 'nowrap',
                overflowX: 'auto',
                overflowY: 'hidden',
                borderBottom: '1px solid var(--border)',
                position: 'relative',
                marginBottom: '6px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Hide scrollbar in webkit */}
              <style>{`[data-tabbar]::-webkit-scrollbar { display: none; }`}</style>

              {/* Sliding ink underline */}
              {isGroupActive && (
                <div
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: inkStyle.left,
                    width: inkStyle.width,
                    height: '2px',
                    background: `linear-gradient(90deg, ${group.color}, var(--accent2))`,
                    boxShadow: `0 0 10px var(--ink-glow)`,
                    transition: mounted
                      ? 'left 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1)'
                      : 'none',
                    borderRadius: '2px 2px 0 0',
                    zIndex: 2,
                    pointerEvents: 'none',
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
                    ref={el => { tabRefs.current[tab.id] = el }}
                    onClick={() => onChange(tab.id)}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '10px',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      padding: '9px 13px',
                      border: 'none',
                      background: isActive ? 'var(--tab-active-bg)' : 'transparent',
                      color: isActive ? group.color : 'var(--text-dim)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'color 0.15s, background 0.15s',
                      position: 'relative',
                      marginBottom: '-1px',
                      borderRadius: '3px 3px 0 0',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
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
        )
      })}

      {/* Keyboard navigation hint */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        color: 'var(--text-dim)',
        opacity: 0.38,
        marginTop: '4px',
        userSelect: 'none',
      }}>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 6px' }}>←</span>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 6px' }}>→</span>
        <span style={{ marginLeft: '4px' }}>navigate tabs</span>
      </div>
    </div>
  )
}