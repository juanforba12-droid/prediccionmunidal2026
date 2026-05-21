import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login')
  const nav = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) nav('/', { replace: true })
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) nav('/', { replace: true })
    })
    return () => subscription.unsubscribe()
  }, [nav])

  const handleSubmit = async () => {
    if (!email || !password) { setError('Rellena todos los campos'); return }
    setLoading(true); setError('')
    try {
      if (mode === 'register') {
        const { data, error: err } = await supabase.auth.signUp({ email, password })
        if (err) throw err
        if (data.session) { nav('/', { replace: true }); return }
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password })
        if (!loginErr) nav('/', { replace: true })
        else { setError('Cuenta creada. Inicia sesión.'); setMode('login') }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        nav('/', { replace: true })
      }
    } catch (err) {
      const msg = err.message
      if (msg.includes('Invalid login')) setError('Email o contraseña incorrectos')
      else if (msg.includes('already registered')) setError('Email ya registrado. Inicia sesión.')
      else setError(msg)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: 20, padding: 40, width: '100%', maxWidth: 400, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>⚽</div>
          <h1 style={{ color: '#fff', margin: '8px 0 4px', fontSize: 24, fontWeight: 700 }}>Predicción Mundial</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>2026</p>
        </div>
        {error && <div style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#fca5a5', fontSize: 14 }}>{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 15, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={{ width: '100%', padding: '12px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 15, marginBottom: 20, boxSizing: 'border-box', outline: 'none' }} />
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 13, borderRadius: 10, border: 'none', background: loading ? 'rgba(229,57,53,0.5)' : '#e53935', color: '#fff', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20 }}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14 }}>
            {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  )
}
