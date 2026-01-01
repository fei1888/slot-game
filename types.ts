export enum SymbolId {
  CHERRY = 'CHERRY',
  LEMON = 'LEMON',
  GRAPE = 'GRAPE',
  BELL = 'BELL',
  DIAMOND = 'DIAMOND',
  SEVEN = 'SEVEN',
  STAR = 'STAR'
}

export interface SlotSymbol {
  id: SymbolId;
  icon: string;
  value: number; // Multiplier
  weight: number; // Probability weight (higher = more common)
}

export interface Payline {
  symbols: SymbolId[];
  reward: number;
}

export interface ReelState {
  isSpinning: boolean;
  stopping: boolean;
  symbols: SlotSymbol[];
}

export interface GameState {
  balance: number;
  currentBet: number;
  win: number;
  isSpinning: boolean;
  reels: ReelState[]; // Changed from fixed tuple to array
  history: string[];
}