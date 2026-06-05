import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getRandomJugador, checkAnswer } from '../lib/adivinaData.js'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const MAX_PISTAS = 7
const TIMER_SECS = 60

export default function AdivinaOnline() {
  const nav = useNavigate()
  const [screen, setScreen] = useState('menu')
  const [myName, setMyName] = useState('')
  const [codigoInput, setCodigoInput] = useState('')
  const [session, setSession] = useState(null)
  const [myUid, setMyUid] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sesionesGuardadas, setSesionesGuardadas] = useState([])
  const [inputAdivina, setInputAdivina] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [timer, setTimer] = useState(TIMER_SECS)
  const [miVoto, setMiVoto] = useState(null)
  const pollRef = useRef(null)
  const timerRef = useRef(null)
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
    setSesionesGuardadas(JSON.parse(localStorage.getItem('adivina_sesiones') || '[]'))
  }, [])

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 1800)
      return () => clearTimeout(t)
    }
  }, [feedback])

  const procesarExpiracion = useCallback(async (data) => {
    if (!data) return
    if (data.estado !== 'jugando') return
    if (data.estado_ronda !== 'votando') return
    if (data.estado_ronda === 'fin_ronda') return
    if (data.estado_ronda === 'mostrar_respuesta') return
    if (!data.pista_expires_at) return
    if (Date.now() < data.pista_expires_at) return
    const activos = data.jugadores.filter(j => !j.eliminado)
    const votosCompletos = { ...(data.votos || {}) }
    activos.forEach(j => { if (!votosCompletos[j.id]) votosCompletos[j.id] = 'pista' })
    const quierenAdivinar = activos.filter(j => votosCompletos[j.id] === 'adivinar')
    if (quierenAdivinar.length > 0) {
      await supabase.from('adivina_sessions').update({ votos: votosCompletos, estado_ronda: 'adivinando', intentos: {} }).eq('code', data.code)
    } else if (data.pista_actual >= MAX_PISTAS) {
      await supabase.from('adivina_sessions').update({ estado_ronda: 'mostrar_respuesta', votos: votosCompletos, pista_expires_at: null }).eq('code', data.code)
    } else {
      const expires = Date.now() + TIMER_SECS * 1000
      await supabase.from('adivina_sessions').update({
        pista_actual: data.pista_actual + 1,
        estado_ronda: 'votando',
        votos: {},
        pista_expires_at: expires
      }).eq('code', data.code)
    }
  }, [])

  const loadSession = useCallback(async (code) => {
    const c = code || session?.code
    if (!c) return
    const { data } = await supabase.from('adivina_sessions').select('*').eq('code', c).single()
    if (data) {
      setSession(data)
      await procesarExpiracion(data)
    }
  }, [session?.code, procesarExpiracion])

  useEffect(() => {
    if (screen === 'sala' || screen === 'jugando') {
      pollRef.current = setInterval(() => loadSession(), 1500)
      return () => clearInterval(pollRef.current)
    }
  }, [screen, loadSession])

  useEffect(() => {
    if (screen === 'jugando' && session?.estado === 'esperando') setScreen('sala')
    if (screen === 'sala' && session?.estado === 'jugando') setScreen('jugando')
  }, [session?.estado])

  useEffect(() => {
    // Resetear miVoto cuando cambia jugador o pista, pero no si estoy eliminado
    const yoEliminado = session?.jugadores?.find(j => j.id === myUid)?.eliminado
    if (!yoEliminado) setMiVoto(null)
  }, [session?.pista_actual, session?.jugador_actual?.id])

  useEffect(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      if (!session?.pista_expires_at || session?.estado_ronda !== 'votando') {
        setTimer(0)
        return
      }
      const remaining = Math.max(0, Math.ceil((session.pista_expires_at - Date.now()) / 1000))
      setTimer(remaining)
    }, 500)
    return () => clearInterval(timerRef.current)
  }, [session?.pista_expires_at, session?.estado_ronda])

  const update = async (changes) => {
    if (!session) return
    await supabase.from('adivina_sessions').update(changes).eq('code', session.code)
  }

  const guardarSesionLocal = (code, nombre, uid, esHost) => {
    const saved = JSON.parse(localStorage.getItem('adivina_sesiones') || '[]')
    const nuevas = [...saved.filter(s => s.code !== code), { code, nombre, uid, esHost }]
    localStorage.setItem('adivina_sesiones', JSON.stringify(nuevas))
    setSesionesGuardadas(nuevas)
  }

  const quitarSesionLocal = (code) => {
    const nuevas = sesionesGuardadas.filter(s => s.code !== code)
    localStorage.setItem('adivina_sesiones', JSON.stringify(nuevas))
    setSesionesGuardadas(nuevas)
  }

  const crearSesion = async () => {
    if (!myName.trim()) { setError('Pon tu nombre'); return }
    if (!myUid) { setError('Cargando...'); return }
    setLoading(true); setError('')
    const code = generateCode()
    const jugador = getRandomJugador()
    const { error: err } = await supabase.from('adivina_sessions').insert({
      code, creator_id: myUid, estado: 'esperando',
      jugadores: [{ id: myUid, nombre: myName.trim(), puntos: 0, eliminado: false }],
      jugador_actual: jugador,
      pista_actual: 1,
      votos: {},
      intentos: {},
      estado_ronda: 'votando',
      historial: [],
      pista_expires_at: null,
    })
    if (err) { setError('Error al crear'); setLoading(false); return }
    guardarSesionLocal(code, myName.trim(), myUid, true)
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
    const { data: s } = await supabase.from('adivina_sessions').select('*').eq('code', code).single()
    if (!s) { setError('Sesión no encontrada'); setLoading(false); return }
    const jugadores = [...(s.jugadores || [])]
    const yaEsta = jugadores.find(j => j.id === myUid)
    if (!yaEsta && s.estado !== 'esperando') { setError('La partida ya empezó'); setLoading(false); return }
    if (!yaEsta) {
      jugadores.push({ id: myUid, nombre: myName.trim(), puntos: 0, eliminado: false })
      await supabase.from('adivina_sessions').update({ jugadores }).eq('code', code)
    }
    guardarSesionLocal(code, myName.trim(), myUid, false)
    await loadSession(code)
    setScreen(s.estado === 'esperando' ? 'sala' : 'jugando')
    setLoading(false)
  }

  const volverASesion = async (s) => {
    setLoading(true)
    const { data } = await supabase.from('adivina_sessions').select('*').eq('code', s.code).single()
    if (!data) { setError('Sesión no encontrada'); quitarSesionLocal(s.code); setLoading(false); return }
    setSession(data)
    setScreen(data.estado === 'esperando' ? 'sala' : 'jugando')
    setLoading(false)
  }

  const eliminarSesion = async (code) => {
    await supabase.from('adivina_sessions').delete().eq('code', code)
    quitarSesionLocal(code)
  }

  const iniciarPartida = async () => {
    const expires = Date.now() + TIMER_SECS * 1000
    await update({ estado: 'jugando', estado_ronda: 'votando', pista_actual: 1, votos: {}, intentos: {}, pista_expires_at: expires })
  }

  const salir = () => {
    clearInterval(pollRef.current)
    clearInterval(timerRef.current)
    setSession(null)
    setScreen('menu')
  }

  const abandonar = async () => {
    if (!session) return salir()
    const jugadores = session.jugadores.filter(j => j.id !== myUid)
    if (jugadores.length === 0) {
      await supabase.from('adivina_sessions').delete().eq('code', session.code)
      quitarSesionLocal(session.code)
    } else {
      await update({ jugadores })
    }
    clearInterval(pollRef.current)
    clearInterval(timerRef.current)
    setSession(null)
    setScreen('menu')
  }

  const handleVoto = async (voto) => {
    // Leer estado fresco de BD para evitar desincronización con estado local
    const { data: fresh } = await supabase.from('adivina_sessions').select('*').eq('code', session.code).single()
    if (!fresh || fresh.estado_ronda !== 'votando') return
    // Comprobar desde BD si ya voté
    if (fresh.votos?.[myUid]) return
    setMiVoto(voto)
    const activos = fresh.jugadores.filter(j => !j.eliminado)
    const nuevosVotos = { ...(fresh.votos || {}), [myUid]: voto }
    const todosVotaron = activos.every(j => nuevosVotos[j.id])
    if (todosVotaron) {
      const quierenAdivinar = activos.filter(j => nuevosVotos[j.id] === 'adivinar')
      if (quierenAdivinar.length > 0) {
        await supabase.from('adivina_sessions').update({ votos: nuevosVotos, estado_ronda: 'adivinando', intentos: {} }).eq('code', session.code)
      } else if (fresh.pista_actual >= MAX_PISTAS) {
        await supabase.from('adivina_sessions').update({ votos: nuevosVotos, estado_ronda: 'mostrar_respuesta', pista_expires_at: null }).eq('code', session.code)
      } else {
        const expires = Date.now() + TIMER_SECS * 1000
        await supabase.from('adivina_sessions').update({ pista_actual: fresh.pista_actual + 1, estado_ronda: 'votando', votos: {}, pista_expires_at: expires }).eq('code', session.code)
      }
    } else {
      await supabase.from('adivina_sessions').update({ votos: nuevosVotos }).eq('code', session.code)
    }
  }

  const handleIntento = async () => {
    if (!inputAdivina.trim() || !session) return
    const jugador = session.jugador_actual
    const nuevosIntentos = { ...(session.intentos || {}), [myUid]: inputAdivina.trim() }
    const quierenAdivinar = session.jugadores.filter(j => !j.eliminado && (session.votos || {})[j.id] === 'adivinar')
    const todosIntentaron = quierenAdivinar.every(j => nuevosIntentos[j.id])

    if (checkAnswer(inputAdivina, jugador)) {
      const pts = MAX_PISTAS - session.pista_actual + 1
      const jugadores = session.jugadores.map(j => j.id === myUid ? { ...j, puntos: (j.puntos || 0) + pts } : j)
      setFeedback({ type: 'ok', text: `✅ ¡Correcto! +${pts} pts` })
      const historial = [...(session.historial || []), { jugador: jugador.nombre, ganador: myName, pts }]
      await update({ jugadores, intentos: nuevosIntentos, estado_ronda: 'fin_ronda', historial, pista_expires_at: null })
    } else {
      setFeedback({ type: 'fail', text: `❌ "${inputAdivina}" no es correcto` })
      const jugadores = session.jugadores.map(j => j.id === myUid ? { ...j, eliminado: true } : j)
      const activosRestantes = jugadores.filter(j => !j.eliminado)
      if (activosRestantes.length === 0) {
        const historial = [...(session.historial || []), { jugador: jugador.nombre, ganador: null, pts: 0 }]
        await update({ jugadores, intentos: nuevosIntentos, estado_ronda: 'fin_ronda', historial, pista_expires_at: null })
      } else if (todosIntentaron) {
        const expires = Date.now() + TIMER_SECS * 1000
        // No resetear eliminado: quien falló el intento sigue eliminado, quien pidió pista nunca lo estuvo
        await update({ jugadores, intentos: {}, estado_ronda: 'votando', votos: {}, pista_expires_at: expires })
        setMiVoto(null)
      } else {
        await update({ jugadores, intentos: nuevosIntentos })
      }
    }
    setInputAdivina('')
  }

  const rendirse = async () => {
    await update({ revealed: Array(MAX_PISTAS).fill(true), estado_ronda: 'fin_ronda', pista_expires_at: null,
      historial: [...(session.historial || []), { jugador: session.jugador_actual?.nombre, ganador: null, pts: 0 }]
    })
  }

  const siguienteRonda = async () => {
    if (!session) return
    const jugadores = session.jugadores.map(j => ({ ...j, eliminado: false }))
    const nuevoJugador = getRandomJugador(session.historial?.map(h => h.jugador) || [])
    const expires = Date.now() + TIMER_SECS * 1000
    await update({ jugadores, jugador_actual: nuevoJugador, pista_actual: 1, votos: {}, intentos: {}, estado_ronda: 'votando', estado: 'jugando', pista_expires_at: expires })
    setMiVoto(null)
  }

  const activos = session?.jugadores?.filter(j => !j.eliminado) || []
  const votos = session?.votos || {}
  const soyActivo = activos.find(j => j.id === myUid)
  const quierenAdivinar = activos.filter(j => votos[j.id] === 'adivinar')
  const soYoDeAdivinar = quierenAdivinar.find(j => j.id === myUid)
  const yoIntente = session?.intentos?.[myUid]
  const jugador = session?.jugador_actual
  const finRonda = session?.estado_ronda === 'fin_ronda' || session?.estado_ronda === 'mostrar_respuesta'
  const estaAdivinando = session?.estado_ronda === 'adivinando'
  const pistas = jugador?.pistas?.slice(0, session?.pista_actual) || []

  const inp = { width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid rgba(99,179,237,0.3)', background:'rgba(99,179,237,0.06)', color:'#e8eaf0', fontSize:15, boxSizing:'border-box', outline:'none', marginBottom:10 }

  // ── MENÚ ──
  if (screen === 'menu') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a0f1a,#0f1a2e,#0a0f1a)', fontFamily:'system-ui,sans-serif', color:'#e8eaf0', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <button onClick={() => nav('/adivina')} style={{ background:'none', border:'none', color:'#4a6080', cursor:'pointer', fontSize:20, marginBottom:24 }}>←</button>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:42, marginBottom:6 }}>🌐</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:'#63b3ed', letterSpacing:4 }}>ADIVINA ONLINE</div>
        </div>
        {sesionesGuardadas.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:'#2a4060', letterSpacing:2, marginBottom:10, textTransform:'uppercase' }}>Tus partidas</div>
            {sesionesGuardadas.map(s => (
              <div key={s.code} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(99,179,237,0.06)', border:'1px solid rgba(99,179,237,0.15)', borderRadius:12, padding:'10px 14px', marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#63b3ed', fontSize:16, letterSpacing:2 }}>{s.code}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{s.nombre} · {s.esHost ? 'Host' : 'Jugador'}</div>
                </div>
                <button onClick={() => volverASesion(s)} style={{ padding:'6px 14px', borderRadius:8, border:'none', background:'#63b3ed', color:'#0a0f1a', fontSize:13, fontWeight:700, cursor:'pointer' }}>Volver</button>
                <button onClick={() => s.esHost ? eliminarSesion(s.code) : quitarSesionLocal(s.code)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#f87171', fontSize:13, cursor:'pointer' }}>
                  {s.esHost ? '🗑️' : '✕'}
                </button>
              </div>
            ))}
          </div>
        )}
        {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:14, color:'#fca5a5', fontSize:14 }}>{error}</div>}
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>Tu nombre</div>
        <input style={inp} value={myName} onChange={e => setMyName(e.target.value)} placeholder="Tu nombre" />
        <button onClick={crearSesion} disabled={loading} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#63b3ed,#4299e1)', color:'#0a0f1a', fontSize:15, fontWeight:900, cursor:'pointer', marginBottom:12 }}>
          {loading ? 'Creando...' : '+ Crear partida'}
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <input style={{ ...inp, marginBottom:0, flex:1 }} value={codigoInput} onChange={e => setCodigoInput(e.target.value.toUpperCase())} placeholder="Código" maxLength={6} />
          <button onClick={unirse} disabled={loading} style={{ padding:'12px 18px', borderRadius:10, border:'1px solid rgba(99,179,237,0.3)', background:'rgba(99,179,237,0.08)', color:'#63b3ed', fontSize:14, fontWeight:700, cursor:'pointer' }}>Unirse</button>
        </div>
      </div>
    </div>
  )

  // ── SALA ──
  if (screen === 'sala' && session) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a0f1a,#0f1a2e,#0a0f1a)', fontFamily:'system-ui,sans-serif', color:'#e8eaf0', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
      <div style={{ width:'100%', maxWidth:400, textAlign:'center' }}>
        <div style={{ fontSize:42, marginBottom:10 }}>⏳</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:'#63b3ed', letterSpacing:4, marginBottom:6 }}>SALA DE ESPERA</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:'#63b3ed', letterSpacing:8, marginBottom:4 }}>{session.code}</div>
        <div style={{ fontSize:12, color:'#4a6080', marginBottom:24 }}>Comparte este código</div>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16, marginBottom:20, textAlign:'left' }}>
          <div style={{ fontSize:12, color:'#4a6080', marginBottom:10, letterSpacing:2 }}>JUGADORES ({session.jugadores?.length || 0})</div>
          {session.jugadores?.map(j => (
            <div key={j.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background: j.id===myUid ? '#63b3ed' : '#22c55e' }} />
              <span style={{ fontWeight:700, color: j.id===myUid ? '#63b3ed' : '#e8eaf0' }}>{j.nombre}{j.id===myUid ? ' (tú)' : ''}</span>
            </div>
          ))}
        </div>
        {session.creator_id === myUid ? (
          <button onClick={iniciarPartida} disabled={(session.jugadores?.length || 0) < 2}
            style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:(session.jugadores?.length||0)<2?'rgba(255,255,255,0.08)':'linear-gradient(135deg,#63b3ed,#4299e1)', color:(session.jugadores?.length||0)<2?'#2a4060':'#0a0f1a', fontSize:15, fontWeight:900, cursor:(session.jugadores?.length||0)<2?'not-allowed':'pointer', marginBottom:10 }}>
            {(session.jugadores?.length||0) < 2 ? 'Esperando jugadores...' : '¡Empezar!'}
          </button>
        ) : <div style={{ fontSize:13, color:'#4a6080', marginBottom:10 }}>Esperando al host...</div>}
        <button onClick={salir} style={{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#4a6080', fontSize:13, cursor:'pointer', marginBottom:6 }}>← Salir al menú</button>
        <button onClick={abandonar} style={{ width:'100%', padding:8, borderRadius:10, border:'1px solid rgba(239,68,68,0.2)', background:'none', color:'#f87171', fontSize:12, cursor:'pointer' }}>Abandonar</button>
      </div>
    </div>
  )

  // ── JUGANDO ──
  if (screen === 'jugando' && session && jugador) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0a0f1a,#0f1a2e,#0a0f1a)', fontFamily:'system-ui,sans-serif', color:'#e8eaf0', paddingBottom:60 }}>
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(99,179,237,0.15)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ flex:1, fontSize:12, fontWeight:700, color:'#63b3ed' }}>ADIVINA EL JUGADOR</div>
        <div style={{ fontSize:11, color:'#4a6080' }}>Código: <span style={{ color:'#63b3ed', fontWeight:700 }}>{session.code}</span></div>
      </div>

      <div style={{ display:'flex', minHeight:'calc(100vh - 49px)' }}>
        {/* SIDEBAR */}
        <div style={{ width:200, flexShrink:0, padding:'16px 12px', borderRight:'1px solid rgba(99,179,237,0.1)', background:'rgba(0,0,0,0.2)', position:'sticky', top:49, height:'calc(100vh - 49px)', overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ fontSize:10, color:'#2a4060', letterSpacing:2, marginBottom:6, textTransform:'uppercase' }}>Clasificación</div>
          {[...session.jugadores].sort((a,b)=>(b.puntos||0)-(a.puntos||0)).map((j,i) => (
            <div key={j.id} style={{ padding:'10px 12px', borderRadius:10, background: j.id===myUid ? 'rgba(99,179,237,0.1)' : 'rgba(255,255,255,0.04)', border:`1px solid ${j.id===myUid ? 'rgba(99,179,237,0.3)' : 'rgba(255,255,255,0.06)'}`, opacity: j.eliminado ? 0.5 : 1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <span style={{ fontSize:14 }}>{['🥇','🥈','🥉'][i] || `${i+1}º`}</span>
                <div style={{ fontSize:11, fontWeight:700, color: j.id===myUid ? '#63b3ed' : '#c8d8ea', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {j.nombre}{j.id===myUid?' (tú)':''}
                </div>
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:'#63b3ed', lineHeight:1, textAlign:'center' }}>{j.puntos||0}</div>
              <div style={{ fontSize:9, color:'#2a4060', textAlign:'center' }}>pts</div>
              {j.eliminado && <div style={{ fontSize:9, color:'#f87171', textAlign:'center', marginTop:4 }}>❌ eliminado</div>}
              {votos[j.id] && !finRonda && <div style={{ fontSize:9, color:'#fbbf24', textAlign:'center', marginTop:4 }}>{votos[j.id]==='adivinar'?'🎯 adivina':'💡 pista'}</div>}
            </div>
          ))}
        </div>

        {/* CONTENIDO */}
        <div style={{ flex:1, maxWidth:520, margin:'0 auto', padding:'14px 16px 0' }}>

          {/* Timer */}
          {!finRonda && session.estado_ronda === 'votando' && (
            <div style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#4a6080', marginBottom:4 }}>
                <span>Tiempo para decidir</span>
                <span style={{ color: timer <= 10 ? '#f87171' : timer <= 20 ? '#fbbf24' : '#63b3ed', fontWeight:900, fontSize:14 }}>{timer}s</span>
              </div>
              <div style={{ height:5, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(timer/TIMER_SECS)*100}%`, background: timer <= 10 ? '#f87171' : timer <= 20 ? '#fbbf24' : '#63b3ed', borderRadius:3, transition:'width 0.5s linear' }} />
              </div>
            </div>
          )}

          {/* Pistas */}
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
            {pistas.map((pista, i) => (
              <div key={i} style={{ padding:'12px 14px', borderRadius:10, background: i===pistas.length-1?'rgba(99,179,237,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${i===pistas.length-1?'rgba(99,179,237,0.3)':'rgba(255,255,255,0.07)'}` }}>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(99,179,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:900, color:'#63b3ed', flexShrink:0 }}>{i+1}</div>
                  <div style={{ fontSize:13, color:'#c8d8ea', lineHeight:1.5 }}>{pista}</div>
                  <div style={{ marginLeft:'auto', fontSize:10, color:'#2a4060', flexShrink:0 }}>+{MAX_PISTAS-i}pts</div>
                </div>
              </div>
            ))}
            {!finRonda && Array(MAX_PISTAS - session.pista_actual).fill(0).map((_,i) => (
              <div key={i} style={{ padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:22, height:22, borderRadius:'50%', background:'rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#1a2a3a' }}>{session.pista_actual+i+1}</div>
                <div style={{ flex:1, height:8, borderRadius:3, background:'rgba(255,255,255,0.04)' }} />
                <div style={{ fontSize:10, color:'#1a2a3a' }}>+{MAX_PISTAS-session.pista_actual-i}pts</div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div style={{ textAlign:'center', marginBottom:10, padding:'8px', background: feedback.type==='ok'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)', border:`1px solid ${feedback.type==='ok'?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'}`, borderRadius:10, fontSize:13, fontWeight:700, color: feedback.type==='ok'?'#86efac':'#f87171' }}>
              {feedback.text}
            </div>
          )}

          {/* Acciones — usar votos de BD como fuente de verdad */}
          {!finRonda && soyActivo && !estaAdivinando && !votos[myUid] && (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={() => handleVoto('adivinar')} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#63b3ed,#4299e1)', color:'#0a0f1a', fontSize:15, fontWeight:900, cursor:'pointer' }}>
                🎯 Intentar adivinar — +{MAX_PISTAS - session.pista_actual + 1} pts
              </button>
              {session.pista_actual < MAX_PISTAS && (
                <button onClick={() => handleVoto('pista')} style={{ width:'100%', padding:13, borderRadius:12, border:'1px solid rgba(99,179,237,0.25)', background:'rgba(99,179,237,0.06)', color:'#63b3ed', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  💡 Pedir pista {session.pista_actual + 1}
                </button>
              )}
            </div>
          )}

          {!finRonda && soyActivo && !estaAdivinando && votos[myUid] && (
            <div style={{ textAlign:'center', padding:12, background:'rgba(99,179,237,0.08)', borderRadius:10, fontSize:13, color:'#63b3ed', fontWeight:700 }}>
              {votos[myUid] === 'adivinar' ? '🎯 Vas a adivinar' : '💡 Pediste más pista'} — esperando al resto...
            </div>
          )}

          {!finRonda && !soyActivo && (
            <div style={{ textAlign:'center', padding:12, background:'rgba(239,68,68,0.08)', borderRadius:10, fontSize:13, color:'#f87171' }}>
              ❌ Eliminado esta ronda — esperando la siguiente
            </div>
          )}

          {/* Input adivinar */}
          {estaAdivinando && soYoDeAdivinar && !yoIntente && (
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <input value={inputAdivina} onChange={e => setInputAdivina(e.target.value)} onKeyDown={e => e.key==='Enter' && handleIntento()}
                placeholder="Nombre o apellido del jugador..."
                style={{ flex:1, padding:'12px 14px', borderRadius:12, border:'1px solid rgba(99,179,237,0.3)', background:'rgba(99,179,237,0.08)', color:'#e8eaf0', fontSize:14, outline:'none' }} />
              <button onClick={handleIntento} style={{ padding:'12px 16px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#63b3ed,#4299e1)', color:'#0a0f1a', fontSize:15, fontWeight:900, cursor:'pointer' }}>→</button>
            </div>
          )}
          {estaAdivinando && soYoDeAdivinar && yoIntente && (
            <div style={{ textAlign:'center', padding:12, background:'rgba(99,179,237,0.08)', borderRadius:10, fontSize:13, color:'#63b3ed' }}>
              Respuesta enviada — esperando al resto...
            </div>
          )}

          {/* Rendirse */}
          {!finRonda && session.creator_id === myUid && (
            <button onClick={rendirse} style={{ width:'100%', marginTop:8, padding:11, borderRadius:10, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#f87171', fontSize:13, fontWeight:700, cursor:'pointer' }}>
              🏳️ Rendirse — mostrar respuesta
            </button>
          )}

          {/* Fin ronda */}
          {finRonda && (
            <div style={{ textAlign:'center', padding:20, background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:14, marginBottom:12 }}>
              <div style={{ fontSize:36, marginBottom:8 }}>🏆</div>
              <div style={{ fontSize:18, fontWeight:900, color:'#63b3ed', marginBottom:8 }}>Era: {jugador.nombre}</div>
              {[...session.jugadores].sort((a,b)=>(b.puntos||0)-(a.puntos||0)).map((j,i) => (
                <div key={j.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:14, color: j.id===myUid?'#63b3ed':'#e8eaf0' }}>
                  <span>{['🥇','🥈','🥉'][i]||`${i+1}º`} {j.nombre}</span>
                  <span style={{ fontWeight:900, color:'#fbbf24' }}>{j.puntos||0} pts</span>
                </div>
              ))}
              {session.creator_id === myUid ? (
                <button onClick={siguienteRonda} style={{ width:'100%', marginTop:16, padding:13, borderRadius:12, border:'none', background:'linear-gradient(135deg,#63b3ed,#4299e1)', color:'#0a0f1a', fontSize:15, fontWeight:900, cursor:'pointer' }}>
                  ⚽ Siguiente jugador
                </button>
              ) : <div style={{ fontSize:13, color:'#4a6080', marginTop:12 }}>Esperando al host...</div>}
            </div>
          )}

          <div style={{ display:'flex', gap:8, marginTop:8 }}>
            <button onClick={salir} style={{ flex:1, padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#4a6080', fontSize:12, cursor:'pointer' }}>← Menú</button>
            <button onClick={abandonar} style={{ flex:1, padding:10, borderRadius:10, border:'1px solid rgba(239,68,68,0.15)', background:'none', color:'#f87171', fontSize:12, cursor:'pointer' }}>Abandonar</button>
          </div>
        </div>
      </div>
    </div>
  )

  return null
}
