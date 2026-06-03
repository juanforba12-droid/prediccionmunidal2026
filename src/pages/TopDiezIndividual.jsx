import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CATEGORIAS, checkAnswer, getRandomCat } from '../lib/topDiezData.js'
import { supabase } from '../lib/supabase.js'
import { getRankInfo } from '../lib/ranks.js'
import { addPoints, getUserPoints } from '../lib/userPoints.js'

const MEDALS = ['1','2','3','4','5','6','7','8','9','10']

// Barra XP flotante reutilizable
function XPBar({ totalPoints, puntosGanados, color = '#c084fc' }) {
  const rankInfo = getRankInfo(totalPoints)
  const { rank, level, progress } = rankInfo
  const levelStr = rank.levels > 1 ? ` ${['I','II','III'][level-1]}` : ''
  return (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(10,10,26,0.95)', borderTop:`1px solid ${rank.color}33`, padding:'8px 16px', zIndex:50, backdropFilter:'blur(10px)' }}>
      <div style={{ maxWidth:520, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
          <span style={{ fontSize:12, color: rank.color, fontWeight:700 }}>{rank.emoji} {rank.name}{levelStr}</span>
          <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{totalPoints.toLocaleString()} XP</span>
          {puntosGanados > 0 && (
            <span style={{ fontSize:12, color:'#22c55e', fontWeight:800, animation:'fadeInUp 0.4s ease' }}>+{puntosGanados} XP ✨</span>
          )}
        </div>
        <div style={{ height:6, borderRadius:99, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${progress}%`, background:`linear-gradient(90deg, ${rank.color}88, ${rank.color})`, borderRadius:99, transition:'width 0.8s ease' }} />
        </div>
      </div>
    </div>
  )
}

export default function TopDiezIndividual() {
  const nav = useNavigate()
  const [cat, setCat] = useState(() => getRandomCat())
  const [revealed, setRevealed] = useState(Array(10).fill(false))
  const [score, setScore] = useState(0)
  const [roundScore, setRoundScore] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [rendido, setRendido] = useState(false)
  const inputRef = useRef(null)

  // XP sistema
  const [user, setUser] = useState(null)
  const [totalXP, setTotalXP] = useState(0)
  const [lastGained, setLastGained] = useState(0)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user)
        getUserPoints(data.user.id).then(setTotalXP)
      }
    })
  }, [])

  const grantXP = async (pts) => {
    if (!user || pts <= 0) return
    setLastGained(pts)
    setTotalXP(prev => prev + pts)
    await addPoints(user.id, pts, 'topdiez_individual')
    setTimeout(() => setLastGained(0), 2500)
  }

  const found = revealed.filter(Boolean).length
  const finished = found === 10 || rendido

  useEffect(() => {
    if (!finished) setTimeout(() => inputRef.current?.focus(), 100)
  }, [cat])

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 1200)
      return () => clearTimeout(t)
    }
  }, [feedback])

  const handleSubmit = () => {
    if (!input.trim() || finished) return
    const trimmed = input.trim()
    let foundIdx = -1
    cat.top10.forEach((item, i) => { if (checkAnswer(trimmed, item)) foundIdx = i })

    if (foundIdx === -1) {
      setFeedback({ type: 'fail', text: `"${trimmed}" no está en el top 10` })
    } else if (revealed[foundIdx]) {
      setFeedback({ type: 'repeat', text: `${cat.top10[foundIdx].nombre} ya lo tenías` })
    } else {
      const newRev = [...revealed]; newRev[foundIdx] = true
      setRevealed(newRev)
      setRoundScore(s => s + 1)
      setScore(s => s + 1)
      setFeedback({ type: 'ok', text: `✅ #${foundIdx + 1} ${cat.top10[foundIdx].nombre}` })
      // +10 XP por cada acierto en Top 10
      grantXP(10)
    }
    setInput('')
    inputRef.current?.focus()
  }

  const handleRendirse = () => setRendido(true)

  const siguienteRonda = () => {
    setCat(getRandomCat())
    setRevealed(Array(10).fill(false))
    setRoundScore(0)
    setInput('')
    setFeedback(null)
    setRendido(false)
  }

  const fbColor = feedback?.type === 'ok' ? '#22c55e' : feedback?.type === 'repeat' ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c1a,#1a1030,#0c1520)', fontFamily:'system-ui,sans-serif', color:'#e8e0f0', paddingBottom:80 }}>

      {/* HEADER */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(192,132,252,0.15)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => nav('/topdiezgame')} style={{ background:'none', border:'none', color:'#6a5a8a', cursor:'pointer', fontSize:20 }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:900, color:'#c084fc' }}>{cat.titulo}</div>
        </div>
        <div style={{ background:'rgba(192,132,252,0.15)', borderRadius:20, padding:'4px 14px', fontSize:13, fontWeight:900, color:'#c084fc' }}>
          🏆 {score} pts
        </div>
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'16px 16px 0' }}>

        {/* Progreso ronda */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, padding:'10px 16px', background:'rgba(192,132,252,0.08)', borderRadius:10, border:'1px solid rgba(192,132,252,0.12)' }}>
          <span style={{ fontSize:13, color:'#8a7aaa' }}>Esta ronda</span>
          <span style={{ fontSize:20, fontWeight:900, color:'#c084fc' }}>{found}<span style={{ fontSize:13, color:'#6a5a8a' }}>/10</span></span>
          {user && <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)' }}>+10 XP por acierto</span>}
        </div>

        {/* Tabla */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
          {cat.top10.map((item, i) => {
            const isRevealed = revealed[i]
            const isRendidoReveal = rendido && !revealed[i]
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background: isRevealed ? 'rgba(34,197,94,0.1)' : isRendidoReveal ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)', border:`1px solid ${isRevealed ? 'rgba(34,197,94,0.3)' : isRendidoReveal ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`, transition:'all 0.3s' }}>
                <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: isRevealed ? 'rgba(34,197,94,0.25)' : isRendidoReveal ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)', fontSize:11, fontWeight:900, color: isRevealed ? '#22c55e' : isRendidoReveal ? '#f87171' : '#6a5a8a' }}>
                  {MEDALS[i]}
                </div>
                <div style={{ flex:1 }}>
                  {isRevealed || isRendidoReveal ? (
                    <div style={{ fontSize:14, fontWeight:800, color: isRevealed ? '#86efac' : '#fca5a5' }}>{item.nombre}</div>
                  ) : (
                    <div style={{ height:12, borderRadius:4, background:'rgba(255,255,255,0.07)', width:`${45+Math.random()*40}%` }} />
                  )}
                  <div style={{ fontSize:11, color:'#6a5a8a', marginTop:2 }}>🏟️ {item.pista}</div>
                </div>
                {isRevealed && <div style={{ fontSize:16 }}>✅</div>}
                {isRendidoReveal && <div style={{ fontSize:16 }}>❌</div>}
              </div>
            )
          })}
        </div>

        {/* Feedback */}
        <div style={{ height:34, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
          {feedback && (
            <div style={{ fontSize:13, fontWeight:700, color:fbColor, background:`${fbColor}18`, padding:'5px 14px', borderRadius:20, border:`1px solid ${fbColor}44` }}>
              {feedback.text}
            </div>
          )}
        </div>

        {/* Input */}
        {!finished && (
          <div style={{ display:'flex', gap:8, marginBottom:10 }}>
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()}
              placeholder="Escribe un jugador o equipo..."
              style={{ flex:1, padding:'13px 16px', borderRadius:12, border:'1px solid rgba(192,132,252,0.3)', background:'rgba(192,132,252,0.08)', color:'#e8e0f0', fontSize:15, outline:'none' }} />
            <button onClick={handleSubmit} style={{ padding:'13px 18px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#c084fc,#818cf8)', color:'#fff', fontSize:16, fontWeight:900, cursor:'pointer' }}>→</button>
          </div>
        )}

        {/* Resultado final */}
        {finished && (
          <div style={{ textAlign:'center', padding:20, background:'rgba(192,132,252,0.08)', border:'1px solid rgba(192,132,252,0.2)', borderRadius:14, marginBottom:12 }}>
            <div style={{ fontSize:44, marginBottom:8 }}>{found===10?'🏆':rendido?'🏳️':'⚽'}</div>
            <div style={{ fontSize:28, fontWeight:900, color:'#c084fc' }}>{found}/10 esta ronda</div>
            <div style={{ fontSize:16, color:'#fbbf24', fontWeight:700, marginTop:4 }}>Total acumulado: {score} pts</div>
            {user && found > 0 && <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:8 }}>✨ +{found * 10} XP guardados</div>}
          </div>
        )}

        {/* Botones */}
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {finished ? (
            <button onClick={siguienteRonda} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#c084fc,#818cf8)', color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer' }}>
              ⚽ Seguir jugando
            </button>
          ) : (
            <button onClick={handleRendirse} style={{ width:'100%', padding:12, borderRadius:10, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#f87171', fontSize:14, fontWeight:700, cursor:'pointer' }}>
              🏳️ Rendirse
            </button>
          )}
          <button onClick={() => nav('/topdiezgame')} style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#6a5a8a', fontSize:13, cursor:'pointer' }}>
            Salir al menú
          </button>
        </div>
      </div>

      {/* BARRA XP FLOTANTE */}
      {user && <XPBar totalPoints={totalXP} puntosGanados={lastGained} />}

      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
      `}</style>
    </div>
  )
}
