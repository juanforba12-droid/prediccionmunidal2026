import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import CreateGroup from './pages/CreateGroup.jsx'
import JoinGroup from './pages/JoinGroup.jsx'
import Game from './pages/Game.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"            element={<Home />} />
      <Route path="/crear"       element={<CreateGroup />} />
      <Route path="/unirse"      element={<JoinGroup />} />
      <Route path="/unirse/:code" element={<JoinGroup />} />
      <Route path="/grupo/:code" element={<Game />} />
      <Route path="*"            element={<Navigate to="/" />} />
    </Routes>
  )
}
