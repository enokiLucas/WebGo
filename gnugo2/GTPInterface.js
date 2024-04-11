// GTPInterface.js

// Assuming Module is globally available
var Module = {


	/*print: function(text) {
		console.log('Hello from print: '+text); // You can handle regular output here
	},*/

	printErr: function(text) {
		console.error(text); // Handle error output here
	},

	onRuntimeInitialized: function() {
		console.log("GNU Go WebAssembly module loaded successfully.");
	}
};

// Enqueue inputs from the text box to the Module's inputQueue
function enqueueInputFromTextBox() {
	const commandInput = document.getElementById('gtpCommand');
	const command = commandInput.value.trim() + "\n"; // Include newline to simulate Enter
	commandInput.value = ''; // Clear the command input box

	//console.log('Hello from interface: ' + command); //TEST

	// Convert command string to ASCII values and enqueue them
	/*for (let i = 0; i < command.length; i++) {
		Module.inputQueue.push(command.charCodeAt(i));
	}*/

	//console.log(`Enqueued command: ${command.trim()}`);
	const gtpCommand = new CustomEvent('new-gtp-command', {
		detail: command
	});
	document.dispatchEvent(gtpCommand);

}

// Set up event listeners once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('sendCommandButton').addEventListener('click', enqueueInputFromTextBox);
});
