import { startCountdown, formatTime } from './timeUtils.js';

class AbsoluteTimeControl {
    constructor(playerOneTime, playerTwoTime, onTimeUpdate, onTimeOut) {
        this.playerOneTime = playerOneTime; // Time in seconds
        this.playerTwoTime = playerTwoTime;
        this.onTimeUpdate = onTimeUpdate; // Callback to update UI
        this.onTimeOut = onTimeOut;
        this.currentPlayer = 1; // 1 for player one, 2 for player two
        this.timerId = null;
    }

    switchPlayer() {
        this.pauseTimer();
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.startPlayerTimer();
    }

    pauseTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    startPlayerTimer() {
        const time = this.currentPlayer === 1 ? this.playerOneTime : this.playerTwoTime;
        this.timerId = startCountdown(
            time,
            (remainingTime) => {
                const formattedTime = formatTime(remainingTime);
                this.onTimeUpdate(this.currentPlayer, formattedTime);
            },
            () => {
                this.onTimeOut(this.currentPlayer);
            }
        );
    }

    // Consider adding methods to start, stop, or reset the entire game timer if needed
}

export default AbsoluteTimeControl;
