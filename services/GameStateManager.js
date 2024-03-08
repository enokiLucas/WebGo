class GameStateManager { //Remember to fix SGF
	constructor() {
		this.movesHistory = [];
		this.moveKey = 1; // index for the moves.
		this._currentPlayer = 'black'; // Initialize with black
		this._boardSize = 13;
		this._timerControler = { method: 'AbsoluteTime', totalTime: 1200 }; // Define the method of time keeping
		this.captureCounter = { black: 0, white: 0 }; // Track how many stones each player captured.
	}

	get timerControler() {
		return this._timerControler;
	}

	set timerControler(newControler) {
		this._timerControler = newControler;
	}

	set boardSize(newSize) {
		this._boardSize = newSize;
		// Emit an event
		document.dispatchEvent(new CustomEvent('board-size-changed', {
			detail: { size: newSize }
		}));
	}

	get boardSize() {
		return this._boardSize;
	}

	get currentPlayer() {
		return this._currentPlayer;
	}

	// Function to increment capture count
	addCaptures(playerColor, captures) {
		const player = playerColor === 'black' ? 'white' : 'black';
		this.captureCounter[player] += captures;
		// Optionally, emit an event with the new capture count
		document.dispatchEvent(new CustomEvent('captures-changed', {
			detail: { player, captures: this.captureCounter[player] }
		}));
		//console.log(this.captureCounter); //TEST
	}

	// Getter for capture counts
	getCaptureCounter() {
		return this.captureCounter;
	}

	resetPlayer() {
		this._currentPlayer = 'black'; // Reset the players turns
	}

	resetGameState() {
		this.movesHistory = [];
		this.resetPlayer();
		this.moveKey = 1;
		this.captureCounter = { black: 0, white: 0 };
	}

	togglePlayer() {
		this._currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
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

		//console.log(this.movesHistory);// TEST
	}

	makePass() {
		this.recordMove(null, null, { pass: true }); // Add a pass move movesHistory
		this.togglePlayer(); // Switch turns
	}
}

// Export a single instance
export const gameStateManager = new GameStateManager();
