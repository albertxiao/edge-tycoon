import React from 'react';
import { motion } from 'framer-motion';
interface PlayerPawnProps {
  color: string;
  x: number;
  y: number;
  offset: number;
}
export const PlayerPawn: React.FC<PlayerPawnProps> = ({ color, x, y, offset }) => {
  return (
    <motion.div
      className="absolute w-6 h-6 rounded-full border-2 border-white z-20"
      style={{
        backgroundColor: color,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
      }}
      initial={{ x, y: y + offset }}
      animate={{ x, y: y + offset }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    />
  );
};