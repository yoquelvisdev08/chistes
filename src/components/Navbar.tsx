import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'

const Navbar = () => {
  const location = useLocation()
  const isDarkMode = location.pathname === '/dark-humor'

  return (
    <nav className="navbar">
      <div className="nav-links">
        <div className="logo-container">
          <Logo isDark={isDarkMode} />
        </div>
        <div className="nav-links-menu">
          <Link to="/">Chistes Normales</Link>
          <Link to="/dark-humor">Humor Negro</Link>
          <Link to="/random">Generador</Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 