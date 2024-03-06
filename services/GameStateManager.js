class GameStateManager { //Remember to fix SGF
	constructor() {
		this.movesHistory = [];
		this.moveKey = 1;
		this._currentPlayer = 'black'; // Initialize with black
		this._boardSize = 13;
	}

	set boardSize(newSize) {
		this._boardSize = newSize;
		// Emit an event
		document.dispatchEvent(new CustomEvent('board-size-changed', {
			detail: { size: newSize }
		}));
	}

	resetPlayer() {
		this._currentPlayer = 'black'; // Reset the players turns
	}

	get boardSize() {
		return this._boardSize;
	}

	resetGameState() {
		this.movesHistory = [];
		this.resetPlayer();
		this.moveKey = 1;
	}

	togglePlayer() {
		this._currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
	}

	get currentPlayer() {
		return this._currentPlayer;
	}

	recordMove(x, y, metadata = {}) { //Go to handle Intersection Click and change the module
		const move = {
			branch: 0, // Default branch
			key: this.moveKey++,
			player: this.currentPlayer,
			x: x,
			y: y,
			metadata: metadata
		};
		this.movesHistory.push(move);
	}
/*
	getSGFMoves() { // Move this to SGF utils
		return this.moves.map(move => `;${move.color}[${move.position}]`).join('');
	}
*/
	makeMove(x, y, metadata = {}) {
		// Logic to handle a move
		this.recordMove(x, y, metadata);
		this.togglePlayer();
		const event = new CustomEvent('moveMade', { detail: { currentPlayer: this.currentPlayer } });
		document.dispatchEvent(event);

		//console.log(this.movesHistory);// Test
	}

	makePass() {
		this.recordMove(null, null, { pass: true }); // Add a pass move movesHistory
		this.togglePlayer(); // Switch turns
	}
}

// Export a single instance
export const gameStateManager = new GameStateManager();
