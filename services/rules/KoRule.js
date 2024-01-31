// services/rules/KoRule.js
import { rulesControl } from '../RulesControl.js';

class KoRule {
	constructor() {
		this.previousBoardMatrix = null;
	}

	applyRule(x, y, color) {
		// Simulate the move
		rulesControl.updateCell(x, y, color);
		let captures = this.checkForCaptures(x, y, color, true); // Simulate captures

		if (this.isKo(x, y, color)) {
			// Undo the move if it violates the Ko rule
			rulesControl.updateCell(x, y, null);
			return false; // Move is not valid
		}

		// If not simulating, apply captures and finalize the move
		if (!captures) {
			this.previousBoardMatrix = JSON.parse(JSON.stringify(rulesControl.boardMatrix));
		}

		return true; // Move is valid
	}

	isKo(x, y, color) {
		// Check if making a move would revert to the previous board state
		if (this.previousBoardMatrix && JSON.stringify(rulesControl.boardMatrix) === JSON.stringify(this.previousBoardMatrix)) {
			return true; // Move violates the Ko rule
		}
		return false;
	}

	checkForCaptures(x, y, color, simulate = false) {
		// Implement capture logic here, this method should ideally be in the RulesControl or a dedicated capture rule file
		// For now, this is a placeholder
	}
}

// Export a single instance if the Ko rule should be a singleton
export const koRule = new KoRule();
