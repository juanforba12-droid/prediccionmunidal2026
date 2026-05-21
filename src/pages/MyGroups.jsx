import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function MyGroups() {
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const nav = useNavigate()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { nav('/auth'); return }
      setUser(user)

      const { data: players } = await supabase
        .from('players')
        .select('*, groups(*)')
        .eq('user_id', user.id)

      setGroups(players || [])
      setLoading(false)
    }
    load()
  }, [nav])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    nav('/auth')
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', fontSize: 18 }}>⚽ Cargando...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#e53935', fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>QUINIELA 2026</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{user?.email}</span>
          <button onClick={handleSignOut} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontSize: 13 }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>BIENVENIDO</div>
          <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, textTransform: 'uppercase' }}>{displayName}</div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
          <button onClick={() => nav('/crear')} style={{ flex: 1, padding: '14px 20px', background: '#e53935', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            ⚽ Crear grupo
          </button>
          <button onClick={() => nav('/unirse')} style={{ flex: 1, padding: '14px 20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            🔗 Unirse
          </button>
        </div>

        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 2, marginBottom: 16 }}>MIS GRUPOS ({groups.length})</div>

        {groups.length === 0 ? (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚽</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 8 }}>Aún no estás en ningún grupo</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Crea uno o únete con un código.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {groups.map(p => (
              <div key={p.id} onClick={() => nav(`/grupo/${p.groups.code}`)}
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{p.groups.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Código: {p.groups.code}</div>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 20 }}>›</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
