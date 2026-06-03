// Componente flotante de XP/Rango — esquina inferior derecha
// Visible para todos: registrados muestran rango real, invitados muestran "Invitado"
import { getRankInfo } from '../lib/ranks.js'

export default function XPWidget({ user, totalXP, lastGained }) {
  if (!user) {
    return (
      <div style={{
        position: 'fixed', bottom: 16, right: 16, zIndex: 100,
        background: 'rgba(10,10,26,0.9)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 14, padding: '8px 14px', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', gap: 8, fontSize: 12,
        color: 'rgba(255,255,255,0.4)'
      }}>
        <span>👤</span>
        <span>Invitado · Regístrate para ganar XP</span>
      </div>
    )
  }

  const { rank, level, progress, pointsToNext } = getRankInfo(totalXP)
  const levelStr = rank.levels > 1 ? ` ${['I','II','III'][level-1]}` : ''

  return (
    <div style={{
      position: 'fixed', bottom: 16, right: 16, zIndex: 100,
      background: 'rgba(10,10,26,0.92)', border: `1px solid ${rank.color}44`,
      borderRadius: 16, padding: '10px 14px', backdropFilter: 'blur(12px)',
      minWidth: 180, boxShadow: `0 4px 20px ${rank.color}22`
    }}>
      {/* Rango */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: rank.color, fontWeight: 800 }}>
          {rank.emoji} {rank.name}{levelStr}
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          {totalXP.toLocaleString()} XP
        </span>
      </div>

      {/* Barra de progreso */}
      <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden', marginBottom: 4 }}>
        <div style={{
          height: '100%', width: `${progress}%`,
          background: `linear-gradient(90deg, ${rank.color}88, ${rank.color})`,
          borderRadius: 99, transition: 'width 0.8s ease'
        }} />
      </div>

      {/* XP ganados / próximo nivel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {lastGained > 0 ? (
          <span style={{
            fontSize: 11, color: '#22c55e', fontWeight: 800,
            animation: 'xpPop 0.4s ease'
          }}>+{lastGained} XP ✨</span>
        ) : (
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
            {pointsToNext ? `${pointsToNext} XP para subir` : '👑 Máximo rango'}
          </span>
        )}
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>{progress}%</span>
      </div>
    </div>
  )
}
