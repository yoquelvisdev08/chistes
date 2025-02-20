import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import DarkHumorPage from './pages/DarkHumorPage'
import Dashboard from './pages/Dashboard'
import RandomJokePage from './pages/RandomJokePage'
import JokeDetailPage from './pages/JokeDetailPage'
import Footer from './components/Footer'
import LoginPage from './pages/LoginPage'
import ProtectedRoute from './components/ProtectedRoute'
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
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route path="/random" element={<RandomJokePage />} />
          <Route path="/joke/:id" element={<JokeDetailPage />} />
        </Routes>
      </main>
      <Footer />
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
