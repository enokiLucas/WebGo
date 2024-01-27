import { gameStateManager } from './GameStateManager.js'

export class RulesEngine {
	constructor() {
		this.boardMatrix = this.initializeBoardMatrix();
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
		//this.checkForCaptures(x, y, color);
		console.log(this.boardMatrix);
	}

	checkForCaptures(x, y, color) {
		// Check for captures around the placed stone
		// Implement capture logic (e.g., checking for surrounded stones)
		// For now, this is a placeholder
	}

	// Additional methods related to game rules and state
	// Examples: updateGameState, calculateTerritory, etc.
}

// Export an instance of RuleEngine (if singleton needed)
// export const ruleEngine = new RuleEngine(19); // Default to 19x19 board

// Export a single instance
export const rulesEngine = new RulesEngine();
