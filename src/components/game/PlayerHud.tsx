import React from 'react';
import { Player, Property, Station, Utility } from '@shared/types';
import { cn } from '@/lib/utils';
import { KeySquare, Home, Hotel } from 'lucide-react';
import { useGameStore } from '@/hooks/useGameStore';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
interface PlayerHudProps {
  player: Player;
  isCurrentPlayer: boolean;
}
export const PlayerHud: React.FC<PlayerHudProps> = ({ player, isCurrentPlayer }) => {
  const board = useGameStore(state => state.gameState?.board) || [];
  const ownedProperties = board.filter(tile => 'ownerId' in tile && tile.ownerId === player.id) as (Property | Station | Utility)[];
  const isBankrupt = player.money < 0;
  return (
    <div className={cn(
      "retro-card border-2 p-4 transition-all duration-300",
      isCurrentPlayer && !isBankrupt ? "border-lime shadow-neon-lime" : "border-cyan",
      isBankrupt && "opacity-50 bg-gray-900/50"
    )}>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-pixel" style={{ color: player.color }}>{player.name}</h3>
          {player.isCpu && <span className="text-xs font-mono bg-magenta text-black px-1 py-0.5">CPU</span>}
        </div>
        <div className="flex items-center gap-2">
          {player.getOutOfJailFreeCards > 0 && (
            <div className="flex items-center gap-1 text-yellow-400">
              <KeySquare className="w-4 h-4" />
              <span className="font-mono text-sm">x{player.getOutOfJailFreeCards}</span>
            </div>
          )}
          <p className={cn("text-2xl font-mono", isBankrupt ? "text-red-500" : "text-lime")}>
            ${player.money}
          </p>
        </div>
      </div>
      <div className="h-28 overflow-y-auto pr-2">
        <div className="flex justify-between items-center mb-1">
            <p className="text-sm uppercase text-cyan">Properties:</p>
            <Drawer>
                <DrawerTrigger asChild>
                    <button className="text-xs retro-btn-cyan px-2 py-0.5">View</button>
                </DrawerTrigger>
                <DrawerContent className="bg-background border-cyan">
                    <div className="mx-auto w-full max-w-2xl">
                        <DrawerHeader>
                            <DrawerTitle className="font-pixel text-2xl text-cyan">{player.name}'s Properties</DrawerTitle>
                        </DrawerHeader>
                        <div className="p-4 pb-0 max-h-96 overflow-y-auto">
                            {ownedProperties.length > 0 ? (
                                ownedProperties.map((prop, index) => (
                                    <div key={index} className={cn("p-2 border text-left flex justify-between items-center mb-2", prop.mortgaged ? "border-red-500/50" : "border-cyan/50")}>
                                        <div>
                                            <p className="font-pixel" style={{color: prop.type === 'property' ? prop.color : '#fff'}}>{prop.name}</p>
                                            {prop.mortgaged && <p className="text-red-500 text-xs font-mono">MORTGAGED</p>}
                                        </div>
                                        {prop.type === 'property' && (
                                            <div className="flex items-center gap-1">
                                                {Array.from({length: prop.houses < 5 ? prop.houses : 0}).map((_, i) => <Home key={i} className="w-4 h-4 text-lime" />)}
                                                {prop.houses === 5 && <Hotel className="w-4 h-4 text-red-500" />}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground">No properties owned.</p>
                            )}
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </div>
        {ownedProperties.length > 0 ? (
          <div className="grid grid-cols-2 gap-1">
            {ownedProperties.map((prop, index) => (
              <div key={index} className="text-xs p-1 bg-gray-800/50 truncate" title={prop.name} style={{ borderLeft: `3px solid ${prop.type === 'property' ? prop.color : 'transparent'}` }}>
                {prop.name}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">None</p>
        )}
      </div>
    </div>
  );
};