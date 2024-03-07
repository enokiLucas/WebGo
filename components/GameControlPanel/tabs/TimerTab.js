import { loadHTML } from '../../../utils/HTMLLoader.js';
import { loadStyles } from '../../../utils/StyleLoader.js';
import { gameStateManager } from '../../../services/GameStateManager.js';

class TimerTab extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		document.addEventListener('board-size-changed', (event) => { this.resetTimer(gameStateManager.timerControler.method); });
	}

	async connectedCallback() {
		await loadHTML(this.shadowRoot, '../../../assets/html/TimerTab.html');
		await loadStyles(this.shadowRoot, '../../../assets/styles/TimerTab.css');
		document.addEventListener('moveMade', this.updateTimerDisplay);
		document.addEventListener('Pass', this.updateTimerDisplay);
	}

	disconnectedCallback() {
		// Remove the event listener when the component is removed from the DOM
		document.removeEventListener('moveMade', this.updateTimerDisplay);
	}

	//Change the color of the display
	updateTimerDisplay = (e) => {
		const currentPlayer = e.detail.currentPlayer;
		const timerDisplay = this.shadowRoot.querySelector('.timer');

		//Change the clor during normal play.
		if (currentPlayer === 'black') {
			timerDisplay.classList.add('black-turn');
			timerDisplay.classList.remove('white-turn');
			timerDisplay.querySelector('.player-turn').textContent = "Black's Turn";
		} else {
			timerDisplay.classList.add('white-turn');
			timerDisplay.classList.remove('black-turn');
			timerDisplay.querySelector('.player-turn').textContent = "White's Turn";
		}

		//Change the color of the display when a new game start.
		document.addEventListener('board-size-changed', () => {
			timerDisplay.classList.add('black-turn');
			timerDisplay.classList.remove('white-turn');
			timerDisplay.querySelector('.player-turn').textContent = "Black's Turn";
		});
	}

	//Change the timer depending on the time keeping method.
	async resetTimer(method) {
		const timerContainer = this.shadowRoot.getElementById('timer-body');
		try {
			// Clear the current timer display
			timerContainer.innerHTML = '';

			// Fetch and display the HTML for the selected timer method
			const methodHTML = await this.getMethodHTML(method);
			timerContainer.innerHTML = methodHTML;

			// Optionally, re-initialize or reset any timer logic here
			} catch (error) {
				console.error("Failed to load timer method HTML:", error);
			}
	}

	async getMethodHTML(method) {
		const response = await fetch(`/services/time/${method}/${method}.html`);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		return response.text();
	}

}

customElements.define('timer-tab', TimerTab);
