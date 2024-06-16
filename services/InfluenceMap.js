import { rulesControl } from '../RulesControl.js';  // Assuming this path is correct

class InfluenceMap {
	constructor() {
		this.size = rulesControl.boardMatrix.length;  // Assuming boardMatrix is a 2D array
		this.map = this.initializeMap();
	}

	initializeMap() {
		// Create a deep copy of the board matrix initialized to zero
		return rulesControl.createSimulatedBoardMatrix().map(row => row.map(() => 0));
	}

	addInfluence(x, y, color) {
		const influenceValue = color === 'black' ? 1 : -1;
		const decayFactor = 0.1;  // Adjust decay factor as needed

		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
				let distance = Math.sqrt((x - i) ** 2 + (y - j) ** 2);
				this.map[i][j] += influenceValue / (1 + decayFactor * distance);
			}
		}
	}

	updateMap(board) {
		this.resetMap();
		for (let x = 0; x < this.size; x++) {
			for (let y = 0; y < this.size; y++) {
				if (board[x][y] !== null) {
					this.addInfluence(x, y, board[x][y]);
				}
			}
		}
	}

	resetMap() {
		this.map = this.initializeMap();
	}

	printMap() {
		console.log(this.map.map(row => row.map(value => value.toFixed(2)).join(' ')).join('\n'));
	}
}

// Export a single instance
export const influenceMap = new InfluenceMap();
