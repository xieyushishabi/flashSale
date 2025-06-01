/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 2261:
/***/ ((module) => {

/*!
 * ee-first
 * Copyright(c) 2014 Jonathan Ong
 * MIT Licensed
 */



/**
 * Module exports.
 * @public
 */

module.exports = first

/**
 * Get the first event in a set of event emitters and event pairs.
 *
 * @param {array} stuff
 * @param {function} done
 * @public
 */

function first(stuff, done) {
  if (!Array.isArray(stuff))
    throw new TypeError('arg must be an array of [ee, events...] arrays')

  var cleanups = []

  for (var i = 0; i < stuff.length; i++) {
    var arr = stuff[i]

    if (!Array.isArray(arr) || arr.length < 2)
      throw new TypeError('each array member must be [ee, events...]')

    var ee = arr[0]

    for (var j = 1; j < arr.length; j++) {
      var event = arr[j]
      var fn = listener(event, callback)

      // listen to the event
      ee.on(event, fn)
      // push this listener to the list of cleanups
      cleanups.push({
        ee: ee,
        event: event,
        fn: fn,
      })
    }
  }

  function callback() {
    cleanup()
    done.apply(null, arguments)
  }

  function cleanup() {
    var x
    for (var i = 0; i < cleanups.length; i++) {
      x = cleanups[i]
      x.ee.removeListener(x.event, x.fn)
    }
  }

  function thunk(fn) {
    done = fn
  }

  thunk.cancel = cleanup

  return thunk
}

/**
 * Create the event listener.
 * @private
 */

function listener(event, done) {
  return function onevent(arg1) {
    var args = new Array(arguments.length)
    var ee = this
    var err = event === 'error'
      ? arg1
      : null

    // copy args to prevent arguments escaping scope
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }

    done(err, ee, event, args)
  }
}


/***/ }),

/***/ 2878:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Dirent = void 0;
const constants_1 = __nccwpck_require__(2055);
const encoding_1 = __nccwpck_require__(5900);
const { S_IFMT, S_IFDIR, S_IFREG, S_IFBLK, S_IFCHR, S_IFLNK, S_IFIFO, S_IFSOCK } = constants_1.constants;
/**
 * A directory entry, like `fs.Dirent`.
 */
class Dirent {
    constructor() {
        this.name = '';
        this.path = '';
        this.mode = 0;
    }
    static build(link, encoding) {
        const dirent = new Dirent();
        const { mode } = link.getNode();
        dirent.name = (0, encoding_1.strToEncoding)(link.getName(), encoding);
        dirent.mode = mode;
        dirent.path = link.getParentPath();
        return dirent;
    }
    _checkModeProperty(property) {
        return (this.mode & S_IFMT) === property;
    }
    isDirectory() {
        return this._checkModeProperty(S_IFDIR);
    }
    isFile() {
        return this._checkModeProperty(S_IFREG);
    }
    isBlockDevice() {
        return this._checkModeProperty(S_IFBLK);
    }
    isCharacterDevice() {
        return this._checkModeProperty(S_IFCHR);
    }
    isSymbolicLink() {
        return this._checkModeProperty(S_IFLNK);
    }
    isFIFO() {
        return this._checkModeProperty(S_IFIFO);
    }
    isSocket() {
        return this._checkModeProperty(S_IFSOCK);
    }
}
exports.Dirent = Dirent;
exports["default"] = Dirent;
//# sourceMappingURL=Dirent.js.map

/***/ }),

/***/ 3441:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Stats = void 0;
const constants_1 = __nccwpck_require__(2055);
const { S_IFMT, S_IFDIR, S_IFREG, S_IFBLK, S_IFCHR, S_IFLNK, S_IFIFO, S_IFSOCK } = constants_1.constants;
/**
 * Statistics about a file/directory, like `fs.Stats`.
 */
class Stats {
    static build(node, bigint = false) {
        const stats = new Stats();
        const { uid, gid, atime, mtime, ctime } = node;
        const getStatNumber = !bigint ? number => number : number => BigInt(number);
        // Copy all values on Stats from Node, so that if Node values
        // change, values on Stats would still be the old ones,
        // just like in Node fs.
        stats.uid = getStatNumber(uid);
        stats.gid = getStatNumber(gid);
        stats.rdev = getStatNumber(0);
        stats.blksize = getStatNumber(4096);
        stats.ino = getStatNumber(node.ino);
        stats.size = getStatNumber(node.getSize());
        stats.blocks = getStatNumber(1);
        stats.atime = atime;
        stats.mtime = mtime;
        stats.ctime = ctime;
        stats.birthtime = ctime;
        stats.atimeMs = getStatNumber(atime.getTime());
        stats.mtimeMs = getStatNumber(mtime.getTime());
        const ctimeMs = getStatNumber(ctime.getTime());
        stats.ctimeMs = ctimeMs;
        stats.birthtimeMs = ctimeMs;
        if (bigint) {
            stats.atimeNs = BigInt(atime.getTime()) * BigInt(1000000);
            stats.mtimeNs = BigInt(mtime.getTime()) * BigInt(1000000);
            const ctimeNs = BigInt(ctime.getTime()) * BigInt(1000000);
            stats.ctimeNs = ctimeNs;
            stats.birthtimeNs = ctimeNs;
        }
        stats.dev = getStatNumber(0);
        stats.mode = getStatNumber(node.mode);
        stats.nlink = getStatNumber(node.nlink);
        return stats;
    }
    _checkModeProperty(property) {
        return (Number(this.mode) & S_IFMT) === property;
    }
    isDirectory() {
        return this._checkModeProperty(S_IFDIR);
    }
    isFile() {
        return this._checkModeProperty(S_IFREG);
    }
    isBlockDevice() {
        return this._checkModeProperty(S_IFBLK);
    }
    isCharacterDevice() {
        return this._checkModeProperty(S_IFCHR);
    }
    isSymbolicLink() {
        return this._checkModeProperty(S_IFLNK);
    }
    isFIFO() {
        return this._checkModeProperty(S_IFIFO);
    }
    isSocket() {
        return this._checkModeProperty(S_IFSOCK);
    }
}
exports.Stats = Stats;
exports["default"] = Stats;
//# sourceMappingURL=Stats.js.map

/***/ }),

/***/ 2055:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.constants = void 0;
exports.constants = {
    O_RDONLY: 0,
    O_WRONLY: 1,
    O_RDWR: 2,
    S_IFMT: 61440,
    S_IFREG: 32768,
    S_IFDIR: 16384,
    S_IFCHR: 8192,
    S_IFBLK: 24576,
    S_IFIFO: 4096,
    S_IFLNK: 40960,
    S_IFSOCK: 49152,
    O_CREAT: 64,
    O_EXCL: 128,
    O_NOCTTY: 256,
    O_TRUNC: 512,
    O_APPEND: 1024,
    O_DIRECTORY: 65536,
    O_NOATIME: 262144,
    O_NOFOLLOW: 131072,
    O_SYNC: 1052672,
    O_SYMLINK: 2097152,
    O_DIRECT: 16384,
    O_NONBLOCK: 2048,
    S_IRWXU: 448,
    S_IRUSR: 256,
    S_IWUSR: 128,
    S_IXUSR: 64,
    S_IRWXG: 56,
    S_IRGRP: 32,
    S_IWGRP: 16,
    S_IXGRP: 8,
    S_IRWXO: 7,
    S_IROTH: 4,
    S_IWOTH: 2,
    S_IXOTH: 1,
    F_OK: 0,
    R_OK: 4,
    W_OK: 2,
    X_OK: 1,
    UV_FS_SYMLINK_DIR: 1,
    UV_FS_SYMLINK_JUNCTION: 2,
    UV_FS_COPYFILE_EXCL: 1,
    UV_FS_COPYFILE_FICLONE: 2,
    UV_FS_COPYFILE_FICLONE_FORCE: 4,
    COPYFILE_EXCL: 1,
    COPYFILE_FICLONE: 2,
    COPYFILE_FICLONE_FORCE: 4,
};
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ 5900:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.strToEncoding = exports.assertEncoding = exports.ENCODING_UTF8 = void 0;
const buffer_1 = __nccwpck_require__(3730);
const errors = __nccwpck_require__(4040);
exports.ENCODING_UTF8 = 'utf8';
function assertEncoding(encoding) {
    if (encoding && !buffer_1.Buffer.isEncoding(encoding))
        throw new errors.TypeError('ERR_INVALID_OPT_VALUE_ENCODING', encoding);
}
exports.assertEncoding = assertEncoding;
function strToEncoding(str, encoding) {
    if (!encoding || encoding === exports.ENCODING_UTF8)
        return str; // UTF-8
    if (encoding === 'buffer')
        return new buffer_1.Buffer(str); // `buffer` encoding
    return new buffer_1.Buffer(str).toString(encoding); // Custom encoding
}
exports.strToEncoding = strToEncoding;
//# sourceMappingURL=encoding.js.map

/***/ }),

/***/ 1664:
/***/ ((module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.memfs = exports.fs = exports.createFsFromVolume = exports.vol = exports.Volume = void 0;
const Stats_1 = __nccwpck_require__(3441);
const Dirent_1 = __nccwpck_require__(2878);
const volume_1 = __nccwpck_require__(380);
const constants_1 = __nccwpck_require__(2055);
const fsSynchronousApiList_1 = __nccwpck_require__(2601);
const fsCallbackApiList_1 = __nccwpck_require__(5314);
const { F_OK, R_OK, W_OK, X_OK } = constants_1.constants;
exports.Volume = volume_1.Volume;
// Default volume.
exports.vol = new volume_1.Volume();
function createFsFromVolume(vol) {
    const fs = { F_OK, R_OK, W_OK, X_OK, constants: constants_1.constants, Stats: Stats_1.default, Dirent: Dirent_1.default };
    // Bind FS methods.
    for (const method of fsSynchronousApiList_1.fsSynchronousApiList)
        if (typeof vol[method] === 'function')
            fs[method] = vol[method].bind(vol);
    for (const method of fsCallbackApiList_1.fsCallbackApiList)
        if (typeof vol[method] === 'function')
            fs[method] = vol[method].bind(vol);
    fs.StatWatcher = vol.StatWatcher;
    fs.FSWatcher = vol.FSWatcher;
    fs.WriteStream = vol.WriteStream;
    fs.ReadStream = vol.ReadStream;
    fs.promises = vol.promises;
    fs._toUnixTimestamp = volume_1.toUnixTimestamp;
    fs.__vol = vol;
    return fs;
}
exports.createFsFromVolume = createFsFromVolume;
exports.fs = createFsFromVolume(exports.vol);
/**
 * Creates a new file system instance.
 *
 * @param json File system structure expressed as a JSON object.
 *        Use `null` for empty directories and empty string for empty files.
 * @param cwd Current working directory. The JSON structure will be created
 *        relative to this path.
 * @returns A `memfs` file system instance, which is a drop-in replacement for
 *          the `fs` module.
 */
const memfs = (json = {}, cwd = '/') => {
    const vol = exports.Volume.fromNestedJSON(json, cwd);
    const fs = createFsFromVolume(vol);
    return { fs, vol };
};
exports.memfs = memfs;
module.exports = Object.assign(Object.assign({}, module.exports), exports.fs);
module.exports.semantic = true;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 3730:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bufferFrom = exports.bufferAllocUnsafe = exports.Buffer = void 0;
const buffer_1 = __nccwpck_require__(4300);
Object.defineProperty(exports, "Buffer", ({ enumerable: true, get: function () { return buffer_1.Buffer; } }));
function bufferV0P12Ponyfill(arg0, ...args) {
    return new buffer_1.Buffer(arg0, ...args);
}
const bufferAllocUnsafe = buffer_1.Buffer.allocUnsafe || bufferV0P12Ponyfill;
exports.bufferAllocUnsafe = bufferAllocUnsafe;
const bufferFrom = buffer_1.Buffer.from || bufferV0P12Ponyfill;
exports.bufferFrom = bufferFrom;
//# sourceMappingURL=buffer.js.map

/***/ }),

/***/ 4040:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


// The whole point behind this internal module is to allow Node.js to no
// longer be forced to treat every error message change as a semver-major
// change. The NodeError classes here all expose a `code` property whose
// value statically and permanently identifies the error. While the error
// message may change, the code should not.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.E = exports.AssertionError = exports.message = exports.RangeError = exports.TypeError = exports.Error = void 0;
const assert = __nccwpck_require__(9491);
const util = __nccwpck_require__(3837);
const kCode = typeof Symbol === 'undefined' ? '_kCode' : Symbol('code');
const messages = {}; // new Map();
function makeNodeError(Base) {
    return class NodeError extends Base {
        constructor(key, ...args) {
            super(message(key, args));
            this.code = key;
            this[kCode] = key;
            this.name = `${super.name} [${this[kCode]}]`;
        }
    };
}
const g = typeof globalThis !== 'undefined' ? globalThis : global;
class AssertionError extends g.Error {
    constructor(options) {
        if (typeof options !== 'object' || options === null) {
            throw new exports.TypeError('ERR_INVALID_ARG_TYPE', 'options', 'object');
        }
        if (options.message) {
            super(options.message);
        }
        else {
            super(`${util.inspect(options.actual).slice(0, 128)} ` +
                `${options.operator} ${util.inspect(options.expected).slice(0, 128)}`);
        }
        this.generatedMessage = !options.message;
        this.name = 'AssertionError [ERR_ASSERTION]';
        this.code = 'ERR_ASSERTION';
        this.actual = options.actual;
        this.expected = options.expected;
        this.operator = options.operator;
        exports.Error.captureStackTrace(this, options.stackStartFunction);
    }
}
exports.AssertionError = AssertionError;
function message(key, args) {
    assert.strictEqual(typeof key, 'string');
    // const msg = messages.get(key);
    const msg = messages[key];
    assert(msg, `An invalid error message key was used: ${key}.`);
    let fmt;
    if (typeof msg === 'function') {
        fmt = msg;
    }
    else {
        fmt = util.format;
        if (args === undefined || args.length === 0)
            return msg;
        args.unshift(msg);
    }
    return String(fmt.apply(null, args));
}
exports.message = message;
// Utility function for registering the error codes. Only used here. Exported
// *only* to allow for testing.
function E(sym, val) {
    messages[sym] = typeof val === 'function' ? val : String(val);
}
exports.E = E;
exports.Error = makeNodeError(g.Error);
exports.TypeError = makeNodeError(g.TypeError);
exports.RangeError = makeNodeError(g.RangeError);
// To declare an error message, use the E(sym, val) function above. The sym
// must be an upper case string. The val can be either a function or a string.
// The return value of the function must be a string.
// Examples:
// E('EXAMPLE_KEY1', 'This is the error value');
// E('EXAMPLE_KEY2', (a, b) => return `${a} ${b}`);
//
// Once an error code has been assigned, the code itself MUST NOT change and
// any given error code must never be reused to identify a different error.
//
// Any error code added here should also be added to the documentation
//
// Note: Please try to keep these in alphabetical order
E('ERR_ARG_NOT_ITERABLE', '%s must be iterable');
E('ERR_ASSERTION', '%s');
E('ERR_BUFFER_OUT_OF_BOUNDS', bufferOutOfBounds);
E('ERR_CHILD_CLOSED_BEFORE_REPLY', 'Child closed before reply received');
E('ERR_CONSOLE_WRITABLE_STREAM', 'Console expects a writable stream instance for %s');
E('ERR_CPU_USAGE', 'Unable to obtain cpu usage %s');
E('ERR_DNS_SET_SERVERS_FAILED', (err, servers) => `c-ares failed to set servers: "${err}" [${servers}]`);
E('ERR_FALSY_VALUE_REJECTION', 'Promise was rejected with falsy value');
E('ERR_ENCODING_NOT_SUPPORTED', enc => `The "${enc}" encoding is not supported`);
E('ERR_ENCODING_INVALID_ENCODED_DATA', enc => `The encoded data was not valid for encoding ${enc}`);
E('ERR_HTTP_HEADERS_SENT', 'Cannot render headers after they are sent to the client');
E('ERR_HTTP_INVALID_STATUS_CODE', 'Invalid status code: %s');
E('ERR_HTTP_TRAILER_INVALID', 'Trailers are invalid with this transfer encoding');
E('ERR_INDEX_OUT_OF_RANGE', 'Index out of range');
E('ERR_INVALID_ARG_TYPE', invalidArgType);
E('ERR_INVALID_ARRAY_LENGTH', (name, len, actual) => {
    assert.strictEqual(typeof actual, 'number');
    return `The array "${name}" (length ${actual}) must be of length ${len}.`;
});
E('ERR_INVALID_BUFFER_SIZE', 'Buffer size must be a multiple of %s');
E('ERR_INVALID_CALLBACK', 'Callback must be a function');
E('ERR_INVALID_CHAR', 'Invalid character in %s');
E('ERR_INVALID_CURSOR_POS', 'Cannot set cursor row without setting its column');
E('ERR_INVALID_FD', '"fd" must be a positive integer: %s');
E('ERR_INVALID_FILE_URL_HOST', 'File URL host must be "localhost" or empty on %s');
E('ERR_INVALID_FILE_URL_PATH', 'File URL path %s');
E('ERR_INVALID_HANDLE_TYPE', 'This handle type cannot be sent');
E('ERR_INVALID_IP_ADDRESS', 'Invalid IP address: %s');
E('ERR_INVALID_OPT_VALUE', (name, value) => {
    return `The value "${String(value)}" is invalid for option "${name}"`;
});
E('ERR_INVALID_OPT_VALUE_ENCODING', value => `The value "${String(value)}" is invalid for option "encoding"`);
E('ERR_INVALID_REPL_EVAL_CONFIG', 'Cannot specify both "breakEvalOnSigint" and "eval" for REPL');
E('ERR_INVALID_SYNC_FORK_INPUT', 'Asynchronous forks do not support Buffer, Uint8Array or string input: %s');
E('ERR_INVALID_THIS', 'Value of "this" must be of type %s');
E('ERR_INVALID_TUPLE', '%s must be an iterable %s tuple');
E('ERR_INVALID_URL', 'Invalid URL: %s');
E('ERR_INVALID_URL_SCHEME', expected => `The URL must be ${oneOf(expected, 'scheme')}`);
E('ERR_IPC_CHANNEL_CLOSED', 'Channel closed');
E('ERR_IPC_DISCONNECTED', 'IPC channel is already disconnected');
E('ERR_IPC_ONE_PIPE', 'Child process can have only one IPC pipe');
E('ERR_IPC_SYNC_FORK', 'IPC cannot be used with synchronous forks');
E('ERR_MISSING_ARGS', missingArgs);
E('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
E('ERR_NAPI_CONS_FUNCTION', 'Constructor must be a function');
E('ERR_NAPI_CONS_PROTOTYPE_OBJECT', 'Constructor.prototype must be an object');
E('ERR_NO_CRYPTO', 'Node.js is not compiled with OpenSSL crypto support');
E('ERR_NO_LONGER_SUPPORTED', '%s is no longer supported');
E('ERR_PARSE_HISTORY_DATA', 'Could not parse history data in %s');
E('ERR_SOCKET_ALREADY_BOUND', 'Socket is already bound');
E('ERR_SOCKET_BAD_PORT', 'Port should be > 0 and < 65536');
E('ERR_SOCKET_BAD_TYPE', 'Bad socket type specified. Valid types are: udp4, udp6');
E('ERR_SOCKET_CANNOT_SEND', 'Unable to send data');
E('ERR_SOCKET_CLOSED', 'Socket is closed');
E('ERR_SOCKET_DGRAM_NOT_RUNNING', 'Not running');
E('ERR_STDERR_CLOSE', 'process.stderr cannot be closed');
E('ERR_STDOUT_CLOSE', 'process.stdout cannot be closed');
E('ERR_STREAM_WRAP', 'Stream has StringDecoder set or is in objectMode');
E('ERR_TLS_CERT_ALTNAME_INVALID', "Hostname/IP does not match certificate's altnames: %s");
E('ERR_TLS_DH_PARAM_SIZE', size => `DH parameter size ${size} is less than 2048`);
E('ERR_TLS_HANDSHAKE_TIMEOUT', 'TLS handshake timeout');
E('ERR_TLS_RENEGOTIATION_FAILED', 'Failed to renegotiate');
E('ERR_TLS_REQUIRED_SERVER_NAME', '"servername" is required parameter for Server.addContext');
E('ERR_TLS_SESSION_ATTACK', 'TSL session renegotiation attack detected');
E('ERR_TRANSFORM_ALREADY_TRANSFORMING', 'Calling transform done when still transforming');
E('ERR_TRANSFORM_WITH_LENGTH_0', 'Calling transform done when writableState.length != 0');
E('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s');
E('ERR_UNKNOWN_SIGNAL', 'Unknown signal: %s');
E('ERR_UNKNOWN_STDIN_TYPE', 'Unknown stdin file type');
E('ERR_UNKNOWN_STREAM_TYPE', 'Unknown stream file type');
E('ERR_V8BREAKITERATOR', 'Full ICU data not installed. ' + 'See https://github.com/nodejs/node/wiki/Intl');
function invalidArgType(name, expected, actual) {
    assert(name, 'name is required');
    // determiner: 'must be' or 'must not be'
    let determiner;
    if (expected.includes('not ')) {
        determiner = 'must not be';
        expected = expected.split('not ')[1];
    }
    else {
        determiner = 'must be';
    }
    let msg;
    if (Array.isArray(name)) {
        const names = name.map(val => `"${val}"`).join(', ');
        msg = `The ${names} arguments ${determiner} ${oneOf(expected, 'type')}`;
    }
    else if (name.includes(' argument')) {
        // for the case like 'first argument'
        msg = `The ${name} ${determiner} ${oneOf(expected, 'type')}`;
    }
    else {
        const type = name.includes('.') ? 'property' : 'argument';
        msg = `The "${name}" ${type} ${determiner} ${oneOf(expected, 'type')}`;
    }
    // if actual value received, output it
    if (arguments.length >= 3) {
        msg += `. Received type ${actual !== null ? typeof actual : 'null'}`;
    }
    return msg;
}
function missingArgs(...args) {
    assert(args.length > 0, 'At least one arg needs to be specified');
    let msg = 'The ';
    const len = args.length;
    args = args.map(a => `"${a}"`);
    switch (len) {
        case 1:
            msg += `${args[0]} argument`;
            break;
        case 2:
            msg += `${args[0]} and ${args[1]} arguments`;
            break;
        default:
            msg += args.slice(0, len - 1).join(', ');
            msg += `, and ${args[len - 1]} arguments`;
            break;
    }
    return `${msg} must be specified`;
}
function oneOf(expected, thing) {
    assert(expected, 'expected is required');
    assert(typeof thing === 'string', 'thing is required');
    if (Array.isArray(expected)) {
        const len = expected.length;
        assert(len > 0, 'At least one expected value needs to be specified');
        // tslint:disable-next-line
        expected = expected.map(i => String(i));
        if (len > 2) {
            return `one of ${thing} ${expected.slice(0, len - 1).join(', ')}, or ` + expected[len - 1];
        }
        else if (len === 2) {
            return `one of ${thing} ${expected[0]} or ${expected[1]}`;
        }
        else {
            return `of ${thing} ${expected[0]}`;
        }
    }
    else {
        return `of ${thing} ${String(expected)}`;
    }
}
function bufferOutOfBounds(name, isWriting) {
    if (isWriting) {
        return 'Attempt to write outside buffer bounds';
    }
    else {
        return `"${name}" is outside of buffer bounds`;
    }
}
//# sourceMappingURL=errors.js.map

/***/ }),

/***/ 4615:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.printTree = void 0;
const printTree = (tab = '', children) => {
    children = children.filter(Boolean);
    let str = '';
    for (let i = 0; i < children.length; i++) {
        const isLast = i >= children.length - 1;
        const fn = children[i];
        if (!fn)
            continue;
        const child = fn(tab + `${isLast ? ' ' : '│'}  `);
        const branch = child ? (isLast ? '└─' : '├─') : '│ ';
        str += `\n${tab}${branch} ${child}`;
    }
    return str;
};
exports.printTree = printTree;
//# sourceMappingURL=printTree.js.map

/***/ }),

/***/ 332:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.newNotAllowedError = exports.newTypeMismatchError = exports.newNotFoundError = exports.assertCanWrite = exports.assertName = exports.basename = exports.ctx = void 0;
/**
 * Creates a new {@link NodeFsaContext}.
 */
const ctx = (partial = {}) => {
    return Object.assign({ separator: '/', syncHandleAllowed: false, mode: 'read' }, partial);
};
exports.ctx = ctx;
const basename = (path, separator) => {
    if (path[path.length - 1] === separator)
        path = path.slice(0, -1);
    const lastSlashIndex = path.lastIndexOf(separator);
    return lastSlashIndex === -1 ? path : path.slice(lastSlashIndex + 1);
};
exports.basename = basename;
const nameRegex = /^(\.{1,2})$|^(.*([\/\\]).*)$/;
const assertName = (name, method, klass) => {
    const isInvalid = !name || nameRegex.test(name);
    if (isInvalid)
        throw new TypeError(`Failed to execute '${method}' on '${klass}': Name is not allowed.`);
};
exports.assertName = assertName;
const assertCanWrite = (mode) => {
    if (mode !== 'readwrite')
        throw new DOMException('The request is not allowed by the user agent or the platform in the current context.', 'NotAllowedError');
};
exports.assertCanWrite = assertCanWrite;
const newNotFoundError = () => new DOMException('A requested file or directory could not be found at the time an operation was processed.', 'NotFoundError');
exports.newNotFoundError = newNotFoundError;
const newTypeMismatchError = () => new DOMException('The path supplied exists, but was not an entry of requested type.', 'TypeMismatchError');
exports.newTypeMismatchError = newTypeMismatchError;
const newNotAllowedError = () => new DOMException('Permission not granted.', 'NotAllowedError');
exports.newNotAllowedError = newNotAllowedError;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 8616:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.File = exports.Link = exports.Node = exports.SEP = void 0;
const process_1 = __nccwpck_require__(4486);
const buffer_1 = __nccwpck_require__(3730);
const constants_1 = __nccwpck_require__(2055);
const events_1 = __nccwpck_require__(2361);
const Stats_1 = __nccwpck_require__(3441);
const { S_IFMT, S_IFDIR, S_IFREG, S_IFLNK, O_APPEND } = constants_1.constants;
const getuid = () => { var _a, _b; return (_b = (_a = process_1.default.getuid) === null || _a === void 0 ? void 0 : _a.call(process_1.default)) !== null && _b !== void 0 ? _b : 0; };
const getgid = () => { var _a, _b; return (_b = (_a = process_1.default.getgid) === null || _a === void 0 ? void 0 : _a.call(process_1.default)) !== null && _b !== void 0 ? _b : 0; };
exports.SEP = '/';
/**
 * Node in a file system (like i-node, v-node).
 */
