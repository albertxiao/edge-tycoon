import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, GameState } from '@shared/types';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Create a new game
    app.post('/api/game', async (c) => {
        const { playerNames, gameId, cpuCount } = await c.req.json<{ playerNames: string[], gameId: string, cpuCount: number }>();
        if (!gameId || !playerNames || (playerNames.length + cpuCount) < 2) {
            return c.json({ success: false, error: 'Invalid request body' }, 400);
        }
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.createGame(gameId, playerNames, cpuCount);
        return c.json({ success: true, data } satisfies ApiResponse<GameState>);
    });
    // Get game state
    app.get('/api/game/:id', async (c) => {
        const id = c.req.param('id');
        const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await durableObjectStub.getGameState(id);
        if (!data) {
            return c.json({ success: false, error: 'Game not found' }, 404);
        }
        return c.json({ success: true, data } satisfies ApiResponse<GameState>);
    });
    // Perform a game action
    app.post('/api/game/:id/action', async (c) => {
        const id = c.req.param('id');
        const { action, payload } = await c.req.json<{ action: string, payload?: any }>();
        if (!action) {
            return c.json({ success: false, error: 'Action not specified' }, 400);
        }
        try {
            const durableObjectStub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await durableObjectStub.executeGameAction(id, action, payload);
            return c.json({ success: true, data } satisfies ApiResponse<GameState>);
        } catch (e: any) {
            return c.json({ success: false, error: e.message }, 400);
        }
    });
}