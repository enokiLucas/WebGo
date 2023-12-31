import { gameStateManager } from '../services/GameStateManager.js';

class SGFDownloadButton extends HTMLElement {
	constructor() {
		super();

		// Attach a shadow root to the element.
		this.attachShadow({ mode: 'open' });

		// Create a button element
		const button = document.createElement('button');
		button.textContent = 'Download SGF';

		// Append the button to the shadow root
		this.shadowRoot.appendChild(button);

		// Bind the click event to the button
		button.addEventListener('click', this.downloadSGF.bind(this));
	}

	connectedCallback() {
		// Listen for board size change events
		document.addEventListener('board-create', (event) => {
			const newSize = event.detail.size;
			this.setAttribute('board-size', newSize);
		});
	}

	downloadSGF() {
		const sgfContent = this.generateSGFContent();
		const blob = new Blob([sgfContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'game.sgf'; // Customize the file name as needed
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	generateSGFContent() {
		const boardSize = this.getAttribute('board-size');
    const sgfHeader = `(;GM[1]FF[4]CA[UTF-8]SZ[${boardSize}]\n`;
    const sgfMoves = gameStateManager.getSGFMoves();
    return `${sgfHeader}${sgfMoves})`;
	}

	getSGFMoves() {
		return gameStateManager.getSGFMoves();
	}
}

customElements.define('sgf-download-button', SGFDownloadButton);
