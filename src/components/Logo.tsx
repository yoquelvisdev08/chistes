const Logo = ({ isDark = false }: { isDark?: boolean }) => {
  return (
    <svg 
      width="60" 
      height="60" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="logo-svg"
    >
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill={isDark ? '#FF3434' : '#7F3DFF'} 
        stroke={isDark ? '#fff' : '#B69FFF'} 
        strokeWidth="5"
        className="logo-circle"
      />
      <circle 
        cx="35" 
        cy="40" 
        r="8" 
        fill={isDark ? '#fff' : '#1a1a1a'}
        className="logo-eye animate-bounce"
      />
      <circle 
        cx="65" 
        cy="40" 
        r="8" 
        fill={isDark ? '#fff' : '#1a1a1a'}
        className="logo-eye animate-bounce"
      />
      <path
        d="M30 65 Q50 85 70 65"
        stroke={isDark ? '#fff' : '#1a1a1a'}
        strokeWidth="6"
        strokeLinecap="round"
        className="logo-smile animate-pulse"
      />
    </svg>
  )
}

export default Logo 