class Node extends events_1.EventEmitter {
    constructor(ino, perm = 0o666) {
        super();
        // User ID and group ID.
        this._uid = getuid();
        this._gid = getgid();
        this._atime = new Date();
        this._mtime = new Date();
        this._ctime = new Date();
        this._perm = 0o666; // Permissions `chmod`, `fchmod`
        this.mode = S_IFREG; // S_IFDIR, S_IFREG, etc.. (file by default?)
        // Number of hard links pointing at this Node.
        this._nlink = 1;
        this._perm = perm;
        this.mode |= perm;
        this.ino = ino;
    }
    set ctime(ctime) {
        this._ctime = ctime;
    }
    get ctime() {
        return this._ctime;
    }
    set uid(uid) {
        this._uid = uid;
        this.ctime = new Date();
    }
    get uid() {
        return this._uid;
    }
    set gid(gid) {
        this._gid = gid;
        this.ctime = new Date();
    }
    get gid() {
        return this._gid;
    }
    set atime(atime) {
        this._atime = atime;
        this.ctime = new Date();
    }
    get atime() {
        return this._atime;
    }
    set mtime(mtime) {
        this._mtime = mtime;
        this.ctime = new Date();
    }
    get mtime() {
        return this._mtime;
    }
    set perm(perm) {
        this._perm = perm;
        this.ctime = new Date();
    }
    get perm() {
        return this._perm;
    }
    set nlink(nlink) {
        this._nlink = nlink;
        this.ctime = new Date();
    }
    get nlink() {
        return this._nlink;
    }
    getString(encoding = 'utf8') {
        this.atime = new Date();
        return this.getBuffer().toString(encoding);
    }
    setString(str) {
        // this.setBuffer(bufferFrom(str, 'utf8'));
        this.buf = (0, buffer_1.bufferFrom)(str, 'utf8');
        this.touch();
    }
    getBuffer() {
        this.atime = new Date();
        if (!this.buf)
            this.setBuffer((0, buffer_1.bufferAllocUnsafe)(0));
        return (0, buffer_1.bufferFrom)(this.buf); // Return a copy.
    }
    setBuffer(buf) {
        this.buf = (0, buffer_1.bufferFrom)(buf); // Creates a copy of data.
        this.touch();
    }
    getSize() {
        return this.buf ? this.buf.length : 0;
    }
    setModeProperty(property) {
        this.mode = (this.mode & ~S_IFMT) | property;
    }
    setIsFile() {
        this.setModeProperty(S_IFREG);
    }
    setIsDirectory() {
        this.setModeProperty(S_IFDIR);
    }
    setIsSymlink() {
        this.setModeProperty(S_IFLNK);
    }
    isFile() {
        return (this.mode & S_IFMT) === S_IFREG;
    }
    isDirectory() {
        return (this.mode & S_IFMT) === S_IFDIR;
    }
    isSymlink() {
        // return !!this.symlink;
        return (this.mode & S_IFMT) === S_IFLNK;
    }
    makeSymlink(steps) {
        this.symlink = steps;
        this.setIsSymlink();
    }
    write(buf, off = 0, len = buf.length, pos = 0) {
        if (!this.buf)
            this.buf = (0, buffer_1.bufferAllocUnsafe)(0);
        if (pos + len > this.buf.length) {
            const newBuf = (0, buffer_1.bufferAllocUnsafe)(pos + len);
            this.buf.copy(newBuf, 0, 0, this.buf.length);
            this.buf = newBuf;
        }
        buf.copy(this.buf, pos, off, off + len);
        this.touch();
        return len;
    }
    // Returns the number of bytes read.
    read(buf, off = 0, len = buf.byteLength, pos = 0) {
        this.atime = new Date();
        if (!this.buf)
            this.buf = (0, buffer_1.bufferAllocUnsafe)(0);
        let actualLen = len;
        if (actualLen > buf.byteLength) {
            actualLen = buf.byteLength;
        }
        if (actualLen + pos > this.buf.length) {
            actualLen = this.buf.length - pos;
        }
        const buf2 = buf instanceof buffer_1.Buffer ? buf : buffer_1.Buffer.from(buf.buffer);
        this.buf.copy(buf2, off, pos, pos + actualLen);
        return actualLen;
    }
    truncate(len = 0) {
        if (!len)
            this.buf = (0, buffer_1.bufferAllocUnsafe)(0);
        else {
            if (!this.buf)
                this.buf = (0, buffer_1.bufferAllocUnsafe)(0);
            if (len <= this.buf.length) {
                this.buf = this.buf.slice(0, len);
            }
            else {
                const buf = (0, buffer_1.bufferAllocUnsafe)(len);
                this.buf.copy(buf);
                buf.fill(0, this.buf.length);
                this.buf = buf;
            }
        }
        this.touch();
    }
    chmod(perm) {
        this.perm = perm;
        this.mode = (this.mode & ~0o777) | perm;
        this.touch();
    }
    chown(uid, gid) {
        this.uid = uid;
        this.gid = gid;
        this.touch();
    }
    touch() {
        this.mtime = new Date();
        this.emit('change', this);
    }
    canRead(uid = getuid(), gid = getgid()) {
        if (this.perm & 4 /* S.IROTH */) {
            return true;
        }
        if (gid === this.gid) {
            if (this.perm & 32 /* S.IRGRP */) {
                return true;
            }
        }
        if (uid === this.uid) {
            if (this.perm & 256 /* S.IRUSR */) {
                return true;
            }
        }
        return false;
    }
    canWrite(uid = getuid(), gid = getgid()) {
        if (this.perm & 2 /* S.IWOTH */) {
            return true;
        }
        if (gid === this.gid) {
            if (this.perm & 16 /* S.IWGRP */) {
                return true;
            }
        }
        if (uid === this.uid) {
            if (this.perm & 128 /* S.IWUSR */) {
                return true;
            }
        }
        return false;
    }
    del() {
        this.emit('delete', this);
    }
    toJSON() {
        return {
            ino: this.ino,
            uid: this.uid,
            gid: this.gid,
            atime: this.atime.getTime(),
            mtime: this.mtime.getTime(),
            ctime: this.ctime.getTime(),
            perm: this.perm,
            mode: this.mode,
            nlink: this.nlink,
            symlink: this.symlink,
            data: this.getString(),
        };
    }
}
exports.Node = Node;
/**
 * Represents a hard link that points to an i-node `node`.
 */
class Link extends events_1.EventEmitter {
    get steps() {
        return this._steps;
    }
    // Recursively sync children steps, e.g. in case of dir rename
    set steps(val) {
        this._steps = val;
        for (const [child, link] of this.children.entries()) {
            if (child === '.' || child === '..') {
                continue;
            }
            link === null || link === void 0 ? void 0 : link.syncSteps();
        }
    }
    constructor(vol, parent, name) {
        super();
        this.children = new Map();
        // Path to this node as Array: ['usr', 'bin', 'node'].
        this._steps = [];
        // "i-node" number of the node.
        this.ino = 0;
        // Number of children.
        this.length = 0;
        this.vol = vol;
        this.parent = parent;
        this.name = name;
        this.syncSteps();
    }
    setNode(node) {
        this.node = node;
        this.ino = node.ino;
    }
    getNode() {
        return this.node;
    }
    createChild(name, node = this.vol.createNode()) {
        const link = new Link(this.vol, this, name);
        link.setNode(node);
        if (node.isDirectory()) {
            link.children.set('.', link);
            link.getNode().nlink++;
        }
        this.setChild(name, link);
        return link;
    }
    setChild(name, link = new Link(this.vol, this, name)) {
        this.children.set(name, link);
        link.parent = this;
        this.length++;
        const node = link.getNode();
        if (node.isDirectory()) {
            link.children.set('..', this);
            this.getNode().nlink++;
        }
        this.getNode().mtime = new Date();
        this.emit('child:add', link, this);
        return link;
    }
    deleteChild(link) {
        const node = link.getNode();
        if (node.isDirectory()) {
            link.children.delete('..');
            this.getNode().nlink--;
        }
        this.children.delete(link.getName());
        this.length--;
        this.getNode().mtime = new Date();
        this.emit('child:delete', link, this);
    }
    getChild(name) {
        this.getNode().mtime = new Date();
        return this.children.get(name);
    }
    getPath() {
        return this.steps.join(exports.SEP);
    }
    getParentPath() {
        return this.steps.slice(0, -1).join(exports.SEP);
    }
    getName() {
        return this.steps[this.steps.length - 1];
    }
    // del() {
    //     const parent = this.parent;
    //     if(parent) {
    //         parent.deleteChild(link);
    //     }
    //     this.parent = null;
    //     this.vol = null;
    // }
    /**
     * Walk the tree path and return the `Link` at that location, if any.
     * @param steps {string[]} Desired location.
     * @param stop {number} Max steps to go into.
     * @param i {number} Current step in the `steps` array.
     *
     * @return {Link|null}
     */
    walk(steps, stop = steps.length, i = 0) {
        if (i >= steps.length)
            return this;
        if (i >= stop)
            return this;
        const step = steps[i];
        const link = this.getChild(step);
        if (!link)
            return null;
        return link.walk(steps, stop, i + 1);
    }
    toJSON() {
        return {
            steps: this.steps,
            ino: this.ino,
            children: Array.from(this.children.keys()),
        };
    }
    syncSteps() {
        this.steps = this.parent ? this.parent.steps.concat([this.name]) : [this.name];
    }
}
exports.Link = Link;
/**
 * Represents an open file (file descriptor) that points to a `Link` (Hard-link) and a `Node`.
 */
class File {
    /**
     * Open a Link-Node pair. `node` is provided separately as that might be a different node
     * rather the one `link` points to, because it might be a symlink.
     * @param link
     * @param node
     * @param flags
     * @param fd
     */
    constructor(link, node, flags, fd) {
        this.link = link;
        this.node = node;
        this.flags = flags;
        this.fd = fd;
        this.position = 0;
        if (this.flags & O_APPEND)
            this.position = this.getSize();
    }
    getString(encoding = 'utf8') {
        return this.node.getString();
    }
    setString(str) {
        this.node.setString(str);
    }
    getBuffer() {
        return this.node.getBuffer();
    }
    setBuffer(buf) {
        this.node.setBuffer(buf);
    }
    getSize() {
        return this.node.getSize();
    }
    truncate(len) {
        this.node.truncate(len);
    }
    seekTo(position) {
        this.position = position;
    }
    stats() {
        return Stats_1.default.build(this.node);
    }
    write(buf, offset = 0, length = buf.length, position) {
        if (typeof position !== 'number')
            position = this.position;
        const bytes = this.node.write(buf, offset, length, position);
        this.position = position + bytes;
        return bytes;
    }
    read(buf, offset = 0, length = buf.byteLength, position) {
        if (typeof position !== 'number')
            position = this.position;
        const bytes = this.node.read(buf, offset, length, position);
        this.position = position + bytes;
        return bytes;
    }
    chmod(perm) {
        this.node.chmod(perm);
    }
    chown(uid, gid) {
        this.node.chown(uid, gid);
    }
}
exports.File = File;
//# sourceMappingURL=node.js.map

/***/ }),

/***/ 353:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FileHandle = void 0;
const util_1 = __nccwpck_require__(9103);
class FileHandle {
    constructor(fs, fd) {
        this.fs = fs;
        this.fd = fd;
    }
    appendFile(data, options) {
        return (0, util_1.promisify)(this.fs, 'appendFile')(this.fd, data, options);
    }
    chmod(mode) {
        return (0, util_1.promisify)(this.fs, 'fchmod')(this.fd, mode);
    }
    chown(uid, gid) {
        return (0, util_1.promisify)(this.fs, 'fchown')(this.fd, uid, gid);
    }
    close() {
        return (0, util_1.promisify)(this.fs, 'close')(this.fd);
    }
    datasync() {
        return (0, util_1.promisify)(this.fs, 'fdatasync')(this.fd);
    }
    read(buffer, offset, length, position) {
        return (0, util_1.promisify)(this.fs, 'read', bytesRead => ({ bytesRead, buffer }))(this.fd, buffer, offset, length, position);
    }
    readv(buffers, position) {
        return (0, util_1.promisify)(this.fs, 'readv', bytesRead => ({ bytesRead, buffers }))(this.fd, buffers, position);
    }
    readFile(options) {
        return (0, util_1.promisify)(this.fs, 'readFile')(this.fd, options);
    }
    stat(options) {
        return (0, util_1.promisify)(this.fs, 'fstat')(this.fd, options);
    }
    sync() {
        return (0, util_1.promisify)(this.fs, 'fsync')(this.fd);
    }
    truncate(len) {
        return (0, util_1.promisify)(this.fs, 'ftruncate')(this.fd, len);
    }
    utimes(atime, mtime) {
        return (0, util_1.promisify)(this.fs, 'futimes')(this.fd, atime, mtime);
    }
    write(buffer, offset, length, position) {
        return (0, util_1.promisify)(this.fs, 'write', bytesWritten => ({ bytesWritten, buffer }))(this.fd, buffer, offset, length, position);
    }
    writev(buffers, position) {
        return (0, util_1.promisify)(this.fs, 'writev', bytesWritten => ({ bytesWritten, buffers }))(this.fd, buffers, position);
    }
    writeFile(data, options) {
        return (0, util_1.promisify)(this.fs, 'writeFile')(this.fd, data, options);
    }
}
exports.FileHandle = FileHandle;
//# sourceMappingURL=FileHandle.js.map

/***/ }),

/***/ 1167:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FsPromises = void 0;
const util_1 = __nccwpck_require__(9103);
const constants_1 = __nccwpck_require__(2055);
class FsPromises {
    constructor(fs, FileHandle) {
        this.fs = fs;
        this.FileHandle = FileHandle;
        this.constants = constants_1.constants;
        this.cp = (0, util_1.promisify)(this.fs, 'cp');
        this.opendir = (0, util_1.promisify)(this.fs, 'opendir');
        this.statfs = (0, util_1.promisify)(this.fs, 'statfs');
        this.lutimes = (0, util_1.promisify)(this.fs, 'lutimes');
        this.access = (0, util_1.promisify)(this.fs, 'access');
        this.chmod = (0, util_1.promisify)(this.fs, 'chmod');
        this.chown = (0, util_1.promisify)(this.fs, 'chown');
        this.copyFile = (0, util_1.promisify)(this.fs, 'copyFile');
        this.lchmod = (0, util_1.promisify)(this.fs, 'lchmod');
        this.lchown = (0, util_1.promisify)(this.fs, 'lchown');
        this.link = (0, util_1.promisify)(this.fs, 'link');
        this.lstat = (0, util_1.promisify)(this.fs, 'lstat');
        this.mkdir = (0, util_1.promisify)(this.fs, 'mkdir');
        this.mkdtemp = (0, util_1.promisify)(this.fs, 'mkdtemp');
        this.readdir = (0, util_1.promisify)(this.fs, 'readdir');
        this.readlink = (0, util_1.promisify)(this.fs, 'readlink');
        this.realpath = (0, util_1.promisify)(this.fs, 'realpath');
        this.rename = (0, util_1.promisify)(this.fs, 'rename');
        this.rmdir = (0, util_1.promisify)(this.fs, 'rmdir');
        this.rm = (0, util_1.promisify)(this.fs, 'rm');
        this.stat = (0, util_1.promisify)(this.fs, 'stat');
        this.symlink = (0, util_1.promisify)(this.fs, 'symlink');
        this.truncate = (0, util_1.promisify)(this.fs, 'truncate');
        this.unlink = (0, util_1.promisify)(this.fs, 'unlink');
        this.utimes = (0, util_1.promisify)(this.fs, 'utimes');
        this.readFile = (id, options) => {
            return (0, util_1.promisify)(this.fs, 'readFile')(id instanceof this.FileHandle ? id.fd : id, options);
        };
        this.appendFile = (path, data, options) => {
            return (0, util_1.promisify)(this.fs, 'appendFile')(path instanceof this.FileHandle ? path.fd : path, data, options);
        };
        this.open = (path, flags = 'r', mode) => {
            return (0, util_1.promisify)(this.fs, 'open', fd => new this.FileHandle(this.fs, fd))(path, flags, mode);
        };
        this.writeFile = (id, data, options) => {
            return (0, util_1.promisify)(this.fs, 'writeFile')(id instanceof this.FileHandle ? id.fd : id, data, options);
        };
        this.watch = () => {
            throw new Error('Not implemented');
        };
    }
}
exports.FsPromises = FsPromises;
//# sourceMappingURL=FsPromises.js.map

/***/ }),

/***/ 6661:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FLAGS = exports.ERRSTR = void 0;
const constants_1 = __nccwpck_require__(2055);
exports.ERRSTR = {
    PATH_STR: 'path must be a string or Buffer',
    // FD:             'file descriptor must be a unsigned 32-bit integer',
    FD: 'fd must be a file descriptor',
    MODE_INT: 'mode must be an int',
    CB: 'callback must be a function',
    UID: 'uid must be an unsigned int',
    GID: 'gid must be an unsigned int',
    LEN: 'len must be an integer',
    ATIME: 'atime must be an integer',
    MTIME: 'mtime must be an integer',
    PREFIX: 'filename prefix is required',
    BUFFER: 'buffer must be an instance of Buffer or StaticBuffer',
    OFFSET: 'offset must be an integer',
    LENGTH: 'length must be an integer',
    POSITION: 'position must be an integer',
};
const { O_RDONLY, O_WRONLY, O_RDWR, O_CREAT, O_EXCL, O_TRUNC, O_APPEND, O_SYNC } = constants_1.constants;
// List of file `flags` as defined by Node.
var FLAGS;
(function (FLAGS) {
    // Open file for reading. An exception occurs if the file does not exist.
    FLAGS[FLAGS["r"] = O_RDONLY] = "r";
    // Open file for reading and writing. An exception occurs if the file does not exist.
    FLAGS[FLAGS["r+"] = O_RDWR] = "r+";
    // Open file for reading in synchronous mode. Instructs the operating system to bypass the local file system cache.
    FLAGS[FLAGS["rs"] = O_RDONLY | O_SYNC] = "rs";
    FLAGS[FLAGS["sr"] = FLAGS.rs] = "sr";
    // Open file for reading and writing, telling the OS to open it synchronously. See notes for 'rs' about using this with caution.
    FLAGS[FLAGS["rs+"] = O_RDWR | O_SYNC] = "rs+";
    FLAGS[FLAGS["sr+"] = FLAGS['rs+']] = "sr+";
    // Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
    FLAGS[FLAGS["w"] = O_WRONLY | O_CREAT | O_TRUNC] = "w";
    // Like 'w' but fails if path exists.
    FLAGS[FLAGS["wx"] = O_WRONLY | O_CREAT | O_TRUNC | O_EXCL] = "wx";
    FLAGS[FLAGS["xw"] = FLAGS.wx] = "xw";
    // Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
    FLAGS[FLAGS["w+"] = O_RDWR | O_CREAT | O_TRUNC] = "w+";
    // Like 'w+' but fails if path exists.
    FLAGS[FLAGS["wx+"] = O_RDWR | O_CREAT | O_TRUNC | O_EXCL] = "wx+";
    FLAGS[FLAGS["xw+"] = FLAGS['wx+']] = "xw+";
    // Open file for appending. The file is created if it does not exist.
    FLAGS[FLAGS["a"] = O_WRONLY | O_APPEND | O_CREAT] = "a";
    // Like 'a' but fails if path exists.
    FLAGS[FLAGS["ax"] = O_WRONLY | O_APPEND | O_CREAT | O_EXCL] = "ax";
    FLAGS[FLAGS["xa"] = FLAGS.ax] = "xa";
    // Open file for reading and appending. The file is created if it does not exist.
    FLAGS[FLAGS["a+"] = O_RDWR | O_APPEND | O_CREAT] = "a+";
    // Like 'a+' but fails if path exists.
    FLAGS[FLAGS["ax+"] = O_RDWR | O_APPEND | O_CREAT | O_EXCL] = "ax+";
    FLAGS[FLAGS["xa+"] = FLAGS['ax+']] = "xa+";
})(FLAGS || (exports.FLAGS = FLAGS = {}));
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ 5314:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fsCallbackApiList = void 0;
exports.fsCallbackApiList = [
    'access',
    'appendFile',
    'chmod',
    'chown',
    'close',
    'copyFile',
    'createReadStream',
    'createWriteStream',
    'exists',
    'fchmod',
    'fchown',
    'fdatasync',
    'fstat',
    'fsync',
    'ftruncate',
    'futimes',
    'lchmod',
    'lchown',
    'link',
    'lstat',
    'mkdir',
    'mkdtemp',
    'open',
    'read',
    'readv',
    'readdir',
    'readFile',
    'readlink',
    'realpath',
    'rename',
    'rm',
    'rmdir',
    'stat',
    'symlink',
    'truncate',
    'unlink',
    'unwatchFile',
    'utimes',
    'watch',
    'watchFile',
    'write',
    'writev',
    'writeFile',
];
//# sourceMappingURL=fsCallbackApiList.js.map

/***/ }),

/***/ 2601:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fsSynchronousApiList = void 0;
exports.fsSynchronousApiList = [
    'accessSync',
    'appendFileSync',
    'chmodSync',
    'chownSync',
    'closeSync',
    'copyFileSync',
    'existsSync',
    'fchmodSync',
    'fchownSync',
    'fdatasyncSync',
    'fstatSync',
    'fsyncSync',
    'ftruncateSync',
    'futimesSync',
    'lchmodSync',
    'lchownSync',
    'linkSync',
    'lstatSync',
    'mkdirSync',
    'mkdtempSync',
    'openSync',
    'readdirSync',
    'readFileSync',
    'readlinkSync',
    'readSync',
    'readvSync',
    'realpathSync',
    'renameSync',
    'rmdirSync',
    'rmSync',
    'statSync',
    'symlinkSync',
    'truncateSync',
    'unlinkSync',
    'utimesSync',
    'writeFileSync',
    'writeSync',
    'writevSync',
    // 'cpSync',
    // 'lutimesSync',
    // 'statfsSync',
];
//# sourceMappingURL=fsSynchronousApiList.js.map

/***/ }),

/***/ 9456:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getWriteFileOptions = exports.writeFileDefaults = exports.getRealpathOptsAndCb = exports.getRealpathOptions = exports.getStatOptsAndCb = exports.getStatOptions = exports.getAppendFileOptsAndCb = exports.getAppendFileOpts = exports.getReaddirOptsAndCb = exports.getReaddirOptions = exports.getReadFileOptions = exports.getRmOptsAndCb = exports.getRmdirOptions = exports.getDefaultOptsAndCb = exports.getDefaultOpts = exports.optsDefaults = exports.optsAndCbGenerator = exports.optsGenerator = exports.getOptions = exports.getMkdirOptions = void 0;
const constants_1 = __nccwpck_require__(6661);
const encoding_1 = __nccwpck_require__(5900);
const util_1 = __nccwpck_require__(9103);
const mkdirDefaults = {
    mode: 511 /* MODE.DIR */,
    recursive: false,
};
const getMkdirOptions = (options) => {
    if (typeof options === 'number')
        return Object.assign({}, mkdirDefaults, { mode: options });
    return Object.assign({}, mkdirDefaults, options);
};
exports.getMkdirOptions = getMkdirOptions;
const ERRSTR_OPTS = tipeof => `Expected options to be either an object or a string, but got ${tipeof} instead`;
function getOptions(defaults, options) {
    let opts;
    if (!options)
        return defaults;
    else {
        const tipeof = typeof options;
        switch (tipeof) {
            case 'string':
                opts = Object.assign({}, defaults, { encoding: options });
                break;
            case 'object':
                opts = Object.assign({}, defaults, options);
                break;
            default:
                throw TypeError(ERRSTR_OPTS(tipeof));
        }
    }
    if (opts.encoding !== 'buffer')
        (0, encoding_1.assertEncoding)(opts.encoding);
    return opts;
}
exports.getOptions = getOptions;
function optsGenerator(defaults) {
    return options => getOptions(defaults, options);
}
exports.optsGenerator = optsGenerator;
function optsAndCbGenerator(getOpts) {
    return (options, callback) => typeof options === 'function' ? [getOpts(), options] : [getOpts(options), (0, util_1.validateCallback)(callback)];
}
exports.optsAndCbGenerator = optsAndCbGenerator;
exports.optsDefaults = {
    encoding: 'utf8',
};
exports.getDefaultOpts = optsGenerator(exports.optsDefaults);
exports.getDefaultOptsAndCb = optsAndCbGenerator(exports.getDefaultOpts);
const rmdirDefaults = {
    recursive: false,
};
const getRmdirOptions = (options) => {
    return Object.assign({}, rmdirDefaults, options);
};
exports.getRmdirOptions = getRmdirOptions;
const getRmOpts = optsGenerator(exports.optsDefaults);
exports.getRmOptsAndCb = optsAndCbGenerator(getRmOpts);
const readFileOptsDefaults = {
    flag: 'r',
};
exports.getReadFileOptions = optsGenerator(readFileOptsDefaults);
const readdirDefaults = {
    encoding: 'utf8',
    recursive: false,
    withFileTypes: false,
};
exports.getReaddirOptions = optsGenerator(readdirDefaults);
exports.getReaddirOptsAndCb = optsAndCbGenerator(exports.getReaddirOptions);
const appendFileDefaults = {
    encoding: 'utf8',
    mode: 438 /* MODE.DEFAULT */,
    flag: constants_1.FLAGS[constants_1.FLAGS.a],
};
exports.getAppendFileOpts = optsGenerator(appendFileDefaults);
exports.getAppendFileOptsAndCb = optsAndCbGenerator(exports.getAppendFileOpts);
const statDefaults = {
    bigint: false,
};
const getStatOptions = (options = {}) => Object.assign({}, statDefaults, options);
exports.getStatOptions = getStatOptions;
const getStatOptsAndCb = (options, callback) => typeof options === 'function' ? [(0, exports.getStatOptions)(), options] : [(0, exports.getStatOptions)(options), (0, util_1.validateCallback)(callback)];
exports.getStatOptsAndCb = getStatOptsAndCb;
const realpathDefaults = exports.optsDefaults;
exports.getRealpathOptions = optsGenerator(realpathDefaults);
exports.getRealpathOptsAndCb = optsAndCbGenerator(exports.getRealpathOptions);
exports.writeFileDefaults = {
    encoding: 'utf8',
    mode: 438 /* MODE.DEFAULT */,
    flag: constants_1.FLAGS[constants_1.FLAGS.w],
};
exports.getWriteFileOptions = optsGenerator(exports.writeFileDefaults);
//# sourceMappingURL=options.js.map

