import { EDGE_MARGIN, LENGTH_SQUARE, ALPHABET, OFFSET, TEXT_STYLE } from '../utils/constants.js'; //Import global variables
import { SVGBoard } from 'SVGBoard.js';//Import the method that creates the board.


class GoBoard extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		// Initialize any state or bind methods
		this.boardSize = 13; // Default board size or use attribute to set it
		this.loadStyles();
	}

	async loadStyles() {
		const css = await fetch('../assets/styles/GoBoard.css')
		.then(response => response.text());
		const style = document.createElement('style');
		style.textContent = css;
		this.shadowRoot.appendChild(style);
	}

	connectedCallback() {
		// Called when the element is inserted into the DOM
		this.initializeBoard(this.boardSize);
		this.setupBoardInteractions();

		// Listen for 'board-create' event on the document
		document.addEventListener('board-create', (event) => {
			const boardSize = event.detail.size;
			this.setAttribute('size', boardSize);
		});
	}

	// You can use attributes to dynamically set properties like board size
	static get observedAttributes() {
		return ['size'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'size') {
			this.boardSize = parseInt(newValue);
			this.initializeBoard(this.boardSize);
		}
	}

	initializeBoard(size) {
		// Code to set up the board
		const svgBoard = new SVGBoard("http://www.w3.org/2000/svg", size);
		const boardElement = svgBoard.createBoard();
		this.shadowRoot.appendChild(boardElement);
	}

	// Additional methods related to board functionality

	setupBoardInteractions() {
		const svgNS = "http://www.w3.org/2000/svg";

		// Initialize the ghost piece on the board
		this.initializeGhostPiece('black');
		const ghostStone = this.shadowRoot.getElementById('ghostStone');

		// Iterate over the grid size to access each intersection
		for (let i = 0; i < this.boardSize; i++) {
			for (let j = 0; j < this.boardSize; j++) {
				// Create a circle at each intersection for the event listener
				let intersection = document.createElementNS(svgNS, "circle");
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
		const svgNS = "http://www.w3.org/2000/svg";
		let ghostStone = document.createElementNS(svgNS, "circle");
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
} //End of the class

// Define the custom element
customElements.define('go-board', GoBoard);
