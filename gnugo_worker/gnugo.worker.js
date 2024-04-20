// include: shell.js
// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module != 'undefined' ? Module : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)


// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = Object.assign({}, Module);

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = (status, toThrow) => {
	throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

// Attempt to auto-detect the environment
var ENVIRONMENT_IS_WEB = typeof window == 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts == 'function';
// N.b. Electron.js environment is simultaneously a NODE-environment, but
// also a web environment.
var ENVIRONMENT_IS_NODE = typeof process == 'object' && typeof process.versions == 'object' && typeof process.versions.node == 'string';
var ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;

// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
	if (Module['locateFile']) {
		return Module['locateFile'](path, scriptDirectory);
	}
	return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
		readAsync,
		readBinary;

if (ENVIRONMENT_IS_NODE) {

	// `require()` is no-op in an ESM module, use `createRequire()` to construct
	// the require()` function.  This is only necessary for multi-environment
	// builds, `-sENVIRONMENT=node` emits a static import declaration instead.
	// TODO: Swap all `require()`'s with `import()`'s?
	// These modules will usually be used on Node.js. Load them eagerly to avoid
	// the complexity of lazy-loading.
	var fs = require('fs');
	var nodePath = require('path');

	if (ENVIRONMENT_IS_WORKER) {
		scriptDirectory = nodePath.dirname(scriptDirectory) + '/';
	} else {
		scriptDirectory = __dirname + '/';
	}

// include: node_shell_read.js
read_ = (filename, binary) => {
	// We need to re-wrap `file://` strings to URLs. Normalizing isn't
	// necessary in that case, the path should already be absolute.
	filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
	return fs.readFileSync(filename, binary ? undefined : 'utf8');
};

readBinary = (filename) => {
	var ret = read_(filename, true);
	if (!ret.buffer) {
		ret = new Uint8Array(ret);
	}
	return ret;
};

readAsync = (filename, onload, onerror, binary = true) => {
	// See the comment in the `read_` function.
	filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
	fs.readFile(filename, binary ? undefined : 'utf8', (err, data) => {
		if (err) onerror(err);
		else onload(binary ? data.buffer : data);
	});
};
// end include: node_shell_read.js
	if (!Module['thisProgram'] && process.argv.length > 1) {
		thisProgram = process.argv[1].replace(/\\/g, '/');
	}

	arguments_ = process.argv.slice(2);

	if (typeof module != 'undefined') {
		module['exports'] = Module;
	}

	process.on('uncaughtException', (ex) => {
		// suppress ExitStatus exceptions from showing an error
		if (ex !== 'unwind' && !(ex instanceof ExitStatus) && !(ex.context instanceof ExitStatus)) {
			throw ex;
		}
	});

	quit_ = (status, toThrow) => {
		process.exitCode = status;
		throw toThrow;
	};

} else

// Note that this includes Node.js workers when relevant (pthreads is enabled).
// Node.js workers are detected as a combination of ENVIRONMENT_IS_WORKER and
// ENVIRONMENT_IS_NODE.
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
	if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
		scriptDirectory = self.location.href;
	} else if (typeof document != 'undefined' && document.currentScript) { // web
		scriptDirectory = document.currentScript.src;
	}
	// blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
	// otherwise, slice off the final part of the url to find the script directory.
	// if scriptDirectory does not contain a slash, lastIndexOf will return -1,
	// and scriptDirectory will correctly be replaced with an empty string.
	// If scriptDirectory contains a query (starting with ?) or a fragment (starting with #),
	// they are removed because they could contain a slash.
	if (scriptDirectory.startsWith('blob:')) {
		scriptDirectory = '';
	} else {
		scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, '').lastIndexOf('/')+1);
	}

	// Differentiate the Web Worker from the Node Worker case, as reading must
	// be done differently.
	{
// include: web_or_worker_shell_read.js
read_ = (url) => {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, false);
		xhr.send(null);
		return xhr.responseText;
	}

	if (ENVIRONMENT_IS_WORKER) {
		readBinary = (url) => {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', url, false);
			xhr.responseType = 'arraybuffer';
			xhr.send(null);
			return new Uint8Array(/** @type{!ArrayBuffer} */(xhr.response));
		};
	}

	readAsync = (url, onload, onerror) => {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.responseType = 'arraybuffer';
		xhr.onload = () => {
			if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
				onload(xhr.response);
				return;
			}
			onerror();
		};
		xhr.onerror = onerror;
		xhr.send(null);
	}

// end include: web_or_worker_shell_read.js
	}
} else
{
}

var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.error.bind(console);

// Merge back in the overrides
Object.assign(Module, moduleOverrides);
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.

if (Module['arguments']) arguments_ = Module['arguments'];

if (Module['thisProgram']) thisProgram = Module['thisProgram'];

if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message
// end include: shell.js

// include: preamble.js
// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html

var wasmBinary; 
if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];

// Wasm globals

var wasmMemory;

//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS;

// In STRICT mode, we only define assert() when ASSERTIONS is set.  i.e. we
// don't define it at all in release modes.  This matches the behaviour of
// MINIMAL_RUNTIME.
// TODO(sbc): Make this the default even without STRICT enabled.
/** @type {function(*, string=)} */
function assert(condition, text) {
	if (!condition) {
		// This build was created without ASSERTIONS defined.  `assert()` should not
		// ever be called in this configuration but in case there are callers in
		// the wild leave this simple abort() implementation here for now.
		abort(text);
	}
}

// Memory management

var HEAP,
/** @type {!Int8Array} */
	HEAP8,
/** @type {!Uint8Array} */
	HEAPU8,
/** @type {!Int16Array} */
	HEAP16,
/** @type {!Uint16Array} */
	HEAPU16,
/** @type {!Int32Array} */
	HEAP32,
/** @type {!Uint32Array} */
	HEAPU32,
/** @type {!Float32Array} */
	HEAPF32,
/** @type {!Float64Array} */
	HEAPF64;

// include: runtime_shared.js
function updateMemoryViews() {
	var b = wasmMemory.buffer;
	Module['HEAP8'] = HEAP8 = new Int8Array(b);
	Module['HEAP16'] = HEAP16 = new Int16Array(b);
	Module['HEAPU8'] = HEAPU8 = new Uint8Array(b);
	Module['HEAPU16'] = HEAPU16 = new Uint16Array(b);
	Module['HEAP32'] = HEAP32 = new Int32Array(b);
	Module['HEAPU32'] = HEAPU32 = new Uint32Array(b);
	Module['HEAPF32'] = HEAPF32 = new Float32Array(b);
	Module['HEAPF64'] = HEAPF64 = new Float64Array(b);
}
// end include: runtime_shared.js
// include: runtime_stack_check.js
// end include: runtime_stack_check.js
// include: runtime_assertions.js
// end include: runtime_assertions.js
var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;

function preRun() {
	if (Module['preRun']) {
		if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
		while (Module['preRun'].length) {
			addOnPreRun(Module['preRun'].shift());
		}
	}
	callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
	runtimeInitialized = true;


if (!Module['noFSInit'] && !FS.init.initialized)
	FS.init();
FS.ignorePermissions = false;

TTY.init();
SOCKFS.root = FS.mount(SOCKFS, {}, null);
	callRuntimeCallbacks(__ATINIT__);
}

function preMain() {

	callRuntimeCallbacks(__ATMAIN__);
}

function postRun() {

	if (Module['postRun']) {
		if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
		while (Module['postRun'].length) {
			addOnPostRun(Module['postRun'].shift());
		}
	}

	callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
	__ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
	__ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
	__ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
	__ATPOSTRUN__.unshift(cb);
}

// include: runtime_math.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc

// end include: runtime_math.js
// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
	return id;
}

function addRunDependency(id) {
	runDependencies++;

	Module['monitorRunDependencies']?.(runDependencies);

}

function removeRunDependency(id) {
	runDependencies--;

	Module['monitorRunDependencies']?.(runDependencies);

	if (runDependencies == 0) {
		if (runDependencyWatcher !== null) {
			clearInterval(runDependencyWatcher);
			runDependencyWatcher = null;
		}
		if (dependenciesFulfilled) {
			var callback = dependenciesFulfilled;
			dependenciesFulfilled = null;
			callback(); // can add another dependenciesFulfilled
		}
	}
}

/** @param {string|number=} what */
function abort(what) {
	Module['onAbort']?.(what);

	what = 'Aborted(' + what + ')';
	// TODO(sbc): Should we remove printing and leave it up to whoever
	// catches the exception?
	err(what);

	ABORT = true;
	EXITSTATUS = 1;

	what += '. Build with -sASSERTIONS for more info.';

	// Use a wasm runtime error, because a JS error might be seen as a foreign
	// exception, which means we'd run destructors on it. We need the error to
	// simply make the program stop.
	// FIXME This approach does not work in Wasm EH because it currently does not assume
	// all RuntimeErrors are from traps; it decides whether a RuntimeError is from
	// a trap or not based on a hidden field within the object. So at the moment
	// we don't have a way of throwing a wasm trap from JS. TODO Make a JS API that
	// allows this in the wasm spec.

	// Suppress closure compiler warning here. Closure compiler's builtin extern
	// definition for WebAssembly.RuntimeError claims it takes no arguments even
	// though it can.
	// TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure gets fixed.
	/** @suppress {checkTypes} */
	var e = new WebAssembly.RuntimeError(what);

	// Throw the error whether or not MODULARIZE is set because abort is used
	// in code paths apart from instantiation where an exception is expected
	// to be thrown when abort is called.
	throw e;
}

// include: memoryprofiler.js
// end include: memoryprofiler.js
// include: URIUtils.js
// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

/**
* Indicates whether filename is a base64 data URI.
* @noinline
*/
var isDataURI = (filename) => filename.startsWith(dataURIPrefix);

/**
* Indicates whether filename is delivered via file protocol (as opposed to http/https)
* @noinline
*/
var isFileURI = (filename) => filename.startsWith('file://');
// end include: URIUtils.js
// include: runtime_exceptions.js
// end include: runtime_exceptions.js
var wasmBinaryFile;
	wasmBinaryFile = 'gnugo.wasm';
	if (!isDataURI(wasmBinaryFile)) {
		wasmBinaryFile = locateFile(wasmBinaryFile);
	}

function getBinarySync(file) {
	if (file == wasmBinaryFile && wasmBinary) {
		return new Uint8Array(wasmBinary);
	}
	if (readBinary) {
		return readBinary(file);
	}
	throw 'both async and sync fetching of the wasm failed';
}

function getBinaryPromise(binaryFile) {
	// If we don't have the binary yet, try to load it asynchronously.
	// Fetch has some additional restrictions over XHR, like it can't be used on a file:// url.
	// See https://github.com/github/fetch/pull/92#issuecomment-140665932
	// Cordova or Electron apps are typically loaded from a file:// url.
	// So use fetch if it is available and the url is not a file, otherwise fall back to XHR.
	if (!wasmBinary
			&& (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
		if (typeof fetch == 'function'
			&& !isFileURI(binaryFile)
		) {
			return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
				if (!response['ok']) {
					throw `failed to load wasm binary file at '${binaryFile}'`;
				}
				return response['arrayBuffer']();
			}).catch(() => getBinarySync(binaryFile));
		}
		else if (readAsync) {
			// fetch is not available or url is file => try XHR (readAsync uses XHR internally)
			return new Promise((resolve, reject) => {
				readAsync(binaryFile, (response) => resolve(new Uint8Array(/** @type{!ArrayBuffer} */(response))), reject)
			});
		}
	}

	// Otherwise, getBinarySync should be able to get it synchronously
	return Promise.resolve().then(() => getBinarySync(binaryFile));
}

function instantiateArrayBuffer(binaryFile, imports, receiver) {
	return getBinaryPromise(binaryFile).then((binary) => {
		return WebAssembly.instantiate(binary, imports);
	}).then(receiver, (reason) => {
		err(`failed to asynchronously prepare wasm: ${reason}`);

		abort(reason);
	});
}

function instantiateAsync(binary, binaryFile, imports, callback) {
	if (!binary &&
			typeof WebAssembly.instantiateStreaming == 'function' &&
			!isDataURI(binaryFile) &&
			// Don't use streaming for file:// delivered objects in a webview, fetch them synchronously.
			!isFileURI(binaryFile) &&
			// Avoid instantiateStreaming() on Node.js environment for now, as while
			// Node.js v18.1.0 implements it, it does not have a full fetch()
			// implementation yet.
			//
			// Reference:
			//   https://github.com/emscripten-core/emscripten/pull/16917
			!ENVIRONMENT_IS_NODE &&
			typeof fetch == 'function') {
		return fetch(binaryFile, { credentials: 'same-origin' }).then((response) => {
			// Suppress closure warning here since the upstream definition for
			// instantiateStreaming only allows Promise<Repsponse> rather than
			// an actual Response.
			// TODO(https://github.com/google/closure-compiler/pull/3913): Remove if/when upstream closure is fixed.
			/** @suppress {checkTypes} */
			var result = WebAssembly.instantiateStreaming(response, imports);

			return result.then(
				callback,
				function(reason) {
					// We expect the most common failure cause to be a bad MIME type for the binary,
					// in which case falling back to ArrayBuffer instantiation should work.
					err(`wasm streaming compile failed: ${reason}`);
					err('falling back to ArrayBuffer instantiation');
					return instantiateArrayBuffer(binaryFile, imports, callback);
				});
		});
	}
	return instantiateArrayBuffer(binaryFile, imports, callback);
}

// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
	// prepare imports
	var info = {
		'env': wasmImports,
		'wasi_snapshot_preview1': wasmImports,
	};
	// Load the wasm module and create an instance of using native support in the JS engine.
	// handle a generated wasm instance, receiving its exports and
	// performing other necessary setup
	/** @param {WebAssembly.Module=} module*/
	function receiveInstance(instance, module) {
		wasmExports = instance.exports;



		wasmMemory = wasmExports['memory'];

		updateMemoryViews();

		addOnInit(wasmExports['__wasm_call_ctors']);

		removeRunDependency('wasm-instantiate');
		return wasmExports;
	}
	// wait for the pthread pool (if any)
	addRunDependency('wasm-instantiate');

	// Prefer streaming instantiation if available.
	function receiveInstantiationResult(result) {
		// 'result' is a ResultObject object which has both the module and instance.
		// receiveInstance() will swap in the exports (to Module.asm) so they can be called
		// TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
		// When the regression is fixed, can restore the above PTHREADS-enabled path.
		receiveInstance(result['instance']);
	}

	// User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
	// to manually instantiate the Wasm module themselves. This allows pages to
	// run the instantiation parallel to any other async startup actions they are
	// performing.
	// Also pthreads and wasm workers initialize the wasm instance through this
	// path.
	if (Module['instantiateWasm']) {

		try {
			return Module['instantiateWasm'](info, receiveInstance);
		} catch(e) {
			err(`Module.instantiateWasm callback failed with error: ${e}`);
				return false;
		}
	}

	instantiateAsync(wasmBinary, wasmBinaryFile, info, receiveInstantiationResult);
	return {}; // no exports yet; we'll fill them in later
}

// Globals used by JS i64 conversions (see makeSetValue)
var tempDouble;
var tempI64;

