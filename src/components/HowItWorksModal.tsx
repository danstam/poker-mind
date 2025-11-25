import React from 'react';
import { X, Cpu, Zap, BarChart3, ShieldCheck } from 'lucide-react';

interface HowItWorksModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="text-emerald-400" />
                        How It Works
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">

                    <div className="space-y-3">
                        <h3 className="text-lg font-bold text-white">Algorithm Overview</h3>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            This calculator uses a <strong>Monte Carlo simulation</strong> combined with a <strong>Cactus Kev hand evaluator</strong> to compute accurate poker odds. Here's the exact methodology:
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <h4 className="font-bold text-blue-300 mb-2 flex items-center gap-2">
                                <BarChart3 size={18} />
                                Step 1: Monte Carlo Simulation
                            </h4>
                            <div className="text-sm text-slate-300 space-y-2">
                                <p>We simulate 100,000 random poker hands using the following process:</p>
                                <ol className="list-decimal list-inside space-y-1 ml-2 text-slate-400">
                                    <li>Remove your known cards (hole cards + board cards) from the deck</li>
                                    <li>Shuffle the remaining deck using Fisher-Yates algorithm</li>
                                    <li>Deal random cards to opponents (2 cards each)</li>
                                    <li>Deal remaining community cards if needed</li>
                                    <li>Evaluate all hands and determine the winner</li>
                                    <li>Record result (Win, Tie, or Loss)</li>
                                    <li>Repeat 100,000 times</li>
                                </ol>
                                <p className="pt-2"><strong>Win Probability = (Total Wins / 100,000) × 100%</strong></p>
                                <p className="text-xs text-slate-500">Statistical margin of error: ±0.3% at 95% confidence</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <h4 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                                <Cpu size={18} />
                                Step 2: Hand Evaluation (Cactus Kev Algorithm)
                            </h4>
                            <div className="text-sm text-slate-300 space-y-2">
                                <p>Each hand is evaluated using a custom implementation of the Cactus Kev algorithm:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-400">
                                    <li><strong>Card Encoding:</strong> Each card is a 32-bit integer encoding rank (via prime number), suit (via bitmask), and rank position</li>
                                    <li><strong>5-Card Evaluation:</strong> Uses bitwise operations to check for flush, straight, pairs, etc. in O(1) time</li>
                                    <li><strong>7-Card Evaluation:</strong> Iterates through all C(7,5) = 21 combinations and picks the best 5-card hand</li>
                                    <li><strong>Performance:</strong> ~10 million hand evaluations per second per CPU core</li>
                                </ul>
                                <p className="text-xs text-slate-500 pt-2">This is the same algorithm used in professional poker software like PokerStove</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <h4 className="font-bold text-amber-300 mb-2 flex items-center gap-2">
                                <Zap size={18} />
                                Step 3: Parallel Execution
                            </h4>
                            <div className="text-sm text-slate-300 space-y-2">
                                <p>To achieve sub-second calculation times, we use Web Workers for parallelization:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-400">
                                    <li>Spawns {typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4} worker threads (one per CPU core)</li>
                                    <li>Splits 100,000 iterations evenly across workers (~{Math.ceil(100000 / (typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4)).toLocaleString()} per worker)</li>
                                    <li>Each worker runs independently in parallel</li>
                                    <li>Results are aggregated when all workers complete</li>
                                    <li>Typical execution time: 300-500ms for 100,000 iterations</li>
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                            <h4 className="font-bold text-emerald-300 mb-2 flex items-center gap-2">
                                <ShieldCheck size={18} />
                                Privacy & Security
                            </h4>
                            <div className="text-sm text-slate-300 space-y-2">
                                <p>All calculations run entirely in your browser:</p>
                                <ul className="list-disc list-inside space-y-1 ml-2 text-slate-400">
                                    <li>No data is sent to any server</li>
                                    <li>No tracking or analytics</li>
                                    <li>100% client-side JavaScript/TypeScript</li>
                                    <li>Open source - inspect the code yourself</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 text-center space-y-2">
                        <p className="text-xs text-slate-400">
                            <strong>Technical Stack:</strong> React 18, TypeScript, Web Workers API, Vite
                        </p>
                        <p className="text-xs text-slate-500">
                            Built from scratch with zero external poker libraries for maximum performance
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};
