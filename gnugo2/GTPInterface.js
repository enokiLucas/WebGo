// Define a global variable to store GTP command responses
let gtpResponses = [];

// Initialize the GNU Go WebAssembly module with a custom Module object
var Module = {
	// Specify GTP mode as a command-line argument
	arguments: ['--mode', 'gtp'],

	// This function is called once the module is fully initialized and ready
	onRuntimeInitialized: function() {
		console.log("GNU Go WebAssembly module loaded successfully.");
		// The module is now ready to receive GTP commands
	},

	// Override stdin to control how the module reads input
	// This is not directly used in our example since we're focusing on sending commands via the GTP interface
	stdin: function() {
		// This function could be implemented to read input if necessary for your application
	},

	// Override print to capture standard output from the GNU Go module
	print: function(text) {
		console.log('GNU Go says:', text);
		gtpResponses.push(text); // Store the response for later use
		updateResponseDisplay(); // Update the display with the new response
	},

	// Override printErr to capture error output from the GNU Go module
	printErr: function(text) {
		console.error('GNU Go error:', text);
		gtpResponses.push('Error: ' + text); // Store the error response
		updateResponseDisplay(); // Update the display with the new error message
	},
};

// Function to update the UI with the latest GTP responses
function updateResponseDisplay() {
	const gtpResponseElement = document.getElementById('gtpResponse');
	if (gtpResponseElement) {
		gtpResponseElement.textContent = gtpResponses.join('\n') + '\n';
	}
}

// Function to send a GTP command to the GNU Go module
function sendGTPCommand() {
	const commandInput = document.getElementById('gtpCommand');
	const command = commandInput.value.trim();

	if (command) {
		console.log(`Sending GTP command: ${command}`);
		// Normally, we'd send the command to GNU Go here. For this example, we simulate a response.
		// In a real implementation, you would use Module.ccall or another method to pass the command to the GNU Go module.
		// Example: Module.ccall('send_gtp_command', 'void', ['string'], [command]);
		Module.print(`Simulated response to '${command}'`);
	} else {
		console.error("No GTP command entered.");
	}

	commandInput.value = ''; // Clear the command input field
}

// Ensure the web page is fully loaded before setting up event listeners
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sendCommandButton').addEventListener('click', sendGTPCommand);
});
