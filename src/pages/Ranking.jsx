import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getRankInfo } from '../lib/ranks.js'

export default function Ranking() {
  const nav = useNavigate()
  const [tab, setTab] = useState('global')
  const [global, setGlobal] = useState([])
  const [friends, setFriends] = useState([])
  const [myId, setMyId] = useState(null)
  const [myName, setMyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data?.user
      if (u) {
        setMyId(u.id)
        setMyName(u.user_metadata?.full_name || 'Tú')
      }
      await loadGlobal()
      if (u) await loadFriends(u.id)
      setLoading(false)
    })
  }, [])

  const loadGlobal = async () => {
    const { data } = await supabase
      .from('user_points')
      .select('user_id, total_points')
      .order('total_points', { ascending: false })
      .limit(100)
    if (!data) return
    // Get names from auth profiles
    const ids = data.map(d => d.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', ids)
    const nameMap = {}
    profiles?.forEach(p => { nameMap[p.id] = p.full_name })
    setGlobal(data.filter(d => d.total_points > 0).map(d => ({
      id: d.user_id,
      name: nameMap[d.user_id] || 'Jugador',
      pts: d.total_points,
    })))
  }

  const loadFriends = async (userId) => {
    const { data: friendLinks } = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId)
    if (!friendLinks?.length) return
    const friendIds = friendLinks.map(f => f.friend_id)
    const { data: pts } = await supabase
      .from('user_points')
      .select('user_id, total_points')
      .in('user_id', friendIds)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', friendIds)
    const nameMap = {}
    profiles?.forEach(p => { nameMap[p.id] = p.full_name })
    const ptsMap = {}
    pts?.forEach(p => { ptsMap[p.user_id] = p.total_points })
    setFriends(friendIds.map(id => ({
      id,
      name: nameMap[id] || 'Jugador',
      pts: ptsMap[id] || 0,
    })).sort((a, b) => b.pts - a.pts))
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .ilike('full_name', `%${searchQuery.trim()}%`)
      .limit(10)
    setSearchResults(data?.filter(p => p.id !== myId) || [])
    setSearching(false)
  }

  const addFriend = async (friendId, friendName) => {
    if (!myId) { setAddMsg('Inicia sesión para añadir amigos'); return }
    const { error } = await supabase.from('friends').upsert(
      { user_id: myId, friend_id: friendId },
      { onConflict: 'user_id,friend_id' }
    )
    if (error) { setAddMsg('Error al añadir'); return }
    setAddMsg(`✅ ${friendName} añadido`)
    setTimeout(() => setAddMsg(''), 2500)
    await loadFriends(myId)
  }

  const removeFriend = async (friendId) => {
    if (!myId) return
    await supabase.from('friends').delete()
      .eq('user_id', myId).eq('friend_id', friendId)
    await loadFriends(myId)
  }

  const myGlobalPos = global.findIndex(p => p.id === myId) + 1

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c1a,#1a1030,#0c1520)', fontFamily:'system-ui,sans-serif', color:'#e8e0f0', paddingBottom:80 }}>

      {/* HEADER */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:'1px solid rgba(192,132,252,0.15)', padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => nav('/')} style={{ background:'none', border:'none', color:'#6a5a8a', cursor:'pointer', fontSize:20 }}>←</button>
        <div style={{ flex:1, fontSize:16, fontWeight:900, color:'#c084fc', letterSpacing:1 }}>🏆 CLASIFICACIÓN</div>
        {myGlobalPos > 0 && <div style={{ background:'rgba(192,132,252,0.15)', borderRadius:20, padding:'4px 14px', fontSize:13, fontWeight:900, color:'#c084fc' }}>
          Tu posición: #{myGlobalPos}
        </div>}
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'16px 16px 0' }}>

        {/* TABS */}
        <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', borderRadius:12, padding:4, marginBottom:20, gap:4 }}>
          {[['global','🌍 Global'],['amigos','👥 Amigos'],['buscar','🔍 Buscar']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'10px 4px', borderRadius:10, border:'none', background:tab===k?'rgba(192,132,252,0.2)':'transparent', color:tab===k?'#c084fc':'rgba(255,255,255,0.4)', fontWeight:700, fontSize:13, cursor:'pointer' }}>
              {l}
            </button>
          ))}
        </div>

        {/* GLOBAL TAB */}
        {tab === 'global' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {loading ? (
              <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.3)' }}>Cargando...</div>
            ) : global.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.3)' }}>Aún no hay jugadores con puntos</div>
            ) : global.map((p, i) => {
              const isMe = p.id === myId
              const { rank } = getRankInfo(p.pts)
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}º`
              return (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, background:isMe?'rgba(192,132,252,0.1)':'rgba(255,255,255,0.04)', border:`1px solid ${isMe?'rgba(192,132,252,0.3)':'rgba(255,255,255,0.07)'}` }}>
                  <div style={{ fontSize:20, width:32, textAlign:'center' }}>{medal}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:isMe?'#c084fc':'#e8e0f0' }}>{p.name}{isMe?' (tú)':''}</div>
                    <div style={{ fontSize:11, color:rank.color }}>{rank.emoji} {rank.name}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:900, fontSize:18, color:isMe?'#c084fc':'#e8e0f0' }}>{p.pts.toLocaleString()}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>XP</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* AMIGOS TAB */}
        {tab === 'amigos' && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {!myId ? (
              <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🔒</div>
                Inicia sesión para ver tus amigos
              </div>
            ) : friends.length === 0 ? (
              <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize:32, marginBottom:8 }}>👥</div>
                Aún no tienes amigos añadidos
                <div style={{ marginTop:8, fontSize:13 }}>Usa la pestaña Buscar para encontrarlos</div>
              </div>
            ) : friends.map((p, i) => {
              const { rank } = getRankInfo(p.pts)
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}º`
              return (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ fontSize:20, width:32, textAlign:'center' }}>{medal}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14, color:'#e8e0f0' }}>{p.name}</div>
                    <div style={{ fontSize:11, color:rank.color }}>{rank.emoji} {rank.name}</div>
                  </div>
                  <div style={{ textAlign:'right', marginRight:8 }}>
                    <div style={{ fontWeight:900, fontSize:18 }}>{p.pts.toLocaleString()}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)' }}>XP</div>
                  </div>
                  <button onClick={() => removeFriend(p.id)} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#f87171', fontSize:11, padding:'4px 8px', cursor:'pointer' }}>
                    Eliminar
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* BUSCAR TAB */}
        {tab === 'buscar' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {!myId && (
              <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#f87171', textAlign:'center' }}>
                Inicia sesión para añadir amigos
              </div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar por nombre de usuario..."
                style={{ flex:1, padding:'12px 14px', borderRadius:12, border:'1px solid rgba(192,132,252,0.3)', background:'rgba(192,132,252,0.08)', color:'#e8e0f0', fontSize:14, outline:'none' }}
              />
              <button onClick={handleSearch} style={{ padding:'12px 18px', borderRadius:12, border:'none', background:'linear-gradient(135deg,#c084fc,#818cf8)', color:'#fff', fontWeight:900, fontSize:14, cursor:'pointer' }}>
                {searching ? '...' : '🔍'}
              </button>
            </div>

            {addMsg && <div style={{ textAlign:'center', fontSize:13, color: addMsg.includes('✅') ? '#22c55e' : '#f87171', padding:'8px', background:'rgba(255,255,255,0.05)', borderRadius:10 }}>{addMsg}</div>}

            {searchResults.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {searchResults.map(p => {
                  const isFriend = friends.some(f => f.id === p.id)
                  return (
                    <div key={p.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                      <div style={{ fontSize:24 }}>👤</div>
                      <div style={{ flex:1, fontWeight:700, fontSize:14 }}>{p.full_name}</div>
                      {isFriend ? (
                        <span style={{ fontSize:12, color:'#22c55e' }}>✅ Amigo</span>
                      ) : (
                        <button onClick={() => addFriend(p.id, p.full_name)} style={{ padding:'8px 14px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#c084fc,#818cf8)', color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                          + Añadir
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {searchResults.length === 0 && searchQuery && !searching && (
              <div style={{ textAlign:'center', padding:20, color:'rgba(255,255,255,0.3)', fontSize:13 }}>
                No se encontraron usuarios con ese nombre
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
