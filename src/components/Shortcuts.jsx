import React from 'react'

const schematicShortcuts = [
  { key: 'A',       desc: 'Add component/symbol' },
  { key: 'W',       desc: 'Draw wire' },
  { key: 'P',       desc: 'Add power symbol' },
  { key: 'L',       desc: 'Add net label' },
  { key: 'Q',       desc: 'Add no-connect flag' },
  { key: 'E',       desc: 'Edit component properties' },
  { key: 'R',       desc: 'Rotate 90°' },
  { key: 'X',       desc: 'Mirror horizontally' },
  { key: 'Y',       desc: 'Mirror vertically' },
  { key: 'G',       desc: 'Grab (move with wires attached)' },
  { key: 'M',       desc: 'Move (without wires)' },
  { key: 'D',       desc: 'Drag wire segment' },
  { key: 'J',       desc: 'Add junction dot' },
  { key: 'DEL',     desc: 'Delete' },
  { key: 'Esc',     desc: 'Cancel current action' },
  { key: 'Ctrl+Z',  desc: 'Undo' },
  { key: 'Ctrl+D',  desc: 'Duplicate' },
  { key: 'Ctrl+S',  desc: 'Save' },
]

const pcbShortcuts = [
  { key: 'X',          desc: 'Route track (start routing)' },
  { key: '/',          desc: 'Switch active layer (adds via)' },
  { key: 'B',          desc: 'Fill all copper zones' },
  { key: 'Ctrl+B',     desc: 'Unfill all copper zones' },
  { key: 'W',          desc: 'Set track width (while routing)' },
  { key: 'U',          desc: 'Select connected track' },
  { key: 'I',          desc: 'Select whole track' },
  { key: 'E',          desc: 'Edit properties' },
  { key: 'R',          desc: 'Rotate' },
  { key: 'F',          desc: 'Flip to other side' },
  { key: 'G',          desc: 'Grab and drag' },
  { key: 'M',          desc: 'Move' },
  { key: 'T',          desc: 'Add text' },
  { key: '`',          desc: 'Highlight net (click pad/trace)' },
  { key: 'Alt+3',      desc: 'Open 3D viewer' },
  { key: 'Ctrl+Shift+Z', desc: 'Add filled zone' },
  { key: 'F8',         desc: 'Update PCB from schematic' },
  { key: 'Space',      desc: 'Set relative origin' },
]

const universalShortcuts = [
  { key: 'Scroll',      desc: 'Zoom in/out' },
  { key: 'Ctrl+Scroll', desc: 'Pan up/down' },
  { key: 'Middle btn',  desc: 'Pan' },
  { key: 'Ctrl+A',      desc: 'Select all' },
  { key: '?',           desc: 'Open shortcut list' },
]

function ShortcutGrid({ items }) {
  return (
    <div className="shortcut-grid">
      {items.map((s, i) => (
        <div className="shortcut-item" key={i}>
          <span className="key">{s.key}</span>
          <span className="key-desc">{s.desc}</span>
        </div>
      ))}
    </div>
  )
}

export default function Shortcuts() {
  return (
    <div className="fade-in">
      <div className="section-title">Keyboard Shortcuts</div>
      <p className="section-desc">Learn these and your speed will double. Works in both Schematic Editor and PCB Editor.</p>

      <div className="sub-header">Schematic Editor (Eeschema)</div>
      <ShortcutGrid items={schematicShortcuts} />

      <div className="sub-header">PCB Editor (Pcbnew)</div>
      <ShortcutGrid items={pcbShortcuts} />

      <div className="sub-header">Universal</div>
      <ShortcutGrid items={universalShortcuts} />
    </div>
  )
}