import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/hooks/useGameStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster, toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
export function HomePage() {
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [cpuCount, setCpuCount] = useState(0);
  const [joinCode, setJoinCode] = useState('');
  const createGame = useGameStore((state) => state.createGame);
  const joinGame = useGameStore((state) => state.joinGame);
  const navigate = useNavigate();
  const handleNameChange = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };
  const handleAddPlayer = () => {
    if (playerNames.length + cpuCount < 4) {
      setPlayerNames([...playerNames, '']);
    }
  };
  const handleCreateGame = async () => {
    const filteredNames = playerNames.filter(name => name.trim() !== '');
    if (filteredNames.length === 0 && cpuCount < 2) {
        toast.error('Please add at least 2 players (human or CPU).');
        return;
    }
    if (filteredNames.length + cpuCount < 2) {
      toast.error('You need at least 2 players to start a game.');
      return;
    }
    if (filteredNames.length + cpuCount > 4) {
      toast.error('You can have a maximum of 4 players.');
      return;
    }
    const gameId = uuidv4().slice(0, 6);
    const newGame = await createGame(filteredNames, gameId, cpuCount);
    if (newGame) {
      navigate(`/game/${gameId}`);
    }
  };
  const handleJoinGame = async () => {
    if (!joinCode.trim()) {
      toast.error('Please enter a room code.');
      return;
    }
    const game = await joinGame(joinCode.trim());
    if (game) {
      navigate(`/game/${joinCode.trim()}`);
    }
  };
  const totalPlayers = playerNames.length + cpuCount;
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4 overflow-hidden">
      <Toaster richColors theme="dark" />
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl text-center"
      >
        <h1 className="text-7xl md:text-8xl font-pixel text-cyan animate-neon-glow mb-4">
          Edge Tycoon
        </h1>
        <p className="text-xl text-magenta mb-12">A Retro Property Trading Game</p>
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 border-2 border-cyan mb-4">
            <TabsTrigger value="create" className="font-pixel text-lg">Create Game</TabsTrigger>
            <TabsTrigger value="join" className="font-pixel text-lg">Join Game</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <div className="retro-card border-cyan p-8">
              <div className="space-y-4 mb-6">
                {playerNames.map((name, i) => (
                  <div key={i} className="flex flex-col items-start">
                    <Label htmlFor={`player${i + 1}`} className="font-pixel text-lg mb-2 text-cyan">
                      Player {i + 1}
                    </Label>
                    <Input
                      id={`player${i + 1}`}
                      type="text"
                      placeholder={`Enter Name...`}
                      value={name}
                      onChange={(e) => handleNameChange(i, e.target.value)}
                      className="bg-gray-900 border-2 border-magenta text-lime font-mono text-lg focus:ring-magenta focus:ring-2 focus:border-magenta"
                    />
                  </div>
                ))}
                 <div className="flex flex-col items-start">
                    <Label htmlFor="cpuCount" className="font-pixel text-lg mb-2 text-cyan">
                      CPU Players
                    </Label>
                    <Select onValueChange={(value) => setCpuCount(parseInt(value))} defaultValue="0">
                        <SelectTrigger className="w-full bg-gray-900 border-2 border-magenta text-lime font-mono text-lg focus:ring-magenta focus:ring-2 focus:border-magenta">
                            <SelectValue placeholder="Number of CPUs" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-900 border-magenta text-lime font-mono">
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
              </div>
              {totalPlayers < 4 && (
                <button onClick={handleAddPlayer} className="retro-btn-lime w-full mb-4">
                  Add Human Player
                </button>
              )}
              <button onClick={handleCreateGame} className="retro-btn-cyan w-full text-2xl py-4 mt-4">
                Create Game
              </button>
            </div>
          </TabsContent>
          <TabsContent value="join">
            <div className="retro-card border-cyan p-8">
              <div className="flex flex-col items-start mb-8">
                <Label htmlFor="roomCode" className="font-pixel text-lg mb-2 text-cyan">
                  Room Code
                </Label>
                <Input
                  id="roomCode"
                  type="text"
                  placeholder="Enter Code..."
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="bg-gray-900 border-2 border-magenta text-lime font-mono text-lg focus:ring-magenta focus:ring-2 focus:border-magenta"
                />
              </div>
              <button onClick={handleJoinGame} className="retro-btn-cyan w-full text-2xl py-4">
                Join Game
              </button>
            </div>
          </TabsContent>
        </Tabs>
        <footer className="mt-12 text-center text-muted-foreground/80">
          <p>Powered by Cloudflare</p>
        </footer>
      </motion.div>
    </main>
  );
}