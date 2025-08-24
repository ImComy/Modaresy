import React, { useState, useEffect } from 'react';

export default function Heart({ isLiked = false, onToggle = () => {}, size = 20, ariaLabel = 'Like' }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isLiked) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 260);
      return () => clearTimeout(t);
    }
  }, [isLiked]);

  const handleClick = (e) => {
    e.preventDefault();
    setAnimate(true);
    setTimeout(() => setAnimate(false), 260);
    // delegate actual toggling/syncing to parent
    onToggle && onToggle();
  };

  const primaryColor = 'hsl(var(--primary))'; 
  const primaryForeground = 'hsl(var(--primary-foreground))';
  const mutedColor = 'hsl(var(--muted-foreground))';
  const btnBg = 'transparent';
  const hoverBg = 'hsl(var(--input))';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={!!isLiked}
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size + 12,
        height: size + 12,
        padding: 6,
        borderRadius: 9999,
        background: btnBg,
        border: 'none',
        cursor: 'pointer',
        transition: 'background 160ms ease, transform 160ms ease',
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
      onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      onFocus={(e) => e.currentTarget.style.boxShadow = `0 0 0 4px rgba(0,0,0,0.04), 0 0 0 6px rgba(0,0,0,0.02)` }
      onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
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
        /* hover background using CSS variable so it respects theme */
        button:hover { background: ${hoverBg}; }
        button:active { transform: scale(0.96); }
      `}</style>
    </button>
  );
}
