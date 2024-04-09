let Module = {}; // Placeholder for the Emscripten module

// Queues for inputs and outputs
const inputQueue = [];
const outputQueue = [];

// Function to start the main loop
function startMainLoop() {
    async function mainLoop() {
        while (true) {
            if (inputQueue.length > 0) {
                Module.ccall('processNextInput', null, [], []);
            }
            await new Promise(resolve => setTimeout(resolve, 100)); // Wait asynchronously
        }
    }
    mainLoop().catch(console.error);
}

// Populate Module with functions needed for queue interaction
Module = {
    onRuntimeInitialized: function() {
        // Expose the startMainLoop function to Emscripten
        Module.startMainLoop = startMainLoop;
    },
    // JavaScript functions called from C
    pushOutput: function(output) {
        // Convert output pointer to string
        const outputStr = Module.UTF8ToString(output);
        outputQueue.push(outputStr);
        console.log("Output from WASM:", outputStr);
    },
    pullInput: function() {
        if (inputQueue.length === 0) return null;
        const input = inputQueue.shift();
        return allocateUTF8OnStack(input); // Convert string to pointer
    }
};

// Example of adding input to the queue
function addInputToQueue(input) {
    inputQueue.push(input);
}

// Example function to retrieve output from the queue
function getOutputFromQueue() {
    if (outputQueue.length > 0) {
        return outputQueue.shift();
    } else {
        return null;
    }
}

// Assume Module is initialized and the WASM module is loaded at this point
