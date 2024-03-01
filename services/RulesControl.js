import { gameStateManager } from './GameStateManager.js';
import { koRule } from './rules/KoRule.js';
import { captureRule } from './rules/CaptureRule.js';
import { suicideRule } from './rules/SuicideRule.js';

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

		//console.log(this.boardMatrix); // test
	}

	getCellValue(x, y) {
		return this.boardMatrix[x][y];
	}

	updateBoardState() {
		const currentBoardState = this.boardMatrix.flat().join('');
		this.boardStatesHistory.push(currentBoardState);
		//console.log(this.boardStatesHistory)  //test.
	}

	getPreviousBoardState() {
		// Return the state before the last move
		if (this.boardStatesHistory.length < 2) {
			return null; // Not enough history to have a previous state
		}
		return this.boardStatesHistory[this.boardStatesHistory.length - 1];
	}

	createSimulatedBoardMatrix() {
		// Create a deep copy of the current board matrix
		const simulatedBoardMatrix = this.boardMatrix.map(row => [...row]);
		return simulatedBoardMatrix;
}


	// Centralized method to check if a a move is valid.
	/* List of rules
	 *
	 * 0: No rules were broken.
	 * 1: Capture Rule.
	 * 2: Ko Rule.
	 * 3: Suicide Rule
	 */
	isMoveValid(x, y, matrix, player) {
		let validMove = { isValid: true, ruleBreak: 0, captures: [], message: '' };

		// Potential captures analysis (moved up before suicide check)
		const potentialCaptures = captureRule.analyzeCaptures(x, y, matrix);
		if (potentialCaptures.length > 0) {
			validMove.captures = potentialCaptures;
			validMove.message = 'Capture stones.';
		}

		// Ko rule check
		if (koRule.checkForKo(x, y, player)) {
			return { isValid: false, ruleBreak: 2, message: 'This move causes a repetion in the board and thus violates the Ko rule.' };
		}

		if (suicideRule.checkForSuicide(x, y, player, matrix)) {
			return { isValid: false, ruleBreak: 3, message: 'This move is a suicide and therefore, is invalid'}
		}

		return validMove;
	}
}

// Export a single instance
export const rulesControl = new RulesControl();
