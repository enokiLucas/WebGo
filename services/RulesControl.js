import { gameStateManager } from './GameStateManager.js';
import { koRule } from './rules/KoRule.js';

export class RulesControl {
	constructor() {
		this.boardMatrix = this.initializeBoardMatrix();
		this.boardStatesHistory = [];
	}

	initializeBoardMatrix(size) {
		// Create a 2D array representing the board
		const boardMatrix = [];
		const size_n = parseInt(size, 10); // Convert string to number
		for (let i = 0; i < size; i++) { // Create an array with size number of lines
			boardMatrix[i] = new Array(size_n).fill(null); // Create a new array for each line, each new array with 'size' number of rows.
		}
		return boardMatrix;
	}

	resetBoardMatrix(size) {
		this.boardMatrix = this.initializeBoardMatrix(size); // Reinitialize the board Matrix
	}

	updateCell(x, y, color) {
		// Place a stone on the board and check for captures
		this.boardMatrix[x][y] = color;

		//console.log(this.boardMatrix);
	}

	getCellValue(x, y) {
		return this.boardMatrix[x][y];
	}

	updateBoardState() {
		const currentBoardState = this.boardMatrix.flat().join('');
		this.boardStatesHistory.push(currentBoardState);
		console.log(this.boardStatesHistory)  //test.
	}

	getPreviousBoardState() {
		// Return the state before the last move
		if (this.boardStatesHistory.length < 2) {
			return null; // Not enough history to have a previous state
		}
		return this.boardStatesHistory[this.boardStatesHistory.length - 2];
	}

	// Centralized method to check if a a move is valid.
	isMoveValid(x, y, player) {
		/* List of rules
		*  0: No rules were broken and the move is valid
		*  1: Ko rule.
		*
		*/
		// Check for Ko
		if (koRule.checkForKo(x, y, player)) {
			console.log("Move violates Ko rule.");
			return {isValid: false, ruleBreak: 1, message: "Move violates Ko rule."};
		}

		// Future rule checks (e.g., suicide) can be added here
		return {isValid: true, ruleBreak: 0, message: null}; // Move is valid if all checks pass
	}
}

// Export a single instance
export const rulesControl = new RulesControl();
