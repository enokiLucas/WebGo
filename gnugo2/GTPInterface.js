// Updated GTPInterface.js

let gtpResponses = [];

// Function to initialize the GNUGo Module with GTP mode enabled
var Module = {
	arguments: ['--mode', 'gtp'],

	// Queue to store commands entered by the user.
	inputQueue: [],

	// Function to add commands to the queue.
	enqueueInput: function(text) {
		this.inputQueue.push(...text.split('').map(c => c.charCodeAt(0)));
		// Append a newline character to simulate pressing Enter.
		this.inputQueue.push(10);
	},

	// Override stdin to read from the input queue instead of prompting the user.
	stdin: function() {
		if (this.inputQueue.length > 0) {
			return this.inputQueue.shift();
		}
		// Returning null or undefined may cause the program to wait for more input.
		// You can modify this behavior based on how you want to handle the absence of input.
		return null;
	},

	onRuntimeInitialized: function() {
		console.log("GNU Go WebAssembly module loaded successfully.");
		// Setup to interact with the WebAssembly module goes here
		// Now that the module is initialized, we can safely send commands
	},

	print: function(text) {
		// Handle normal output from GNU Go
		console.log(text);
		gtpResponses.push(text);
		updateResponseDisplay(); // Update the display with the latest response
	},

	printErr: function(text) {
		// Handle error output from GNU Go
		console.error(text);
		gtpResponses.push(`Error: ${text}`);
		updateResponseDisplay(); // Update the display with error messages
	}
};

// Since we're directly interacting with the Module.print and Module.printErr,
// let's create a function to update the display with the contents of gtpResponses
function updateResponseDisplay() {
	const gtpResponseElement = document.getElementById('gtpResponse');
	gtpResponseElement.textContent = gtpResponses.join('\n') + '\n';
}

// Modified sendGTPCommand to interface with GNU Go's WebAssembly Module
function sendGTPCommand() {
	const commandInput = document.getElementById('gtpCommand');
	const command = commandInput.value.trim();

	if (!command) {
		console.log('Please enter a GTP command.');
		return;
	}

	console.log(`Sending GTP command: ${command}`);
	// Instead of directly pushing to gtpResponses, we send the command to GNU Go
	// This example assumes you have a function to send commands to GNU Go's stdin
	if (Module.ccall) {
		// Assume 'send_gtp_command' is a function exposed by the GNUGo WASM to accept GTP commands
		Module.ccall('send_gtp_command', 'void', ['string'], [command]);
	} else {
		console.error('GNU Go module or GTP command interface not ready.');
	}

	commandInput.value = ''; // Clear the input field after sending the command
}

// Ensure the sendGTPCommand function is called when the "Send Command" button is clicked
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sendCommandButton').addEventListener('click', sendGTPCommand);
});

