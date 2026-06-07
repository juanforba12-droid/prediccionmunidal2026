import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

// ── Admin UIDs ─────────────────────────────────────────────────────────────
const ADMIN_UIDS = ['2f506ea7-bb8a-4e5e-bf90-2816fcd73fe1']

// ── Helpers ────────────────────────────────────────────────────────────────
function getUserId() {
  // Primero intenta el UUID de Supabase Auth (usuarios registrados)
  try {
    const token = localStorage.getItem('sb-flawyripybuhifswlipm-auth-token')
    if (token) {
      const parsed = JSON.parse(token)
      if (parsed?.user?.id) return parsed.user.id
    }
  } catch (e) {}
  // Fallback para invitados: usa jfee_uid o crea uno nuevo
  let uid = localStorage.getItem('jfee_uid')
  if (!uid) { uid = crypto.randomUUID(); localStorage.setItem('jfee_uid', uid) }
  return uid
}

function isAdmin(uid) { return ADMIN_UIDS.includes(uid) }

function formatFecha(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('es-ES', { day:'2-digit', month:'short', year:'numeric' })
    + ' · ' + d.toLocaleTimeString('es-ES', { hour:'2-digit', minute:'2-digit' })
}

function estadoBadge(estado) {
  const map = {
    abierto:  { label:'ABIERTO',  cls:'badge-open' },
    cerrado:  { label:'CERRADO',  cls:'badge-closed' },
    resuelto: { label:'RESUELTO', cls:'badge-resolved' },
  }
  return map[estado] || map.abierto
}

// ── Leer puntos del usuario (igual que el resto de juegos) ─────────────────
async function leerPuntos(userId) {
  const { data } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_id', userId)
    .single()
  return data?.total_points ?? 0
}

// ── Actualizar puntos (upsert, igual que el resto de juegos) ───────────────
async function actualizarPuntos(userId, delta) {
  const actual = await leerPuntos(userId)
  const nuevo = Math.max(0, actual + delta)
  await supabase
    .from('user_points')
    .upsert({ user_id: userId, total_points: nuevo }, { onConflict: 'user_id' })
  return nuevo
}

