import React from 'react';

// Loader (Tailwind + project color schema aware)
//
// Props (all optional):
// 1) showLoadingText (boolean) — whether to show the loading text. Default: true
// 2) size (number | string | 'responsive') — controls loader size.
//    - number: treated as pixels (e.g. 120 -> '120px')
//    - string: valid CSS size (e.g. '140px', '10rem')
//    - 'responsive' (default): scales with viewport using clamp()
// 3) textPosition ('right' | 'bottom') — where to place the text relative to the loader.
//    - 'right' (default) places the text horizontally to the right of the loader.
//    - 'bottom' places the text below the loader.
// 4) loadingText (string) — custom loading message. Default: 'Loading...'
// 5) color (string) — either a token name from your schema ("primary", "secondary", "accent", "foreground", "muted", "destructive", "success")
//    or any valid CSS color string ("#26a", "rgb(10,20,30)", "hsl(200 80% 60%)"). Default: 'primary'
//
// Notes:
// - The component uses your CSS variables (e.g. --primary, --secondary, --accent, --ring, --foreground)
//   so it will automatically pick the right colors in light/dark themes.
// - Layout uses Tailwind utility classes; sizes are controlled with a CSS variable (--loader-size).
//
// Examples:
// <Loader />
// <Loader size={180} />
// <Loader size="200px" textPosition="bottom" loadingText="Please wait..." />
// <Loader color="secondary" />
// <Loader color="#ff6" />

