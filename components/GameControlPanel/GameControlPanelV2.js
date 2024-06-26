import { loadHTML } from '../../utils/HTMLLoader.js';
import { loadStyles } from '../../utils/StyleLoader.js';

class PanelRight extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
	}

	async connectedCallback() {
		await loadHTML(this.shadowRoot, '../../assets/html/GameControlPanelV2.html');
		await loadStyles(this.shadowRoot, '../../assets/styles/GameControlPanelV2.css');
		this.switchTabs();
	}

	switchTabs() {
		const tabs = this.shadowRoot.querySelectorAll(".tabs h3");
		const tabContents = this.shadowRoot.querySelectorAll(".tab-content .custom-tab");

		tabs.forEach((tab, index) => {
			tab.addEventListener("click", () => {
				tabContents.forEach(content => {
					content.classList.remove("active");
				});
				tabs.forEach((tab) => {
					tab.classList.remove("active");
				});
				tabContents[index].classList.add("active");
				tabs[index].classList.add("active");
			});
		});
	}
}

customElements.define('panel-right', PanelRight);
