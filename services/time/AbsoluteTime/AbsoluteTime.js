import { startCountdown } from './timeUtils.js';

class AbsoluteTimeControl {
  constructor(playerOneTime, playerTwoTime, onTimeUpdate, onTimeOut) {
    this.playerOneTime = playerOneTime;
    this.playerTwoTime = playerTwoTime;
    this.onTimeUpdate = onTimeUpdate; // Callback to update the UI with the remaining time
    this.onTimeOut = onTimeOut; // Callback when a player's time runs out
    this.currentPlayer = 1; // Assume player 1 starts
    this.timerId = null;
  }

  switchPlayer() {
    // Pause current timer
    clearInterval(this.timerId);

    // Switch current player
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;

    // Start countdown for the new current player
    this.startPlayerTimer();
  }

  startPlayerTimer() {
    const totalTimeInSeconds = this.currentPlayer === 1 ? this.playerOneTime : this.playerTwoTime;
    this.timerId = startCountdown(totalTimeInSeconds, (remainingTime) => {
      this.onTimeUpdate(this.currentPlayer, remainingTime);

      if (remainingTime <= 0) {
        this.onTimeOut(this.currentPlayer); // Notify game state manager of timeout
      }
    });
  }

  // Additional methods to start, pause, and stop the game timer could be implemented as needed
}
