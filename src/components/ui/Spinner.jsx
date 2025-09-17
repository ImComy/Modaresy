import React from 'react';

/**
 * Polished button spinner for "Modaresy" theme.
 *
 * Props:
 *  - size: number | string (px number or CSS string) default 16
 *  - color: CSS color string (default 'var(--primary)')
 *  - thickness: stroke width (number) default 3
 *  - speed: rotation duration seconds (number) default 0.9
 *  - ariaLabel: optional string for screen readers (if provided, spinner will expose a sr-only label)
 */
export default function Spinner({
  size = 16,
  color = 'var(--primary)',
  thickness = 3,
  speed = 0.9,
  ariaLabel,
}) {
  const id = React.useId ? React.useId().replace(/:/g, '-') : 'spinner';
  const dimension = typeof size === 'number' ? `${size}px` : size;

  return (
    <span
      role={ariaLabel ? 'status' : undefined}
      aria-live={ariaLabel ? 'polite' : undefined}
      aria-hidden={ariaLabel ? undefined : true}
      style={{ display: 'inline-block', width: dimension, height: dimension, color }}
      className="align-middle mx-1"
    >
      {/* Screen-reader text if requested */}
      {ariaLabel && <span className="sr-only">{ariaLabel}</span>}

      <svg
        viewBox="0 0 44 44"
        width={dimension}
        height={dimension}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden={ariaLabel ? 'false' : 'true'}
        focusable="false"
        style={{ display: 'block' }}
      >
        {/* gradient that uses currentColor */}
        <defs>
          <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.95" />
            <stop offset="60%" stopColor="currentColor" stopOpacity="0.65" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>

          {/* subtle blur for depth */}
          <filter id={`f-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.25" result="b" />
            <feBlend in="SourceGraphic" in2="b" />
          </filter>
        </defs>

        {/* background ring (track) */}
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeOpacity="0.12"
        />

        {/* rotating arc with rounded caps */}
        <g transform="translate(0,0)">
          <circle
            cx="22"
            cy="22"
            r="18"
            fill="none"
            stroke={`url(#g-${id})`}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray="85 60"
            filter={`url(#f-${id})`}
            transform-origin="22px 22px"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 22 22"
            to="360 22 22"
            dur={`${speed}s`}
            repeatCount="indefinite"
          />
        </g>

        {/* orbiting pulsing dot that follows the arc (g rotates) */}
        <g>
          {/* place dot at top and rotate group */}
          <g>
            <circle cx="22" cy="5.5" r={Math.max(1.2, thickness - 0.5)} fill="currentColor" />
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 22 22"
              to="360 22 22"
              dur={`${speed}s`}
              repeatCount="indefinite"
            />
            {/* subtle pulse on the dot */}
            <circle cx="22" cy="5.5" r={Math.max(1.2, thickness - 0.5)} fill="currentColor" opacity="0.18">
              <animate attributeName="r" values={`${Math.max(1.2, thickness - 0.5)};${Math.max(
                2.2,
                thickness + 0.5
              )};${Math.max(1.2, thickness - 0.5)}`} dur={`${speed}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.18;0.34;0.18" dur={`${speed}s`} repeatCount="indefinite" />
            </circle>
          </g>
        </g>
      </svg>
    </span>
  );
}
