import { SVG_NS } from '../utils/constants.js';

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
		const ghostPiece = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		ghostPiece.setAttribute('r', 10); // Radius of the ghost piece
		ghostPiece.setAttribute('fill', 'gray'); // Semi-transparent fill
		ghostPiece.setAttribute('fill-opacity', '0.5'); // Adjust for desired transparency

		const style = document.createElement('style');
		style.textContent = `
			circle {
			visibility: hidden; /* Initially hidden */
		}`;

		this.shadowRoot.appendChild(style);
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
