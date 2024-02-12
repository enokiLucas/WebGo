import { rulesControl } from '../RulesControl.js';
import { gameStateManager } from '../GameStateManager.js'
import { identifyGroups, hasLiberties } from '../../utils/RulesUtil.js'


class CaptureRule {
	constructor() {}

	removeGroup(board, group) {
		group.forEach(stone => {
			// Update the boardMatrix
			rulesControl.updateCell(stone.x, stone.y, null);

			// Remove SVG stone from the board
			const selector = `circle[data-x="${stone.x}"][data-y="${stone.y}"]`;
			const stoneElement = board.querySelector(selector);
			if (stoneElement) {
				stoneElement.remove(); // Removes the SVG element from the DOM
			}
		});
	}


	// Wrapper function to be called after a move is made
	processCaptures(board, x, y, color) {
		// Identify opposite color groups around the last move
		const oppositeColorGroups = identifyGroups(x, y, true);
		//console.log(oppositeColorGroups);

		// Check each group for captures
		oppositeColorGroups.forEach(group => {
			console.log(group);
			// Check if the group has no liberties
			if (!hasLiberties(group)) {
				// Remove the captured group from the board
				this.removeGroup(board, group);
			}
		});

	// Optionally, check for suicide (not implemented here)
	}


}

// Export a single instance if CaptureRule
export const captureRule = new CaptureRule();
