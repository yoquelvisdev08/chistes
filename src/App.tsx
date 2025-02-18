import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DarkHumorPage from './pages/DarkHumorPage'
import Dashboard from './pages/Dashboard'
import RandomJokePage from './pages/RandomJokePage'
import './App.css'

function AppContent() {
  const location = useLocation()
  const isDarkMode = location.pathname === '/dark-humor'

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`}>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dark-humor" element={<DarkHumorPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/random" element={<RandomJokePage />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
