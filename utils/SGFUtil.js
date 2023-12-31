export function convertToSGFPosition(x, y, boardSize) {
	const letters = "abcdefghijklmnopqrstuvwxyz";
	const sgfX = letters.charAt(x);
	const sgfY = letters.charAt(boardSize - 1 - y); // Assuming 0-indexed y-coordinate

	return `${sgfX}${sgfY}`;
}

export function getPlayerSGFColor(player) {
	return player === 'black' ? 'B' : 'W';
}
