// Main engine that coordinates the simulation and selection
import { MonteCarloSimulation } from './MonteCarloSimulation.js';

class MonteCarloEngine {
  constructor(numSimulations = 100) {
    this.numSimulations = numSimulations;
  }

  run(state) {
    const scores = {};
    for (let i = 0; i < this.numSimulations; i++) {
      const simulationResult = MonteCarloSimulation.simulate(state);
      // Collect results and calculate statistics
      scores[simulationResult.move] = (scores[simulationResult.move] || 0) + simulationResult.score;
    }

    return this.selectBestMove(scores);
  }

  selectBestMove(scores) {
    return Object.keys(scores).reduce((bestMove, move) => {
      return scores[move] > scores[bestMove] ? move : bestMove;
    }, Object.keys(scores)[0]);
  }
}

export const monteCarloEngine = new MonteCarloEngine();