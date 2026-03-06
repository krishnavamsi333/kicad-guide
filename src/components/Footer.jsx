export default function Footer() {
  return (
    <footer style={{
      marginTop: '88px',
      paddingTop: '28px',
      borderTop: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* gradient accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent)',
        opacity: 0.32,
      }} />

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '20px',
      }}>
        {/* Left: branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--accent)', opacity: 0.75,
          }}>KiCad Master Guide</span>
          <span style={{ color: 'var(--border2)', fontSize: '12px' }}>·</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            letterSpacing: '1px', color: 'var(--text-dim)',
          }}>PCB Design Reference</span>
        </div>

        {/* Right: standard/version tags */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {['KiCad 7 / 8', 'IPC-2221', 'JLCPCB DRCs'].map((tag, i) => (
            <span key={i} style={{
              fontFamily: 'var(--mono)', fontSize: '9px',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: 'var(--text-dim)', opacity: 0.55,
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Keyboard navigation hint */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontFamily: 'var(--mono)', fontSize: '10px',
        color: 'var(--text-dim)', opacity: 0.35,
        marginBottom: '18px',
      }}>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 6px' }}>←</span>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 6px' }}>→</span>
        <span>navigate tabs</span>
        <span style={{ marginLeft: '8px', opacity: 0.5 }}>·</span>
        <span style={{ border: '1px solid var(--border)', borderRadius: '2px', padding: '1px 6px', marginLeft: '8px' }}>/</span>
        <span>search shortcuts</span>
      </div>

      {/* PCB trace decoration */}
      <div style={{
        display: 'flex',
        gap: '7px',
        alignItems: 'center',
        opacity: 0.18,
        overflow: 'hidden',
      }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} style={{
            height: '1px',
            width: `${18 + Math.abs(Math.sin(i * 0.8)) * 22}px`,
            background: i % 4 === 0 ? 'var(--accent)' : i % 4 === 2 ? 'var(--accent2)' : 'var(--border2)',
            borderRadius: '1px',
            flexShrink: 0,
          }} />
        ))}
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          border: '1px solid var(--accent)', flexShrink: 0,
        }} />
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} style={{
            height: '1px',
            width: `${12 + i * 4}px`,
            background: 'var(--border2)',
            borderRadius: '1px',
            flexShrink: 0,
          }} />
        ))}
      </div>
    </footer>
  )
}