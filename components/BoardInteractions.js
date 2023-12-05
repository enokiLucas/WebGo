//Handle event listeners in the intersections of the board.

import { EDGE_MARGIN, LENGTH_SQUARE, ALPHABET, OFFSET, TEXT_STYLE, SVG_NS } from '../utils/constants.js'; //Import global variables

export function setupBoardInteractions(board, size, ghostStone) {
	// Logic for setting up event listeners and interactions
	// Initialize the ghost piece on the board
	this.initializeGhostPiece('black');
	const ghostStone = this.shadowRoot.getElementById('ghostStone');

	// Iterate over the grid size to access each intersection
	for (let i = 0; i < this.boardSize; i++) {
		for (let j = 0; j < this.boardSize; j++) {
			// Create a circle at each intersection for the event listener
			let intersection = document.createElementNS(SVG_NS, "circle");
			intersection.setAttribute('cx', EDGE_MARGIN + (i * LENGTH_SQUARE));
			intersection.setAttribute('cy', EDGE_MARGIN + (j * LENGTH_SQUARE));
			intersection.setAttribute('r', 10); // Small radius, essentially invisible
			intersection.setAttribute('fill', 'transparent'); // Make the circle invisible
			intersection.setAttribute('class', 'intersection');

			// Add Ghost Stone locked into the listener
			this.setupIntersectionListeners(intersection, ghostStone);

			// Add click event listener to place a stone on the board
			intersection.addEventListener('click', (event) => {
				this.saveClick(event);
			});

			// Append the intersection to the board
			this.shadowRoot.appendChild(intersection);
		}
	}
}

	setupBoardInteractions() {
		// Initialize the ghost piece on the board
		this.initializeGhostPiece('black');
		const ghostStone = this.shadowRoot.getElementById('ghostStone');

		// Iterate over the grid size to access each intersection
		for (let i = 0; i < this.boardSize; i++) {
			for (let j = 0; j < this.boardSize; j++) {
				// Create a circle at each intersection for the event listener
				let intersection = document.createElementNS(SVG_NS, "circle");
				intersection.setAttribute('cx', EDGE_MARGIN + (i * LENGTH_SQUARE));
				intersection.setAttribute('cy', EDGE_MARGIN + (j * LENGTH_SQUARE));
				intersection.setAttribute('r', 10); // Small radius, essentially invisible
				intersection.setAttribute('fill', 'transparent'); // Make the circle invisible
				intersection.setAttribute('class', 'intersection');

				// Add Ghost Stone locked into the listener
				this.setupIntersectionListeners(intersection, ghostStone);

				// Add click event listener to place a stone on the board
				intersection.addEventListener('click', (event) => {
					this.saveClick(event);
				});

				// Append the intersection to the board
				this.shadowRoot.appendChild(intersection);
			}
		}
	} //end of setupBoardInteractions

	//Methods used by setupBoardInteractions().
	initializeGhostPiece(color) {
		let ghostStone = document.createElementNS(SVG_NS, "circle");
		ghostStone.setAttribute('id', 'ghostStone');
		ghostStone.setAttribute('r', LENGTH_SQUARE / 2); // The radius should be half the square size
		ghostStone.setAttribute('fill', color); // Placeholder color
		ghostStone.setAttribute('fill-opacity', '0.5'); // Semi-transparent
		ghostStone.style.visibility = 'hidden'; // Initially hidden
		this.shadowRoot.appendChild(ghostStone);
	}

	setupIntersectionListeners(intersection, ghostStone) {
		intersection.addEventListener('mouseenter', () => {
			ghostStone.setAttribute('cx', intersection.getAttribute('cx'));
			ghostStone.setAttribute('cy', intersection.getAttribute('cy'));
			ghostStone.style.visibility = 'visible';
		});

		intersection.addEventListener('mouseleave', () => {
			ghostStone.style.visibility = 'hidden';
		});
	}

	saveClick(event) {
		let x = event.target.cx.baseVal.value;
		let y = event.target.cy.baseVal.value;

		let boardX = (x - EDGE_MARGIN) / LENGTH_SQUARE;
		let boardY = (y - EDGE_MARGIN) / LENGTH_SQUARE;

		console.log(`Intersection clicked at: (${ALPHABET[boardX]}, ${this.boardSize - boardY})`);
		console.log(`Intersection at [${boardX}, ${boardY}]`);
	}
