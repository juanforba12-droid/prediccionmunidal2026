import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import {
  PARTIDOS_GRUPOS, PARTIDOS_ELIMINATORIAS, TODAS_LAS_FASES,
  JORNADAS_GRUPOS, calcPts, AVATARS, COLORS, GRUPOS, flag
} from '../lib/data.js'

const ALL_MATCHES = [...PARTIDOS_GRUPOS, ...PARTIDOS_ELIMINATORIAS]

export default function Game() {
  const { code } = useParams()
  const nav = useNavigate()

  const [group, setGroup] = useState(null)
  const [players, setPlayers] = useState([])
  const [myPlayer, setMyPlayer] = useState(null)
  const [preds, setPreds] = useState({})       // { matchId: { l, v } }
  const [reales, setReales] = useState({})     // { matchId: { l, v } }
  const [campeon, setCampeon] = useState('')   // predicted champion
  const [campeonReal, setCampeonReal] = useState('') // real champion
  const [allPreds, setAllPreds] = useState({}) // { playerId: { matchId: {l,v} } }

  const [tab, setTab] = useState('quiniela')
  const [fase, setFase] = useState('grupos')
  const [jornada, setJornada] = useState('J1')
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const isCreator = group && myPlayer && group.creator_id === myPlayer.id
  const shareUrl = `${window.location.origin}/unirse/${code}`

  // ── Load initial data ────────────────────────────────────────────────────
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
      if (grpRes.data) setGroup(grpRes.data)
      if (plRes.data) setPlayers(plRes.data)

      // Build reales map
      const rMap = {}
      realesRes.data?.forEach(r => { rMap[r.match_id] = { l: r.goals_local ?? '', v: r.goals_vis ?? '' } })
      setReales(rMap)
      if (grpRes.data?.campeon_real) setCampeonReal(grpRes.data.campeon_real)

      // Build all preds map
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

      // My champion prediction
      const myPlayerFull = plRes.data?.find(p => p.id === me.id)
      if (myPlayerFull?.campeon_pred) setCampeon(myPlayerFull.campeon_pred)
    } catch(e) { console.error(e) }
    setLoading(false)
  }, [code])

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const ch = supabase.channel(`group-${code}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'results', filter: `group_code=eq.${code}` }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `group_code=eq.${code}` }, () => loadAll())
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [code, loadAll])

  // ── Save prediction (debounced) ───────────────────────────────────────────
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

  // ── Save champion prediction ──────────────────────────────────────────────
  const saveCampeon = async (val) => {
    setCampeon(val)
    const me = JSON.parse(localStorage.getItem(`player_${code}`) || '{}')
    await supabase.from('players').update({ campeon_pred: val }).eq('id', me.id)
  }

  // ── Admin: save real result ───────────────────────────────────────────────
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

  const saveChampionReal = async (val) => {
    setCampeonReal(val)
    await supabase.from('groups').update({ campeon_real: val }).eq('code', code)
  }

  // ── Compute scores ────────────────────────────────────────────────────────
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
    // Champion bonus: 10 pts
    const pl = players.find(p => p.id === playerId)
    if (pl?.campeon_pred && campeonReal && pl.campeon_pred.toLowerCase() === campeonReal.toLowerCase()) {
      pts += 10
    }
    return { pts, exact, result }
  }

  const ranking = [...players].map(p => ({ ...p, ...computeScore(p.id) }))
    .sort((a, b) => b.pts - a.pts || b.exact - a.exact)

  const myScore = myPlayer ? computeScore(myPlayer.id) : { pts: 0, exact: 0, result: 0 }
  const myRank = ranking.findIndex(p => p.id === myPlayer?.id) + 1

  const completed = ALL_MATCHES.filter(m => reales[m.id]?.l !== '' && reales[m.id]?.l != null).length

  // ── Copy share link ───────────────────────────────────────────────────────
  const handleCopy = () => {
    navigator.clipboard?.writeText(shareUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
      <div style={{ fontSize:40, animation:'pulse 1.2s infinite' }}>⚽</div>
      <div style={{ color:'#3a5070' }}>Cargando grupo...</div>
    </div>
  )

  const matchesToShow = fase === 'grupos'
    ? PARTIDOS_GRUPOS.filter(m => m.jornada === jornada)
    : PARTIDOS_ELIMINATORIAS.filter(m => m.fase === fase)

  return (
    <div style={{ minHeight:'100vh', paddingBottom:80, position:'relative' }}>
      <div className="bg-dots" />

      {/* ── TOP BAR */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(8,12,20,.96)', backdropFilter:'blur(14px)', borderBottom:'1px solid rgba(255,255,255,.06)', padding:'10px 16px' }}>
        <div style={{ maxWidth:640, margin:'0 auto', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, color:'#e63946', letterSpacing:1 }}>QUINIELA</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>{group?.name}</div>
            <div style={{ fontSize:10, color:'#2a4060' }}>Código: <span style={{ color:'#e63946', fontWeight:700, letterSpacing:3 }}>{code}</span></div>
          </div>
          <button onClick={handleCopy} style={{ background:copied?'rgba(42,157,143,.2)':'rgba(255,255,255,.07)', border:`1px solid ${copied?'#2a9d8f':'rgba(255,255,255,.1)'}`, borderRadius:10, color:copied?'#2a9d8f':'#a0b4cc', padding:'7px 14px', cursor:'pointer', fontSize:12, fontWeight:700, transition:'all .2s' }}>
            {copied ? '✓ Copiado' : '📋 Compartir'}
          </button>
        </div>
      </div>

      <div style={{ maxWidth:640, margin:'0 auto', padding:'0 12px' }}>

        {/* ── MY CARD */}
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

        {/* ── MAIN TABS */}
        <div style={{ display:'flex', gap:6, marginBottom:14 }}>
          {[['quiniela','📝 Quiniela'],['ranking','🏅 Ranking'],['tabla','📊 Grupos'],['grupo','👥 Grupo']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex:1, padding:'10px 4px', borderRadius:10, border:'none', cursor:'pointer', fontWeight:700, fontSize:12, background:tab===k?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)', color:tab===k?'#e8eaf0':'#2a4060', borderBottom:tab===k?`3px solid ${myPlayer?.color||'#e63946'}`:'3px solid transparent', transition:'all .2s' }}>
              {l}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════
            QUINIELA TAB
        ════════════════════════════════════════════════════════ */}
        {tab === 'quiniela' && (<>
          {/* Phase selector */}
          <div style={{ display:'flex', gap:6, marginBottom:12, overflowX:'auto', paddingBottom:4 }}>
            {TODAS_LAS_FASES.map(f => (
              <button key={f.key} onClick={() => setFase(f.key)} style={{ flexShrink:0, padding:'8px 14px', borderRadius:20, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background:fase===f.key?`${myPlayer?.color||'#e63946'}22`:'rgba(255,255,255,0.05)', color:fase===f.key?(myPlayer?.color||'#e63946'):'#2a4060', border:`1px solid ${fase===f.key?(myPlayer?.color||'#e63946')+'44':'transparent'}`, transition:'all .2s', whiteSpace:'nowrap' }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Jornada selector (groups only) */}
          {fase === 'grupos' && (
            <div style={{ display:'flex', gap:6, marginBottom:14 }}>
              {JORNADAS_GRUPOS.map(j => (
                <button key={j.key} onClick={() => setJornada(j.key)} style={{ flex:1, padding:'8px 4px', borderRadius:8, border:'none', cursor:'pointer', fontWeight:700, fontSize:11, background:jornada===j.key?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)', color:jornada===j.key?'#e8eaf0':'#2a4060', borderBottom:jornada===j.key?`2px solid ${myPlayer?.color||'#e63946'}`:'2px solid transparent', transition:'all .2s' }}>
                  <div>{j.label}</div>
                  <div style={{ fontWeight:400, fontSize:9 }}>{j.dates}</div>
                </button>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, padding:'8px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10 }}>
            <span style={{ fontSize:11, color:'#2a4060' }}>Partidos jugados</span>
            <div style={{ flex:1, height:4, borderRadius:2, background:'#1a2a3a', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${(completed/ALL_MATCHES.length)*100}%`, background:`linear-gradient(90deg,${myPlayer?.color||'#e63946'},${myPlayer?.color||'#e63946'}88)`, borderRadius:2, transition:'width .5s' }} />
            </div>
            <span style={{ fontSize:11, fontWeight:700 }}>{completed}/{ALL_MATCHES.length}</span>
          </div>

          {/* Champion prediction (show in Final tab) */}
          {fase === 'final' && (
            <div className="card" style={{ marginBottom:16, background:'rgba(255,215,0,0.06)', border:'1px solid rgba(255,215,0,0.2)' }}>
              <div style={{ fontWeight:700, fontSize:14, color:'#ffd700', marginBottom:12 }}>🏆 Predicción: ¿Quién será CAMPEÓN?</div>
              <input className="inp" placeholder="Ej: España, Argentina..." value={campeon}
                onChange={e => saveCampeon(e.target.value)} maxLength={30}
                style={{ marginBottom: isCreator ? 12 : 0 }} />
              {isCreator && (<>
                <div style={{ fontSize:12, color:'#2a7070', marginBottom:8 }}>👑 Admin — Campeón real:</div>
                <input className="inp" placeholder="Equipo campeón real" value={campeonReal}
                  onChange={e => saveChampionReal(e.target.value)} maxLength={30} />
                <div style={{ fontSize:11, color:'#ffd700', marginTop:8 }}>⭐ Acertar el campeón = 10 puntos bonus</div>
              </>)}
            </div>
          )}

          {/* Matches */}
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {matchesToShow.map((m, idx) => {
              const pl = preds[m.id]?.l ?? ''
              const pv = preds[m.id]?.v ?? ''
              const rl = reales[m.id]?.l ?? ''
              const rv = reales[m.id]?.v ?? ''
              const pts = calcPts(pl, pv, rl, rv)
              const hasReal = rl !== '' && rl != null
              const hasPred = pl !== '' || pv !== ''
              const mc = myPlayer?.color || '#e63946'
              const ptsBg = pts === 3 ? '#2a9d8f' : pts === 1 ? '#f4a261' : pts === 0 && hasReal ? '#e63946' : null

              return (
                <div key={m.id} className="fade-up" style={{ animationDelay:`${idx*0.02}s`, background:hasPred?`${mc}0d`:'rgba(255,255,255,0.03)', border:`1px solid ${hasPred?mc+'33':'rgba(255,255,255,0.07)'}`, borderRadius:12, padding:'12px 14px', transition:'all .2s' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                    <span style={{ fontSize:10, color:'#2a4060', background:'rgba(255,255,255,0.05)', padding:'2px 8px', borderRadius:20 }}>
                      {m.grupo ? `Grupo ${m.grupo} · ` : ''}{m.fecha}
                    </span>
                    {ptsBg && <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#fff', background:ptsBg, padding:'2px 10px', borderRadius:20 }}>
                      {pts === 3 ? '⭐ 3 pts' : pts === 1 ? '✓ 1 pt' : '✗ 0 pts'}
                    </span>}
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, textAlign:'right', fontSize:13, fontWeight:700 }}>{flag(m.local)} {m.local}</div>
                    <div style={{ display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
                      <input type="text" inputMode="numeric" maxLength={2} value={pl}
                        onChange={e => savePred(m.id, 'l', e.target.value)} placeholder="–"
                        style={{ width:40, height:40, textAlign:'center', fontSize:20, fontWeight:900, borderRadius:8, border:`2px solid ${pl!==''?mc:'rgba(255,255,255,0.1)'}`, background:`${mc}18`, color:mc, transition:'border .2s' }} />
                      <span style={{ color:'#1a2a3a', fontSize:18, fontWeight:900 }}>:</span>
                      <input type="text" inputMode="numeric" maxLength={2} value={pv}
                        onChange={e => savePred(m.id, 'v', e.target.value)} placeholder="–"
                        style={{ width:40, height:40, textAlign:'center', fontSize:20, fontWeight:900, borderRadius:8, border:`2px solid ${pv!==''?mc:'rgba(255,255,255,0.1)'}`, background:`${mc}18`, color:mc, transition:'border .2s' }} />
                    </div>
                    <div style={{ flex:1, textAlign:'left', fontSize:13, fontWeight:700 }}>{m.vis} {flag(m.vis)}</div>
                  </div>

                  {/* Admin: real result */}
                  {isCreator && (
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize:11, color:'#2a9d8f', fontWeight:700 }}>✅ Real:</span>
                      <input type="text" inputMode="numeric" maxLength={2} value={rl}
                        onChange={e => saveReal(m.id, 'l', e.target.value)}
                        style={{ width:34, height:30, textAlign:'center', fontSize:14, fontWeight:700, borderRadius:6, border:'1.5px solid rgba(42,157,143,.4)', background:'rgba(42,157,143,.12)', color:'#2a9d8f' }} />
                      <span style={{ color:'#2a9d8f' }}>:</span>
                      <input type="text" inputMode="numeric" maxLength={2} value={rv}
                        onChange={e => saveReal(m.id, 'v', e.target.value)}
                        style={{ width:34, height:30, textAlign:'center', fontSize:14, fontWeight:700, borderRadius:6, border:'1.5px solid rgba(42,157,143,.4)', background:'rgba(42,157,143,.12)', color:'#2a9d8f' }} />
                      <span style={{ fontSize:10, color:'#1a3020', marginLeft:4 }}>Solo tú (admin)</span>
                    </div>
                  )}
                  {!isCreator && hasReal && (
                    <div style={{ textAlign:'center', marginTop:8 }}>
                      <span style={{ fontSize:11, color:'#2a9d8f', background:'rgba(42,157,143,.12)', padding:'2px 12px', borderRadius:20 }}>
                        ✅ Resultado: {rl} – {rv}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>)}

        {/* ════════════════════════════════════════════════════════
            RANKING TAB
        ════════════════════════════════════════════════════════ */}
        {tab === 'ranking' && (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div className="tag" style={{ textAlign:'center', marginBottom:8 }}>Clasificación en vivo</div>

            {campeonReal && (
              <div style={{ background:'rgba(255,215,0,0.08)', border:'1px solid rgba(255,215,0,0.25)', borderRadius:12, padding:'10px 16px', textAlign:'center', marginBottom:4 }}>
                <span style={{ fontSize:12, color:'#ffd700' }}>🏆 Campeón real: <strong>{campeonReal}</strong> · Bonus 10 pts por acertarlo</span>
              </div>
            )}

            {players.length === 1 && (
              <div style={{ textAlign:'center', padding:'30px 20px', color:'#2a4060', fontSize:14 }}>
                Comparte el enlace para que se unan tus amigos 👇
                <div style={{ marginTop:8, fontFamily:"'Bebas Neue',sans-serif", fontSize:28, color:'#e63946', letterSpacing:4 }}>{code}</div>
              </div>
            )}

            {ranking.map((pl, rank) => {
              const isMe = pl.id === myPlayer?.id
              const medal = ['🥇','🥈','🥉'][rank] || `${rank+1}º`
              const campPred = pl.campeon_pred
              const campHit = campeonReal && campPred && campPred.toLowerCase() === campeonReal.toLowerCase()
              return (
                <div key={pl.id} className="fade-up" style={{ animationDelay:`${rank*0.05}s`, background:isMe?`${pl.color}18`:'rgba(255,255,255,0.04)', border:`1px solid ${isMe?pl.color+'44':'rgba(255,255,255,0.07)'}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'center', gap:12, boxShadow:isMe?`0 0 24px ${pl.color}22`:'none' }}>
                  <div style={{ fontSize:24, width:34, textAlign:'center' }}>{medal}</div>
                  <div style={{ fontSize:26, width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:`${pl.color}22`, borderRadius:10 }}>{pl.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:15, color:isMe?pl.color:'#c8d8ea' }}>{pl.name}{isMe?' (tú)':''}</div>
                    <div style={{ display:'flex', gap:10, marginTop:3, flexWrap:'wrap' }}>
                      <span style={{ fontSize:11, color:'#2a9d8f' }}>⭐ {pl.exact} exactos</span>
                      <span style={{ fontSize:11, color:'#f4a261' }}>✓ {pl.result} resultados</span>
                      {campPred && <span style={{ fontSize:11, color:campHit?'#ffd700':'#2a4060' }}>{campHit?'🏆':'🏆'} {campPred}</span>}
                    </div>
                    <div style={{ marginTop:6, height:4, borderRadius:2, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min((pl.pts/(ALL_MATCHES.length*3+10))*100,100)}%`, background:`linear-gradient(90deg,${pl.color},${pl.color}88)`, borderRadius:2, transition:'width .6s' }} />
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:pl.color, lineHeight:1 }}>{pl.pts}</div>
                    <div style={{ fontSize:10, color:'#2a4060' }}>pts</div>
                  </div>
                </div>
              )
            })}

            <div style={{ marginTop:8, padding:'14px', background:'rgba(255,255,255,0.03)', borderRadius:12, display:'flex', gap:20, justifyContent:'center', flexWrap:'wrap' }}>
              {[['⭐','3 pts','Marcador exacto'],['✓','1 pt','Resultado correcto'],['🏆','10 pts','Campeón acertado']].map(([ic,p,l]) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:18 }}>{ic}</div>
                  <div style={{ fontWeight:700, fontSize:14 }}>{p}</div>
                  <div style={{ fontSize:10, color:'#2a4060' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════
            TABLA DE GRUPOS TAB
        ════════════════════════════════════════════════════════ */}
        {tab === 'tabla' && (() => {
          // Compute standings from real results
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
            vis.gf   += gv; vis.gc   += gl
            if (gl > gv)      { local.pg++; local.pts+=3; vis.pp++ }
            else if (gl < gv) { vis.pg++;   vis.pts+=3;   local.pp++ }
            else              { local.pe++; local.pts++; vis.pe++; vis.pts++ }
          })

          const GROUP_COLORS = ['#e63946','#f4a261','#2a9d8f','#457b9d','#9b5de5','#e9c46a','#06d6a0','#ef476f','#118ab2','#ffd166','#e63946','#2a9d8f']

          return (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div className="tag" style={{ textAlign:'center', marginBottom:4 }}>Clasificación por grupos · se actualiza con resultados reales</div>
              {Object.entries(standings).map(([grp, teams], gi) => {
                const sorted = [...teams].sort((a,b) => b.pts-a.pts || (b.gf-b.gc)-(a.gf-a.gc) || b.gf-a.gf)
                const gc = GROUP_COLORS[gi % GROUP_COLORS.length]
                return (
                  <div key={grp} className="card fade-up" style={{ padding:0, overflow:'hidden', animationDelay:`${gi*0.04}s` }}>
                    {/* Group header */}
                    <div style={{ background:`${gc}22`, borderBottom:`1px solid ${gc}44`, padding:'10px 16px', display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, color:gc }}>GRUPO {grp}</div>
                      <div style={{ fontSize:11, color:'#2a4060', marginLeft:'auto' }}>PJ · PG · PE · PP · GF · GC · Pts</div>
                    </div>
                    {/* Teams */}
                    {sorted.map((t, ti) => {
                      const isQ = ti < 2
                      return (
                        <div key={t.name} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', background: isQ ? `${gc}08` : 'transparent' }}>
                          <div style={{ fontSize:12, fontWeight:700, color: ti===0?'#ffd700': ti===1?'#c0c0c0':'#2a4060', width:16, textAlign:'center' }}>
                            {ti===0?'🥇':ti===1?'🥈':ti===2?'🥉':`${ti+1}`}
                          </div>
                          <div style={{ flex:1, fontSize:13, fontWeight: isQ?700:400, color: isQ?'#e8eaf0':'#8a9ab0' }}>{flag(t.name)} {t.name}</div>
                          {[t.pj,t.pg,t.pe,t.pp,t.gf,t.gc,t.pts].map((v,i) => (
                            <div key={i} style={{ width:22, textAlign:'center', fontSize:12, fontWeight: i===6?700:400, color: i===6?(t.pts>0?gc:'#2a4060'):'#4a6080' }}>{v}</div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
              {!isCreator && <div style={{ textAlign:'center', fontSize:11, color:'#1a2a3a', marginTop:4 }}>El admin actualiza la tabla metiendo los resultados reales en la pestaña Quiniela</div>}
            </div>
          )
        })()}

        {/* ════════════════════════════════════════════════════════
            GRUPO TAB
        ════════════════════════════════════════════════════════ */}
        {tab === 'grupo' && (
          <div>
            <div className="card fade-up" style={{ marginBottom:14 }}>
              <div style={{ fontSize:13, color:'#2a7070', marginBottom:4 }}>Nombre del grupo</div>
              <div style={{ fontWeight:700, fontSize:18 }}>{group?.name}</div>
              <div style={{ fontSize:12, color:'#2a4060', marginTop:2 }}>{players.length} jugadores · {completed}/{ALL_MATCHES.length} partidos jugados</div>

              <div style={{ marginTop:18, padding:16, background:'rgba(230,57,70,0.08)', border:'1px solid rgba(230,57,70,.2)', borderRadius:12, textAlign:'center' }}>
                <div style={{ fontSize:11, color:'#2a4060', marginBottom:6, letterSpacing:3, textTransform:'uppercase' }}>Enlace para compartir</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, color:'#e63946', letterSpacing:6, marginBottom:6 }}>{code}</div>
                <div style={{ fontSize:11, color:'#2a4060', marginBottom:12, wordBreak:'break-all' }}>{shareUrl}</div>
                <button onClick={handleCopy} className="btn btn-ghost" style={{ padding:'8px 20px', fontSize:13, border:`1px solid ${copied?'#2a9d8f':'rgba(255,255,255,.12)'}`, color:copied?'#2a9d8f':'#a0b4cc' }}>
                  {copied ? '✓ ¡Enlace copiado!' : '📋 Copiar enlace'}
                </button>
                <div style={{ fontSize:10, color:'#1a2a3a', marginTop:10 }}>Tus amigos entran al enlace y eligen su nombre</div>
              </div>
            </div>

            <div className="card fade-up" style={{ marginBottom:14, animationDelay:'.08s' }}>
              <div style={{ fontSize:13, color:'#2a7070', marginBottom:12 }}>Jugadores ({players.length})</div>
              {players.map(pl => (
                <div key={pl.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize:20, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', background:`${pl.color}22`, borderRadius:8 }}>{pl.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:pl.id===myPlayer?.id?pl.color:'#c8d8ea' }}>
                      {pl.name} {pl.id===myPlayer?.id?'(tú)':''}
                    </div>
                    {pl.id===group?.creator_id && <div style={{ fontSize:10, color:'#f4a261' }}>👑 Admin</div>}
                    {pl.campeon_pred && <div style={{ fontSize:10, color:'#2a4060' }}>🏆 Pred. campeón: {pl.campeon_pred}</div>}
                  </div>
                  <div style={{ width:12, height:12, borderRadius:'50%', background:pl.color }} />
                </div>
              ))}
            </div>

            <button className="btn btn-ghost fade-up" style={{ width:'100%', animationDelay:'.12s' }}
              onClick={() => { localStorage.removeItem(`player_${code}`); nav('/') }}>
              🚪 Salir del grupo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
