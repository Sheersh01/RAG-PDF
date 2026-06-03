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
    if (val >= 80) return "stroke-[#4E7C59]";
    if (val >= 50) return "stroke-[#111111]";
    return "stroke-red-750";
  };

  const getTextColorClass = (val) => {
    if (val >= 80) return "text-[#4E7C59]";
    if (val >= 50) return "text-[#111111]";
    return "text-red-750";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-[#E8E8E6]"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress Circle */}
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
        />
      </svg>
      {/* Centered Content */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-3xl font-display font-medium tracking-tight ${getTextColorClass(percentage)}`}>
          {percentage}%
        </span>
        <span className="text-[10px] text-[#6B6B6B] font-semibold uppercase tracking-wider mt-0.5">
          Match Score
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;
