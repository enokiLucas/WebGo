class GameStateManager {
	constructor() {
		this.moves = [];
		this.currentPlayer = 'black'; // Initialize with black
	}

	togglePlayer() {
		this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
	}

	getCurrentPlayer() {
		return this.currentPlayer;
	}

	addMove(color, position) {
		this.moves.push({ color, position });
	}

	getSGFMoves() {
		return this.moves.map(move => `;${move.color}[${move.position}]`).join('');
	}

	printSGFToConsole() {
		// For now, just print the moves
		// Later, you can add board size and other meta information
		console.log(this.getSGFMoves());
	}
}
// Export a single instance
export const gameStateManager = new GameStateManager();
