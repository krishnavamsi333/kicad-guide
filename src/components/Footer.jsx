export default function Footer() {
  return (
    <footer style={{
      marginTop: '80px',
      paddingTop: '28px',
      borderTop: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent)',
        opacity: 0.35,
      }} />

      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            letterSpacing: '2px', textTransform: 'uppercase',
            color: 'var(--accent)', opacity: 0.7,
          }}>KiCad Master Guide</span>
          <span style={{ color: 'var(--border2)', fontSize: '10px' }}>·</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '10px',
            letterSpacing: '1px', color: 'var(--text-dim)',
          }}>PCB Design Reference</span>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {['KiCad 7/8', 'IPC-2221', 'JLCPCB DRCs'].map((tag, i) => (
            <span key={i} style={{
              fontFamily: 'var(--mono)', fontSize: '9px',
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: 'var(--text-dim)', opacity: 0.6,
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* PCB trace decoration at bottom */}
      <div style={{
        marginTop: '20px',
        display: 'flex', gap: '8px', alignItems: 'center', opacity: 0.2,
      }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} style={{
            height: '1px',
            width: `${20 + Math.sin(i) * 15}px`,
            background: i % 3 === 0 ? 'var(--accent)' : 'var(--border2)',
            borderRadius: '1px',
          }} />
        ))}
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          border: '1px solid var(--accent)', flexShrink: 0,
        }} />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            height: '1px',
            width: `${15 + i * 5}px`,
            background: 'var(--border2)',
            borderRadius: '1px',
          }} />
        ))}
      </div>
    </footer>
  )
}