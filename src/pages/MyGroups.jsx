import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const TOQUEYMEDIO_CODE = 'AL3R6U'

const TQM_LOGO = 'data:image/png;base64,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'

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
      // Verificar que el grupo existe
      const { data: grp } = await supabase.from('groups').select('*').eq('code', TOQUEYMEDIO_CODE).single()
      if (!grp) {
        setTqmMsg('La liga aun no esta disponible, vuelve pronto!')
        setJoiningTqm(false)
        return
      }
      // Verificar si ya está como player por nombre
      const { data: existingPlayers } = await supabase
        .from('players')
        .select('*')
        .eq('group_code', TOQUEYMEDIO_CODE)
      const existing = existingPlayers && existingPlayers.find(p => p.name === displayName)
      if (existing) {
        // Guardar en localStorage para que Game.jsx lo reconozca
        localStorage.setItem('player_' + TOQUEYMEDIO_CODE, JSON.stringify(existing))
        nav(`/grupo/${TOQUEYMEDIO_CODE}`)
        setJoiningTqm(false)
        return
      }
      // Crear el player
      const AVATARS = ['⚽','🦁','🐯','🦅','🐉','🦊','🐺','🦈','🐻','🦋','🌟','🔥','💎','🚀','🎯','👑']
      const COLORS = ['#e63946','#f4a261','#2a9d8f','#457b9d','#9b5de5','#e9c46a','#06d6a0','#ef476f','#118ab2','#ffd166']
      const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const newPlayer = {
        id: crypto.randomUUID(),
        group_code: TOQUEYMEDIO_CODE,
        name: displayName,
        avatar,
        color,
      }
      const { error } = await supabase.from('players').insert(newPlayer)
      if (error) {
        console.error('Insert error:', error)
        setTqmMsg('Error al unirte. Intentalo de nuevo.')
        setJoiningTqm(false)
        return
      }
      // Guardar en localStorage para que Game.jsx lo reconozca
      localStorage.setItem('player_' + TOQUEYMEDIO_CODE, JSON.stringify(newPlayer))
      nav(`/grupo/${TOQUEYMEDIO_CODE}`)
    } catch(e) {
      console.error(e)
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

          <div style={{ width: 52, height: 52, borderRadius: 14, overflow: 'hidden', flexShrink: 0 }}>
            <img src={TQM_LOGO} alt="Toqueymedio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
