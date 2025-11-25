import React from 'react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface CardSlotProps {
    card: string | null;
    isActive: boolean;
    onClick: () => void;
    placeholder?: string;
}

const SuitIcon = ({ suit }: { suit: string }) => {
    if (suit === 'h') return <Heart size={16} className="text-red-500" fill="currentColor" />;
    if (suit === 'd') return <Diamond size={16} className="text-red-500" fill="currentColor" />;
    if (suit === 'c') return <Club size={16} className="text-slate-900 dark:text-slate-100" fill="currentColor" />;
    if (suit === 's') return <Spade size={16} className="text-slate-900 dark:text-slate-100" fill="currentColor" />;
    return null;
};

export const CardSlot: React.FC<CardSlotProps> = ({ card, isActive, onClick, placeholder }) => {
    const rank = card ? card[0] : null;
    const suit = card ? card[1] : null;

    return (
        <button
            onClick={onClick}
            className={`
        relative flex flex-col items-center justify-center w-14 h-20 rounded-lg border-2 transition-all duration-200
        ${isActive
                    ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                }
        ${card ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700' : ''}
      `}
        >
            {card ? (
                <>
                    <span className={`text-lg font-bold ${['h', 'd'].includes(suit!) ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {rank}
                    </span>
                    <div className="mt-1">
                        <SuitIcon suit={suit!} />
                    </div>
                </>
            ) : (
                <span className="text-xs text-white/30 font-medium uppercase tracking-wider">{placeholder || 'Card'}</span>
            )}
        </button>
    );
};
