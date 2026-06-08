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
import AdivinaHome from './pages/AdivinaHome.jsx'
import AdivinaIndividual from './pages/AdivinaIndividual.jsx'
import AdivinaOnline from './pages/AdivinaOnline.jsx'
import Ranking from './pages/Ranking.jsx'
import Marcador from './pages/Marcador.jsx'
import EstimonHome from './pages/EstimonHome.jsx'
import EstimonIndividual from './pages/EstimonIndividual.jsx'
import EstimonOnline from './pages/EstimonOnline.jsx'

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
      <Route path="/" element={<Home />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/marcador" element={<Marcador />} />
      <Route path="/prediccion" element={<ProtectedRoute><MyGroups /></ProtectedRoute>} />
      <Route path="/crear" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
      <Route path="/unirse" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      <Route path="/unirse/:code" element={<ProtectedRoute><JoinGroup /></ProtectedRoute>} />
      <Route path="/grupo/:code" element={<ProtectedRoute><Game /></ProtectedRoute>} />
      <Route path="/mentiroso" element={<MentirosoHome />} />
      <Route path="/mentiroso/:code" element={<MentirosoGame />} />
      <Route path="/topdiezgame" element={<TopDiezHome />} />
      <Route path="/topdiezgame/individual" element={<TopDiezIndividual />} />
      <Route path="/topdiezgame/online" element={<TopDiezOnline />} />
      <Route path="/adivina" element={<AdivinaHome />} />
      <Route path="/adivina/individual" element={<AdivinaIndividual />} />
      <Route path="/adivina/online" element={<AdivinaOnline />} />
      <Route path="/estimon" element={<EstimonHome />} />
      <Route path="/estimon/individual" element={<EstimonIndividual />} />
      <Route path="/estimon/online/:id" element={<EstimonOnline />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
