import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import {
  PARTIDOS_GRUPOS, PARTIDOS_ELIMINATORIAS, TODAS_LAS_FASES,
  JORNADAS_GRUPOS, calcPts, calcPtsClasificado, AVATARS, COLORS, GRUPOS, PTS_CLASIFICADO
} from '../lib/data.js'

const ALL_MATCHES = [...PARTIDOS_GRUPOS, ...PARTIDOS_ELIMINATORIAS]
const ELIM_FASES = ['dieciseisavos','octavos','cuartos','semis','tercero','final']
const LOCK_DATE = new Date('2026-06-11T18:00:00+02:00')
const isGloballyLocked = () => new Date() >= LOCK_DATE
const ADMIN_UIDS = ['2f506ea7-bb8a-4e5e-bf90-2816fcd73fe1']
const DISEC_IDS = [101,102,103,104,105,106,107,108,113,114,115,116,117,118,119,120]
const OCT_IDS = [201,202,203,204,205,206,207,208]
const CUA_IDS = [301,302,303,304]
const SEMI_IDS = [401,402]

function getSuperAdminId() {
  try {
    const token = localStorage.getItem('sb-flawyripybuhifswlipm-auth-token')
    if (token) { const p = JSON.parse(token); if (p && p.user && p.user.id) return p.user.id }
  } catch(e) {}
  return null
}

function calcStandingsFromReales(reales) {
  const sv = {}
  const grpKeys = Object.keys(GRUPOS)
  for (let gi = 0; gi < grpKeys.length; gi++) {
    const grp = grpKeys[gi]
    const teams = GRUPOS[grp]
    sv[grp] = []
    for (let ti = 0; ti < teams.length; ti++) {
      sv[grp].push({ name: teams[ti], pts: 0, gf: 0, gc: 0 })
    }
  }
  for (let mi = 0; mi < PARTIDOS_GRUPOS.length; mi++) {
    const m = PARTIDOS_GRUPOS[mi]
    const r = reales[m.id]
    if (!r) continue
    const rl = r.l
    const rv = r.v
    if (rl === '' || rl == null || rv === '' || rv == null) continue
    const gl = parseInt(rl)
    const gv = parseInt(rv)
    const grpArr = sv[m.grupo]
    if (!grpArr) continue
    let local = null, vis = null
    for (let ti = 0; ti < grpArr.length; ti++) {
      if (grpArr[ti].name === m.local) local = grpArr[ti]
      if (grpArr[ti].name === m.vis) vis = grpArr[ti]
    }
    if (!local || !vis) continue
    local.gf = local.gf + gl
    local.gc = local.gc + gv
    vis.gf = vis.gf + gv
    vis.gc = vis.gc + gl
    if (gl > gv) { local.pts = local.pts + 3 }
    else if (gl < gv) { vis.pts = vis.pts + 3 }
    else { local.pts = local.pts + 1; vis.pts = vis.pts + 1 }
  }
  return sv
}

function resolverPlaceholder(placeholder, realClasif, standingsVivo) {
  if (!placeholder) return placeholder
  if (placeholder === 'Perdedor SF1' || placeholder === 'Perdedor SF2') {
    const semiId = placeholder === 'Perdedor SF1' ? 401 : 402
    const ganador = realClasif[semiId]
    if (!ganador) return placeholder
    const semi = PARTIDOS_ELIMINATORIAS.find(function(m) { return m.id === semiId })
    if (!semi) return placeholder
    const eq1 = resolverPlaceholder(semi.local, realClasif, standingsVivo)
    const eq2 = resolverPlaceholder(semi.vis, realClasif, standingsVivo)
    if (eq1 === ganador) return eq2
    if (eq2 === ganador) return eq1
    return placeholder
  }
  const grpMatch = placeholder.match(/^([1-4])([A-L])$/)
  if (grpMatch) {
    const pos = parseInt(grpMatch[1]) - 1
    const grp = grpMatch[2]
    const grpArr = standingsVivo[grp]
    if (!grpArr) return placeholder
    const sorted = grpArr.slice().sort(function(a, b) {
      if (b.pts !== a.pts) return b.pts - a.pts
      const gdB = b.gf - b.gc, gdA = a.gf - a.gc
      if (gdB !== gdA) return gdB - gdA
      if (b.gf !== a.gf) return b.gf - a.gf
      return a.name.localeCompare(b.name)
    })
    return (sorted[pos] && sorted[pos].name) ? sorted[pos].name : placeholder
  }
  const gMatch = placeholder.match(/^G(\d+)$/)
  if (gMatch) {
    const idx = parseInt(gMatch[1]) - 1
    const pid = DISEC_IDS[idx]
    return realClasif[pid] || placeholder
  }
  const cMatch = placeholder.match(/^C(\d+)$/)
  if (cMatch) {
    const idx = parseInt(cMatch[1]) - 1
    const pid = OCT_IDS[idx]
    return realClasif[pid] || placeholder
  }
  const sMatch = placeholder.match(/^S(\d+)$/)
  if (sMatch) {
    const idx = parseInt(sMatch[1]) - 1
    const pid = CUA_IDS[idx]
    return realClasif[pid] || placeholder
  }
  if (placeholder === 'Ganador SF1') return realClasif[SEMI_IDS[0]] || placeholder
  if (placeholder === 'Ganador SF2') return realClasif[SEMI_IDS[1]] || placeholder
  return placeholder
}