/***/ }),

/***/ 9103:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.unixify = exports.bufferToEncoding = exports.getWriteSyncArgs = exports.getWriteArgs = exports.bufToUint8 = exports.dataToBuffer = exports.validateFd = exports.isFd = exports.flagsToNumber = exports.genRndStr6 = exports.createError = exports.pathToFilename = exports.nullCheck = exports.modeToNumber = exports.validateCallback = exports.promisify = exports.isWin = void 0;
const constants_1 = __nccwpck_require__(6661);
const errors = __nccwpck_require__(4040);
const buffer_1 = __nccwpck_require__(3730);
const encoding_1 = __nccwpck_require__(5900);
const buffer_2 = __nccwpck_require__(3730);
const queueMicrotask_1 = __nccwpck_require__(8563);
exports.isWin = process.platform === 'win32';
function promisify(fs, fn, getResult = input => input) {
    return (...args) => new Promise((resolve, reject) => {
        fs[fn].bind(fs)(...args, (error, result) => {
            if (error)
                return reject(error);
            return resolve(getResult(result));
        });
    });
}
exports.promisify = promisify;
function validateCallback(callback) {
    if (typeof callback !== 'function')
        throw TypeError(constants_1.ERRSTR.CB);
    return callback;
}
exports.validateCallback = validateCallback;
function _modeToNumber(mode, def) {
    if (typeof mode === 'number')
        return mode;
    if (typeof mode === 'string')
        return parseInt(mode, 8);
    if (def)
        return modeToNumber(def);
    return undefined;
}
function modeToNumber(mode, def) {
    const result = _modeToNumber(mode, def);
    if (typeof result !== 'number' || isNaN(result))
        throw new TypeError(constants_1.ERRSTR.MODE_INT);
    return result;
}
exports.modeToNumber = modeToNumber;
function nullCheck(path, callback) {
    if (('' + path).indexOf('\u0000') !== -1) {
        const er = new Error('Path must be a string without null bytes');
        er.code = 'ENOENT';
        if (typeof callback !== 'function')
            throw er;
        (0, queueMicrotask_1.default)(() => {
            callback(er);
        });
        return false;
    }
    return true;
}
exports.nullCheck = nullCheck;
function getPathFromURLPosix(url) {
    if (url.hostname !== '') {
        throw new errors.TypeError('ERR_INVALID_FILE_URL_HOST', process.platform);
    }
    const pathname = url.pathname;
    for (let n = 0; n < pathname.length; n++) {
        if (pathname[n] === '%') {
            const third = pathname.codePointAt(n + 2) | 0x20;
            if (pathname[n + 1] === '2' && third === 102) {
                throw new errors.TypeError('ERR_INVALID_FILE_URL_PATH', 'must not include encoded / characters');
            }
        }
    }
    return decodeURIComponent(pathname);
}
function pathToFilename(path) {
    if (typeof path !== 'string' && !buffer_1.Buffer.isBuffer(path)) {
        try {
            if (!(path instanceof (__nccwpck_require__(7310).URL)))
                throw new TypeError(constants_1.ERRSTR.PATH_STR);
        }
        catch (err) {
            throw new TypeError(constants_1.ERRSTR.PATH_STR);
        }
        path = getPathFromURLPosix(path);
    }
    const pathString = String(path);
    nullCheck(pathString);
    // return slash(pathString);
    return pathString;
}
exports.pathToFilename = pathToFilename;
const ENOENT = 'ENOENT';
const EBADF = 'EBADF';
const EINVAL = 'EINVAL';
const EPERM = 'EPERM';
const EPROTO = 'EPROTO';
const EEXIST = 'EEXIST';
const ENOTDIR = 'ENOTDIR';
const EMFILE = 'EMFILE';
const EACCES = 'EACCES';
const EISDIR = 'EISDIR';
const ENOTEMPTY = 'ENOTEMPTY';
const ENOSYS = 'ENOSYS';
const ERR_FS_EISDIR = 'ERR_FS_EISDIR';
const ERR_OUT_OF_RANGE = 'ERR_OUT_OF_RANGE';
function formatError(errorCode, func = '', path = '', path2 = '') {
    let pathFormatted = '';
    if (path)
        pathFormatted = ` '${path}'`;
    if (path2)
        pathFormatted += ` -> '${path2}'`;
    switch (errorCode) {
        case ENOENT:
            return `ENOENT: no such file or directory, ${func}${pathFormatted}`;
        case EBADF:
            return `EBADF: bad file descriptor, ${func}${pathFormatted}`;
        case EINVAL:
            return `EINVAL: invalid argument, ${func}${pathFormatted}`;
        case EPERM:
            return `EPERM: operation not permitted, ${func}${pathFormatted}`;
        case EPROTO:
            return `EPROTO: protocol error, ${func}${pathFormatted}`;
        case EEXIST:
            return `EEXIST: file already exists, ${func}${pathFormatted}`;
        case ENOTDIR:
            return `ENOTDIR: not a directory, ${func}${pathFormatted}`;
        case EISDIR:
            return `EISDIR: illegal operation on a directory, ${func}${pathFormatted}`;
        case EACCES:
            return `EACCES: permission denied, ${func}${pathFormatted}`;
        case ENOTEMPTY:
            return `ENOTEMPTY: directory not empty, ${func}${pathFormatted}`;
        case EMFILE:
            return `EMFILE: too many open files, ${func}${pathFormatted}`;
        case ENOSYS:
            return `ENOSYS: function not implemented, ${func}${pathFormatted}`;
        case ERR_FS_EISDIR:
            return `[ERR_FS_EISDIR]: Path is a directory: ${func} returned EISDIR (is a directory) ${path}`;
        case ERR_OUT_OF_RANGE:
            return `[ERR_OUT_OF_RANGE]: value out of range, ${func}${pathFormatted}`;
        default:
            return `${errorCode}: error occurred, ${func}${pathFormatted}`;
    }
}
function createError(errorCode, func = '', path = '', path2 = '', Constructor = Error) {
    const error = new Constructor(formatError(errorCode, func, path, path2));
    error.code = errorCode;
    if (path) {
        error.path = path;
    }
    return error;
}
exports.createError = createError;
function genRndStr6() {
    const str = (Math.random() + 1).toString(36).substring(2, 8);
    if (str.length === 6)
        return str;
    else
        return genRndStr6();
}
exports.genRndStr6 = genRndStr6;
function flagsToNumber(flags) {
    if (typeof flags === 'number')
        return flags;
    if (typeof flags === 'string') {
        const flagsNum = constants_1.FLAGS[flags];
        if (typeof flagsNum !== 'undefined')
            return flagsNum;
    }
    // throw new TypeError(formatError(ERRSTR_FLAG(flags)));
    throw new errors.TypeError('ERR_INVALID_OPT_VALUE', 'flags', flags);
}
exports.flagsToNumber = flagsToNumber;
function isFd(path) {
    return path >>> 0 === path;
}
exports.isFd = isFd;
function validateFd(fd) {
    if (!isFd(fd))
        throw TypeError(constants_1.ERRSTR.FD);
}
exports.validateFd = validateFd;
function dataToBuffer(data, encoding = encoding_1.ENCODING_UTF8) {
    if (buffer_1.Buffer.isBuffer(data))
        return data;
    else if (data instanceof Uint8Array)
        return (0, buffer_2.bufferFrom)(data);
    else
        return (0, buffer_2.bufferFrom)(String(data), encoding);
}
exports.dataToBuffer = dataToBuffer;
const bufToUint8 = (buf) => new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
exports.bufToUint8 = bufToUint8;
const getWriteArgs = (fd, a, b, c, d, e) => {
    validateFd(fd);
    let offset = 0;
    let length;
    let position = null;
    let encoding;
    let callback;
    const tipa = typeof a;
    const tipb = typeof b;
    const tipc = typeof c;
    const tipd = typeof d;
    if (tipa !== 'string') {
        if (tipb === 'function') {
            callback = b;
        }
        else if (tipc === 'function') {
            offset = b | 0;
            callback = c;
        }
        else if (tipd === 'function') {
            offset = b | 0;
            length = c;
            callback = d;
        }
        else {
            offset = b | 0;
            length = c;
            position = d;
            callback = e;
        }
    }
    else {
        if (tipb === 'function') {
            callback = b;
        }
        else if (tipc === 'function') {
            position = b;
            callback = c;
        }
        else if (tipd === 'function') {
            position = b;
            encoding = c;
            callback = d;
        }
    }
    const buf = dataToBuffer(a, encoding);
    if (tipa !== 'string') {
        if (typeof length === 'undefined')
            length = buf.length;
    }
    else {
        offset = 0;
        length = buf.length;
    }
    const cb = validateCallback(callback);
    return [fd, tipa === 'string', buf, offset, length, position, cb];
};
exports.getWriteArgs = getWriteArgs;
const getWriteSyncArgs = (fd, a, b, c, d) => {
    validateFd(fd);
    let encoding;
    let offset;
    let length;
    let position;
    const isBuffer = typeof a !== 'string';
    if (isBuffer) {
        offset = (b || 0) | 0;
        length = c;
        position = d;
    }
    else {
        position = b;
        encoding = c;
    }
    const buf = dataToBuffer(a, encoding);
    if (isBuffer) {
        if (typeof length === 'undefined') {
            length = buf.length;
        }
    }
    else {
        offset = 0;
        length = buf.length;
    }
    return [fd, buf, offset || 0, length, position];
};
exports.getWriteSyncArgs = getWriteSyncArgs;
function bufferToEncoding(buffer, encoding) {
    if (!encoding || encoding === 'buffer')
        return buffer;
    else
        return buffer.toString(encoding);
}
exports.bufferToEncoding = bufferToEncoding;
const isSeparator = (str, i) => {
    let char = str[i];
    return i > 0 && (char === '/' || (exports.isWin && char === '\\'));
};
const removeTrailingSeparator = (str) => {
    let i = str.length - 1;
    if (i < 2)
        return str;
    while (isSeparator(str, i))
        i--;
    return str.substr(0, i + 1);
};
const normalizePath = (str, stripTrailing) => {
    if (typeof str !== 'string')
        throw new TypeError('expected a string');
    str = str.replace(/[\\\/]+/g, '/');
    if (stripTrailing !== false)
        str = removeTrailingSeparator(str);
    return str;
};
const unixify = (filepath, stripTrailing = true) => {
    if (exports.isWin) {
        filepath = normalizePath(filepath, stripTrailing);
        return filepath.replace(/^([a-zA-Z]+:|\.\/)/, '');
    }
    return filepath;
};
exports.unixify = unixify;
//# sourceMappingURL=util.js.map

/***/ }),

/***/ 9568:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.toTreeSync = void 0;
const printTree_1 = __nccwpck_require__(4615);
const util_1 = __nccwpck_require__(332);
const toTreeSync = (fs, opts = {}) => {
    var _a;
    const separator = opts.separator || '/';
    let dir = opts.dir || separator;
    if (dir[dir.length - 1] !== separator)
        dir += separator;
    const tab = opts.tab || '';
    const depth = (_a = opts.depth) !== null && _a !== void 0 ? _a : 10;
    let subtree = ' (...)';
    if (depth > 0) {
        const list = fs.readdirSync(dir, { withFileTypes: true });
        subtree = (0, printTree_1.printTree)(tab, list.map(entry => tab => {
            if (entry.isDirectory()) {
                return (0, exports.toTreeSync)(fs, { dir: dir + entry.name, depth: depth - 1, tab });
            }
            else if (entry.isSymbolicLink()) {
                return '' + entry.name + ' → ' + fs.readlinkSync(dir + entry.name);
            }
            else {
                return '' + entry.name;
            }
        }));
    }
    const base = (0, util_1.basename)(dir, separator) + separator;
    return base + subtree;
};
exports.toTreeSync = toTreeSync;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ 4486:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


// Here we mock the global `process` variable in case we are not in Node's environment.
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createProcess = void 0;
/**
 * Looks to return a `process` object, if one is available.
 *
 * The global `process` is returned if defined;
 * otherwise `require('process')` is attempted.
 *
 * If that fails, `undefined` is returned.
 *
 * @return {IProcess | undefined}
 */
const maybeReturnProcess = () => {
    if (typeof process !== 'undefined') {
        return process;
    }
    try {
        return __nccwpck_require__(7282);
    }
    catch (_a) {
        return undefined;
    }
};
function createProcess() {
    const p = maybeReturnProcess() || {};
    if (!p.cwd)
        p.cwd = () => '/';
    if (!p.emitWarning)
        p.emitWarning = (message, type) => {
            // tslint:disable-next-line:no-console
            console.warn(`${type}${type ? ': ' : ''}${message}`);
        };
    if (!p.env)
        p.env = {};
    return p;
}
exports.createProcess = createProcess;
exports["default"] = createProcess();
//# sourceMappingURL=process.js.map

/***/ }),

/***/ 8563:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = typeof queueMicrotask === 'function' ? queueMicrotask : (cb => Promise.resolve()
    .then(() => cb())
    .catch(() => { }));
//# sourceMappingURL=queueMicrotask.js.map

/***/ }),

/***/ 5431:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
let _setImmediate;
if (typeof setImmediate === 'function')
    _setImmediate = setImmediate.bind(typeof globalThis !== 'undefined' ? globalThis : global);
else
    _setImmediate = setTimeout.bind(typeof globalThis !== 'undefined' ? globalThis : global);
exports["default"] = _setImmediate;
//# sourceMappingURL=setImmediate.js.map

/***/ }),

/***/ 5306:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/**
 * `setTimeoutUnref` is just like `setTimeout`,
 * only in Node's environment it will "unref" its macro task.
 */
function setTimeoutUnref(callback, time, args) {
    const ref = setTimeout.apply(typeof globalThis !== 'undefined' ? globalThis : global, arguments);
    if (ref && typeof ref === 'object' && typeof ref.unref === 'function')
        ref.unref();
    return ref;
}
exports["default"] = setTimeoutUnref;
//# sourceMappingURL=setTimeoutUnref.js.map

/***/ }),

/***/ 380:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FSWatcher = exports.StatWatcher = exports.Volume = exports.toUnixTimestamp = exports.dataToStr = exports.pathToSteps = exports.filenameToSteps = void 0;
const pathModule = __nccwpck_require__(1017);
const node_1 = __nccwpck_require__(8616);
const Stats_1 = __nccwpck_require__(3441);
const Dirent_1 = __nccwpck_require__(2878);
const buffer_1 = __nccwpck_require__(3730);
const setImmediate_1 = __nccwpck_require__(5431);
const queueMicrotask_1 = __nccwpck_require__(8563);
const process_1 = __nccwpck_require__(4486);
const setTimeoutUnref_1 = __nccwpck_require__(5306);
const stream_1 = __nccwpck_require__(2781);
const constants_1 = __nccwpck_require__(2055);
const events_1 = __nccwpck_require__(2361);
const encoding_1 = __nccwpck_require__(5900);
const FileHandle_1 = __nccwpck_require__(353);
const util = __nccwpck_require__(3837);
const FsPromises_1 = __nccwpck_require__(1167);
const print_1 = __nccwpck_require__(9568);
const constants_2 = __nccwpck_require__(6661);
const options_1 = __nccwpck_require__(9456);
const util_1 = __nccwpck_require__(9103);
const resolveCrossPlatform = pathModule.resolve;
const { O_RDONLY, O_WRONLY, O_RDWR, O_CREAT, O_EXCL, O_TRUNC, O_APPEND, O_DIRECTORY, O_SYMLINK, F_OK, COPYFILE_EXCL, COPYFILE_FICLONE_FORCE, } = constants_1.constants;
const { sep, relative, join, dirname } = pathModule.posix ? pathModule.posix : pathModule;
// ---------------------------------------- Constants
const kMinPoolSpace = 128;
// ---------------------------------------- Error messages
const EPERM = 'EPERM';
const ENOENT = 'ENOENT';
const EBADF = 'EBADF';
const EINVAL = 'EINVAL';
const EEXIST = 'EEXIST';
const ENOTDIR = 'ENOTDIR';
const EMFILE = 'EMFILE';
const EACCES = 'EACCES';
const EISDIR = 'EISDIR';
const ENOTEMPTY = 'ENOTEMPTY';
const ENOSYS = 'ENOSYS';
const ERR_FS_EISDIR = 'ERR_FS_EISDIR';
const ERR_OUT_OF_RANGE = 'ERR_OUT_OF_RANGE';
let resolve = (filename, base = process_1.default.cwd()) => resolveCrossPlatform(base, filename);
if (util_1.isWin) {
    const _resolve = resolve;
    resolve = (filename, base) => (0, util_1.unixify)(_resolve(filename, base));
}
function filenameToSteps(filename, base) {
    const fullPath = resolve(filename, base);
    const fullPathSansSlash = fullPath.substring(1);
    if (!fullPathSansSlash)
        return [];
    return fullPathSansSlash.split(sep);
}
exports.filenameToSteps = filenameToSteps;
function pathToSteps(path) {
    return filenameToSteps((0, util_1.pathToFilename)(path));
}
exports.pathToSteps = pathToSteps;
function dataToStr(data, encoding = encoding_1.ENCODING_UTF8) {
    if (buffer_1.Buffer.isBuffer(data))
        return data.toString(encoding);
    else if (data instanceof Uint8Array)
        return (0, buffer_1.bufferFrom)(data).toString(encoding);
    else
        return String(data);
}
exports.dataToStr = dataToStr;
// converts Date or number to a fractional UNIX timestamp
function toUnixTimestamp(time) {
    // tslint:disable-next-line triple-equals
    if (typeof time === 'string' && +time == time) {
        return +time;
    }
    if (time instanceof Date) {
        return time.getTime() / 1000;
    }
    if (isFinite(time)) {
        if (time < 0) {
            return Date.now() / 1000;
        }
        return time;
    }
    throw new Error('Cannot parse time: ' + time);
}
exports.toUnixTimestamp = toUnixTimestamp;
function validateUid(uid) {
    if (typeof uid !== 'number')
        throw TypeError(constants_2.ERRSTR.UID);
}
function validateGid(gid) {
    if (typeof gid !== 'number')
        throw TypeError(constants_2.ERRSTR.GID);
}
function flattenJSON(nestedJSON) {
    const flatJSON = {};
    function flatten(pathPrefix, node) {
        for (const path in node) {
            const contentOrNode = node[path];
            const joinedPath = join(pathPrefix, path);
            if (typeof contentOrNode === 'string' || contentOrNode instanceof buffer_1.Buffer) {
                flatJSON[joinedPath] = contentOrNode;
            }
            else if (typeof contentOrNode === 'object' && contentOrNode !== null && Object.keys(contentOrNode).length > 0) {
                // empty directories need an explicit entry and therefore get handled in `else`, non-empty ones are implicitly considered
                flatten(joinedPath, contentOrNode);
            }
            else {
                // without this branch null, empty-object or non-object entries would not be handled in the same way
                // by both fromJSON() and fromNestedJSON()
                flatJSON[joinedPath] = null;
            }
        }
    }
    flatten('', nestedJSON);
    return flatJSON;
}
const notImplemented = () => {
    throw new Error('Not implemented');
};
/**
 * `Volume` represents a file system.
 */
