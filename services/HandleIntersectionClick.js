import { gameStateManager } from './GameStateManager.js';
import { rulesControl } from './RulesControl.js';
import { placeStoneOnBoard } from './PlaceStoneOnBoard.js';
import { convertToSGFPosition, getPlayerSGFColor } from '../utils/SGFUtil.js';
import { EDGE_MARGIN, LENGTH_SQUARE } from '../utils/constants.js';
import { captureRule } from './rules/CaptureRule.js';
import { influenceMap } from './InfluenceMap.js';
//TEST
import { monteCarloEngine } from '../engine/monteCarlo/MonteCarloEngine.js';
import { MonteCarloState } from '../engine/monteCarlo/MonteCarloState.js';

function aiMakeMove() {
	const currentState = new MonteCarloState(rulesControl.boardMatrix, gameStateManager.currentPlayer);
	console.log('14: currentState -> ' + currentState);

	// Run the Monte Carlo simulation to find the best move
	const bestMove = monteCarloEngine.run(currentState);
	console.log('18: bestMove -> ' + bestMove)

	if (bestMove) {
			const [x, y] = bestMove.split(',').map(Number); // Extract coordinates from the move string
			gameStateManager.makeMove(x, y); // Apply the move to the game
			console.log(`AI chose move at (${x}, ${y})`);
	} else {
			console.log("AI couldn't find a valid move.");
	}
}
//END TEST

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

function updateBoard(board, x, y, boardX, boardY, player, ghostStone) {
	placeStoneOnBoard(board, x, y, player) // Place the stone on the board;
	const sgfPosition = convertToSGFPosition(x, y); //Convert the event coordinates into SGF positions.
	rulesControl.updateCell(boardX, boardY, player); // Update the logical board
	rulesControl.updateBoardState(); //Update the BoardState
	//ghostStone.setAttribute('fill', player); // Change the color of the ghost stone

	// Keep it as the last method
	gameStateManager.makeMove(boardX, boardY, lastMoveMetadata); //Add move to the game state
	ghostStone.setAttribute('fill', gameStateManager.currentPlayer); // Change the color of the ghost stone
	lastMoveMetadata = {}; //Reset lastMoveMetadata if necessary
}

export function handleIntersectionClick(board, event, ghostStone) {
	// Save the coordinates of the event.
	const x = event.target.cx.baseVal.value;
	const y = event.target.cy.baseVal.value;
	// Convert the event coordinates into board relative ones
	const boardX = (x - EDGE_MARGIN) / LENGTH_SQUARE;
	const boardY = (y - EDGE_MARGIN) / LENGTH_SQUARE;

	// Create a simulated boardMatrix and place the stone.
	const simulatedMatrix = rulesControl.createSimulatedBoardMatrix();
	simulatedMatrix[boardX][boardY] = gameStateManager.currentPlayer;

	// Save the validation result.
	const validationResult = rulesControl.isMoveValid(boardX, boardY, simulatedMatrix,  gameStateManager.currentPlayer);

	//Update the influence map.
	influenceMap.updateMap(simulatedMatrix);

//===========================================TEST===================================================
		console.log(aiMakeMove());

//=========================================END TEST=================================================
	if (validationResult.isValid) {
		// Apply the move
		updateBoard(board, x, y, boardX, boardY, gameStateManager.currentPlayer, ghostStone);

		// Execute any captures identified during validation
		if (validationResult.captures.length > 0) {
			captureRule.removeStones(board, validationResult.captures);
			gameStateManager.addCaptures(gameStateManager.currentPlayer, validationResult.captures.length);
		}

	// Proceed with game flow, e.g., end turn, update UI
	} else {
		// Handle invalid move, e.g., display error message
		alert(validationResult.message);
	}
}
