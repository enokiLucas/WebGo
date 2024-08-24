// Logic for using the engine to detect dead stones

import { MonteCarloEngine } from './MonteCarloEngine.js';
import { MonteCarloState } from './MonteCarloState.js';

class DeadStonesDetection {
  constructor(numSimulations = 1000) {
    this.monteCarloEngine = new MonteCarloEngine(numSimulations);
  }

  isStoneDead(boardState, x, y, color) {
    const state = new MonteCarloState(boardState, color);
    const deadAfterSimulations = this.simulateWithOpponentMoves(state, x, y, color);
    return deadAfterSimulations;
  }

  simulateWithOpponentMoves(state, x, y, color) {
    const opponent = color === 'black' ? 'white' : 'black';
    const simulationResults = [];

    // Simulate all possible moves by the opponent
    for (let i = 0; i < state.boardMatrix.length; i++) {
      for (let j = 0; j < state.boardMatrix[i].length; j++) {
        if (state.boardMatrix[i][j] === null) {  // Empty spot
          const simulationState = state.clone();
          simulationState.applyMove(i, j);  // Apply opponent's move

          const result = this.monteCarloEngine.run(simulationState);
          simulationResults.push({ move: `${i},${j}`, score: result.score });
        }
      }
    }

    // Analyze results to determine if the stone is effectively dead
    return this.analyzeResults(simulationResults, x, y);
  }

  analyzeResults(simulationResults, targetX, targetY) {
    // Check if the simulations consistently result in the target stone being captured
    let isDead = true;

    for (const result of simulationResults) {
      const { move, score } = result;

      // If the result favors the opponent significantly, the stone is likely dead
      if (move === `${targetX},${targetY}` && score < 0) {
        isDead = false;
        break;
      }
    }

    return isDead;
  }
}

export { DeadStonesDetection };
