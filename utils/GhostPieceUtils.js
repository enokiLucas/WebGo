import { SVG_NS, LENGTH_SQUARE } from '../utils/constants.js';

export function createGhostPiece() {
	const ghostPiece = document.createElementNS(SVG_NS, "circle");
	ghostPiece.setAttribute('r', LENGTH_SQUARE / 3);
	ghostPiece.setAttribute('fill', 'black');
	ghostPiece.setAttribute('fill-opacity', '0.5');
	ghostPiece.setAttribute('visibility', 'hidden'); // Initially hidden

	return ghostPiece;
}
