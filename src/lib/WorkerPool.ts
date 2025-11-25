type OddsRequest = {
    numPlayers: number;
    myCards: string[];
    board: string[];
    deadCards: string[];
    iterations: number;
};

type WorkerResult = {
    win: number;
    tie: number;
    lose: number;
    time: number;
};

export class WorkerPool {
    private workers: Worker[] = [];
    private activeWorkers = 0;
    private results: { wins: number; ties: number; total: number }[] = [];
    private startTime = 0;
    private resolvePromise: ((result: WorkerResult) => void) | null = null;
    private rejectPromise: ((error: string) => void) | null = null;

    constructor(workerScriptUrl: string | URL, private concurrency: number = navigator.hardwareConcurrency || 4) {
        for (let i = 0; i < this.concurrency; i++) {
            const worker = new Worker(workerScriptUrl, { type: 'module' });
            worker.onmessage = (e) => this.handleWorkerMessage(e, i);
            this.workers.push(worker);
        }
    }

    public calculate(request: OddsRequest): Promise<WorkerResult> {
        if (this.activeWorkers > 0) {
            // Cancel previous calculation if running?
            // For simplicity, we'll just ignore this request or queue it. 
            // But for a UI, we usually want to cancel the old one.
            // Let's just reject the previous one or wait?
            // Better: Reject previous, start new.
            if (this.rejectPromise) {
                this.rejectPromise('Cancelled by new request');
            }
            this.reset();
        }

        this.startTime = performance.now();
        this.activeWorkers = this.concurrency;
        this.results = [];

        const iterationsPerWorker = Math.ceil(request.iterations / this.concurrency);

        return new Promise((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;

            this.workers.forEach(worker => {
                worker.postMessage({
                    type: 'CALCULATE',
                    data: {
                        ...request,
                        iterations: iterationsPerWorker
                    }
                });
            });
        });
    }

    private handleWorkerMessage(e: MessageEvent, workerIndex: number) {
        const { type, data, error } = e.data;

        if (type === 'ERROR') {
            if (this.rejectPromise) this.rejectPromise(error);
            this.reset();
            return;
        }

        if (type === 'RESULT') {
            console.log(`Worker ${workerIndex} finished`);
            // data contains percentages: win, tie, lose.
            // We need to convert back to counts to aggregate correctly, 
            // OR we can just average the percentages if iterations are equal (which they roughly are).
            // But to be precise, we should track counts.
            // The worker returns percentages. Let's modify the worker to return counts?
            // Or just reverse calculate: (percent / 100) * iterationsPerWorker.

            // Wait, the worker currently returns percentages.
            // Let's assume equal weight for now, or better, update worker to return raw counts.
            // Updating worker to return raw counts is cleaner.
            // But for now, let's just average the percentages.

            this.results.push({
                wins: data.win,
                ties: data.tie,
                total: 100 // Percentage base
            });

            this.activeWorkers--;

            if (this.activeWorkers === 0) {
                this.aggregateResults();
            }
        }
    }

    private aggregateResults() {
        if (!this.resolvePromise) return;

        let totalWin = 0;
        let totalTie = 0;

        this.results.forEach(r => {
            totalWin += r.wins;
            totalTie += r.ties;
        });

        const avgWin = totalWin / this.concurrency;
        const avgTie = totalTie / this.concurrency;
        const avgLose = 100 - (avgWin + avgTie);

        const endTime = performance.now();

        this.resolvePromise({
            win: avgWin,
            tie: avgTie,
            lose: avgLose,
            time: endTime - this.startTime
        });

        this.reset();
    }

    private reset() {
        this.activeWorkers = 0;
        this.results = [];
        this.resolvePromise = null;
        this.rejectPromise = null;
    }

    public terminate() {
        this.workers.forEach(w => w.terminate());
        this.workers = [];
    }
}
