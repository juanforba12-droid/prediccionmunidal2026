import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import preguntas from '../lib/preguntas_estimon_2000.json'

const TIEMPO_LIMITE = 40

function getAuthId() {
  try {
    const token = localStorage.getItem('sb-flawyripybuhifswlipm-auth-token')
    if (token) { const p = JSON.parse(token); if (p && p.user && p.user.id) return p.user.id }
  } catch(e) {}
  return null
}

function calcPuntosPorError(respuesta, real, unidad) {
  if (real == null) return 0
  const diff = Math.abs(respuesta - real)

  // Para años: diferencia absoluta en años
  if (unidad === 'año') {
    if (diff === 0) return 5
    if (diff <= 2) return 4
    if (diff <= 5) return 3
    if (diff <= 10) return 2
    if (diff <= 20) return 1
    return 0
  }

  const r = Math.abs(real)

  // Valores pequeños (< 20): margen de 4 unidades por punto
  if (r < 20) {
    if (diff === 0) return 5
    if (diff <= 1) return 4
    if (diff <= 2) return 3
    if (diff <= 3) return 2
    if (diff <= 4) return 1
    return 0
  }

  // Valores medios (20-99): margen de 3 unidades por punto
  if (r < 100) {
    if (diff === 0) return 5
    if (diff <= 3) return 4
    if (diff <= 6) return 3
    if (diff <= 9) return 2
    if (diff <= 12) return 1
    return 0
  }

  // Valores grandes (100-249): margen de 5 unidades por punto
  if (r < 250) {
    if (diff === 0) return 5
    if (diff <= 5) return 4
    if (diff <= 10) return 3
    if (diff <= 15) return 2
    if (diff <= 20) return 1
    return 0
  }

  // Valores muy grandes (>= 250): margen de 12 unidades por punto
  if (diff === 0) return 5
  if (diff <= 12) return 4
  if (diff <= 24) return 3
  if (diff <= 36) return 2
  if (diff <= 48) return 1
  return 0
}

function preguntaAleatoria(usadas) {
  const disponibles = preguntas.filter(function(p) { return !usadas.includes(p.id) })
  if (disponibles.length === 0) return preguntas[Math.floor(Math.random() * preguntas.length)]
  return disponibles[Math.floor(Math.random() * disponibles.length)]
}

