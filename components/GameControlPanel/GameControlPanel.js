// Import tab components
import './tabs/TestTab.js';

class GameControlPanel extends HTMLElement {
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
                /* Styles for your GameControlPanel */
                .panel {
                    /* Panel styles */
                }
                .tab {
                    /* Tab styles */
                }
            </style>
            <div class="panel">
                <test-tab></test-tab>
                <!-- More tabs will be added here in the future -->
            </div>
        `;
    }
}

customElements.define('game-control-panel', GameControlPanel);
