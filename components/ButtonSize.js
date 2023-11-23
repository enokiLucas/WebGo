class ButtonSize extends HTMLElement {
	constructor() {
		super(); // Always call super() first in a Web Component constructor.

		// Attach a shadow root to the element.
		this.attachShadow({ mode: 'open' });

		// Set up the initial state or properties
		this.boardSize = this.getAttribute('board-size') || 9; // Default to 9x9
	}

	connectedCallback() {
		const button = document.createElement('button');
		button.textContent = `${this.boardSize}x${this.boardSize} Board`;

		// Add event listener
		button.addEventListener('click', () => {
			// Emit a custom event with the board size
			this.dispatchEvent(new CustomEvent('board-create', {
				detail: { size: this.boardSize },
				bubbles: true, // Allows the event to bubble up through the DOM
			}));
		});

		this.shadowRoot.appendChild(button);
	}
}

// Define the custom element
customElements.define('button-size', ButtonSize);
