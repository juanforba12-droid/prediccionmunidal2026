import { supabase } from './supabase.js'

// Sumar puntos a un usuario registrado
export async function addPoints(userId, amount, reason = '') {
  if (!userId || !amount) return null

  // Upsert: si no existe la fila la crea, si existe suma
  const { data: existing } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_id', userId)
    .single()

  const currentPoints = existing?.total_points || 0
  const newPoints = currentPoints + amount

  const { data, error } = await supabase
    .from('user_points')
    .upsert(
      { user_id: userId, total_points: newPoints, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    console.error('Error sumando puntos:', error)
    return null
  }

  // Log opcional para historial
  await supabase.from('user_points_log').insert({
    user_id: userId,
    amount,
    reason,
    total_after: newPoints,
    created_at: new Date().toISOString()
  })

  return data
}

// Obtener puntos totales de un usuario
export async function getUserPoints(userId) {
  if (!userId) return 0
  const { data } = await supabase
    .from('user_points')
    .select('total_points')
    .eq('user_id', userId)
    .single()
  return data?.total_points || 0
}