class Volume {
    static fromJSON(json, cwd) {
        const vol = new Volume();
        vol.fromJSON(json, cwd);
        return vol;
    }
    static fromNestedJSON(json, cwd) {
        const vol = new Volume();
        vol.fromNestedJSON(json, cwd);
        return vol;
    }
    get promises() {
        if (this.promisesApi === null)
            throw new Error('Promise is not supported in this environment.');
        return this.promisesApi;
    }
    constructor(props = {}) {
        // I-node number counter.
        this.ino = 0;
        // A mapping for i-node numbers to i-nodes (`Node`);
        this.inodes = {};
        // List of released i-node numbers, for reuse.
        this.releasedInos = [];
        // A mapping for file descriptors to `File`s.
        this.fds = {};
        // A list of reusable (opened and closed) file descriptors, that should be
        // used first before creating a new file descriptor.
        this.releasedFds = [];
        // Max number of open files.
        this.maxFiles = 10000;
        // Current number of open files.
        this.openFiles = 0;
        this.promisesApi = new FsPromises_1.FsPromises(this, FileHandle_1.FileHandle);
        this.statWatchers = {};
        this.cpSync = notImplemented;
        this.lutimesSync = notImplemented;
        this.statfsSync = notImplemented;
        this.opendirSync = notImplemented;
        this.cp = notImplemented;
        this.lutimes = notImplemented;
        this.statfs = notImplemented;
        this.openAsBlob = notImplemented;
        this.opendir = notImplemented;
        this.props = Object.assign({ Node: node_1.Node, Link: node_1.Link, File: node_1.File }, props);
        const root = this.createLink();
        root.setNode(this.createNode(true));
        const self = this; // tslint:disable-line no-this-assignment
        this.StatWatcher = class extends StatWatcher {
            constructor() {
                super(self);
            }
        };
        const _ReadStream = FsReadStream;
        this.ReadStream = class extends _ReadStream {
            constructor(...args) {
                super(self, ...args);
            }
        };
        const _WriteStream = FsWriteStream;
        this.WriteStream = class extends _WriteStream {
            constructor(...args) {
                super(self, ...args);
            }
        };
        this.FSWatcher = class extends FSWatcher {
            constructor() {
                super(self);
            }
        };
        root.setChild('.', root);
        root.getNode().nlink++;
        root.setChild('..', root);
        root.getNode().nlink++;
        this.root = root;
    }
    createLink(parent, name, isDirectory = false, perm) {
        if (!parent) {
            return new this.props.Link(this, null, '');
        }
        if (!name) {
            throw new Error('createLink: name cannot be empty');
        }
        return parent.createChild(name, this.createNode(isDirectory, perm));
    }
    deleteLink(link) {
        const parent = link.parent;
        if (parent) {
            parent.deleteChild(link);
            return true;
        }
        return false;
    }
    newInoNumber() {
        const releasedFd = this.releasedInos.pop();
        if (releasedFd)
            return releasedFd;
        else {
            this.ino = (this.ino + 1) % 0xffffffff;
            return this.ino;
        }
    }
    newFdNumber() {
        const releasedFd = this.releasedFds.pop();
        return typeof releasedFd === 'number' ? releasedFd : Volume.fd--;
    }
    createNode(isDirectory = false, perm) {
        const node = new this.props.Node(this.newInoNumber(), perm);
        if (isDirectory)
            node.setIsDirectory();
        this.inodes[node.ino] = node;
        return node;
    }
    deleteNode(node) {
        node.del();
        delete this.inodes[node.ino];
        this.releasedInos.push(node.ino);
    }
    // Returns a `Link` (hard link) referenced by path "split" into steps.
    getLink(steps) {
        return this.root.walk(steps);
    }
    // Just link `getLink`, but throws a correct user error, if link to found.
    getLinkOrThrow(filename, funcName) {
        const steps = filenameToSteps(filename);
        const link = this.getLink(steps);
        if (!link)
            throw (0, util_1.createError)(ENOENT, funcName, filename);
        return link;
    }
    // Just like `getLink`, but also dereference/resolves symbolic links.
    getResolvedLink(filenameOrSteps) {
        let steps = typeof filenameOrSteps === 'string' ? filenameToSteps(filenameOrSteps) : filenameOrSteps;
        let link = this.root;
        let i = 0;
        while (i < steps.length) {
            const step = steps[i];
            link = link.getChild(step);
            if (!link)
                return null;
            const node = link.getNode();
            if (node.isSymlink()) {
                steps = node.symlink.concat(steps.slice(i + 1));
                link = this.root;
                i = 0;
                continue;
            }
            i++;
        }
        return link;
    }
    // Just like `getLinkOrThrow`, but also dereference/resolves symbolic links.
    getResolvedLinkOrThrow(filename, funcName) {
        const link = this.getResolvedLink(filename);
        if (!link)
            throw (0, util_1.createError)(ENOENT, funcName, filename);
        return link;
    }
    resolveSymlinks(link) {
        // let node: Node = link.getNode();
        // while(link && node.isSymlink()) {
        //     link = this.getLink(node.symlink);
        //     if(!link) return null;
        //     node = link.getNode();
        // }
        // return link;
        return this.getResolvedLink(link.steps.slice(1));
    }
    // Just like `getLinkOrThrow`, but also verifies that the link is a directory.
    getLinkAsDirOrThrow(filename, funcName) {
        const link = this.getLinkOrThrow(filename, funcName);
        if (!link.getNode().isDirectory())
            throw (0, util_1.createError)(ENOTDIR, funcName, filename);
        return link;
    }
    // Get the immediate parent directory of the link.
    getLinkParent(steps) {
        return this.root.walk(steps, steps.length - 1);
    }
    getLinkParentAsDirOrThrow(filenameOrSteps, funcName) {
        const steps = filenameOrSteps instanceof Array ? filenameOrSteps : filenameToSteps(filenameOrSteps);
        const link = this.getLinkParent(steps);
        if (!link)
            throw (0, util_1.createError)(ENOENT, funcName, sep + steps.join(sep));
        if (!link.getNode().isDirectory())
            throw (0, util_1.createError)(ENOTDIR, funcName, sep + steps.join(sep));
        return link;
    }
    getFileByFd(fd) {
        return this.fds[String(fd)];
    }
    getFileByFdOrThrow(fd, funcName) {
        if (!(0, util_1.isFd)(fd))
            throw TypeError(constants_2.ERRSTR.FD);
        const file = this.getFileByFd(fd);
        if (!file)
            throw (0, util_1.createError)(EBADF, funcName);
        return file;
    }
    /**
     * @todo This is not used anymore. Remove.
     */
    /*
    private getNodeByIdOrCreate(id: TFileId, flags: number, perm: number): Node {
      if (typeof id === 'number') {
        const file = this.getFileByFd(id);
        if (!file) throw Error('File nto found');
        return file.node;
      } else {
        const steps = pathToSteps(id as PathLike);
        let link = this.getLink(steps);
        if (link) return link.getNode();
  
        // Try creating a node if not found.
        if (flags & O_CREAT) {
          const dirLink = this.getLinkParent(steps);
          if (dirLink) {
            const name = steps[steps.length - 1];
            link = this.createLink(dirLink, name, false, perm);
            return link.getNode();
          }
        }
  
        throw createError(ENOENT, 'getNodeByIdOrCreate', pathToFilename(id));
      }
    }
    */
    wrapAsync(method, args, callback) {
        (0, util_1.validateCallback)(callback);
        (0, setImmediate_1.default)(() => {
            let result;
            try {
                result = method.apply(this, args);
            }
            catch (err) {
                callback(err);
                return;
            }
            callback(null, result);
        });
    }
    _toJSON(link = this.root, json = {}, path, asBuffer) {
        let isEmpty = true;
        let children = link.children;
        if (link.getNode().isFile()) {
            children = new Map([[link.getName(), link.parent.getChild(link.getName())]]);
            link = link.parent;
        }
        for (const name of children.keys()) {
            if (name === '.' || name === '..') {
                continue;
            }
            isEmpty = false;
            const child = link.getChild(name);
            if (!child) {
                throw new Error('_toJSON: unexpected undefined');
            }
            const node = child.getNode();
            if (node.isFile()) {
                let filename = child.getPath();
                if (path)
                    filename = relative(path, filename);
                json[filename] = asBuffer ? node.getBuffer() : node.getString();
            }
            else if (node.isDirectory()) {
                this._toJSON(child, json, path);
            }
        }
        let dirPath = link.getPath();
        if (path)
            dirPath = relative(path, dirPath);
        if (dirPath && isEmpty) {
            json[dirPath] = null;
        }
        return json;
    }
    toJSON(paths, json = {}, isRelative = false, asBuffer = false) {
        const links = [];
        if (paths) {
            if (!Array.isArray(paths))
                paths = [paths];
            for (const path of paths) {
                const filename = (0, util_1.pathToFilename)(path);
                const link = this.getResolvedLink(filename);
                if (!link)
                    continue;
                links.push(link);
            }
        }
        else {
            links.push(this.root);
        }
        if (!links.length)
            return json;
        for (const link of links)
            this._toJSON(link, json, isRelative ? link.getPath() : '', asBuffer);
        return json;
    }
    // TODO: `cwd` should probably not invoke `process.cwd()`.
    fromJSON(json, cwd = process_1.default.cwd()) {
        for (let filename in json) {
            const data = json[filename];
            filename = resolve(filename, cwd);
            if (typeof data === 'string' || data instanceof buffer_1.Buffer) {
                const dir = dirname(filename);
                this.mkdirpBase(dir, 511 /* MODE.DIR */);
                this.writeFileSync(filename, data);
            }
            else {
                this.mkdirpBase(filename, 511 /* MODE.DIR */);
            }
        }
    }
    fromNestedJSON(json, cwd) {
        this.fromJSON(flattenJSON(json), cwd);
    }
    toTree(opts = { separator: sep }) {
        return (0, print_1.toTreeSync)(this, opts);
    }
    reset() {
        this.ino = 0;
        this.inodes = {};
        this.releasedInos = [];
        this.fds = {};
        this.releasedFds = [];
        this.openFiles = 0;
        this.root = this.createLink();
        this.root.setNode(this.createNode(true));
    }
    // Legacy interface
    mountSync(mountpoint, json) {
        this.fromJSON(json, mountpoint);
    }
    openLink(link, flagsNum, resolveSymlinks = true) {
        if (this.openFiles >= this.maxFiles) {
            // Too many open files.
            throw (0, util_1.createError)(EMFILE, 'open', link.getPath());
        }
        // Resolve symlinks.
        let realLink = link;
        if (resolveSymlinks)
            realLink = this.resolveSymlinks(link);
        if (!realLink)
            throw (0, util_1.createError)(ENOENT, 'open', link.getPath());
        const node = realLink.getNode();
        // Check whether node is a directory
        if (node.isDirectory()) {
            if ((flagsNum & (O_RDONLY | O_RDWR | O_WRONLY)) !== O_RDONLY)
                throw (0, util_1.createError)(EISDIR, 'open', link.getPath());
        }
        else {
            if (flagsNum & O_DIRECTORY)
                throw (0, util_1.createError)(ENOTDIR, 'open', link.getPath());
        }
        // Check node permissions
        if (!(flagsNum & O_WRONLY)) {
            if (!node.canRead()) {
                throw (0, util_1.createError)(EACCES, 'open', link.getPath());
            }
        }
        if (flagsNum & O_RDWR) {
        }
        const file = new this.props.File(link, node, flagsNum, this.newFdNumber());
        this.fds[file.fd] = file;
        this.openFiles++;
        if (flagsNum & O_TRUNC)
            file.truncate();
        return file;
    }
    openFile(filename, flagsNum, modeNum, resolveSymlinks = true) {
        const steps = filenameToSteps(filename);
        let link = resolveSymlinks ? this.getResolvedLink(steps) : this.getLink(steps);
        if (link && flagsNum & O_EXCL)
            throw (0, util_1.createError)(EEXIST, 'open', filename);
        // Try creating a new file, if it does not exist.
        if (!link && flagsNum & O_CREAT) {
            // const dirLink: Link = this.getLinkParent(steps);
            const dirLink = this.getResolvedLink(steps.slice(0, steps.length - 1));
            // if(!dirLink) throw createError(ENOENT, 'open', filename);
            if (!dirLink)
                throw (0, util_1.createError)(ENOENT, 'open', sep + steps.join(sep));
            if (flagsNum & O_CREAT && typeof modeNum === 'number') {
                link = this.createLink(dirLink, steps[steps.length - 1], false, modeNum);
            }
        }
        if (link)
            return this.openLink(link, flagsNum, resolveSymlinks);
        throw (0, util_1.createError)(ENOENT, 'open', filename);
    }
    openBase(filename, flagsNum, modeNum, resolveSymlinks = true) {
        const file = this.openFile(filename, flagsNum, modeNum, resolveSymlinks);
        if (!file)
            throw (0, util_1.createError)(ENOENT, 'open', filename);
        return file.fd;
    }
    openSync(path, flags, mode = 438 /* MODE.DEFAULT */) {
        // Validate (1) mode; (2) path; (3) flags - in that order.
        const modeNum = (0, util_1.modeToNumber)(mode);
        const fileName = (0, util_1.pathToFilename)(path);
        const flagsNum = (0, util_1.flagsToNumber)(flags);
        return this.openBase(fileName, flagsNum, modeNum, !(flagsNum & O_SYMLINK));
    }
    open(path, flags, a, b) {
        let mode = a;
        let callback = b;
        if (typeof a === 'function') {
            mode = 438 /* MODE.DEFAULT */;
            callback = a;
        }
        mode = mode || 438 /* MODE.DEFAULT */;
        const modeNum = (0, util_1.modeToNumber)(mode);
        const fileName = (0, util_1.pathToFilename)(path);
        const flagsNum = (0, util_1.flagsToNumber)(flags);
        this.wrapAsync(this.openBase, [fileName, flagsNum, modeNum, !(flagsNum & O_SYMLINK)], callback);
    }
    closeFile(file) {
        if (!this.fds[file.fd])
            return;
        this.openFiles--;
        delete this.fds[file.fd];
        this.releasedFds.push(file.fd);
    }
    closeSync(fd) {
        (0, util_1.validateFd)(fd);
        const file = this.getFileByFdOrThrow(fd, 'close');
        this.closeFile(file);
    }
    close(fd, callback) {
        (0, util_1.validateFd)(fd);
        this.wrapAsync(this.closeSync, [fd], callback);
    }
    openFileOrGetById(id, flagsNum, modeNum) {
        if (typeof id === 'number') {
            const file = this.fds[id];
            if (!file)
                throw (0, util_1.createError)(ENOENT);
            return file;
        }
        else {
            return this.openFile((0, util_1.pathToFilename)(id), flagsNum, modeNum);
        }
    }
    readBase(fd, buffer, offset, length, position) {
        if (buffer.byteLength < length) {
            throw (0, util_1.createError)(ERR_OUT_OF_RANGE, 'read', undefined, undefined, RangeError);
        }
        const file = this.getFileByFdOrThrow(fd);
        if (file.node.isSymlink()) {
            throw (0, util_1.createError)(EPERM, 'read', file.link.getPath());
        }
        return file.read(buffer, Number(offset), Number(length), position === -1 || typeof position !== 'number' ? undefined : position);
    }
    readSync(fd, buffer, offset, length, position) {
        (0, util_1.validateFd)(fd);
        return this.readBase(fd, buffer, offset, length, position);
    }
    read(fd, buffer, offset, length, position, callback) {
        (0, util_1.validateCallback)(callback);
        // This `if` branch is from Node.js
        if (length === 0) {
            return (0, queueMicrotask_1.default)(() => {
                if (callback)
                    callback(null, 0, buffer);
            });
        }
        (0, setImmediate_1.default)(() => {
            try {
                const bytes = this.readBase(fd, buffer, offset, length, position);
                callback(null, bytes, buffer);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    readvBase(fd, buffers, position) {
        const file = this.getFileByFdOrThrow(fd);
        let p = position !== null && position !== void 0 ? position : undefined;
        if (p === -1) {
            p = undefined;
        }
        let bytesRead = 0;
        for (const buffer of buffers) {
            const bytes = file.read(buffer, 0, buffer.byteLength, p);
            p = undefined;
            bytesRead += bytes;
            if (bytes < buffer.byteLength)
                break;
        }
        return bytesRead;
    }
    readv(fd, buffers, a, b) {
        let position = a;
        let callback = b;
        if (typeof a === 'function') {
            position = null;
            callback = a;
        }
        (0, util_1.validateCallback)(callback);
        (0, setImmediate_1.default)(() => {
            try {
                const bytes = this.readvBase(fd, buffers, position);
                callback(null, bytes, buffers);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    readvSync(fd, buffers, position) {
        (0, util_1.validateFd)(fd);
        return this.readvBase(fd, buffers, position);
    }
    readFileBase(id, flagsNum, encoding) {
        let result;
        const isUserFd = typeof id === 'number';
        const userOwnsFd = isUserFd && (0, util_1.isFd)(id);
        let fd;
        if (userOwnsFd)
            fd = id;
        else {
            const filename = (0, util_1.pathToFilename)(id);
            const steps = filenameToSteps(filename);
            const link = this.getResolvedLink(steps);
            if (link) {
                const node = link.getNode();
                if (node.isDirectory())
                    throw (0, util_1.createError)(EISDIR, 'open', link.getPath());
            }
            fd = this.openSync(id, flagsNum);
        }
        try {
            result = (0, util_1.bufferToEncoding)(this.getFileByFdOrThrow(fd).getBuffer(), encoding);
        }
        finally {
            if (!userOwnsFd) {
                this.closeSync(fd);
            }
        }
        return result;
    }
    readFileSync(file, options) {
        const opts = (0, options_1.getReadFileOptions)(options);
        const flagsNum = (0, util_1.flagsToNumber)(opts.flag);
        return this.readFileBase(file, flagsNum, opts.encoding);
    }
    readFile(id, a, b) {
        const [opts, callback] = (0, options_1.optsAndCbGenerator)(options_1.getReadFileOptions)(a, b);
        const flagsNum = (0, util_1.flagsToNumber)(opts.flag);
        this.wrapAsync(this.readFileBase, [id, flagsNum, opts.encoding], callback);
    }
    writeBase(fd, buf, offset, length, position) {
        const file = this.getFileByFdOrThrow(fd, 'write');
        if (file.node.isSymlink()) {
            throw (0, util_1.createError)(EBADF, 'write', file.link.getPath());
        }
        return file.write(buf, offset, length, position === -1 || typeof position !== 'number' ? undefined : position);
    }
    writeSync(fd, a, b, c, d) {
        const [, buf, offset, length, position] = (0, util_1.getWriteSyncArgs)(fd, a, b, c, d);
        return this.writeBase(fd, buf, offset, length, position);
    }
    write(fd, a, b, c, d, e) {
        const [, asStr, buf, offset, length, position, cb] = (0, util_1.getWriteArgs)(fd, a, b, c, d, e);
        (0, setImmediate_1.default)(() => {
            try {
                const bytes = this.writeBase(fd, buf, offset, length, position);
                if (!asStr) {
                    cb(null, bytes, buf);
                }
                else {
                    cb(null, bytes, a);
                }
            }
            catch (err) {
                cb(err);
            }
        });
    }
    writevBase(fd, buffers, position) {
        const file = this.getFileByFdOrThrow(fd);
        let p = position !== null && position !== void 0 ? position : undefined;
        if (p === -1) {
            p = undefined;
        }
        let bytesWritten = 0;
        for (const buffer of buffers) {
            const nodeBuf = buffer_1.Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            const bytes = file.write(nodeBuf, 0, nodeBuf.byteLength, p);
            p = undefined;
            bytesWritten += bytes;
            if (bytes < nodeBuf.byteLength)
                break;
        }
        return bytesWritten;
    }
    writev(fd, buffers, a, b) {
        let position = a;
        let callback = b;
        if (typeof a === 'function') {
            position = null;
            callback = a;
        }
        (0, util_1.validateCallback)(callback);
        (0, setImmediate_1.default)(() => {
            try {
                const bytes = this.writevBase(fd, buffers, position);
                callback(null, bytes, buffers);
            }
            catch (err) {
                callback(err);
            }
        });
    }
    writevSync(fd, buffers, position) {
        (0, util_1.validateFd)(fd);
        return this.writevBase(fd, buffers, position);
    }
    writeFileBase(id, buf, flagsNum, modeNum) {
        // console.log('writeFileBase', id, buf, flagsNum, modeNum);
        // const node = this.getNodeByIdOrCreate(id, flagsNum, modeNum);
        // node.setBuffer(buf);
        const isUserFd = typeof id === 'number';
        let fd;
        if (isUserFd)
            fd = id;
        else {
            fd = this.openBase((0, util_1.pathToFilename)(id), flagsNum, modeNum);
            // fd = this.openSync(id as PathLike, flagsNum, modeNum);
        }
        let offset = 0;
        let length = buf.length;
        let position = flagsNum & O_APPEND ? undefined : 0;
        try {
            while (length > 0) {
                const written = this.writeSync(fd, buf, offset, length, position);
                offset += written;
                length -= written;
                if (position !== undefined)
                    position += written;
            }
        }
        finally {
            if (!isUserFd)
                this.closeSync(fd);
        }
    }
    writeFileSync(id, data, options) {
        const opts = (0, options_1.getWriteFileOptions)(options);
        const flagsNum = (0, util_1.flagsToNumber)(opts.flag);
        const modeNum = (0, util_1.modeToNumber)(opts.mode);
        const buf = (0, util_1.dataToBuffer)(data, opts.encoding);
        this.writeFileBase(id, buf, flagsNum, modeNum);
    }
    writeFile(id, data, a, b) {
        let options = a;
        let callback = b;
        if (typeof a === 'function') {
            options = options_1.writeFileDefaults;
            callback = a;
        }
        const cb = (0, util_1.validateCallback)(callback);
        const opts = (0, options_1.getWriteFileOptions)(options);
        const flagsNum = (0, util_1.flagsToNumber)(opts.flag);
        const modeNum = (0, util_1.modeToNumber)(opts.mode);
        const buf = (0, util_1.dataToBuffer)(data, opts.encoding);
        this.wrapAsync(this.writeFileBase, [id, buf, flagsNum, modeNum], cb);
    }
    linkBase(filename1, filename2) {
        const steps1 = filenameToSteps(filename1);
        const link1 = this.getLink(steps1);
        if (!link1)
            throw (0, util_1.createError)(ENOENT, 'link', filename1, filename2);
        const steps2 = filenameToSteps(filename2);
        // Check new link directory exists.
        const dir2 = this.getLinkParent(steps2);
        if (!dir2)
            throw (0, util_1.createError)(ENOENT, 'link', filename1, filename2);
        const name = steps2[steps2.length - 1];
        // Check if new file already exists.
        if (dir2.getChild(name))
            throw (0, util_1.createError)(EEXIST, 'link', filename1, filename2);
        const node = link1.getNode();
        node.nlink++;
        dir2.createChild(name, node);
    }
    copyFileBase(src, dest, flags) {
        const buf = this.readFileSync(src);
        if (flags & COPYFILE_EXCL) {
            if (this.existsSync(dest)) {
                throw (0, util_1.createError)(EEXIST, 'copyFile', src, dest);
            }
        }
        if (flags & COPYFILE_FICLONE_FORCE) {
            throw (0, util_1.createError)(ENOSYS, 'copyFile', src, dest);
        }
        this.writeFileBase(dest, buf, constants_2.FLAGS.w, 438 /* MODE.DEFAULT */);
    }
    copyFileSync(src, dest, flags) {
        const srcFilename = (0, util_1.pathToFilename)(src);
        const destFilename = (0, util_1.pathToFilename)(dest);
        return this.copyFileBase(srcFilename, destFilename, (flags || 0) | 0);
    }
    copyFile(src, dest, a, b) {
        const srcFilename = (0, util_1.pathToFilename)(src);
        const destFilename = (0, util_1.pathToFilename)(dest);
        let flags;
        let callback;
        if (typeof a === 'function') {
            flags = 0;
            callback = a;
        }
        else {
            flags = a;
            callback = b;
        }
        (0, util_1.validateCallback)(callback);
        this.wrapAsync(this.copyFileBase, [srcFilename, destFilename, flags], callback);
    }
    linkSync(existingPath, newPath) {
        const existingPathFilename = (0, util_1.pathToFilename)(existingPath);
        const newPathFilename = (0, util_1.pathToFilename)(newPath);
        this.linkBase(existingPathFilename, newPathFilename);
    }
    link(existingPath, newPath, callback) {
        const existingPathFilename = (0, util_1.pathToFilename)(existingPath);
        const newPathFilename = (0, util_1.pathToFilename)(newPath);
        this.wrapAsync(this.linkBase, [existingPathFilename, newPathFilename], callback);
    }
    unlinkBase(filename) {
        const steps = filenameToSteps(filename);
        const link = this.getLink(steps);
        if (!link)
            throw (0, util_1.createError)(ENOENT, 'unlink', filename);
        // TODO: Check if it is file, dir, other...
        if (link.length)
            throw Error('Dir not empty...');
        this.deleteLink(link);
        const node = link.getNode();
        node.nlink--;
        // When all hard links to i-node are deleted, remove the i-node, too.
        if (node.nlink <= 0) {
            this.deleteNode(node);
        }
    }
    unlinkSync(path) {
        const filename = (0, util_1.pathToFilename)(path);
        this.unlinkBase(filename);
    }
    unlink(path, callback) {
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.unlinkBase, [filename], callback);
    }
    symlinkBase(targetFilename, pathFilename) {
        const pathSteps = filenameToSteps(pathFilename);
        // Check if directory exists, where we about to create a symlink.
        const dirLink = this.getLinkParent(pathSteps);
        if (!dirLink)
            throw (0, util_1.createError)(ENOENT, 'symlink', targetFilename, pathFilename);
        const name = pathSteps[pathSteps.length - 1];
        // Check if new file already exists.
        if (dirLink.getChild(name))
            throw (0, util_1.createError)(EEXIST, 'symlink', targetFilename, pathFilename);
        // Create symlink.
        const symlink = dirLink.createChild(name);
        symlink.getNode().makeSymlink(filenameToSteps(targetFilename));
        return symlink;
    }
    // `type` argument works only on Windows.
    symlinkSync(target, path, type) {
        const targetFilename = (0, util_1.pathToFilename)(target);
        const pathFilename = (0, util_1.pathToFilename)(path);
        this.symlinkBase(targetFilename, pathFilename);
    }
    symlink(target, path, a, b) {
        const callback = (0, util_1.validateCallback)(typeof a === 'function' ? a : b);
        const targetFilename = (0, util_1.pathToFilename)(target);
        const pathFilename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.symlinkBase, [targetFilename, pathFilename], callback);
    }
    realpathBase(filename, encoding) {
        const steps = filenameToSteps(filename);
        const realLink = this.getResolvedLink(steps);
        if (!realLink)
            throw (0, util_1.createError)(ENOENT, 'realpath', filename);
        return (0, encoding_1.strToEncoding)(realLink.getPath() || '/', encoding);
    }
    realpathSync(path, options) {
        return this.realpathBase((0, util_1.pathToFilename)(path), (0, options_1.getRealpathOptions)(options).encoding);
    }
    realpath(path, a, b) {
        const [opts, callback] = (0, options_1.getRealpathOptsAndCb)(a, b);
        const pathFilename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.realpathBase, [pathFilename, opts.encoding], callback);
    }
    lstatBase(filename, bigint = false, throwIfNoEntry = false) {
        const link = this.getLink(filenameToSteps(filename));
        if (link) {
            return Stats_1.default.build(link.getNode(), bigint);
        }
        else if (!throwIfNoEntry) {
            return undefined;
        }
        else {
            throw (0, util_1.createError)(ENOENT, 'lstat', filename);
        }
    }
    lstatSync(path, options) {
        const { throwIfNoEntry = true, bigint = false } = (0, options_1.getStatOptions)(options);
        return this.lstatBase((0, util_1.pathToFilename)(path), bigint, throwIfNoEntry);
    }
    lstat(path, a, b) {
        const [{ throwIfNoEntry = true, bigint = false }, callback] = (0, options_1.getStatOptsAndCb)(a, b);
        this.wrapAsync(this.lstatBase, [(0, util_1.pathToFilename)(path), bigint, throwIfNoEntry], callback);
    }
    statBase(filename, bigint = false, throwIfNoEntry = true) {
        const link = this.getResolvedLink(filenameToSteps(filename));
        if (link) {
            return Stats_1.default.build(link.getNode(), bigint);
        }
        else if (!throwIfNoEntry) {
            return undefined;
        }
        else {
            throw (0, util_1.createError)(ENOENT, 'stat', filename);
        }
    }
    statSync(path, options) {
        const { bigint = true, throwIfNoEntry = true } = (0, options_1.getStatOptions)(options);
        return this.statBase((0, util_1.pathToFilename)(path), bigint, throwIfNoEntry);
    }
    stat(path, a, b) {
        const [{ bigint = false, throwIfNoEntry = true }, callback] = (0, options_1.getStatOptsAndCb)(a, b);
        this.wrapAsync(this.statBase, [(0, util_1.pathToFilename)(path), bigint, throwIfNoEntry], callback);
    }
    fstatBase(fd, bigint = false) {
        const file = this.getFileByFd(fd);
        if (!file)
            throw (0, util_1.createError)(EBADF, 'fstat');
        return Stats_1.default.build(file.node, bigint);
    }
    fstatSync(fd, options) {
        return this.fstatBase(fd, (0, options_1.getStatOptions)(options).bigint);
    }
    fstat(fd, a, b) {
        const [opts, callback] = (0, options_1.getStatOptsAndCb)(a, b);
        this.wrapAsync(this.fstatBase, [fd, opts.bigint], callback);
    }
    renameBase(oldPathFilename, newPathFilename) {
        const link = this.getLink(filenameToSteps(oldPathFilename));
        if (!link)
            throw (0, util_1.createError)(ENOENT, 'rename', oldPathFilename, newPathFilename);
        // TODO: Check if it is directory, if non-empty, we cannot move it, right?
        const newPathSteps = filenameToSteps(newPathFilename);
        // Check directory exists for the new location.
        const newPathDirLink = this.getLinkParent(newPathSteps);
        if (!newPathDirLink)
            throw (0, util_1.createError)(ENOENT, 'rename', oldPathFilename, newPathFilename);
        // TODO: Also treat cases with directories and symbolic links.
        // TODO: See: http://man7.org/linux/man-pages/man2/rename.2.html
        // Remove hard link from old folder.
        const oldLinkParent = link.parent;
        if (oldLinkParent) {
            oldLinkParent.deleteChild(link);
        }
        // Rename should overwrite the new path, if that exists.
        const name = newPathSteps[newPathSteps.length - 1];
        link.name = name;
        link.steps = [...newPathDirLink.steps, name];
        newPathDirLink.setChild(link.getName(), link);
    }
    renameSync(oldPath, newPath) {
        const oldPathFilename = (0, util_1.pathToFilename)(oldPath);
        const newPathFilename = (0, util_1.pathToFilename)(newPath);
        this.renameBase(oldPathFilename, newPathFilename);
    }
    rename(oldPath, newPath, callback) {
        const oldPathFilename = (0, util_1.pathToFilename)(oldPath);
        const newPathFilename = (0, util_1.pathToFilename)(newPath);
        this.wrapAsync(this.renameBase, [oldPathFilename, newPathFilename], callback);
    }
    existsBase(filename) {
        return !!this.statBase(filename);
    }
    existsSync(path) {
        try {
            return this.existsBase((0, util_1.pathToFilename)(path));
        }
        catch (err) {
            return false;
        }
    }
    exists(path, callback) {
        const filename = (0, util_1.pathToFilename)(path);
        if (typeof callback !== 'function')
            throw Error(constants_2.ERRSTR.CB);
        (0, setImmediate_1.default)(() => {
            try {
                callback(this.existsBase(filename));
            }
            catch (err) {
                callback(false);
            }
        });
    }
    accessBase(filename, mode) {
        const link = this.getLinkOrThrow(filename, 'access');
        // TODO: Verify permissions
    }
    accessSync(path, mode = F_OK) {
        const filename = (0, util_1.pathToFilename)(path);
        mode = mode | 0;
        this.accessBase(filename, mode);
    }
    access(path, a, b) {
        let mode = F_OK;
        let callback;
        if (typeof a !== 'function') {
            mode = a | 0; // cast to number
            callback = (0, util_1.validateCallback)(b);
        }
        else {
            callback = a;
        }
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.accessBase, [filename, mode], callback);
    }
    appendFileSync(id, data, options) {
        const opts = (0, options_1.getAppendFileOpts)(options);
        // force append behavior when using a supplied file descriptor
        if (!opts.flag || (0, util_1.isFd)(id))
            opts.flag = 'a';
        this.writeFileSync(id, data, opts);
    }
    appendFile(id, data, a, b) {
        const [opts, callback] = (0, options_1.getAppendFileOptsAndCb)(a, b);
        // force append behavior when using a supplied file descriptor
        if (!opts.flag || (0, util_1.isFd)(id))
            opts.flag = 'a';
        this.writeFile(id, data, opts, callback);
    }
    readdirBase(filename, options) {
        const steps = filenameToSteps(filename);
        const link = this.getResolvedLink(steps);
        if (!link)
            throw (0, util_1.createError)(ENOENT, 'readdir', filename);
        const node = link.getNode();
        if (!node.isDirectory())
            throw (0, util_1.createError)(ENOTDIR, 'scandir', filename);
        const list = []; // output list
        for (const name of link.children.keys()) {
            const child = link.getChild(name);
            if (!child || name === '.' || name === '..')
                continue;
            list.push(Dirent_1.default.build(child, options.encoding));
            // recursion
            if (options.recursive && child.children.size) {
                const recurseOptions = Object.assign(Object.assign({}, options), { recursive: true, withFileTypes: true });
                const childList = this.readdirBase(child.getPath(), recurseOptions);
                list.push(...childList);
            }
        }
        if (!util_1.isWin && options.encoding !== 'buffer')
            list.sort((a, b) => {
                if (a.name < b.name)
                    return -1;
                if (a.name > b.name)
                    return 1;
                return 0;
            });
        if (options.withFileTypes)
            return list;
        let filename2 = filename;
        if (util_1.isWin) {
            filename2 = filename2.replace(/\\/g, '/');
        }
        return list.map(dirent => {
            if (options.recursive) {
                let fullPath = pathModule.join(dirent.path, dirent.name.toString());
                if (util_1.isWin) {
                    fullPath = fullPath.replace(/\\/g, '/');
                }
                return fullPath.replace(filename2 + pathModule.posix.sep, '');
            }
            return dirent.name;
        });
    }
    readdirSync(path, options) {
        const opts = (0, options_1.getReaddirOptions)(options);
        const filename = (0, util_1.pathToFilename)(path);
        return this.readdirBase(filename, opts);
    }
    readdir(path, a, b) {
        const [options, callback] = (0, options_1.getReaddirOptsAndCb)(a, b);
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.readdirBase, [filename, options], callback);
    }
    readlinkBase(filename, encoding) {
        const link = this.getLinkOrThrow(filename, 'readlink');
        const node = link.getNode();
        if (!node.isSymlink())
            throw (0, util_1.createError)(EINVAL, 'readlink', filename);
        const str = sep + node.symlink.join(sep);
        return (0, encoding_1.strToEncoding)(str, encoding);
    }
    readlinkSync(path, options) {
        const opts = (0, options_1.getDefaultOpts)(options);
        const filename = (0, util_1.pathToFilename)(path);
        return this.readlinkBase(filename, opts.encoding);
    }
    readlink(path, a, b) {
        const [opts, callback] = (0, options_1.getDefaultOptsAndCb)(a, b);
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.readlinkBase, [filename, opts.encoding], callback);
    }
    fsyncBase(fd) {
        this.getFileByFdOrThrow(fd, 'fsync');
    }
    fsyncSync(fd) {
        this.fsyncBase(fd);
    }
    fsync(fd, callback) {
        this.wrapAsync(this.fsyncBase, [fd], callback);
    }
    fdatasyncBase(fd) {
        this.getFileByFdOrThrow(fd, 'fdatasync');
    }
    fdatasyncSync(fd) {
        this.fdatasyncBase(fd);
    }
    fdatasync(fd, callback) {
        this.wrapAsync(this.fdatasyncBase, [fd], callback);
    }
    ftruncateBase(fd, len) {
        const file = this.getFileByFdOrThrow(fd, 'ftruncate');
        file.truncate(len);
    }
    ftruncateSync(fd, len) {
        this.ftruncateBase(fd, len);
    }
    ftruncate(fd, a, b) {
        const len = typeof a === 'number' ? a : 0;
        const callback = (0, util_1.validateCallback)(typeof a === 'number' ? b : a);
        this.wrapAsync(this.ftruncateBase, [fd, len], callback);
    }
    truncateBase(path, len) {
        const fd = this.openSync(path, 'r+');
        try {
            this.ftruncateSync(fd, len);
        }
        finally {
            this.closeSync(fd);
        }
    }
    /**
     * `id` should be a file descriptor or a path. `id` as file descriptor will
     * not be supported soon.
     */
    truncateSync(id, len) {
        if ((0, util_1.isFd)(id))
            return this.ftruncateSync(id, len);
        this.truncateBase(id, len);
    }
    truncate(id, a, b) {
        const len = typeof a === 'number' ? a : 0;
        const callback = (0, util_1.validateCallback)(typeof a === 'number' ? b : a);
        if ((0, util_1.isFd)(id))
            return this.ftruncate(id, len, callback);
        this.wrapAsync(this.truncateBase, [id, len], callback);
    }
    futimesBase(fd, atime, mtime) {
        const file = this.getFileByFdOrThrow(fd, 'futimes');
        const node = file.node;
        node.atime = new Date(atime * 1000);
        node.mtime = new Date(mtime * 1000);
    }
    futimesSync(fd, atime, mtime) {
        this.futimesBase(fd, toUnixTimestamp(atime), toUnixTimestamp(mtime));
    }
    futimes(fd, atime, mtime, callback) {
        this.wrapAsync(this.futimesBase, [fd, toUnixTimestamp(atime), toUnixTimestamp(mtime)], callback);
    }
    utimesBase(filename, atime, mtime) {
        const fd = this.openSync(filename, 'r');
        try {
            this.futimesBase(fd, atime, mtime);
        }
        finally {
            this.closeSync(fd);
        }
    }
    utimesSync(path, atime, mtime) {
        this.utimesBase((0, util_1.pathToFilename)(path), toUnixTimestamp(atime), toUnixTimestamp(mtime));
    }
    utimes(path, atime, mtime, callback) {
        this.wrapAsync(this.utimesBase, [(0, util_1.pathToFilename)(path), toUnixTimestamp(atime), toUnixTimestamp(mtime)], callback);
    }
    mkdirBase(filename, modeNum) {
        const steps = filenameToSteps(filename);
        // This will throw if user tries to create root dir `fs.mkdirSync('/')`.
        if (!steps.length) {
            throw (0, util_1.createError)(EEXIST, 'mkdir', filename);
        }
        const dir = this.getLinkParentAsDirOrThrow(filename, 'mkdir');
        // Check path already exists.
        const name = steps[steps.length - 1];
        if (dir.getChild(name))
            throw (0, util_1.createError)(EEXIST, 'mkdir', filename);
        dir.createChild(name, this.createNode(true, modeNum));
    }
    /**
     * Creates directory tree recursively.
     * @param filename
     * @param modeNum
     */
    mkdirpBase(filename, modeNum) {
        const fullPath = resolve(filename);
        const fullPathSansSlash = fullPath.substring(1);
        const steps = !fullPathSansSlash ? [] : fullPathSansSlash.split(sep);
        let link = this.root;
        let created = false;
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            if (!link.getNode().isDirectory())
                throw (0, util_1.createError)(ENOTDIR, 'mkdir', link.getPath());
            const child = link.getChild(step);
            if (child) {
                if (child.getNode().isDirectory())
                    link = child;
                else
                    throw (0, util_1.createError)(ENOTDIR, 'mkdir', child.getPath());
            }
            else {
                link = link.createChild(step, this.createNode(true, modeNum));
                created = true;
            }
        }
        return created ? fullPath : undefined;
    }
    mkdirSync(path, options) {
        const opts = (0, options_1.getMkdirOptions)(options);
        const modeNum = (0, util_1.modeToNumber)(opts.mode, 0o777);
        const filename = (0, util_1.pathToFilename)(path);
        if (opts.recursive)
            return this.mkdirpBase(filename, modeNum);
        this.mkdirBase(filename, modeNum);
    }
    mkdir(path, a, b) {
        const opts = (0, options_1.getMkdirOptions)(a);
        const callback = (0, util_1.validateCallback)(typeof a === 'function' ? a : b);
        const modeNum = (0, util_1.modeToNumber)(opts.mode, 0o777);
        const filename = (0, util_1.pathToFilename)(path);
        if (opts.recursive)
            this.wrapAsync(this.mkdirpBase, [filename, modeNum], callback);
        else
            this.wrapAsync(this.mkdirBase, [filename, modeNum], callback);
    }
    mkdtempBase(prefix, encoding, retry = 5) {
        const filename = prefix + (0, util_1.genRndStr6)();
        try {
            this.mkdirBase(filename, 511 /* MODE.DIR */);
            return (0, encoding_1.strToEncoding)(filename, encoding);
        }
        catch (err) {
            if (err.code === EEXIST) {
                if (retry > 1)
                    return this.mkdtempBase(prefix, encoding, retry - 1);
                else
                    throw Error('Could not create temp dir.');
            }
            else
                throw err;
        }
    }
    mkdtempSync(prefix, options) {
        const { encoding } = (0, options_1.getDefaultOpts)(options);
        if (!prefix || typeof prefix !== 'string')
            throw new TypeError('filename prefix is required');
        (0, util_1.nullCheck)(prefix);
        return this.mkdtempBase(prefix, encoding);
    }
    mkdtemp(prefix, a, b) {
        const [{ encoding }, callback] = (0, options_1.getDefaultOptsAndCb)(a, b);
        if (!prefix || typeof prefix !== 'string')
            throw new TypeError('filename prefix is required');
        if (!(0, util_1.nullCheck)(prefix))
            return;
        this.wrapAsync(this.mkdtempBase, [prefix, encoding], callback);
    }
    rmdirBase(filename, options) {
        const opts = (0, options_1.getRmdirOptions)(options);
        const link = this.getLinkAsDirOrThrow(filename, 'rmdir');
        // Check directory is empty.
        if (link.length && !opts.recursive)
            throw (0, util_1.createError)(ENOTEMPTY, 'rmdir', filename);
        this.deleteLink(link);
    }
    rmdirSync(path, options) {
        this.rmdirBase((0, util_1.pathToFilename)(path), options);
    }
    rmdir(path, a, b) {
        const opts = (0, options_1.getRmdirOptions)(a);
        const callback = (0, util_1.validateCallback)(typeof a === 'function' ? a : b);
        this.wrapAsync(this.rmdirBase, [(0, util_1.pathToFilename)(path), opts], callback);
    }
    rmBase(filename, options = {}) {
        const link = this.getResolvedLink(filename);
        if (!link) {
            // "stat" is used to match Node's native error message.
            if (!options.force)
                throw (0, util_1.createError)(ENOENT, 'stat', filename);
            return;
        }
        if (link.getNode().isDirectory()) {
            if (!options.recursive) {
                throw (0, util_1.createError)(ERR_FS_EISDIR, 'rm', filename);
            }
        }
        this.deleteLink(link);
    }
    rmSync(path, options) {
        this.rmBase((0, util_1.pathToFilename)(path), options);
    }
    rm(path, a, b) {
        const [opts, callback] = (0, options_1.getRmOptsAndCb)(a, b);
        this.wrapAsync(this.rmBase, [(0, util_1.pathToFilename)(path), opts], callback);
    }
    fchmodBase(fd, modeNum) {
        const file = this.getFileByFdOrThrow(fd, 'fchmod');
        file.chmod(modeNum);
    }
    fchmodSync(fd, mode) {
        this.fchmodBase(fd, (0, util_1.modeToNumber)(mode));
    }
    fchmod(fd, mode, callback) {
        this.wrapAsync(this.fchmodBase, [fd, (0, util_1.modeToNumber)(mode)], callback);
    }
    chmodBase(filename, modeNum) {
        const fd = this.openSync(filename, 'r');
        try {
            this.fchmodBase(fd, modeNum);
        }
        finally {
            this.closeSync(fd);
        }
    }
    chmodSync(path, mode) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const filename = (0, util_1.pathToFilename)(path);
        this.chmodBase(filename, modeNum);
    }
    chmod(path, mode, callback) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.chmodBase, [filename, modeNum], callback);
    }
    lchmodBase(filename, modeNum) {
        const fd = this.openBase(filename, O_RDWR, 0, false);
        try {
            this.fchmodBase(fd, modeNum);
        }
        finally {
            this.closeSync(fd);
        }
    }
    lchmodSync(path, mode) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const filename = (0, util_1.pathToFilename)(path);
        this.lchmodBase(filename, modeNum);
    }
    lchmod(path, mode, callback) {
        const modeNum = (0, util_1.modeToNumber)(mode);
        const filename = (0, util_1.pathToFilename)(path);
        this.wrapAsync(this.lchmodBase, [filename, modeNum], callback);
    }
    fchownBase(fd, uid, gid) {
        this.getFileByFdOrThrow(fd, 'fchown').chown(uid, gid);
    }
    fchownSync(fd, uid, gid) {
        validateUid(uid);
        validateGid(gid);
        this.fchownBase(fd, uid, gid);
    }
    fchown(fd, uid, gid, callback) {
        validateUid(uid);
        validateGid(gid);
        this.wrapAsync(this.fchownBase, [fd, uid, gid], callback);
    }
    chownBase(filename, uid, gid) {
        const link = this.getResolvedLinkOrThrow(filename, 'chown');
        const node = link.getNode();
        node.chown(uid, gid);
        // if(node.isFile() || node.isSymlink()) {
        //
        // } else if(node.isDirectory()) {
        //
        // } else {
        // TODO: What do we do here?
        // }
    }
    chownSync(path, uid, gid) {
        validateUid(uid);
        validateGid(gid);
        this.chownBase((0, util_1.pathToFilename)(path), uid, gid);
    }
    chown(path, uid, gid, callback) {
        validateUid(uid);
        validateGid(gid);
        this.wrapAsync(this.chownBase, [(0, util_1.pathToFilename)(path), uid, gid], callback);
    }
    lchownBase(filename, uid, gid) {
        this.getLinkOrThrow(filename, 'lchown').getNode().chown(uid, gid);
    }
    lchownSync(path, uid, gid) {
        validateUid(uid);
        validateGid(gid);
        this.lchownBase((0, util_1.pathToFilename)(path), uid, gid);
    }
    lchown(path, uid, gid, callback) {
        validateUid(uid);
        validateGid(gid);
        this.wrapAsync(this.lchownBase, [(0, util_1.pathToFilename)(path), uid, gid], callback);
    }
    watchFile(path, a, b) {
        const filename = (0, util_1.pathToFilename)(path);
        let options = a;
        let listener = b;
        if (typeof options === 'function') {
            listener = a;
            options = null;
        }
        if (typeof listener !== 'function') {
            throw Error('"watchFile()" requires a listener function');
        }
        let interval = 5007;
        let persistent = true;
        if (options && typeof options === 'object') {
            if (typeof options.interval === 'number')
                interval = options.interval;
            if (typeof options.persistent === 'boolean')
                persistent = options.persistent;
        }
        let watcher = this.statWatchers[filename];
        if (!watcher) {
            watcher = new this.StatWatcher();
            watcher.start(filename, persistent, interval);
            this.statWatchers[filename] = watcher;
        }
        watcher.addListener('change', listener);
        return watcher;
    }
    unwatchFile(path, listener) {
        const filename = (0, util_1.pathToFilename)(path);
        const watcher = this.statWatchers[filename];
        if (!watcher)
            return;
        if (typeof listener === 'function') {
            watcher.removeListener('change', listener);
        }
        else {
            watcher.removeAllListeners('change');
        }
        if (watcher.listenerCount('change') === 0) {
            watcher.stop();
            delete this.statWatchers[filename];
        }
    }
    createReadStream(path, options) {
        return new this.ReadStream(path, options);
    }
    createWriteStream(path, options) {
        return new this.WriteStream(path, options);
    }
    // watch(path: PathLike): FSWatcher;
    // watch(path: PathLike, options?: IWatchOptions | string): FSWatcher;
    watch(path, options, listener) {
        const filename = (0, util_1.pathToFilename)(path);
        let givenOptions = options;
        if (typeof options === 'function') {
            listener = options;
            givenOptions = null;
        }
        // tslint:disable-next-line prefer-const
        let { persistent, recursive, encoding } = (0, options_1.getDefaultOpts)(givenOptions);
        if (persistent === undefined)
            persistent = true;
        if (recursive === undefined)
            recursive = false;
        const watcher = new this.FSWatcher();
        watcher.start(filename, persistent, recursive, encoding);
        if (listener) {
            watcher.addListener('change', listener);
        }
        return watcher;
    }
}
exports.Volume = Volume;
/**
 * Global file descriptor counter. UNIX file descriptors start from 0 and go sequentially
 * up, so here, in order not to conflict with them, we choose some big number and descrease
 * the file descriptor of every new opened file.
 * @type {number}
 * @todo This should not be static, right?
 */
