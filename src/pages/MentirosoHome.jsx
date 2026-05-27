import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { JUGADORES, CLUBES, SELECCIONES } from '../lib/gameData.js'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

function getItems(categoria) {
  switch(categoria) {
    case 'jugadores': return JUGADORES.map(j => j.nombre)
    case 'clubes': return CLUBES.map(c => c.nombre)
    case 'selecciones': return SELECCIONES.map(s => s.nombre)
    default: return JUGADORES.map(j => j.nombre)
  }
}

// ─── MODO PRESENCIAL ───────────────────────────────────────────────────────────
function ModoPresencial({ onVolver }) {
  const [fase, setFase] = useState('config')
  const [categoria, setCategoria] = useState('jugadores')
  const [nombresInput, setNombresInput] = useState('')
  const [jugadores, setJugadores] = useState([])
  const [eliminados, setEliminados] = useState([])
  const [impostorNombre, setImpostorNombre] = useState('')
  const [palabra, setPalabra] = useState('')
  const [turnoIdx, setTurnoIdx] = useState(0)
  const [palabraVisible, setPalabraVisible] = useState(false)
  const [votos, setVotos] = useState({})
  const [votanteIdx, setVotanteIdx] = useState(0)
  const [ronda, setRonda] = useState(1)
  const [ultimoEliminado, setUltimoEliminado] = useState(null)
  const [resultado, setResultado] = useState(null)

  const activos = jugadores.filter(j => !eliminados.includes(j.nombre))

  const iniciar = () => {
    const nombres = nombresInput.split('\n').map(n => n.trim()).filter(Boolean)
    if (nombres.length < 3) { alert('Necesitas al menos 3 jugadores'); return }
    const items = getItems(categoria)
    const pal = items[Math.floor(Math.random() * items.length)]
    const imp = nombres[Math.floor(Math.random() * nombres.length)]
    setJugadores(nombres.map(n => ({ nombre: n })))
    setEliminados([])
    setPalabra(pal)
    setImpostorNombre(imp)
    setTurnoIdx(0)
    setPalabraVisible(false)
    setVotos({})
    setVotanteIdx(0)
    setRonda(1)
    setUltimoEliminado(null)
    setResultado(null)
    setFase('repartiendo')
  }

  const pasarAVotacion = () => {
    setVotanteIdx(0)
    setVotos({})
    setFase('votacion')
  }

  const votar = (nombreVotado) => {
    const votanteNombre = activos[votanteIdx].nombre
    const nuevoVotos = { ...votos, [votanteNombre]: nombreVotado }
    setVotos(nuevoVotos)

    if (votanteIdx + 1 < activos.length) {
      setVotanteIdx(v => v + 1)
      return
    }

    // Todos votaron — contar
    const conteo = {}
    Object.values(nuevoVotos).forEach(v => { conteo[v] = (conteo[v] || 0) + 1 })
    const maxVotos = Math.max(...Object.values(conteo))
    const eliminado = Object.keys(conteo).find(k => conteo[k] === maxVotos)
    const nuevosEliminados = [...eliminados, eliminado]
    const activosRestantes = jugadores.filter(j => !nuevosEliminados.includes(j.nombre))

    setEliminados(nuevosEliminados)
    setUltimoEliminado({ nombre: eliminado, conteo })

    if (eliminado === impostorNombre) {
      setResultado({ ganadores: 'jugadores', conteo })
      setFase('fin')
    } else if (activosRestantes.length <= 2) {
      setResultado({ ganadores: 'impostor', conteo })
      setFase('fin')
    } else {
      setFase('entre_rondas')
    }
  }

  const siguienteRonda = () => {
    setRonda(r => r + 1)
    setVotos({})
    setVotanteIdx(0)
    setUltimoEliminado(null)
    setFase('votacion')
  }

  const reiniciar = () => {
    setFase('config')
    setNombresInput('')
    setJugadores([])
    setEliminados([])
    setImpostorNombre('')
    setPalabra('')
    setVotos({})
    setResultado(null)
    setUltimoEliminado(null)
    setRonda(1)
  }

  const card = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(155,93,229,0.15)', borderRadius:14, padding:16, marginBottom:12 }
  const s = { width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid rgba(155,93,229,0.3)', background:'rgba(155,93,229,0.06)', color:'#e8eaf0', fontSize:15, boxSizing:'border-box', outline:'none', marginBottom:12 }

  // CONFIG
  if (fase === 'config') return (
    <div>
      <button onClick={onVolver} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:13, marginBottom:20 }}>← Volver</button>
      <div style={{ textAlign:'center', marginBottom:24 }}>
        <div style={{ fontSize:36, marginBottom:6 }}>🎭</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:'#9b5de5', letterSpacing:4 }}>PRESENCIAL</div>
      </div>
      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:8 }}>Jugadores (uno por línea, mínimo 3):</div>
      <textarea
        style={{ ...s, height:120, resize:'none' }}
        placeholder={'Juan\nMaría\nPedro\nLaura'}
        value={nombresInput}
        onChange={e => setNombresInput(e.target.value)}
      />
      <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:10 }}>Categoría:</div>
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {[['jugadores','Jugadores'],['clubes','Clubes'],['selecciones','Selecciones']].map(([k,l]) => (
          <button key={k} onClick={() => setCategoria(k)} style={{ flex:1, padding:'10px 4px', borderRadius:10, border:`1px solid ${categoria===k?'rgba(155,93,229,0.5)':'rgba(255,255,255,0.08)'}`, background:categoria===k?'rgba(155,93,229,0.15)':'rgba(255,255,255,0.04)', color:categoria===k?'#9b5de5':'#4a6080', fontSize:12, fontWeight:700, cursor:'pointer' }}>
            {l}
          </button>
        ))}
      </div>
      <button onClick={iniciar} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'#9b5de5', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer' }}>
        Empezar
      </button>
    </div>
  )

  // REPARTIENDO
  if (fase === 'repartiendo') {
    const jugadorActual = jugadores[turnoIdx]
    const esImpostor = jugadorActual?.nombre === impostorNombre
    const esUltimo = turnoIdx === jugadores.length - 1
    return (
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginBottom:20, letterSpacing:2 }}>
          REPARTIENDO PALABRAS · {turnoIdx + 1}/{jugadores.length}
        </div>
        <div style={card}>
          <div style={{ fontSize:18, fontWeight:700, color:'#9b5de5', marginBottom:16 }}>
            📱 Pasa el móvil a <span style={{ color:'#e8eaf0' }}>{jugadorActual?.nombre}</span>
          </div>
          {!palabraVisible ? (
            <button onClick={() => setPalabraVisible(true)}
              style={{ width:'100%', padding:16, borderRadius:12, border:'1px solid rgba(155,93,229,0.4)', background:'rgba(155,93,229,0.1)', color:'#9b5de5', fontSize:15, fontWeight:700, cursor:'pointer' }}>
              Ver mi palabra
            </button>
          ) : (
            <div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:8 }}>Tu palabra es:</div>
              <div style={{ fontSize: esImpostor ? 32 : 28, fontWeight:800, marginBottom:12, color: esImpostor ? '#e63946' : '#2a9d8f', padding:'20px', background: esImpostor ? 'rgba(230,57,70,0.1)' : 'rgba(42,157,143,0.1)', borderRadius:12, border: esImpostor ? '1px solid rgba(230,57,70,0.3)' : '1px solid rgba(42,157,143,0.3)' }}>
                {esImpostor ? 'IMPOSTOR' : palabra}
              </div>
              {esImpostor && <div style={{ fontSize:12, color:'rgba(230,57,70,0.7)', marginBottom:16 }}>No sabes la palabra. Intenta pasar desapercibido.</div>}
              {!esImpostor && <div style={{ fontSize:12, color:'rgba(42,157,143,0.7)', marginBottom:16 }}>Di algo relacionado. No digas la palabra directamente.</div>}
              <button onClick={() => { setPalabraVisible(false); if (esUltimo) { pasarAVotacion() } else { setTurnoIdx(t => t + 1) } }}
                style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'#9b5de5', color:'#fff', fontSize:15, fontWeight:700, cursor:'pointer' }}>
                {esUltimo ? '¡Todos listos! Empezar votación' : 'Siguiente jugador →'}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // VOTACION
  if (fase === 'votacion') {
    const jugadorVotante = activos[votanteIdx]
    const yaVoto = votos[jugadorVotante?.nombre]
    return (
      <div>
        <div style={{ textAlign:'center', marginBottom:16 }}>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.3)', letterSpacing:2 }}>RONDA {ronda} · VOTACIÓN</div>
          <div style={{ fontSize:16, fontWeight:700, color:'#f4a261', marginTop:6 }}>
            📱 Pasa el móvil a <span style={{ color:'#e8eaf0' }}>{jugadorVotante?.nombre}</span>
          </div>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginTop:4 }}>Vota a quien crees que es el impostor</div>
        </div>
        <div style={card}>
          {activos.filter(j => j.nombre !== jugadorVotante?.nombre).map(j => (
            <button key={j.nombre} onClick={() => !yaVoto && votar(j.nombre)} disabled={!!yaVoto}
              style={{ width:'100%', padding:'14px 16px', borderRadius:10, border:`1px solid ${yaVoto === j.nombre ? 'rgba(244,162,97,0.6)' : 'rgba(255,255,255,0.08)'}`, background: yaVoto === j.nombre ? 'rgba(244,162,97,0.15)' : 'rgba(255,255,255,0.04)', color: yaVoto === j.nombre ? '#f4a261' : '#e8eaf0', fontSize:15, fontWeight:600, cursor: yaVoto ? 'default' : 'pointer', marginBottom:8, textAlign:'left' }}>
              {j.nombre}
            </button>
          ))}
          {yaVoto && <div style={{ textAlign:'center', fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:8 }}>Votado ✓ — pasando al siguiente...</div>}
        </div>
      </div>
    )
  }

  // ENTRE RONDAS
  if (fase === 'entre_rondas' && ultimoEliminado) {
    const conteo = ultimoEliminado.conteo
    const activosRestantes = jugadores.filter(j => !eliminados.includes(j.nombre))
    return (
      <div style={{ textAlign:'center', paddingTop:20 }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🗳️</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:'#f4a261', letterSpacing:3, marginBottom:8 }}>
          ELIMINADO
        </div>
        <div style={{ fontSize:22, fontWeight:800, color:'#e63946', marginBottom:4 }}>{ultimoEliminado.nombre}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginBottom:20 }}>
          No era el impostor. Quedan {activosRestantes.length} jugadores.
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:16, marginBottom:24, textAlign:'left' }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:10, letterSpacing:2 }}>VOTOS RONDA {ronda}</div>
          {Object.entries(conteo).sort(([,a],[,b]) => b-a).map(([nombre, n]) => (
            <div key={nombre} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:14, color: nombre === ultimoEliminado.nombre ? '#e63946' : '#e8eaf0' }}>
              <span>{nombre}</span>
              <span style={{ fontWeight:700, color:'#f4a261' }}>{n} voto{n>1?'s':''}</span>
            </div>
          ))}
        </div>
        <button onClick={siguienteRonda} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'#9b5de5', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer' }}>
          Siguiente ronda →
        </button>
      </div>
    )
  }

  // FIN
  if (fase === 'fin' && resultado) {
    const conteo = resultado.conteo
    return (
      <div style={{ textAlign:'center', paddingTop:20 }}>
        <div style={{ fontSize:64, marginBottom:16 }}>{resultado.ganadores === 'jugadores' ? '🎉' : '🎭'}</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color: resultado.ganadores === 'jugadores' ? '#2a9d8f' : '#e63946', letterSpacing:3, marginBottom:16 }}>
          {resultado.ganadores === 'jugadores' ? 'GANARON LOS JUGADORES' : 'GANÓ EL IMPOSTOR'}
        </div>
        <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:4 }}>La palabra era</div>
        <div style={{ fontSize:28, fontWeight:800, color:'#9b5de5', marginBottom:8 }}>{palabra}</div>
        <div style={{ fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>
          El impostor era: <strong style={{ color:'#e63946' }}>{impostorNombre}</strong>
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:16, marginBottom:24, textAlign:'left' }}>
          <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', marginBottom:10, letterSpacing:2 }}>VOTOS RONDA {ronda}</div>
          {Object.entries(conteo).sort(([,a],[,b]) => b-a).map(([nombre, n]) => (
            <div key={nombre} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', fontSize:14, color: nombre === impostorNombre ? '#e63946' : '#e8eaf0' }}>
              <span>{nombre} {nombre === impostorNombre ? '🎭' : ''}</span>
              <span style={{ fontWeight:700, color:'#f4a261' }}>{n} voto{n>1?'s':''}</span>
            </div>
          ))}
        </div>
        <button onClick={reiniciar} style={{ padding:'14px 32px', borderRadius:14, border:'none', background:'#9b5de5', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:12 }}>
          Jugar de nuevo
        </button>
        <div>
          <button onClick={onVolver} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14 }}>Salir</button>
        </div>
      </div>
    )
  }

  return null
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────
export default function MentirosoHome() {
  const nav = useNavigate()
  const [mode, setMode] = useState('menu')        // menu | presencial | online_menu | crear | unirse
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [categoria, setCategoria] = useState('jugadores')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [misSesiones, setMisSesiones] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'Jugador'
      setNombre(name)
    })
    const saved = JSON.parse(localStorage.getItem('mentiroso_sesiones') || '[]')
    setMisSesiones(saved)
  }, [])

  const guardarSesion = (code, nombre, uid, esHost) => {
    const saved = JSON.parse(localStorage.getItem('mentiroso_sesiones') || '[]')
    const existe = saved.find(s => s.code === code)
    if (!existe) {
      const nuevas = [...saved, { code, nombre, uid, esHost, fecha: Date.now() }]
      localStorage.setItem('mentiroso_sesiones', JSON.stringify(nuevas))
      setMisSesiones(nuevas)
    }
  }

  const eliminarSesionLocal = (code) => {
    const saved = JSON.parse(localStorage.getItem('mentiroso_sesiones') || '[]')
    const nuevas = saved.filter(s => s.code !== code)
    localStorage.setItem('mentiroso_sesiones', JSON.stringify(nuevas))
    setMisSesiones(nuevas)
    localStorage.removeItem(`mentiroso_uid_${code}`)
    localStorage.removeItem(`mentiroso_nombre_${code}`)
  }

  const eliminarSesionDB = async (code) => {
    await supabase.from('mentiroso_sessions').delete().eq('code', code)
    eliminarSesionLocal(code)
  }

  const crearSesion = async () => {
    if (!nombre.trim()) { setError('Pon tu nombre'); return }
    setLoading(true); setError('')
    const code = generateCode()
    const uid = user.id
    const { error: err } = await supabase.from('mentiroso_sessions').insert({
      code, creator_id: uid, categoria, estado: 'esperando',
      jugadores: [{ id: uid, nombre: nombre.trim(), listo: false }]
    })
    if (err) { setError('Error al crear sesion'); setLoading(false); return }
    localStorage.setItem(`mentiroso_nombre_${code}`, nombre.trim())
    localStorage.setItem(`mentiroso_uid_${code}`, uid)
    guardarSesion(code, nombre.trim(), uid, true)
    nav(`/mentiroso/${code}`)
    setLoading(false)
  }

  const unirseASesion = async () => {
    if (!nombre.trim()) { setError('Pon tu nombre'); return }
    if (!codigo.trim()) { setError('Pon el codigo'); return }
    setLoading(true); setError('')
    const codeUp = codigo.toUpperCase()
    const { data: session, error: err } = await supabase
      .from('mentiroso_sessions').select('*').eq('code', codeUp).single()
    if (err || !session) { setError('Sesion no encontrada'); setLoading(false); return }
    if (session.estado !== 'esperando') { setError('La partida ya ha empezado'); setLoading(false); return }

    const uid = user.id
    const jugadores = [...(session.jugadores || [])]
    if (!jugadores.find(j => j.id === uid)) {
      jugadores.push({ id: uid, nombre: nombre.trim(), listo: false })
      await supabase.from('mentiroso_sessions').update({ jugadores }).eq('code', codeUp)
    }
    localStorage.setItem(`mentiroso_nombre_${codeUp}`, nombre.trim())
    localStorage.setItem(`mentiroso_uid_${codeUp}`, uid)
    guardarSesion(codeUp, nombre.trim(), uid, false)
    nav(`/mentiroso/${codeUp}`)
    setLoading(false)
  }

  const volverASesion = (s) => {
    localStorage.setItem(`mentiroso_nombre_${s.code}`, s.nombre)
    localStorage.setItem(`mentiroso_uid_${s.code}`, s.uid)
    nav(`/mentiroso/${s.code}`)
  }

  const inp = { width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid rgba(155,93,229,0.3)', background:'rgba(155,93,229,0.06)', color:'#e8eaf0', fontSize:15, boxSizing:'border-box', outline:'none', marginBottom:12 }

  // ── PRESENCIAL ──
  if (mode === 'presencial') return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a,#0d0d20)', fontFamily:'system-ui,sans-serif', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420, margin:'0 auto' }}>
        <ModoPresencial onVolver={() => setMode('menu')} />
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a,#0d0d20)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420 }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <button onClick={() => nav('/')} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:13, marginBottom:16 }}>← Volver</button>
          <div style={{ fontSize:48, marginBottom:8 }}>🎭</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, color:'#9b5de5', letterSpacing:6 }}>MENTIROSO</div>
          <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13 }}>El impostor del futbol</div>
        </div>

        {error && <div style={{ background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, padding:'10px 14px', marginBottom:16, color:'#fca5a5', fontSize:14 }}>{error}</div>}

        {/* ── MENÚ PRINCIPAL ── */}
        {mode === 'menu' && (
          <>
            {/* Sesiones guardadas */}
            {misSesiones.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.3)', letterSpacing:2, marginBottom:10 }}>TUS SESIONES</div>
                {misSesiones.map(s => (
                  <div key={s.code} style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(155,93,229,0.06)', border:'1px solid rgba(155,93,229,0.15)', borderRadius:12, padding:'10px 14px', marginBottom:8 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, color:'#9b5de5', fontSize:16, letterSpacing:2 }}>{s.code}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{s.nombre} · {s.esHost ? 'Host' : 'Jugador'}</div>
                    </div>
                    <button onClick={() => volverASesion(s)} style={{ padding:'6px 14px', borderRadius:8, border:'none', background:'#9b5de5', color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                      Volver
                    </button>
                    <button onClick={() => s.esHost ? eliminarSesionDB(s.code) : eliminarSesionLocal(s.code)}
                      style={{ padding:'6px 10px', borderRadius:8, border:'1px solid rgba(230,57,70,0.3)', background:'rgba(230,57,70,0.08)', color:'#e63946', fontSize:13, cursor:'pointer' }}>
                      {s.esHost ? 'Eliminar' : 'Salir'}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button onClick={() => setMode('presencial')}
                style={{ padding:'18px', borderRadius:14, border:'1px solid rgba(155,93,229,0.4)', background:'rgba(155,93,229,0.1)', color:'#9b5de5', fontSize:17, fontWeight:700, cursor:'pointer' }}>
                🏠 Presencial
              </button>
              <button onClick={() => setMode('online_menu')}
                style={{ padding:'18px', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#e8eaf0', fontSize:17, fontWeight:700, cursor:'pointer' }}>
                🌐 Online
              </button>
            </div>
          </>
        )}

        {/* ── ONLINE SUBMENÚ ── */}
        {mode === 'online_menu' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <button onClick={() => setMode('crear')}
              style={{ padding:'18px', borderRadius:14, border:'1px solid rgba(155,93,229,0.4)', background:'rgba(155,93,229,0.1)', color:'#9b5de5', fontSize:17, fontWeight:700, cursor:'pointer' }}>
              Crear sesion
            </button>
            <button onClick={() => setMode('unirse')}
              style={{ padding:'18px', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#e8eaf0', fontSize:17, fontWeight:700, cursor:'pointer' }}>
              Unirse con codigo
            </button>
            <button onClick={() => { setMode('menu'); setError('') }}
              style={{ padding:10, borderRadius:10, border:'none', background:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14 }}>
              ← Volver
            </button>
          </div>
        )}

        {/* ── CREAR ── */}
        {mode === 'crear' && (
          <div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:8 }}>Tu nombre:</div>
            <input style={inp} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:10 }}>Categoria:</div>
            <div style={{ display:'flex', gap:8, marginBottom:20 }}>
              {[['jugadores','Jugadores'],['clubes','Clubes'],['selecciones','Selecciones']].map(([k,l]) => (
                <button key={k} onClick={() => setCategoria(k)} style={{ flex:1, padding:'10px 4px', borderRadius:10, border:`1px solid ${categoria===k?'rgba(155,93,229,0.5)':'rgba(255,255,255,0.08)'}`, background:categoria===k?'rgba(155,93,229,0.15)':'rgba(255,255,255,0.04)', color:categoria===k?'#9b5de5':'#4a6080', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={crearSesion} disabled={loading} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'#9b5de5', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
              {loading ? 'Creando...' : 'Crear y entrar'}
            </button>
            <button onClick={() => { setMode('online_menu'); setError('') }} style={{ width:'100%', padding:10, borderRadius:10, border:'none', background:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14 }}>Cancelar</button>
          </div>
        )}

        {/* ── UNIRSE ── */}
        {mode === 'unirse' && (
          <div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:8 }}>Tu nombre:</div>
            <input style={inp} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <input style={inp} placeholder="Codigo de la sesion" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} maxLength={6} />
            <button onClick={unirseASesion} disabled={loading} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'#9b5de5', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
              {loading ? 'Entrando...' : 'Unirse'}
            </button>
            <button onClick={() => { setMode('online_menu'); setError('') }} style={{ width:'100%', padding:10, borderRadius:10, border:'none', background:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14 }}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}
