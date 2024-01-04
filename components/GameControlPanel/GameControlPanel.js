import { loadHTML } from '../../utils/HTMLLoader.js'

class GameControlPanel extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	async connectedCallback() {
		await loadHTML(this.shadowRoot, '../../assets/html/GameControlPanel.html');
	}
}

customElements.define('game-control-panel', GameControlPanel);