Volume.fd = 0x7fffffff;
function emitStop(self) {
    self.emit('stop');
}
class StatWatcher extends events_1.EventEmitter {
    constructor(vol) {
        super();
        this.onInterval = () => {
            try {
                const stats = this.vol.statSync(this.filename);
                if (this.hasChanged(stats)) {
                    this.emit('change', stats, this.prev);
                    this.prev = stats;
                }
            }
            finally {
                this.loop();
            }
        };
        this.vol = vol;
    }
    loop() {
        this.timeoutRef = this.setTimeout(this.onInterval, this.interval);
    }
    hasChanged(stats) {
        // if(!this.prev) return false;
        if (stats.mtimeMs > this.prev.mtimeMs)
            return true;
        if (stats.nlink !== this.prev.nlink)
            return true;
        return false;
    }
    start(path, persistent = true, interval = 5007) {
        this.filename = (0, util_1.pathToFilename)(path);
        this.setTimeout = persistent
            ? setTimeout.bind(typeof globalThis !== 'undefined' ? globalThis : global)
            : setTimeoutUnref_1.default;
        this.interval = interval;
        this.prev = this.vol.statSync(this.filename);
        this.loop();
    }
    stop() {
        clearTimeout(this.timeoutRef);
        (0, queueMicrotask_1.default)(() => {
            emitStop.call(this, this);
        });
    }
}
exports.StatWatcher = StatWatcher;
/* tslint:disable no-var-keyword prefer-const */
// ---------------------------------------- ReadStream
var pool;
function allocNewPool(poolSize) {
    pool = (0, buffer_1.bufferAllocUnsafe)(poolSize);
    pool.used = 0;
}
util.inherits(FsReadStream, stream_1.Readable);
exports.ReadStream = FsReadStream;
function FsReadStream(vol, path, options) {
    if (!(this instanceof FsReadStream))
        return new FsReadStream(vol, path, options);
    this._vol = vol;
    // a little bit bigger buffer and water marks by default
    options = Object.assign({}, (0, options_1.getOptions)(options, {}));
    if (options.highWaterMark === undefined)
        options.highWaterMark = 64 * 1024;
    stream_1.Readable.call(this, options);
    this.path = (0, util_1.pathToFilename)(path);
    this.fd = options.fd === undefined ? null : options.fd;
    this.flags = options.flags === undefined ? 'r' : options.flags;
    this.mode = options.mode === undefined ? 0o666 : options.mode;
    this.start = options.start;
    this.end = options.end;
    this.autoClose = options.autoClose === undefined ? true : options.autoClose;
    this.pos = undefined;
    this.bytesRead = 0;
    if (this.start !== undefined) {
        if (typeof this.start !== 'number') {
            throw new TypeError('"start" option must be a Number');
        }
        if (this.end === undefined) {
            this.end = Infinity;
        }
        else if (typeof this.end !== 'number') {
            throw new TypeError('"end" option must be a Number');
        }
        if (this.start > this.end) {
            throw new Error('"start" option must be <= "end" option');
        }
        this.pos = this.start;
    }
    if (typeof this.fd !== 'number')
        this.open();
    this.on('end', function () {
        if (this.autoClose) {
            if (this.destroy)
                this.destroy();
        }
    });
}
FsReadStream.prototype.open = function () {
    var self = this; // tslint:disable-line no-this-assignment
    this._vol.open(this.path, this.flags, this.mode, (er, fd) => {
        if (er) {
            if (self.autoClose) {
                if (self.destroy)
                    self.destroy();
            }
            self.emit('error', er);
            return;
        }
        self.fd = fd;
        self.emit('open', fd);
        // start the flow of data.
        self.read();
    });
};
FsReadStream.prototype._read = function (n) {
    if (typeof this.fd !== 'number') {
        return this.once('open', function () {
            this._read(n);
        });
    }
    if (this.destroyed)
        return;
    if (!pool || pool.length - pool.used < kMinPoolSpace) {
        // discard the old pool.
        allocNewPool(this._readableState.highWaterMark);
    }
    // Grab another reference to the pool in the case that while we're
    // in the thread pool another read() finishes up the pool, and
    // allocates a new one.
    var thisPool = pool;
    var toRead = Math.min(pool.length - pool.used, n);
    var start = pool.used;
    if (this.pos !== undefined)
        toRead = Math.min(this.end - this.pos + 1, toRead);
    // already read everything we were supposed to read!
    // treat as EOF.
    if (toRead <= 0)
        return this.push(null);
    // the actual read.
    var self = this; // tslint:disable-line no-this-assignment
    this._vol.read(this.fd, pool, pool.used, toRead, this.pos, onread);
    // move the pool positions, and internal position for reading.
    if (this.pos !== undefined)
        this.pos += toRead;
    pool.used += toRead;
    function onread(er, bytesRead) {
        if (er) {
            if (self.autoClose && self.destroy) {
                self.destroy();
            }
            self.emit('error', er);
        }
        else {
            var b = null;
            if (bytesRead > 0) {
                self.bytesRead += bytesRead;
                b = thisPool.slice(start, start + bytesRead);
            }
            self.push(b);
        }
    }
};
FsReadStream.prototype._destroy = function (err, cb) {
    this.close(err2 => {
        cb(err || err2);
    });
};
FsReadStream.prototype.close = function (cb) {
    var _a;
    if (cb)
        this.once('close', cb);
    if (this.closed || typeof this.fd !== 'number') {
        if (typeof this.fd !== 'number') {
            this.once('open', closeOnOpen);
            return;
        }
        return (0, queueMicrotask_1.default)(() => this.emit('close'));
    }
    // Since Node 18, there is only a getter for '.closed'.
    // The first branch mimics other setters from Readable.
    // See https://github.com/nodejs/node/blob/v18.0.0/lib/internal/streams/readable.js#L1243
    if (typeof ((_a = this._readableState) === null || _a === void 0 ? void 0 : _a.closed) === 'boolean') {
        this._readableState.closed = true;
    }
    else {
        this.closed = true;
    }
    this._vol.close(this.fd, er => {
        if (er)
            this.emit('error', er);
        else
            this.emit('close');
    });
    this.fd = null;
};
// needed because as it will be called with arguments
// that does not match this.close() signature
function closeOnOpen(fd) {
    this.close();
}
util.inherits(FsWriteStream, stream_1.Writable);
exports.WriteStream = FsWriteStream;
function FsWriteStream(vol, path, options) {
    if (!(this instanceof FsWriteStream))
        return new FsWriteStream(vol, path, options);
    this._vol = vol;
    options = Object.assign({}, (0, options_1.getOptions)(options, {}));
    stream_1.Writable.call(this, options);
    this.path = (0, util_1.pathToFilename)(path);
    this.fd = options.fd === undefined ? null : options.fd;
    this.flags = options.flags === undefined ? 'w' : options.flags;
    this.mode = options.mode === undefined ? 0o666 : options.mode;
    this.start = options.start;
    this.autoClose = options.autoClose === undefined ? true : !!options.autoClose;
    this.pos = undefined;
    this.bytesWritten = 0;
    this.pending = true;
    if (this.start !== undefined) {
        if (typeof this.start !== 'number') {
            throw new TypeError('"start" option must be a Number');
        }
        if (this.start < 0) {
            throw new Error('"start" must be >= zero');
        }
        this.pos = this.start;
    }
    if (options.encoding)
        this.setDefaultEncoding(options.encoding);
    if (typeof this.fd !== 'number')
        this.open();
    // dispose on finish.
    this.once('finish', function () {
        if (this.autoClose) {
            this.close();
        }
    });
}
FsWriteStream.prototype.open = function () {
    this._vol.open(this.path, this.flags, this.mode, function (er, fd) {
        if (er) {
            if (this.autoClose && this.destroy) {
                this.destroy();
            }
            this.emit('error', er);
            return;
        }
        this.fd = fd;
        this.pending = false;
        this.emit('open', fd);
    }.bind(this));
};
FsWriteStream.prototype._write = function (data, encoding, cb) {
    if (!(data instanceof buffer_1.Buffer || data instanceof Uint8Array))
        return this.emit('error', new Error('Invalid data'));
    if (typeof this.fd !== 'number') {
        return this.once('open', function () {
            this._write(data, encoding, cb);
        });
    }
    var self = this; // tslint:disable-line no-this-assignment
    this._vol.write(this.fd, data, 0, data.length, this.pos, (er, bytes) => {
        if (er) {
            if (self.autoClose && self.destroy) {
                self.destroy();
            }
            return cb(er);
        }
        self.bytesWritten += bytes;
        cb();
    });
    if (this.pos !== undefined)
        this.pos += data.length;
};
FsWriteStream.prototype._writev = function (data, cb) {
    if (typeof this.fd !== 'number') {
        return this.once('open', function () {
            this._writev(data, cb);
        });
    }
    const self = this; // tslint:disable-line no-this-assignment
    const len = data.length;
    const chunks = new Array(len);
    var size = 0;
    for (var i = 0; i < len; i++) {
        var chunk = data[i].chunk;
        chunks[i] = chunk;
        size += chunk.length;
    }
    const buf = buffer_1.Buffer.concat(chunks);
    this._vol.write(this.fd, buf, 0, buf.length, this.pos, (er, bytes) => {
        if (er) {
            if (self.destroy)
                self.destroy();
            return cb(er);
        }
        self.bytesWritten += bytes;
        cb();
    });
    if (this.pos !== undefined)
        this.pos += size;
};
FsWriteStream.prototype.close = function (cb) {
    var _a;
    if (cb)
        this.once('close', cb);
    if (this.closed || typeof this.fd !== 'number') {
        if (typeof this.fd !== 'number') {
            this.once('open', closeOnOpen);
            return;
        }
        return (0, queueMicrotask_1.default)(() => this.emit('close'));
    }
    // Since Node 18, there is only a getter for '.closed'.
    // The first branch mimics other setters from Writable.
    // See https://github.com/nodejs/node/blob/v18.0.0/lib/internal/streams/writable.js#L766
    if (typeof ((_a = this._writableState) === null || _a === void 0 ? void 0 : _a.closed) === 'boolean') {
        this._writableState.closed = true;
    }
    else {
        this.closed = true;
    }
    this._vol.close(this.fd, er => {
        if (er)
            this.emit('error', er);
        else
            this.emit('close');
    });
    this.fd = null;
};
FsWriteStream.prototype._destroy = FsReadStream.prototype._destroy;
// There is no shutdown() for files.
FsWriteStream.prototype.destroySoon = FsWriteStream.prototype.end;
// ---------------------------------------- FSWatcher
class FSWatcher extends events_1.EventEmitter {
    constructor(vol) {
        super();
        this._filename = '';
        this._filenameEncoded = '';
        // _persistent: boolean = true;
        this._recursive = false;
        this._encoding = encoding_1.ENCODING_UTF8;
        // inode -> removers
        this._listenerRemovers = new Map();
        this._onParentChild = (link) => {
            if (link.getName() === this._getName()) {
                this._emit('rename');
            }
        };
        this._emit = (type) => {
            this.emit('change', type, this._filenameEncoded);
        };
        this._persist = () => {
            this._timer = setTimeout(this._persist, 1e6);
        };
        this._vol = vol;
        // TODO: Emit "error" messages when watching.
        // this._handle.onchange = function(status, eventType, filename) {
        //     if (status < 0) {
        //         self._handle.close();
        //         const error = !filename ?
        //             errnoException(status, 'Error watching file for changes:') :
        //             errnoException(status, `Error watching file ${filename} for changes:`);
        //         error.filename = filename;
        //         self.emit('error', error);
        //     } else {
        //         self.emit('change', eventType, filename);
        //     }
        // };
    }
    _getName() {
        return this._steps[this._steps.length - 1];
    }
    start(path, persistent = true, recursive = false, encoding = encoding_1.ENCODING_UTF8) {
        this._filename = (0, util_1.pathToFilename)(path);
        this._steps = filenameToSteps(this._filename);
        this._filenameEncoded = (0, encoding_1.strToEncoding)(this._filename);
        // this._persistent = persistent;
        this._recursive = recursive;
        this._encoding = encoding;
        try {
            this._link = this._vol.getLinkOrThrow(this._filename, 'FSWatcher');
        }
        catch (err) {
            const error = new Error(`watch ${this._filename} ${err.code}`);
            error.code = err.code;
            error.errno = err.code;
            throw error;
        }
        const watchLinkNodeChanged = (link) => {
            var _a;
            const filepath = link.getPath();
            const node = link.getNode();
            const onNodeChange = () => {
                let filename = relative(this._filename, filepath);
                if (!filename) {
                    filename = this._getName();
                }
                return this.emit('change', 'change', filename);
            };
            node.on('change', onNodeChange);
            const removers = (_a = this._listenerRemovers.get(node.ino)) !== null && _a !== void 0 ? _a : [];
            removers.push(() => node.removeListener('change', onNodeChange));
            this._listenerRemovers.set(node.ino, removers);
        };
        const watchLinkChildrenChanged = (link) => {
            var _a;
            const node = link.getNode();
            // when a new link added
            const onLinkChildAdd = (l) => {
                this.emit('change', 'rename', relative(this._filename, l.getPath()));
                setTimeout(() => {
                    // 1. watch changes of the new link-node
                    watchLinkNodeChanged(l);
                    // 2. watch changes of the new link-node's children
                    watchLinkChildrenChanged(l);
                });
            };
            // when a new link deleted
            const onLinkChildDelete = (l) => {
                // remove the listeners of the children nodes
                const removeLinkNodeListeners = (curLink) => {
                    const ino = curLink.getNode().ino;
                    const removers = this._listenerRemovers.get(ino);
                    if (removers) {
                        removers.forEach(r => r());
                        this._listenerRemovers.delete(ino);
                    }
                    for (const [name, childLink] of curLink.children.entries()) {
                        if (childLink && name !== '.' && name !== '..') {
                            removeLinkNodeListeners(childLink);
                        }
                    }
                };
                removeLinkNodeListeners(l);
                this.emit('change', 'rename', relative(this._filename, l.getPath()));
            };
            // children nodes changed
            for (const [name, childLink] of link.children.entries()) {
                if (childLink && name !== '.' && name !== '..') {
                    watchLinkNodeChanged(childLink);
                }
            }
            // link children add/remove
            link.on('child:add', onLinkChildAdd);
            link.on('child:delete', onLinkChildDelete);
            const removers = (_a = this._listenerRemovers.get(node.ino)) !== null && _a !== void 0 ? _a : [];
            removers.push(() => {
                link.removeListener('child:add', onLinkChildAdd);
                link.removeListener('child:delete', onLinkChildDelete);
            });
            if (recursive) {
                for (const [name, childLink] of link.children.entries()) {
                    if (childLink && name !== '.' && name !== '..') {
                        watchLinkChildrenChanged(childLink);
                    }
                }
            }
        };
        watchLinkNodeChanged(this._link);
        watchLinkChildrenChanged(this._link);
        const parent = this._link.parent;
        if (parent) {
            // parent.on('child:add', this._onParentChild);
            parent.setMaxListeners(parent.getMaxListeners() + 1);
            parent.on('child:delete', this._onParentChild);
        }
        if (persistent)
            this._persist();
    }
    close() {
        clearTimeout(this._timer);
        this._listenerRemovers.forEach(removers => {
            removers.forEach(r => r());
        });
        this._listenerRemovers.clear();
        const parent = this._link.parent;
        if (parent) {
            // parent.removeListener('child:add', this._onParentChild);
            parent.removeListener('child:delete', this._onParentChild);
        }
    }
}
exports.FSWatcher = FSWatcher;
//# sourceMappingURL=volume.js.map

