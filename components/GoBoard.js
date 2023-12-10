import { EDGE_MARGIN, LENGTH_SQUARE, ALPHABET, OFFSET, TEXT_STYLE, SVG_NS } from '../utils/constants.js'; //Import global variables
import { SVGBoard } from './SVGBoard.js';//Import the method that creates the board.
import { loadStyles } from '../utils/StyleLoader.js';
import { addEventListeners } from '../services/EventListeners.js';
import './GhostPieceManager.js';
import { GameStateManager } from '../services/GameStateManager.js';
import { handleIntersectionClick } from '../services/HandleIntersectionClick.js';
import { handleIntersectionHover } from '../services/HandleIntersectionHover.js';

class GoBoard extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		// Initialize any state or bind methods
		this.boardSize = 13; // Default board size or use attribute to set it
	}

	async connectedCallback() {
		await loadStyles(this.shadowRoot, '../assets/styles/GoBoard.css');
		// Called when the element is inserted into the DOM
		this.initializeBoard(this.boardSize);
		addEventListeners(
			this.shadowRoot,
			this.boardSize,
			handleIntersectionHover,
			handleIntersectionClick
		);

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
		//Remove existing board when on already exist.
		const existingSVG = this.shadowRoot.querySelector('svg');
		if (existingSVG) {
			existingSVG.remove();
		}

		// Code to set up the board
		const svgBoard = new SVGBoard(SVG_NS, size);
		const boardElement = svgBoard.createBoard();
		this.shadowRoot.appendChild(boardElement);
	}
}

// Define the custom element
customElements.define('go-board', GoBoard);
