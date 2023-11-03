document.addEventListener('DOMContentLoaded', function() {
	// Attach event listeners to buttons
	document.getElementById('btn9x9').addEventListener('click', () => createBoard(9));
	document.getElementById('btn13x13').addEventListener('click', () => createBoard(13));
	document.getElementById('btn19x19').addEventListener('click', () => createBoard(19));
});

function createBoard(size) {
	// Remove existing board if present
	const existingBoard = document.querySelector('#boardContainer svg');
	if (existingBoard) {
			existingBoard.remove();
	}

	// Create a new SVG element
	const svgNS = "http://www.w3.org/2000/svg";
  let board = document.createElementNS(svgNS, "svg");
  board.setAttribute('viewBox', `0 0 ${size} ${size}`); // Set the viewBox to match the board size
	
	// Draw the board lines
	for (let i = 0; i < size; i++) {
			// Horizontal lines
			let hLine = document.createElementNS(svgNS, "line");
			hLine.setAttribute('x1', 50);
			hLine.setAttribute('y1', (i + 1) * 50);
			hLine.setAttribute('x2', size * 50 - 50);
			hLine.setAttribute('y2', (i + 1) * 50);
			hLine.setAttribute('stroke', 'black');
			board.appendChild(hLine);

			// Vertical lines
			let vLine = document.createElementNS(svgNS, "line");
			vLine.setAttribute('x1', (i + 1) * 50);
			vLine.setAttribute('y1', 50);
			vLine.setAttribute('x2', (i + 1) * 50);
			vLine.setAttribute('y2', size * 50 - 50);
			vLine.setAttribute('stroke', 'black');
			board.appendChild(vLine);
	}

	// Append the SVG to the container
	document.getElementById('boardContainer').appendChild(board);
}
