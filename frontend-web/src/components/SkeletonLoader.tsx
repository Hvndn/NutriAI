import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  count = 1
}) => {
  const items = Array.from({ length: count });

  const getVariantClass = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'rounded-md h-4 w-3/4';
      case 'rect':
      default:
        return 'rounded-2xl h-32 w-full';
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {items.map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-premium-border/40 ${getVariantClass()} ${className}`}
        />
      ))}
    </div>
  );
};

