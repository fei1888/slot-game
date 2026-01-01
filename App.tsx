import React, { useState, useEffect, useCallback } from 'react';
import Reel from './components/Reel';
import Controls from './components/Controls';
import { GameState, SymbolId, ReelState, SlotSymbol } from './types';
import { 
  SYMBOLS, 
  INITIAL_BALANCE, 
  getRandomSymbol, 
  MIN_BET, 
  MAX_BET, 
  BET_STEP,
  REEL_DELAY_MS
} from './constants';
import { Trophy, CircleDollarSign, Info, Share2, Check, Sparkles } from 'lucide-react';
import { playSpinStart, playWin, playClick, playBonusTrigger } from './services/audioService';

const App: React.FC = () => {
  // Game State
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [currentBet, setCurrentBet] = useState(MIN_BET);
  const [win, setWin] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winLines, setWinLines] = useState<number[]>([]); 
  const [winningCells, setWinningCells] = useState<{[key: number]: number[]}>({});
  const [showShareToast, setShowShareToast] = useState(false);
  
  // Bonus Feature State
  const [freeSpins, setFreeSpins] = useState(0);
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [wonFreeSpinsCount, setWonFreeSpinsCount] = useState(0);
  
  // Initialize Reels: 5 columns, each with 3 symbols
  const [reels, setReels] = useState<SlotSymbol[][]>([
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
    [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
  ]);

  // Handle Spin Logic
  const handleSpin = useCallback(() => {
    // Allow spin if balance sufficient OR if we have free spins
    if ((balance < currentBet && freeSpins === 0) || isSpinning) return;

    playSpinStart();
    
    // Only deduct balance if NOT a free spin
    if (freeSpins > 0) {
      setFreeSpins(prev => prev - 1);
    } else {
      setBalance(prev => prev - currentBet);
    }

    setWin(0);
    setWinLines([]);
    setWinningCells({});
    setShowWinModal(false);
    setShowBonusModal(false);
    setIsSpinning(true);

    // Generate new 5x3 grid results
    const newReels = [
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
    ];

    // Base spin duration before stop sequence begins
    const baseSpinDuration = 1000;

    setTimeout(() => {
      setReels(newReels);
      setIsSpinning(false); // Triggers reel visual stop sequence
      
      // Calculate win AFTER the last reel has physically stopped
      // Last reel (index 4) stops at: REEL_DELAY_MS * 4
      setTimeout(() => {
        checkWin(newReels);
      }, (REEL_DELAY_MS * 4) + 100); 

    }, baseSpinDuration);

  }, [balance, currentBet, isSpinning, freeSpins]);

  const checkWin = (grid: SlotSymbol[][]) => {
    let totalWin = 0;
    const winningLineIndices: number[] = [];
    // Initialize winning cells for 5 columns
    const newWinningCells: {[key: number]: number[]} = { 0: [], 1: [], 2: [], 3: [], 4: [] };

    // --- 1. CHECK SCATTERS (FREE SPINS) ---
    // Count Stars anywhere on the screen
    let starCount = 0;
    const starCells: {c: number, r: number}[] = [];
    
    grid.forEach((col, cIdx) => {
        col.forEach((symbol, rIdx) => {
            if (symbol.id === SymbolId.STAR) {
                starCount++;
                starCells.push({c: cIdx, r: rIdx});
            }
        });
    });

    if (starCount >= 3) {
        let spinsWon = 0;
        if (starCount === 3) spinsWon = 5;
        else if (starCount === 4) spinsWon = 10;
        else if (starCount >= 5) spinsWon = 20;

        // Mark star cells as winning
        starCells.forEach(cell => {
             if (!newWinningCells[cell.c].includes(cell.r)) {
                newWinningCells[cell.c].push(cell.r);
            }
        });

        // Trigger Bonus
        setFreeSpins(prev => prev + spinsWon);
        setWonFreeSpinsCount(spinsWon);
        setShowBonusModal(true);
        playBonusTrigger();
        
        // Scatters also pay out a small cash prize
        totalWin += currentBet * starCount;
    }


    // --- 2. CHECK PAYLINES ---
    // Define 15 Paylines (5 Columns x 3 Rows)
    const paylines = [
        // 1-3: Straights
        [{c:0,r:1}, {c:1,r:1}, {c:2,r:1}, {c:3,r:1}, {c:4,r:1}], // 0: Middle
        [{c:0,r:0}, {c:1,r:0}, {c:2,r:0}, {c:3,r:0}, {c:4,r:0}], // 1: Top
        [{c:0,r:2}, {c:1,r:2}, {c:2,r:2}, {c:3,r:2}, {c:4,r:2}], // 2: Bottom
        // 4-5: V and Inverted V
        [{c:0,r:0}, {c:1,r:1}, {c:2,r:2}, {c:3,r:1}, {c:4,r:0}], // 3: V Shape
        [{c:0,r:2}, {c:1,r:1}, {c:2,r:0}, {c:3,r:1}, {c:4,r:2}], // 4: Inverted V
        // 6-10: Diagonals / Steps
        [{c:0,r:0}, {c:1,r:0}, {c:2,r:1}, {c:3,r:2}, {c:4,r:2}], // 5: Step Down
        [{c:0,r:2}, {c:1,r:2}, {c:2,r:1}, {c:3,r:0}, {c:4,r:0}], // 6: Step Up
        [{c:0,r:1}, {c:1,r:0}, {c:2,r:0}, {c:3,r:0}, {c:4,r:1}], // 7: Arch Top
        [{c:0,r:1}, {c:1,r:2}, {c:2,r:2}, {c:3,r:2}, {c:4,r:1}], // 8: Arch Bottom
        [{c:0,r:0}, {c:1,r:1}, {c:2,r:0}, {c:3,r:1}, {c:4,r:0}], // 9: ZigZag Top
        // 11-15: More ZigZags and Shapes
        [{c:0,r:2}, {c:1,r:1}, {c:2,r:2}, {c:3,r:1}, {c:4,r:2}], // 10: ZigZag Bottom
        [{c:0,r:0}, {c:1,r:1}, {c:2,r:1}, {c:3,r:1}, {c:4,r:0}], // 11: Bowl Top
        [{c:0,r:2}, {c:1,r:1}, {c:2,r:1}, {c:3,r:1}, {c:4,r:2}], // 12: Bowl Bottom
        [{c:0,r:1}, {c:1,r:0}, {c:2,r:1}, {c:3,r:2}, {c:4,r:1}], // 13: Diamond Center
        [{c:0,r:1}, {c:1,r:2}, {c:2,r:1}, {c:3,r:0}, {c:4,r:1}], // 14: X Shape
    ];

    paylines.forEach((line, lineIndex) => {
        const firstSymbol = grid[line[0].c][line[0].r];
        
        // Stars (Scatters) generally don't form line wins unless specific,
        // but here we treat them as normal symbols on lines too if they match
        // Or we can exclude them from lines. Let's exclude STAR from line matching to keep it purely Scatter.
        if (firstSymbol.id === SymbolId.STAR) return;

        let matchCount = 1;

        // Check consecutive matches from left to right
        for (let i = 1; i < 5; i++) {
            const currentSymbol = grid[line[i].c][line[i].r];
            // Star does not act as wild here.
            if (currentSymbol.id === firstSymbol.id || (firstSymbol.id === SymbolId.SEVEN && currentSymbol.id === SymbolId.SEVEN)) {
                matchCount++;
            } else {
                break;
            }
        }

        let lineWin = 0;

        // Payout Logic (Left to Right)
        if (matchCount >= 3) {
            // Base Multipliers
            const symbolValue = firstSymbol.value;
            if (matchCount === 3) lineWin = symbolValue * currentBet * 0.2;
            else if (matchCount === 4) lineWin = symbolValue * currentBet * 2;
            else if (matchCount === 5) lineWin = symbolValue * currentBet * 10;
        }

        // Cherry Bonus
        if (matchCount === 2 && firstSymbol.id === SymbolId.CHERRY) {
            lineWin = currentBet * 0.5;
        }

        if (lineWin > 0) {
            totalWin += lineWin;
            winningLineIndices.push(lineIndex);
            
            // Mark winning cells
            for (let i = 0; i < matchCount; i++) {
                const cell = line[i];
                // Avoid duplicates in array
                if (!newWinningCells[cell.c].includes(cell.r)) {
                    newWinningCells[cell.c].push(cell.r);
                }
            }
        }
    });

    setWinningCells(newWinningCells);

    if (totalWin > 0) {
      const finalWin = Math.floor(totalWin);
      const isBigWin = finalWin >= currentBet * 20; 
      
      setWin(finalWin);
      setWinLines(winningLineIndices);
      setBalance(prev => prev + finalWin);
      
      if (!showBonusModal) {
          playWin(isBigWin);
          if (isBigWin) {
            setShowWinModal(true);
          }
      }
    }
  };

  const handleShare = async () => {
    playClick();
    const shareData = {
      title: 'Neon Slots 5-Reel',
      text: 'Play Neon Slots! I just hit a win!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled
      }
    } else {
      // Fallback for desktop
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const handleIncreaseBet = () => {
    if (currentBet + BET_STEP <= MAX_BET && currentBet + BET_STEP <= balance) {
      setCurrentBet(prev => prev + BET_STEP);
    }
  };

  const handleDecreaseBet = () => {
    if (currentBet - BET_STEP >= MIN_BET) {
      setCurrentBet(prev => prev - BET_STEP);
    }
  };

  const handleMaxBet = () => {
    const maxPossible = Math.min(MAX_BET, balance);
    const stepped = Math.floor(maxPossible / BET_STEP) * BET_STEP;
    if (stepped >= MIN_BET) setCurrentBet(stepped);
  };

  return (
    <div className={`
        min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-between overflow-hidden font-sans transition-colors duration-1000
        ${freeSpins > 0 ? 'bg-indigo-950' : 'bg-slate-900'}
    `}>
      
      {/* Header */}
      <header className={`w-full p-3 shadow-lg z-10 border-b transition-colors duration-1000 ${freeSpins > 0 ? 'bg-indigo-900 border-indigo-500/50' : 'bg-slate-800 border-gold-600/20'}`}>
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className={`p-1.5 rounded-lg text-slate-900 transition-colors ${freeSpins > 0 ? 'bg-indigo-400' : 'bg-gold-500'}`}>
               <Trophy size={20} fill="currentColor" />
             </div>
             <h1 className={`text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r ${freeSpins > 0 ? 'from-indigo-300 to-purple-400' : 'from-gold-300 to-gold-600'}`}>
               NEON 5
             </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={handleShare}
                className="p-2 rounded-full bg-slate-700/50 hover:bg-slate-700 text-gold-400 active:scale-95 transition-all"
                aria-label="Share Game"
             >
                <Share2 size={18} />
             </button>
             <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Credits</span>
                <div className={`flex items-center gap-1 ${freeSpins > 0 ? 'text-indigo-300' : 'text-gold-400'}`}>
                    <CircleDollarSign size={16} />
                    <span className="font-mono text-lg font-bold">{balance.toLocaleString()}</span>
                </div>
             </div>
          </div>
        </div>
      </header>

      {/* Main Game Area */}
      <main className="flex-1 w-full max-w-2xl mx-auto flex flex-col justify-center items-center relative p-2 gap-2">
        
        {/* Win / Bonus Display */}
        <div className="h-14 flex items-center justify-center w-full relative">
            {freeSpins > 0 && !isSpinning && !win && (
                <div className="animate-pulse flex items-center gap-2 text-indigo-300 bg-indigo-900/50 px-4 py-2 rounded-full border border-indigo-500/50">
                    <Sparkles size={16} />
                    <span className="font-bold tracking-widest uppercase text-sm">Free Spins: {freeSpins}</span>
                    <Sparkles size={16} />
                </div>
            )}
            
            {win > 0 && !isSpinning && (
                <div className="animate-bounce-win text-center">
                    <div className="text-gold-300 text-xs uppercase tracking-[0.3em] font-bold mb-1">Total Win</div>
                    <div className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
                        {win}
                    </div>
                </div>
            )}

            {!win && !isSpinning && freeSpins === 0 && (
                 <div className="flex items-center gap-2 text-slate-600 text-xs font-medium tracking-widest uppercase bg-slate-800/50 px-3 py-1 rounded-full">
                    <Info size={12} />
                    <span>3+ 🌟 for Bonus</span>
                 </div>
            )}
        </div>

        {/* The Slots Machine Frame - 5x3 Grid */}
        <div className={`w-full p-2 rounded-2xl shadow-2xl border-4 relative transition-colors duration-1000 ${freeSpins > 0 ? 'bg-indigo-900 border-indigo-700' : 'bg-slate-800 border-slate-700'}`}>
            
            {/* Payline Indicators (Left) */}
            <div className={`absolute -left-1 top-[20%] w-1.5 h-1.5 rounded-full ${winLines.length > 0 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-slate-600'}`}></div>
            <div className={`absolute -left-1 top-[50%] w-1.5 h-1.5 rounded-full ${winLines.length > 0 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-slate-600'}`}></div>
            <div className={`absolute -left-1 top-[80%] w-1.5 h-1.5 rounded-full ${winLines.length > 0 ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-slate-600'}`}></div>

            <div className={`grid grid-cols-5 gap-1 p-1 rounded-lg transition-colors ${freeSpins > 0 ? 'bg-indigo-950' : 'bg-slate-900'}`}>
                {[0, 1, 2, 3, 4].map((colIndex) => (
                    <Reel 
                        key={colIndex}
                        symbols={reels[colIndex]} 
                        isSpinning={isSpinning} 
                        stopDelay={REEL_DELAY_MS * colIndex}
                        winningIndices={winningCells[colIndex] || []}
                    />
                ))}
            </div>
            
            {/* Machine Decorative Gloss */}
            <div className="absolute inset-0 rounded-xl ring-1 ring-white/10 pointer-events-none" />
        </div>
      
      </main>

      {/* Controls Footer */}
      <footer className="w-full z-20 sticky bottom-0">
        <Controls 
            currentBet={currentBet}
            balance={balance}
            isSpinning={isSpinning}
            onSpin={handleSpin}
            onDecreaseBet={handleDecreaseBet}
            onIncreaseBet={handleIncreaseBet}
            onMaxBet={handleMaxBet}
        >
             {/* Override button content for Free Spins */}
             {freeSpins > 0 && (
                 <div className="flex flex-col items-center justify-center">
                    <span className="text-sm font-bold tracking-widest">FREE SPIN</span>
                    <span className="text-xs opacity-70">{freeSpins} Remaining</span>
                 </div>
             )}
        </Controls>
      </footer>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-xl border border-gold-500/50 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 z-50">
           <Check size={16} className="text-green-400" />
           <span className="text-sm font-bold">Link Copied!</span>
        </div>
      )}

      {/* Bonus Trigger Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300" onClick={() => setShowBonusModal(false)}>
             <div className="bg-gradient-to-b from-indigo-500 to-purple-600 p-1 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(79,70,229,0.8)] animate-pulse-glow">
                <div className="bg-slate-900 rounded-[22px] p-8 text-center flex flex-col items-center gap-4 border-4 border-indigo-400/50">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-200 uppercase tracking-tighter">
                        Bonus Triggered!
                    </h2>
                    <div className="text-6xl my-4 animate-bounce">🌟</div>
                    <div className="text-5xl font-mono font-bold text-white drop-shadow-md">
                        {wonFreeSpinsCount}
                    </div>
                    <p className="text-indigo-200 text-sm uppercase tracking-widest font-bold">Free Spins Awarded</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowBonusModal(false); }}
                        className="mt-4 px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full uppercase tracking-wider shadow-lg transition-colors"
                    >
                        Start Feature
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Big Win Modal Overlay */}
      {showWinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300" onClick={() => setShowWinModal(false)}>
            <div className="bg-gradient-to-b from-yellow-600 via-yellow-500 to-yellow-700 p-1 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(234,179,8,0.6)] animate-pulse-glow">
                <div className="bg-slate-900 rounded-[22px] p-8 text-center flex flex-col items-center gap-4 border-4 border-yellow-400/50">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-200 uppercase tracking-tighter">
                        Mega Win!
                    </h2>
                    <div className="text-6xl my-4">💎</div>
                    <div className="text-5xl font-mono font-bold text-white drop-shadow-md">
                        {win}
                    </div>
                    <p className="text-yellow-200/60 text-sm uppercase tracking-widest font-bold">Credits Awarded</p>
                    <button 
                        onClick={(e) => { e.stopPropagation(); setShowWinModal(false); }}
                        className="mt-4 px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-full uppercase tracking-wider shadow-lg transition-colors"
                    >
                        Collect
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;