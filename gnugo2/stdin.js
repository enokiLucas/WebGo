var FS_stdin_getChar_buffer = [];

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
				var stdin = FS.open('/dev/stdin', 0);
				var stdout = FS.open('/dev/stdout', 1);
				var stderr = FS.open('/dev/stderr', 1);
			},

init(input, output, error) {
				FS.init.initialized = true;

				// Allow Module.stdin etc. to provide defaults, if none explicitly passed to us here
				Module['stdin'] = input || Module['stdin'];
				Module['stdout'] = output || Module['stdout'];
				Module['stderr'] = error || Module['stderr'];

				FS.createStandardStreams();
			},
