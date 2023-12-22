import { EDGE_MARGIN, LENGTH_SQUARE } from '../utils/constants.js';
/*
export function handleIntersectionHover(ghostPiece, event) {
	const boardRect = event.target.closest('svg').getBoundingClientRect();

	const intersection = event.target;
	const x = intersection.cx.baseVal.value;
	const y = intersection.cy.baseVal.value;

	// Optionally, snap the ghost piece to the center of the intersection
	ghostPiece.show(x, y);
}*/

// In handleIntersectionHover.js
export function handleIntersectionHover(event, ghostPiece) {
    const x = event.target.cx.baseVal.value;
    const y = event.target.cy.baseVal.value;

    ghostPiece.setAttribute('cx', x);
    ghostPiece.setAttribute('cy', y);
    ghostPiece.setAttribute('visibility', 'visible');
}
