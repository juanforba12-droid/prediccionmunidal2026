import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { JUGADORES, CLUBES, SELECCIONES } from '../lib/gameData.js'

function getItems(categoria) {
  switch(categoria) {
    case 'jugadores': return JUGADORES.map(j => j.nombre)
    case 'clubes': return CLUBES.map(c => c.nombre)
    case 'selecciones': return SELECCIONES.map(s => s.nombre)
    default: return JUGADORES.map(j => j.nombre)
  }
}

export default function MentirosoGame() {
  const { code } = useParams()
  const nav = useNavigate()
  const [session, setSession] = useState(null)
  const [myId, setMyId] = useState(null)
  const [myNombre, setMyNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(true)
  const [votoLocal, setVotoLocal] = useState(null)
  const chatRef = useRef(null)
  const pollRef = useRef(null)
  const sessionRef = useRef(null)

  useEffect(() => {
    const uid = localStorage.getItem(`mentiroso_uid_${code}`)
    const nombre = localStorage.getItem(`mentiroso_nombre_${code}`)
    if (!uid) { nav('/mentiroso'); return }
    setMyId(uid)
    setMyNombre(nombre || '')
    loadSession()
    // Poll cada 1.5 segundos
    pollRef.current = setInterval(loadSession, 1500)
    return () => clearInterval(pollRef.current)
  }, [code])

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [session?.chat])

  const loadSession = useCallback(async () => {
    const { data } = await supabase.from('mentiroso_sessions').select('*').eq('code', code).single()
    if (data) {
      setSession(data)
      setLoading(false)
    }
  }, [code])

  const update = async (changes) => {
    await supabase.from('mentiroso_sessions').update(changes).eq('code', code)
    await loadSession()
  }

  const iniciarPartida = async () => {
    const jugadores = session.jugadores
    if (jugadores.length < 3) { alert('Necesitas al menos 3 jugadores'); return }
    const items = getItems(session.categoria)
    const palabra = items[Math.floor(Math.random() * items.length)]
    const impostor = jugadores[Math.floor(Math.random() * jugadores.length)].id
    const asignaciones = {}
    jugadores.forEach(j => { asignaciones[j.id] = j.id === impostor ? 'IMPOSTOR' : palabra })
    await update({
      estado: 'jugando', palabra, impostor_id: impostor,
      asignaciones, ronda: (session.ronda || 0) + 1,
      turno_idx: 0, votos: {}, chat: [],
      eliminados: session.eliminados || []
    })
  }

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return
    const activos = session.jugadores.filter(j => !(session.eliminados || []).includes(j.id))
    const turnoActual = activos[session.turno_idx || 0]
    const uid = localStorage.getItem(`mentiroso_uid_${code}`)
    if (turnoActual?.id !== uid) return
    const palabraEnviada = mensaje.trim().split(' ')[0]
    const chat = [...(session.chat || []), {
      id: uid, nombre: myNombre || localStorage.getItem(`mentiroso_nombre_${code}`),
      texto: palabraEnviada, ts: Date.now()
    }]
    setMensaje('')
    const nextIdx = ((session.turno_idx || 0) + 1) % activos.length
    const todosHablaron = nextIdx === 0
    await update({
      chat,
      turno_idx: nextIdx,
      estado: todosHablaron ? 'votacion' : 'jugando'
    })
  }

  const votar = async (votadoId) => {
    if (votoLocal) return
    const uid = localStorage.getItem(`mentiroso_uid_${code}`)
    setVotoLocal(votadoId)
    const votos = { ...(session.votos || {}), [uid]: votadoId }
    const activos = session.jugadores.filter(j => !(session.eliminados || []).includes(j.id))
    const todosVotaron = activos.every(j => votos[j.id])

    if (todosVotaron) {
      const conteo = {}
      Object.values(votos).forEach(v => { conteo[v] = (conteo[v] || 0) + 1 })
      const maxVotos = Math.max(...Object.values(conteo))
      const eliminado = Object.keys(conteo).find(k => conteo[k] === maxVotos)
      const eliminados = [...(session.eliminados || []), eliminado]
      const activosRestantes = activos.filter(j => j.id !== eliminado)
      const impostorEliminado = eliminado === session.impostor_id
      const soloQuedanDos = activosRestantes.length <= 2

      if (impostorEliminado) {
        await update({ votos, eliminados, estado: 'fin', ganador: 'jugadores' })
      } else if (soloQuedanDos) {
        await update({ votos, eliminados, estado: 'fin', ganador: 'impostor' })
      } else {
        setVotoLocal(null)
        await update({ votos, eliminados, estado: 'jugando', turno_idx: 0, chat: [], votos: {}, ronda: (session.ronda || 1) + 1 })
      }
    } else {
      await update({ votos })
    }
  }

  const nuevaPartida = async () => {
    setVotoLocal(null)
    await update({
      estado: 'esperando', palabra: null, impostor_id: null,
      asignaciones: {}, votos: {}, chat: [], eliminados: [], ganador: null
    })
  }

  if (loading || !session) return (
    <div style={{ minHeight:'100vh', background:'#0a0a1a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#9b5de5', fontSize:18 }}>Cargando...</div>
    </div>
  )

  const uid = localStorage.getItem(`mentiroso_uid_${code}`)
  const jugadores = session.jugadores || []
  const activos = jugadores.filter(j => !(session.eliminados || []).includes(j.id))
  const eliminados = session.eliminados || []
  const isCreator = jugadores[0]?.id === uid
  const asignaciones = session.asignaciones || {}
  const miPalabra = asignaciones[uid]
  const turnoActual = activos[session.turno_idx || 0]
  const esMiTurno = turnoActual?.id === uid
  const votos = session.votos || {}
  const yoVote = votos[uid]
  const soyEliminado = eliminados.includes(uid)

  const card = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16, marginBottom:12 }

  return (
    <div style={{ fontFamily:'system-ui,sans-serif', minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a,#0d0d20)', color:'#e8eaf0', padding:'16px 16px 80px' }}>
      <div style={{ maxWidth:500, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <button onClick={() => nav('/mentiroso')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:20 }}>←</button>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:'#9b5de5', letterSpacing:2 }}>MENTIROSO</div>
          <div style={{ flex:1 }} />
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.05)', padding:'4px 10px', borderRadius:20, letterSpacing:2 }}>{code}</div>
        </div>

        {/* SALA DE ESPERA */}
        {session.estado === 'esperando' && (
          <div>
            <div style={card}>
              <div style={{ fontSize:13, color:'#6a4090', marginBottom:12 }}>Jugadores conectados ({jugadores.length})</div>
              {jugadores.map(j => (
                <div key={j.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'rgba(155,93,229,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#9b5de5' }}>{j.nombre[0]}</div>
                  <div style={{ flex:1, fontWeight:600 }}>{j.nombre} {j.id === uid ? '(tú)' : ''}</div>
                  {j.id === jugadores[0]?.id && <span style={{ fontSize:11, color:'#f4a261' }}>👑 Host</span>}
                </div>
              ))}
            </div>

            <div style={{ ...card, textAlign:'center', background:'rgba(155,93,229,0.06)', border:'1px solid rgba(155,93,229,0.2)' }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>Categoria</div>
              <div style={{ fontSize:20, fontWeight:700, color:'#9b5de5', textTransform:'uppercase' }}>{session.categoria}</div>
            </div>

            {jugadores.length < 3 && (
              <div style={{ textAlign:'center', padding:12, background:'rgba(244,162,97,0.08)', border:'1px solid rgba(244,162,97,0.2)', borderRadius:12, marginBottom:12 }}>
                <div style={{ fontSize:13, color:'#f4a261' }}>Esperando... ({jugadores.length}/3 minimo)</div>
                <div style={{ fontSize:13, color:'#9b5de5', fontWeight:700, letterSpacing:3, marginTop:4 }}>{code}</div>
              </div>
            )}

            {isCreator && jugadores.length >= 3 && (
              <button onClick={iniciarPartida} style={{ width:'100%', padding:16, borderRadius:14, border:'none', background:'#9b5de5', color:'#fff', fontSize:17, fontWeight:700, cursor:'pointer' }}>
                Empezar partida
              </button>
            )}
            {!isCreator && (
              <div style={{ textAlign:'center', color:'rgba(255,255,255,0.3)', fontSize:14, padding:16 }}>Esperando que el host empiece...</div>
            )}
          </div>
        )}

        {/* JUGANDO / VOTACION */}
        {(session.estado === 'jugando' || session.estado === 'votacion') && (
          <div>
            {/* Mi palabra */}
            {miPalabra && (
              <div style={{ ...card, background: miPalabra === 'IMPOSTOR' ? 'rgba(230,57,70,0.1)' : 'rgba(42,157,143,0.1)', border: miPalabra === 'IMPOSTOR' ? '1px solid rgba(230,57,70,0.3)' : '1px solid rgba(42,157,143,0.3)', textAlign:'center' }}>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:6 }}>{soyEliminado ? 'Fuiste eliminado. La palabra era:' : 'Tu palabra es'}</div>
                <div style={{ fontSize: miPalabra === 'IMPOSTOR' ? 28 : 22, fontWeight:800, color: miPalabra === 'IMPOSTOR' ? '#e63946' : '#2a9d8f' }}>{soyEliminado ? session.palabra : miPalabra}</div>
                {!soyEliminado && miPalabra === 'IMPOSTOR' && <div style={{ fontSize:12, color:'rgba(230,57,70,0.7)', marginTop:6 }}>Eres el impostor. No sabes la palabra. Intenta pasar desapercibido.</div>}
                {!soyEliminado && miPalabra !== 'IMPOSTOR' && <div style={{ fontSize:12, color:'rgba(42,157,143,0.7)', marginTop:6 }}>Di algo relacionado. No digas la palabra directamente.</div>}
              </div>
            )}

            {/* Turno */}
            {session.estado === 'jugando' && (
              <div style={{ ...card, textAlign:'center', background: esMiTurno ? 'rgba(155,93,229,0.12)' : 'rgba(255,255,255,0.03)', border: esMiTurno ? '1px solid rgba(155,93,229,0.4)' : '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>Turno de</div>
                <div style={{ fontSize:20, fontWeight:700, color: esMiTurno ? '#9b5de5' : '#e8eaf0' }}>{esMiTurno ? 'ES TU TURNO' : turnoActual?.nombre}</div>
                {esMiTurno && !soyEliminado && <div style={{ fontSize:12, color:'rgba(155,93,229,0.7)', marginTop:4 }}>Di una sola palabra</div>}
              </div>
            )}

            {/* Chat */}
            <div style={{ ...card, padding:0, overflow:'hidden' }}>
              <div style={{ padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:12, color:'#6a4090' }}>
                Ronda {session.ronda} · {session.estado === 'votacion' ? 'Hora de votar' : 'Chat'}
              </div>
              <div ref={chatRef} style={{ height:180, overflowY:'auto', padding:'10px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                {(session.chat || []).length === 0 && (
                  <div style={{ color:'rgba(255,255,255,0.2)', fontSize:13, textAlign:'center', marginTop:20 }}>Nadie ha hablado aun...</div>
                )}
                {(session.chat || []).map((m, i) => (
                  <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    <div style={{ width:28, height:28, borderRadius:7, background:'rgba(155,93,229,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#9b5de5', flexShrink:0 }}>{m.nombre[0]}</div>
                    <div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:2 }}>{m.nombre}</div>
                      <div style={{ fontSize:15, fontWeight:600, color: m.id === uid ? '#9b5de5' : '#e8eaf0' }}>{m.texto}</div>
                    </div>
                  </div>
                ))}
              </div>
              {esMiTurno && !soyEliminado && session.estado === 'jugando' && (
                <div style={{ padding:'10px 14px', borderTop:'1px solid rgba(255,255,255,0.06)', display:'flex', gap:8 }}>
                  <input value={mensaje} onChange={e => setMensaje(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && enviarMensaje()}
                    placeholder="Una sola palabra..."
                    style={{ flex:1, padding:'10px 14px', borderRadius:10, border:'1px solid rgba(155,93,229,0.3)', background:'rgba(155,93,229,0.06)', color:'#e8eaf0', fontSize:14, outline:'none' }} />
                  <button onClick={enviarMensaje} style={{ padding:'10px 16px', borderRadius:10, border:'none', background:'#9b5de5', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }}>Enviar</button>
                </div>
              )}
            </div>

            {/* Jugadores */}
            <div style={card}>
              <div style={{ fontSize:12, color:'#6a4090', marginBottom:10 }}>Jugadores</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {jugadores.map(j => {
                  const isElim = eliminados.includes(j.id)
                  const isTurno = turnoActual?.id === j.id && session.estado === 'jugando'
                  return (
                    <div key={j.id} style={{ padding:'6px 12px', borderRadius:20, fontSize:13, fontWeight:600, background: isElim ? 'rgba(255,255,255,0.03)' : isTurno ? 'rgba(155,93,229,0.2)' : 'rgba(255,255,255,0.06)', color: isElim ? 'rgba(255,255,255,0.2)' : isTurno ? '#9b5de5' : '#e8eaf0', border: isTurno ? '1px solid rgba(155,93,229,0.4)' : '1px solid transparent', textDecoration: isElim ? 'line-through' : 'none' }}>
                      {j.nombre} {j.id === uid ? '(tú)' : ''}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* VOTACION */}
            {session.estado === 'votacion' && !soyEliminado && (
              <div style={{ ...card, background:'rgba(244,162,97,0.06)', border:'1px solid rgba(244,162,97,0.2)' }}>
                <div style={{ fontWeight:700, fontSize:16, color:'#f4a261', marginBottom:4 }}>Hora de votar</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:14 }}>Vota a quien crees que es el impostor</div>
                {activos.filter(j => j.id !== uid).map(j => {
                  const votosAEste = Object.values(votos).filter(v => v === j.id).length
                  return (
                    <button key={j.id} onClick={() => !yoVote && votar(j.id)} disabled={!!yoVote}
                      style={{ width:'100%', padding:'12px 16px', borderRadius:10, border:`1px solid ${yoVote === j.id ? 'rgba(244,162,97,0.6)' : 'rgba(255,255,255,0.08)'}`, background: yoVote === j.id ? 'rgba(244,162,97,0.15)' : 'rgba(255,255,255,0.04)', color: yoVote === j.id ? '#f4a261' : '#e8eaf0', fontSize:14, fontWeight:600, cursor: yoVote ? 'default' : 'pointer', marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span>{j.nombre}</span>
                      {votosAEste > 0 && <span style={{ fontSize:12, color:'#f4a261' }}>{votosAEste} voto{votosAEste>1?'s':''}</span>}
                    </button>
                  )
                })}
                {yoVote && <div style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:8 }}>Esperando que voten los demas...</div>}
              </div>
            )}
          </div>
        )}

        {/* FIN */}
        {session.estado === 'fin' && (
          <div style={{ textAlign:'center', paddingTop:40 }}>
            <div style={{ fontSize:64, marginBottom:16 }}>{session.ganador === 'jugadores' ? '🎉' : '🎭'}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color: session.ganador === 'jugadores' ? '#2a9d8f' : '#e63946', letterSpacing:3, marginBottom:16 }}>
              {session.ganador === 'jugadores' ? 'GANARON LOS JUGADORES' : 'GANO EL IMPOSTOR'}
            </div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>La palabra era</div>
            <div style={{ fontSize:28, fontWeight:800, color:'#9b5de5', marginBottom:12 }}>{session.palabra}</div>
            <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:32 }}>
              El impostor era: <strong style={{ color:'#e63946' }}>{jugadores.find(j => j.id === session.impostor_id)?.nombre}</strong>
            </div>
            {isCreator && (
              <button onClick={nuevaPartida} style={{ padding:'14px 32px', borderRadius:14, border:'none', background:'#9b5de5', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:12 }}>
                Jugar de nuevo
              </button>
            )}
            <div>
              <button onClick={() => nav('/mentiroso')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14 }}>Salir</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
