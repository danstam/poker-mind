import { PokerEngine } from './poker-engine';


// Card definitions
const SUITS = ['h', 'd', 'c', 's'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

const FULL_DECK: string[] = [];
for (const r of RANKS) {
    for (const s of SUITS) {
        FULL_DECK.push(r + s);
    }
}

export function calculateOdds(numPlayers: number, myCards: string[], board: string[], deadCards: string[], iterations?: number) {
    // Convert cards to engine format (integers)
    const myCardIds = myCards.map(c => PokerEngine.getCardId(c));
    const boardIds = board.map(c => PokerEngine.getCardId(c));
    const deadCardIds = deadCards.map(c => PokerEngine.getCardId(c));

    const knownCards = new Set([...myCards, ...board, ...deadCards]);
    // We need the deck as integers for speed
    const deckIds = FULL_DECK
        .filter(c => !knownCards.has(c))
        .map(c => PokerEngine.getCardId(c));

    let wins = 0;
    let ties = 0;

    // Aggressive optimization for browser performance
    // 2 players: 5000 iterations
    // 3-5 players: 2000 iterations
    // 6+ players: 1000 iterations
    // With new engine, we can probably do 100,000 easily.
    // Let's try 50,000 default.
    const targetIterations = iterations || 50000;

    // Pre-allocate arrays for performance
    const communitySize = 5 - board.length;

    for (let i = 0; i < targetIterations; i++) {
        const needed = communitySize + (numPlayers - 1) * 2;
        const currentDeck = [...deckIds];

        // Partial shuffle
        for (let j = 0; j < needed; j++) {
            const r = j + Math.floor(Math.random() * (currentDeck.length - j));
            const temp = currentDeck[j];
            currentDeck[j] = currentDeck[r];
            currentDeck[r] = temp;
        }

        const drawnCards = currentDeck.slice(0, needed);

        // Combine board + drawn community cards
        // We can just use an array of numbers
        const community = [...boardIds, ...drawnCards.slice(0, communitySize)];

        const opponentsCards = [];
        let cardIdx = communitySize;

        for (let p = 0; p < numPlayers - 1; p++) {
            opponentsCards.push([drawnCards[cardIdx], drawnCards[cardIdx + 1]]);
            cardIdx += 2;
        }

        // Evaluate Hero
        // Hero hand is myCardIds + community
        const heroHand = [...myCardIds, ...community];
        const heroRank = PokerEngine.eval7(heroHand);

        let isWin = true;
        let isTie = false;

        for (const oppCards of opponentsCards) {
            const oppHand = [...oppCards, ...community];
            const oppRank = PokerEngine.eval7(oppHand);

            if (oppRank > heroRank) {
                isWin = false;
                isTie = false;
                break; // We lost
            } else if (oppRank === heroRank) {
                isWin = false;
                isTie = true;
                // Continue checking other opponents
            }
        }

        if (isWin) wins++;
        else if (isTie) ties++;
    }

    return {
        win: (wins / targetIterations) * 100,
        tie: (ties / targetIterations) * 100,
        lose: 100 - ((wins + ties) / targetIterations) * 100
    };
}

