import React from 'react';
import { useGameStore } from '@/hooks/useGameStore';
import { PropertyTile } from './PropertyTile';
import { PlayerPawn } from './PlayerPawn';
import { cn } from '@/lib/utils';
const TILE_WIDTH = 80;
const CORNER_WIDTH = 112;
const BOARD_WIDTH = CORNER_WIDTH * 2 + TILE_WIDTH * 9;
const getTilePosition = (index: number) => {
  if (index >= 0 && index <= 10) {
    const pos = index === 0 ? 0 : CORNER_WIDTH + (index - 1) * TILE_WIDTH;
    return { x: BOARD_WIDTH - pos - (index === 0 ? CORNER_WIDTH : TILE_WIDTH/2 + 10), y: BOARD_WIDTH - CORNER_WIDTH/2 - 10 };
  }
  if (index > 10 && index <= 20) {
    const pos = index === 20 ? 0 : CORNER_WIDTH + (index - 11) * TILE_WIDTH;
    return { x: CORNER_WIDTH/2 - 10, y: BOARD_WIDTH - pos - (index === 20 ? CORNER_WIDTH : TILE_WIDTH/2 + 10) };
  }
  if (index > 20 && index <= 30) {
    const pos = index === 30 ? 0 : CORNER_WIDTH + (index - 21) * TILE_WIDTH;
    return { x: pos + (index === 30 ? 0 : TILE_WIDTH/2 - 10), y: CORNER_WIDTH/2 - 10 };
  }
  if (index > 30 && index < 40) {
    const pos = CORNER_WIDTH + (index - 31) * TILE_WIDTH;
    return { x: BOARD_WIDTH - CORNER_WIDTH/2 - 10, y: pos + TILE_WIDTH/2 - 10 };
  }
  return { x: 0, y: 0 };
};
export const GameBoard: React.FC = () => {
  const gameState = useGameStore((state) => state.gameState);
  if (!gameState) return null;
  const { board, players } = gameState;
  const getOwnerColor = (tile: (typeof board)[0]) => {
    if ('ownerId' in tile && tile.ownerId) {
      const owner = players.find((p) => p.id === tile.ownerId);
      return owner ? owner.color : undefined;
    }
    return undefined;
  };
  const renderTile = (tileIndex: number) => {
    const tile = board[tileIndex];
    if (!tile) return null;
    const isCorner = tileIndex % 10 === 0;
    let rotation: 'top' | 'left' | 'bottom' | 'right' = 'bottom';
    if (tileIndex >= 10 && tileIndex < 20) rotation = 'left';
    if (tileIndex >= 20 && tileIndex < 30) rotation = 'top';
    if (tileIndex >= 30 && tileIndex < 40) rotation = 'right';
    return <PropertyTile tile={tile} isCorner={isCorner} rotation={rotation} ownerColor={getOwnerColor(tile)} />;
  };
  return (
    <div className="relative aspect-square w-full max-w-[928px] bg-gray-900/50 p-2 border-4 border-cyan shadow-neon-cyan">
      <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-0">
        <h1 className="text-6xl font-pixel text-cyan animate-neon-glow">Edge Tycoon</h1>
      </div>
      <div className="w-full h-full grid grid-cols-11 grid-rows-11">
        {/* Corners */}
        <div className="col-start-1 row-start-1">{renderTile(20)}</div>
        <div className="col-start-11 row-start-1">{renderTile(30)}</div>
        <div className="col-start-1 row-start-11">{renderTile(10)}</div>
        <div className="col-start-11 row-start-11">{renderTile(0)}</div>
        {/* Top Row */}
        {Array.from({ length: 9 }).map((_, i) => <div key={`top-${i}`} className={`col-start-${i + 2} row-start-1`}>{renderTile(21 + i)}</div>)}
        {/* Bottom Row */}
        {Array.from({ length: 9 }).map((_, i) => <div key={`bottom-${i}`} className={`col-start-${i + 2} row-start-11`}>{renderTile(9 - i)}</div>)}
        {/* Left Col */}
        {Array.from({ length: 9 }).map((_, i) => <div key={`left-${i}`} className={`col-start-1 row-start-${i + 2}`}>{renderTile(19 - i)}</div>)}
        {/* Right Col */}
        {Array.from({ length: 9 }).map((_, i) => <div key={`right-${i}`} className={`col-start-11 row-start-${i + 2}`}>{renderTile(31 + i)}</div>)}
      </div>
      {players.map((player, i) => {
        const { x, y } = getTilePosition(player.position);
        return <PlayerPawn key={player.id} color={player.color} x={x} y={y} offset={i * 8} />;
      })}
    </div>
  );
};