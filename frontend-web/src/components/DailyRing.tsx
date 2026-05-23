import React from 'react';
import { motion } from 'framer-motion';

interface DailyRingProps {
  value: number;       // Calories đã nạp
  target: number;      // Calories mục tiêu
  size?: number;       // Đường kính vòng tròn
  strokeWidth?: number; // Độ dày viền
}

export const DailyRing: React.FC<DailyRingProps> = ({
  value = 0,
  target = 2000,
  size = 220,
  strokeWidth = 18
}) => {
  const percentage = Math.min(100, Math.max(0, (value / target) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Vòng nền xám nhạt mờ */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className="stroke-premium-border/30 fill-none"
          strokeWidth={strokeWidth}
        />
        
        {/* Vòng tiến trình Gradient */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-premium-green"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0px 0px 6px rgba(16, 185, 129, 0.4))'
          }}
        />
      </svg>

      {/* Nội dung text hiển thị ở giữa */}
      <div className="absolute text-center flex flex-col items-center">
        <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Đã Nạp</span>
        <span className="text-4xl font-extrabold text-white mt-1">
          {Math.round(value)}
        </span>
        <span className="text-xs font-semibold text-gray-500 mt-0.5">
          mục tiêu {target} kcal
        </span>
        
        {/* Đánh giá healthy nhanh */}
        <span className="text-xs font-bold text-premium-green px-2 py-0.5 bg-premium-green/10 rounded-full mt-3">
          {percentage >= 100 ? '🎉 Hoàn thành!' : `${Math.round(percentage)}%`}
        </span>
      </div>
    </div>
  );
};
export default DailyRing;