/***/ }),

/***/ 8772:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

/*!
 * on-finished
 * Copyright(c) 2013 Jonathan Ong
 * Copyright(c) 2014 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module exports.
 * @public
 */

module.exports = onFinished
module.exports.isFinished = isFinished

/**
 * Module dependencies.
 * @private
 */

var asyncHooks = tryRequireAsyncHooks()
var first = __nccwpck_require__(2261)

/**
 * Variables.
 * @private
 */

/* istanbul ignore next */
var defer = typeof setImmediate === 'function'
  ? setImmediate
  : function (fn) { process.nextTick(fn.bind.apply(fn, arguments)) }

/**
 * Invoke callback when the response has finished, useful for
 * cleaning up resources afterwards.
 *
 * @param {object} msg
 * @param {function} listener
 * @return {object}
 * @public
 */

function onFinished (msg, listener) {
  if (isFinished(msg) !== false) {
    defer(listener, null, msg)
    return msg
  }

  // attach the listener to the message
  attachListener(msg, wrap(listener))

  return msg
}

/**
 * Determine if message is already finished.
 *
 * @param {object} msg
 * @return {boolean}
 * @public
 */

function isFinished (msg) {
  var socket = msg.socket

  if (typeof msg.finished === 'boolean') {
    // OutgoingMessage
    return Boolean(msg.finished || (socket && !socket.writable))
  }

  if (typeof msg.complete === 'boolean') {
    // IncomingMessage
    return Boolean(msg.upgrade || !socket || !socket.readable || (msg.complete && !msg.readable))
  }

  // don't know
  return undefined
}

/**
 * Attach a finished listener to the message.
 *
 * @param {object} msg
 * @param {function} callback
 * @private
 */

function attachFinishedListener (msg, callback) {
  var eeMsg
  var eeSocket
  var finished = false

  function onFinish (error) {
    eeMsg.cancel()
    eeSocket.cancel()

    finished = true
    callback(error)
  }

  // finished on first message event
  eeMsg = eeSocket = first([[msg, 'end', 'finish']], onFinish)

  function onSocket (socket) {
    // remove listener
    msg.removeListener('socket', onSocket)

    if (finished) return
    if (eeMsg !== eeSocket) return

    // finished on first socket event
    eeSocket = first([[socket, 'error', 'close']], onFinish)
  }

  if (msg.socket) {
    // socket already assigned
    onSocket(msg.socket)
    return
  }

  // wait for socket to be assigned
  msg.on('socket', onSocket)

  if (msg.socket === undefined) {
    // istanbul ignore next: node.js 0.8 patch
    patchAssignSocket(msg, onSocket)
  }
}

/**
 * Attach the listener to the message.
 *
 * @param {object} msg
 * @return {function}
 * @private
 */

function attachListener (msg, listener) {
  var attached = msg.__onFinished

  // create a private single listener with queue
  if (!attached || !attached.queue) {
    attached = msg.__onFinished = createListener(msg)
    attachFinishedListener(msg, attached)
  }

  attached.queue.push(listener)
}

/**
 * Create listener on message.
 *
 * @param {object} msg
 * @return {function}
 * @private
 */

function createListener (msg) {
  function listener (err) {
    if (msg.__onFinished === listener) msg.__onFinished = null
    if (!listener.queue) return

    var queue = listener.queue
    listener.queue = null

    for (var i = 0; i < queue.length; i++) {
      queue[i](err, msg)
    }
  }

  listener.queue = []

  return listener
}

/**
 * Patch ServerResponse.prototype.assignSocket for node.js 0.8.
 *
 * @param {ServerResponse} res
 * @param {function} callback
 * @private
 */

// istanbul ignore next: node.js 0.8 patch
function patchAssignSocket (res, callback) {
  var assignSocket = res.assignSocket

  if (typeof assignSocket !== 'function') return

  // res.on('socket', callback) is broken in 0.8
  res.assignSocket = function _assignSocket (socket) {
    assignSocket.call(this, socket)
    callback(socket)
  }
}

/**
 * Try to require async_hooks
 * @private
 */

function tryRequireAsyncHooks () {
  try {
    return __nccwpck_require__(852)
  } catch (e) {
    return {}
  }
}

/**
 * Wrap function with async resource, if possible.
 * AsyncResource.bind static method backported.
 * @private
 */

function wrap (fn) {
  var res

  // create anonymous resource
  if (asyncHooks.AsyncResource) {
    res = new asyncHooks.AsyncResource(fn.name || 'bound-anonymous-fn')
  }

  // incompatible node.js
  if (!res || !res.runInAsyncScope) {
    return fn
  }

  // return bound function
  return res.runInAsyncScope.bind(res, fn, null)
}


/***/ }),

/***/ 2395:
/***/ ((module) => {

/*!
 * range-parser
 * Copyright(c) 2012-2014 TJ Holowaychuk
 * Copyright(c) 2015-2016 Douglas Christopher Wilson
 * MIT Licensed
 */



/**
 * Module exports.
 * @public
 */

module.exports = rangeParser

/**
 * Parse "Range" header `str` relative to the given file `size`.
 *
 * @param {Number} size
 * @param {String} str
 * @param {Object} [options]
 * @return {Array}
 * @public
 */

function rangeParser (size, str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string')
  }

  var index = str.indexOf('=')

  if (index === -1) {
    return -2
  }

  // split the range string
  var arr = str.slice(index + 1).split(',')
  var ranges = []

  // add ranges type
  ranges.type = str.slice(0, index)

  // parse all ranges
  for (var i = 0; i < arr.length; i++) {
    var range = arr[i].split('-')
    var start = parseInt(range[0], 10)
    var end = parseInt(range[1], 10)

    // -nnn
    if (isNaN(start)) {
      start = size - end
      end = size - 1
    // nnn-
    } else if (isNaN(end)) {
      end = size - 1
    }

    // limit last-byte-pos to current length
    if (end > size - 1) {
      end = size - 1
    }

    // invalid or unsatisifiable
    if (isNaN(start) || isNaN(end) || start > end || start < 0) {
      continue
    }

    // add range
    ranges.push({
      start: start,
      end: end
    })
  }

  if (ranges.length < 1) {
    // unsatisifiable
    return -1
  }

  return options && options.combine
    ? combineRanges(ranges)
    : ranges
}

/**
 * Combine overlapping & adjacent ranges.
 * @private
 */

function combineRanges (ranges) {
  var ordered = ranges.map(mapWithIndex).sort(sortByRangeStart)

  for (var j = 0, i = 1; i < ordered.length; i++) {
    var range = ordered[i]
    var current = ordered[j]

    if (range.start > current.end + 1) {
      // next range
      ordered[++j] = range
    } else if (range.end > current.end) {
      // extend range
      current.end = range.end
      current.index = Math.min(current.index, range.index)
    }
  }

  // trim ordered array
  ordered.length = j + 1

  // generate combined range
  var combined = ordered.sort(sortByRangeIndex).map(mapWithoutIndex)

  // copy ranges type
  combined.type = ranges.type

  return combined
}

/**
 * Map function to add index value to ranges.
 * @private
 */

function mapWithIndex (range, index) {
  return {
    start: range.start,
    end: range.end,
    index: index
  }
}

/**
 * Map function to remove index value from ranges.
 * @private
 */

function mapWithoutIndex (range) {
  return {
    start: range.start,
    end: range.end
  }
}

/**
 * Sort function to sort ranges by index.
 * @private
 */

function sortByRangeIndex (a, b) {
  return a.index - b.index
}

/**
 * Sort function to sort ranges by start position.
 * @private
 */

function sortByRangeStart (a, b) {
  return a.start - b.start
}


/***/ }),

/***/ 299:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const {
  validate
} = __nccwpck_require__(5014);
const mime = __nccwpck_require__(4031);
const middleware = __nccwpck_require__(8835);
const getFilenameFromUrl = __nccwpck_require__(739);
const setupHooks = __nccwpck_require__(73);
const setupWriteToDisk = __nccwpck_require__(4205);
const setupOutputFileSystem = __nccwpck_require__(6201);
const ready = __nccwpck_require__(5856);
const schema = __nccwpck_require__(5532);
const noop = () => {};

/** @typedef {import("schema-utils/declarations/validate").Schema} Schema */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").MultiCompiler} MultiCompiler */
/** @typedef {import("webpack").Configuration} Configuration */
/** @typedef {import("webpack").Stats} Stats */
/** @typedef {import("webpack").MultiStats} MultiStats */
/** @typedef {import("fs").ReadStream} ReadStream */

/**
 * @typedef {Object} ExtendedServerResponse
 * @property {{ webpack?: { devMiddleware?: Context<IncomingMessage, ServerResponse> } }} [locals]
 */

/** @typedef {import("http").IncomingMessage} IncomingMessage */
/** @typedef {import("http").ServerResponse & ExtendedServerResponse} ServerResponse */

/**
 * @callback NextFunction
 * @param {any} [err]
 * @return {void}
 */

/**
 * @typedef {NonNullable<Configuration["watchOptions"]>} WatchOptions
 */

/**
 * @typedef {Compiler["watching"]} Watching
 */

/**
 * @typedef {ReturnType<MultiCompiler["watch"]>} MultiWatching
 */

// TODO fix me after the next webpack release
/**
 * @typedef {Object & { createReadStream?: import("fs").createReadStream, statSync?: import("fs").statSync, lstat?: import("fs").lstat, readFileSync?: import("fs").readFileSync }} OutputFileSystem
 */

/** @typedef {ReturnType<Compiler["getInfrastructureLogger"]>} Logger */

/**
 * @callback Callback
 * @param {Stats | MultiStats} [stats]
 */

/**
 * @typedef {Object} ResponseData
 * @property {Buffer | ReadStream} data
 * @property {number} byteLength
 */

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @callback ModifyResponseData
 * @param {RequestInternal} req
 * @param {ResponseInternal} res
 * @param {Buffer | ReadStream} data
 * @param {number} byteLength
 * @return {ResponseData}
 */

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @typedef {Object} Context
 * @property {boolean} state
 * @property {Stats | MultiStats | undefined} stats
 * @property {Callback[]} callbacks
 * @property {Options<RequestInternal, ResponseInternal>} options
 * @property {Compiler | MultiCompiler} compiler
 * @property {Watching | MultiWatching | undefined} watching
 * @property {Logger} logger
 * @property {OutputFileSystem} outputFileSystem
 */

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @typedef {WithoutUndefined<Context<RequestInternal, ResponseInternal>, "watching">} FilledContext
 */

/** @typedef {Record<string, string | number> | Array<{ key: string, value: number | string }>} NormalizedHeaders */

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @typedef {NormalizedHeaders | ((req: RequestInternal, res: ResponseInternal, context: Context<RequestInternal, ResponseInternal>) =>  void | undefined | NormalizedHeaders) | undefined} Headers
 */

/**
 * @template {IncomingMessage} [RequestInternal = IncomingMessage]
 * @template {ServerResponse} [ResponseInternal = ServerResponse]
 * @typedef {Object} Options
 * @property {{[key: string]: string}} [mimeTypes]
 * @property {string | undefined} [mimeTypeDefault]
 * @property {boolean | ((targetPath: string) => boolean)} [writeToDisk]
 * @property {string[]} [methods]
 * @property {Headers<RequestInternal, ResponseInternal>} [headers]
 * @property {NonNullable<Configuration["output"]>["publicPath"]} [publicPath]
 * @property {Configuration["stats"]} [stats]
 * @property {boolean} [serverSideRender]
 * @property {OutputFileSystem} [outputFileSystem]
 * @property {boolean | string} [index]
 * @property {ModifyResponseData<RequestInternal, ResponseInternal>} [modifyResponseData]
 * @property {"weak" | "strong"} [etag]
 * @property {boolean} [lastModified]
 */

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @callback Middleware
 * @param {RequestInternal} req
 * @param {ResponseInternal} res
 * @param {NextFunction} next
 * @return {Promise<void>}
 */

/** @typedef {import("./utils/getFilenameFromUrl").Extra} Extra */

/**
 * @callback GetFilenameFromUrl
 * @param {string} url
 * @param {Extra=} extra
 * @returns {string | undefined}
 */

/**
 * @callback WaitUntilValid
 * @param {Callback} callback
 */

/**
 * @callback Invalidate
 * @param {Callback} callback
 */

/**
 * @callback Close
 * @param {(err: Error | null | undefined) => void} callback
 */

/**
 * @template {IncomingMessage} RequestInternal
 * @template {ServerResponse} ResponseInternal
 * @typedef {Object} AdditionalMethods
 * @property {GetFilenameFromUrl} getFilenameFromUrl
 * @property {WaitUntilValid} waitUntilValid
 * @property {Invalidate} invalidate
 * @property {Close} close
 * @property {Context<RequestInternal, ResponseInternal>} context
 */

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @typedef {Middleware<RequestInternal, ResponseInternal> & AdditionalMethods<RequestInternal, ResponseInternal>} API
 */

/**
 * @template T
 * @template {keyof T} K
 * @typedef {Omit<T, K> & Partial<T>} WithOptional
 */

/**
 * @template T
 * @template {keyof T} K
 * @typedef {T & { [P in K]: NonNullable<T[P]> }} WithoutUndefined
 */

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @param {Compiler | MultiCompiler} compiler
 * @param {Options<RequestInternal, ResponseInternal>} [options]
 * @returns {API<RequestInternal, ResponseInternal>}
 */
function wdm(compiler, options = {}) {
  validate( /** @type {Schema} */schema, options, {
    name: "Dev Middleware",
    baseDataPath: "options"
  });
  const {
    mimeTypes
  } = options;
  if (mimeTypes) {
    const {
      types
    } = mime;

    // mimeTypes from user provided options should take priority
    // over existing, known types
    // @ts-ignore
    mime.types = {
      ...types,
      ...mimeTypes
    };
  }

  /**
   * @type {WithOptional<Context<RequestInternal, ResponseInternal>, "watching" | "outputFileSystem">}
   */
  const context = {
    state: false,
    // eslint-disable-next-line no-undefined
    stats: undefined,
    callbacks: [],
    options,
    compiler,
    logger: compiler.getInfrastructureLogger("webpack-dev-middleware")
  };
  setupHooks(context);
  if (options.writeToDisk) {
    setupWriteToDisk(context);
  }
  setupOutputFileSystem(context);

  // Start watching
  if ( /** @type {Compiler} */context.compiler.watching) {
    context.watching = /** @type {Compiler} */context.compiler.watching;
  } else {
    /**
     * @param {Error | null | undefined} error
     */
    const errorHandler = error => {
      if (error) {
        // TODO: improve that in future
        // For example - `writeToDisk` can throw an error and right now it is ends watching.
        // We can improve that and keep watching active, but it is require API on webpack side.
        // Let's implement that in webpack@5 because it is rare case.
        context.logger.error(error);
      }
    };
    if (Array.isArray( /** @type {MultiCompiler} */context.compiler.compilers)) {
      const compiler = /** @type {MultiCompiler} */context.compiler;
      const watchOptions = compiler.compilers.map(childCompiler => childCompiler.options.watchOptions || {});
      context.watching = compiler.watch(watchOptions, errorHandler);
    } else {
      const compiler = /** @type {Compiler} */context.compiler;
      const watchOptions = compiler.options.watchOptions || {};
      context.watching = compiler.watch(watchOptions, errorHandler);
    }
  }
  const filledContext = /** @type {FilledContext<RequestInternal, ResponseInternal>} */
  context;
  const instance = /** @type {API<RequestInternal, ResponseInternal>} */
  middleware(filledContext);

  // API
  instance.getFilenameFromUrl = (url, extra) => getFilenameFromUrl(filledContext, url, extra);
  instance.waitUntilValid = (callback = noop) => {
    ready(filledContext, callback);
  };
  instance.invalidate = (callback = noop) => {
    ready(filledContext, callback);
    filledContext.watching.invalidate();
  };
  instance.close = (callback = noop) => {
    filledContext.watching.close(callback);
  };
  instance.context = filledContext;
  return instance;
}

/**
 * @template S
 * @template O
 * @typedef {Object} HapiPluginBase
 * @property {(server: S, options: O) => void | Promise<void>} register
 */

/**
 * @template S
 * @template O
 * @typedef {HapiPluginBase<S, O> & { pkg: { name: string } }} HapiPlugin
 */

/**
 * @typedef {Options & { compiler: Compiler | MultiCompiler }} HapiOptions
 */

/**
 * @template HapiServer
 * @template {HapiOptions} HapiOptionsInternal
 * @returns {HapiPlugin<HapiServer, HapiOptionsInternal>}
 */
function hapiWrapper() {
  return {
    pkg: {
      name: "webpack-dev-middleware"
    },
    register(server, options) {
      const {
        compiler,
        ...rest
      } = options;
      if (!compiler) {
        throw new Error("The compiler options is required.");
      }
      const devMiddleware = wdm(compiler, rest);

      // @ts-ignore
      server.decorate("server", "webpackDevMiddleware", devMiddleware);
      // @ts-ignore
      server.ext("onRequest", (request, h) => new Promise((resolve, reject) => {
        devMiddleware(request.raw.req, request.raw.res, error => {
          if (error) {
            reject(error);
            return;
          }
          resolve(request);
        });
      }).then(() => h.continue).catch(error => {
        throw error;
      }));
    }
  };
}
wdm.hapiWrapper = hapiWrapper;

/**
 * @template {IncomingMessage} [RequestInternal=IncomingMessage]
 * @template {ServerResponse} [ResponseInternal=ServerResponse]
 * @param {Compiler | MultiCompiler} compiler
 * @param {Options<RequestInternal, ResponseInternal>} [options]
 * @returns {(ctx: any, next: Function) => Promise<void> | void}
 */
