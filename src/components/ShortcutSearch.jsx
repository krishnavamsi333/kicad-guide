import { useState } from 'react'

const ALL_SHORTCUTS = [
  { key: 'A',            desc: 'Add component/symbol',            editor: 'Schematic' },
  { key: 'W',            desc: 'Draw wire',                       editor: 'Schematic' },
  { key: 'P',            desc: 'Add power symbol',                editor: 'Schematic' },
  { key: 'L',            desc: 'Add net label',                   editor: 'Schematic' },
  { key: 'Q',            desc: 'Add no-connect flag',             editor: 'Schematic' },
  { key: 'E',            desc: 'Edit component properties',       editor: 'Schematic' },
  { key: 'R',            desc: 'Rotate 90°',                      editor: 'Schematic' },
  { key: 'X',            desc: 'Mirror horizontally',             editor: 'Schematic' },
  { key: 'Y',            desc: 'Mirror vertically',               editor: 'Schematic' },
  { key: 'G',            desc: 'Grab (move with wires attached)', editor: 'Schematic' },
  { key: 'M',            desc: 'Move (without wires)',            editor: 'Schematic' },
  { key: 'D',            desc: 'Drag wire segment',               editor: 'Schematic' },
  { key: 'J',            desc: 'Add junction dot',                editor: 'Schematic' },
  { key: 'DEL',          desc: 'Delete',                          editor: 'Schematic' },
  { key: 'Esc',          desc: 'Cancel current action',           editor: 'Schematic' },
  { key: 'Ctrl+Z',       desc: 'Undo',                            editor: 'Schematic' },
  { key: 'Ctrl+D',       desc: 'Duplicate',                       editor: 'Schematic' },
  { key: 'Ctrl+S',       desc: 'Save',                            editor: 'Schematic' },
  { key: 'X',            desc: 'Route track (start routing)',     editor: 'PCB' },
  { key: '/',            desc: 'Switch active layer (adds via)',  editor: 'PCB' },
  { key: 'B',            desc: 'Fill all copper zones',           editor: 'PCB' },
  { key: 'Ctrl+B',       desc: 'Unfill all copper zones',         editor: 'PCB' },
  { key: 'W',            desc: 'Set track width (while routing)', editor: 'PCB' },
  { key: 'U',            desc: 'Select connected track',          editor: 'PCB' },
  { key: 'I',            desc: 'Select whole track',              editor: 'PCB' },
  { key: 'E',            desc: 'Edit properties',                 editor: 'PCB' },
  { key: 'R',            desc: 'Rotate',                          editor: 'PCB' },
  { key: 'F',            desc: 'Flip to other side',              editor: 'PCB' },
  { key: 'G',            desc: 'Grab and drag',                   editor: 'PCB' },
  { key: 'M',            desc: 'Move',                            editor: 'PCB' },
  { key: 'T',            desc: 'Add text',                        editor: 'PCB' },
  { key: '`',            desc: 'Highlight net (click pad/trace)', editor: 'PCB' },
  { key: 'Alt+3',        desc: 'Open 3D viewer',                  editor: 'PCB' },
  { key: 'Ctrl+Shift+Z', desc: 'Add filled zone',                 editor: 'PCB' },
  { key: 'F8',           desc: 'Update PCB from schematic',       editor: 'PCB' },
  { key: 'Space',        desc: 'Set relative origin',             editor: 'PCB' },
  { key: 'Scroll',       desc: 'Zoom in/out',                     editor: 'Universal' },
  { key: 'Ctrl+Scroll',  desc: 'Pan up/down',                     editor: 'Universal' },
  { key: 'Middle btn',   desc: 'Pan',                             editor: 'Universal' },
  { key: 'Ctrl+A',       desc: 'Select all',                      editor: 'Universal' },
  { key: '?',            desc: 'Open shortcut list',              editor: 'Universal' },
]

const EDITOR_COLORS = {
  Schematic: 'var(--accent)',
  PCB:       'var(--accent2)',
  Universal: 'var(--accent3)',
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button onClick={handleCopy} title="Copy shortcut" style={{
      fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '1px',
      padding: '3px 8px', border: `1px solid ${copied ? 'var(--accent3)' : 'var(--border)'}`,
      background: copied ? 'var(--accent3)22' : 'transparent',
      color: copied ? 'var(--accent3)' : 'var(--text-dim)',
      cursor: 'pointer', borderRadius: '2px', transition: 'all 0.15s', flexShrink: 0,
    }}>
      {copied ? '✓' : '⎘'}
    </button>
  )
}

export default function ShortcutSearch() {
  const [query, setQuery]   = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = ALL_SHORTCUTS.filter(s => {
    const matchEditor = filter === 'All' || s.editor === filter
    const q = query.toLowerCase()
    const matchQuery = !q || s.key.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
    return matchEditor && matchQuery
  })

  return (
    <div className="fade-in">
      <div className="section-title">Shortcut Search</div>
      <p className="section-desc">Search by action or key name. Click ⎘ to copy any shortcut to clipboard.</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: '14px', color: 'var(--text-dim)' }}>⌕</span>
          <input type="text" placeholder="Search... e.g. rotate, fill, via, zone"
            value={query} onChange={e => setQuery(e.target.value)}
            style={{
              width: '100%', background: 'var(--panel)', border: '1px solid var(--border)',
              borderRadius: '2px', padding: '12px 16px 12px 38px',
              fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)', outline: 'none', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {['All', 'Schematic', 'PCB', 'Universal'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              fontFamily: 'var(--mono)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase',
              padding: '10px 16px',
              border: `1px solid ${filter === f ? (EDITOR_COLORS[f] || 'var(--accent)') : 'var(--border)'}`,
              background: filter === f ? (EDITOR_COLORS[f] || 'var(--accent)') + '22' : 'var(--panel)',
              color: filter === f ? (EDITOR_COLORS[f] || 'var(--accent)') : 'var(--text-dim)',
              cursor: 'pointer', borderRadius: '2px', transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', marginBottom: '16px' }}>
        {filtered.length} SHORTCUT{filtered.length !== 1 ? 'S' : ''} FOUND
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-dim)', fontFamily: 'var(--mono)', fontSize: '13px' }}>
          No shortcuts match "{query}"
        </div>
      ) : (
        <div className="shortcut-grid">
          {filtered.map((s, i) => (
            <div className="shortcut-item" key={i}>
              <span className="key">{s.key}</span>
              <span className="key-desc" style={{ flex: 1 }}>{s.desc}</span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', color: EDITOR_COLORS[s.editor], flexShrink: 0, marginRight: '8px' }}>
                {s.editor === 'Universal' ? 'Both' : s.editor}
              </span>
              <CopyButton text={s.key} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}