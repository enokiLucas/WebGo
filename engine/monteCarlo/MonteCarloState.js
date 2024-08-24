// Handles state representation and cloning

class MonteCarloState {
  constructor(boardMatrix, currentPlayer) {
    this.boardMatrix = boardMatrix.map(row => [...row]);
    this.currentPlayer = currentPlayer;
  }

  clone() {
    return new MonteCarloState(this.boardMatrix, this.currentPlayer);
  }

  applyMove(x, y) {
    // Apply move using existing validation and update rules
    const isValid = rulesControl.isMoveValid(x, y, this.boardMatrix, this.currentPlayer);
    if (isValid.isValid) {
      this.boardMatrix[x][y] = this.currentPlayer;
      this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    }
    return isValid.isValid;
  }
}

export { MonteCarloState };