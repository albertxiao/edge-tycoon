import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameStore';
export const TradeNotification: React.FC = () => {
  const { gameState, performAction } = useGameStore();
  // This is a placeholder for a real user ID system. In a real app, you'd get this from auth.
  // For now, we'll assume the first non-CPU player is the "local" user.
  const localPlayerId = gameState?.players.find(p => !p.isCpu)?.id;
  const trade = gameState?.activeTrade;
  const showNotification = trade && trade.toPlayerId === localPlayerId;
  if (!trade || !showNotification) return null;
  const fromPlayer = gameState.players.find(p => p.id === trade.fromPlayerId);
  const handleResponse = (accepted: boolean) => {
    performAction('respondToTrade', { accepted });
  };
  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <div className="retro-card border-lime p-6 w-full max-w-sm">
            <h3 className="font-pixel text-lime text-xl mb-2">Trade Offer!</h3>
            <p className="text-cyan mb-4">
              <span className="font-bold" style={{color: fromPlayer?.color}}>{fromPlayer?.name}</span> wants to trade.
            </p>
            {/* A full implementation would show details here */}
            <div className="flex gap-4">
              <button onClick={() => handleResponse(false)} className="retro-btn-magenta w-full">Decline</button>
              <button onClick={() => handleResponse(true)} className="retro-btn-cyan w-full">Accept</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};