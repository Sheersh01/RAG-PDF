import { useEffect, useState } from "react";

const CircularProgress = ({ percentage = 0, size = 160, strokeWidth = 14 }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(percentage), 150);
    return () => clearTimeout(timer);
  }, [percentage]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine colors based on score
  const getProgressColorClass = (val) => {
    if (val >= 80) return "stroke-emerald-500 shadow-emerald-500/20";
    if (val >= 50) return "stroke-indigo-500 shadow-indigo-500/20";
    return "stroke-rose-500 shadow-rose-500/20";
  };

  const getTextColorClass = (val) => {
    if (val >= 80) return "text-emerald-400";
    if (val >= 50) return "text-indigo-450";
    return "text-rose-400";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-slate-800"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Glowing Progress Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={`transition-all duration-1000 ease-out ${getProgressColorClass(percentage)}`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{ filter: "drop-shadow(0px 0px 6px var(--tw-shadow-color, #6366f1))" }}
        />
      </svg>
      {/* Centered Content */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-3xl font-display font-extrabold tracking-tight ${getTextColorClass(percentage)}`}>
          {percentage}%
        </span>
        <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
          Match Score
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;
