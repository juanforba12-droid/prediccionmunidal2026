import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import preguntas from '../lib/preguntas_estimon_2000.json'

const TIEMPO_LIMITE = 40

function getAuthId() {
  try {
    const token = localStorage.getItem('sb-flawyripybuhifswlipm-auth-token')
    if (token) { const p = JSON.parse(token); if (p && p.user && p.user.id) return p.user.id }
  } catch(e) {}
  return null
}

function calcPuntosMultijugador(respuestas, real, jugadores) {
  if (!real || real === 0) return {}
  const validos = jugadores.filter(function(j) { return respuestas[j.id] != null && respuestas[j.id] !== '' })
  const conError = validos.map(function(j) {
    const val = parseFloat(respuestas[j.id])
    const err = Math.abs(val - real)
    return { id: j.id, val: val, err: err }
  })
  conError.sort(function(a, b) { return a.err - b.err })
  const pts = {}
  jugadores.forEach(function(j) {
    if (respuestas[j.id] == null || respuestas[j.id] === '') {
      pts[j.id] = 0
    }
  })
  let posActual = 0
  let i = 0
  while (i < conError.length) {
    let j = i
    while (j < conError.length - 1 && conError[j+1].err === conError[i].err) j++
    const ptsPosicion = Math.max(0, 5 - posActual)
    for (let k = i; k <= j; k++) {
      pts[conError[k].id] = ptsPosicion
    }
    posActual = j + 1
    i = j + 1
  }
  return pts
}

function preguntaAleatoria() {
  return preguntas[Math.floor(Math.random() * preguntas.length)]
}

