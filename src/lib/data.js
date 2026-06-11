export const GRUPOS = {
  A: ['México', 'Sudáfrica', 'Corea del Sur', 'Rep. Checa'],
  B: ['Canadá', 'Bosnia-Herz.', 'Qatar', 'Suiza'],
  C: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
  D: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía'],
  E: ['Alemania', 'Curazao', 'C. de Marfil', 'Ecuador'],
  F: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
  G: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
  H: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
  I: ['Francia', 'Senegal', 'Iraq', 'Noruega'],
  J: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
  K: ['Portugal', 'R.D. Congo', 'Uzbekistán', 'Colombia'],
  L: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
}

// lockTime = hora de inicio del partido en hora española (CEST = UTC+2)
// J2, J3 y eliminatorias se bloquean el 18 Jun a las 17:00h España
const J2_LOCK = '2026-06-18T17:00:00+02:00'

export const PARTIDOS_GRUPOS = [
  // J1 - bloqueo partido a partido
  {id:1,  fase:'grupos', jornada:'J1', fecha:'Jue 11 Jun', grupo:'A', local:'México',          vis:'Sudáfrica',     lockTime:'2026-06-11T21:00:00+02:00'},
  {id:2,  fase:'grupos', jornada:'J1', fecha:'Jue 11 Jun', grupo:'A', local:'Corea del Sur',   vis:'Rep. Checa',    lockTime:'2026-06-12T04:00:00+02:00'},
  {id:3,  fase:'grupos', jornada:'J1', fecha:'Vie 12 Jun', grupo:'B', local:'Canadá',          vis:'Bosnia-Herz.',  lockTime:'2026-06-12T21:00:00+02:00'},
  {id:4,  fase:'grupos', jornada:'J1', fecha:'Vie 12 Jun', grupo:'D', local:'Estados Unidos',  vis:'Paraguay',      lockTime:'2026-06-13T00:00:00+02:00'},
  {id:5,  fase:'grupos', jornada:'J1', fecha:'Sáb 13 Jun', grupo:'B', local:'Qatar',           vis:'Suiza',         lockTime:'2026-06-13T03:00:00+02:00'},
  {id:6,  fase:'grupos', jornada:'J1', fecha:'Sáb 13 Jun', grupo:'C', local:'Brasil',          vis:'Marruecos',     lockTime:'2026-06-13T18:00:00+02:00'},
  {id:7,  fase:'grupos', jornada:'J1', fecha:'Sáb 13 Jun', grupo:'C', local:'Haití',           vis:'Escocia',       lockTime:'2026-06-13T21:00:00+02:00'},
  {id:8,  fase:'grupos', jornada:'J1', fecha:'Sáb 13 Jun', grupo:'D', local:'Australia',       vis:'Turquía',       lockTime:'2026-06-14T00:00:00+02:00'},
  {id:9,  fase:'grupos', jornada:'J1', fecha:'Dom 14 Jun', grupo:'E', local:'Alemania',        vis:'Curazao',       lockTime:'2026-06-14T18:00:00+02:00'},
  {id:10, fase:'grupos', jornada:'J1', fecha:'Dom 14 Jun', grupo:'F', local:'Países Bajos',    vis:'Japón',         lockTime:'2026-06-14T21:00:00+02:00'},
  {id:11, fase:'grupos', jornada:'J1', fecha:'Dom 14 Jun', grupo:'E', local:'C. de Marfil',    vis:'Ecuador',       lockTime:'2026-06-14T21:00:00+02:00'},
  {id:12, fase:'grupos', jornada:'J1', fecha:'Dom 14 Jun', grupo:'F', local:'Suecia',          vis:'Túnez',         lockTime:'2026-06-15T00:00:00+02:00'},
  {id:13, fase:'grupos', jornada:'J1', fecha:'Lun 15 Jun', grupo:'H', local:'España',          vis:'Cabo Verde',    lockTime:'2026-06-15T18:00:00+02:00'},
  {id:14, fase:'grupos', jornada:'J1', fecha:'Lun 15 Jun', grupo:'G', local:'Bélgica',         vis:'Egipto',        lockTime:'2026-06-15T21:00:00+02:00'},
  {id:15, fase:'grupos', jornada:'J1', fecha:'Lun 15 Jun', grupo:'H', local:'Arabia Saudita',  vis:'Uruguay',       lockTime:'2026-06-15T21:00:00+02:00'},
  {id:16, fase:'grupos', jornada:'J1', fecha:'Lun 15 Jun', grupo:'G', local:'Irán',            vis:'Nueva Zelanda', lockTime:'2026-06-16T00:00:00+02:00'},
  {id:17, fase:'grupos', jornada:'J1', fecha:'Mar 16 Jun', grupo:'I', local:'Francia',         vis:'Senegal',       lockTime:'2026-06-16T18:00:00+02:00'},
  {id:18, fase:'grupos', jornada:'J1', fecha:'Mar 16 Jun', grupo:'I', local:'Iraq',            vis:'Noruega',       lockTime:'2026-06-16T21:00:00+02:00'},
  {id:19, fase:'grupos', jornada:'J1', fecha:'Mar 16 Jun', grupo:'J', local:'Argentina',       vis:'Argelia',       lockTime:'2026-06-17T03:00:00+02:00'},
  {id:20, fase:'grupos', jornada:'J1', fecha:'Mar 16 Jun', grupo:'J', local:'Austria',         vis:'Jordania',      lockTime:'2026-06-17T06:00:00+02:00'},
  {id:21, fase:'grupos', jornada:'J1', fecha:'Mié 17 Jun', grupo:'K', local:'Portugal',        vis:'R.D. Congo',    lockTime:'2026-06-17T19:00:00+02:00'},
  {id:22, fase:'grupos', jornada:'J1', fecha:'Mié 17 Jun', grupo:'L', local:'Inglaterra',      vis:'Croacia',       lockTime:'2026-06-17T22:00:00+02:00'},
  {id:23, fase:'grupos', jornada:'J1', fecha:'Mié 17 Jun', grupo:'L', local:'Ghana',           vis:'Panamá',        lockTime:'2026-06-18T01:00:00+02:00'},
  {id:24, fase:'grupos', jornada:'J1', fecha:'Mié 17 Jun', grupo:'K', local:'Uzbekistán',      vis:'Colombia',      lockTime:'2026-06-18T04:00:00+02:00'},
  // J2 - se bloquean todas el 18 Jun 17:00h
  {id:25, fase:'grupos', jornada:'J2', fecha:'Jue 18 Jun', grupo:'A', local:'Rep. Checa',      vis:'Sudáfrica',     lockTime:J2_LOCK},
  {id:26, fase:'grupos', jornada:'J2', fecha:'Jue 18 Jun', grupo:'B', local:'Suiza',           vis:'Bosnia-Herz.',  lockTime:J2_LOCK},
  {id:27, fase:'grupos', jornada:'J2', fecha:'Jue 18 Jun', grupo:'B', local:'Canadá',          vis:'Qatar',         lockTime:J2_LOCK},
  {id:28, fase:'grupos', jornada:'J2', fecha:'Jue 18 Jun', grupo:'A', local:'México',          vis:'Corea del Sur', lockTime:J2_LOCK},
  {id:29, fase:'grupos', jornada:'J2', fecha:'Vie 19 Jun', grupo:'C', local:'Escocia',         vis:'Marruecos',     lockTime:J2_LOCK},
  {id:30, fase:'grupos', jornada:'J2', fecha:'Vie 19 Jun', grupo:'D', local:'Estados Unidos',  vis:'Australia',     lockTime:J2_LOCK},
  {id:31, fase:'grupos', jornada:'J2', fecha:'Vie 19 Jun', grupo:'C', local:'Brasil',          vis:'Haití',         lockTime:J2_LOCK},
  {id:32, fase:'grupos', jornada:'J2', fecha:'Vie 19 Jun', grupo:'D', local:'Turquía',         vis:'Paraguay',      lockTime:J2_LOCK},
  {id:33, fase:'grupos', jornada:'J2', fecha:'Sáb 20 Jun', grupo:'F', local:'Países Bajos',    vis:'Suecia',        lockTime:J2_LOCK},
  {id:34, fase:'grupos', jornada:'J2', fecha:'Sáb 20 Jun', grupo:'E', local:'Alemania',        vis:'C. de Marfil',  lockTime:J2_LOCK},
  {id:35, fase:'grupos', jornada:'J2', fecha:'Sáb 20 Jun', grupo:'E', local:'Ecuador',         vis:'Curazao',       lockTime:J2_LOCK},
  {id:36, fase:'grupos', jornada:'J2', fecha:'Sáb 20 Jun', grupo:'F', local:'Túnez',           vis:'Japón',         lockTime:J2_LOCK},
  {id:37, fase:'grupos', jornada:'J2', fecha:'Dom 21 Jun', grupo:'H', local:'España',          vis:'Arabia Saudita',lockTime:J2_LOCK},
  {id:38, fase:'grupos', jornada:'J2', fecha:'Dom 21 Jun', grupo:'G', local:'Bélgica',         vis:'Irán',          lockTime:J2_LOCK},
  {id:39, fase:'grupos', jornada:'J2', fecha:'Dom 21 Jun', grupo:'H', local:'Uruguay',         vis:'Cabo Verde',    lockTime:J2_LOCK},
  {id:40, fase:'grupos', jornada:'J2', fecha:'Dom 21 Jun', grupo:'G', local:'Nueva Zelanda',   vis:'Egipto',        lockTime:J2_LOCK},
  {id:41, fase:'grupos', jornada:'J2', fecha:'Lun 22 Jun', grupo:'J', local:'Argentina',       vis:'Austria',       lockTime:J2_LOCK},
  {id:42, fase:'grupos', jornada:'J2', fecha:'Lun 22 Jun', grupo:'I', local:'Francia',         vis:'Iraq',          lockTime:J2_LOCK},
  {id:43, fase:'grupos', jornada:'J2', fecha:'Lun 22 Jun', grupo:'I', local:'Noruega',         vis:'Senegal',       lockTime:J2_LOCK},
  {id:44, fase:'grupos', jornada:'J2', fecha:'Lun 22 Jun', grupo:'J', local:'Jordania',        vis:'Argelia',       lockTime:J2_LOCK},
  {id:45, fase:'grupos', jornada:'J2', fecha:'Mar 23 Jun', grupo:'K', local:'Portugal',        vis:'Uzbekistán',    lockTime:J2_LOCK},
  {id:46, fase:'grupos', jornada:'J2', fecha:'Mar 23 Jun', grupo:'L', local:'Inglaterra',      vis:'Ghana',         lockTime:J2_LOCK},
  {id:47, fase:'grupos', jornada:'J2', fecha:'Mar 23 Jun', grupo:'L', local:'Panamá',          vis:'Croacia',       lockTime:J2_LOCK},
  {id:48, fase:'grupos', jornada:'J2', fecha:'Mar 23 Jun', grupo:'K', local:'Colombia',        vis:'R.D. Congo',    lockTime:J2_LOCK},
  // J3 - se bloquean todas el 18 Jun 17:00h
  {id:49, fase:'grupos', jornada:'J3', fecha:'Mié 24 Jun', grupo:'B', local:'Suiza',           vis:'Canadá',        lockTime:J2_LOCK},
  {id:50, fase:'grupos', jornada:'J3', fecha:'Mié 24 Jun', grupo:'B', local:'Bosnia-Herz.',    vis:'Qatar',         lockTime:J2_LOCK},
  {id:51, fase:'grupos', jornada:'J3', fecha:'Mié 24 Jun', grupo:'C', local:'Escocia',         vis:'Brasil',        lockTime:J2_LOCK},
  {id:52, fase:'grupos', jornada:'J3', fecha:'Mié 24 Jun', grupo:'C', local:'Marruecos',       vis:'Haití',         lockTime:J2_LOCK},
  {id:53, fase:'grupos', jornada:'J3', fecha:'Mié 24 Jun', grupo:'A', local:'Rep. Checa',      vis:'México',        lockTime:J2_LOCK},
  {id:54, fase:'grupos', jornada:'J3', fecha:'Mié 24 Jun', grupo:'A', local:'Sudáfrica',       vis:'Corea del Sur', lockTime:J2_LOCK},
  {id:55, fase:'grupos', jornada:'J3', fecha:'Jue 25 Jun', grupo:'E', local:'Ecuador',         vis:'Alemania',      lockTime:J2_LOCK},
  {id:56, fase:'grupos', jornada:'J3', fecha:'Jue 25 Jun', grupo:'E', local:'Curazao',         vis:'C. de Marfil',  lockTime:J2_LOCK},
  {id:57, fase:'grupos', jornada:'J3', fecha:'Jue 25 Jun', grupo:'F', local:'Japón',           vis:'Suecia',        lockTime:J2_LOCK},
  {id:58, fase:'grupos', jornada:'J3', fecha:'Jue 25 Jun', grupo:'F', local:'Túnez',           vis:'Países Bajos',  lockTime:J2_LOCK},
  {id:59, fase:'grupos', jornada:'J3', fecha:'Jue 25 Jun', grupo:'D', local:'Turquía',         vis:'Estados Unidos',lockTime:J2_LOCK},
  {id:60, fase:'grupos', jornada:'J3', fecha:'Jue 25 Jun', grupo:'D', local:'Paraguay',        vis:'Australia',     lockTime:J2_LOCK},
  {id:61, fase:'grupos', jornada:'J3', fecha:'Vie 26 Jun', grupo:'I', local:'Noruega',         vis:'Francia',       lockTime:J2_LOCK},
  {id:62, fase:'grupos', jornada:'J3', fecha:'Vie 26 Jun', grupo:'I', local:'Senegal',         vis:'Iraq',          lockTime:J2_LOCK},
  {id:63, fase:'grupos', jornada:'J3', fecha:'Vie 26 Jun', grupo:'H', local:'Cabo Verde',      vis:'Arabia Saudita',lockTime:J2_LOCK},
  {id:64, fase:'grupos', jornada:'J3', fecha:'Vie 26 Jun', grupo:'H', local:'Uruguay',         vis:'España',        lockTime:J2_LOCK},
  {id:65, fase:'grupos', jornada:'J3', fecha:'Vie 26 Jun', grupo:'G', local:'Egipto',          vis:'Irán',          lockTime:J2_LOCK},
  {id:66, fase:'grupos', jornada:'J3', fecha:'Vie 26 Jun', grupo:'G', local:'Nueva Zelanda',   vis:'Bélgica',       lockTime:J2_LOCK},
  {id:67, fase:'grupos', jornada:'J3', fecha:'Sáb 27 Jun', grupo:'L', local:'Panamá',          vis:'Inglaterra',    lockTime:J2_LOCK},
  {id:68, fase:'grupos', jornada:'J3', fecha:'Sáb 27 Jun', grupo:'L', local:'Croacia',         vis:'Ghana',         lockTime:J2_LOCK},
  {id:69, fase:'grupos', jornada:'J3', fecha:'Sáb 27 Jun', grupo:'K', local:'Colombia',        vis:'Portugal',      lockTime:J2_LOCK},
  {id:70, fase:'grupos', jornada:'J3', fecha:'Sáb 27 Jun', grupo:'K', local:'R.D. Congo',      vis:'Uzbekistán',    lockTime:J2_LOCK},
  {id:71, fase:'grupos', jornada:'J3', fecha:'Sáb 27 Jun', grupo:'J', local:'Argelia',         vis:'Austria',       lockTime:J2_LOCK},
  {id:72, fase:'grupos', jornada:'J3', fecha:'Sáb 27 Jun', grupo:'J', local:'Jordania',        vis:'Argentina',     lockTime:J2_LOCK},
]

