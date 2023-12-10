import { makeMove } from './GameStateManager.js';
import { placePiece } from './GhostPieceManager.js';

export function handleIntersectionClick(intersection) {
	// Logic for click interaction
	makeMove(intersection);   // Update game state
	placePiece(intersection); // Place a piece on the board
}
