import React from 'react';
import { gradeOf } from '../../data/dashboardData';

interface ScoreRingProps {
  score: number;
  size?: number;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({ score, size = 36 }) => {
  const g = gradeOf(score);
  const C = 2 * Math.PI * 14;
  const strokeDashoffset = C * (1 - score / 100);
  const fontSize = Math.round(size * 0.32);

  return (
    <span
      className="relative inline-grid place-items-center shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle cx="18" cy="18" r="14" stroke="#1f232e" strokeWidth="3.5" fill="none" />
        <circle
          cx="18"
          cy="18"
          r="14"
          stroke={g.color}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={strokeDashoffset}
        />
      </svg>
      <span
        className="absolute font-mono font-extrabold text-white"
        style={{ fontSize: `${fontSize}px` }}
      >
        {score}
      </span>
    </span>
  );
};
