import { useNavigate } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative' }}>
      <div className="bg-dots" />
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 20% 20%, rgba(230,57,70,0.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(42,157,143,0.08) 0%, transparent 55%)' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:420, textAlign:'center' }}>
        <div className="tag fade-up" style={{ marginBottom:12 }}>FIFA World Cup 2026</div>

        <div className="fade-up" style={{ animationDelay:'.05s', fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(60px,16vw,90px)', lineHeight:1,
          background:'linear-gradient(135deg,#e63946 0%,#f4a261 50%,#e63946 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:4 }}>
          QUINIELA
        </div>
        <div className="fade-up" style={{ animationDelay:'.1s', fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(22px,6vw,32px)', color:'#2a4060', letterSpacing:10, marginBottom:40 }}>
          MUNDIAL 2026
        </div>

        <div className="fade-up" style={{ animationDelay:'.15s', display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
          <button className="btn btn-primary" style={{ fontSize:17, padding:'16px' }} onClick={() => nav('/crear')}>
            ⚽ Crear grupo
          </button>
          <button className="btn btn-ghost" style={{ fontSize:17, padding:'16px' }} onClick={() => nav('/unirse')}>
            🔗 Unirse con código
          </button>
        </div>

        <div className="fade-up" style={{ animationDelay:'.2s', display:'flex', gap:28, justifyContent:'center', flexWrap:'wrap' }}>
          {[['72','partidos'],['12','grupos'],['3 pts','marcador exacto'],['1 pt','resultado']].map(([v,l]) => (
            <div key={l} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:'#e63946' }}>{v}</div>
              <div style={{ fontSize:10, color:'#2a4060', letterSpacing:1 }}>{l}</div>
            </div>
          ))}
        </div>

        <div className="fade-up" style={{ animationDelay:'.25s', marginTop:48, fontSize:12, color:'#1a2a3a' }}>
          🇺🇸 🇨🇦 🇲🇽 · 11 Jun – 19 Jul 2026
        </div>
      </div>
    </div>
  )
}
