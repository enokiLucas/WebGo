import { EDGE_MARGIN, LENGTH_SQUARE, ALPHABET, OFFSET, FONT_SIZE } from '.utils/constants.js';
//import { addListenersToBoard } from './IntersectionListeners.js';

class GoBoard extends HTMLElement {
  constructor() {
    super();
  	// Initialize any state or bind methods
    this.boardSize = 13; // Default board size or use attribute to set it
  }

  connectedCallback() {
    // Called when the element is inserted into the DOM
    this.initializeBoard(this.boardSize);
    addListenersToBoard(this, this.boardSize);
  }

  // You can use attributes to dynamically set properties like board size
  static get observedAttributes() {
    return ['size'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'size') {
      this.boardSize = parseInt(newValue);
      this.initializeBoard(this.boardSize);
    }
  }

  initializeBoard(size) {
    // Code to set up the board
    // This could call render function and any other setup required
    this.render(size);
  }

  render(size) {
    const svgNS = "http://www.w3.org/2000/svg";
    // Create SVG element and set attributes
    // Add background, lines, text, hoshi points, etc.
    // Append SVG to this shadow DOM or regular DOM

    // Example of creating an SVG element
    let board = document.createElementNS(svgNS, "svg");
    board.setAttribute('width', '100%');
    board.setAttribute('height', '100%');
    board.setAttribute('viewBox', `0 0 ${(size - 1) * LENGTH_SQUARE + (2 * EDGE_MARGIN)} ${(size - 1) * LENGTH_SQUARE + (2 * EDGE_MARGIN)}`);
    // ... rest of the rendering logic ...

  	// Append the board to the shadow DOM or regular DOM
    this.appendChild(board); // or this.shadowRoot.appendChild(board) if using Shadow DOM
  }

  // Additional methods related to board functionality
  // For example, method to update board state, handle user interactions, etc.
}

// Define the custom element
customElements.define('go-board', GoBoard);