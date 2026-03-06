import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.style.setProperty('--bg',         '#0a0e0f')
      root.style.setProperty('--bg2',        '#0f1518')
      root.style.setProperty('--bg3',        '#141c20')
      root.style.setProperty('--panel',      '#111a1e')
      root.style.setProperty('--border',     '#1e2e35')
      root.style.setProperty('--text',       '#c8d8dc')
      root.style.setProperty('--text-dim',   '#5a7880')
      root.style.setProperty('--text-bright','#eef6f8')
    } else {
      root.style.setProperty('--bg',         '#f0f4f5')
      root.style.setProperty('--bg2',        '#e4eaec')
      root.style.setProperty('--bg3',        '#d8e2e5')
      root.style.setProperty('--panel',      '#ffffff')
      root.style.setProperty('--border',     '#b8cdd2')
      root.style.setProperty('--text',       '#1a2e35')
      root.style.setProperty('--text-dim',   '#5a7880')
      root.style.setProperty('--text-bright','#0a1a20')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(d => !d)}
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        fontFamily: 'var(--mono)',
        fontSize: '11px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
        padding: '8px 16px',
        border: '1px solid var(--border)',
        background: 'var(--panel)',
        color: 'var(--text-dim)',
        cursor: 'pointer',
        borderRadius: '2px',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dim)' }}
    >
      {dark ? '☀ Light' : '☾ Dark'}
    </button>
  )
}