import { loadHTML } from '../../../utils/HTMLLoader.js';

class TimerTab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		// Initialize state such as player turn, captured stones, etc.
	}

	connectedCallback() {
		// Load HTML and CSS
		// Setup timer logic
	}

	// Additional methods to update timer, switch player, etc.
}

customElements.define('timer-tab', TimerTab);
