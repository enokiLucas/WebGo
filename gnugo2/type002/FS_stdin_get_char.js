  var FS_stdin_getChar = async () => { //road001
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
					// Cross-platform differences: on Windows, reading EOF throws an exception, but on other OSs.
					// reading EOF returns 0. Uniformize behavior by treating the EOF exception to return 0.
					if (e.toString().includes('EOF')) bytesRead = 0;
					else throw e;
				}

				if (bytesRead > 0) {
					result = buf.slice(0, bytesRead).toString('utf-8');
				} else {
					result = null;
				}
			} else if (typeof window != 'undefined' && typeof window.prompt == 'function') { //ALERT
				// Browser.
				//result = window.prompt('Input: ');  // returns null on cancel
				/*=====================
				 * START CUSTOM LOGIC
				 ======================*/
				  const data = await document.addEventListener('new-gtp-command', (e) => {
					return e.detail.data;
					console.log(e.datail.data);
				})
				console.log(data);



				/*=====================
				 * END CUSTOM LOGIC
				 ======================*/

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
---------------------------------------------

var FS_stdin_getChar = async () => { //road001
	if (!FS_stdin_getChar_buffer.length) {
		let result = null;

		result = await new Promise((resolve) => {
			document.addEventListener('new-gtp-command', (e) => {
				resolve(e.detail.data); //Resolve the promise with data
				console.log(e.detail.data);
			}, {once: true});
		});

		if (result !== null) {
			result += '\n';
		}

		if (!result) {
			return null;
		}

		FS_stdin_getChar_buffer = intArrayFromString(result, true);
	}
	return FS_stdin_getChar_buffer.shift();
};
-----------------------------------------------
var FS_stdin_getChar = async () => {
    if (!FS_stdin_getChar_buffer.length) {
        let result = await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error("Timeout waiting for input"));
            }, 5000); // Timeout after 5000 milliseconds, or 5 seconds

            document.addEventListener('new-gtp-command', (e) => {
                clearTimeout(timeoutId); // Clear timeout upon event reception
                resolve(e.detail.data); // Resolve the promise with data
                console.log(e.detail.data);
            }, {once: true});
        }).catch(error => {
            console.error(error); // Log or handle the error as needed
            return null;
        });

        if (result !== null) {
            result += '\n';
        }

        if (!result) {
            return null;
        }

        FS_stdin_getChar_buffer = intArrayFromString(result, true);
    }
    return FS_stdin_getChar_buffer.shift();
};
===========================Road
Using the locking mechanism did not worked, I believe we will have to manually have each, or at least most of the chain, be asyncronous. Below you can see the whole chain of functions and operations, starting with _fd_read and ending with FS_stdin_getChar function that we have being working.
By analasing the script using the chrome dev tools, I am fairly certain that _fd_read is called by the module.
Some functions will have the following line commented:  //Another code not relevant for our case
This is because those lines are part of the API and there is a bunch of code that does not concern our particular endeavor.
Each function contains a comment like //roadX
Where X represents a number, these are markers to facilitate me finding the functions, it also shows the position in the chain, where 6 is closest to the module and calls number 5 and so on.
How do you think we can asyncronize this chain in order to prevent the thread from being blocked?


function _fd_read(fd, iov, iovcnt, pnum) { //road006
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

/** @param {number=} offset */
var doReadv = (stream, iov, iovcnt, offset) => { //road005
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

var FS = {
	//Another code not relevant for our case
	read(stream, buffer, offset, length, position) { //road004
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
	//Another code not relevant for our case
}

var TTY = {
	//Another code not relevant for our case
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
		read(stream, buffer, offset, length, pos /* ignored */) { //road003
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
	//Another code not relevant for our case
}

var TTY = {
	//Another code not relevant for our case
	default_tty_ops:{
		get_char(tty) { //road002
			return FS_stdin_getChar();
		},
		//Another code not relevant for our case
	}
}

	let isLocked = false; // Check if the function below is already running
	var FS_stdin_getChar = async () => { //road001

		if (isLocked) return; // Exit if function is already running
		isLocked = true; // Set lock

		if (!FS_stdin_getChar_buffer.length) {

			let result = await new Promise((resolve, reject) => {
				const timeoutID = setTimeout(() => {
					console.log("Timeout: No input received."); //TEST
					reject(new Error('Timeout waiting for input.'));
				}, 10000); //Timeout after 10 seconds.

				document.addEventListener('new-gtp-command', (e) => {
					clearTimeout(timeoutID); //clear timeout upon event reception.
					resolve(e.detail.data);//resolve the promise
					console.log('Input received: '+e.detail.data);//TEST
				}, {once: true});

			}).catch(error => {
				console.error('error: '+error); //TEST
				return null;
			})

			if (result !== null) {
				result += '\n';
			}

			if (!result) {
				isLocked = false; //release lock
				return null;
			}

			FS_stdin_getChar_buffer = intArrayFromString(result, true);
		}
		isLocked = false; //Release lock
		return FS_stdin_getChar_buffer.shift();
	};


