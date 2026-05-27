import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import MyGroups from './pages/MyGroups.jsx'
import CreateGroup from './pages/CreateGroup.jsx'
import JoinGroup from './pages/JoinGroup.jsx'
import Game from './pages/Game.jsx'
import MentirosoHome from './pages/MentirosoHome.jsx'
import MentirosoGame from './pages/MentirosoGame.jsx'
import TopDiezHome from './pages/TopDiezHome.jsx'
import TopDiezIndividual from './pages/TopDiezIndividual.jsx'
import TopDiezOnline from './pages/TopDiezOnline.jsx'

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
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      {/* Prediccion */}
      <Route path="/prediccion" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
      <Route path="/crear" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
      <Route path="/unirse" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      <Route path="/unirse/:code" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      <Route path="/grupo/:code" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      {/* Mentiroso */}
      <Route path="/mentiroso" element={<ProtectedRoute><MentirosoHome /></ProtectedRoute>} />
      <Route path="/mentiroso/:code" element={<ProtectedRoute><MentirosoGame /></ProtectedRoute>} />
      {/* Top 10 */}
      <Route path="/topdiezgame" element={<ProtectedRoute><TopDiezHome /></ProtectedRoute>} />
      <Route path="/topdiezgame/individual" element={<ProtectedRoute><TopDiezIndividual /></ProtectedRoute>} />
      <Route path="/topdiezgame/online" element={<ProtectedRoute><TopDiezOnline /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
