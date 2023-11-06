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
  const edgeMargin = 20;
	// Define the length between intersections;
	const lengthSquare = 50;

	// Create a new SVG element
	const svgNS = "http://www.w3.org/2000/svg";
	let board = document.createElementNS(svgNS, "svg");
	board.setAttribute('width', '100%');
	board.setAttribute('height', '100%');
	board.setAttribute('viewBox', `0 0 ${(size - 1) * lengthSquare + (2 * edgeMargin)} ${(size - 1) * lengthSquare + (2 * edgeMargin)}`);

  // Draw the board background with the wood texture
  let pattern = document.createElementNS(svgNS, "pattern");
  pattern.setAttribute('id', 'woodPattern');
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  pattern.setAttribute('width', '300'); // Width of the image
  pattern.setAttribute('height', '300'); // Height of the image
  
  let image = document.createElementNS(svgNS, "image");
  image.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '../Images/GimpWood01.png');
  image.setAttribute('width', '300');
  image.setAttribute('height', '300');
  
  pattern.appendChild(image);
  
  let defs = document.createElementNS(svgNS, "defs");
  defs.appendChild(pattern);
  board.appendChild(defs);
  
  let background = document.createElementNS(svgNS, "rect");
  background.setAttribute('width', '100%');
  background.setAttribute('height', '100%');
  background.setAttribute('fill', 'url(#woodPattern)');
  board.insertBefore(background, board.firstChild);

  // Draw the board edge
  let edge = document.createElementNS(svgNS, "rect");
  edge.setAttribute('x', 0); // The x position of the rectangle
  edge.setAttribute('y', 0); // The y position of the rectangle
  edge.setAttribute('width', (2 * edgeMargin) + ((size - 1) * lengthSquare)); // The width of the rectangle
  edge.setAttribute('height', (2 * edgeMargin) + ((size - 1) * lengthSquare)); // The height of the rectangle
  edge.setAttribute('stroke', 'black'); // The edge color
  edge.setAttribute('fill', 'none'); // No fill to make it transparent inside
  edge.setAttribute('stroke-width', '2'); // The width of the border lines
  board.appendChild(edge);	
	
	// Draw the board lines
	for (let i = 0; i <= size - 1; i++) {
		// Horizontal lines
		let hLine = document.createElementNS(svgNS, "line");
		hLine.setAttribute('x1', edgeMargin);
		hLine.setAttribute('y1', edgeMargin + i * lengthSquare);
		hLine.setAttribute('x2', (size - 1) * lengthSquare + edgeMargin);
		hLine.setAttribute('y2', edgeMargin + i * lengthSquare);
		hLine.setAttribute('stroke', 'black');
		board.appendChild(hLine);

		// Vertical lines
		let vLine = document.createElementNS(svgNS, "line");
		vLine.setAttribute('x1', edgeMargin + i * lengthSquare);
		vLine.setAttribute('y1', edgeMargin);
		vLine.setAttribute('x2', edgeMargin + i * lengthSquare);
		vLine.setAttribute('y2', (size - 1) * lengthSquare + edgeMargin);
		vLine.setAttribute('stroke', 'black');
		board.appendChild(vLine);
	}

	// Create the coordinate labels
	const alphabet = "ABCDEFGHJKLMNOPQRSTUVWXYZ";
	const offset = (edgeMargin / 2) - 2; // Adjust this value if necessary for positioning
	const fontSize = 10; // Adjust font size as needed
	const textStyle = `font-size: ${fontSize}px; font-family: Arial;`;
	
	// Add letters on the top
	for (let i = 0; i < size; i++) {
		let textTop = document.createElementNS(svgNS, "text");
		textTop.setAttribute('x', edgeMargin + i * lengthSquare);
		textTop.setAttribute('y', edgeMargin - offset);
		textTop.setAttribute('text-anchor', 'middle');
		textTop.setAttribute('style', textStyle);
		textTop.textContent = alphabet[i];
		board.appendChild(textTop);
	}

 	// Add numbers on the left
 	for (let i = 0; i < size; i++) {
		let textLeft = document.createElementNS(svgNS, "text");
		textLeft.setAttribute('x', edgeMargin - offset);
		textLeft.setAttribute('y', 3 + edgeMargin + i * lengthSquare); // +3 is for better aliment
		textLeft.setAttribute('text-anchor', 'middle');
		textLeft.setAttribute('style', textStyle);
		textLeft.textContent = size - i; // Numbers go in reverse for Go boards
		board.appendChild(textLeft);
	}
	
	// Draw the Hoshi (star) points for 9x9, 13x13, and 19x19 boards
  const hoshiPoints = {
    9: [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]],
    13: [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]],
    19: [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]],
  };

  // Check if we have predefined hoshi points for the current board size
  if (hoshiPoints[size]) {
    hoshiPoints[size].forEach(point => {
      let hoshi = document.createElementNS(svgNS, 'circle');
      let [x, y] = point.map(coord => edgeMargin + coord * lengthSquare);
      hoshi.setAttribute('cx', x);
      hoshi.setAttribute('cy', y);
      hoshi.setAttribute('r', 3); // Radius of the hoshi point, adjust as needed
      hoshi.setAttribute('fill', 'black');
      board.appendChild(hoshi);
    });
  }



	// Append the SVG to the container
	document.getElementById('boardContainer').appendChild(board);
} 

