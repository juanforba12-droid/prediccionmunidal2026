import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { addPoints, getUserPoints } from '../lib/userPoints.js'
import { getRankInfo } from '../lib/ranks.js'
import XPWidget from './XPWidget.jsx'
import { PLANTILLAS, matchNombre, calcularBonus, norm } from '../lib/plantillasData.js'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const POS_COLOR = { GK:'#f59e0b', DF:'#3b82f6', MF:'#10b981', FW:'#ef4444' }
const CLUB_COLOR = {
  'Real Madrid': '#3b82f6',
  'Barcelona': '#ec4899',
  'Manchester United': '#ef4444',
  'Bayern Munich': '#f59e0b',
  'Chelsea': '#1d4ed8',
  'Liverpool': '#dc2626',
  'Atlético de Madrid': '#e63312',
  'Manchester City': '#6ec6f0',
  'AC Milan': '#c80000',
  'Paris Saint-Germain': '#001489',
}

function getRandomPlantilla(filtroEquipo) {
  const lista = filtroEquipo === 'ambos' || !filtroEquipo
    ? PLANTILLAS
    : PLANTILLAS.filter(p => p.equipo === filtroEquipo)
  return lista[Math.floor(Math.random() * lista.length)]
}

export default function PlantillasHistoricasOnline() {
  const nav = useNavigate()
  const [screen, setScreen] = useState('menu') // menu | sala | seleccion | jugando
  const [myName, setMyName] = useState('')
  const [codigoInput, setCodigoInput] = useState('')
  const [session, setSession] = useState(null)
  const [myUid, setMyUid] = useState(null)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sesionesGuardadas, setSesionesGuardadas] = useState([])
  const [user, setUser] = useState(null)
  const [totalXP, setTotalXP] = useState(0)
  const [lastGained, setLastGained] = useState(0)
  const [xpLoaded, setXpLoaded] = useState(false)
  const [votoRendirse, setVotoRendirse] = useState(false)
  const inputRef = useRef(null)
  const pollRef = useRef(null)
  const myUidRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      let uid = data.user?.id
      if (!uid) {
        uid = localStorage.getItem('anon_uid')
        if (!uid) { uid = 'anon_' + Math.random().toString(36).substring(2,12); localStorage.setItem('anon_uid', uid) }
      }
      setMyUid(uid); myUidRef.current = uid
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || ''
      if (name) setMyName(name)
      const u = data.user ?? null; setUser(u)
      if (u) getUserPoints(u.id).then(pts => { setTotalXP(pts); setXpLoaded(true) })
      else setXpLoaded(true)
    })
    setSesionesGuardadas(JSON.parse(localStorage.getItem('plantillas_sesiones') || '[]'))
  }, [])

  useEffect(() => {
    if (feedback) { const t = setTimeout(() => setFeedback(null), 1800); return () => clearTimeout(t) }
  }, [feedback])

  const loadSession = useCallback(async (code) => {
    const c = code || session?.code
    if (!c) return
    const { data } = await supabase.from('plantillas_sessions').select('*').eq('code', c).single()
    if (data) setSession(data)
  }, [session?.code])

  useEffect(() => {
    if (screen === 'sala' || screen === 'jugando') {
      pollRef.current = setInterval(() => loadSession(), 1200)
      return () => clearInterval(pollRef.current)
    }
  }, [screen, loadSession])

  // Transiciones de estado automáticas
  useEffect(() => {
    if (!session) return
    if (session.estado === 'jugando' && screen === 'sala') setScreen('jugando')
    if (session.estado === 'esperando' && screen === 'jugando') setScreen('sala')
    // Resincronizar voto rendirse
    if (session.votos_rendirse && !session.votos_rendirse.includes(myUidRef.current)) {
      setVotoRendirse(false)
    }
  }, [session?.estado, session?.votos_rendirse])

  // Focus input cuando toca
  useEffect(() => {
    if (screen === 'jugando' && session?.estado === 'jugando') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [screen, session?.estado])

  const upd = async (changes) => {
    if (!session) return
    await supabase.from('plantillas_sessions').update(changes).eq('code', session.code)
  }

  const guardarLocal = (code, nombre, uid, esHost) => {
    const saved = JSON.parse(localStorage.getItem('plantillas_sesiones') || '[]')
    const nuevas = [...saved.filter(s => s.code !== code), { code, nombre, uid, esHost }]
    localStorage.setItem('plantillas_sesiones', JSON.stringify(nuevas))
    setSesionesGuardadas(nuevas)
  }
  const quitarLocal = (code) => {
    const nuevas = sesionesGuardadas.filter(s => s.code !== code)
    localStorage.setItem('plantillas_sesiones', JSON.stringify(nuevas))
    setSesionesGuardadas(nuevas)
  }

  const crearSesion = async () => {
    if (!myName.trim()) { setError('Pon tu nombre'); return }
    if (!myUid) { setError('Cargando...'); return }
    setLoading(true); setError('')
    const code = generateCode()
    const { error: err } = await supabase.from('plantillas_sessions').insert({
      code,
      creator_id: myUid,
      estado: 'esperando',
      jugadores: [{ id: myUid, nombre: myName.trim(), puntos: 0 }],
      plantilla: null,
      // jugadores_adivinados: { uid: [indices] }
      jugadores_adivinados: {},
      // quien_adivino: { indice_jugador: uid }
      quien_adivino: {},
      votos_rendirse: [],
      historial_rondas: [],
      filtro_club: null,
    })
    if (err) { setError('Error al crear: ' + err.message); setLoading(false); return }
    guardarLocal(code, myName.trim(), myUid, true)
    await loadSession(code)
    setScreen('sala')
    setLoading(false)
  }

  const unirse = async () => {
    if (!myName.trim()) { setError('Pon tu nombre'); return }
    if (!codigoInput.trim()) { setError('Pon el código'); return }
    setLoading(true); setError('')
    const code = codigoInput.toUpperCase()
    const { data: s } = await supabase.from('plantillas_sessions').select('*').eq('code', code).single()
    if (!s) { setError('Sesión no encontrada'); setLoading(false); return }
    const jugadores = [...(s.jugadores || [])]
    const yaEsta = jugadores.find(j => j.id === myUid)
    if (!yaEsta && s.estado !== 'esperando') { setError('La partida ya empezó'); setLoading(false); return }
    if (!yaEsta) {
      jugadores.push({ id: myUid, nombre: myName.trim(), puntos: 0 })
      await supabase.from('plantillas_sessions').update({ jugadores }).eq('code', code)
    }
    guardarLocal(code, myName.trim(), myUid, false)
    await loadSession(code)
    setScreen(s.estado === 'esperando' ? 'sala' : 'jugando')
    setLoading(false)
  }

  const volverASesion = async (s) => {
    setLoading(true)
    const { data } = await supabase.from('plantillas_sessions').select('*').eq('code', s.code).single()
    if (!data) { setError('Sesión no encontrada'); quitarLocal(s.code); setLoading(false); return }
    const jugadores = data.jugadores || []
    const yaEsta = jugadores.find(j => j.id === myUid)
    if (!yaEsta) {
      if (data.estado === 'esperando') {
        await supabase.from('plantillas_sessions').update({ jugadores: [...jugadores, { id: myUid, nombre: s.nombre, puntos: 0 }] }).eq('code', s.code)
      } else { setError('Ya no eres parte de esta sesión'); quitarLocal(s.code); setLoading(false); return }
    }
    setSession(data)
    setScreen(data.estado === 'esperando' ? 'sala' : 'jugando')
    setLoading(false)
  }

  // Host inicia: va a pantalla selección de club
  const iniciarSeleccion = () => setScreen('seleccion')

  const iniciarPartida = async (filtroClub) => {
    const plantilla = getRandomPlantilla(filtroClub)
    await upd({
      estado: 'jugando',
      plantilla,
      jugadores_adivinados: {},
      quien_adivino: {},
      votos_rendirse: [],
      filtro_club: filtroClub,
    })
    setScreen('jugando')
  }

  // ── LÓGICA PRINCIPAL DE ADIVINANZA ──
  const handleSubmit = async () => {
    const val = input.trim()
    if (!val || !session?.plantilla) return
    const { data: fresh } = await supabase.from('plantillas_sessions').select('*').eq('code', session.code).single()
    if (!fresh || fresh.estado !== 'jugando') return

    const plantilla = fresh.plantilla
    const quienAdivino = { ...(fresh.quien_adivino || {}) }
    const jugAdiv = { ...(fresh.jugadores_adivinados || {}) }

    // Buscar si el input coincide con algún jugador no adivinado aún
    let foundIdx = -1
    plantilla.jugadores.forEach((j, i) => {
      if (quienAdivino[i] === undefined && matchNombre(val, j.nombre)) foundIdx = i
    })

    if (foundIdx === -1) {
      setFeedback({ type: 'fail', text: `"${val}" no está en esta plantilla` })
      setInput('')
      return
    }

    // Éxito: reclamar el jugador
    quienAdivino[foundIdx] = myUid
    const misAciertos = [...(jugAdiv[myUid] || []), foundIdx]
    jugAdiv[myUid] = misAciertos

    // XP inmediato por acierto
    const { data: authData } = await supabase.auth.getUser()
    const authUid = authData?.user?.id
    if (authUid) {
      addPoints(authUid, 10, 'plantillas_online')
      setTotalXP(prev => prev + 10)
      setLastGained(10)
      setTimeout(() => setLastGained(0), 2500)
    }

    setFeedback({ type: 'ok', text: `✅ ¡${plantilla.jugadores[foundIdx].nombre}!` })
    setInput('')

    // ¿Se completaron los 11?
    const totalAdivinados = Object.keys(quienAdivino).length
    if (totalAdivinados === plantilla.jugadores.length) {
      // Calcular bonus y actualizar puntos totales
      const jugadores = fresh.jugadores
      const ranking = jugadores.map(j => ({
        ...j,
        aciertos: (jugAdiv[j.id] || []).length
      })).sort((a, b) => b.aciertos - a.aciertos)
      const bonuses = calcularBonus(ranking)
      const jugadoresActualizados = jugadores.map(j => {
        const b = bonuses.find(b => b.id === j.id)?.bonus || 0
        const aciertos = (jugAdiv[j.id] || []).length
        return { ...j, puntos: (j.puntos || 0) + aciertos + b }
      })
      const historialRondas = [...(fresh.historial_rondas || []),
        { temporada: plantilla.temporada, equipo: plantilla.equipo, ranking: ranking.map((r,i)=>({nombre:r.nombre, aciertos:r.aciertos, bonus:bonuses[i]?.bonus||0})) }
      ]
      await supabase.from('plantillas_sessions').update({
        quien_adivino: quienAdivino,
        jugadores_adivinados: jugAdiv,
        jugadores: jugadoresActualizados,
        estado: 'fin_ronda',
        historial_rondas: historialRondas,
      }).eq('code', session.code)
    } else {
      await supabase.from('plantillas_sessions').update({
        quien_adivino: quienAdivino,
        jugadores_adivinados: jugAdiv,
      }).eq('code', session.code)
    }

    setTimeout(() => inputRef.current?.focus(), 50)
  }

  // Voto rendirse: mayoría simple
  const votarRendirse = async () => {
    const { data: fresh } = await supabase.from('plantillas_sessions').select('*').eq('code', session.code).single()
    if (!fresh || fresh.estado !== 'jugando') return
    const votos = [...new Set([...(fresh.votos_rendirse || []), myUid])]
    setVotoRendirse(true)
    const mitad = Math.ceil(fresh.jugadores.length / 2)
    if (votos.length >= mitad) {
      // Mayoría alcanzada → fin de ronda con rendirse
      const plantilla = fresh.plantilla
      const jugAdiv = fresh.jugadores_adivinados || {}
      const quienAdivino = fresh.quien_adivino || {}
      const jugadores = fresh.jugadores
      const ranking = jugadores.map(j => ({
        ...j, aciertos: (jugAdiv[j.id] || []).length
      })).sort((a, b) => b.aciertos - a.aciertos)
      const bonuses = calcularBonus(ranking)
      const jugadoresActualizados = jugadores.map(j => {
        const b = bonuses.find(b => b.id === j.id)?.bonus || 0
        const aciertos = (jugAdiv[j.id] || []).length
        return { ...j, puntos: (j.puntos || 0) + aciertos + b }
      })
      const historialRondas = [...(fresh.historial_rondas || []),
        { temporada: plantilla.temporada, equipo: plantilla.equipo, ranking: ranking.map((r,i)=>({nombre:r.nombre, aciertos:r.aciertos, bonus:bonuses[i]?.bonus||0})) }
      ]
      await supabase.from('plantillas_sessions').update({
        votos_rendirse: votos,
        quien_adivino: { ...quienAdivino, rendido: true },
        jugadores: jugadoresActualizados,
        estado: 'fin_ronda',
        historial_rondas: historialRondas,
      }).eq('code', session.code)
    } else {
      await supabase.from('plantillas_sessions').update({ votos_rendirse: votos }).eq('code', session.code)
    }
  }

  const siguienteRonda = async () => {
    const filtro = session.filtro_club
    const plantilla = getRandomPlantilla(filtro)
    await upd({
      estado: 'jugando',
      plantilla,
      jugadores_adivinados: {},
      quien_adivino: {},
      votos_rendirse: [],
    })
    setVotoRendirse(false)
  }

  const salir = () => { clearInterval(pollRef.current); setSession(null); setScreen('menu') }

  const abandonar = async () => {
    if (session) {
      const jugadores = session.jugadores.filter(j => j.id !== myUid)
      if (jugadores.length === 0) await supabase.from('plantillas_sessions').delete().eq('code', session.code)
      else await upd({ jugadores })
      quitarLocal(session.code)
    }
    clearInterval(pollRef.current)
    setSession(null); setScreen('menu')
  }

  const eliminarSesion = async (code) => {
    await supabase.from('plantillas_sessions').delete().eq('code', code)
    quitarLocal(code)
  }

  const esHost = session?.creator_id === myUid
  const plantilla = session?.plantilla
  const quienAdivino = session?.quien_adivino || {}
  const jugAdiv = session?.jugadores_adivinados || {}
  const votosRendirse = session?.votos_rendirse || []
  const finRonda = session?.estado === 'fin_ronda'
  const acento = plantilla ? (CLUB_COLOR[plantilla.equipo] || '#f59e0b') : '#f59e0b'

  const inp = { width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid rgba(245,158,11,0.3)', background:'rgba(245,158,11,0.06)', color:'#e8e0f0', fontSize:15, boxSizing:'border-box', outline:'none', marginBottom:10, fontFamily:'system-ui,sans-serif' }

  // ── MENÚ ──
  if (screen === 'menu') return (
    <div style={S.root}>
      <button onClick={() => nav('/plantillas')} style={{ position:'absolute', top:20, left:20, background:'none', border:'none', color:'#6a5a8a', cursor:'pointer', fontSize:20 }}>←</button>
      <div style={{ width:'100%', maxWidth:400, margin:'0 auto', padding:'60px 24px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:42, marginBottom:6 }}>🌐</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, color:'#22c55e', letterSpacing:4 }}>PLANTILLAS ONLINE</div>
        </div>

        {sesionesGuardadas.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:11, color:'#4a3a6a', letterSpacing:2, marginBottom:10, textTransform:'uppercase' }}>Tus partidas</div>
            {sesionesGuardadas.map(s => (
              <div key={s.code} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(34,197,94,0.06)', border:'1px solid rgba(34,197,94,0.15)', borderRadius:12, padding:'10px 14px', marginBottom:8 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:'#22c55e', fontSize:16, letterSpacing:2 }}>{s.code}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{s.nombre} · {s.esHost ? 'Host' : 'Jugador'}</div>
                </div>
                <button onClick={() => volverASesion(s)} style={{ padding:'6px 14px', borderRadius:8, border:'none', background:'#22c55e', color:'#0a0a14', fontSize:13, fontWeight:700, cursor:'pointer' }}>Volver</button>
                <button onClick={() => s.esHost ? eliminarSesion(s.code) : quitarLocal(s.code)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.08)', color:'#f87171', fontSize:13, cursor:'pointer' }}>
                  {s.esHost ? '🗑️' : '✕'}
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div style={S.errorBox}>{error}</div>}
        <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:6 }}>Tu nombre</div>
        <input style={inp} value={myName} onChange={e => setMyName(e.target.value)} placeholder="Tu nombre" />
        <button onClick={crearSesion} disabled={loading} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#0a0a14', fontSize:15, fontWeight:900, cursor:'pointer', marginBottom:12, fontFamily:'system-ui,sans-serif' }}>
          {loading ? 'Cargando...' : '+ Crear partida'}
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <input style={{ ...inp, marginBottom:0, flex:1 }} value={codigoInput} onChange={e => setCodigoInput(e.target.value.toUpperCase())} placeholder="Código" maxLength={6} />
          <button onClick={unirse} disabled={loading} style={{ padding:'12px 18px', borderRadius:10, border:'1px solid rgba(34,197,94,0.3)', background:'rgba(34,197,94,0.08)', color:'#22c55e', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
            Unirse
          </button>
        </div>
      </div>
    </div>
  )

  // ── SALA ──
  if (screen === 'sala' && session) return (
    <div style={S.root}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:24 }}>
        <div style={{ width:'100%', maxWidth:400, textAlign:'center' }}>
          <div style={{ fontSize:42, marginBottom:10 }}>⏳</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:'#22c55e', letterSpacing:4, marginBottom:6 }}>SALA DE ESPERA</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:'#22c55e', letterSpacing:8, marginBottom:4 }}>{session.code}</div>
          <div style={{ fontSize:12, color:'#6a5a8a', marginBottom:24 }}>Comparte este código con tus amigos</div>
          <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16, marginBottom:20, textAlign:'left' }}>
            <div style={{ fontSize:12, color:'#6a5a8a', marginBottom:10, letterSpacing:2 }}>JUGADORES ({session.jugadores?.length || 0})</div>
            {session.jugadores?.map(j => (
              <div key={j.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background: j.id===myUid?'#22c55e':'#f59e0b' }} />
                <span style={{ fontWeight:700, color:j.id===myUid?'#22c55e':'#e8e0f0' }}>{j.nombre}{j.id===myUid?' (tú)':''}</span>
                <span style={{ marginLeft:'auto', fontSize:11, color:'#6a5a8a', fontWeight:700 }}>{j.puntos||0} pts</span>
              </div>
            ))}
          </div>
          {esHost && (
            <button onClick={iniciarSeleccion} disabled={(session.jugadores?.length||0) < 2}
              style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:(session.jugadores?.length||0)<2?'rgba(255,255,255,0.1)':'linear-gradient(135deg,#22c55e,#16a34a)', color:(session.jugadores?.length||0)<2?'#4a4a6a':'#0a0a14', fontSize:15, fontWeight:900, cursor:(session.jugadores?.length||0)<2?'not-allowed':'pointer', marginBottom:10, fontFamily:'system-ui,sans-serif' }}>
              {(session.jugadores?.length||0) < 2 ? 'Esperando jugadores...' : '¡Empezar partida!'}
            </button>
          )}
          {!esHost && <div style={{ fontSize:13, color:'#6a5a8a', marginBottom:10 }}>Esperando a que el host empiece...</div>}
          <button onClick={salir} style={S.btnSalir}>← Salir al menú</button>
          <button onClick={abandonar} style={S.btnAbandonar}>Abandonar partida</button>
        </div>
      </div>
    </div>
  )

  // ── SELECCIÓN DE CLUB (solo host) ──
  if (screen === 'seleccion') return (
    <div style={S.root}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:24 }}>
        <div style={{ width:'100%', maxWidth:400 }}>
          <button onClick={() => setScreen('sala')} style={{ background:'none', border:'none', color:'#6a5a8a', cursor:'pointer', fontSize:20, marginBottom:24 }}>←</button>
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>⚽</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:'#f59e0b', letterSpacing:3 }}>ELIGE LAS PLANTILLAS</div>
            <div style={{ fontSize:13, color:'#6a5a8a', marginTop:6 }}>Afectará a todas las rondas de esta partida</div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <button onClick={() => iniciarPartida('ambos')} style={S.clubBtn('#f59e0b')}>
              <div style={{ fontSize:22, marginBottom:4 }}>🎲</div>
              <div style={{ fontSize:16, fontWeight:900, color:'#f59e0b' }}>Aleatorio</div>
              <div style={{ fontSize:11, color:'#6a5a8a', marginTop:3 }}>Cualquier plantilla de las 242 temporadas</div>
            </button>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button onClick={() => iniciarPartida('Real Madrid')} style={S.clubBtn('#3b82f6')}>
                <div style={{ fontSize:20, marginBottom:3 }}>⚪</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#3b82f6' }}>Real Madrid</div>
              </button>
              <button onClick={() => iniciarPartida('Barcelona')} style={S.clubBtn('#ec4899')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🔵</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#ec4899' }}>Barcelona</div>
              </button>
              <button onClick={() => iniciarPartida('Manchester United')} style={S.clubBtn('#ef4444')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🔴</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#ef4444' }}>Man United</div>
              </button>
              <button onClick={() => iniciarPartida('Bayern Munich')} style={S.clubBtn('#f59e0b')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🟥</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#f59e0b' }}>Bayern Munich</div>
              </button>
              <button onClick={() => iniciarPartida('Chelsea')} style={S.clubBtn('#1d4ed8')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🔵</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#1d4ed8' }}>Chelsea</div>
              </button>
              <button onClick={() => iniciarPartida('Liverpool')} style={S.clubBtn('#dc2626')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🔴</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#dc2626' }}>Liverpool</div>
              </button>
              <button onClick={() => iniciarPartida('Atlético de Madrid')} style={S.clubBtn('#e63312')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🔴</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#e63312' }}>Atlético Madrid</div>
              </button>
              <button onClick={() => iniciarPartida('Manchester City')} style={S.clubBtn('#6ec6f0')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🔵</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#6ec6f0' }}>Man City</div>
              </button>
              <button onClick={() => iniciarPartida('AC Milan')} style={S.clubBtn('#c80000')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🔴</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#c80000' }}>AC Milan</div>
              </button>
              <button onClick={() => iniciarPartida('Paris Saint-Germain')} style={S.clubBtn('#001489')}>
                <div style={{ fontSize:20, marginBottom:3 }}>🔵</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#001489' }}>PSG</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── JUGANDO ──
  if ((screen === 'jugando' || finRonda) && session && plantilla) {
    const totalAdivinados = Object.keys(quienAdivino).filter(k => k !== 'rendido').length
    const totalJugadores = plantilla.jugadores.length
    const pct = Math.round((totalAdivinados / totalJugadores) * 100)
    const misAciertos = (jugAdiv[myUid] || []).length
    const yaVoteRendirse = votosRendirse.includes(myUid)
    const rendidoRonda = quienAdivino.rendido === true

    return (
      <div style={{ ...S.root, paddingBottom:60 }}>
        {/* HEADER */}
        <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:`1px solid ${acento}33`, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:900, color:acento }}>{plantilla.equipo} · {plantilla.temporada}</div>
          </div>
          <div style={{ fontSize:11, color:'#6a5a8a' }}>
            Código: <span style={{ color:acento, fontWeight:700 }}>{session.code}</span>
          </div>
        </div>

        <div style={{ display:'flex', minHeight:'calc(100vh - 49px)' }}>

          {/* SIDEBAR */}
          <div style={{ width:210, flexShrink:0, padding:'16px 12px', borderRight:`1px solid ${acento}22`, background:'rgba(0,0,0,0.2)', position:'sticky', top:49, height:'calc(100vh - 49px)', overflowY:'auto', display:'flex', flexDirection:'column', gap:8 }} className="ph-sidebar">
            <div style={{ fontSize:10, color:'#4a3a6a', letterSpacing:2, marginBottom:6, textTransform:'uppercase' }}>Clasificación</div>
            {[...session.jugadores].sort((a,b)=>(b.puntos||0)-(a.puntos||0)).map((j,i) => {
              const aciertosRonda = (jugAdiv[j.id] || []).length
              const medals = ['🥇','🥈','🥉']
              return (
                <div key={j.id} style={{
                  padding:'10px 12px', borderRadius:10,
                  background: j.id===myUid?`${acento}18`:'rgba(255,255,255,0.04)',
                  border:`1px solid ${j.id===myUid?acento+'44':'rgba(255,255,255,0.06)'}`,
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:14 }}>{medals[i] || `${i+1}º`}</span>
                    <div style={{ fontSize:11, fontWeight:700, color:j.id===myUid?acento:'#c8d8ea', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {j.nombre}{j.id===myUid?' (tú)':''}
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:30, color:acento, lineHeight:1, textAlign:'center' }}>{j.puntos||0}</div>
                  <div style={{ fontSize:9, color:'#4a3a6a', textAlign:'center' }}>pts totales</div>
                  {!finRonda && aciertosRonda > 0 && (
                    <div style={{ fontSize:10, color:'#22c55e', textAlign:'center', marginTop:4 }}>+{aciertosRonda} esta ronda</div>
                  )}
                  {user && j.id===myUid && (
                    <div style={{ fontSize:9, color:'#f59e0b', textAlign:'center', marginTop:2 }}>
                      {getRankInfo(totalXP).rank.emoji} {totalXP.toLocaleString()} XP
                    </div>
                  )}
                  {!finRonda && votosRendirse.includes(j.id) && (
                    <div style={{ fontSize:9, color:'#f87171', textAlign:'center', marginTop:4 }}>🏳️ quiere rendirse</div>
                  )}
                </div>
              )
            })}

            {/* Progreso ronda */}
            <div style={{ marginTop:'auto', paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:10, color:'#6a5a8a', marginBottom:4, textAlign:'center' }}>{totalAdivinados}/{totalJugadores} jugadores</div>
              <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:acento, borderRadius:2, transition:'width 0.4s' }} />
              </div>
            </div>
          </div>

          {/* CONTENIDO */}
          <div style={{ flex:1, maxWidth:500, margin:'0 auto', padding:'14px 14px 0' }}>

            {/* Input */}
            {!finRonda && (
              <div style={{ display:'flex', gap:8, marginBottom:12 }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && handleSubmit()}
                  placeholder="Escribe nombre o apellido..."
                  style={{ flex:1, padding:'11px 14px', borderRadius:12, border:`1px solid ${acento}44`, background:`${acento}0d`, color:'#e8e0f0', fontSize:14, outline:'none', fontFamily:'system-ui,sans-serif' }}
                  autoComplete="off" autoCorrect="off" spellCheck={false}
                />
                <button onClick={handleSubmit} style={{ padding:'11px 16px', borderRadius:12, border:'none', background:acento, color:'#0a0a14', fontSize:15, fontWeight:900, cursor:'pointer' }}>→</button>
              </div>
            )}

            {/* Feedback */}
            <div style={{ height:30, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
              {feedback && (
                <div style={{ fontSize:13, fontWeight:700, color:feedback.type==='ok'?'#22c55e':'#ef4444', background:`${feedback.type==='ok'?'#22c55e':'#ef4444'}18`, padding:'4px 14px', borderRadius:20, border:`1px solid ${feedback.type==='ok'?'#22c55e44':'#ef444444'}` }}>
                  {feedback.text}
                </div>
              )}
            </div>

            {/* Lista jugadores */}
            <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:14 }}>
              {plantilla.jugadores.map((j, i) => {
                const adivinadorUid = quienAdivino[i]
                const adivinado = adivinadorUid !== undefined
                const adivinadorNombre = adivinado ? session.jugadores.find(p => p.id === adivinadorUid)?.nombre : null
                const esMio = adivinadorUid === myUid
                const revealed = adivinado || finRonda
                const noAdivinado = finRonda && !adivinado && quienAdivino.rendido
                return (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:9,
                    padding:'9px 12px', borderRadius:10,
                    background: esMio?`${acento}18`:adivinado?'rgba(34,197,94,0.08)':noAdivinado?'rgba(239,68,68,0.07)':'rgba(255,255,255,0.04)',
                    border:`1px solid ${esMio?acento+'55':adivinado?'rgba(34,197,94,0.25)':noAdivinado?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.06)'}`,
                    transition:'all 0.25s',
                  }}>
                    <span style={{ fontSize:10, fontWeight:900, color:'#000', background:POS_COLOR[j.pos]||'#555', borderRadius:4, padding:'2px 5px', minWidth:28, textAlign:'center' }}>
                      {j.pos}
                    </span>
                    <div style={{ flex:1 }}>
                      {revealed
                        ? <div style={{ fontSize:13, fontWeight:adivinado?700:400, color:esMio?acento:adivinado?'#86efac':noAdivinado?'#fca5a5':'#e8e0f0' }}>
                            {j.nombre}
                            {adivinadorNombre && <span style={{ fontSize:10, color:esMio?acento:'#6a5a8a', marginLeft:8 }}>({adivinadorNombre})</span>}
                          </div>
                        : <div style={{ color:'rgba(255,255,255,0.1)', letterSpacing:4, fontSize:11, userSelect:'none' }}>{'█'.repeat(Math.min(j.nombre.length,13))}</div>
                      }
                    </div>
                    {esMio && <span style={{ fontSize:13 }}>⭐</span>}
                    {adivinado && !esMio && <span style={{ fontSize:13 }}>✅</span>}
                    {noAdivinado && <span style={{ fontSize:13 }}>❌</span>}
                  </div>
                )
              })}
            </div>

            {/* Botón rendirse */}
            {!finRonda && (
              <button onClick={votarRendirse} disabled={yaVoteRendirse}
                style={{ width:'100%', padding:11, borderRadius:10, border:'1px solid rgba(239,68,68,0.3)', background:yaVoteRendirse?'rgba(239,68,68,0.15)':'rgba(239,68,68,0.08)', color:yaVoteRendirse?'#f87171':'#f87171', fontSize:13, fontWeight:700, cursor:yaVoteRendirse?'default':'pointer', marginBottom:8, opacity:yaVoteRendirse?0.7:1, fontFamily:'system-ui,sans-serif' }}>
                {yaVoteRendirse
                  ? `🏳️ Votaste rendirse (${votosRendirse.length}/${Math.ceil(session.jugadores.length/2)} para rendir)`
                  : `🏳️ Votar rendirse (${votosRendirse.length}/${Math.ceil(session.jugadores.length/2)} necesarios)`
                }
              </button>
            )}

            {/* Fin de ronda */}
            {finRonda && (
              <div style={{ textAlign:'center', padding:20, background:`${acento}0d`, border:`1px solid ${acento}33`, borderRadius:14, marginBottom:12 }}>
                <div style={{ fontSize:36, marginBottom:8 }}>{rendidoRonda?'🏳️':'🏆'}</div>
                <div style={{ fontSize:18, fontWeight:900, color:acento, marginBottom:4 }}>
                  {plantilla.equipo} {plantilla.temporada}
                </div>
                <div style={{ fontSize:13, color:'#6a5a8a', marginBottom:16 }}>
                  {rendidoRonda ? 'Os habéis rendido' : '¡Plantilla completada!'}
                </div>
                {/* Ranking de la ronda */}
                {[...session.jugadores].sort((a,b)=>(b.puntos||0)-(a.puntos||0)).map((j,i) => {
                  const aciertosRonda = (jugAdiv[j.id]||[]).length
                  const lastRound = session.historial_rondas?.[session.historial_rondas.length-1]
                  const bonusRonda = lastRound?.ranking?.find(r=>r.nombre===j.nombre)?.bonus || 0
                  return (
                    <div key={j.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:13, color:j.id===myUid?acento:'#e8e0f0' }}>
                      <span>{['🥇','🥈','🥉'][i]||`${i+1}º`} {j.nombre}</span>
                      <div style={{ textAlign:'right' }}>
                        <span style={{ fontWeight:900, color:'#22c55e' }}>{aciertosRonda} aciertos</span>
                        {bonusRonda>0 && <span style={{ color:acento, fontSize:11, marginLeft:6 }}>+{bonusRonda} bonus</span>}
                        <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginLeft:6 }}>= {j.puntos||0} total</span>
                      </div>
                    </div>
                  )
                })}
                {esHost
                  ? <button onClick={siguienteRonda} style={{ width:'100%', marginTop:16, padding:13, borderRadius:12, border:'none', background:`linear-gradient(135deg,${acento},${acento}cc)`, color:'#0a0a14', fontSize:15, fontWeight:900, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>
                      ⚽ Siguiente ronda
                    </button>
                  : <div style={{ fontSize:13, color:'#6a5a8a', marginTop:12 }}>Esperando al host...</div>
                }
              </div>
            )}

            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <button onClick={salir} style={{ flex:1, padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#6a5a8a', fontSize:12, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>← Menú</button>
              <button onClick={abandonar} style={{ flex:1, padding:10, borderRadius:10, border:'1px solid rgba(239,68,68,0.15)', background:'none', color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:'system-ui,sans-serif' }}>Abandonar</button>
            </div>
          </div>
        </div>

        <style>{`@media(max-width:600px){.ph-sidebar{display:none!important}}`}</style>
        {xpLoaded && <XPWidget user={user} totalXP={totalXP} lastGained={lastGained} />}
      </div>
    )
  }

  return null
}

const S = {
  root:{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c1a,#1a1030,#0c1520)', fontFamily:'system-ui,sans-serif', color:'#e8e0f0' },
  errorBox:{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:14, color:'#fca5a5', fontSize:14 },
  btnSalir:{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'none', color:'#6a5a8a', fontSize:13, cursor:'pointer', marginBottom:8, fontFamily:'system-ui,sans-serif' },
  btnAbandonar:{ width:'100%', padding:10, borderRadius:10, border:'1px solid rgba(239,68,68,0.2)', background:'none', color:'#f87171', fontSize:12, cursor:'pointer', fontFamily:'system-ui,sans-serif' },
  clubBtn:(color) => ({ padding:'18px 20px', borderRadius:14, border:`1px solid ${color}44`, background:`${color}0d`, cursor:'pointer', textAlign:'center', fontFamily:'system-ui,sans-serif', transition:'all 0.2s' }),
}
