import { useState, useEffect } from 'react'
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

function guardarSesion(id, nombre, esCreador) {
  const saved = JSON.parse(localStorage.getItem('estimon_sesiones') || '[]')
  const existe = saved.find(function(s) { return s.id === id })
  if (!existe) {
    const nueva = [...saved, { id: id, nombre: nombre, esCreador: esCreador, fecha: Date.now() }]
    localStorage.setItem('estimon_sesiones', JSON.stringify(nueva))
  }
}

function eliminarSesionLocal(id) {
  const saved = JSON.parse(localStorage.getItem('estimon_sesiones') || '[]')
  localStorage.setItem('estimon_sesiones', JSON.stringify(saved.filter(function(s) { return s.id !== id })))
  localStorage.removeItem('estimon_player_' + id)
}

export default function EstimonHome() {
  const nav = useNavigate()
  const [mode, setMode] = useState(null)
  const [nombre, setNombre] = useState(getGuestName())
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sesiones, setSesiones] = useState([])

  useEffect(function() {
    const saved = JSON.parse(localStorage.getItem('estimon_sesiones') || '[]')
    setSesiones(saved)
  }, [])

  async function crearSala() {
    if (!nombre.trim()) return setError('Pon tu nombre')
    setLoading(true)
    const id = genCode()
    const jugador = { id: nombre.trim(), nombre: nombre.trim(), avatar: '🎯', color: '#00e5ff' }
    const { error: err } = await supabase.from('estimon_sessions').insert({
      id: id,
      estado: 'esperando',
      jugadores: [jugador],
      respuestas: {},
      pregunta_idx: 0,
      ronda: 1,
    })
    if (err) { setError('Error al crear sala'); setLoading(false); return }
    localStorage.setItem('estimon_player_' + id, JSON.stringify(jugador))
    guardarSesion(id, nombre.trim(), true)
    nav('/estimon/online/' + id)
    setLoading(false)
  }

  async function unirseASala() {
    if (!nombre.trim()) return setError('Pon tu nombre')
    if (!codigo.trim()) return setError('Introduce el codigo de la sala')
    setLoading(true)
    const { data, error: err } = await supabase.from('estimon_sessions').select('*').eq('id', codigo.toUpperCase()).single()
    if (err || !data) { setError('Sala no encontrada'); setLoading(false); return }
    if (data.estado === 'jugando') {
      const saved = localStorage.getItem('estimon_player_' + data.id)
      if (!saved) { setError('La partida ya ha empezado'); setLoading(false); return }
    }
    const jugadores = data.jugadores || []
    const yaEsta = jugadores.find(function(j) { return j.nombre === nombre.trim() })
    if (yaEsta) {
      localStorage.setItem('estimon_player_' + data.id, JSON.stringify(yaEsta))
      guardarSesion(data.id, nombre.trim(), false)
      nav('/estimon/online/' + data.id)
      setLoading(false)
      return
    }
    if (data.estado !== 'esperando') { setError('La partida ya ha empezado'); setLoading(false); return }
    const colores = ['#00e5ff','#ff4081','#69f0ae','#ffea00','#e040fb','#ff6d00','#40c4ff','#f50057']
    const jugador = { id: nombre.trim(), nombre: nombre.trim(), avatar: '🎯', color: colores[jugadores.length % colores.length] }
    const nuevos = [...jugadores, jugador]
    await supabase.from('estimon_sessions').update({ jugadores: nuevos }).eq('id', data.id)
    localStorage.setItem('estimon_player_' + data.id, JSON.stringify(jugador))
    guardarSesion(data.id, nombre.trim(), false)
    nav('/estimon/online/' + data.id)
    setLoading(false)
  }

  async function volverASesion(s) {
    const { data } = await supabase.from('estimon_sessions').select('*').eq('id', s.id).single()
    if (!data) {
      eliminarSesionLocal(s.id)
      setSesiones(JSON.parse(localStorage.getItem('estimon_sesiones') || '[]'))
      setError('La sala ya no existe')
      return
    }
    const saved = localStorage.getItem('estimon_player_' + s.id)
    if (!saved) {
      const jugadores = data.jugadores || []
      const j = jugadores.find(function(j) { return j.nombre === s.nombre })
      if (j) localStorage.setItem('estimon_player_' + s.id, JSON.stringify(j))
    }
    nav('/estimon/online/' + s.id)
  }

  async function eliminarSesion(s) {
    eliminarSesionLocal(s.id)
    setSesiones(JSON.parse(localStorage.getItem('estimon_sesiones') || '[]'))
    if (s.esCreador) {
      await supabase.from('estimon_sessions').delete().eq('id', s.id)
    }
  }

  const S = {
    root: { minHeight: '100vh', background: '#080a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' },
    bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,255,0.12) 0%, transparent 60%)', pointerEvents: 'none' },
    card: { width: '100%', maxWidth: 420, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '32px 28px', position: 'relative', zIndex: 1 },
    title: { fontFamily: "'Bebas Neue', sans-serif", fontSize: 52, letterSpacing: 6, background: 'linear-gradient(135deg, #00e5ff, #69f0ae)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textAlign: 'center', lineHeight: 1, marginBottom: 4 },
    sub: { textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 28 },
    modeBtn: function(active) { return { width: '100%', padding: '16px', borderRadius: 14, border: '1.5px solid ' + (active ? '#00e5ff' : 'rgba(255,255,255,0.1)'), background: active ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.03)', color: active ? '#00e5ff' : 'rgba(255,255,255,0.6)', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' } },
    inp: { width: '100%', padding: '12px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#e8eaf0', fontSize: 15, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box', outline: 'none', marginBottom: 12 },
    btn: function(color) { return { width: '100%', padding: '14px', borderRadius: 12, border: 'none', background: color || 'linear-gradient(135deg, #00e5ff, #006064)', color: '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, cursor: 'pointer', fontWeight: 700, marginTop: 4 } },
    back: { background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 13, cursor: 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 },
    err: { color: '#ff4081', fontSize: 13, marginTop: 8, textAlign: 'center' },
    label: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' },
  }

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
      <div style={S.bg} />

      <button onClick={function() { nav('/') }} style={{ position: 'absolute', top: 20, left: 20, zIndex: 2, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
        Menu
      </button>

      <div style={S.card}>
        <div style={S.title}>ESTIMON</div>
        <div style={S.sub}>Adivina el numero exacto</div>

        {sesiones.length > 0 && !mode && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Tus salas activas</div>
            {sesiones.map(function(s) {
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: 10, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: '#e8eaf0', fontWeight: 700 }}>{s.esCreador ? 'Tu sala' : 'Sala'}: <span style={{ color: '#00e5ff', letterSpacing: 2 }}>{s.id}</span></div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{s.nombre}{s.esCreador ? ' (creador)' : ''}</div>
                  </div>
                  <button onClick={function() { volverASesion(s) }} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.1)', color: '#00e5ff', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>
                    Volver
                  </button>
                  <button onClick={function() { eliminarSesion(s) }} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,64,129,0.3)', background: 'rgba(255,64,129,0.08)', color: '#ff4081', fontSize: 12, cursor: 'pointer' }}>
                    X
                  </button>
                </div>
              )
            })}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '16px 0' }} />
          </div>
        )}

        {!mode && (
          <div>
            <button onClick={function() { nav('/estimon/individual') }} style={S.modeBtn(false)}>
              <span style={{ fontSize: 28 }}>🎮</span>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#e8eaf0', marginBottom: 2 }}>Individual</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 400 }}>Juega solo, acumula puntos</div>
              </div>
            </button>
            <button onClick={function() { setMode('multi') }} style={S.modeBtn(false)}>
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

            <button onClick={crearSala} disabled={loading} style={Object.assign({}, S.btn(), { marginBottom: 12 })}>
              {loading ? '...' : 'CREAR SALA'}
            </button>

            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 12 }}>o unete a una sala existente</div>

            <input style={S.inp} value={codigo} onChange={function(e) { setCodigo(e.target.value.toUpperCase()) }} placeholder="Codigo de sala (ej: AB12CD)" maxLength={6} />
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
