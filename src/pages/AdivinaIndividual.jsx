import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JUGADORES, getRandomJugador, checkAnswer } from '../lib/adivinaData.js'

const MAX_PISTAS = 7
const MAX_VIDAS = 3

export default function AdivinaIndividual() {
  const nav = useNavigate()
  const [jugador, setJugador] = useState(() => getRandomJugador())
  const [pistasReveladas, setPistasReveladas] = useState(1)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [vidas, setVidas] = useState(MAX_VIDAS)
  const [puntosTotal, setPuntosTotal] = useState(0)
  const [estado, setEstado] = useState('jugando') // jugando | acertado | rendido
  const [historial, setHistorial] = useState([])
  const [mostrandoInput, setMostrandoInput] = useState(false)

  const puntosRonda = MAX_PISTAS - pistasReveladas + 1

  const siguientePista = () => {
    if (pistasReveladas < MAX_PISTAS) {
      setPistasReveladas(p => p + 1)
      setMostrandoInput(false)
    }
  }

  const intentarAdivinar = () => {
    setMostrandoInput(true)
    setTimeout(() => document.getElementById('adivina-input')?.focus(), 100)
  }

  const handleSubmit = () => {
    if (!input.trim()) return
    if (checkAnswer(input, jugador)) {
      const pts = puntosRonda
      setPuntosTotal(p => p + pts)
      setHistorial(h => [...h, { nombre: jugador.nombre, pts, acierto: true }])
      setEstado('acertado')
      setFeedback(null)
    } else {
      const nuevasVidas = vidas - 1
      setVidas(nuevasVidas)
      setFeedback(`❌ "${input}" no es correcto`)
      setInput('')
      setMostrandoInput(false)
      setTimeout(() => setFeedback(null), 1500)
      if (nuevasVidas <= 0) {
        setHistorial(h => [...h, { nombre: jugador.nombre, pts: 0, acierto: false }])
        setEstado('rendido')
      }
    }
  }

  const rendirse = () => {
    setHistorial(h => [...h, { nombre: jugador.nombre, pts: 0, acierto: false }])
    setEstado('rendido')
  }

  const siguienteRonda = () => {
    const usados = historial.map(h => JUGADORES.find(j => j.nombre === h.nombre)?.id).filter(Boolean)
    setJugador(getRandomJugador(usados))
    setPistasReveladas(1)
    setInput('')
    setFeedback(null)
    setVidas(MAX_VIDAS)
    setEstado('jugando')
    setMostrandoInput(false)
  }

  const vidasArr = Array(MAX_VIDAS).fill(0).map((_, i) => i < vidas)

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a0f1a,#0f1a2e,#0a0f1a)', fontFamily:'system-ui,sans-serif', color:'#e8eaf0', paddingBottom:60 }}>

      {/* HEADER */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(99,179,237,0.15)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => nav('/adivina')} style={{ background:'none', border:'none', color:'#6a7a8a', cursor:'pointer', fontSize:20 }}>←</button>
        <div style={{ flex:1, fontSize:14, fontWeight:900, color:'#63b3ed', letterSpacing:1 }}>ADIVINA EL JUGADOR</div>
        <div style={{ display:'flex', gap:4 }}>
          {vidasArr.map((viva, i) => <span key={i} style={{ fontSize:18 }}>{viva ? '❤️' : '🖤'}</span>)}
        </div>
        <div style={{ background:'rgba(99,179,237,0.15)', borderRadius:20, padding:'4px 14px', fontSize:13, fontWeight:900, color:'#63b3ed' }}>
          🏆 {puntosTotal} pts
        </div>
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'20px 16px 0' }}>

        {/* Pistas */}
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
          {jugador.pistas.slice(0, pistasReveladas).map((pista, i) => (
            <div key={i} style={{
              padding:'14px 16px', borderRadius:12,
              background: i === pistasReveladas - 1 ? 'rgba(99,179,237,0.1)' : 'rgba(255,255,255,0.04)',
              border:`1px solid ${i === pistasReveladas - 1 ? 'rgba(99,179,237,0.35)' : 'rgba(255,255,255,0.07)'}`,
              animation: i === pistasReveladas - 1 ? 'fadeIn 0.3s ease' : 'none',
            }}>
              <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(99,179,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:'#63b3ed', flexShrink:0 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize:14, color:'#c8d8ea', lineHeight:1.5 }}>{pista}</div>
                <div style={{ marginLeft:'auto', fontSize:11, color:'#4a6080', flexShrink:0 }}>+{MAX_PISTAS - i} pts</div>
              </div>
            </div>
          ))}

          {/* Pistas ocultas */}
          {estado === 'jugando' && Array(MAX_PISTAS - pistasReveladas).fill(0).map((_, i) => (
            <div key={i} style={{ padding:'14px 16px', borderRadius:12, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:24, height:24, borderRadius:'50%', background:'rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#2a3a4a' }}>{pistasReveladas + i + 1}</div>
              <div style={{ flex:1, height:10, borderRadius:4, background:'rgba(255,255,255,0.05)' }} />
              <div style={{ fontSize:11, color:'#2a3a4a' }}>+{MAX_PISTAS - pistasReveladas - i} pts</div>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div style={{ textAlign:'center', marginBottom:12, padding:'8px 16px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, fontSize:14, color:'#f87171', fontWeight:700 }}>
            {feedback}
          </div>
        )}

        {/* Estado: jugando */}
        {estado === 'jugando' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {mostrandoInput ? (
              <div style={{ display:'flex', gap:8 }}>
                <input
                  id="adivina-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Nombre o apellido..."
                  style={{ flex:1, padding:'13px 16px', borderRadius:12, border:'1px solid rgba(99,179,237,0.3)', background:'rgba(99,179,237,0.08)', color:'#e8eaf0', fontSize:15, outline:'none' }}
                />
                <button onClick={handleSubmit} style={{ padding:'13px 18px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#63b3ed,#4299e1)', color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer' }}>→</button>
              </div>
            ) : (
              <button onClick={intentarAdivinar} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#63b3ed,#4299e1)', color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer' }}>
                🎯 Intentar adivinar — +{puntosRonda} pts
              </button>
            )}

            {pistasReveladas < MAX_PISTAS && (
              <button onClick={siguientePista} style={{ width:'100%', padding:13, borderRadius:12, border:'1px solid rgba(99,179,237,0.25)', background:'rgba(99,179,237,0.06)', color:'#63b3ed', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                💡 Ver pista {pistasReveladas + 1} de {MAX_PISTAS} (+{MAX_PISTAS - pistasReveladas} pts)
              </button>
            )}

            <button onClick={rendirse} style={{ width:'100%', padding:11, borderRadius:10, border:'1px solid rgba(239,68,68,0.25)', background:'rgba(239,68,68,0.06)', color:'#f87171', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              🏳️ Rendirse
            </button>
            <button onClick={() => nav('/adivina')} style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#4a6080', fontSize:13, cursor:'pointer' }}>
              Salir al menú
            </button>
          </div>
        )}

        {/* Estado: acertado */}
        {estado === 'acertado' && (
          <div style={{ textAlign:'center', padding:20, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:14, marginBottom:12 }}>
            <div style={{ fontSize:52, marginBottom:8 }}>🎉</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#22c55e', marginBottom:4 }}>¡Correcto!</div>
            <div style={{ fontSize:28, fontWeight:900, color:'#86efac', marginBottom:4 }}>{jugador.nombre}</div>
            <div style={{ fontSize:16, color:'#63b3ed', fontWeight:700, marginBottom:4 }}>+{puntosRonda} pts esta ronda</div>
            <div style={{ fontSize:14, color:'#fbbf24', fontWeight:700, marginBottom:20 }}>Total: {puntosTotal} pts</div>
            <button onClick={siguienteRonda} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#63b3ed,#4299e1)', color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer', marginBottom:8 }}>
              ⚽ Siguiente jugador
            </button>
            <button onClick={() => nav('/adivina')} style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#4a6080', fontSize:13, cursor:'pointer' }}>
              Salir al menú
            </button>
          </div>
        )}

        {/* Estado: rendido / sin vidas */}
        {estado === 'rendido' && (
          <div style={{ textAlign:'center', padding:20, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:14, marginBottom:12 }}>
            <div style={{ fontSize:52, marginBottom:8 }}>{vidas <= 0 ? '💔' : '🏳️'}</div>
            <div style={{ fontSize:18, fontWeight:900, color:'#f87171', marginBottom:4 }}>{vidas <= 0 ? '¡Sin vidas!' : 'Te has rendido'}</div>
            <div style={{ fontSize:13, color:'#8a9ab0', marginBottom:4 }}>Era:</div>
            <div style={{ fontSize:26, fontWeight:900, color:'#e8eaf0', marginBottom:4 }}>{jugador.nombre}</div>
            <div style={{ fontSize:14, color:'#fbbf24', fontWeight:700, marginBottom:20 }}>Total acumulado: {puntosTotal} pts</div>
            <button onClick={siguienteRonda} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#63b3ed,#4299e1)', color:'#fff', fontSize:15, fontWeight:900, cursor:'pointer', marginBottom:8 }}>
              ⚽ Siguiente jugador
            </button>
            <button onClick={() => nav('/adivina')} style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#4a6080', fontSize:13, cursor:'pointer' }}>
              Salir al menú
            </button>
          </div>
        )}

        {/* Historial */}
        {historial.length > 0 && (
          <div style={{ marginTop:20, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:14 }}>
            <div style={{ fontSize:11, color:'#4a6080', letterSpacing:2, marginBottom:10, textTransform:'uppercase' }}>Historial</div>
            {historial.map((h, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:13 }}>
                <span style={{ color: h.acierto ? '#86efac' : '#f87171' }}>{h.acierto ? '✅' : '❌'} {h.nombre}</span>
                <span style={{ color:'#fbbf24', fontWeight:700 }}>{h.pts > 0 ? `+${h.pts} pts` : '0 pts'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
