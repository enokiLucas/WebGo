document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('btn9x9').addEventListener('click', function() {
			createBoard(9);
	});

	document.getElementById('btn13x13').addEventListener('click', function() {
			createBoard(13);
	});

	document.getElementById('btn19x19').addEventListener('click', function() {
			createBoard(19);
	});

	// Adjust board size initially and on window resize
	window.addEventListener('resize', adjustBoardSize);
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

	// Adjust board size based on the window size
	adjustBoardSize();
}

function adjustBoardSize() {
	const boardContainer = document.getElementById('boardContainer');
	const svgBoard = boardContainer.querySelector('svg');

	if (svgBoard) {
			// Get viewport dimensions
			let vh = window.innerHeight * 0.01;
			let vw = window.innerWidth * 0.01;

			// Calculate the maximum board size that can fit in the viewport
			// while maintaining the aspect ratio
			let size = Math.min(vh, vw) * 95; // 95 is used instead of 100 for some padding
			svgBoard.style.width = `${size}vmin`;
			svgBoard.style.height = `${size}vmin`;
	}
}

// Run the resize function once to initialize
window.onload = adjustBoardSize;
