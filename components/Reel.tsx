import React, { useEffect, useState, useRef } from 'react';
import { SlotSymbol } from '../types';
import { SYMBOLS } from '../constants';
import { playReelStop } from '../services/audioService';

interface ReelProps {
  symbols: SlotSymbol[]; // Array of 3 symbols for this column
  isSpinning: boolean;
  stopDelay: number;
  winningIndices: number[]; // Array of indices (0,1,2) that are part of a win
}

const Particles: React.FC = () => {
  // Generate random particles
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = Math.random() * 360;
    const distance = 40 + Math.random() * 20; // px (Reduced for smaller cells)
    const tx = Math.cos(angle * (Math.PI / 180)) * distance;
    const ty = Math.sin(angle * (Math.PI / 180)) * distance;
    return { id: i, tx, ty };
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            // @ts-ignore
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animationDelay: `${Math.random() * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

const Reel: React.FC<ReelProps> = ({ symbols, isSpinning, stopDelay, winningIndices }) => {
  const [visualSymbols, setVisualSymbols] = useState<SlotSymbol[]>(symbols);
  const [blur, setBlur] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isSpinning) {
      setBlur(true);
      intervalRef.current = setInterval(() => {
        // Generate a random strip of 3 symbols while spinning
        const randomStrip = [
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
        ];
        setVisualSymbols(randomStrip);
      }, 80);
    } else {
      if (intervalRef.current) {
        setTimeout(() => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            setVisualSymbols(symbols); // Land on the actual result
            setBlur(false);
            playReelStop(); // Sound effect
        }, stopDelay);
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isSpinning, symbols, stopDelay]);

  return (
    <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-300 shadow-inner flex flex-col items-center justify-around py-1">
      {/* The Reel Strip */}
      {visualSymbols.map((symbol, index) => {
        const isWin = !isSpinning && winningIndices.includes(index);
        
        return (
          <div 
            key={index} 
            className={`
                relative flex-1 flex items-center justify-center w-full
                transform transition-all duration-200
                ${blur ? 'blur-sm scale-110' : 'scale-100'}
                ${isWin ? 'z-20' : 'z-0'}
            `}
          >
            {/* Symbol Content - Smaller text for 5 reels */}
            <div className={`
                text-3xl sm:text-4xl select-none relative z-10 
                ${isWin ? 'animate-pop drop-shadow-[0_0_15px_rgba(234,179,8,1)]' : ''}
            `}>
                {symbol.icon}
            </div>

            {/* Particle Effects for Win */}
            {isWin && <Particles />}
            
            {/* Background Glow for Win */}
            {isWin && (
                <div className="absolute inset-0 bg-gold-400/20 radial-gradient-glow animate-pulse"></div>
            )}
          </div>
        );
      })}
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none rounded-lg z-30"></div>
      
      {/* Grid Lines (Visual only) */}
      <div className="absolute top-1/3 left-0 right-0 h-px bg-slate-400/30 w-full z-10" />
      <div className="absolute top-2/3 left-0 right-0 h-px bg-slate-400/30 w-full z-10" />
    </div>
  );
};

export default Reel;