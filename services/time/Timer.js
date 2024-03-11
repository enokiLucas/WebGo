class Timer extends HTMLElement {
	constructor() {
		super();
		this.timeMinutes = { black: 2, white: 2};
		this.time = {};
		this.timerPath = {};
	}

	connectedCallback() {
		this.setTime();
		this.setTimerPath();

	}

	setTime() {
		this.time = {
			black: 60 * this.timeMinutes['black'];
			white: 60 * this.timeMinutes['white'];
		}
	}

	setTimerPath() {
		this.timerPath = {
			black: this.shadowRoot.getElementById('black-timer'),
			white: this.shadowRoot.getElementById('white-timer')
		};
	}

	updateCountdown(player = 'black') {
		setInterval( () => {
			const minutes = Math.floor(this.time[player] / 60);
			let seconds = this.time[player] % 60;
			seconds = seconds < 10 ? `0${seconds}` : seconds;

			this.timerPath[player].textContent = `${minutes}:${seconds}`;
			this.time[player]--;
		}, 1000);
	}

	pauseCountdown(event) {

	}
}
