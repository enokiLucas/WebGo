import { gameStateManager } from './GameStateManager.js';
import { rulesEngine } from './RulesEngine.js'
import { placeStoneOnBoard } from './PlaceStoneOnBoard.js';
import { convertToSGFPosition, getPlayerSGFColor } from '../utils/SGFUtil.js'
import { EDGE_MARGIN, LENGTH_SQUARE } from '../utils/constants.js'

export function handleIntersectionClick(board, event, gameStateManager, rulesEngine, ghostStone) {
	// Place a stone on the board at the clicked intersection
	const x = event.target.cx.baseVal.value;
	const y = event.target.cy.baseVal.value;

	placeStoneOnBoard(board, x, y, gameStateManager.getCurrentPlayer());

	//Convert the board coordinates to SGF positions.
	const sgfPosition = convertToSGFPosition(x, y);

	// Update the logical board
	const boardX = (x - EDGE_MARGIN) / LENGTH_SQUARE;
	const boardY = (y - EDGE_MARGIN) / LENGTH_SQUARE;
	rulesEngine.changeElement(boardX, boardY, gameStateManager.getCurrentPlayer());

	// Add move to the game state
	gameStateManager.makeMove(getPlayerSGFColor(gameStateManager.getCurrentPlayer()), sgfPosition);

	// Change the color of the ghost stone
	ghostStone.setAttribute('fill', gameStateManager.getCurrentPlayer());
}
