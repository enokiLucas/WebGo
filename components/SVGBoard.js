//Module to handle the creation of the board.
///Draw the grid lines, add coordinates, add hoshi (start points).

import { EDGE_MARGIN, LENGTH_SQUARE, ALPHABET, OFFSET, TEXT_STYLE } from '../utils/constants.js'; //Import global variables

export class SVGBoard {
	constructor(svgNS, size) {
		this.svgNS = svgNS;
		this.size = size;
	}

	createBoard() {
		// Create a new SVG element
		const svgNS = "http://www.w3.org/2000/svg";
		let board = document.createElementNS(svgNS, "svg");
		board.setAttribute('width', '100%');
		board.setAttribute('height', '100%');
		board.setAttribute('viewBox', `0 0 ${(this.size - 1) * LENGTH_SQUARE + (2 * EDGE_MARGIN)} ${(this.size - 1) * LENGTH_SQUARE + (2 * EDGE_MARGIN)}`);

		// Draw the board background with the wood texture
		let pattern = document.createElementNS(svgNS, "pattern");
		pattern.setAttribute('id', 'woodPattern');
		pattern.setAttribute('patternUnits', 'userSpaceOnUse');
		pattern.setAttribute('width', '300'); // Width of the image
		pattern.setAttribute('height', '300'); // Height of the image

		let image = document.createElementNS(svgNS, "image");
		image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '../assets/images/GimpWood01.png');
		image.setAttribute('width', '300');
		image.setAttribute('height', '300');

		pattern.appendChild(image);

		let defs = document.createElementNS(svgNS, "defs");
		defs.appendChild(pattern);
		board.appendChild(defs);

		let background = document.createElementNS(svgNS, "rect");
		background.setAttribute('width', '100%');
		background.setAttribute('height', '100%');
		background.setAttribute('fill', 'url(#woodPattern)');
		board.insertBefore(background, board.firstChild);

		// Draw the board edge
		let edge = document.createElementNS(svgNS, "rect");
		edge.setAttribute('x', 0); // The x position of the rectangle
		edge.setAttribute('y', 0); // The y position of the rectangle
		edge.setAttribute('width', (2 * EDGE_MARGIN) + ((this.size - 1) * LENGTH_SQUARE)); // The width of the rectangle
		edge.setAttribute('height', (2 * EDGE_MARGIN) + ((this.size - 1) * LENGTH_SQUARE)); // The height of the rectangle
		edge.setAttribute('stroke', 'black'); // The edge color
		edge.setAttribute('fill', 'none'); // No fill to make it transparent inside
		edge.setAttribute('stroke-width', '2'); // The width of the border lines
		board.appendChild(edge);

		// Draw the board lines
		for (let i = 0; i <= this.size - 1; i++) {
			// Horizontal lines
			let hLine = document.createElementNS(svgNS, "line");
			hLine.setAttribute('x1', EDGE_MARGIN);
			hLine.setAttribute('y1', EDGE_MARGIN + i * LENGTH_SQUARE);
			hLine.setAttribute('x2', (this.size - 1) * LENGTH_SQUARE + EDGE_MARGIN);
			hLine.setAttribute('y2', EDGE_MARGIN + i * LENGTH_SQUARE);
			hLine.setAttribute('stroke', 'black');
			board.appendChild(hLine);

			// Vertical lines
			let vLine = document.createElementNS(svgNS, "line");
			vLine.setAttribute('x1', EDGE_MARGIN + i * LENGTH_SQUARE);
			vLine.setAttribute('y1', EDGE_MARGIN);
			vLine.setAttribute('x2', EDGE_MARGIN + i * LENGTH_SQUARE);
			vLine.setAttribute('y2', (this.size - 1) * LENGTH_SQUARE + EDGE_MARGIN);
			vLine.setAttribute('stroke', 'black');
			board.appendChild(vLine);
		}

		// Add letters on the top
		for (let i = 0; i < this.size; i++) {
			let textTop = document.createElementNS(svgNS, "text");
			textTop.setAttribute('x', EDGE_MARGIN + i * LENGTH_SQUARE);
			textTop.setAttribute('y', EDGE_MARGIN - OFFSET);
			textTop.setAttribute('text-anchor', 'middle');
			textTop.setAttribute('style', TEXT_STYLE);
			textTop.textContent = ALPHABET[i];
			board.appendChild(textTop);
		}

		// Add numbers on the left
		for (let i = 0; i < this.size; i++) {
			let textLeft = document.createElementNS(svgNS, "text");
			textLeft.setAttribute('x', EDGE_MARGIN - OFFSET);
			textLeft.setAttribute('y', 3 + EDGE_MARGIN + i * LENGTH_SQUARE); // +3 is for better aliment
			textLeft.setAttribute('text-anchor', 'middle');
			textLeft.setAttribute('style', TEXT_STYLE);
			textLeft.textContent = this.size - i; // Numbers go in reverse for Go boards
			board.appendChild(textLeft);
		}

		// Draw the Hoshi (star) points for 9x9, 13x13, and 19x19 boards
		const hoshiPoints = {
			9: [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]],
			13: [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]],
			19: [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]],
		};

		// Check if we have predefined hoshi points for the current board size
		if (hoshiPoints[this.size]) {
			hoshiPoints[this.size].forEach(point => {
			let hoshi = document.createElementNS(svgNS, 'circle');
			let [x, y] = point.map(coord => EDGE_MARGIN + coord * LENGTH_SQUARE);
			hoshi.setAttribute('cx', x);
			hoshi.setAttribute('cy', y);
			hoshi.setAttribute('r', 3); // Radius of the hoshi point, adjust as needed
			hoshi.setAttribute('fill', 'black');
			board.appendChild(hoshi);
			});
		}

		// Append the SVG element to the Shadow DOM
		//this.shadowRoot.appendChild(board)
		return board;
	}
}
