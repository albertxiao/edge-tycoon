import { DurableObject } from "cloudflare:workers";
import type { DurableObjectState } from "@cloudflare/workers-types";
import { GameState, GameRoom, Player, Tile, Property, Station, Utility, CardAction, TradeOffer } from '@shared/types';
import { BOARD_TILES, STARTING_MONEY, PLAYER_COLORS, BOARD_SIZE, CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from '@shared/game-constants';
import { Env } from "./core-utils";
function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
export class GlobalDurableObject extends DurableObject {
  private games: GameRoom = {};
  constructor(state: DurableObjectState, env: Env) {
    super(state, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.games = (await this.ctx.storage.get<GameRoom>("GAMES_STORAGE")) || {};
    });
  }
  private async saveGames() {
    await this.ctx.storage.put("GAMES_STORAGE", this.games);
  }
  async createGame(gameId: string, playerNames: string[], cpuCount: number): Promise<GameState> {
    const humanPlayers = playerNames.map((name, index) => ({ id: `${gameId}-${index}`, name: name || `Player ${index + 1}`, isCpu: false }));
    const cpuPlayers = Array.from({ length: cpuCount }, (_, i) => ({ id: `${gameId}-cpu-${i}`, name: `CPU ${i + 1}`, isCpu: true }));
    const allPlayersInfo = [...humanPlayers, ...cpuPlayers];
    const players: Player[] = allPlayersInfo.map((playerInfo, index) => ({
      id: playerInfo.id,
      name: playerInfo.name,
      isCpu: playerInfo.isCpu,
      money: STARTING_MONEY,
      position: 0,
      color: PLAYER_COLORS[index],
      isInJail: false,
      jailTurns: 0,
      getOutOfJailFreeCards: 0
    }));
    const newGame: GameState = {
      gameId,
      players,
      board: JSON.parse(JSON.stringify(BOARD_TILES)),
      currentPlayerIndex: 0,
      dice: [0, 0],
      gameStatus: 'playing',
      gameLog: [`Game started with ${players.length} players!`],
      winner: undefined,
      lastUpdate: Date.now(),
      chanceDeck: shuffle(CHANCE_CARDS),
      communityChestDeck: shuffle(COMMUNITY_CHEST_CARDS),
      activeTrade: null,
    };
    this.games[gameId] = newGame;
    await this.saveGames();
    return newGame;
  }
  async getGameState(gameId: string): Promise<GameState | undefined> {
    return this.games[gameId];
  }
  async executeGameAction(gameId: string, action: string, payload?: any): Promise<GameState> {
    let state = this.games[gameId];
    if (!state) throw new Error("Game not found");
    if (state.gameStatus === 'ended') return state;
    state.lastCard = undefined;
    switch (action) {
      case 'rollDice':
        state = this.rollDice(state);
        break;
      case 'buyProperty':
        state = this.buyProperty(state);
        break;
      case 'manageProperty':
        state = this.manageProperty(state, payload);
        break;
      case 'proposeTrade':
        state.activeTrade = payload;
        state.gameLog.push(`${state.players.find(p => p.id === payload.fromPlayerId)?.name} proposed a trade to ${state.players.find(p => p.id === payload.toPlayerId)?.name}.`);
        break;
      case 'respondToTrade':
        state = this.respondToTrade(state, payload.accepted);
        break;
      case 'endTurn':
        state = this.endTurn(state);
        break;
    }
    state = this.checkBankruptcy(state);
    state = this.checkForWinner(state);
    while (state.players[state.currentPlayerIndex]?.isCpu && state.gameStatus === 'playing') {
        state = this.runCpuTurn(state);
        state = this.checkBankruptcy(state);
        state = this.checkForWinner(state);
    }
    state.lastUpdate = Date.now();
    this.games[gameId] = state;
    await this.saveGames();
    return state;
  }
  private respondToTrade(state: GameState, accepted: boolean): GameState {
    const trade = state.activeTrade;
    if (!trade) return state;
    const fromPlayer = state.players.find(p => p.id === trade.fromPlayerId);
    const toPlayer = state.players.find(p => p.id === trade.toPlayerId);
    if (accepted && fromPlayer && toPlayer) {
        fromPlayer.money -= trade.moneyOffered;
        toPlayer.money += trade.moneyOffered;
        fromPlayer.money += trade.moneyRequested;
        toPlayer.money -= trade.moneyRequested;
        trade.propertiesOffered.forEach(propIndex => {
            const tile = state.board[propIndex] as Property | Station | Utility;
            if (tile.ownerId === fromPlayer.id) tile.ownerId = toPlayer.id;
        });
        trade.propertiesRequested.forEach(propIndex => {
            const tile = state.board[propIndex] as Property | Station | Utility;
            if (tile.ownerId === toPlayer.id) tile.ownerId = fromPlayer.id;
        });
        state.gameLog.push(`Trade between ${fromPlayer.name} and ${toPlayer.name} was accepted.`);
    } else {
        state.gameLog.push(`Trade was rejected.`);
    }
    state.activeTrade = null;
    return state;
  }
  private runCpuTurn(state: GameState): GameState {
    state.gameLog.push(`${state.players[state.currentPlayerIndex].name} is thinking...`);
    state = this.rollDice(state);
    const player = state.players[state.currentPlayerIndex];
    if (!player.isInJail) {
        const tile = state.board[player.position] as Property | Station | Utility;
        if ((tile.type === 'property' || tile.type === 'station' || tile.type === 'utility') && !tile.ownerId) {
            if (player.money > tile.price + 500) {
                state = this.buyProperty(state);
            }
        }
    }
    state.board.forEach((tile, index) => {
        if(tile.type === 'property' && tile.ownerId === player.id && player.money > tile.houseCost + 200 && tile.houses < 5) {
            const monopolyColor = tile.color;
            const groupProperties = state.board.filter(t => t.type === 'property' && t.color === monopolyColor) as Property[];
            const ownsAll = groupProperties.every(p => p.ownerId === player.id);
            if(ownsAll) {
                const minHouses = Math.min(...groupProperties.map(p => p.houses));
                if (tile.houses === minHouses) {
                    state = this.manageProperty(state, { tileIndex: index, action: 'build' });
                }
            }
        }
    });
    return this.endTurn(state);
  }
  private manageProperty(state: GameState, payload: { tileIndex: number, action: 'build' | 'sell' | 'mortgage' | 'unmortgage' }): GameState {
    const player = state.players[state.currentPlayerIndex];
    const tile = state.board[payload.tileIndex];
    if (tile.type === 'property' && tile.ownerId === player.id) {
        const groupProperties = state.board.filter(t => t.type === 'property' && t.color === tile.color) as Property[];
        const ownsAll = groupProperties.every(p => p.ownerId === player.id);
        if (payload.action === 'build' && ownsAll && player.money >= tile.houseCost && tile.houses < 5 && !tile.mortgaged) {
            const minHouses = Math.min(...groupProperties.map(p => p.houses));
            if (tile.houses === minHouses) {
                player.money -= tile.houseCost;
                tile.houses++;
                state.gameLog.push(`${player.name} built a house on ${tile.name}.`);
            } else {
                state.gameLog.push(`Cannot build on ${tile.name}. Must build evenly.`);
            }
        } else if (payload.action === 'sell' && tile.houses > 0) {
            const maxHouses = Math.max(...groupProperties.map(p => p.houses));
             if (tile.houses === maxHouses) {
                player.money += tile.houseCost / 2;
                tile.houses--;
                state.gameLog.push(`${player.name} sold a house on ${tile.name}.`);
            } else {
                state.gameLog.push(`Cannot sell from ${tile.name}. Must sell evenly.`);
            }
        }
    }
    if ((tile.type === 'property' || tile.type === 'station' || tile.type === 'utility') && tile.ownerId === player.id) {
        if (payload.action === 'mortgage' && !tile.mortgaged && (!('houses' in tile) || tile.houses === 0)) {
            tile.mortgaged = true;
            player.money += tile.price / 2;
            state.gameLog.push(`${player.name} mortgaged ${tile.name}.`);
        } else if (payload.action === 'unmortgage' && tile.mortgaged && player.money >= (tile.price / 2) * 1.1) {
            tile.mortgaged = false;
            player.money -= (tile.price / 2) * 1.1;
            state.gameLog.push(`${player.name} unmortgaged ${tile.name}.`);
        }
    }
    return state;
  }
  private rollDice(state: GameState): GameState {
    const player = state.players[state.currentPlayerIndex];
    if (player.isInJail) {
        if (player.getOutOfJailFreeCards > 0) {
            player.getOutOfJailFreeCards--;
            player.isInJail = false;
            state.gameLog.push(`${player.name} used a Get Out of Jail Free card.`);
        } else if (player.money > 50) {
            player.money -= 50;
            player.isInJail = false;
            state.gameLog.push(`${player.name} paid $50 to get out of jail.`);
        } else {
            state.gameLog.push(`${player.name} is stuck in jail!`);
            return this.endTurn(state);
        }
    }
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    state.dice = [die1, die2];
    state.gameLog.push(`${player.name} rolled a ${die1} and a ${die2}.`);
    return this.movePlayer(state, die1 + die2);
  }
  private movePlayer(state: GameState, amount: number, absolute: boolean = false): GameState {
    const player = state.players[state.currentPlayerIndex];
    const newPosition = absolute ? amount : (player.position + amount) % BOARD_SIZE;
    if (!absolute && newPosition < player.position) {
      player.money += 200;
      state.gameLog.push(`${player.name} passed GO and collected $200.`);
    }
    player.position = newPosition;
    const tileName = state.board[newPosition].name;
    state.gameLog.push(`${player.name} moved to ${tileName}.`);
    return this.handleTileAction(state);
  }
  private handleTileAction(state: GameState): GameState {
    const player = state.players[state.currentPlayerIndex];
    const tile = state.board[player.position];
    switch (tile.type) {
        case 'property':
        case 'station':
        case 'utility':
            if (tile.ownerId && tile.ownerId !== player.id && !tile.mortgaged) {
                const owner = state.players.find((p) => p.id === tile.ownerId);
                if (owner) {
                    let rent = 0;
                    if (tile.type === 'property') rent = tile.rent[tile.houses];
                    else if (tile.type === 'station') {
                        const ownedStations = state.board.filter((t) => t.type === 'station' && t.ownerId === owner.id).length;
                        rent = tile.rent[ownedStations - 1];
                    } else if (tile.type === 'utility') {
                        const ownedUtilities = state.board.filter((t) => t.type === 'utility' && t.ownerId === owner.id).length;
                        rent = (state.dice[0] + state.dice[1]) * (ownedUtilities === 1 ? 4 : 10);
                    }
                    player.money -= rent;
                    owner.money += rent;
                    state.gameLog.push(`${player.name} paid ${rent} rent to ${owner.name}.`);
                }
            }
            break;
        case 'tax':
            player.money -= tile.amount;
            state.gameLog.push(`${player.name} paid ${tile.amount} in ${tile.name}.`);
            break;
        case 'special':
            if (tile.name === 'Go To Jail') {
                player.position = 10;
                player.isInJail = true;
                state.gameLog.push(`${player.name} went to jail!`);
            }
            break;
        case 'chance':
            state = this.drawCard(state, 'chance');
            break;
        case 'community-chest':
            state = this.drawCard(state, 'community-chest');
            break;
    }
    return state;
  }
  private drawCard(state: GameState, type: 'chance' | 'community-chest'): GameState {
    const deck = type === 'chance' ? state.chanceDeck : state.communityChestDeck;
    const card = deck.shift();
    if (!card) return state;
    state.lastCard = { ...card, cardType: type };
    state.gameLog.push(`${state.players[state.currentPlayerIndex].name} drew a ${type} card: ${card.text}`);
    deck.push(card);
    const player = state.players[state.currentPlayerIndex];
    switch (card.type) {
        case 'money':
            player.money += card.amount!;
            state.gameLog.push(card.amount! > 0 ? `Collected ${card.amount!}` : `Paid ${-card.amount!}`);
            break;
        case 'move':
            state = this.movePlayer(state, card.amount!);
            break;
        case 'goto':
            state = this.movePlayer(state, card.position!, true);
            break;
        case 'jail':
            player.position = 10;
            player.isInJail = true;
            break;
        case 'get_out_of_jail':
            player.getOutOfJailFreeCards += 1;
            break;
    }
    return state;
  }
  private buyProperty(state: GameState): GameState {
    const player = state.players[state.currentPlayerIndex];
    const tile = state.board[player.position] as Property | Station | Utility;
    if ((tile.type === 'property' || tile.type === 'station' || tile.type === 'utility') && !tile.ownerId) {
      if (player.money >= tile.price) {
        player.money -= tile.price;
        tile.ownerId = player.id;
        state.gameLog.push(`${player.name} bought ${tile.name} for ${tile.price}.`);
      }
    }
    return state;
  }
  private endTurn(state: GameState): GameState {
    if (state.gameStatus === 'ended') return state;
    let nextPlayerIndex = state.currentPlayerIndex;
    do {
        nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
    } while (state.players[nextPlayerIndex].money < 0 && nextPlayerIndex !== state.currentPlayerIndex);
    state.currentPlayerIndex = nextPlayerIndex;
    state.dice = [0, 0];
    const nextPlayer = state.players[state.currentPlayerIndex];
    state.gameLog.push(`It's now ${nextPlayer.name}'s turn.`);
    return state;
  }
  private checkBankruptcy(state: GameState): GameState {
    state.players.forEach(player => {
        if (player.money < 0) {
            const hasAlreadyBeenProcessed = state.gameLog.some(log => log.includes(`${player.name} has gone bankrupt!`));
            if (!hasAlreadyBeenProcessed) {
                state.gameLog.push(`${player.name} has gone bankrupt!`);
                state.board.forEach(tile => {
                    if ('ownerId' in tile && tile.ownerId === player.id) {
                        tile.ownerId = undefined;
                        if (tile.type === 'property') tile.houses = 0;
                        if ('mortgaged' in tile) tile.mortgaged = false;
                    }
                });
            }
        }
    });
    return state;
  }
  private checkForWinner(state: GameState): GameState {
    const activePlayers = state.players.filter(p => p.money >= 0);
    if (activePlayers.length === 1 && state.players.length > 1) {
        state.winner = activePlayers[0];
        state.gameStatus = 'ended';
        state.gameLog.push(`${state.winner.name} has won the game!`);
    }
    return state;
  }
}