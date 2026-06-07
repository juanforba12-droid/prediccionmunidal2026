import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getRankInfo } from '../lib/ranks.js'
import { getUserPoints } from '../lib/userPoints.js'

function getOrCreateGuest() {
  const saved = localStorage.getItem('jfee_guest')
  if (saved) return saved
  const adjectives = ['Rápido','Feroz','Loco','Mágico','Veloz','Fiero','Bravo','Crack','Astuto','Zurdo']
  const nouns = ['Delantero','Portero','Centrocampista','Defensa','Capitán','Goleador','Ariete','Líbero']
  const name = adjectives[Math.floor(Math.random()*adjectives.length)] + adjectives[Math.floor(Math.random()*adjectives.length)]
  const num = Math.floor(Math.random()*99)+1
  const guest = `${name}${num}`
  localStorage.setItem('jfee_guest', guest)
  return guest
}

function RankBadge({ rankInfo, small }) {
  const { rank, level } = rankInfo
  const levelStr = rank.levels > 1 ? ` ${['I','II','III'][level-1]}` : ''
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap: small ? 3 : 5, background:`${rank.color}18`, border:`1px solid ${rank.color}55`, borderRadius: small ? 8 : 12, padding: small ? '2px 8px' : '4px 12px', fontSize: small ? 11 : 13, color: rank.color, fontWeight:700 }}>
      {rank.emoji} {rank.name}{levelStr}
    </span>
  )
}

function RankProgress({ rankInfo }) {
  const { rank, level, progress, pointsToNext, totalPoints } = rankInfo
  const levelStr = rank.levels > 1 ? ` ${['I','II','III'][level-1]}` : ''
  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
        <span style={{ color: rank.color, fontWeight:700, fontSize:13 }}>{rank.emoji} {rank.name}{levelStr}</span>
        <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>{totalPoints.toLocaleString()} pts</span>
      </div>
      <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:99, height:8, overflow:'hidden' }}>
        <div style={{ width:`${progress}%`, height:'100%', background:`linear-gradient(90deg, ${rank.color}88, ${rank.color})`, borderRadius:99, transition:'width 0.6s ease' }}/>
      </div>
      {pointsToNext ? (
        <div style={{ textAlign:'right', marginTop:4, fontSize:11, color:'rgba(255,255,255,0.3)' }}>{pointsToNext.toLocaleString()} pts para el siguiente nivel</div>
      ) : (
        <div style={{ textAlign:'center', marginTop:4, fontSize:11, color: rank.color }}>👑 Rango máximo alcanzado</div>
      )}
    </div>
  )
}

