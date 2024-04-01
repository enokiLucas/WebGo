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



	onRuntimeInitialized: function() {
		console.log("GNU Go WebAssembly module loaded successfully.");
		// Setup to interact with the WebAssembly module goes here
		// Now that the module is initialized, we can safely send commands
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

	print: function(text) {
		/*// Handle normal output from GNU Go
		console.log(text);
		gtpResponses.push(text);
		updateResponseDisplay(); // Update the display with the latest response*/
		handleNewResponse(text);
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
if (!Module.onRuntimeInitialized) {
        console.error("GNU Go module or GTP command interface not ready.");
        return;
    }

    const commandInput = document.getElementById('gtpCommand');
    const command = commandInput.value.trim();

    if (command) {
        console.log(`Sending GTP command: ${command}`);
        Module.enqueueInput(command + "\n"); // Ensure to append a newline to simulate pressing "Enter"
    } else {
        console.error("Invalid command format.");
    }

    commandInput.value = ''; // Clear the input field after enqueuing the command
}

// Define a function to handle new responses. This function can do anything you need, like updating the UI or logging to the console.
function handleNewResponse(message, isError = false) {
    // Log the message to the console. Use console.error for error messages.
    if (isError) {
        console.error(message);
    } else {
        console.log(message);
    }

    // If you have a specific element in your HTML where you want to display these messages, update it here.
    const responseElement = document.getElementById('gtpResponse');
    if(responseElement) {
        responseElement.textContent += message + '\n'; // Append new messages with a newline for readability.
    }

    // If you need to do more with the messages, like parsing GTP responses, you can add that logic here.
}

// Ensure the sendGTPCommand function is called when the "Send Command" button is clicked
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sendCommandButton').addEventListener('click', sendGTPCommand);
});

