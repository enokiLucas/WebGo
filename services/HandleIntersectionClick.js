//import { EDGE_MARGIN, LENGTH_SQUARE, ALPHABET } from '../utils/constants.js';
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







/*
	let x = event.target.cx.baseVal.value;
	let y = event.target.cy.baseVal.value;

	let boardX = (x - EDGE_MARGIN) / LENGTH_SQUARE;
	let boardY = (y - EDGE_MARGIN) / LENGTH_SQUARE;

	// For testing: Log the coordinates of the click
	console.log(`Intersection clicked at: (${ALPHABET[boardX]}, ${boardSize - boardY})`);
	console.log(`Intersection at [${boardX}, ${boardY}]`);

	// Here, you can add more logic to handle the click event,
	// such as updating the game state or placing a piece.
*/

