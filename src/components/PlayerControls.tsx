import React from 'react';
import { Users, UserMinus, UserPlus } from 'lucide-react';

interface PlayerControlsProps {
    count: number;
    onChange: (count: number) => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ count, onChange }) => {
    return (
        <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg">
            <div className="flex items-center gap-2 text-slate-200">
                <Users size={20} />
                <span className="font-semibold">Players</span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onChange(Math.max(2, count - 1))}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
                    title="Player Folded / Remove Player"
                >
                    <UserMinus size={18} />
                </button>

                <span className="w-8 text-center text-xl font-bold text-white">{count}</span>

                <button
                    onClick={() => onChange(Math.min(10, count + 1))}
                    className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                    title="Add Player"
                >
                    <UserPlus size={18} />
                </button>
            </div>
        </div>
    );
};
