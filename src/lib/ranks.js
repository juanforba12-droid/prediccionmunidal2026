// Sistema de rangos JFEE
export const RANKS = [
  { name: 'Bronce',      emoji: '🥉', color: '#cd7f32', levels: 3, basePoints: 0,     pointsPerLevel: 100  },
  { name: 'Plata',       emoji: '🥈', color: '#a8a9ad', levels: 3, basePoints: 300,   pointsPerLevel: 167  },
  { name: 'Oro',         emoji: '🥇', color: '#ffd700', levels: 3, basePoints: 800,   pointsPerLevel: 333  },
  { name: 'Platino',     emoji: '💎', color: '#00b4d8', levels: 3, basePoints: 1800,  pointsPerLevel: 567  },
  { name: 'Esmeralda',   emoji: '💚', color: '#2ecc71', levels: 3, basePoints: 3500,  pointsPerLevel: 833  },
  { name: 'Diamante',    emoji: '💠', color: '#48cae4', levels: 3, basePoints: 6000,  pointsPerLevel: 1333 },
  { name: 'Profesional', emoji: '🏅', color: '#f77f00', levels: 3, basePoints: 10000, pointsPerLevel: 2000 },
  { name: 'Leyenda',     emoji: '🌟', color: '#e9c46a', levels: 3, basePoints: 16000, pointsPerLevel: 3000 },
  { name: 'Icono Top',   emoji: '👑', color: '#e63946', levels: 1, basePoints: 25000, pointsPerLevel: 0    },
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
  let rank = RANKS[0]
  let level = 1

  for (let i = RANKS.length - 1; i >= 0; i--) {
    const r = RANKS[i]
    if (totalPoints >= r.basePoints) {
      rank = r
      if (r.levels === 1) {
        level = 1
      } else {
        const pointsInRank = totalPoints - r.basePoints
        level = Math.min(r.levels, Math.floor(pointsInRank / r.pointsPerLevel) + 1)
      }
      break
    }
  }

  // Calcular progreso dentro del nivel actual
  const pointsInRank = totalPoints - rank.basePoints
  const levelStart = (level - 1) * rank.pointsPerLevel
  const levelEnd = level * rank.pointsPerLevel
  const progress = rank.levels === 1 ? 100 : Math.min(100, Math.round(((pointsInRank - levelStart) / rank.pointsPerLevel) * 100))

  // Puntos para siguiente nivel/rango
  let pointsToNext = null
  if (rank.levels === 1) {
    pointsToNext = null // Máximo rango
  } else if (level < rank.levels) {
    pointsToNext = rank.basePoints + levelEnd - totalPoints
  } else {
    // Siguiente rango
    const nextRankIdx = RANKS.indexOf(rank) + 1
    if (nextRankIdx < RANKS.length) {
      pointsToNext = RANKS[nextRankIdx].basePoints - totalPoints
    }
  }

  return { rank, level, progress, pointsToNext, totalPoints }
}
