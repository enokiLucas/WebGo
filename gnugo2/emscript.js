var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');
var spinnerElement = document.getElementById('spinner');

var Module = {
	noInitialRun: false, // Prevent the main function from running automatically
	preRun: [],
	postRun: [],
	// Function to explicitly start the module processing
	startModule: function() {
		if (!Module.calledRun) {
			console.log("Module is already running or completed.");
			return;
		}
		console.log("Starting module...");
		run; // This starts the main function of the module
	},

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
		//spinnerElement.style.display = 'none';
		Module.setStatus = (text) => {
			if (text) console.error('[post-exception status] ' + text);
		};
};
/*
document.getElementById('startModuleButton').addEventListener('click', function() {
	loadGnuGoModule();
});

function loadGnuGoModule() {

	// Remove existing script if it exists
	const existingScript = document.querySelector('script[src="type003/gnugo.js"]');
	if (existingScript) {
		existingScript.parentNode.removeChild(existingScript);
	}

	// Create new script
	var script = document.createElement('script');
	script.src = "type003/gnugo.js";
	script.type = 'text/javascript';
	script.async = true;

	script.onload = function() {
		console.log("GNU Go module loaded successfully.");
		// Call any initial setup functions here, if necessary
		if (Module && typeof Module.onRuntimeInitialized === 'function') {
			Module.onRuntimeInitialized();
		}
	};

	script.onerror = function() {
		console.error("Failed to load the GNU Go module.");
	};

	document.body.appendChild(script);
}
*/

let worker;

document.getElementById('startModuleButton').addEventListener('click', () => {
	if (worker) {
		worker.terminate(); // Terminate the existing worker
	}

	worker = new Worker('worker.js');

	worker.onmessage = function(e) {
		console.log('Message from Worker:', e.data);
	};

	worker.onerror = function(e) {
		console.error('Error from Worker:', e.message);
	};

	// Start the module within the worker
	worker.postMessage({ command: 'start' });
});
