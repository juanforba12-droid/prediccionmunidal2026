import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { AVATARS, COLORS, genCode } from '../lib/data.js'

export default function JoinGroup() {
  const nav = useNavigate()
  const { code: paramCode } = useParams()
  const [code, setCode] = useState(paramCode || '')
  const [playerName, setPlayerName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[2])
  const [color, setColor] = useState(COLORS[2])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [groupName, setGroupName] = useState('')

  useEffect(() => {
    if (paramCode) fetchGroup(paramCode)
  }, [paramCode])

  const fetchGroup = async (c) => {
    const { data } = await supabase.from('groups').select('name').eq('code', c.toUpperCase()).single()
    if (data) setGroupName(data.name)
  }

  const handle = async () => {
    const c = code.trim().toUpperCase()
    if (!c || !playerName.trim()) { setError('Rellena todos los campos'); return }
    setLoading(true); setError('')
    try {
      // Check group exists
      const { data: grp } = await supabase.from('groups').select('*').eq('code', c).single()
      if (!grp) { setError('Grupo no encontrado. Revisa el código.'); setLoading(false); return }

      // Check name not taken
      const { data: existing } = await supabase.from('players').select('name').eq('group_code', c).ilike('name', playerName.trim())
      if (existing && existing.length > 0) { setError('Ese nombre ya está en uso en este grupo.'); setLoading(false); return }

      const playerId = genCode()
      const { error: pe } = await supabase.from('players').insert({
        id: playerId, group_code: c, name: playerName.trim(), avatar, color
      })
      if (pe) throw pe

      localStorage.setItem(`player_${c}`, JSON.stringify({ id: playerId, name: playerName.trim(), avatar, color }))
      nav(`/grupo/${c}`)
    } catch (e) {
      setError('Error al unirse: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', padding:'24px 16px', position:'relative' }}>
      <div className="bg-dots" />
      <div style={{ position:'relative', zIndex:1, maxWidth:440, margin:'0 auto' }}>
        <button className="btn btn-ghost" style={{ marginBottom:24, padding:'8px 16px', fontSize:13 }} onClick={() => nav('/')}>← Volver</button>

        <div className="tag" style={{ marginBottom:6 }}>Unirse</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, marginBottom:24 }}>ENTRAR AL GRUPO</div>

        {groupName && (
          <div style={{ background:'rgba(42,157,143,.12)', border:'1px solid rgba(42,157,143,.3)', borderRadius:12, padding:'12px 16px', marginBottom:16, color:'#2a9d8f', fontWeight:700 }}>
            📋 {groupName}
          </div>
        )}

        <div className="card fade-up" style={{ marginBottom:14 }}>
          <div style={{ fontSize:13, color:'#2a7070', marginBottom:8 }}>Código del grupo</div>
          <input className="inp" placeholder="Ej: AB12CD" value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); if(e.target.value.length===6) fetchGroup(e.target.value) }}
            maxLength={6} style={{ letterSpacing:6, fontSize:22, fontWeight:700, textAlign:'center' }} />
        </div>

        <div className="card fade-up" style={{ marginBottom:16, animationDelay:'.08s' }}>
          <div style={{ fontSize:13, color:'#2a7070', marginBottom:8 }}>Tu nombre</div>
          <input className="inp" placeholder="¿Cómo te llamas?" value={playerName} onChange={e=>setPlayerName(e.target.value)} maxLength={20} />

          <div style={{ fontSize:13, color:'#2a7070', marginTop:18, marginBottom:10 }}>Tu avatar</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{
                fontSize:22, background:avatar===a?'rgba(230,57,70,.2)':'rgba(255,255,255,.05)',
                border:`2px solid ${avatar===a?'#e63946':'transparent'}`,
                borderRadius:10, padding:'6px 10px', cursor:'pointer', transition:'all .15s'
              }}>{a}</button>
            ))}
          </div>

          <div style={{ fontSize:13, color:'#2a7070', marginTop:18, marginBottom:10 }}>Tu color</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{
                width:32, height:32, borderRadius:'50%', background:c, border:`3px solid ${color===c?'#fff':'transparent'}`,
                cursor:'pointer', transition:'all .15s', transform:color===c?'scale(1.2)':'scale(1)'
              }} />
            ))}
          </div>
        </div>

        {error && <div style={{ color:'#e63946', fontSize:13, marginBottom:12, textAlign:'center' }}>{error}</div>}

        <button className="btn btn-primary" style={{ width:'100%', fontSize:16 }} onClick={handle} disabled={loading}>
          {loading ? 'Uniéndose...' : '🔗 Unirse al grupo'}
        </button>
      </div>
    </div>
  )
}
