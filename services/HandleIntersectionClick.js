import { gameStateManager } from './GameStateManager.js';
import { rulesControl } from './RulesControl.js';
import { placeStoneOnBoard } from './PlaceStoneOnBoard.js';
import { convertToSGFPosition, getPlayerSGFColor } from '../utils/SGFUtil.js';
import { EDGE_MARGIN, LENGTH_SQUARE } from '../utils/constants.js';
import { captureRule } from './rules/CaptureRule.js';

let lastMoveMetadata = {}; // Temporary storage for metadata outside of handleIntersectionClick

// Set up an event listener for capture metadata
document.addEventListener('new-metadata', (event) => {
	if(event.detail) {
		lastMoveMetadata = event.detail;
	} else {
		lastMoveMetadata = {};
	}
	// Possibly trigger the move logic here if it needs to wait for metadata
	// Or ensure makeMove is called after this event is processed
});

export function handleIntersectionClick(board, event, ghostStone) {
	// Place a stone on the board at the clicked intersection
	const x = event.target.cx.baseVal.value;
	const y = event.target.cy.baseVal.value;

	placeStoneOnBoard(board, x, y, gameStateManager.getCurrentPlayer());

	//Convert the event coordinates into SGF positions.
	const sgfPosition = convertToSGFPosition(x, y);

	//Convert the event coordinates into board relative ones
	const boardX = (x - EDGE_MARGIN) / LENGTH_SQUARE;
	const boardY = (y - EDGE_MARGIN) / LENGTH_SQUARE;

	// Update the logical board
	rulesControl.updateCell(boardX, boardY, gameStateManager.getCurrentPlayer());


	// Change the color of the ghost stone
	ghostStone.setAttribute('fill', gameStateManager.getCurrentPlayer());

	// Check the liberties of a group of stones and capture then if necessary
	// The x, y coordinates need to be relative to the boardMatrix
	captureRule.processCaptures(board, boardX, boardY, gameStateManager.getCurrentPlayer());

	// Keep it as the last method
	// Add move to the game state
	gameStateManager.makeMove(boardX, boardY, lastMoveMetadata);
	// Reset lastMoveMetadata if necessary
	lastMoveMetadata = {};
}
