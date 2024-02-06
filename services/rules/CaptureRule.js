import { rulesControl } from '../RulesControl.js';
import { gameStateManager } from './GameStateManager.js'

class CaptureRule {
	constructor() {}

	applyCaptureLogic(x, y, color) {
		// Check adjacent stones for potential captures
		this.checkAdjacentStonesForCapture(x, y, color);
	}

	checkAdjacentStonesForCapture(x, y, color) {
		// Check each adjacent point (up, down, left, right)
		// Note: You'll need to add bounds checking for edges of the board

		const directions = [
			{ dx: -1, dy: 0 }, // Up
			{ dx: 1, dy: 0 },  // Down
			{ dx: 0, dy: -1 }, // Left
			{ dx: 0, dy: 1 }   // Right
		];

		directions.forEach(dir => {
			const newX = x + dir.dx;
			const newY = y + dir.dy;
			if (this.isValidCoordinate(newX, newY)) {
				const adjacentColor = rulesControl.getCellValue(newX, newY);
				if (adjacentColor !== null && adjacentColor !== color) {
					// If the adjacent stone is of the opposite color, check if it's captured
					if (this.isCaptured(newX, newY, adjacentColor)) {
						// Remove captured stones
						this.removeCapturedStones(newX, newY, adjacentColor);
					}
				}
			}
		});
	}

	isValidCoordinate(x, y) {
		const size = gameStateManager.getBoardSize();
		return x >= 0 && x < size && y >= 0 && y < size;
	}

	isCaptured(x, y, color) {
		const visited = new Set(); // Tracks visited positions as 'x,y' strings
		return this.hasNoLiberties(x, y, color, visited);
	}

	hasNoLiberties(x, y, color, visited) {
		const key = `${x},${y}`;
		if (visited.has(key)) return true; // Avoid re-checking visited stones
		visited.add(key);

		// Check bounds and return false (indicating a liberty) if out of bounds or empty
		if (!this.isValidCoordinate(x, y) || this.getCellValue(x, y) === null) return false;

		// If the stone is of the opposite color, it's a border, not a liberty
		if (this.getCellValue(x, y) !== color) return true;

		// Directions: up, right, down, left
		const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
		for (let [dx, dy] of directions) {
			// If any recursive call finds a liberty, return false
			if (!this.hasNoLiberties(x + dx, y + dy, color, visited)) return false;
		}

		// If all directions are checked and no liberties are found, return true
		return true;
	}


	removeCapturedStones(x, y, color) {
		// Initialize a queue with the starting stone
		const queue = [[x, y]];
		const toBeRemoved = []; // Stores stones to be removed
		const visited = new Set(); // Tracks visited positions as 'x,y' strings to avoid duplicates

		while (queue.length > 0) {
			const [currX, currY] = queue.shift();
			const key = `${currX},${currY}`;

			// Skip if already visited
			if (visited.has(key)) continue;
			visited.add(key);

			// Skip if the cell is not of the target color
			if (rulesControl.getCellValue(currX, currY) !== color) continue;

			// Mark for removal
			toBeRemoved.push([currX, currY]);

			// Check all adjacent cells
			const directions = [
				[0, 1],  // Right
				[1, 0],  // Down
				[0, -1], // Left
				[-1, 0]  // Up
			];

			for (const [dx, dy] of directions) {
				const newX = currX + dx;
				const newY = currY + dy;

				// Add adjacent cell of the same color to the queue
				if (this.isValidCoordinate(newX, newY) && rulesControl.getCellValue(newX, newY) === color) {
					queue.push([newX, newY]);
				}
			}
		}

		// Remove the marked stones from the board
		for (const [remX, remY] of toBeRemoved) {
			rulesControl.updateCell(remX, remY, null); // Assuming `updateCell` can also remove stones by setting them to null
		}
	}

}

// Export a single instance if CaptureRule
export const captureRule = new CaptureRule();
