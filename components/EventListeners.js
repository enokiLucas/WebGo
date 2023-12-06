import { EDGE_MARGIN, LENGTH_SQUARE} from '../utils/constants.js'

export function addEventListeners(board, boardSize, onIntersectionHover, onIntersectionClick) {
	// Logic to add event listeners
	// These listeners can interact with ghostPieceManager and gameStateManager
	// Iterate over the grid size to access each intersection
	for (let i = 0; i < boardSize; i++) {
		for (let j = 0; j < boardSize; j++) {
			// Create a circle at each intersection for the event listener
			let intersection = document.createElementNS(SVG_NS, "circle");
			intersection.setAttribute('cx', EDGE_MARGIN + (i * LENGTH_SQUARE));
			intersection.setAttribute('cy', EDGE_MARGIN + (j * LENGTH_SQUARE));
			intersection.setAttribute('r', 10); // Small radius, essentially invisible
			intersection.setAttribute('fill', 'transparent'); // Make the circle invisible
			intersection.setAttribute('class', 'intersection');

			board.appendChild(intersection);
		}
	}
}
