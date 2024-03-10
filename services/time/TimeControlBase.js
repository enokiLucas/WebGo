export default class TimeControlBase {
	constructor(onTimeUpdate, onTimeOut) {
		if (new.target === TimeControlBase) {
			throw new TypeError("Cannot construct TimeControlBase instances directly");
		}
		this.onTimeUpdate = onTimeUpdate; // Callback for updating UI with the time
		this.onTimeOut = onTimeOut; // Callback for when the time runs out
		this.timerId = null; // Reference to the active timer
	}

	// Starts or resumes the timer
	start() {
		throw new Error("Method 'start()' must be implemented by subclass.");
	}

	// Pauses the timer
	pause() {
		if (this.timerId) {
			clearInterval(this.timerId);
			this.timerId = null;
		}
	}

	// Resets the timer to its initial state
	reset() {
		throw new Error("Method 'reset()' must be implemented by subclass.");
	}

	// Utility method to schedule next timer tick
	scheduleNextTick(remainingTime) {
		this.timerId = setTimeout(() => {
			if (remainingTime <= 0) {
				clearTimeout(this.timerId);
				this.timerId = null;
				this.onTimeOut();
			} else {
				this.onTimeUpdate(remainingTime - 1);
				this.scheduleNextTick(remainingTime - 1);
			}
		}, 1000);
	}

	// Utility method to update the timer display; subclasses may override this
	updateDisplay(remainingTime) {
		// Format time and update UI via onTimeUpdate callback
		this.onTimeUpdate(this.formatTime(remainingTime));
	}

	// Formats time in seconds into MM:SS format; can be used by subclasses
	formatTime(totalSeconds) {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	}
}
