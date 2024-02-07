import { rulesControl } from '../RulesControl.js';
import { gameStateManager } from './GameStateManager.js'

class CaptureRule {
	constructor() {}

	identifyGroup(x, y, color) {
		const queue = [[x, y]]; //List of coordinates starting at (x,y)
		const identifiedGroup = []; //Array to store the coordinates of all stones in the group
		const visited = new Set(); //Set that will store already visited coordinates

		while (queue.length > 0) { // Breadth First Search algorithm
			const [currX, currY] = queue.shift();
			const key = `${currX},${currY}`;

			if (visited.has(key) || rulesControl.getCellValue(currX, currY) !== color) continue; // check if the set of coordinates have being tested and that it is of the correct color.
			visited.add(key); // add coordinates to the visited set
			identifiedGroup.push([currX, currY]); // add coordinates to the array

			// Chack for adjacents stones
			// Directions: up, right, down, left
			const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
			directions.forEach(([dx, dy]) => {
				const newX = currX + dx;
				const newY = currY + dy;
					if (rulesControl.isValidCoordinate(newX, newY) && !visited.has(`${newX},${newY}`)) {
						queue.push([newX, newY]); // add new coordinate to the queue.
					}
			});
		}

		return identifiedGroup;
	}


	hasLiberties(group) {
		for (let [x, y] of group) {
			// Directions: up, right, down, left
			const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];
			for (let [dx, dy] of directions) {
				const newX = x + dx;
				const newY = y + dy;
				if (this.isValidCoordinate(newX, newY) && rulesControl.getCellValue(newX, newY) === null) {
					// If any adjacent cell is empty, the group has at least one liberty
					return true;
				}
			}
		}
		// If no liberties are found
		return false;
	} //hasLiberties(this.identifyGroup(x,y,color));


	removeGroup(group) {
		group.forEach(([x, y]) => {
			rulesControl.updateCell(x, y, null);
		});
	} //removeGroup(this.identifyGroup(x,y,color));











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




}

// Export a single instance if CaptureRule
export const captureRule = new CaptureRule();
