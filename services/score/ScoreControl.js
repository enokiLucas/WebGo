import { territoryScoring } from './TerritoryScoring.js';

export class ScoreControl {
	constructor() {
		this.scoringMethod = 'Territory Scoring';
		this.komi = 0.5;
		this.territory = { black: 0, white: 0 };
		this.area = { black: 0, white: 0 };
		this.captures = { black: 0, white: 0};
	}
}

// Export a single instance
export const scoreControl = new ScoreControl();
