import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  glow?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick,
  glow = false
}) => {
  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'backdrop-blur-md bg-premium-card/65 border border-premium-border/40 rounded-3xl p-6 shadow-premium transition-all duration-300',
          onClick && 'cursor-pointer hover:border-premium-green/50 hover:bg-premium-card/85 active:scale-98',
          glow && 'shadow-glow border-premium-green/30',
          className
        )
      )}
    >
      {children}
    </div>
  );
};
export default GlassCard;
