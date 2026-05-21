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
      const { data: { user } } = await supabase.auth.getUser()
      const code = genCode()
      const playerId = genCode()

      const { error: ge } = await supabase.from('groups').insert({
        code, name: groupName.trim(), creator_id: playerId
      })
      if (ge) throw ge

      const { error: pe } = await supabase.from('players').insert({
        id: playerId, group_code: code, name: playerName.trim(),
        avatar, color, user_id: user.id
      })
      if (pe) throw pe

      localStorage.setItem(`player_${code}`, JSON.stringify({ id: playerId, name: playerName.trim(), avatar, color }))
      nav(`/grupo/${code}`)
    } catch (e) {
      setError('Error al crear el grupo: ' + e.message)
    }
    setLoading(false)
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080c14; }
    input { font-family: 'Outfit', sans-serif; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .fade { animation: fadeUp .35s ease both; }
  `

  return (
    <div style={{ minHeight:'100vh', background:'#080c14', fontFamily:"'Outfit',sans-serif", color:'#e8eaf0', padding:'24px 16px', position:'relative' }}>
      <style>{css}</style>
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize:'28px 28px' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:440, margin:'0 auto' }}>
        <button onClick={() => nav('/')} style={{ marginBottom:24, padding:'8px 16px', fontSize:13, background:'rgba(255,255,255,0.07)', border:'none', borderRadius:10, color:'#a0b4cc', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>← Volver</button>

        <div style={{ fontSize:10, letterSpacing:4, color:'#2a4060', textTransform:'uppercase', marginBottom:6 }}>Nuevo grupo</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, marginBottom:24 }}>CREAR GRUPO</div>

        <div className="fade" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, marginBottom:14 }}>
          <div style={{ fontSize:13, color:'#2a7070', marginBottom:8 }}>Nombre del grupo</div>
          <input style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#e8eaf0', fontSize:15, padding:'12px 16px' }}
            placeholder="Ej: Los Cracks del Trabajo" value={groupName} onChange={e=>setGroupName(e.target.value)} maxLength={30} />
        </div>

        <div className="fade" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, marginBottom:16, animationDelay:'.08s' }}>
          <div style={{ fontSize:13, color:'#2a7070', marginBottom:8 }}>Tu nombre en el grupo</div>
          <input style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#e8eaf0', fontSize:15, padding:'12px 16px' }}
            placeholder="¿Cómo te llamas?" value={playerName} onChange={e=>setPlayerName(e.target.value)} maxLength={20} />

          <div style={{ fontSize:13, color:'#2a7070', marginTop:18, marginBottom:10 }}>Tu avatar</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {AVATARS.map(a => (
              <button key={a} onClick={() => setAvatar(a)} style={{ fontSize:22, background:avatar===a?'rgba(230,57,70,.2)':'rgba(255,255,255,.05)', border:`2px solid ${avatar===a?'#e63946':'transparent'}`, borderRadius:10, padding:'6px 10px', cursor:'pointer', transition:'all .15s' }}>{a}</button>
            ))}
          </div>

          <div style={{ fontSize:13, color:'#2a7070', marginTop:18, marginBottom:10 }}>Tu color</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setColor(c)} style={{ width:32, height:32, borderRadius:'50%', background:c, border:`3px solid ${color===c?'#fff':'transparent'}`, cursor:'pointer', transition:'all .15s', transform:color===c?'scale(1.2)':'scale(1)' }} />
            ))}
          </div>
        </div>

        {error && <div style={{ color:'#e63946', fontSize:13, marginBottom:12, textAlign:'center' }}>{error}</div>}

        <button onClick={handle} disabled={loading} style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:16, fontFamily:"'Outfit',sans-serif", background:'linear-gradient(135deg,#e63946,#c1121f)', color:'#fff', boxShadow:'0 4px 20px rgba(230,57,70,0.35)', opacity:loading?0.6:1 }}>
          {loading ? 'Creando...' : '⚽ Crear grupo'}
        </button>
      </div>
    </div>
  )
}