// ── Componente principal ───────────────────────────────────────────────────
export default function Marcador() {
  const nav = useNavigate()
  const [uid] = useState(getUserId)
  const admin = isAdmin(uid)

  const [partidos, setPartidos] = useState([])
  const [misApuestas, setMisApuestas] = useState([])
  const [userPoints, setUserPoints] = useState(0)
  const [tab, setTab] = useState('partidos')
  const [loading, setLoading] = useState(true)

  // ── Cargar puntos al montar ────────────────────────────────────────────
  useEffect(() => {
    leerPuntos(uid).then(setUserPoints)
  }, [uid])

  // ── Polling cada 10s ──────────────────────────────────────────────────
  const cargarDatos = useCallback(async () => {
    const [{ data: ps }, { data: as }] = await Promise.all([
      supabase.from('marcador_partidos').select('*').order('fecha_inicio', { ascending: true }),
      supabase.from('marcador_apuestas').select('*').eq('user_id', uid),
    ])
    if (ps) {
      const ahora = new Date()
      const abiertos = ps.filter(p => p.estado === 'abierto' && new Date(p.fecha_inicio) <= ahora)
      if (abiertos.length > 0) {
        await Promise.all(abiertos.map(p =>
          supabase.from('marcador_partidos').update({ estado: 'cerrado' }).eq('id', p.id)
        ))
        abiertos.forEach(p => { p.estado = 'cerrado' })
      }
      setPartidos(ps)
    }
    if (as) setMisApuestas(as)
    setLoading(false)
  }, [uid])

  useEffect(() => {
    cargarDatos()
    const iv = setInterval(cargarDatos, 10000)
    return () => clearInterval(iv)
  }, [cargarDatos])

  const puntosEnJuego = misApuestas
    .filter(a => !a.resuelta)
    .reduce((acc, a) => acc + a.puntos_apostados, 0)

  const puntosLibres = userPoints - puntosEnJuego

  // ── Apostar ────────────────────────────────────────────────────────────
  async function handleApostar(partido, opcion, ptsApostar) {
    const pts = parseInt(ptsApostar)
    if (!pts || pts <= 0) return { error: 'Cantidad inválida' }
    if (pts > puntosLibres) return { error: `Solo tienes ${puntosLibres} puntos libres` }

    const cuotaMap = { '1': partido.cuota_1, 'X': partido.cuota_x, '2': partido.cuota_2 }

    const { error } = await supabase.from('marcador_apuestas').insert({
      user_id: uid,
      partido_id: partido.id,
      opcion,
      puntos_apostados: pts,
      cuota_al_apostar: cuotaMap[opcion],
    })

    if (error) return { error: 'Error al registrar la apuesta' }

    // Descontar puntos de Supabase
    const nuevos = await actualizarPuntos(uid, -pts)
    setUserPoints(nuevos)
    cargarDatos()
    return { ok: true }
  }

  return (
    <div className="marcador-root">
      <style>{STYLES}</style>

      {/* Header */}
      <header className="marc-header">
        <button className="marc-back" onClick={() => nav('/')}>← Menú</button>
        <div className="marc-header-center">
          <span className="marc-logo">🎰</span>
          <div>
            <h1 className="marc-title">EL MARCADOR</h1>
            <p className="marc-subtitle">Apuesta tus puntos · Multiplica tus ganancias</p>
          </div>
        </div>
        <div className="marc-stats">
          <div className="marc-stat">
            <span className="marc-stat-val">{puntosLibres.toLocaleString()}</span>
            <span className="marc-stat-lbl">libres</span>
          </div>
          <div className="marc-stat marc-stat-risk">
            <span className="marc-stat-val">{puntosEnJuego.toLocaleString()}</span>
            <span className="marc-stat-lbl">en juego</span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="marc-tabs">
        {['partidos', 'mis-apuestas', ...(admin ? ['admin'] : [])].map(t => (
          <button
            key={t}
            className={`marc-tab ${tab === t ? 'marc-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'partidos'    && '⚽ Partidos'}
            {t === 'mis-apuestas' && `📋 Mis apuestas${misApuestas.length ? ` (${misApuestas.length})` : ''}`}
            {t === 'admin'       && '🔧 Admin'}
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <main className="marc-main">
        {loading ? (
          <div className="marc-loading">Cargando partidos…</div>
        ) : tab === 'partidos' ? (
          <TabPartidos
            partidos={partidos}
            misApuestas={misApuestas}
            puntosLibres={puntosLibres}
            onApostar={handleApostar}
          />
        ) : tab === 'mis-apuestas' ? (
          <TabMisApuestas misApuestas={misApuestas} partidos={partidos} />
        ) : (
          <TabAdmin partidos={partidos} uid={uid} onRefresh={cargarDatos} onPuntosChange={(userId, delta) => actualizarPuntos(userId, delta)} />
        )}
      </main>
    </div>
  )
}

// ── Tab Partidos ───────────────────────────────────────────────────────────
function TabPartidos({ partidos, misApuestas, puntosLibres, onApostar }) {
  const abiertos  = partidos.filter(p => p.estado === 'abierto')
  const cerrados  = partidos.filter(p => p.estado === 'cerrado')
  const resueltos = partidos.filter(p => p.estado === 'resuelto')

  return (
    <div>
      {partidos.length === 0 && (
        <div className="marc-empty">No hay partidos disponibles todavía.<br/>¡Vuelve pronto!</div>
      )}
      {abiertos.length > 0 && <>
        <h2 className="marc-section-title">🟢 Apuestas abiertas</h2>
        {abiertos.map(p => <TarjetaPartido key={p.id} partido={p}
          misApuestas={misApuestas.filter(a => a.partido_id === p.id)}
          puntosLibres={puntosLibres} onApostar={onApostar} />)}
      </>}
      {cerrados.length > 0 && <>
        <h2 className="marc-section-title">🔴 Cerrados · Esperando resultado</h2>
        {cerrados.map(p => <TarjetaPartido key={p.id} partido={p}
          misApuestas={misApuestas.filter(a => a.partido_id === p.id)}
          puntosLibres={puntosLibres} onApostar={onApostar} />)}
      </>}
      {resueltos.length > 0 && <>
        <h2 className="marc-section-title">✅ Resueltos</h2>
        {resueltos.map(p => <TarjetaPartido key={p.id} partido={p}
          misApuestas={misApuestas.filter(a => a.partido_id === p.id)}
          puntosLibres={puntosLibres} onApostar={onApostar} />)}
      </>}
    </div>
  )
}

// ── Tarjeta de partido ─────────────────────────────────────────────────────
function TarjetaPartido({ partido, misApuestas, puntosLibres, onApostar }) {
  const [apuesta, setApuesta] = useState('')
  const [opcion, setOpcion] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const badge = estadoBadge(partido.estado)

  async function handleApostar() {
    setMsg({ type: '', text: '' })
    if (!opcion) return setMsg({ type: 'error', text: 'Elige 1, X o 2' })
    if (!apuesta || parseInt(apuesta) <= 0) return setMsg({ type: 'error', text: 'Introduce una cantidad válida' })
    setEnviando(true)
    const res = await onApostar(partido, opcion, apuesta)
    if (res.error) setMsg({ type: 'error', text: res.error })
    else { setMsg({ type: 'ok', text: `✅ Apuesta de ${apuesta} pts a "${opcion}" registrada` }); setApuesta(''); setOpcion(null) }
    setEnviando(false)
  }

  const opciones = [
    { key: '1', label: partido.equipo_local,    cuota: partido.cuota_1 },
    { key: 'X', label: 'Empate',                cuota: partido.cuota_x },
    { key: '2', label: partido.equipo_visitante, cuota: partido.cuota_2 },
  ]

  return (
    <div className={`marc-card marc-card-${partido.estado}`}>
      <div className="marc-card-head">
        <span className={`marc-badge ${badge.cls}`}>{badge.label}</span>
        {partido.descripcion && <span className="marc-desc">{partido.descripcion}</span>}
        <span className="marc-fecha">{formatFecha(partido.fecha_inicio)}</span>
      </div>

      <div className="marc-equipos">
        <span className="marc-equipo marc-local">{partido.equipo_local}</span>
        {partido.estado === 'resuelto'
          ? <span className="marc-resultado-final">{partido.goles_local} – {partido.goles_visitante}</span>
          : <span className="marc-vs">VS</span>}
        <span className="marc-equipo marc-visitante">{partido.equipo_visitante}</span>
      </div>

      <div className="marc-cuotas">
        {opciones.map(op => {
          const ganadora = partido.estado === 'resuelto' && partido.resultado === op.key
          const misAqui  = misApuestas.filter(a => a.opcion === op.key)
          const totalAqui = misAqui.reduce((acc, a) => acc + a.puntos_apostados, 0)
          return (
            <button key={op.key}
              className={`marc-cuota-btn ${opcion === op.key ? 'marc-cuota-sel' : ''} ${ganadora ? 'marc-cuota-win' : ''} ${partido.estado !== 'abierto' ? 'marc-cuota-disabled' : ''}`}
              onClick={() => partido.estado === 'abierto' && setOpcion(op.key)}
              disabled={partido.estado !== 'abierto'}
            >
              <span className="marc-cuota-label">{op.key}</span>
              <span className="marc-cuota-nombre">{op.label}</span>
              <span className="marc-cuota-valor">×{Number(op.cuota).toFixed(2)}</span>
              {totalAqui > 0 && <span className="marc-cuota-mis">{totalAqui.toLocaleString()} pts</span>}
              {ganadora && <span className="marc-cuota-check">✓</span>}
            </button>
          )
        })}
      </div>

      {partido.estado === 'abierto' && (
        <div className="marc-bet-row">
          <input className="marc-bet-input" type="number" min="1" max={puntosLibres}
            placeholder="Puntos a apostar" value={apuesta}
            onChange={e => setApuesta(e.target.value)} />
          {opcion && apuesta && parseInt(apuesta) > 0 && (
            <span className="marc-bet-preview">
              → {Math.floor(parseInt(apuesta) * (opcion === '1' ? partido.cuota_1 : opcion === 'X' ? partido.cuota_x : partido.cuota_2))} pts si ganas
            </span>
          )}
          <button className="marc-bet-btn" onClick={handleApostar}
            disabled={enviando || !opcion || !apuesta}>
            {enviando ? '…' : 'APOSTAR'}
          </button>
        </div>
      )}

      {msg.text && <p className={msg.type === 'error' ? 'marc-error' : 'marc-success'}>{msg.text}</p>}

      {misApuestas.length > 0 && (
        <div className="marc-mis-resumen">
          <span className="marc-mis-lbl">Tus apuestas en este partido:</span>
          {misApuestas.map(a => {
            const ganada  = partido.estado === 'resuelto' && a.resuelta && a.puntos_ganados > 0
            const perdida = partido.estado === 'resuelto' && a.resuelta && !a.puntos_ganados
            return (
              <span key={a.id} className={`marc-mis-item ${ganada ? 'ganada' : perdida ? 'perdida' : ''}`}>
                {a.opcion} · {a.puntos_apostados}pts ×{a.cuota_al_apostar}
                {ganada  && ` → +${a.puntos_ganados - a.puntos_apostados}pts ✓`}
                {perdida && ` → −${a.puntos_apostados}pts ✗`}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Tab Mis Apuestas ───────────────────────────────────────────────────────
function TabMisApuestas({ misApuestas, partidos }) {
  if (misApuestas.length === 0)
    return <div className="marc-empty">Todavía no has hecho ninguna apuesta.<br/>¡Ve a la pestaña Partidos!</div>

  const totalApostado = misApuestas.reduce((acc, a) => acc + a.puntos_apostados, 0)
  const totalGanado   = misApuestas.filter(a => a.resuelta && a.puntos_ganados).reduce((acc, a) => acc + a.puntos_ganados, 0)
  const totalPerdido  = misApuestas.filter(a => a.resuelta && !a.puntos_ganados).reduce((acc, a) => acc + a.puntos_apostados, 0)
  const enJuego       = misApuestas.filter(a => !a.resuelta).reduce((acc, a) => acc + a.puntos_apostados, 0)

  return (
    <div>
      <div className="marc-summary">
        <div className="marc-sum-item">
          <span className="marc-sum-val">{totalApostado.toLocaleString()}</span>
          <span className="marc-sum-lbl">apostado</span>
        </div>
        <div className="marc-sum-item green">
          <span className="marc-sum-val">+{totalGanado.toLocaleString()}</span>
          <span className="marc-sum-lbl">ganado</span>
        </div>
        <div className="marc-sum-item red">
          <span className="marc-sum-val">−{totalPerdido.toLocaleString()}</span>
          <span className="marc-sum-lbl">perdido</span>
        </div>
        <div className="marc-sum-item yellow">
          <span className="marc-sum-val">{enJuego.toLocaleString()}</span>
          <span className="marc-sum-lbl">en juego</span>
        </div>
      </div>

      <h2 className="marc-section-title">Historial</h2>
      {[...misApuestas].reverse().map(a => {
        const partido = partidos.find(p => p.id === a.partido_id)
        const ganada  = a.resuelta && a.puntos_ganados > 0
        const perdida = a.resuelta && !a.puntos_ganados
        return (
          <div key={a.id} className={`marc-hist-item ${ganada ? 'ganada' : perdida ? 'perdida' : 'pendiente'}`}>
            <div className="marc-hist-partido">
              {partido ? `${partido.equipo_local} vs ${partido.equipo_visitante}` : `Partido #${a.partido_id}`}
              {partido?.descripcion && <span className="marc-hist-desc"> · {partido.descripcion}</span>}
            </div>
            <div className="marc-hist-detalle">
              <span className="marc-hist-opcion">Opción <strong>{a.opcion}</strong></span>
              <span className="marc-hist-pts">{a.puntos_apostados.toLocaleString()} pts</span>
              <span className="marc-hist-cuota">×{a.cuota_al_apostar}</span>
              {ganada  && <span className="marc-hist-result green">+{(a.puntos_ganados - a.puntos_apostados).toLocaleString()} ✓</span>}
              {perdida && <span className="marc-hist-result red">−{a.puntos_apostados.toLocaleString()} ✗</span>}
              {!a.resuelta && <span className="marc-hist-result yellow">En juego…</span>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Tab Admin ──────────────────────────────────────────────────────────────
function TabAdmin({ partidos, onRefresh, onPuntosChange }) {
  const [form, setForm] = useState({ equipo_local:'', equipo_visitante:'', descripcion:'', fecha_inicio:'', cuota_1:'', cuota_x:'', cuota_2:'' })
  const [msg, setMsg] = useState('')
  const [resolv, setResolv] = useState({})

  async function crearPartido() {
    setMsg('')
    const { equipo_local, equipo_visitante, fecha_inicio, cuota_1, cuota_x, cuota_2 } = form
    if (!equipo_local || !equipo_visitante || !fecha_inicio || !cuota_1 || !cuota_x || !cuota_2)
      return setMsg('❌ Rellena todos los campos obligatorios')
    const { error } = await supabase.from('marcador_partidos').insert({
      equipo_local, equipo_visitante, descripcion: form.descripcion || null,
      fecha_inicio, cuota_1: parseFloat(cuota_1), cuota_x: parseFloat(cuota_x), cuota_2: parseFloat(cuota_2), estado: 'abierto',
    })
    if (error) setMsg('❌ ' + error.message)
    else { setMsg('✅ Partido creado'); setForm({ equipo_local:'', equipo_visitante:'', descripcion:'', fecha_inicio:'', cuota_1:'', cuota_x:'', cuota_2:'' }); onRefresh() }
  }

  async function resolverPartido(partido) {
    const r = resolv[partido.id]
    if (!r?.resultado) return
    const gl = parseInt(r.goles_local ?? 0)
    const gv = parseInt(r.goles_visitante ?? 0)

    await supabase.from('marcador_partidos').update({ estado:'resuelto', resultado:r.resultado, goles_local:gl, goles_visitante:gv }).eq('id', partido.id)

    const { data: apuestas } = await supabase.from('marcador_apuestas').select('*').eq('partido_id', partido.id).eq('resuelta', false)

    if (apuestas) {
      await Promise.all(apuestas.map(async a => {
        const gano   = a.opcion === r.resultado
        const ganado = gano ? Math.floor(a.puntos_apostados * a.cuota_al_apostar) : 0
        await supabase.from('marcador_apuestas').update({ resuelta:true, puntos_ganados:ganado }).eq('id', a.id)
        // Si gana: sumar lo ganado (el apostado ya se descontó al apostar, ahora devolvemos apostado+ganancia)
        if (gano) await onPuntosChange(a.user_id, ganado)
        // Si pierde: ya se descontó al apostar, no hay que hacer nada más
      }))
    }

    setMsg(`✅ Partido resuelto · ${r.resultado} (${gl}-${gv})`)
    onRefresh()
  }

  async function eliminarPartido(id) {
    if (!confirm('¿Eliminar este partido y todas sus apuestas?')) return
    await supabase.from('marcador_apuestas').delete().eq('partido_id', id)
    await supabase.from('marcador_partidos').delete().eq('id', id)
    onRefresh()
  }

  async function editarPartido(id) {
    const p = partidos.find(x => x.id === id)
    if (!p) return
    const local = prompt("Equipo local:", p.equipo_local)
    if (local === null) return
    const visitante = prompt("Equipo visitante:", p.equipo_visitante)
    if (visitante === null) return
    const desc = prompt("Descripcion:", p.descripcion || "")
    const c1 = prompt("Cuota 1 (local):", p.cuota_1)
    if (c1 === null) return
    const cx = prompt("Cuota X (empate):", p.cuota_x)
    if (cx === null) return
    const c2 = prompt("Cuota 2 (visitante):", p.cuota_2)
    if (c2 === null) return
    const { error } = await supabase.from("marcador_partidos").update({
      equipo_local: local, equipo_visitante: visitante, descripcion: desc || null,
      cuota_1: parseFloat(c1), cuota_x: parseFloat(cx), cuota_2: parseFloat(c2),
    }).eq("id", id)
    if (error) setMsg("Error al editar: " + error.message)
    else { setMsg("Partido editado"); onRefresh() }
  }

  return (
    <div>
      <h2 className="marc-section-title">➕ Crear partido</h2>
      <div className="marc-admin-form">
        <div className="marc-admin-row2">
          <input className="marc-input" placeholder="Equipo local *" value={form.equipo_local} onChange={e => setForm(f => ({...f, equipo_local:e.target.value}))} />
          <input className="marc-input" placeholder="Equipo visitante *" value={form.equipo_visitante} onChange={e => setForm(f => ({...f, equipo_visitante:e.target.value}))} />
        </div>
        <input className="marc-input" placeholder="Descripción (ej: Grupo A · Jornada 1)" value={form.descripcion} onChange={e => setForm(f => ({...f, descripcion:e.target.value}))} />
        <input className="marc-input" type="datetime-local" value={form.fecha_inicio} onChange={e => setForm(f => ({...f, fecha_inicio:e.target.value}))} />
        <div className="marc-admin-row3">
          <div className="marc-cuota-field"><label>Cuota 1 (local)</label><input className="marc-input" type="number" step="0.01" min="1" placeholder="ej: 2.10" value={form.cuota_1} onChange={e => setForm(f => ({...f, cuota_1:e.target.value}))} /></div>
          <div className="marc-cuota-field"><label>Cuota X (empate)</label><input className="marc-input" type="number" step="0.01" min="1" placeholder="ej: 3.20" value={form.cuota_x} onChange={e => setForm(f => ({...f, cuota_x:e.target.value}))} /></div>
          <div className="marc-cuota-field"><label>Cuota 2 (visitante)</label><input className="marc-input" type="number" step="0.01" min="1" placeholder="ej: 1.80" value={form.cuota_2} onChange={e => setForm(f => ({...f, cuota_2:e.target.value}))} /></div>
        </div>
        <button className="marc-admin-btn" onClick={crearPartido}>Crear partido</button>
        {msg && <p className="marc-msg">{msg}</p>}
      </div>

      <h2 className="marc-section-title" style={{marginTop:'2rem'}}>⚙️ Gestionar partidos</h2>
      {partidos.length === 0 && <p className="marc-empty">No hay partidos creados aún.</p>}
      {partidos.map(p => (
        <div key={p.id} className="marc-admin-item">
          <div className="marc-admin-item-head">
            <strong>{p.equipo_local} vs {p.equipo_visitante}</strong>
            <span className={`marc-badge ${estadoBadge(p.estado).cls}`}>{estadoBadge(p.estado).label}</span>
            {p.descripcion && <span className="marc-desc">{p.descripcion}</span>}
            <span className="marc-fecha">{formatFecha(p.fecha_inicio)}</span>
          </div>
          <div className="marc-admin-cuotas-row">
            <span>1: ×{p.cuota_1}</span><span>X: ×{p.cuota_x}</span><span>2: ×{p.cuota_2}</span>
          </div>
          {p.estado === 'resuelto' && (
            <p className="marc-admin-resolved">Resultado: <strong>{p.resultado}</strong> · {p.goles_local}–{p.goles_visitante}</p>
          )}
          {p.estado === 'cerrado' && (
            <div className="marc-resolver">
              <span className="marc-resolver-lbl">Introducir resultado:</span>
              <div className="marc-resolver-opts">
                {['1','X','2'].map(op => (
                  <button key={op}
                    className={`marc-res-btn ${resolv[p.id]?.resultado === op ? 'marc-res-sel' : ''}`}
                    onClick={() => setResolv(r => ({...r, [p.id]: {...(r[p.id]||{}), resultado:op}}))}>
                    {op}
                  </button>
                ))}
              </div>
              <div className="marc-resolver-score">
                <input className="marc-input marc-score-input" type="number" min="0" placeholder="Local"
                  value={resolv[p.id]?.goles_local ?? ''}
                  onChange={e => setResolv(r => ({...r, [p.id]: {...(r[p.id]||{}), goles_local:e.target.value}}))} />
                <span>–</span>
                <input className="marc-input marc-score-input" type="number" min="0" placeholder="Visit."
                  value={resolv[p.id]?.goles_visitante ?? ''}
                  onChange={e => setResolv(r => ({...r, [p.id]: {...(r[p.id]||{}), goles_visitante:e.target.value}}))} />
              </div>
              <button className="marc-admin-btn marc-resolver-btn"
                onClick={() => resolverPartido(p)}
                disabled={!resolv[p.id]?.resultado}>
                Resolver y repartir puntos
              </button>
            </div>
          )}
          <button className="marc-edit-btn" onClick={() => editarPartido(p.id)}>✏️ Editar</button> <button className="marc-delete-btn" onClick={() => eliminarPartido(p.id)}>Eliminar</button>
        </div>
      ))}
    </div>
  )
}

// ── Estilos ────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap');
  .marcador-root{--verde:#00e676;--rojo:#ff1744;--amarillo:#ffd600;--azul:#2979ff;--bg:#0a0a0f;--bg2:#12121a;--bg3:#1a1a26;--border:#2a2a3a;--text:#e8e8f0;--muted:#6b6b85;font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;max-width:900px;margin:0 auto;padding:0 0 4rem}
  .marc-header{background:linear-gradient(135deg,#0d0d1a 0%,#1a0a2e 50%,#0d1a0a 100%);border-bottom:1px solid var(--border);padding:1.2rem 1.5rem;display:flex;align-items:center;justify-content:space-between;gap:1rem}
  .marc-back{background:none;border:1px solid var(--border);color:var(--muted);border-radius:8px;padding:.4rem .8rem;cursor:pointer;font-size:.8rem;transition:color .2s}
  .marc-back:hover{color:var(--text)}
  .marc-header-center{display:flex;align-items:center;gap:.8rem;flex:1;justify-content:center}
  .marc-logo{font-size:2rem}
  .marc-title{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;letter-spacing:3px;background:linear-gradient(90deg,var(--verde),var(--amarillo));-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1;margin:0}
  .marc-subtitle{color:var(--muted);font-size:.75rem;margin:.2rem 0 0}
  .marc-stats{display:flex;gap:.6rem;flex-shrink:0}
  .marc-stat{text-align:right;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.4rem .7rem}
  .marc-stat-val{display:block;font-family:'Bebas Neue',sans-serif;font-size:1.2rem;line-height:1;color:var(--verde)}
  .marc-stat-risk .marc-stat-val{color:var(--amarillo)}
  .marc-stat-lbl{display:block;font-size:.6rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
  .marc-tabs{display:flex;border-bottom:1px solid var(--border);background:#0d0d16;padding:0 1.5rem;gap:.25rem}
  .marc-tab{background:none;border:none;color:var(--muted);font-family:'DM Sans',sans-serif;font-size:.85rem;font-weight:600;padding:.9rem 1rem;cursor:pointer;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}
  .marc-tab:hover{color:var(--text)}
  .marc-tab-active{color:var(--verde)!important;border-bottom-color:var(--verde)}
  .marc-main{padding:1.5rem}
  .marc-section-title{font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:2px;color:var(--muted);margin:0 0 1rem;text-transform:uppercase}
  .marc-empty{text-align:center;color:var(--muted);padding:3rem 1rem;font-size:.95rem;line-height:1.8}
  .marc-loading{text-align:center;color:var(--muted);padding:3rem}
  .marc-card{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.2rem;margin-bottom:1rem;transition:border-color .2s}
  .marc-card-abierto{border-color:#1a3a1a}.marc-card-abierto:hover{border-color:var(--verde)}
  .marc-card-cerrado{border-color:#3a1a1a}.marc-card-resuelto{border-color:#1a1a3a}
  .marc-card-head{display:flex;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.8rem}
  .marc-badge{font-size:.65rem;font-weight:700;letter-spacing:1.5px;padding:.2rem .6rem;border-radius:4px;text-transform:uppercase}
  .badge-open{background:#0d2b0d;color:var(--verde);border:1px solid #1a4a1a}
  .badge-closed{background:#2b0d0d;color:var(--rojo);border:1px solid #4a1a1a}
  .badge-resolved{background:#0d0d2b;color:var(--azul);border:1px solid #1a1a4a}
  .marc-desc{color:var(--muted);font-size:.8rem}
  .marc-fecha{color:var(--muted);font-size:.75rem;margin-left:auto}
  .marc-equipos{display:flex;align-items:center;justify-content:space-between;margin:.8rem 0 1rem;gap:.5rem}
  .marc-equipo{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:1px;flex:1}
  .marc-local{text-align:left}.marc-visitante{text-align:right}
  .marc-vs{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:.3rem .7rem;font-family:'Bebas Neue',sans-serif;font-size:.9rem;color:var(--muted);flex-shrink:0}
  .marc-resultado-final{font-family:'Bebas Neue',sans-serif;font-size:1.8rem;color:var(--verde);background:#0a200a;border:1px solid #1a4a1a;border-radius:8px;padding:.2rem 1rem;flex-shrink:0}
  .marc-cuotas{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.6rem;margin-bottom:.8rem}
  .marc-cuota-btn{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:.7rem .5rem;cursor:pointer;color:var(--text);font-family:'DM Sans',sans-serif;display:flex;flex-direction:column;align-items:center;gap:.15rem;transition:all .15s;position:relative}
  .marc-cuota-btn:hover:not(.marc-cuota-disabled){border-color:var(--amarillo);background:#1a1a0d}
  .marc-cuota-sel{border-color:var(--amarillo)!important;background:#1a1500!important}
  .marc-cuota-win{border-color:var(--verde)!important;background:#0a1a0a!important}
  .marc-cuota-disabled{cursor:default;opacity:.7}
  .marc-cuota-label{font-family:'Bebas Neue',sans-serif;font-size:1.2rem;color:var(--amarillo)}
  .marc-cuota-nombre{font-size:.7rem;color:var(--muted);text-align:center;line-height:1.2}
  .marc-cuota-valor{font-size:.95rem;font-weight:700}
  .marc-cuota-mis{font-size:.65rem;color:var(--azul);margin-top:.1rem}
  .marc-cuota-check{position:absolute;top:4px;right:6px;color:var(--verde);font-size:.9rem}
  .marc-bet-row{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.5rem}
  .marc-bet-input{flex:1;min-width:120px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.9rem;padding:.6rem .8rem}
  .marc-bet-input:focus{outline:none;border-color:var(--amarillo)}
  .marc-bet-preview{font-size:.8rem;color:var(--verde);font-weight:600;white-space:nowrap}
  .marc-bet-btn{background:var(--amarillo);color:#000;border:none;border-radius:8px;font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:1px;padding:.6rem 1.2rem;cursor:pointer;transition:opacity .15s}
  .marc-bet-btn:hover:not(:disabled){opacity:.85}
  .marc-bet-btn:disabled{opacity:.4;cursor:default}
  .marc-error{color:var(--rojo);font-size:.8rem;margin:.3rem 0 0}
  .marc-success{color:var(--verde);font-size:.8rem;margin:.3rem 0 0}
  .marc-mis-resumen{border-top:1px solid var(--border);margin-top:.8rem;padding-top:.7rem;display:flex;flex-wrap:wrap;gap:.4rem;align-items:center}
  .marc-mis-lbl{font-size:.7rem;color:var(--muted);width:100%}
  .marc-mis-item{font-size:.75rem;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:.2rem .5rem;color:var(--muted)}
  .marc-mis-item.ganada{border-color:#1a4a1a;color:var(--verde)}
  .marc-mis-item.perdida{border-color:#4a1a1a;color:var(--rojo)}
  .marc-summary{display:grid;grid-template-columns:repeat(4,1fr);gap:.8rem;margin-bottom:1.5rem}
  @media(max-width:500px){.marc-summary{grid-template-columns:1fr 1fr}}
  .marc-sum-item{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:.8rem;text-align:center}
  .marc-sum-item.green{border-color:#1a3a1a}.marc-sum-item.red{border-color:#3a1a1a}.marc-sum-item.yellow{border-color:#3a3a00}
  .marc-sum-val{display:block;font-family:'Bebas Neue',sans-serif;font-size:1.5rem;line-height:1}
  .marc-sum-item.green .marc-sum-val{color:var(--verde)}.marc-sum-item.red .marc-sum-val{color:var(--rojo)}.marc-sum-item.yellow .marc-sum-val{color:var(--amarillo)}
  .marc-sum-lbl{font-size:.65rem;color:var(--muted);text-transform:uppercase;letter-spacing:1px}
  .marc-hist-item{background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:.8rem 1rem;margin-bottom:.6rem}
  .marc-hist-item.ganada{border-color:#1a3a1a}.marc-hist-item.perdida{border-color:#3a1a1a}
  .marc-hist-partido{font-weight:600;font-size:.9rem;margin-bottom:.3rem}
  .marc-hist-desc{color:var(--muted);font-size:.8rem}
  .marc-hist-detalle{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;font-size:.8rem;color:var(--muted)}
  .marc-hist-opcion strong{color:var(--text)}.marc-hist-pts{font-weight:700;color:var(--text)}
  .marc-hist-result{font-weight:700;margin-left:auto}
  .marc-hist-result.green{color:var(--verde)}.marc-hist-result.red{color:var(--rojo)}.marc-hist-result.yellow{color:var(--amarillo)}
  .marc-admin-form{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:1.2rem;display:flex;flex-direction:column;gap:.7rem;margin-bottom:1rem}
  .marc-admin-row2{display:grid;grid-template-columns:1fr 1fr;gap:.7rem}
  .marc-admin-row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.7rem}
  @media(max-width:500px){.marc-admin-row2,.marc-admin-row3{grid-template-columns:1fr}}
  .marc-cuota-field{display:flex;flex-direction:column;gap:.3rem}
  .marc-cuota-field label{font-size:.75rem;color:var(--muted)}
  .marc-input{background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.9rem;padding:.6rem .8rem;width:100%;box-sizing:border-box}
  .marc-input:focus{outline:none;border-color:var(--verde)}
  .marc-admin-btn{background:var(--verde);color:#000;border:none;border-radius:8px;font-family:'Bebas Neue',sans-serif;font-size:1rem;letter-spacing:1px;padding:.7rem 1.5rem;cursor:pointer;align-self:flex-start;transition:opacity .15s}
  .marc-admin-btn:hover{opacity:.85}.marc-admin-btn:disabled{opacity:.4;cursor:default}
  .marc-msg{font-size:.85rem;margin:0}
  .marc-admin-item{background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:1rem;margin-bottom:.8rem}
  .marc-admin-item-head{display:flex;align-items:center;flex-wrap:wrap;gap:.5rem;margin-bottom:.5rem}
  .marc-admin-cuotas-row{display:flex;gap:1rem;font-size:.8rem;color:var(--muted);margin-bottom:.5rem}
  .marc-admin-resolved{font-size:.85rem;color:var(--azul);margin:.3rem 0}
  .marc-admin-resolved strong{color:var(--verde)}
  .marc-resolver{border:1px dashed var(--border);border-radius:8px;padding:.8rem;margin:.5rem 0;display:flex;flex-direction:column;gap:.6rem}
  .marc-resolver-lbl{font-size:.8rem;color:var(--muted)}
  .marc-resolver-opts{display:flex;gap:.5rem}
  .marc-res-btn{background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:'Bebas Neue',sans-serif;font-size:1.1rem;padding:.4rem .8rem;cursor:pointer;transition:all .15s}
  .marc-res-btn:hover{border-color:var(--amarillo)}
  .marc-res-sel{border-color:var(--verde)!important;color:var(--verde);background:#0a1a0a!important}
  .marc-resolver-score{display:flex;align-items:center;gap:.5rem}
  .marc-score-input{width:80px!important;text-align:center}
  .marc-delete-btn{background:none;border:1px solid #3a1a1a;color:var(--rojo);border-radius:6px;font-size:.75rem;padding:.3rem .7rem;cursor:pointer;margin-top:.3rem;transition:background .15s}
  .marc-delete-btn:hover{background:#1a0a0a}
  .marc-edit-btn{background:none;border:1px solid #1a3a3a;color:var(--azul);border-radius:6px;font-size:.75rem;padding:.3rem .7rem;cursor:pointer;margin-top:.3rem;margin-right:.4rem;transition:background .15s}
  .marc-edit-btn:hover{background:#0a1a2a}
`
