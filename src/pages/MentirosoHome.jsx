import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function MentirosoHome() {
  const nav = useNavigate()
  const [mode, setMode] = useState('menu')
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [categoria, setCategoria] = useState('jugadores')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [misSesiones, setMisSesiones] = useState([]) // sesiones guardadas localmente

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'Jugador'
      setNombre(name)
    })
    // Cargar sesiones guardadas
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

  const s = { width:'100%', padding:'12px 16px', borderRadius:10, border:'1px solid rgba(155,93,229,0.3)', background:'rgba(155,93,229,0.06)', color:'#e8eaf0', fontSize:15, boxSizing:'border-box', outline:'none', marginBottom:12 }

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

        {/* Sesiones guardadas */}
        {mode === 'menu' && misSesiones.length > 0 && (
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

        {mode === 'menu' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <button onClick={() => setMode('crear')} style={{ padding:'18px', borderRadius:14, border:'1px solid rgba(155,93,229,0.4)', background:'rgba(155,93,229,0.1)', color:'#9b5de5', fontSize:17, fontWeight:700, cursor:'pointer' }}>
              Crear sesion
            </button>
            <button onClick={() => setMode('unirse')} style={{ padding:'18px', borderRadius:14, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'#e8eaf0', fontSize:17, fontWeight:700, cursor:'pointer' }}>
              Unirse con codigo
            </button>
          </div>
        )}

        {mode === 'crear' && (
          <div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:8 }}>Tu nombre:</div>
            <input style={s} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
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
            <button onClick={() => { setMode('menu'); setError('') }} style={{ width:'100%', padding:10, borderRadius:10, border:'none', background:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14 }}>Cancelar</button>
          </div>
        )}

        {mode === 'unirse' && (
          <div>
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:8 }}>Tu nombre:</div>
            <input style={s} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <input style={s} placeholder="Codigo de la sesion" value={codigo} onChange={e => setCodigo(e.target.value.toUpperCase())} maxLength={6} />
            <button onClick={unirseASesion} disabled={loading} style={{ width:'100%', padding:14, borderRadius:12, border:'none', background:'#9b5de5', color:'#fff', fontSize:16, fontWeight:700, cursor:'pointer', marginBottom:10 }}>
              {loading ? 'Entrando...' : 'Unirse'}
            </button>
            <button onClick={() => { setMode('menu'); setError('') }} style={{ width:'100%', padding:10, borderRadius:10, border:'none', background:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:14 }}>Cancelar</button>
          </div>
        )}
      </div>
    </div>
  )
}