function GameCard({ onClick, color, icon, title, subtitle, desc, tags, locked }) {
  return (
    <button onClick={onClick} style={{
      background:`rgba(${color},0.08)`, border:`1px solid rgba(${color},0.3)`,
      borderRadius:20, padding:'20px 16px', cursor:'pointer', textAlign:'left',
      outline:'none', position:'relative', width:'100%', height:'100%',
      display:'flex', flexDirection:'column', gap:10,
      transition:'transform 0.15s, border-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='scale(1.02)'; e.currentTarget.style.borderColor=`rgba(${color},0.6)` }}
      onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor=`rgba(${color},0.3)` }}
    >
      {locked && <span style={{ position:'absolute', top:10, right:10, fontSize:10, background:`rgba(${color},0.2)`, color:`rgb(${color})`, borderRadius:8, padding:'2px 7px', fontWeight:700 }}>🔒</span>}
      <div style={{ width:44, height:44, borderRadius:12, background:`rgba(${color},0.2)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ color:`rgb(${color})`, fontWeight:800, fontSize:16, letterSpacing:1, lineHeight:1.2 }}>{title}</div>
        <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginTop:2 }}>{subtitle}</div>
      </div>
      <div style={{ color:'rgba(255,255,255,0.45)', fontSize:12, lineHeight:1.5, flex:1 }}>{desc}</div>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {tags.map(t => <span key={t} style={{ fontSize:10, color:`rgb(${color})`, background:`rgba(${color},0.1)`, padding:'2px 8px', borderRadius:20 }}>{t}</span>)}
      </div>
    </button>
  )
}

export default function Home() {
  const nav = useNavigate()
  const [user, setUser] = useState(undefined)
  const [showAccount, setShowAccount] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')
  const [totalPoints, setTotalPoints] = useState(0)
  const [guestName] = useState(getOrCreateGuest)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user?.id) getUserPoints(user.id).then(setTotalPoints)
    else setTotalPoints(0)
  }, [user])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setShowAccount(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setPwMsg('Minimo 6 caracteres'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPwMsg('Error al cambiar contraseña')
    else { setPwMsg('Contraseña cambiada'); setNewPassword('') }
  }

  const isLoading = user === undefined
  const isGuest = !isLoading && !user
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || guestName
  const rankInfo = getRankInfo(totalPoints)

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#0d1117 50%,#0a0a1a 100%)', display:'flex', flexDirection:'column', alignItems:'center', fontFamily:'system-ui,sans-serif', padding:'20px', position:'relative' }}>

      {!isLoading && (
        isGuest ? (
          <button onClick={() => nav('/auth')} style={{ position:'absolute', top:20, right:20, background:'linear-gradient(135deg,#e63946,#c1121f)', border:'none', borderRadius:12, padding:'8px 18px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6, boxShadow:'0 2px 12px rgba(230,57,70,0.4)' }}>
            <span>🔑</span> Iniciar sesión
          </button>
        ) : (
          <button onClick={() => setShowAccount(true)} style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'8px 16px', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
            <span>{rankInfo.rank.emoji}</span>
            <span>{displayName}</span>
            <RankBadge rankInfo={rankInfo} small />
          </button>
        )
      )}

      <div style={{ textAlign:'center', marginTop:60, marginBottom:32 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:72, letterSpacing:12, background:'linear-gradient(135deg,#e63946,#ff6b6b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1, marginBottom:8 }}>JFEE</div>
        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:14, letterSpacing:4, textTransform:'uppercase' }}>Juegos de Futbol En Espanol</div>
        {isGuest && (
          <div style={{ marginTop:10, fontSize:12, color:'rgba(255,255,255,0.25)' }}>
            Jugando como invitado · <span style={{ color:'#e63946', cursor:'pointer', textDecoration:'underline' }} onClick={() => nav('/auth')}>Regístrate para guardar tu progreso</span>
          </div>
        )}
      </div>

      {/* Grid 2x2 */}
      <div style={{ width:'100%', maxWidth:540, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
        <GameCard
          onClick={() => isGuest ? nav('/auth') : nav('/prediccion')}
          color="230,57,70"
          icon="⚽" title="PREDICCION" subtitle="Mundial 2026"
          desc="Predice los partidos del Mundial y compite con tus amigos."
          tags={['72 partidos','Grupos','Ranking']}
          locked={isGuest}
        />
        <GameCard
          onClick={() => nav('/mentiroso')}
          color="155,93,229"
          icon="🎭" title="MENTIROSO" subtitle="El impostor del fútbol"
          desc="Uno es el impostor. Descúbrele antes de que te descubran."
          tags={['Multijugador','Votaciones']}
        />
        <GameCard
          onClick={() => nav('/topdiezgame')}
          color="251,191,36"
          icon="🏆" title="TOP 10" subtitle="Adivina el top fútbol"
          desc="Máximos goleadores y tops históricos. Solo o por turnos."
          tags={['Individual','Online','27 temp.']}
        />
        <GameCard
          onClick={() => nav('/adivina')}
          color="99,179,237"
          icon="🔍" title="ADIVINA" subtitle="El jugador misterioso"
          desc="7 pistas, 7 puntos. Cuanto antes adivines, más puntos."
          tags={['Individual','Online','300+']}
        />
      </div>

      {/* EL MARCADOR */}
      <div style={{ width:'100%', maxWidth:540, marginTop:12 }}>
        <button onClick={() => nav('/marcador')} style={{
          width:'100%',
          background:'linear-gradient(135deg,rgba(0,230,118,0.06) 0%,rgba(255,214,0,0.06) 100%)',
          border:'1px solid rgba(0,230,118,0.25)',
          borderRadius:20, padding:'18px 20px', cursor:'pointer', textAlign:'left', outline:'none',
          display:'flex', alignItems:'center', gap:16,
          transition:'transform 0.15s, border-color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.01)'; e.currentTarget.style.borderColor='rgba(0,230,118,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor='rgba(0,230,118,0.25)' }}
        >
          <div style={{ width:44, height:44, borderRadius:12, background:'rgba(0,230,118,0.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, flexShrink:0 }}>🎰</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#00e676', fontWeight:800, fontSize:16, letterSpacing:1 }}>EL MARCADOR</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>Apuesta tus puntos · Multiplica tus ganancias</div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end' }}>
            {['Cuotas reales','1X2','Mundial'].map(t => <span key={t} style={{ fontSize:10, color:'#00e676', background:'rgba(0,230,118,0.1)', padding:'2px 8px', borderRadius:20 }}>{t}</span>)}
          </div>
        </button>
      </div>

      {/* CLASIFICACION */}
      <div style={{ width:'100%', maxWidth:540, marginTop:12 }}>
        <button onClick={() => nav('/ranking')} style={{
          width:'100%', background:'rgba(192,132,252,0.08)', border:'1px solid rgba(192,132,252,0.3)',
          borderRadius:20, padding:'16px 20px', cursor:'pointer', textAlign:'left', outline:'none',
          display:'flex', alignItems:'center', gap:16,
          transition:'transform 0.15s, border-color 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.01)'; e.currentTarget.style.borderColor='rgba(192,132,252,0.6)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='scale(1)'; e.currentTarget.style.borderColor='rgba(192,132,252,0.3)' }}
        >
          <div style={{ width:44, height:44, borderRadius:12, background:'rgba(192,132,252,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>🥇</div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#c084fc', fontWeight:800, fontSize:16, letterSpacing:1 }}>CLASIFICACION</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>Top global y amigos</div>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['Top 100','Amigos','Tu posición'].map(t => <span key={t} style={{ fontSize:10, color:'#c084fc', background:'rgba(192,132,252,0.1)', padding:'2px 8px', borderRadius:20 }}>{t}</span>)}
          </div>
        </button>
      </div>

      {/* CONTACTO */}
      <div style={{ width:'100%', maxWidth:540, marginTop:20 }}>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'18px 20px', textAlign:'center' }}>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:6 }}>
            ¿Tienes algún problema, sugerencia o quieres proponer un cambio?
          </div>
          <a href="mailto:juanforba12@gmail.com" style={{ color:'#e63946', fontWeight:700, fontSize:14, textDecoration:'none', letterSpacing:0.5 }}>
            ✉️ juanforba12@gmail.com
          </a>
        </div>
      </div>

      <div style={{ marginTop:24, marginBottom:20, color:'rgba(255,255,255,0.15)', fontSize:12, letterSpacing:2 }}>JFEE © 2026</div>

      {/* Modal cuenta */}
      {showAccount && user && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }} onClick={() => setShowAccount(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:28, width:'100%', maxWidth:380 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:18 }}>Mi cuenta</div>
              <button onClick={() => setShowAccount(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:20 }}>✕</button>
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:4 }}>NOMBRE</div>
              <div style={{ fontWeight:700, fontSize:16 }}>{displayName}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{user?.email}</div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
              <RankProgress rankInfo={rankInfo} />
            </div>
            <div style={{ marginBottom:8 }}>
              <button onClick={() => { setShowAccount(false); nav('/ranking') }} style={{ width:'100%', padding:'10px', borderRadius:10, border:'1px solid rgba(192,132,252,0.3)', background:'rgba(192,132,252,0.08)', color:'#c084fc', fontSize:14, cursor:'pointer', fontWeight:600, marginBottom:8 }}>
                🏆 Ver clasificación global
              </button>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:8 }}>Cambiar contraseña</div>
              <input type="password" placeholder="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e8eaf0', fontSize:14, boxSizing:'border-box', outline:'none', marginBottom:8 }} />
              {pwMsg && <div style={{ fontSize:12, color: pwMsg.includes('Error')?'#fca5a5':'#2a9d8f', marginBottom:8 }}>{pwMsg}</div>}
              <button onClick={handleChangePassword} style={{ width:'100%', padding:'10px', borderRadius:10, border:'none', background:'rgba(255,255,255,0.08)', color:'#e8eaf0', fontSize:14, cursor:'pointer', fontWeight:600 }}>Cambiar contraseña</button>
            </div>
            <button onClick={handleSignOut} style={{ width:'100%', padding:'12px', borderRadius:12, border:'1px solid rgba(230,57,70,0.3)', background:'rgba(230,57,70,0.08)', color:'#e63946', fontSize:15, fontWeight:700, cursor:'pointer' }}>Cerrar sesion</button>
          </div>
        </div>
      )}
    </div>
  )
}
