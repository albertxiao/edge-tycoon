import React from 'react';
import { Tile } from '@shared/types';
import { cn } from '@/lib/utils';
import { Home, Hotel, Train, Zap, Diamond, HelpCircle, Box, Banknote } from 'lucide-react';
interface PropertyTileProps {
  tile: Tile;
  isCorner?: boolean;
  rotation?: 'top' | 'left' | 'bottom' | 'right';
  ownerColor?: string;
}
const tileIcons = {
  'Go': <div className="text-red-500 font-bold text-2xl transform -rotate-45">GO</div>,
  'Jail': <div className="text-gray-400 font-bold text-lg">JAIL</div>,
  'Free Parking': <Diamond className="w-8 h-8 text-cyan-400" />,
  'Go To Jail': <div className="text-red-500 font-bold text-lg">GO TO JAIL</div>,
  'Chance': <HelpCircle className="w-8 h-8 text-magenta" />,
  'Community Chest': <Box className="w-8 h-8 text-lime" />,
  'Income Tax': <Banknote className="w-8 h-8 text-green-500" />,
  'Luxury Tax': <Banknote className="w-8 h-8 text-green-500" />,
  'Reading Railroad': <Train className="w-8 h-8" />,
  'Pennsylvania Railroad': <Train className="w-8 h-8" />,
  'B. & O. Railroad': <Train className="w-8 h-8" />,
  'Short Line': <Train className="w-8 h-8" />,
  'Electric Company': <Zap className="w-8 h-8 text-yellow-400" />,
  'Water Works': <Zap className="w-8 h-8 text-blue-400" />,
};
export const PropertyTile: React.FC<PropertyTileProps> = React.memo(({ tile, isCorner, rotation = 'bottom', ownerColor }) => {
  const getRotationClass = () => {
    switch (rotation) {
      case 'top': return 'rotate-180';
      case 'left': return 'rotate-90';
      case 'right': return '-rotate-90';
      default: return '';
    }
  };
  const isMortgaged = 'mortgaged' in tile && tile.mortgaged;
  if (isCorner) {
    return (
      <div className="w-28 h-28 border-2 border-cyan flex items-center justify-center text-center p-1">
        <div className={cn("flex flex-col items-center justify-center h-full w-full", getRotationClass())}>
          {tile.name in tileIcons && tileIcons[tile.name as keyof typeof tileIcons]}
        </div>
      </div>
    );
  }
  const renderContent = () => {
    switch (tile.type) {
      case 'property':
        return (
          <>
            <div className="h-1/4 relative" style={{ backgroundColor: tile.color }}>
              <div className="absolute top-0 right-0 flex gap-0.5 p-0.5">
                {Array.from({length: tile.houses < 5 ? tile.houses : 0}).map((_, i) => <Home key={i} className="w-3 h-3 text-white bg-black/30 rounded-sm" />)}
                {tile.houses === 5 && <Hotel className="w-3 h-3 text-red-500 bg-black/30 rounded-sm" />}
              </div>
            </div>
            <div className="flex-grow flex flex-col justify-between items-center text-center p-1">
              <p className="text-xs uppercase font-pixel leading-tight">{tile.name}</p>
              <p className="text-sm font-mono">${tile.price}</p>
            </div>
          </>
        );
      case 'station':
      case 'utility':
        return (
          <div className="flex-grow flex flex-col justify-between items-center text-center p-2">
            <p className="text-xs uppercase font-pixel leading-tight">{tile.name}</p>
            {tile.name in tileIcons && tileIcons[tile.name as keyof typeof tileIcons]}
            <p className="text-sm font-mono">${tile.price}</p>
          </div>
        );
      case 'chance':
      case 'community-chest':
      case 'tax':
        return (
          <div className="flex-grow flex flex-col justify-between items-center text-center p-2">
            <p className="text-xs uppercase font-pixel leading-tight">{tile.name}</p>
            {tile.name in tileIcons && tileIcons[tile.name as keyof typeof tileIcons]}
            {tile.type === 'tax' && <p className="text-sm font-mono">${tile.amount}</p>}
          </div>
        );
      default:
        return null;
    }
  };
  return (
    <div className="w-20 h-28 border-2 border-cyan flex flex-col relative">
      {ownerColor && <div className="absolute inset-0 bg-opacity-30" style={{ backgroundColor: ownerColor }}></div>}
      {isMortgaged && <div className="absolute inset-0 bg-black/70 flex items-center justify-center font-pixel text-red-500 text-lg transform rotate-[-20deg] opacity-80">MORTGAGED</div>}
      <div className={cn("flex flex-col h-full w-full", getRotationClass())}>
        {renderContent()}
      </div>
    </div>
  );
});