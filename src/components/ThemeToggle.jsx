import { useState, useEffect } from 'react'

// Mirror of App.jsx applyTheme — keeps toggle in sync with system preference
function applyTheme(dark) {
  const root = document.documentElement
  root.setAttribute('data-theme', dark ? 'dark' : 'light')
  if (dark) {
    root.style.setProperty('--bg',          '#07090a')
    root.style.setProperty('--bg2',         '#0b1013')
    root.style.setProperty('--bg3',         '#0f1619')
    root.style.setProperty('--panel',       '#0c1417')
    root.style.setProperty('--panel2',      '#101c20')
    root.style.setProperty('--border',      '#172530')
    root.style.setProperty('--border2',     '#1f3340')
    root.style.setProperty('--accent',      '#00e5ff')
    root.style.setProperty('--accent2',     '#ff6b35')
    root.style.setProperty('--accent3',     '#39ff14')
    root.style.setProperty('--accent4',     '#ffd600')
    root.style.setProperty('--text',        '#a8bfc6')
    root.style.setProperty('--text-dim',    '#3d5560')
    root.style.setProperty('--text-bright', '#ddf0f5')
    root.style.setProperty('--red',         '#ff3b5c')
    root.style.setProperty('--hover-bg',    'rgba(0,229,255,0.06)')
    root.style.setProperty('--hover-border','rgba(0,229,255,0.35)')
    root.style.setProperty('--hover-text',  '#c8dde3')
    root.style.setProperty('--check-done-bg',     '#0a1f14')
    root.style.setProperty('--check-done-border', 'rgba(57,255,20,0.18)')
    root.style.setProperty('--ink-glow',    'rgba(0,229,255,0.6)')
    root.style.setProperty('--tab-active-bg','rgba(0,229,255,0.04)')
    root.style.setProperty('--grid-opacity','0.018')
    root.style.setProperty('--shadow-card', '0 4px 24px rgba(0,0,0,0.45)')
    root.style.setProperty('--shadow-hover','0 8px 36px rgba(0,0,0,0.6)')
  } else {
    root.style.setProperty('--bg',          '#eef3f5')
    root.style.setProperty('--bg2',         '#e4ecef')
    root.style.setProperty('--bg3',         '#d6e2e6')
    root.style.setProperty('--panel',       '#f8fbfc')
    root.style.setProperty('--panel2',      '#eef3f5')
    root.style.setProperty('--border',      '#c0d3da')
    root.style.setProperty('--border2',     '#a8c2cb')
    root.style.setProperty('--accent',      '#0097b2')
    root.style.setProperty('--accent2',     '#d44e1a')
    root.style.setProperty('--accent3',     '#1f8f00')
    root.style.setProperty('--accent4',     '#a07800')
    root.style.setProperty('--text',        '#1c3a45')
    root.style.setProperty('--text-dim',    '#6a8f9a')
    root.style.setProperty('--text-bright', '#0a1f28')
    root.style.setProperty('--red',         '#cc1f3a')
    root.style.setProperty('--hover-bg',    'rgba(0,151,178,0.08)')
    root.style.setProperty('--hover-border','rgba(0,151,178,0.5)')
    root.style.setProperty('--hover-text',  '#0a2530')
    root.style.setProperty('--check-done-bg',     '#eaf5e8')
    root.style.setProperty('--check-done-border', 'rgba(31,143,0,0.25)')
    root.style.setProperty('--ink-glow',    'rgba(0,151,178,0.4)')
    root.style.setProperty('--tab-active-bg','rgba(0,151,178,0.07)')
    root.style.setProperty('--grid-opacity','0.06')
    root.style.setProperty('--shadow-card', '0 2px 12px rgba(0,0,0,0.1)')
    root.style.setProperty('--shadow-hover','0 6px 24px rgba(0,0,0,0.15)')
  }
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Sync toggle state with system preference changes
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e) => setDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const handleToggle = () => {
    const next = !dark
    setDark(next)
    applyTheme(next)
  }

  return (
    <button
      onClick={handleToggle}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        fontFamily: 'var(--mono)',
        fontSize: '10px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        padding: '9px 16px',
        border: '1px solid var(--border)',
        background: 'var(--panel)',
        color: 'var(--text-dim)',
        cursor: 'pointer',
        borderRadius: '2px',
        transition: 'border-color 0.18s, color 0.18s, background 0.18s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.color = 'var(--accent)'
        e.currentTarget.style.background = 'var(--hover-bg)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.color = 'var(--text-dim)'
        e.currentTarget.style.background = 'var(--panel)'
      }}
    >
      <span style={{ fontSize: '13px' }}>{dark ? '☀' : '☾'}</span>
      {dark ? 'Light' : 'Dark'}
    </button>
  )
}