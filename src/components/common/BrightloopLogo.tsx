import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark'; // light = white logo for dark bg; dark = dark teal logo for light bg
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrightloopLogo: React.FC<LogoProps> = ({
  className = '',
  variant = 'light',
  size = 'md',
  showText = true,
}) => {
  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#0F3735]';
  const iconStroke = isLight ? '#FFFFFF' : '#0F3735';

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizes = {
    sm: 'text-base font-bold',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Clean infinity / dual-loop brand mark matching the PDF screenshots */}
      <svg
        className={iconSizes[size]}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 21C6.68629 21 4 18.3137 4 15C4 11.6863 6.68629 9 10 9C12.4853 9 14.62 10.5117 15.5 12.6713C16.38 10.5117 18.5147 9 21 9C24.3137 9 27 11.6863 27 15C27 18.3137 24.3137 21 21 21C18.5147 21 16.38 19.4883 15.5 17.3287C14.62 19.4883 12.4853 21 10 21Z"
          stroke={iconStroke}
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="15" r="2" fill={isLight ? '#F4BA28' : '#0F3735'} />
        <circle cx="21" cy="15" r="2" fill={isLight ? '#FFFFFF' : '#F4BA28'} />
      </svg>

      {showText && (
        <span className={`${textSizes[size]} ${textColor} font-sans`}>
          Brightloop
        </span>
      )}
    </div>
  );
};
