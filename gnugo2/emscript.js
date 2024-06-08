
var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var spinnerElement = document.getElementById('spinner');

var Module = {
		arguments: ['--mode', 'gtp'],

		print: (function() {
				var element = document.getElementById('output');
				if (element) element.value = ''; // clear browser cache
				return (...args) => {
						var text = args.join(' ');
						// These replacements are necessary if you render to raw HTML
						//text = text.replace(/&/g, "&amp;");
						//text = text.replace(/</g, "&lt;");
						//text = text.replace(/>/g, "&gt;");
						//text = text.replace('\n', '<br>', 'g');
						console.log(text);
						if (element) {
								element.value += text + "\n";
								element.scrollTop = element.scrollHeight; // focus on bottom
						}
				};
		})(),

		setStatus: (text) => {
				if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
				if (text === Module.setStatus.last.text) return;
				var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
				var now = Date.now();
				if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
				Module.setStatus.last.time = now;
				Module.setStatus.last.text = text;
		},
		totalDependencies: 0,
		monitorRunDependencies: (left) => {
				this.totalDependencies = Math.max(this.totalDependencies, left);
				Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
		}
};
Module.setStatus('Downloading...');
window.onerror = (event) => {
		// TODO: do not warn on ok events like simulating an infinite loop or exitStatus
		Module.setStatus('Exception thrown, see JavaScript console');
		spinnerElement.style.display = 'none';
		Module.setStatus = (text) => {
				if (text) console.error('[post-exception status] ' + text);
		};
};
