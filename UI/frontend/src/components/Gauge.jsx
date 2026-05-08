import React from 'react';

const Gauge = ({ value, label, min, max, unit, size = 'small', color = '#06b6d4' }) => {
  const radius = size === 'large' ? 60 : 40;
  const stroke = size === 'large' ? 8 : 6;
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = (normalizedValue - min) / (max - min);
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px' }}>
      <svg height={radius * 2 + stroke * 2} width={radius * 2 + stroke * 2}>
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={stroke}
          r={radius}
          cx={radius + stroke}
          cy={radius + stroke}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          strokeLinecap="round"
          r={radius}
          cx={radius + stroke}
          cy={radius + stroke}
          transform={`rotate(-90 ${radius + stroke} ${radius + stroke})`}
        />
        <text
          x="50%"
          y="50%"
          dy=".3em"
          textAnchor="middle"
          fill="#f8fafc"
          fontSize={size === 'large' ? "1.8rem" : "1.1rem"}
          fontWeight="bold"
        >
          {value}
        </text>
      </svg>
      <div style={{ marginTop: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label} {unit && `(${unit})`}
      </div>
    </div>
  );
};

export default Gauge;
