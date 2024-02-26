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
	// Save the coordinates of the event.
	const x = event.target.cx.baseVal.value;
	const y = event.target.cy.baseVal.value;
	// Convert the event coordinates into board relative ones
	const boardX = (x - EDGE_MARGIN) / LENGTH_SQUARE;
	const boardY = (y - EDGE_MARGIN) / LENGTH_SQUARE;

	// Validate move
	const validationResponse = rulesControl.isMoveValid(boardX, boardY, gameStateManager.getCurrentPlayer());

	// Validate move before executing it
	if (rulesControl.isMoveValid(boardX, boardY, gameStateManager.getCurrentPlayer())) {
		// Methods that handle the execition of a move.
		placeStoneOnBoard(board, x, y, gameStateManager.getCurrentPlayer()) // Place the stone on the board;
		const sgfPosition = convertToSGFPosition(x, y); //Convert the event coordinates into SGF positions.
		rulesControl.updateCell(boardX, boardY, gameStateManager.getCurrentPlayer()); // Update the logical board
		ghostStone.setAttribute('fill', gameStateManager.getCurrentPlayer()); // Change the color of the ghost stone
		captureRule.processCaptures(board, boardX, boardY, gameStateManager.getCurrentPlayer());// Check the liberties of a group of stones and capture then if necessary
		// Keep it as the last method

		gameStateManager.makeMove(boardX, boardY, lastMoveMetadata); //Add move to the game state
		lastMoveMetadata = {}; //Reset lastMoveMetadata if necessary
	} else {
		alert(validationResponse.message); // Display an alert or a custom pop-up with the invalid move message
	}
}
