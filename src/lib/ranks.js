// Sistema de rangos JFEE
// Cada nivel cuesta 50 pts más que el anterior
// Bronce I: 100pts · Bronce II: 150pts · Bronce III: 200pts · Plata I: 250pts...

export const RANKS = [
  { name: 'Bronce',      emoji: '🥉', color: '#cd7f32', levels: 3, basePoints: 0,     levelCosts: [100, 150, 200] },
  { name: 'Plata',       emoji: '🥈', color: '#a8a9ad', levels: 3, basePoints: 450,   levelCosts: [250, 300, 350] },
  { name: 'Oro',         emoji: '🥇', color: '#ffd700', levels: 3, basePoints: 1350,  levelCosts: [400, 450, 500] },
  { name: 'Platino',     emoji: '💎', color: '#00b4d8', levels: 3, basePoints: 2700,  levelCosts: [550, 600, 650] },
  { name: 'Esmeralda',   emoji: '💚', color: '#2ecc71', levels: 3, basePoints: 4500,  levelCosts: [700, 750, 800] },
  { name: 'Diamante',    emoji: '💠', color: '#48cae4', levels: 3, basePoints: 6750,  levelCosts: [850, 900, 950] },
  { name: 'Profesional', emoji: '🏅', color: '#f77f00', levels: 3, basePoints: 9450,  levelCosts: [1000, 1050, 1100] },
  { name: 'Leyenda',     emoji: '🌟', color: '#e9c46a', levels: 3, basePoints: 12600, levelCosts: [1150, 1200, 1250] },
  { name: 'Icono Top',   emoji: '👑', color: '#e63946', levels: 1, basePoints: 16200, levelCosts: [0] },
]

export const POINTS = {
  REGISTER: 50,
  TOPDEZ_ACIERTO: 10,
  TOPDEZ_RENDIRSE: 2,
  ADIVINA_PISTA_1: 7,
  ADIVINA_PISTA_2: 6,
  ADIVINA_PISTA_3: 5,
  ADIVINA_PISTA_4: 4,
  ADIVINA_PISTA_5: 3,
  ADIVINA_PISTA_6: 2,
  ADIVINA_PISTA_7: 1,
  MENTIROSO_DESCUBRIR: 15,
  MENTIROSO_IMPOSTOR_GANA: 20,
  PREDICCION_EXACTO: 3,
  PREDICCION_RESULTADO: 1,
}

export function getRankInfo(totalPoints) {
  // Encontrar rango y nivel actuales
  let rank = RANKS[0]
  let level = 1

  for (let i = RANKS.length - 1; i >= 0; i--) {
    const r = RANKS[i]
    if (totalPoints >= r.basePoints) {
      rank = r
      if (r.levels === 1) {
        level = 1
      } else {
        // Calcular en qué nivel estamos según levelCosts
        let pts = totalPoints - r.basePoints
        level = 1
        for (let l = 0; l < r.levels; l++) {
          if (pts >= r.levelCosts[l]) {
            pts -= r.levelCosts[l]
            level = l + 2
          } else {
            level = l + 1
            break
          }
        }
        level = Math.min(level, r.levels)
      }
      break
    }
  }

  // Puntos gastados en niveles anteriores dentro del rango
  let ptsUsedInPrevLevels = 0
  for (let l = 0; l < level - 1; l++) {
    ptsUsedInPrevLevels += rank.levelCosts[l]
  }

  const ptsInCurrentLevel = (totalPoints - rank.basePoints) - ptsUsedInPrevLevels
  const currentLevelCost = rank.levels === 1 ? 1 : rank.levelCosts[level - 1]

  // Progreso dentro del nivel actual (0-100)
  const progress = rank.levels === 1
    ? 100
    : Math.min(100, Math.round((ptsInCurrentLevel / currentLevelCost) * 100))

  // Puntos para el siguiente nivel o rango
  let pointsToNext = null
  if (rank.levels === 1) {
    pointsToNext = null // Icono Top — máximo
  } else if (level < rank.levels) {
    pointsToNext = currentLevelCost - ptsInCurrentLevel
  } else {
    // Siguiente rango
    const nextRankIdx = RANKS.indexOf(rank) + 1
    if (nextRankIdx < RANKS.length) {
      pointsToNext = RANKS[nextRankIdx].basePoints - totalPoints
    }
  }

  return { rank, level, progress, pointsToNext, totalPoints }
}
