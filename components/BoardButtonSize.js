import { loadStyles } from '../utils/StyleLoader.js';
import { gameStateManager } from '../services/GameStateManager.js'

class BoardButtonSize extends HTMLElement {
	constructor() {
		super(); // Always call super() first in a Web Component constructor.

		// Attach a shadow root to the element.
		this.attachShadow({ mode: 'open' });

		// Set up the initial state or properties
		this.boardSize = this.getAttribute('board-size')
	}

	connectedCallback() {
		loadStyles(this.shadowRoot, '../assets/styles/Buttons.css');

		const button = document.createElement('button');
		button.textContent = `${this.boardSize}x${this.boardSize} Board`;

		// Add event listener
		button.addEventListener('click', () => {
			gameStateManager.boardSize = this.boardSize;
		});

		this.shadowRoot.appendChild(button);

	}

}

// Define the custom element
customElements.define('board-button-size', BoardButtonSize);