export const PTS_CLASIFICADO = {
  dieciseisavos: 5,
  octavos:       4,
  cuartos:       5,
  semis:         6,
  tercero:       4,
  final:         7,
}

export const PARTIDOS_ELIMINATORIAS = [
  {id:101, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Sáb 28 Jun', local:'2A', vis:'2B',  lockTime:J2_LOCK},
  {id:102, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Sáb 28 Jun', local:'1C', vis:'2F',  lockTime:J2_LOCK},
  {id:103, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Dom 29 Jun', local:'1F', vis:'2C',  lockTime:J2_LOCK},
  {id:104, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Dom 29 Jun', local:'2E', vis:'2I',  lockTime:J2_LOCK},
  {id:105, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Lun 30 Jun', local:'2K', vis:'2L',  lockTime:J2_LOCK},
  {id:106, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Lun 30 Jun', local:'1H', vis:'2J',  lockTime:J2_LOCK},
  {id:107, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Mar 1 Jul',  local:'1J', vis:'2H',  lockTime:J2_LOCK},
  {id:108, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Mar 1 Jul',  local:'2D', vis:'2G',  lockTime:J2_LOCK},
  {id:113, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Mié 2 Jul',  local:'1E', vis:'3?',  tercero:true, lockTime:J2_LOCK},
  {id:114, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Mié 2 Jul',  local:'1I', vis:'3?',  tercero:true, lockTime:J2_LOCK},
  {id:115, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Jue 3 Jul',  local:'1A', vis:'3?',  tercero:true, lockTime:J2_LOCK},
  {id:116, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Jue 3 Jul',  local:'1L', vis:'3?',  tercero:true, lockTime:J2_LOCK},
  {id:117, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Vie 4 Jul',  local:'1D', vis:'3?',  tercero:true, lockTime:J2_LOCK},
  {id:118, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Vie 4 Jul',  local:'1G', vis:'3?',  tercero:true, lockTime:J2_LOCK},
  {id:119, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Sáb 5 Jul',  local:'1B', vis:'3?',  tercero:true, lockTime:J2_LOCK},
  {id:120, fase:'dieciseisavos', jornada:'Dieciseisavos', fecha:'Sáb 5 Jul',  local:'1K', vis:'3?',  tercero:true, lockTime:J2_LOCK},
  {id:201, fase:'octavos', jornada:'Octavos', fecha:'Mar 8 Jul',  local:'G1',  vis:'G2',  lockTime:J2_LOCK},
  {id:202, fase:'octavos', jornada:'Octavos', fecha:'Mar 8 Jul',  local:'G3',  vis:'G4',  lockTime:J2_LOCK},
  {id:203, fase:'octavos', jornada:'Octavos', fecha:'Mié 9 Jul',  local:'G5',  vis:'G6',  lockTime:J2_LOCK},
  {id:204, fase:'octavos', jornada:'Octavos', fecha:'Mié 9 Jul',  local:'G7',  vis:'G8',  lockTime:J2_LOCK},
  {id:205, fase:'octavos', jornada:'Octavos', fecha:'Jue 10 Jul', local:'G9',  vis:'G10', lockTime:J2_LOCK},
  {id:206, fase:'octavos', jornada:'Octavos', fecha:'Jue 10 Jul', local:'G11', vis:'G12', lockTime:J2_LOCK},
  {id:207, fase:'octavos', jornada:'Octavos', fecha:'Vie 11 Jul', local:'G13', vis:'G14', lockTime:J2_LOCK},
  {id:208, fase:'octavos', jornada:'Octavos', fecha:'Vie 11 Jul', local:'G15', vis:'G16', lockTime:J2_LOCK},
  {id:301, fase:'cuartos', jornada:'Cuartos', fecha:'Mar 15 Jul', local:'C1',  vis:'C2',  lockTime:J2_LOCK},
  {id:302, fase:'cuartos', jornada:'Cuartos', fecha:'Mar 15 Jul', local:'C3',  vis:'C4',  lockTime:J2_LOCK},
  {id:303, fase:'cuartos', jornada:'Cuartos', fecha:'Mié 16 Jul', local:'C5',  vis:'C6',  lockTime:J2_LOCK},
  {id:304, fase:'cuartos', jornada:'Cuartos', fecha:'Mié 16 Jul', local:'C7',  vis:'C8',  lockTime:J2_LOCK},
  {id:401, fase:'semis', jornada:'Semifinales', fecha:'Mar 22 Jul', local:'S1', vis:'S2',  lockTime:J2_LOCK},
  {id:402, fase:'semis', jornada:'Semifinales', fecha:'Mié 23 Jul', local:'S3', vis:'S4',  lockTime:J2_LOCK},
  {id:501, fase:'tercero', jornada:'3er Puesto', fecha:'Sáb 26 Jul', local:'Perdedor SF1', vis:'Perdedor SF2', lockTime:J2_LOCK},
  {id:601, fase:'final', jornada:'Final', fecha:'Dom 27 Jul', local:'Ganador SF1', vis:'Ganador SF2', lockTime:J2_LOCK},
]

export const TODAS_LAS_FASES = [
  { key: 'grupos',         label: '⚽ Grupos' },
  { key: 'dieciseisavos',  label: '⚔️ 1/16' },
  { key: 'octavos',        label: '🔥 1/8' },
  { key: 'cuartos',        label: '🏹 1/4' },
  { key: 'semis',          label: '💥 Semis' },
  { key: 'tercero',        label: '🥉 3º' },
  { key: 'final',          label: '🏆 Final' },
]

export const JORNADAS_GRUPOS = [
  { key: 'J1', label: 'Jornada 1', dates: '11–17 Jun' },
  { key: 'J2', label: 'Jornada 2', dates: '18–23 Jun' },
  { key: 'J3', label: 'Jornada 3', dates: '24–27 Jun' },
]

export const AVATARS = ['⚽','🦁','🐯','🦅','🐉','🦊','🐺','🦈','🐻','🦋','🌟','🔥','💎','🚀','🎯','👑']
export const COLORS  = ['#e63946','#f4a261','#2a9d8f','#457b9d','#9b5de5','#e9c46a','#06d6a0','#ef476f','#118ab2','#ffd166']

export function calcPts(pl, pv, rl, rv) {
  if (rl === '' || rv === '' || rl == null || rv == null) return null
  if (pl === '' || pv === '' || pl == null || pv == null) return 0
  const [rli, rvi, pli, pvi] = [rl, rv, pl, pv].map(Number)
  if (pli === rli && pvi === rvi) return 5
  const sign = x => x > 0 ? 1 : x < 0 ? -1 : 0
  if (sign(pli - pvi) === sign(rli - rvi)) return 1
  return 0
}

export function calcPtsClasificado(predEquipo, realEquipo, fase) {
  if (!realEquipo || !predEquipo) return 0
  if (predEquipo.toLowerCase() !== realEquipo.toLowerCase()) return 0
  return PTS_CLASIFICADO[fase] || 0
}

export function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

// Función para saber si un partido está bloqueado
export function isMatchLocked(match) {
  if (!match.lockTime) return false
  return new Date() >= new Date(match.lockTime)
}
