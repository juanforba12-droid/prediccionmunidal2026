import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const TOQUEYMEDIO_CODE = 'AL3R6U'

export default function MyGroups() {
  const [user, setUser] = useState(null)
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [joiningTqm, setJoiningTqm] = useState(false)
  const [tqmMsg, setTqmMsg] = useState('')
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

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'

  const yaEnTqm = groups.some(p => p.groups && p.groups.code === TOQUEYMEDIO_CODE)

  async function unirseToqueymedio() {
    if (yaEnTqm) { nav(`/grupo/${TOQUEYMEDIO_CODE}`); return }
    setJoiningTqm(true)
    setTqmMsg('')
    try {
      const { data: grp } = await supabase.from('groups').select('*').eq('code', TOQUEYMEDIO_CODE).single()
      if (!grp) {
        setTqmMsg('La liga aun no esta disponible, vuelve pronto!')
        setJoiningTqm(false)
        return
      }
      const { data: existing } = await supabase.from('players').select('*').eq('group_code', TOQUEYMEDIO_CODE).eq('user_id', user.id).single()
      if (existing) {
        nav(`/grupo/${TOQUEYMEDIO_CODE}`)
        return
      }
      const AVATARS = ['⚽','🦁','🐯','🦅','🐉','🦊','🐺','🦈','🐻','🦋','🌟','🔥','💎','🚀','🎯','👑']
      const COLORS = ['#e63946','#f4a261','#2a9d8f','#457b9d','#9b5de5','#e9c46a','#06d6a0','#ef476f','#118ab2','#ffd166']
      const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const { error } = await supabase.from('players').insert({
        group_code: TOQUEYMEDIO_CODE,
        user_id: user.id,
        name: displayName,
        avatar,
        color,
      })
      if (error) { setTqmMsg('Error al unirte. Intentalo de nuevo.'); setJoiningTqm(false); return }
      nav(`/grupo/${TOQUEYMEDIO_CODE}`)
    } catch(e) {
      setTqmMsg('Error inesperado. Intentalo de nuevo.')
    }
    setJoiningTqm(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#fff', fontSize: 18 }}>⚽ Cargando...</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top bar */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => nav('/')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 14px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            ← Menu
          </button>
          <div style={{ color: '#e53935', fontWeight: 800, fontSize: 18, letterSpacing: 1 }}>PREDICCION</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{user?.email}</span>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, letterSpacing: 2, marginBottom: 4 }}>BIENVENIDO</div>
          <div style={{ color: '#fff', fontSize: 36, fontWeight: 800, textTransform: 'uppercase' }}>{displayName}</div>
        </div>

        {/* TARJETA TOQUEYMEDIO */}
        <div onClick={unirseToqueymedio} style={{
          marginBottom: 28,
          background: yaEnTqm
            ? 'linear-gradient(135deg, rgba(42,157,143,0.15) 0%, rgba(42,157,143,0.08) 100%)'
            : 'linear-gradient(135deg, rgba(230,57,70,0.15) 0%, rgba(244,162,97,0.08) 100%)',
          border: '1.5px solid ' + (yaEnTqm ? 'rgba(42,157,143,0.4)' : 'rgba(230,57,70,0.4)'),
          borderRadius: 18,
          padding: '20px 24px',
          cursor: joiningTqm ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          transition: 'transform 0.15s',
          position: 'relative',
          overflow: 'hidden',
        }}
          onMouseEnter={e => { if (!joiningTqm) e.currentTarget.style.transform = 'scale(1.01)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        >
          {/* Fondo decorativo */}
          <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 80, opacity: 0.06, pointerEvents: 'none' }}>🌍</div>

          <div style={{ width: 52, height: 52, borderRadius: 14, background: yaEnTqm ? 'rgba(42,157,143,0.2)' : 'rgba(230,57,70,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            📺
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 17 }}>Liga Toqueymedio</span>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: '2px 8px', borderRadius: 20, background: yaEnTqm ? 'rgba(42,157,143,0.3)' : 'rgba(230,57,70,0.3)', color: yaEnTqm ? '#2a9d8f' : '#e53935', textTransform: 'uppercase' }}>
                {yaEnTqm ? 'Ya estas dentro' : 'Liga publica'}
              </span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              {yaEnTqm ? 'Pulsa para ver tu liga y tus predicciones' : 'Compite con toda la comunidad de Toqueymedio · Unete gratis'}
            </div>
            {tqmMsg && <div style={{ color: '#f4a261', fontSize: 12, marginTop: 6 }}>{tqmMsg}</div>}
          </div>
          <div style={{ flexShrink: 0 }}>
            {joiningTqm ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>...</div>
            ) : (
              <div style={{ background: yaEnTqm ? '#2a9d8f' : '#e53935', color: '#fff', borderRadius: 10, padding: '8px 16px', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
                {yaEnTqm ? 'Ver liga →' : 'Unirse →'}
              </div>
            )}
          </div>
        </div>

        {/* Botones crear / unirse */}
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
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginBottom: 8 }}>Aun no estas en ningun grupo</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Crea uno o unete con un codigo.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {groups.map(p => (
              <div key={p.id} onClick={() => nav(`/grupo/${p.groups.code}`)}
                style={{ background: p.groups.code === TOQUEYMEDIO_CODE ? 'rgba(230,57,70,0.06)' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (p.groups.code === TOQUEYMEDIO_CODE ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.08)'), borderRadius: 14, padding: '20px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>
                    {p.groups.code === TOQUEYMEDIO_CODE && <span style={{ fontSize: 14, marginRight: 8 }}>📺</span>}
                    {p.groups.name}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Codigo: {p.groups.code}</div>
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
