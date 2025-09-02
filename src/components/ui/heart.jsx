import React, { useState, useEffect } from 'react';

export default function Heart({ isLiked = false, size = 20, ariaLabel = 'Like' }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isLiked) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 260);
      return () => clearTimeout(t);
    }
  }, [isLiked]);

  const primaryColor = 'hsl(var(--primary))'; 
  const mutedColor = 'hsl(var(--muted-foreground))';
  const hoverBg = 'hsl(var(--input))';

  return (
    <span
      role="img"
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        style={{
          display: 'block',
          transition: 'transform 220ms cubic-bezier(0.2,0.8,0.2,1), opacity 220ms',
          transform: animate ? 'scale(1.18)' : (isLiked ? 'scale(1.06)' : 'scale(1)'),
          opacity: isLiked ? 1 : 0.95,
        }}
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
          fill={isLiked ? primaryColor : 'transparent'}
          stroke={isLiked ? primaryColor : mutedColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {isLiked && (
          <g opacity={isLiked ? 1 : 0} transform="translate(4,-2)">
            <circle cx="12" cy="2" r="0.9" fill={primaryColor} />
            <circle cx="16" cy="6" r="0.7" fill={primaryColor} />
          </g>
        )}
      </svg>

      <style>{`
        /* keep visual hover available for parent buttons */
        span:hover { background: ${hoverBg}; }
      `}</style>
    </span>
  );
}
