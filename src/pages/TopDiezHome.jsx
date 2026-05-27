import { useNavigate } from 'react-router-dom'

export default function TopDiezHome() {
  const nav = useNavigate()
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0f0c1a 0%, #1a1030 50%, #0c1520 100%)',
      fontFamily: 'system-ui, sans-serif', color: '#e8e0f0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <button onClick={() => nav('/')} style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: 'none', color: '#6a5a8a', cursor: 'pointer', fontSize: 20 }}>←</button>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 10 }}>🏆</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 6, color: '#c084fc', lineHeight: 1 }}>TOP 10</div>
        <div style={{ fontSize: 13, color: '#6a5a8a', marginTop: 8, letterSpacing: 2 }}>FÚTBOL</div>
      </div>

      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <button onClick={() => nav('/topdiezgame/individual')} style={{
          padding: '22px 24px', borderRadius: 18,
          border: '1px solid rgba(192,132,252,0.3)',
          background: 'rgba(192,132,252,0.08)',
          cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🧩</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#c084fc', marginBottom: 4 }}>Individual</div>
          <div style={{ fontSize: 13, color: '#6a5a8a', lineHeight: 1.5 }}>Juega solo. Te sale un top 10 aleatorio. Adivina todos los que puedas.</div>
        </button>

        <button onClick={() => nav('/topdiezgame/online')} style={{
          padding: '22px 24px', borderRadius: 18,
          border: '1px solid rgba(251,191,36,0.3)',
          background: 'rgba(251,191,36,0.06)',
          cursor: 'pointer', textAlign: 'left',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>🌐</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#fbbf24', marginBottom: 4 }}>Online</div>
          <div style={{ fontSize: 13, color: '#6a5a8a', lineHeight: 1.5 }}>Juega con amigos por turnos. El marcador se acumula partida a partida.</div>
        </button>
      </div>
    </div>
  )
}
