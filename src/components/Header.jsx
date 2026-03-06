import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      paddingBottom: '40px',
      marginBottom: '0',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Ambient glow top-left */}
      <div style={{
        position: 'absolute', top: '-60px', left: '-40px',
        width: '400px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(0,229,255,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* PCB trace lines decorating the right side */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '220px',
        pointerEvents: 'none', overflow: 'hidden', opacity: 0.35,
      }}>
        {[20, 50, 80, 120, 155, 185].map((top, i) => (
          <div key={i} style={{
            position: 'absolute', top, right: 0,
            height: '1px',
            width: `${60 + (i % 3) * 40}px`,
            background: `linear-gradient(270deg, transparent, ${i % 2 === 0 ? 'var(--accent)' : 'var(--accent2)'})`,
          }} />
        ))}
        {[40, 90, 140].map((right, i) => (
          <div key={i} style={{
            position: 'absolute', right, top: 0, bottom: 0,
            width: '1px',
            background: `linear-gradient(180deg, transparent, ${i % 2 === 0 ? 'var(--accent)' : 'var(--border2)'}, transparent)`,
          }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
        <div>
          {/* Eyebrow tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase',
            marginBottom: '18px',
            padding: '5px 12px',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: '2px',
            background: 'rgba(0,229,255,0.04)',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 8px var(--accent)',
              animation: 'pulse-dot 2s ease-in-out infinite',
            }} />
            PCB Design Reference — Electrical Engineering
          </div>

          {/* Main title */}
          <h1 style={{
            fontFamily: 'var(--cond)',
            fontSize: 'clamp(52px, 9vw, 108px)',
            fontWeight: 900,
            lineHeight: 0.88,
            color: 'var(--text-bright)',
            textTransform: 'uppercase',
            letterSpacing: '-3px',
          }}>
            Ki<span style={{
              color: 'var(--accent)',
              textShadow: '0 0 40px rgba(0,229,255,0.4)',
            }}>Cad</span>
            <br />
            <span style={{ color: 'var(--text-dim)', fontSize: '0.55em', letterSpacing: '-1px' }}>Master</span>
            {' '}
            <span style={{ color: 'var(--text-bright)' }}>Guide</span>
          </h1>

          {/* Subtitle row */}
          <div style={{
            marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
          }}>
            <p style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 300, letterSpacing: '0.3px' }}>
              Complete reference · Beginners → Intermediate · KiCad 7/8
            </p>
            {['Workflow', 'Calculators', 'Checklist'].map((tag, i) => (
              <span key={i} style={{
                fontFamily: 'var(--mono)', fontSize: '9px',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '3px 10px',
                border: '1px solid var(--border2)',
                borderRadius: '20px',
                color: 'var(--text-dim)',
              }}>{tag}</span>
            ))}
          </div>
        </div>

        <ThemeToggle />
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, var(--accent), var(--accent2) 40%, transparent 80%)',
        opacity: 0.4,
      }} />

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--accent); }
          50%       { opacity: 0.5; box-shadow: 0 0 3px var(--accent); }
        }
      `}</style>
    </header>
  )
}