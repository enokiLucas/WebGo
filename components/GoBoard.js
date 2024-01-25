import { EDGE_MARGIN, LENGTH_SQUARE, ALPHABET, OFFSET, TEXT_STYLE, SVG_NS } from '../utils/constants.js'; //Import global variables
import { SVGBoard } from './SVGBoard.js';//Import the method that creates the board.
import { loadStyles } from '../utils/StyleLoader.js';
import { addEventListeners } from '../services/EventListeners.js';
import { createGhostStone } from '../utils/GhostStoneUtil.js';
import { handleIntersectionClick } from '../services/HandleIntersectionClick.js';
import { handleIntersectionHover } from '../services/HandleIntersectionHover.js';
import { gameStateManager } from '../services/GameStateManager.js';
import { rulesEngine } from '../services/RulesEngine.js';

class GoBoard extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' }); // Initialize any state or bind methods
	}

	async connectedCallback() {
		await loadStyles(this.shadowRoot, '../assets/styles/GoBoard.css');
		// Called when the element is inserted into the DOM
		this.initializeBoard(gameStateManager.getBoardSize());

		// Listen to board size change events
		document.addEventListener('board-size-changed', (event) => {
			const newSize = event.detail.size;
			this.initializeBoard(newSize);
		});
	}

	// You can use attributes to dynamically set properties like board size
	static get observedAttributes() {
		return ['size'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (name === 'size') {
			gameStateManager.setBoardSize(parseInt(newValue));
			this.initializeBoard(gameStateManager.getBoardSize());
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

		// Create and append ghost piece to the SVG board
		this.ghostStone = createGhostStone();
		boardElement.appendChild(this.ghostStone);

		gameStateManager.resetGameState();

		addEventListeners(
			boardElement,
			gameStateManager.getBoardSize(),
			this.ghostStone,
			handleIntersectionHover,
			handleIntersectionClick
		);
	}
}

// Define the custom element
customElements.define('go-board', GoBoard);
