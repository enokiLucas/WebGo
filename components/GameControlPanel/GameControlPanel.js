import { loadHTML } from '../../utils/HTMLLoader.js'

class GameControlPanel extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	async connectedCallback() {
		await loadHTML(this.ShadowRoot, '../../assests/html/GameControlPanel.html');
	}
}

customElements.define('game-control-panel', GameControlPanel);
