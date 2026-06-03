import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { addPoints } from '../lib/userPoints.js'
import { POINTS } from '../lib/ranks.js'

export default function Auth() {
  const nav = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register' | 'reset'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setMsg('Rellena email y contraseña'); return }
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg('Email o contraseña incorrectos')
    else nav('/')
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!email || !password || !name) { setMsg('Rellena todos los campos'); return }
    if (password.length < 6) { setMsg('Mínimo 6 caracteres en la contraseña'); return }
    setLoading(true); setMsg('')
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    })
    if (error) {
      setMsg(error.message.includes('already') ? 'Este email ya está registrado' : 'Error al registrarse')
    } else {
      if (data.user) {
        await addPoints(data.user.id, POINTS.REGISTER, 'registro_bienvenida')
      }
      setMsg('¡Cuenta creada! Ya puedes jugar 🎉')
      setTimeout(() => nav('/'), 1500)
    }
    setLoading(false)
  }

  const handleReset = async () => {
    if (!email) { setMsg('Escribe tu email primero'); return }
    setLoading(true); setMsg('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://juegosdefutbolenespanol.vercel.app/'
    })
    if (error) setMsg('Error al enviar el email')
    else setMsg('✉️ Email enviado, revisa tu bandeja de entrada')
    setLoading(false)
  }

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0a1a 0%,#0d1117 50%,#0a0a1a 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:'system-ui,sans-serif', padding:20 }}>

      <button onClick={() => nav('/')} style={{ position:'absolute', top:20, left:20, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'8px 14px', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontSize:13 }}>
        ← Volver
      </button>

      <div style={{ textAlign:'center', marginBottom:36 }}>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:56, letterSpacing:10, background:'linear-gradient(135deg,#e63946,#ff6b6b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', lineHeight:1, marginBottom:6 }}>JFEE</div>
        <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13, letterSpacing:3, textTransform:'uppercase' }}>Juegos de Futbol En Espanol</div>
      </div>

      <div style={{ background:'#0f0f1a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:28, width:'100%', maxWidth:380 }}>

        {/* Tabs — solo login y register, no reset */}
        {mode !== 'reset' && (
          <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', borderRadius:12, padding:4, marginBottom:24 }}>
            {['login','register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setMsg('') }} style={{ flex:1, padding:'10px', borderRadius:10, border:'none', background: mode===m ? 'rgba(230,57,70,0.2)' : 'transparent', color: mode===m ? '#e63946' : 'rgba(255,255,255,0.4)', fontWeight:700, fontSize:14, cursor:'pointer', transition:'all 0.2s' }}>
                {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>
        )}

        {/* Título reset */}
        {mode === 'reset' && (
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ fontSize:18, fontWeight:800, color:'#e8eaf0', marginBottom:6 }}>Recuperar contraseña</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)' }}>Te enviaremos un enlace a tu email</div>
          </div>
        )}

        {/* Bonus registro */}
        {mode === 'register' && (
          <div style={{ background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,0.2)', borderRadius:12, padding:'10px 14px', marginBottom:16, fontSize:13, color:'rgba(255,255,255,0.6)', textAlign:'center' }}>
            🎁 Regístrate y recibe <strong style={{ color:'#e63946' }}>+{POINTS.REGISTER} puntos</strong> de bienvenida
          </div>
        )}

        {/* Campos */}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {mode === 'register' && (
            <input
              placeholder="Tu nombre o apodo"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ padding:'12px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e8eaf0', fontSize:15, outline:'none' }}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ padding:'12px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e8eaf0', fontSize:15, outline:'none' }}
          />
          {mode !== 'reset' && (
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key==='Enter' && (mode==='login' ? handleLogin() : handleRegister())}
              style={{ padding:'12px 14px', borderRadius:12, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'#e8eaf0', fontSize:15, outline:'none' }}
            />
          )}
        </div>

        {msg && (
          <div style={{ marginTop:12, fontSize:13, color: msg.includes('!') || msg.includes('creada') || msg.includes('✉️') ? '#2a9d8f' : '#fca5a5', textAlign:'center' }}>
            {msg}
          </div>
        )}

        <button
          onClick={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleReset}
          disabled={loading}
          style={{ marginTop:16, width:'100%', padding:'14px', borderRadius:14, border:'none', background: loading ? 'rgba(230,57,70,0.3)' : 'linear-gradient(135deg,#e63946,#c1121f)', color:'#fff', fontSize:16, fontWeight:800, cursor: loading ? 'default' : 'pointer', letterSpacing:1 }}
        >
          {loading ? '...' : mode === 'login' ? 'ENTRAR' : mode === 'register' ? 'CREAR CUENTA' : 'ENVIAR EMAIL'}
        </button>

        {/* ¿Olvidaste la contraseña? — solo en login */}
        {mode === 'login' && (
          <div style={{ marginTop:12, textAlign:'center' }}>
            <span
              onClick={() => { setMode('reset'); setMsg('') }}
              style={{ fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer', textDecoration:'underline' }}
            >
              ¿Olvidaste tu contraseña?
            </span>
          </div>
        )}

        {/* Volver al login desde reset */}
        {mode === 'reset' && (
          <div style={{ marginTop:12, textAlign:'center' }}>
            <span
              onClick={() => { setMode('login'); setMsg('') }}
              style={{ fontSize:12, color:'rgba(255,255,255,0.35)', cursor:'pointer', textDecoration:'underline' }}
            >
              ← Volver al inicio de sesión
            </span>
          </div>
        )}

        <div style={{ marginTop:16, textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.25)' }}>
          ¿Solo quieres explorar?{' '}
          <span onClick={() => nav('/')} style={{ color:'rgba(255,255,255,0.5)', cursor:'pointer', textDecoration:'underline' }}>
            Continuar como invitado
          </span>
        </div>
      </div>
    </div>
  )
}
