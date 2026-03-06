import { useState, useEffect, useCallback } from 'react'
import './App.css'

import Header               from './components/Header'
import Tabs                 from './components/Tabs'
import Footer               from './components/Footer'
import Workflow             from './components/Workflow'
import Schematic            from './components/Schematic'
import Layout               from './components/Layout'
import ShortcutSearch       from './components/ShortcutSearch'
import Rules                from './components/Rules'
import Export               from './components/Export'
import InteractiveChecklist from './components/InteractiveChecklist'
import TraceCalculator      from './components/TraceCalculator'
import Resources            from './components/Resources'

const TAB_IDS = [
  'workflow', 'schematic', 'layout', 'shortcuts',
  'rules', 'export', 'checklist', 'calculators', 'resources',
]

const SECTIONS = {
  workflow:    <Workflow />,
  schematic:   <Schematic />,
  layout:      <Layout />,
  shortcuts:   <ShortcutSearch />,
  rules:       <Rules />,
  export:      <Export />,
  checklist:   <InteractiveChecklist />,
  calculators: <TraceCalculator />,
  resources:   <Resources />,
}

function getInitialTab() {
  const hash = window.location.hash.replace('#', '')
  return TAB_IDS.includes(hash) ? hash : 'workflow'
}

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
    root.style.setProperty('--check-done-bg', '#0a1f14')
    root.style.setProperty('--check-done-border', 'rgba(57,255,20,0.18)')
    root.style.setProperty('--ink-glow',    'rgba(0,229,255,0.6)')
    root.style.setProperty('--tab-active-bg','rgba(0,229,255,0.04)')
    root.style.setProperty('--grid-opacity','0.018')
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
    root.style.setProperty('--check-done-bg', '#eaf5e8')
    root.style.setProperty('--check-done-border', 'rgba(31,143,0,0.25)')
    root.style.setProperty('--ink-glow',    'rgba(0,151,178,0.4)')
    root.style.setProperty('--tab-active-bg','rgba(0,151,178,0.07)')
    root.style.setProperty('--grid-opacity','0.06')
  }
}

export default function App() {
  const [active, setActive] = useState(getInitialTab)

  // ── System theme detection ──────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    applyTheme(mq.matches)
    const handler = (e) => applyTheme(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // ── URL hash sync ───────────────────────────────────────────────
  const navigate = useCallback((tabId) => {
    setActive(tabId)
    window.history.replaceState(null, '', `#${tabId}`)
  }, [])

  // Handle browser back/forward
  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (TAB_IDS.includes(hash)) setActive(hash)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // ── Keyboard ← → navigation ─────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      // Don't hijack when typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return
      const idx = TAB_IDS.indexOf(active)
      if (e.key === 'ArrowRight' && idx < TAB_IDS.length - 1) {
        navigate(TAB_IDS[idx + 1])
      } else if (e.key === 'ArrowLeft' && idx > 0) {
        navigate(TAB_IDS[idx - 1])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, navigate])

  return (
    <div className="wrapper">
      <Header />
      <Tabs active={active} onChange={navigate} />
      {SECTIONS[active]}
      <Footer />
    </div>
  )
}