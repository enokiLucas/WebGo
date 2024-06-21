import { gameStateManager } from '../../../services/GameStateManager.js';
import { timer } from '../../../services/time/Timer.js';
import { loadStyles } from '../../../utils/StyleLoader.js';

class NewGameButton extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	async connectedCallback() {
		await loadStyles(this.shadowRoot, '../../../assets/styles/Buttons.css');

		const button = document.createElement('button');
		button.textContent = `Start New Game`;

		// Add event listener
		button.addEventListener('click', () => {
			this.startNewGame();
		});

		this.shadowRoot.appendChild(button);
	}

	startNewGame() {
		gameStateManager.resetGameState();
		timer.setTime();
		timer.setTimerBeforeMatch();
		timer.startCountdown(); // Start the timer for the new game

		// Emit an event to indicate a new game has started
		document.dispatchEvent(new CustomEvent('new-game-started'));
		console.log('New game started'); // Debug log
	}
}

customElements.define('new-game-button', NewGameButton);
