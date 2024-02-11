import { rulesControl } from '../RulesControl.js';
import { gameStateManager } from '../GameStateManager.js'
import { identifyGroups, hasLiberties } from '../../utils/RulesUtil.js'


class CaptureRule {
	constructor() {}

	removeGroup(group) {
		group.forEach(stone => {
			rulesControl.updateCell(stone.x, stone.y, null);
		});
	}


	// Wrapper function to be called after a move is made
	processCaptures(x, y, color) {
		// Identify opposite color groups around the last move
		const oppositeColorGroups = identifyGroups(x, y, true);
		//console.log(oppositeColorGroups);

		// Check each group for captures
		oppositeColorGroups.forEach(group => {
			console.log(group);
			// Check if the group has no liberties
			if (!hasLiberties(group)) {
				// Remove the captured group from the board
				this.removeGroup(group);
			}
		});

	// Optionally, check for suicide (not implemented here)
	}


}

// Export a single instance if CaptureRule
export const captureRule = new CaptureRule();
