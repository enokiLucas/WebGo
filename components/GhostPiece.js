import { LENGTH_SQUARE, SVG_NS } from '../utils/constants.js';

class GhostPiece extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.ghostPiece = null
		this.createGhostPiece();
	}

	createGhostPiece() {
		const svg = document.createElementNS(SVG_NS, 'svg');
		svg.setAttribute('width', '100%');
		svg.setAttribute('height', '100%');

		this.ghostPiece = document.createElementNS(SVG_NS, "circle");
		this.ghostPiece.setAttribute('r', LENGTH_SQUARE / 2); // Radius of the ghost piece
		this.ghostPiece.setAttribute('fill', 'black'); // Semi-transparent fill
		this.ghostPiece.setAttribute('fill-opacity', '0.5'); // Adjust for desired transparency
		this.ghostPiece.style.visibility = 'hidden'; //Initially hidden

		svg.appendChild(this.ghostPiece);
		this.shadowRoot.appendChild(svg);

		console.log('hello createGhostPiece');
	}

	show(x, y) {
		this.ghostPiece.setAttribute('cx', x);
		this.ghostPiece.setAttribute('cy', y);
		this.ghostPiece.style.visibility = 'visible';

		console.log('hello show');
	}

	hide() {
		this.style.visibility = 'hidden';
	}
}

customElements.define('ghost-piece', GhostPiece);
