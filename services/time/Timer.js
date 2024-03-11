import { gameStateManager } from '../GameStateManager.js';

class Timer {
	constructor() {
		this.timeMinutes = { black: 2, white: 2};
		this.time = {};
		this.timerPath = {};
		this.intervalID = null;
	}

	setTime() {
		this.time = {
			black: 60 * this.timeMinutes['black'],
			white: 60 * this.timeMinutes['white']
		}
	}

	setTimerPath() {
		this.timerPath = {
			black: this.shadowRoot.getElementById('black-timer'),
			white: this.shadowRoot.getElementById('white-timer')
		};
	}

	updateCountdown(player = 'black') {
		if (this.intervalID !== null) {
			clearInterval(this.intervalId);
		}


		this.intervalId = setInterval(() => {
			if (this.time[player] <= 0) {
				clearInterval(this.intervalId);
				//TODO end the game.
			} else {
				const minutes = Math.floor(this.time[player] / 60);
				let seconds = this.time[player] % 60;
				seconds = seconds < 10 ? `0${seconds}` : seconds;

				this.timerPath[player].textContent = `${minutes}:${seconds}`;
				this.time[player]--;
			}
		}, 1000);
	}

	switchTimer() {
		// Pause the current countdown.
		if (this.intervalId !== null) {
			clearInterval(this.intervalId);
		}

		// Toggle the player using GameStateManager.
		GameStateManager.togglePlayer();
		// Retrieve the new current player from GameStateManager and update the countdown for them.
		const currentPlayer = GameStateManager.getCurrentPlayer();
		this.updateCountdown(currentPlayer);
	}
}

export const timer = new Timer();
