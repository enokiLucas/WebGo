import { gameStateManager } from './GameStateManager.js'

export class RulesEngine {
	constructor(boardSize) {
		this.boardSize = gameStateManager.getBoardSize();
		this.boardMatrix = this.initializeBoardMatrix();
	}

	initializeBoardMatrix() {
		// Create a 2D array representing the board
		let boardMatrix = [];
		for (let i = 0; i < this.boardSize; i++) {
			boardMatrix[i] = new Array(this.boardSize).fill(null);
		}
		return boardMatrix;
	}

	changeElement(x, y, color) {
		// Place a stone on the board and check for captures
		this.boardMatrix[x][y] = color;
		//this.checkForCaptures(x, y, color);
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
