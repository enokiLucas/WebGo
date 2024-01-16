import { gameStateManager } from './GameStateManager.js';
import { placeStoneOnBoard } from './PlaceStoneOnBoard.js';
import { convertToSGFPosition, getPlayerSGFColor } from '../utils/SGFUtil.js'

export function handleIntersectionClick(board, event, gameStateManager, ghostStone) {
	// Place a stone on the board at the clicked intersection
	const x = event.target.cx.baseVal.value;
	const y = event.target.cy.baseVal.value;

	placeStoneOnBoard(board, x, y, gameStateManager.getCurrentPlayer());

	// Toggle the current player
	//gameStateManager.togglePlayer();

	// Change the color of the ghost stone
	ghostStone.setAttribute('fill', gameStateManager.getCurrentPlayer());

	//Convert the board coordinates to SGF positions.
	const sgfPosition = convertToSGFPosition(x, y);

	// Add move to the game state
	gameStateManager.makeMove(getPlayerSGFColor(gameStateManager.getCurrentPlayer()), sgfPosition);
}
