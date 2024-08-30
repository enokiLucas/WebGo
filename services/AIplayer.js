import { monteCarloEngine } from '../engine/monteCarlo/MonteCarloEngine.js';
import { MonteCarloState } from '../engine/monteCarlo/MonteCarloState.js';
import { rulesControl } from './RulesControl.js';
import { gameStateManager } from './GameStateManager.js';
import { placeStoneOnBoard } from './PlaceStoneOnBoard.js';
import { EDGE_MARGIN, LENGTH_SQUARE } from '../utils/constants.js';

export function aiMakeMove(board, boardX, boardY) {
	const currentState = new MonteCarloState(rulesControl.boardMatrix, gameStateManager.currentPlayer, gameStateManager.getPassCounter(), boardX, boardY);

	// Run the Monte Carlo simulation to find the best move
	const bestMove = monteCarloEngine.run(currentState);

	console.log(bestMove);

	if (bestMove) {
			const [x, y] = bestMove.split(',').map(Number); // Extract coordinates from the move string
			const cx = EDGE_MARGIN + (LENGTH_SQUARE * x);
			const cy = EDGE_MARGIN + (LENGTH_SQUARE * y);
			placeStoneOnBoard(board, cx, cy, gameStateManager.currentPlayer);
			gameStateManager.makeMove(x, y); // Apply the move to the game
			console.log(`AI chose move at (${x}, ${y})`);
	} else {
			console.log("AI couldn't find a valid move.");
	}
}