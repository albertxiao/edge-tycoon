import React from 'react';
import { useGameStore } from '@/hooks/useGameStore';
interface ActionPanelProps {
  onManageProperties: () => void;
  onTrade: () => void;
}
export const ActionPanel: React.FC<ActionPanelProps> = ({ onManageProperties, onTrade }) => {
  const gameState = useGameStore((state) => state.gameState);
  const performAction = useGameStore((state) => state.performAction);
  if (!gameState) return null;
  const { players, currentPlayerIndex, board, dice } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const currentTile = board[currentPlayer?.position];
  const isCpuTurn = currentPlayer?.isCpu;
  const handleRollDice = () => performAction('rollDice');
  const handleBuyProperty = () => performAction('buyProperty');
  const handleEndTurn = () => performAction('endTurn');
  const canRoll = dice[0] === 0;
  const canBuy =
    !canRoll &&
    currentTile &&
    (currentTile.type === 'property' || currentTile.type === 'station' || currentTile.type === 'utility') &&
    !currentTile.ownerId &&
    currentPlayer.money >= currentTile.price;
  return (
    <div className="retro-card border-cyan w-full h-full p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-3xl font-pixel text-cyan mb-4">Actions</h2>
        {isCpuTurn && <p className="text-lime font-pixel animate-pulse mb-4">CPU IS THINKING...</p>}
        <div className="space-y-4">
          <button onClick={handleRollDice} disabled={!canRoll || isCpuTurn} className="retro-btn-cyan w-full">
            Roll Dice
          </button>
          <button onClick={handleBuyProperty} disabled={!canBuy || isCpuTurn} className="retro-btn-magenta w-full">
            Buy Property
          </button>
          <button onClick={onManageProperties} disabled={isCpuTurn} className="retro-btn-lime w-full">
            Manage Properties
          </button>
          <button onClick={onTrade} disabled={isCpuTurn} className="retro-btn-lime w-full">
            Propose Trade
          </button>
          <button onClick={handleEndTurn} disabled={canRoll || isCpuTurn} className="retro-btn-cyan w-full opacity-70">
            End Turn
          </button>
        </div>
      </div>
      <div className="text-center">
        {dice[0] > 0 && (
          <div className="mt-6">
            <p className="text-lg text-cyan">You Rolled:</p>
            <div className="flex justify-center gap-4 mt-2">
              <div className="w-16 h-16 border-2 border-lime flex items-center justify-center text-4xl font-mono text-lime">{dice[0]}</div>
              <div className="w-16 h-16 border-2 border-lime flex items-center justify-center text-4xl font-mono text-lime">{dice[1]}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};