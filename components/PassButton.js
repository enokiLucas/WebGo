import { gameStateManager } from '../services/GameStateManager.js'
import { loadStyles } from '../utils/StyleLoader.js';

class PassButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		//this.initializeButton();
	}

	connectedCallback() {
		loadStyles(this.shadowRoot, '../assets/styles/Buttons.css');

		const button = document.createElement('button');
		button.textContent = 'Pass';

		button.addEventListener('click', () => {
			gameStateManager.makePass();
		});

		this.shadowRoot.appendChild(button);
	}

	/*initializeButton() {
		const button = document.createElement('button');
		button.textContent = 'Pass';
		button.addEventListener('click', gameStateManager.makePass());
		this.shadowRoot.appendChild(button);
	}*/
}

customElements.define('pass-button', PassButton);
