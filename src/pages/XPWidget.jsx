import { getRankInfo } from '../lib/ranks.js'

export default function XPWidget({ user, totalXP, lastGained }) {
  if (!user) {
    return (
      <div style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 100,
        background: 'rgba(10,10,26,0.92)', border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: 16, padding: '12px 18px', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
        color: 'rgba(255,255,255,0.5)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
      }}>
        <span style={{ fontSize: 20 }}>👤</span>
        <span>Regístrate para ganar XP</span>
      </div>
    )
  }

  const { rank, level, progress, pointsToNext, totalPoints } = getRankInfo(totalXP)
  const levelStr = rank.levels > 1 ? ` ${['I','II','III'][level-1]}` : ''

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 100,
      background: 'rgba(10,10,26,0.95)', border: `2px solid ${rank.color}66`,
      borderRadius: 20, padding: '16px 20px', backdropFilter: 'blur(16px)',
      minWidth: 220, boxShadow: `0 8px 32px ${rank.color}33, 0 4px 16px rgba(0,0,0,0.5)`
    }}>
      {/* Rango */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 18, color: rank.color, fontWeight: 900 }}>
          {rank.emoji} {rank.name}{levelStr}
        </span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
          {totalXP.toLocaleString()} XP
        </span>
      </div>

      {/* Barra de progreso */}
      <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: 8 }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})`,
          borderRadius: 99, transition: 'width 0.8s ease'
        }} />
      </div>

      {/* XP ganados / próximo nivel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {lastGained > 0 ? (
          <span style={{ fontSize: 15, color: '#22c55e', fontWeight: 900 }}>+{lastGained} XP ✨</span>
        ) : (
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            {pointsToNext ? `${pointsToNext} XP para subir` : '👑 Rango máximo'}
          </span>
        )}
        <span style={{ fontSize: 12, color: rank.color, fontWeight: 700 }}>{progress}%</span>
      </div>
    </div>
  )
}
