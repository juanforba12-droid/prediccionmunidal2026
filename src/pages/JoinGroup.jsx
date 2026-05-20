import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { AVATARS, COLORS, genCode } from '../lib/data.js'

export default function JoinGroup() {
  const nav = useNavigate()
  const { code: paramCode } = useParams()
  const [searchParams] = useSearchParams()
  const pidFromUrl = searchParams.get('pid')

  const [code, setCode] = useState(paramCode || '')
  const [playerName, setPlayerName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[2])
  const [color, setColor] = useState(COLORS[2])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [groupName, setGroupName] = useState('')

  useEffect(() => {
    if (paramCode && pidFromUrl) {
      autoLogin(paramCode.toUpperCase(), pidFromUrl)
    } else if (paramCode) {
      fetchGroup(paramCode)
    }
  }, [paramCode, pidFromUrl])

  const autoLogin = async (c, pid) => {
    setLoading(true)
    const { data: player } = await supabase.from('players').select('*').eq('id', pid).eq('group_code', c).single()
    if (player) {
      localStorage.setItem(`player_${c}`, JSON.stringify({ id: player.id, name: player.name, avatar: player.avatar, color: player.color }))
      nav(`/grupo/${c}`)
    } else {
      setLoading(false)
      setError('Enlace no válido. Únete manualmente.')
    }
  }

  const fetchGroup = async (c) => {
    const { data } = await supabase.from('groups').select('name').eq('code', c.toUpperCase()).single()
    if (data) setGroupName(data.name)
  }

  const handle = async () => {
    const c = code.trim().toUpperCase()
    if (!c || !playerName.trim()) { setError('Rellena todos los campos'); return }
    setLoading(true); setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: grp } = await supabase.from('groups').select('*').eq('code', c).single()
      if (!grp) { setError('Grupo no encontrado.'); setLoading(false); return }

      // Check if user already in this group
      const { data: existing } = await supabase.from('players').select('*').eq('group_code', c).eq('user_id', user.id)
      if (existing && existing.length > 0) {
        const pl = existing[0]
        localStorage.setItem(`player_${c}`, JSON.stringify({ id: pl.id, name: pl.name, avatar: pl.avatar, color: pl.color }))
        nav(`/grupo/${c}`)
        return
      }

      // Check name not taken
      const { data: nameTaken } = await supabase.from('players').select('name').eq('group_code', c).ilike('name', playerName.trim())
      if (nameTaken && nameTaken.length > 0) { setError('Ese nombre ya está en uso.'); setLoading(false); return }

      const playerId = genCode()
      const { error: pe } = await supabase.from('players').insert({
        id: playerId, group_code: c, name: playerName.trim(), avatar, color, user_id: user.id
      })
      if (pe) throw pe

      localStorage.setItem(`player_${c}`, JSON.stringify({ id: playerId, name: playerName.trim(), avatar, color }))
      nav(`/grupo/${c}`)
    } catch (e) {
      setError('Error: ' + e.message)
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

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080c14', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:40, animation:'pulse 1.2s infinite' }}>⚽</div>
      <div style={{ color:'#3a5070', fontFamily:'Outfit,sans-serif' }}>Entrando...</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#080c14', fontFamily:"'Outfit',sans-serif", color:'#e8eaf0', padding:'24px 16px', position:'relative' }}>
      <style>{css}</style>
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none', backgroundImage:'radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize:'28px 28px' }} />

      <div style={{ position:'relative', zIndex:1, maxWidth:440, margin:'0 auto' }}>
        <button onClick={() => nav('/')} style={{ marginBottom:24, padding:'8px 16px', fontSize:13, background:'rgba(255,255,255,0.07)', border:'none', borderRadius:10, color:'#a0b4cc', cursor:'pointer', fontFamily:"'Outfit',sans-serif", fontWeight:700 }}>← Volver</button>

        <div style={{ fontSize:10, letterSpacing:4, color:'#2a4060', textTransform:'uppercase', marginBottom:6 }}>Unirse</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, marginBottom:24 }}>ENTRAR AL GRUPO</div>

        {groupName && (
          <div style={{ background:'rgba(42,157,143,.12)', border:'1px solid rgba(42,157,143,.3)', borderRadius:12, padding:'12px 16px', marginBottom:16, color:'#2a9d8f', fontWeight:700 }}>
            📋 {groupName}
          </div>
        )}

        <div className="fade" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, marginBottom:14 }}>
          <div style={{ fontSize:13, color:'#2a7070', marginBottom:8 }}>Código del grupo</div>
          <input style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#e8eaf0', fontSize:22, fontWeight:700, padding:'12px 16px', textAlign:'center', letterSpacing:6 }}
            placeholder="AB12CD" value={code} onChange={e => { setCode(e.target.value.toUpperCase()); if(e.target.value.length===6) fetchGroup(e.target.value) }} maxLength={6} />
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
          {loading ? 'Uniéndose...' : '🔗 Unirse al grupo'}
        </button>
      </div>
    </div>
  )
}