export default function EstimonIndividual() {
  const nav = useNavigate()
  const [estado, setEstado] = useState('jugando')
  const [pregunta, setPregunta] = useState(null)
  const [usadas, setUsadas] = useState([])
  const [input, setInput] = useState('')
  const [resultado, setResultado] = useState(null)
  const [ptsRonda, setPtsRonda] = useState(0)
  const [ptsTotal, setPtsTotal] = useState(0)
  const [tiempo, setTiempo] = useState(TIEMPO_LIMITE)
  const [respondido, setRespondido] = useState(false)
  const timerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(function() {
    const p = preguntaAleatoria([])
    setPregunta(p)
    setUsadas([p.id])
  }, [])

  useEffect(function() {
    if (!pregunta || respondido) return
    setTiempo(TIEMPO_LIMITE)
    timerRef.current = setInterval(function() {
      setTiempo(function(t) {
        if (t <= 1) {
          clearInterval(timerRef.current)
          if (!respondido) responderConTiempoAgotado()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return function() { clearInterval(timerRef.current) }
  }, [pregunta, respondido])

  useEffect(function() {
    if (inputRef.current) inputRef.current.focus()
  }, [pregunta])

  function responderConTiempoAgotado() {
    setRespondido(true)
    clearInterval(timerRef.current)
    setPtsRonda(0)
    setResultado({ respuesta: null, real: pregunta.respuesta, pts: 0, agotado: true })
  }

  async function responder() {
    if (respondido || !input.trim()) return
    clearInterval(timerRef.current)
    setRespondido(true)
    const val = parseFloat(input.replace(',', '.'))
    const pts = calcPuntosPorError(val, pregunta.respuesta, pregunta.unidad)
    setPtsRonda(pts)
    const newTotal = ptsTotal + pts
    setPtsTotal(newTotal)
    setResultado({ respuesta: val, real: pregunta.respuesta, pts: pts })
    const userId = getAuthId()
    if (userId && pts > 0) {
      const { data } = await supabase.from('user_points').select('total_points').eq('user_id', userId).single()
      const actual = (data && data.total_points) || 0
      await supabase.from('user_points').upsert({ user_id: userId, total_points: actual + pts }, { onConflict: 'user_id' })
    }
  }

  function siguientePregunta() {
    const nueva = preguntaAleatoria(usadas)
    setUsadas(function(u) { return [...u, nueva.id] })
    setPregunta(nueva)
    setInput('')
    setRespondido(false)
    setResultado(null)
    setPtsRonda(0)
  }

  if (!pregunta) return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e5ff', fontFamily: 'sans-serif' }}>
      Cargando...
    </div>
  )

  const pct = (tiempo / TIEMPO_LIMITE) * 100
  const timerColor = tiempo > 20 ? '#00e5ff' : tiempo > 10 ? '#ffea00' : '#ff4081'

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '20px', position: 'relative' }}>
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,229,255,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />

      <button onClick={function() { nav('/estimon') }} style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'rgba(255,255,255,0.5)', padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>
        Salir
      </button>

      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#69f0ae' }}>{ptsTotal}</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>pts</span>
      </div>

      <div style={{ width: '100%', maxWidth: 480 }}>

        {!respondido && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase' }}>Tiempo</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: timerColor }}>{tiempo}s</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: pct + '%', background: timerColor, borderRadius: 3, transition: 'width 1s linear, background 0.3s' }} />
            </div>
          </div>
        )}

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>{pregunta.categoria}</div>
          <div style={{ fontSize: 20, color: '#e8eaf0', lineHeight: 1.5, fontWeight: 600, marginBottom: 20 }}>{pregunta.pregunta}</div>

          {!respondido ? (
            <div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  ref={inputRef}
                  type="number"
                  value={input}
                  onChange={function(e) { setInput(e.target.value) }}
                  onKeyDown={function(e) { if (e.key === 'Enter') responder() }}
                  placeholder={'Tu estimacion (' + pregunta.unidad + ')'}
                  style={{ flex: 1, padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.05)', color: '#e8eaf0', fontSize: 18, fontFamily: "'DM Sans', sans-serif", outline: 'none', boxSizing: 'border-box' }}
                />
                <button onClick={responder} style={{ padding: '14px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #006064)', color: '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 16, letterSpacing: 1, cursor: 'pointer', fontWeight: 700, flexShrink: 0 }}>
                  OK
                </button>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>Unidad: {pregunta.unidad}</div>
            </div>
          ) : (
            <div>
              {resultado && (
                <div style={{ textAlign: 'center' }}>
                  {resultado.agotado ? (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#ff4081', marginBottom: 4 }}>Tiempo agotado!</div>
                    </div>
                  ) : (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Tu respuesta: <strong style={{ color: '#e8eaf0' }}>{resultado.respuesta} {pregunta.unidad}</strong></div>
                    </div>
                  )}

                  <div style={{ background: 'rgba(0,229,255,0.06)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Respuesta correcta</div>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: '#00e5ff', lineHeight: 1 }}>{resultado.real} <span style={{ fontSize: 16 }}>{pregunta.unidad}</span></div>
                  </div>

                  <div style={{ background: resultado.pts > 0 ? 'rgba(105,240,174,0.08)' : 'rgba(255,64,129,0.08)', border: '1px solid ' + (resultado.pts > 0 ? 'rgba(105,240,174,0.3)' : 'rgba(255,64,129,0.3)'), borderRadius: 14, padding: '14px 20px', marginBottom: 20 }}>
                    <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 42, color: resultado.pts > 0 ? '#69f0ae' : '#ff4081', lineHeight: 1 }}>
                      {resultado.pts > 0 ? '+' + resultado.pts : '0'} pts
                    </div>
                    {!resultado.agotado && resultado.pts > 0 && (
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                        {resultado.respuesta === resultado.real ? 'Exacto!' :
                          pregunta.unidad === 'año'
                            ? 'Diferencia: ' + Math.abs(resultado.respuesta - resultado.real) + ' años'
                            : 'Error: ' + (Math.abs(resultado.respuesta - resultado.real) / Math.abs(resultado.real) * 100).toFixed(1) + '%'
                        }
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={siguientePregunta} style={{ flex: 1, padding: '14px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #00e5ff, #006064)', color: '#000', fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, cursor: 'pointer' }}>
                      JUGAR OTRA
                    </button>
                    <button onClick={function() { nav('/estimon') }} style={{ padding: '14px 16px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif", fontSize: 14, cursor: 'pointer' }}>
                      Salir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.25)' }}>
          Preguntas jugadas: {usadas.length} | Total acumulado: <strong style={{ color: '#69f0ae' }}>{ptsTotal} pts</strong>
        </div>
      </div>
    </div>
  )
}
