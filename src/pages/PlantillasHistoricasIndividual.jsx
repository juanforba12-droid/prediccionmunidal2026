import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { addPoints, getUserPoints } from '../lib/userPoints.js'
import XPWidget from './XPWidget.jsx'
import { PLANTILLAS, norm, matchNombre } from '../lib/plantillasData.js'

const POS_COLOR = { GK:'#f59e0b', DF:'#3b82f6', MF:'#10b981', FW:'#ef4444' }

function getRandomPlantilla(filtroEquipo = null) {
  const lista = filtroEquipo ? PLANTILLAS.filter(p => p.equipo === filtroEquipo) : PLANTILLAS
  return lista[Math.floor(Math.random() * lista.length)]
}

export default function PlantillasHistoricasIndividual() {
  const nav = useNavigate()
  const [plantilla, setPlantilla] = useState(null)
  const [pantalla, setPantalla] = useState('selector') // selector | juego
  const [adivinados, setAdivinados] = useState(new Set())
  const [input, setInput] = useState('')
  const [shake, setShake] = useState(false)
  const [rendido, setRendido] = useState(false)
  const [flash, setFlash] = useState(null)
  const [user, setUser] = useState(null)
  const [totalXP, setTotalXP] = useState(0)
  const [lastGained, setLastGained] = useState(0)
  const [xpLoaded, setXpLoaded] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data?.user ?? null
      setUser(u)
      if (u) {
        getUserPoints(u.id).then(pts => { setTotalXP(pts); setXpLoaded(true) })
      } else { setXpLoaded(true) }
    })
  }, [])

  const grantXP = async (pts) => {
    if (!user || pts <= 0) return
    setTotalXP(prev => prev + pts)
    setLastGained(pts)
    await addPoints(user.id, pts, 'plantillas_individual')
    setTimeout(() => setLastGained(0), 2500)
  }

  const iniciarJuego = (filtro = null) => {
    const p = getRandomPlantilla(filtro)
    setPlantilla(p)
    setAdivinados(new Set())
    setInput('')
    setShake(false)
    setRendido(false)
    setFlash(null)
    setPantalla('juego')
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const tryGuess = useCallback(() => {
    const val = input.trim()
    if (!val || rendido || !plantilla) return
    let found = -1
    plantilla.jugadores.forEach((j, i) => {
      if (!adivinados.has(i) && matchNombre(val, j.nombre)) found = i
    })
    if (found !== -1) {
      const nuevos = new Set([...adivinados, found])
      setAdivinados(nuevos)
      setFlash(found)
      setTimeout(() => setFlash(null), 700)
      setInput('')
      grantXP(10)
    } else {
      setShake(true)
      setTimeout(() => setShake(false), 450)
    }
  }, [input, adivinados, plantilla, rendido])

  const acabado = rendido || adivinados.size === plantilla?.jugadores?.length
  const ACENTO_MAP = {
    'Real Madrid': '#3b82f6',
    'Barcelona': '#ec4899',
    'Manchester United': '#ef4444',
    'Bayern Munich': '#f59e0b',
    'Chelsea': '#1d4ed8',
    'Liverpool': '#dc2626',
    'Atlético de Madrid': '#e63312',
    'Manchester City': '#6ec6f0',
    'AC Milan': '#c80000',
    'Paris Saint-Germain': '#001489',
  }
  const acento = ACENTO_MAP[plantilla?.equipo] || '#f59e0b'

  // ── SELECTOR ──
  if (pantalla === 'selector') return (
    <div style={st.root}>
      <button onClick={() => nav('/plantillas')} style={st.backBtn}>←</button>
      <div style={{ maxWidth:400, margin:'0 auto', padding:'60px 24px' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <div style={{ fontSize:48, marginBottom:8 }}>🏟️</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, color:'#f59e0b', letterSpacing:4 }}>INDIVIDUAL</div>
          <div style={{ fontSize:13, color:'#6a5a8a', marginTop:6, letterSpacing:2 }}>Elige cómo empezar</div>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <button onClick={() => iniciarJuego(null)} style={st.bigBtn('#f59e0b')}>
            <div style={{ fontSize:28, marginBottom:6 }}>🎲</div>
            <div style={{ fontSize:18, fontWeight:900, color:'#f59e0b' }}>Aleatoria</div>
            <div style={{ fontSize:12, color:'#6a5a8a', marginTop:4 }}>Cualquier plantilla de las 54 temporadas</div>
          </button>

          <div style={{ fontSize:11, color:'#4a3a6a', letterSpacing:2, textAlign:'center', margin:'8px 0 4px', textTransform:'uppercase' }}>
            O elige un club
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <button onClick={() => iniciarJuego('Real Madrid')} style={st.bigBtn('#3b82f6')}>
              <div style={{ fontSize:22, marginBottom:3 }}>⚪</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#3b82f6' }}>Real Madrid</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>27 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('Barcelona')} style={st.bigBtn('#ec4899')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🔵</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#ec4899' }}>Barcelona</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>27 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('Manchester United')} style={st.bigBtn('#ef4444')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🔴</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#ef4444' }}>Man United</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>27 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('Bayern Munich')} style={st.bigBtn('#f59e0b')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🟥</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#f59e0b' }}>Bayern Munich</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>27 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('Chelsea')} style={st.bigBtn('#1d4ed8')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🔵</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#1d4ed8' }}>Chelsea</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>27 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('Liverpool')} style={st.bigBtn('#dc2626')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🔴</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#dc2626' }}>Liverpool</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>27 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('Atlético de Madrid')} style={st.bigBtn('#e63312')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🔴</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#e63312' }}>Atlético Madrid</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>19 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('Manchester City')} style={st.bigBtn('#6ec6f0')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🔵</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#6ec6f0' }}>Man City</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>19 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('AC Milan')} style={st.bigBtn('#c80000')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🔴</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#c80000' }}>AC Milan</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>27 temporadas</div>
            </button>
            <button onClick={() => iniciarJuego('Paris Saint-Germain')} style={st.bigBtn('#001489')}>
              <div style={{ fontSize:22, marginBottom:3 }}>🔵</div>
              <div style={{ fontSize:14, fontWeight:900, color:'#001489' }}>PSG</div>
              <div style={{ fontSize:10, color:'#6a5a8a', marginTop:2 }}>15 temporadas</div>
            </button>
          </div>
        </div>
      </div>
      {xpLoaded && <XPWidget user={user} totalXP={totalXP} lastGained={lastGained} />}
    </div>
  )

  // ── JUEGO ──
  const total = plantilla.jugadores.length
  const pct = Math.round((adivinados.size / total) * 100)

  return (
    <div style={st.root}>
      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.4)', borderBottom:`1px solid ${acento}33`, padding:'12px 16px', display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => setPantalla('selector')} style={st.iconBtn}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:900, color:acento }}>{plantilla.equipo} · {plantilla.temporada}</div>
        </div>
        <div style={{ background:`${acento}22`, borderRadius:20, padding:'4px 14px', fontSize:13, fontWeight:900, color:acento }}>
          {adivinados.size}/11
        </div>
      </div>

      <div style={{ maxWidth:520, margin:'0 auto', padding:'16px 16px 0' }}>

        {/* Progreso */}
        <div style={{ height:5, background:'rgba(255,255,255,0.08)', borderRadius:99, overflow:'hidden', marginBottom:16 }}>
          <div style={{ height:'100%', width:`${pct}%`, background:pct===100?'#10b981':acento, borderRadius:99, transition:'width 0.4s' }} />
        </div>

        {/* Input */}
        {!acabado && (
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==='Enter' && tryGuess()}
              placeholder="Nombre o apellido..."
              style={{ ...st.input, animation:shake?'shake 0.45s':undefined, borderColor:shake?'#ef4444':'rgba(255,255,255,0.1)' }}
              autoComplete="off" autoCorrect="off" spellCheck={false}
            />
            <button onClick={tryGuess} style={{ ...st.btnOk, background:acento }}>→</button>
            <button onClick={() => setRendido(true)} style={st.btnRend}>Rendirse</button>
          </div>
        )}

        {/* Banner */}
        {adivinados.size === total && (
          <div style={st.bannerWin}>🏆 ¡Plantilla completa! {user && `+${total * 10} XP`}</div>
        )}
        {rendido && adivinados.size < total && (
          <div style={st.bannerLose}>Rendido — {adivinados.size}/11 acertados</div>
        )}

        {/* Lista jugadores */}
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
          {plantilla.jugadores.map((j, i) => {
            const ok = adivinados.has(i)
            const rev = ok || acabado
            const isNew = flash === i
            return (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'10px 14px', borderRadius:10,
                border:`1px solid ${isNew?'#10b981':ok?acento:acabado&&!ok?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.07)'}`,
                background: isNew?'rgba(16,185,129,0.1)':ok?`${acento}12`:acabado&&!ok?'rgba(239,68,68,0.08)':'rgba(255,255,255,0.04)',
                transform:isNew?'scale(1.015)':'scale(1)',
                transition:'all 0.25s',
              }}>
                <span style={{ fontSize:10, fontWeight:900, color:'#000', background:POS_COLOR[j.pos]||'#555', borderRadius:5, padding:'2px 6px', minWidth:30, textAlign:'center' }}>
                  {j.pos}
                </span>
                {rev
                  ? <span style={{ fontSize:14, fontWeight:ok?700:400, color:ok?acento:'#f87171' }}>{j.nombre}</span>
                  : <span style={{ color:'rgba(255,255,255,0.12)', letterSpacing:4, fontSize:11, userSelect:'none' }}>{'█'.repeat(Math.min(j.nombre.length,13))}</span>
                }
                {isNew && <span style={{ marginLeft:'auto', fontSize:16 }}>✅</span>}
              </div>
            )
          })}
        </div>

        {/* Botones fin */}
        {acabado && (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button onClick={() => iniciarJuego(plantilla.equipo)} style={{ ...st.btnOk, background:acento, width:'100%', padding:13, fontSize:14 }}>
              🎲 Otra de {plantilla.equipo}
            </button>
            <button onClick={() => iniciarJuego(null)} style={{ ...st.btnOk, background:'#f59e0b', width:'100%', padding:13, fontSize:14 }}>
              🎲 Plantilla aleatoria
            </button>
            <button onClick={() => setPantalla('selector')} style={{ ...st.btnRend, width:'100%', padding:11 }}>
              ← Volver al menú
            </button>
          </div>
        )}
      </div>

      {xpLoaded && <XPWidget user={user} totalXP={totalXP} lastGained={lastGained} />}
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  )
}