export default function Loader({
  showLoadingText = true,
  size = 'responsive',
  textPosition = 'right',
  loadingText = 'Loading...',
  color = 'primary',
}) {
  // prepare inline styles — keep component self-contained while using Tailwind for layout
  const style = {};
  // loader size
  if (size === 'responsive') {
    style['--loader-size'] = 'clamp(80px, 9vw, 260px)';
  } else if (typeof size === 'number') {
    style['--loader-size'] = `${size}px`;
  } else if (typeof size === 'string') {
    style['--loader-size'] = size;
  } else {
    style['--loader-size'] = 'clamp(80px, 9vw, 260px)';
  }

  // color: either a schema token or a raw CSS color
  const schemaTokens = new Set(['primary', 'secondary', 'accent', 'foreground', 'muted', 'destructive', 'success', 'ring']);
  if (schemaTokens.has(color)) {
    // use theme token (these tokens hold "<h> <s%> <l%>" values in your schema)
    // we set the wrapper color so text inherits it and fallbacks inside the SVG use other schema vars
    style.color = `hsl(var(--${color}))`;
  } else {
    // raw CSS color string
    style.color = color;
  }

  const containerClasses = `inline-flex items-center gap-3 ${textPosition === 'bottom' ? 'flex-col' : 'flex-row'}`;

  // font-size for text — scale relative to loader size
  const textStyle = { fontSize: 'calc(var(--loader-size) * 0.16)', lineHeight: 1 };

  return (
    <div className={containerClasses} role="status" aria-live="polite" style={style}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        className="block"
        aria-hidden="true"
        style={{ width: 'var(--loader-size)', height: 'var(--loader-size)' }}
      >
        <defs>
          <clipPath id="pencil-eraser">
            <rect height={30} width={30} ry={5} rx={5} />
          </clipPath>
        </defs>

        {/* outer stroke uses the chosen token (or color) */}
        <circle
          transform="rotate(-113,100,100)"
          strokeLinecap="round"
          strokeDashoffset="439.82"
          strokeDasharray="439.82 439.82"
          strokeWidth={2}
          stroke={schemaTokens.has(color) ? `hsl(var(--${color}))` : color}
          fill="none"
          r={70}
          className="pencil__stroke"
        />

        <g transform="translate(100,100)" className="pencil__rotate">
          <g fill="none">
            {/* three concentric rings — use project tokens so they match theme */}
            <circle
              transform="rotate(-90)"
              strokeDashoffset={402}
              strokeDasharray="402.12 402.12"
              strokeWidth={30}
              stroke="hsl(var(--primary))"
              r={64}
              className="pencil__body1"
            />
            <circle
              transform="rotate(-90)"
              strokeDashoffset={465}
              strokeDasharray="464.96 464.96"
              strokeWidth={10}
              stroke="hsl(var(--ring))"
              r={74}
              className="pencil__body2"
            />
            <circle
              transform="rotate(-90)"
              strokeDashoffset={339}
              strokeDasharray="339.29 339.29"
              strokeWidth={10}
              stroke="hsl(var(--accent))"
              r={54}
              className="pencil__body3"
            />
          </g>

          <g transform="rotate(-90) translate(49,0)" className="pencil__eraser">
            <g className="pencil__eraser-skew">
              <rect height={30} width={30} ry={5} rx={5} fill="hsl(var(--secondary))" />
              <rect clipPath="url(#pencil-eraser)" height={30} width={5} fill="hsl(var(--secondary))" />
              <rect height={20} width={30} fill="hsl(var(--muted))" />
              <rect height={20} width={15} fill="hsl(var(--muted-foreground))" />
              <rect height={20} width={5} fill="hsl(var(--muted))" />
              <rect height={2} width={30} y={6} fill="hsla(0,0%,0%,0.06)" />
              <rect height={2} width={30} y={13} fill="hsla(0,0%,0%,0.06)" />
            </g>
          </g>

          <g transform="rotate(-90) translate(49,-30)" className="pencil__point">
            <polygon points="15 0,30 30,0 30" fill="hsl(var(--secondary))" />
            <polygon points="15 0,6 30,0 30" fill="hsl(var(--secondary-foreground))" />
            <polygon points="15 0,20 10,10 10" fill="hsl(var(--foreground))" />
          </g>
        </g>
      </svg>

      {showLoadingText && (
        <span className="font-semibold select-none text-[color:var(--loader-text-color)]" style={textStyle}>
          {loadingText}
        </span>
      )}

      {/* internal animation CSS — kept inside component (Tailwind handles layout / typography) */}
      <style>{`
        .pencil__body1,
        .pencil__body2,
        .pencil__body3,
        .pencil__eraser,
        .pencil__eraser-skew,
        .pencil__point,
        .pencil__rotate,
        .pencil__stroke {
          animation-duration: 3s;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .pencil__body1,
        .pencil__body2,
        .pencil__body3 {
          transform: rotate(-90deg);
        }

        .pencil__body1 { animation-name: pencilBody1; }
        .pencil__body2 { animation-name: pencilBody2; }
        .pencil__body3 { animation-name: pencilBody3; }
        .pencil__eraser { animation-name: pencilEraser; transform: rotate(-90deg) translate(49px,0); }
        .pencil__eraser-skew { animation-name: pencilEraserSkew; animation-timing-function: ease-in-out; }
        .pencil__point { animation-name: pencilPoint; transform: rotate(-90deg) translate(49px,-30px); }
        .pencil__rotate { animation-name: pencilRotate; }
        .pencil__stroke { animation-name: pencilStroke; transform: translate(100px,100px) rotate(-113deg); }

        @keyframes pencilBody1 {
          from, to { stroke-dashoffset: 351.86; transform: rotate(-90deg); }
          50% { stroke-dashoffset: 150.8; transform: rotate(-225deg); }
        }

        @keyframes pencilBody2 {
          from, to { stroke-dashoffset: 406.84; transform: rotate(-90deg); }
          50% { stroke-dashoffset: 174.36; transform: rotate(-225deg); }
        }

        @keyframes pencilBody3 {
          from, to { stroke-dashoffset: 296.88; transform: rotate(-90deg); }
          50% { stroke-dashoffset: 127.23; transform: rotate(-225deg); }
        }

        @keyframes pencilEraser { from, to { transform: rotate(-45deg) translate(49px,0); } 50% { transform: rotate(0deg) translate(49px,0); } }

        @keyframes pencilEraserSkew {
          from, 32.5%, 67.5%, to { transform: skewX(0); }
          35%, 65% { transform: skewX(-4deg); }
          37.5%, 62.5% { transform: skewX(8deg); }
          40%,45%,50%,55%,60% { transform: skewX(-15deg); }
          42.5%,47.5%,52.5%,57.5% { transform: skewX(15deg); }
        }

        @keyframes pencilPoint { from, to { transform: rotate(-90deg) translate(49px,-30px); } 50% { transform: rotate(-225deg) translate(49px,-30px); } }

        @keyframes pencilRotate { from { transform: translate(100px,100px) rotate(0); } to { transform: translate(100px,100px) rotate(720deg); } }

        @keyframes pencilStroke {
          from { stroke-dashoffset: 439.82; transform: translate(100px,100px) rotate(-113deg); }
          50% { stroke-dashoffset: 164.93; transform: translate(100px,100px) rotate(-113deg); }
          75%, to { stroke-dashoffset: 439.82; transform: translate(100px,100px) rotate(112deg); }
        }
      `}</style>
    </div>
  );
}
