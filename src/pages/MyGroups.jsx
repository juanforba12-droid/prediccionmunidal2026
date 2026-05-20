import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function MyGroups() {
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { nav('/auth'); return }
      setUser(data.user)
      loadGroups(data.user.id)
    })
  }, [])

  const loadGroups = async (userId) => {
    const { data } = await supabase
      .from('players')
      .select('*, groups(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setGroups(data || [])
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    nav('/auth')
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#080c14', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:40, animation:'pulse 1.2s infinite' }}>⚽</div>
      <div style={{ color:'#3a5070', fontFamily:'Outfit,sans-serif' }}>Cargando...</div>
    </div>
  )

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080c14; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .fade { animation: fadeUp .35s ease both; }
  `

  return (
    <div style={{ minHeight:'100vh', background:'#080c14', fontFamily:"'Outfit',sans-serif", color:'#e8eaf0', padding:'0 0 80px' }}>
      <style>{css}</style>

      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 20% 20%, rgba(230,57,70,0.08) 0%, transparent 55%)',
        backgroundImage:'radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize:'28px 28px' }} />

      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(8,12,20,.96)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'12px 16px' }}>
        <div style={{ maxWidth:600, margin:'0 auto', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:24, color:'#e63946' }}>QUINIELA 2026</div>
          <div style={{ flex:1 }} />
          <div style={{ fontSize:12, color:'#3a5070' }}>{user?.email}</div>
          <button onClick={handleLogout} style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#3a5070', padding:'6px 12px', cursor:'pointer', fontSize:12, fontFamily:"'Outfit',sans-serif" }}>
            Salir
          </button>
        </div>
      </div>

      <div style={{ maxWidth:600, margin:'0 auto', padding:'20px 16px', position:'relative', zIndex:1 }}>

        {/* Welcome */}
        <div className="fade" style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, letterSpacing:3, color:'#2a4060', textTransform:'uppercase', marginBottom:4 }}>Bienvenido</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:32, color:'#e8eaf0' }}>
            {user?.user_metadata?.display_name || user?.email?.split('@')[0]}
          </div>
        </div>

        {/* Action buttons */}
        <div className="fade" style={{ display:'flex', gap:10, marginBottom:28, animationDelay:'.05s' }}>
          <button onClick={() => nav('/crear')} style={{ flex:1, padding:'14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:15, fontFamily:"'Outfit',sans-serif", background:'linear-gradient(135deg,#e63946,#c1121f)', color:'#fff', boxShadow:'0 4px 20px rgba(230,57,70,0.3)' }}>
            ⚽ Crear grupo
          </button>
          <button onClick={() => nav('/unirse')} style={{ flex:1, padding:'14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontWeight:700, fontSize:15, fontFamily:"'Outfit',sans-serif", background:'rgba(255,255,255,0.06)', color:'#a0b4cc' }}>
            🔗 Unirse
          </button>
        </div>

        {/* My groups */}
        <div className="fade" style={{ animationDelay:'.1s' }}>
          <div style={{ fontSize:11, letterSpacing:3, color:'#2a4060', textTransform:'uppercase', marginBottom:14 }}>
            Mis grupos ({groups.length})
          </div>

          {groups.length === 0 ? (
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:16, padding:'40px 20px', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>⚽</div>
              <div style={{ color:'#3a5070', fontSize:14, marginBottom:8 }}>Aún no estás en ningún grupo</div>
              <div style={{ color:'#1a2a3a', fontSize:12 }}>Crea uno o únete con un código</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {groups.map((pl, i) => {
                const grp = pl.groups
                const isCreator = grp?.creator_id === pl.id
                return (
                  <div key={pl.id} className="fade" style={{ animationDelay:`${i*0.05}s`,
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius:14, padding:'16px 18px', display:'flex', alignItems:'center', gap:14,
                    cursor:'pointer', transition:'all .2s' }}
                    onClick={() => {
                      localStorage.setItem(`player_${grp.code}`, JSON.stringify({ id: pl.id, name: pl.name, avatar: pl.avatar, color: pl.color }))
                      nav(`/grupo/${grp.code}`)
                    }}>
                    <div style={{ fontSize:28, width:44, height:44, display:'flex', alignItems:'center', justifyContent:'center', background:`${pl.color}22`, borderRadius:12 }}>{pl.avatar}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:16, color:'#e8eaf0' }}>{grp?.name}</div>
                      <div style={{ fontSize:11, color:'#2a4060', marginTop:2 }}>
                        {isCreator ? '👑 Admin · ' : ''}Código: <span style={{ color:'#e63946', fontWeight:700, letterSpacing:2 }}>{grp?.code}</span>
                      </div>
                    </div>
                    <div style={{ color:'#2a4060', fontSize:20 }}>›</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
