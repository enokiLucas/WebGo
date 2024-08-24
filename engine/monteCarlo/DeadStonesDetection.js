// Logic for using the engine to detect dead stones

import { MonteCarloEngine } from './MonteCarloEngine.js';
import { MonteCarloState } from './MonteCarloState.js';

class DeadStonesDetection {
  constructor(numSimulations = 1000) {
    this.monteCarloEngine = new MonteCarloEngine(numSimulations);
  }

  isStoneDead(boardState, x, y, color) {
    const state = new MonteCarloState(boardState, color);
    const deadAfterSimulations = this.simulateOpponentResponses(state, x, y, color);
    return deadAfterSimulations;
  }

  simulateOpponentResponses(state, x, y, color) {
    const opponent = color === 'black' ? 'white' : 'black';
    const simulationResults = [];

    for (let i = Math.max(x - 1, 0); i <= Math.min(x + 1, state.boardMatrix.length - 1); i++) {
      for (let j = Math.max(y - 1, 0); j <= Math.min(y + 1, state.boardMatrix[i].length - 1); j++) {
        if (state.boardMatrix[i][j] === null) {
          const simulationState = state.clone();
          simulationState.applyMove(i, j);

          const result = this.monteCarloEngine.run(simulationState);
          simulationResults.push({ move: `${i},${j}`, score: result.score });
        }
      }
    }

    return this.analyzeDeadStoneResults(simulationResults, x, y);
  }

  analyzeDeadStoneResults(simulationResults, targetX, targetY) {
    let isDead = true;

    for (const result of simulationResults) {
      const { move, score } = result;

      if (move === `${targetX},${targetY}` && score > 0) {
        isDead = false;
        break;
      }
    }

    return isDead;
  }
}

export { DeadStonesDetection };