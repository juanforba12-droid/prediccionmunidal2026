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

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidSession(true)
      }
    })
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
      minHeight: '100vh', background: '#0d1117', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        background: '#1a1f2e', borderRadius: '16px', padding: '40px',
        width: '100%', maxWidth: '400px', border: '1px solid #2a2f3e'
      }}>
        <h2 style={{ color: '#e84545', textAlign: 'center', marginBottom: '24px' }}>
          Nueva contraseña
        </h2>

        {success ? (
          <p style={{ color: '#4caf50', textAlign: 'center' }}>
            ✅ Contraseña cambiada. Redirigiendo...
          </p>
        ) : !validSession ? (
          <p style={{ color: '#aaa', textAlign: 'center' }}>
            Enlace no válido o caducado. Solicita uno nuevo desde la pantalla de login.
          </p>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', padding: '12px', borderRadius: '8px',
                background: '#0d1117', border: '1px solid #2a2f3e',
                color: '#fff', fontSize: '16px', marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />
            {error && <p style={{ color: '#e84545', marginBottom: '12px' }}>{error}</p>}
            <button
              onClick={handleReset}
              disabled={loading}
              style={{
                width: '100%', padding: '14px', background: '#e84545',
                color: '#fff', border: 'none', borderRadius: '8px',
                fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'
              }}
            >
              {loading ? 'Cambiando...' : 'CAMBIAR CONTRASEÑA'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
