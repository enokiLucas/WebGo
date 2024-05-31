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
}

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
}
