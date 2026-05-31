import { useNavigate } from 'react-router-dom'

export default function AdivinaHome() {
  const nav = useNavigate()
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a0f1a,#0f1a2e,#0a0f1a)', fontFamily:'system-ui,sans-serif', color:'#e8eaf0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <button onClick={() => nav('/')} style={{ position:'absolute', top:20, left:20, background:'none', border:'none', color:'#4a6080', cursor:'pointer', fontSize:20 }}>←</button>
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <div style={{ fontSize:56, marginBottom:10 }}>🔍</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:52, letterSpacing:6, color:'#63b3ed', lineHeight:1 }}>ADIVINA</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, letterSpacing:4, color:'#4299e1', lineHeight:1 }}>EL JUGADOR</div>
        <div style={{ fontSize:13, color:'#4a6080', marginTop:8, letterSpacing:2 }}>7 PISTAS · 7 PUNTOS</div>
      </div>
      <div style={{ width:'100%', maxWidth:360, display:'flex', flexDirection:'column', gap:14 }}>
        <button onClick={() => nav('/adivina/individual')} style={{ padding:'22px 24px', borderRadius:18, border:'1px solid rgba(99,179,237,0.3)', background:'rgba(99,179,237,0.08)', cursor:'pointer', textAlign:'left' }}>
          <div style={{ fontSize:28, marginBottom:6 }}>🧩</div>
          <div style={{ fontSize:20, fontWeight:900, color:'#63b3ed', marginBottom:4 }}>Individual</div>
          <div style={{ fontSize:13, color:'#4a6080', lineHeight:1.5 }}>Juega solo con 3 vidas. Pide pistas poco a poco. Cuantas menos pistas uses, más puntos.</div>
        </button>
        <button onClick={() => nav('/adivina/online')} style={{ padding:'22px 24px', borderRadius:18, border:'1px solid rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.06)', cursor:'pointer', textAlign:'left' }}>
          <div style={{ fontSize:28, marginBottom:6 }}>🌐</div>
          <div style={{ fontSize:20, fontWeight:900, color:'#fbbf24', marginBottom:4 }}>Online</div>
          <div style={{ fontSize:13, color:'#4a6080', lineHeight:1.5 }}>Todos ven las mismas pistas. Vota cuándo adivinar. 1 minuto por pista. El que falla queda eliminado.</div>
        </button>
      </div>
    </div>
  )
}
