import { mctsSearch } from './mcts.js';
import { gameStateManager } from './GameStateManager.js';

class MonteCarloEngine {
	constructor() {
		this.numSimulations = 100; // Default number of simulations
	}

	runMonteCarloSearch() {
		const rootState = gameStateManager.getCurrentGameState();
		const bestMove = mctsSearch(rootState, this.numSimulations);
		return bestMove;
	}

	setSimulationsCount(count) {
		this.numSimulations = count;
	}
}

export const monteCarloEngine = new MonteCarloEngine();
