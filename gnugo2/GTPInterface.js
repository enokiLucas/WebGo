// Initialization flag to indicate when the module is ready
let moduleReady = false;
// Queue to store commands entered by the user.
let inputQueue = [];

// Function to initialize the GNUGo Module with GTP mode enabled
var Module = {
	arguments: ['--mode', 'gtp'],

	// Function to add commands to the queue.
	enqueueInput: function(text) {
		/* TEST the following is commented for testing porpusses.
		inputQueue.push(...text.split('').map(c => c.charCodeAt(0)));
		// Append a newline character to simulate pressing Enter.
		inputQueue.push(10);
		*/

		console.log(`Enqueuing command: ${text}`); // Log the command for testing
    inputQueue.push(...text.split('').map(c => c.charCodeAt(0)));
    // Append a newline character to simulate pressing Enter.
    inputQueue.push(10);
	},

	onRuntimeInitialized: function() {
		console.log("GNU Go WebAssembly module loaded successfully.");
		moduleReady = true; // Set the module as ready
	},

	// Override stdin to read from the input queue instead of prompting the user.
	stdin: function() {
		if (inputQueue.length > 0) {
			return inputQueue.shift();
		}
		return null;
	},

	// Custom print functions to handle standard output and errors
	print: function(text) {
		console.log('stdout: ' + text);
		handleNewResponse(text);
		console.log('hello form print');
	},
	printErr: function(text) {
		console.error('stderr: ' + text);
		handleNewResponse(`Error: ${text}`, true);
	},
};

// Function to handle new responses. This function can do anything you need,
// like updating the UI or logging to the console.
function handleNewResponse(message, isError = false) {
	// Log the message to the console. Use console.error for error messages.
	if (isError) {
		console.error(message);
	} else {
		console.log(message);
	}

	// Update the display with the latest response
	const responseElement = document.getElementById('gtpResponse');
	if (responseElement) {
		responseElement.textContent += message + '\n'; // Append new messages with a newline for readability.
	}
}

// Function to send GTP commands to GNU Go's WebAssembly Module
function sendGTPCommand() {
	if (!moduleReady) {
		console.error("GNU Go module or GTP command interface not ready.");
		return;
	}

	const commandInput = document.getElementById('gtpCommand');
	const command = commandInput.value.trim();

	if (command) {
		console.log(`Sending GTP command: ${command}`);
		Module.enqueueInput(command); //ALERT maybe in the future use (command + "\n") to append a new line
	} else {
		console.error("Invalid command format.");
	}

	commandInput.value = ''; // Clear the input field after enqueuing the command
}

// Ensure the sendGTPCommand function is called when the "Send Command" button is clicked
document.addEventListener('DOMContentLoaded', () => {
	const sendButton = document.getElementById('sendCommandButton');
	sendButton.addEventListener('click', sendGTPCommand);
});
