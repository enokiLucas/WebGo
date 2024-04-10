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

async function mainLoop() {
	while (true) {
		if (queueCommands.length > 0) {
			result = queueCommands.shift();
		}
		await new Promise(resolve => setTimeout(resolve,100));
	}
}

mainLoop().catch(console.error);
