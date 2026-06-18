import React from 'react';

const Logo = ({ size = 40, variant = 'dark' }) => {
  // Gestion des palettes de couleurs selon le variant
  const bg = variant === 'orange' ? '#F97316' : variant === 'white' ? '#FFFFFF' : '#111111';
  const fg = variant === 'orange' ? '#FFFFFF' : variant === 'white' ? '#111111' : '#FFFFFF';
  const dot = variant === 'orange' ? 'rgba(255, 255, 255, 0.95)' : '#F97316';

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Fond avec coins arrondis modernes (smooth corner radius) */}
      <rect width="100" height="100" rx="28" fill={bg} />
      
      {/* Le "F" géométrique et moderne */}
      <path
        d="M 32 80 L 32 28 C 32 21 37 16 44 16 L 68 16 L 68 26 L 44 26 C 42.5 26 42 26.5 42 28 L 42 42 L 64 42 L 64 52 L 42 52 L 42 80 Z"
        fill={fg}
      />
      
      {/* Le point FidApp (Puce / Validation), parfaitement proportionné */}
      <circle cx="70" cy="74" r="7.5" fill={dot} />
    </svg>
  );
};

export default Logo;