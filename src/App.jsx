import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Game from './pages/Game.jsx'
import MentirosoHome from './pages/MentirosoHome.jsx'
import MentirosoGame from './pages/MentirosoGame.jsx'
import TopDiezGame from './pages/TopDiezHome.jsx'
import TopDiezIndividual from './pages/TopDiezIndividual.jsx'
import TopDiezOnline from './pages/TopDiezOnline.jsx'
import AdivinaHome from './pages/AdivinaHome.jsx'
import AdivinaIndividual from './pages/AdivinaIndividual.jsx'
import AdivinaOnline from './pages/AdivinaOnline.jsx'
import Ranking from './pages/Ranking.jsx'
import Marcador from './pages/Marcador.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                      element={<Home />} />
        <Route path="/auth"                  element={<Auth />} />
        <Route path="/prediccion"            element={<Game />} />
        <Route path="/prediccion/:groupId"   element={<Game />} />
        <Route path="/mentiroso"             element={<MentirosoHome />} />
        <Route path="/mentiroso/:sessionId"  element={<MentirosoGame />} />
        <Route path="/topdiezgame"           element={<TopDiezGame />} />
        <Route path="/topdiez/individual"    element={<TopDiezIndividual />} />
        <Route path="/topdiez/online/:id"    element={<TopDiezOnline />} />
        <Route path="/adivina"               element={<AdivinaHome />} />
        <Route path="/adivina/individual"    element={<AdivinaIndividual />} />
        <Route path="/adivina/online/:id"    element={<AdivinaOnline />} />
        <Route path="/ranking"               element={<Ranking />} />
        <Route path="/marcador"              element={<Marcador />} />
      </Routes>
    </BrowserRouter>
  )
}
