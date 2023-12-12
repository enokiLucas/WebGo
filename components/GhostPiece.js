import { LENGTH_SQUARE, SVG_NS } from '../utils/constants.js';

class GhostPiece extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.createGhostPiece();
	}

	connectedCallback() {
		this.style.visibility = 'hidden'; // Initially hidden
	}

	createGhostPiece() {
		const ghostPiece = document.createElementNS(SVG_NS, "circle");
		ghostPiece.setAttribute('r', LENGTH_SQUARE / 2); // Radius of the ghost piece
		ghostPiece.setAttribute('fill', 'black'); // Semi-transparent fill
		ghostPiece.setAttribute('fill-opacity', '0.5'); // Adjust for desired transparency
		ghostPiece.style.visibility = 'hidden'; //Initially hidden

		this.shadowRoot.appendChild(ghostPiece);
	}

	show(x, y) {
		this.style.visibility = 'visible';
		this.style.cx = x;
		this.style.cy = y;
	}

	hide() {
		this.style.visibility = 'hidden';
	}
}

customElements.define('ghost-piece', GhostPiece);
