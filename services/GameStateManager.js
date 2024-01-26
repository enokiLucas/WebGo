class GameStateManager {
	constructor() {
		this.moves = [];
		this.currentPlayer = 'black'; // Initialize with black
		this.boardSize = 13;
	}

	setBoardSize(newSize) {
		this.boardSize = newSize;
		// Emit an event
		document.dispatchEvent(new CustomEvent('board-size-changed', {
			detail: { size: newSize }
		}));
	}

	resetPlayer() {
		this.currentPlayer = 'black'; // Reset the players turns
	}

	getBoardSize() {
		return this.boardSize;
	}

	resetGameState() {
		this.moves = []; // Reset the moves array
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

	makeMove(color, position) {
		// Logic to handle a move
		this.addMove(color, position);
		this.togglePlayer();
		const event = new CustomEvent('moveMade', { detail: { currentPlayer: this.currentPlayer } });
		document.dispatchEvent(event);
	}
}

// Export a single instance
export const gameStateManager = new GameStateManager();