export default function EstimonOnline() {
  const { id } = useParams()
  const nav = useNavigate()
  const [sesion, setSesion] = useState(null)
  const [miJugador, setMiJugador] = useState(null)
  const [input, setInput] = useState('')
  const [yaRespondio, setYaRespondio] = useState(false)
  const [tiempo, setTiempo] = useState(TIEMPO_LIMITE)
  const [resultados, setResultados] = useState(null)
  const timerRef = useRef(null)
  const pollingRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(function() {
    const saved = localStorage.getItem('estimon_player_' + id)
    if (!saved) { nav('/estimon'); return }
    setMiJugador(JSON.parse(saved))
    cargarSesion()
    pollingRef.current = setInterval(cargarSesion, 1500)
    return function() {
      clearInterval(pollingRef.current)
      clearInterval(timerRef.current)
    }
  }, [id])

  async function cargarSesion() {
    const { data } = await supabase.from('estimon_sessions').select('*').eq('id', id).single()
    if (!data) return
    setSesion(data)
  }

  useEffect(function() {
    if (!sesion) return

    if (sesion.estado === 'jugando') {
      const ahora = Date.now()
      const inicio = sesion.tiempo_inicio || ahora
      const transcurrido = Math.floor((ahora - inicio) / 1000)
      const restante = Math.max(0, TIEMPO_LIMITE - transcurrido)

      // Si el tiempo ya se acabó en el servidor → forzar resultados (cualquier cliente)
      if (restante <= 0) {
        supabase.from('estimon_sessions').update({ estado: 'resultados' }).eq('id', id).eq('estado', 'jugando')
        return
      }

      setTiempo(restante)
      clearInterval(timerRef.current)
      timerRef.current = setInterval(function() {
        setTiempo(function(t) {
          if (t <= 1) {
            clearInterval(timerRef.current)
            // Tiempo agotado → cualquier cliente fuerza el avance
            supabase.from('estimon_sessions').update({ estado: 'resultados' }).eq('id', id).eq('estado', 'jugando')
            return 0
          }
          return t - 1
        })
      }, 1000)

      setResultados(null)
      setYaRespondio(!!((sesion.respuestas || {})[miJugador && miJugador.id]))
      if (inputRef.current && !yaRespondio) inputRef.current.focus()
    }

    if (sesion.estado === 'resultados') {
      clearInterval(timerRef.current)
      const pregunta = preguntas.find(function(p) { return p.id === sesion.pregunta_id }) || preguntas[sesion.pregunta_idx || 0]
      if (pregunta) {
        const pts = calcPuntosMultijugador(sesion.respuestas || {}, pregunta.respuesta, sesion.jugadores || [])
        setResultados({ pregunta: pregunta, respuestas: sesion.respuestas || {}, pts: pts })
      }
    }
  }, [sesion])

  async function iniciarPartida() {
    const p = preguntaAleatoria()
    await supabase.from('estimon_sessions').update({
      estado: 'jugando',
      pregunta_id: p.id,
      pregunta_idx: preguntas.indexOf(p),
      tiempo_inicio: Date.now(),
      respuestas: {},
    }).eq('id', id)
  }

  async function enviarRespuesta() {
    if (yaRespondio || !input.trim() || !miJugador) return
    const val = parseFloat(input.replace(',', '.'))
    if (isNaN(val)) return
    const respActuales = (sesion && sesion.respuestas) || {}
    const nuevas = Object.assign({}, respActuales, { [miJugador.id]: val })
    await supabase.from('estimon_sessions').update({ respuestas: nuevas }).eq('id', id)
    setYaRespondio(true)
    clearInterval(timerRef.current)
    const jugadores = (sesion && sesion.jugadores) || []
    const todosRespondieron = jugadores.every(function(j) { return nuevas[j.id] != null })
    if (todosRespondieron) {
      await supabase.from('estimon_sessions').update({ estado: 'resultados' }).eq('id', id)
    }
  }

  async function verResultados() {
    await supabase.from('estimon_sessions').update({ estado: 'resultados' }).eq('id', id)
  }

  async function jugarOtra() {
    if (!miJugador) return
    const saved = localStorage.getItem('estimon_player_' + id)
    const me = saved ? JSON.parse(saved) : miJugador
    const esCreador = (sesion && sesion.jugadores && sesion.jugadores[0] && sesion.jugadores[0].id === me.id)
    if (!esCreador) return
    const rondaActual = (sesion && sesion.ronda) || 1

    const ptsPorJugador = resultados && resultados.pts ? resultados.pts : {}
    const userId = getAuthId()
    if (userId && ptsPorJugador[me.id] > 0) {
      const { data } = await supabase.from('user_points').select('total_points').eq('user_id', userId).single()
      const actual = (data && data.total_points) || 0
      await supabase.from('user_points').upsert({ user_id: userId, total_points: actual + ptsPorJugador[me.id] }, { onConflict: 'user_id' })
    }
    const p = preguntaAleatoria()
    await supabase.from('estimon_sessions').update({
      estado: 'jugando',
      pregunta_id: p.id,
      pregunta_idx: preguntas.indexOf(p),
      tiempo_inicio: Date.now(),
      respuestas: {},
      ronda: rondaActual + 1,
    }).eq('id', id)
    setYaRespondio(false)
    setInput('')
    setResultados(null)
  }

  function abandonarPartida() {
    const saved = JSON.parse(localStorage.getItem('estimon_sesiones') || '[]')
    localStorage.setItem('estimon_sesiones', JSON.stringify(saved.filter(function(s) { return s.id !== id })))
    localStorage.removeItem('estimon_player_' + id)
    if (esCreadorLocal()) {
      supabase.from('estimon_sessions').delete().eq('id', id)
    }
    nav('/estimon')
  }

  function esCreadorLocal() {
    const saved = JSON.parse(localStorage.getItem('estimon_sesiones') || '[]')
    const s = saved.find(function(s) { return s.id === id })
    return s && s.esCreador
  }

  if (!sesion || !miJugador) return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff', fontFamily: 'sans-serif' }}>Cargando...</div>
  )

  const jugadores = sesion.jugadores || []
  const esCreador = jugadores.length > 0 && jugadores[0].id === miJugador.id
  const preguntaActual = sesion.pregunta_id ? preguntas.find(function(p) { return p.id === sesion.pregunta_id }) : null
  const pct = (tiempo / TIEMPO_LIMITE) * 100
  const timerColor = tiempo > 20 ? '#00e5ff' : tiempo > 10 ? '#ffea00' : '#ff4081'
  const numRespondieron = Object.keys(sesion.respuestas || {}).length

  const S = {
    root: { minHeight: '100vh', background: '#080a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: "'DM Sans', sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' },
    bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' },
    card: { width: '100%', maxWidth: 480, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px 20px', marginBottom: 14 },
  }

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={S.bg} />

      <div style={{ width: '100%', maxWidth: 480, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={function() { nav('/estimon') }} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>Menu</button>
          <button onClick={abandonarPartida} style={{ background: 'none', border: '1px solid rgba(255,64,129,0.3)', borderRadius: 8, color: '#ff4081', padding: '6px 12px', cursor: 'pointer', fontSize: 12 }}>Abandonar</button>
        </div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#00e5ff', letterSpacing: 3 }}>ESTIMON</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 20 }}>
          Sala: <strong style={{ color: '#e8eaf0' }}>{id}</strong>
        </div>
      </div>

      {sesion.estado === 'esperando' && (
        <div style={Object.assign({}, S.card, { textAlign: 'center', position: 'relative', zIndex: 1 })}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#00e5ff', marginBottom: 4 }}>Sala de espera</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Comparte el codigo con tus amigos: <strong style={{ color: '#e8eaf0' }}>{id}</strong></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
            {jugadores.map(function(j) {
              return (
                <div key={j.id} style={{ background: j.color + '18', border: '1px solid ' + j.color + '44', borderRadius: 20, padding: '6px 14px', fontSize: 14, color: j.color, fontWeight: 600 }}>
                  {j.nombre}
                </div>
              )
            })}
          </div>
          {esCreador ? (
            <button onClick={iniciarPartida} disabled={jugadores.length < 1} style={{ padding: '14px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #006064)', color: '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, cursor: jugadores.length >= 1 ? 'pointer' : 'not-allowed', opacity: jugadores.length >= 1 ? 1 : 0.5 }}>
              EMPEZAR ({jugadores.length} jugador{jugadores.length !== 1 ? 'es' : ''})
            </button>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Esperando que el creador empiece...</div>
          )}
        </div>
      )}

      {sesion.estado === 'jugando' && preguntaActual && (
        <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>TIEMPO</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{numRespondieron}/{jugadores.length} respondieron</span>
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: timerColor }}>{tiempo}s</span>
              </div>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: pct + '%', background: timerColor, borderRadius: 3, transition: 'width 1s linear, background 0.3s' }} />
            </div>
          </div>

          <div style={S.card}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>{preguntaActual.categoria} | Ronda {sesion.ronda}</div>
            <div style={{ fontSize: 19, color: '#e8eaf0', lineHeight: 1.5, fontWeight: 600, marginBottom: 20 }}>{preguntaActual.pregunta}</div>

            {!yaRespondio ? (
              <div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    ref={inputRef}
                    type="number"
                    value={input}
                    onChange={function(e) { setInput(e.target.value) }}
                    onKeyDown={function(e) { if (e.key === 'Enter') enviarRespuesta() }}
                    placeholder={'Estimacion en ' + preguntaActual.unidad}
                    style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.05)', color: '#e8eaf0', fontSize: 18, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button onClick={enviarRespuesta} style={{ padding: '14px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #006064)', color: '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, cursor: 'pointer', flexShrink: 0 }}>
                    OK
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>Unidad: {preguntaActual.unidad}</div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 16, color: '#69f0ae', fontWeight: 700, marginBottom: 4 }}>Respuesta enviada!</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Esperando a los demas... ({numRespondieron}/{jugadores.length})</div>
                {esCreador && numRespondieron > 0 && (
                  <button onClick={verResultados} style={{ marginTop: 14, padding: '8px 20px', borderRadius: 10, border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.06)', color: '#ffd700', fontFamily: "'DM Sans', sans-serif", fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    Forzar resultados ({numRespondieron}/{jugadores.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {sesion.estado === 'resultados' && resultados && (
        <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
          <div style={S.card}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Resultado | Ronda {sesion.ronda}</div>
            <div style={{ fontSize: 16, color: '#e8eaf0', marginBottom: 16, fontWeight: 600 }}>{resultados.pregunta.pregunta}</div>

            <div style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Respuesta correcta</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, color: '#00e5ff', lineHeight: 1 }}>{resultados.pregunta.respuesta} <span style={{ fontSize: 16 }}>{resultados.pregunta.unidad}</span></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {jugadores.slice().sort(function(a, b) { return (resultados.pts[b.id] || 0) - (resultados.pts[a.id] || 0) }).map(function(j, idx) {
                const resp = resultados.respuestas[j.id]
                const pts = resultados.pts[j.id] || 0
                const isMe = j.id === miJugador.id
                const err = resp != null ? Math.abs(resp - resultados.pregunta.respuesta) : null
                const medals = ['🥇', '🥈', '🥉']
                return (
                  <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: isMe ? j.color + '10' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (isMe ? j.color + '33' : 'rgba(255,255,255,0.06)') }}>
                    <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>{medals[idx] || (idx + 1) + 'o'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: j.color }}>{j.nombre}{isMe ? ' (tu)' : ''}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                        {resp != null ? (resp + ' ' + resultados.pregunta.unidad + (err !== null ? ' | Error: ' + err.toFixed(err < 1 ? 2 : 0) : '')) : 'Sin respuesta'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: pts > 0 ? '#69f0ae' : '#ff4081', lineHeight: 1 }}>{pts > 0 ? '+' + pts : '0'}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>pts</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {esCreador ? (
              <button onClick={jugarOtra} style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #006064)', color: '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 2, cursor: 'pointer' }}>
                JUGAR OTRA
              </button>
            ) : (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 14, padding: '12px 0' }}>Esperando que el creador inicie otra ronda...</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
