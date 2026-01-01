import React from 'react';
import { Plus, Minus, Zap } from 'lucide-react';
import { playClick } from '../services/audioService';

interface ControlsProps {
  currentBet: number;
  balance: number;
  isSpinning: boolean;
  onSpin: () => void;
  onIncreaseBet: () => void;
  onDecreaseBet: () => void;
  onMaxBet: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentBet,
  balance,
  isSpinning,
  onSpin,
  onIncreaseBet,
  onDecreaseBet,
  onMaxBet
}) => {
  
  const handleAction = (action: () => void) => {
    playClick();
    action();
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-4 bg-slate-900/90 rounded-t-3xl border-t border-gold-500/30 backdrop-blur-md shadow-2xl">
      
      {/* Bet Adjusters */}
      <div className="flex items-center justify-between bg-slate-800 p-2 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2">
           <span className="text-slate-400 text-xs uppercase font-bold tracking-wider ml-2">Bet</span>
           <span className="text-gold-400 font-mono text-xl font-bold">{currentBet}</span>
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => handleAction(onDecreaseBet)} 
                disabled={isSpinning}
                className="p-2 rounded-full bg-slate-700 text-white active:scale-95 transition-transform disabled:opacity-50"
            >
                <Minus size={20} />
            </button>
            <button 
                onClick={() => handleAction(onIncreaseBet)} 
                disabled={isSpinning}
                className="p-2 rounded-full bg-slate-700 text-white active:scale-95 transition-transform disabled:opacity-50"
            >
                <Plus size={20} />
            </button>
            <button 
                onClick={() => handleAction(onMaxBet)}
                disabled={isSpinning} 
                className="px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-bold uppercase active:scale-95 disabled:opacity-50"
            >
                Max
            </button>
        </div>
      </div>

      {/* Main Spin Button */}
      <button
        onClick={onSpin}
        disabled={isSpinning || balance < currentBet}
        className={`
            relative w-full py-6 rounded-2xl font-black text-3xl tracking-widest uppercase
            transition-all duration-100 transform
            ${isSpinning ? 'bg-slate-700 text-slate-500 cursor-not-allowed scale-95' : 'bg-gradient-to-b from-gold-400 to-gold-600 text-slate-900 shadow-lg shadow-gold-500/20 active:scale-95 active:shadow-none'}
            ${balance < currentBet ? 'opacity-50 grayscale' : ''}
        `}
      >
        {isSpinning ? 'Spinning...' : 'SPIN'}
        {!isSpinning && <Zap className="absolute top-1/2 right-6 -translate-y-1/2 text-white/40" size={32} fill="currentColor" />}
      </button>

      {/* Balance Display Small */}
      <div className="text-center text-slate-500 text-xs">
        BALANCE: <span className="text-slate-300 font-mono">{balance}</span>
      </div>
    </div>
  );
};

export default Controls;