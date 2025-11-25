import React from 'react';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

const SUITS = [
    { key: 'h', icon: Heart, color: 'text-red-500' },
    { key: 'd', icon: Diamond, color: 'text-red-500' },
    { key: 'c', icon: Club, color: 'text-slate-900 dark:text-slate-100' },
    { key: 's', icon: Spade, color: 'text-slate-900 dark:text-slate-100' },
];

const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

interface CardPickerProps {
    onSelect: (card: string) => void;
    selectedCards: Set<string>; // Cards already in play (Hero, Board, Dead)
    disabled?: boolean;
}

export const CardPicker: React.FC<CardPickerProps> = ({ onSelect, selectedCards, disabled }) => {
    return (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-13 gap-1 p-2 md:p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-2xl">

            {SUITS.map((suit) => (
                <React.Fragment key={suit.key}>
                    {RANKS.map((rank) => {
                        const cardKey = rank + suit.key;
                        const isSelected = selectedCards.has(cardKey);

                        return (
                            <button
                                key={cardKey}
                                onClick={() => !isSelected && !disabled && onSelect(cardKey)}
                                disabled={isSelected || disabled}
                                className={`
                  relative flex flex-col items-center justify-center w-8 h-12 rounded-md text-xs font-bold transition-all duration-200
                  ${isSelected
                                        ? 'opacity-20 cursor-not-allowed bg-slate-800'
                                        : 'hover:scale-110 hover:z-10 bg-white dark:bg-slate-800 shadow-md hover:shadow-lg cursor-pointer border border-slate-200 dark:border-slate-700'
                                    }
                  ${suit.color}
                `}
                            >
                                <span className="absolute top-0.5 left-1">{rank}</span>
                                <suit.icon size={12} className="absolute bottom-1 right-1" fill="currentColor" />
                            </button>
                        );
                    })}
                </React.Fragment>
            ))}
        </div>
    );
};
