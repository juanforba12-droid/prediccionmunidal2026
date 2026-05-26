import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export default function MentirosoHome() {
  const nav = useNavigate()
  const [mode, setMode] = useState('menu') // menu | crear | unirse
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [categoria, setCategoria] = useState('jugadores')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0] || 'Jugador'
      setNombre(name)
    })
  }, [])

  const crearSesion = async () => {
    if (!nombre.trim()) { setError('Pon tu nombre'); return }
    setLoading(true); setError('')
    const code = generateCode()
    const { error: err } = await supabase.from('mentiroso_sessions').insert({
      code, creator_id: user.id, categoria, estado: 'esperando',
      jugadores: [{ id: user.id, nombre: nombre.trim(), listo: false }]
    })
    if (err) { setError('Error al crear sesion'); setLoading(false); return }
    localStorage.setItem(`mentiroso_nombre_${code}`, nombre.trim())
    localStorage.setItem(`mentiroso_uid_${code}`, user.id)
    nav(`/mentiroso/${code}`)
    setLoading(false)
  }

  const unirseASesion = async () => {
    if (!nombre.trim()) { setError('Pon tu nombre'); return }
    if (!codigo.trim()) { setError('Pon el codigo'); return }
    setLoading(true); setError('')
    const { data: session, error: err } = await supabase
      .from('mentiroso_sessions').select('*').eq('code', codigo.toUpperCase()).single()
    if (err || !session) { setError('Sesion no encontrada'); setLoading(false); return }
    if (session.estado !== 'esperando') { setError('La partida ya ha empezado'); setLoading(false); return }

    const jugadores = [...(session.jugadores || [])]
    if (jugadores.find(j => j.id === user.id)) {
      localStorage.setItem(`mentiroso_nombre_${codigo.toUpperCase()}`, nombre.trim())
      localStorage.setItem(`mentiroso_uid_${codigo.toUpperCase()}`, user.id)
      nav(`/mentiroso/${codigo.toUpperCase()}`)
      setLoading(false); return
    }
    jugadores.push({ id: user.id, nombre: nombre.trim(), listo: false })
    const { error: err2 } = await supabase.from('mentiroso_sessions')
      .update({ jugadores }).eq('code', codigo.toUpperCase())
    if (err2) { setError('Error al unirse'); setLoading(false); return }
    localStorage.setItem(`mentiroso_nombre_${codigo.toUpperCase()}`, nombre.trim())
    localStorage.setItem(`mentiroso_uid_${codigo.toUpperCase()}`, user.id)
    nav(`/mentiroso/${codigo.toUpperCase()}`)
    setLoading(false)
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
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:16 }}>Tu nombre en la partida:</div>
            <input style={s} placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:10 }}>Categoria de palabras:</div>
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
            <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, marginBottom:16 }}>Tu nombre en la partida:</div>
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
