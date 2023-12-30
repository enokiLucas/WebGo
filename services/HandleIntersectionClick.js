import { gameStateManager } from './GameStateManager.js';
import { placeStoneOnBoard } from './PlaceStoneOnBoard.js';

export function handleIntersectionClick(board, event, gameStateManager, ghostStone) {
	// Place a stone on the board at the clicked intersection
	const x = event.target.cx.baseVal.value;
	const y = event.target.cy.baseVal.value;

	placeStoneOnBoard(board, x, y, gameStateManager.getCurrentPlayer());

	// Toggle the current player
	gameStateManager.togglePlayer();

	// Change the color of the ghost stone
	ghostStone.setAttribute('fill', gameStateManager.getCurrentPlayer());
}
