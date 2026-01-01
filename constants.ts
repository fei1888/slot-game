import { SlotSymbol, SymbolId } from './types';

export const SYMBOLS: SlotSymbol[] = [
  { id: SymbolId.CHERRY, icon: '🍒', value: 2, weight: 40 },
  { id: SymbolId.LEMON, icon: '🍋', value: 3, weight: 30 },
  { id: SymbolId.GRAPE, icon: '🍇', value: 5, weight: 20 },
  { id: SymbolId.BELL, icon: '🔔', value: 10, weight: 15 },
  { id: SymbolId.DIAMOND, icon: '💎', value: 25, weight: 8 },
  { id: SymbolId.SEVEN, icon: '7️⃣', value: 50, weight: 5 },
  { id: SymbolId.STAR, icon: '🌟', value: 100, weight: 4 }, // Scatter Symbol
];

export const INITIAL_BALANCE = 1000;
export const MIN_BET = 10;
export const MAX_BET = 100;
export const BET_STEP = 10;
export const SPIN_DURATION_MS = 1500;
export const REEL_DELAY_MS = 300; // Delay between reels stopping

// Helper to get a random symbol based on weight
export const getRandomSymbol = (): SlotSymbol => {
  const totalWeight = SYMBOLS.reduce((acc, s) => acc + s.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const symbol of SYMBOLS) {
    if (random < symbol.weight) return symbol;
    random -= symbol.weight;
  }
  return SYMBOLS[0];
};