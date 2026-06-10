import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validSession, setValidSession] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Leer el token del hash de la URL (#access_token=...&type=recovery)
    const hash = window.location.hash.substring(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type')

    if (type === 'recovery' && accessToken) {
      // Establecer la sesión con el token del email
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      }).then(({ error }) => {
        if (error) {
          setValidSession(false)
        } else {
          setValidSession(true)
        }
        setChecking(false)
      })
    } else {
      // Fallback: escuchar el evento de Supabase
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setValidSession(true)
          setChecking(false)
        }
      })
      setTimeout(() => setChecking(false), 2000)
      return () => subscription.unsubscribe()
    }
  }, [])

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    setError('')
    const { error: e } = await supabase.auth.updateUser({ password })
    if (e) {
      setError('Error al cambiar la contraseña. Solicita un nuevo enlace.')
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/'), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg,#0a0a1a 0%,#0d1117 50%,#0a0a1a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui,sans-serif', padding: 20
    }}>
      <div style={{
        background: '#0f0f1a', borderRadius: 24, padding: 36,
        width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 48, letterSpacing: 10, background: 'linear-gradient(135deg,#e63946,#ff6b6b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 6 }}>JFEE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#e8eaf0', marginTop: 16 }}>Nueva contraseña</div>
        </div>

        {checking ? (
          <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Verificando enlace...</p>
        ) : success ? (
          <p style={{ color: '#2a9d8f', textAlign: 'center', fontSize: 15 }}>
            ✅ Contraseña cambiada correctamente. Redirigiendo...
          </p>
        ) : !validSession ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 20 }}>
              El enlace ha caducado. Solicita uno nuevo.
            </p>
            <button
              onClick={() => navigate('/auth')}
              style={{ padding: '12px 24px', background: 'linear-gradient(135deg,#e63946,#c1121f)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              Ir al login
            </button>
          </div>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#e8eaf0', fontSize: 15, outline: 'none',
                boxSizing: 'border-box', marginBottom: 12
              }}
            />
            {error && <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</p>}
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: '100%', padding: 14,
                background: loading ? 'rgba(230,57,70,0.3)' : 'linear-gradient(135deg,#e63946,#c1121f)',
                color: '#fff', border: 'none', borderRadius: 14,
                fontSize: 16, fontWeight: 800, cursor: loading ? 'default' : 'pointer', letterSpacing: 1
              }}
            >
              {loading ? '...' : 'CAMBIAR CONTRASEÑA'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
