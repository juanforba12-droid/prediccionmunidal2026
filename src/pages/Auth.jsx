import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Auth() {
  const nav = useNavigate()
  const [mode, setMode] = useState('login') // login | register | forgot
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Rellena todos los campos'); return }
    setLoading(true); setError('')
    const { error: e } = await supabase.auth.signInWithPassword({ email, password })
    if (e) setError(e.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : e.message)
    else nav('/')
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password || !name) { setError('Rellena todos los campos'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')
    const { data, error: e } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: name } }
    })
    if (e) { setError(e.message); setLoading(false); return }
    if (data?.user?.id) {
      await supabase.from('profiles').upsert({ id: data.user.id, name })
      setSuccess('¡Cuenta creada! Revisa tu email para confirmarla y luego inicia sesión.')
    } else {
      setSuccess('¡Registro completado! Revisa tu email para confirmar la cuenta.')
    }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) { setError('Introduce tu email'); return }
    setLoading(true); setError('')
    const { error: e } = await supabase.auth.resetPasswordForEmail(email)
    if (e) setError(e.message)
    else setSuccess('Te hemos enviado un email para restablecer tu contraseña.')
    setLoading(false)
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700;900&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #080c14; }
    input { font-family: 'Outfit', sans-serif; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
    .fade { animation: fadeUp .35s ease both; }
  `

  return (
    <div style={{ minHeight:'100vh', background:'#080c14', fontFamily:"'Outfit',sans-serif", color:'#e8eaf0', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 16px', position:'relative' }}>
      <style>{css}</style>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 20% 20%, rgba(230,57,70,0.1) 0%, transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(42,157,143,0.08) 0%, transparent 55%)',
        backgroundImage:'radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)', backgroundSize:'28px 28px' }} />

      <div style={{ position:'relative', zIndex:1, width:'100%', maxWidth:400 }}>

        {/* Logo */}
        <div className="fade" style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:48, lineHeight:1,
            background:'linear-gradient(135deg,#e63946,#f4a261)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            QUINIELA
          </div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:'#2a4060', letterSpacing:8 }}>
            MUNDIAL 2026
          </div>
        </div>

        {/* Card */}
        <div className="fade" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28, animationDelay:'.08s' }}>

          {/* Tabs */}
          {mode !== 'forgot' && (
            <div style={{ display:'flex', gap:4, marginBottom:24, background:'rgba(255,255,255,0.05)', borderRadius:10, padding:4 }}>
              {[['login','Iniciar sesión'],['register','Registrarse']].map(([m,l]) => (
                <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                  flex:1, padding:'9px', borderRadius:8, border:'none', cursor:'pointer',
                  fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13,
                  background: mode===m ? 'rgba(230,57,70,0.9)' : 'transparent',
                  color: mode===m ? '#fff' : '#3a5070', transition:'all .2s'
                }}>{l}</button>
              ))}
            </div>
          )}

          {mode === 'forgot' && (
            <div style={{ marginBottom:20 }}>
              <button onClick={() => { setMode('login'); setError(''); setSuccess('') }}
                style={{ background:'none', border:'none', color:'#3a5070', cursor:'pointer', fontSize:13, fontFamily:"'Outfit',sans-serif" }}>
                ← Volver al login
              </button>
              <div style={{ fontWeight:700, fontSize:18, marginTop:8 }}>Recuperar contraseña</div>
            </div>
          )}

          {/* Name field (register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:12, color:'#3a5070', marginBottom:6 }}>Tu nombre</div>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="¿Cómo te llamas?"
                style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#e8eaf0', fontSize:15, padding:'12px 16px' }} />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:'#3a5070', marginBottom:6 }}>Email</div>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"
              style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#e8eaf0', fontSize:15, padding:'12px 16px' }} />
          </div>

          {/* Password */}
          {mode !== 'forgot' && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, color:'#3a5070', marginBottom:6 }}>Contraseña</div>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"
                style={{ width:'100%', background:'rgba(255,255,255,0.06)', border:'1.5px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#e8eaf0', fontSize:15, padding:'12px 16px' }} />
              {mode === 'login' && (
                <button onClick={() => { setMode('forgot'); setError(''); setSuccess('') }}
                  style={{ background:'none', border:'none', color:'#3a5070', cursor:'pointer', fontSize:12, marginTop:6, fontFamily:"'Outfit',sans-serif" }}>
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
          )}

          {/* Error / Success */}
          {error && <div style={{ color:'#e63946', fontSize:13, marginBottom:14, textAlign:'center', background:'rgba(230,57,70,0.1)', padding:'8px 12px', borderRadius:8 }}>{error}</div>}
          {success && <div style={{ color:'#2a9d8f', fontSize:13, marginBottom:14, textAlign:'center', background:'rgba(42,157,143,0.1)', padding:'8px 12px', borderRadius:8 }}>{success}</div>}

          {/* Main button */}
          <button onClick={mode==='login'?handleLogin:mode==='register'?handleRegister:handleForgot}
            disabled={loading}
            style={{ width:'100%', padding:'14px', borderRadius:12, border:'none', cursor:'pointer', fontWeight:700, fontSize:16, fontFamily:"'Outfit',sans-serif",
              background:'linear-gradient(135deg,#e63946,#c1121f)', color:'#fff', boxShadow:'0 4px 20px rgba(230,57,70,0.35)', opacity:loading?0.6:1 }}>
            {loading ? 'Cargando...' : mode==='login' ? '⚽ Iniciar sesión' : mode==='register' ? '🚀 Crear cuenta' : '📧 Enviar email'}
          </button>

          {/* Google */}
          {mode !== 'forgot' && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }} />
                <div style={{ fontSize:12, color:'#2a4060' }}>o continúa con</div>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.08)' }} />
              </div>
              <button onClick={handleGoogle}
                style={{ width:'100%', padding:'13px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontWeight:700, fontSize:15, fontFamily:"'Outfit',sans-serif",
                  background:'rgba(255,255,255,0.06)', color:'#e8eaf0', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
            </>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:24, fontSize:11, color:'#1a2a3a' }}>
          🇺🇸 🇨🇦 🇲🇽 · FIFA World Cup 2026
        </div>
      </div>
    </div>
  )
}
