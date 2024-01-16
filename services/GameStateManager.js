import { TimerTab } from ''

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

	printSGFToConsole() {
		// For now, just print the moves
		// Later, you can add board size and other meta information
		console.log(this.getSGFMoves());
	}

	makeMove(color, position) {
		// Logic to handle a move
		this.addMove(color, position);
		this.togglePlayer();
		// Update the timer display
		document.querySelector('timer-tab').updateTimerDisplay();
	}
}

// Export a single instance
export const gameStateManager = new GameStateManager();