function esPlaceholder(e) {
  if (!e || e === '3?') return true
  if (/^[GCS]\d/.test(e)) return true
  if (e.indexOf('Ganador') >= 0 || e.indexOf('Perdedor') >= 0) return true
  return false
}

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
  const [grupoFiltro, setGrupoFiltro] = useState('A')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [globalRanking, setGlobalRanking] = useState([])
  const [loadingGlobal, setLoadingGlobal] = useState(false)

  const myAuthId = getSuperAdminId()
  const isSuperAdmin = ADMIN_UIDS.indexOf(myAuthId) >= 0
  const isCreator = group && myPlayer && group.creator_id === myPlayer.id
  const shareUrl = window.location.origin + '/unirse/' + code
  const locked = isGloballyLocked()

  const standingsVivo = calcStandingsFromReales(reales)
  const standingsJugador = calcStandingsFromReales(preds)

  const mejoresTerceros = (function() {
    const totalGrupos = PARTIDOS_GRUPOS.length
    const predCompletas = PARTIDOS_GRUPOS.filter(function(m) {
      const pr = preds[m.id]
      return pr && pr.l !== '' && pr.l != null && pr.v !== '' && pr.v != null
    }).length
    const realesCompletos = PARTIDOS_GRUPOS.filter(function(m) {
      const r = reales[m.id]
      return r && r.l !== '' && r.l != null && r.v !== '' && r.v != null
    }).length
    const fuenteCompleta = predCompletas === totalGrupos ? 'preds' : realesCompletos === totalGrupos ? 'reales' : null
    if (!fuenteCompleta) return []
    const sv = {}
    const gks = Object.keys(GRUPOS)
    for (let gi = 0; gi < gks.length; gi++) {
      const grp = gks[gi]
      sv[grp] = GRUPOS[grp].map(function(t) { return { name: t, pts: 0, gf: 0, gc: 0 } })
    }
    PARTIDOS_GRUPOS.forEach(function(m) {
      const r = fuenteCompleta === 'preds' ? preds[m.id] : reales[m.id]
      if (!r) return
      const rl = r.l, rv = r.v
      if (rl == null || rl === '' || rv == null || rv === '') return
      const gl = parseInt(rl), gv = parseInt(rv)
      const arr = sv[m.grupo]
      if (!arr) return
      let loc = null, vis = null
      for (let ti = 0; ti < arr.length; ti++) {
        if (arr[ti].name === m.local) loc = arr[ti]
        if (arr[ti].name === m.vis) vis = arr[ti]
      }
      if (!loc || !vis) return
      loc.gf += gl; loc.gc += gv; vis.gf += gv; vis.gc += gl
      if (gl > gv) { loc.pts += 3 }
      else if (gl < gv) { vis.pts += 3 }
      else { loc.pts += 1; vis.pts += 1 }
    })
    const terceros = []
    for (let gi = 0; gi < gks.length; gi++) {
      const grp = gks[gi]
      const arr = sv[grp]
      if (!arr) continue
      const sorted = arr.slice().sort(function(a, b) {
        if (b.pts !== a.pts) return b.pts - a.pts
        const gdB = b.gf - b.gc, gdA = a.gf - a.gc
        if (gdB !== gdA) return gdB - gdA
        if (b.gf !== a.gf) return b.gf - a.gf
        return a.name.localeCompare(b.name)
      })
      if (sorted[2]) terceros.push({ name: sorted[2].name, pts: sorted[2].pts, gd: sorted[2].gf - sorted[2].gc, gf: sorted[2].gf })
    }
    terceros.sort(function(a, b) {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd !== a.gd) return b.gd - a.gd
      if (b.gf !== a.gf) return b.gf - a.gf
      return a.name.localeCompare(b.name)
    })
    return terceros.slice(0, 8).map(function(t) { return t.name })
  })()

  useEffect(() => {
    const me = localStorage.getItem('player_' + code)
    if (!me) { nav('/unirse/' + code); return }
    setMyPlayer(JSON.parse(me))
    loadAll()
  }, [code])

  const loadAll = useCallback(async function(silent) {
    if (!silent) setLoading(true)
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
      if (plRes.data) {
        setPlayers(plRes.data)
        const meLocal = JSON.parse(localStorage.getItem('player_' + code) || '{}')
        const meReal = plRes.data.find(function(pl) {
          return pl.id === meLocal.id || pl.name === meLocal.name
        })
        if (meReal) {
          localStorage.setItem('player_' + code, JSON.stringify(meReal))
          setMyPlayer(meReal)
        }
      }
      const rMap = {}
      if (realesRes.data) {
        realesRes.data.forEach(function(r) {
          rMap[r.match_id] = { l: r.goals_local != null ? r.goals_local : '', v: r.goals_vis != null ? r.goals_vis : '' }
        })
      }
      setReales(function(prev) {
        const merged = Object.assign({}, rMap)
        Object.keys(prev).forEach(function(mid) {
          if (!merged[mid]) merged[mid] = prev[mid]
          else {
            if ((prev[mid].l !== '' && prev[mid].l != null) && (merged[mid].l === '' || merged[mid].l == null)) merged[mid].l = prev[mid].l
            if ((prev[mid].v !== '' && prev[mid].v != null) && (merged[mid].v === '' || merged[mid].v == null)) merged[mid].v = prev[mid].v
          }
        })
        return merged
      })
      const me = JSON.parse(localStorage.getItem('player_' + code) || '{}')
      const apMap = {}, myMap = {}, apClasif = {}
      if (predsRes.data) {
        predsRes.data.forEach(function(p) {
          if (!apMap[p.player_id]) apMap[p.player_id] = {}
          apMap[p.player_id][p.match_id] = { l: p.goals_local != null ? p.goals_local : '', v: p.goals_vis != null ? p.goals_vis : '' }
          if (p.player_id === me.id) myMap[p.match_id] = { l: p.goals_local != null ? p.goals_local : '', v: p.goals_vis != null ? p.goals_vis : '' }
        })
      }
      setAllPreds(apMap)
      setPreds(function(prev) {
        const merged = Object.assign({}, myMap)
        Object.keys(prev).forEach(function(mid) {
          if (parseInt(mid) >= 101) return
          if (!merged[mid]) { merged[mid] = prev[mid]; return }
          if ((prev[mid].l !== '' && prev[mid].l != null) && (merged[mid].l === '' || merged[mid].l == null)) merged[mid].l = prev[mid].l
          if ((prev[mid].v !== '' && prev[mid].v != null) && (merged[mid].v === '' || merged[mid].v == null)) merged[mid].v = prev[mid].v
        })
        return merged
      })
      const allExtrasMap = {}
      if (plRes.data) {
        plRes.data.forEach(function(pl) {
          if (pl.extras_pred) {
            allExtrasMap[pl.id] = pl.extras_pred
            if (pl.extras_pred.clasif_elim) apClasif[pl.id] = pl.extras_pred.clasif_elim
            if (pl.id === me.id) {
              setExtras(pl.extras_pred)
              if (pl.extras_pred.clasif_elim) setPredClasif(pl.extras_pred.clasif_elim)
            }
          }
        })
      }
      setAllExtras(allExtrasMap)
      setAllPredClasif(apClasif)
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [code])

  useEffect(function() {
    const interval = setInterval(function() { loadAll(true) }, 5000)
    return function() { clearInterval(interval) }
  }, [code, loadAll])

  const saveTimer = useRef({})
  async function flushPred(matchId, cur) {
    if (!myPlayer || !myPlayer.id) return
    await supabase.from('predictions').upsert({
      group_code: code, player_id: myPlayer.id, match_id: matchId,
      goals_local: cur.l !== '' && cur.l != null ? parseInt(cur.l) : null,
      goals_vis: cur.v !== '' && cur.v != null ? parseInt(cur.v) : null,
    }, { onConflict: 'group_code,player_id,match_id' })
  }
  function savePred(matchId, side, val) {
    if (locked) return
    const clean = val.replace(/\D/g, '').slice(0, 2)
    let cur = null
    setPreds(function(p) {
      const updated = Object.assign({}, p[matchId] || {}, { [side]: clean })
      cur = updated
      return Object.assign({}, p, { [matchId]: updated })
    })
    clearTimeout(saveTimer.current[matchId])
    saveTimer.current[matchId] = setTimeout(function() {
      if (cur) flushPred(matchId, cur)
    }, 200)
  }
  function savePredBlur(matchId) {
    clearTimeout(saveTimer.current[matchId])
    setPreds(function(p) {
      const cur = p[matchId]
      if (cur) flushPred(matchId, cur)
      return p
    })
  }

  async function saveReal(matchId, side, val) {
    const clean = val.replace(/\D/g, '').slice(0, 2)
    let savedCur = null
    setReales(function(prev) {
      const updated = Object.assign({}, prev[matchId] || {}, { [side]: clean })
      savedCur = updated
      return Object.assign({}, prev, { [matchId]: updated })
    })
    setTimeout(async function() {
      const cur = savedCur || {}
      await supabase.from('results').upsert({
        group_code: code, match_id: matchId,
        goals_local: cur.l !== '' && cur.l != null ? parseInt(cur.l) : null,
        goals_vis: cur.v !== '' && cur.v != null ? parseInt(cur.v) : null,
      }, { onConflict: 'group_code,match_id' })
    }, 0)
  }

  const clasifTimer = useRef(null)
  function savePredClasif(matchId, equipo) {
    if (locked) return
    const yaSeleccionado = predClasif[matchId] === equipo
    const next = Object.assign({}, predClasif, { [matchId]: yaSeleccionado ? '' : equipo })
    setPredClasif(next)
    setExtras(function(prevExtras) {
      const newExtras = Object.assign({}, prevExtras, { clasif_elim: next })
      clearTimeout(clasifTimer.current)
      clasifTimer.current = setTimeout(async function() {
        if (!myPlayer || !myPlayer.id) return
        await supabase.from('players').update({ extras_pred: newExtras }).eq('group_code', code).eq('name', myPlayer.name)
      }, 600)
      return newExtras
    })
  }

  async function saveRealClasif(matchId, equipo) {
    const yaSeleccionado = realClasif[matchId] === equipo
    const next = Object.assign({}, realClasif, { [matchId]: yaSeleccionado ? '' : equipo })
    setRealClasif(next)
    const newExtrasReal = Object.assign({}, extrasReal, { clasif_elim: next })
    setExtrasReal(newExtrasReal)
    await supabase.from('groups').update({ extras_real: newExtrasReal }).eq('code', code)
  }

  const extrasTimer = useRef(null)
  function saveExtras(newExtras) {
    if (locked) return
    setExtras(newExtras)
    clearTimeout(extrasTimer.current)
    extrasTimer.current = setTimeout(async function() {
      if (!myPlayer || !myPlayer.id) return
      await supabase.from('players').update({ extras_pred: newExtras }).eq('group_code', code).eq('name', myPlayer.name)
    }, 800)
  }

  async function saveExtrasReal(newExtrasReal) {
    setExtrasReal(newExtrasReal)
    await supabase.from('groups').update({ extras_real: newExtrasReal }).eq('code', code)
  }

  async function cargarGlobalRanking() {
    if (loadingGlobal) return
    setLoadingGlobal(true)
    try {
      const [predsRes, realesRes, playersRes] = await Promise.all([
        supabase.from('predictions').select('player_id, match_id, goals_local, goals_vis, group_code'),
        supabase.from('results').select('match_id, goals_local, goals_vis, group_code'),
        supabase.from('players').select('id, name, avatar, color, group_code'),
      ])
      if (!predsRes.data || !realesRes.data || !playersRes.data) { setLoadingGlobal(false); return }
      const realesMap = {}
      realesRes.data.forEach(function(r) {
        if (!realesMap[r.group_code]) realesMap[r.group_code] = {}
        realesMap[r.group_code][r.match_id] = { l: r.goals_local != null ? r.goals_local : '', v: r.goals_vis != null ? r.goals_vis : '' }
      })
      const predsMap = {}
      predsRes.data.forEach(function(p) {
        if (!predsMap[p.player_id]) predsMap[p.player_id] = {}
        predsMap[p.player_id][p.match_id] = { l: p.goals_local != null ? p.goals_local : '', v: p.goals_vis != null ? p.goals_vis : '' }
      })
      const ranked = playersRes.data.map(function(pl) {
        const pp = predsMap[pl.id] || {}
        const rr = realesMap[pl.group_code] || {}
        let pts = 0, exact = 0, result = 0
        PARTIDOS_GRUPOS.forEach(function(m) {
          const pr = pp[m.id] || {}
          const re = rr[m.id] || {}
          const p = calcPts(pr.l != null ? pr.l : '', pr.v != null ? pr.v : '', re.l != null ? re.l : '', re.v != null ? re.v : '')
          if (p === 5) { pts += 5; exact++ }
          else if (p === 1) { pts += 1; result++ }
        })
        return Object.assign({}, pl, { pts: pts, exact: exact, result: result })
      })
      ranked.sort(function(a, b) {
        if (b.pts !== a.pts) return b.pts - a.pts
        return b.exact - a.exact
      })
      setGlobalRanking(ranked)
    } catch(e) { console.error(e) }
    setLoadingGlobal(false)
  }

  function computeScore(playerId) {
    const pp = allPreds[playerId] || {}
    const pc = allPredClasif[playerId] || {}
    let pts = 0, exact = 0, result = 0, clasifAciertos = 0
    PARTIDOS_GRUPOS.forEach(function(m) {
      const pr = pp[m.id] || {}
      const re = reales[m.id] || {}
      const p = calcPts(pr.l != null ? pr.l : '', pr.v != null ? pr.v : '', re.l != null ? re.l : '', re.v != null ? re.v : '')
      if (p === 5) { pts += 5; exact++ }
      else if (p === 1) { pts += 1; result++ }
    })
    PARTIDOS_ELIMINATORIAS.forEach(function(m) {
      if (m.tercero && m.vis === '3?') return
      const predEq = pc[m.id] || ''
      const realEq = realClasif[m.id] || ''
      const p = calcPtsClasificado(predEq, realEq, m.fase)
      if (p > 0) { pts += p; clasifAciertos++ }
    })
    const ep = allExtras[playerId] || {}
    const er = extrasReal || {}
    if (er.balon && ep.balon && ep.balon.toLowerCase() === er.balon.toLowerCase()) pts += 10
    if (er.bota && ep.bota && ep.bota.toLowerCase() === er.bota.toLowerCase()) pts += 10
    if (er.portero && ep.portero && ep.portero.toLowerCase() === er.portero.toLowerCase()) pts += 10
    if (er.joven && ep.joven && ep.joven.toLowerCase() === er.joven.toLowerCase()) pts += 10
    const grpKeys = Object.keys(GRUPOS)
    for (let gi = 0; gi < grpKeys.length; gi++) {
      const grp = grpKeys[gi]
      if (er['1_' + grp] && ep['1_' + grp] && ep['1_' + grp].toLowerCase() === er['1_' + grp].toLowerCase()) pts += 2
      if (er['2_' + grp] && ep['2_' + grp] && ep['2_' + grp].toLowerCase() === er['2_' + grp].toLowerCase()) pts += 1
    }
    const realTerc = er.mejores_terceros || []
    const predTerc = ep.mejores_terceros || []
    predTerc.forEach(function(eq) {
      const lower = realTerc.map(function(e) { return e.toLowerCase() })
      if (lower.indexOf(eq.toLowerCase()) >= 0) pts += 1
    })
    return { pts: pts, exact: exact, result: result, clasifAciertos: clasifAciertos }
  }

  const ranking = players.slice().map(function(p) { return Object.assign({}, p, computeScore(p.id)) }).sort(function(a, b) { return b.pts - a.pts || b.exact - a.exact })
  const myScore = myPlayer ? computeScore(myPlayer.id) : { pts: 0, exact: 0, result: 0, clasifAciertos: 0 }
  const myRank = ranking.findIndex(function(p) { return p.id === (myPlayer && myPlayer.id) }) + 1
  const completedPreds = PARTIDOS_GRUPOS.filter(function(m) {
    const pr = preds[m.id]
    return pr && pr.l !== '' && pr.l != null && pr.v !== '' && pr.v != null
  }).length
  const completedElim = PARTIDOS_ELIMINATORIAS.filter(function(m) {
    return predClasif[m.id] && predClasif[m.id] !== ''
  }).length
  const completed = completedPreds + completedElim
  const totalPredecible = PARTIDOS_GRUPOS.length + PARTIDOS_ELIMINATORIAS.length

  function handleCopy() {
    if (navigator.clipboard) navigator.clipboard.writeText(shareUrl).catch(function() {})
    setCopied(true)
    setTimeout(function() { setCopied(false) }, 2500)
  }

  async function kickPlayer(playerId) {
    if (!isCreator) return
    if (!window.confirm('Seguro?')) return
    await supabase.from('players').delete().eq('id', playerId)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 40 }}>{'⚽'}</div>
      <div style={{ color: '#3a5070' }}>Cargando...</div>
    </div>
  )

  const clasifParaVista = {}
  Object.keys(realClasif).forEach(function(k) { clasifParaVista[k] = realClasif[k] })
  Object.keys(predClasif).forEach(function(k) { if (predClasif[k]) clasifParaVista[k] = predClasif[k] })

  const matchesToShow = fase === 'grupos'
    ? PARTIDOS_GRUPOS.filter(function(m) { return m.grupo === grupoFiltro })
    : PARTIDOS_ELIMINATORIAS.filter(function(m) { return m.fase === fase })

  const mc = (myPlayer && myPlayer.color) || '#e63946'

  function inpStyle(filled, disabled) {
    return {
      width: '100%', padding: '10px 14px', borderRadius: 10,
      border: '1px solid ' + (filled ? 'rgba(42,157,143,0.5)' : 'rgba(255,255,255,0.1)'),
      background: disabled ? 'rgba(255,255,255,0.03)' : filled ? 'rgba(42,157,143,0.08)' : 'rgba(255,255,255,0.05)',
      color: disabled ? '#3a5070' : '#e8eaf0', fontSize: 14, boxSizing: 'border-box', outline: 'none',
      cursor: disabled ? 'not-allowed' : 'text',
    }
  }

  const realInpStyle = {
    width: '100%', padding: '8px 10px', borderRadius: 8,
    border: '1px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.06)',
    color: '#ffd700', fontSize: 13, boxSizing: 'border-box', outline: 'none', cursor: 'pointer'
  }

  const tabList = [['quiniela','Q'],['extras','E'],['ranking','R'],['global','G'],['tabla','T'],['grupo','Gr']]
  if (isSuperAdmin) tabList.push(['admin','A'])
  const tabLabels = { quiniela: 'Quiniela', extras: 'Extras', ranking: 'Ranking', global: 'Global', tabla: 'Tabla', grupo: 'Grupo', admin: 'Admin' }
  const tabEmojis = { quiniela: '📝', extras: '🎯', ranking: '🏅', global: '🌍', tabla: '📊', grupo: '👥', admin: '🔧' }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, position: 'relative' }}>
      <div className="bg-dots" />

      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,12,20,.96)', backdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '10px 16px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={function() { nav('/') }} style={{ background: 'none', border: 'none', color: '#3a5070', cursor: 'pointer', fontSize: 20, padding: '0 8px 0 0' }}>{'←'}</button>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: '#e63946', letterSpacing: 1 }}>QUINIELA</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{group && group.name}</div>
            <div style={{ fontSize: 10, color: '#2a4060' }}>Codigo: <span style={{ color: '#e63946', fontWeight: 700, letterSpacing: 3 }}>{code}</span></div>
          </div>
          {locked && <span style={{ fontSize: 10, color: '#f4a261', background: 'rgba(244,162,97,0.12)', padding: '3px 8px', borderRadius: 20, fontWeight: 700 }}>Cerrado</span>}
          <button onClick={handleCopy} style={{ background: copied ? 'rgba(42,157,143,.2)' : 'rgba(255,255,255,.07)', border: '1px solid ' + (copied ? '#2a9d8f' : 'rgba(255,255,255,.1)'), borderRadius: 10, color: copied ? '#2a9d8f' : '#a0b4cc', padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            {copied ? 'Copiado' : 'Compartir'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 12px' }}>

        {locked && (
          <div style={{ margin: '12px 0', padding: '10px 16px', background: 'rgba(244,162,97,0.08)', border: '1px solid rgba(244,162,97,0.25)', borderRadius: 12, fontSize: 12, color: '#f4a261', textAlign: 'center' }}>
            Predicciones cerradas desde 1h antes del primer partido.
          </div>
        )}

        {myPlayer && (
          <div style={{ background: 'linear-gradient(135deg,' + mc + '20,' + mc + '08)', border: '1px solid ' + mc + '44', borderRadius: 16, padding: '14px 18px', margin: '14px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: 32, width: 46, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', background: mc + '22', borderRadius: 12 }}>{myPlayer.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: mc }}>{myPlayer.name}</div>
              <div style={{ fontSize: 11, color: '#2a4060' }}>{isCreator ? 'Admin del grupo' : players.length + ' jugadores'}</div>
            </div>
            <div style={{ textAlign: 'center', marginRight: 8 }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 34, color: mc, lineHeight: 1 }}>{myScore.pts}</div>
              <div style={{ fontSize: 10, color: '#2a4060' }}>pts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 26, color: '#e8eaf0', lineHeight: 1 }}>{'#' + myRank}</div>
              <div style={{ fontSize: 10, color: '#2a4060' }}>posicion</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 4, marginBottom: 14, overflowX: 'auto' }}>
          {tabList.map(function(item) {
            const k = item[0]
            return (
              <button key={k} onClick={function() { setTab(k); if (k === 'global') cargarGlobalRanking() }} style={{ flex: 1, padding: '10px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11, background: tab === k ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', color: tab === k ? '#e8eaf0' : '#2a4060', borderBottom: tab === k ? '3px solid ' + mc : '3px solid transparent', whiteSpace: 'nowrap' }}>
                {tabEmojis[k]} {tabLabels[k]}
              </button>
            )
          })}
        </div>

        {tab === 'quiniela' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {TODAS_LAS_FASES.map(function(f) {
                return (
                  <button key={f.key} onClick={function() { setFase(f.key) }} style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: 11, background: fase === f.key ? mc + '22' : 'rgba(255,255,255,0.05)', color: fase === f.key ? mc : '#2a4060', border: '1px solid ' + (fase === f.key ? mc + '44' : 'transparent'), whiteSpace: 'nowrap', outline: 'none' }}>
                    {f.label}
                  </button>
                )
              })}
            </div>

            {fase === 'grupos' && (
              <div style={{ display: 'flex', gap: 4, marginBottom: 14, overflowX: 'auto', flexWrap: 'wrap' }}>
                {Object.keys(GRUPOS).map(function(grp) {
                  return (
                    <button key={grp} onClick={function() { setGrupoFiltro(grp) }} style={{ flexShrink: 0, minWidth: 36, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: grupoFiltro === grp ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)', color: grupoFiltro === grp ? '#e8eaf0' : '#2a4060', borderBottom: grupoFiltro === grp ? '2px solid ' + mc : '2px solid transparent' }}>
                      {grp}
                    </button>
                  )
                })}
              </div>
            )}

            {fase === 'grupos' && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(42,157,143,0.1)', border: '1px solid rgba(42,157,143,0.25)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#2a9d8f', lineHeight: 1 }}>5 pts</div>
                  <div style={{ fontSize: 11, color: '#2a9d8f', marginTop: 2 }}>Resultado exacto</div>
                </div>
                <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(244,162,97,0.1)', border: '1px solid rgba(244,162,97,0.25)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#f4a261', lineHeight: 1 }}>1 pt</div>
                  <div style={{ fontSize: 11, color: '#f4a261', marginTop: 2 }}>Resultado correcto</div>
                </div>
                <div style={{ flex: 1, padding: '10px 14px', background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,0.2)', borderRadius: 10, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#e63946', lineHeight: 1 }}>0 pts</div>
                  <div style={{ fontSize: 11, color: '#e63946', marginTop: 2 }}>Incorrecto</div>
                </div>
              </div>
            )}
            {fase !== 'grupos' && (
              <div style={{ padding: '10px 14px', background: mc + '12', border: '1px solid ' + mc + '33', borderRadius: 10, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, color: '#c8d8ea' }}>
                  {fase === 'tercero' ? '3er puesto — acierta quien gana' : 'Acierta quien pasa a ' + (TODAS_LAS_FASES.find(function(f) { return f.key === fase }) || {}).label}
                </span>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: mc }}>{PTS_CLASIFICADO[fase] || 0} pts</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, padding: '8px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
              <span style={{ fontSize: 11, color: '#2a4060' }}>Partidos jugados</span>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: '#1a2a3a', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: (completed / totalPredecible * 100) + '%', background: 'linear-gradient(90deg,' + mc + ',' + mc + '88)', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700 }}>{completed + '/' + totalPredecible}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matchesToShow.map(function(m) {
                const isElim = ELIM_FASES.indexOf(m.fase) >= 0
                const isTerceroFase = m.fase === 'tercero'
                const isTerceroPlaceholder = m.tercero && m.vis === '3?' && !mejoresTerceros[DISEC_IDS.indexOf(m.id) - 8]
                const localReal = resolverPlaceholder(m.local, clasifParaVista, standingsJugador)
                const visRealBase = resolverPlaceholder(m.vis, clasifParaVista, standingsJugador)
                const visReal = (m.tercero && m.vis === '3?')
                  ? (mejoresTerceros[DISEC_IDS.indexOf(m.id) - 8] || '3o pendiente')
                  : visRealBase
                const tieneEquiposReales = !esPlaceholder(localReal) && !esPlaceholder(visReal)
                const pl = (preds[m.id] && preds[m.id].l != null) ? preds[m.id].l : ''
                const pv = (preds[m.id] && preds[m.id].v != null) ? preds[m.id].v : ''
                const rl = (reales[m.id] && reales[m.id].l != null) ? reales[m.id].l : ''
                const rv = (reales[m.id] && reales[m.id].v != null) ? reales[m.id].v : ''
                const pts = !isElim ? calcPts(pl, pv, rl, rv) : null
                const hasReal = rl !== '' && rl != null
                const miPredEq = predClasif[m.id] || ''
                const realEq = realClasif[m.id] || ''
                const ptsClas = (isElim && !isTerceroFase && !isTerceroPlaceholder) ? calcPtsClasificado(miPredEq, realEq, m.fase) : 0
                const hasRealEq = !!realEq
                const hasPred = pl !== '' || pv !== '' || !!miPredEq
                const ptsBg = pts === 5 ? '#2a9d8f' : pts === 1 ? '#f4a261' : (pts === 0 && hasReal) ? '#e63946' : ptsClas > 0 ? '#2a9d8f' : null
                const ptsLabel = pts === 5 ? '5 pts' : pts === 1 ? '1 pt' : (pts === 0 && hasReal) ? '0 pts' : ptsClas > 0 ? ('+' + ptsClas + ' pts') : null

                return (
                  <div key={m.id} style={{ background: hasPred ? mc + '0d' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (hasPred ? mc + '33' : 'rgba(255,255,255,0.07)'), borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: '#2a4060', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 20 }}>
                        {m.grupo ? 'Grupo ' + m.grupo + ' | ' : ''}{m.fecha}
                      </span>
                      {locked && !hasReal && !hasRealEq && <span style={{ fontSize: 10, color: '#f4a261', background: 'rgba(244,162,97,0.12)', padding: '2px 8px', borderRadius: 20 }}>Cerrado</span>}
                      {ptsBg && ptsLabel && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: '#fff', background: ptsBg, padding: '2px 10px', borderRadius: 20 }}>{ptsLabel}</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: (isElim && !isTerceroFase) ? 10 : 0 }}>
                      <div style={{ flex: 1, textAlign: 'right', fontSize: 13, fontWeight: 700 }}>{localReal}</div>
                      {!isElim ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                          <input type="text" inputMode="numeric" maxLength={2} value={pl} onChange={function(e) { savePred(m.id, 'l', e.target.value) }} onBlur={function() { savePredBlur(m.id) }} placeholder="-" readOnly={locked}
                            style={{ width: 40, height: 40, textAlign: 'center', fontSize: 20, fontWeight: 900, borderRadius: 8, border: '2px solid ' + (pl !== '' ? mc : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'), background: locked ? 'rgba(255,255,255,0.04)' : mc + '18', color: locked ? '#3a5070' : mc, cursor: locked ? 'not-allowed' : 'text', outline: 'none' }} />
                          <span style={{ color: '#1a2a3a', fontSize: 18, fontWeight: 900 }}>:</span>
                          <input type="text" inputMode="numeric" maxLength={2} value={pv} onChange={function(e) { savePred(m.id, 'v', e.target.value) }} onBlur={function() { savePredBlur(m.id) }} placeholder="-" readOnly={locked}
                            style={{ width: 40, height: 40, textAlign: 'center', fontSize: 20, fontWeight: 900, borderRadius: 8, border: '2px solid ' + (pv !== '' ? mc : locked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)'), background: locked ? 'rgba(255,255,255,0.04)' : mc + '18', color: locked ? '#3a5070' : mc, cursor: locked ? 'not-allowed' : 'text', outline: 'none' }} />
                        </div>
                      ) : (
                        <div style={{ fontSize: 16, color: '#1a2a3a', fontWeight: 900 }}>vs</div>
                      )}
                      <div style={{ flex: 1, textAlign: 'left', fontSize: 13, fontWeight: 700 }}>{visReal}</div>
                    </div>

                    {isElim && !isTerceroFase && !isTerceroPlaceholder && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: '#2a4060', marginBottom: 6 }}>
                          {'Quien pasa? '}<span style={{ color: mc, fontWeight: 700 }}>+{PTS_CLASIFICADO[m.fase]} pts</span>
                        </div>
                        {tieneEquiposReales ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {[localReal, visReal].map(function(eq) {
                              return (
                                <button key={eq} onClick={function() { if (!locked) savePredClasif(m.id, eq) }}
                                  style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: '2px solid ' + (miPredEq === eq ? mc : 'rgba(255,255,255,0.1)'), background: miPredEq === eq ? mc + '22' : 'rgba(255,255,255,0.04)', color: miPredEq === eq ? mc : '#8a9ab0', fontWeight: miPredEq === eq ? 700 : 400, fontSize: 13, cursor: locked ? 'not-allowed' : 'pointer' }}>
                                  {eq}
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <input placeholder="Equipo que pasa..." value={miPredEq} readOnly={locked}
                            onChange={function(e) { savePredClasif(m.id, e.target.value) }}
                            style={inpStyle(!!miPredEq, locked)} />
                        )}
                        {hasRealEq && (
                          <div style={{ marginTop: 6, fontSize: 11, color: ptsClas > 0 ? '#2a9d8f' : '#e63946' }}>
                            {ptsClas > 0 ? 'Acertaste! +' + ptsClas + ' pts' : 'Clasificado: ' + realEq}
                          </div>
                        )}
                        {isCreator && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: 11, color: '#ffd700', fontWeight: 700, marginBottom: 6 }}>Admin - Quien paso realmente?</div>
                            {tieneEquiposReales ? (
                              <div style={{ display: 'flex', gap: 6 }}>
                                {[localReal, visReal].map(function(eq) {
                                  return (
                                    <button key={eq} onClick={function() { saveRealClasif(m.id, eq) }}
                                      style={{ flex: 1, padding: '6px 8px', borderRadius: 8, border: '1.5px solid ' + (realEq === eq ? 'rgba(42,157,143,.6)' : 'rgba(255,215,0,0.2)'), background: realEq === eq ? 'rgba(42,157,143,.2)' : 'rgba(255,215,0,0.04)', color: realEq === eq ? '#2a9d8f' : '#ffd700', fontSize: 12, cursor: 'pointer', fontWeight: realEq === eq ? 700 : 400 }}>
                                      {eq}
                                    </button>
                                  )
                                })}
                              </div>
                            ) : (
                              <input placeholder="Equipo clasificado real" value={realEq}
                                onChange={function(e) { saveRealClasif(m.id, e.target.value) }}
                                style={Object.assign({}, realInpStyle, { marginTop: 4 })} />
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {isTerceroPlaceholder && (
                      <div style={{ textAlign: 'center', padding: '8px 0', fontSize: 12, color: '#2a4060' }}>
                        Cruce pendiente - se define tras la fase de grupos
                      </div>
                    )}
                    {isTerceroFase && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 11, color: '#2a4060', marginBottom: 6 }}>
                          {'Quien gana el 3er puesto? '}<span style={{ color: mc, fontWeight: 700 }}>+4 pts</span>
                        </div>
                        {!esPlaceholder(localReal) && !esPlaceholder(visReal) ? (
                          <div style={{ display: 'flex', gap: 8 }}>
                            {[localReal, visReal].map(function(eq) {
                              return (
                                <button key={eq} onClick={function() { if (!locked) savePredClasif(m.id, eq) }}
                                  style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: '2px solid ' + (miPredEq === eq ? mc : 'rgba(255,255,255,0.1)'), background: miPredEq === eq ? mc + '22' : 'rgba(255,255,255,0.04)', color: miPredEq === eq ? mc : '#8a9ab0', fontWeight: miPredEq === eq ? 700 : 400, fontSize: 13, cursor: locked ? 'not-allowed' : 'pointer' }}>
                                  {eq}
                                </button>
                              )
                            })}
                          </div>
                        ) : (
                          <div style={{ textAlign: 'center', fontSize: 12, color: '#2a4060' }}>Pendiente de semifinales</div>
                        )}
                        {hasRealEq && (
                          <div style={{ marginTop: 6, fontSize: 11, color: ptsClas > 0 ? '#2a9d8f' : '#e63946' }}>
                            {ptsClas > 0 ? 'Acertaste! +4 pts' : 'Ganador 3er puesto: ' + realEq}
                          </div>
                        )}
                        {isCreator && !esPlaceholder(localReal) && !esPlaceholder(visReal) && (
                          <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: 11, color: '#ffd700', fontWeight: 700, marginBottom: 6 }}>Admin - Quien gano el 3er puesto?</div>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {[localReal, visReal].map(function(eq) {
                                return (
                                  <button key={eq} onClick={function() { saveRealClasif(m.id, eq) }}
                                    style={{ flex: 1, padding: '6px 8px', borderRadius: 8, border: '1.5px solid ' + (realEq === eq ? 'rgba(42,157,143,.6)' : 'rgba(255,215,0,0.2)'), background: realEq === eq ? 'rgba(42,157,143,.2)' : 'rgba(255,215,0,0.04)', color: realEq === eq ? '#2a9d8f' : '#ffd700', fontSize: 12, cursor: 'pointer', fontWeight: realEq === eq ? 700 : 400 }}>
                                    {eq}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isElim && (
                      isCreator ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ fontSize: 11, color: '#2a9d8f', fontWeight: 700 }}>Real:</span>
                          <input type="text" inputMode="numeric" maxLength={2} value={rl} onChange={function(e) { saveReal(m.id, 'l', e.target.value) }} style={{ width: 34, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 700, borderRadius: 6, border: '1.5px solid rgba(42,157,143,.4)', background: 'rgba(42,157,143,.12)', color: '#2a9d8f', outline: 'none' }} />
                          <span style={{ color: '#2a9d8f' }}>:</span>
                          <input type="text" inputMode="numeric" maxLength={2} value={rv} onChange={function(e) { saveReal(m.id, 'v', e.target.value) }} style={{ width: 34, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 700, borderRadius: 6, border: '1.5px solid rgba(42,157,143,.4)', background: 'rgba(42,157,143,.12)', color: '#2a9d8f', outline: 'none' }} />
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', marginTop: 8 }}>
                          {hasReal
                            ? <span style={{ fontSize: 11, color: '#2a9d8f', background: 'rgba(42,157,143,.12)', padding: '2px 12px', borderRadius: 20 }}>{rl + ' - ' + rv}</span>
                            : <span style={{ fontSize: 11, color: '#2a4060', background: 'rgba(255,255,255,.04)', padding: '2px 12px', borderRadius: 20 }}>Pendiente</span>}
                        </div>
                      )
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'extras' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: locked ? 'rgba(244,162,97,0.06)' : 'rgba(255,255,255,0.03)', border: locked ? '1px solid rgba(244,162,97,0.2)' : 'none', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: locked ? '#f4a261' : '#2a6070' }}>
              {locked ? 'Predicciones cerradas.' : 'Predicciones especiales - 10 pts cada una.'}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#e8eaf0', marginBottom: 14 }}>Premios individuales - 10 pts c/u</div>
              {[
                { key: 'balon', label: 'Balon de Oro', ph: 'Nombre del jugador...' },
                { key: 'bota', label: 'Bota de Oro', ph: 'Nombre del jugador...' },
                { key: 'portero', label: 'Guante de Oro', ph: 'Nombre del portero...' },
                { key: 'joven', label: 'Mejor jugador joven', ph: 'Nombre del jugador...' },
              ].map(function(item) {
                const myVal = extras[item.key] || ''
                const realVal = (extrasReal && extrasReal[item.key]) || ''
                const hit = realVal && myVal && myVal.toLowerCase() === realVal.toLowerCase()
                return (
                  <div key={item.key} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: hit ? '#2a9d8f' : '#a0b4cc' }}>{item.label}</span>
                      <span style={{ fontSize: 11, color: '#2a4060' }}>+10 pts</span>
                    </div>
                    <input placeholder={locked ? (myVal || 'Sin prediccion') : item.ph} value={myVal}
                      onChange={function(e) { saveExtras(Object.assign({}, extras, { [item.key]: e.target.value })) }} readOnly={locked}
                      style={inpStyle(!!myVal, locked)} />
                    {realVal && (
                      <div style={{ fontSize: 11, color: hit ? '#2a9d8f' : '#e63946', marginTop: 4 }}>
                        {hit ? 'Acertado! +10 pts' : 'Real: ' + realVal}
                      </div>
                    )}
                    {isCreator && (
                      <input placeholder={'Admin - ' + item.label + ' real'} value={realVal}
                        onChange={function(e) { saveExtrasReal(Object.assign({}, extrasReal, { [item.key]: e.target.value })) }}
                        style={Object.assign({}, realInpStyle, { marginTop: 6 })} />
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#e8eaf0', marginBottom: 12 }}>Predicciones de todos</div>
              {players.map(function(pl) {
                const ep = allExtras[pl.id] || {}
                const items = [ep.balon && ('Balon: ' + ep.balon), ep.bota && ('Bota: ' + ep.bota), ep.portero && ('Portero: ' + ep.portero), ep.joven && ('Joven: ' + ep.joven)].filter(Boolean)
                return (
                  <div key={pl.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18 }}>{pl.avatar}</span>
                      <span style={{ fontWeight: 700, color: pl.color, fontSize: 13 }}>{pl.name}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {items.length > 0 ? items.map(function(item, i) {
                        return <span key={i} style={{ fontSize: 11, background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 20, color: '#8a9ab0' }}>{item}</span>
                      }) : <span style={{ fontSize: 11, color: '#2a4060' }}>Sin predicciones</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'ranking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ textAlign: 'center', fontSize: 11, color: '#2a4060', marginBottom: 8 }}>Clasificacion en vivo</div>
            {ranking.map(function(pl, rank) {
              const isMe = pl.id === (myPlayer && myPlayer.id)
              const medals = ['🥇', '🥈', '🥉']
              const medal = medals[rank] || ((rank + 1) + 'o')
              return (
                <div key={pl.id} style={{ background: isMe ? pl.color + '18' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (isMe ? pl.color + '44' : 'rgba(255,255,255,0.07)'), borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 24, width: 34, textAlign: 'center' }}>{medal}</div>
                  <div style={{ fontSize: 26, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pl.color + '22', borderRadius: 10 }}>{pl.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: isMe ? pl.color : '#c8d8ea' }}>{pl.name}{isMe ? ' (tu)' : ''}</div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 3, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#2a9d8f' }}>{pl.exact} exactos</span>
                      <span style={{ fontSize: 11, color: '#f4a261' }}>{pl.result} resultados</span>
                      {pl.clasifAciertos > 0 && <span style={{ fontSize: 11, color: '#9b5de5' }}>{pl.clasifAciertos} clasif.</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: pl.color, lineHeight: 1 }}>{pl.pts}</div>
                    <div style={{ fontSize: 10, color: '#2a4060' }}>pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'global' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ textAlign: 'center', fontSize: 11, color: '#2a4060', marginBottom: 8 }}>Ranking global de todas las ligas</div>
            {loadingGlobal && <div style={{ textAlign: 'center', color: '#2a4060', padding: '2rem' }}>Cargando...</div>}
            {!loadingGlobal && globalRanking.length === 0 && <div style={{ textAlign: 'center', color: '#2a4060', padding: '2rem' }}>Sin datos todavia</div>}
            {!loadingGlobal && globalRanking.map(function(pl, idx) {
              const isMe = pl.id === (myPlayer && myPlayer.id)
              const medals = ['🥇', '🥈', '🥉']
              const medal = medals[idx] || ((idx + 1) + 'o')
              return (
                <div key={pl.id} style={{ background: isMe ? pl.color + '18' : 'rgba(255,255,255,0.04)', border: '1px solid ' + (isMe ? pl.color + '44' : 'rgba(255,255,255,0.07)'), borderRadius: 14, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 20, width: 30, textAlign: 'center' }}>{medal}</div>
                  <div style={{ fontSize: 22, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pl.color + '22', borderRadius: 8 }}>{pl.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: isMe ? pl.color : '#c8d8ea' }}>{pl.name}{isMe ? ' (tu)' : ''}</div>
                    <div style={{ fontSize: 10, color: '#2a4060', marginTop: 2 }}>{pl.exact} exactos | {pl.result} resultados</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 30, color: pl.color, lineHeight: 1 }}>{pl.pts}</div>
                    <div style={{ fontSize: 10, color: '#2a4060' }}>pts</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {tab === 'tabla' && (function() {
          function calcTabla(resultMap) {
            const st = {}
            const gks = Object.keys(GRUPOS)
            for (let gi = 0; gi < gks.length; gi++) {
              const grp = gks[gi]
              st[grp] = GRUPOS[grp].map(function(t) { return { name: t, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 } })
            }
            PARTIDOS_GRUPOS.forEach(function(m) {
              const r = resultMap[m.id]
              if (!r) return
              const rl = r.l, rv = r.v
              if (rl == null || rl === '' || rv == null || rv === '') return
              const gl = parseInt(rl), gv = parseInt(rv)
              const arr = st[m.grupo]
              if (!arr) return
              let loc = null, vis = null
              for (let ti = 0; ti < arr.length; ti++) {
                if (arr[ti].name === m.local) loc = arr[ti]
                if (arr[ti].name === m.vis) vis = arr[ti]
              }
              if (!loc || !vis) return
              loc.pj++; vis.pj++
              loc.gf += gl; loc.gc += gv; vis.gf += gv; vis.gc += gl
              if (gl > gv) { loc.pg++; loc.pts += 3; vis.pp++ }
              else if (gl < gv) { vis.pg++; vis.pts += 3; loc.pp++ }
              else { loc.pe++; loc.pts++; vis.pe++; vis.pts++ }
            })
            return st
          }
          const myPredMap = {}
          PARTIDOS_GRUPOS.forEach(function(m) {
            const pr = preds[m.id]
            if (pr && pr.l !== '' && pr.l != null && pr.v !== '' && pr.v != null) {
              myPredMap[m.id] = { l: pr.l, v: pr.v }
            }
          })
          const tablaJugador = calcTabla(myPredMap)
          const tablaReal = calcTabla(reales)
          const GC = ['#e63946','#f4a261','#2a9d8f','#457b9d','#9b5de5','#e9c46a','#06d6a0','#ef476f','#118ab2','#ffd166','#e63946','#2a9d8f']
          function renderTabla(standings, titulo, color) {
            return (
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 12, color: color, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, paddingLeft: 8, borderLeft: '3px solid ' + color }}>{titulo}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(standings).map(function(entry, gi) {
                    const grp = entry[0], teams = entry[1]
                    const sorted = teams.slice().sort(function(a, b) {
                      if (b.pts !== a.pts) return b.pts - a.pts
                      const gdB = b.gf - b.gc, gdA = a.gf - a.gc
                      if (gdB !== gdA) return gdB - gdA
                      if (b.gf !== a.gf) return b.gf - a.gf
                      return a.name.localeCompare(b.name)
                    })
                    const gc = GC[gi % GC.length]
                    return (
                      <div key={grp} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                        <div style={{ background: gc + '22', borderBottom: '1px solid ' + gc + '44', padding: '10px 16px', display: 'flex', alignItems: 'center' }}>
                          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: gc }}>GRUPO {grp}</div>
                          <div style={{ fontSize: 11, color: '#2a4060', marginLeft: 'auto' }}>PJ PG PE PP GF GC Pts</div>
                        </div>
                        {sorted.map(function(t, ti) {
                          const vals = [t.pj, t.pg, t.pe, t.pp, t.gf, t.gc, t.pts]
                          return (
                            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', background: ti < 2 ? gc + '08' : 'transparent' }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: ti === 0 ? '#ffd700' : ti === 1 ? '#c0c0c0' : '#2a4060', width: 16, textAlign: 'center' }}>
                                {ti === 0 ? '🥇' : ti === 1 ? '🥈' : ti === 2 ? '🥉' : (ti + 1) + ''}
                              </div>
                              <div style={{ flex: 1, fontSize: 13, fontWeight: ti < 2 ? 700 : 400, color: ti < 2 ? '#e8eaf0' : '#8a9ab0' }}>{t.name}</div>
                              {vals.map(function(v, i) {
                                return <div key={i} style={{ width: 22, textAlign: 'center', fontSize: 12, fontWeight: i === 6 ? 700 : 400, color: i === 6 ? (t.pts > 0 ? gc : '#2a4060') : '#4a6080' }}>{v}</div>
                              })}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }
          return (
            <div>
              {renderTabla(tablaJugador, 'Tu prediccion', mc)}
              {isCreator && renderTabla(tablaReal, 'Resultados reales', '#2a9d8f')}
            </div>
          )
        })()}

        {tab === 'grupo' && (
          <div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: '#2a7070', marginBottom: 4 }}>Nombre del grupo</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{group && group.name}</div>
              <div style={{ fontSize: 12, color: '#2a4060', marginTop: 2 }}>{players.length} jugadores | {completed}/{ALL_MATCHES.length} partidos jugados</div>
              <div style={{ marginTop: 18, padding: 16, background: 'rgba(230,57,70,0.08)', border: '1px solid rgba(230,57,70,.2)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: '#2a4060', marginBottom: 6, letterSpacing: 3, textTransform: 'uppercase' }}>Enlace para compartir</div>
                <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: '#e63946', letterSpacing: 6, marginBottom: 6 }}>{code}</div>
                <div style={{ fontSize: 11, color: '#2a4060', marginBottom: 12, wordBreak: 'break-all' }}>{shareUrl}</div>
                <button onClick={handleCopy} style={{ padding: '8px 20px', fontSize: 13, background: 'none', border: '1px solid ' + (copied ? '#2a9d8f' : 'rgba(255,255,255,.12)'), borderRadius: 8, color: copied ? '#2a9d8f' : '#a0b4cc', cursor: 'pointer' }}>
                  {copied ? 'Copiado!' : 'Copiar enlace'}
                </button>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: '#2a7070', marginBottom: 12 }}>Jugadores ({players.length})</div>
              {players.map(function(pl) {
                return (
                  <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: 20, width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pl.color + '22', borderRadius: 8 }}>{pl.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: pl.id === (myPlayer && myPlayer.id) ? pl.color : '#c8d8ea' }}>{pl.name} {pl.id === (myPlayer && myPlayer.id) ? '(tu)' : ''}</div>
                      {pl.id === (group && group.creator_id) && <div style={{ fontSize: 10, color: '#f4a261' }}>Admin del grupo</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: pl.color }} />
                      {isCreator && pl.id !== (myPlayer && myPlayer.id) && (
                        <button onClick={function() { kickPlayer(pl.id) }} style={{ background: 'rgba(230,57,70,0.12)', border: '1px solid rgba(230,57,70,0.3)', borderRadius: 6, color: '#e63946', fontSize: 11, padding: '3px 8px', cursor: 'pointer', fontWeight: 600 }}>Echar</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <button onClick={function() { localStorage.removeItem('player_' + code); nav('/') }}
              style={{ width: '100%', padding: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#4a6080', cursor: 'pointer', fontSize: 14 }}>
              Salir del grupo
            </button>
          </div>
        )}

        {tab === 'admin' && isSuperAdmin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, padding: '12px 16px', fontSize: 12, color: '#ffd700' }}>
              Panel de administrador - Solo visible para ti
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#e8eaf0', marginBottom: 14 }}>Introducir resultados - Grupos</div>
              {['J1', 'J2', 'J3'].map(function(jor) {
                return (
                  <div key={jor} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: '#2a4060', fontWeight: 700, marginBottom: 8, letterSpacing: 2 }}>{jor === 'J1' ? 'JORNADA 1' : jor === 'J2' ? 'JORNADA 2' : 'JORNADA 3'}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {PARTIDOS_GRUPOS.filter(function(m) { return m.jornada === jor }).map(function(m) {
                        const rl3 = (reales[m.id] && reales[m.id].l != null) ? reales[m.id].l : ''
                        const rv3 = (reales[m.id] && reales[m.id].v != null) ? reales[m.id].v : ''
                        return (
                          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                            <span style={{ flex: 1, fontSize: 12, textAlign: 'right', color: '#c8d8ea' }}>{m.local}</span>
                            <input type="text" inputMode="numeric" maxLength={2} value={rl3} onChange={function(e) { saveReal(m.id, 'l', e.target.value) }} style={{ width: 34, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 700, borderRadius: 6, border: '1.5px solid rgba(42,157,143,.4)', background: 'rgba(42,157,143,.12)', color: '#2a9d8f', outline: 'none' }} />
                            <span style={{ color: '#2a9d8f', fontWeight: 900 }}>:</span>
                            <input type="text" inputMode="numeric" maxLength={2} value={rv3} onChange={function(e) { saveReal(m.id, 'v', e.target.value) }} style={{ width: 34, height: 30, textAlign: 'center', fontSize: 14, fontWeight: 700, borderRadius: 6, border: '1.5px solid rgba(42,157,143,.4)', background: 'rgba(42,157,143,.12)', color: '#2a9d8f', outline: 'none' }} />
                            <span style={{ flex: 1, fontSize: 12, color: '#c8d8ea' }}>{m.vis}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#e8eaf0', marginBottom: 14 }}>Quien pasa - Eliminatorias</div>
              {['dieciseisavos', 'octavos', 'cuartos', 'semis', 'tercero', 'final'].map(function(faseElim) {
                return (
                  <div key={faseElim} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, color: '#2a4060', fontWeight: 700, marginBottom: 8, letterSpacing: 2, textTransform: 'uppercase' }}>{faseElim}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {PARTIDOS_ELIMINATORIAS.filter(function(m) { return m.fase === faseElim }).map(function(m) {
                        const localR = resolverPlaceholder(m.local, realClasif, standingsVivo)
                        const visR = resolverPlaceholder(m.vis, realClasif, standingsVivo)
                        const realEqA = realClasif[m.id] || ''
                        const tieneEquipos2 = !esPlaceholder(localR) && !esPlaceholder(visR)
                        return (
                          <div key={m.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: tieneEquipos2 ? 6 : 0 }}>
                              <span style={{ flex: 1, fontSize: 12, textAlign: 'right', color: realEqA === localR && realEqA ? '#2a9d8f' : '#c8d8ea', fontWeight: realEqA === localR && realEqA ? 700 : 400 }}>{localR}</span>
                              <span style={{ color: '#2a4060', fontSize: 11, fontWeight: 700 }}>vs</span>
                              <span style={{ flex: 1, fontSize: 12, color: realEqA === visR && realEqA ? '#2a9d8f' : '#c8d8ea', fontWeight: realEqA === visR && realEqA ? 700 : 400 }}>{visR}</span>
                            </div>
                            {tieneEquipos2 && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                {[localR, visR].map(function(eq) {
                                  return (
                                    <button key={eq} onClick={function() { saveRealClasif(m.id, eq) }}
                                      style={{ flex: 1, padding: '5px 8px', borderRadius: 8, border: '1.5px solid ' + (realEqA === eq ? 'rgba(42,157,143,.6)' : 'rgba(255,215,0,0.2)'), background: realEqA === eq ? 'rgba(42,157,143,.2)' : 'rgba(255,215,0,0.04)', color: realEqA === eq ? '#2a9d8f' : '#ffd700', fontSize: 12, cursor: 'pointer', fontWeight: realEqA === eq ? 700 : 400 }}>
                                      {eq}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                            {!tieneEquipos2 && <div style={{ fontSize: 11, color: '#2a4060' }}>Pendiente de resultados</div>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
