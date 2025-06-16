import React, {useState, useEffect} from 'react';
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Star } from 'lucide-react';

const getCSSVar = (name) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();



const HalfCircleRating = ({
  rating,
  maxRating = 5,
  size = 220,
}) => {
  const percentage = Math.min(Math.max((rating / maxRating) * 100, 0), 100);
  const primary = getCSSVar('--primary') || '220, 90%, 56%';
  const fg = getCSSVar('--foreground') || '#1f1f1f';

  const labelColor = `hsl(${fg})`;

  const [themeColors, setThemeColors] = useState({
    primary: '220, 90%, 56%',
    foreground: '0, 0%, 10%',
    needle: '#000',
  });
  
useEffect(() => {
  const updateColors = () => {
    const primary = getCSSVar('--primary') || '220, 90%, 56%';
    const foreground = getCSSVar('--foreground') || '0, 0%, 10%';

    const isDark = document.documentElement.classList.contains('dark');
    const needleColor = isDark ? '#fff' : '#000';

    setThemeColors({
      primary,
      foreground,
      needle: needleColor,
    });
  };

  updateColors();

  const observer = new MutationObserver(() => {
    updateColors();
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  return () => observer.disconnect();
}, []);


  return (
    <div
      style={{
        width: size,
        height: size / 2,
        margin: 'auto',
        position: 'relative',
      }}
    >
      <CircularProgressbarWithChildren
        value={percentage}
        maxValue={100}
        strokeWidth={10}
        circleRatio={0.5}
        styles={buildStyles({
          rotation: 0.75,
          strokeLinecap: 'round',
          pathColor: `hsl(${primary})`,
          trailColor: 'rgba(200, 200, 200, 0.2)',
        })}
      >
        <div
          style={{
            position: 'absolute',
            top: '55%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: labelColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <Star size={18} strokeWidth={2} className="text-yellow-500" />
            {rating.toFixed(1)} / {maxRating}
          </div>
          <div style={{ fontSize: '0.85rem', color: labelColor, opacity: 0.75 }}>
            Tutor Rating
          </div>
        </div>
      </CircularProgressbarWithChildren>
    </div>
  );
};

export default HalfCircleRating;
