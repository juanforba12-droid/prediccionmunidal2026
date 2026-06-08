import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

function genCode() {
  return Math.random().toString(36).slice(2,8).toUpperCase()
}

function getGuestName() {
  const saved = localStorage.getItem('jfee_guest')
  if (saved) return saved
  const adjs = ['Rapido','Feroz','Loco','Magico','Veloz','Bravo','Crack','Astuto','Zurdo','Fiero']
  const nouns = ['Delantero','Portero','Defensa','Capitan','Goleador','Ariete']
  const name = adjs[Math.floor(Math.random()*adjs.length)] + nouns[Math.floor(Math.random()*nouns.length)] + (Math.floor(Math.random()*99)+1)
  localStorage.setItem('jfee_guest', name)
  return name
}

export default function EstimonHome() {
  const nav = useNavigate()
  const [mode, setMode] = useState(null)
  const [nombre, setNombre] = useState(getGuestName())
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function crearSala() {
    if (!nombre.trim()) return setError('Pon tu nombre')
    setLoading(true)
    const id = genCode()
    const jugador = { id: nombre.trim(), nombre: nombre.trim(), avatar: '🎯', color: '#00e5ff' }
    const { error: err } = await supabase.from('estimon_sessions').insert({
      id,
      estado: 'esperando',
      jugadores: [jugador],
      respuestas: {},
      pregunta_idx: 0,
      ronda: 1,
    })
    if (err) { setError('Error al crear sala'); setLoading(false); return }
    localStorage.setItem('estimon_player_' + id, JSON.stringify(jugador))
    nav('/estimon/online/' + id)
    setLoading(false)
  }

  async function unirseASala() {
    if (!nombre.trim()) return setError('Pon tu nombre')
    if (!codigo.trim()) return setError('Introduce el codigo de la sala')
    setLoading(true)
    const { data, error: err } = await supabase.from('estimon_sessions').select('*').eq('id', codigo.toUpperCase()).single()
    if (err || !data) { setError('Sala no encontrada'); setLoading(false); return }
    if (data.estado === 'jugando') { setError('La partida ya ha empezado'); setLoading(false); return }
    const jugadores = data.jugadores || []
    const yaEsta = jugadores.find(function(j) { return j.nombre === nombre.trim() })
    if (yaEsta) {
      localStorage.setItem('estimon_player_' + data.id, JSON.stringify(yaEsta))
      nav('/estimon/online/' + data.id)
      setLoading(false)
      return
    }
    const colores = ['#00e5ff','#ff4081','#69f0ae','#ffea00','#e040fb','#ff6d00','#40c4ff','#f50057']
    const jugador = { id: nombre.trim(), nombre: nombre.trim(), avatar: '🎯', color: colores[jugadores.length % colores.length] }
    const nuevos = [...jugadores, jugador]
    await supabase.from('estimon_sessions').update({ jugadores: nuevos }).eq('id', data.id)
    localStorage.setItem('estimon_player_' + data.id, JSON.stringify(jugador))
    nav('/estimon/online/' + data.id)
    setLoading(false)
  }

  const S = {
    root: { minHeight: '100vh', background: '#080a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' },
    bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' },
    card: { width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 28px' },
    title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 6, background: 'linear-gradient(135deg, #00e5ff, #69f0ae)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', lineHeight: 1, marginBottom: 4 },
    sub: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 32 },
    modeBtn: (active) => ({ width: '100%', padding: '16px', borderRadius: 14, border: '1.5px solid ' + (active ? '#00e5ff' : 'rgba(255,255,255,0.1)'), background: active ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.03)', color: active ? '#00e5ff' : 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', transition: 'all 0.15s' }),
    inp: { width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e8eaf0', fontSize: 15, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none', marginBottom: 12 },
    btn: (color) => ({ width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: color || 'linear-gradient(135deg, #00e5ff, #006064)', color: color ? '#000' : '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, cursor: 'pointer', fontWeight: 700, marginTop: 4 }),
    back: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 },
    err: { color: '#ff4081', fontSize: 13, marginTop: 8, textAlign: 'center' },
    label: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' },
  }

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={S.bg} />

      <button onClick={function() { nav('/') }} style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
        Menu
      </button>

      <div style={S.card}>
        <div style={S.title}>ESTIMON</div>
        <div style={S.sub}>Adivina el numero exacto</div>

        {!mode && (
          <div>
            <button onClick={function() { nav('/estimon/individual') }} style={S.modeBtn(false)}>
              <span style={{ fontSize: 28 }}>🎮</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e8eaf0', marginBottom: 2 }}>Individual</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Juega solo, acumula puntos</div>
              </div>
            </button>
            <button onClick={function() { setMode('multi') }} style={S.modeBtn(mode === 'multi')}>
              <span style={{ fontSize: 28 }}>👥</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e8eaf0', marginBottom: 2 }}>Multijugador</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Compite con tus amigos</div>
              </div>
            </button>
          </div>
        )}

        {mode === 'multi' && (
          <div>
            <button onClick={function() { setMode(null); setError('') }} style={S.back}>
              {'← Volver'}
            </button>
            <div style={S.label}>Tu nombre</div>
            <input style={S.inp} value={nombre} onChange={function(e) { setNombre(e.target.value) }} placeholder="Como te llamas?" maxLength={20} />

            <div style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 16 }}>
              <button onClick={crearSala} disabled={loading} style={Object.assign({}, S.btn(), { flex: 1, background: 'linear-gradient(135deg, #00e5ff, #006064)' })}>
                {loading ? '...' : 'CREAR SALA'}
              </button>
            </div>

            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 12 }}>o unete a una sala</div>

            <input style={S.inp} value={codigo} onChange={function(e) { setCodigo(e.target.value.toUpperCase()) }} placeholder="Codigo de sala" maxLength={6} />
            <button onClick={unirseASala} disabled={loading} style={S.btn('linear-gradient(135deg, #69f0ae, #00695c)')}>
              {loading ? '...' : 'UNIRSE'}
            </button>

            {error && <div style={S.err}>{error}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