function koaWrapper(compiler, options) {
  const devMiddleware = wdm(compiler, options);

  /**
   * @param {{ req: RequestInternal, res: ResponseInternal & import("./utils/compatibleAPI").ExpectedResponse, status: number, body: Buffer | import("fs").ReadStream | { message: string }, state: Object }} ctx
   * @param {Function} next
   * @returns {Promise<void>}
   */
  const wrapper = async function webpackDevMiddleware(ctx, next) {
    return new Promise((resolve, reject) => {
      const {
        req
      } = ctx;
      const {
        res
      } = ctx;
      res.locals = ctx.state;
      /**
       * @param {number} status status code
       */
      res.status = status => {
        // eslint-disable-next-line no-param-reassign
        ctx.status = status;
      };
      /**
       * @param {import("fs").ReadStream} stream readable stream
       */
      res.pipeInto = stream => {
        // eslint-disable-next-line no-param-reassign
        ctx.body = stream;
        resolve();
      };
      /**
       * @param {Buffer} content content
       */
      res.send = content => {
        // eslint-disable-next-line no-param-reassign
        ctx.body = content;
        resolve();
      };
      devMiddleware(req, res, err => {
        if (err) {
          reject(err);
          return;
        }
        resolve(next());
      }).catch(err => {
        // eslint-disable-next-line no-param-reassign
        ctx.status = err.statusCode || err.status || 500;
        // eslint-disable-next-line no-param-reassign
        ctx.body = {
          message: err.message
        };
      });
    });
  };
  wrapper.devMiddleware = devMiddleware;
  return wrapper;
}
wdm.koaWrapper = koaWrapper;
module.exports = wdm;

/***/ }),

/***/ 8835:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const path = __nccwpck_require__(1017);
const mime = __nccwpck_require__(4031);
const onFinishedStream = __nccwpck_require__(8772);
const getFilenameFromUrl = __nccwpck_require__(739);
const {
  setStatusCode,
  send,
  pipe,
  createReadStreamOrReadFileSync
} = __nccwpck_require__(7452);
const ready = __nccwpck_require__(5856);
const parseTokenList = __nccwpck_require__(9625);
const memorize = __nccwpck_require__(9796);

/** @typedef {import("./index.js").NextFunction} NextFunction */
/** @typedef {import("./index.js").IncomingMessage} IncomingMessage */
/** @typedef {import("./index.js").ServerResponse} ServerResponse */
/** @typedef {import("./index.js").NormalizedHeaders} NormalizedHeaders */
/** @typedef {import("fs").ReadStream} ReadStream */

const BYTES_RANGE_REGEXP = /^ *bytes/i;

/**
 * @param {string} type
 * @param {number} size
 * @param {import("range-parser").Range} [range]
 * @returns {string}
 */
function getValueContentRangeHeader(type, size, range) {
  return `${type} ${range ? `${range.start}-${range.end}` : "*"}/${size}`;
}

/**
 * Parse an HTTP Date into a number.
 *
 * @param {string} date
 * @returns {number}
 */
function parseHttpDate(date) {
  const timestamp = date && Date.parse(date);

  // istanbul ignore next: guard against date.js Date.parse patching
  return typeof timestamp === "number" ? timestamp : NaN;
}
const CACHE_CONTROL_NO_CACHE_REGEXP = /(?:^|,)\s*?no-cache\s*?(?:,|$)/;

/**
 * @param {import("fs").ReadStream} stream stream
 * @param {boolean} suppress do need suppress?
 * @returns {void}
 */
function destroyStream(stream, suppress) {
  if (typeof stream.destroy === "function") {
    stream.destroy();
  }
  if (typeof stream.close === "function") {
    // Node.js core bug workaround
    stream.on("open",
    /**
     * @this {import("fs").ReadStream}
     */
    function onOpenClose() {
      // @ts-ignore
      if (typeof this.fd === "number") {
        // actually close down the fd
        this.close();
      }
    });
  }
  if (typeof stream.addListener === "function" && suppress) {
    stream.removeAllListeners("error");
    stream.addListener("error", () => {});
  }
}

/** @type {Record<number, string>} */
const statuses = {
  400: "Bad Request",
  403: "Forbidden",
  404: "Not Found",
  416: "Range Not Satisfiable",
  500: "Internal Server Error"
};
const parseRangeHeaders = memorize(
/**
 * @param {string} value
 * @returns {import("range-parser").Result | import("range-parser").Ranges}
 */
value => {
  const [len, rangeHeader] = value.split("|");

  // eslint-disable-next-line global-require
  return __nccwpck_require__(2395)(Number(len), rangeHeader, {
    combine: true
  });
});

/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @typedef {Object} SendErrorOptions send error options
 * @property {Record<string, number | string | string[] | undefined>=} headers headers
 * @property {import("./index").ModifyResponseData<Request, Response>=} modifyResponseData modify response data callback
 */

/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @param {import("./index.js").FilledContext<Request, Response>} context
 * @return {import("./index.js").Middleware<Request, Response>}
 */
