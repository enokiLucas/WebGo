self.importScripts('type003/gnugo.js');

self.onmessage = function(e) {
	if (e.data.command === 'start') {
		Module.doRun; // Assuming Module is set up in gnugo.js
	}
};
