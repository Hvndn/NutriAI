import React from 'react';
import { motion } from 'framer-motion';

export const ScanLine: React.FC = () => {
  return (
    <motion.div
      initial={{ top: '0%' }}
      animate={{ top: '100%' }}
      transition={{
        repeat: Infinity,
        repeatType: 'reverse',
        duration: 2.2,
        ease: 'easeInOut',
      }}
      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-premium-green to-transparent z-10 shadow-glow pointer-events-none"
      style={{
        boxShadow: '0 0 12px 3px rgba(16, 185, 129, 0.85)',
      }}
    />
  );
};
export default ScanLine;
