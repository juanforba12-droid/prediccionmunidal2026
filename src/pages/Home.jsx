import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { getRankInfo } from '../lib/ranks.js'
import { getUserPoints } from '../lib/userPoints.js'

// Genera un nombre de invitado aleatorio y lo guarda en localStorage
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

// Mini badge de rango inline
function RankBadge({ rankInfo, small }) {
  const { rank, level } = rankInfo
  const levelStr = rank.levels > 1 ? ` ${['I','II','III'][level-1]}` : ''
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap: small ? 3 : 5,
      background:`${rank.color}18`, border:`1px solid ${rank.color}55`,
      borderRadius: small ? 8 : 12,
      padding: small ? '2px 8px' : '4px 12px',
      fontSize: small ? 11 : 13,
      color: rank.color, fontWeight:700
    }}>
      {rank.emoji} {rank.name}{levelStr}
    </span>
  )
}

// Barra de progreso del rango
function RankProgress({ rankInfo }) {
  const { rank, level, progress, pointsToNext, totalPoints } = rankInfo
  const levelStr = rank.levels > 1 ? ` ${['I','II','III'][level-1]}` : ''
  return (
    <div style={{ width:'100%' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
        <span style={{ color: rank.color, fontWeight:700, fontSize:13 }}>
          {rank.emoji} {rank.name}{levelStr}
        </span>
        <span style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>
          {totalPoints.toLocaleString()} pts
        </span>
      </div>
      <div style={{ background:'rgba(255,255,255,0.07)', borderRadius:99, height:8, overflow:'hidden' }}>
        <div style={{
          width:`${progress}%`, height:'100%',
          background:`linear-gradient(90deg, ${rank.color}88, ${rank.color})`,
          borderRadius:99, transition:'width 0.6s ease'
        }}/>
      </div>
      {pointsToNext && (
        <div style={{ textAlign:'right', marginTop:4, fontSize:11, color:'rgba(255,255,255,0.3)' }}>
          {pointsToNext.toLocaleString()} pts para el siguiente nivel
        </div>
      )}
      {!pointsToNext && rank.name === 'Icono Top' && (
        <div style={{ textAlign:'center', marginTop:4, fontSize:11, color: rank.color }}>
          👑 Rango máximo alcanzado
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const nav = useNavigate()
  const [user, setUser] = useState(undefined)    // undefined = cargando, null = invitado, obj = registrado
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
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#0d1117 50%,#0a0a1a 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif', padding:'20px', position:'relative' }}>

      {/* Botón esquina superior derecha */}
      {!isLoading && (
        isGuest ? (
          // Sin sesión: botón de entrar
          <button onClick={() => nav('/auth')} style={{ position:'absolute', top:20, right:20, background:'linear-gradient(135deg,#e63946,#c1121f)', border:'none', borderRadius:12, padding:'8px 18px', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', gap:6, boxShadow:'0 2px 12px rgba(230,57,70,0.4)' }}>
            <span>🔑</span> Iniciar sesión
          </button>
        ) : (
          // Con sesión: nombre + rango
          <button onClick={() => setShowAccount(true)} style={{ position:'absolute', top:20, right:20, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'8px 16px', color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8 }}>
            <span>{rankInfo.rank.emoji}</span>
            <span>{displayName}</span>
            <RankBadge rankInfo={rankInfo} small />
          </button>
        )
      )}

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:48 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:72, letterSpacing:12, background:'linear-gradient(135deg,#e63946,#ff6b6b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1, marginBottom:8 }}>JFEE</div>
        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:14, letterSpacing:4, textTransform:'uppercase' }}>Juegos de Futbol En Espanol</div>
        {isGuest && (
          <div style={{ marginTop:10, fontSize:12, color:'rgba(255,255,255,0.25)' }}>
            Jugando como invitado · <span style={{ color:'#e63946', cursor:'pointer', textDecoration:'underline' }} onClick={() => nav('/auth')}>Regístrate para guardar tu progreso</span>
          </div>
        )}
      </div>

      {/* Tarjetas de juegos */}
      <div style={{ display:'flex', flexDirection:'column', gap:16, width:'100%', maxWidth:420 }}>

        <button onClick={() => isGuest ? nav('/auth') : nav('/prediccion')} style={{ background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,0.3)', borderRadius:20, padding:'28px 24px', cursor:'pointer', textAlign:'left', outline:'none', boxShadow:'0 4px 24px rgba(230,57,70,0.1)', position:'relative' }}>
          {isGuest && <span style={{ position:'absolute', top:12, right:12, fontSize:11, background:'rgba(230,57,70,0.2)', color:'#e63946', borderRadius:8, padding:'2px 8px', fontWeight:700 }}>🔒 Requiere cuenta</span>}
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:10 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'rgba(230,57,70,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>⚽</div>
            <div>
              <div style={{ color:'#e63946', fontWeight:800, fontSize:22, letterSpacing:1 }}>PREDICCION</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>Mundial 2026</div>
            </div>
          </div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.5 }}>Predice los partidos del Mundial, acumula puntos y compite con tus amigos en tiempo real.</div>
          <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
            {['72 partidos','Grupos privados','Ranking en vivo'].map(t => <span key={t} style={{ fontSize:11, color:'#e63946', background:'rgba(230,57,70,0.1)', padding:'3px 10px', borderRadius:20 }}>{t}</span>)}
          </div>
        </button>

        <button onClick={() => nav('/mentiroso')} style={{ background:'rgba(155,93,229,0.08)', border:'1px solid rgba(155,93,229,0.3)', borderRadius:20, padding:'28px 24px', cursor:'pointer', textAlign:'left', outline:'none', boxShadow:'0 4px 24px rgba(155,93,229,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:10 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'rgba(155,93,229,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🎭</div>
            <div>
              <div style={{ color:'#9b5de5', fontWeight:800, fontSize:22, letterSpacing:1 }}>MENTIROSO</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>El impostor del futbol</div>
            </div>
          </div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.5 }}>A cada jugador le sale un nombre, equipo o seleccion. Uno es el impostor. Descubrele.</div>
          <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
            {['Multijugador','Chat en vivo','Votaciones'].map(t => <span key={t} style={{ fontSize:11, color:'#9b5de5', background:'rgba(155,93,229,0.1)', padding:'3px 10px', borderRadius:20 }}>{t}</span>)}
          </div>
        </button>

        <button onClick={() => nav('/topdiezgame')} style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:20, padding:'28px 24px', cursor:'pointer', textAlign:'left', outline:'none', boxShadow:'0 4px 24px rgba(251,191,36,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:10 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'rgba(251,191,36,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🏆</div>
            <div>
              <div style={{ color:'#fbbf24', fontWeight:800, fontSize:22, letterSpacing:1 }}>TOP 10</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>Adivina el top fútbol</div>
            </div>
          </div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.5 }}>Adivina los máximos goleadores y tops históricos. Solo o con amigos por turnos.</div>
          <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
            {['Individual','Online turnos','27 temporadas'].map(t => <span key={t} style={{ fontSize:11, color:'#fbbf24', background:'rgba(251,191,36,0.1)', padding:'3px 10px', borderRadius:20 }}>{t}</span>)}
          </div>
        </button>

        <button onClick={() => nav('/adivina')} style={{ background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.3)', borderRadius:20, padding:'28px 24px', cursor:'pointer', textAlign:'left', outline:'none', boxShadow:'0 4px 24px rgba(99,179,237,0.1)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:10 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:'rgba(99,179,237,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26 }}>🔍</div>
            <div>
              <div style={{ color:'#63b3ed', fontWeight:800, fontSize:22, letterSpacing:1 }}>ADIVINA</div>
              <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>El jugador misterioso</div>
            </div>
          </div>
          <div style={{ color:'rgba(255,255,255,0.5)', fontSize:13, lineHeight:1.5 }}>7 pistas, 7 puntos. Cuanto antes adivines, más puntos. Solo o con amigos en tiempo real.</div>
          <div style={{ marginTop:14, display:'flex', gap:8, flexWrap:'wrap' }}>
            {['Individual','Online','30 jugadores'].map(t => <span key={t} style={{ fontSize:11, color:'#63b3ed', background:'rgba(99,179,237,0.1)', padding:'3px 10px', borderRadius:20 }}>{t}</span>)}
          </div>
        </button>

      </div>

      <div style={{ marginTop:40, color:'rgba(255,255,255,0.15)', fontSize:12, letterSpacing:2 }}>JFEE © 2026</div>

      {/* Modal de cuenta */}
      {showAccount && user && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:20 }} onClick={() => setShowAccount(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:20, padding:28, width:'100%', maxWidth:380 }}>
            
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <div style={{ fontWeight:800, fontSize:18 }}>Mi cuenta</div>
              <button onClick={() => setShowAccount(false)} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:20 }}>✕</button>
            </div>

            {/* Info usuario */}
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.3)', marginBottom:4 }}>NOMBRE</div>
              <div style={{ fontWeight:700, fontSize:16 }}>{displayName}</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{user?.email}</div>
            </div>

            {/* Rango y progreso */}
            <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'14px 16px', marginBottom:16 }}>
              <RankProgress rankInfo={rankInfo} />
            </div>

            {/* Cambiar contraseña */}
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
