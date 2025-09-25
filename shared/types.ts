export type TileType = 'property' | 'special' | 'utility' | 'station' | 'tax' | 'chance' | 'community-chest';
export interface Property {
  type: 'property';
  name: string;
  price: number;
  rent: number[];
  houseCost: number;
  color: string;
  ownerId?: string;
  houses: number; // 0-4 for houses, 5 for hotel
  mortgaged?: boolean;
}
export interface Station {
  type: 'station';
  name: string;
  price: number;
  rent: number[];
  ownerId?: string;
  mortgaged?: boolean;
}
export interface Utility {
  type: 'utility';
  name: string;
  price: number;
  ownerId?: string;
  mortgaged?: boolean;
}
export interface SpecialTile {
  type: 'special';
  name: 'Go' | 'Jail' | 'Free Parking' | 'Go To Jail';
}
export interface TaxTile {
  type: 'tax';
  name: string;
  amount: number;
}
export interface CardTile {
  type: 'chance' | 'community-chest';
  name: 'Chance' | 'Community Chest';
}
export type Tile = Property | Station | Utility | SpecialTile | TaxTile | CardTile;
export interface Player {
  id: string;
  name:string;
  money: number;
  position: number;
  color: string;
  isInJail: boolean;
  jailTurns: number;
  getOutOfJailFreeCards: number;
  isCpu: boolean;
}
export interface CardAction {
  text: string;
  type: 'move' | 'money' | 'goto' | 'jail' | 'get_out_of_jail';
  amount?: number;
  position?: number;
  cardType?: 'chance' | 'community-chest';
}
export interface TradeOffer {
    fromPlayerId: string;
    toPlayerId: string;
    propertiesOffered: number[]; // array of tile indices
    propertiesRequested: number[]; // array of tile indices
    moneyOffered: number;
    moneyRequested: number;
}
export interface GameState {
  gameId: string;
  players: Player[];
  board: Tile[];
  currentPlayerIndex: number;
  dice: [number, number];
  gameStatus: 'lobby' | 'playing' | 'ended';
  gameLog: string[];
  winner?: Player;
  lastUpdate: number;
  chanceDeck: CardAction[];
  communityChestDeck: CardAction[];
  lastCard?: CardAction;
  activeTrade: TradeOffer | null;
}
export interface GameRoom {
    [gameId: string]: GameState;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}