function wrapper(context) {
  return async function middleware(req, res, next) {
    const acceptedMethods = context.options.methods || ["GET", "HEAD"];

    // fixes #282. credit @cexoso. in certain edge situations res.locals is undefined.
    // eslint-disable-next-line no-param-reassign
    res.locals = res.locals || {};
    async function goNext() {
      if (!context.options.serverSideRender) {
        return next();
      }
      return new Promise(resolve => {
        ready(context, () => {
          /** @type {any} */
          // eslint-disable-next-line no-param-reassign
          res.locals.webpack = {
            devMiddleware: context
          };
          resolve(next());
        }, req);
      });
    }
    if (req.method && !acceptedMethods.includes(req.method)) {
      await goNext();
      return;
    }

    /**
     * @param {number} status status
     * @param {Partial<SendErrorOptions<Request, Response>>=} options options
     * @returns {void}
     */
    function sendError(status, options) {
      // eslint-disable-next-line global-require
      const escapeHtml = __nccwpck_require__(3041);
      const content = statuses[status] || String(status);
      let document = Buffer.from(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>${escapeHtml(content)}</pre>
</body>
</html>`, "utf-8");

      // Clear existing headers
      const headers = res.getHeaderNames();
      for (let i = 0; i < headers.length; i++) {
        res.removeHeader(headers[i]);
      }
      if (options && options.headers) {
        const keys = Object.keys(options.headers);
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const value = options.headers[key];
          if (typeof value !== "undefined") {
            res.setHeader(key, value);
          }
        }
      }

      // Send basic response
      setStatusCode(res, status);
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.setHeader("Content-Security-Policy", "default-src 'none'");
      res.setHeader("X-Content-Type-Options", "nosniff");
      let byteLength = Buffer.byteLength(document);
      if (options && options.modifyResponseData) {
        ({
          data: document,
          byteLength
        } = /** @type {{ data: Buffer, byteLength: number }} */
        options.modifyResponseData(req, res, document, byteLength));
      }
      res.setHeader("Content-Length", byteLength);
      res.end(document);
    }
    function isConditionalGET() {
      return req.headers["if-match"] || req.headers["if-unmodified-since"] || req.headers["if-none-match"] || req.headers["if-modified-since"];
    }
    function isPreconditionFailure() {
      // if-match
      const ifMatch = req.headers["if-match"];

      // A recipient MUST ignore If-Unmodified-Since if the request contains
      // an If-Match header field; the condition in If-Match is considered to
      // be a more accurate replacement for the condition in
      // If-Unmodified-Since, and the two are only combined for the sake of
      // interoperating with older intermediaries that might not implement If-Match.
      if (ifMatch) {
        const etag = res.getHeader("ETag");
        return !etag || ifMatch !== "*" && parseTokenList(ifMatch).every(match => match !== etag && match !== `W/${etag}` && `W/${match}` !== etag);
      }

      // if-unmodified-since
      const ifUnmodifiedSince = req.headers["if-unmodified-since"];
      if (ifUnmodifiedSince) {
        const unmodifiedSince = parseHttpDate(ifUnmodifiedSince);

        // A recipient MUST ignore the If-Unmodified-Since header field if the
        // received field-value is not a valid HTTP-date.
        if (!isNaN(unmodifiedSince)) {
          const lastModified = parseHttpDate( /** @type {string} */res.getHeader("Last-Modified"));
          return isNaN(lastModified) || lastModified > unmodifiedSince;
        }
      }
      return false;
    }

    /**
     * @returns {boolean} is cachable
     */
    function isCachable() {
      return res.statusCode >= 200 && res.statusCode < 300 || res.statusCode === 304;
    }

    /**
     * @param {import("http").OutgoingHttpHeaders} resHeaders
     * @returns {boolean}
     */
    function isFresh(resHeaders) {
      // Always return stale when Cache-Control: no-cache to support end-to-end reload requests
      // https://tools.ietf.org/html/rfc2616#section-14.9.4
      const cacheControl = req.headers["cache-control"];
      if (cacheControl && CACHE_CONTROL_NO_CACHE_REGEXP.test(cacheControl)) {
        return false;
      }

      // fields
      const noneMatch = req.headers["if-none-match"];
      const modifiedSince = req.headers["if-modified-since"];

      // unconditional request
      if (!noneMatch && !modifiedSince) {
        return false;
      }

      // if-none-match
      if (noneMatch && noneMatch !== "*") {
        if (!resHeaders.etag) {
          return false;
        }
        const matches = parseTokenList(noneMatch);
        let etagStale = true;
        for (let i = 0; i < matches.length; i++) {
          const match = matches[i];
          if (match === resHeaders.etag || match === `W/${resHeaders.etag}` || `W/${match}` === resHeaders.etag) {
            etagStale = false;
            break;
          }
        }
        if (etagStale) {
          return false;
        }
      }

      // A recipient MUST ignore If-Modified-Since if the request contains an If-None-Match header field;
      // the condition in If-None-Match is considered to be a more accurate replacement for the condition in If-Modified-Since,
      // and the two are only combined for the sake of interoperating with older intermediaries that might not implement If-None-Match.
      if (noneMatch) {
        return true;
      }

      // if-modified-since
      if (modifiedSince) {
        const lastModified = resHeaders["last-modified"];

        //  A recipient MUST ignore the If-Modified-Since header field if the
        //  received field-value is not a valid HTTP-date, or if the request
        //  method is neither GET nor HEAD.
        const modifiedStale = !lastModified || !(parseHttpDate(lastModified) <= parseHttpDate(modifiedSince));
        if (modifiedStale) {
          return false;
        }
      }
      return true;
    }
    function isRangeFresh() {
      const ifRange = /** @type {string | undefined} */
      req.headers["if-range"];
      if (!ifRange) {
        return true;
      }

      // if-range as etag
      if (ifRange.indexOf('"') !== -1) {
        const etag = /** @type {string | undefined} */res.getHeader("ETag");
        if (!etag) {
          return true;
        }
        return Boolean(etag && ifRange.indexOf(etag) !== -1);
      }

      // if-range as modified date
      const lastModified = /** @type {string | undefined} */
      res.getHeader("Last-Modified");
      if (!lastModified) {
        return true;
      }
      return parseHttpDate(lastModified) <= parseHttpDate(ifRange);
    }

    /**
     * @returns {string | undefined}
     */
    function getRangeHeader() {
      const rage = req.headers.range;
      if (rage && BYTES_RANGE_REGEXP.test(rage)) {
        return rage;
      }

      // eslint-disable-next-line no-undefined
      return undefined;
    }

    /**
     * @param {import("range-parser").Range} range
     * @returns {[number, number]}
     */
    function getOffsetAndLenFromRange(range) {
      const offset = range.start;
      const len = range.end - range.start + 1;
      return [offset, len];
    }

    /**
     * @param {number} offset
     * @param {number} len
     * @returns {[number, number]}
     */
    function calcStartAndEnd(offset, len) {
      const start = offset;
      const end = Math.max(offset, offset + len - 1);
      return [start, end];
    }
    async function processRequest() {
      // Pipe and SendFile
      /** @type {import("./utils/getFilenameFromUrl").Extra} */
      const extra = {};
      const filename = getFilenameFromUrl(context, /** @type {string} */req.url, extra);
      if (extra.errorCode) {
        if (extra.errorCode === 403) {
          context.logger.error(`Malicious path "${filename}".`);
        }
        sendError(extra.errorCode, {
          modifyResponseData: context.options.modifyResponseData
        });
        return;
      }
      if (!filename) {
        await goNext();
        return;
      }
      const {
        size
      } = /** @type {import("fs").Stats} */extra.stats;
      let len = size;
      let offset = 0;

      // Send logic
      let {
        headers
      } = context.options;
      if (typeof headers === "function") {
        headers = /** @type {NormalizedHeaders} */headers(req, res, context);
      }

      /**
       * @type {{key: string, value: string | number}[]}
       */
      const allHeaders = [];
      if (typeof headers !== "undefined") {
        if (!Array.isArray(headers)) {
          // eslint-disable-next-line guard-for-in
          for (const name in headers) {
            allHeaders.push({
              key: name,
              value: headers[name]
            });
          }
          headers = allHeaders;
        }
        headers.forEach(header => {
          res.setHeader(header.key, header.value);
        });
      }
      if (!res.getHeader("Content-Type")) {
        // content-type name(like application/javascript; charset=utf-8) or false
        const contentType = mime.contentType(path.extname(filename));

        // Only set content-type header if media type is known
        // https://tools.ietf.org/html/rfc7231#section-3.1.1.5
        if (contentType) {
          res.setHeader("Content-Type", contentType);
        } else if (context.options.mimeTypeDefault) {
          res.setHeader("Content-Type", context.options.mimeTypeDefault);
        }
      }
      if (!res.getHeader("Accept-Ranges")) {
        res.setHeader("Accept-Ranges", "bytes");
      }
      if (context.options.lastModified && !res.getHeader("Last-Modified")) {
        const modified = /** @type {import("fs").Stats} */
        extra.stats.mtime.toUTCString();
        res.setHeader("Last-Modified", modified);
      }

      /** @type {number} */
      let start;
      /** @type {number} */
      let end;

      /** @type {undefined | Buffer | ReadStream} */
      let bufferOrStream;
      /** @type {number} */
      let byteLength;
      const rangeHeader = getRangeHeader();
      if (context.options.etag && !res.getHeader("ETag")) {
        /** @type {import("fs").Stats | Buffer | ReadStream | undefined} */
        let value;

        // TODO cache etag generation?
        if (context.options.etag === "weak") {
          value = /** @type {import("fs").Stats} */extra.stats;
        } else {
          if (rangeHeader) {
            const parsedRanges = /** @type {import("range-parser").Ranges | import("range-parser").Result} */
            parseRangeHeaders(`${size}|${rangeHeader}`);
            if (parsedRanges !== -2 && parsedRanges !== -1 && parsedRanges.length === 1) {
              [offset, len] = getOffsetAndLenFromRange(parsedRanges[0]);
            }
          }
          [start, end] = calcStartAndEnd(offset, len);
          try {
            const result = createReadStreamOrReadFileSync(filename, context.outputFileSystem, start, end);
            value = result.bufferOrStream;
            ({
              bufferOrStream,
              byteLength
            } = result);
          } catch (_err) {
            // Ignore here
          }
        }
        if (value) {
          // eslint-disable-next-line global-require
          const result = await __nccwpck_require__(335)(value);

          // Because we already read stream, we can cache buffer to avoid extra read from fs
          if (result.buffer) {
            bufferOrStream = result.buffer;
          }
          res.setHeader("ETag", result.hash);
        }
      }

      // Conditional GET support
      if (isConditionalGET()) {
        if (isPreconditionFailure()) {
          sendError(412, {
            modifyResponseData: context.options.modifyResponseData
          });
          return;
        }

        // For Koa
        if (res.statusCode === 404) {
          setStatusCode(res, 200);
        }
        if (isCachable() && isFresh({
          etag: ( /** @type {string | undefined} */res.getHeader("ETag")),
          "last-modified": ( /** @type {string | undefined} */
          res.getHeader("Last-Modified"))
        })) {
          setStatusCode(res, 304);

          // Remove content header fields
          res.removeHeader("Content-Encoding");
          res.removeHeader("Content-Language");
          res.removeHeader("Content-Length");
          res.removeHeader("Content-Range");
          res.removeHeader("Content-Type");
          res.end();
          return;
        }
      }
      if (rangeHeader) {
        let parsedRanges = /** @type {import("range-parser").Ranges | import("range-parser").Result | []} */
        parseRangeHeaders(`${size}|${rangeHeader}`);

        // If-Range support
        if (!isRangeFresh()) {
          parsedRanges = [];
        }
        if (parsedRanges === -1) {
          context.logger.error("Unsatisfiable range for 'Range' header.");
          res.setHeader("Content-Range", getValueContentRangeHeader("bytes", size));
          sendError(416, {
            headers: {
              "Content-Range": res.getHeader("Content-Range")
            },
            modifyResponseData: context.options.modifyResponseData
          });
          return;
        } else if (parsedRanges === -2) {
          context.logger.error("A malformed 'Range' header was provided. A regular response will be sent for this request.");
        } else if (parsedRanges.length > 1) {
          context.logger.error("A 'Range' header with multiple ranges was provided. Multiple ranges are not supported, so a regular response will be sent for this request.");
        }
        if (parsedRanges !== -2 && parsedRanges.length === 1) {
          // Content-Range
          setStatusCode(res, 206);
          res.setHeader("Content-Range", getValueContentRangeHeader("bytes", size, /** @type {import("range-parser").Ranges} */parsedRanges[0]));
          [offset, len] = getOffsetAndLenFromRange(parsedRanges[0]);
        }
      }

      // When strong Etag generation is enabled we already read file, so we can skip extra fs call
      if (!bufferOrStream) {
        [start, end] = calcStartAndEnd(offset, len);
        try {
          ({
            bufferOrStream,
            byteLength
          } = createReadStreamOrReadFileSync(filename, context.outputFileSystem, start, end));
        } catch (_ignoreError) {
          await goNext();
          return;
        }
      }
      if (context.options.modifyResponseData) {
        ({
          data: bufferOrStream,
          byteLength
        } = context.options.modifyResponseData(req, res, bufferOrStream,
        // @ts-ignore
        byteLength));
      }

      // @ts-ignore
      res.setHeader("Content-Length", byteLength);
      if (req.method === "HEAD") {
        // For Koa
        if (res.statusCode === 404) {
          setStatusCode(res, 200);
        }
        res.end();
        return;
      }
      const isPipeSupports = typeof ( /** @type {import("fs").ReadStream} */bufferOrStream.pipe) === "function";
      if (!isPipeSupports) {
        send(res, /** @type {Buffer} */bufferOrStream);
        return;
      }

      // Cleanup
      const cleanup = () => {
        destroyStream( /** @type {import("fs").ReadStream} */bufferOrStream, true);
      };

      // Error handling
      /** @type {import("fs").ReadStream} */
      bufferOrStream.on("error", error => {
        // clean up stream early
        cleanup();

        // Handle Error
        switch ( /** @type {NodeJS.ErrnoException} */error.code) {
          case "ENAMETOOLONG":
          case "ENOENT":
          case "ENOTDIR":
            sendError(404, {
              modifyResponseData: context.options.modifyResponseData
            });
            break;
          default:
            sendError(500, {
              modifyResponseData: context.options.modifyResponseData
            });
            break;
        }
      });
      pipe(res, /** @type {ReadStream} */bufferOrStream);

      // Response finished, cleanup
      onFinishedStream(res, cleanup);
    }
    ready(context, processRequest, req);
  };
}
module.exports = wrapper;

/***/ }),

/***/ 7452:
/***/ ((module) => {



/** @typedef {import("../index.js").IncomingMessage} IncomingMessage */
/** @typedef {import("../index.js").ServerResponse} ServerResponse */

/**
 * @typedef {Object} ExpectedResponse
 * @property {(status: number) => void} [status]
 * @property {(data: any) => void} [send]
 * @property {(data: any) => void} [pipeInto]
 */

/**
 * @template {ServerResponse & ExpectedResponse} Response
 * @param {Response} res
 * @param {number} code
 */
function setStatusCode(res, code) {
  // Pseudo API
  if (typeof res.status === "function") {
    res.status(code);
    return;
  }

  // Node.js API
  // eslint-disable-next-line no-param-reassign
  res.statusCode = code;
}

/**
 * @template {ServerResponse} Response
 * @param {Response & ExpectedResponse} res
 * @param {import("fs").ReadStream} bufferOrStream
 */
function pipe(res, bufferOrStream) {
  // Pseudo API and Koa API
  if (typeof ( /** @type {Response & ExpectedResponse} */res.pipeInto) === "function") {
    // Writable stream into Readable stream
    res.pipeInto(bufferOrStream);
    return;
  }

  // Node.js API and Express API and Hapi API
  bufferOrStream.pipe(res);
}

/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @param {Response & ExpectedResponse} res
 * @param {string | Buffer} bufferOrStream
 */
function send(res, bufferOrStream) {
  // Pseudo API and Express API and Koa API
  if (typeof res.send === "function") {
    res.send(bufferOrStream);
    return;
  }
  res.end(bufferOrStream);
}

/**
 * @param {string} filename
 * @param {import("../index").OutputFileSystem} outputFileSystem
 * @param {number} start
 * @param {number} end
 * @returns {{ bufferOrStream: (Buffer | import("fs").ReadStream), byteLength: number }}
 */
function createReadStreamOrReadFileSync(filename, outputFileSystem, start, end) {
  /** @type {string | Buffer | import("fs").ReadStream} */
  let bufferOrStream;
  /** @type {number} */
  let byteLength;

  // Stream logic
  const isFsSupportsStream = typeof outputFileSystem.createReadStream === "function";
  if (isFsSupportsStream) {
    bufferOrStream = /** @type {import("fs").createReadStream} */
    outputFileSystem.createReadStream(filename, {
      start,
      end
    });

    // Handle files with zero bytes
    byteLength = end === 0 ? 0 : end - start + 1;
  } else {
    bufferOrStream = /** @type {import("fs").readFileSync} */
    outputFileSystem.readFileSync(filename);
    ({
      byteLength
    } = bufferOrStream);
  }
  return {
    bufferOrStream,
    byteLength
  };
}
module.exports = {
  setStatusCode,
  send,
  pipe,
  createReadStreamOrReadFileSync
};

/***/ }),

/***/ 3041:
/***/ ((module) => {



const matchHtmlRegExp = /["'&<>]/;

/**
 * @param {string} string raw HTML
 * @returns {string} escaped HTML
 */
function escapeHtml(string) {
  const str = `${string}`;
  const match = matchHtmlRegExp.exec(str);
  if (!match) {
    return str;
  }
  let escape;
  let html = "";
  let index = 0;
  let lastIndex = 0;
  for (({
    index
  } = match); index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      // "
      case 34:
        escape = "&quot;";
        break;
      // &
      case 38:
        escape = "&amp;";
        break;
      // '
      case 39:
        escape = "&#39;";
        break;
      // <
      case 60:
        escape = "&lt;";
        break;
      // >
      case 62:
        escape = "&gt;";
        break;
      default:
        // eslint-disable-next-line no-continue
        continue;
    }
    if (lastIndex !== index) {
      html += str.substring(lastIndex, index);
    }
    lastIndex = index + 1;
    html += escape;
  }
  return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
}
module.exports = escapeHtml;

/***/ }),

/***/ 335:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const crypto = __nccwpck_require__(6113);

/** @typedef {import("fs").Stats} Stats */
/** @typedef {import("fs").ReadStream} ReadStream */

/**
 * Generate a tag for a stat.
 *
 * @param {Stats} stat
 * @return {{ hash: string, buffer?: Buffer }}
 */
function statTag(stat) {
  const mtime = stat.mtime.getTime().toString(16);
  const size = stat.size.toString(16);
  return {
    hash: `W/"${size}-${mtime}"`
  };
}

/**
 * Generate an entity tag.
 *
 * @param {Buffer | ReadStream} entity
 * @return {Promise<{ hash: string, buffer?: Buffer }>}
 */
async function entityTag(entity) {
  const sha1 = crypto.createHash("sha1");
  if (!Buffer.isBuffer(entity)) {
    let byteLength = 0;

    /** @type {Buffer[]} */
    const buffers = [];
    await new Promise((resolve, reject) => {
      entity.on("data", chunk => {
        sha1.update(chunk);
        buffers.push( /** @type {Buffer} */chunk);
        byteLength += /** @type {Buffer} */chunk.byteLength;
      }).on("end", () => {
        resolve(sha1);
      }).on("error", reject);
    });
    return {
      buffer: Buffer.concat(buffers),
      hash: `"${byteLength.toString(16)}-${sha1.digest("base64").substring(0, 27)}"`
    };
  }
  if (entity.byteLength === 0) {
    // Fast-path empty
    return {
      hash: '"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk"'
    };
  }

  // Compute hash of entity
  const hash = sha1.update(entity).digest("base64").substring(0, 27);

  // Compute length of entity
  const {
    byteLength
  } = entity;
  return {
    hash: `"${byteLength.toString(16)}-${hash}"`
  };
}

/**
 * Create a simple ETag.
 *
 * @param {Buffer | ReadStream | Stats} entity
 * @return {Promise<{ hash: string, buffer?: Buffer }>}
 */
async function etag(entity) {
  const isStrong = Buffer.isBuffer(entity) || typeof ( /** @type {ReadStream} */entity.pipe) === "function";
  return isStrong ? entityTag( /** @type {Buffer | ReadStream} */entity) : statTag( /** @type {import("fs").Stats} */entity);
}
module.exports = etag;

/***/ }),

/***/ 739:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const path = __nccwpck_require__(1017);
const {
  parse
} = __nccwpck_require__(7310);
const querystring = __nccwpck_require__(3477);
const getPaths = __nccwpck_require__(3068);
const memorize = __nccwpck_require__(9796);

/** @typedef {import("../index.js").IncomingMessage} IncomingMessage */
/** @typedef {import("../index.js").ServerResponse} ServerResponse */

// eslint-disable-next-line no-undefined
const memoizedParse = memorize(parse, undefined, value => {
  if (value.pathname) {
    // eslint-disable-next-line no-param-reassign
    value.pathname = decode(value.pathname);
  }
  return value;
});
const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/;

/**
 * @typedef {Object} Extra
 * @property {import("fs").Stats=} stats
 * @property {number=} errorCode
 */

/**
 * decodeURIComponent.
 *
 * Allows V8 to only deoptimize this fn instead of all of send().
 *
 * @param {string} input
 * @returns {string}
 */

function decode(input) {
  return querystring.unescape(input);
}

// TODO refactor me in the next major release, this function should return `{ filename, stats, error }`
// TODO fix redirect logic when `/` at the end, like https://github.com/pillarjs/send/blob/master/index.js#L586
/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @param {import("../index.js").FilledContext<Request, Response>} context
 * @param {string} url
 * @param {Extra=} extra
 * @returns {string | undefined}
 */
function getFilenameFromUrl(context, url, extra = {}) {
  const {
    options
  } = context;
  const paths = getPaths(context);

  /** @type {string | undefined} */
  let foundFilename;
  /** @type {URL} */
  let urlObject;
  try {
    // The `url` property of the `request` is contains only  `pathname`, `search` and `hash`
    urlObject = memoizedParse(url, false, true);
  } catch (_ignoreError) {
    return;
  }
  for (const {
    publicPath,
    outputPath
  } of paths) {
    /** @type {string | undefined} */
    let filename;
    /** @type {URL} */
    let publicPathObject;
    try {
      publicPathObject = memoizedParse(publicPath !== "auto" && publicPath ? publicPath : "/", false, true);
    } catch (_ignoreError) {
      // eslint-disable-next-line no-continue
      continue;
    }
    const {
      pathname
    } = urlObject;
    const {
      pathname: publicPathPathname
    } = publicPathObject;
    if (pathname && pathname.startsWith(publicPathPathname)) {
      // Null byte(s)
      if (pathname.includes("\0")) {
        // eslint-disable-next-line no-param-reassign
        extra.errorCode = 400;
        return;
      }

      // ".." is malicious
      if (UP_PATH_REGEXP.test(path.normalize(`./${pathname}`))) {
        // eslint-disable-next-line no-param-reassign
        extra.errorCode = 403;
        return;
      }

      // Strip the `pathname` property from the `publicPath` option from the start of requested url
      // `/complex/foo.js` => `foo.js`
      // and add outputPath
      // `foo.js` => `/home/user/my-project/dist/foo.js`
      filename = path.join(outputPath, pathname.slice(publicPathPathname.length));
      try {
        // eslint-disable-next-line no-param-reassign
        extra.stats = /** @type {import("fs").statSync} */
        context.outputFileSystem.statSync(filename);
      } catch (_ignoreError) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (extra.stats.isFile()) {
        foundFilename = filename;
        break;
      } else if (extra.stats.isDirectory() && (typeof options.index === "undefined" || options.index)) {
        const indexValue = typeof options.index === "undefined" || typeof options.index === "boolean" ? "index.html" : options.index;
        filename = path.join(filename, indexValue);
        try {
          extra.stats = /** @type {import("fs").statSync} */
          context.outputFileSystem.statSync(filename);
        } catch (__ignoreError) {
          // eslint-disable-next-line no-continue
          continue;
        }
        if (extra.stats.isFile()) {
          foundFilename = filename;
          break;
        }
      }
    }
  }

  // eslint-disable-next-line consistent-return
  return foundFilename;
}
module.exports = getFilenameFromUrl;

/***/ }),

/***/ 3068:
/***/ ((module) => {



/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").Stats} Stats */
/** @typedef {import("webpack").MultiStats} MultiStats */
/** @typedef {import("../index.js").IncomingMessage} IncomingMessage */
/** @typedef {import("../index.js").ServerResponse} ServerResponse */

/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @param {import("../index.js").FilledContext<Request, Response>} context
 */
function getPaths(context) {
  const {
    stats,
    options
  } = context;
  /** @type {Stats[]} */
  const childStats = /** @type {MultiStats} */
  stats.stats ? /** @type {MultiStats} */stats.stats : [( /** @type {Stats} */stats)];
  const publicPaths = [];
  for (const {
    compilation
  } of childStats) {
    // The `output.path` is always present and always absolute
    const outputPath = compilation.getPath(compilation.outputOptions.path || "");
    const publicPath = options.publicPath ? compilation.getPath(options.publicPath) : compilation.outputOptions.publicPath ? compilation.getPath(compilation.outputOptions.publicPath) : "";
    publicPaths.push({
      outputPath,
      publicPath
    });
  }
  return publicPaths;
}
module.exports = getPaths;

/***/ }),

/***/ 9796:
/***/ ((module) => {



const cacheStore = new WeakMap();

/**
 * @template T
 * @param {Function} fn
 * @param {{ cache?: Map<string, { data: T }> } | undefined} cache
 * @param {((value: T) => T)=} callback
 * @returns {any}
 */
function memorize(fn, {
  cache = new Map()
} = {}, callback) {
  /**
   * @param {any} arguments_
   * @return {any}
   */
  const memoized = (...arguments_) => {
    const [key] = arguments_;
    const cacheItem = cache.get(key);
    if (cacheItem) {
      return cacheItem.data;
    }

    // @ts-ignore
    let result = fn.apply(this, arguments_);
    if (callback) {
      result = callback(result);
    }
    cache.set(key, {
      data: result
    });
    return result;
  };
  cacheStore.set(memoized, cache);
  return memoized;
}
module.exports = memorize;

/***/ }),

/***/ 9625:
/***/ ((module) => {



/**
 * Parse a HTTP token list.
 *
 * @param {string} str
 * @returns {string[]} tokens
 */
function parseTokenList(str) {
  let end = 0;
  let start = 0;
  const list = [];

  // gather tokens
  for (let i = 0, len = str.length; i < len; i++) {
    switch (str.charCodeAt(i)) {
      case 0x20 /*   */:
        if (start === end) {
          end = i + 1;
          start = end;
        }
        break;
      case 0x2c /* , */:
        if (start !== end) {
          list.push(str.substring(start, end));
        }
        end = i + 1;
        start = end;
        break;
      default:
        end = i + 1;
        break;
    }
  }

  // final token
  if (start !== end) {
    list.push(str.substring(start, end));
  }
  return list;
}
module.exports = parseTokenList;

/***/ }),

/***/ 5856:
/***/ ((module) => {



/** @typedef {import("../index.js").IncomingMessage} IncomingMessage */
/** @typedef {import("../index.js").ServerResponse} ServerResponse */

/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @param {import("../index.js").FilledContext<Request, Response>} context
 * @param {(...args: any[]) => any} callback
 * @param {Request} [req]
 * @returns {void}
 */
function ready(context, callback, req) {
  if (context.state) {
    callback(context.stats);
    return;
  }
  const name = req && req.url || callback.name;
  context.logger.info(`wait until bundle finished${name ? `: ${name}` : ""}`);
  context.callbacks.push(callback);
}
module.exports = ready;

/***/ }),

/***/ 73:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



/** @typedef {import("webpack").Configuration} Configuration */
/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").MultiCompiler} MultiCompiler */
/** @typedef {import("webpack").Stats} Stats */
/** @typedef {import("webpack").MultiStats} MultiStats */
/** @typedef {import("../index.js").IncomingMessage} IncomingMessage */
/** @typedef {import("../index.js").ServerResponse} ServerResponse */

/** @typedef {Configuration["stats"]} StatsOptions */
/** @typedef {{ children: Configuration["stats"][] }} MultiStatsOptions */
/** @typedef {Exclude<Configuration["stats"], boolean | string | undefined>} StatsObjectOptions */

/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @param {import("../index.js").WithOptional<import("../index.js").Context<Request, Response>, "watching" | "outputFileSystem">} context
 */
function setupHooks(context) {
  function invalid() {
    if (context.state) {
      context.logger.log("Compilation starting...");
    }

    // We are now in invalid state
    // eslint-disable-next-line no-param-reassign
    context.state = false;
    // eslint-disable-next-line no-param-reassign, no-undefined
    context.stats = undefined;
  }

  /**
   * @param {StatsOptions} statsOptions
   * @returns {StatsObjectOptions}
   */
  function normalizeStatsOptions(statsOptions) {
    if (typeof statsOptions === "undefined") {
      // eslint-disable-next-line no-param-reassign
      statsOptions = {
        preset: "normal"
      };
    } else if (typeof statsOptions === "boolean") {
      // eslint-disable-next-line no-param-reassign
      statsOptions = statsOptions ? {
        preset: "normal"
      } : {
        preset: "none"
      };
    } else if (typeof statsOptions === "string") {
      // eslint-disable-next-line no-param-reassign
      statsOptions = {
        preset: statsOptions
      };
    }
    return statsOptions;
  }

  /**
   * @param {Stats | MultiStats} stats
   */
  function done(stats) {
    // We are now on valid state
    // eslint-disable-next-line no-param-reassign
    context.state = true;
    // eslint-disable-next-line no-param-reassign
    context.stats = stats;

    // Do the stuff in nextTick, because bundle may be invalidated if a change happened while compiling
    process.nextTick(() => {
      const {
        compiler,
        logger,
        options,
        state,
        callbacks
      } = context;

      // Check if still in valid state
      if (!state) {
        return;
      }
      logger.log("Compilation finished");
      const isMultiCompilerMode = Boolean( /** @type {MultiCompiler} */
      compiler.compilers);

      /**
       * @type {StatsOptions | MultiStatsOptions | undefined}
       */
      let statsOptions;
      if (typeof options.stats !== "undefined") {
        statsOptions = isMultiCompilerMode ? {
          children: /** @type {MultiCompiler} */
          compiler.compilers.map(() => options.stats)
        } : options.stats;
      } else {
        statsOptions = isMultiCompilerMode ? {
          children: /** @type {MultiCompiler} */
          compiler.compilers.map(child => child.options.stats)
        } : /** @type {Compiler} */compiler.options.stats;
      }
      if (isMultiCompilerMode) {
        /** @type {MultiStatsOptions} */
        statsOptions.children = /** @type {MultiStatsOptions} */
        statsOptions.children.map(
        /**
         * @param {StatsOptions} childStatsOptions
         * @return {StatsObjectOptions}
         */
        childStatsOptions => {
          // eslint-disable-next-line no-param-reassign
          childStatsOptions = normalizeStatsOptions(childStatsOptions);
          if (typeof childStatsOptions.colors === "undefined") {
            // eslint-disable-next-line no-param-reassign
            childStatsOptions.colors =
            // eslint-disable-next-line global-require
            (__nccwpck_require__(1221)/* .isColorSupported */ .$O);
          }
          return childStatsOptions;
        });
      } else {
        statsOptions = normalizeStatsOptions( /** @type {StatsOptions} */statsOptions);
        if (typeof statsOptions.colors === "undefined") {
          // eslint-disable-next-line global-require
          statsOptions.colors = (__nccwpck_require__(1221)/* .isColorSupported */ .$O);
        }
      }
      const printedStats = stats.toString( /** @type {StatsObjectOptions} */statsOptions);

      // Avoid extra empty line when `stats: 'none'`
      if (printedStats) {
        // eslint-disable-next-line no-console
        console.log(printedStats);
      }

      // eslint-disable-next-line no-param-reassign
      context.callbacks = [];

      // Execute callback that are delayed
      callbacks.forEach(
      /**
       * @param {(...args: any[]) => Stats | MultiStats} callback
       */
      callback => {
        callback(stats);
      });
    });
  }

  // eslint-disable-next-line prefer-destructuring
  const compiler = /** @type {import("../index.js").Context<Request, Response>} */
  context.compiler;
  compiler.hooks.watchRun.tap("webpack-dev-middleware", invalid);
  compiler.hooks.invalid.tap("webpack-dev-middleware", invalid);
  compiler.hooks.done.tap("webpack-dev-middleware", done);
}
module.exports = setupHooks;

/***/ }),

/***/ 6201:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const memfs = __nccwpck_require__(1664);

/** @typedef {import("webpack").MultiCompiler} MultiCompiler */
/** @typedef {import("../index.js").IncomingMessage} IncomingMessage */
/** @typedef {import("../index.js").ServerResponse} ServerResponse */

/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @param {import("../index.js").WithOptional<import("../index.js").Context<Request, Response>, "watching" | "outputFileSystem">} context
 */
function setupOutputFileSystem(context) {
  let outputFileSystem;
  if (context.options.outputFileSystem) {
    const {
      outputFileSystem: outputFileSystemFromOptions
    } = context.options;
    outputFileSystem = outputFileSystemFromOptions;
  }
  // Don't use `memfs` when developer wants to write everything to a disk, because it doesn't make sense.
  else if (context.options.writeToDisk !== true) {
    outputFileSystem = memfs.createFsFromVolume(new memfs.Volume());
  } else {
    const isMultiCompiler = /** @type {MultiCompiler} */
    context.compiler.compilers;
    if (isMultiCompiler) {
      // Prefer compiler with `devServer` option or fallback on the first
      // TODO we need to support webpack-dev-server as a plugin or revisit it
      const compiler = /** @type {MultiCompiler} */
      context.compiler.compilers.filter(item => Object.prototype.hasOwnProperty.call(item.options, "devServer"));
      ({
        outputFileSystem
      } = compiler[0] || /** @type {MultiCompiler} */
      context.compiler.compilers[0]);
    } else {
      ({
        outputFileSystem
      } = context.compiler);
    }
  }
  const compilers = /** @type {MultiCompiler} */
  context.compiler.compilers || [context.compiler];
  for (const compiler of compilers) {
    // @ts-ignore
    compiler.outputFileSystem = outputFileSystem;
  }

  // @ts-ignore
  // eslint-disable-next-line no-param-reassign
  context.outputFileSystem = outputFileSystem;
}
module.exports = setupOutputFileSystem;

/***/ }),

/***/ 4205:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const fs = __nccwpck_require__(7147);
const path = __nccwpck_require__(1017);

/** @typedef {import("webpack").Compiler} Compiler */
/** @typedef {import("webpack").MultiCompiler} MultiCompiler */
/** @typedef {import("webpack").Compilation} Compilation */
/** @typedef {import("../index.js").IncomingMessage} IncomingMessage */
/** @typedef {import("../index.js").ServerResponse} ServerResponse */

/**
 * @template {IncomingMessage} Request
 * @template {ServerResponse} Response
 * @param {import("../index.js").WithOptional<import("../index.js").Context<Request, Response>, "watching" | "outputFileSystem">} context
 */
function setupWriteToDisk(context) {
  /**
   * @type {Compiler[]}
   */
  const compilers = /** @type {MultiCompiler} */
  context.compiler.compilers || [context.compiler];
  for (const compiler of compilers) {
    compiler.hooks.emit.tap("DevMiddleware", () => {
      // @ts-ignore
      if (compiler.hasWebpackDevMiddlewareAssetEmittedCallback) {
        return;
      }
      compiler.hooks.assetEmitted.tapAsync("DevMiddleware", (file, info, callback) => {
        const {
          targetPath,
          content
        } = info;
        const {
          writeToDisk: filter
        } = context.options;
        const allowWrite = filter && typeof filter === "function" ? filter(targetPath) : true;
        if (!allowWrite) {
          return callback();
        }
        const dir = path.dirname(targetPath);
        const name = compiler.options.name ? `Child "${compiler.options.name}": ` : "";
        return fs.mkdir(dir, {
          recursive: true
        }, mkdirError => {
          if (mkdirError) {
            context.logger.error(`${name}Unable to write "${dir}" directory to disk:\n${mkdirError}`);
            return callback(mkdirError);
          }
          return fs.writeFile(targetPath, content, writeFileError => {
            if (writeFileError) {
              context.logger.error(`${name}Unable to write "${targetPath}" asset to disk:\n${writeFileError}`);
              return callback(writeFileError);
            }
            context.logger.log(`${name}Asset written to disk: "${targetPath}"`);
            return callback();
          });
        });
      });

      // @ts-ignore
      compiler.hasWebpackDevMiddlewareAssetEmittedCallback = true;
    });
  }
}
module.exports = setupWriteToDisk;

/***/ }),

/***/ 5014:
/***/ ((module) => {

module.exports = require("./schema-utils");

/***/ }),

/***/ 4031:
/***/ ((module) => {

module.exports = require("@rsbuild/shared/mime-types");

/***/ }),

/***/ 9491:
/***/ ((module) => {

module.exports = require("assert");

/***/ }),

/***/ 852:
/***/ ((module) => {

module.exports = require("async_hooks");

/***/ }),

/***/ 4300:
/***/ ((module) => {

module.exports = require("buffer");

/***/ }),

/***/ 6113:
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ 2361:
/***/ ((module) => {

module.exports = require("events");

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 7282:
/***/ ((module) => {

module.exports = require("process");

/***/ }),

/***/ 3477:
/***/ ((module) => {

module.exports = require("querystring");

/***/ }),

/***/ 2781:
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ 6224:
/***/ ((module) => {

module.exports = require("tty");

/***/ }),

/***/ 7310:
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ 3837:
/***/ ((module) => {

module.exports = require("util");

/***/ }),

/***/ 1221:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

var __webpack_unused_export__;


__webpack_unused_export__ = ({ value: true });

var tty = __nccwpck_require__(6224);

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var tty__namespace = /*#__PURE__*/_interopNamespace(tty);

const {
  env = {},
  argv = [],
  platform = "",
} = typeof process === "undefined" ? {} : process;

const isDisabled = "NO_COLOR" in env || argv.includes("--no-color");
const isForced = "FORCE_COLOR" in env || argv.includes("--color");
const isWindows = platform === "win32";
const isDumbTerminal = env.TERM === "dumb";

const isCompatibleTerminal =
  tty__namespace && tty__namespace.isatty && tty__namespace.isatty(1) && env.TERM && !isDumbTerminal;

const isCI =
  "CI" in env &&
  ("GITHUB_ACTIONS" in env || "GITLAB_CI" in env || "CIRCLECI" in env);

const isColorSupported =
  !isDisabled &&
  (isForced || (isWindows && !isDumbTerminal) || isCompatibleTerminal || isCI);

const replaceClose = (
  index,
  string,
  close,
  replace,
  head = string.substring(0, index) + replace,
  tail = string.substring(index + close.length),
  next = tail.indexOf(close)
) => head + (next < 0 ? tail : replaceClose(next, tail, close, replace));

const clearBleed = (index, string, open, close, replace) =>
  index < 0
    ? open + string + close
    : open + replaceClose(index, string, close, replace) + close;

const filterEmpty =
  (open, close, replace = open, at = open.length + 1) =>
  (string) =>
    string || !(string === "" || string === undefined)
      ? clearBleed(
          ("" + string).indexOf(close, at),
          string,
          open,
          close,
          replace
        )
      : "";

const init = (open, close, replace) =>
  filterEmpty(`\x1b[${open}m`, `\x1b[${close}m`, replace);

const colors = {
  reset: init(0, 0),
  bold: init(1, 22, "\x1b[22m\x1b[1m"),
  dim: init(2, 22, "\x1b[22m\x1b[2m"),
  italic: init(3, 23),
  underline: init(4, 24),
  inverse: init(7, 27),
  hidden: init(8, 28),
  strikethrough: init(9, 29),
  black: init(30, 39),
  red: init(31, 39),
  green: init(32, 39),
  yellow: init(33, 39),
  blue: init(34, 39),
  magenta: init(35, 39),
  cyan: init(36, 39),
  white: init(37, 39),
  gray: init(90, 39),
  bgBlack: init(40, 49),
  bgRed: init(41, 49),
  bgGreen: init(42, 49),
  bgYellow: init(43, 49),
  bgBlue: init(44, 49),
  bgMagenta: init(45, 49),
  bgCyan: init(46, 49),
  bgWhite: init(47, 49),
  blackBright: init(90, 39),
  redBright: init(91, 39),
  greenBright: init(92, 39),
  yellowBright: init(93, 39),
  blueBright: init(94, 39),
  magentaBright: init(95, 39),
  cyanBright: init(96, 39),
  whiteBright: init(97, 39),
  bgBlackBright: init(100, 49),
  bgRedBright: init(101, 49),
  bgGreenBright: init(102, 49),
  bgYellowBright: init(103, 49),
  bgBlueBright: init(104, 49),
  bgMagentaBright: init(105, 49),
  bgCyanBright: init(106, 49),
  bgWhiteBright: init(107, 49),
};

const createColors = ({ useColor = isColorSupported } = {}) =>
  useColor
    ? colors
    : Object.keys(colors).reduce(
        (colors, key) => ({ ...colors, [key]: String }),
        {}
      );

const {
  reset,
  bold,
  dim,
  italic,
  underline,
  inverse,
  hidden,
  strikethrough,
  black,
  red,
  green,
  yellow,
  blue,
  magenta,
  cyan,
  white,
  gray,
  bgBlack,
  bgRed,
  bgGreen,
  bgYellow,
  bgBlue,
  bgMagenta,
  bgCyan,
  bgWhite,
  blackBright,
  redBright,
  greenBright,
  yellowBright,
  blueBright,
  magentaBright,
  cyanBright,
  whiteBright,
  bgBlackBright,
  bgRedBright,
  bgGreenBright,
  bgYellowBright,
  bgBlueBright,
  bgMagentaBright,
  bgCyanBright,
  bgWhiteBright,
} = createColors();

__webpack_unused_export__ = bgBlack;
__webpack_unused_export__ = bgBlackBright;
__webpack_unused_export__ = bgBlue;
__webpack_unused_export__ = bgBlueBright;
__webpack_unused_export__ = bgCyan;
__webpack_unused_export__ = bgCyanBright;
__webpack_unused_export__ = bgGreen;
__webpack_unused_export__ = bgGreenBright;
__webpack_unused_export__ = bgMagenta;
__webpack_unused_export__ = bgMagentaBright;
__webpack_unused_export__ = bgRed;
__webpack_unused_export__ = bgRedBright;
__webpack_unused_export__ = bgWhite;
__webpack_unused_export__ = bgWhiteBright;
__webpack_unused_export__ = bgYellow;
__webpack_unused_export__ = bgYellowBright;
__webpack_unused_export__ = black;
__webpack_unused_export__ = blackBright;
__webpack_unused_export__ = blue;
__webpack_unused_export__ = blueBright;
__webpack_unused_export__ = bold;
__webpack_unused_export__ = createColors;
__webpack_unused_export__ = cyan;
__webpack_unused_export__ = cyanBright;
__webpack_unused_export__ = dim;
__webpack_unused_export__ = gray;
__webpack_unused_export__ = green;
__webpack_unused_export__ = greenBright;
__webpack_unused_export__ = hidden;
__webpack_unused_export__ = inverse;
exports.$O = isColorSupported;
__webpack_unused_export__ = italic;
__webpack_unused_export__ = magenta;
__webpack_unused_export__ = magentaBright;
__webpack_unused_export__ = red;
__webpack_unused_export__ = redBright;
__webpack_unused_export__ = reset;
__webpack_unused_export__ = strikethrough;
__webpack_unused_export__ = underline;
__webpack_unused_export__ = white;
__webpack_unused_export__ = whiteBright;
__webpack_unused_export__ = yellow;
__webpack_unused_export__ = yellowBright;


/***/ }),

/***/ 5532:
/***/ ((module) => {

module.exports = JSON.parse('{"type":"object","properties":{"mimeTypes":{"description":"Allows a user to register custom mime types or extension mappings.","link":"https://github.com/webpack/webpack-dev-middleware#mimetypes","type":"object"},"mimeTypeDefault":{"description":"Allows a user to register a default mime type when we can\'t determine the content type.","link":"https://github.com/webpack/webpack-dev-middleware#mimetypedefault","type":"string"},"writeToDisk":{"description":"Allows to write generated files on disk.","link":"https://github.com/webpack/webpack-dev-middleware#writetodisk","anyOf":[{"type":"boolean"},{"instanceof":"Function"}]},"methods":{"description":"Allows to pass the list of HTTP request methods accepted by the middleware.","link":"https://github.com/webpack/webpack-dev-middleware#methods","type":"array","items":{"type":"string","minLength":1}},"headers":{"anyOf":[{"type":"array","items":{"type":"object","additionalProperties":false,"properties":{"key":{"description":"key of header.","type":"string"},"value":{"description":"value of header.","type":"string"}}},"minItems":1},{"type":"object"},{"instanceof":"Function"}],"description":"Allows to pass custom HTTP headers on each request","link":"https://github.com/webpack/webpack-dev-middleware#headers"},"publicPath":{"description":"The `publicPath` specifies the public URL address of the output files when referenced in a browser.","link":"https://github.com/webpack/webpack-dev-middleware#publicpath","anyOf":[{"enum":["auto"]},{"type":"string"},{"instanceof":"Function"}]},"stats":{"description":"Stats options object or preset name.","link":"https://github.com/webpack/webpack-dev-middleware#stats","anyOf":[{"enum":["none","summary","errors-only","errors-warnings","minimal","normal","detailed","verbose"]},{"type":"boolean"},{"type":"object","additionalProperties":true}]},"serverSideRender":{"description":"Instructs the module to enable or disable the server-side rendering mode.","link":"https://github.com/webpack/webpack-dev-middleware#serversiderender","type":"boolean"},"outputFileSystem":{"description":"Set the default file system which will be used by webpack as primary destination of generated files.","link":"https://github.com/webpack/webpack-dev-middleware#outputfilesystem","type":"object"},"index":{"description":"Allows to serve an index of the directory.","link":"https://github.com/webpack/webpack-dev-middleware#index","anyOf":[{"type":"boolean"},{"type":"string","minLength":1}]},"modifyResponseData":{"description":"Allows to set up a callback to change the response data.","link":"https://github.com/webpack/webpack-dev-middleware#modifyresponsedata","instanceof":"Function"},"etag":{"description":"Enable or disable etag generation.","link":"https://github.com/webpack/webpack-dev-middleware#etag","enum":["weak","strong"]},"lastModified":{"description":"Enable or disable `Last-Modified` header. Uses the file system\'s last modified value.","link":"https://github.com/webpack/webpack-dev-middleware#lastmodified","type":"boolean"}},"additionalProperties":false}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(299);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;