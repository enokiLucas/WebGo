import { loadHTML } from '../../../utils/HTMLLoader.js';
import { loadStyles } from '../../../utils/StyleLoader.js';
import { gameStateManager } from '../../../services/GameStateManager.js';

class TimerTab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		// Initialize state such as player turn, captured stones, etc.
	}

	async connectedCallback() {
		await loadHTML(this.shadowRoot, '../../../assets/html/TimerTab.html');
		await loadStyles(this.shadowRoot, '../../../assets/styles/TimerTab.css');
		document.addEventListener('moveMade', this.updateTimerDisplay);
	}

	disconnectedCallback() {
		// Remove the event listener when the component is removed from the DOM
		document.removeEventListener('moveMade', this.updateTimerDisplay);
	}

	updateTimerDisplay = (e) => {
		const currentPlayer = e.detail.currentPlayer;
		const timerDisplay = this.shadowRoot.querySelector('.timer');

		if (currentPlayer === 'black') {
			timerDisplay.classList.add('black-turn');
			timerDisplay.classList.remove('white-turn');
			timerDisplay.querySelector('.player-turn').textContent = "Black's Turn";
		} else {
			timerDisplay.classList.add('white-turn');
			timerDisplay.classList.remove('black-turn');
			timerDisplay.querySelector('.player-turn').textContent = "White's Turn";
		}
	}

}

customElements.define('timer-tab', TimerTab);
