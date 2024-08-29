import { rulesControl } from '../RulesControl.js';
import { exploreTerritory } from '../../utils/ScoreUtil.js';

class TerritoryScoring {
	constructor() {
		//this.scoringBoard = rulesControl.createSimulatedBoardMatrix(); // Assuming this creates a deep copy of the board
		this.resetTerritoriesCount();
		this.blackTerritory = 0;
		this.whiteTerritory = 0;
	}

	resetTerritoriesCount() {
		this.blackTerritory = 0;
		this.whiteTerritory = 0;
		this.visited = new Set();
	}

	/**
	 * In monte carlo simulation, countScore has am argument that is the state boardMatrix
	 * but in the EndGameManager, it is used without an arg as it was first designed.
	 * 
	 * Make the function below receive an argument of the matrix
	 * 
	 * Try the following first:
	 * countScore(const scoringBoard = rulesControl.createSimulatedBoardMAtrix)
	*/

	addTerritoryToScore() {
		// Add territory size to the corresponding player's score
		if (surroundedBy === 'black') {
			this.blackTerritory += points.length;
		} else if (surroundedBy === 'white') {
			this.whiteTerritory += points.length;
		}
	}

	/**
	 * 
	 * @param {Array} scoringBoard matrix made based on the board that can be manipulated without interfering with the original
	 * @param {boolean} bool switch for using the function addTerritoryToScore
	 * 	true: add the territory to the score
	 * 	false: does not add territory to the score. 
	 */
	countScore(scoringBoard, bool) {
		for (let x = 0; x < scoringBoard.length; x++) {
			for (let y = 0; y < scoringBoard[x].length; y++) {
				if (scoringBoard[x][y] === null && !this.visited.has(`${x},${y}`)) {
					const { points, isCompletelySurrounded, surroundedBy } = exploreTerritory(scoringBoard, x, y);
					if (isCompletelySurrounded) {
						// Mark all explored territory points as visited
						points.forEach(point => {
							this.visited.add(`${point.x},${point.y}`);
						});
						// In case countScore is used without the intention of calculating the final score.
						if (bool) {
							this.addTerritoryToScore;
						} else {
							return points.length;
						}
					}
				}
			}
		}

		const scoreTerritory = new CustomEvent('scoreTerritory', {
			detail: {
				blackTerritory: this.blackTerritory,
				whiteTerritory: this.whiteTerritory
			}
		});
		document.dispatchEvent(scoreTerritory);
	}

	// Optional: Method to get current scores
	getScores() {
		return {
			black: this.blackTerritory,
			white: this.whiteTerritory
		};
	}
}

export const territoryScoring = new TerritoryScoring();
