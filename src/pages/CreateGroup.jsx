import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { AVATARS, COLORS, genCode } from '../lib/data.js'

export default function CreateGroup() {
  const nav = useNavigate()
  const [groupName, setGroupName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async () => {
    if (!groupName.trim() || !playerName.trim()) { setError('Rellena todos los campos'); return }
    setLoading(true); setError('')
    try {
      const code = genCode()
      const playerId = genCode()

      const { error: ge } = await supabase.from('groups').insert({
        code, name: groupName.trim(), creator_id: playerId
      })
      if (ge) throw ge

      const { error: pe } = await supabase.from('players').insert({
        id: playerId, group_code: code, name: playerName.trim(), avatar, color
      })
      if (pe) throw pe

      // Save my identity in localStorage
      localStorage.setItem(`player_${code}`, JSON.stringify({ id: playerId, name: playerName.trim(), avatar, color }))
      nav(`/grupo/${code}`)
    } catch (e) {
      setError('Error al crear el grupo: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', padding:'24px 16px', position:'relative' }}>
      <div className="bg-dots" />
      <div style={{ position:'relative', zIndex:1, maxWidth:440, margin:'0 auto' }}>
        <button className="btn btn-ghost" style={{ marginBottom:24, padding:'8px 16px', fontSize:13 }} onClick={() => nav('/')}>← Volver</button>

        <div className="tag" style={{ marginBottom:6 }}>Nuevo grupo</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, marginBottom:24 }}>CREAR GRUPO</div>

        <div className="card fade-up" style={{ marginBottom:14 }}>
          <div style={{ fontSize:13, color:'#2a7070', marginBottom:8 }}>Nombre del grupo</div>
          <input className="inp" placeholder="Ej: Los Cracks del Trabajo" value={groupName} onChange={e=>setGroupName(e.target.value)} maxLength={30} />
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
          {loading ? 'Creando...' : '⚽ Crear grupo'}
        </button>
      </div>
    </div>
  )
}
