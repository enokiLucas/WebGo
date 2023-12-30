//Function to place a stone on the board.
export function placeStoneOnBoard(board, x, y, playerColor) {
	let stone = document.createElementNS(SVG_NS, "circle");
	stone.setAttribute('cx', x);
	stone.setAttribute('cy', y);
	stone.setAttribute('r', LENGTH_SQUARE / 2);
	stone.setAttribute('fill', playerColor);
	board.appendChild(stone);
}
