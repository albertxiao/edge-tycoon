import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/hooks/useGameStore';
export const GameLog: React.FC = () => {
  const gameLog = useGameStore((state) => state.gameState?.gameLog || []);
  const logContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameLog]);
  return (
    <div className="retro-card border-cyan w-full h-full p-6 flex flex-col">
      <h2 className="text-3xl font-pixel text-cyan mb-4">Game Log</h2>
      <div ref={logContainerRef} className="flex-grow bg-black/50 p-2 border border-cyan/50 overflow-y-auto font-mono text-lime text-sm space-y-1">
        {gameLog.map((entry, index) => (
          <p key={index} className="animate-fade-in">{`> ${entry}`}</p>
        ))}
      </div>
    </div>
  );
};