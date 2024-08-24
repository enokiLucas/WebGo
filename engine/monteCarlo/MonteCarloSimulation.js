// Logic for running the simulations

class MonteCarloSimulation {
  static simulate(state) {
    let simulationState = state.clone();
    while (!MonteCarloSimulation.isTerminal(simulationState)) {
      const [x, y] = MonteCarloSimulation.getRandomMove(simulationState);
      simulationState.applyMove(x, y);
    }
    return MonteCarloSimulation.score(simulationState);
  }

  static isTerminal(state) {
    // Define when the simulation ends (e.g., both players pass)
    return state.passCounter >= 2;
  }

  static getRandomMove(state) {
    const availableMoves = [];
    for (let i = 0; i < state.boardMatrix.length; i++) {
      for (let j = 0; j < state.boardMatrix[i].length; j++) {
        if (state.boardMatrix[i][j] === null) {
          availableMoves.push([i, j]);
        }
      }
    }
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
  }

  static score(state) {
    // Use TerritoryScoring or any other existing method to calculate score
    return territoryScoring.countScore(state.boardMatrix);
  }
}

export { MonteCarloSimulation };