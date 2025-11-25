import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardPicker } from './components/CardPicker';
import { PlayerControls } from './components/PlayerControls';
import { CardSlot } from './components/CardSlot';
import { HowItWorksModal } from './components/HowItWorksModal';
import { Calculator, RefreshCw, Trophy, AlertCircle, Info } from 'lucide-react';
import { WorkerPool } from './lib/WorkerPool';

// Worker type definition
type WorkerResult = {
  win: number;
  tie: number;
  lose: number;
  time: number;
};

function App() {
  const [numPlayers, setNumPlayers] = useState(6);
  const [holeCards, setHoleCards] = useState<(string | null)[]>([null, null]);
  const [boardCards, setBoardCards] = useState<(string | null)[]>([null, null, null, null, null]);
  const [activeSlot, setActiveSlot] = useState<{ type: 'hole' | 'board', index: number } | null>(null);
  const [odds, setOdds] = useState<WorkerResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const poolRef = useRef<WorkerPool | null>(null);

  useEffect(() => {
    // Initialize worker pool
    poolRef.current = new WorkerPool(new URL('./workers/oddsWorker.ts', import.meta.url));

    return () => {
      poolRef.current?.terminate();
    };
  }, []);

  const calculateOdds = useCallback(async () => {
    if (!poolRef.current) return;

    // Only calculate if we have 2 hole cards
    const myCards = holeCards.filter((c): c is string => c !== null);
    if (myCards.length < 2) {
      setOdds(null);
      return;
    }

    const board = boardCards.filter((c): c is string => c !== null);

    setCalculating(true);
    setError(null);

    try {
      // Use high iterations for accuracy, split across workers
      // 100,000 total iterations
      const result = await poolRef.current.calculate({
        numPlayers,
        myCards,
        board,
        deadCards: [],
        iterations: 100000

      });

      setOdds(result);
    } catch (err) {
      if (err !== 'Cancelled by new request') {
        setError((err as any).toString());
      }
    } finally {
      setCalculating(false);
    }
  }, [numPlayers, holeCards, boardCards]);

  // Auto-calculate when relevant state changes
  useEffect(() => {
    calculateOdds();
  }, [calculateOdds]);

  const handleCardSelect = (card: string) => {
    if (!activeSlot) return;

    if (activeSlot.type === 'hole') {
      const newHole = [...holeCards];
      newHole[activeSlot.index] = card;
      setHoleCards(newHole);

      // Auto-advance selection
      if (activeSlot.index === 0 && !newHole[1]) {
        setActiveSlot({ type: 'hole', index: 1 });
      } else {
        setActiveSlot(null);
      }
    } else {
      const newBoard = [...boardCards];
      newBoard[activeSlot.index] = card;
      setBoardCards(newBoard);

      // Auto-advance
      if (activeSlot.index < 4 && !newBoard[activeSlot.index + 1]) {
        setActiveSlot({ type: 'board', index: activeSlot.index + 1 });
      } else {
        setActiveSlot(null);
      }
    }
  };

  const handleReset = () => {
    setHoleCards([null, null]);
    setBoardCards([null, null, null, null, null]);
    setOdds(null);
    setActiveSlot(null);
  };

  const selectedCards = new Set([
    ...holeCards.filter((c): c is string => c !== null),
    ...boardCards.filter((c): c is string => c !== null)
  ]);

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center gap-8 max-w-6xl mx-auto">

      {/* Header */}
      <header className="w-full flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
            <Calculator className="text-blue-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Poker Mind
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide">PRECISION ODDS ENGINE</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 transition-all text-sm font-medium text-blue-300"
          >
            <Info size={16} />
            How It Works
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-sm font-medium text-slate-300"
          >
            <RefreshCw size={16} />
            Reset Hand
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Controls & Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-8">

          {/* Player Count */}
          <section>
            <PlayerControls count={numPlayers} onChange={setNumPlayers} />
          </section>

          {/* Hole Cards */}
          <section className="glass p-6 rounded-2xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Your Hand
            </h2>
            <div className="flex gap-4">
              {holeCards.map((card, i) => (
                <CardSlot
                  key={`hole-${i}`}
                  card={card}
                  isActive={activeSlot?.type === 'hole' && activeSlot.index === i}
                  onClick={() => setActiveSlot({ type: 'hole', index: i })}
                  placeholder={`Card ${i + 1}`}
                />
              ))}
            </div>
          </section>

          {/* Community Cards */}
          <section className="glass p-6 rounded-2xl">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Community Cards
            </h2>
            <div className="flex gap-4 flex-wrap">
              {boardCards.map((card, i) => (
                <div key={`board-${i}`} className={i === 3 ? 'ml-4' : '' /* Gap between Flop/Turn/River visual */}>
                  <CardSlot
                    card={card}
                    isActive={activeSlot?.type === 'board' && activeSlot.index === i}
                    onClick={() => setActiveSlot({ type: 'board', index: i })}
                    placeholder={i < 3 ? 'Flop' : i === 3 ? 'Turn' : 'River'}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Card Picker (Only visible when slot active) */}
          <section className={`transition-all duration-300 ${activeSlot ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 pointer-events-none grayscale'}`}>
            <CardPicker
              onSelect={handleCardSelect}
              selectedCards={selectedCards}
              disabled={!activeSlot}
            />
          </section>

        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 flex flex-col gap-6">

            {/* Odds Display */}
            <div className="glass-card p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>

              <h2 className="text-lg font-medium text-slate-300 mb-6 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                Win Probability
              </h2>

              {calculating ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-sm text-blue-400 animate-pulse">Running Monte Carlo Simulation...</p>
                </div>
              ) : odds ? (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-bold text-white tracking-tighter">
                      {odds.win.toFixed(1)}%
                    </span>
                    <span className="text-emerald-400 font-medium">Win</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Tie</span>
                      <span>{odds.tie.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${odds.win}%` }}></div>
                      <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${odds.tie}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Lose</span>
                      <span>{odds.lose.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-500 font-mono">
                      Computed in {odds.time.toFixed(0)}ms
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <p>Select your cards to calculate odds</p>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Instructions / Tips */}
            <div className="p-6 rounded-2xl border border-white/5 bg-white/5">
              <h3 className="text-sm font-bold text-slate-300 mb-2">Pro Tips</h3>
              <ul className="text-sm text-slate-400 space-y-2 list-disc list-inside">
                <li>Click a card slot to activate selection.</li>
                <li>Use the player controls to adjust for folds.</li>
                <li>Odds update automatically as you add cards.</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      <HowItWorksModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}

export default App;
