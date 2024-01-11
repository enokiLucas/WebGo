import { loadHTML } from '../../../utils/HTMLLoader.js';

class TimerTab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		// Initialize state such as player turn, captured stones, etc.
	}

	async connectedCallback() {
		await loadHTML(this.shadowRoot, '../../../assets/html/TimerTab.html');
		await loadStyle(this.shadowRoot, '../../../assests/styles/TimerTab.css');
	}
}

	// Additional methods to update timer, switch player, etc.
}

customElements.define('timer-tab', TimerTab);
