import { loadHTML } from '../../../utils/HTMLLoader.js';
import { loadStyles } from '../../../utils/StyleLoader.js';

class TimerTab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		// Initialize state such as player turn, captured stones, etc.
	}

	async connectedCallback() {
		await loadHTML(this.shadowRoot, '../../../assets/html/TimerTab.html');
		await loadStyles(this.shadowRoot, '../../../assets/styles/TimerTab.css');
	}
}

customElements.define('timer-tab', TimerTab);
