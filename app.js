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

	// Define the edge margin
  const edgeMargin = 10;
	// Define the length between intersections;
	const lengthSquare = 50;

	// Create a new SVG element
	const svgNS = "http://www.w3.org/2000/svg";
	let board = document.createElementNS(svgNS, "svg");
	board.setAttribute('width', '100%');
	board.setAttribute('height', '100%');
	board.setAttribute('viewBox', `0 0 ${size * lengthSquare + (2 * edgeMargin)} ${size * lengthSquare + (2 * edgeMargin)}`);


  // Draw the board edge
  let edge = document.createElementNS(svgNS, "rect");
  edge.setAttribute('x', 0); // The x position of the rectangle
  edge.setAttribute('y', 0); // The y position of the rectangle
  edge.setAttribute('width', (2 * edgeMargin) + (size * lengthSquare)); // The width of the rectangle
  edge.setAttribute('height', (2 * edgeMargin) + (size * lengthSquare)); // The height of the rectangle
  edge.setAttribute('stroke', 'black'); // The edge color
  edge.setAttribute('fill', 'none'); // No fill to make it transparent inside
  edge.setAttribute('stroke-width', '2'); // The width of the border lines
  board.appendChild(edge);	
	
	// Draw the board lines
	for (let i = 0; i <= size; i++) {
		// Horizontal lines
		let hLine = document.createElementNS(svgNS, "line");
		hLine.setAttribute('x1', edgeMargin);
		hLine.setAttribute('y1', edgeMargin + (i + 1) * lengthSquare);
		hLine.setAttribute('x2', size * lengthSquare + edgeMargin);
		hLine.setAttribute('y2', (i + 1) * lengthSquare + edgeMargin);
		hLine.setAttribute('stroke', 'black');
		board.appendChild(hLine);

		// Vertical lines
		let vLine = document.createElementNS(svgNS, "line");
		vLine.setAttribute('x1', (i + 1) * lengthSquare + edgeMargin);
		vLine.setAttribute('y1', edgeMargin);
		vLine.setAttribute('x2', (i + 1) * lengthSquare + edgeMargin);
		vLine.setAttribute('y2', size * lengthSquare + edgeMargin);
		vLine.setAttribute('stroke', 'black');
		board.appendChild(vLine);
	}

	// Create the coordinate labels
	const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
	const offset = 0; // Adjust this value if necessary for positioning
	const fontSize = 10; // Adjust font size as needed
	const textStyle = `font-size: ${fontSize}px; font-family: Arial;`;
	
	// Add letters on the top
	for (let i = 0; i < size; i++) {
		let textTop = document.createElementNS(svgNS, "text");
		textTop.setAttribute('x', (i + 1) * lengthSquare + offset);
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
		textLeft.setAttribute('y', (i + 1) * lengthSquare + offset);
		textLeft.setAttribute('text-anchor', 'middle');
		textLeft.setAttribute('style', textStyle);
		textLeft.textContent = size - i; // Numbers go in reverse for Go boards
		board.appendChild(textLeft);
	}
	/*
	// Define text attributes
	const fontSize = 10; // Adjust as needed
	const textOffset = fontSize * 0.3; // Adjust to align with the middle of the line

	// Add coordinates along the top
	for (let i = 0; i < size; i++) {
		let text = document.createElementNS(svgNS, "text");
		text.setAttribute('x', (i + 1) * 50); // Center the text over the line
		text.setAttribute('y', 40); // Position above the grid
		text.setAttribute('font-family', 'Arial');
		text.setAttribute('font-size', fontSize);
		text.setAttribute('text-anchor', 'middle'); // Centers the text horizontally
		text.setAttribute('alignment-baseline', 'middle'); // Centers the text vertically
		text.textContent = String.fromCharCode(65 + i); // Converts 0 -> A, 1 -> B, etc.
		board.appendChild(text);
	}	
	*/
	// Append the SVG to the container
	document.getElementById('boardContainer').appendChild(board);
} 