// include: runtime_debug.js
// end include: runtime_debug.js
// === Body ===
// end include: preamble.js


	var _emscripten_set_main_loop_timing = (mode, value) => {
			Browser.mainLoop.timingMode = mode;
			Browser.mainLoop.timingValue = value;

			if (!Browser.mainLoop.func) {
				return 1; // Return non-zero on failure, can't set timing mode when there is no main loop.
			}

			if (!Browser.mainLoop.running) {

				Browser.mainLoop.running = true;
			}
			if (mode == 0) {
				Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setTimeout() {
					var timeUntilNextTick = Math.max(0, Browser.mainLoop.tickStartTime + value - _emscripten_get_now())|0;
					setTimeout(Browser.mainLoop.runner, timeUntilNextTick); // doing this each time means that on exception, we stop
				};
				Browser.mainLoop.method = 'timeout';
			} else if (mode == 1) {
				Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_rAF() {
					Browser.requestAnimationFrame(Browser.mainLoop.runner);
				};
				Browser.mainLoop.method = 'rAF';
			} else if (mode == 2) {
				if (typeof Browser.setImmediate == 'undefined') {
					if (typeof setImmediate == 'undefined') {
						// Emulate setImmediate. (note: not a complete polyfill, we don't emulate clearImmediate() to keep code size to minimum, since not needed)
						var setImmediates = [];
						var emscriptenMainLoopMessageId = 'setimmediate';
						/** @param {Event} event */
						var Browser_setImmediate_messageHandler = (event) => {
							// When called in current thread or Worker, the main loop ID is structured slightly different to accommodate for --proxy-to-worker runtime listening to Worker events,
							// so check for both cases.
							if (event.data === emscriptenMainLoopMessageId || event.data.target === emscriptenMainLoopMessageId) {
								event.stopPropagation();
								setImmediates.shift()();
							}
						};
						addEventListener("message", Browser_setImmediate_messageHandler, true);
						Browser.setImmediate = /** @type{function(function(): ?, ...?): number} */(function Browser_emulated_setImmediate(func) {
							setImmediates.push(func);
							if (ENVIRONMENT_IS_WORKER) {
								if (Module['setImmediates'] === undefined) Module['setImmediates'] = [];
								Module['setImmediates'].push(func);
								postMessage({target: emscriptenMainLoopMessageId}); // In --proxy-to-worker, route the message via proxyClient.js
							} else postMessage(emscriptenMainLoopMessageId, "*"); // On the main thread, can just send the message to itself.
						});
					} else {
						Browser.setImmediate = setImmediate;
					}
				}
				Browser.mainLoop.scheduler = function Browser_mainLoop_scheduler_setImmediate() {
					Browser.setImmediate(Browser.mainLoop.runner);
				};
				Browser.mainLoop.method = 'immediate';
			}
			return 0;
		};

	var _emscripten_get_now;
			// Modern environment where performance.now() is supported:
			// N.B. a shorter form "_emscripten_get_now = performance.now;" is
			// unfortunately not allowed even in current browsers (e.g. FF Nightly 75).
			_emscripten_get_now = () => performance.now();
	;


		/**
		* @param {number=} arg
		* @param {boolean=} noSetTiming
		*/
	var setMainLoop = (browserIterationFunc, fps, simulateInfiniteLoop, arg, noSetTiming) => {
			Browser.mainLoop.func = browserIterationFunc;
			Browser.mainLoop.arg = arg;

			// Closure compiler bug(?): Closure does not see that the assignment
			//   var thisMainLoopId = Browser.mainLoop.currentlyRunningMainloop
			// is a value copy of a number (even with the JSDoc @type annotation)
			// but optimizeis the code as if the assignment was a reference assignment,
			// which results in Browser.mainLoop.pause() not working. Hence use a
			// workaround to make Closure believe this is a value copy that should occur:
			// (TODO: Minimize this down to a small test case and report - was unable
			// to reproduce in a small written test case)
			/** @type{number} */
			var thisMainLoopId = (() => Browser.mainLoop.currentlyRunningMainloop)();
			function checkIsRunning() {
				if (thisMainLoopId < Browser.mainLoop.currentlyRunningMainloop) {

					return false;
				}
				return true;
			}

			// We create the loop runner here but it is not actually running until
			// _emscripten_set_main_loop_timing is called (which might happen a
			// later time).  This member signifies that the current runner has not
			// yet been started so that we can call runtimeKeepalivePush when it
			// gets it timing set for the first time.
			Browser.mainLoop.running = false;
			Browser.mainLoop.runner = function Browser_mainLoop_runner() { //ALERT exit condition
				if (ABORT) return;
				if (Browser.mainLoop.queue.length > 0) {
					var start = Date.now();
					var blocker = Browser.mainLoop.queue.shift();
					blocker.func(blocker.arg);
					if (Browser.mainLoop.remainingBlockers) {
						var remaining = Browser.mainLoop.remainingBlockers;
						var next = remaining%1 == 0 ? remaining-1 : Math.floor(remaining);
						if (blocker.counted) {
							Browser.mainLoop.remainingBlockers = next;
						} else {
							// not counted, but move the progress along a tiny bit
							next = next + 0.5; // do not steal all the next one's progress
							Browser.mainLoop.remainingBlockers = (8*remaining + next)/9;
						}
					}
					Browser.mainLoop.updateStatus();

					// catches pause/resume main loop from blocker execution
					if (!checkIsRunning()) return;

					setTimeout(Browser.mainLoop.runner, 0);
					return;
				}

				// catch pauses from non-main loop sources
				if (!checkIsRunning()) return;

				// Implement very basic swap interval control
				Browser.mainLoop.currentFrameNumber = Browser.mainLoop.currentFrameNumber + 1 | 0;
				if (Browser.mainLoop.timingMode == 1 && Browser.mainLoop.timingValue > 1 && Browser.mainLoop.currentFrameNumber % Browser.mainLoop.timingValue != 0) {
					// Not the scheduled time to render this frame - skip.
					Browser.mainLoop.scheduler();
					return;
				} else if (Browser.mainLoop.timingMode == 0) {
					Browser.mainLoop.tickStartTime = _emscripten_get_now();
				}

				// Signal GL rendering layer that processing of a new frame is about to start. This helps it optimize
				// VBO double-buffering and reduce GPU stalls.

				Browser.mainLoop.runIter(browserIterationFunc);

				// catch pauses from the main loop itself
				if (!checkIsRunning()) return;

				// Queue new audio data. This is important to be right after the main loop invocation, so that we will immediately be able
				// to queue the newest produced audio samples.
				// TODO: Consider adding pre- and post- rAF callbacks so that GL.newRenderingFrameStarted() and SDL.audio.queueNewAudioData()
				//       do not need to be hardcoded into this function, but can be more generic.
				if (typeof SDL == 'object') SDL.audio?.queueNewAudioData?.();

				Browser.mainLoop.scheduler();
			}

			if (!noSetTiming) {
				if (fps && fps > 0) {
					_emscripten_set_main_loop_timing(0, 1000.0 / fps);
				} else {
					// Do rAF by rendering each frame (no decimating)
					_emscripten_set_main_loop_timing(1, 1);
				}

				Browser.mainLoop.scheduler();
			}

			if (simulateInfiniteLoop) {
				throw 'unwind';
			}
		};

	var handleException = (e) => {
			// Certain exception types we do not treat as errors since they are used for
			// internal control flow.
			// 1. ExitStatus, which is thrown by exit()
			// 2. "unwind", which is thrown by emscripten_unwind_to_js_event_loop() and others
			//    that wish to return to JS event loop.
			if (e instanceof ExitStatus || e == 'unwind') {
				return EXITSTATUS;
			}
			quit_(1, e);
		};

	/** @constructor */
	function ExitStatus(status) {
			this.name = 'ExitStatus';
			this.message = `Program terminated with exit(${status})`;
			this.status = status;
		}

	var runtimeKeepaliveCounter = 0;
	var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
	var _proc_exit = (code) => {
			EXITSTATUS = code;
			if (!keepRuntimeAlive()) {
				Module['onExit']?.(code);
				ABORT = true;
			}
			quit_(code, new ExitStatus(code));
		};
	/** @suppress {duplicate } */
	/** @param {boolean|number=} implicit */
	var exitJS = (status, implicit) => {
			EXITSTATUS = status;

			_proc_exit(status);
		};
	var _exit = exitJS;


	var maybeExit = () => {
			if (!keepRuntimeAlive()) {
				try {
					_exit(EXITSTATUS);
				} catch (e) {
					handleException(e);
				}
			}
		};
	var callUserCallback = (func) => {
			if (ABORT) {
				return;
			}
			try {
				func();
				maybeExit();
			} catch (e) {
				handleException(e);
			}
		};

	/** @param {number=} timeout */
	var safeSetTimeout = (func, timeout) => {

			return setTimeout(() => {

				callUserCallback(func);
			}, timeout);
		};

	var warnOnce = (text) => {
			warnOnce.shown ||= {};
			if (!warnOnce.shown[text]) {
				warnOnce.shown[text] = 1;
				if (ENVIRONMENT_IS_NODE) text = 'warning: ' + text;
				err(text);
			}
		};


	var preloadPlugins = Module['preloadPlugins'] || [];

	var Browser = {
	mainLoop:{
	running:false,
	scheduler:null,
	method:"",
	currentlyRunningMainloop:0,
	func:null,
	arg:0,
	timingMode:0,
	timingValue:0,
	currentFrameNumber:0,
	queue:[],
	pause() {
					Browser.mainLoop.scheduler = null;
					// Incrementing this signals the previous main loop that it's now become old, and it must return.
					Browser.mainLoop.currentlyRunningMainloop++;
				},
	resume() {
					Browser.mainLoop.currentlyRunningMainloop++;
					var timingMode = Browser.mainLoop.timingMode;
					var timingValue = Browser.mainLoop.timingValue;
					var func = Browser.mainLoop.func;
					Browser.mainLoop.func = null;
					// do not set timing and call scheduler, we will do it on the next lines
					setMainLoop(func, 0, false, Browser.mainLoop.arg, true);
					_emscripten_set_main_loop_timing(timingMode, timingValue);
					Browser.mainLoop.scheduler();
				},
	updateStatus() {
					if (Module['setStatus']) {
						var message = Module['statusMessage'] || 'Please wait...';
						var remaining = Browser.mainLoop.remainingBlockers;
						var expected = Browser.mainLoop.expectedBlockers;
						if (remaining) {
							if (remaining < expected) {
								Module['setStatus'](`{message} ({expected - remaining}/{expected})`);
							} else {
								Module['setStatus'](message);
							}
						} else {
							Module['setStatus']('');
						}
					}
				},
	runIter(func) {
					if (ABORT) return;
					if (Module['preMainLoop']) {
						var preRet = Module['preMainLoop']();
						if (preRet === false) {
							return; // |return false| skips a frame
						}
					}
					callUserCallback(func);
					Module['postMainLoop']?.();
				},
	},
	isFullscreen:false,
	pointerLock:false,
	moduleContextCreatedCallbacks:[],
	workers:[],
	init() {
				if (Browser.initted) return;
				Browser.initted = true;

				// Support for plugins that can process preloaded files. You can add more of these to
				// your app by creating and appending to preloadPlugins.
				//
				// Each plugin is asked if it can handle a file based on the file's name. If it can,
				// it is given the file's raw data. When it is done, it calls a callback with the file's
				// (possibly modified) data. For example, a plugin might decompress a file, or it
				// might create some side data structure for use later (like an Image element, etc.).

				var imagePlugin = {};
				imagePlugin['canHandle'] = function imagePlugin_canHandle(name) {
					return !Module.noImageDecoding && /\.(jpg|jpeg|png|bmp)$/i.test(name);
				};
				imagePlugin['handle'] = function imagePlugin_handle(byteArray, name, onload, onerror) {
					var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
					if (b.size !== byteArray.length) { // Safari bug #118630
						// Safari's Blob can only take an ArrayBuffer
						b = new Blob([(new Uint8Array(byteArray)).buffer], { type: Browser.getMimetype(name) });
					}
					var url = URL.createObjectURL(b);
					var img = new Image();
					img.onload = () => {
						var canvas = /** @type {!HTMLCanvasElement} */ (document.createElement('canvas'));
						canvas.width = img.width;
						canvas.height = img.height;
						var ctx = canvas.getContext('2d');
						ctx.drawImage(img, 0, 0);
						preloadedImages[name] = canvas;
						URL.revokeObjectURL(url);
						onload?.(byteArray);
					};
					img.onerror = (event) => {
						err(`Image ${url} could not be decoded`);
						onerror?.();
					};
					img.src = url;
				};
				preloadPlugins.push(imagePlugin);

				var audioPlugin = {};
				audioPlugin['canHandle'] = function audioPlugin_canHandle(name) {
					return !Module.noAudioDecoding && name.substr(-4) in { '.ogg': 1, '.wav': 1, '.mp3': 1 };
				};
				audioPlugin['handle'] = function audioPlugin_handle(byteArray, name, onload, onerror) {
					var done = false;
					function finish(audio) {
						if (done) return;
						done = true;
						preloadedAudios[name] = audio;
						onload?.(byteArray);
					}
					function fail() {
						if (done) return;
						done = true;
						preloadedAudios[name] = new Audio(); // empty shim
						onerror?.();
					}
					var b = new Blob([byteArray], { type: Browser.getMimetype(name) });
					var url = URL.createObjectURL(b); // XXX we never revoke this!
					var audio = new Audio();
					audio.addEventListener('canplaythrough', () => finish(audio), false); // use addEventListener due to chromium bug 124926
					audio.onerror = function audio_onerror(event) {
						if (done) return;
						err(`warning: browser could not fully decode audio ${name}, trying slower base64 approach`);
						function encode64(data) {
							var BASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
							var PAD = '=';
							var ret = '';
							var leftchar = 0;
							var leftbits = 0;
							for (var i = 0; i < data.length; i++) {
								leftchar = (leftchar << 8) | data[i];
								leftbits += 8;
								while (leftbits >= 6) {
									var curr = (leftchar >> (leftbits-6)) & 0x3f;
									leftbits -= 6;
									ret += BASE[curr];
								}
							}
							if (leftbits == 2) {
								ret += BASE[(leftchar&3) << 4];
								ret += PAD + PAD;
							} else if (leftbits == 4) {
								ret += BASE[(leftchar&0xf) << 2];
								ret += PAD;
							}
							return ret;
						}
						audio.src = 'data:audio/x-' + name.substr(-3) + ';base64,' + encode64(byteArray);
						finish(audio); // we don't wait for confirmation this worked - but it's worth trying
					};
					audio.src = url;
					// workaround for chrome bug 124926 - we do not always get oncanplaythrough or onerror
					safeSetTimeout(() => {
						finish(audio); // try to use it even though it is not necessarily ready to play
					}, 10000);
				};
				preloadPlugins.push(audioPlugin);

				// Canvas event setup

				function pointerLockChange() {
					Browser.pointerLock = document['pointerLockElement'] === Module['canvas'] ||
																document['mozPointerLockElement'] === Module['canvas'] ||
																document['webkitPointerLockElement'] === Module['canvas'] ||
																document['msPointerLockElement'] === Module['canvas'];
				}
				var canvas = Module['canvas'];
				if (canvas) {
					// forced aspect ratio can be enabled by defining 'forcedAspectRatio' on Module
					// Module['forcedAspectRatio'] = 4 / 3;

					canvas.requestPointerLock = canvas['requestPointerLock'] ||
																			canvas['mozRequestPointerLock'] ||
																			canvas['webkitRequestPointerLock'] ||
																			canvas['msRequestPointerLock'] ||
																			(() => {});
					canvas.exitPointerLock = document['exitPointerLock'] ||
																	document['mozExitPointerLock'] ||
																	document['webkitExitPointerLock'] ||
																	document['msExitPointerLock'] ||
																	(() => {}); // no-op if function does not exist
					canvas.exitPointerLock = canvas.exitPointerLock.bind(document);

					document.addEventListener('pointerlockchange', pointerLockChange, false);
					document.addEventListener('mozpointerlockchange', pointerLockChange, false);
					document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
					document.addEventListener('mspointerlockchange', pointerLockChange, false);

					if (Module['elementPointerLock']) {
						canvas.addEventListener("click", (ev) => {
							if (!Browser.pointerLock && Module['canvas'].requestPointerLock) {
								Module['canvas'].requestPointerLock();
								ev.preventDefault();
							}
						}, false);
					}
				}
			},
	createContext(/** @type {HTMLCanvasElement} */ canvas, useWebGL, setInModule, webGLContextAttributes) {
				if (useWebGL && Module.ctx && canvas == Module.canvas) return Module.ctx; // no need to recreate GL context if it's already been created for this canvas.

				var ctx;
				var contextHandle;
				if (useWebGL) {
					// For GLES2/desktop GL compatibility, adjust a few defaults to be different to WebGL defaults, so that they align better with the desktop defaults.
					var contextAttributes = {
						antialias: false,
						alpha: false,
						majorVersion: 1,
					};

					if (webGLContextAttributes) {
						for (var attribute in webGLContextAttributes) {
							contextAttributes[attribute] = webGLContextAttributes[attribute];
						}
					}

					// This check of existence of GL is here to satisfy Closure compiler, which yells if variable GL is referenced below but GL object is not
					// actually compiled in because application is not doing any GL operations. TODO: Ideally if GL is not being used, this function
					// Browser.createContext() should not even be emitted.
					if (typeof GL != 'undefined') {
						contextHandle = GL.createContext(canvas, contextAttributes);
						if (contextHandle) {
							ctx = GL.getContext(contextHandle).GLctx;
						}
					}
				} else {
					ctx = canvas.getContext('2d');
				}

				if (!ctx) return null;

				if (setInModule) {
					Module.ctx = ctx;
					if (useWebGL) GL.makeContextCurrent(contextHandle);
					Module.useWebGL = useWebGL;
					Browser.moduleContextCreatedCallbacks.forEach((callback) => callback());
					Browser.init();
				}
				return ctx;
			},
	destroyContext(canvas, useWebGL, setInModule) {},
	fullscreenHandlersInstalled:false,
	lockPointer:undefined,
	resizeCanvas:undefined,
	requestFullscreen(lockPointer, resizeCanvas) {
				Browser.lockPointer = lockPointer;
				Browser.resizeCanvas = resizeCanvas;
				if (typeof Browser.lockPointer == 'undefined') Browser.lockPointer = true;
				if (typeof Browser.resizeCanvas == 'undefined') Browser.resizeCanvas = false;

				var canvas = Module['canvas'];
				function fullscreenChange() {
					Browser.isFullscreen = false;
					var canvasContainer = canvas.parentNode;
					if ((document['fullscreenElement'] || document['mozFullScreenElement'] ||
							document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
							document['webkitCurrentFullScreenElement']) === canvasContainer) {
						canvas.exitFullscreen = Browser.exitFullscreen;
						if (Browser.lockPointer) canvas.requestPointerLock();
						Browser.isFullscreen = true;
						if (Browser.resizeCanvas) {
							Browser.setFullscreenCanvasSize();
						} else {
							Browser.updateCanvasDimensions(canvas);
						}
					} else {
						// remove the full screen specific parent of the canvas again to restore the HTML structure from before going full screen
						canvasContainer.parentNode.insertBefore(canvas, canvasContainer);
						canvasContainer.parentNode.removeChild(canvasContainer);

						if (Browser.resizeCanvas) {
							Browser.setWindowedCanvasSize();
						} else {
							Browser.updateCanvasDimensions(canvas);
						}
					}
					Module['onFullScreen']?.(Browser.isFullscreen);
					Module['onFullscreen']?.(Browser.isFullscreen);
				}

				if (!Browser.fullscreenHandlersInstalled) {
					Browser.fullscreenHandlersInstalled = true;
					document.addEventListener('fullscreenchange', fullscreenChange, false);
					document.addEventListener('mozfullscreenchange', fullscreenChange, false);
					document.addEventListener('webkitfullscreenchange', fullscreenChange, false);
					document.addEventListener('MSFullscreenChange', fullscreenChange, false);
				}

				// create a new parent to ensure the canvas has no siblings. this allows browsers to optimize full screen performance when its parent is the full screen root
				var canvasContainer = document.createElement("div");
				canvas.parentNode.insertBefore(canvasContainer, canvas);
				canvasContainer.appendChild(canvas);

				// use parent of canvas as full screen root to allow aspect ratio correction (Firefox stretches the root to screen size)
				canvasContainer.requestFullscreen = canvasContainer['requestFullscreen'] ||
																						canvasContainer['mozRequestFullScreen'] ||
																						canvasContainer['msRequestFullscreen'] ||
																					(canvasContainer['webkitRequestFullscreen'] ? () => canvasContainer['webkitRequestFullscreen'](Element['ALLOW_KEYBOARD_INPUT']) : null) ||
																					(canvasContainer['webkitRequestFullScreen'] ? () => canvasContainer['webkitRequestFullScreen'](Element['ALLOW_KEYBOARD_INPUT']) : null);

				canvasContainer.requestFullscreen();
			},
	exitFullscreen() {
				// This is workaround for chrome. Trying to exit from fullscreen
				// not in fullscreen state will cause "TypeError: Document not active"
				// in chrome. See https://github.com/emscripten-core/emscripten/pull/8236
				if (!Browser.isFullscreen) {
					return false;
				}

				var CFS = document['exitFullscreen'] ||
									document['cancelFullScreen'] ||
									document['mozCancelFullScreen'] ||
									document['msExitFullscreen'] ||
									document['webkitCancelFullScreen'] ||
						(() => {});
				CFS.apply(document, []);
				return true;
			},
	nextRAF:0,
	fakeRequestAnimationFrame(func) {
				// try to keep 60fps between calls to here
				var now = Date.now();
				if (Browser.nextRAF === 0) {
					Browser.nextRAF = now + 1000/60;
				} else {
					while (now + 2 >= Browser.nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
						Browser.nextRAF += 1000/60;
					}
				}
				var delay = Math.max(Browser.nextRAF - now, 0);
				setTimeout(func, delay);
			},
	requestAnimationFrame(func) {
				if (typeof requestAnimationFrame == 'function') {
					requestAnimationFrame(func);
					return;
				}
				var RAF = Browser.fakeRequestAnimationFrame;
				RAF(func);
			},
	safeSetTimeout(func, timeout) {
				// Legacy function, this is used by the SDL2 port so we need to keep it
				// around at least until that is updated.
				// See https://github.com/libsdl-org/SDL/pull/6304
				return safeSetTimeout(func, timeout);
			},
	safeRequestAnimationFrame(func) {

				return Browser.requestAnimationFrame(() => {

					callUserCallback(func);
				});
			},
	getMimetype(name) {
				return {
					'jpg': 'image/jpeg',
					'jpeg': 'image/jpeg',
					'png': 'image/png',
					'bmp': 'image/bmp',
					'ogg': 'audio/ogg',
					'wav': 'audio/wav',
					'mp3': 'audio/mpeg'
				}[name.substr(name.lastIndexOf('.')+1)];
			},
	getUserMedia(func) {
				window.getUserMedia ||= navigator['getUserMedia'] ||
																navigator['mozGetUserMedia'];
				window.getUserMedia(func);
			},
	getMovementX(event) {
				return event['movementX'] ||
							event['mozMovementX'] ||
							event['webkitMovementX'] ||
							0;
			},
	getMovementY(event) {
				return event['movementY'] ||
							event['mozMovementY'] ||
							event['webkitMovementY'] ||
							0;
			},
	getMouseWheelDelta(event) {
				var delta = 0;
				switch (event.type) {
					case 'DOMMouseScroll':
						// 3 lines make up a step
						delta = event.detail / 3;
						break;
					case 'mousewheel':
						// 120 units make up a step
						delta = event.wheelDelta / 120;
						break;
					case 'wheel':
						delta = event.deltaY
						switch (event.deltaMode) {
							case 0:
								// DOM_DELTA_PIXEL: 100 pixels make up a step
								delta /= 100;
								break;
							case 1:
								// DOM_DELTA_LINE: 3 lines make up a step
								delta /= 3;
								break;
							case 2:
								// DOM_DELTA_PAGE: A page makes up 80 steps
								delta *= 80;
								break;
							default:
								throw 'unrecognized mouse wheel delta mode: ' + event.deltaMode;
						}
						break;
					default:
						throw 'unrecognized mouse wheel event: ' + event.type;
				}
				return delta;
			},
	mouseX:0,
	mouseY:0,
	mouseMovementX:0,
	mouseMovementY:0,
	touches:{
	},
	lastTouches:{
	},
	calculateMouseCoords(pageX, pageY) {
				// Calculate the movement based on the changes
				// in the coordinates.
				var rect = Module["canvas"].getBoundingClientRect();
				var cw = Module["canvas"].width;
				var ch = Module["canvas"].height;

				// Neither .scrollX or .pageXOffset are defined in a spec, but
				// we prefer .scrollX because it is currently in a spec draft.
				// (see: http://www.w3.org/TR/2013/WD-cssom-view-20131217/)
				var scrollX = ((typeof window.scrollX != 'undefined') ? window.scrollX : window.pageXOffset);
				var scrollY = ((typeof window.scrollY != 'undefined') ? window.scrollY : window.pageYOffset);
				var adjustedX = pageX - (scrollX + rect.left);
				var adjustedY = pageY - (scrollY + rect.top);

				// the canvas might be CSS-scaled compared to its backbuffer;
				// SDL-using content will want mouse coordinates in terms
				// of backbuffer units.
				adjustedX = adjustedX * (cw / rect.width);
				adjustedY = adjustedY * (ch / rect.height);

				return { x: adjustedX, y: adjustedY };
			},
	setMouseCoords(pageX, pageY) {
				const {x, y} = Browser.calculateMouseCoords(pageX, pageY);
				Browser.mouseMovementX = x - Browser.mouseX;
				Browser.mouseMovementY = y - Browser.mouseY;
				Browser.mouseX = x;
				Browser.mouseY = y;
			},
	calculateMouseEvent(event) { // event should be mousemove, mousedown or mouseup
				if (Browser.pointerLock) {
					// When the pointer is locked, calculate the coordinates
					// based on the movement of the mouse.
					// Workaround for Firefox bug 764498
					if (event.type != 'mousemove' &&
							('mozMovementX' in event)) {
						Browser.mouseMovementX = Browser.mouseMovementY = 0;
					} else {
						Browser.mouseMovementX = Browser.getMovementX(event);
						Browser.mouseMovementY = Browser.getMovementY(event);
					}

					// check if SDL is available
					if (typeof SDL != "undefined") {
						Browser.mouseX = SDL.mouseX + Browser.mouseMovementX;
						Browser.mouseY = SDL.mouseY + Browser.mouseMovementY;
					} else {
						// just add the mouse delta to the current absolute mouse position
						// FIXME: ideally this should be clamped against the canvas size and zero
						Browser.mouseX += Browser.mouseMovementX;
						Browser.mouseY += Browser.mouseMovementY;
					}
				} else {
					if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
						var touch = event.touch;
						if (touch === undefined) {
							return; // the "touch" property is only defined in SDL

						}
						var coords = Browser.calculateMouseCoords(touch.pageX, touch.pageY);

						if (event.type === 'touchstart') {
							Browser.lastTouches[touch.identifier] = coords;
							Browser.touches[touch.identifier] = coords;
						} else if (event.type === 'touchend' || event.type === 'touchmove') {
							var last = Browser.touches[touch.identifier];
							last ||= coords;
							Browser.lastTouches[touch.identifier] = last;
							Browser.touches[touch.identifier] = coords;
						}
						return;
					}

					Browser.setMouseCoords(event.pageX, event.pageY);
				}
			},
	resizeListeners:[],
	updateResizeListeners() {
				var canvas = Module['canvas'];
				Browser.resizeListeners.forEach((listener) => listener(canvas.width, canvas.height));
			},
	setCanvasSize(width, height, noUpdates) {
				var canvas = Module['canvas'];
				Browser.updateCanvasDimensions(canvas, width, height);
				if (!noUpdates) Browser.updateResizeListeners();
			},
	windowedWidth:0,
	windowedHeight:0,
	setFullscreenCanvasSize() {
				// check if SDL is available
				if (typeof SDL != "undefined") {
					var flags = HEAPU32[((SDL.screen)>>2)];
					flags = flags | 0x00800000; // set SDL_FULLSCREEN flag
					HEAP32[((SDL.screen)>>2)] = flags;
				}
				Browser.updateCanvasDimensions(Module['canvas']);
				Browser.updateResizeListeners();
			},
	setWindowedCanvasSize() {
				// check if SDL is available
				if (typeof SDL != "undefined") {
					var flags = HEAPU32[((SDL.screen)>>2)];
					flags = flags & ~0x00800000; // clear SDL_FULLSCREEN flag
					HEAP32[((SDL.screen)>>2)] = flags;
				}
				Browser.updateCanvasDimensions(Module['canvas']);
				Browser.updateResizeListeners();
			},
	updateCanvasDimensions(canvas, wNative, hNative) {
				if (wNative && hNative) {
					canvas.widthNative = wNative;
					canvas.heightNative = hNative;
				} else {
					wNative = canvas.widthNative;
					hNative = canvas.heightNative;
				}
				var w = wNative;
				var h = hNative;
				if (Module['forcedAspectRatio'] && Module['forcedAspectRatio'] > 0) {
					if (w/h < Module['forcedAspectRatio']) {
						w = Math.round(h * Module['forcedAspectRatio']);
					} else {
						h = Math.round(w / Module['forcedAspectRatio']);
					}
				}
				if (((document['fullscreenElement'] || document['mozFullScreenElement'] ||
						document['msFullscreenElement'] || document['webkitFullscreenElement'] ||
						document['webkitCurrentFullScreenElement']) === canvas.parentNode) && (typeof screen != 'undefined')) {
					var factor = Math.min(screen.width / w, screen.height / h);
					w = Math.round(w * factor);
					h = Math.round(h * factor);
				}
				if (Browser.resizeCanvas) {
					if (canvas.width  != w) canvas.width  = w;
					if (canvas.height != h) canvas.height = h;
					if (typeof canvas.style != 'undefined') {
						canvas.style.removeProperty( "width");
						canvas.style.removeProperty("height");
					}
				} else {
					if (canvas.width  != wNative) canvas.width  = wNative;
					if (canvas.height != hNative) canvas.height = hNative;
					if (typeof canvas.style != 'undefined') {
						if (w != wNative || h != hNative) {
							canvas.style.setProperty( "width", w + "px", "important");
							canvas.style.setProperty("height", h + "px", "important");
						} else {
							canvas.style.removeProperty( "width");
							canvas.style.removeProperty("height");
						}
					}
				}
			},
	};


	var callRuntimeCallbacks = (callbacks) => {
			while (callbacks.length > 0) {
				// Pass the module as the first argument.
				callbacks.shift()(Module);
			}
		};


		/**
		* @param {number} ptr
		* @param {string} type
		*/
	function getValue(ptr, type = 'i8') {
		if (type.endsWith('*')) type = '*';
		switch (type) {
			case 'i1': return HEAP8[ptr];
			case 'i8': return HEAP8[ptr];
			case 'i16': return HEAP16[((ptr)>>1)];
			case 'i32': return HEAP32[((ptr)>>2)];
			case 'i64': abort('to do getValue(i64) use WASM_BIGINT');
			case 'float': return HEAPF32[((ptr)>>2)];
			case 'double': return HEAPF64[((ptr)>>3)];
			case '*': return HEAPU32[((ptr)>>2)];
			default: abort(`invalid type for getValue: ${type}`);
		}
	}

	var noExitRuntime = Module['noExitRuntime'] || true;


		/**
		* @param {number} ptr
		* @param {number} value
		* @param {string} type
		*/
	function setValue(ptr, value, type = 'i8') {
		if (type.endsWith('*')) type = '*';
		switch (type) {
			case 'i1': HEAP8[ptr] = value; break;
			case 'i8': HEAP8[ptr] = value; break;
			case 'i16': HEAP16[((ptr)>>1)] = value; break;
			case 'i32': HEAP32[((ptr)>>2)] = value; break;
			case 'i64': abort('to do setValue(i64) use WASM_BIGINT');
			case 'float': HEAPF32[((ptr)>>2)] = value; break;
			case 'double': HEAPF64[((ptr)>>3)] = value; break;
			case '*': HEAPU32[((ptr)>>2)] = value; break;
			default: abort(`invalid type for setValue: ${type}`);
		}
	}

	var UTF8Decoder = typeof TextDecoder != 'undefined' ? new TextDecoder('utf8') : undefined;

		/**
		* Given a pointer 'idx' to a null-terminated UTF8-encoded string in the given
		* array that contains uint8 values, returns a copy of that string as a
		* Javascript String object.
		* heapOrArray is either a regular array, or a JavaScript typed array view.
		* @param {number} idx
		* @param {number=} maxBytesToRead
		* @return {string}
		*/
	var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
			var endIdx = idx + maxBytesToRead;
			var endPtr = idx;
			// TextDecoder needs to know the byte length in advance, it doesn't stop on
			// null terminator by itself.  Also, use the length info to avoid running tiny
			// strings through TextDecoder, since .subarray() allocates garbage.
			// (As a tiny code save trick, compare endPtr against endIdx using a negation,
			// so that undefined means Infinity)
			while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;

			if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
				return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
			}
			var str = '';
			// If building with TextDecoder, we have already computed the string length
			// above, so test loop end condition against that
			while (idx < endPtr) {
				// For UTF8 byte structure, see:
				// http://en.wikipedia.org/wiki/UTF-8#Description
				// https://www.ietf.org/rfc/rfc2279.txt
				// https://tools.ietf.org/html/rfc3629
				var u0 = heapOrArray[idx++];
				if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
				var u1 = heapOrArray[idx++] & 63;
				if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
				var u2 = heapOrArray[idx++] & 63;
				if ((u0 & 0xF0) == 0xE0) {
					u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
				} else {
					u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
				}

				if (u0 < 0x10000) {
					str += String.fromCharCode(u0);
				} else {
					var ch = u0 - 0x10000;
					str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
				}
			}
			return str;
		};

		/**
		* Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the
		* emscripten HEAP, returns a copy of that string as a Javascript String object.
		*
		* @param {number} ptr
		* @param {number=} maxBytesToRead - An optional length that specifies the
		*   maximum number of bytes to read. You can omit this parameter to scan the
		*   string until the first 0 byte. If maxBytesToRead is passed, and the string
		*   at [ptr, ptr+maxBytesToReadr[ contains a null byte in the middle, then the
		*   string will cut short at that byte index (i.e. maxBytesToRead will not
		*   produce a string of exact length [ptr, ptr+maxBytesToRead[) N.B. mixing
		*   frequent uses of UTF8ToString() with and without maxBytesToRead may throw
		*   JS JIT optimizations off, so it is worth to consider consistently using one
		* @return {string}
		*/
	var UTF8ToString = (ptr, maxBytesToRead) => {
			return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
		};
	var ___assert_fail = (condition, filename, line, func) => {
			abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : 'unknown filename', line, func ? UTF8ToString(func) : 'unknown function']);
		};

	var PATH = {
	isAbs:(path) => path.charAt(0) === '/',
	splitPath:(filename) => {
				var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
				return splitPathRe.exec(filename).slice(1);
			},
	normalizeArray:(parts, allowAboveRoot) => {
				// if the path tries to go above the root, `up` ends up > 0
				var up = 0;
				for (var i = parts.length - 1; i >= 0; i--) {
					var last = parts[i];
					if (last === '.') {
						parts.splice(i, 1);
					} else if (last === '..') {
						parts.splice(i, 1);
						up++;
					} else if (up) {
						parts.splice(i, 1);
						up--;
					}
				}
				// if the path is allowed to go above the root, restore leading ..s
				if (allowAboveRoot) {
					for (; up; up--) {
						parts.unshift('..');
					}
				}
				return parts;
			},
	normalize:(path) => {
				var isAbsolute = PATH.isAbs(path),
						trailingSlash = path.substr(-1) === '/';
				// Normalize the path
				path = PATH.normalizeArray(path.split('/').filter((p) => !!p), !isAbsolute).join('/');
				if (!path && !isAbsolute) {
					path = '.';
				}
				if (path && trailingSlash) {
					path += '/';
				}
				return (isAbsolute ? '/' : '') + path;
			},
	dirname:(path) => {
				var result = PATH.splitPath(path),
						root = result[0],
						dir = result[1];
				if (!root && !dir) {
					// No dirname whatsoever
					return '.';
				}
				if (dir) {
					// It has a dirname, strip trailing slash
					dir = dir.substr(0, dir.length - 1);
				}
				return root + dir;
			},
	basename:(path) => {
				// EMSCRIPTEN return '/'' for '/', not an empty string
				if (path === '/') return '/';
				path = PATH.normalize(path);
				path = path.replace(/\/$/, "");
				var lastSlash = path.lastIndexOf('/');
				if (lastSlash === -1) return path;
				return path.substr(lastSlash+1);
			},
	join:(...paths) => PATH.normalize(paths.join('/')),
	join2:(l, r) => PATH.normalize(l + '/' + r),
	};

	var initRandomFill = () => {
			if (typeof crypto == 'object' && typeof crypto['getRandomValues'] == 'function') {
				// for modern web browsers
				return (view) => crypto.getRandomValues(view);
			} else
			if (ENVIRONMENT_IS_NODE) {
				// for nodejs with or without crypto support included
				try {
					var crypto_module = require('crypto');
					var randomFillSync = crypto_module['randomFillSync'];
					if (randomFillSync) {
						// nodejs with LTS crypto support
						return (view) => crypto_module['randomFillSync'](view);
					}
					// very old nodejs with the original crypto API
					var randomBytes = crypto_module['randomBytes'];
					return (view) => (
						view.set(randomBytes(view.byteLength)),
						// Return the original view to match modern native implementations.
						view
					);
				} catch (e) {
					// nodejs doesn't have crypto support
				}
			}
			// we couldn't find a proper implementation, as Math.random() is not suitable for /dev/random, see emscripten-core/emscripten/pull/7096
			abort('initRandomDevice');
		};
	var randomFill = (view) => {
			// Lazily init on the first invocation.
			return (randomFill = initRandomFill())(view);
		};



	var PATH_FS = {
	resolve:(...args) => {
				var resolvedPath = '',
					resolvedAbsolute = false;
				for (var i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
					var path = (i >= 0) ? args[i] : FS.cwd();
					// Skip empty and invalid entries
					if (typeof path != 'string') {
						throw new TypeError('Arguments to path.resolve must be strings');
					} else if (!path) {
						return ''; // an invalid portion invalidates the whole thing
					}
					resolvedPath = path + '/' + resolvedPath;
					resolvedAbsolute = PATH.isAbs(path);
				}
				// At this point the path should be resolved to a full absolute path, but
				// handle relative paths to be safe (might happen when process.cwd() fails)
				resolvedPath = PATH.normalizeArray(resolvedPath.split('/').filter((p) => !!p), !resolvedAbsolute).join('/');
				return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
			},
	relative:(from, to) => {
				from = PATH_FS.resolve(from).substr(1);
				to = PATH_FS.resolve(to).substr(1);
				function trim(arr) {
					var start = 0;
					for (; start < arr.length; start++) {
						if (arr[start] !== '') break;
					}
					var end = arr.length - 1;
					for (; end >= 0; end--) {
						if (arr[end] !== '') break;
					}
					if (start > end) return [];
					return arr.slice(start, end - start + 1);
				}
				var fromParts = trim(from.split('/'));
				var toParts = trim(to.split('/'));
				var length = Math.min(fromParts.length, toParts.length);
				var samePartsLength = length;
				for (var i = 0; i < length; i++) {
					if (fromParts[i] !== toParts[i]) {
						samePartsLength = i;
						break;
					}
				}
				var outputParts = [];
				for (var i = samePartsLength; i < fromParts.length; i++) {
					outputParts.push('..');
				}
				outputParts = outputParts.concat(toParts.slice(samePartsLength));
				return outputParts.join('/');
			},
	};



	var FS_stdin_getChar_buffer = [];

	var lengthBytesUTF8 = (str) => {
			var len = 0;
			for (var i = 0; i < str.length; ++i) {
				// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
				// unit, not a Unicode code point of the character! So decode
				// UTF16->UTF32->UTF8.
				// See http://unicode.org/faq/utf_bom.html#utf16-3
				var c = str.charCodeAt(i); // possibly a lead surrogate
				if (c <= 0x7F) {
					len++;
				} else if (c <= 0x7FF) {
					len += 2;
				} else if (c >= 0xD800 && c <= 0xDFFF) {
					len += 4; ++i;
				} else {
					len += 3;
				}
			}
			return len;
		};

	var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
			// Parameter maxBytesToWrite is not optional. Negative values, 0, null,
			// undefined and false each don't write out any bytes.
			if (!(maxBytesToWrite > 0))
				return 0;

			var startIdx = outIdx;
			var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
			for (var i = 0; i < str.length; ++i) {
				// Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code
				// unit, not a Unicode code point of the character! So decode
				// UTF16->UTF32->UTF8.
				// See http://unicode.org/faq/utf_bom.html#utf16-3
				// For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description
				// and https://www.ietf.org/rfc/rfc2279.txt
				// and https://tools.ietf.org/html/rfc3629
				var u = str.charCodeAt(i); // possibly a lead surrogate
				if (u >= 0xD800 && u <= 0xDFFF) {
					var u1 = str.charCodeAt(++i);
					u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
				}
				if (u <= 0x7F) {
					if (outIdx >= endIdx) break;
					heap[outIdx++] = u;
				} else if (u <= 0x7FF) {
					if (outIdx + 1 >= endIdx) break;
					heap[outIdx++] = 0xC0 | (u >> 6);
					heap[outIdx++] = 0x80 | (u & 63);
				} else if (u <= 0xFFFF) {
					if (outIdx + 2 >= endIdx) break;
					heap[outIdx++] = 0xE0 | (u >> 12);
					heap[outIdx++] = 0x80 | ((u >> 6) & 63);
					heap[outIdx++] = 0x80 | (u & 63);
				} else {
					if (outIdx + 3 >= endIdx) break;
					heap[outIdx++] = 0xF0 | (u >> 18);
					heap[outIdx++] = 0x80 | ((u >> 12) & 63);
					heap[outIdx++] = 0x80 | ((u >> 6) & 63);
					heap[outIdx++] = 0x80 | (u & 63);
				}
			}
			// Null-terminate the pointer to the buffer.
			heap[outIdx] = 0;
			return outIdx - startIdx;
		};
	/** @type {function(string, boolean=, number=)} */
	function intArrayFromString(stringy, dontAddNull, length) {
		var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
		var u8array = new Array(len);
		var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
		if (dontAddNull) u8array.length = numBytesWritten;
		return u8array;
	}
	var FS_stdin_getChar = () => {
			if (!FS_stdin_getChar_buffer.length) {
				var result = null;
				if (ENVIRONMENT_IS_NODE) {
					// we will read data by chunks of BUFSIZE
					var BUFSIZE = 256;
					var buf = Buffer.alloc(BUFSIZE);
					var bytesRead = 0;

					// For some reason we must suppress a closure warning here, even though
					// fd definitely exists on process.stdin, and is even the proper way to
					// get the fd of stdin,
					// https://github.com/nodejs/help/issues/2136#issuecomment-523649904
					// This started to happen after moving this logic out of library_tty.js,
					// so it is related to the surrounding code in some unclear manner.
					/** @suppress {missingProperties} */
					var fd = process.stdin.fd;

					try {
						bytesRead = fs.readSync(fd, buf);
					} catch(e) {
						// Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSes,
						// reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
						if (e.toString().includes('EOF')) bytesRead = 0;
						else throw e;
					}

					if (bytesRead > 0) {
						result = buf.slice(0, bytesRead).toString('utf-8');
					} else {
						result = null;
					}
				} else
				if (typeof window != 'undefined' &&
					typeof window.prompt == 'function') {
					// Browser.
					result = window.prompt('Input: ');  // returns null on cancel
					if (result !== null) {
						result += '\n';
					}
				} else if (typeof readline == 'function') {
					// Command line.
					result = readline();
					if (result !== null) {
						result += '\n';
					}
				}
				if (!result) {
					return null;
				}
				FS_stdin_getChar_buffer = intArrayFromString(result, true);
			}
			return FS_stdin_getChar_buffer.shift();
		};
	var TTY = {
	ttys:[],
	init() {
				// https://github.com/emscripten-core/emscripten/pull/1555
				// if (ENVIRONMENT_IS_NODE) {
				//   // currently, FS.init does not distinguish if process.stdin is a file or TTY
				//   // device, it always assumes it's a TTY device. because of this, we're forcing
				//   // process.stdin to UTF8 encoding to at least make stdin reading compatible
				//   // with text files until FS.init can be refactored.
				//   process.stdin.setEncoding('utf8');
				// }
			},
	shutdown() {
				// https://github.com/emscripten-core/emscripten/pull/1555
				// if (ENVIRONMENT_IS_NODE) {
				//   // inolen: any idea as to why node -e 'process.stdin.read()' wouldn't exit immediately (with process.stdin being a tty)?
				//   // isaacs: because now it's reading from the stream, you've expressed interest in it, so that read() kicks off a _read() which creates a ReadReq operation
				//   // inolen: I thought read() in that case was a synchronous operation that just grabbed some amount of buffered data if it exists?
				//   // isaacs: it is. but it also triggers a _read() call, which calls readStart() on the handle
				//   // isaacs: do process.stdin.pause() and i'd think it'd probably close the pending call
				//   process.stdin.pause();
				// }
			},
	register(dev, ops) {
				TTY.ttys[dev] = { input: [], output: [], ops: ops };
				FS.registerDevice(dev, TTY.stream_ops);
			},
	stream_ops:{
	open(stream) {
					var tty = TTY.ttys[stream.node.rdev];
					if (!tty) {
						throw new FS.ErrnoError(43);
					}
					stream.tty = tty;
					stream.seekable = false;
				},
	close(stream) {
					// flush any pending line data
					stream.tty.ops.fsync(stream.tty);
				},
	fsync(stream) {
					stream.tty.ops.fsync(stream.tty);
				},
	read(stream, buffer, offset, length, pos /* ignored */) {
					if (!stream.tty || !stream.tty.ops.get_char) {
						throw new FS.ErrnoError(60);
					}
					var bytesRead = 0;
					for (var i = 0; i < length; i++) {
						var result;
						try {
							result = stream.tty.ops.get_char(stream.tty);
						} catch (e) {
							throw new FS.ErrnoError(29);
						}
						if (result === undefined && bytesRead === 0) {
							throw new FS.ErrnoError(6);
						}
						if (result === null || result === undefined) break;
						bytesRead++;
						buffer[offset+i] = result;
					}
					if (bytesRead) {
						stream.node.timestamp = Date.now();
					}
					return bytesRead;
				},
	write(stream, buffer, offset, length, pos) {
					if (!stream.tty || !stream.tty.ops.put_char) {
						throw new FS.ErrnoError(60);
					}
					try {
						for (var i = 0; i < length; i++) {
							stream.tty.ops.put_char(stream.tty, buffer[offset+i]);
						}
					} catch (e) {
						throw new FS.ErrnoError(29);
					}
					if (length) {
						stream.node.timestamp = Date.now();
					}
					return i;
				},
	},
	default_tty_ops:{
	get_char(tty) {
					return FS_stdin_getChar();
				},
	put_char(tty, val) {
					if (val === null || val === 10) {
						out(UTF8ArrayToString(tty.output, 0));
						tty.output = [];
					} else {
						if (val != 0) tty.output.push(val); // val == 0 would cut text output off in the middle.
					}
				},
	fsync(tty) {
					if (tty.output && tty.output.length > 0) {
						out(UTF8ArrayToString(tty.output, 0));
						tty.output = [];
					}
				},
	ioctl_tcgets(tty) {
					// typical setting
					return {
						c_iflag: 25856,
						c_oflag: 5,
						c_cflag: 191,
						c_lflag: 35387,
						c_cc: [
							0x03, 0x1c, 0x7f, 0x15, 0x04, 0x00, 0x01, 0x00, 0x11, 0x13, 0x1a, 0x00,
							0x12, 0x0f, 0x17, 0x16, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
							0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
						]
					};
				},
	ioctl_tcsets(tty, optional_actions, data) {
					// currently just ignore
					return 0;
				},
	ioctl_tiocgwinsz(tty) {
					return [24, 80];
				},
	},
	default_tty1_ops:{
	put_char(tty, val) {
					if (val === null || val === 10) {
						err(UTF8ArrayToString(tty.output, 0));
						tty.output = [];
					} else {
						if (val != 0) tty.output.push(val);
					}
				},
	fsync(tty) {
					if (tty.output && tty.output.length > 0) {
						err(UTF8ArrayToString(tty.output, 0));
						tty.output = [];
					}
				},
	},
	};


	var zeroMemory = (address, size) => {
			HEAPU8.fill(0, address, address + size);
			return address;
		};

	var alignMemory = (size, alignment) => {
			return Math.ceil(size / alignment) * alignment;
		};
	var mmapAlloc = (size) => {
			abort();
		};
	var MEMFS = {
	ops_table:null,
	mount(mount) {
				return MEMFS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
			},
	createNode(parent, name, mode, dev) {
				if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
					// no supported
					throw new FS.ErrnoError(63);
				}
				MEMFS.ops_table ||= {
					dir: {
						node: {
							getattr: MEMFS.node_ops.getattr,
							setattr: MEMFS.node_ops.setattr,
							lookup: MEMFS.node_ops.lookup,
							mknod: MEMFS.node_ops.mknod,
							rename: MEMFS.node_ops.rename,
							unlink: MEMFS.node_ops.unlink,
							rmdir: MEMFS.node_ops.rmdir,
							readdir: MEMFS.node_ops.readdir,
							symlink: MEMFS.node_ops.symlink
						},
						stream: {
							llseek: MEMFS.stream_ops.llseek
						}
					},
					file: {
						node: {
							getattr: MEMFS.node_ops.getattr,
							setattr: MEMFS.node_ops.setattr
						},
						stream: {
							llseek: MEMFS.stream_ops.llseek,
							read: MEMFS.stream_ops.read,
							write: MEMFS.stream_ops.write,
							allocate: MEMFS.stream_ops.allocate,
							mmap: MEMFS.stream_ops.mmap,
							msync: MEMFS.stream_ops.msync
						}
					},
					link: {
						node: {
							getattr: MEMFS.node_ops.getattr,
							setattr: MEMFS.node_ops.setattr,
							readlink: MEMFS.node_ops.readlink
						},
						stream: {}
					},
					chrdev: {
						node: {
							getattr: MEMFS.node_ops.getattr,
							setattr: MEMFS.node_ops.setattr
						},
						stream: FS.chrdev_stream_ops
					}
				};
				var node = FS.createNode(parent, name, mode, dev);
				if (FS.isDir(node.mode)) {
					node.node_ops = MEMFS.ops_table.dir.node;
					node.stream_ops = MEMFS.ops_table.dir.stream;
					node.contents = {};
				} else if (FS.isFile(node.mode)) {
					node.node_ops = MEMFS.ops_table.file.node;
					node.stream_ops = MEMFS.ops_table.file.stream;
					node.usedBytes = 0; // The actual number of bytes used in the typed array, as opposed to contents.length which gives the whole capacity.
					// When the byte data of the file is populated, this will point to either a typed array, or a normal JS array. Typed arrays are preferred
					// for performance, and used by default. However, typed arrays are not resizable like normal JS arrays are, so there is a small disk size
					// penalty involved for appending file writes that continuously grow a file similar to std::vector capacity vs used -scheme.
					node.contents = null;
				} else if (FS.isLink(node.mode)) {
					node.node_ops = MEMFS.ops_table.link.node;
					node.stream_ops = MEMFS.ops_table.link.stream;
				} else if (FS.isChrdev(node.mode)) {
					node.node_ops = MEMFS.ops_table.chrdev.node;
					node.stream_ops = MEMFS.ops_table.chrdev.stream;
				}
				node.timestamp = Date.now();
				// add the new node to the parent
				if (parent) {
					parent.contents[name] = node;
					parent.timestamp = node.timestamp;
				}
				return node;
			},
	getFileDataAsTypedArray(node) {
				if (!node.contents) return new Uint8Array(0);
				if (node.contents.subarray) return node.contents.subarray(0, node.usedBytes); // Make sure to not return excess unused bytes.
				return new Uint8Array(node.contents);
			},
	expandFileStorage(node, newCapacity) {
				var prevCapacity = node.contents ? node.contents.length : 0;
				if (prevCapacity >= newCapacity) return; // No need to expand, the storage was already large enough.
				// Don't expand strictly to the given requested limit if it's only a very small increase, but instead geometrically grow capacity.
				// For small filesizes (<1MB), perform size*2 geometric increase, but for large sizes, do a much more conservative size*1.125 increase to
				// avoid overshooting the allocation cap by a very large margin.
				var CAPACITY_DOUBLING_MAX = 1024 * 1024;
				newCapacity = Math.max(newCapacity, (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2.0 : 1.125)) >>> 0);
				if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256); // At minimum allocate 256b for each file when expanding.
				var oldContents = node.contents;
				node.contents = new Uint8Array(newCapacity); // Allocate new storage.
				if (node.usedBytes > 0) node.contents.set(oldContents.subarray(0, node.usedBytes), 0); // Copy old data over to the new storage.
			},
	resizeFileStorage(node, newSize) {
				if (node.usedBytes == newSize) return;
				if (newSize == 0) {
					node.contents = null; // Fully decommit when requesting a resize to zero.
					node.usedBytes = 0;
				} else {
					var oldContents = node.contents;
					node.contents = new Uint8Array(newSize); // Allocate new storage.
					if (oldContents) {
						node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes))); // Copy old data over to the new storage.
					}
					node.usedBytes = newSize;
				}
			},
	node_ops:{
	getattr(node) {
					var attr = {};
					// device numbers reuse inode numbers.
					attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
					attr.ino = node.id;
					attr.mode = node.mode;
					attr.nlink = 1;
					attr.uid = 0;
					attr.gid = 0;
					attr.rdev = node.rdev;
					if (FS.isDir(node.mode)) {
						attr.size = 4096;
					} else if (FS.isFile(node.mode)) {
						attr.size = node.usedBytes;
					} else if (FS.isLink(node.mode)) {
						attr.size = node.link.length;
					} else {
						attr.size = 0;
					}
					attr.atime = new Date(node.timestamp);
					attr.mtime = new Date(node.timestamp);
					attr.ctime = new Date(node.timestamp);
					// NOTE: In our implementation, st_blocks = Math.ceil(st_size/st_blksize),
					//       but this is not required by the standard.
					attr.blksize = 4096;
					attr.blocks = Math.ceil(attr.size / attr.blksize);
					return attr;
				},
	setattr(node, attr) {
					if (attr.mode !== undefined) {
						node.mode = attr.mode;
					}
					if (attr.timestamp !== undefined) {
						node.timestamp = attr.timestamp;
					}
					if (attr.size !== undefined) {
						MEMFS.resizeFileStorage(node, attr.size);
					}
				},
	lookup(parent, name) {
					throw FS.genericErrors[44];
				},
	mknod(parent, name, mode, dev) {
					return MEMFS.createNode(parent, name, mode, dev);
				},
	rename(old_node, new_dir, new_name) {
					// if we're overwriting a directory at new_name, make sure it's empty.
					if (FS.isDir(old_node.mode)) {
						var new_node;
						try {
							new_node = FS.lookupNode(new_dir, new_name);
						} catch (e) {
						}
						if (new_node) {
							for (var i in new_node.contents) {
								throw new FS.ErrnoError(55);
							}
						}
					}
					// do the internal rewiring
					delete old_node.parent.contents[old_node.name];
					old_node.parent.timestamp = Date.now()
					old_node.name = new_name;
					new_dir.contents[new_name] = old_node;
					new_dir.timestamp = old_node.parent.timestamp;
					old_node.parent = new_dir;
				},
	unlink(parent, name) {
					delete parent.contents[name];
					parent.timestamp = Date.now();
				},
	rmdir(parent, name) {
					var node = FS.lookupNode(parent, name);
					for (var i in node.contents) {
						throw new FS.ErrnoError(55);
					}
					delete parent.contents[name];
					parent.timestamp = Date.now();
				},
	readdir(node) {
					var entries = ['.', '..'];
					for (var key of Object.keys(node.contents)) {
						entries.push(key);
					}
					return entries;
				},
	symlink(parent, newname, oldpath) {
					var node = MEMFS.createNode(parent, newname, 511 /* 0777 */ | 40960, 0);
					node.link = oldpath;
					return node;
				},
	readlink(node) {
					if (!FS.isLink(node.mode)) {
						throw new FS.ErrnoError(28);
					}
					return node.link;
				},
	},
	stream_ops:{
	read(stream, buffer, offset, length, position) {
					var contents = stream.node.contents;
					if (position >= stream.node.usedBytes) return 0;
					var size = Math.min(stream.node.usedBytes - position, length);
					if (size > 8 && contents.subarray) { // non-trivial, and typed array
						buffer.set(contents.subarray(position, position + size), offset);
					} else {
						for (var i = 0; i < size; i++) buffer[offset + i] = contents[position + i];
					}
					return size;
				},
	write(stream, buffer, offset, length, position, canOwn) {

					if (!length) return 0;
					var node = stream.node;
					node.timestamp = Date.now();

					if (buffer.subarray && (!node.contents || node.contents.subarray)) { // This write is from a typed array to a typed array?
						if (canOwn) {
							node.contents = buffer.subarray(offset, offset + length);
							node.usedBytes = length;
							return length;
						} else if (node.usedBytes === 0 && position === 0) { // If this is a simple first write to an empty file, do a fast set since we don't need to care about old data.
							node.contents = buffer.slice(offset, offset + length);
							node.usedBytes = length;
							return length;
						} else if (position + length <= node.usedBytes) { // Writing to an already allocated and used subrange of the file?
							node.contents.set(buffer.subarray(offset, offset + length), position);
							return length;
						}
					}

					// Appending to an existing file and we need to reallocate, or source data did not come as a typed array.
					MEMFS.expandFileStorage(node, position+length);
					if (node.contents.subarray && buffer.subarray) {
						// Use typed array write which is available.
						node.contents.set(buffer.subarray(offset, offset + length), position);
					} else {
						for (var i = 0; i < length; i++) {
						node.contents[position + i] = buffer[offset + i]; // Or fall back to manual write if not.
						}
					}
					node.usedBytes = Math.max(node.usedBytes, position + length);
					return length;
				},
	llseek(stream, offset, whence) {
					var position = offset;
					if (whence === 1) {
						position += stream.position;
					} else if (whence === 2) {
						if (FS.isFile(stream.node.mode)) {
							position += stream.node.usedBytes;
						}
					}
					if (position < 0) {
						throw new FS.ErrnoError(28);
					}
					return position;
				},
	allocate(stream, offset, length) {
					MEMFS.expandFileStorage(stream.node, offset + length);
					stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
				},
	mmap(stream, length, position, prot, flags) {
					if (!FS.isFile(stream.node.mode)) {
						throw new FS.ErrnoError(43);
					}
					var ptr;
					var allocated;
					var contents = stream.node.contents;
					// Only make a new copy when MAP_PRIVATE is specified.
					if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
						// We can't emulate MAP_SHARED when the file is not backed by the
						// buffer we're mapping to (e.g. the HEAP buffer).
						allocated = false;
						ptr = contents.byteOffset;
					} else {
						// Try to avoid unnecessary slices.
						if (position > 0 || position + length < contents.length) {
							if (contents.subarray) {
								contents = contents.subarray(position, position + length);
							} else {
								contents = Array.prototype.slice.call(contents, position, position + length);
							}
						}
						allocated = true;
						ptr = mmapAlloc(length);
						if (!ptr) {
							throw new FS.ErrnoError(48);
						}
						HEAP8.set(contents, ptr);
					}
					return { ptr, allocated };
				},
	msync(stream, buffer, offset, length, mmapFlags) {
					MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
					// should we check if bytesWritten and length are the same?
					return 0;
				},
	},
	};

	/** @param {boolean=} noRunDep */
	var asyncLoad = (url, onload, onerror, noRunDep) => {
			var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : '';
			readAsync(url, (arrayBuffer) => {
				onload(new Uint8Array(arrayBuffer));
				if (dep) removeRunDependency(dep);
			}, (event) => {
				if (onerror) {
					onerror();
				} else {
					throw `Loading data file "${url}" failed.`;
				}
			});
			if (dep) addRunDependency(dep);
		};


	var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
			FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
		};

	var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
			// Ensure plugins are ready.
			if (typeof Browser != 'undefined') Browser.init();

			var handled = false;
			preloadPlugins.forEach((plugin) => {
				if (handled) return;
				if (plugin['canHandle'](fullname)) {
					plugin['handle'](byteArray, fullname, finish, onerror);
					handled = true;
				}
			});
			return handled;
		};
	var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
			// TODO we should allow people to just pass in a complete filename instead
			// of parent and name being that we just join them anyways
			var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
			var dep = getUniqueRunDependency(`cp ${fullname}`); // might have several active requests for the same fullname
			function processData(byteArray) {
				function finish(byteArray) {
					preFinish?.();
					if (!dontCreateFile) {
						FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
					}
					onload?.();
					removeRunDependency(dep);
				}
				if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
					onerror?.();
					removeRunDependency(dep);
				})) {
					return;
				}
				finish(byteArray);
			}
			addRunDependency(dep);
			if (typeof url == 'string') {
				asyncLoad(url, processData, onerror);
			} else {
				processData(url);
			}
		};

	var FS_modeStringToFlags = (str) => {
			var flagModes = {
				'r': 0,
				'r+': 2,
				'w': 512 | 64 | 1,
				'w+': 512 | 64 | 2,
				'a': 1024 | 64 | 1,
				'a+': 1024 | 64 | 2,
			};
			var flags = flagModes[str];
			if (typeof flags == 'undefined') {
				throw new Error(`Unknown file open mode: ${str}`);
			}
			return flags;
		};

	var FS_getMode = (canRead, canWrite) => {
			var mode = 0;
			if (canRead) mode |= 292 | 73;
			if (canWrite) mode |= 146;
			return mode;
		};



	var FS = {
	root:null,
	mounts:[],
	devices:{
	},
	streams:[],
	nextInode:1,
	nameTable:null,
	currentPath:"/",
	initialized:false,
	ignorePermissions:true,
	ErrnoError:class {
				// We set the `name` property to be able to identify `FS.ErrnoError`
				// - the `name` is a standard ECMA-262 property of error objects. Kind of good to have it anyway.
				// - when using PROXYFS, an error can come from an underlying FS
				// as different FS objects have their own FS.ErrnoError each,
				// the test `err instanceof FS.ErrnoError` won't detect an error coming from another filesystem, causing bugs.
				// we'll use the reliable test `err.name == "ErrnoError"` instead
				constructor(errno) {
					// TODO(sbc): Use the inline member declaration syntax once we
					// support it in acorn and closure.
					this.name = 'ErrnoError';
					this.errno = errno;
				}
			},
	genericErrors:{
	},
	filesystems:null,
	syncFSRequests:0,
	FSStream:class {
				constructor() {
					// TODO(https://github.com/emscripten-core/emscripten/issues/21414):
					// Use inline field declarations.
					this.shared = {};
				}
				get object() {
					return this.node;
				}
				set object(val) {
					this.node = val;
				}
				get isRead() {
					return (this.flags & 2097155) !== 1;
				}
				get isWrite() {
					return (this.flags & 2097155) !== 0;
				}
				get isAppend() {
					return (this.flags & 1024);
				}
				get flags() {
					return this.shared.flags;
				}
				set flags(val) {
					this.shared.flags = val;
				}
				get position() {
					return this.shared.position;
				}
				set position(val) {
					this.shared.position = val;
				}
			},
	FSNode:class {
				constructor(parent, name, mode, rdev) {
					if (!parent) {
						parent = this;  // root node sets parent to itself
					}
					this.parent = parent;
					this.mount = parent.mount;
					this.mounted = null;
					this.id = FS.nextInode++;
					this.name = name;
					this.mode = mode;
					this.node_ops = {};
					this.stream_ops = {};
					this.rdev = rdev;
					this.readMode = 292/*292*/ | 73/*73*/;
					this.writeMode = 146/*146*/;
				}
				get read() {
					return (this.mode & this.readMode) === this.readMode;
				}
				set read(val) {
					val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
				}
				get write() {
					return (this.mode & this.writeMode) === this.writeMode;
				}
				set write(val) {
					val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
				}
				get isFolder() {
					return FS.isDir(this.mode);
				}
				get isDevice() {
					return FS.isChrdev(this.mode);
				}
			},
	lookupPath(path, opts = {}) {
				path = PATH_FS.resolve(path);

				if (!path) return { path: '', node: null };

				var defaults = {
					follow_mount: true,
					recurse_count: 0
				};
				opts = Object.assign(defaults, opts)

				if (opts.recurse_count > 8) {  // max recursive lookup of 8
					throw new FS.ErrnoError(32);
				}

				// split the absolute path
				var parts = path.split('/').filter((p) => !!p);

				// start at the root
				var current = FS.root;
				var current_path = '/';

				for (var i = 0; i < parts.length; i++) {
					var islast = (i === parts.length-1);
					if (islast && opts.parent) {
						// stop resolving
						break;
					}

					current = FS.lookupNode(current, parts[i]);
					current_path = PATH.join2(current_path, parts[i]);

					// jump to the mount's root node if this is a mountpoint
					if (FS.isMountpoint(current)) {
						if (!islast || (islast && opts.follow_mount)) {
							current = current.mounted.root;
						}
					}

					// by default, lookupPath will not follow a symlink if it is the final path component.
					// setting opts.follow = true will override this behavior.
					if (!islast || opts.follow) {
						var count = 0;
						while (FS.isLink(current.mode)) {
							var link = FS.readlink(current_path);
							current_path = PATH_FS.resolve(PATH.dirname(current_path), link);

							var lookup = FS.lookupPath(current_path, { recurse_count: opts.recurse_count + 1 });
							current = lookup.node;

							if (count++ > 40) {  // limit max consecutive symlinks to 40 (SYMLOOP_MAX).
								throw new FS.ErrnoError(32);
							}
						}
					}
				}

				return { path: current_path, node: current };
			},
	getPath(node) {
				var path;
				while (true) {
					if (FS.isRoot(node)) {
						var mount = node.mount.mountpoint;
						if (!path) return mount;
						return mount[mount.length-1] !== '/' ? `${mount}/${path}` : mount + path;
					}
					path = path ? `${node.name}/${path}` : node.name;
					node = node.parent;
				}
			},
	hashName(parentid, name) {
				var hash = 0;

				for (var i = 0; i < name.length; i++) {
					hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
				}
				return ((parentid + hash) >>> 0) % FS.nameTable.length;
			},
	hashAddNode(node) {
				var hash = FS.hashName(node.parent.id, node.name);
				node.name_next = FS.nameTable[hash];
				FS.nameTable[hash] = node;
			},
	hashRemoveNode(node) {
				var hash = FS.hashName(node.parent.id, node.name);
				if (FS.nameTable[hash] === node) {
					FS.nameTable[hash] = node.name_next;
				} else {
					var current = FS.nameTable[hash];
					while (current) {
						if (current.name_next === node) {
							current.name_next = node.name_next;
							break;
						}
						current = current.name_next;
					}
				}
			},
	lookupNode(parent, name) {
				var errCode = FS.mayLookup(parent);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				var hash = FS.hashName(parent.id, name);
				for (var node = FS.nameTable[hash]; node; node = node.name_next) {
					var nodeName = node.name;
					if (node.parent.id === parent.id && nodeName === name) {
						return node;
					}
				}
				// if we failed to find it in the cache, call into the VFS
				return FS.lookup(parent, name);
			},
	createNode(parent, name, mode, rdev) {
				var node = new FS.FSNode(parent, name, mode, rdev);

				FS.hashAddNode(node);

				return node;
			},
	destroyNode(node) {
				FS.hashRemoveNode(node);
			},
	isRoot(node) {
				return node === node.parent;
			},
	isMountpoint(node) {
				return !!node.mounted;
			},
	isFile(mode) {
				return (mode & 61440) === 32768;
			},
	isDir(mode) {
				return (mode & 61440) === 16384;
			},
	isLink(mode) {
				return (mode & 61440) === 40960;
			},
	isChrdev(mode) {
				return (mode & 61440) === 8192;
			},
	isBlkdev(mode) {
				return (mode & 61440) === 24576;
			},
	isFIFO(mode) {
				return (mode & 61440) === 4096;
			},
	isSocket(mode) {
				return (mode & 49152) === 49152;
			},
	flagsToPermissionString(flag) {
				var perms = ['r', 'w', 'rw'][flag & 3];
				if ((flag & 512)) {
					perms += 'w';
				}
				return perms;
			},
	nodePermissions(node, perms) {
				if (FS.ignorePermissions) {
					return 0;
				}
				// return 0 if any user, group or owner bits are set.
				if (perms.includes('r') && !(node.mode & 292)) {
					return 2;
				} else if (perms.includes('w') && !(node.mode & 146)) {
					return 2;
				} else if (perms.includes('x') && !(node.mode & 73)) {
					return 2;
				}
				return 0;
			},
	mayLookup(dir) {
				if (!FS.isDir(dir.mode)) return 54;
				var errCode = FS.nodePermissions(dir, 'x');
				if (errCode) return errCode;
				if (!dir.node_ops.lookup) return 2;
				return 0;
			},
	mayCreate(dir, name) {
				try {
					var node = FS.lookupNode(dir, name);
					return 20;
				} catch (e) {
				}
				return FS.nodePermissions(dir, 'wx');
			},
	mayDelete(dir, name, isdir) {
				var node;
				try {
					node = FS.lookupNode(dir, name);
				} catch (e) {
					return e.errno;
				}
				var errCode = FS.nodePermissions(dir, 'wx');
				if (errCode) {
					return errCode;
				}
				if (isdir) {
					if (!FS.isDir(node.mode)) {
						return 54;
					}
					if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
						return 10;
					}
				} else {
					if (FS.isDir(node.mode)) {
						return 31;
					}
				}
				return 0;
			},
	mayOpen(node, flags) {
				if (!node) {
					return 44;
				}
				if (FS.isLink(node.mode)) {
					return 32;
				} else if (FS.isDir(node.mode)) {
					if (FS.flagsToPermissionString(flags) !== 'r' || // opening for write
							(flags & 512)) { // TODO: check for O_SEARCH? (== search for dir only)
						return 31;
					}
				}
				return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
			},
	MAX_OPEN_FDS:4096,
	nextfd() {
				for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
					if (!FS.streams[fd]) {
						return fd;
					}
				}
				throw new FS.ErrnoError(33);
			},
	getStreamChecked(fd) {
				var stream = FS.getStream(fd);
				if (!stream) {
					throw new FS.ErrnoError(8);
				}
				return stream;
			},
	getStream:(fd) => FS.streams[fd],
	createStream(stream, fd = -1) {

				// clone it, so we can return an instance of FSStream
				stream = Object.assign(new FS.FSStream(), stream);
				if (fd == -1) {
					fd = FS.nextfd();
				}
				stream.fd = fd;
				FS.streams[fd] = stream;
				return stream;
			},
	closeStream(fd) {
				FS.streams[fd] = null;
			},
	dupStream(origStream, fd = -1) {
				var stream = FS.createStream(origStream, fd);
				stream.stream_ops?.dup?.(stream);
				return stream;
			},
	chrdev_stream_ops:{
	open(stream) {
					var device = FS.getDevice(stream.node.rdev);
					// override node's stream ops with the device's
					stream.stream_ops = device.stream_ops;
					// forward the open call
					stream.stream_ops.open?.(stream);
				},
	llseek() {
					throw new FS.ErrnoError(70);
				},
	},
	major:(dev) => ((dev) >> 8),
	minor:(dev) => ((dev) & 0xff),
	makedev:(ma, mi) => ((ma) << 8 | (mi)),
	registerDevice(dev, ops) {
				FS.devices[dev] = { stream_ops: ops };
			},
	getDevice:(dev) => FS.devices[dev],
	getMounts(mount) {
				var mounts = [];
				var check = [mount];

				while (check.length) {
					var m = check.pop();

					mounts.push(m);

					check.push(...m.mounts);
				}

				return mounts;
			},
	syncfs(populate, callback) {
				if (typeof populate == 'function') {
					callback = populate;
					populate = false;
				}

				FS.syncFSRequests++;

				if (FS.syncFSRequests > 1) {
					err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
				}

				var mounts = FS.getMounts(FS.root.mount);
				var completed = 0;

				function doCallback(errCode) {
					FS.syncFSRequests--;
					return callback(errCode);
				}

				function done(errCode) {
					if (errCode) {
						if (!done.errored) {
							done.errored = true;
							return doCallback(errCode);
						}
						return;
					}
					if (++completed >= mounts.length) {
						doCallback(null);
					}
				};

				// sync all mounts
				mounts.forEach((mount) => {
					if (!mount.type.syncfs) {
						return done(null);
					}
					mount.type.syncfs(mount, populate, done);
				});
			},
	mount(type, opts, mountpoint) {
				var root = mountpoint === '/';
				var pseudo = !mountpoint;
				var node;

				if (root && FS.root) {
					throw new FS.ErrnoError(10);
				} else if (!root && !pseudo) {
					var lookup = FS.lookupPath(mountpoint, { follow_mount: false });

					mountpoint = lookup.path;  // use the absolute path
					node = lookup.node;

					if (FS.isMountpoint(node)) {
						throw new FS.ErrnoError(10);
					}

					if (!FS.isDir(node.mode)) {
						throw new FS.ErrnoError(54);
					}
				}

				var mount = {
					type,
					opts,
					mountpoint,
					mounts: []
				};

				// create a root node for the fs
				var mountRoot = type.mount(mount);
				mountRoot.mount = mount;
				mount.root = mountRoot;

				if (root) {
					FS.root = mountRoot;
				} else if (node) {
					// set as a mountpoint
					node.mounted = mount;

					// add the new mount to the current mount's children
					if (node.mount) {
						node.mount.mounts.push(mount);
					}
				}

				return mountRoot;
			},
	unmount(mountpoint) {
				var lookup = FS.lookupPath(mountpoint, { follow_mount: false });

				if (!FS.isMountpoint(lookup.node)) {
					throw new FS.ErrnoError(28);
				}

				// destroy the nodes for this mount, and all its child mounts
				var node = lookup.node;
				var mount = node.mounted;
				var mounts = FS.getMounts(mount);

				Object.keys(FS.nameTable).forEach((hash) => {
					var current = FS.nameTable[hash];

					while (current) {
						var next = current.name_next;

						if (mounts.includes(current.mount)) {
							FS.destroyNode(current);
						}

						current = next;
					}
				});

				// no longer a mountpoint
				node.mounted = null;

				// remove this mount from the child mounts
				var idx = node.mount.mounts.indexOf(mount);
				node.mount.mounts.splice(idx, 1);
			},
	lookup(parent, name) {
				return parent.node_ops.lookup(parent, name);
			},
	mknod(path, mode, dev) {
				var lookup = FS.lookupPath(path, { parent: true });
				var parent = lookup.node;
				var name = PATH.basename(path);
				if (!name || name === '.' || name === '..') {
					throw new FS.ErrnoError(28);
				}
				var errCode = FS.mayCreate(parent, name);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!parent.node_ops.mknod) {
					throw new FS.ErrnoError(63);
				}
				return parent.node_ops.mknod(parent, name, mode, dev);
			},
	create(path, mode) {
				mode = mode !== undefined ? mode : 438 /* 0666 */;
				mode &= 4095;
				mode |= 32768;
				return FS.mknod(path, mode, 0);
			},
	mkdir(path, mode) {
				mode = mode !== undefined ? mode : 511 /* 0777 */;
				mode &= 511 | 512;
				mode |= 16384;
				return FS.mknod(path, mode, 0);
			},
	mkdirTree(path, mode) {
				var dirs = path.split('/');
				var d = '';
				for (var i = 0; i < dirs.length; ++i) {
					if (!dirs[i]) continue;
					d += '/' + dirs[i];
					try {
						FS.mkdir(d, mode);
					} catch(e) {
						if (e.errno != 20) throw e;
					}
				}
			},
	mkdev(path, mode, dev) {
				if (typeof dev == 'undefined') {
					dev = mode;
					mode = 438 /* 0666 */;
				}
				mode |= 8192;
				return FS.mknod(path, mode, dev);
			},
	symlink(oldpath, newpath) {
				if (!PATH_FS.resolve(oldpath)) {
					throw new FS.ErrnoError(44);
				}
				var lookup = FS.lookupPath(newpath, { parent: true });
				var parent = lookup.node;
				if (!parent) {
					throw new FS.ErrnoError(44);
				}
				var newname = PATH.basename(newpath);
				var errCode = FS.mayCreate(parent, newname);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!parent.node_ops.symlink) {
					throw new FS.ErrnoError(63);
				}
				return parent.node_ops.symlink(parent, newname, oldpath);
			},
	rename(old_path, new_path) {
				var old_dirname = PATH.dirname(old_path);
				var new_dirname = PATH.dirname(new_path);
				var old_name = PATH.basename(old_path);
				var new_name = PATH.basename(new_path);
				// parents must exist
				var lookup, old_dir, new_dir;

				// let the errors from non existent directories percolate up
				lookup = FS.lookupPath(old_path, { parent: true });
				old_dir = lookup.node;
				lookup = FS.lookupPath(new_path, { parent: true });
				new_dir = lookup.node;

				if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
				// need to be part of the same mount
				if (old_dir.mount !== new_dir.mount) {
					throw new FS.ErrnoError(75);
				}
				// source must exist
				var old_node = FS.lookupNode(old_dir, old_name);
				// old path should not be an ancestor of the new path
				var relative = PATH_FS.relative(old_path, new_dirname);
				if (relative.charAt(0) !== '.') {
					throw new FS.ErrnoError(28);
				}
				// new path should not be an ancestor of the old path
				relative = PATH_FS.relative(new_path, old_dirname);
				if (relative.charAt(0) !== '.') {
					throw new FS.ErrnoError(55);
				}
				// see if the new path already exists
				var new_node;
				try {
					new_node = FS.lookupNode(new_dir, new_name);
				} catch (e) {
					// not fatal
				}
				// early out if nothing needs to change
				if (old_node === new_node) {
					return;
				}
				// we'll need to delete the old entry
				var isdir = FS.isDir(old_node.mode);
				var errCode = FS.mayDelete(old_dir, old_name, isdir);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				// need delete permissions if we'll be overwriting.
				// need create permissions if new doesn't already exist.
				errCode = new_node ?
					FS.mayDelete(new_dir, new_name, isdir) :
					FS.mayCreate(new_dir, new_name);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!old_dir.node_ops.rename) {
					throw new FS.ErrnoError(63);
				}
				if (FS.isMountpoint(old_node) || (new_node && FS.isMountpoint(new_node))) {
					throw new FS.ErrnoError(10);
				}
				// if we are going to change the parent, check write permissions
				if (new_dir !== old_dir) {
					errCode = FS.nodePermissions(old_dir, 'w');
					if (errCode) {
						throw new FS.ErrnoError(errCode);
					}
				}
				// remove the node from the lookup hash
				FS.hashRemoveNode(old_node);
				// do the underlying fs rename
				try {
					old_dir.node_ops.rename(old_node, new_dir, new_name);
				} catch (e) {
					throw e;
				} finally {
					// add the node back to the hash (in case node_ops.rename
					// changed its name)
					FS.hashAddNode(old_node);
				}
			},
	rmdir(path) {
				var lookup = FS.lookupPath(path, { parent: true });
				var parent = lookup.node;
				var name = PATH.basename(path);
				var node = FS.lookupNode(parent, name);
				var errCode = FS.mayDelete(parent, name, true);
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				if (!parent.node_ops.rmdir) {
					throw new FS.ErrnoError(63);
				}
				if (FS.isMountpoint(node)) {
					throw new FS.ErrnoError(10);
				}
				parent.node_ops.rmdir(parent, name);
				FS.destroyNode(node);
			},
	readdir(path) {
				var lookup = FS.lookupPath(path, { follow: true });
				var node = lookup.node;
				if (!node.node_ops.readdir) {
					throw new FS.ErrnoError(54);
				}
				return node.node_ops.readdir(node);
			},
	unlink(path) {
				var lookup = FS.lookupPath(path, { parent: true });
				var parent = lookup.node;
				if (!parent) {
					throw new FS.ErrnoError(44);
				}
				var name = PATH.basename(path);
				var node = FS.lookupNode(parent, name);
				var errCode = FS.mayDelete(parent, name, false);
				if (errCode) {
					// According to POSIX, we should map EISDIR to EPERM, but
					// we instead do what Linux does (and we must, as we use
					// the musl linux libc).
					throw new FS.ErrnoError(errCode);
				}
				if (!parent.node_ops.unlink) {
					throw new FS.ErrnoError(63);
				}
				if (FS.isMountpoint(node)) {
					throw new FS.ErrnoError(10);
				}
				parent.node_ops.unlink(parent, name);
				FS.destroyNode(node);
			},
	readlink(path) {
				var lookup = FS.lookupPath(path);
				var link = lookup.node;
				if (!link) {
					throw new FS.ErrnoError(44);
				}
				if (!link.node_ops.readlink) {
					throw new FS.ErrnoError(28);
				}
				return PATH_FS.resolve(FS.getPath(link.parent), link.node_ops.readlink(link));
			},
	stat(path, dontFollow) {
				var lookup = FS.lookupPath(path, { follow: !dontFollow });
				var node = lookup.node;
				if (!node) {
					throw new FS.ErrnoError(44);
				}
				if (!node.node_ops.getattr) {
					throw new FS.ErrnoError(63);
				}
				return node.node_ops.getattr(node);
			},
	lstat(path) {
				return FS.stat(path, true);
			},
	chmod(path, mode, dontFollow) {
				var node;
				if (typeof path == 'string') {
					var lookup = FS.lookupPath(path, { follow: !dontFollow });
					node = lookup.node;
				} else {
					node = path;
				}
				if (!node.node_ops.setattr) {
					throw new FS.ErrnoError(63);
				}
				node.node_ops.setattr(node, {
					mode: (mode & 4095) | (node.mode & ~4095),
					timestamp: Date.now()
				});
			},
	lchmod(path, mode) {
				FS.chmod(path, mode, true);
			},
	fchmod(fd, mode) {
				var stream = FS.getStreamChecked(fd);
				FS.chmod(stream.node, mode);
			},
	chown(path, uid, gid, dontFollow) {
				var node;
				if (typeof path == 'string') {
					var lookup = FS.lookupPath(path, { follow: !dontFollow });
					node = lookup.node;
				} else {
					node = path;
				}
				if (!node.node_ops.setattr) {
					throw new FS.ErrnoError(63);
				}
				node.node_ops.setattr(node, {
					timestamp: Date.now()
					// we ignore the uid / gid for now
				});
			},
	lchown(path, uid, gid) {
				FS.chown(path, uid, gid, true);
			},
	fchown(fd, uid, gid) {
				var stream = FS.getStreamChecked(fd);
				FS.chown(stream.node, uid, gid);
			},
	truncate(path, len) {
				if (len < 0) {
					throw new FS.ErrnoError(28);
				}
				var node;
				if (typeof path == 'string') {
					var lookup = FS.lookupPath(path, { follow: true });
					node = lookup.node;
				} else {
					node = path;
				}
				if (!node.node_ops.setattr) {
					throw new FS.ErrnoError(63);
				}
				if (FS.isDir(node.mode)) {
					throw new FS.ErrnoError(31);
				}
				if (!FS.isFile(node.mode)) {
					throw new FS.ErrnoError(28);
				}
				var errCode = FS.nodePermissions(node, 'w');
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				node.node_ops.setattr(node, {
					size: len,
					timestamp: Date.now()
				});
			},
	ftruncate(fd, len) {
				var stream = FS.getStreamChecked(fd);
				if ((stream.flags & 2097155) === 0) {
					throw new FS.ErrnoError(28);
				}
				FS.truncate(stream.node, len);
			},
	utime(path, atime, mtime) {
				var lookup = FS.lookupPath(path, { follow: true });
				var node = lookup.node;
				node.node_ops.setattr(node, {
					timestamp: Math.max(atime, mtime)
				});
			},
	open(path, flags, mode) {
				if (path === "") {
					throw new FS.ErrnoError(44);
				}
				flags = typeof flags == 'string' ? FS_modeStringToFlags(flags) : flags;
				mode = typeof mode == 'undefined' ? 438 /* 0666 */ : mode;
				if ((flags & 64)) {
					mode = (mode & 4095) | 32768;
				} else {
					mode = 0;
				}
				var node;
				if (typeof path == 'object') {
					node = path;
				} else {
					path = PATH.normalize(path);
					try {
						var lookup = FS.lookupPath(path, {
							follow: !(flags & 131072)
						});
						node = lookup.node;
					} catch (e) {
						// ignore
					}
				}
				// perhaps we need to create the node
				var created = false;
				if ((flags & 64)) {
					if (node) {
						// if O_CREAT and O_EXCL are set, error out if the node already exists
						if ((flags & 128)) {
							throw new FS.ErrnoError(20);
						}
					} else {
						// node doesn't exist, try to create it
						node = FS.mknod(path, mode, 0);
						created = true;
					}
				}
				if (!node) {
					throw new FS.ErrnoError(44);
				}
				// can't truncate a device
				if (FS.isChrdev(node.mode)) {
					flags &= ~512;
				}
				// if asked only for a directory, then this must be one
				if ((flags & 65536) && !FS.isDir(node.mode)) {
					throw new FS.ErrnoError(54);
				}
				// check permissions, if this is not a file we just created now (it is ok to
				// create and write to a file with read-only permissions; it is read-only
				// for later use)
				if (!created) {
					var errCode = FS.mayOpen(node, flags);
					if (errCode) {
						throw new FS.ErrnoError(errCode);
					}
				}
				// do truncation if necessary
				if ((flags & 512) && !created) {
					FS.truncate(node, 0);
				}
				// we've already handled these, don't pass down to the underlying vfs
				flags &= ~(128 | 512 | 131072);

				// register the stream with the filesystem
				var stream = FS.createStream({
					node,
					path: FS.getPath(node),  // we want the absolute path to the node
					flags,
					seekable: true,
					position: 0,
					stream_ops: node.stream_ops,
					// used by the file family libc calls (fopen, fwrite, ferror, etc.)
					ungotten: [],
					error: false
				});
				// call the new stream's open function
				if (stream.stream_ops.open) {
					stream.stream_ops.open(stream);
				}
				if (Module['logReadFiles'] && !(flags & 1)) {
					if (!FS.readFiles) FS.readFiles = {};
					if (!(path in FS.readFiles)) {
						FS.readFiles[path] = 1;
					}
				}
				return stream;
			},
	close(stream) {
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if (stream.getdents) stream.getdents = null; // free readdir state
				try {
					if (stream.stream_ops.close) {
						stream.stream_ops.close(stream);
					}
				} catch (e) {
					throw e;
				} finally {
					FS.closeStream(stream.fd);
				}
				stream.fd = null;
			},
	isClosed(stream) {
				return stream.fd === null;
			},
	llseek(stream, offset, whence) {
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if (!stream.seekable || !stream.stream_ops.llseek) {
					throw new FS.ErrnoError(70);
				}
				if (whence != 0 && whence != 1 && whence != 2) {
					throw new FS.ErrnoError(28);
				}
				stream.position = stream.stream_ops.llseek(stream, offset, whence);
				stream.ungotten = [];
				return stream.position;
			},
	read(stream, buffer, offset, length, position) {
				if (length < 0 || position < 0) {
					throw new FS.ErrnoError(28);
				}
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if ((stream.flags & 2097155) === 1) {
					throw new FS.ErrnoError(8);
				}
				if (FS.isDir(stream.node.mode)) {
					throw new FS.ErrnoError(31);
				}
				if (!stream.stream_ops.read) {
					throw new FS.ErrnoError(28);
				}
				var seeking = typeof position != 'undefined';
				if (!seeking) {
					position = stream.position;
				} else if (!stream.seekable) {
					throw new FS.ErrnoError(70);
				}
				var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
				if (!seeking) stream.position += bytesRead;
				return bytesRead;
			},
	write(stream, buffer, offset, length, position, canOwn) {
				if (length < 0 || position < 0) {
					throw new FS.ErrnoError(28);
				}
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if ((stream.flags & 2097155) === 0) {
					throw new FS.ErrnoError(8);
				}
				if (FS.isDir(stream.node.mode)) {
					throw new FS.ErrnoError(31);
				}
				if (!stream.stream_ops.write) {
					throw new FS.ErrnoError(28);
				}
				if (stream.seekable && stream.flags & 1024) {
					// seek to the end before writing in append mode
					FS.llseek(stream, 0, 2);
				}
				var seeking = typeof position != 'undefined';
				if (!seeking) {
					position = stream.position;
				} else if (!stream.seekable) {
					throw new FS.ErrnoError(70);
				}
				var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
				if (!seeking) stream.position += bytesWritten;
				return bytesWritten;
			},
	allocate(stream, offset, length) {
				if (FS.isClosed(stream)) {
					throw new FS.ErrnoError(8);
				}
				if (offset < 0 || length <= 0) {
					throw new FS.ErrnoError(28);
				}
				if ((stream.flags & 2097155) === 0) {
					throw new FS.ErrnoError(8);
				}
				if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
					throw new FS.ErrnoError(43);
				}
				if (!stream.stream_ops.allocate) {
					throw new FS.ErrnoError(138);
				}
				stream.stream_ops.allocate(stream, offset, length);
			},
	mmap(stream, length, position, prot, flags) {
				// User requests writing to file (prot & PROT_WRITE != 0).
				// Checking if we have permissions to write to the file unless
				// MAP_PRIVATE flag is set. According to POSIX spec it is possible
				// to write to file opened in read-only mode with MAP_PRIVATE flag,
				// as all modifications will be visible only in the memory of
				// the current process.
				if ((prot & 2) !== 0
						&& (flags & 2) === 0
						&& (stream.flags & 2097155) !== 2) {
					throw new FS.ErrnoError(2);
				}
				if ((stream.flags & 2097155) === 1) {
					throw new FS.ErrnoError(2);
				}
				if (!stream.stream_ops.mmap) {
					throw new FS.ErrnoError(43);
				}
				return stream.stream_ops.mmap(stream, length, position, prot, flags);
			},
	msync(stream, buffer, offset, length, mmapFlags) {
				if (!stream.stream_ops.msync) {
					return 0;
				}
				return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
			},
	ioctl(stream, cmd, arg) {
				if (!stream.stream_ops.ioctl) {
					throw new FS.ErrnoError(59);
				}
				return stream.stream_ops.ioctl(stream, cmd, arg);
			},
	readFile(path, opts = {}) {
				opts.flags = opts.flags || 0;
				opts.encoding = opts.encoding || 'binary';
				if (opts.encoding !== 'utf8' && opts.encoding !== 'binary') {
					throw new Error(`Invalid encoding type "${opts.encoding}"`);
				}
				var ret;
				var stream = FS.open(path, opts.flags);
				var stat = FS.stat(path);
				var length = stat.size;
				var buf = new Uint8Array(length);
				FS.read(stream, buf, 0, length, 0);
				if (opts.encoding === 'utf8') {
					ret = UTF8ArrayToString(buf, 0);
				} else if (opts.encoding === 'binary') {
					ret = buf;
				}
				FS.close(stream);
				return ret;
			},
	writeFile(path, data, opts = {}) {
				opts.flags = opts.flags || 577;
				var stream = FS.open(path, opts.flags, opts.mode);
				if (typeof data == 'string') {
					var buf = new Uint8Array(lengthBytesUTF8(data)+1);
					var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
					FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
				} else if (ArrayBuffer.isView(data)) {
					FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
				} else {
					throw new Error('Unsupported data type');
				}
				FS.close(stream);
			},
	cwd:() => FS.currentPath,
	chdir(path) {
				var lookup = FS.lookupPath(path, { follow: true });
				if (lookup.node === null) {
					throw new FS.ErrnoError(44);
				}
				if (!FS.isDir(lookup.node.mode)) {
					throw new FS.ErrnoError(54);
				}
				var errCode = FS.nodePermissions(lookup.node, 'x');
				if (errCode) {
					throw new FS.ErrnoError(errCode);
				}
				FS.currentPath = lookup.path;
			},
	createDefaultDirectories() {
				FS.mkdir('/tmp');
				FS.mkdir('/home');
				FS.mkdir('/home/web_user');
			},
	createDefaultDevices() {
				// create /dev
				FS.mkdir('/dev');
				// setup /dev/null
				FS.registerDevice(FS.makedev(1, 3), {
					read: () => 0,
					write: (stream, buffer, offset, length, pos) => length,
				});
				FS.mkdev('/dev/null', FS.makedev(1, 3));
				// setup /dev/tty and /dev/tty1
				// stderr needs to print output using err() rather than out()
				// so we register a second tty just for it.
				TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
				TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
				FS.mkdev('/dev/tty', FS.makedev(5, 0));
				FS.mkdev('/dev/tty1', FS.makedev(6, 0));
				// setup /dev/[u]random
				// use a buffer to avoid overhead of individual crypto calls per byte
				var randomBuffer = new Uint8Array(1024), randomLeft = 0;
				var randomByte = () => {
					if (randomLeft === 0) {
						randomLeft = randomFill(randomBuffer).byteLength;
					}
					return randomBuffer[--randomLeft];
				};
				FS.createDevice('/dev', 'random', randomByte);
				FS.createDevice('/dev', 'urandom', randomByte);
				// we're not going to emulate the actual shm device,
				// just create the tmp dirs that reside in it commonly
				FS.mkdir('/dev/shm');
				FS.mkdir('/dev/shm/tmp');
			},
	createSpecialDirectories() {
				// create /proc/self/fd which allows /proc/self/fd/6 => readlink gives the
				// name of the stream for fd 6 (see test_unistd_ttyname)
				FS.mkdir('/proc');
				var proc_self = FS.mkdir('/proc/self');
				FS.mkdir('/proc/self/fd');
				FS.mount({
					mount() {
						var node = FS.createNode(proc_self, 'fd', 16384 | 511 /* 0777 */, 73);
						node.node_ops = {
							lookup(parent, name) {
								var fd = +name;
								var stream = FS.getStreamChecked(fd);
								var ret = {
									parent: null,
									mount: { mountpoint: 'fake' },
									node_ops: { readlink: () => stream.path },
								};
								ret.parent = ret; // make it look like a simple root node
								return ret;
							}
						};
						return node;
					}
				}, {}, '/proc/self/fd');
			},
	createStandardStreams() {
				// TODO deprecate the old functionality of a single
				// input / output callback and that utilizes FS.createDevice
				// and instead require a unique set of stream ops

				// by default, we symlink the standard streams to the
				// default tty devices. however, if the standard streams
				// have been overwritten we create a unique device for
				// them instead.
				if (Module['stdin']) {
					FS.createDevice('/dev', 'stdin', Module['stdin']);
				} else {
					FS.symlink('/dev/tty', '/dev/stdin');
				}
				if (Module['stdout']) {
					FS.createDevice('/dev', 'stdout', null, Module['stdout']);
				} else {
					FS.symlink('/dev/tty', '/dev/stdout');
				}
				if (Module['stderr']) {
					FS.createDevice('/dev', 'stderr', null, Module['stderr']);
				} else {
					FS.symlink('/dev/tty1', '/dev/stderr');
				}

				// open default streams for the stdin, stdout and stderr devices
				var stdin = FS.open('/dev/stdin', 1);
				var stdout = FS.open('/dev/stdout', 1);
				var stderr = FS.open('/dev/stderr', 1);
			},
	staticInit() {
				// Some errors may happen quite a bit, to avoid overhead we reuse them (and suffer a lack of stack info)
				[44].forEach((code) => {
					FS.genericErrors[code] = new FS.ErrnoError(code);
					FS.genericErrors[code].stack = '<generic error, no stack>';
				});

				FS.nameTable = new Array(4096);

				FS.mount(MEMFS, {}, '/');

				FS.createDefaultDirectories();
				FS.createDefaultDevices();
				FS.createSpecialDirectories();

				FS.filesystems = {
					'MEMFS': MEMFS,
				};
			},
	init(input, output, error) {
				FS.init.initialized = true;

				// Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
				Module['stdin'] = input || Module['stdin'];
				Module['stdout'] = output || Module['stdout'];
				Module['stderr'] = error || Module['stderr'];

				FS.createStandardStreams();
			},
	quit() {
				FS.init.initialized = false;
				// force-flush all streams, so we get musl std streams printed out
				// close all of our streams
				for (var i = 0; i < FS.streams.length; i++) {
					var stream = FS.streams[i];
					if (!stream) {
						continue;
					}
					FS.close(stream);
				}
			},
	findObject(path, dontResolveLastLink) {
				var ret = FS.analyzePath(path, dontResolveLastLink);
				if (!ret.exists) {
					return null;
				}
				return ret.object;
			},
	analyzePath(path, dontResolveLastLink) {
				// operate from within the context of the symlink's target
				try {
					var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
					path = lookup.path;
				} catch (e) {
				}
				var ret = {
					isRoot: false, exists: false, error: 0, name: null, path: null, object: null,
					parentExists: false, parentPath: null, parentObject: null
				};
				try {
					var lookup = FS.lookupPath(path, { parent: true });
					ret.parentExists = true;
					ret.parentPath = lookup.path;
					ret.parentObject = lookup.node;
					ret.name = PATH.basename(path);
					lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
					ret.exists = true;
					ret.path = lookup.path;
					ret.object = lookup.node;
					ret.name = lookup.node.name;
					ret.isRoot = lookup.path === '/';
				} catch (e) {
					ret.error = e.errno;
				};
				return ret;
			},
	createPath(parent, path, canRead, canWrite) {
				parent = typeof parent == 'string' ? parent : FS.getPath(parent);
				var parts = path.split('/').reverse();
				while (parts.length) {
					var part = parts.pop();
					if (!part) continue;
					var current = PATH.join2(parent, part);
					try {
						FS.mkdir(current);
					} catch (e) {
						// ignore EEXIST
					}
					parent = current;
				}
				return current;
			},
	createFile(parent, name, properties, canRead, canWrite) {
				var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
				var mode = FS_getMode(canRead, canWrite);
				return FS.create(path, mode);
			},
	createDataFile(parent, name, data, canRead, canWrite, canOwn) {
				var path = name;
				if (parent) {
					parent = typeof parent == 'string' ? parent : FS.getPath(parent);
					path = name ? PATH.join2(parent, name) : parent;
				}
				var mode = FS_getMode(canRead, canWrite);
				var node = FS.create(path, mode);
				if (data) {
					if (typeof data == 'string') {
						var arr = new Array(data.length);
						for (var i = 0, len = data.length; i < len; ++i) arr[i] = data.charCodeAt(i);
						data = arr;
					}
					// make sure we can write to the file
					FS.chmod(node, mode | 146);
					var stream = FS.open(node, 577);
					FS.write(stream, data, 0, data.length, 0, canOwn);
					FS.close(stream);
					FS.chmod(node, mode);
				}
			},
	createDevice(parent, name, input, output) {
				var path = PATH.join2(typeof parent == 'string' ? parent : FS.getPath(parent), name);
				var mode = FS_getMode(!!input, !!output);
				if (!FS.createDevice.major) FS.createDevice.major = 64;
				var dev = FS.makedev(FS.createDevice.major++, 0);
				// Create a fake device that a set of stream ops to emulate
				// the old behavior.
				FS.registerDevice(dev, {
					open(stream) {
						stream.seekable = false;
					},
					close(stream) {
						// flush any pending line data
						if (output?.buffer?.length) {
							output(10);
						}
					},
					read(stream, buffer, offset, length, pos /* ignored */) {
						var bytesRead = 0;
						for (var i = 0; i < length; i++) {
							var result;
							try {
								result = input();
							} catch (e) {
								throw new FS.ErrnoError(29);
							}
							if (result === undefined && bytesRead === 0) {
								throw new FS.ErrnoError(6);
							}
							if (result === null || result === undefined) break;
							bytesRead++;
							buffer[offset+i] = result;
						}
						if (bytesRead) {
							stream.node.timestamp = Date.now();
						}
						return bytesRead;
					},
					write(stream, buffer, offset, length, pos) {
						for (var i = 0; i < length; i++) {
							try {
								output(buffer[offset+i]);
							} catch (e) {
								throw new FS.ErrnoError(29);
							}
						}
						if (length) {
							stream.node.timestamp = Date.now();
						}
						return i;
					}
				});
				return FS.mkdev(path, mode, dev);
			},
	forceLoadFile(obj) {
				if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
				if (typeof XMLHttpRequest != 'undefined') {
					throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
				} else if (read_) {
					// Command-line.
					try {
						// WARNING: Can't read binary files in V8's d8 or tracemonkey's js, as
						//          read() will try to parse UTF8.
						obj.contents = intArrayFromString(read_(obj.url), true);
						obj.usedBytes = obj.contents.length;
					} catch (e) {
						throw new FS.ErrnoError(29);
					}
				} else {
					throw new Error('Cannot load without read() or XMLHttpRequest.');
				}
			},
	createLazyFile(parent, name, url, canRead, canWrite) {
				// Lazy chunked Uint8Array (implements get and length from Uint8Array).
				// Actual getting is abstracted away for eventual reuse.
				class LazyUint8Array {
					constructor() {
						this.lengthKnown = false;
						this.chunks = []; // Loaded chunks. Index is the chunk number
					}
					get(idx) {
						if (idx > this.length-1 || idx < 0) {
							return undefined;
						}
						var chunkOffset = idx % this.chunkSize;
						var chunkNum = (idx / this.chunkSize)|0;
						return this.getter(chunkNum)[chunkOffset];
					}
					setDataGetter(getter) {
						this.getter = getter;
					}
					cacheLength() {
						// Find length
						var xhr = new XMLHttpRequest();
						xhr.open('HEAD', url, false);
						xhr.send(null);
						if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
						var datalength = Number(xhr.getResponseHeader("Content-length"));
						var header;
						var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
						var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";

						var chunkSize = 1024*1024; // Chunk size in bytes

						if (!hasByteServing) chunkSize = datalength;

						// Function to get a range from the remote URL.
						var doXHR = (from, to) => {
							if (from > to) throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
							if (to > datalength-1) throw new Error("only " + datalength + " bytes available! programmer error!");

							// TODO: Use mozResponseArrayBuffer, responseStream, etc. if available.
							var xhr = new XMLHttpRequest();
							xhr.open('GET', url, false);
							if (datalength !== chunkSize) xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);

							// Some hints to the browser that we want binary data.
							xhr.responseType = 'arraybuffer';
							if (xhr.overrideMimeType) {
								xhr.overrideMimeType('text/plain; charset=x-user-defined');
							}

							xhr.send(null);
							if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)) throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
							if (xhr.response !== undefined) {
								return new Uint8Array(/** @type{Array<number>} */(xhr.response || []));
							}
							return intArrayFromString(xhr.responseText || '', true);
						};
						var lazyArray = this;
						lazyArray.setDataGetter((chunkNum) => {
							var start = chunkNum * chunkSize;
							var end = (chunkNum+1) * chunkSize - 1; // including this byte
							end = Math.min(end, datalength-1); // if datalength-1 is selected, this is the last block
							if (typeof lazyArray.chunks[chunkNum] == 'undefined') {
								lazyArray.chunks[chunkNum] = doXHR(start, end);
							}
							if (typeof lazyArray.chunks[chunkNum] == 'undefined') throw new Error('doXHR failed!');
							return lazyArray.chunks[chunkNum];
						});

						if (usesGzip || !datalength) {
							// if the server uses gzip or doesn't supply the length, we have to download the whole file to get the (uncompressed) length
							chunkSize = datalength = 1; // this will force getter(0)/doXHR do download the whole file
							datalength = this.getter(0).length;
							chunkSize = datalength;
							out("LazyFiles on gzip forces download of the whole file when length is accessed");
						}

						this._length = datalength;
						this._chunkSize = chunkSize;
						this.lengthKnown = true;
					}
					get length() {
						if (!this.lengthKnown) {
							this.cacheLength();
						}
						return this._length;
					}
					get chunkSize() {
						if (!this.lengthKnown) {
							this.cacheLength();
						}
						return this._chunkSize;
					}
				}

				if (typeof XMLHttpRequest != 'undefined') {
					if (!ENVIRONMENT_IS_WORKER) throw 'Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc';
					var lazyArray = new LazyUint8Array();
					var properties = { isDevice: false, contents: lazyArray };
				} else {
					var properties = { isDevice: false, url: url };
				}

				var node = FS.createFile(parent, name, properties, canRead, canWrite);
				// This is a total hack, but I want to get this lazy file code out of the
				// core of MEMFS. If we want to keep this lazy file concept I feel it should
				// be its own thin LAZYFS proxying calls to MEMFS.
				if (properties.contents) {
					node.contents = properties.contents;
				} else if (properties.url) {
					node.contents = null;
					node.url = properties.url;
				}
				// Add a function that defers querying the file size until it is asked the first time.
				Object.defineProperties(node, {
					usedBytes: {
						get: function() { return this.contents.length; }
					}
				});
				// override each stream op with one that tries to force load the lazy file first
				var stream_ops = {};
				var keys = Object.keys(node.stream_ops);
				keys.forEach((key) => {
					var fn = node.stream_ops[key];
					stream_ops[key] = (...args) => {
						FS.forceLoadFile(node);
						return fn(...args);
					};
				});
				function writeChunks(stream, buffer, offset, length, position) {
					var contents = stream.node.contents;
					if (position >= contents.length)
						return 0;
					var size = Math.min(contents.length - position, length);
					if (contents.slice) { // normal array
						for (var i = 0; i < size; i++) {
							buffer[offset + i] = contents[position + i];
						}
					} else {
						for (var i = 0; i < size; i++) { // LazyUint8Array from sync binary XHR
							buffer[offset + i] = contents.get(position + i);
						}
					}
					return size;
				}
				// use a custom read function
				stream_ops.read = (stream, buffer, offset, length, position) => {
					FS.forceLoadFile(node);
					return writeChunks(stream, buffer, offset, length, position)
				};
				// use a custom mmap function
				stream_ops.mmap = (stream, length, position, prot, flags) => {
					FS.forceLoadFile(node);
					var ptr = mmapAlloc(length);
					if (!ptr) {
						throw new FS.ErrnoError(48);
					}
					writeChunks(stream, HEAP8, ptr, length, position);
					return { ptr, allocated: true };
				};
				node.stream_ops = stream_ops;
				return node;
			},
	};

	var SYSCALLS = {
	DEFAULT_POLLMASK:5,
	calculateAt(dirfd, path, allowEmpty) {
				if (PATH.isAbs(path)) {
					return path;
				}
				// relative path
				var dir;
				if (dirfd === -100) {
					dir = FS.cwd();
				} else {
					var dirstream = SYSCALLS.getStreamFromFD(dirfd);
					dir = dirstream.path;
				}
				if (path.length == 0) {
					if (!allowEmpty) {
						throw new FS.ErrnoError(44);;
					}
					return dir;
				}
				return PATH.join2(dir, path);
			},
	doStat(func, path, buf) {
				var stat = func(path);
				HEAP32[((buf)>>2)] = stat.dev;
				HEAP32[(((buf)+(4))>>2)] = stat.mode;
				HEAPU32[(((buf)+(8))>>2)] = stat.nlink;
				HEAP32[(((buf)+(12))>>2)] = stat.uid;
				HEAP32[(((buf)+(16))>>2)] = stat.gid;
				HEAP32[(((buf)+(20))>>2)] = stat.rdev;
				(tempI64 = [stat.size>>>0,(tempDouble = stat.size,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(24))>>2)] = tempI64[0],HEAP32[(((buf)+(28))>>2)] = tempI64[1]);
				HEAP32[(((buf)+(32))>>2)] = 4096;
				HEAP32[(((buf)+(36))>>2)] = stat.blocks;
				var atime = stat.atime.getTime();
				var mtime = stat.mtime.getTime();
				var ctime = stat.ctime.getTime();
				(tempI64 = [Math.floor(atime / 1000)>>>0,(tempDouble = Math.floor(atime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(40))>>2)] = tempI64[0],HEAP32[(((buf)+(44))>>2)] = tempI64[1]);
				HEAPU32[(((buf)+(48))>>2)] = (atime % 1000) * 1000;
				(tempI64 = [Math.floor(mtime / 1000)>>>0,(tempDouble = Math.floor(mtime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(56))>>2)] = tempI64[0],HEAP32[(((buf)+(60))>>2)] = tempI64[1]);
				HEAPU32[(((buf)+(64))>>2)] = (mtime % 1000) * 1000;
				(tempI64 = [Math.floor(ctime / 1000)>>>0,(tempDouble = Math.floor(ctime / 1000),(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(72))>>2)] = tempI64[0],HEAP32[(((buf)+(76))>>2)] = tempI64[1]);
				HEAPU32[(((buf)+(80))>>2)] = (ctime % 1000) * 1000;
				(tempI64 = [stat.ino>>>0,(tempDouble = stat.ino,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((buf)+(88))>>2)] = tempI64[0],HEAP32[(((buf)+(92))>>2)] = tempI64[1]);
				return 0;
			},
	doMsync(addr, stream, len, flags, offset) {
				if (!FS.isFile(stream.node.mode)) {
					throw new FS.ErrnoError(43);
				}
				if (flags & 2) {
					// MAP_PRIVATE calls need not to be synced back to underlying fs
					return 0;
				}
				var buffer = HEAPU8.slice(addr, addr + len);
				FS.msync(stream, buffer, offset, len, flags);
			},
	varargs:undefined,
	get() {
				// the `+` prepended here is necessary to convince the JSCompiler that varargs is indeed a number.
				var ret = HEAP32[((+SYSCALLS.varargs)>>2)];
				SYSCALLS.varargs += 4;
				return ret;
			},
	getp() { return SYSCALLS.get() },
	getStr(ptr) {
				var ret = UTF8ToString(ptr);
				return ret;
			},
	getStreamFromFD(fd) {
				var stream = FS.getStreamChecked(fd);
				return stream;
			},
	};
	function ___syscall__newselect(nfds, readfds, writefds, exceptfds, timeout) {
	try {

			// readfds are supported,
			// writefds checks socket open status
			// exceptfds are supported, although on web, such exceptional conditions never arise in web sockets
			//                          and so the exceptfds list will always return empty.
			// timeout is supported, although on SOCKFS and PIPEFS these are ignored and always treated as 0 - fully async

			var total = 0;

			var srcReadLow = (readfds ? HEAP32[((readfds)>>2)] : 0),
					srcReadHigh = (readfds ? HEAP32[(((readfds)+(4))>>2)] : 0);
			var srcWriteLow = (writefds ? HEAP32[((writefds)>>2)] : 0),
					srcWriteHigh = (writefds ? HEAP32[(((writefds)+(4))>>2)] : 0);
			var srcExceptLow = (exceptfds ? HEAP32[((exceptfds)>>2)] : 0),
					srcExceptHigh = (exceptfds ? HEAP32[(((exceptfds)+(4))>>2)] : 0);

			var dstReadLow = 0,
					dstReadHigh = 0;
			var dstWriteLow = 0,
					dstWriteHigh = 0;
			var dstExceptLow = 0,
					dstExceptHigh = 0;

			var allLow = (readfds ? HEAP32[((readfds)>>2)] : 0) |
									(writefds ? HEAP32[((writefds)>>2)] : 0) |
									(exceptfds ? HEAP32[((exceptfds)>>2)] : 0);
			var allHigh = (readfds ? HEAP32[(((readfds)+(4))>>2)] : 0) |
										(writefds ? HEAP32[(((writefds)+(4))>>2)] : 0) |
										(exceptfds ? HEAP32[(((exceptfds)+(4))>>2)] : 0);

			var check = function(fd, low, high, val) {
				return (fd < 32 ? (low & val) : (high & val));
			};

			for (var fd = 0; fd < nfds; fd++) {
				var mask = 1 << (fd % 32);
				if (!(check(fd, allLow, allHigh, mask))) {
					continue;  // index isn't in the set
				}

				var stream = SYSCALLS.getStreamFromFD(fd);

				var flags = SYSCALLS.DEFAULT_POLLMASK;

				if (stream.stream_ops.poll) {
					var timeoutInMillis = -1;
					if (timeout) {
						// select(2) is declared to accept "struct timeval { time_t tv_sec; suseconds_t tv_usec; }".
						// However, musl passes the two values to the syscall as an array of long values.
						// Note that sizeof(time_t) != sizeof(long) in wasm32. The former is 8, while the latter is 4.
						// This means using "C_STRUCTS.timeval.tv_usec" leads to a wrong offset.
						// So, instead, we use POINTER_SIZE.
						var tv_sec = (readfds ? HEAP32[((timeout)>>2)] : 0),
								tv_usec = (readfds ? HEAP32[(((timeout)+(4))>>2)] : 0);
						timeoutInMillis = (tv_sec + tv_usec / 1000000) * 1000;
					}
					flags = stream.stream_ops.poll(stream, timeoutInMillis);
				}

				if ((flags & 1) && check(fd, srcReadLow, srcReadHigh, mask)) {
					fd < 32 ? (dstReadLow = dstReadLow | mask) : (dstReadHigh = dstReadHigh | mask);
					total++;
				}
				if ((flags & 4) && check(fd, srcWriteLow, srcWriteHigh, mask)) {
					fd < 32 ? (dstWriteLow = dstWriteLow | mask) : (dstWriteHigh = dstWriteHigh | mask);
					total++;
				}
				if ((flags & 2) && check(fd, srcExceptLow, srcExceptHigh, mask)) {
					fd < 32 ? (dstExceptLow = dstExceptLow | mask) : (dstExceptHigh = dstExceptHigh | mask);
					total++;
				}
			}

			if (readfds) {
				HEAP32[((readfds)>>2)] = dstReadLow;
				HEAP32[(((readfds)+(4))>>2)] = dstReadHigh;
			}
			if (writefds) {
				HEAP32[((writefds)>>2)] = dstWriteLow;
				HEAP32[(((writefds)+(4))>>2)] = dstWriteHigh;
			}
			if (exceptfds) {
				HEAP32[((exceptfds)>>2)] = dstExceptLow;
				HEAP32[(((exceptfds)+(4))>>2)] = dstExceptHigh;
			}

			return total;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}

	var SOCKFS = {
	mount(mount) {
				// If Module['websocket'] has already been defined (e.g. for configuring
				// the subprotocol/url) use that, if not initialise it to a new object.
				Module['websocket'] = (Module['websocket'] &&
															('object' === typeof Module['websocket'])) ? Module['websocket'] : {};

				// Add the Event registration mechanism to the exported websocket configuration
				// object so we can register network callbacks from native JavaScript too.
				// For more documentation see system/include/emscripten/emscripten.h
				Module['websocket']._callbacks = {};
				Module['websocket']['on'] = /** @this{Object} */ function(event, callback) {
					if ('function' === typeof callback) {
						this._callbacks[event] = callback;
					}
					return this;
				};

				Module['websocket'].emit = /** @this{Object} */ function(event, param) {
					if ('function' === typeof this._callbacks[event]) {
						this._callbacks[event].call(this, param);
					}
				};

				// If debug is enabled register simple default logging callbacks for each Event.

				return FS.createNode(null, '/', 16384 | 511 /* 0777 */, 0);
			},
	createSocket(family, type, protocol) {
				type &= ~526336; // Some applications may pass it; it makes no sense for a single process.
				var streaming = type == 1;
				if (streaming && protocol && protocol != 6) {
					throw new FS.ErrnoError(66); // if SOCK_STREAM, must be tcp or 0.
				}

				// create our internal socket structure
				var sock = {
					family,
					type,
					protocol,
					server: null,
					error: null, // Used in getsockopt for SOL_SOCKET/SO_ERROR test
					peers: {},
					pending: [],
					recv_queue: [],
					sock_ops: SOCKFS.websocket_sock_ops
				};

				// create the filesystem node to store the socket structure
				var name = SOCKFS.nextname();
				var node = FS.createNode(SOCKFS.root, name, 49152, 0);
				node.sock = sock;

				// and the wrapping stream that enables library functions such
				// as read and write to indirectly interact with the socket
				var stream = FS.createStream({
					path: name,
					node,
					flags: 2,
					seekable: false,
					stream_ops: SOCKFS.stream_ops
				});

				// map the new stream to the socket structure (sockets have a 1:1
				// relationship with a stream)
				sock.stream = stream;

				return sock;
			},
	getSocket(fd) {
				var stream = FS.getStream(fd);
				if (!stream || !FS.isSocket(stream.node.mode)) {
					return null;
				}
				return stream.node.sock;
			},
	stream_ops:{
	poll(stream) {
					var sock = stream.node.sock;
					return sock.sock_ops.poll(sock);
				},
	ioctl(stream, request, varargs) {
					var sock = stream.node.sock;
					return sock.sock_ops.ioctl(sock, request, varargs);
				},
	read(stream, buffer, offset, length, position /* ignored */) {
					var sock = stream.node.sock;
					var msg = sock.sock_ops.recvmsg(sock, length);
					if (!msg) {
						// socket is closed
						return 0;
					}
					buffer.set(msg.buffer, offset);
					return msg.buffer.length;
				},
	write(stream, buffer, offset, length, position /* ignored */) {
					var sock = stream.node.sock;
					return sock.sock_ops.sendmsg(sock, buffer, offset, length);
				},
	close(stream) {
					var sock = stream.node.sock;
					sock.sock_ops.close(sock);
				},
	},
	nextname() {
				if (!SOCKFS.nextname.current) {
					SOCKFS.nextname.current = 0;
				}
				return 'socket[' + (SOCKFS.nextname.current++) + ']';
			},
	websocket_sock_ops:{
	createPeer(sock, addr, port) {
					var ws;

					if (typeof addr == 'object') {
						ws = addr;
						addr = null;
						port = null;
					}

					if (ws) {
						// for sockets that've already connected (e.g. we're the server)
						// we can inspect the _socket property for the address
						if (ws._socket) {
							addr = ws._socket.remoteAddress;
							port = ws._socket.remotePort;
						}
						// if we're just now initializing a connection to the remote,
						// inspect the url property
						else {
							var result = /ws[s]?:\/\/([^:]+):(\d+)/.exec(ws.url);
							if (!result) {
								throw new Error('WebSocket URL must be in the format ws(s)://address:port');
							}
							addr = result[1];
							port = parseInt(result[2], 10);
						}
					} else {
						// create the actual websocket object and connect
						try {
							// runtimeConfig gets set to true if WebSocket runtime configuration is available.
							var runtimeConfig = (Module['websocket'] && ('object' === typeof Module['websocket']));

							// The default value is 'ws://' the replace is needed because the compiler replaces '//' comments with '#'
							// comments without checking context, so we'd end up with ws:#, the replace swaps the '#' for '//' again.
							var url = 'ws:#'.replace('#', '//');

							if (runtimeConfig) {
								if ('string' === typeof Module['websocket']['url']) {
									url = Module['websocket']['url']; // Fetch runtime WebSocket URL config.
								}
							}

							if (url === 'ws://' || url === 'wss://') { // Is the supplied URL config just a prefix, if so complete it.
								var parts = addr.split('/');
								url = url + parts[0] + ":" + port + "/" + parts.slice(1).join('/');
							}

							// Make the WebSocket subprotocol (Sec-WebSocket-Protocol) default to binary if no configuration is set.
							var subProtocols = 'binary'; // The default value is 'binary'

							if (runtimeConfig) {
								if ('string' === typeof Module['websocket']['subprotocol']) {
									subProtocols = Module['websocket']['subprotocol']; // Fetch runtime WebSocket subprotocol config.
								}
							}

							// The default WebSocket options
							var opts = undefined;

							if (subProtocols !== 'null') {
								// The regex trims the string (removes spaces at the beginning and end, then splits the string by
								// <any space>,<any space> into an Array. Whitespace removal is important for Websockify and ws.
								subProtocols = subProtocols.replace(/^ +| +$/g,"").split(/ *, */);

								opts = subProtocols;
							}

							// some webservers (azure) does not support subprotocol header
							if (runtimeConfig && null === Module['websocket']['subprotocol']) {
								subProtocols = 'null';
								opts = undefined;
							}

							// If node we use the ws library.
							var WebSocketConstructor;
							if (ENVIRONMENT_IS_NODE) {
								WebSocketConstructor = /** @type{(typeof WebSocket)} */(require('ws'));
							} else
							{
								WebSocketConstructor = WebSocket;
							}
							ws = new WebSocketConstructor(url, opts);
							ws.binaryType = 'arraybuffer';
						} catch (e) {
							throw new FS.ErrnoError(23);
						}
					}

					var peer = {
						addr,
						port,
						socket: ws,
						dgram_send_queue: []
					};

					SOCKFS.websocket_sock_ops.addPeer(sock, peer);
					SOCKFS.websocket_sock_ops.handlePeerEvents(sock, peer);

					// if this is a bound dgram socket, send the port number first to allow
					// us to override the ephemeral port reported to us by remotePort on the
					// remote end.
					if (sock.type === 2 && typeof sock.sport != 'undefined') {
						peer.dgram_send_queue.push(new Uint8Array([
								255, 255, 255, 255,
								'p'.charCodeAt(0), 'o'.charCodeAt(0), 'r'.charCodeAt(0), 't'.charCodeAt(0),
								((sock.sport & 0xff00) >> 8) , (sock.sport & 0xff)
						]));
					}

					return peer;
				},
	getPeer(sock, addr, port) {
					return sock.peers[addr + ':' + port];
				},
	addPeer(sock, peer) {
					sock.peers[peer.addr + ':' + peer.port] = peer;
				},
	removePeer(sock, peer) {
					delete sock.peers[peer.addr + ':' + peer.port];
				},
	handlePeerEvents(sock, peer) {
					var first = true;

					var handleOpen = function () {

						Module['websocket'].emit('open', sock.stream.fd);

						try {
							var queued = peer.dgram_send_queue.shift();
							while (queued) {
								peer.socket.send(queued);
								queued = peer.dgram_send_queue.shift();
							}
						} catch (e) {
							// not much we can do here in the way of proper error handling as we've already
							// lied and said this data was sent. shut it down.
							peer.socket.close();
						}
					};

					function handleMessage(data) {
						if (typeof data == 'string') {
							var encoder = new TextEncoder(); // should be utf-8
							data = encoder.encode(data); // make a typed array from the string
						} else {
							assert(data.byteLength !== undefined); // must receive an ArrayBuffer
							if (data.byteLength == 0) {
								// An empty ArrayBuffer will emit a pseudo disconnect event
								// as recv/recvmsg will return zero which indicates that a socket
								// has performed a shutdown although the connection has not been disconnected yet.
								return;
							}
							data = new Uint8Array(data); // make a typed array view on the array buffer
						}

						// if this is the port message, override the peer's port with it
						var wasfirst = first;
						first = false;
						if (wasfirst &&
								data.length === 10 &&
								data[0] === 255 && data[1] === 255 && data[2] === 255 && data[3] === 255 &&
								data[4] === 'p'.charCodeAt(0) && data[5] === 'o'.charCodeAt(0) && data[6] === 'r'.charCodeAt(0) && data[7] === 't'.charCodeAt(0)) {
							// update the peer's port and it's key in the peer map
							var newport = ((data[8] << 8) | data[9]);
							SOCKFS.websocket_sock_ops.removePeer(sock, peer);
							peer.port = newport;
							SOCKFS.websocket_sock_ops.addPeer(sock, peer);
							return;
						}

						sock.recv_queue.push({ addr: peer.addr, port: peer.port, data: data });
						Module['websocket'].emit('message', sock.stream.fd);
					};

					if (ENVIRONMENT_IS_NODE) {
						peer.socket.on('open', handleOpen);
						peer.socket.on('message', function(data, isBinary) {
							if (!isBinary) {
								return;
							}
							handleMessage((new Uint8Array(data)).buffer); // copy from node Buffer -> ArrayBuffer
						});
						peer.socket.on('close', function() {
							Module['websocket'].emit('close', sock.stream.fd);
						});
						peer.socket.on('error', function(error) {
							// Although the ws library may pass errors that may be more descriptive than
							// ECONNREFUSED they are not necessarily the expected error code e.g.
							// ENOTFOUND on getaddrinfo seems to be node.js specific, so using ECONNREFUSED
							// is still probably the most useful thing to do.
							sock.error = 14; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
							Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
							// don't throw
						});
					} else {
						peer.socket.onopen = handleOpen;
						peer.socket.onclose = function() {
							Module['websocket'].emit('close', sock.stream.fd);
						};
						peer.socket.onmessage = function peer_socket_onmessage(event) {
							handleMessage(event.data);
						};
						peer.socket.onerror = function(error) {
							// The WebSocket spec only allows a 'simple event' to be thrown on error,
							// so we only really know as much as ECONNREFUSED.
							sock.error = 14; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
							Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'ECONNREFUSED: Connection refused']);
						};
					}
				},
	poll(sock) {
					if (sock.type === 1 && sock.server) {
						// listen sockets should only say they're available for reading
						// if there are pending clients.
						return sock.pending.length ? (64 | 1) : 0;
					}

					var mask = 0;
					var dest = sock.type === 1 ?  // we only care about the socket state for connection-based sockets
						SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport) :
						null;

					if (sock.recv_queue.length ||
							!dest ||  // connection-less sockets are always ready to read
							(dest && dest.socket.readyState === dest.socket.CLOSING) ||
							(dest && dest.socket.readyState === dest.socket.CLOSED)) {  // let recv return 0 once closed
						mask |= (64 | 1);
					}

					if (!dest ||  // connection-less sockets are always ready to write
							(dest && dest.socket.readyState === dest.socket.OPEN)) {
						mask |= 4;
					}

					if ((dest && dest.socket.readyState === dest.socket.CLOSING) ||
							(dest && dest.socket.readyState === dest.socket.CLOSED)) {
						mask |= 16;
					}

					return mask;
				},
	ioctl(sock, request, arg) {
					switch (request) {
						case 21531:
							var bytes = 0;
							if (sock.recv_queue.length) {
								bytes = sock.recv_queue[0].data.length;
							}
							HEAP32[((arg)>>2)] = bytes;
							return 0;
						default:
							return 28;
					}
				},
	close(sock) {
					// if we've spawned a listen server, close it
					if (sock.server) {
						try {
							sock.server.close();
						} catch (e) {
						}
						sock.server = null;
					}
					// close any peer connections
					var peers = Object.keys(sock.peers);
					for (var i = 0; i < peers.length; i++) {
						var peer = sock.peers[peers[i]];
						try {
							peer.socket.close();
						} catch (e) {
						}
						SOCKFS.websocket_sock_ops.removePeer(sock, peer);
					}
					return 0;
				},
	bind(sock, addr, port) {
					if (typeof sock.saddr != 'undefined' || typeof sock.sport != 'undefined') {
						throw new FS.ErrnoError(28);  // already bound
					}
					sock.saddr = addr;
					sock.sport = port;
					// in order to emulate dgram sockets, we need to launch a listen server when
					// binding on a connection-less socket
					// note: this is only required on the server side
					if (sock.type === 2) {
						// close the existing server if it exists
						if (sock.server) {
							sock.server.close();
							sock.server = null;
						}
						// swallow error operation not supported error that occurs when binding in the
						// browser where this isn't supported
						try {
							sock.sock_ops.listen(sock, 0);
						} catch (e) {
							if (!(e.name === 'ErrnoError')) throw e;
							if (e.errno !== 138) throw e;
						}
					}
				},
	connect(sock, addr, port) {
					if (sock.server) {
						throw new FS.ErrnoError(138);
					}

					// TODO autobind
					// if (!sock.addr && sock.type == 2) {
					// }

					// early out if we're already connected / in the middle of connecting
					if (typeof sock.daddr != 'undefined' && typeof sock.dport != 'undefined') {
						var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);
						if (dest) {
							if (dest.socket.readyState === dest.socket.CONNECTING) {
								throw new FS.ErrnoError(7);
							} else {
								throw new FS.ErrnoError(30);
							}
						}
					}

					// add the socket to our peer list and set our
					// destination address / port to match
					var peer = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
					sock.daddr = peer.addr;
					sock.dport = peer.port;

					// always "fail" in non-blocking mode
					throw new FS.ErrnoError(26);
				},
	listen(sock, backlog) {
					if (!ENVIRONMENT_IS_NODE) {
						throw new FS.ErrnoError(138);
					}
					if (sock.server) {
						throw new FS.ErrnoError(28);  // already listening
					}
					var WebSocketServer = require('ws').Server;
					var host = sock.saddr;
					sock.server = new WebSocketServer({
						host,
						port: sock.sport
						// TODO support backlog
					});
					Module['websocket'].emit('listen', sock.stream.fd); // Send Event with listen fd.

					sock.server.on('connection', function(ws) {
						if (sock.type === 1) {
							var newsock = SOCKFS.createSocket(sock.family, sock.type, sock.protocol);

							// create a peer on the new socket
							var peer = SOCKFS.websocket_sock_ops.createPeer(newsock, ws);
							newsock.daddr = peer.addr;
							newsock.dport = peer.port;

							// push to queue for accept to pick up
							sock.pending.push(newsock);
							Module['websocket'].emit('connection', newsock.stream.fd);
						} else {
							// create a peer on the listen socket so calling sendto
							// with the listen socket and an address will resolve
							// to the correct client
							SOCKFS.websocket_sock_ops.createPeer(sock, ws);
							Module['websocket'].emit('connection', sock.stream.fd);
						}
					});
					sock.server.on('close', function() {
						Module['websocket'].emit('close', sock.stream.fd);
						sock.server = null;
					});
					sock.server.on('error', function(error) {
						// Although the ws library may pass errors that may be more descriptive than
						// ECONNREFUSED they are not necessarily the expected error code e.g.
						// ENOTFOUND on getaddrinfo seems to be node.js specific, so using EHOSTUNREACH
						// is still probably the most useful thing to do. This error shouldn't
						// occur in a well written app as errors should get trapped in the compiled
						// app's own getaddrinfo call.
						sock.error = 23; // Used in getsockopt for SOL_SOCKET/SO_ERROR test.
						Module['websocket'].emit('error', [sock.stream.fd, sock.error, 'EHOSTUNREACH: Host is unreachable']);
						// don't throw
					});
				},
	accept(listensock) {
					if (!listensock.server || !listensock.pending.length) {
						throw new FS.ErrnoError(28);
					}
					var newsock = listensock.pending.shift();
					newsock.stream.flags = listensock.stream.flags;
					return newsock;
				},
	getname(sock, peer) {
					var addr, port;
					if (peer) {
						if (sock.daddr === undefined || sock.dport === undefined) {
							throw new FS.ErrnoError(53);
						}
						addr = sock.daddr;
						port = sock.dport;
					} else {
						// TODO saddr and sport will be set for bind()'d UDP sockets, but what
						// should we be returning for TCP sockets that've been connect()'d?
						addr = sock.saddr || 0;
						port = sock.sport || 0;
					}
					return { addr, port };
				},
	sendmsg(sock, buffer, offset, length, addr, port) {
					if (sock.type === 2) {
						// connection-less sockets will honor the message address,
						// and otherwise fall back to the bound destination address
						if (addr === undefined || port === undefined) {
							addr = sock.daddr;
							port = sock.dport;
						}
						// if there was no address to fall back to, error out
						if (addr === undefined || port === undefined) {
							throw new FS.ErrnoError(17);
						}
					} else {
						// connection-based sockets will only use the bound
						addr = sock.daddr;
						port = sock.dport;
					}

					// find the peer for the destination address
					var dest = SOCKFS.websocket_sock_ops.getPeer(sock, addr, port);

					// early out if not connected with a connection-based socket
					if (sock.type === 1) {
						if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
							throw new FS.ErrnoError(53);
						} else if (dest.socket.readyState === dest.socket.CONNECTING) {
							throw new FS.ErrnoError(6);
						}
					}

					// create a copy of the incoming data to send, as the WebSocket API
					// doesn't work entirely with an ArrayBufferView, it'll just send
					// the entire underlying buffer
					if (ArrayBuffer.isView(buffer)) {
						offset += buffer.byteOffset;
						buffer = buffer.buffer;
					}

					var data;
						data = buffer.slice(offset, offset + length);

					// if we're emulating a connection-less dgram socket and don't have
					// a cached connection, queue the buffer to send upon connect and
					// lie, saying the data was sent now.
					if (sock.type === 2) {
						if (!dest || dest.socket.readyState !== dest.socket.OPEN) {
							// if we're not connected, open a new connection
							if (!dest || dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
								dest = SOCKFS.websocket_sock_ops.createPeer(sock, addr, port);
							}
							dest.dgram_send_queue.push(data);
							return length;
						}
					}

					try {
						// send the actual data
						dest.socket.send(data);
						return length;
					} catch (e) {
						throw new FS.ErrnoError(28);
					}
				},
	recvmsg(sock, length) {
					// http://pubs.opengroup.org/onlinepubs/7908799/xns/recvmsg.html
					if (sock.type === 1 && sock.server) {
						// tcp servers should not be recv()'ing on the listen socket
						throw new FS.ErrnoError(53);
					}

					var queued = sock.recv_queue.shift();
					if (!queued) {
						if (sock.type === 1) {
							var dest = SOCKFS.websocket_sock_ops.getPeer(sock, sock.daddr, sock.dport);

							if (!dest) {
								// if we have a destination address but are not connected, error out
								throw new FS.ErrnoError(53);
							}
							if (dest.socket.readyState === dest.socket.CLOSING || dest.socket.readyState === dest.socket.CLOSED) {
								// return null if the socket has closed
								return null;
							}
							// else, our socket is in a valid state but truly has nothing available
							throw new FS.ErrnoError(6);
						}
						throw new FS.ErrnoError(6);
					}

					// queued.data will be an ArrayBuffer if it's unadulterated, but if it's
					// requeued TCP data it'll be an ArrayBufferView
					var queuedLength = queued.data.byteLength || queued.data.length;
					var queuedOffset = queued.data.byteOffset || 0;
					var queuedBuffer = queued.data.buffer || queued.data;
					var bytesRead = Math.min(length, queuedLength);
					var res = {
						buffer: new Uint8Array(queuedBuffer, queuedOffset, bytesRead),
						addr: queued.addr,
						port: queued.port
					};

					// push back any unread data for TCP connections
					if (sock.type === 1 && bytesRead < queuedLength) {
						var bytesRemaining = queuedLength - bytesRead;
						queued.data = new Uint8Array(queuedBuffer, queuedOffset + bytesRead, bytesRemaining);
						sock.recv_queue.unshift(queued);
					}

					return res;
				},
	},
	};

	var getSocketFromFD = (fd) => {
			var socket = SOCKFS.getSocket(fd);
			if (!socket) throw new FS.ErrnoError(8);
			return socket;
		};

	var Sockets = {
	BUFFER_SIZE:10240,
	MAX_BUFFER_SIZE:10485760,
	nextFd:1,
	fds:{
	},
	nextport:1,
	maxport:65535,
	peer:null,
	connections:{
	},
	portmap:{
	},
	localAddr:4261412874,
	addrPool:[33554442,50331658,67108874,83886090,100663306,117440522,134217738,150994954,167772170,184549386,201326602,218103818,234881034],
	};

	var inetPton4 = (str) => {
			var b = str.split('.');
			for (var i = 0; i < 4; i++) {
				var tmp = Number(b[i]);
				if (isNaN(tmp)) return null;
				b[i] = tmp;
			}
			return (b[0] | (b[1] << 8) | (b[2] << 16) | (b[3] << 24)) >>> 0;
		};


	/** @suppress {checkTypes} */
	var jstoi_q = (str) => parseInt(str);
	var inetPton6 = (str) => {
			var words;
			var w, offset, z, i;
			/* http://home.deds.nl/~aeron/regex/ */
			var valid6regx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i
			var parts = [];
			if (!valid6regx.test(str)) {
				return null;
			}
			if (str === "::") {
				return [0, 0, 0, 0, 0, 0, 0, 0];
			}
			// Z placeholder to keep track of zeros when splitting the string on ":"
			if (str.startsWith("::")) {
				str = str.replace("::", "Z:"); // leading zeros case
			} else {
				str = str.replace("::", ":Z:");
			}

			if (str.indexOf(".") > 0) {
				// parse IPv4 embedded stress
				str = str.replace(new RegExp('[.]', 'g'), ":");
				words = str.split(":");
				words[words.length-4] = jstoi_q(words[words.length-4]) + jstoi_q(words[words.length-3])*256;
				words[words.length-3] = jstoi_q(words[words.length-2]) + jstoi_q(words[words.length-1])*256;
				words = words.slice(0, words.length-2);
			} else {
				words = str.split(":");
			}

			offset = 0; z = 0;
			for (w=0; w < words.length; w++) {
				if (typeof words[w] == 'string') {
					if (words[w] === 'Z') {
						// compressed zeros - write appropriate number of zero words
						for (z = 0; z < (8 - words.length+1); z++) {
							parts[w+z] = 0;
						}
						offset = z-1;
					} else {
						// parse hex to field to 16-bit value and write it in network byte-order
						parts[w+offset] = _htons(parseInt(words[w],16));
					}
				} else {
					// parsed IPv4 words
					parts[w+offset] = words[w];
				}
			}
			return [
				(parts[1] << 16) | parts[0],
				(parts[3] << 16) | parts[2],
				(parts[5] << 16) | parts[4],
				(parts[7] << 16) | parts[6]
			];
		};


	/** @param {number=} addrlen */
	var writeSockaddr = (sa, family, addr, port, addrlen) => {
			switch (family) {
				case 2:
					addr = inetPton4(addr);
					zeroMemory(sa, 16);
					if (addrlen) {
						HEAP32[((addrlen)>>2)] = 16;
					}
					HEAP16[((sa)>>1)] = family;
					HEAP32[(((sa)+(4))>>2)] = addr;
					HEAP16[(((sa)+(2))>>1)] = _htons(port);
					break;
				case 10:
					addr = inetPton6(addr);
					zeroMemory(sa, 28);
					if (addrlen) {
						HEAP32[((addrlen)>>2)] = 28;
					}
					HEAP32[((sa)>>2)] = family;
					HEAP32[(((sa)+(8))>>2)] = addr[0];
					HEAP32[(((sa)+(12))>>2)] = addr[1];
					HEAP32[(((sa)+(16))>>2)] = addr[2];
					HEAP32[(((sa)+(20))>>2)] = addr[3];
					HEAP16[(((sa)+(2))>>1)] = _htons(port);
					break;
				default:
					return 5;
			}
			return 0;
		};


	var DNS = {
	address_map:{
	id:1,
	addrs:{
	},
	names:{
	},
	},
	lookup_name(name) {
				// If the name is already a valid ipv4 / ipv6 address, don't generate a fake one.
				var res = inetPton4(name);
				if (res !== null) {
					return name;
				}
				res = inetPton6(name);
				if (res !== null) {
					return name;
				}

				// See if this name is already mapped.
				var addr;

				if (DNS.address_map.addrs[name]) {
					addr = DNS.address_map.addrs[name];
				} else {
					var id = DNS.address_map.id++;
					assert(id < 65535, 'exceeded max address mappings of 65535');

					addr = '172.29.' + (id & 0xff) + '.' + (id & 0xff00);

					DNS.address_map.names[addr] = name;
					DNS.address_map.addrs[name] = addr;
				}

				return addr;
			},
	lookup_addr(addr) {
				if (DNS.address_map.names[addr]) {
					return DNS.address_map.names[addr];
				}

				return null;
			},
	};
	function ___syscall_accept4(fd, addr, addrlen, flags, d1, d2) {
	try {

			var sock = getSocketFromFD(fd);
			var newsock = sock.sock_ops.accept(sock);
			if (addr) {
				var errno = writeSockaddr(addr, newsock.family, DNS.lookup_name(newsock.daddr), newsock.dport, addrlen);
			}
			return newsock.stream.fd;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}



	var inetNtop4 = (addr) => {
			return (addr & 0xff) + '.' + ((addr >> 8) & 0xff) + '.' + ((addr >> 16) & 0xff) + '.' + ((addr >> 24) & 0xff)
		};


	var inetNtop6 = (ints) => {
			//  ref:  http://www.ietf.org/rfc/rfc2373.txt - section 2.5.4
			//  Format for IPv4 compatible and mapped  128-bit IPv6 Addresses
			//  128-bits are split into eight 16-bit words
			//  stored in network byte order (big-endian)
			//  |                80 bits               | 16 |      32 bits        |
			//  +-----------------------------------------------------------------+
			//  |               10 bytes               |  2 |      4 bytes        |
			//  +--------------------------------------+--------------------------+
			//  +               5 words                |  1 |      2 words        |
			//  +--------------------------------------+--------------------------+
			//  |0000..............................0000|0000|    IPv4 ADDRESS     | (compatible)
			//  +--------------------------------------+----+---------------------+
			//  |0000..............................0000|FFFF|    IPv4 ADDRESS     | (mapped)
			//  +--------------------------------------+----+---------------------+
			var str = "";
			var word = 0;
			var longest = 0;
			var lastzero = 0;
			var zstart = 0;
			var len = 0;
			var i = 0;
			var parts = [
				ints[0] & 0xffff,
				(ints[0] >> 16),
				ints[1] & 0xffff,
				(ints[1] >> 16),
				ints[2] & 0xffff,
				(ints[2] >> 16),
				ints[3] & 0xffff,
				(ints[3] >> 16)
			];

			// Handle IPv4-compatible, IPv4-mapped, loopback and any/unspecified addresses

			var hasipv4 = true;
			var v4part = "";
			// check if the 10 high-order bytes are all zeros (first 5 words)
			for (i = 0; i < 5; i++) {
				if (parts[i] !== 0) { hasipv4 = false; break; }
			}

			if (hasipv4) {
				// low-order 32-bits store an IPv4 address (bytes 13 to 16) (last 2 words)
				v4part = inetNtop4(parts[6] | (parts[7] << 16));
				// IPv4-mapped IPv6 address if 16-bit value (bytes 11 and 12) == 0xFFFF (6th word)
				if (parts[5] === -1) {
					str = "::ffff:";
					str += v4part;
					return str;
				}
				// IPv4-compatible IPv6 address if 16-bit value (bytes 11 and 12) == 0x0000 (6th word)
				if (parts[5] === 0) {
					str = "::";
					//special case IPv6 addresses
					if (v4part === "0.0.0.0") v4part = ""; // any/unspecified address
					if (v4part === "0.0.0.1") v4part = "1";// loopback address
					str += v4part;
					return str;
				}
			}

			// Handle all other IPv6 addresses

			// first run to find the longest contiguous zero words
			for (word = 0; word < 8; word++) {
				if (parts[word] === 0) {
					if (word - lastzero > 1) {
						len = 0;
					}
					lastzero = word;
					len++;
				}
				if (len > longest) {
					longest = len;
					zstart = word - longest + 1;
				}
			}

			for (word = 0; word < 8; word++) {
				if (longest > 1) {
					// compress contiguous zeros - to produce "::"
					if (parts[word] === 0 && word >= zstart && word < (zstart + longest) ) {
						if (word === zstart) {
							str += ":";
							if (zstart === 0) str += ":"; //leading zeros case
						}
						continue;
					}
				}
				// converts 16-bit words from big-endian to little-endian before converting to hex string
				str += Number(_ntohs(parts[word] & 0xffff)).toString(16);
				str += word < 7 ? ":" : "";
			}
			return str;
		};

	var readSockaddr = (sa, salen) => {
			// family / port offsets are common to both sockaddr_in and sockaddr_in6
			var family = HEAP16[((sa)>>1)];
			var port = _ntohs(HEAPU16[(((sa)+(2))>>1)]);
			var addr;

			switch (family) {
				case 2:
					if (salen !== 16) {
						return { errno: 28 };
					}
					addr = HEAP32[(((sa)+(4))>>2)];
					addr = inetNtop4(addr);
					break;
				case 10:
					if (salen !== 28) {
						return { errno: 28 };
					}
					addr = [
						HEAP32[(((sa)+(8))>>2)],
						HEAP32[(((sa)+(12))>>2)],
						HEAP32[(((sa)+(16))>>2)],
						HEAP32[(((sa)+(20))>>2)]
					];
					addr = inetNtop6(addr);
					break;
				default:
					return { errno: 5 };
			}

			return { family: family, addr: addr, port: port };
		};


	/** @param {boolean=} allowNull */
	var getSocketAddress = (addrp, addrlen, allowNull) => {
			if (allowNull && addrp === 0) return null;
			var info = readSockaddr(addrp, addrlen);
			if (info.errno) throw new FS.ErrnoError(info.errno);
			info.addr = DNS.lookup_addr(info.addr) || info.addr;
			return info;
		};
	function ___syscall_bind(fd, addr, addrlen, d1, d2, d3) {
	try {

			var sock = getSocketFromFD(fd);
			var info = getSocketAddress(addr, addrlen);
			sock.sock_ops.bind(sock, info.addr, info.port);
			return 0;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}


	function ___syscall_connect(fd, addr, addrlen, d1, d2, d3) {
	try {

			var sock = getSocketFromFD(fd);
			var info = getSocketAddress(addr, addrlen);
			sock.sock_ops.connect(sock, info.addr, info.port);
			return 0;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}

	function ___syscall_dup(fd) {
	try {

			var old = SYSCALLS.getStreamFromFD(fd);
			return FS.dupStream(old).fd;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}

	function ___syscall_fcntl64(fd, cmd, varargs) {
	SYSCALLS.varargs = varargs;
	try {

			var stream = SYSCALLS.getStreamFromFD(fd);
			switch (cmd) {
				case 0: {
					var arg = SYSCALLS.get();
					if (arg < 0) {
						return -28;
					}
					while (FS.streams[arg]) {
						arg++;
					}
					var newStream;
					newStream = FS.dupStream(stream, arg);
					return newStream.fd;
				}
				case 1:
				case 2:
					return 0;  // FD_CLOEXEC makes no sense for a single process.
				case 3:
					return stream.flags;
				case 4: {
					var arg = SYSCALLS.get();
					stream.flags |= arg;
					return 0;
				}
				case 12: {
					var arg = SYSCALLS.getp();
					var offset = 0;
					// We're always unlocked.
					HEAP16[(((arg)+(offset))>>1)] = 2;
					return 0;
				}
				case 13:
				case 14:
					return 0; // Pretend that the locking is successful.
			}
			return -28;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}

	function ___syscall_ioctl(fd, op, varargs) {
	SYSCALLS.varargs = varargs;
	try {

			var stream = SYSCALLS.getStreamFromFD(fd);
			switch (op) {
				case 21509: {
					if (!stream.tty) return -59;
					return 0;
				}
				case 21505: {
					if (!stream.tty) return -59;
					if (stream.tty.ops.ioctl_tcgets) {
						var termios = stream.tty.ops.ioctl_tcgets(stream);
						var argp = SYSCALLS.getp();
						HEAP32[((argp)>>2)] = termios.c_iflag || 0;
						HEAP32[(((argp)+(4))>>2)] = termios.c_oflag || 0;
						HEAP32[(((argp)+(8))>>2)] = termios.c_cflag || 0;
						HEAP32[(((argp)+(12))>>2)] = termios.c_lflag || 0;
						for (var i = 0; i < 32; i++) {
							HEAP8[(argp + i)+(17)] = termios.c_cc[i] || 0;
						}
						return 0;
					}
					return 0;
				}
				case 21510:
				case 21511:
				case 21512: {
					if (!stream.tty) return -59;
					return 0; // no-op, not actually adjusting terminal settings
				}
				case 21506:
				case 21507:
				case 21508: {
					if (!stream.tty) return -59;
					if (stream.tty.ops.ioctl_tcsets) {
						var argp = SYSCALLS.getp();
						var c_iflag = HEAP32[((argp)>>2)];
						var c_oflag = HEAP32[(((argp)+(4))>>2)];
						var c_cflag = HEAP32[(((argp)+(8))>>2)];
						var c_lflag = HEAP32[(((argp)+(12))>>2)];
						var c_cc = []
						for (var i = 0; i < 32; i++) {
							c_cc.push(HEAP8[(argp + i)+(17)]);
						}
						return stream.tty.ops.ioctl_tcsets(stream.tty, op, { c_iflag, c_oflag, c_cflag, c_lflag, c_cc });
					}
					return 0; // no-op, not actually adjusting terminal settings
				}
				case 21519: {
					if (!stream.tty) return -59;
					var argp = SYSCALLS.getp();
					HEAP32[((argp)>>2)] = 0;
					return 0;
				}
				case 21520: {
					if (!stream.tty) return -59;
					return -28; // not supported
				}
				case 21531: {
					var argp = SYSCALLS.getp();
					return FS.ioctl(stream, op, argp);
				}
				case 21523: {
					// TODO: in theory we should write to the winsize struct that gets
					// passed in, but for now musl doesn't read anything on it
					if (!stream.tty) return -59;
					if (stream.tty.ops.ioctl_tiocgwinsz) {
						var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
						var argp = SYSCALLS.getp();
						HEAP16[((argp)>>1)] = winsize[0];
						HEAP16[(((argp)+(2))>>1)] = winsize[1];
					}
					return 0;
				}
				case 21524: {
					// TODO: technically, this ioctl call should change the window size.
					// but, since emscripten doesn't have any concept of a terminal window
					// yet, we'll just silently throw it away as we do TIOCGWINSZ
					if (!stream.tty) return -59;
					return 0;
				}
				case 21515: {
					if (!stream.tty) return -59;
					return 0;
				}
				default: return -28; // not supported
			}
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}

	function ___syscall_listen(fd, backlog) {
	try {

			var sock = getSocketFromFD(fd);
			sock.sock_ops.listen(sock, backlog);
			return 0;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}

	function ___syscall_openat(dirfd, path, flags, varargs) {
	SYSCALLS.varargs = varargs;
	try {

			path = SYSCALLS.getStr(path);
			path = SYSCALLS.calculateAt(dirfd, path);
			var mode = varargs ? SYSCALLS.get() : 0;
			return FS.open(path, flags, mode).fd;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}

	function ___syscall_socket(domain, type, protocol) {
	try {

			var sock = SOCKFS.createSocket(domain, type, protocol);
			return sock.stream.fd;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return -e.errno;
	}
	}




	var __emscripten_lookup_name = (name) => {
			// uint32_t _emscripten_lookup_name(const char *name);
			var nameString = UTF8ToString(name);
			return inetPton4(DNS.lookup_name(nameString));
		};

	var isLeapYear = (year) => year%4 === 0 && (year%100 !== 0 || year%400 === 0);

	var MONTH_DAYS_LEAP_CUMULATIVE = [0,31,60,91,121,152,182,213,244,274,305,335];

	var MONTH_DAYS_REGULAR_CUMULATIVE = [0,31,59,90,120,151,181,212,243,273,304,334];
	var ydayFromDate = (date) => {
			var leap = isLeapYear(date.getFullYear());
			var monthDaysCumulative = (leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE);
			var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1; // -1 since it's days since Jan 1

			return yday;
		};

	var convertI32PairToI53Checked = (lo, hi) => {
			return ((hi + 0x200000) >>> 0 < 0x400001 - !!lo) ? (lo >>> 0) + hi * 4294967296 : NaN;
		};
	function __localtime_js(time_low, time_high,tmPtr) {
		var time = convertI32PairToI53Checked(time_low, time_high);


			var date = new Date(time*1000);
			HEAP32[((tmPtr)>>2)] = date.getSeconds();
			HEAP32[(((tmPtr)+(4))>>2)] = date.getMinutes();
			HEAP32[(((tmPtr)+(8))>>2)] = date.getHours();
			HEAP32[(((tmPtr)+(12))>>2)] = date.getDate();
			HEAP32[(((tmPtr)+(16))>>2)] = date.getMonth();
			HEAP32[(((tmPtr)+(20))>>2)] = date.getFullYear()-1900;
			HEAP32[(((tmPtr)+(24))>>2)] = date.getDay();

			var yday = ydayFromDate(date)|0;
			HEAP32[(((tmPtr)+(28))>>2)] = yday;
			HEAP32[(((tmPtr)+(36))>>2)] = -(date.getTimezoneOffset() * 60);

			// Attention: DST is in December in South, and some regions don't have DST at all.
			var start = new Date(date.getFullYear(), 0, 1);
			var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
			var winterOffset = start.getTimezoneOffset();
			var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset))|0;
			HEAP32[(((tmPtr)+(32))>>2)] = dst;
		;
	}

	var stringToUTF8 = (str, outPtr, maxBytesToWrite) => {
			return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
		};
	var __tzset_js = (timezone, daylight, std_name, dst_name) => {
			// TODO: Use (malleable) environment variables instead of system settings.
			var currentYear = new Date().getFullYear();
			var winter = new Date(currentYear, 0, 1);
			var summer = new Date(currentYear, 6, 1);
			var winterOffset = winter.getTimezoneOffset();
			var summerOffset = summer.getTimezoneOffset();

			// Local standard timezone offset. Local standard time is not adjusted for
			// daylight savings.  This code uses the fact that getTimezoneOffset returns
			// a greater value during Standard Time versus Daylight Saving Time (DST).
			// Thus it determines the expected output during Standard Time, and it
			// compares whether the output of the given date the same (Standard) or less
			// (DST).
			var stdTimezoneOffset = Math.max(winterOffset, summerOffset);

			// timezone is specified as seconds west of UTC ("The external variable
			// `timezone` shall be set to the difference, in seconds, between
			// Coordinated Universal Time (UTC) and local standard time."), the same
			// as returned by stdTimezoneOffset.
			// See http://pubs.opengroup.org/onlinepubs/009695399/functions/tzset.html
			HEAPU32[((timezone)>>2)] = stdTimezoneOffset * 60;

			HEAP32[((daylight)>>2)] = Number(winterOffset != summerOffset);

			function extractZone(date) {
				var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
				return match ? match[1] : "GMT";
			};
			var winterName = extractZone(winter);
			var summerName = extractZone(summer);
			if (summerOffset < winterOffset) {
				// Northern hemisphere
				stringToUTF8(winterName, std_name, 7);
				stringToUTF8(summerName, dst_name, 7);
			} else {
				stringToUTF8(winterName, dst_name, 7);
				stringToUTF8(summerName, std_name, 7);
			}
		};

	var _abort = () => {
			abort('');
		};

	var _emscripten_date_now = () => Date.now();

	var getHeapMax = () =>
			HEAPU8.length;
	var _emscripten_get_heap_max = () => getHeapMax();

	var _emscripten_memcpy_js = (dest, src, num) => HEAPU8.copyWithin(dest, src, src + num);


	var abortOnCannotGrowMemory = (requestedSize) => {
			abort('OOM');
		};
	var _emscripten_resize_heap = (requestedSize) => {
			var oldSize = HEAPU8.length;
			// With CAN_ADDRESS_2GB or MEMORY64, pointers are already unsigned.
			requestedSize >>>= 0;
			abortOnCannotGrowMemory(requestedSize);
		};

	var ENV = {
	};

	var getExecutableName = () => {
			return thisProgram || './this.program';
		};
	var getEnvStrings = () => {
			if (!getEnvStrings.strings) {
				// Default values.
				// Browser language detection #8751
				var lang = ((typeof navigator == 'object' && navigator.languages && navigator.languages[0]) || 'C').replace('-', '_') + '.UTF-8';
				var env = {
					'USER': 'web_user',
					'LOGNAME': 'web_user',
					'PATH': '/',
					'PWD': '/',
					'HOME': '/home/web_user',
					'LANG': lang,
					'_': getExecutableName()
				};
				// Apply the user-provided values, if any.
				for (var x in ENV) {
					// x is a key in ENV; if ENV[x] is undefined, that means it was
					// explicitly set to be so. We allow user code to do that to
					// force variables with default values to remain unset.
					if (ENV[x] === undefined) delete env[x];
					else env[x] = ENV[x];
				}
				var strings = [];
				for (var x in env) {
					strings.push(`${x}=${env[x]}`);
				}
				getEnvStrings.strings = strings;
			}
			return getEnvStrings.strings;
		};

	var stringToAscii = (str, buffer) => {
			for (var i = 0; i < str.length; ++i) {
				HEAP8[buffer++] = str.charCodeAt(i);
			}
			// Null-terminate the string
			HEAP8[buffer] = 0;
		};
	var _environ_get = (__environ, environ_buf) => {
			var bufSize = 0;
			getEnvStrings().forEach((string, i) => {
				var ptr = environ_buf + bufSize;
				HEAPU32[(((__environ)+(i*4))>>2)] = ptr;
				stringToAscii(string, ptr);
				bufSize += string.length + 1;
			});
			return 0;
		};

	var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
			var strings = getEnvStrings();
			HEAPU32[((penviron_count)>>2)] = strings.length;
			var bufSize = 0;
			strings.forEach((string) => bufSize += string.length + 1);
			HEAPU32[((penviron_buf_size)>>2)] = bufSize;
			return 0;
		};


	function _fd_close(fd) {
	try {

			var stream = SYSCALLS.getStreamFromFD(fd);
			FS.close(stream);
			return 0;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return e.errno;
	}
	}

	function _fd_fdstat_get(fd, pbuf) {
	try {

			var rightsBase = 0;
			var rightsInheriting = 0;
			var flags = 0;
			{
				var stream = SYSCALLS.getStreamFromFD(fd);
				// All character devices are terminals (other things a Linux system would
				// assume is a character device, like the mouse, we have special APIs for).
				var type = stream.tty ? 2 :
									FS.isDir(stream.mode) ? 3 :
									FS.isLink(stream.mode) ? 7 :
									4;
			}
			HEAP8[pbuf] = type;
			HEAP16[(((pbuf)+(2))>>1)] = flags;
			(tempI64 = [rightsBase>>>0,(tempDouble = rightsBase,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((pbuf)+(8))>>2)] = tempI64[0],HEAP32[(((pbuf)+(12))>>2)] = tempI64[1]);
			(tempI64 = [rightsInheriting>>>0,(tempDouble = rightsInheriting,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[(((pbuf)+(16))>>2)] = tempI64[0],HEAP32[(((pbuf)+(20))>>2)] = tempI64[1]);
			return 0;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return e.errno;
	}
	}

	/** @param {number=} offset */
	var doReadv = (stream, iov, iovcnt, offset) => {
			var ret = 0;
			for (var i = 0; i < iovcnt; i++) {
				var ptr = HEAPU32[((iov)>>2)];
				var len = HEAPU32[(((iov)+(4))>>2)];
				iov += 8;
				var curr = FS.read(stream, HEAP8, ptr, len, offset);
				if (curr < 0) return -1;
				ret += curr;
				if (curr < len) break; // nothing more to read
				if (typeof offset !== 'undefined') {
					offset += curr;
				}
			}
			return ret;
		};

	function _fd_read(fd, iov, iovcnt, pnum) {
	try {

			var stream = SYSCALLS.getStreamFromFD(fd);
			var num = doReadv(stream, iov, iovcnt);
			HEAPU32[((pnum)>>2)] = num;
			return 0;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return e.errno;
	}
	}


	function _fd_seek(fd,offset_low, offset_high,whence,newOffset) {
		var offset = convertI32PairToI53Checked(offset_low, offset_high);


	try {

			if (isNaN(offset)) return 61;
			var stream = SYSCALLS.getStreamFromFD(fd);
			FS.llseek(stream, offset, whence);
			(tempI64 = [stream.position>>>0,(tempDouble = stream.position,(+(Math.abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? (+(Math.floor((tempDouble)/4294967296.0)))>>>0 : (~~((+(Math.ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)], HEAP32[((newOffset)>>2)] = tempI64[0],HEAP32[(((newOffset)+(4))>>2)] = tempI64[1]);
			if (stream.getdents && offset === 0 && whence === 0) stream.getdents = null; // reset readdir state
			return 0;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return e.errno;
	}
	;
	}

	/** @param {number=} offset */
	var doWritev = (stream, iov, iovcnt, offset) => {
			var ret = 0;
			for (var i = 0; i < iovcnt; i++) {
				var ptr = HEAPU32[((iov)>>2)];
				var len = HEAPU32[(((iov)+(4))>>2)];
				iov += 8;
				var curr = FS.write(stream, HEAP8, ptr, len, offset);
				if (curr < 0) return -1;
				ret += curr;
				if (typeof offset !== 'undefined') {
					offset += curr;
				}
			}
			return ret;
		};

	function _fd_write(fd, iov, iovcnt, pnum) {
	try {

			var stream = SYSCALLS.getStreamFromFD(fd);
			var num = doWritev(stream, iov, iovcnt);
			HEAPU32[((pnum)>>2)] = num;
			return 0;
		} catch (e) {
		if (typeof FS == 'undefined' || !(e.name === 'ErrnoError')) throw e;
		return e.errno;
	}
	}




	var stringToUTF8OnStack = (str) => {
			var size = lengthBytesUTF8(str) + 1;
			var ret = stackAlloc(size);
			stringToUTF8(str, ret, size);
			return ret;
		};

			// exports
			Module["requestFullscreen"] = Browser.requestFullscreen;
			Module["requestAnimationFrame"] = Browser.requestAnimationFrame;
			Module["setCanvasSize"] = Browser.setCanvasSize;
			Module["pauseMainLoop"] = Browser.mainLoop.pause;
			Module["resumeMainLoop"] = Browser.mainLoop.resume;
			Module["getUserMedia"] = Browser.getUserMedia;
			Module["createContext"] = Browser.createContext;
			var preloadedImages = {};
			var preloadedAudios = {};;

	FS.createPreloadedFile = FS_createPreloadedFile;
	FS.staticInit();;
var wasmImports = {
	/** @export */
	__assert_fail: ___assert_fail,
	/** @export */
	__syscall__newselect: ___syscall__newselect,
	/** @export */
	__syscall_accept4: ___syscall_accept4,
	/** @export */
	__syscall_bind: ___syscall_bind,
	/** @export */
	__syscall_connect: ___syscall_connect,
	/** @export */
	__syscall_dup: ___syscall_dup,
	/** @export */
	__syscall_fcntl64: ___syscall_fcntl64,
	/** @export */
	__syscall_ioctl: ___syscall_ioctl,
	/** @export */
	__syscall_listen: ___syscall_listen,
	/** @export */
	__syscall_openat: ___syscall_openat,
	/** @export */
	__syscall_socket: ___syscall_socket,
	/** @export */
	_emscripten_lookup_name: __emscripten_lookup_name,
	/** @export */
	_localtime_js: __localtime_js,
	/** @export */
	_tzset_js: __tzset_js,
	/** @export */
	abort: _abort,
	/** @export */
	emscripten_date_now: _emscripten_date_now,
	/** @export */
	emscripten_get_heap_max: _emscripten_get_heap_max,
	/** @export */
	emscripten_memcpy_js: _emscripten_memcpy_js,
	/** @export */
	emscripten_resize_heap: _emscripten_resize_heap,
	/** @export */
	environ_get: _environ_get,
	/** @export */
	environ_sizes_get: _environ_sizes_get,
	/** @export */
	exit: _exit,
	/** @export */
	fd_close: _fd_close,
	/** @export */
	fd_fdstat_get: _fd_fdstat_get,
	/** @export */
	fd_read: _fd_read,
	/** @export */
	fd_seek: _fd_seek,
	/** @export */
	fd_write: _fd_write
};
var wasmExports = createWasm();
var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports['__wasm_call_ctors'])();
var _main = Module['_main'] = (a0, a1) => (_main = Module['_main'] = wasmExports['__main_argc_argv'])(a0, a1);
var _htons = (a0) => (_htons = wasmExports['htons'])(a0);
var _ntohs = (a0) => (_ntohs = wasmExports['ntohs'])(a0);
var setTempRet0 = (a0) => (setTempRet0 = wasmExports['setTempRet0'])(a0);
var stackSave = () => (stackSave = wasmExports['stackSave'])();
var stackRestore = (a0) => (stackRestore = wasmExports['stackRestore'])(a0);
var stackAlloc = (a0) => (stackAlloc = wasmExports['stackAlloc'])(a0);
var dynCall_jiji = Module['dynCall_jiji'] = (a0, a1, a2, a3, a4) => (dynCall_jiji = Module['dynCall_jiji'] = wasmExports['dynCall_jiji'])(a0, a1, a2, a3, a4);


// include: postamble.js
// === Auto-generated postamble setup entry stuff ===

if (ENVIRONMENT_IS_WORKER) {
// include: webGLWorker.js
// WebGLWorker worker code

function WebGLBuffer(id) {
	this.what = 'buffer';
	this.id = id;
}
function WebGLProgram(id) {
	this.what = 'program';
	this.id = id;
	this.shaders = [];
	this.attributes = {};
	this.attributeVec = [];
	this.nextAttributes = {};
	this.nextAttributeVec = [];
}
function WebGLFramebuffer(id) {
	this.what = 'frameBuffer';
	this.id = id;
}
function WebGLRenderbuffer(id) {
	this.what = 'renderBuffer';
	this.id = id;
}
function WebGLTexture(id) {
	this.what = 'texture';
	this.id = id;
	this.binding = 0;
}

function WebGLWorker() {
	//===========
	// Constants
	//===========

	/* ClearBufferMask */
	this.DEPTH_BUFFER_BIT               = 0x00000100;
	this.STENCIL_BUFFER_BIT             = 0x00000400;
	this.COLOR_BUFFER_BIT               = 0x00004000;

	/* BeginMode */
	this.POINTS                         = 0x0000;
	this.LINES                          = 0x0001;
	this.LINE_LOOP                      = 0x0002;
	this.LINE_STRIP                     = 0x0003;
	this.TRIANGLES                      = 0x0004;
	this.TRIANGLE_STRIP                 = 0x0005;
	this.TRIANGLE_FAN                   = 0x0006;

	/* AlphaFunction (not supported in ES20) */
	/*      NEVER */
	/*      LESS */
	/*      EQUAL */
	/*      LEQUAL */
	/*      GREATER */
	/*      NOTEQUAL */
	/*      GEQUAL */
	/*      ALWAYS */

	/* BlendingFactorDest */
	this.ZERO                           = 0;
	this.ONE                            = 1;
	this.SRC_COLOR                      = 0x0300;
	this.ONE_MINUS_SRC_COLOR            = 0x0301;
	this.SRC_ALPHA                      = 0x0302;
	this.ONE_MINUS_SRC_ALPHA            = 0x0303;
	this.DST_ALPHA                      = 0x0304;
	this.ONE_MINUS_DST_ALPHA            = 0x0305;

	/* BlendingFactorSrc */
	/*      ZERO */
	/*      ONE */
	this.DST_COLOR                      = 0x0306;
	this.ONE_MINUS_DST_COLOR            = 0x0307;
	this.SRC_ALPHA_SATURATE             = 0x0308;
	/*      SRC_ALPHA */
	/*      ONE_MINUS_SRC_ALPHA */
	/*      DST_ALPHA */
	/*      ONE_MINUS_DST_ALPHA */

	/* BlendEquationSeparate */
	this.FUNC_ADD                       = 0x8006;
	this.BLEND_EQUATION                 = 0x8009;
	this.BLEND_EQUATION_RGB             = 0x8009;   /* same as BLEND_EQUATION */
	this.BLEND_EQUATION_ALPHA           = 0x883D;

	/* BlendSubtract */
	this.FUNC_SUBTRACT                  = 0x800A;
	this.FUNC_REVERSE_SUBTRACT          = 0x800B;

	/* Separate Blend Functions */
	this.BLEND_DST_RGB                  = 0x80C8;
	this.BLEND_SRC_RGB                  = 0x80C9;
	this.BLEND_DST_ALPHA                = 0x80CA;
	this.BLEND_SRC_ALPHA                = 0x80CB;
	this.CONSTANT_COLOR                 = 0x8001;
	this.ONE_MINUS_CONSTANT_COLOR       = 0x8002;
	this.CONSTANT_ALPHA                 = 0x8003;
	this.ONE_MINUS_CONSTANT_ALPHA       = 0x8004;
	this.BLEND_COLOR                    = 0x8005;

	/* Buffer Objects */
	this.ARRAY_BUFFER                   = 0x8892;
	this.ELEMENT_ARRAY_BUFFER           = 0x8893;
	this.ARRAY_BUFFER_BINDING           = 0x8894;
	this.ELEMENT_ARRAY_BUFFER_BINDING   = 0x8895;

	this.STREAM_DRAW                    = 0x88E0;
	this.STATIC_DRAW                    = 0x88E4;
	this.DYNAMIC_DRAW                   = 0x88E8;

	this.BUFFER_SIZE                    = 0x8764;
	this.BUFFER_USAGE                   = 0x8765;

	this.CURRENT_VERTEX_ATTRIB          = 0x8626;

	/* CullFaceMode */
	this.FRONT                          = 0x0404;
	this.BACK                           = 0x0405;
	this.FRONT_AND_BACK                 = 0x0408;

	/* DepthFunction */
	/*      NEVER */
	/*      LESS */
	/*      EQUAL */
	/*      LEQUAL */
	/*      GREATER */
	/*      NOTEQUAL */
	/*      GEQUAL */
	/*      ALWAYS */

	/* EnableCap */
	/* TEXTURE_2D */
	this.CULL_FACE                      = 0x0B44;
	this.BLEND                          = 0x0BE2;
	this.DITHER                         = 0x0BD0;
	this.STENCIL_TEST                   = 0x0B90;
	this.DEPTH_TEST                     = 0x0B71;
	this.SCISSOR_TEST                   = 0x0C11;
	this.POLYGON_OFFSET_FILL            = 0x8037;
	this.SAMPLE_ALPHA_TO_COVERAGE       = 0x809E;
	this.SAMPLE_COVERAGE                = 0x80A0;

	/* ErrorCode */
	this.NO_ERROR                       = 0;
	this.INVALID_ENUM                   = 0x0500;
	this.INVALID_VALUE                  = 0x0501;
	this.INVALID_OPERATION              = 0x0502;
	this.OUT_OF_MEMORY                  = 0x0505;

	/* FrontFaceDirection */
	this.CW                             = 0x0900;
	this.CCW                            = 0x0901;

	/* GetPName */
	this.LINE_WIDTH                     = 0x0B21;
	this.ALIASED_POINT_SIZE_RANGE       = 0x846D;
	this.ALIASED_LINE_WIDTH_RANGE       = 0x846E;
	this.CULL_FACE_MODE                 = 0x0B45;
	this.FRONT_FACE                     = 0x0B46;
	this.DEPTH_RANGE                    = 0x0B70;
	this.DEPTH_WRITEMASK                = 0x0B72;
	this.DEPTH_CLEAR_VALUE              = 0x0B73;
	this.DEPTH_FUNC                     = 0x0B74;
	this.STENCIL_CLEAR_VALUE            = 0x0B91;
	this.STENCIL_FUNC                   = 0x0B92;
	this.STENCIL_FAIL                   = 0x0B94;
	this.STENCIL_PASS_DEPTH_FAIL        = 0x0B95;
	this.STENCIL_PASS_DEPTH_PASS        = 0x0B96;
	this.STENCIL_REF                    = 0x0B97;
	this.STENCIL_VALUE_MASK             = 0x0B93;
	this.STENCIL_WRITEMASK              = 0x0B98;
	this.STENCIL_BACK_FUNC              = 0x8800;
	this.STENCIL_BACK_FAIL              = 0x8801;
	this.STENCIL_BACK_PASS_DEPTH_FAIL   = 0x8802;
	this.STENCIL_BACK_PASS_DEPTH_PASS   = 0x8803;
	this.STENCIL_BACK_REF               = 0x8CA3;
	this.STENCIL_BACK_VALUE_MASK        = 0x8CA4;
	this.STENCIL_BACK_WRITEMASK         = 0x8CA5;
	this.VIEWPORT                       = 0x0BA2;
	this.SCISSOR_BOX                    = 0x0C10;
	/*      SCISSOR_TEST */
	this.COLOR_CLEAR_VALUE              = 0x0C22;
	this.COLOR_WRITEMASK                = 0x0C23;
	this.UNPACK_ALIGNMENT               = 0x0CF5;
	this.PACK_ALIGNMENT                 = 0x0D05;
	this.MAX_TEXTURE_SIZE               = 0x0D33;
	this.MAX_VIEWPORT_DIMS              = 0x0D3A;
	this.SUBPIXEL_BITS                  = 0x0D50;
	this.RED_BITS                       = 0x0D52;
	this.GREEN_BITS                     = 0x0D53;
	this.BLUE_BITS                      = 0x0D54;
	this.ALPHA_BITS                     = 0x0D55;
	this.DEPTH_BITS                     = 0x0D56;
	this.STENCIL_BITS                   = 0x0D57;
	this.POLYGON_OFFSET_UNITS           = 0x2A00;
	/*      POLYGON_OFFSET_FILL */
	this.POLYGON_OFFSET_FACTOR          = 0x8038;
	this.TEXTURE_BINDING_2D             = 0x8069;
	this.SAMPLE_BUFFERS                 = 0x80A8;
	this.SAMPLES                        = 0x80A9;
	this.SAMPLE_COVERAGE_VALUE          = 0x80AA;
	this.SAMPLE_COVERAGE_INVERT         = 0x80AB;

	/* GetTextureParameter */
	/*      TEXTURE_MAG_FILTER */
	/*      TEXTURE_MIN_FILTER */
	/*      TEXTURE_WRAP_S */
	/*      TEXTURE_WRAP_T */

	this.COMPRESSED_TEXTURE_FORMATS     = 0x86A3;

	/* HintMode */
	this.DONT_CARE                      = 0x1100;
	this.FASTEST                        = 0x1101;
	this.NICEST                         = 0x1102;

	/* HintTarget */
	this.GENERATE_MIPMAP_HINT            = 0x8192;

	/* DataType */
	this.BYTE                           = 0x1400;
	this.UNSIGNED_BYTE                  = 0x1401;
	this.SHORT                          = 0x1402;
	this.UNSIGNED_SHORT                 = 0x1403;
	this.INT                            = 0x1404;
	this.UNSIGNED_INT                   = 0x1405;
	this.FLOAT                          = 0x1406;

	/* PixelFormat */
	this.DEPTH_COMPONENT                = 0x1902;
	this.ALPHA                          = 0x1906;
	this.RGB                            = 0x1907;
	this.RGBA                           = 0x1908;
	this.LUMINANCE                      = 0x1909;
	this.LUMINANCE_ALPHA                = 0x190A;

	/* PixelType */
	/*      UNSIGNED_BYTE */
	this.UNSIGNED_SHORT_4_4_4_4         = 0x8033;
	this.UNSIGNED_SHORT_5_5_5_1         = 0x8034;
	this.UNSIGNED_SHORT_5_6_5           = 0x8363;

	/* Shaders */
	this.FRAGMENT_SHADER                  = 0x8B30;
	this.VERTEX_SHADER                    = 0x8B31;
	this.MAX_VERTEX_ATTRIBS               = 0x8869;
	this.MAX_VERTEX_UNIFORM_VECTORS       = 0x8DFB;
	this.MAX_VARYING_VECTORS              = 0x8DFC;
	this.MAX_COMBINED_TEXTURE_IMAGE_UNITS = 0x8B4D;
	this.MAX_VERTEX_TEXTURE_IMAGE_UNITS   = 0x8B4C;
	this.MAX_TEXTURE_IMAGE_UNITS          = 0x8872;
	this.MAX_FRAGMENT_UNIFORM_VECTORS     = 0x8DFD;
	this.SHADER_TYPE                      = 0x8B4F;
	this.DELETE_STATUS                    = 0x8B80;
	this.LINK_STATUS                      = 0x8B82;
	this.VALIDATE_STATUS                  = 0x8B83;
	this.ATTACHED_SHADERS                 = 0x8B85;
	this.ACTIVE_UNIFORMS                  = 0x8B86;
	this.ACTIVE_ATTRIBUTES                = 0x8B89;
	this.SHADING_LANGUAGE_VERSION         = 0x8B8C;
	this.CURRENT_PROGRAM                  = 0x8B8D;

	/* StencilFunction */
	this.NEVER                          = 0x0200;
	this.LESS                           = 0x0201;
	this.EQUAL                          = 0x0202;
	this.LEQUAL                         = 0x0203;
	this.GREATER                        = 0x0204;
	this.NOTEQUAL                       = 0x0205;
	this.GEQUAL                         = 0x0206;
	this.ALWAYS                         = 0x0207;

	/* StencilOp */
	/*      ZERO */
	this.KEEP                           = 0x1E00;
	this.REPLACE                        = 0x1E01;
	this.INCR                           = 0x1E02;
	this.DECR                           = 0x1E03;
	this.INVERT                         = 0x150A;
	this.INCR_WRAP                      = 0x8507;
	this.DECR_WRAP                      = 0x8508;

	/* StringName */
	this.VENDOR                         = 0x1F00;
	this.RENDERER                       = 0x1F01;
	this.VERSION                        = 0x1F02;

	/* TextureMagFilter */
	this.NEAREST                        = 0x2600;
	this.LINEAR                         = 0x2601;

	/* TextureMinFilter */
	/*      NEAREST */
	/*      LINEAR */
	this.NEAREST_MIPMAP_NEAREST         = 0x2700;
	this.LINEAR_MIPMAP_NEAREST          = 0x2701;
	this.NEAREST_MIPMAP_LINEAR          = 0x2702;
	this.LINEAR_MIPMAP_LINEAR           = 0x2703;

	/* TextureParameterName */
	this.TEXTURE_MAG_FILTER             = 0x2800;
	this.TEXTURE_MIN_FILTER             = 0x2801;
	this.TEXTURE_WRAP_S                 = 0x2802;
	this.TEXTURE_WRAP_T                 = 0x2803;

	/* TextureTarget */
	this.TEXTURE_2D                     = 0x0DE1;
	this.TEXTURE                        = 0x1702;

	this.TEXTURE_CUBE_MAP               = 0x8513;
	this.TEXTURE_BINDING_CUBE_MAP       = 0x8514;
	this.TEXTURE_CUBE_MAP_POSITIVE_X    = 0x8515;
	this.TEXTURE_CUBE_MAP_NEGATIVE_X    = 0x8516;
	this.TEXTURE_CUBE_MAP_POSITIVE_Y    = 0x8517;
	this.TEXTURE_CUBE_MAP_NEGATIVE_Y    = 0x8518;
	this.TEXTURE_CUBE_MAP_POSITIVE_Z    = 0x8519;
	this.TEXTURE_CUBE_MAP_NEGATIVE_Z    = 0x851A;
	this.MAX_CUBE_MAP_TEXTURE_SIZE      = 0x851C;

	/* TextureUnit */
	this.TEXTURE0                       = 0x84C0;
	this.TEXTURE1                       = 0x84C1;
	this.TEXTURE2                       = 0x84C2;
	this.TEXTURE3                       = 0x84C3;
	this.TEXTURE4                       = 0x84C4;
	this.TEXTURE5                       = 0x84C5;
	this.TEXTURE6                       = 0x84C6;
	this.TEXTURE7                       = 0x84C7;
	this.TEXTURE8                       = 0x84C8;
	this.TEXTURE9                       = 0x84C9;
	this.TEXTURE10                      = 0x84CA;
	this.TEXTURE11                      = 0x84CB;
	this.TEXTURE12                      = 0x84CC;
	this.TEXTURE13                      = 0x84CD;
	this.TEXTURE14                      = 0x84CE;
	this.TEXTURE15                      = 0x84CF;
	this.TEXTURE16                      = 0x84D0;
	this.TEXTURE17                      = 0x84D1;
	this.TEXTURE18                      = 0x84D2;
	this.TEXTURE19                      = 0x84D3;
	this.TEXTURE20                      = 0x84D4;
	this.TEXTURE21                      = 0x84D5;
	this.TEXTURE22                      = 0x84D6;
	this.TEXTURE23                      = 0x84D7;
	this.TEXTURE24                      = 0x84D8;
	this.TEXTURE25                      = 0x84D9;
	this.TEXTURE26                      = 0x84DA;
	this.TEXTURE27                      = 0x84DB;
	this.TEXTURE28                      = 0x84DC;
	this.TEXTURE29                      = 0x84DD;
	this.TEXTURE30                      = 0x84DE;
	this.TEXTURE31                      = 0x84DF;
	this.ACTIVE_TEXTURE                 = 0x84E0;

	/* TextureWrapMode */
	this.REPEAT                         = 0x2901;
	this.CLAMP_TO_EDGE                  = 0x812F;
	this.MIRRORED_REPEAT                = 0x8370;

	/* Uniform Types */
	this.FLOAT_VEC2                     = 0x8B50;
	this.FLOAT_VEC3                     = 0x8B51;
	this.FLOAT_VEC4                     = 0x8B52;
	this.INT_VEC2                       = 0x8B53;
	this.INT_VEC3                       = 0x8B54;
	this.INT_VEC4                       = 0x8B55;
	this.BOOL                           = 0x8B56;
	this.BOOL_VEC2                      = 0x8B57;
	this.BOOL_VEC3                      = 0x8B58;
	this.BOOL_VEC4                      = 0x8B59;
	this.FLOAT_MAT2                     = 0x8B5A;
	this.FLOAT_MAT3                     = 0x8B5B;
	this.FLOAT_MAT4                     = 0x8B5C;
	this.SAMPLER_2D                     = 0x8B5E;
	this.SAMPLER_3D                     = 0x8B5F;
	this.SAMPLER_CUBE                   = 0x8B60;

	/* Vertex Arrays */
	this.VERTEX_ATTRIB_ARRAY_ENABLED        = 0x8622;
	this.VERTEX_ATTRIB_ARRAY_SIZE           = 0x8623;
	this.VERTEX_ATTRIB_ARRAY_STRIDE         = 0x8624;
	this.VERTEX_ATTRIB_ARRAY_TYPE           = 0x8625;
	this.VERTEX_ATTRIB_ARRAY_NORMALIZED     = 0x886A;
	this.VERTEX_ATTRIB_ARRAY_POINTER        = 0x8645;
	this.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING = 0x889F;

	/* Read Format */
	this.IMPLEMENTATION_COLOR_READ_TYPE   = 0x8B9A;
	this.IMPLEMENTATION_COLOR_READ_FORMAT = 0x8B9B;

	/* Shader Source */
	this.COMPILE_STATUS                 = 0x8B81;

	/* Shader Precision-Specified Types */
	this.LOW_FLOAT                      = 0x8DF0;
	this.MEDIUM_FLOAT                   = 0x8DF1;
	this.HIGH_FLOAT                     = 0x8DF2;
	this.LOW_INT                        = 0x8DF3;
	this.MEDIUM_INT                     = 0x8DF4;
	this.HIGH_INT                       = 0x8DF5;

	/* Framebuffer Object. */
	this.FRAMEBUFFER                    = 0x8D40;
	this.RENDERBUFFER                   = 0x8D41;

	this.RGBA4                          = 0x8056;
	this.RGB5_A1                        = 0x8057;
	this.RGB565                         = 0x8D62;
	this.DEPTH_COMPONENT16              = 0x81A5;
	this.STENCIL_INDEX                  = 0x1901;
	this.STENCIL_INDEX8                 = 0x8D48;
	this.DEPTH_STENCIL                  = 0x84F9;

	this.RENDERBUFFER_WIDTH             = 0x8D42;
	this.RENDERBUFFER_HEIGHT            = 0x8D43;
	this.RENDERBUFFER_INTERNAL_FORMAT   = 0x8D44;
	this.RENDERBUFFER_RED_SIZE          = 0x8D50;
	this.RENDERBUFFER_GREEN_SIZE        = 0x8D51;
	this.RENDERBUFFER_BLUE_SIZE         = 0x8D52;
	this.RENDERBUFFER_ALPHA_SIZE        = 0x8D53;
	this.RENDERBUFFER_DEPTH_SIZE        = 0x8D54;
	this.RENDERBUFFER_STENCIL_SIZE      = 0x8D55;

	this.FRAMEBUFFER_ATTACHMENT_OBJECT_TYPE           = 0x8CD0;
	this.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME           = 0x8CD1;
	this.FRAMEBUFFER_ATTACHMENT_TEXTURE_LEVEL         = 0x8CD2;
	this.FRAMEBUFFER_ATTACHMENT_TEXTURE_CUBE_MAP_FACE = 0x8CD3;

	this.COLOR_ATTACHMENT0              = 0x8CE0;
	this.DEPTH_ATTACHMENT               = 0x8D00;
	this.STENCIL_ATTACHMENT             = 0x8D20;
	this.DEPTH_STENCIL_ATTACHMENT       = 0x821A;

	this.NONE                           = 0;

	this.FRAMEBUFFER_COMPLETE                      = 0x8CD5;
	this.FRAMEBUFFER_INCOMPLETE_ATTACHMENT         = 0x8CD6;
	this.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 0x8CD7;
	this.FRAMEBUFFER_INCOMPLETE_DIMENSIONS         = 0x8CD9;
	this.FRAMEBUFFER_UNSUPPORTED                   = 0x8CDD;

	this.ACTIVE_TEXTURE                 = 0x84E0;
	this.FRAMEBUFFER_BINDING            = 0x8CA6;
	this.RENDERBUFFER_BINDING           = 0x8CA7;
	this.MAX_RENDERBUFFER_SIZE          = 0x84E8;

	this.INVALID_FRAMEBUFFER_OPERATION  = 0x0506;

	/* WebGL-specific enums */
	this.UNPACK_FLIP_Y_WEBGL            = 0x9240;
	this.UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
	this.CONTEXT_LOST_WEBGL             = 0x9242;
	this.UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;
	this.BROWSER_DEFAULT_WEBGL          = 0x9244;

	//=======
	// State
	//=======

	var commandBuffer = [];

	var nextId = 1; // valid ids are > 0

	var bindings = {
		texture2D: null,
		arrayBuffer: null,
		elementArrayBuffer: null,
		program: null,
		framebuffer: null,
		activeTexture: this.TEXTURE0,
		generateMipmapHint: this.DONT_CARE,
		blendSrcRGB: this.ONE,
		blendSrcAlpha: this.ONE,
		blendDstRGB: this.ZERO,
		blendDstAlpha: this.ZERO,
		blendEquationRGB: this.FUNC_ADD,
		blendEquationAlpha: this.FUNC_ADD,
		enabledState: {} // Stores whether various GL state via glEnable/glDisable/glIsEnabled/getParameter are enabled.
	};
	var stateDisabledByDefault = [this.BLEND, this.CULL_FACE, this.DEPTH_TEST, this.DITHER, this.POLYGON_OFFSET_FILL, this.SAMPLE_ALPHA_TO_COVERAGE, this.SAMPLE_COVERAGE, this.SCISSOR_TEST, this.STENCIL_TEST];
	for (var i in stateDisabledByDefault) {
		bindings.enabledState[stateDisabledByDefault[i]] = false; // It will be important to distinguish between false and undefined (undefined meaning the state cap enum is unknown/unsupported).
	}

	//==========
	// Functions
	//==========

	var that = this;

	// Helpers

	this.onmessage = function(msg) {
		//dump('worker GL got ' + JSON.stringify(msg) + '\n');
		switch (msg.op) {
			case 'setPrefetched': {
				WebGLWorker.prototype.prefetchedParameters = msg.parameters;
				WebGLWorker.prototype.prefetchedExtensions = msg.extensions;
				WebGLWorker.prototype.prefetchedPrecisions = msg.precisions;
				removeRunDependency('gl-prefetch');
				break;
			}
			default: throw 'weird gl onmessage ' + JSON.stringify(msg);
		}
	};

	function revname(name) {
		for (var x in that) if (that[x] === name) return x;
		return null;
	}

	// GL

	this.getParameter = function(name) {
		assert(name);
		if (name in this.prefetchedParameters) return this.prefetchedParameters[name];
		switch (name) {
			case this.TEXTURE_BINDING_2D: {
				return bindings.texture2D;
			}
			case this.ARRAY_BUFFER_BINDING: {
				return bindings.arrayBuffer;
			}
			case this.ELEMENT_ARRAY_BUFFER_BINDING: {
				return bindings.elementArrayBuffer;
			}
			case this.CURRENT_PROGRAM: {
				return bindings.program;
			}
			case this.FRAMEBUFFER_BINDING: {
				return bindings.framebuffer;
			}
			case this.ACTIVE_TEXTURE: {
				return bindings.activeTexture;
			}
			case this.GENERATE_MIPMAP_HINT: {
				return bindings.generateMipmapHint;
			}
			case this.BLEND_SRC_RGB: {
				return bindings.blendSrcRGB;
			}
			case this.BLEND_SRC_ALPHA: {
				return bindings.blendSrcAlpha;
			}
			case this.BLEND_DST_RGB: {
				return bindings.blendDstRGB;
			}
			case this.BLEND_DST_ALPHA: {
				return bindings.blendDstAlpha;
			}
			case this.BLEND_EQUATION_RGB: {
				return bindings.blendEquationRGB;
			}
			case this.BLEND_EQUATION_ALPHA: {
				return bindings.blendEquationAlpha;
			}
			default: {
				if (bindings.enabledState[name] !== undefined) return bindings.enabledState[name];
				throw 'TODO: get parameter ' + name + ' : ' + revname(name);
			}
		}
	};
	this.getExtension = function(name) {
		var i = this.prefetchedExtensions.indexOf(name);
		if (i < 0) return null;
		commandBuffer.push(1, name);
		switch (name) {
			case 'EXT_texture_filter_anisotropic': {
				return {
					TEXTURE_MAX_ANISOTROPY_EXT:     0x84FE,
					MAX_TEXTURE_MAX_ANISOTROPY_EXT: 0x84FF
				};
			}
			case 'WEBGL_draw_buffers': {
				return {
					COLOR_ATTACHMENT0_WEBGL     : 0x8CE0,
					COLOR_ATTACHMENT1_WEBGL     : 0x8CE1,
					COLOR_ATTACHMENT2_WEBGL     : 0x8CE2,
					COLOR_ATTACHMENT3_WEBGL     : 0x8CE3,
					COLOR_ATTACHMENT4_WEBGL     : 0x8CE4,
					COLOR_ATTACHMENT5_WEBGL     : 0x8CE5,
					COLOR_ATTACHMENT6_WEBGL     : 0x8CE6,
					COLOR_ATTACHMENT7_WEBGL     : 0x8CE7,
					COLOR_ATTACHMENT8_WEBGL     : 0x8CE8,
					COLOR_ATTACHMENT9_WEBGL     : 0x8CE9,
					COLOR_ATTACHMENT10_WEBGL    : 0x8CEA,
					COLOR_ATTACHMENT11_WEBGL    : 0x8CEB,
					COLOR_ATTACHMENT12_WEBGL    : 0x8CEC,
					COLOR_ATTACHMENT13_WEBGL    : 0x8CED,
					COLOR_ATTACHMENT14_WEBGL    : 0x8CEE,
					COLOR_ATTACHMENT15_WEBGL    : 0x8CEF,

					DRAW_BUFFER0_WEBGL          : 0x8825,
					DRAW_BUFFER1_WEBGL          : 0x8826,
					DRAW_BUFFER2_WEBGL          : 0x8827,
					DRAW_BUFFER3_WEBGL          : 0x8828,
					DRAW_BUFFER4_WEBGL          : 0x8829,
					DRAW_BUFFER5_WEBGL          : 0x882A,
					DRAW_BUFFER6_WEBGL          : 0x882B,
					DRAW_BUFFER7_WEBGL          : 0x882C,
					DRAW_BUFFER8_WEBGL          : 0x882D,
					DRAW_BUFFER9_WEBGL          : 0x882E,
					DRAW_BUFFER10_WEBGL         : 0x882F,
					DRAW_BUFFER11_WEBGL         : 0x8830,
					DRAW_BUFFER12_WEBGL         : 0x8831,
					DRAW_BUFFER13_WEBGL         : 0x8832,
					DRAW_BUFFER14_WEBGL         : 0x8833,
					DRAW_BUFFER15_WEBGL         : 0x8834,

					MAX_COLOR_ATTACHMENTS_WEBGL : 0x8CDF,
					MAX_DRAW_BUFFERS_WEBGL      : 0x8824,

					drawBuffersWEBGL: function(buffers) {
						that.drawBuffersWEBGL(buffers);
					}
				};
			}
			case 'OES_standard_derivatives': {
				return { FRAGMENT_SHADER_DERIVATIVE_HINT_OES: 0x8B8B };
			}
		};
		return true; // TODO: return an object here
	};
	this.getSupportedExtensions = function() {
		return this.prefetchedExtensions;
	};
	this.getShaderPrecisionFormat = function(shaderType, precisionType) {
		return this.prefetchedPrecisions[shaderType][precisionType];
	};
	this.enable = function(cap) {
		commandBuffer.push(2, cap);
		bindings.enabledState[cap] = true;
	};
	this.isEnabled = function(cap) {
		return bindings.enabledState[cap];
	};
	this.disable = function(cap) {
		commandBuffer.push(3, cap);
		bindings.enabledState[cap] = false;
	};
	this.clear = function(mask) {
		commandBuffer.push(4, mask);
	};
	this.clearColor = function(r, g, b, a) {
		commandBuffer.push(5, r, g, b, a);
	};
	this.createShader = function(type) {
		var id = nextId++;
		commandBuffer.push(6, type, id);
		return { id, what: 'shader', type };
	};
	this.deleteShader = function(shader) {
		if (!shader) return;
		commandBuffer.push(7, shader.id);
	};
	this.shaderSource = function(shader, source) {
		shader.source = source;
		commandBuffer.push(8, shader.id, source);
	};
	this.compileShader = function(shader) {
		commandBuffer.push(9, shader.id);
	};
	this.getShaderInfoLog = function(shader) {
		return ''; // optimistic assumption of success; no proxying
	};
	this.createProgram = function() {
		var id = nextId++;
		commandBuffer.push(10, id);
		return new WebGLProgram(id);
	};
	this.deleteProgram = function(program) {
		if (!program) return;
		commandBuffer.push(11, program.id);
	};
	this.attachShader = function(program, shader) {
		program.shaders.push(shader);
		commandBuffer.push(12, program.id, shader.id);
	};
	this.bindAttribLocation = function(program, index, name) {
		program.nextAttributes[name] = { what: 'attribute', name, size: -1, location: index, type: '?' }; // fill in size, type later
		program.nextAttributeVec[index] = name;
		commandBuffer.push(13, program.id, index, name);
	};
	this.getAttribLocation = function(program, name) {
		// all existing attribs are cached locally
		if (name in program.attributes) return program.attributes[name].location;
		return -1;
	};
	this.linkProgram = function(program) {
		// parse shader sources
		function getTypeId(text) {
			switch (text) {
				case 'bool': return that.BOOL;
				case 'int': return that.INT;
				case 'uint': return that.UNSIGNED_INT;
				case 'float': return that.FLOAT;
				case 'vec2': return that.FLOAT_VEC2;
				case 'vec3': return that.FLOAT_VEC3;
				case 'vec4': return that.FLOAT_VEC4;
				case 'ivec2': return that.INT_VEC2;
				case 'ivec3': return that.INT_VEC3;
				case 'ivec4': return that.INT_VEC4;
				case 'bvec2': return that.BOOL_VEC2;
				case 'bvec3': return that.BOOL_VEC3;
				case 'bvec4': return that.BOOL_VEC4;
				case 'mat2': return that.FLOAT_MAT2;
				case 'mat3': return that.FLOAT_MAT3;
				case 'mat4': return that.FLOAT_MAT4;
				case 'sampler2D': return that.SAMPLER_2D;
				case 'sampler3D': return that.SAMPLER_3D;
				case 'samplerCube': return that.SAMPLER_CUBE;
				default: throw 'not yet recognized type text: ' + text;
			}
		}
		function parseElementType(shader, type, obj, vec) {
			var source = shader.source;
			source = source.replace(/\n/g, '|\n'); // barrier between lines, to make regexing easier
			var newItems = source.match(new RegExp(type + '\\s+\\w+\\s+[\\w,\\s\[\\]]+;', 'g'));
			if (!newItems) return;
			newItems.forEach(function(item) {
				var m = new RegExp(type + '\\s+(\\w+)\\s+([\\w,\\s\[\\]]+);').exec(item);
				assert(m);
				m[2].split(',').map(function(name) { name = name.trim(); return name.search(/\s/) >= 0 ? '' : name }).filter(function(name) { return !!name }).forEach(function(name) {
					var size = 1;
					var open = name.indexOf('[');
					var fullname = name;
					if (open >= 0) {
						var close = name.indexOf(']');
						size = parseInt(name.substring(open+1, close));
						name = name.substr(0, open);
						fullname = name + '[0]';
					}
					if (!obj[name]) {
						obj[name] = { what: type, name: fullname, size, location: -1, type: getTypeId(m[1]) };
						vec?.push(name);
					}
				});
			});
		}

		program.uniforms = {};
		program.uniformVec = [];

		program.attributes = program.nextAttributes;
		program.attributeVec = program.nextAttributeVec;
		program.nextAttributes = {};
		program.nextAttributeVec = [];

		var existingAttributes = {};

		program.shaders.forEach(function(shader) {
			parseElementType(shader, 'uniform', program.uniforms, program.uniformVec);
			parseElementType(shader, 'attribute', existingAttributes, null);
		});

		// bind not-yet bound attributes
		for (var attr in existingAttributes) {
			if (!(attr in program.attributes)) {
				var index = program.attributeVec.length;
				program.attributes[attr] = { what: 'attribute', name: attr, size: -1, location: index, type: '?' }; // fill in size, type later
				program.attributeVec[index] = attr;
				commandBuffer.push(13, program.id, index, attr); // do a bindAttribLocation as well, so this takes effect in the link we are about to do
			}
			program.attributes[attr].size = existingAttributes[attr].size;
			program.attributes[attr].type = existingAttributes[attr].type;
		}

		commandBuffer.push(14, program.id);
	};
	this.getProgramParameter = function(program, name) {
		switch (name) {
			case this.ACTIVE_UNIFORMS: return program.uniformVec.length;
			case this.ACTIVE_ATTRIBUTES: return program.attributeVec.length;
			case this.LINK_STATUS: {
				// optimisticaly return success; client will abort on an actual error. we assume an error-free async workflow
				commandBuffer.push(15, program.id, name);
				return true;
			}
			default: throw 'bad getProgramParameter ' + revname(name);
		}
	};
	this.getActiveAttrib = function(program, index) {
		var name = program.attributeVec[index];
		if (!name) return null;
		return program.attributes[name];
	};
	this.getActiveUniform = function(program, index) {
		var name = program.uniformVec[index];
		if (!name) return null;
		return program.uniforms[name];
	};
	this.getUniformLocation = function(program, name) {
		var fullname = name;
		var index = -1;
		var open = name.indexOf('[');
		if (open >= 0) {
			var close = name.indexOf(']');
			index = parseInt(name.substring(open+1, close));
			name = name.substr(0, open);
		}
		if (!(name in program.uniforms)) return null;
		var id = nextId++;
		commandBuffer.push(16, program.id, fullname, id);
		return { what: 'location', uniform: program.uniforms[name], id, index };
	};
	this.getProgramInfoLog = function(shader) {
		return ''; // optimistic assumption of success; no proxying
	};
	this.useProgram = function(program) {
		commandBuffer.push(17, program ? program.id : 0);
		bindings.program = program;
	};
	this.uniform1i = function(location, data) {
		if (!location) return;
		commandBuffer.push(18, location.id, data);
	};
	this.uniform1f = function(location, data) {
		if (!location) return;
		commandBuffer.push(19, location.id, data);
	};
	this.uniform3fv = function(location, data) {
		if (!location) return;
		commandBuffer.push(20, location.id, new Float32Array(data));
	};
	this.uniform4f = function(location, x, y, z, w) {
		if (!location) return;
		commandBuffer.push(21, location.id, new Float32Array([x, y, z, w]));
	};
	this.uniform4fv = function(location, data) {
		if (!location) return;
		commandBuffer.push(21, location.id, new Float32Array(data));
	};
	this.uniformMatrix4fv = function(location, transpose, data) {
		if (!location) return;
		commandBuffer.push(22, location.id, transpose, new Float32Array(data));
	};
	this.vertexAttrib4fv = function(index, values) {
		commandBuffer.push(23, index, new Float32Array(values));
	};
	this.createBuffer = function() {
		var id = nextId++;
		commandBuffer.push(24, id);
		return new WebGLBuffer(id);
	};
	this.deleteBuffer = function(buffer) {
		if (!buffer) return;
		commandBuffer.push(25, buffer.id);
	};
	this.bindBuffer = function(target, buffer) {
		commandBuffer.push(26, target, buffer ? buffer.id : 0);
		switch (target) {
			case this.ARRAY_BUFFER_BINDING: {
				bindings.arrayBuffer = buffer;
				break;
			}
			case this.ELEMENT_ARRAY_BUFFER_BINDING: {
				bindings.elementArrayBuffer = buffer;
				break;
			}
		}
	};
	function duplicate(something) {
		// clone data properly: handles numbers, null, typed arrays, js arrays and array buffers
		if (!something || typeof something == 'number') return something;
		if (something.slice) return something.slice(0); // ArrayBuffer or js array
		return new something.constructor(something); // typed array
	}
	this.bufferData = function(target, something, usage) {
		commandBuffer.push(27, target, duplicate(something), usage);
	};
	this.bufferSubData = function(target, offset, something) {
		commandBuffer.push(28, target, offset, duplicate(something));
	};
	this.viewport = function(x, y, w, h) {
		commandBuffer.push(29, x, y, w, h);
	};
	this.vertexAttribPointer = function(index, size, type, normalized, stride, offset) {
		commandBuffer.push(30, index, size, type, normalized, stride, offset);
	};
	this.enableVertexAttribArray = function(index) {
		commandBuffer.push(31, index);
	};
	this.disableVertexAttribArray = function(index) {
		commandBuffer.push(32, index);
	};
	this.drawArrays = function(mode, first, count) {
		commandBuffer.push(33, mode, first, count);
	};
	this.drawElements = function(mode, count, type, offset) {
		commandBuffer.push(34, mode, count, type, offset);
	};
	this.getError = function() {
		// optimisticaly return success; client will abort on an actual error. we assume an error-free async workflow
		commandBuffer.push(35);
		return this.NO_ERROR;
	};
	this.createTexture = function() {
		var id = nextId++;
		commandBuffer.push(36, id);
		return new WebGLTexture(id);
	};
	this.deleteTexture = function(texture) {
		if (!texture) return;
		commandBuffer.push(37, texture.id);
		texture.id = 0;
	};
	this.isTexture = function(texture) {
		return texture && texture.what === 'texture' && texture.id > 0 && texture.binding;
	};
	this.bindTexture = function(target, texture) {
		switch (target) {
			case that.TEXTURE_2D: {
				bindings.texture2D = texture;
				break;
			}
		}
		if (texture) texture.binding = target;
		commandBuffer.push(38, target, texture ? texture.id : 0);
	};
	this.texParameteri = function(target, pname, param) {
		commandBuffer.push(39, target, pname, param);
	};
	this.texImage2D = function(target, level, internalformat, width, height, border, format, type, pixels) {
		if (pixels === undefined) {
			format = width; // width, height, border do not exist in the shorter overload
			type = height;
			pixels = border;
			assert(pixels instanceof Image);
			assert(internalformat === format && format === this.RGBA); // HTML Images are RGBA, 8-bit
			assert(type === this.UNSIGNED_BYTE);
			var data = pixels.data;
			width = data.width;
			height = data.height;
			border = 0;
			pixels = new Uint8Array(data.data); // XXX transform from clamped to normal, could have been done in duplicate
		}
		commandBuffer.push(40, target, level, internalformat, width, height, border, format, type, duplicate(pixels));
	};
	this.compressedTexImage2D = function(target, level, internalformat, width, height, border, pixels) {
		commandBuffer.push(41, target, level, internalformat, width, height, border, duplicate(pixels));
	};
	this.activeTexture = function(texture) {
		commandBuffer.push(42, texture);
		bindings.activeTexture = texture;
	};
	this.getShaderParameter = function(shader, pname) {
		switch (pname) {
			case this.SHADER_TYPE: return shader.type;
			case this.COMPILE_STATUS: {
				// optimisticaly return success; client will abort on an actual error. we assume an error-free async workflow
				commandBuffer.push(43, shader.id, pname);
				return true;
			}
			default: throw 'unsupported getShaderParameter ' + pname;
		}
	};
	this.clearDepth = function(depth) {
		commandBuffer.push(44, depth);
	};
	this.depthFunc = function(depth) {
		commandBuffer.push(45, depth);
	};
	this.frontFace = function(depth) {
		commandBuffer.push(46, depth);
	};
	this.cullFace = function(depth) {
		commandBuffer.push(47, depth);
	};
	this.readPixels = function(depth) {
		abort('readPixels is impossible, we are async GL');
	};
	this.pixelStorei = function(pname, param) {
		commandBuffer.push(48, pname, param);
	};
	this.depthMask = function(flag) {
		commandBuffer.push(49, flag);
	};
	this.depthRange = function(near, far) {
		commandBuffer.push(50, near, far);
	};
	this.blendFunc = function(sfactor, dfactor) {
		commandBuffer.push(51, sfactor, dfactor);
		bindings.blendSrcRGB = bindings.blendSrcAlpha = sfactor;
		bindings.blendDstRGB = bindings.blendDstAlpha = dfactor;
	};
	this.scissor = function(x, y, width, height) {
		commandBuffer.push(52, x, y, width, height);
	};
	this.colorMask = function(red, green, blue, alpha) {
		commandBuffer.push(53, red, green, blue, alpha);
	};
	this.lineWidth = function(width) {
		commandBuffer.push(54, width);
	};
	this.createFramebuffer = function() {
		var id = nextId++;
		commandBuffer.push(55, id);
		return new WebGLFramebuffer(id);
	};
	this.deleteFramebuffer = function(framebuffer) {
		if (!framebuffer) return;
		commandBuffer.push(56, framebuffer.id);
	};
	this.bindFramebuffer = function(target, framebuffer) {
		commandBuffer.push(57, target, framebuffer ? framebuffer.id : 0);
		bindings.framebuffer = framebuffer;
	};
	this.framebufferTexture2D = function(target, attachment, textarget, texture, level) {
		commandBuffer.push(58, target, attachment, textarget, texture ? texture.id : 0, level);
	};
	this.checkFramebufferStatus = function(target) {
		return this.FRAMEBUFFER_COMPLETE; // XXX totally wrong
	};
	this.createRenderbuffer = function() {
		var id = nextId++;
		commandBuffer.push(59, id);
		return new WebGLRenderbuffer(id);
	};
	this.deleteRenderbuffer = function(renderbuffer) {
		if (!renderbuffer) return;
		commandBuffer.push(60, renderbuffer.id);
	};
	this.bindRenderbuffer = function(target, renderbuffer) {
		commandBuffer.push(61, target, renderbuffer ? renderbuffer.id : 0);
	};
	this.renderbufferStorage = function(target, internalformat, width, height) {
		commandBuffer.push(62, target, internalformat, width, height);
	};
	this.framebufferRenderbuffer = function(target, attachment, renderbuffertarget, renderbuffer) {
		commandBuffer.push(63, target, attachment, renderbuffertarget, renderbuffer ? renderbuffer.id : 0);
	};
	this.debugPrint = function(text) { // useful to interleave debug output properly with client GL commands
		commandBuffer.push(64, text);
	};
	this.hint = function(target, mode) {
		commandBuffer.push(65, target, mode);
		if (target == this.GENERATE_MIPMAP_HINT) bindings.generateMipmapHint = mode;
	};
	this.blendEquation = function(mode) {
		commandBuffer.push(66, mode);
		bindings.blendEquationRGB = bindings.blendEquationAlpha = mode;
	};
	this.generateMipmap = function(target) {
		commandBuffer.push(67, target);
	};
	this.uniformMatrix3fv = function(location, transpose, data) {
		if (!location) return;
		commandBuffer.push(68, location.id, transpose, new Float32Array(data));
	};
	this.stencilMask = function(mask) {
		commandBuffer.push(69, mask);
	};
	this.clearStencil = function(s) {
		commandBuffer.push(70, s);
	};
	this.texSubImage2D = function(target, level, xoffset, yoffset, width, height, format, type, pixels) {
		if (pixels === undefined) {
			// shorter overload:      target, level, xoffset, yoffset, format,  type, pixels
			var formatTemp = format;
			format = width;
			type = height;
			pixels = formatTemp;
			assert(pixels instanceof Image);
			assert(format === this.RGBA); // HTML Images are RGBA, 8-bit
			assert(type === this.UNSIGNED_BYTE);
			var data = pixels.data;
			width = data.width;
			height = data.height;
			pixels = new Uint8Array(data.data); // XXX transform from clamped to normal, could have been done in duplicate
		}
		commandBuffer.push(71, target, level, xoffset, yoffset, width, height, format, type, duplicate(pixels));
	};
	this.uniform3f = function(location, x, y, z) {
		if (!location) return;
		commandBuffer.push(72, location.id, x, y, z);
	};
	this.blendFuncSeparate = function(srcRGB, dstRGB, srcAlpha, dstAlpha) {
		commandBuffer.push(73, srcRGB, dstRGB, srcAlpha, dstAlpha);
		bindings.blendSrcRGB = srcRGB;
		bindings.blendSrcAlpha = srcAlpha;
		bindings.blendDstRGB = dstRGB;
		bindings.blendDstAlpha = dstAlpha;
	}
	this.uniform2fv = function(location, data) {
		if (!location) return;
		commandBuffer.push(74, location.id, new Float32Array(data));
	};
	this.texParameterf = function(target, pname, param) {
		commandBuffer.push(75, target, pname, param);
	};
	this.isContextLost = function() {
		// optimisticaly return that everything is ok; client will abort on an actual context loss. we assume an error-free async workflow
		commandBuffer.push(76);
		return false;
	};
	this.isProgram = function(program) {
		return program && program.what === 'program';
	};
	this.blendEquationSeparate = function(rgb, alpha) {
		commandBuffer.push(77, rgb, alpha);
		bindings.blendEquationRGB = rgb;
		bindings.blendEquationAlpha = alpha;
	};
	this.stencilFuncSeparate = function(face, func, ref, mask) {
		commandBuffer.push(78, face, func, ref, mask);
	};
	this.stencilOpSeparate = function(face, fail, zfail, zpass) {
		commandBuffer.push(79, face, fail, zfail, zpass);
	};
	this.drawBuffersWEBGL = function(buffers) {
		commandBuffer.push(80, buffers);
	};
	this.uniform1iv = function(location, data) {
		if (!location) return;
		commandBuffer.push(81, location.id, new Int32Array(data));
	};
	this.uniform1fv = function(location, data) {
		if (!location) return;
		commandBuffer.push(82, location.id, new Float32Array(data));
	};

	// Setup

	var theoreticalTracker = new FPSTracker('server (theoretical)');
	var throttledTracker = new FPSTracker('server (client-throttled)');

	function preRAF() {
		//theoreticalTracker.tick();
		// if too many frames in queue, skip a main loop iter
		if (Math.abs(frameId - clientFrameId) >= 4) {
			return false;
		}
		//throttledTracker.tick();
	}

	var postRAFed = false;

	function postRAF() {
		if (commandBuffer.length > 0) {
			postMessage({ target: 'gl', op: 'render', commandBuffer: commandBuffer });
			commandBuffer = [];
		}
		postRAFed = true;
	}

	assert(!Browser.doSwapBuffers);
	Browser.doSwapBuffers = postRAF;

	var trueRAF = window.requestAnimationFrame;
	window.requestAnimationFrame = function(func) {
		trueRAF(function() {
			if (preRAF() === false) {
				window.requestAnimationFrame(func); // skip this frame, do it later
				return;
			}
			postRAFed = false;
			func();
			if (!postRAFed) { // if we already posted this frame (e.g. from doSwapBuffers) do not post again
				postRAF();
			}
		});
	}

}

// share prefetched data among all instances

WebGLWorker.prototype.prefetchedParameters = {};
WebGLWorker.prototype.prefetchedExtensions = {};
WebGLWorker.prototype.prefetchedPrecisions = {};

// end include: webGLWorker.js
// include: proxyWorker.js
/*
* Implements the server/worker side of proxyClient.js.
* This code gets included in the main emscripten output
* when PROXY_TO_WORKER is used. The resulting code then
* needs to be run in a worker and receive events from
* proxyClient.js running on the main thread.
*/

if (!ENVIRONMENT_IS_NODE) {

function FPSTracker(text) {
	var last = 0;
	var mean = 0;
	var counter = 0;
	this.tick = () => {
		var now = Date.now();
		if (last > 0) {
			var diff = now - last;
			mean = 0.99*mean + 0.01*diff;
			if (counter++ === 60) {
				counter = 0;
				dump(text + ' fps: ' + (1000/mean).toFixed(2) + '\n');
			}
		}
		last = now;
	}
}

function Element() { throw 'TODO: Element' }
function HTMLCanvasElement() { throw 'TODO: HTMLCanvasElement' }
function HTMLVideoElement() { throw 'TODO: HTMLVideoElement' }

var KeyboardEvent = {
	'DOM_KEY_LOCATION_RIGHT': 2,
};

function PropertyBag() {
	this.addProperty = () => {};
	this.removeProperty = () => {};
	this.setProperty = () => {};
};

var IndexedObjects = {
	nextId: 1,
	cache: {},
	add(object) {
		object.id = this.nextId++;
		this.cache[object.id] = object;
	}
};

function EventListener() {
	this.listeners = {};

	this.addEventListener = function addEventListener(event, func) {
		this.listeners[event] ||= [];
		this.listeners[event].push(func);
	};

	this.removeEventListener = function(event, func) {
		var list = this.listeners[event];
		if (!list) return;
		var me = list.indexOf(func);
		if (me < 0) return;
		list.splice(me, 1);
	};

	this.fireEvent = function(event) {
		event.preventDefault = () => {};

		if (event.type in this.listeners) {
			this.listeners[event.type].forEach((listener) => listener(event));
		}
	}
}

function Image() {
	IndexedObjects.add(this);
	EventListener.call(this);
	var src = '';
	Object.defineProperty(this, 'src', {
		set: (value) => {
			src = value;
			assert(this.id);
			postMessage({ target: 'Image', method: 'src', src, id: this.id });
		},
		get: () => src
	});
}
Image.prototype.onload = () => {};
Image.prototype.onerror = () => {};

var HTMLImageElement = Image;

var window = this;
var windowExtra = new EventListener();
for (var x in windowExtra) window[x] = windowExtra[x];

window.close = () => {
	postMessage({ target: 'window', method: 'close' });
};

window.alert = (text) => {
	err(`alert forever: ${text}`);
	while (1) {};
};

window.scrollX = window.scrollY = 0; // TODO: proxy these

window.WebGLRenderingContext = WebGLWorker;

window.requestAnimationFrame = (function() {
	// similar to Browser.requestAnimationFrame
	var nextRAF = 0;
	return function(func) {
		// try to keep 60fps between calls to here
		var now = Date.now();
		if (nextRAF === 0) {
			nextRAF = now + 1000/60;
		} else {
			while (now + 2 >= nextRAF) { // fudge a little, to avoid timer jitter causing us to do lots of delay:0
				nextRAF += 1000/60;
			}
		}
		var delay = Math.max(nextRAF - now, 0);
		setTimeout(func, delay);
	};
})();

var webGLWorker = new WebGLWorker();

var document = new EventListener();

document.createElement = (what) => {
	switch (what) {
		case 'canvas': {
			var canvas = new EventListener();
			canvas.ensureData = () => {
				if (!canvas.data || canvas.data.width !== canvas.width || canvas.data.height !== canvas.height) {
					canvas.data = {
						width: canvas.width,
						height: canvas.height,
						data: new Uint8Array(canvas.width*canvas.height*4)
					};
					if (canvas === Module['canvas']) {
						postMessage({ target: 'canvas', op: 'resize', width: canvas.width, height: canvas.height });
					}
				}
			};
			canvas.getContext = (type, attributes) => {
				if (canvas === Module['canvas']) {
					postMessage({ target: 'canvas', op: 'getContext', type, attributes });
				}
				if (type === '2d') {
					return {
						getImageData: (x, y, w, h) => {
							assert(x == 0 && y == 0 && w == canvas.width && h == canvas.height);
							canvas.ensureData();
							return {
								width: canvas.data.width,
								height: canvas.data.height,
								data: new Uint8Array(canvas.data.data) // TODO: can we avoid this copy?
							};
						},
						putImageData: (image, x, y) => {
							canvas.ensureData();
							assert(x == 0 && y == 0 && image.width == canvas.width && image.height == canvas.height);
							canvas.data.data.set(image.data); // TODO: can we avoid this copy?
							if (canvas === Module['canvas']) {
								postMessage({ target: 'canvas', op: 'render', image: canvas.data });
							}
						},
						drawImage: (image, x, y, w, h, ox, oy, ow, oh) => {
							assert (!x && !y && !ox && !oy);
							assert(w === ow && h === oh);
							assert(canvas.width === w || w === undefined);
							assert(canvas.height === h || h === undefined);
							assert(image.width === canvas.width && image.height === canvas.height);
							canvas.ensureData();
							canvas.data.data.set(image.data.data); // TODO: can we avoid this copy?
							if (canvas === Module['canvas']) {
								postMessage({ target: 'canvas', op: 'render', image: canvas.data });
							}
						}
					};
				} else {
					return webGLWorker;
				}
			};
			canvas.boundingClientRect = {};
			canvas.getBoundingClientRect = () => ({
				width: canvas.boundingClientRect.width,
				height: canvas.boundingClientRect.height,
				top: canvas.boundingClientRect.top,
				left: canvas.boundingClientRect.left,
				bottom: canvas.boundingClientRect.bottom,
				right: canvas.boundingClientRect.right
			});
			canvas.style = new PropertyBag();
			canvas.exitPointerLock = () => {};

			canvas.width_ ||= 0;
			canvas.height_ ||= 0;
			Object.defineProperty(canvas, 'width', {
				set: (value) => {
					canvas.width_ = value;
					if (canvas === Module['canvas']) {
						postMessage({ target: 'canvas', op: 'resize', width: canvas.width_, height: canvas.height_ });
					}
				},
				get: () => canvas.width_
			});
			Object.defineProperty(canvas, 'height', {
				set: (value) => {
					canvas.height_ = value;
					if (canvas === Module['canvas']) {
						postMessage({ target: 'canvas', op: 'resize', width: canvas.width_, height: canvas.height_ });
					}
				},
				get: () => canvas.height_
			});

			var style = {
				parentCanvas: canvas,
				removeProperty: () => {},
				setProperty:  () => {},
			};

			Object.defineProperty(style, 'cursor', {
				set: (value) => {
					if (!style.cursor_ || style.cursor_ !== value) {
						style.cursor_ = value;
						if (style.parentCanvas === Module['canvas']) {
							postMessage({ target: 'canvas', op: 'setObjectProperty', object: 'style', property: 'cursor', value: style.cursor_ });
						}
					}
				},
				get: () => style.cursor,
			});

			canvas.style = style;
			return canvas;
		}
		default: {
			throw 'document.createElement ' + what;
		}
	}
};

document.getElementById = (id) => {
	if (id === 'canvas' || id === 'application-canvas') {
		return Module.canvas;
	}
	throw 'document.getElementById failed on ' + id;
};

document.querySelector = (id) => {
	if (id === '#canvas' || id === '#application-canvas' || id === 'canvas' || id === 'application-canvas') {
		return Module.canvas;
	}
	throw 'document.querySelector failed on ' + id;
};

document.documentElement = {};

document.styleSheets = [{
	cssRules: [], // TODO: forward to client
	insertRule(rule, i) {
		this.cssRules.splice(i, 0, rule);
	}
}];

document.URL = 'http://worker.not.yet.ready.wait.for.window.onload?fake';

function Audio() {
	warnOnce('faking Audio elements, no actual sound will play');
}
Audio.prototype = new EventListener();
Object.defineProperty(Audio.prototype, 'src', {
	set(value) {
		if (value[0] === 'd') return; // ignore data urls
		this.onerror();
	},
});

Audio.prototype.play = () => {};
Audio.prototype.pause = () => {};

Audio.prototype.cloneNode = () => new Audio;

function AudioContext() {
	warnOnce('faking WebAudio elements, no actual sound will play');
	var makeNode = () => {
		return {
			connect: () => {},
			disconnect: () => {},
		}
	};
	this.listener = {
		setPosition: () => {},
		setOrientation: () => {},
	};
	this.decodeAudioData = () => {}; // ignore callbacks
	this.createBuffer = makeNode;
	this.createBufferSource = makeNode;
	this.createGain = makeNode;
	this.createPanner = makeNode;
}

var screen = {
	width: 0,
	height: 0
};

Module.canvas = document.createElement('canvas');

Module.setStatus = () => {};

out = (x) => {
	//dump('OUT: ' + x + '\n');
	postMessage({ target: 'stdout', content: x });
};
err = (x) => {
	//dump('ERR: ' + x + '\n');
	postMessage({ target: 'stderr', content: x });
};

// Frame throttling

var frameId = 0;
var clientFrameId = 0;

var postMainLoop = Module['postMainLoop'];
Module['postMainLoop'] = () => {
	postMainLoop?.();
	// frame complete, send a frame id
	postMessage({ target: 'tick', id: frameId++ });
	commandBuffer = [];
};

// Wait to start running until we receive some info from the client

	addRunDependency('gl-prefetch');
	addRunDependency('worker-init');

}

// buffer messages until the program starts to run

var messageBuffer = null;
var messageResenderTimeout = null;
var calledMain = false;

// Set calledMain to true during postRun which happens once main returns
Module['postRun'] ||= [];
if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
Module['postRun'].push(() => { calledMain = true; });

function messageResender() {
	if (calledMain) {
		assert(messageBuffer && messageBuffer.length > 0);
		messageResenderTimeout = null;
		messageBuffer.forEach(onmessage);
		messageBuffer = null;
	} else {
		messageResenderTimeout = setTimeout(messageResender, 100);
	}
}

function onMessageFromMainEmscriptenThread(message) {
	if (!calledMain && !message.data.preMain) {
		if (!messageBuffer) {
			messageBuffer = [];
			messageResenderTimeout = setTimeout(messageResender, 100);
		}
		messageBuffer.push(message);
		return;
	}
	if (calledMain && messageResenderTimeout) {
		clearTimeout(messageResenderTimeout);
		messageResender();
	}
	//dump('worker got ' + JSON.stringify(message.data).substr(0, 150) + '\n');
	switch (message.data.target) {
		case 'document': {
			document.fireEvent(message.data.event);
			break;
		}
		case 'window': {
			window.fireEvent(message.data.event);
			break;
		}
		case 'canvas': {
			if (message.data.event) {
				Module.canvas.fireEvent(message.data.event);
			} else if (message.data.boundingClientRect) {
				Module.canvas.boundingClientRect = message.data.boundingClientRect;
			} else throw 'ey?';
			break;
		}
		case 'gl': {
			webGLWorker.onmessage(message.data);
			break;
		}
		case 'tock': {
			clientFrameId = message.data.id;
			break;
		}
		case 'Image': {
			var img = IndexedObjects.cache[message.data.id];
			switch (message.data.method) {
				case 'onload': {
					img.width = message.data.width;
					img.height = message.data.height;
					img.data = { width: img.width, height: img.height, data: message.data.data };
					img.complete = true;
					img.onload();
					break;
				}
				case 'onerror': {
					img.onerror({ srcElement: img });
					break;
				}
			}
			break;
		}
		case 'IDBStore': {
			assert(message.data.method === 'response');
			assert(IDBStore.pending);
			IDBStore.pending(message.data);
			break;
		}
		case 'worker-init': {
			Module.canvas = document.createElement('canvas');
			screen.width = Module.canvas.width_ = message.data.width;
			screen.height = Module.canvas.height_ = message.data.height;
			Module.canvas.boundingClientRect = message.data.boundingClientRect;
			if (ENVIRONMENT_IS_NODE)
			document.URL = message.data.URL;
			window.fireEvent({ type: 'load' });
			removeRunDependency('worker-init');
			break;
		}
		case 'custom': {
			if (Module['onCustomMessage']) {
				Module['onCustomMessage'](message);
			} else {
				throw 'Custom message received but worker Module.onCustomMessage not implemented.';
			}
			break;
		}
		case 'setimmediate': {
			if (Module['setImmediates']) Module['setImmediates'].shift()();
			break;
		}
		default: throw 'wha? ' + message.data.target;
	}
};

	onmessage = onMessageFromMainEmscriptenThread;

// proxyWorker.js has defined 'document' and 'window' objects above, so need to
// initialize them for library_html5.js explicitly here.
if (typeof specialHTMLTargets != 'undefined') {
	specialHTMLTargets = [0, document, window];
}

function postCustomMessage(data) {
	postMessage({ target: 'custom', userData: data });
}
// end include: proxyWorker.js
}




var calledRun;

dependenciesFulfilled = function runCaller() {
	// If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
	if (!calledRun) run();
	if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};

function callMain(args = []) {

	var entryFunction = _main;

	args.unshift(thisProgram);

	var argc = args.length;
	var argv = stackAlloc((argc + 1) * 4);
	var argv_ptr = argv;
	args.forEach((arg) => {
		HEAPU32[((argv_ptr)>>2)] = stringToUTF8OnStack(arg);
		argv_ptr += 4;
	});
	HEAPU32[((argv_ptr)>>2)] = 0;

	try {

		var ret = entryFunction(argc, argv);

		// if we're not running an evented main loop, it's time to exit
		exitJS(ret, /* implicit = */ true);
		return ret;
	}
	catch (e) {
		return handleException(e);
	}
}

function run(args = arguments_) {

	if (runDependencies > 0) {
		return;
	}

	preRun();

	// a preRun added a dependency, run will be called later
	if (runDependencies > 0) {
		return;
	}

	function doRun() {
		// run may have just been called through dependencies being fulfilled just in this very frame,
		// or while the async setStatus time below was happening
		if (calledRun) return;
		calledRun = true;
		Module['calledRun'] = true;

		if (ABORT) return;

		initRuntime();

		preMain();

		if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();

		if (shouldRunNow) callMain(args);

		postRun();
	}

	if (Module['setStatus']) {
		Module['setStatus']('Running...');
		setTimeout(function() {
			setTimeout(function() {
				Module['setStatus']('');
			}, 1);
			doRun();
		}, 1);
	} else
	{
		doRun();
	}
}

if (Module['preInit']) {
	if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
	while (Module['preInit'].length > 0) {
		Module['preInit'].pop()();
	}
}

// shouldRunNow refers to calling main(), not run().
var shouldRunNow = true;

if (Module['noInitialRun']) shouldRunNow = false;

run();

// end include: postamble.js
