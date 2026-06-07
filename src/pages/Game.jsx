import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import {
  PARTIDOS_GRUPOS, PARTIDOS_ELIMINATORIAS, TODAS_LAS_FASES,
  JORNADAS_GRUPOS, calcPts, calcPtsClasificado, AVATARS, COLORS, GRUPOS, PTS_CLASIFICADO
} from '../lib/data.js'

const ALL_MATCHES = [...PARTIDOS_GRUPOS, ...PARTIDOS_ELIMINATORIAS]
const ELIM_FASES = ['dieciseisavos','octavos','cuartos','semis','final']

const LOCK_DATE = new Date('2026-06-11T18:00:00+02:00')
const isGloballyLocked = () => new Date() >= LOCK_DATE

export default function Game() {
  const { code } = useParams()
  const nav = useNavigate()

  const [group, setGroup]           = useState(null)
  const [players, setPlayers]       = useState([])
  const [myPlayer, setMyPlayer]     = useState(null)
  const [preds, setPreds]           = useState({})
  const [reales, setReales]         = useState({})
  const [allPreds, setAllPreds]     = useState({})
  const [extras, setExtras]         = useState({})
  const [extrasReal, setExtrasReal] = useState({})
  const [allExtras, setAllExtras]   = useState({})
  const [predClasif, setPredClasif] = useState({})
  const [realClasif, setRealClasif] = useState({})
  const [allPredClasif, setAllPredClasif] = useState({})
  const [tab, setTab]       = useState('quiniela')
  const [fase, setFase]     = useState('grupos')
  const [jornada, setJornada] = useState('J1')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const isCreator = group && myPlayer && group.creator_id === myPlayer.id
  const shareUrl  = `${window.location.origin}/unirse/${code}`
  const locked    = isGloballyLocked()

  useEffect(() => {
    const me = localStorage.getItem(`player_${code}`)
    if (!me) { nav(`/unirse/${code}`); return }
    setMyPlayer(JSON.parse(me))
    loadAll()
  }, [code])

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [grpRes, plRes, predsRes, realesRes] = await Promise.all([
        supabase.from('groups').select('*').eq('code', code).single(),
        supabase.from('players').select('*').eq('group_code', code),
        supabase.from('predictions').select('*').eq('group_code', code),
        supabase.from('results').select('*').eq('group_code', code),
      ])
      if (grpRes.data) {
        setGroup(grpRes.data)
        if (grpRes.data.extras_real) {
          const er = grpRes.data.extras_real
          setExtrasReal(er)
          if (er.clasif_elim) setRealClasif(er.clasif_elim)
        }
      }
      if (plRes.data) setPlayers(plRes.data)
      const rMap = {}
      realesRes.data?.forEach(r => { rMap[r.match_id] = { l: r.goals_local ?? '', v: r.goals_vis ?? '' } })
      setReales(rMap)
      const me = JSON.parse(localStorage.getItem(`player_${code}`) || '{}')
      const apMap = {}, myMap = {}, apClasif = {}
      predsRes.data?.forEach(p => {
        if (!apMap[p.player_id]) apMap[p.player_id] = {}
        apMap[p.player_id][p.match_id] = { l: p.goals_local ?? '', v: p.goals_vis ?? '' }
        if (p.player_id === me.id) myMap[p.match_id] = { l: p.goals_local ?? '', v: p.goals_vis ?? '' }
      })
      setAllPreds(apMap)
      setPreds(myMap)
      const allExtrasMap = {}
      plRes.data?.forEach(pl => {
        if (pl.extras_pred) {
          allExtrasMap[pl.id] = pl.extras_pred
          if (pl.extras_pred.clasif_elim) apClasif[pl.id] = pl.extras_pred.clasif_elim
          if (pl.id === me.id) {
            setExtras(pl.extras_pred)
            if (pl.extras_pred.clasif_elim) setPredClasif(pl.extras_pred.clasif_elim)
          }
        }
      })
      setAllExtras(allExtrasMap)
      setAllPredClasif(apClasif)
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [code])

  useEffect(() => {
    // Polling cada 5s en lugar de realtime para soportar muchos usuarios simultáneos
    const interval = setInterval(() => loadAll(), 5000)
    return () => clearInterval(interval)
  }, [code, loadAll])

  const saveTimer = useRef({})
  const savePred = (matchId, side, val) => {
    if (locked) return
    const clean = val.replace(/\D/g,'').slice(0,2)
    setPreds(p => ({ ...p, [matchId]: { ...(p[matchId]||{}), [side]: clean } }))
    clearTimeout(saveTimer.current[matchId])
    saveTimer.current[matchId] = setTimeout(async () => {
      const me = JSON.parse(localStorage.getItem(`player_${code}`) || '{}')
      const cur = { ...(preds[matchId]||{}), [side]: clean }
      await supabase.from('predictions').upsert({
        group_code: code, player_id: me.id, match_id: matchId,
        goals_local: cur.l !== '' ? parseInt(cur.l) : null,
        goals_vis:   cur.v !== '' ? parseInt(cur.v) : null,
      }, { onConflict:'group_code,player_id,match_id' })
    }, 600)
  }

  const saveReal = async (matchId, side, val) => {
    const clean = val.replace(/\D/g,'').slice(0,2)
    setReales(r => ({ ...r, [matchId]: { ...(r[matchId]||{}), [side]: clean } }))
    const cur = { ...(reales[matchId]||{}), [side]: clean }
    await supabase.from('results').upsert({
      group_code: code, match_id: matchId,
      goals_local: cur.l !== '' ? parseInt(cur.l) : null,
      goals_vis:   cur.v !== '' ? parseInt(cur.v) : null,
    }, { onConflict:'group_code,match_id' })
  }

  const clasifTimer = useRef(null)
  const savePredClasif = (matchId, equipo) => {
    if (locked) return
    const next = { ...predClasif, [matchId]: equipo }
    setPredClasif(next)
    clearTimeout(clasifTimer.current)
    clasifTimer.current = setTimeout(async () => {
      const me = JSON.parse(localStorage.getItem(`player_${code}`) || '{}')
      const newExtras = { ...extras, clasif_elim: next }
      setExtras(newExtras)
      await supabase.from('players').update({ extras_pred: newExtras }).eq('id', me.id)
    }, 600)
  }

  const saveRealClasif = async (matchId, equipo) => {
    const next = { ...realClasif, [matchId]: equipo }
    setRealClasif(next)
    const newExtrasReal = { ...extrasReal, clasif_elim: next }
    setExtrasReal(newExtrasReal)
    await supabase.from('groups').update({ extras_real: newExtrasReal }).eq('code', code)
  }

  const extrasTimer = useRef(null)
  const saveExtras = (newExtras) => {
    if (locked) return
    setExtras(newExtras)
    clearTimeout(extrasTimer.current)
    extrasTimer.current = setTimeout(async () => {
      const me = JSON.parse(localStorage.getItem(`player_${code}`) || '{}')
      await supabase.from('players').update({ extras_pred: newExtras }).eq('id', me.id)
    }, 800)
  }

  const saveExtrasReal = async (newExtrasReal) => {
    setExtrasReal(newExtrasReal)
    await supabase.from('groups').update({ extras_real: newExtrasReal }).eq('code', code)
  }

  const computeScore = (playerId) => {
    const pp = allPreds[playerId] || {}
    const pc = allPredClasif[playerId] || {}
    let pts = 0, exact = 0, result = 0, clasifAciertos = 0

    PARTIDOS_GRUPOS.forEach(m => {
      const pr = pp[m.id] || {}
      const re = reales[m.id] || {}
      const p = calcPts(pr.l ?? '', pr.v ?? '', re.l ?? '', re.v ?? '')
      if (p === 5) { pts += 5; exact++ }
      else if (p === 2) { pts += 2; result++ }
    })

    PARTIDOS_ELIMINATORIAS.forEach(m => {
      if (m.fase === 'tercero') return
      if (m.tercero && m.vis === '3?') return
      const predEq = pc[m.id] || ''
      const realEq = realClasif[m.id] || ''
      const p = calcPtsClasificado(predEq, realEq, m.fase)
      if (p > 0) { pts += p; clasifAciertos++ }
    })

    const ep = allExtras[playerId] || {}
    const er = extrasReal || {}
    if (er.balon   && ep.balon   && ep.balon.toLowerCase()   === er.balon.toLowerCase())   pts += 10
    if (er.bota    && ep.bota    && ep.bota.toLowerCase()    === er.bota.toLowerCase())    pts += 10
    if (er.portero && ep.portero && ep.portero.toLowerCase() === er.portero.toLowerCase()) pts += 10
    if (er.joven   && ep.joven   && ep.joven.toLowerCase()   === er.joven.toLowerCase())   pts += 10

    Object.keys(GRUPOS).forEach(grp => {
      if (er[`1_${grp}`] && ep[`1_${grp}`] && ep[`1_${grp}`].toLowerCase() === er[`1_${grp}`].toLowerCase()) pts += 2
      if (er[`2_${grp}`] && ep[`2_${grp}`] && ep[`2_${grp}`].toLowerCase() === er[`2_${grp}`].toLowerCase()) pts += 1
    })
    const realTerc = er.mejores_terceros || []
    const predTerc = ep.mejores_terceros || []
    predTerc.forEach(eq => { if (realTerc.map(e=>e.toLowerCase()).includes(eq.toLowerCase())) pts += 1 })

    return { pts, exact, result, clasifAciertos }
  }

  const ranking = [...players].map(p => ({ ...p, ...computeScore(p.id) })).sort((a,b) => b.pts-a.pts || b.exact-a.exact)
  const myScore = myPlayer ? computeScore(myPlayer.id) : { pts:0, exact:0, result:0, clasifAciertos:0 }
  const myRank  = ranking.findIndex(p => p.id === myPlayer?.id) + 1
  const completed = ALL_MATCHES.filter(m => reales[m.id]?.l !== '' && reales[m.id]?.l != null).length

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl).catch(()=>{})
    setCopied(true); setTimeout(() => setCopied(false), 2500)
  }
  const kickPlayer = async (playerId) => {
    if (!isCreator) return
    if (!window.confirm('¿Seguro?')) return
    await supabase.from('players').delete().eq('id', playerId)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:40 }}>⚽</div><div style={{ color:'#3a5070' }}>Cargando...</div>
    </div>
  )

  const matchesToShow = fase === 'grupos'
    ? PARTIDOS_GRUPOS.filter(m => m.jornada === jornada)
    : PARTIDOS_ELIMINATORIAS.filter(m => m.fase === fase)

  const mc = myPlayer?.color || '#e63946'

  const inpStyle = (filled, disabled) => ({
    width:'100%', padding:'10px 14px', borderRadius:10,
    border:`1px solid ${filled?'rgba(42,157,143,0.5)':'rgba(255,255,255,0.1)'}`,
    background: disabled?'rgba(255,255,255,0.03)':filled?'rgba(42,157,143,0.08)':'rgba(255,255,255,0.05)',
    color: disabled?'#3a5070':'#e8eaf0', fontSize:14, boxSizing:'border-box', outline:'none',
    cursor: disabled?'not-allowed':'text',
  })
  const realInpStyle = {
    width:'100%', padding:'8px 10px', borderRadius:8,
    border:'1px solid rgba(255,215,0,0.3)', background:'rgba(255,215,0,0.06)',
    color:'#ffd700', fontSize:13, boxSizing:'border-box', outline:'none', cursor:'pointer'
  }

  return (
    <div style={{ minHeight:'100vh', paddingBottom:80, position:'relative' }}>
      <div className="bg-dots" />

      {/* TOP BAR */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(8,12,20,.96)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'10px 16px' }}>
        <div style={{ maxWidth:640, margin:'0 auto', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => nav('/')} style={{ background:'none', border:'none', color:'#3a5070', cursor:'pointer', fontSize:20, padding:'0 8px 0 0' }}>←</button>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:'#e63946', letterSpacing:1 }}>QUINIELA</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>{group?.name}</div>
            <div style={{ fontSize:10, color:'#2a4060' }}>Código: <span style={{ color:'#e63946', fontWeight:700, letterSpacing:3 }}>{code}</span></div>
          </div>
          {locked && <span style={{ fontSize:10, color:'#f4a261', background:'rgba(244,162,97,0.12)', padding:'3px 8px', borderRadius:20, fontWeight:700 }}>🔒 Cerrado</span>}
          <button onClick={handleCopy} style={{ background:copied?'rgba(42,157,143,.2)':'rgba(255,255,255,.07)', border:`1px solid ${copied?'#2a9d8f':'rgba(255,255,255,.1)'}`, borderRadius:10, color:copied?'#2a9d8f':'#a0b4cc', padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:700 }}>
            {copied?'✓ Copiado':'📋 Compartir'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'0 12px' }}>

        {locked && (
          <div style={{ margin:'12px 0', padding:'10px 16px', background:'rgba(244,162,97,0.08)', border:'1px solid rgba(244,162,97,0.25)', borderRadius:12, fontSize:12, color:'#f4a261', textAlign:'center' }}>
            🔒 Predicciones cerradas desde 1h antes del primer partido.
          </div>
        )}

        {/* MY CARD */}
        {myPlayer && (
          <div style={{ background:`linear-gradient(135deg,${mc}20,${mc}08)`, border:`1px solid ${mc}44`, borderRadius:16, padding:'14px 18px', margin:'14px 0', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ fontSize:32, width:46, height:46, display:'flex', alignItems:'center', justifyContent:'center', background:`${mc}22`, borderRadius:12 }}>{myPlayer.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:17, color:mc }}>{myPlayer.name}</div>
              <div style={{ fontSize:11, color:'#2a4060' }}>{isCreator?'👑 Admin del grupo':`${players.length} jugadores`}</div>
            </div>
            <div style={{ textAlign:'center', marginRight:8 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, color:mc, lineHeight:1 }}>{myScore.pts}</div>
              <div style={{ fontSize:10, color:'#2a4060' }}>pts</div>
            </div>
            <div style={{ textAlign:'center' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, color:'#e8eaf0', lineHeight:1 }}>#{myRank}</div>
              <div style={{ fontSize:10, color:'#2a4060' }}>posición</div>
            </div>
          </div>
        )}

        {/* MAIN TABS */}
        <div style={{ display:'flex', gap:4, marginBottom:14, overflowX:'auto' }}>
          {[['quiniela','📝'],['extras','🎯'],['clasif','🗂️'],['ranking','🏅'],['tabla','📊'],['grupo','👥']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'10px 4px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background:tab===k?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)', color:tab===k?'#e8eaf0':'#2a4060', borderBottom:tab===k?`3px solid ${mc}`:'3px solid transparent', whiteSpace:'nowrap' }}>
              {l} {k==='clasif'?'Clasif.':k.charAt(0).toUpperCase()+k.slice(1)}
            </button>
          ))}
        </div>

        {/* ═══════════════ QUINIELA ═══════════════ */}
        {tab === 'quiniela' && (<>
          <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:4 }}>
            {TODAS_LAS_FASES.map(f => (
              <button key={f.key} onClick={() => setFase(f.key)} style={{ flexShrink:0, padding:'8px 14px', borderRadius:20, cursor:'pointer', fontWeight:700, fontSize:11, background:fase===f.key?`${mc}22`:'rgba(255,255,255,0.05)', color:fase===f.key?mc:'#2a4060', border:`1px solid ${fase===f.key?mc+'44':'transparent'}`, whiteSpace:'nowrap', outline:'none' }}>
                {f.label}
              </button>
            ))}
          </div>

          {fase === 'grupos' && (
            <div style={{ display:'flex', gap:6, marginBottom:14 }}>
              {JORNADAS_GRUPOS.map(j => (
                <button key={j.key} onClick={() => setJornada(j.key)} style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background:jornada===j.key?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)', color:jornada===j.key?'#e8eaf0':'#2a4060', borderBottom:jornada===j.key?`2px solid ${mc}`:'2px solid transparent' }}>
                  <div>{j.label}</div><div style={{ fontWeight:400, fontSize:9 }}>{j.dates}</div>
                </button>
              ))}
            </div>
          )}

          <div style={{ marginBottom:12, padding:'8px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, fontSize:11, color:'#2a6070' }}>
            {fase === 'grupos'
              ? '⚽ Resultado exacto: 5 pts · Ganador/empate: 2 pts'
              : fase === 'tercero' ? '🥉 3er puesto — no puntúa'
              : `${TODAS_LAS_FASES.find(f=>f.key===fase)?.label} — Acierta quién pasa: ${PTS_CLASIFICADO[fase]} pts`}
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'8px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10 }}>
            <span style={{ fontSize:11, color:'#2a4060' }}>Partidos jugados</span>
            <div style={{ flex:1, height:4, borderRadius:2, background:'#1a2a3a', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(completed/ALL_MATCHES.length)*100}%`, background:`linear-gradient(90deg,${mc},${mc}88)`, borderRadius:2 }} />
            </div>
            <span style={{ fontSize:11, fontWeight:700 }}>{completed}/{ALL_MATCHES.length}</span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {matchesToShow.map((m) => {
              const isElim = ELIM_FASES.includes(m.fase)
              const isTerceroFase = m.fase === 'tercero'
              const isTerceroPlaceholder = m.tercero && m.vis === '3?'
              const pl = preds[m.id]?.l ?? '', pv = preds[m.id]?.v ?? ''
              const rl = reales[m.id]?.l ?? '', rv = reales[m.id]?.v ?? ''
              const pts = !isElim ? calcPts(pl, pv, rl, rv) : null
              const hasReal = rl !== '' && rl != null
              const miPredEq = predClasif[m.id] || ''
              const realEq   = realClasif[m.id] || ''
              const ptsClas  = isElim && !isTerceroFase && !isTerceroPlaceholder ? calcPtsClasificado(miPredEq, realEq, m.fase) : 0
              const hasRealEq = !!realEq
              const hasPred = pl !== '' || pv !== '' || !!miPredEq

              const ptsBg = pts===5?'#2a9d8f':pts===2?'#f4a261':pts===0&&hasReal?'#e63946':ptsClas>0?'#2a9d8f':null
              const ptsLabel = pts===5?'⭐ 5 pts':pts===2?'✓ 2 pts':pts===0&&hasReal?'✗ 0 pts':ptsClas>0?`⭐ +${ptsClas} pts`:null

              const equiposReales = [m.local, m.vis].filter(e => e && e!=='3?' && !/^[GCS]\d/.test(e) && !e.includes('Ganador') && !e.includes('Perdedor'))

              return (
                <div key={m.id} style={{ background:hasPred?`${mc}0d`:'rgba(255,255,255,0.03)', border:`1px solid ${hasPred?mc+'33':'rgba(255,255,255,0.07)'}`, borderRadius:12, padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                    <span style={{ fontSize:10, color:'#2a4060', background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:20 }}>
                      {m.grupo?`Grupo ${m.grupo} · `:''}{m.fecha}
                    </span>
                    {locked && !hasReal && !hasRealEq && <span style={{ fontSize:10, color:'#f4a261', background:'rgba(244,162,97,0.12)', padding:'2px 8px', borderRadius:20 }}>🔒</span>}
                    {ptsBg && ptsLabel && <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#fff', background:ptsBg, padding:'2px 10px', borderRadius:20 }}>{ptsLabel}</span>}
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:isElim&&!isTerceroFase?10:0 }}>
                    <div style={{ flex:1, textAlign:'right', fontSize:13, fontWeight:700 }}>{m.local}</div>
                    {!isElim ? (
                      <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                        <input type="text" inputMode="numeric" maxLength={2} value={pl} onChange={e=>savePred(m.id,'l',e.target.value)} placeholder="–" readOnly={locked}
                          style={{ width:40, height:40, textAlign:'center', fontSize:20, fontWeight:900, borderRadius:8, border:`2px solid ${pl!==''?mc:locked?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.1)'}`, background:locked?'rgba(255,255,255,0.04)':`${mc}18`, color:locked?'#3a5070':mc, cursor:locked?'not-allowed':'text' }} />
                        <span style={{ color:'#1a2a3a', fontSize:18, fontWeight:900 }}>:</span>
                        <input type="text" inputMode="numeric" maxLength={2} value={pv} onChange={e=>savePred(m.id,'v',e.target.value)} placeholder="–" readOnly={locked}
                          style={{ width:40, height:40, textAlign:'center', fontSize:20, fontWeight:900, borderRadius:8, border:`2px solid ${pv!==''?mc:locked?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.1)'}`, background:locked?'rgba(255,255,255,0.04)':`${mc}18`, color:locked?'#3a5070':mc, cursor:locked?'not-allowed':'text' }} />
                      </div>
                    ) : (
                      <div style={{ fontSize:16, color:'#1a2a3a', fontWeight:900 }}>vs</div>
                    )}
                    <div style={{ flex:1, textAlign:'left', fontSize:13, fontWeight:700 }}>{m.vis==='3?'?'3º pendiente':m.vis}</div>
                  </div>

                  {/* Eliminatorias: quién pasa */}
                  {isElim && !isTerceroFase && !isTerceroPlaceholder && (
                    <div style={{ marginTop:8 }}>
                      <div style={{ fontSize:11, color:'#2a4060', marginBottom:6 }}>
                        ¿Quién pasa? <span style={{ color:mc, fontWeight:700 }}>+{PTS_CLASIFICADO[m.fase]} pts</span>
                      </div>
                      {equiposReales.length >= 2 ? (
                        <div style={{ display:'flex', gap:8 }}>
                          {equiposReales.map(eq => (
                            <button key={eq} onClick={() => !locked && savePredClasif(m.id, eq)}
                              style={{ flex:1, padding:'10px 8px', borderRadius:10, border:`2px solid ${miPredEq===eq?mc:'rgba(255,255,255,0.1)'}`, background:miPredEq===eq?`${mc}22`:'rgba(255,255,255,0.04)', color:miPredEq===eq?mc:'#8a9ab0', fontWeight:miPredEq===eq?700:400, fontSize:13, cursor:locked?'not-allowed':'pointer' }}>
                              {eq}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <input placeholder="Equipo que pasa..." value={miPredEq} readOnly={locked}
                          onChange={e => savePredClasif(m.id, e.target.value)}
                          style={inpStyle(!!miPredEq, locked)} />
                      )}
                      {hasRealEq && (
                        <div style={{ marginTop:6, fontSize:11, color:ptsClas>0?'#2a9d8f':'#e63946' }}>
                          {ptsClas>0 ? `⭐ ¡Acertaste! +${ptsClas} pts` : `Clasificado: ${realEq}`}
                        </div>
                      )}
                      {isCreator && (
                        <div style={{ marginTop:8, paddingTop:8, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize:11, color:'#ffd700', fontWeight:700, marginBottom:6 }}>✅ Admin — ¿Quién pasó realmente?</div>
                          {equiposReales.length >= 2 ? (
                            <div style={{ display:'flex', gap:6 }}>
                              {equiposReales.map(eq => (
                                <button key={eq} onClick={() => saveRealClasif(m.id, eq)}
                                  style={{ flex:1, padding:'6px 8px', borderRadius:8, border:`1.5px solid ${realEq===eq?'rgba(42,157,143,.6)':'rgba(255,215,0,0.2)'}`, background:realEq===eq?'rgba(42,157,143,.2)':'rgba(255,215,0,0.04)', color:realEq===eq?'#2a9d8f':'#ffd700', fontSize:12, cursor:'pointer', fontWeight:realEq===eq?700:400 }}>
                                  {eq}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <input placeholder="Equipo clasificado real" value={realEq}
                              onChange={e=>saveRealClasif(m.id,e.target.value)}
                              style={{ ...realInpStyle, marginTop:4 }} />
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {isTerceroPlaceholder && (
                    <div style={{ textAlign:'center', padding:'8px 0', fontSize:12, color:'#2a4060' }}>
                      ⏳ Cruce pendiente — se define tras la fase de grupos
                    </div>
                  )}
                  {isTerceroFase && (
                    <div style={{ textAlign:'center', padding:'6px 0', fontSize:11, color:'#2a4060' }}>🥉 3er puesto — no puntúa</div>
                  )}

                  {/* Resultado real grupos */}
                  {!isElim && (
                    isCreator ? (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize:11, color:'#2a9d8f', fontWeight:700 }}>✅ Real:</span>
                        <input type="text" inputMode="numeric" maxLength={2} value={rl} onChange={e=>saveReal(m.id,'l',e.target.value)} style={{ width:34, height:30, textAlign:'center', fontSize:14, fontWeight:700, borderRadius:6, border:'1.5px solid rgba(42,157,143,.4)', background:'rgba(42,157,143,.12)', color:'#2a9d8f' }} />
                        <span style={{ color:'#2a9d8f' }}>:</span>
                        <input type="text" inputMode="numeric" maxLength={2} value={rv} onChange={e=>saveReal(m.id,'v',e.target.value)} style={{ width:34, height:30, textAlign:'center', fontSize:14, fontWeight:700, borderRadius:6, border:'1.5px solid rgba(42,157,143,.4)', background:'rgba(42,157,143,.12)', color:'#2a9d8f' }} />
                      </div>
                    ) : (
                      <div style={{ textAlign:'center', marginTop:8 }}>
                        {hasReal
                          ? <span style={{ fontSize:11, color:'#2a9d8f', background:'rgba(42,157,143,.12)', padding:'2px 12px', borderRadius:20 }}>✅ {rl} – {rv}</span>
                          : <span style={{ fontSize:11, color:'#2a4060', background:'rgba(255,255,255,.04)', padding:'2px 12px', borderRadius:20 }}>⏳ Pendiente</span>}
                      </div>
                    )
                  )}
                </div>
              )
            })}
          </div>
        </>)}

        {/* ═══════════════ EXTRAS ═══════════════ */}
        {tab === 'extras' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:locked?'rgba(244,162,97,0.06)':'rgba(255,255,255,0.03)', border:locked?'1px solid rgba(244,162,97,0.2)':'none', borderRadius:12, padding:'12px 16px', fontSize:12, color:locked?'#f4a261':'#2a6070' }}>
              {locked?'🔒 Predicciones cerradas.':'🎯 Predicciones especiales — 10 pts cada una.'}
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:15, color:'#e8eaf0', marginBottom:14 }}>🏆 Premios individuales · 10 pts c/u</div>
              {[
                { key:'balon',   label:'🥇 Balón de Oro',       ph:'Nombre del jugador...' },
                { key:'bota',    label:'👟 Bota de Oro',         ph:'Nombre del jugador...' },
                { key:'portero', label:'🧤 Guante de Oro',       ph:'Nombre del portero...' },
                { key:'joven',   label:'🌟 Mejor jugador joven', ph:'Nombre del jugador...' },
              ].map(({ key, label, ph }) => {
                const myVal=extras[key]||'', realVal=extrasReal[key]||''
                const hit=realVal&&myVal&&myVal.toLowerCase()===realVal.toLowerCase()
                return (
                  <div key={key} style={{ marginBottom:14 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:hit?'#2a9d8f':'#a0b4cc' }}>{label}</span>
                      <span style={{ fontSize:11, color:'#2a4060' }}>+10 pts</span>
                    </div>
                    <input placeholder={locked?(myVal||'Sin predicción'):ph} value={myVal}
                      onChange={e=>saveExtras({...extras,[key]:e.target.value})} readOnly={locked}
                      style={inpStyle(!!myVal,locked)} />
                    {realVal && <div style={{ fontSize:11, color:hit?'#2a9d8f':'#e63946', marginTop:4 }}>
                      {hit?'⭐ ¡Acertado! +10 pts':`Real: ${realVal}`}
                    </div>}
                    {isCreator && (
                      <input placeholder={`Admin — ${label} real`} value={realVal}
                        onChange={e=>saveExtrasReal({...extrasReal,[key]:e.target.value})}
                        style={{ ...realInpStyle, marginTop:6 }} />
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#e8eaf0', marginBottom:12 }}>👥 Predicciones de todos</div>
              {players.map(pl => {
                const ep=allExtras[pl.id]||{}
                const items=[ep.balon&&`🥇 ${ep.balon}`,ep.bota&&`👟 ${ep.bota}`,ep.portero&&`🧤 ${ep.portero}`,ep.joven&&`🌟 ${ep.joven}`].filter(Boolean)
                return (
                  <div key={pl.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:18 }}>{pl.avatar}</span>
                      <span style={{ fontWeight:700, color:pl.color, fontSize:13 }}>{pl.name}</span>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {items.length>0?items.map((item,i)=>(
                        <span key={i} style={{ fontSize:11, background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:20, color:'#8a9ab0' }}>{item}</span>
                      )):<span style={{ fontSize:11, color:'#2a4060' }}>Sin predicciones</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ═══════════════ CLASIFICACIÓN ═══════════════ */}
        {tab === 'clasif' && (() => {
          const myClasif=extras, realClas=extrasReal
          const realTerc=realClas.mejores_terceros||[], predTerc=myClasif.mejores_terceros||[]
          const toggleTercero=(equipo)=>{
            if(locked) return
            const cur=myClasif.mejores_terceros||[]
            const next=cur.includes(equipo)?cur.filter(e=>e!==equipo):cur.length<8?[...cur,equipo]:cur
            saveExtras({...myClasif,mejores_terceros:next})
          }
          const standings={}
          Object.entries(GRUPOS).forEach(([grp,teams])=>{ standings[grp]=teams.map(t=>({name:t,pts:0,gf:0,gc:0})) })
          PARTIDOS_GRUPOS.forEach(m=>{
            const rl=reales[m.id]?.l,rv=reales[m.id]?.v
            if(rl==null||rv==null||rl===''||rv==='') return
            const gl=parseInt(rl),gv=parseInt(rv),grpArr=standings[m.grupo]; if(!grpArr) return
            const local=grpArr.find(t=>t.name===m.local),vis=grpArr.find(t=>t.name===m.vis); if(!local||!vis) return
            local.gf+=gl;local.gc+=gv;vis.gf+=gv;vis.gc+=gl
            if(gl>gv)local.pts+=3; else if(gl<gv)vis.pts+=3; else{local.pts++;vis.pts++}
          })
          const tercerosPorGrupo={}
          Object.entries(standings).forEach(([grp,teams])=>{
            const sorted=[...teams].sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)||b.gf-a.gf)
            tercerosPorGrupo[grp]=sorted[2]?.name||GRUPOS[grp][2]
          })
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ background:locked?'rgba(244,162,97,0.06)':'rgba(255,255,255,0.03)', border:locked?'1px solid rgba(244,162,97,0.2)':'none', borderRadius:12, padding:'12px 16px', fontSize:12, color:locked?'#f4a261':'#2a6070' }}>
                {locked?'🔒 Predicciones cerradas.':'🗂️ 1º grupo: 2 pts · 2º grupo: 1 pt · Tercero clasificado: 1 pt'}
              </div>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16 }}>
                <div style={{ fontWeight:700, fontSize:15, color:'#e8eaf0', marginBottom:14 }}>🏆 1º y 2º de cada grupo</div>
                {Object.entries(GRUPOS).map(([grp,equipos])=>{
                  const r1=realClas[`1_${grp}`]||'',r2=realClas[`2_${grp}`]||''
                  const p1=myClasif[`1_${grp}`]||'',p2=myClasif[`2_${grp}`]||''
                  const h1=r1&&p1&&p1.toLowerCase()===r1.toLowerCase()
                  const h2=r2&&p2&&p2.toLowerCase()===r2.toLowerCase()
                  return (
                    <div key={grp} style={{ marginBottom:16, paddingBottom:16, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize:12, fontWeight:700, color:mc, marginBottom:6 }}>GRUPO {grp} — {equipos.join(' · ')}</div>
                      <div style={{ display:'flex', gap:8 }}>
                        {[['1',p1,r1,h1,2],['2',p2,r2,h2,1]].map(([pos,pred,real,hit,pts])=>(
                          <div key={pos} style={{ flex:1 }}>
                            <div style={{ fontSize:10, color:hit?'#2a9d8f':'#2a4060', marginBottom:4, fontWeight:700 }}>
                              {pos==='1'?'🥇':'🥈'} {pos}º +{pts}pt {hit&&'⭐'}
                            </div>
                            <select value={pred} onChange={e=>!locked&&saveExtras({...myClasif,[`${pos}_${grp}`]:e.target.value})} disabled={locked}
                              style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:`1px solid ${pred?'rgba(42,157,143,0.5)':'rgba(255,255,255,0.1)'}`, background:locked?'rgba(255,255,255,0.03)':pred?'rgba(42,157,143,0.08)':'rgba(255,255,255,0.05)', color:locked?'#3a5070':'#e8eaf0', fontSize:13, cursor:locked?'not-allowed':'pointer', outline:'none' }}>
                              <option value="">— Elige —</option>
                              {equipos.map(eq=><option key={eq} value={eq}>{eq}</option>)}
                            </select>
                            {real&&!hit&&<div style={{ fontSize:10, color:'#e63946', marginTop:3 }}>Real: {real}</div>}
                            {isCreator&&(
                              <select value={real} onChange={e=>saveExtrasReal({...realClas,[`${pos}_${grp}`]:e.target.value})} style={{ ...realInpStyle, marginTop:6 }}>
                                <option value="">Admin — {pos}º real</option>
                                {equipos.map(eq=><option key={eq} value={eq}>{eq}</option>)}
                              </select>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16 }}>
                <div style={{ fontWeight:700, fontSize:15, color:'#e8eaf0', marginBottom:4 }}>🎯 8 mejores terceros · 1 pt c/u</div>
                <div style={{ fontSize:11, color:'#2a4060', marginBottom:12 }}>
                  {!locked&&<span style={{ color:predTerc.length===8?'#2a9d8f':'#f4a261' }}>{predTerc.length}/8 seleccionados — </span>}
                  Toca para seleccionar
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {Object.entries(GRUPOS).map(([grp])=>{
                    const eq=tercerosPorGrupo[grp]
                    const isSel=predTerc.includes(eq),isReal=realTerc.includes(eq),isHit=isSel&&isReal
                    return (
                      <div key={grp} onClick={()=>toggleTercero(eq)}
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, border:`1px solid ${isHit?'rgba(42,157,143,0.4)':isSel?`${mc}44`:'rgba(255,255,255,0.07)'}`, background:isHit?'rgba(42,157,143,0.08)':isSel?`${mc}10`:'rgba(255,255,255,0.02)', cursor:locked?'default':'pointer', opacity:(!locked&&predTerc.length>=8&&!isSel)?0.4:1 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#2a4060', width:22 }}>G{grp}</div>
                        <div style={{ flex:1, fontSize:13, fontWeight:isSel?700:400, color:isHit?'#2a9d8f':isSel?mc:'#8a9ab0' }}>{eq}</div>
                        <div style={{ fontSize:10, color:'#2a4060' }}>3º actual</div>
                        {isSel&&<div style={{ width:20, height:20, borderRadius:'50%', background:isHit?'#2a9d8f':mc, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#fff', fontWeight:700 }}>{isHit?'⭐':'✓'}</div>}
                      </div>
                    )
                  })}
                </div>
                {isCreator&&(
                  <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize:12, color:'#ffd700', fontWeight:700, marginBottom:8 }}>👑 Admin — Marcar los 8 terceros reales</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {Object.entries(tercerosPorGrupo).map(([grp,eq])=>{
                        const isMarked=realTerc.includes(eq)
                        return (
                          <button key={grp} onClick={()=>{
                            const next=isMarked?realTerc.filter(e=>e!==eq):realTerc.length<8?[...realTerc,eq]:realTerc
                            saveExtrasReal({...realClas,mejores_terceros:next})
                          }} style={{ padding:'5px 10px', borderRadius:20, border:`1px solid ${isMarked?'rgba(42,157,143,0.5)':'rgba(255,255,255,0.1)'}`, background:isMarked?'rgba(42,157,143,0.15)':'rgba(255,255,255,0.04)', color:isMarked?'#2a9d8f':'#4a6080', fontSize:11, cursor:'pointer', fontWeight:isMarked?700:400 }}>
                            {isMarked?'✓ ':''}{eq}
                          </button>
                        )
                      })}
                    </div>
                    <div style={{ fontSize:10, color:'#2a4060', marginTop:6 }}>{realTerc.length}/8 marcados</div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

        {/* ═══════════════ RANKING ═══════════════ */}
        {tab === 'ranking' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ textAlign:'center', fontSize:11, color:'#2a4060', marginBottom:8 }}>Clasificación en vivo</div>
            {ranking.map((pl,rank)=>{
              const isMe=pl.id===myPlayer?.id
              const medal=['🥇','🥈','🥉'][rank]||`${rank+1}º`
              return (
                <div key={pl.id} style={{ background:isMe?`${pl.color}18`:'rgba(255,255,255,0.04)', border:`1px solid ${isMe?pl.color+'44':'rgba(255,255,255,0.07)'}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:24, width:34, textAlign:'center' }}>{medal}</div>
                  <div style={{ fontSize:26, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:`${pl.color}22`, borderRadius:10 }}>{pl.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:isMe?pl.color:'#c8d8ea' }}>{pl.name}{isMe?' (tú)':''}</div>
                    <div style={{ display:'flex', gap:10, marginTop:3, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, color:'#2a9d8f' }}>⭐ {pl.exact} exactos</span>
                      <span style={{ fontSize:11, color:'#f4a261' }}>✓ {pl.result} resultados</span>
                      {pl.clasifAciertos>0&&<span style={{ fontSize:11, color:'#9b5de5' }}>🏅 {pl.clasifAciertos} clasif.</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:pl.color, lineHeight:1 }}>{pl.pts}</div>
                    <div style={{ fontSize:10, color:'#2a4060' }}>pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ═══════════════ TABLA ═══════════════ */}
        {tab === 'tabla' && (() => {
          const standings={}
          Object.entries(GRUPOS).forEach(([grp,teams])=>{ standings[grp]=teams.map(t=>({name:t,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,pts:0})) })
          PARTIDOS_GRUPOS.forEach(m=>{
            const rl=reales[m.id]?.l,rv=reales[m.id]?.v
            if(rl==null||rv==null||rl===''||rv==='') return
            const gl=parseInt(rl),gv=parseInt(rv),grpArr=standings[m.grupo]; if(!grpArr) return
            const local=grpArr.find(t=>t.name===m.local),vis=grpArr.find(t=>t.name===m.vis); if(!local||!vis) return
            local.pj++;vis.pj++;local.gf+=gl;local.gc+=gv;vis.gf+=gv;vis.gc+=gl
            if(gl>gv){local.pg++;local.pts+=3;vis.pp++} else if(gl<gv){vis.pg++;vis.pts+=3;local.pp++} else{local.pe++;local.pts++;vis.pe++;vis.pts++}
          })
          const GC=['#e63946','#f4a261','#2a9d8f','#457b9d','#9b5de5','#e9c46a','#06d6a0','#ef476f','#118ab2','#ffd166','#e63946','#2a9d8f']
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {Object.entries(standings).map(([grp,teams],gi)=>{
                const sorted=[...teams].sort((a,b)=>b.pts-a.pts||(b.gf-b.gc)-(a.gf-a.gc)||b.gf-a.gf)
                const gc=GC[gi%GC.length]
                return (
                  <div key={grp} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden' }}>
                    <div style={{ background:`${gc}22`, borderBottom:`1px solid ${gc}44`, padding:'10px 16px', display:'flex', alignItems:'center' }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:gc }}>GRUPO {grp}</div>
                      <div style={{ fontSize:11, color:'#2a4060', marginLeft:'auto' }}>PJ·PG·PE·PP·GF·GC·Pts</div>
                    </div>
                    {sorted.map((t,ti)=>(
                      <div key={t.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', background:ti<2?`${gc}08`:'transparent' }}>
                        <div style={{ fontSize:12, fontWeight:700, color:ti===0?'#ffd700':ti===1?'#c0c0c0':'#2a4060', width:16, textAlign:'center' }}>
                          {ti===0?'🥇':ti===1?'🥈':ti===2?'🥉':`${ti+1}`}
                        </div>
                        <div style={{ flex:1, fontSize:13, fontWeight:ti<2?700:400, color:ti<2?'#e8eaf0':'#8a9ab0' }}>{t.name}</div>
                        {[t.pj,t.pg,t.pe,t.pp,t.gf,t.gc,t.pts].map((v,i)=>(
                          <div key={i} style={{ width:22, textAlign:'center', fontSize:12, fontWeight:i===6?700:400, color:i===6?(t.pts>0?gc:'#2a4060'):'#4a6080' }}>{v}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* ═══════════════ GRUPO ═══════════════ */}
        {tab === 'grupo' && (
          <div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16, marginBottom:14 }}>
              <div style={{ fontSize:13, color:'#2a7070', marginBottom:4 }}>Nombre del grupo</div>
              <div style={{ fontWeight:700, fontSize:18 }}>{group?.name}</div>
              <div style={{ fontSize:12, color:'#2a4060', marginTop:2 }}>{players.length} jugadores · {completed}/{ALL_MATCHES.length} partidos jugados</div>
              <div style={{ marginTop:18, padding:16, background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,.2)', borderRadius:12, textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#2a4060', marginBottom:6, letterSpacing:3, textTransform:'uppercase' }}>Enlace para compartir</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:'#e63946', letterSpacing:6, marginBottom:6 }}>{code}</div>
                <div style={{ fontSize:11, color:'#2a4060', marginBottom:12, wordBreak:'break-all' }}>{shareUrl}</div>
                <button onClick={handleCopy} style={{ padding:'8px 20px', fontSize:13, background:'none', border:`1px solid ${copied?'#2a9d8f':'rgba(255,255,255,.12)'}`, borderRadius:8, color:copied?'#2a9d8f':'#a0b4cc', cursor:'pointer' }}>
                  {copied?'✓ ¡Copiado!':'📋 Copiar enlace'}
                </button>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16, marginBottom:14 }}>
              <div style={{ fontSize:13, color:'#2a7070', marginBottom:12 }}>Jugadores ({players.length})</div>
              {players.map(pl=>(
                <div key={pl.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize:20, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:`${pl.color}22`, borderRadius:8 }}>{pl.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:pl.id===myPlayer?.id?pl.color:'#c8d8ea' }}>{pl.name} {pl.id===myPlayer?.id?'(tú)':''}</div>
                    {pl.id===group?.creator_id&&<div style={{ fontSize:10, color:'#f4a261' }}>👑 Admin</div>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:pl.color }} />
                    {isCreator&&pl.id!==myPlayer?.id&&(
                      <button onClick={()=>kickPlayer(pl.id)} style={{ background:'rgba(230,57,70,0.12)', border:'1px solid rgba(230,57,70,0.3)', borderRadius:6, color:'#e63946', fontSize:11, padding:'3px 8px', cursor:'pointer', fontWeight:600 }}>Echar</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={()=>{ localStorage.removeItem(`player_${code}`); nav('/') }}
              style={{ width:'100%', padding:12, background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#4a6080', cursor:'pointer', fontSize:14 }}>
              🚪 Salir del grupo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
