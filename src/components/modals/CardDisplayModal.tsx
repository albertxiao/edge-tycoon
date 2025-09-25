import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardAction } from '@shared/types';
import { HelpCircle, Box } from 'lucide-react';
import { cn } from '@/lib/utils';
interface CardDisplayModalProps {
  card: CardAction | null;
  onClose: () => void;
}
export const CardDisplayModal: React.FC<CardDisplayModalProps> = ({ card, onClose }) => {
  const isChance = card?.cardType === 'chance';
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20 }}
            className={cn("retro-card p-8 text-center w-full max-w-md m-4", isChance ? "border-magenta" : "border-lime")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              {isChance ? (
                <HelpCircle className="w-16 h-16 text-magenta animate-neon-glow" />
              ) : (
                <Box className="w-16 h-16 text-lime animate-neon-glow" />
              )}
            </div>
            <h2 className={cn("text-3xl font-pixel mb-6", isChance ? "text-magenta" : "text-lime")}>
              {isChance ? 'CHANCE' : 'COMMUNITY CHEST'}
            </h2>
            <p className="text-xl text-cyan mb-8 min-h-[6rem] flex items-center justify-center">
              {card.text}
            </p>
            <button onClick={onClose} className="retro-btn-cyan w-full text-xl py-3">
              OK
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};