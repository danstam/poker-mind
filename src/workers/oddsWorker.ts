import { calculateOdds } from '../lib/calculator';


// Card definitions
const SUITS = ['h', 'd', 'c', 's'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const FULL_DECK: string[] = [];
for (const r of RANKS) {
    for (const s of SUITS) {
        FULL_DECK.push(r + s);
    }
}

self.onmessage = (e: MessageEvent) => {
    const { type, data } = e.data;

    if (type === 'CALCULATE') {
        const { numPlayers, myCards, board, deadCards, iterations } = data;

        try {
            const start = performance.now();
            const result = calculateOdds(numPlayers, myCards, board, deadCards || [], iterations);

            const end = performance.now();

            self.postMessage({
                type: 'RESULT',
                data: {
                    ...result,
                    time: end - start
                }
            });
        } catch (error) {
            self.postMessage({ type: 'ERROR', error: (error as any).message });
        }
    }
};
