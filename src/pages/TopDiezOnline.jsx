import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { checkAnswer, getRandomCat } from '../lib/topDiezData.js'
import { addPoints } from '../lib/userPoints.js'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const MEDALS = ['1','2','3','4','5','6','7','8','9','10']

export default function TopDiezOnline() {
  const nav = useNavigate()
  const [screen, setScreen] = useState('menu') // menu | sala | jugando
  const [myName, setMyName] = useState('')
  const [codigoInput, setCodigoInput] = useState('')
  const [session, setSession] = useState(null)
  const [myUid, setMyUid] = useState(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sesionesGuardadas, setSesionesGuardadas] = useState([])
  const inputRef = useRef(null)
  const pollRef = useRef(null)
  const myUidRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      let uid = data.user?.id
      if (!uid) {
        // Usuario no logueado — uid anónimo persistente en localStorage
        uid = localStorage.getItem('anon_uid')
        if (!uid) {
          uid = 'anon_' + Math.random().toString(36).substring(2, 12)
          localStorage.setItem('anon_uid', uid)
        }
      }
      setMyUid(uid)
      myUidRef.current = uid
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'Jugador'
      setMyName(name)
    })
    const saved = JSON.parse(localStorage.getItem('topdiezgame_sesiones') || '[]')
    setSesionesGuardadas(saved)
  }, [])

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 1500)
      return () => clearTimeout(t)
    }
  }, [feedback])

  const loadSession = useCallback(async (code) => {
    const c = code || session?.code
    if (!c) return
    const { data } = await supabase.from('topdiezgame_sessions').select('*').eq('code', c).single()
    if (data) setSession(data)
  }, [session?.code])

  useEffect(() => {
    if (screen === 'sala' || screen === 'jugando') {
      pollRef.current = setInterval(() => loadSession(), 1500)
      return () => clearInterval(pollRef.current)
    }
  }, [screen, loadSession])

  useEffect(() => {
    if (session?.estado === 'jugando' && screen === 'sala') setScreen('jugando')
    if (session?.estado === 'esperando' && screen === 'jugando') setScreen('sala')
  }, [session?.estado])

  useEffect(() => {
    if (screen === 'jugando' && !esMiTurno()) return
    if (screen === 'jugando') setTimeout(() => inputRef.current?.focus(), 100)
  }, [session?.turno_idx, screen])

  const update = async (changes) => {
    if (!session) return
    await supabase.from('topdiezgame_sessions').update(changes).eq('code', session.code)
  }

  const crearSesion = async () => {
    if (!myName.trim()) { setError('Pon tu nombre'); return }
    if (!myUid) { setError('Cargando...'); return }
    setLoading(true); setError('')
    const code = generateCode()
    const cat = getRandomCat()
    const { error: err } = await supabase.from('topdiezgame_sessions').insert({
      code, creator_id: myUid, estado: 'esperando',
      jugadores: [{ id: myUid, nombre: myName.trim(), puntos: 0 }],
      categoria: cat,
      revealed: Array(10).fill(false),
      turno_idx: 0,
      historial: [],
    })
    if (err) { setError('Error al crear'); setLoading(false); return }
    localStorage.setItem(`topdiezgame_name_${code}`, myName.trim())
    const saved = JSON.parse(localStorage.getItem('topdiezgame_sesiones') || '[]')
    const nueva = { code, nombre: myName.trim(), uid: myUid, esHost: true }
    const nuevas = [...saved.filter(s => s.code !== code), nueva]
    localStorage.setItem('topdiezgame_sesiones', JSON.stringify(nuevas))
    setSesionesGuardadas(nuevas)
    await loadSession(code)
    setScreen('sala')
    setLoading(false)
  }

  const unirse = async () => {
    if (!myName.trim()) { setError('Pon tu nombre'); return }
    if (!codigoInput.trim()) { setError('Pon el código'); return }
    if (!myUid) { setError('Cargando...'); return }
    setLoading(true); setError('')
    const code = codigoInput.toUpperCase()
    const { data: s } = await supabase.from('topdiezgame_sessions').select('*').eq('code', code).single()
    if (!s) { setError('Sesión no encontrada'); setLoading(false); return }
    const jugadores = [...(s.jugadores || [])]
    const yaEsta = jugadores.find(j => j.id === myUid)
    if (!yaEsta && s.estado !== 'esperando') {
      setError('La partida ya empezó y no eres parte de ella')
      setLoading(false); return
    }
    if (!yaEsta) {
      jugadores.push({ id: myUid, nombre: myName.trim(), puntos: 0 })
      await supabase.from('topdiezgame_sessions').update({ jugadores }).eq('code', code)
    }
    localStorage.setItem(`topdiezgame_name_${code}`, myName.trim())
    const saved = JSON.parse(localStorage.getItem('topdiezgame_sesiones') || '[]')
    const nueva = { code, nombre: myName.trim(), uid: myUid, esHost: false }
    const nuevas = [...saved.filter(s => s.code !== code), nueva]
    localStorage.setItem('topdiezgame_sesiones', JSON.stringify(nuevas))
    setSesionesGuardadas(nuevas)
    await loadSession(code)
    setScreen(s.estado === 'esperando' ? 'sala' : 'jugando')
    setLoading(false)
  }

  const iniciarPartida = async () => {
    await update({ estado: 'jugando' })
  }

  const esMiTurno = () => {
    if (!session || !myUid) return false
    const activos = session.jugadores || []
    const idx = session.turno_idx % activos.length
    return activos[idx]?.id === myUid
  }

  const jugadorActual = () => {
    if (!session) return null
    const activos = session.jugadores || []
    return activos[session.turno_idx % activos.length]
  }

  const handleSubmit = async () => {
    if (!input.trim() || !esMiTurno()) return
    const trimmed = input.trim()
    const cat = session.categoria
    const revealed = [...session.revealed]
    const jugadores = session.jugadores.map(j => ({ ...j }))

    let foundIdx = -1
    cat.top10.forEach((item, i) => { if (checkAnswer(trimmed, item)) foundIdx = i })

    const turnoActual = session.turno_idx % jugadores.length
    const nextTurno = session.turno_idx + 1

    if (foundIdx === -1 || revealed[foundIdx]) {
      // Fallo o repetido — pasa turno
      setFeedback({ type: 'fail', text: foundIdx === -1 ? `"${trimmed}" no está` : `${cat.top10[foundIdx].nombre} ya estaba` })
      await update({ turno_idx: nextTurno })
    } else {
      // Acierto
      revealed[foundIdx] = true
      jugadores[turnoActual].puntos = (jugadores[turnoActual].puntos || 0) + 1
      const historial = [...(session.historial || []), { jugador: jugadores[turnoActual].nombre, nombre: cat.top10[foundIdx].nombre, pos: foundIdx + 1 }]
      setFeedback({ type: 'ok', text: `✅ +1 para ${jugadores[turnoActual].nombre}` })
      // XP: leer uid fresco de auth para garantizar que es el uid real registrado
      const { data: authData } = await supabase.auth.getUser()
      const authUid = authData?.user?.id
      if (authUid) addPoints(authUid, 10, 'topdiezgame_online')

      const allRevealed = revealed.every(Boolean)
      if (allRevealed) {
        await update({ revealed, jugadores, historial, estado: 'fin_ronda' })
      } else {
        await update({ revealed, jugadores, historial, turno_idx: nextTurno })
      }
    }
    setInput('')
  }

  const siguienteRonda = async () => {
    const newCat = getRandomCat()
    await update({
      categoria: newCat,
      revealed: Array(10).fill(false),
      turno_idx: 0,
      historial: [],
      estado: 'jugando',
    })
  }

  const salir = () => {
    clearInterval(pollRef.current)
    setSession(null)
    setScreen('menu')
  }

  const abandonarSesion = async () => {
    if (session) {
      const jugadores = session.jugadores.filter(j => j.id !== myUid)
      if (jugadores.length === 0) {
        await supabase.from('topdiezgame_sessions').delete().eq('code', session.code)
      } else {
        await update({ jugadores })
      }
      quitarSesionLocal(session.code)
    }
    clearInterval(pollRef.current)
    setSession(null)
    setScreen('menu')
  }

  const quitarSesionLocal = (code) => {
    const nuevas = sesionesGuardadas.filter(s => s.code !== code)
    localStorage.setItem('topdiezgame_sesiones', JSON.stringify(nuevas))
    setSesionesGuardadas(nuevas)
  }

  const eliminarSesion = async (code) => {
    await supabase.from('topdiezgame_sessions').delete().eq('code', code)
    quitarSesionLocal(code)
  }

  const volverASesion = async (s) => {
    setLoading(true)
    const { data } = await supabase.from('topdiezgame_sessions').select('*').eq('code', s.code).single()
    if (!data) { setError('Sesión no encontrada, puede que haya sido eliminada'); quitarSesionLocal(s.code); setLoading(false); return }
    const jugadores = data.jugadores || []
    const yaEsta = jugadores.find(j => j.id === myUid)
    if (!yaEsta) {
      if (data.estado === 'esperando') {
        const nuevosJugadores = [...jugadores, { id: myUid, nombre: s.nombre, puntos: 0 }]
        await supabase.from('topdiezgame_sessions').update({ jugadores: nuevosJugadores }).eq('code', s.code)
      } else {
        setError('Ya no eres parte de esta sesión'); quitarSesionLocal(s.code); setLoading(false); return
      }
    }
    setSession(data)
    setScreen(data.estado === 'esperando' ? 'sala' : 'jugando')
    setLoading(false)
  }

  const rendirse = async () => {
    await update({ revealed: Array(10).fill(true), estado: 'fin_ronda' })
  }

  const inp = { width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.06)', color:'#e8e0f0', fontSize:15, boxSizing:'border-box', outline:'none', marginBottom:10 }
  const cat = session?.categoria

  // ── MENÚ ──
  if (screen === 'menu') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c1a,#1a1030,#0c1520)', fontFamily:'system-ui,sans-serif', color:'#e8e0f0', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <button onClick={() => nav('/topdiezgame')} style={{ background:'none', border:'none', color:'#6a5a8a', cursor:'pointer', fontSize:20, marginBottom:24 }}>←</button>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:42, marginBottom:6 }}>🌐</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:'#fbbf24', letterSpacing:4 }}>TOP 10 ONLINE</div>
        </div>

        {sesionesGuardadas.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:'#4a3a6a', letterSpacing:2, marginBottom:10, textTransform:'uppercase' }}>Tus partidas</div>
            {sesionesGuardadas.map(s => (
              <div key={s.code} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)', borderRadius:12, padding:'10px 14px', marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#fbbf24', fontSize:16, letterSpacing:2 }}>{s.code}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{s.nombre} · {s.esHost ? 'Host' : 'Jugador'}</div>
                </div>
                <button onClick={() => volverASesion(s)} disabled={loading} style={{ padding:'6px 14px', borderRadius:8, border:'none', background:'#fbbf24', color:'#0a0a1a', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                  Volver
                </button>
                <button onClick={() => s.esHost ? eliminarSesion(s.code) : quitarSesionLocal(s.code)}
                  style={{ padding:'6px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#f87171', fontSize:13, cursor:'pointer' }}>
                  {s.esHost ? '🗑️' : '✕'}
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:14, color:'#fca5a5', fontSize:14 }}>{error}</div>}
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:6 }}>Tu nombre</div>
        <input style={inp} value={myName} onChange={e => setMyName(e.target.value)} placeholder="Tu nombre" />
        <button onClick={crearSesion} disabled={loading} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', color:'#0a0a1a', fontSize:15, fontWeight:900, cursor:'pointer', marginBottom:12 }}>
          {loading ? 'Cargando...' : '+ Crear partida'}
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <input style={{ ...inp, marginBottom:0, flex:1 }} value={codigoInput} onChange={e => setCodigoInput(e.target.value.toUpperCase())} placeholder="Código" maxLength={6} />
          <button onClick={unirse} disabled={loading} style={{ padding:'12px 18px', borderRadius:10, border:'1px solid rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.08)', color:'#fbbf24', fontSize:14, fontWeight:700, cursor:'pointer', flexShrink:0 }}>
            Unirse
          </button>
        </div>
      </div>
    </div>
  )

  // ── SALA ESPERA ──
  if (screen === 'sala' && session) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c1a,#1a1030,#0c1520)', fontFamily:'system-ui,sans-serif', color:'#e8e0f0', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400, textAlign:'center' }}>
        <div style={{ fontSize:42, marginBottom:10 }}>⏳</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:'#fbbf24', letterSpacing:4, marginBottom:6 }}>SALA DE ESPERA</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:'#fbbf24', letterSpacing:8, marginBottom:4 }}>{session.code}</div>
        <div style={{ fontSize:12, color:'#6a5a8a', marginBottom:28 }}>Comparte este código con tus amigos</div>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16, marginBottom:20, textAlign:'left' }}>
          <div style={{ fontSize:12, color:'#6a5a8a', marginBottom:10, letterSpacing:2 }}>JUGADORES ({session.jugadores?.length || 0})</div>
          {session.jugadores?.map(j => (
            <div key={j.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: j.id===myUid ? '#fbbf24' : '#22c55e' }} />
              <span style={{ fontWeight:700, color: j.id===myUid ? '#fbbf24' : '#e8e0f0' }}>{j.nombre} {j.id===myUid ? '(tú)' : ''}</span>
            </div>
          ))}
        </div>
        {session.creator_id === myUid && (
          <button onClick={iniciarPartida} disabled={(session.jugadores?.length || 0) < 2} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background: (session.jugadores?.length||0) < 2 ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#fbbf24,#f59e0b)', color: (session.jugadores?.length||0) < 2 ? '#4a4a6a' : '#0a0a1a', fontSize:15, fontWeight:900, cursor: (session.jugadores?.length||0) < 2 ? 'not-allowed' : 'pointer', marginBottom:10 }}>
            {(session.jugadores?.length||0) < 2 ? 'Esperando jugadores...' : '¡Empezar partida!'}
          </button>
        )}
        {session.creator_id !== myUid && <div style={{ fontSize:13, color:'#6a5a8a', marginBottom:10 }}>Esperando a que el host empiece...</div>}
        <button onClick={salir} style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#6a5a8a', fontSize:13, cursor:'pointer', marginBottom:8 }}>← Salir al menú</button>
        <button onClick={abandonarSesion} style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(239,68,68,0.2)', background:'none', color:'#f87171', fontSize:12, cursor:'pointer' }}>Abandonar partida</button>
      </div>
    </div>
  )

  // ── JUGANDO ──
  if ((screen === 'jugando' || session?.estado === 'fin_ronda') && session && cat) {
    const esMi = esMiTurno()
    const jActual = jugadorActual()
    const finRonda = session.estado === 'fin_ronda'
    const revealed = session.revealed || Array(10).fill(false)
    const found = revealed.filter(Boolean).length

    return (
      <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c1a,#1a1030,#0c1520)', fontFamily:'system-ui,sans-serif', color:'#e8e0f0', paddingBottom:60 }}>

        {/* HEADER */}
        <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(251,191,36,0.15)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1, fontSize:12, fontWeight:700, color:'#fbbf24' }}>{cat.titulo}</div>
          <div style={{ fontSize:11, color:'#6a5a8a' }}>Código: <span style={{ color:'#fbbf24', fontWeight:700 }}>{session.code}</span></div>
        </div>

        <div style={{ display:'flex', minHeight:'calc(100vh - 49px)' }}>

          {/* SIDEBAR */}
          <div style={{
            width: 220, flexShrink:0,
            padding:'20px 16px',
            borderRight:'1px solid rgba(251,191,36,0.1)',
            background:'rgba(0,0,0,0.2)',
            display:'flex', flexDirection:'column', gap:8,
            position:'sticky', top:49, height:'calc(100vh - 49px)',
            overflowY:'auto',
          }} className="sidebar-ranking">
            <div style={{ fontSize:11, color:'#4a3a6a', letterSpacing:2, marginBottom:8, textTransform:'uppercase' }}>Clasificación</div>

            {[...session.jugadores].sort((a,b) => (b.puntos||0)-(a.puntos||0)).map((j, i) => {
              const esTurno = j.id === jActual?.id
              const medals = ['🥇','🥈','🥉']
              return (
                <div key={j.id} style={{
                  padding:'12px 14px', borderRadius:12,
                  background: esTurno ? 'rgba(251,191,36,0.12)' : j.id===myUid ? 'rgba(192,132,252,0.08)' : 'rgba(255,255,255,0.04)',
                  border:`1px solid ${esTurno ? 'rgba(251,191,36,0.4)' : j.id===myUid ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  transition:'all 0.3s',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                    <span style={{ fontSize:18 }}>{medals[i] || `${i+1}º`}</span>
                    <div style={{ flex:1, fontSize:12, fontWeight:700, color: j.id===myUid ? '#fbbf24' : '#c8d8ea', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {j.nombre}{j.id===myUid ? ' (tú)' : ''}
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color: esTurno ? '#fbbf24' : '#c084fc', lineHeight:1, textAlign:'center' }}>
                    {j.puntos||0}
                  </div>
                  <div style={{ fontSize:10, color:'#4a3a6a', textAlign:'center', marginTop:2 }}>pts</div>
                  {esTurno && !finRonda && (
                    <div style={{ marginTop:8, fontSize:10, color:'#fbbf24', textAlign:'center', fontWeight:700, background:'rgba(251,191,36,0.1)', borderRadius:6, padding:'3px 0' }}>
                      {j.id===myUid ? '👉 TU TURNO' : '⏳ SU TURNO'}
                    </div>
                  )}
                </div>
              )
            })}

            <div style={{ marginTop:'auto', paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:11, color:'#6a5a8a', marginBottom:6, textAlign:'center' }}>
                {found}/10 encontrados
              </div>
              <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${found*10}%`, background:'linear-gradient(90deg,#fbbf24,#f59e0b)', borderRadius:2, transition:'width 0.4s' }} />
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div style={{ flex:1, maxWidth:520, margin:'0 auto', padding:'16px 16px 0' }}>

            {!finRonda && (
              <div style={{ textAlign:'center', marginBottom:12, padding:'8px 16px', background: esMi ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)', borderRadius:10, border:`1px solid ${esMi ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}` }}>
                <div style={{ fontSize:13, fontWeight:700, color: esMi ? '#fbbf24' : '#8a7aaa' }}>
                  {esMi ? '👉 ¡Es tu turno!' : `⏳ Turno de ${jActual?.nombre}`}
                </div>
              </div>
            )}

            {/* Tabla top 10 */}
            <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14 }}>
              {cat.top10.map((item, i) => {
                const isRev = revealed[i]
                const isFinRev = finRonda && !revealed[i]
                const quien = session.historial?.find(h => h.pos === i+1)
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 12px', borderRadius:10, background: isRev ? 'rgba(34,197,94,0.1)' : isFinRev ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)', border:`1px solid ${isRev ? 'rgba(34,197,94,0.25)' : isFinRev ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)'}`, transition:'all 0.3s' }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: isRev ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)', fontSize:10, fontWeight:900, color: isRev ? '#22c55e' : '#6a5a8a' }}>{MEDALS[i]}</div>
                    <div style={{ flex:1 }}>
                      {isRev || isFinRev ? (
                        <div style={{ fontSize:13, fontWeight:800, color: isRev ? '#86efac' : '#fca5a5' }}>
                          {item.nombre} {quien && <span style={{ fontSize:10, color:'#fbbf24', fontWeight:400 }}>({quien.jugador})</span>}
                        </div>
                      ) : (
                        <div style={{ height:11, borderRadius:3, background:'rgba(255,255,255,0.07)', width:`${45+(i*7)%40}%` }} />
                      )}
                      <div style={{ fontSize:10, color:'#6a5a8a', marginTop:1 }}>🏟️ {item.pista}</div>
                    </div>
                    {isRev && <div style={{ fontSize:14 }}>✅</div>}
                    {isFinRev && <div style={{ fontSize:14 }}>❌</div>}
                  </div>
                )
              })}
            </div>

            {/* Feedback */}
            <div style={{ height:32, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
              {feedback && (
                <div style={{ fontSize:13, fontWeight:700, color: feedback.type==='ok'?'#22c55e':'#ef4444', background:`${feedback.type==='ok'?'#22c55e':'#ef4444'}18`, padding:'4px 14px', borderRadius:20, border:`1px solid ${feedback.type==='ok'?'#22c55e':'#ef4444'}44` }}>
                  {feedback.text}
                </div>
              )}
            </div>

            {/* Input */}
            {!finRonda && esMi && (
              <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==='Enter' && handleSubmit()}
                  placeholder="Escribe un nombre..."
                  style={{ flex:1, padding:'12px 14px', borderRadius:12, border:'1px solid rgba(251,191,36,0.3)', background:'rgba(251,191,36,0.06)', color:'#e8e0f0', fontSize:14, outline:'none' }} />
                <button onClick={handleSubmit} style={{ padding:'12px 16px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', color:'#0a0a1a', fontSize:15, fontWeight:900, cursor:'pointer' }}>→</button>
              </div>
            )}
            {!finRonda && !esMi && (
              <div style={{ textAlign:'center', padding:'12px', background:'rgba(255,255,255,0.03)', borderRadius:10, marginBottom:10, fontSize:13, color:'#6a5a8a' }}>
                Esperando a {jActual?.nombre}...
              </div>
            )}

            {/* Rendirse — solo el host */}
            {!finRonda && session.creator_id === myUid && (
              <button onClick={rendirse} style={{ width:'100%', padding:11, borderRadius:10, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#f87171', fontSize:13, fontWeight:700, cursor:'pointer', marginBottom:8 }}>
                🏳️ Rendirse — mostrar respuestas
              </button>
            )}

            {/* Fin ronda */}
            {finRonda && (
              <div style={{ textAlign:'center', padding:16, background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)', borderRadius:14, marginBottom:12 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>🏆</div>
                <div style={{ fontSize:20, fontWeight:900, color:'#fbbf24', marginBottom:12 }}>¡Ronda completada!</div>
                {[...session.jugadores].sort((a,b) => (b.puntos||0)-(a.puntos||0)).map((j,i) => (
                  <div key={j.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:14, color: j.id===myUid ? '#fbbf24' : '#e8e0f0' }}>
                    <span>{i===0?'🥇':i===1?'🥈':'🥉'} {j.nombre}</span>
                    <span style={{ fontWeight:900 }}>{j.puntos||0} pts</span>
                  </div>
                ))}
                {session.creator_id === myUid && (
                  <button onClick={siguienteRonda} style={{ width:'100%', marginTop:16, padding:13, borderRadius:12, border:'none', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', color:'#0a0a1a', fontSize:15, fontWeight:900, cursor:'pointer' }}>
                    ⚽ Seguir jugando
                  </button>
                )}
                {session.creator_id !== myUid && <div style={{ fontSize:13, color:'#6a5a8a', marginTop:12 }}>Esperando al host...</div>}
              </div>
            )}

            <button onClick={salir} style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#6a5a8a', fontSize:13, cursor:'pointer', marginBottom:6 }}>
              ← Salir al menú
            </button>
            <button onClick={abandonarSesion} style={{ width:'100%', padding:8, borderRadius:10, border:'1px solid rgba(239,68,68,0.15)', background:'none', color:'#f87171', fontSize:11, cursor:'pointer' }}>
              Abandonar partida
            </button>
          </div>
        </div>
        <style>{`@media(max-width:640px){.sidebar-ranking{display:none!important}}`}</style>
      </div>
    )
  }

  return null
}
