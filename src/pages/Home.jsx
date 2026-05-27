import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Home() {
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [showAccount, setShowAccount] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwMsg, setPwMsg] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    nav('/auth')
  }

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { setPwMsg('Minimo 6 caracteres'); return }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setPwMsg('Error al cambiar contraseña')
    else { setPwMsg('Contraseña cambiada'); setNewPassword('') }
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #0d1117 50%, #0a0a1a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif', padding: '20px', position: 'relative'
    }}>

      {/* Account button top right */}
      <button onClick={() => setShowAccount(true)} style={{
        position: 'absolute', top: 20, right: 20,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, padding: '8px 16px', color: 'rgba(255,255,255,0.7)',
        cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8
      }}>
        <span>👤</span> {displayName}
      </button>

      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 60 }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 72, letterSpacing: 12,
          background: 'linear-gradient(135deg, #e63946, #ff6b6b)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1, marginBottom: 8
        }}>JFEE</div>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, letterSpacing: 4, textTransform: 'uppercase' }}>
          Juegos de Futbol En Espanol
        </div>
      </div>

      {/* Game cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 420 }}>

        <button onClick={() => nav('/prediccion')} style={{
          background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.3)',
          borderRadius: 20, padding: '28px 24px', cursor: 'pointer', textAlign: 'left',
          outline: 'none', boxShadow: '0 4px 24px rgba(230,57,70,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(230,57,70,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚽</div>
            <div>
              <div style={{ color: '#e63946', fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>PREDICCION</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Mundial 2026</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>
            Predice los partidos del Mundial, acumula puntos y compite con tus amigos en tiempo real.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['72 partidos', 'Grupos privados', 'Ranking en vivo'].map(t => (
              <span key={t} style={{ fontSize: 11, color: '#e63946', background: 'rgba(230,57,70,0.1)', padding: '3px 10px', borderRadius: 20 }}>{t}</span>
            ))}
          </div>
        </button>

        <button onClick={() => nav('/mentiroso')} style={{
          background: 'rgba(155,93,229,0.08)', border: '1px solid rgba(155,93,229,0.3)',
          borderRadius: 20, padding: '28px 24px', cursor: 'pointer', textAlign: 'left',
          outline: 'none', boxShadow: '0 4px 24px rgba(155,93,229,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(155,93,229,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🎭</div>
            <div>
              <div style={{ color: '#9b5de5', fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>MENTIROSO</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>El impostor del futbol</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>
            A cada jugador le sale un nombre, equipo o seleccion. Uno es el impostor. Descubrele.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Multijugador', 'Chat en vivo', 'Votaciones'].map(t => (
              <span key={t} style={{ fontSize: 11, color: '#9b5de5', background: 'rgba(155,93,229,0.1)', padding: '3px 10px', borderRadius: 20 }}>{t}</span>
            ))}
          </div>
        </button>

        <button onClick={() => nav('/topdiezgame')} style={{
          background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 20, padding: '28px 24px', cursor: 'pointer', textAlign: 'left',
          outline: 'none', boxShadow: '0 4px 24px rgba(251,191,36,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(251,191,36,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>🏆</div>
            <div>
              <div style={{ color: '#fbbf24', fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>TOP 10</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Adivina el top fútbol</div>
            </div>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, lineHeight: 1.5 }}>
            Adivina los máximos goleadores y tops históricos. Solo o con amigos por turnos.
          </div>
          <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Individual', 'Online turnos', '27 temporadas'].map(t => (
              <span key={t} style={{ fontSize: 11, color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '3px 10px', borderRadius: 20 }}>{t}</span>
            ))}
          </div>
        </button>

      </div>

      <div style={{ marginTop: 40, color: 'rgba(255,255,255,0.15)', fontSize: 12, letterSpacing: 2 }}>JFEE © 2026</div>

      {/* Account modal */}
      {showAccount && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20
        }} onClick={() => setShowAccount(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: 28, width: '100%', maxWidth: 380
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>Mi cuenta</div>
              <button onClick={() => setShowAccount(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>NOMBRE</div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{displayName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{user?.email}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Cambiar contraseña</div>
              <input
                type="password" placeholder="Nueva contraseña" value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e8eaf0', fontSize: 14, boxSizing: 'border-box', outline: 'none', marginBottom: 8 }}
              />
              {pwMsg && <div style={{ fontSize: 12, color: pwMsg.includes('Error') ? '#fca5a5' : '#2a9d8f', marginBottom: 8 }}>{pwMsg}</div>}
              <button onClick={handleChangePassword} style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.08)', color: '#e8eaf0', fontSize: 14, cursor: 'pointer', fontWeight: 600 }}>
                Cambiar contraseña
              </button>
            </div>

            <button onClick={handleSignOut} style={{ width: '100%', padding: '12px', borderRadius: 12, border: '1px solid rgba(230,57,70,0.3)', background: 'rgba(230,57,70,0.08)', color: '#e63946', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Cerrar sesion
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
