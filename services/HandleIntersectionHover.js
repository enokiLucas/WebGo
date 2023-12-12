import { EDGE_MARGIN, LENGTH_SQUARE } from '../utils/constants.js';

export function handleIntersectionHover(event) {
	const ghostPiece = document.querySelector('ghost-piece'); // Adjust if needed
	const intersection = event.target;
	const x = intersection.cx.baseVal.value;
	const y = intersection.cy.baseVal.value;

	// Optionally, snap the ghost piece to the center of the intersection
	ghostPiece.show(x, y);
}
