import { gameStateManager } from '../services/GameStateManager.js'
import { loadStyles } from '../utils/StyleLoader.js';
import { getPlayerSGFColor } from '../utils/SGFUtil.js'

class PassButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		loadStyles(this.shadowRoot, '../assets/styles/Buttons.css');

		const button = document.createElement('button');
		button.textContent = 'Pass';

		button.addEventListener('click', () => {
			gameStateManager.makePass(getPlayerSGFColor(gameStateManager.currentPlayer));
		});
/*
		// Change the color of the ghost stone
		ghostStone.setAttribute('fill', gameStateManager.getCurrentPlayer());
*/
		this.shadowRoot.appendChild(button);
	}
}

customElements.define('pass-button', PassButton);
