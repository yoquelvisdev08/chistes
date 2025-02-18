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
        fill={isDark ? '#1a1a1a' : '#fff'} 
        stroke={isDark ? '#fff' : '#1a1a1a'} 
        strokeWidth="5"
        className="logo-circle"
      />
      <circle 
        cx="35" 
        cy="40" 
        r="5" 
        fill={isDark ? '#fff' : '#1a1a1a'}
        className="logo-eye"
      />
      <circle 
        cx="65" 
        cy="40" 
        r="5" 
        fill={isDark ? '#fff' : '#1a1a1a'}
        className="logo-eye"
      />
      <path
        d="M30 65 Q50 80 70 65"
        stroke={isDark ? '#fff' : '#1a1a1a'}
        strokeWidth="5"
        strokeLinecap="round"
        className="logo-smile"
      />
    </svg>
  )
}

export default Logo 