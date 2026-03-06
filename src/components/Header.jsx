import ThemeToggle from './ThemeToggle'

export default function Header() {
  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      paddingBottom: '44px',
      marginBottom: '0',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '-80px', left: '-60px',
        width: '450px', height: '380px',
        background: 'radial-gradient(ellipse, rgba(0,229,255,0.065) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      {/* PCB trace lines — right side decoration */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '240px',
        pointerEvents: 'none', overflow: 'hidden', opacity: 0.32,
      }}>
        {[18, 50, 84, 118, 152, 188].map((top, i) => (
          <div key={i} style={{
            position: 'absolute', top, right: 0,
            height: '1px',
            width: `${56 + (i % 3) * 44}px`,
            background: `linear-gradient(270deg, transparent, ${
              i % 2 === 0 ? 'var(--accent)' : 'var(--accent2)'
            })`,
          }} />
        ))}
        {[38, 88, 148].map((right, i) => (
          <div key={i} style={{
            position: 'absolute', right, top: 0, bottom: 0,
            width: '1px',
            background: `linear-gradient(180deg, transparent, ${
              i % 2 === 0 ? 'var(--accent)' : 'var(--border2)'
            }, transparent)`,
          }} />
        ))}
        {/* via dots */}
        {[{ r: 38, t: 18 }, { r: 88, t: 84 }, { r: 148, t: 152 }].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute', right: pos.r - 3, top: pos.t - 3,
            width: '6px', height: '6px', borderRadius: '50%',
            border: '1px solid var(--accent)',
            background: 'var(--bg)',
            opacity: 0.6,
          }} />
        ))}
      </div>

      {/* Main header content */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: '24px',
        position: 'relative',
        zIndex: 1,
      }}>
        <div>
          {/* Eyebrow pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            fontFamily: 'var(--mono)', fontSize: '10px',
            color: 'var(--accent)', letterSpacing: '3px', textTransform: 'uppercase',
            marginBottom: '20px',
            padding: '5px 14px',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: '2px',
            background: 'rgba(0,229,255,0.04)',
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: 'var(--accent)',
              boxShadow: '0 0 8px var(--accent)',
              animation: 'blink 2s ease-in-out infinite',
              flexShrink: 0,
            }} />
            PCB Design Reference · Electrical Engineering
          </div>

          {/* Hero title */}
          <h1 style={{
            fontFamily: 'var(--cond)',
            fontSize: 'clamp(50px, 9vw, 106px)',
            fontWeight: 900,
            lineHeight: 0.88,
            color: 'var(--text-bright)',
            textTransform: 'uppercase',
            letterSpacing: '-2px',
          }}>
            Ki<span style={{
              color: 'var(--accent)',
              textShadow: '0 0 44px rgba(0,229,255,0.38)',
            }}>Cad</span>
            <br />
            <span style={{
              color: 'var(--text-dim)',
              fontSize: '0.52em',
              letterSpacing: '-0.5px',
            }}>Master</span>
            {' '}
            <span style={{ color: 'var(--text-bright)' }}>Guide</span>
          </h1>

          {/* Subtitle + tags */}
          <div style={{
            marginTop: '22px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
          }}>
            <p style={{
              fontSize: '13.5px',
              color: 'var(--text-dim)',
              fontWeight: 300,
              letterSpacing: '0.3px',
              lineHeight: 1.5,
            }}>
              Complete reference · Beginners → Intermediate · KiCad 7 / 8
            </p>
            {['Workflow', 'Calculators', 'Checklist'].map((tag, i) => (
              <span key={i} style={{
                fontFamily: 'var(--mono)', fontSize: '9px',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '3px 10px',
                border: '1px solid var(--border2)',
                borderRadius: '20px',
                color: 'var(--text-dim)',
                whiteSpace: 'nowrap',
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
        background: 'linear-gradient(90deg, var(--accent), var(--accent2) 38%, transparent 75%)',
        opacity: 0.38,
      }} />

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px var(--accent); }
          50%       { opacity: 0.35; box-shadow: 0 0 3px var(--accent); }
        }
      `}</style>
    </header>
  )
}