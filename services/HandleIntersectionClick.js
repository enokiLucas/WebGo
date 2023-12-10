/*import { makeMove } from './GameStateManager.js';
import { placePiece } from './GhostPieceManager.js';

export function handleIntersectionClick(intersection) {
	// Logic for click interaction
	makeMove(intersection);   // Update game state
	placePiece(intersection); // Place a piece on the board
}*/

import { EDGE_MARGIN, LENGTH_SQUARE, ALPHABET } from '../utils/constants.js';

export function handleIntersectionClick(event) {
	let x = event.target.cx.baseVal.value;
	let y = event.target.cy.baseVal.value;

	let boardX = (x - EDGE_MARGIN) / LENGTH_SQUARE;
	let boardY = (y - EDGE_MARGIN) / LENGTH_SQUARE;

	// For testing: Log the coordinates of the click
	console.log(`Intersection clicked at: (${ALPHABET[boardX]}, ${event.target.parentElement.boardSize - boardY})`);
	console.log(`Intersection at [${boardX}, ${boardY}]`);

	// Here, you can add more logic to handle the click event,
	// such as updating the game state or placing a piece.
}

