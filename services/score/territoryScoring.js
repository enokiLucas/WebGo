//Japanese rules
import { rulesControl } from '../RulesControl.js';
import { gameStateManager } from '../GameStateManager.js';

class TerritoryScoring {
	constructor() {
		this.scoringBoard = rulesControl.createSimulatedBoardMatrix();
		this.blackTerritory = 0;
		this.whiteTerritory = 0;
	}

	countScore() {
		// Example logic to count territories
		for (let x = 0; x < this.scoringBoard.length; x++) {
			for (let y = 0; y < this.scoringBoard[x].length; y++) {
				if (this.scoringBoard[x][y] === 'black') {
					this.blackTerritory++;  // Count occupied territories for black
				} else if (this.scoringBoard[x][y] === 'white') {
					this.whiteTerritory++;  // Count occupied territories for white
				}
				// Add logic for counting empty surrounded territories
			}
		}
		// Log the scores for debugging
		console.log(`Black Territory: ${blackTerritory}, White Territory: ${whiteTerritory}`);
	}

	resetTerritoriesCount() {
		this.blackTerritory = 0;
		this.whiteTerritory = 0;
	}
}

export const territoryScoring = new TerritoryScoring();
