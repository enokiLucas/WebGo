import { gameStateManager } from './GameStateManager.js';

export class RulesControl {
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

		console.log(this.boardMatrix);
	}

	getCellValue(x, y) {
		return this.boardMatrix[x][y];
	}
}

// Export a single instance
export const rulesControl = new RulesControl();
