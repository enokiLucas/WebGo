import { loadHTML } from '../../utils/HTMLLoader.js';
import { loadStyles } from '../../utils/StyleLoader.js';

class GameControlPanel extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.activeTab = 'starter-tab'; //Default active tab
	}

	async connectedCallback() {
		await loadHTML(this.shadowRoot, '../../assets/html/GameControlPanel.html');
		await loadStyles(this.shadowRoot, '../../assets/styles/GameControlPanel.css');
		this.switchTabs();
		this.activateDefaultTab();
	}

	switchTabs() {
		const tabs = this.shadowRoot.querySelectorAll('.tab');
		const tabContents = this.shadowRoot.querySelectorAll('.tab-content');

		tabs.forEach(tab => {
			tab.addEventListener('click', () => {
				// Remove active class from all tabs
				tabs.forEach(t => t.classList.remove('active'));

				// Add active class to clicked tab
				tab.classList.add('active');

				// Get the tab's data attribute
				const activeTab = tab.getAttribute('data-tab');

				// Hide all tab contents
				tabContents.forEach(content => {
						content.style.display = 'none';
				});

				// Show the active tab content
				const activeContent = this.shadowRoot.querySelector(`#${activeTab}`);
				if (activeContent) {
					activeContent.style.display = 'block';
				}

			});
		});
	}

	activateDefaultTab() {
		const defaultTab = this.shadowRoot.querySelector(`.tab[data-tab="${this.activeTab}"]`);
		const defaultTabContent = this.shadowRoot.querySelector(`#${this.activeTab}`);

		if (defaultTab && defaultTabContent) {
			defaultTab.classList.add('active');
			defaultTabContent.style.display = 'block';
		}
	}

}

customElements.define('game-control-panel', GameControlPanel);
