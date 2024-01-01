// Import button components
import '../../BoardButtonSize.js';
import '../../SGFDownloadButton.js';

class TestTab extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                /* Styles for your TestTab */
            </style>
            <div>
                <board-button-size board-size="9"></board-button-size>
                <board-button-size board-size="13"></board-button-size>
                <board-button-size board-size="19"></board-button-size>
                <sgf-download-button></sgf-download-button>
            </div>
        `;
    }
}

customElements.define('test-tab', TestTab);