const st = {
  root:{ minHeight:'100vh', background:'linear-gradient(160deg,#0f0c1a,#1a1030,#0c1520)', fontFamily:'system-ui,sans-serif', color:'#e8e0f0', paddingBottom:80 },
  backBtn:{ position:'absolute', top:20, left:20, background:'none', border:'none', color:'#6a5a8a', cursor:'pointer', fontSize:20 },
  iconBtn:{ background:'none', border:'none', color:'#6a5a8a', cursor:'pointer', fontSize:20 },
  bigBtn:(color) => ({
    padding:'20px 24px', borderRadius:16,
    border:`1px solid ${color}44`,
    background:`${color}0d`,
    cursor:'pointer', textAlign:'center',
    transition:'all 0.2s',
  }),
  input:{ flex:1, padding:'12px 14px', borderRadius:12, border:'1px solid', background:'rgba(255,255,255,0.06)', color:'#e8e0f0', fontSize:15, outline:'none', fontFamily:'system-ui,sans-serif' },
  btnOk:{ border:'none', borderRadius:12, padding:'12px 18px', fontWeight:900, fontSize:15, cursor:'pointer', color:'#0a0a14', fontFamily:'system-ui,sans-serif' },
  btnRend:{ background:'rgba(255,255,255,0.06)', color:'#6a5a8a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 14px', fontSize:13, cursor:'pointer', fontFamily:'system-ui,sans-serif' },
  bannerWin:{ background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#6ee7b7', borderRadius:12, padding:'12px 16px', textAlign:'center', fontWeight:700, fontSize:14, marginBottom:14 },
  bannerLose:{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5', borderRadius:12, padding:'12px 16px', textAlign:'center', fontWeight:700, fontSize:14, marginBottom:14 },
}
