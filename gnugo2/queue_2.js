const queueCommands = [];
const queueResponse = [];

const newCommand = document.addEventListener('new-gtp-command', (e) => {
	return e.detail;
})

function addInputToQueue(input) {
	inputQueue.push(input);
}

addInputToQueue(newCommand);

result = queueCommands.shift();
