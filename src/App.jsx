import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import Auth from './pages/Auth.jsx'
import MyGroups from './pages/MyGroups.jsx'
import CreateGroup from './pages/CreateGroup.jsx'
import JoinGroup from './pages/JoinGroup.jsx'
import Game from './pages/Game.jsx'

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => subscription.unsubscribe()
  }, [])
  if (user === undefined) return null
  if (!user) return <Navigate to="/auth" />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
      <Route path="/crear" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
      <Route path="/unirse" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      <Route path="/unirse/:code" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      <Route path="/grupo/:code" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
