import { loadHTML } from '../../../utils/HTMLLoader.js';

class StarterTab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	async connectedCallback() {
		await loadHTML(this.shadowRoot, '../../../assets/html/StarterTab.html');
	}
}

customElements.define('starter-tab', StarterTab);
