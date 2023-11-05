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
	board.setAttribute('width', '100%');
	board.setAttribute('height', '100%');
	board.setAttribute('viewBox', `0 0 ${size * 50} ${size * 50}`);
	
	// Draw the board lines
	for (let i = 0; i < size; i++) {
		// Horizontal lines
		let hLine = document.createElementNS(svgNS, "line");
		hLine.setAttribute('x1', 0);
		hLine.setAttribute('y1', i * 50);
		hLine.setAttribute('x2', (size - 1) * 50);
		hLine.setAttribute('y2', i * 50);
		hLine.setAttribute('stroke', 'black');
		board.appendChild(hLine);

		// Vertical lines
		let vLine = document.createElementNS(svgNS, "line");
		vLine.setAttribute('x1', i * 50);
		vLine.setAttribute('y1', 0);
		vLine.setAttribute('x2', i * 50);
		vLine.setAttribute('y2', (size - 1) * 50);
		vLine.setAttribute('stroke', 'black');
		board.appendChild(vLine);
	}

	// Create the coordinate labels
	const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
	const offset = 25; // Adjust this value if necessary for positioning
	const fontSize = 10; // Adjust font size as needed
	const textStyle = `font-size: ${fontSize}px; font-family: Arial;`;
	
	// Add letters on the top
	for (let i = 0; i < size; i++) {
		let textTop = document.createElementNS(svgNS, "text");
		textTop.setAttribute('x', (i + 1) * 50 + offset);
		textTop.setAttribute('y', offset);
		textTop.setAttribute('text-anchor', 'middle');
		textTop.setAttribute('style', textStyle);
		textTop.textContent = alphabet[i];
		board.appendChild(textTop);
	}

 	// Add numbers on the left
 	for (let i = 0; i < size; i++) {
		let textLeft = document.createElementNS(svgNS, "text");
		textLeft.setAttribute('x', offset);
		textLeft.setAttribute('y', (i + 1) * 50 + offset);
		textLeft.setAttribute('text-anchor', 'middle');
		textLeft.setAttribute('style', textStyle);
		textLeft.textContent = size - i; // Numbers go in reverse for Go boards
		board.appendChild(textLeft);
	}

	// Append the SVG to the container
	document.getElementById('boardContainer').appendChild(board);
}