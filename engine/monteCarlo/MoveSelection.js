// Logic for selecting the best move from the simulations

class MoveSelection {
  static selectBestMove(simulationResults) {
    const moveScores = {};

    // Aggregate the scores for each move
    simulationResults.forEach(result => {
      const { move, score } = result;
      if (!moveScores[move]) {
        moveScores[move] = 0;
      }
      moveScores[move] += score;
    });

    // Find the move with the highest score
    let bestMove = null;
    let bestScore = -Infinity;

    for (const [move, score] of Object.entries(moveScores)) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }
}

export { MoveSelection };
