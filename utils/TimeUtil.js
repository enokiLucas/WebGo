/**
 * Formats time in seconds to a string in MM:SS format.
 * @param {number} totalSeconds - Total time in seconds.
 * @returns {string} - Formatted time string.
 */
export function formatTime(totalSeconds) {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Pads a number with a leading zero if it is less than 10.
 * @param {number} num - Number to pad.
 * @returns {string} - Padded number as a string.
 */
function pad(num) {
	return num < 10 ? `0${num}` : num.toString();
}

/**
 * Basic countdown function that decrements time and updates a callback with the remaining time in MM:SS format.
 * @param {number} totalTimeInSeconds - The total time for the countdown in seconds.
 * @param {function} updateCallback - A callback function to update with the remaining time.
 */
export function startCountdown(totalTimeInSeconds, updateCallback) {
	let remainingTime = totalTimeInSeconds;

	const timerId = setInterval(() => {
		remainingTime -= 1;
		updateCallback(formatTime(remainingTime));

		if (remainingTime <= 0) {
			clearInterval(timerId);
			// Handle completion, e.g., switch turns, end game, etc.
		}
	}, 1000);

	return timerId; // Return the timer ID for possible cancellation or pause.
}
