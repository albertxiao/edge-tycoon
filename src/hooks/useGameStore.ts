import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { GameState, ApiResponse, CardAction } from '@shared/types';
import { toast } from 'sonner';
type GameStore = {
  gameState: GameState | null;
  shownCard: CardAction | null;
  setGameState: (gameState: GameState) => void;
  createGame: (playerNames: string[], gameId: string, cpuCount: number) => Promise<GameState | null>;
  joinGame: (gameId: string) => Promise<GameState | null>;
  performAction: (action: string, payload?: any) => Promise<void>;
  resetGame: () => void;
  clearShownCard: () => void;
};
export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    gameState: null,
    shownCard: null,
    setGameState: (gameState) => {
      set((state) => {
        if (gameState.lastCard) {
          state.shownCard = gameState.lastCard;
        }
        state.gameState = gameState;
      });
    },
    createGame: async (playerNames, gameId, cpuCount) => {
      try {
        const response = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerNames, gameId, cpuCount }),
        });
        const result: ApiResponse<GameState> = await response.json();
        if (result.success && result.data) {
          get().setGameState(result.data);
          return result.data;
        }
        throw new Error(result.error || 'Failed to create game');
      } catch (error: any) {
        toast.error('Error creating game', { description: error.message });
        return null;
      }
    },
    joinGame: async (gameId) => {
      try {
        const response = await fetch(`/api/game/${gameId}`);
        const result: ApiResponse<GameState> = await response.json();
        if (result.success && result.data) {
          get().setGameState(result.data);
          return result.data;
        }
        throw new Error(result.error || 'Game not found');
      } catch (error: any) {
        toast.error('Error joining game', { description: error.message });
        return null;
      }
    },
    performAction: async (action, payload) => {
      const gameId = get().gameState?.gameId;
      if (!gameId) return;
      try {
        const response = await fetch(`/api/game/${gameId}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, payload }),
        });
        const result: ApiResponse<GameState> = await response.json();
        if (result.success && result.data) {
          get().setGameState(result.data);
        } else {
          throw new Error(result.error || `Failed to perform action: ${action}`);
        }
      } catch (error: any) {
        toast.error('Action Failed', { description: error.message });
      }
    },
    resetGame: () => {
      set({ gameState: null, shownCard: null });
    },
    clearShownCard: () => {
      set({ shownCard: null });
    }
  })),
);