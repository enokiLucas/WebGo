let gtpResponses = [];
let commandQueue = [];
let isProcessingCommand = false;

var Module = {
	arguments: ['--mode', 'gtp'],
	onRuntimeInitialized: function() {
		console.log("GNU Go WebAssembly module loaded successfully.");
		processNextCommand(); // Start processing commands if any
	},
	print: function(text) {
		console.log('stdout: ', text);
		handleNewResponse(text);
		isProcessingCommand = false; // Command processing finished, ready for next command
		processNextCommand(); // Process the next command in the queue
	},
	printErr: function(text) {
		console.error('stderr: ', text);
		handleNewResponse(`Error: ${text}`, true);
		isProcessingCommand = false; // Even on error, ready for next command
		processNextCommand(); // Continue with next command
	},
	stdin: function() {
		if (!commandQueue.length) {
			return null;
		}
		if (!isProcessingCommand) {
			isProcessingCommand = true; // Mark as processing
			const commandAscii = commandQueue.shift(); // Get the next command
			return commandAscii.shift(); // Return the first character of the command
		}
		return null;
	}
};

function enqueueCommand(command) {
	// Split the command into ASCII codes and add a newline character
	const commandAscii = command.split('').map(c => c.charCodeAt(0)).concat(10);
	commandQueue.push(commandAscii); // Enqueue the ASCII command
	if (!isProcessingCommand) {
		processNextCommand(); // Immediately try processing if not already
	}
}

function processNextCommand() {
	// Check if ready to process next command
	if (commandQueue.length > 0 && !isProcessingCommand) {
		Module.stdin(); // Trigger stdin to process the next command
	}
}

function sendGTPCommand() {
	const commandInput = document.getElementById('gtpCommand');
	const command = commandInput.value.trim();
	if (command) {
		console.log(`Enqueuing GTP command: ${command}`);
		enqueueCommand(command);
	} else {
		console.error("Invalid command format.");
	}
	commandInput.value = ''; // Clear the input after enqueuing
}

function handleNewResponse(message, isError = false) {
	const responseElement = document.getElementById('gtpResponse');
	const responseText = isError ? `Error: ${message}` : message;
	console.log(responseText); // Log to console
	if (responseElement) {
		responseElement.textContent += `${responseText}\n`;
	}
}

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sendCommandButton').addEventListener('click', sendGTPCommand);
});
