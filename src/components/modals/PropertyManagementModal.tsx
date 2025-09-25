import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameStore';
import { Property, Station, Utility } from '@shared/types';
import { cn } from '@/lib/utils';
import { Home, Hotel } from 'lucide-react';
interface PropertyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const PropertyManagementModal: React.FC<PropertyManagementModalProps> = ({ isOpen, onClose }) => {
  const gameState = useGameStore((state) => state.gameState);
  const performAction = useGameStore((state) => state.performAction);
  if (!gameState) return null;
  const { players, currentPlayerIndex, board } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const ownedProperties = board
    .map((tile, index) => ({ ...tile, index }))
    .filter(tile => 'ownerId' in tile && tile.ownerId === currentPlayer.id);
  const handleAction = (tileIndex: number, action: 'build' | 'sell' | 'mortgage' | 'unmortgage') => {
    performAction('manageProperty', { tileIndex, action });
  };
  return (
    <AnimatePresence>
      {isOpen && (
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
            className="retro-card border-lime p-6 text-center w-full max-w-2xl m-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-pixel text-lime mb-4">Manage Properties</h2>
            <div className="flex-grow bg-black/50 p-2 border border-cyan/50 overflow-y-auto h-96 space-y-2">
              {ownedProperties.length === 0 ? (
                <p className="text-cyan">You do not own any properties.</p>
              ) : (
                ownedProperties.map((prop) => {
                  const tile = prop as (Property | Station | Utility) & { index: number };
                  const isProperty = tile.type === 'property';
                  const canBuild = isProperty && tile.houses < 5 && currentPlayer.money >= tile.houseCost && !tile.mortgaged;
                  const canSell = isProperty && tile.houses > 0;
                  return (
                    <div key={tile.index} className={cn("p-2 border text-left flex justify-between items-center", tile.mortgaged ? "border-red-500/50" : "border-cyan/50")}>
                      <div>
                        <p className="font-pixel text-cyan">{tile.name}</p>
                        {isProperty && (
                          <div className="flex items-center gap-1">
                            {Array.from({length: tile.houses < 5 ? tile.houses : 0}).map((_, i) => <Home key={i} className="w-4 h-4 text-lime" />)}
                            {tile.houses === 5 && <Hotel className="w-4 h-4 text-red-500" />}
                          </div>
                        )}
                        {tile.mortgaged && <p className="text-red-500 text-xs font-mono">MORTGAGED</p>}
                      </div>
                      <div className="flex gap-1">
                        {isProperty && <button onClick={() => handleAction(tile.index, 'build')} disabled={!canBuild} className="retro-btn-lime text-xs px-2 py-1">Build</button>}
                        {isProperty && <button onClick={() => handleAction(tile.index, 'sell')} disabled={!canSell} className="retro-btn-magenta text-xs px-2 py-1">Sell</button>}
                        {tile.mortgaged ? (
                           <button onClick={() => handleAction(tile.index, 'unmortgage')} disabled={currentPlayer.money < (tile.price / 2) * 1.1} className="retro-btn-cyan text-xs px-2 py-1">Unmortgage</button>
                        ) : (
                           <button onClick={() => handleAction(tile.index, 'mortgage')} disabled={isProperty && tile.houses > 0} className="retro-btn-cyan text-xs px-2 py-1 opacity-70">Mortgage</button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <button onClick={onClose} className="retro-btn-cyan w-full text-xl py-3 mt-4">
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};