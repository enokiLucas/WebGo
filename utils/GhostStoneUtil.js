import { SVG_NS, LENGTH_SQUARE } from '../utils/constants.js';

export function createGhostStone() {
	const ghostStone = document.createElementNS(SVG_NS, "circle");
	ghostStone.setAttribute('r', LENGTH_SQUARE / 2.5);
	ghostStone.setAttribute('fill', 'white');
	ghostStone.setAttribute('fill-opacity', '0.5');
	ghostStone.setAttribute('visibility', 'hidden'); // Initially hidden

	return ghostStone;
}
