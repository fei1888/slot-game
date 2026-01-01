import React, { useState } from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { getLuckyQuote } from '../services/geminiService';

interface OracleProps {
  balance: number;
  lastWin: number;
}

const Oracle: React.FC<OracleProps> = ({ balance, lastWin }) => {
  const [quote, setQuote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const askOracle = async () => {
    setLoading(true);
    const result = await getLuckyQuote(balance, lastWin);
    setQuote(result);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4 px-4">
      {!quote && !loading && (
        <button
          onClick={askOracle}
          className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-900/50 border border-indigo-500/30 rounded-lg text-indigo-300 text-sm hover:bg-indigo-900/80 transition-colors"
        >
          <Sparkles size={16} />
          <span>Ask the AI Oracle for Luck</span>
        </button>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 w-full py-2 text-indigo-400 text-sm animate-pulse">
           <Sparkles size={16} className="animate-spin" /> Divining...
        </div>
      )}

      {quote && (
        <div className="relative bg-indigo-950 border border-indigo-500/50 p-4 rounded-xl animate-fade-in shadow-[0_0_15px_rgba(79,70,229,0.3)]">
          <button 
            onClick={() => setQuote(null)}
            className="absolute top-1 right-2 text-indigo-400 text-xs hover:text-white"
          >
            ✕
          </button>
          <div className="flex gap-3">
             <div className="bg-indigo-500/20 p-2 rounded-full h-fit">
                <MessageSquare size={20} className="text-indigo-400" />
             </div>
             <div>
                <h4 className="text-indigo-300 text-xs font-bold uppercase mb-1">Oracle Says</h4>
                <p className="text-indigo-100 text-sm italic leading-relaxed">"{quote}"</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Oracle;