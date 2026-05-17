interface MatchRingProps {
  score: number;
  size?: number;
}

function matchColor(score: number) {
  if (score >= 80) return 'text-tertiary';
  if (score >= 60) return 'text-amber-400';
  return 'text-secondary';
}

export function MatchRing({ score, size = 56 }: MatchRingProps) {
  const r = (size - 8) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  const color = matchColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-white/10"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={4}
        />
        <circle
          className={`${color} drop-shadow-[0_0_8px_rgba(78,222,163,0.4)]`}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-xs font-semibold tracking-wide ${color}`}>
        {score}%
      </span>
    </div>
  );
}
