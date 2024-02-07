import { gameStateManager } from './GameStateManager.js'

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
	}

	getCellValue(x, y) {
		return this.boardMatrix[x][y];
	}

	isValidCoordinate(x, y) {
		const size = gameStateManager.getBoardSize();
		return x >= 0 && x < size && y >= 0 && y < size;
	}


	// Identifies groups of stones from a starting position. Can identify groups of the same color as the starting stone
	// or groups of the opposite color, based on the identifyOpposite flag.
	identifyGroups(startX, startY, identifyOpposite = false) {
		// Determine the color of the group to identify: same as the starting point or opposite.
		const initialColor = this.getCellValue(startX, startY);
		const targetColor = identifyOpposite ? this.toggleColor(initialColor) : initialColor;
		const groups = []; // To store identified groups of stones.
		const visited = new Set(); // Keeps track of visited coordinates to avoid infinite loops.

		// Recursive function to explore and collect coordinates belonging to the same group.
		const exploreGroup = (x, y) => {
			// Return immediately if out of bounds or already visited.
			if (!this.isValidCoordinate(x, y) || visited.has(`${x},${y}`)) return;
			// Return if the current stone does not match the target color.
			const currentColor = this.getCellValue(x, y);
			if (currentColor !== targetColor) return;

			visited.add(`${x},${y}`); // Mark the current position as visited.
			let group = [{ x, y }]; // Initialize the group with the current stone.
			// Define possible directions to explore: up, right, down, left.
			const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

			// Explore adjacent positions.
			directions.forEach(([dx, dy]) => {
				const newX = x + dx;
				const newY = y + dy;
				// Recursively explore if the adjacent stone matches the target color and is within bounds.
				if (this.isValidCoordinate(newX, newY) && this.getCellValue(newX, newY) === targetColor) {
					group = group.concat(exploreGroup(newX, newY));
				}
			});

			return group; // Return the collected group of stones.
		};

		// Determine starting points for exploration based on identifyOpposite flag.
		const startPoints = identifyOpposite ?
		[[startX - 1, startY], [startX, startY - 1], [startX + 1, startY], [startX, startY + 1]] :
			[[startX, startY]];

		// Explore groups starting from specified points.
		startPoints.forEach(([x, y]) => {
			if (this.isValidCoordinate(x, y) && this.getCellValue(x, y) === targetColor && !visited.has(`${x},${y}`)) {
				const group = exploreGroup(x, y);
				// If a group is identified, add it to the groups array.
				if (group && group.length > 0) groups.push(group);
			}
		});

		return groups; // Return all identified groups.
	}


}

// Export a single instance
export const rulesControl = new RulesControl();
