import { useRef, useEffect, useState } from 'react'

const TAB_GROUPS = [
  {
    label: 'Learn',
    color: 'var(--accent3)',
    tabs: [
      { id: 'start',      label: 'What is a PCB?',  icon: '◈' },
      { id: 'components', label: 'Components',       icon: '⬡' },
      { id: 'mistakes',   label: 'Mistakes',         icon: '⚠' },
      { id: 'datasheet',  label: 'Datasheets',       icon: '∷' },
      { id: 'guides',     label: 'Ref Guides',       icon: '◉' },
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
      { id: 'calculators', label: 'Trace/Via',    icon: '⚡' },
      { id: 'impedance',   label: 'Impedance',    icon: '∿' },
      { id: 'pwmbat',      label: 'PWM & Battery',icon: '◑' },
      { id: 'cost',        label: 'Cost Est.',    icon: '$' },
      { id: 'designtools', label: 'Design Tools', icon: '⌬' },
      { id: 'bus',         label: 'I²C/SPI/UART', icon: '↕' },
      { id: 'production',  label: 'Production',   icon: '⊞' },
      { id: 'resources',   label: 'Resources',    icon: '◉' },
    ],
  },
]

export default function Tabs({ active, onChange }) {
  const [inkStyles, setInkStyles] = useState({})
  const [mounted,   setMounted]   = useState(false)
  const tabRefs = useRef({})

  useEffect(() => {
    const el = tabRefs.current[active]
    if (!el) return
    const bar = el.closest('[data-tabbar]')
    if (!bar) return
    const barRect = bar.getBoundingClientRect()
    const rect    = el.getBoundingClientRect()
    const groupId = el.dataset.group
    setInkStyles(prev => ({
      ...prev,
      [groupId]: { left: rect.left - barRect.left, width: rect.width },
    }))
    if (!mounted) setMounted(true)
  }, [active])

  return (
    <div style={{ margin: '20px 0 36px' }}>
      {TAB_GROUPS.map(group => {
        const groupActive = group.tabs.some(t => t.id === active)
        const ink = inkStyles[group.label] || { left: 0, width: 0 }

        return (
          <div key={group.label} style={{ marginBottom: '2px' }}>
            <div style={{
              fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '2px',
              textTransform: 'uppercase', color: group.color,
              marginBottom: '2px', paddingLeft: '2px', opacity: 0.65,
            }}>{group.label}</div>

            <div data-tabbar="true" style={{
              display: 'flex', gap: '1px', flexWrap: 'wrap',
              borderBottom: '1px solid var(--border)',
              position: 'relative', marginBottom: '4px',
            }}>
              {/* Ink bar */}
              {groupActive && (
                <div aria-hidden="true" style={{
                  position: 'absolute', bottom: 0,
                  left: ink.left, width: ink.width, height: '2px',
                  background: `linear-gradient(90deg, ${group.color}, var(--accent2))`,
                  boxShadow: `0 0 8px var(--ink-glow)`,
                  transition: mounted
                    ? 'left 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1)'
                    : 'none',
                  borderRadius: '2px 2px 0 0', zIndex: 2,
                }} />
              )}

              {group.tabs.map(tab => {
                const isActive = active === tab.id
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    data-group={group.label}
                    ref={el => tabRefs.current[tab.id] = el}
                    onClick={() => onChange(tab.id)}
                    style={{
                      fontFamily: 'var(--mono)', fontSize: '10px',
                      letterSpacing: '1.2px', textTransform: 'uppercase',
                      padding: '8px 12px', border: 'none',
                      background: isActive ? 'var(--tab-active-bg)' : 'transparent',
                      color: isActive ? group.color : 'var(--text-dim)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      transition: 'color 0.13s, background 0.13s',
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
                    <span style={{ fontSize: '11px', opacity: isActive ? 1 : 0.35 }}>{tab.icon}</span>
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px',
        fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)', opacity: 0.35,
      }}>
        {['←','→'].map(k => (
          <span key={k} style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 5px' }}>{k}</span>
        ))}
        <span style={{ marginLeft: '4px' }}>navigate</span>
      </div>
    </div>
  )
}