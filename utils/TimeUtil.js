export function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
    return num < 10 ? `0${num}` : num.toString();
}

export function startCountdown(totalTimeInSeconds, updateCallback, completionCallback) {
    let remainingTime = totalTimeInSeconds;

    const timerId = setInterval(() => {
        remainingTime -= 1;
        updateCallback(remainingTime); // Update with remaining seconds

        if (remainingTime <= 0) {
            clearInterval(timerId);
            completionCallback(); // Notify when the countdown completes
        }
    }, 1000);

    return timerId; // Allows for cancellation or pause
}
