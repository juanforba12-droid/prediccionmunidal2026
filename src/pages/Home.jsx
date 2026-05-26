import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #0a0a1a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif', padding: '20px'
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, letterSpacing: 12,
          background: 'linear-gradient(135deg, #e63946, #ff6b6b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1, marginBottom: 8
        }}>JFEE</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, letterSpacing: 4, textTransform: 'uppercase' }}>
          Juegos de Futbol En Espanol
        </div>
      </div>

      {/* Game cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 420 }}>

        {/* Prediccion */}
        <button onClick={() => nav('/prediccion')} style={{
          background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.3)',
          borderRadius: 20, padding: '28px 24px', cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.2s', outline: 'none',
          boxShadow: '0 4px 24px rgba(230,57,70,0.1)'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(230,57,70,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(230,57,70,0.08)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(230,57,70,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26
            }}>⚽</div>
            <div>
              <div style={{ color: '#e63946', fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>PREDICCION</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Mundial 2026</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>
            Predice los partidos del Mundial, acumula puntos y compite con tus amigos en tiempo real.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
            {['72 partidos', 'Grupos privados', 'Ranking en vivo'].map(t => (
              <span key={t} style={{ fontSize: 11, color: '#e63946', background: 'rgba(230,57,70,0.1)', padding: '3px 10px', borderRadius: 20 }}>{t}</span>
            ))}
          </div>
        </button>

        {/* Mentiroso */}
        <button onClick={() => nav('/mentiroso')} style={{
          background: 'rgba(155,93,229,0.08)', border: '1px solid rgba(155,93,229,0.3)',
          borderRadius: 20, padding: '28px 24px', cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.2s', outline: 'none',
          boxShadow: '0 4px 24px rgba(155,93,229,0.1)'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(155,93,229,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(155,93,229,0.08)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(155,93,229,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26
            }}>🎭</div>
            <div>
              <div style={{ color: '#9b5de5', fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>MENTIROSO</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>El impostor del futbol</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>
            A cada jugador le sale un nombre, equipo o seleccion. Uno es el impostor. Descubrele antes de que sea tarde.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Multijugador', 'Chat en vivo', 'Votaciones'].map(t => (
              <span key={t} style={{ fontSize: 11, color: '#9b5de5', background: 'rgba(155,93,229,0.1)', padding: '3px 10px', borderRadius: 20 }}>{t}</span>
            ))}
          </div>
        </button>
      </div>

      <div style={{ marginTop: 40, color: 'rgba(255,255,255,0.15)', fontSize: 12, letterSpacing: 2 }}>JFEE © 2026</div>
    </div>
  )
}
