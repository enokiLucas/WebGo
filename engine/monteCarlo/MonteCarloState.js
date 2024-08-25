// Handles state representation and cloning
import { rulesControl } from '../../services/RulesControl.js';

class MonteCarloState {
  constructor(boardMatrix, currentPlayer, passCounter, boardX, boardY) {
    console.log('hello'); // TEST

    if (!Array.isArray(boardMatrix) || boardMatrix.length === 0) {
      throw new Error("Invalid boardMatrix: must be a non-empty 2D array.");
    }

    this.boardMatrix = boardMatrix.map(row => [...row]);
    this.currentPlayer = currentPlayer;
    this.passCounter = passCounter;
    this.lastMoveX = boardX;
    this.lastMoveY = boardY;
  }

  clone() {
    const clone = new MonteCarloState(this.boardMatrix, this.currentPlayer);
    clone.passCounter = this.passCounter;
    clone.lastMoveX = this.lastMoveX;
    clone.lastMoveY = this.lastMoveY;
    return clone;
  }

  applyMove(x, y) {
    const isValid = rulesControl.isMoveValid(x, y, this.boardMatrix, this.currentPlayer);
    if (isValid.isValid) {
      this.boardMatrix[x][y] = this.currentPlayer;
      this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
      this.lastMoveX = x;
      this.lastMoveY = y;
      this.passCounter = 0;
    } else {
      this.passCounter++;
    }
    return isValid.isValid;
  }
}

export { MonteCarloState };
