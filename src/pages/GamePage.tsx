import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GameBoard } from '@/components/game/GameBoard';
import { PlayerHud } from '@/components/game/PlayerHud';
import { ActionPanel } from '@/components/game/ActionPanel';
import { GameLog } from '@/components/game/GameLog';
import { useGameStore } from '@/hooks/useGameStore';
import { useInterval } from 'react-use';
import { Toaster, toast } from 'sonner';
import { Copy } from 'lucide-react';
import { motion } from 'framer-motion';
import { CardDisplayModal } from '@/components/modals/CardDisplayModal';
import { PropertyManagementModal } from '@/components/modals/PropertyManagementModal';
import { TradeModal } from '@/components/modals/TradeModal';
import { TradeNotification } from '@/components/modals/TradeNotification';
import { useAudio } from '@/hooks/useAudio';
export function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { gameState, setGameState, resetGame, shownCard, clearShownCard } = useGameStore();
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const playSound = useAudio();
  useInterval(async () => {
    if (!gameId || gameState?.gameStatus === 'ended') return;
    const response = await fetch(`/api/game/${gameId}`);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data.lastUpdate > (gameState?.lastUpdate || 0)) {
        if (result.data.dice[0] > 0 && gameState?.dice[0] === 0) playSound('dice');
        if (result.data.gameLog.length > (gameState?.gameLog.length || 0)) playSound('move');
        setGameState(result.data);
      }
    }
  }, 2000);
  useEffect(() => {
    if (!gameId) {
      navigate('/');
    } else if (!gameState || gameState.gameId !== gameId) {
      const fetchInitialState = async () => {
        const response = await fetch(`/api/game/${gameId}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setGameState(result.data);
          } else {
            toast.error("Game not found", { description: "Redirecting to lobby..." });
            setTimeout(() => navigate('/'), 2000);
          }
        }
      };
      fetchInitialState();
    }
  }, [gameId, gameState, navigate, setGameState]);
  const handleQuit = () => {
    resetGame();
    navigate('/');
  };
  const handleCopyCode = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      toast.success("Room code copied to clipboard!");
    }
  };
  if (!gameState) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-cyan font-pixel text-2xl animate-pulse">LOADING GAME...</div>
      </main>
    );
  }
  const { players, currentPlayerIndex, gameStatus, winner } = gameState;
  return (
    <main className="min-h-screen w-full bg-background text-foreground p-4 lg:p-8 flex flex-col items-center justify-center overflow-hidden relative">
      <Toaster richColors theme="dark" />
      <CardDisplayModal card={shownCard} onClose={clearShownCard} />
      <PropertyManagementModal isOpen={isPropertyModalOpen} onClose={() => setIsPropertyModalOpen(false)} />
      <TradeModal isOpen={isTradeModalOpen} onClose={() => setIsTradeModalOpen(false)} />
      <TradeNotification />
      {gameStatus === 'ended' && winner && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50"
        >
          <div className="retro-card border-lime p-12 text-center">
            <h2 className="text-6xl font-pixel text-lime animate-neon-glow mb-4">GAME OVER</h2>
            <p className="text-3xl text-cyan mb-8">
              <span className="font-pixel" style={{color: winner.color}}>{winner.name}</span> is the winner!
            </p>
            <button onClick={handleQuit} className="retro-btn-cyan w-full text-2xl py-4">
              Back to Lobby
            </button>
          </div>
        </motion.div>
      )}
      <div className="w-full max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {players.slice(0, 2).map((player, index) => (
                <PlayerHud
                  key={player.id}
                  player={player}
                  isCurrentPlayer={index === currentPlayerIndex}
                />
              ))}
            </div>
            <GameBoard />
            {players.length > 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {players.slice(2, 4).map((player, index) => (
                  <PlayerHud
                    key={player.id}
                    player={player}
                    isCurrentPlayer={index + 2 === currentPlayerIndex}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="lg:col-span-1 flex flex-col gap-8">
            <div className="retro-card border-cyan p-4 text-center">
              <h3 className="font-pixel text-lime mb-2">ROOM CODE</h3>
              <div className="flex items-center justify-center gap-2 bg-black/50 p-2 border border-magenta">
                <p className="font-mono text-2xl text-cyan tracking-widest">{gameId}</p>
                <button onClick={handleCopyCode} className="text-magenta hover:text-cyan transition-colors">
                  <Copy className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="h-96">
              <ActionPanel onManageProperties={() => setIsPropertyModalOpen(true)} onTrade={() => setIsTradeModalOpen(true)} />
            </div>
            <div className="flex-grow h-96">
              <GameLog />
            </div>
            <button onClick={handleQuit} className="retro-btn-magenta w-full mt-4">
              Quit Game
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}