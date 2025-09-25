import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/hooks/useGameStore';
import { Property, Station, Utility, TradeOffer } from '@shared/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}
export const TradeModal: React.FC<TradeModalProps> = ({ isOpen, onClose }) => {
  const { gameState, performAction } = useGameStore();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [moneyOffered, setMoneyOffered] = useState(0);
  const [moneyRequested, setMoneyRequested] = useState(0);
  const [propertiesOffered, setPropertiesOffered] = useState<number[]>([]);
  const [propertiesRequested, setPropertiesRequested] = useState<number[]>([]);
  if (!gameState) return null;
  const { players, currentPlayerIndex, board } = gameState;
  const currentPlayer = players[currentPlayerIndex];
  const otherPlayers = players.filter(p => p.id !== currentPlayer.id && p.money >= 0);
  const getPlayerProperties = (playerId: string) => {
    return board
      .map((tile, index) => ({ ...tile, index }))
      .filter(tile => 'ownerId' in tile && tile.ownerId === playerId && !tile.mortgaged) as ((Property | Station | Utility) & { index: number })[];
  };
  const handleProposeTrade = () => {
    if (!selectedPlayerId) {
      toast.error("Please select a player to trade with.");
      return;
    }
    const tradeOffer: TradeOffer = {
      fromPlayerId: currentPlayer.id,
      toPlayerId: selectedPlayerId,
      moneyOffered,
      moneyRequested,
      propertiesOffered,
      propertiesRequested,
    };
    performAction('proposeTrade', tradeOffer);
    onClose();
  };
  const toggleProperty = (index: number, list: number[], setList: React.Dispatch<React.SetStateAction<number[]>>) => {
    if (list.includes(index)) {
      setList(list.filter(i => i !== index));
    } else {
      setList([...list, index]);
    }
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
            className="retro-card border-lime p-6 w-full max-w-4xl m-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-3xl font-pixel text-lime mb-4 text-center">Propose Trade</h2>
            <div className="mb-4">
              <Label className="font-pixel text-cyan">Trade with:</Label>
              <Select onValueChange={setSelectedPlayerId}>
                <SelectTrigger className="bg-gray-900 border-magenta text-lime font-mono"><SelectValue placeholder="Select a player..." /></SelectTrigger>
                <SelectContent className="bg-gray-900 border-magenta text-lime font-mono">
                  {otherPlayers.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4 flex-grow overflow-y-auto">
              {/* Your Offer */}
              <div className="retro-card border-cyan p-4">
                <h3 className="font-pixel text-cyan mb-2">Your Offer</h3>
                <Label className="text-lime">Money:</Label>
                <Input type="number" value={moneyOffered} onChange={e => setMoneyOffered(Math.max(0, parseInt(e.target.value) || 0))} className="bg-gray-900 border-magenta text-lime font-mono" />
                <Label className="text-lime mt-2 block">Properties:</Label>
                <div className="h-48 overflow-y-auto p-2 bg-black/50 border border-cyan/50 mt-1">
                  {getPlayerProperties(currentPlayer.id).map(prop => (
                    <div key={prop.index} className="flex items-center space-x-2 my-1">
                      <Checkbox id={`offer-${prop.index}`} onCheckedChange={() => toggleProperty(prop.index, propertiesOffered, setPropertiesOffered)} />
                      <label htmlFor={`offer-${prop.index}`} className="text-sm font-mono text-cyan truncate">{prop.name}</label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Their Offer */}
              <div className="retro-card border-magenta p-4">
                <h3 className="font-pixel text-magenta mb-2">You Request</h3>
                <Label className="text-lime">Money:</Label>
                <Input type="number" value={moneyRequested} onChange={e => setMoneyRequested(Math.max(0, parseInt(e.target.value) || 0))} className="bg-gray-900 border-cyan text-lime font-mono" />
                <Label className="text-lime mt-2 block">Properties:</Label>
                <div className="h-48 overflow-y-auto p-2 bg-black/50 border border-magenta/50 mt-1">
                  {selectedPlayerId && getPlayerProperties(selectedPlayerId).map(prop => (
                    <div key={prop.index} className="flex items-center space-x-2 my-1">
                      <Checkbox id={`request-${prop.index}`} onCheckedChange={() => toggleProperty(prop.index, propertiesRequested, setPropertiesRequested)} />
                      <label htmlFor={`request-${prop.index}`} className="text-sm font-mono text-cyan truncate">{prop.name}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <button onClick={onClose} className="retro-btn-magenta w-full">Cancel</button>
              <button onClick={handleProposeTrade} className="retro-btn-cyan w-full">Propose</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};