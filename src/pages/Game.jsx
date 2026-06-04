import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import {
  PARTIDOS_GRUPOS, PARTIDOS_ELIMINATORIAS, TODAS_LAS_FASES,
  JORNADAS_GRUPOS, calcPts, AVATARS, COLORS, GRUPOS
} from '../lib/data.js'

const ALL_MATCHES = [...PARTIDOS_GRUPOS, ...PARTIDOS_ELIMINATORIAS]

export default function Game() {
  const { code } = useParams()
  const nav = useNavigate()

  const [group, setGroup] = useState(null)
  const [players, setPlayers] = useState([])
  const [myPlayer, setMyPlayer] = useState(null)
  const [preds, setPreds] = useState({})
  const [reales, setReales] = useState({})
  const [allPreds, setAllPreds] = useState({})
  const [extras, setExtras] = useState({})
  const [extrasReal, setExtrasReal] = useState({})
  const [allExtras, setAllExtras] = useState({})
  const [tab, setTab] = useState('quiniela')
  const [fase, setFase] = useState('grupos')
  const [jornada, setJornada] = useState('J1')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const isCreator = group && myPlayer && group.creator_id === myPlayer.id
  const shareUrl = `${window.location.origin}/unirse/${code}`

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
        if (grpRes.data.extras_real) setExtrasReal(grpRes.data.extras_real)
      }
      if (plRes.data) setPlayers(plRes.data)
      const rMap = {}
      realesRes.data?.forEach(r => { rMap[r.match_id] = { l: r.goals_local ?? '', v: r.goals_vis ?? '' } })
      setReales(rMap)
      const me = JSON.parse(localStorage.getItem(`player_${code}`) || '{}')
      const apMap = {}
      const myMap = {}
      predsRes.data?.forEach(p => {
        if (!apMap[p.player_id]) apMap[p.player_id] = {}
        apMap[p.player_id][p.match_id] = { l: p.goals_local ?? '', v: p.goals_vis ?? '' }
        if (p.player_id === me.id) myMap[p.match_id] = { l: p.goals_local ?? '', v: p.goals_vis ?? '' }
      })
      setAllPreds(apMap)
      setPreds(myMap)
      const allExtrasMap = {}
      plRes.data?.forEach(pl => {
        if (pl.extras_pred) allExtrasMap[pl.id] = pl.extras_pred
        if (pl.id === me.id && pl.extras_pred) setExtras(pl.extras_pred)
      })
      setAllExtras(allExtrasMap)
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [code])

  useEffect(() => {
    const ch = supabase.channel(`group-${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `group_code=eq.${code}` }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `group_code=eq.${code}` }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'groups', filter: `code=eq.${code}` }, () => loadAll())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [code, loadAll])

  const saveTimer = useRef({})
  const savePred = (matchId, side, val) => {
    const clean = val.replace(/\D/g, '').slice(0, 2)
    setPreds(p => ({ ...p, [matchId]: { ...(p[matchId] || {}), [side]: clean } }))
    clearTimeout(saveTimer.current[matchId])
    saveTimer.current[matchId] = setTimeout(async () => {
      const me = JSON.parse(localStorage.getItem(`player_${code}`) || '{}')
      const cur = { ...(preds[matchId] || {}), [side]: clean }
      await supabase.from('predictions').upsert({
        group_code: code, player_id: me.id, match_id: matchId,
        goals_local: cur.l !== '' ? parseInt(cur.l) : null,
        goals_vis: cur.v !== '' ? parseInt(cur.v) : null,
      }, { onConflict: 'group_code,player_id,match_id' })
    }, 600)
  }

  const saveReal = async (matchId, side, val) => {
    const clean = val.replace(/\D/g, '').slice(0, 2)
    setReales(r => ({ ...r, [matchId]: { ...(r[matchId] || {}), [side]: clean } }))
    const cur = { ...(reales[matchId] || {}), [side]: clean }
    await supabase.from('results').upsert({
      group_code: code, match_id: matchId,
      goals_local: cur.l !== '' ? parseInt(cur.l) : null,
      goals_vis: cur.v !== '' ? parseInt(cur.v) : null,
    }, { onConflict: 'group_code,match_id' })
  }

  const extrasTimer = useRef(null)
  const saveExtras = (newExtras) => {
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

  const computeExtrasPoints = (playerId) => {
    const pp = allExtras[playerId] || {}
    const er = extrasReal || {}
    let pts = 0
    if (er.balon1 && pp.balon1 && pp.balon1.toLowerCase() === er.balon1.toLowerCase()) pts += 5
    if (er.balon2 && pp.balon2 && pp.balon2.toLowerCase() === er.balon2.toLowerCase()) pts += 3
    if (er.balon3 && pp.balon3 && pp.balon3.toLowerCase() === er.balon3.toLowerCase()) pts += 1
    return pts
  }

  const computeScore = (playerId) => {
    const pp = allPreds[playerId] || {}
    let pts = 0, exact = 0, result = 0
    ALL_MATCHES.forEach(m => {
      const pr = pp[m.id] || {}
      const re = reales[m.id] || {}
      const p = calcPts(pr.l ?? '', pr.v ?? '', re.l ?? '', re.v ?? '')
      if (p === 3) { pts += 3; exact++ }
      else if (p === 1) { pts += 1; result++ }
    })
    pts += computeExtrasPoints(playerId)
    return { pts, exact, result }
  }

  const ranking = [...players].map(p => ({ ...p, ...computeScore(p.id) }))
    .sort((a, b) => b.pts - a.pts || b.exact - a.exact)

  const myScore = myPlayer ? computeScore(myPlayer.id) : { pts: 0, exact: 0, result: 0 }
  const myRank = ranking.findIndex(p => p.id === myPlayer?.id) + 1
  const completed = ALL_MATCHES.filter(m => reales[m.id]?.l !== '' && reales[m.id]?.l != null).length

  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const kickPlayer = async (playerId) => {
    if (!isCreator) return
    if (!window.confirm('¿Seguro que quieres echar a este jugador del grupo?')) return
    await supabase.from('players').delete().eq('id', playerId)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:40 }}>⚽</div>
      <div style={{ color:'#3a5070' }}>Cargando grupo...</div>
    </div>
  )

  const matchesToShow = fase === 'grupos'
    ? PARTIDOS_GRUPOS.filter(m => m.jornada === jornada)
    : PARTIDOS_ELIMINATORIAS.filter(m => m.fase === fase)

  const inpStyle = (filled) => ({
    width:'100%', padding:'10px 14px', borderRadius:10,
    border:`1px solid ${filled ? 'rgba(42,157,143,0.5)' : 'rgba(255,255,255,0.1)'}`,
    background: filled ? 'rgba(42,157,143,0.08)' : 'rgba(255,255,255,0.05)',
    color:'#e8eaf0', fontSize:14, boxSizing:'border-box', outline:'none'
  })

  const realInpStyle = {
    width:'100%', padding:'10px 14px', borderRadius:10,
    border:'1px solid rgba(255,215,0,0.3)',
    background:'rgba(255,215,0,0.06)',
    color:'#ffd700', fontSize:14, boxSizing:'border-box', outline:'none'
  }

  const MATCH_DATES = {
    'Jue 11 Jun': new Date('2026-06-11'), 'Vie 12 Jun': new Date('2026-06-12'),
    'Sáb 13 Jun': new Date('2026-06-13'), 'Dom 14 Jun': new Date('2026-06-14'),
    'Lun 15 Jun': new Date('2026-06-15'), 'Mar 16 Jun': new Date('2026-06-16'),
    'Mié 17 Jun': new Date('2026-06-17'), 'Jue 18 Jun': new Date('2026-06-18'),
    'Vie 19 Jun': new Date('2026-06-19'), 'Sáb 20 Jun': new Date('2026-06-20'),
    'Dom 21 Jun': new Date('2026-06-21'), 'Lun 22 Jun': new Date('2026-06-22'),
    'Mar 23 Jun': new Date('2026-06-23'), 'Mié 24 Jun': new Date('2026-06-24'),
    'Jue 25 Jun': new Date('2026-06-25'), 'Vie 26 Jun': new Date('2026-06-26'),
    'Sáb 27 Jun': new Date('2026-06-27'), 'Mar 1 Jul': new Date('2026-07-01'),
    'Mié 2 Jul': new Date('2026-07-02'), 'Jue 3 Jul': new Date('2026-07-03'),
    'Vie 4 Jul': new Date('2026-07-04'), 'Sáb 5 Jul': new Date('2026-07-05'),
    'Mar 8 Jul': new Date('2026-07-08'), 'Mié 9 Jul': new Date('2026-07-09'),
    'Jue 10 Jul': new Date('2026-07-10'), 'Vie 11 Jul': new Date('2026-07-11'),
    'Mar 15 Jul': new Date('2026-07-15'), 'Mié 16 Jul': new Date('2026-07-16'),
    'Sáb 19 Jul': new Date('2026-07-19'),
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
          <button onClick={handleCopy} style={{ background:copied?'rgba(42,157,143,.2)':'rgba(255,255,255,.07)', border:`1px solid ${copied?'#2a9d8f':'rgba(255,255,255,.1)'}`, borderRadius:10, color:copied?'#2a9d8f':'#a0b4cc', padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:700 }}>
            {copied ? '✓ Copiado' : '📋 Compartir'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'0 12px' }}>

        {/* MY CARD */}
        {myPlayer && (
          <div style={{ background:`linear-gradient(135deg,${myPlayer.color}20,${myPlayer.color}08)`, border:`1px solid ${myPlayer.color}44`, borderRadius:16, padding:'14px 18px', margin:'14px 0', display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ fontSize:32, width:46, height:46, display:'flex', alignItems:'center', justifyContent:'center', background:`${myPlayer.color}22`, borderRadius:12 }}>{myPlayer.avatar}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:800, fontSize:17, color:myPlayer.color }}>{myPlayer.name}</div>
              <div style={{ fontSize:11, color:'#2a4060' }}>{isCreator ? '👑 Admin del grupo' : `${players.length} jugadores`}</div>
            </div>
            <div style={{ textAlign:'center', marginRight:8 }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:34, color:myPlayer.color, lineHeight:1 }}>{myScore.pts}</div>
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
          {[['quiniela','📝'],['extras','🎯'],['ranking','🏅'],['tabla','📊'],['grupo','👥']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'10px 4px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background:tab===k?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)', color:tab===k?'#e8eaf0':'#2a4060', borderBottom:tab===k?`3px solid ${myPlayer?.color||'#e63946'}`:'3px solid transparent', whiteSpace:'nowrap' }}>
              {l} {k.charAt(0).toUpperCase()+k.slice(1)}
            </button>
          ))}
        </div>

        {/* QUINIELA TAB */}
        {tab === 'quiniela' && (<>
          <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:4 }}>
            {TODAS_LAS_FASES.map(f => (
              <button key={f.key} onClick={() => setFase(f.key)} style={{ flexShrink:0, padding:'8px 14px', borderRadius:20, cursor:'pointer', fontWeight:700, fontSize:11, background:fase===f.key?`${myPlayer?.color||'#e63946'}22`:'rgba(255,255,255,0.05)', color:fase===f.key?(myPlayer?.color||'#e63946'):'#2a4060', border:`1px solid ${fase===f.key?(myPlayer?.color||'#e63946')+'44':'transparent'}`, whiteSpace:'nowrap', outline:'none' }}>
                {f.label}
              </button>
            ))}
          </div>

          {fase === 'grupos' && (
            <div style={{ display:'flex', gap:6, marginBottom:14 }}>
              {JORNADAS_GRUPOS.map(j => (
                <button key={j.key} onClick={() => setJornada(j.key)} style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background:jornada===j.key?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)', color:jornada===j.key?'#e8eaf0':'#2a4060', borderBottom:jornada===j.key?`2px solid ${myPlayer?.color||'#e63946'}`:'2px solid transparent' }}>
                  <div>{j.label}</div>
                  <div style={{ fontWeight:400, fontSize:9 }}>{j.dates}</div>
                </button>
              ))}
            </div>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'8px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10 }}>
            <span style={{ fontSize:11, color:'#2a4060' }}>Partidos jugados</span>
            <div style={{ flex:1, height:4, borderRadius:2, background:'#1a2a3a', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(completed/ALL_MATCHES.length)*100}%`, background:`linear-gradient(90deg,${myPlayer?.color||'#e63946'},${myPlayer?.color||'#e63946'}88)`, borderRadius:2 }} />
            </div>
            <span style={{ fontSize:11, fontWeight:700 }}>{completed}/{ALL_MATCHES.length}</span>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {matchesToShow.map((m) => {
              const pl = preds[m.id]?.l ?? ''
              const pv = preds[m.id]?.v ?? ''
              const rl = reales[m.id]?.l ?? ''
              const rv = reales[m.id]?.v ?? ''
              const pts = calcPts(pl, pv, rl, rv)
              const hasReal = rl !== '' && rl != null
              const hasPred = pl !== '' || pv !== ''
              const mc = myPlayer?.color || '#e63946'
              const ptsBg = pts === 3 ? '#2a9d8f' : pts === 1 ? '#f4a261' : pts === 0 && hasReal ? '#e63946' : null
              const matchDate = MATCH_DATES[m.fecha]
              const now = new Date()
              const lockDate = matchDate ? new Date(matchDate.getTime() - 24*60*60*1000) : null
              const isLocked = lockDate ? now >= lockDate : false

              return (
                <div key={m.id} style={{ background: hasPred?`${mc}0d`:'rgba(255,255,255,0.03)', border:`1px solid ${hasPred?mc+'33':'rgba(255,255,255,0.07)'}`, borderRadius:12, padding:'12px 14px', opacity: isLocked && !hasPred ? 0.7 : 1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                    <span style={{ fontSize:10, color:'#2a4060', background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:20 }}>
                      {m.grupo ? `Grupo ${m.grupo} · ` : ''}{m.fecha}
                    </span>
                    {isLocked && !hasReal && <span style={{ fontSize:10, color:'#f4a261', background:'rgba(244,162,97,0.12)', padding:'2px 8px', borderRadius:20 }}>🔒 Cerrado</span>}
                    {ptsBg && <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#fff', background:ptsBg, padding:'2px 10px', borderRadius:20 }}>
                      {pts === 3 ? '⭐ 3 pts' : pts === 1 ? '✓ 1 pt' : '✗ 0 pts'}
                    </span>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, textAlign:'right', fontSize:13, fontWeight:700 }}>{m.local}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                      <input type="text" inputMode="numeric" maxLength={2} value={pl}
                        onChange={e => !isLocked && savePred(m.id, 'l', e.target.value)} placeholder="–" readOnly={isLocked}
                        style={{ width:40, height:40, textAlign:'center', fontSize:20, fontWeight:900, borderRadius:8, border:`2px solid ${pl!==''?mc:isLocked?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.1)'}`, background: isLocked ? 'rgba(255,255,255,0.04)' : `${mc}18`, color: isLocked ? '#3a5070' : mc, cursor: isLocked ? 'not-allowed' : 'text' }} />
                      <span style={{ color:'#1a2a3a', fontSize:18, fontWeight:900 }}>:</span>
                      <input type="text" inputMode="numeric" maxLength={2} value={pv}
                        onChange={e => !isLocked && savePred(m.id, 'v', e.target.value)} placeholder="–" readOnly={isLocked}
                        style={{ width:40, height:40, textAlign:'center', fontSize:20, fontWeight:900, borderRadius:8, border:`2px solid ${pv!==''?mc:isLocked?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.1)'}`, background: isLocked ? 'rgba(255,255,255,0.04)' : `${mc}18`, color: isLocked ? '#3a5070' : mc, cursor: isLocked ? 'not-allowed' : 'text' }} />
                    </div>
                    <div style={{ flex:1, textAlign:'left', fontSize:13, fontWeight:700 }}>{m.vis}</div>
                  </div>
                  {isCreator ? (
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize:11, color:'#2a9d8f', fontWeight:700 }}>✅ Real:</span>
                      <input type="text" inputMode="numeric" maxLength={2} value={rl} onChange={e => saveReal(m.id, 'l', e.target.value)} style={{ width:34, height:30, textAlign:'center', fontSize:14, fontWeight:700, borderRadius:6, border:'1.5px solid rgba(42,157,143,.4)', background:'rgba(42,157,143,.12)', color:'#2a9d8f' }} />
                      <span style={{ color:'#2a9d8f' }}>:</span>
                      <input type="text" inputMode="numeric" maxLength={2} value={rv} onChange={e => saveReal(m.id, 'v', e.target.value)} style={{ width:34, height:30, textAlign:'center', fontSize:14, fontWeight:700, borderRadius:6, border:'1.5px solid rgba(42,157,143,.4)', background:'rgba(42,157,143,.12)', color:'#2a9d8f' }} />
                    </div>
                  ) : (
                    <div style={{ textAlign:'center', marginTop:8 }}>
                      {hasReal ? (
                        <span style={{ fontSize:11, color:'#2a9d8f', background:'rgba(42,157,143,.12)', padding:'2px 12px', borderRadius:20 }}>✅ Resultado: {rl} – {rv}</span>
                      ) : (
                        <span style={{ fontSize:11, color:'#2a4060', background:'rgba(255,255,255,.04)', padding:'2px 12px', borderRadius:20 }}>⏳ Pendiente</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>)}

        {/* EXTRAS TAB */}
        {tab === 'extras' && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ background:'rgba(255,255,255,0.03)', borderRadius:12, padding:'12px 16px', fontSize:12, color:'#2a6070', lineHeight:1.6 }}>
              🎯 Predicciones especiales con puntos extra. Guarda tus predicciones antes de que empiece el torneo.
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:15, color:'#e8eaf0', marginBottom:4 }}>🏆 Premios del torneo</div>
              <div style={{ fontSize:11, color:'#2a4060', marginBottom:14 }}>5 pts Balón de Oro · 3 pts Bota de Oro · 1 pt Mejor joven</div>
              {[
                { key:'balon1', label:'🥇 Balón de Oro', pts:5 },
                { key:'balon2', label:'👟 Bota de Oro', pts:3 },
                { key:'balon3', label:'🌟 Mejor jugador joven', pts:1 },
              ].map(({ key, label, pts }) => {
                const myVal = extras[key] || ''
                const realVal = extrasReal[key] || ''
                const hit = realVal && myVal && myVal.toLowerCase() === realVal.toLowerCase()
                return (
                  <div key={key} style={{ marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color: hit ? '#2a9d8f' : '#a0b4cc' }}>{label}</span>
                      <span style={{ fontSize:11, color:'#2a4060' }}>+{pts} pts</span>
                    </div>
                    <input placeholder="Nombre del jugador..." value={myVal}
                      onChange={e => saveExtras({ ...extras, [key]: e.target.value })}
                      style={inpStyle(!!myVal)} />
                    {realVal && <div style={{ fontSize:11, color: hit?'#2a9d8f':'#e63946', marginTop:4 }}>
                      {hit ? `⭐ ¡Acertado! +${pts} pts` : `Real: ${realVal}`}
                    </div>}
                    {isCreator && (
                      <input placeholder={`Admin — ${label} real`} value={realVal}
                        onChange={e => saveExtrasReal({ ...extrasReal, [key]: e.target.value })}
                        style={{ ...realInpStyle, marginTop:6 }} />
                    )}
                  </div>
                )
              })}
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#e8eaf0', marginBottom:12 }}>👥 Predicciones de todos</div>
              {players.map(pl => {
                const ep = allExtras[pl.id] || {}
                const epts = computeExtrasPoints(pl.id)
                return (
                  <div key={pl.id} style={{ marginBottom:12, paddingBottom:12, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                      <span style={{ fontSize:18 }}>{pl.avatar}</span>
                      <span style={{ fontWeight:700, color:pl.color, fontSize:13 }}>{pl.name}</span>
                      <span style={{ marginLeft:'auto', fontSize:12, color:'#2a9d8f', fontWeight:700 }}>+{epts} pts extras</span>
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {[['🥇', ep.balon1], ['👟', ep.balon2], ['🌟', ep.balon3]]
                        .filter(([,v]) => v).map(([icon, val], i) => (
                        <span key={i} style={{ fontSize:11, background:'rgba(255,255,255,0.05)', padding:'3px 8px', borderRadius:20, color:'#8a9ab0' }}>{icon} {val}</span>
                      ))}
                      {!ep.balon1 && !ep.balon2 && !ep.balon3 && <span style={{ fontSize:11, color:'#2a4060' }}>Sin predicciones aún</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* RANKING TAB */}
        {tab === 'ranking' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ textAlign:'center', fontSize:11, color:'#2a4060', marginBottom:8 }}>Clasificación en vivo</div>
            {ranking.map((pl, rank) => {
              const isMe = pl.id === myPlayer?.id
              const medal = ['🥇','🥈','🥉'][rank] || `${rank+1}º`
              const epts = computeExtrasPoints(pl.id)
              return (
                <div key={pl.id} style={{ background:isMe?`${pl.color}18`:'rgba(255,255,255,0.04)', border:`1px solid ${isMe?pl.color+'44':'rgba(255,255,255,0.07)'}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ fontSize:24, width:34, textAlign:'center' }}>{medal}</div>
                  <div style={{ fontSize:26, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:`${pl.color}22`, borderRadius:10 }}>{pl.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:isMe?pl.color:'#c8d8ea' }}>{pl.name}{isMe?' (tú)':''}</div>
                    <div style={{ display:'flex', gap:10, marginTop:3, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, color:'#2a9d8f' }}>⭐ {pl.exact} exactos</span>
                      <span style={{ fontSize:11, color:'#f4a261' }}>✓ {pl.result} resultados</span>
                      {epts > 0 && <span style={{ fontSize:11, color:'#ffd700' }}>🎯 +{epts} extras</span>}
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

        {/* TABLA TAB */}
        {tab === 'tabla' && (() => {
          const standings = {}
          Object.entries(GRUPOS).forEach(([grp, teams]) => {
            standings[grp] = teams.map(t => ({ name: t, pj:0, pg:0, pe:0, pp:0, gf:0, gc:0, pts:0 }))
          })
          PARTIDOS_GRUPOS.forEach(m => {
            const rl = reales[m.id]?.l
            const rv = reales[m.id]?.v
            if (rl == null || rv == null || rl === '' || rv === '') return
            const gl = parseInt(rl), gv = parseInt(rv)
            const grpArr = standings[m.grupo]
            if (!grpArr) return
            const local = grpArr.find(t => t.name === m.local)
            const vis   = grpArr.find(t => t.name === m.vis)
            if (!local || !vis) return
            local.pj++; vis.pj++
            local.gf += gl; local.gc += gv
            vis.gf += gv; vis.gc += gl
            if (gl > gv) { local.pg++; local.pts+=3; vis.pp++ }
            else if (gl < gv) { vis.pg++; vis.pts+=3; local.pp++ }
            else { local.pe++; local.pts++; vis.pe++; vis.pts++ }
          })
          const GROUP_COLORS = ['#e63946','#f4a261','#2a9d8f','#457b9d','#9b5de5','#e9c46a','#06d6a0','#ef476f','#118ab2','#ffd166','#e63946','#2a9d8f']
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {Object.entries(standings).map(([grp, teams], gi) => {
                const sorted = [...teams].sort((a,b) => b.pts-a.pts || (b.gf-b.gc)-(a.gf-a.gc) || b.gf-a.gf)
                const gc = GROUP_COLORS[gi % GROUP_COLORS.length]
                return (
                  <div key={grp} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, overflow:'hidden' }}>
                    <div style={{ background:`${gc}22`, borderBottom:`1px solid ${gc}44`, padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:gc }}>GRUPO {grp}</div>
                      <div style={{ fontSize:11, color:'#2a4060', marginLeft:'auto' }}>PJ · PG · PE · PP · GF · GC · Pts</div>
                    </div>
                    {sorted.map((t, ti) => (
                      <div key={t.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', background: ti < 2 ? `${gc}08` : 'transparent' }}>
                        <div style={{ fontSize:12, fontWeight:700, color: ti===0?'#ffd700': ti===1?'#c0c0c0':'#2a4060', width:16, textAlign:'center' }}>
                          {ti===0?'🥇':ti===1?'🥈':ti===2?'🥉':`${ti+1}`}
                        </div>
                        <div style={{ flex:1, fontSize:13, fontWeight: ti<2?700:400, color: ti<2?'#e8eaf0':'#8a9ab0' }}>{t.name}</div>
                        {[t.pj,t.pg,t.pe,t.pp,t.gf,t.gc,t.pts].map((v,i) => (
                          <div key={i} style={{ width:22, textAlign:'center', fontSize:12, fontWeight: i===6?700:400, color: i===6?(t.pts>0?gc:'#2a4060'):'#4a6080' }}>{v}</div>
                        ))}
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )
        })()}

        {/* GRUPO TAB */}
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
                  {copied ? '✓ ¡Enlace copiado!' : '📋 Copiar enlace'}
                </button>
              </div>
            </div>
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:16, marginBottom:14 }}>
              <div style={{ fontSize:13, color:'#2a7070', marginBottom:12 }}>Jugadores ({players.length})</div>
              {players.map(pl => (
                <div key={pl.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize:20, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:`${pl.color}22`, borderRadius:8 }}>{pl.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:pl.id===myPlayer?.id?pl.color:'#c8d8ea' }}>
                      {pl.name} {pl.id===myPlayer?.id?'(tú)':''}
                    </div>
                    {pl.id===group?.creator_id && <div style={{ fontSize:10, color:'#f4a261' }}>👑 Admin</div>}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:12, height:12, borderRadius:'50%', background:pl.color }} />
                    {isCreator && pl.id !== myPlayer?.id && (
                      <button onClick={() => kickPlayer(pl.id)}
                        style={{ background:'rgba(230,57,70,0.12)', border:'1px solid rgba(230,57,70,0.3)', borderRadius:6, color:'#e63946', fontSize:11, padding:'3px 8px', cursor:'pointer', fontWeight:600 }}>
                        Echar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { localStorage.removeItem(`player_${code}`); nav('/') }}
              style={{ width:'100%', padding:12, background:'none', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#4a6080', cursor:'pointer', fontSize:14 }}>
              🚪 Salir del grupo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
