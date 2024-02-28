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

function updateBoard() {
	placeStoneOnBoard(board, x, y, gameStateManager.getCurrentPlayer()) // Place the stone on the board;
	const sgfPosition = convertToSGFPosition(x, y); //Convert the event coordinates into SGF positions.
	rulesControl.updateCell(boardX, boardY, gameStateManager.getCurrentPlayer()); // Update the logical board
	rulesControl.updateBoardState(); //Update the BoardState
	ghostStone.setAttribute('fill', gameStateManager.getCurrentPlayer()); // Change the color of the ghost stone

	// Keep it as the last method
	gameStateManager.makeMove(boardX, boardY, lastMoveMetadata); //Add move to the game state
	lastMoveMetadata = {}; //Reset lastMoveMetadata if necessary
}

export function handleIntersectionClick(board, event, ghostStone) {
	// Save the coordinates of the event.
	const x = event.target.cx.baseVal.value;
	const y = event.target.cy.baseVal.value;
	// Convert the event coordinates into board relative ones
	const boardX = (x - EDGE_MARGIN) / LENGTH_SQUARE;
	const boardY = (y - EDGE_MARGIN) / LENGTH_SQUARE;

	// Save the validation result.
	const validationResult = rulesControl.isMoveValid(boardX, boardY, gameStateManager.getCurrentPlayer());

	console.log(validationResponse.message); // Test

	if (validationResult.isValid) {
		// Apply the move
		updateBoard();

		// Execute any captures identified during validation
		if (validationResult.captures.length > 0) {
			captureRule.removeStones(board, validationResult.captures);
		}

	// Proceed with game flow, e.g., end turn, update UI
	} else {
		// Handle invalid move, e.g., display error message
		alert(validationResult.message);
	}
}
