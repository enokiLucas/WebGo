import TimeControlBase from '../TimeControlBase.js';

class AbsoluteTimeControl extends TimeControlBase {
	constructor(onTimeUpdate, onTimeOut, totalTimeBlack, totalTimeWhite) {
		super(onTimeUpdate, onTimeOut);
		this.totalTimeBlack = totalTimeBlack; // Total time in seconds for black
		this.totalTimeWhite = totalTimeWhite; // Total time in seconds for white
		this.remainingTimeBlack = totalTimeBlack;
		this.remainingTimeWhite = totalTimeWhite;
		this.activePlayer = 'black'; // "black" or "white"
	}

	start() {
		this.pause(); // Ensure any existing timer is cleared
		// Decide which player's time to start based on `activePlayer`
		this.scheduleNextTick(this.activePlayer === 'black' ? this.remainingTimeBlack : this.remainingTimeWhite);
	}

	scheduleNextTick(remainingTime) {
		this.timerId = setTimeout(() => {
			if (remainingTime <= 0) {
				clearTimeout(this.timerId);
				this.onTimeOut(this.activePlayer);
			} else {
				// Update the time for the active player
				if (this.activePlayer === 'black') {
					this.remainingTimeBlack = remainingTime - 1;
					this.onTimeUpdate('black', this.formatTime(this.remainingTimeBlack));
				} else {
					this.remainingTimeWhite = remainingTime - 1;
					this.onTimeUpdate('white', this.formatTime(this.remainingTimeWhite));
				}
				this.scheduleNextTick(remainingTime - 1);
			}
		}, 1000);
	}

	// Call this method to switch the active player and restart the timer
	switchPlayer() {
		this.activePlayer = this.activePlayer === 'black' ? 'white' : 'black';
		this.start();
	}

	reset() {
		this.pause(); // Stop the current countdown
		// Reset the times to their original values
		this.remainingTimeBlack = this.totalTimeBlack;
		this.remainingTimeWhite = this.totalTimeWhite;
		// Resetting doesn't start the timer automatically
	}
}
