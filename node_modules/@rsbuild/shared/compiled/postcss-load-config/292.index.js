"use strict";
exports.id = 292;
exports.ids = [292];
exports.modules = {

/***/ 999:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/npm/node.ts
var node_exports = {};
__export(node_exports, {
  analyzeMetafile: () => analyzeMetafile,
  analyzeMetafileSync: () => analyzeMetafileSync,
  build: () => build,
  buildSync: () => buildSync,
  context: () => context,
  default: () => node_default,
  formatMessages: () => formatMessages,
  formatMessagesSync: () => formatMessagesSync,
  initialize: () => initialize,
  stop: () => stop,
  transform: () => transform,
  transformSync: () => transformSync,
  version: () => version
});
module.exports = __toCommonJS(node_exports);

// lib/shared/stdio_protocol.ts
function encodePacket(packet) {
  let visit = (value) => {
    if (value === null) {
      bb.write8(0);
    } else if (typeof value === "boolean") {
      bb.write8(1);
      bb.write8(+value);
    } else if (typeof value === "number") {
      bb.write8(2);
      bb.write32(value | 0);
    } else if (typeof value === "string") {
      bb.write8(3);
      bb.write(encodeUTF8(value));
    } else if (value instanceof Uint8Array) {
      bb.write8(4);
      bb.write(value);
    } else if (value instanceof Array) {
      bb.write8(5);
      bb.write32(value.length);
      for (let item of value) {
        visit(item);
      }
    } else {
      let keys = Object.keys(value);
      bb.write8(6);
      bb.write32(keys.length);
      for (let key of keys) {
        bb.write(encodeUTF8(key));
        visit(value[key]);
      }
    }
  };
  let bb = new ByteBuffer();
  bb.write32(0);
  bb.write32(packet.id << 1 | +!packet.isRequest);
  visit(packet.value);
  writeUInt32LE(bb.buf, bb.len - 4, 0);
  return bb.buf.subarray(0, bb.len);
}
function decodePacket(bytes) {
  let visit = () => {
    switch (bb.read8()) {
      case 0:
        return null;
      case 1:
        return !!bb.read8();
      case 2:
        return bb.read32();
      case 3:
        return decodeUTF8(bb.read());
      case 4:
        return bb.read();
      case 5: {
        let count = bb.read32();
        let value2 = [];
        for (let i = 0; i < count; i++) {
          value2.push(visit());
        }
        return value2;
      }
      case 6: {
        let count = bb.read32();
        let value2 = {};
        for (let i = 0; i < count; i++) {
          value2[decodeUTF8(bb.read())] = visit();
        }
        return value2;
      }
      default:
        throw new Error("Invalid packet");
    }
  };
  let bb = new ByteBuffer(bytes);
  let id = bb.read32();
  let isRequest = (id & 1) === 0;
  id >>>= 1;
  let value = visit();
  if (bb.ptr !== bytes.length) {
    throw new Error("Invalid packet");
  }
  return { id, isRequest, value };
}
var ByteBuffer = class {
  constructor(buf = new Uint8Array(1024)) {
    this.buf = buf;
    this.len = 0;
    this.ptr = 0;
  }
  _write(delta) {
    if (this.len + delta > this.buf.length) {
      let clone = new Uint8Array((this.len + delta) * 2);
      clone.set(this.buf);
      this.buf = clone;
    }
    this.len += delta;
    return this.len - delta;
  }
  write8(value) {
    let offset = this._write(1);
    this.buf[offset] = value;
  }
  write32(value) {
    let offset = this._write(4);
    writeUInt32LE(this.buf, value, offset);
  }
  write(bytes) {
    let offset = this._write(4 + bytes.length);
    writeUInt32LE(this.buf, bytes.length, offset);
    this.buf.set(bytes, offset + 4);
  }
  _read(delta) {
    if (this.ptr + delta > this.buf.length) {
      throw new Error("Invalid packet");
    }
    this.ptr += delta;
    return this.ptr - delta;
  }
  read8() {
    return this.buf[this._read(1)];
  }
  read32() {
    return readUInt32LE(this.buf, this._read(4));
  }
  read() {
    let length = this.read32();
    let bytes = new Uint8Array(length);
    let ptr = this._read(bytes.length);
    bytes.set(this.buf.subarray(ptr, ptr + length));
    return bytes;
  }
};
var encodeUTF8;
var decodeUTF8;
var encodeInvariant;
if (typeof TextEncoder !== "undefined" && typeof TextDecoder !== "undefined") {
  let encoder = new TextEncoder();
  let decoder = new TextDecoder();
  encodeUTF8 = (text) => encoder.encode(text);
  decodeUTF8 = (bytes) => decoder.decode(bytes);
  encodeInvariant = 'new TextEncoder().encode("")';
} else if (typeof Buffer !== "undefined") {
  encodeUTF8 = (text) => Buffer.from(text);
  decodeUTF8 = (bytes) => {
    let { buffer, byteOffset, byteLength } = bytes;
    return Buffer.from(buffer, byteOffset, byteLength).toString();
  };
  encodeInvariant = 'Buffer.from("")';
} else {
  throw new Error("No UTF-8 codec found");
}
if (!(encodeUTF8("") instanceof Uint8Array))
  throw new Error(`Invariant violation: "${encodeInvariant} instanceof Uint8Array" is incorrectly false

This indicates that your JavaScript environment is broken. You cannot use
esbuild in this environment because esbuild relies on this invariant. This
is not a problem with esbuild. You need to fix your environment instead.
`);
function readUInt32LE(buffer, offset) {
  return buffer[offset++] | buffer[offset++] << 8 | buffer[offset++] << 16 | buffer[offset++] << 24;
}
function writeUInt32LE(buffer, value, offset) {
  buffer[offset++] = value;
  buffer[offset++] = value >> 8;
  buffer[offset++] = value >> 16;
  buffer[offset++] = value >> 24;
}

// lib/shared/common.ts
var quote = JSON.stringify;
var buildLogLevelDefault = "warning";
var transformLogLevelDefault = "silent";
function validateTarget(target) {
  validateStringValue(target, "target");
  if (target.indexOf(",") >= 0)
    throw new Error(`Invalid target: ${target}`);
  return target;
}
var canBeAnything = () => null;
var mustBeBoolean = (value) => typeof value === "boolean" ? null : "a boolean";
var mustBeString = (value) => typeof value === "string" ? null : "a string";
var mustBeRegExp = (value) => value instanceof RegExp ? null : "a RegExp object";
var mustBeInteger = (value) => typeof value === "number" && value === (value | 0) ? null : "an integer";
var mustBeFunction = (value) => typeof value === "function" ? null : "a function";
var mustBeArray = (value) => Array.isArray(value) ? null : "an array";
var mustBeObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value) ? null : "an object";
var mustBeEntryPoints = (value) => typeof value === "object" && value !== null ? null : "an array or an object";
var mustBeWebAssemblyModule = (value) => value instanceof WebAssembly.Module ? null : "a WebAssembly.Module";
var mustBeObjectOrNull = (value) => typeof value === "object" && !Array.isArray(value) ? null : "an object or null";
var mustBeStringOrBoolean = (value) => typeof value === "string" || typeof value === "boolean" ? null : "a string or a boolean";
var mustBeStringOrObject = (value) => typeof value === "string" || typeof value === "object" && value !== null && !Array.isArray(value) ? null : "a string or an object";
var mustBeStringOrArray = (value) => typeof value === "string" || Array.isArray(value) ? null : "a string or an array";
var mustBeStringOrUint8Array = (value) => typeof value === "string" || value instanceof Uint8Array ? null : "a string or a Uint8Array";
var mustBeStringOrURL = (value) => typeof value === "string" || value instanceof URL ? null : "a string or a URL";
function getFlag(object, keys, key, mustBeFn) {
  let value = object[key];
  keys[key + ""] = true;
  if (value === void 0)
    return void 0;
  let mustBe = mustBeFn(value);
  if (mustBe !== null)
    throw new Error(`${quote(key)} must be ${mustBe}`);
  return value;
}
function checkForInvalidFlags(object, keys, where) {
  for (let key in object) {
    if (!(key in keys)) {
      throw new Error(`Invalid option ${where}: ${quote(key)}`);
    }
  }
}
function validateInitializeOptions(options) {
  let keys = /* @__PURE__ */ Object.create(null);
  let wasmURL = getFlag(options, keys, "wasmURL", mustBeStringOrURL);
  let wasmModule = getFlag(options, keys, "wasmModule", mustBeWebAssemblyModule);
  let worker = getFlag(options, keys, "worker", mustBeBoolean);
  checkForInvalidFlags(options, keys, "in initialize() call");
  return {
    wasmURL,
    wasmModule,
    worker
  };
}
function validateMangleCache(mangleCache) {
  let validated;
  if (mangleCache !== void 0) {
    validated = /* @__PURE__ */ Object.create(null);
    for (let key in mangleCache) {
      let value = mangleCache[key];
      if (typeof value === "string" || value === false) {
        validated[key] = value;
      } else {
        throw new Error(`Expected ${quote(key)} in mangle cache to map to either a string or false`);
      }
    }
  }
  return validated;
}
function pushLogFlags(flags, options, keys, isTTY2, logLevelDefault) {
  let color = getFlag(options, keys, "color", mustBeBoolean);
  let logLevel = getFlag(options, keys, "logLevel", mustBeString);
  let logLimit = getFlag(options, keys, "logLimit", mustBeInteger);
  if (color !== void 0)
    flags.push(`--color=${color}`);
  else if (isTTY2)
    flags.push(`--color=true`);
  flags.push(`--log-level=${logLevel || logLevelDefault}`);
  flags.push(`--log-limit=${logLimit || 0}`);
}
function validateStringValue(value, what, key) {
  if (typeof value !== "string") {
    throw new Error(`Expected value for ${what}${key !== void 0 ? " " + quote(key) : ""} to be a string, got ${typeof value} instead`);
  }
  return value;
}
function pushCommonFlags(flags, options, keys) {
  let legalComments = getFlag(options, keys, "legalComments", mustBeString);
  let sourceRoot = getFlag(options, keys, "sourceRoot", mustBeString);
  let sourcesContent = getFlag(options, keys, "sourcesContent", mustBeBoolean);
  let target = getFlag(options, keys, "target", mustBeStringOrArray);
  let format = getFlag(options, keys, "format", mustBeString);
  let globalName = getFlag(options, keys, "globalName", mustBeString);
  let mangleProps = getFlag(options, keys, "mangleProps", mustBeRegExp);
  let reserveProps = getFlag(options, keys, "reserveProps", mustBeRegExp);
  let mangleQuoted = getFlag(options, keys, "mangleQuoted", mustBeBoolean);
  let minify = getFlag(options, keys, "minify", mustBeBoolean);
  let minifySyntax = getFlag(options, keys, "minifySyntax", mustBeBoolean);
  let minifyWhitespace = getFlag(options, keys, "minifyWhitespace", mustBeBoolean);
  let minifyIdentifiers = getFlag(options, keys, "minifyIdentifiers", mustBeBoolean);
  let lineLimit = getFlag(options, keys, "lineLimit", mustBeInteger);
  let drop = getFlag(options, keys, "drop", mustBeArray);
  let dropLabels = getFlag(options, keys, "dropLabels", mustBeArray);
  let charset = getFlag(options, keys, "charset", mustBeString);
  let treeShaking = getFlag(options, keys, "treeShaking", mustBeBoolean);
  let ignoreAnnotations = getFlag(options, keys, "ignoreAnnotations", mustBeBoolean);
  let jsx = getFlag(options, keys, "jsx", mustBeString);
  let jsxFactory = getFlag(options, keys, "jsxFactory", mustBeString);
  let jsxFragment = getFlag(options, keys, "jsxFragment", mustBeString);
  let jsxImportSource = getFlag(options, keys, "jsxImportSource", mustBeString);
  let jsxDev = getFlag(options, keys, "jsxDev", mustBeBoolean);
  let jsxSideEffects = getFlag(options, keys, "jsxSideEffects", mustBeBoolean);
  let define = getFlag(options, keys, "define", mustBeObject);
  let logOverride = getFlag(options, keys, "logOverride", mustBeObject);
  let supported = getFlag(options, keys, "supported", mustBeObject);
  let pure = getFlag(options, keys, "pure", mustBeArray);
  let keepNames = getFlag(options, keys, "keepNames", mustBeBoolean);
  let platform = getFlag(options, keys, "platform", mustBeString);
  let tsconfigRaw = getFlag(options, keys, "tsconfigRaw", mustBeStringOrObject);
  if (legalComments)
    flags.push(`--legal-comments=${legalComments}`);
  if (sourceRoot !== void 0)
    flags.push(`--source-root=${sourceRoot}`);
  if (sourcesContent !== void 0)
    flags.push(`--sources-content=${sourcesContent}`);
  if (target) {
    if (Array.isArray(target))
      flags.push(`--target=${Array.from(target).map(validateTarget).join(",")}`);
    else
      flags.push(`--target=${validateTarget(target)}`);
  }
  if (format)
    flags.push(`--format=${format}`);
  if (globalName)
    flags.push(`--global-name=${globalName}`);
  if (platform)
    flags.push(`--platform=${platform}`);
  if (tsconfigRaw)
    flags.push(`--tsconfig-raw=${typeof tsconfigRaw === "string" ? tsconfigRaw : JSON.stringify(tsconfigRaw)}`);
  if (minify)
    flags.push("--minify");
  if (minifySyntax)
    flags.push("--minify-syntax");
  if (minifyWhitespace)
    flags.push("--minify-whitespace");
  if (minifyIdentifiers)
    flags.push("--minify-identifiers");
  if (lineLimit)
    flags.push(`--line-limit=${lineLimit}`);
  if (charset)
    flags.push(`--charset=${charset}`);
  if (treeShaking !== void 0)
    flags.push(`--tree-shaking=${treeShaking}`);
  if (ignoreAnnotations)
    flags.push(`--ignore-annotations`);
  if (drop)
    for (let what of drop)
      flags.push(`--drop:${validateStringValue(what, "drop")}`);
  if (dropLabels)
    flags.push(`--drop-labels=${Array.from(dropLabels).map((what) => validateStringValue(what, "dropLabels")).join(",")}`);
  if (mangleProps)
    flags.push(`--mangle-props=${mangleProps.source}`);
  if (reserveProps)
    flags.push(`--reserve-props=${reserveProps.source}`);
  if (mangleQuoted !== void 0)
    flags.push(`--mangle-quoted=${mangleQuoted}`);
  if (jsx)
    flags.push(`--jsx=${jsx}`);
  if (jsxFactory)
    flags.push(`--jsx-factory=${jsxFactory}`);
  if (jsxFragment)
    flags.push(`--jsx-fragment=${jsxFragment}`);
  if (jsxImportSource)
    flags.push(`--jsx-import-source=${jsxImportSource}`);
  if (jsxDev)
    flags.push(`--jsx-dev`);
  if (jsxSideEffects)
    flags.push(`--jsx-side-effects`);
  if (define) {
    for (let key in define) {
      if (key.indexOf("=") >= 0)
        throw new Error(`Invalid define: ${key}`);
      flags.push(`--define:${key}=${validateStringValue(define[key], "define", key)}`);
    }
  }
  if (logOverride) {
    for (let key in logOverride) {
      if (key.indexOf("=") >= 0)
        throw new Error(`Invalid log override: ${key}`);
      flags.push(`--log-override:${key}=${validateStringValue(logOverride[key], "log override", key)}`);
    }
  }
  if (supported) {
    for (let key in supported) {
      if (key.indexOf("=") >= 0)
        throw new Error(`Invalid supported: ${key}`);
      const value = supported[key];
      if (typeof value !== "boolean")
        throw new Error(`Expected value for supported ${quote(key)} to be a boolean, got ${typeof value} instead`);
      flags.push(`--supported:${key}=${value}`);
    }
  }
  if (pure)
    for (let fn of pure)
      flags.push(`--pure:${validateStringValue(fn, "pure")}`);
  if (keepNames)
    flags.push(`--keep-names`);
}
function flagsForBuildOptions(callName, options, isTTY2, logLevelDefault, writeDefault) {
  var _a2;
  let flags = [];
  let entries = [];
  let keys = /* @__PURE__ */ Object.create(null);
  let stdinContents = null;
  let stdinResolveDir = null;
  pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
  pushCommonFlags(flags, options, keys);
  let sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
  let bundle = getFlag(options, keys, "bundle", mustBeBoolean);
  let splitting = getFlag(options, keys, "splitting", mustBeBoolean);
  let preserveSymlinks = getFlag(options, keys, "preserveSymlinks", mustBeBoolean);
  let metafile = getFlag(options, keys, "metafile", mustBeBoolean);
  let outfile = getFlag(options, keys, "outfile", mustBeString);
  let outdir = getFlag(options, keys, "outdir", mustBeString);
  let outbase = getFlag(options, keys, "outbase", mustBeString);
  let tsconfig = getFlag(options, keys, "tsconfig", mustBeString);
  let resolveExtensions = getFlag(options, keys, "resolveExtensions", mustBeArray);
  let nodePathsInput = getFlag(options, keys, "nodePaths", mustBeArray);
  let mainFields = getFlag(options, keys, "mainFields", mustBeArray);
  let conditions = getFlag(options, keys, "conditions", mustBeArray);
  let external = getFlag(options, keys, "external", mustBeArray);
  let packages = getFlag(options, keys, "packages", mustBeString);
  let alias = getFlag(options, keys, "alias", mustBeObject);
  let loader = getFlag(options, keys, "loader", mustBeObject);
  let outExtension = getFlag(options, keys, "outExtension", mustBeObject);
  let publicPath = getFlag(options, keys, "publicPath", mustBeString);
  let entryNames = getFlag(options, keys, "entryNames", mustBeString);
  let chunkNames = getFlag(options, keys, "chunkNames", mustBeString);
  let assetNames = getFlag(options, keys, "assetNames", mustBeString);
  let inject = getFlag(options, keys, "inject", mustBeArray);
  let banner = getFlag(options, keys, "banner", mustBeObject);
  let footer = getFlag(options, keys, "footer", mustBeObject);
  let entryPoints = getFlag(options, keys, "entryPoints", mustBeEntryPoints);
  let absWorkingDir = getFlag(options, keys, "absWorkingDir", mustBeString);
  let stdin = getFlag(options, keys, "stdin", mustBeObject);
  let write = (_a2 = getFlag(options, keys, "write", mustBeBoolean)) != null ? _a2 : writeDefault;
  let allowOverwrite = getFlag(options, keys, "allowOverwrite", mustBeBoolean);
  let mangleCache = getFlag(options, keys, "mangleCache", mustBeObject);
  keys.plugins = true;
  checkForInvalidFlags(options, keys, `in ${callName}() call`);
  if (sourcemap)
    flags.push(`--sourcemap${sourcemap === true ? "" : `=${sourcemap}`}`);
  if (bundle)
    flags.push("--bundle");
  if (allowOverwrite)
    flags.push("--allow-overwrite");
  if (splitting)
    flags.push("--splitting");
  if (preserveSymlinks)
    flags.push("--preserve-symlinks");
  if (metafile)
    flags.push(`--metafile`);
  if (outfile)
    flags.push(`--outfile=${outfile}`);
  if (outdir)
    flags.push(`--outdir=${outdir}`);
  if (outbase)
    flags.push(`--outbase=${outbase}`);
  if (tsconfig)
    flags.push(`--tsconfig=${tsconfig}`);
  if (packages)
    flags.push(`--packages=${packages}`);
  if (resolveExtensions) {
    let values = [];
    for (let value of resolveExtensions) {
      validateStringValue(value, "resolve extension");
      if (value.indexOf(",") >= 0)
        throw new Error(`Invalid resolve extension: ${value}`);
      values.push(value);
    }
    flags.push(`--resolve-extensions=${values.join(",")}`);
  }
  if (publicPath)
    flags.push(`--public-path=${publicPath}`);
  if (entryNames)
    flags.push(`--entry-names=${entryNames}`);
  if (chunkNames)
    flags.push(`--chunk-names=${chunkNames}`);
  if (assetNames)
    flags.push(`--asset-names=${assetNames}`);
  if (mainFields) {
    let values = [];
    for (let value of mainFields) {
      validateStringValue(value, "main field");
      if (value.indexOf(",") >= 0)
        throw new Error(`Invalid main field: ${value}`);
      values.push(value);
    }
    flags.push(`--main-fields=${values.join(",")}`);
  }
  if (conditions) {
    let values = [];
    for (let value of conditions) {
      validateStringValue(value, "condition");
      if (value.indexOf(",") >= 0)
        throw new Error(`Invalid condition: ${value}`);
      values.push(value);
    }
    flags.push(`--conditions=${values.join(",")}`);
  }
  if (external)
    for (let name of external)
      flags.push(`--external:${validateStringValue(name, "external")}`);
  if (alias) {
    for (let old in alias) {
      if (old.indexOf("=") >= 0)
        throw new Error(`Invalid package name in alias: ${old}`);
      flags.push(`--alias:${old}=${validateStringValue(alias[old], "alias", old)}`);
    }
  }
  if (banner) {
    for (let type in banner) {
      if (type.indexOf("=") >= 0)
        throw new Error(`Invalid banner file type: ${type}`);
      flags.push(`--banner:${type}=${validateStringValue(banner[type], "banner", type)}`);
    }
  }
  if (footer) {
    for (let type in footer) {
      if (type.indexOf("=") >= 0)
        throw new Error(`Invalid footer file type: ${type}`);
      flags.push(`--footer:${type}=${validateStringValue(footer[type], "footer", type)}`);
    }
  }
  if (inject)
    for (let path3 of inject)
      flags.push(`--inject:${validateStringValue(path3, "inject")}`);
  if (loader) {
    for (let ext in loader) {
      if (ext.indexOf("=") >= 0)
        throw new Error(`Invalid loader extension: ${ext}`);
      flags.push(`--loader:${ext}=${validateStringValue(loader[ext], "loader", ext)}`);
    }
  }
  if (outExtension) {
    for (let ext in outExtension) {
      if (ext.indexOf("=") >= 0)
        throw new Error(`Invalid out extension: ${ext}`);
      flags.push(`--out-extension:${ext}=${validateStringValue(outExtension[ext], "out extension", ext)}`);
    }
  }
  if (entryPoints) {
    if (Array.isArray(entryPoints)) {
      for (let i = 0, n = entryPoints.length; i < n; i++) {
        let entryPoint = entryPoints[i];
        if (typeof entryPoint === "object" && entryPoint !== null) {
          let entryPointKeys = /* @__PURE__ */ Object.create(null);
          let input = getFlag(entryPoint, entryPointKeys, "in", mustBeString);
          let output = getFlag(entryPoint, entryPointKeys, "out", mustBeString);
          checkForInvalidFlags(entryPoint, entryPointKeys, "in entry point at index " + i);
          if (input === void 0)
            throw new Error('Missing property "in" for entry point at index ' + i);
          if (output === void 0)
            throw new Error('Missing property "out" for entry point at index ' + i);
          entries.push([output, input]);
        } else {
          entries.push(["", validateStringValue(entryPoint, "entry point at index " + i)]);
        }
      }
    } else {
      for (let key in entryPoints) {
        entries.push([key, validateStringValue(entryPoints[key], "entry point", key)]);
      }
    }
  }
  if (stdin) {
    let stdinKeys = /* @__PURE__ */ Object.create(null);
    let contents = getFlag(stdin, stdinKeys, "contents", mustBeStringOrUint8Array);
    let resolveDir = getFlag(stdin, stdinKeys, "resolveDir", mustBeString);
    let sourcefile = getFlag(stdin, stdinKeys, "sourcefile", mustBeString);
    let loader2 = getFlag(stdin, stdinKeys, "loader", mustBeString);
    checkForInvalidFlags(stdin, stdinKeys, 'in "stdin" object');
    if (sourcefile)
      flags.push(`--sourcefile=${sourcefile}`);
    if (loader2)
      flags.push(`--loader=${loader2}`);
    if (resolveDir)
      stdinResolveDir = resolveDir;
    if (typeof contents === "string")
      stdinContents = encodeUTF8(contents);
    else if (contents instanceof Uint8Array)
      stdinContents = contents;
  }
  let nodePaths = [];
  if (nodePathsInput) {
    for (let value of nodePathsInput) {
      value += "";
      nodePaths.push(value);
    }
  }
  return {
    entries,
    flags,
    write,
    stdinContents,
    stdinResolveDir,
    absWorkingDir,
    nodePaths,
    mangleCache: validateMangleCache(mangleCache)
  };
}
function flagsForTransformOptions(callName, options, isTTY2, logLevelDefault) {
  let flags = [];
  let keys = /* @__PURE__ */ Object.create(null);
  pushLogFlags(flags, options, keys, isTTY2, logLevelDefault);
  pushCommonFlags(flags, options, keys);
  let sourcemap = getFlag(options, keys, "sourcemap", mustBeStringOrBoolean);
  let sourcefile = getFlag(options, keys, "sourcefile", mustBeString);
  let loader = getFlag(options, keys, "loader", mustBeString);
  let banner = getFlag(options, keys, "banner", mustBeString);
  let footer = getFlag(options, keys, "footer", mustBeString);
  let mangleCache = getFlag(options, keys, "mangleCache", mustBeObject);
  checkForInvalidFlags(options, keys, `in ${callName}() call`);
  if (sourcemap)
    flags.push(`--sourcemap=${sourcemap === true ? "external" : sourcemap}`);
  if (sourcefile)
    flags.push(`--sourcefile=${sourcefile}`);
  if (loader)
    flags.push(`--loader=${loader}`);
  if (banner)
    flags.push(`--banner=${banner}`);
  if (footer)
    flags.push(`--footer=${footer}`);
  return {
    flags,
    mangleCache: validateMangleCache(mangleCache)
  };
}
function createChannel(streamIn) {
  const requestCallbacksByKey = {};
  const closeData = { didClose: false, reason: "" };
  let responseCallbacks = {};
  let nextRequestID = 0;
  let nextBuildKey = 0;
  let stdout = new Uint8Array(16 * 1024);
  let stdoutUsed = 0;
  let readFromStdout = (chunk) => {
    let limit = stdoutUsed + chunk.length;
    if (limit > stdout.length) {
      let swap = new Uint8Array(limit * 2);
      swap.set(stdout);
      stdout = swap;
    }
    stdout.set(chunk, stdoutUsed);
    stdoutUsed += chunk.length;
    let offset = 0;
    while (offset + 4 <= stdoutUsed) {
      let length = readUInt32LE(stdout, offset);
      if (offset + 4 + length > stdoutUsed) {
        break;
      }
      offset += 4;
      handleIncomingPacket(stdout.subarray(offset, offset + length));
      offset += length;
    }
    if (offset > 0) {
      stdout.copyWithin(0, offset, stdoutUsed);
      stdoutUsed -= offset;
    }
  };
  let afterClose = (error) => {
    closeData.didClose = true;
    if (error)
      closeData.reason = ": " + (error.message || error);
    const text = "The service was stopped" + closeData.reason;
    for (let id in responseCallbacks) {
      responseCallbacks[id](text, null);
    }
    responseCallbacks = {};
  };
  let sendRequest = (refs, value, callback) => {
    if (closeData.didClose)
      return callback("The service is no longer running" + closeData.reason, null);
    let id = nextRequestID++;
    responseCallbacks[id] = (error, response) => {
      try {
        callback(error, response);
      } finally {
        if (refs)
          refs.unref();
      }
    };
    if (refs)
      refs.ref();
    streamIn.writeToStdin(encodePacket({ id, isRequest: true, value }));
  };
  let sendResponse = (id, value) => {
    if (closeData.didClose)
      throw new Error("The service is no longer running" + closeData.reason);
    streamIn.writeToStdin(encodePacket({ id, isRequest: false, value }));
  };
  let handleRequest = async (id, request) => {
    try {
      if (request.command === "ping") {
        sendResponse(id, {});
        return;
      }
      if (typeof request.key === "number") {
        const requestCallbacks = requestCallbacksByKey[request.key];
        if (!requestCallbacks) {
          return;
        }
        const callback = requestCallbacks[request.command];
        if (callback) {
          await callback(id, request);
          return;
        }
      }
      throw new Error(`Invalid command: ` + request.command);
    } catch (e) {
      const errors = [extractErrorMessageV8(e, streamIn, null, void 0, "")];
      try {
        sendResponse(id, { errors });
      } catch {
      }
    }
  };
  let isFirstPacket = true;
  let handleIncomingPacket = (bytes) => {
    if (isFirstPacket) {
      isFirstPacket = false;
      let binaryVersion = String.fromCharCode(...bytes);
      if (binaryVersion !== "0.19.12") {
        throw new Error(`Cannot start service: Host version "${"0.19.12"}" does not match binary version ${quote(binaryVersion)}`);
      }
      return;
    }
    let packet = decodePacket(bytes);
    if (packet.isRequest) {
      handleRequest(packet.id, packet.value);
    } else {
      let callback = responseCallbacks[packet.id];
      delete responseCallbacks[packet.id];
      if (packet.value.error)
        callback(packet.value.error, {});
      else
        callback(null, packet.value);
    }
  };
  let buildOrContext = ({ callName, refs, options, isTTY: isTTY2, defaultWD: defaultWD2, callback }) => {
    let refCount = 0;
    const buildKey = nextBuildKey++;
    const requestCallbacks = {};
    const buildRefs = {
      ref() {
        if (++refCount === 1) {
          if (refs)
            refs.ref();
        }
      },
      unref() {
        if (--refCount === 0) {
          delete requestCallbacksByKey[buildKey];
          if (refs)
            refs.unref();
        }
      }
    };
    requestCallbacksByKey[buildKey] = requestCallbacks;
    buildRefs.ref();
    buildOrContextImpl(
      callName,
      buildKey,
      sendRequest,
      sendResponse,
      buildRefs,
      streamIn,
      requestCallbacks,
      options,
      isTTY2,
      defaultWD2,
      (err, res) => {
        try {
          callback(err, res);
        } finally {
          buildRefs.unref();
        }
      }
    );
  };
  let transform2 = ({ callName, refs, input, options, isTTY: isTTY2, fs: fs3, callback }) => {
    const details = createObjectStash();
    let start = (inputPath) => {
      try {
        if (typeof input !== "string" && !(input instanceof Uint8Array))
          throw new Error('The input to "transform" must be a string or a Uint8Array');
        let {
          flags,
          mangleCache
        } = flagsForTransformOptions(callName, options, isTTY2, transformLogLevelDefault);
        let request = {
          command: "transform",
          flags,
          inputFS: inputPath !== null,
          input: inputPath !== null ? encodeUTF8(inputPath) : typeof input === "string" ? encodeUTF8(input) : input
        };
        if (mangleCache)
          request.mangleCache = mangleCache;
        sendRequest(refs, request, (error, response) => {
          if (error)
            return callback(new Error(error), null);
          let errors = replaceDetailsInMessages(response.errors, details);
          let warnings = replaceDetailsInMessages(response.warnings, details);
          let outstanding = 1;
          let next = () => {
            if (--outstanding === 0) {
              let result = {
                warnings,
                code: response.code,
                map: response.map,
                mangleCache: void 0,
                legalComments: void 0
              };
              if ("legalComments" in response)
                result.legalComments = response == null ? void 0 : response.legalComments;
              if (response.mangleCache)
                result.mangleCache = response == null ? void 0 : response.mangleCache;
              callback(null, result);
            }
          };
          if (errors.length > 0)
            return callback(failureErrorWithLog("Transform failed", errors, warnings), null);
          if (response.codeFS) {
            outstanding++;
            fs3.readFile(response.code, (err, contents) => {
              if (err !== null) {
                callback(err, null);
              } else {
                response.code = contents;
                next();
              }
            });
          }
          if (response.mapFS) {
            outstanding++;
            fs3.readFile(response.map, (err, contents) => {
              if (err !== null) {
                callback(err, null);
              } else {
                response.map = contents;
                next();
              }
            });
          }
          next();
        });
      } catch (e) {
        let flags = [];
        try {
          pushLogFlags(flags, options, {}, isTTY2, transformLogLevelDefault);
        } catch {
        }
        const error = extractErrorMessageV8(e, streamIn, details, void 0, "");
        sendRequest(refs, { command: "error", flags, error }, () => {
          error.detail = details.load(error.detail);
          callback(failureErrorWithLog("Transform failed", [error], []), null);
        });
      }
    };
    if ((typeof input === "string" || input instanceof Uint8Array) && input.length > 1024 * 1024) {
      let next = start;
      start = () => fs3.writeFile(input, next);
    }
    start(null);
  };
  let formatMessages2 = ({ callName, refs, messages, options, callback }) => {
    if (!options)
      throw new Error(`Missing second argument in ${callName}() call`);
    let keys = {};
    let kind = getFlag(options, keys, "kind", mustBeString);
    let color = getFlag(options, keys, "color", mustBeBoolean);
    let terminalWidth = getFlag(options, keys, "terminalWidth", mustBeInteger);
    checkForInvalidFlags(options, keys, `in ${callName}() call`);
    if (kind === void 0)
      throw new Error(`Missing "kind" in ${callName}() call`);
    if (kind !== "error" && kind !== "warning")
      throw new Error(`Expected "kind" to be "error" or "warning" in ${callName}() call`);
    let request = {
      command: "format-msgs",
      messages: sanitizeMessages(messages, "messages", null, "", terminalWidth),
      isWarning: kind === "warning"
    };
    if (color !== void 0)
      request.color = color;
    if (terminalWidth !== void 0)
      request.terminalWidth = terminalWidth;
    sendRequest(refs, request, (error, response) => {
      if (error)
        return callback(new Error(error), null);
      callback(null, response.messages);
    });
  };
  let analyzeMetafile2 = ({ callName, refs, metafile, options, callback }) => {
    if (options === void 0)
      options = {};
    let keys = {};
    let color = getFlag(options, keys, "color", mustBeBoolean);
    let verbose = getFlag(options, keys, "verbose", mustBeBoolean);
    checkForInvalidFlags(options, keys, `in ${callName}() call`);
    let request = {
      command: "analyze-metafile",
      metafile
    };
    if (color !== void 0)
      request.color = color;
    if (verbose !== void 0)
      request.verbose = verbose;
    sendRequest(refs, request, (error, response) => {
      if (error)
        return callback(new Error(error), null);
      callback(null, response.result);
    });
  };
  return {
    readFromStdout,
    afterClose,
    service: {
      buildOrContext,
      transform: transform2,
      formatMessages: formatMessages2,
      analyzeMetafile: analyzeMetafile2
    }
  };
}
function buildOrContextImpl(callName, buildKey, sendRequest, sendResponse, refs, streamIn, requestCallbacks, options, isTTY2, defaultWD2, callback) {
  const details = createObjectStash();
  const isContext = callName === "context";
  const handleError = (e, pluginName) => {
    const flags = [];
    try {
      pushLogFlags(flags, options, {}, isTTY2, buildLogLevelDefault);
    } catch {
    }
    const message = extractErrorMessageV8(e, streamIn, details, void 0, pluginName);
    sendRequest(refs, { command: "error", flags, error: message }, () => {
      message.detail = details.load(message.detail);
      callback(failureErrorWithLog(isContext ? "Context failed" : "Build failed", [message], []), null);
    });
  };
  let plugins;
  if (typeof options === "object") {
    const value = options.plugins;
    if (value !== void 0) {
      if (!Array.isArray(value))
        return handleError(new Error(`"plugins" must be an array`), "");
      plugins = value;
    }
  }
  if (plugins && plugins.length > 0) {
    if (streamIn.isSync)
      return handleError(new Error("Cannot use plugins in synchronous API calls"), "");
    handlePlugins(
      buildKey,
      sendRequest,
      sendResponse,
      refs,
      streamIn,
      requestCallbacks,
      options,
      plugins,
      details
    ).then(
      (result) => {
        if (!result.ok)
          return handleError(result.error, result.pluginName);
        try {
          buildOrContextContinue(result.requestPlugins, result.runOnEndCallbacks, result.scheduleOnDisposeCallbacks);
        } catch (e) {
          handleError(e, "");
        }
      },
      (e) => handleError(e, "")
    );
    return;
  }
  try {
    buildOrContextContinue(null, (result, done) => done([], []), () => {
    });
  } catch (e) {
    handleError(e, "");
  }
  function buildOrContextContinue(requestPlugins, runOnEndCallbacks, scheduleOnDisposeCallbacks) {
    const writeDefault = streamIn.hasFS;
    const {
      entries,
      flags,
      write,
      stdinContents,
      stdinResolveDir,
      absWorkingDir,
      nodePaths,
      mangleCache
    } = flagsForBuildOptions(callName, options, isTTY2, buildLogLevelDefault, writeDefault);
    if (write && !streamIn.hasFS)
      throw new Error(`The "write" option is unavailable in this environment`);
    const request = {
      command: "build",
      key: buildKey,
      entries,
      flags,
      write,
      stdinContents,
      stdinResolveDir,
      absWorkingDir: absWorkingDir || defaultWD2,
      nodePaths,
      context: isContext
    };
    if (requestPlugins)
      request.plugins = requestPlugins;
    if (mangleCache)
      request.mangleCache = mangleCache;
    const buildResponseToResult = (response, callback2) => {
      const result = {
        errors: replaceDetailsInMessages(response.errors, details),
        warnings: replaceDetailsInMessages(response.warnings, details),
        outputFiles: void 0,
        metafile: void 0,
        mangleCache: void 0
      };
      const originalErrors = result.errors.slice();
      const originalWarnings = result.warnings.slice();
      if (response.outputFiles)
        result.outputFiles = response.outputFiles.map(convertOutputFiles);
      if (response.metafile)
        result.metafile = JSON.parse(response.metafile);
      if (response.mangleCache)
        result.mangleCache = response.mangleCache;
      if (response.writeToStdout !== void 0)
        console.log(decodeUTF8(response.writeToStdout).replace(/\n$/, ""));
      runOnEndCallbacks(result, (onEndErrors, onEndWarnings) => {
        if (originalErrors.length > 0 || onEndErrors.length > 0) {
          const error = failureErrorWithLog("Build failed", originalErrors.concat(onEndErrors), originalWarnings.concat(onEndWarnings));
          return callback2(error, null, onEndErrors, onEndWarnings);
        }
        callback2(null, result, onEndErrors, onEndWarnings);
      });
    };
    let latestResultPromise;
    let provideLatestResult;
    if (isContext)
      requestCallbacks["on-end"] = (id, request2) => new Promise((resolve) => {
        buildResponseToResult(request2, (err, result, onEndErrors, onEndWarnings) => {
          const response = {
            errors: onEndErrors,
            warnings: onEndWarnings
          };
          if (provideLatestResult)
            provideLatestResult(err, result);
          latestResultPromise = void 0;
          provideLatestResult = void 0;
          sendResponse(id, response);
          resolve();
        });
      });
    sendRequest(refs, request, (error, response) => {
      if (error)
        return callback(new Error(error), null);
      if (!isContext) {
        return buildResponseToResult(response, (err, res) => {
          scheduleOnDisposeCallbacks();
          return callback(err, res);
        });
      }
      if (response.errors.length > 0) {
        return callback(failureErrorWithLog("Context failed", response.errors, response.warnings), null);
      }
      let didDispose = false;
      const result = {
        rebuild: () => {
          if (!latestResultPromise)
            latestResultPromise = new Promise((resolve, reject) => {
              let settlePromise;
              provideLatestResult = (err, result2) => {
                if (!settlePromise)
                  settlePromise = () => err ? reject(err) : resolve(result2);
              };
              const triggerAnotherBuild = () => {
                const request2 = {
                  command: "rebuild",
                  key: buildKey
                };
                sendRequest(refs, request2, (error2, response2) => {
                  if (error2) {
                    reject(new Error(error2));
                  } else if (settlePromise) {
                    settlePromise();
                  } else {
                    triggerAnotherBuild();
                  }
                });
              };
              triggerAnotherBuild();
            });
          return latestResultPromise;
        },
        watch: (options2 = {}) => new Promise((resolve, reject) => {
          if (!streamIn.hasFS)
            throw new Error(`Cannot use the "watch" API in this environment`);
          const keys = {};
          checkForInvalidFlags(options2, keys, `in watch() call`);
          const request2 = {
            command: "watch",
            key: buildKey
          };
          sendRequest(refs, request2, (error2) => {
            if (error2)
              reject(new Error(error2));
            else
              resolve(void 0);
          });
        }),
        serve: (options2 = {}) => new Promise((resolve, reject) => {
          if (!streamIn.hasFS)
            throw new Error(`Cannot use the "serve" API in this environment`);
          const keys = {};
          const port = getFlag(options2, keys, "port", mustBeInteger);
          const host = getFlag(options2, keys, "host", mustBeString);
          const servedir = getFlag(options2, keys, "servedir", mustBeString);
          const keyfile = getFlag(options2, keys, "keyfile", mustBeString);
          const certfile = getFlag(options2, keys, "certfile", mustBeString);
          const fallback = getFlag(options2, keys, "fallback", mustBeString);
          const onRequest = getFlag(options2, keys, "onRequest", mustBeFunction);
          checkForInvalidFlags(options2, keys, `in serve() call`);
          const request2 = {
            command: "serve",
            key: buildKey,
            onRequest: !!onRequest
          };
          if (port !== void 0)
            request2.port = port;
          if (host !== void 0)
            request2.host = host;
          if (servedir !== void 0)
            request2.servedir = servedir;
          if (keyfile !== void 0)
            request2.keyfile = keyfile;
          if (certfile !== void 0)
            request2.certfile = certfile;
          if (fallback !== void 0)
            request2.fallback = fallback;
          sendRequest(refs, request2, (error2, response2) => {
            if (error2)
              return reject(new Error(error2));
            if (onRequest) {
              requestCallbacks["serve-request"] = (id, request3) => {
                onRequest(request3.args);
                sendResponse(id, {});
              };
            }
            resolve(response2);
          });
        }),
        cancel: () => new Promise((resolve) => {
          if (didDispose)
            return resolve();
          const request2 = {
            command: "cancel",
            key: buildKey
          };
          sendRequest(refs, request2, () => {
            resolve();
          });
        }),
        dispose: () => new Promise((resolve) => {
          if (didDispose)
            return resolve();
          didDispose = true;
          const request2 = {
            command: "dispose",
            key: buildKey
          };
          sendRequest(refs, request2, () => {
            resolve();
            scheduleOnDisposeCallbacks();
            refs.unref();
          });
        })
      };
      refs.ref();
      callback(null, result);
    });
  }
}
var handlePlugins = async (buildKey, sendRequest, sendResponse, refs, streamIn, requestCallbacks, initialOptions, plugins, details) => {
  let onStartCallbacks = [];
  let onEndCallbacks = [];
  let onResolveCallbacks = {};
  let onLoadCallbacks = {};
  let onDisposeCallbacks = [];
  let nextCallbackID = 0;
  let i = 0;
  let requestPlugins = [];
  let isSetupDone = false;
  plugins = [...plugins];
  for (let item of plugins) {
    let keys = {};
    if (typeof item !== "object")
      throw new Error(`Plugin at index ${i} must be an object`);
    const name = getFlag(item, keys, "name", mustBeString);
    if (typeof name !== "string" || name === "")
      throw new Error(`Plugin at index ${i} is missing a name`);
    try {
      let setup = getFlag(item, keys, "setup", mustBeFunction);
      if (typeof setup !== "function")
        throw new Error(`Plugin is missing a setup function`);
      checkForInvalidFlags(item, keys, `on plugin ${quote(name)}`);
      let plugin = {
        name,
        onStart: false,
        onEnd: false,
        onResolve: [],
        onLoad: []
      };
      i++;
      let resolve = (path3, options = {}) => {
        if (!isSetupDone)
          throw new Error('Cannot call "resolve" before plugin setup has completed');
        if (typeof path3 !== "string")
          throw new Error(`The path to resolve must be a string`);
        let keys2 = /* @__PURE__ */ Object.create(null);
        let pluginName = getFlag(options, keys2, "pluginName", mustBeString);
        let importer = getFlag(options, keys2, "importer", mustBeString);
        let namespace = getFlag(options, keys2, "namespace", mustBeString);
        let resolveDir = getFlag(options, keys2, "resolveDir", mustBeString);
        let kind = getFlag(options, keys2, "kind", mustBeString);
        let pluginData = getFlag(options, keys2, "pluginData", canBeAnything);
        checkForInvalidFlags(options, keys2, "in resolve() call");
        return new Promise((resolve2, reject) => {
          const request = {
            command: "resolve",
            path: path3,
            key: buildKey,
            pluginName: name
          };
          if (pluginName != null)
            request.pluginName = pluginName;
          if (importer != null)
            request.importer = importer;
          if (namespace != null)
            request.namespace = namespace;
          if (resolveDir != null)
            request.resolveDir = resolveDir;
          if (kind != null)
            request.kind = kind;
          else
            throw new Error(`Must specify "kind" when calling "resolve"`);
          if (pluginData != null)
            request.pluginData = details.store(pluginData);
          sendRequest(refs, request, (error, response) => {
            if (error !== null)
              reject(new Error(error));
            else
              resolve2({
                errors: replaceDetailsInMessages(response.errors, details),
                warnings: replaceDetailsInMessages(response.warnings, details),
                path: response.path,
                external: response.external,
                sideEffects: response.sideEffects,
                namespace: response.namespace,
                suffix: response.suffix,
                pluginData: details.load(response.pluginData)
              });
          });
        });
      };
      let promise = setup({
        initialOptions,
        resolve,
        onStart(callback) {
          let registeredText = `This error came from the "onStart" callback registered here:`;
          let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onStart");
          onStartCallbacks.push({ name, callback, note: registeredNote });
          plugin.onStart = true;
        },
        onEnd(callback) {
          let registeredText = `This error came from the "onEnd" callback registered here:`;
          let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onEnd");
          onEndCallbacks.push({ name, callback, note: registeredNote });
          plugin.onEnd = true;
        },
        onResolve(options, callback) {
          let registeredText = `This error came from the "onResolve" callback registered here:`;
          let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onResolve");
          let keys2 = {};
          let filter = getFlag(options, keys2, "filter", mustBeRegExp);
          let namespace = getFlag(options, keys2, "namespace", mustBeString);
          checkForInvalidFlags(options, keys2, `in onResolve() call for plugin ${quote(name)}`);
          if (filter == null)
            throw new Error(`onResolve() call is missing a filter`);
          let id = nextCallbackID++;
          onResolveCallbacks[id] = { name, callback, note: registeredNote };
          plugin.onResolve.push({ id, filter: filter.source, namespace: namespace || "" });
        },
        onLoad(options, callback) {
          let registeredText = `This error came from the "onLoad" callback registered here:`;
          let registeredNote = extractCallerV8(new Error(registeredText), streamIn, "onLoad");
          let keys2 = {};
          let filter = getFlag(options, keys2, "filter", mustBeRegExp);
          let namespace = getFlag(options, keys2, "namespace", mustBeString);
          checkForInvalidFlags(options, keys2, `in onLoad() call for plugin ${quote(name)}`);
          if (filter == null)
            throw new Error(`onLoad() call is missing a filter`);
          let id = nextCallbackID++;
          onLoadCallbacks[id] = { name, callback, note: registeredNote };
          plugin.onLoad.push({ id, filter: filter.source, namespace: namespace || "" });
        },
        onDispose(callback) {
          onDisposeCallbacks.push(callback);
        },
        esbuild: streamIn.esbuild
      });
      if (promise)
        await promise;
      requestPlugins.push(plugin);
    } catch (e) {
      return { ok: false, error: e, pluginName: name };
    }
  }
  requestCallbacks["on-start"] = async (id, request) => {
    let response = { errors: [], warnings: [] };
    await Promise.all(onStartCallbacks.map(async ({ name, callback, note }) => {
      try {
        let result = await callback();
        if (result != null) {
          if (typeof result !== "object")
            throw new Error(`Expected onStart() callback in plugin ${quote(name)} to return an object`);
          let keys = {};
          let errors = getFlag(result, keys, "errors", mustBeArray);
          let warnings = getFlag(result, keys, "warnings", mustBeArray);
          checkForInvalidFlags(result, keys, `from onStart() callback in plugin ${quote(name)}`);
          if (errors != null)
            response.errors.push(...sanitizeMessages(errors, "errors", details, name, void 0));
          if (warnings != null)
            response.warnings.push(...sanitizeMessages(warnings, "warnings", details, name, void 0));
        }
      } catch (e) {
        response.errors.push(extractErrorMessageV8(e, streamIn, details, note && note(), name));
      }
    }));
    sendResponse(id, response);
  };
  requestCallbacks["on-resolve"] = async (id, request) => {
    let response = {}, name = "", callback, note;
    for (let id2 of request.ids) {
      try {
        ({ name, callback, note } = onResolveCallbacks[id2]);
        let result = await callback({
          path: request.path,
          importer: request.importer,
          namespace: request.namespace,
          resolveDir: request.resolveDir,
          kind: request.kind,
          pluginData: details.load(request.pluginData)
        });
        if (result != null) {
          if (typeof result !== "object")
            throw new Error(`Expected onResolve() callback in plugin ${quote(name)} to return an object`);
          let keys = {};
          let pluginName = getFlag(result, keys, "pluginName", mustBeString);
          let path3 = getFlag(result, keys, "path", mustBeString);
          let namespace = getFlag(result, keys, "namespace", mustBeString);
          let suffix = getFlag(result, keys, "suffix", mustBeString);
          let external = getFlag(result, keys, "external", mustBeBoolean);
          let sideEffects = getFlag(result, keys, "sideEffects", mustBeBoolean);
          let pluginData = getFlag(result, keys, "pluginData", canBeAnything);
          let errors = getFlag(result, keys, "errors", mustBeArray);
          let warnings = getFlag(result, keys, "warnings", mustBeArray);
          let watchFiles = getFlag(result, keys, "watchFiles", mustBeArray);
          let watchDirs = getFlag(result, keys, "watchDirs", mustBeArray);
          checkForInvalidFlags(result, keys, `from onResolve() callback in plugin ${quote(name)}`);
          response.id = id2;
          if (pluginName != null)
            response.pluginName = pluginName;
          if (path3 != null)
            response.path = path3;
          if (namespace != null)
            response.namespace = namespace;
          if (suffix != null)
            response.suffix = suffix;
          if (external != null)
            response.external = external;
          if (sideEffects != null)
            response.sideEffects = sideEffects;
          if (pluginData != null)
            response.pluginData = details.store(pluginData);
          if (errors != null)
            response.errors = sanitizeMessages(errors, "errors", details, name, void 0);
          if (warnings != null)
            response.warnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
          if (watchFiles != null)
            response.watchFiles = sanitizeStringArray(watchFiles, "watchFiles");
          if (watchDirs != null)
            response.watchDirs = sanitizeStringArray(watchDirs, "watchDirs");
          break;
        }
      } catch (e) {
        response = { id: id2, errors: [extractErrorMessageV8(e, streamIn, details, note && note(), name)] };
        break;
      }
    }
    sendResponse(id, response);
  };
  requestCallbacks["on-load"] = async (id, request) => {
    let response = {}, name = "", callback, note;
    for (let id2 of request.ids) {
      try {
        ({ name, callback, note } = onLoadCallbacks[id2]);
        let result = await callback({
          path: request.path,
          namespace: request.namespace,
          suffix: request.suffix,
          pluginData: details.load(request.pluginData),
          with: request.with
        });
        if (result != null) {
          if (typeof result !== "object")
            throw new Error(`Expected onLoad() callback in plugin ${quote(name)} to return an object`);
          let keys = {};
          let pluginName = getFlag(result, keys, "pluginName", mustBeString);
          let contents = getFlag(result, keys, "contents", mustBeStringOrUint8Array);
          let resolveDir = getFlag(result, keys, "resolveDir", mustBeString);
          let pluginData = getFlag(result, keys, "pluginData", canBeAnything);
          let loader = getFlag(result, keys, "loader", mustBeString);
          let errors = getFlag(result, keys, "errors", mustBeArray);
          let warnings = getFlag(result, keys, "warnings", mustBeArray);
          let watchFiles = getFlag(result, keys, "watchFiles", mustBeArray);
          let watchDirs = getFlag(result, keys, "watchDirs", mustBeArray);
          checkForInvalidFlags(result, keys, `from onLoad() callback in plugin ${quote(name)}`);
          response.id = id2;
          if (pluginName != null)
            response.pluginName = pluginName;
          if (contents instanceof Uint8Array)
            response.contents = contents;
          else if (contents != null)
            response.contents = encodeUTF8(contents);
          if (resolveDir != null)
            response.resolveDir = resolveDir;
          if (pluginData != null)
            response.pluginData = details.store(pluginData);
          if (loader != null)
            response.loader = loader;
          if (errors != null)
            response.errors = sanitizeMessages(errors, "errors", details, name, void 0);
          if (warnings != null)
            response.warnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
          if (watchFiles != null)
            response.watchFiles = sanitizeStringArray(watchFiles, "watchFiles");
          if (watchDirs != null)
            response.watchDirs = sanitizeStringArray(watchDirs, "watchDirs");
          break;
        }
      } catch (e) {
        response = { id: id2, errors: [extractErrorMessageV8(e, streamIn, details, note && note(), name)] };
        break;
      }
    }
    sendResponse(id, response);
  };
  let runOnEndCallbacks = (result, done) => done([], []);
  if (onEndCallbacks.length > 0) {
    runOnEndCallbacks = (result, done) => {
      (async () => {
        const onEndErrors = [];
        const onEndWarnings = [];
        for (const { name, callback, note } of onEndCallbacks) {
          let newErrors;
          let newWarnings;
          try {
            const value = await callback(result);
            if (value != null) {
              if (typeof value !== "object")
                throw new Error(`Expected onEnd() callback in plugin ${quote(name)} to return an object`);
              let keys = {};
              let errors = getFlag(value, keys, "errors", mustBeArray);
              let warnings = getFlag(value, keys, "warnings", mustBeArray);
              checkForInvalidFlags(value, keys, `from onEnd() callback in plugin ${quote(name)}`);
              if (errors != null)
                newErrors = sanitizeMessages(errors, "errors", details, name, void 0);
              if (warnings != null)
                newWarnings = sanitizeMessages(warnings, "warnings", details, name, void 0);
            }
          } catch (e) {
            newErrors = [extractErrorMessageV8(e, streamIn, details, note && note(), name)];
          }
          if (newErrors) {
            onEndErrors.push(...newErrors);
            try {
              result.errors.push(...newErrors);
            } catch {
            }
          }
          if (newWarnings) {
            onEndWarnings.push(...newWarnings);
            try {
              result.warnings.push(...newWarnings);
            } catch {
            }
          }
        }
        done(onEndErrors, onEndWarnings);
      })();
    };
  }
  let scheduleOnDisposeCallbacks = () => {
    for (const cb of onDisposeCallbacks) {
      setTimeout(() => cb(), 0);
    }
  };
  isSetupDone = true;
  return {
    ok: true,
    requestPlugins,
    runOnEndCallbacks,
    scheduleOnDisposeCallbacks
  };
};
function createObjectStash() {
  const map = /* @__PURE__ */ new Map();
  let nextID = 0;
  return {
    load(id) {
      return map.get(id);
    },
    store(value) {
      if (value === void 0)
        return -1;
      const id = nextID++;
      map.set(id, value);
      return id;
    }
  };
}
function extractCallerV8(e, streamIn, ident) {
  let note;
  let tried = false;
  return () => {
    if (tried)
      return note;
    tried = true;
    try {
      let lines = (e.stack + "").split("\n");
      lines.splice(1, 1);
      let location = parseStackLinesV8(streamIn, lines, ident);
      if (location) {
        note = { text: e.message, location };
        return note;
      }
    } catch {
    }
  };
}
function extractErrorMessageV8(e, streamIn, stash, note, pluginName) {
  let text = "Internal error";
  let location = null;
  try {
    text = (e && e.message || e) + "";
  } catch {
  }
  try {
    location = parseStackLinesV8(streamIn, (e.stack + "").split("\n"), "");
  } catch {
  }
  return { id: "", pluginName, text, location, notes: note ? [note] : [], detail: stash ? stash.store(e) : -1 };
}
function parseStackLinesV8(streamIn, lines, ident) {
  let at = "    at ";
  if (streamIn.readFileSync && !lines[0].startsWith(at) && lines[1].startsWith(at)) {
    for (let i = 1; i < lines.length; i++) {
      let line = lines[i];
      if (!line.startsWith(at))
        continue;
      line = line.slice(at.length);
      while (true) {
        let match = /^(?:new |async )?\S+ \((.*)\)$/.exec(line);
        if (match) {
          line = match[1];
          continue;
        }
        match = /^eval at \S+ \((.*)\)(?:, \S+:\d+:\d+)?$/.exec(line);
        if (match) {
          line = match[1];
          continue;
        }
        match = /^(\S+):(\d+):(\d+)$/.exec(line);
        if (match) {
          let contents;
          try {
            contents = streamIn.readFileSync(match[1], "utf8");
          } catch {
            break;
          }
          let lineText = contents.split(/\r\n|\r|\n|\u2028|\u2029/)[+match[2] - 1] || "";
          let column = +match[3] - 1;
          let length = lineText.slice(column, column + ident.length) === ident ? ident.length : 0;
          return {
            file: match[1],
            namespace: "file",
            line: +match[2],
            column: encodeUTF8(lineText.slice(0, column)).length,
            length: encodeUTF8(lineText.slice(column, column + length)).length,
            lineText: lineText + "\n" + lines.slice(1).join("\n"),
            suggestion: ""
          };
        }
        break;
      }
    }
  }
  return null;
}
function failureErrorWithLog(text, errors, warnings) {
  let limit = 5;
  text += errors.length < 1 ? "" : ` with ${errors.length} error${errors.length < 2 ? "" : "s"}:` + errors.slice(0, limit + 1).map((e, i) => {
    if (i === limit)
      return "\n...";
    if (!e.location)
      return `
error: ${e.text}`;
    let { file, line, column } = e.location;
    let pluginText = e.pluginName ? `[plugin: ${e.pluginName}] ` : "";
    return `
${file}:${line}:${column}: ERROR: ${pluginText}${e.text}`;
  }).join("");
  let error = new Error(text);
  for (const [key, value] of [["errors", errors], ["warnings", warnings]]) {
    Object.defineProperty(error, key, {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: (value2) => Object.defineProperty(error, key, {
        configurable: true,
        enumerable: true,
        value: value2
      })
    });
  }
  return error;
}
function replaceDetailsInMessages(messages, stash) {
  for (const message of messages) {
    message.detail = stash.load(message.detail);
  }
  return messages;
}
function sanitizeLocation(location, where, terminalWidth) {
  if (location == null)
    return null;
  let keys = {};
  let file = getFlag(location, keys, "file", mustBeString);
  let namespace = getFlag(location, keys, "namespace", mustBeString);
  let line = getFlag(location, keys, "line", mustBeInteger);
  let column = getFlag(location, keys, "column", mustBeInteger);
  let length = getFlag(location, keys, "length", mustBeInteger);
  let lineText = getFlag(location, keys, "lineText", mustBeString);
  let suggestion = getFlag(location, keys, "suggestion", mustBeString);
  checkForInvalidFlags(location, keys, where);
  if (lineText) {
    const relevantASCII = lineText.slice(
      0,
      (column && column > 0 ? column : 0) + (length && length > 0 ? length : 0) + (terminalWidth && terminalWidth > 0 ? terminalWidth : 80)
    );
    if (!/[\x7F-\uFFFF]/.test(relevantASCII) && !/\n/.test(lineText)) {
      lineText = relevantASCII;
    }
  }
  return {
    file: file || "",
    namespace: namespace || "",
    line: line || 0,
    column: column || 0,
    length: length || 0,
    lineText: lineText || "",
    suggestion: suggestion || ""
  };
}
function sanitizeMessages(messages, property, stash, fallbackPluginName, terminalWidth) {
  let messagesClone = [];
  let index = 0;
  for (const message of messages) {
    let keys = {};
    let id = getFlag(message, keys, "id", mustBeString);
    let pluginName = getFlag(message, keys, "pluginName", mustBeString);
    let text = getFlag(message, keys, "text", mustBeString);
    let location = getFlag(message, keys, "location", mustBeObjectOrNull);
    let notes = getFlag(message, keys, "notes", mustBeArray);
    let detail = getFlag(message, keys, "detail", canBeAnything);
    let where = `in element ${index} of "${property}"`;
    checkForInvalidFlags(message, keys, where);
    let notesClone = [];
    if (notes) {
      for (const note of notes) {
        let noteKeys = {};
        let noteText = getFlag(note, noteKeys, "text", mustBeString);
        let noteLocation = getFlag(note, noteKeys, "location", mustBeObjectOrNull);
        checkForInvalidFlags(note, noteKeys, where);
        notesClone.push({
          text: noteText || "",
          location: sanitizeLocation(noteLocation, where, terminalWidth)
        });
      }
    }
    messagesClone.push({
      id: id || "",
      pluginName: pluginName || fallbackPluginName,
      text: text || "",
      location: sanitizeLocation(location, where, terminalWidth),
      notes: notesClone,
      detail: stash ? stash.store(detail) : -1
    });
    index++;
  }
  return messagesClone;
}
function sanitizeStringArray(values, property) {
  const result = [];
  for (const value of values) {
    if (typeof value !== "string")
      throw new Error(`${quote(property)} must be an array of strings`);
    result.push(value);
  }
  return result;
}
function convertOutputFiles({ path: path3, contents, hash }) {
  let text = null;
  return {
    path: path3,
    contents,
    hash,
    get text() {
      const binary = this.contents;
      if (text === null || binary !== contents) {
        contents = binary;
        text = decodeUTF8(binary);
      }
      return text;
    }
  };
}

// lib/npm/node-platform.ts
var fs = __webpack_require__(147);
var os = __webpack_require__(37);
var path = __webpack_require__(17);
var ESBUILD_BINARY_PATH = process.env.ESBUILD_BINARY_PATH || ESBUILD_BINARY_PATH;
var isValidBinaryPath = (x) => !!x && x !== "/usr/bin/esbuild";
var packageDarwin_arm64 = "@esbuild/darwin-arm64";
var packageDarwin_x64 = "@esbuild/darwin-x64";
var knownWindowsPackages = {
  "win32 arm64 LE": "@esbuild/win32-arm64",
  "win32 ia32 LE": "@esbuild/win32-ia32",
  "win32 x64 LE": "@esbuild/win32-x64"
};
var knownUnixlikePackages = {
  "aix ppc64 BE": "@esbuild/aix-ppc64",
  "android arm64 LE": "@esbuild/android-arm64",
  "darwin arm64 LE": "@esbuild/darwin-arm64",
  "darwin x64 LE": "@esbuild/darwin-x64",
  "freebsd arm64 LE": "@esbuild/freebsd-arm64",
  "freebsd x64 LE": "@esbuild/freebsd-x64",
  "linux arm LE": "@esbuild/linux-arm",
  "linux arm64 LE": "@esbuild/linux-arm64",
  "linux ia32 LE": "@esbuild/linux-ia32",
  "linux mips64el LE": "@esbuild/linux-mips64el",
  "linux ppc64 LE": "@esbuild/linux-ppc64",
  "linux riscv64 LE": "@esbuild/linux-riscv64",
  "linux s390x BE": "@esbuild/linux-s390x",
  "linux x64 LE": "@esbuild/linux-x64",
  "linux loong64 LE": "@esbuild/linux-loong64",
  "netbsd x64 LE": "@esbuild/netbsd-x64",
  "openbsd x64 LE": "@esbuild/openbsd-x64",
  "sunos x64 LE": "@esbuild/sunos-x64"
};
var knownWebAssemblyFallbackPackages = {
  "android arm LE": "@esbuild/android-arm",
  "android x64 LE": "@esbuild/android-x64"
};
function pkgAndSubpathForCurrentPlatform() {
  let pkg;
  let subpath;
  let isWASM = false;
  let platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`;
  if (platformKey in knownWindowsPackages) {
    pkg = knownWindowsPackages[platformKey];
    subpath = "esbuild.exe";
  } else if (platformKey in knownUnixlikePackages) {
    pkg = knownUnixlikePackages[platformKey];
    subpath = "bin/esbuild";
  } else if (platformKey in knownWebAssemblyFallbackPackages) {
    pkg = knownWebAssemblyFallbackPackages[platformKey];
    subpath = "bin/esbuild";
    isWASM = true;
  } else {
    throw new Error(`Unsupported platform: ${platformKey}`);
  }
  return { pkg, subpath, isWASM };
}
function pkgForSomeOtherPlatform() {
  const libMainJS = /*require.resolve*/(999);
  const nodeModulesDirectory = path.dirname(path.dirname(path.dirname(libMainJS)));
  if (path.basename(nodeModulesDirectory) === "node_modules") {
    for (const unixKey in knownUnixlikePackages) {
      try {
        const pkg = knownUnixlikePackages[unixKey];
        if (fs.existsSync(path.join(nodeModulesDirectory, pkg)))
          return pkg;
      } catch {
      }
    }
    for (const windowsKey in knownWindowsPackages) {
      try {
        const pkg = knownWindowsPackages[windowsKey];
        if (fs.existsSync(path.join(nodeModulesDirectory, pkg)))
          return pkg;
      } catch {
      }
    }
  }
  return null;
}
function downloadedBinPath(pkg, subpath) {
  const esbuildLibDir = path.dirname(/*require.resolve*/(999));
  return path.join(esbuildLibDir, `downloaded-${pkg.replace("/", "-")}-${path.basename(subpath)}`);
}
function generateBinPath() {
  if (isValidBinaryPath(ESBUILD_BINARY_PATH)) {
    if (!fs.existsSync(ESBUILD_BINARY_PATH)) {
      console.warn(`[esbuild] Ignoring bad configuration: ESBUILD_BINARY_PATH=${ESBUILD_BINARY_PATH}`);
    } else {
      return { binPath: ESBUILD_BINARY_PATH, isWASM: false };
    }
  }
  const { pkg, subpath, isWASM } = pkgAndSubpathForCurrentPlatform();
  let binPath;
  try {
    binPath = require.resolve(`${pkg}/${subpath}`);
  } catch (e) {
    binPath = downloadedBinPath(pkg, subpath);
    if (!fs.existsSync(binPath)) {
      try {
        require.resolve(pkg);
      } catch {
        const otherPkg = pkgForSomeOtherPlatform();
        if (otherPkg) {
          let suggestions = `
Specifically the "${otherPkg}" package is present but this platform
needs the "${pkg}" package instead. People often get into this
situation by installing esbuild on Windows or macOS and copying "node_modules"
into a Docker image that runs Linux, or by copying "node_modules" between
Windows and WSL environments.

If you are installing with npm, you can try not copying the "node_modules"
directory when you copy the files over, and running "npm ci" or "npm install"
on the destination platform after the copy. Or you could consider using yarn
instead of npm which has built-in support for installing a package on multiple
platforms simultaneously.

If you are installing with yarn, you can try listing both this platform and the
other platform in your ".yarnrc.yml" file using the "supportedArchitectures"
feature: https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
Keep in mind that this means multiple copies of esbuild will be present.
`;
          if (pkg === packageDarwin_x64 && otherPkg === packageDarwin_arm64 || pkg === packageDarwin_arm64 && otherPkg === packageDarwin_x64) {
            suggestions = `
Specifically the "${otherPkg}" package is present but this platform
needs the "${pkg}" package instead. People often get into this
situation by installing esbuild with npm running inside of Rosetta 2 and then
trying to use it with node running outside of Rosetta 2, or vice versa (Rosetta
2 is Apple's on-the-fly x86_64-to-arm64 translation service).

If you are installing with npm, you can try ensuring that both npm and node are
not running under Rosetta 2 and then reinstalling esbuild. This likely involves
changing how you installed npm and/or node. For example, installing node with
the universal installer here should work: https://nodejs.org/en/download/. Or
you could consider using yarn instead of npm which has built-in support for
installing a package on multiple platforms simultaneously.

If you are installing with yarn, you can try listing both "arm64" and "x64"
in your ".yarnrc.yml" file using the "supportedArchitectures" feature:
https://yarnpkg.com/configuration/yarnrc/#supportedArchitectures
Keep in mind that this means multiple copies of esbuild will be present.
`;
          }
          throw new Error(`
You installed esbuild for another platform than the one you're currently using.
This won't work because esbuild is written with native code and needs to
install a platform-specific binary executable.
${suggestions}
Another alternative is to use the "esbuild-wasm" package instead, which works
the same way on all platforms. But it comes with a heavy performance cost and
can sometimes be 10x slower than the "esbuild" package, so you may also not
want to do that.
`);
        }
        throw new Error(`The package "${pkg}" could not be found, and is needed by esbuild.

If you are installing esbuild with npm, make sure that you don't specify the
"--no-optional" or "--omit=optional" flags. The "optionalDependencies" feature
of "package.json" is used by esbuild to install the correct binary executable
for your current platform.`);
      }
      throw e;
    }
  }
  if (/\.zip\//.test(binPath)) {
    let pnpapi;
    try {
      pnpapi = __webpack_require__(125);
    } catch (e) {
    }
    if (pnpapi) {
      const root = pnpapi.getPackageInformation(pnpapi.topLevel).packageLocation;
      const binTargetPath = path.join(
        root,
        "node_modules",
        ".cache",
        "esbuild",
        `pnpapi-${pkg.replace("/", "-")}-${"0.19.12"}-${path.basename(subpath)}`
      );
      if (!fs.existsSync(binTargetPath)) {
        fs.mkdirSync(path.dirname(binTargetPath), { recursive: true });
        fs.copyFileSync(binPath, binTargetPath);
        fs.chmodSync(binTargetPath, 493);
      }
      return { binPath: binTargetPath, isWASM };
    }
  }
  return { binPath, isWASM };
}

// lib/npm/node.ts
var child_process = __webpack_require__(81);
var crypto = __webpack_require__(113);
var path2 = __webpack_require__(17);
var fs2 = __webpack_require__(147);
var os2 = __webpack_require__(37);
var tty = __webpack_require__(224);
var worker_threads;
if (process.env.ESBUILD_WORKER_THREADS !== "0") {
  try {
    worker_threads = __webpack_require__(267);
  } catch {
  }
  let [major, minor] = process.versions.node.split(".");
  if (
    // <v12.17.0 does not work
    +major < 12 || +major === 12 && +minor < 17 || +major === 13 && +minor < 13
  ) {
    worker_threads = void 0;
  }
}
var _a;
var isInternalWorkerThread = ((_a = worker_threads == null ? void 0 : worker_threads.workerData) == null ? void 0 : _a.esbuildVersion) === "0.19.12";
var esbuildCommandAndArgs = () => {
  if ((!ESBUILD_BINARY_PATH || false) && (path2.basename(__filename) !== "main.js" || path2.basename(__dirname) !== "lib")) {
    throw new Error(
      `The esbuild JavaScript API cannot be bundled. Please mark the "esbuild" package as external so it's not included in the bundle.

More information: The file containing the code for esbuild's JavaScript API (${__filename}) does not appear to be inside the esbuild package on the file system, which usually means that the esbuild package was bundled into another file. This is problematic because the API needs to run a binary executable inside the esbuild package which is located using a relative path from the API code to the executable. If the esbuild package is bundled, the relative path will be incorrect and the executable won't be found.`
    );
  }
  if (false) {} else {
    const { binPath, isWASM } = generateBinPath();
    if (isWASM) {
      return ["node", [binPath]];
    } else {
      return [binPath, []];
    }
  }
};
var isTTY = () => tty.isatty(2);
var fsSync = {
  readFile(tempFile, callback) {
    try {
      let contents = fs2.readFileSync(tempFile, "utf8");
      try {
        fs2.unlinkSync(tempFile);
      } catch {
      }
      callback(null, contents);
    } catch (err) {
      callback(err, null);
    }
  },
  writeFile(contents, callback) {
    try {
      let tempFile = randomFileName();
      fs2.writeFileSync(tempFile, contents);
      callback(tempFile);
    } catch {
      callback(null);
    }
  }
};
var fsAsync = {
  readFile(tempFile, callback) {
    try {
      fs2.readFile(tempFile, "utf8", (err, contents) => {
        try {
          fs2.unlink(tempFile, () => callback(err, contents));
        } catch {
          callback(err, contents);
        }
      });
    } catch (err) {
      callback(err, null);
    }
  },
  writeFile(contents, callback) {
    try {
      let tempFile = randomFileName();
      fs2.writeFile(tempFile, contents, (err) => err !== null ? callback(null) : callback(tempFile));
    } catch {
      callback(null);
    }
  }
};
var version = "0.19.12";
var build = (options) => ensureServiceIsRunning().build(options);
var context = (buildOptions) => ensureServiceIsRunning().context(buildOptions);
var transform = (input, options) => ensureServiceIsRunning().transform(input, options);
var formatMessages = (messages, options) => ensureServiceIsRunning().formatMessages(messages, options);
var analyzeMetafile = (messages, options) => ensureServiceIsRunning().analyzeMetafile(messages, options);
var buildSync = (options) => {
  if (worker_threads && !isInternalWorkerThread) {
    if (!workerThreadService)
      workerThreadService = startWorkerThreadService(worker_threads);
    return workerThreadService.buildSync(options);
  }
  let result;
  runServiceSync((service) => service.buildOrContext({
    callName: "buildSync",
    refs: null,
    options,
    isTTY: isTTY(),
    defaultWD,
    callback: (err, res) => {
      if (err)
        throw err;
      result = res;
    }
  }));
  return result;
};
var transformSync = (input, options) => {
  if (worker_threads && !isInternalWorkerThread) {
    if (!workerThreadService)
      workerThreadService = startWorkerThreadService(worker_threads);
    return workerThreadService.transformSync(input, options);
  }
  let result;
  runServiceSync((service) => service.transform({
    callName: "transformSync",
    refs: null,
    input,
    options: options || {},
    isTTY: isTTY(),
    fs: fsSync,
    callback: (err, res) => {
      if (err)
        throw err;
      result = res;
    }
  }));
  return result;
};
var formatMessagesSync = (messages, options) => {
  if (worker_threads && !isInternalWorkerThread) {
    if (!workerThreadService)
      workerThreadService = startWorkerThreadService(worker_threads);
    return workerThreadService.formatMessagesSync(messages, options);
  }
  let result;
  runServiceSync((service) => service.formatMessages({
    callName: "formatMessagesSync",
    refs: null,
    messages,
    options,
    callback: (err, res) => {
      if (err)
        throw err;
      result = res;
    }
  }));
  return result;
};
var analyzeMetafileSync = (metafile, options) => {
  if (worker_threads && !isInternalWorkerThread) {
    if (!workerThreadService)
      workerThreadService = startWorkerThreadService(worker_threads);
    return workerThreadService.analyzeMetafileSync(metafile, options);
  }
  let result;
  runServiceSync((service) => service.analyzeMetafile({
    callName: "analyzeMetafileSync",
    refs: null,
    metafile: typeof metafile === "string" ? metafile : JSON.stringify(metafile),
    options,
    callback: (err, res) => {
      if (err)
        throw err;
      result = res;
    }
  }));
  return result;
};
var stop = () => {
  if (stopService)
    stopService();
  if (workerThreadService)
    workerThreadService.stop();
};
var initializeWasCalled = false;
var initialize = (options) => {
  options = validateInitializeOptions(options || {});
  if (options.wasmURL)
    throw new Error(`The "wasmURL" option only works in the browser`);
  if (options.wasmModule)
    throw new Error(`The "wasmModule" option only works in the browser`);
  if (options.worker)
    throw new Error(`The "worker" option only works in the browser`);
  if (initializeWasCalled)
    throw new Error('Cannot call "initialize" more than once');
  ensureServiceIsRunning();
  initializeWasCalled = true;
  return Promise.resolve();
};
var defaultWD = process.cwd();
var longLivedService;
var stopService;
var ensureServiceIsRunning = () => {
  if (longLivedService)
    return longLivedService;
  let [command, args] = esbuildCommandAndArgs();
  let child = child_process.spawn(command, args.concat(`--service=${"0.19.12"}`, "--ping"), {
    windowsHide: true,
    stdio: ["pipe", "pipe", "inherit"],
    cwd: defaultWD
  });
  let { readFromStdout, afterClose, service } = createChannel({
    writeToStdin(bytes) {
      child.stdin.write(bytes, (err) => {
        if (err)
          afterClose(err);
      });
    },
    readFileSync: fs2.readFileSync,
    isSync: false,
    hasFS: true,
    esbuild: node_exports
  });
  child.stdin.on("error", afterClose);
  child.on("error", afterClose);
  const stdin = child.stdin;
  const stdout = child.stdout;
  stdout.on("data", readFromStdout);
  stdout.on("end", afterClose);
  stopService = () => {
    stdin.destroy();
    stdout.destroy();
    child.kill();
    initializeWasCalled = false;
    longLivedService = void 0;
    stopService = void 0;
  };
  let refCount = 0;
  child.unref();
  if (stdin.unref) {
    stdin.unref();
  }
  if (stdout.unref) {
    stdout.unref();
  }
  const refs = {
    ref() {
      if (++refCount === 1)
        child.ref();
    },
    unref() {
      if (--refCount === 0)
        child.unref();
    }
  };
  longLivedService = {
    build: (options) => new Promise((resolve, reject) => {
      service.buildOrContext({
        callName: "build",
        refs,
        options,
        isTTY: isTTY(),
        defaultWD,
        callback: (err, res) => err ? reject(err) : resolve(res)
      });
    }),
    context: (options) => new Promise((resolve, reject) => service.buildOrContext({
      callName: "context",
      refs,
      options,
      isTTY: isTTY(),
      defaultWD,
      callback: (err, res) => err ? reject(err) : resolve(res)
    })),
    transform: (input, options) => new Promise((resolve, reject) => service.transform({
      callName: "transform",
      refs,
      input,
      options: options || {},
      isTTY: isTTY(),
      fs: fsAsync,
      callback: (err, res) => err ? reject(err) : resolve(res)
    })),
    formatMessages: (messages, options) => new Promise((resolve, reject) => service.formatMessages({
      callName: "formatMessages",
      refs,
      messages,
      options,
      callback: (err, res) => err ? reject(err) : resolve(res)
    })),
    analyzeMetafile: (metafile, options) => new Promise((resolve, reject) => service.analyzeMetafile({
      callName: "analyzeMetafile",
      refs,
      metafile: typeof metafile === "string" ? metafile : JSON.stringify(metafile),
      options,
      callback: (err, res) => err ? reject(err) : resolve(res)
    }))
  };
  return longLivedService;
};
var runServiceSync = (callback) => {
  let [command, args] = esbuildCommandAndArgs();
  let stdin = new Uint8Array();
  let { readFromStdout, afterClose, service } = createChannel({
    writeToStdin(bytes) {
      if (stdin.length !== 0)
        throw new Error("Must run at most one command");
      stdin = bytes;
    },
    isSync: true,
    hasFS: true,
    esbuild: node_exports
  });
  callback(service);
  let stdout = child_process.execFileSync(command, args.concat(`--service=${"0.19.12"}`), {
    cwd: defaultWD,
    windowsHide: true,
    input: stdin,
    // We don't know how large the output could be. If it's too large, the
    // command will fail with ENOBUFS. Reserve 16mb for now since that feels
    // like it should be enough. Also allow overriding this with an environment
    // variable.
    maxBuffer: +process.env.ESBUILD_MAX_BUFFER || 16 * 1024 * 1024
  });
  readFromStdout(stdout);
  afterClose(null);
};
var randomFileName = () => {
  return path2.join(os2.tmpdir(), `esbuild-${crypto.randomBytes(32).toString("hex")}`);
};
var workerThreadService = null;
var startWorkerThreadService = (worker_threads2) => {
  let { port1: mainPort, port2: workerPort } = new worker_threads2.MessageChannel();
  let worker = new worker_threads2.Worker(__filename, {
    workerData: { workerPort, defaultWD, esbuildVersion: "0.19.12" },
    transferList: [workerPort],
    // From node's documentation: https://nodejs.org/api/worker_threads.html
    //
    //   Take care when launching worker threads from preload scripts (scripts loaded
    //   and run using the `-r` command line flag). Unless the `execArgv` option is
    //   explicitly set, new Worker threads automatically inherit the command line flags
    //   from the running process and will preload the same preload scripts as the main
    //   thread. If the preload script unconditionally launches a worker thread, every
    //   thread spawned will spawn another until the application crashes.
    //
    execArgv: []
  });
  let nextID = 0;
  let fakeBuildError = (text) => {
    let error = new Error(`Build failed with 1 error:
error: ${text}`);
    let errors = [{ id: "", pluginName: "", text, location: null, notes: [], detail: void 0 }];
    error.errors = errors;
    error.warnings = [];
    return error;
  };
  let validateBuildSyncOptions = (options) => {
    if (!options)
      return;
    let plugins = options.plugins;
    if (plugins && plugins.length > 0)
      throw fakeBuildError(`Cannot use plugins in synchronous API calls`);
  };
  let applyProperties = (object, properties) => {
    for (let key in properties) {
      object[key] = properties[key];
    }
  };
  let runCallSync = (command, args) => {
    let id = nextID++;
    let sharedBuffer = new SharedArrayBuffer(8);
    let sharedBufferView = new Int32Array(sharedBuffer);
    let msg = { sharedBuffer, id, command, args };
    worker.postMessage(msg);
    let status = Atomics.wait(sharedBufferView, 0, 0);
    if (status !== "ok" && status !== "not-equal")
      throw new Error("Internal error: Atomics.wait() failed: " + status);
    let { message: { id: id2, resolve, reject, properties } } = worker_threads2.receiveMessageOnPort(mainPort);
    if (id !== id2)
      throw new Error(`Internal error: Expected id ${id} but got id ${id2}`);
    if (reject) {
      applyProperties(reject, properties);
      throw reject;
    }
    return resolve;
  };
  worker.unref();
  return {
    buildSync(options) {
      validateBuildSyncOptions(options);
      return runCallSync("build", [options]);
    },
    transformSync(input, options) {
      return runCallSync("transform", [input, options]);
    },
    formatMessagesSync(messages, options) {
      return runCallSync("formatMessages", [messages, options]);
    },
    analyzeMetafileSync(metafile, options) {
      return runCallSync("analyzeMetafile", [metafile, options]);
    },
    stop() {
      worker.terminate();
      workerThreadService = null;
    }
  };
};
var startSyncServiceWorker = () => {
  let workerPort = worker_threads.workerData.workerPort;
  let parentPort = worker_threads.parentPort;
  let extractProperties = (object) => {
    let properties = {};
    if (object && typeof object === "object") {
      for (let key in object) {
        properties[key] = object[key];
      }
    }
    return properties;
  };
  try {
    let service = ensureServiceIsRunning();
    defaultWD = worker_threads.workerData.defaultWD;
    parentPort.on("message", (msg) => {
      (async () => {
        let { sharedBuffer, id, command, args } = msg;
        let sharedBufferView = new Int32Array(sharedBuffer);
        try {
          switch (command) {
            case "build":
              workerPort.postMessage({ id, resolve: await service.build(args[0]) });
              break;
            case "transform":
              workerPort.postMessage({ id, resolve: await service.transform(args[0], args[1]) });
              break;
            case "formatMessages":
              workerPort.postMessage({ id, resolve: await service.formatMessages(args[0], args[1]) });
              break;
            case "analyzeMetafile":
              workerPort.postMessage({ id, resolve: await service.analyzeMetafile(args[0], args[1]) });
              break;
            default:
              throw new Error(`Invalid command: ${command}`);
          }
        } catch (reject) {
          workerPort.postMessage({ id, reject, properties: extractProperties(reject) });
        }
        Atomics.add(sharedBufferView, 0, 1);
        Atomics.notify(sharedBufferView, 0, Infinity);
      })();
    });
  } catch (reject) {
    parentPort.on("message", (msg) => {
      let { sharedBuffer, id } = msg;
      let sharedBufferView = new Int32Array(sharedBuffer);
      workerPort.postMessage({ id, reject, properties: extractProperties(reject) });
      Atomics.add(sharedBufferView, 0, 1);
      Atomics.notify(sharedBufferView, 0, Infinity);
    });
  }
};
if (isInternalWorkerThread) {
  startSyncServiceWorker();
}
var node_default = node_exports;
// Annotate the CommonJS export names for ESM import in node:
0 && (0);


/***/ }),

/***/ 857:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var p=__webpack_require__(17),V=__webpack_require__(147),ge=__webpack_require__(188),ae=__webpack_require__(200);function B(e){return e.startsWith("\\\\?\\")?e:e.replace(/\\/g,"/")}const P=e=>{const s=V[e];return(i,...n)=>{const t=`${e}:${n.join(":")}`;let o=i==null?void 0:i.get(t);return o===void 0&&(o=Reflect.apply(s,V,n),i==null||i.set(t,o)),o}},E=P("existsSync"),me=P("realpathSync"),ke=P("readFileSync"),x=P("statSync"),Y=(e,s,i)=>{for(;;){const n=p.posix.join(e,s);if(E(i,n))return n;const t=p.dirname(e);if(t===e)return;e=t}},d=/^\.{1,2}(\/.*)?$/,M=e=>{const s=B(e);return d.test(s)?s:`./${s}`};function be(e,s=!1){const i=e.length;let n=0,t="",o=0,l=16,a=0,r=0,b=0,w=0,c=0;function L(u,g){let f=0,$=0;for(;f<u||!g;){let O=e.charCodeAt(n);if(O>=48&&O<=57)$=$*16+O-48;else if(O>=65&&O<=70)$=$*16+O-65+10;else if(O>=97&&O<=102)$=$*16+O-97+10;else break;n++,f++}return f<u&&($=-1),$}function T(u){n=u,t="",o=0,l=16,c=0}function v(){let u=n;if(e.charCodeAt(n)===48)n++;else for(n++;n<e.length&&N(e.charCodeAt(n));)n++;if(n<e.length&&e.charCodeAt(n)===46)if(n++,n<e.length&&N(e.charCodeAt(n)))for(n++;n<e.length&&N(e.charCodeAt(n));)n++;else return c=3,e.substring(u,n);let g=n;if(n<e.length&&(e.charCodeAt(n)===69||e.charCodeAt(n)===101))if(n++,(n<e.length&&e.charCodeAt(n)===43||e.charCodeAt(n)===45)&&n++,n<e.length&&N(e.charCodeAt(n))){for(n++;n<e.length&&N(e.charCodeAt(n));)n++;g=n}else c=3;return e.substring(u,g)}function k(){let u="",g=n;for(;;){if(n>=i){u+=e.substring(g,n),c=2;break}const f=e.charCodeAt(n);if(f===34){u+=e.substring(g,n),n++;break}if(f===92){if(u+=e.substring(g,n),n++,n>=i){c=2;break}switch(e.charCodeAt(n++)){case 34:u+='"';break;case 92:u+="\\";break;case 47:u+="/";break;case 98:u+="\b";break;case 102:u+="\f";break;case 110:u+=`
`;break;case 114:u+="\r";break;case 116:u+="	";break;case 117:const O=L(4,!0);O>=0?u+=String.fromCharCode(O):c=4;break;default:c=5}g=n;continue}if(f>=0&&f<=31)if(_(f)){u+=e.substring(g,n),c=2;break}else c=6;n++}return u}function j(){if(t="",c=0,o=n,r=a,w=b,n>=i)return o=i,l=17;let u=e.charCodeAt(n);if(W(u)){do n++,t+=String.fromCharCode(u),u=e.charCodeAt(n);while(W(u));return l=15}if(_(u))return n++,t+=String.fromCharCode(u),u===13&&e.charCodeAt(n)===10&&(n++,t+=`
`),a++,b=n,l=14;switch(u){case 123:return n++,l=1;case 125:return n++,l=2;case 91:return n++,l=3;case 93:return n++,l=4;case 58:return n++,l=6;case 44:return n++,l=5;case 34:return n++,t=k(),l=10;case 47:const g=n-1;if(e.charCodeAt(n+1)===47){for(n+=2;n<i&&!_(e.charCodeAt(n));)n++;return t=e.substring(g,n),l=12}if(e.charCodeAt(n+1)===42){n+=2;const f=i-1;let $=!1;for(;n<f;){const O=e.charCodeAt(n);if(O===42&&e.charCodeAt(n+1)===47){n+=2,$=!0;break}n++,_(O)&&(O===13&&e.charCodeAt(n)===10&&n++,a++,b=n)}return $||(n++,c=1),t=e.substring(g,n),l=13}return t+=String.fromCharCode(u),n++,l=16;case 45:if(t+=String.fromCharCode(u),n++,n===i||!N(e.charCodeAt(n)))return l=16;case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return t+=v(),l=11;default:for(;n<i&&U(u);)n++,u=e.charCodeAt(n);if(o!==n){switch(t=e.substring(o,n),t){case"true":return l=8;case"false":return l=9;case"null":return l=7}return l=16}return t+=String.fromCharCode(u),n++,l=16}}function U(u){if(W(u)||_(u))return!1;switch(u){case 125:case 93:case 123:case 91:case 34:case 58:case 44:case 47:return!1}return!0}function F(){let u;do u=j();while(u>=12&&u<=15);return u}return{setPosition:T,getPosition:()=>n,scan:s?F:j,getToken:()=>l,getTokenValue:()=>t,getTokenOffset:()=>o,getTokenLength:()=>n-o,getTokenStartLine:()=>r,getTokenStartCharacter:()=>o-w,getTokenError:()=>c}}function W(e){return e===32||e===9}function _(e){return e===10||e===13}function N(e){return e>=48&&e<=57}var Z;(function(e){e[e.lineFeed=10]="lineFeed",e[e.carriageReturn=13]="carriageReturn",e[e.space=32]="space",e[e._0=48]="_0",e[e._1=49]="_1",e[e._2=50]="_2",e[e._3=51]="_3",e[e._4=52]="_4",e[e._5=53]="_5",e[e._6=54]="_6",e[e._7=55]="_7",e[e._8=56]="_8",e[e._9=57]="_9",e[e.a=97]="a",e[e.b=98]="b",e[e.c=99]="c",e[e.d=100]="d",e[e.e=101]="e",e[e.f=102]="f",e[e.g=103]="g",e[e.h=104]="h",e[e.i=105]="i",e[e.j=106]="j",e[e.k=107]="k",e[e.l=108]="l",e[e.m=109]="m",e[e.n=110]="n",e[e.o=111]="o",e[e.p=112]="p",e[e.q=113]="q",e[e.r=114]="r",e[e.s=115]="s",e[e.t=116]="t",e[e.u=117]="u",e[e.v=118]="v",e[e.w=119]="w",e[e.x=120]="x",e[e.y=121]="y",e[e.z=122]="z",e[e.A=65]="A",e[e.B=66]="B",e[e.C=67]="C",e[e.D=68]="D",e[e.E=69]="E",e[e.F=70]="F",e[e.G=71]="G",e[e.H=72]="H",e[e.I=73]="I",e[e.J=74]="J",e[e.K=75]="K",e[e.L=76]="L",e[e.M=77]="M",e[e.N=78]="N",e[e.O=79]="O",e[e.P=80]="P",e[e.Q=81]="Q",e[e.R=82]="R",e[e.S=83]="S",e[e.T=84]="T",e[e.U=85]="U",e[e.V=86]="V",e[e.W=87]="W",e[e.X=88]="X",e[e.Y=89]="Y",e[e.Z=90]="Z",e[e.asterisk=42]="asterisk",e[e.backslash=92]="backslash",e[e.closeBrace=125]="closeBrace",e[e.closeBracket=93]="closeBracket",e[e.colon=58]="colon",e[e.comma=44]="comma",e[e.dot=46]="dot",e[e.doubleQuote=34]="doubleQuote",e[e.minus=45]="minus",e[e.openBrace=123]="openBrace",e[e.openBracket=91]="openBracket",e[e.plus=43]="plus",e[e.slash=47]="slash",e[e.formFeed=12]="formFeed",e[e.tab=9]="tab"})(Z||(Z={}));var I;(function(e){e.DEFAULT={allowTrailingComma:!1}})(I||(I={}));function Te(e,s=[],i=I.DEFAULT){let n=null,t=[];const o=[];function l(r){Array.isArray(t)?t.push(r):n!==null&&(t[n]=r)}return ve(e,{onObjectBegin:()=>{const r={};l(r),o.push(t),t=r,n=null},onObjectProperty:r=>{n=r},onObjectEnd:()=>{t=o.pop()},onArrayBegin:()=>{const r=[];l(r),o.push(t),t=r,n=null},onArrayEnd:()=>{t=o.pop()},onLiteralValue:l,onError:(r,b,w)=>{s.push({error:r,offset:b,length:w})}},i),t[0]}function ve(e,s,i=I.DEFAULT){const n=be(e,!1),t=[];function o(m){return m?()=>m(n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter()):()=>!0}function l(m){return m?()=>m(n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter(),()=>t.slice()):()=>!0}function a(m){return m?A=>m(A,n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter()):()=>!0}function r(m){return m?A=>m(A,n.getTokenOffset(),n.getTokenLength(),n.getTokenStartLine(),n.getTokenStartCharacter(),()=>t.slice()):()=>!0}const b=l(s.onObjectBegin),w=r(s.onObjectProperty),c=o(s.onObjectEnd),L=l(s.onArrayBegin),T=o(s.onArrayEnd),v=r(s.onLiteralValue),k=a(s.onSeparator),j=o(s.onComment),U=a(s.onError),F=i&&i.disallowComments,u=i&&i.allowTrailingComma;function g(){for(;;){const m=n.scan();switch(n.getTokenError()){case 4:f(14);break;case 5:f(15);break;case 3:f(13);break;case 1:F||f(11);break;case 2:f(12);break;case 6:f(16);break}switch(m){case 12:case 13:F?f(10):j();break;case 16:f(1);break;case 15:case 14:break;default:return m}}}function f(m,A=[],X=[]){if(U(m),A.length+X.length>0){let y=n.getToken();for(;y!==17;){if(A.indexOf(y)!==-1){g();break}else if(X.indexOf(y)!==-1)break;y=g()}}}function $(m){const A=n.getTokenValue();return m?v(A):(w(A),t.push(A)),g(),!0}function O(){switch(n.getToken()){case 11:const m=n.getTokenValue();let A=Number(m);isNaN(A)&&(f(2),A=0),v(A);break;case 7:v(null);break;case 8:v(!0);break;case 9:v(!1);break;default:return!1}return g(),!0}function ce(){return n.getToken()!==10?(f(3,[],[2,5]),!1):($(!1),n.getToken()===6?(k(":"),g(),h()||f(4,[],[2,5])):f(5,[],[2,5]),t.pop(),!0)}function fe(){b(),g();let m=!1;for(;n.getToken()!==2&&n.getToken()!==17;){if(n.getToken()===5){if(m||f(4,[],[]),k(","),g(),n.getToken()===2&&u)break}else m&&f(6,[],[]);ce()||f(4,[],[2,5]),m=!0}return c(),n.getToken()!==2?f(7,[2],[]):g(),!0}function pe(){L(),g();let m=!0,A=!1;for(;n.getToken()!==4&&n.getToken()!==17;){if(n.getToken()===5){if(A||f(4,[],[]),k(","),g(),n.getToken()===4&&u)break}else A&&f(6,[],[]);m?(t.push(0),m=!1):t[t.length-1]++,h()||f(4,[],[4,5]),A=!0}return T(),m||t.pop(),n.getToken()!==4?f(8,[4],[]):g(),!0}function h(){switch(n.getToken()){case 3:return pe();case 1:return fe();case 10:return $(!0);default:return O()}}return g(),n.getToken()===17?i.allowEmptyContent?!0:(f(4,[],[]),!1):h()?(n.getToken()!==17&&f(9,[],[]),!0):(f(4,[],[]),!1)}var K;(function(e){e[e.None=0]="None",e[e.UnexpectedEndOfComment=1]="UnexpectedEndOfComment",e[e.UnexpectedEndOfString=2]="UnexpectedEndOfString",e[e.UnexpectedEndOfNumber=3]="UnexpectedEndOfNumber",e[e.InvalidUnicode=4]="InvalidUnicode",e[e.InvalidEscapeCharacter=5]="InvalidEscapeCharacter",e[e.InvalidCharacter=6]="InvalidCharacter"})(K||(K={}));var C;(function(e){e[e.OpenBraceToken=1]="OpenBraceToken",e[e.CloseBraceToken=2]="CloseBraceToken",e[e.OpenBracketToken=3]="OpenBracketToken",e[e.CloseBracketToken=4]="CloseBracketToken",e[e.CommaToken=5]="CommaToken",e[e.ColonToken=6]="ColonToken",e[e.NullKeyword=7]="NullKeyword",e[e.TrueKeyword=8]="TrueKeyword",e[e.FalseKeyword=9]="FalseKeyword",e[e.StringLiteral=10]="StringLiteral",e[e.NumericLiteral=11]="NumericLiteral",e[e.LineCommentTrivia=12]="LineCommentTrivia",e[e.BlockCommentTrivia=13]="BlockCommentTrivia",e[e.LineBreakTrivia=14]="LineBreakTrivia",e[e.Trivia=15]="Trivia",e[e.Unknown=16]="Unknown",e[e.EOF=17]="EOF"})(C||(C={}));const we=Te;var ee;(function(e){e[e.InvalidSymbol=1]="InvalidSymbol",e[e.InvalidNumberFormat=2]="InvalidNumberFormat",e[e.PropertyNameExpected=3]="PropertyNameExpected",e[e.ValueExpected=4]="ValueExpected",e[e.ColonExpected=5]="ColonExpected",e[e.CommaExpected=6]="CommaExpected",e[e.CloseBraceExpected=7]="CloseBraceExpected",e[e.CloseBracketExpected=8]="CloseBracketExpected",e[e.EndOfFileExpected=9]="EndOfFileExpected",e[e.InvalidCommentToken=10]="InvalidCommentToken",e[e.UnexpectedEndOfComment=11]="UnexpectedEndOfComment",e[e.UnexpectedEndOfString=12]="UnexpectedEndOfString",e[e.UnexpectedEndOfNumber=13]="UnexpectedEndOfNumber",e[e.InvalidUnicode=14]="InvalidUnicode",e[e.InvalidEscapeCharacter=15]="InvalidEscapeCharacter",e[e.InvalidCharacter=16]="InvalidCharacter"})(ee||(ee={}));const ne=(e,s)=>we(ke(s,e,"utf8")),J=Symbol("implicitBaseUrl"),Oe=()=>{const{findPnpApi:e}=ge;return e&&e(process.cwd())},R=(e,s,i,n)=>{const t=`resolveFromPackageJsonPath:${e}:${s}:${i}`;if(n!=null&&n.has(t))return n.get(t);const o=ne(e,n);if(!o)return;let l=s||"tsconfig.json";if(!i&&o.exports)try{const[a]=ae.resolveExports(o.exports,s,["require","types"]);l=a}catch{return!1}else!s&&o.tsconfig&&(l=o.tsconfig);return l=p.join(e,"..",l),n==null||n.set(t,l),l},G="package.json",z="tsconfig.json",Ae=(e,s,i)=>{let n=e;if(e===".."&&(n=p.join(n,z)),e[0]==="."&&(n=p.resolve(s,n)),p.isAbsolute(n)){if(E(i,n)){if(x(i,n).isFile())return n}else if(!n.endsWith(".json")){const T=`${n}.json`;if(E(i,T))return T}return}const[t,...o]=e.split("/"),l=t[0]==="@"?`${t}/${o.shift()}`:t,a=o.join("/"),r=Oe();if(r){const{resolveRequest:T}=r;try{if(l===e){const v=T(p.join(l,G),s);if(v){const k=R(v,a,!1,i);if(k&&E(i,k))return k}}else{let v;try{v=T(e,s,{extensions:[".json"]})}catch{v=T(p.join(e,z),s)}if(v)return v}}catch{}}const b=Y(s,p.join("node_modules",l),i);if(!b||!x(i,b).isDirectory())return;const w=p.join(b,G);if(E(i,w)){const T=R(w,a,!1,i);if(T===!1)return;if(T&&E(i,T)&&x(i,T).isFile())return T}const c=p.join(b,a),L=c.endsWith(".json");if(!L){const T=`${c}.json`;if(E(i,T))return T}if(E(i,c)){if(x(i,c).isDirectory()){const T=p.join(c,G);if(E(i,T)){const k=R(T,"",!0,i);if(k&&E(i,k))return k}const v=p.join(c,z);if(E(i,v))return v}else if(L)return c}},je=(e,s,i,n)=>{const t=Ae(e,s,n);if(!t)throw new Error(`File '${e}' not found.`);if(i.has(t))throw new Error(`Circularity detected while resolving configuration: ${t}`);i.add(t);const o=p.dirname(t),l=te(t,n,i);delete l.references;const{compilerOptions:a}=l;if(a){const r=["baseUrl","outDir"];for(const b of r){const w=a[b];w&&(a[b]=B(p.relative(s,p.join(o,w)))||"./")}}return l.files&&(l.files=l.files.map(r=>B(p.relative(s,p.join(o,r))))),l.include&&(l.include=l.include.map(r=>B(p.relative(s,p.join(o,r))))),l.exclude&&(l.exclude=l.exclude.map(r=>B(p.relative(s,p.join(o,r))))),l},te=(e,s,i=new Set)=>{let n;try{n=me(s,e)}catch{throw new Error(`Cannot resolve tsconfig at path: ${e}`)}let t=ne(n,s)||{};if(typeof t!="object")throw new SyntaxError(`Failed to parse tsconfig at: ${e}`);const o=p.dirname(n);if(t.compilerOptions){const{compilerOptions:l}=t;l.paths&&!l.baseUrl&&(l[J]=o)}if(t.extends){const l=Array.isArray(t.extends)?t.extends:[t.extends];delete t.extends;for(const a of l.reverse()){const r=je(a,o,new Set(i),s),b={...r,...t,compilerOptions:{...r.compilerOptions,...t.compilerOptions}};r.watchOptions&&(b.watchOptions={...r.watchOptions,...t.watchOptions}),t=b}}if(t.compilerOptions){const{compilerOptions:l}=t,a=["baseUrl","rootDir"];for(const b of a){const w=l[b];if(w){const c=p.resolve(o,w),L=M(p.relative(o,c));l[b]=L}}const{outDir:r}=l;r&&(Array.isArray(t.exclude)||(t.exclude=[]),t.exclude.includes(r)||t.exclude.push(r),l.outDir=M(r))}else t.compilerOptions={};if(t.files&&(t.files=t.files.map(M)),t.include&&(t.include=t.include.map(B)),t.watchOptions){const{watchOptions:l}=t;l.excludeDirectories&&(l.excludeDirectories=l.excludeDirectories.map(a=>B(p.resolve(o,a))))}return t},ie=(e,s=new Map)=>te(e,s),$e=(e=process.cwd(),s="tsconfig.json",i=new Map)=>{const n=Y(B(e),s,i);if(!n)return null;const t=ie(n,i);return{path:n,config:t}},Be=/\*/g,se=(e,s)=>{const i=e.match(Be);if(i&&i.length>1)throw new Error(s)},Ee=e=>{if(e.includes("*")){const[s,i]=e.split("*");return{prefix:s,suffix:i}}return e},Le=({prefix:e,suffix:s},i)=>i.startsWith(e)&&i.endsWith(s),Ue=(e,s,i)=>Object.entries(e).map(([n,t])=>(se(n,`Pattern '${n}' can have at most one '*' character.`),{pattern:Ee(n),substitutions:t.map(o=>{if(se(o,`Substitution '${o}' in pattern '${n}' can have at most one '*' character.`),!s&&!d.test(o))throw new Error("Non-relative paths are not allowed when 'baseUrl' is not set. Did you forget a leading './'?");return p.resolve(i,o)})})),Fe=e=>{if(!e.config.compilerOptions)return null;const{baseUrl:s,paths:i}=e.config.compilerOptions,n=J in e.config.compilerOptions&&e.config.compilerOptions[J];if(!s&&!i)return null;const t=p.resolve(p.dirname(e.path),s||n||"."),o=i?Ue(i,s,t):[];return l=>{if(d.test(l))return[];const a=[];for(const c of o){if(c.pattern===l)return c.substitutions.map(B);typeof c.pattern!="string"&&a.push(c)}let r,b=-1;for(const c of a)Le(c.pattern,l)&&c.pattern.prefix.length>b&&(b=c.pattern.prefix.length,r=c);if(!r)return s?[B(p.join(t,l))]:[];const w=l.slice(r.pattern.prefix.length,l.length-r.pattern.suffix.length);return r.substitutions.map(c=>B(c.replace("*",w)))}},le=e=>{let s="";for(let i=0;i<e.length;i+=1){const n=e[i],t=n.toUpperCase();s+=n===t?n.toLowerCase():t}return s},Ne=65,_e=97,ye=()=>Math.floor(Math.random()*26),Pe=e=>Array.from({length:e},()=>String.fromCodePoint(ye()+(Math.random()>.5?Ne:_e))).join(""),xe=(e=V)=>{const s=process.execPath;if(e.existsSync(s))return!e.existsSync(le(s));const i=`/${Pe(10)}`;e.writeFileSync(i,"");const n=!e.existsSync(le(i));return e.unlinkSync(i),n},{join:D}=p.posix,Q={ts:[".ts",".tsx",".d.ts"],cts:[".cts",".d.cts"],mts:[".mts",".d.mts"]},Ie=e=>{const s=[...Q.ts],i=[...Q.cts],n=[...Q.mts];return e!=null&&e.allowJs&&(s.push(".js",".jsx"),i.push(".cjs"),n.push(".mjs")),[...s,...i,...n]},De=e=>{const s=[];if(!e)return s;const{outDir:i,declarationDir:n}=e;return i&&s.push(i),n&&s.push(n),s},oe=e=>e.replaceAll(/[.*+?^${}()|[\]\\]/g,"\\$&"),Se=["node_modules","bower_components","jspm_packages"],H=`(?!(${Se.join("|")})(/|$))`,he=/(?:^|\/)[^.*?]+$/,ue="**/*",S="[^/]",q="[^./]",re=process.platform==="win32",Ve=({config:e,path:s},i=xe())=>{if("extends"in e)throw new Error("tsconfig#extends must be resolved. Use getTsconfig or parseTsconfig to resolve it.");if(!p.isAbsolute(s))throw new Error("The tsconfig path must be absolute");re&&(s=B(s));const n=p.dirname(s),{files:t,include:o,exclude:l,compilerOptions:a}=e,r=t==null?void 0:t.map(k=>D(n,k)),b=Ie(a),w=i?"":"i",L=(l||De(a)).map(k=>{const j=D(n,k),U=oe(j).replaceAll("\\*\\*/","(.+/)?").replaceAll("\\*",`${S}*`).replaceAll("\\?",S);return new RegExp(`^${U}($|/)`,w)}),T=t||o?o:[ue],v=T?T.map(k=>{let j=D(n,k);he.test(j)&&(j=D(j,ue));const U=oe(j).replaceAll("/\\*\\*",`(/${H}${q}${S}*)*?`).replaceAll(/(\/)?\\\*/g,(F,u)=>{const g=`(${q}|(\\.(?!min\\.js$))?)*`;return u?`/${H}${q}${g}`:g}).replaceAll(/(\/)?\\\?/g,(F,u)=>{const g=S;return u?`/${H}${g}`:g});return new RegExp(`^${U}$`,w)}):void 0;return k=>{if(!p.isAbsolute(k))throw new Error("filePath must be absolute");if(re&&(k=B(k)),r!=null&&r.includes(k))return e;if(!(!b.some(j=>k.endsWith(j))||L.some(j=>j.test(k)))&&v&&v.some(j=>j.test(k)))return e}};exports.createFilesMatcher=Ve,exports.createPathsMatcher=Fe,exports.getTsconfig=$e,exports.parseTsconfig=ie;


/***/ }),

/***/ 200:
/***/ ((__unused_webpack_module, exports) => {

Object.defineProperty(exports, "__esModule", ({value:!0}));const d=r=>r!==null&&typeof r=="object",s=(r,t)=>Object.assign(new Error(`[${r}]: ${t}`),{code:r}),g="ERR_INVALID_PACKAGE_CONFIG",E="ERR_INVALID_PACKAGE_TARGET",I="ERR_PACKAGE_PATH_NOT_EXPORTED",P="ERR_PACKAGE_IMPORT_NOT_DEFINED",R=/^\d+$/,O=/^(\.{1,2}|node_modules)$/i,u=/\/|\\/;var h=(r=>(r.Export="exports",r.Import="imports",r))(h||{});const f=(r,t,n,o,c)=>{if(t==null)return[];if(typeof t=="string"){const[e,...i]=t.split(u);if(e===".."||i.some(l=>O.test(l)))throw s(E,`Invalid "${r}" target "${t}" defined in the package config`);return[c?t.replace(/\*/g,c):t]}if(Array.isArray(t))return t.flatMap(e=>f(r,e,n,o,c));if(d(t)){for(const e of Object.keys(t)){if(R.test(e))throw s(g,"Cannot contain numeric property keys");if(e==="default"||o.includes(e))return f(r,t[e],n,o,c)}return[]}throw s(E,`Invalid "${r}" target "${t}"`)},a="*",v=(r,t)=>{const n=r.indexOf(a),o=t.indexOf(a);return n===o?t.length>r.length:o>n};function A(r,t){if(!t.includes(a)&&r.hasOwnProperty(t))return[t];let n,o;for(const c of Object.keys(r))if(c.includes(a)){const[e,i,l]=c.split(a);if(l===void 0&&t.startsWith(e)&&t.endsWith(i)){const _=t.slice(e.length,-i.length||void 0);_&&(!n||v(n,c))&&(n=c,o=_)}}return[n,o]}const p=r=>Object.keys(r).reduce((t,n)=>{const o=n===""||n[0]!==".";if(t===void 0||t===o)return o;throw s(g,'"exports" cannot contain some keys starting with "." and some not')},void 0),w=/^\w+:/,m=(r,t,n)=>{if(!r)throw new Error('"exports" is required');t=t===""?".":`./${t}`,(typeof r=="string"||Array.isArray(r)||d(r)&&p(r))&&(r={".":r});const[o,c]=A(r,t),e=f(h.Export,r[o],t,n,c);if(e.length===0)throw s(I,t==="."?'No "exports" main defined':`Package subpath '${t}' is not defined by "exports"`);for(const i of e)if(!i.startsWith("./")&&!w.test(i))throw s(E,`Invalid "exports" target "${i}" defined in the package config`);return e},T=(r,t,n)=>{if(!r)throw new Error('"imports" is required');const[o,c]=A(r,t),e=f(h.Import,r[o],t,n,c);if(e.length===0)throw s(P,`Package import specifier "${t}" is not defined in package`);return e};exports.resolveExports=m,exports.resolveImports=T;


/***/ }),

/***/ 292:
/***/ ((module, exports, __webpack_require__) => {

/* module decorator */ module = __webpack_require__.nmd(module);
var t=__webpack_require__(437),n=__webpack_require__(564),q=__webpack_require__(411),c=__webpack_require__(41);__webpack_require__(188),__webpack_require__(33),__webpack_require__(561),__webpack_require__(857),__webpack_require__(11),__webpack_require__(999),__webpack_require__(5),__webpack_require__(612),__webpack_require__(769),__webpack_require__(373),__webpack_require__(952),__webpack_require__(503),__webpack_require__(420);const a=(r,e)=>{if(!e)throw new Error("The current file path (__filename or import.meta.url) must be provided in the second argument of tsx.require()");return(typeof e=="string"&&e.startsWith("file://")||e instanceof URL)&&(e=c.fileURLToPath(e)),q.resolve(q.dirname(e),r)},i=(r,e)=>{const u=a(r,e),s=n.register();try{return t.require(u)}finally{s()}},o=(r,e,u)=>{const s=a(r,e);return n.resolveFilename(s,module,!1,u)};o.paths=t.require.resolve.paths,i.resolve=o,i.main=t.require.main,i.extensions=t.require.extensions,i.cache=t.require.cache,exports.register=n.register,exports.require=i;


/***/ }),

/***/ 952:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var a=__webpack_require__(503),f=__webpack_require__(420);const p=()=>new Promise(e=>{const s=f.getPipePath(process.ppid),n=a.createConnection(s,()=>{e(i=>{const t=Buffer.from(JSON.stringify(i)),r=Buffer.alloc(4);r.writeInt32BE(t.length,0),n.write(Buffer.concat([r,t]))})});n.on("error",()=>{e()}),n.unref()}),o={send:void 0},c=p();c.then(e=>{o.send=e},()=>{}),exports.connectingToServer=c,exports.parent=o;


/***/ }),

/***/ 420:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var t=__webpack_require__(411),p=__webpack_require__(769);const i=process.platform==="win32",s=r=>{const e=t.join(p.tmpdir,`${r}.pipe`);return i?`\\\\?\\pipe\\${e}`:e};exports.getPipePath=s,exports.isWindows=i;


/***/ }),

/***/ 564:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var c=__webpack_require__(33),F=__webpack_require__(561),u=__webpack_require__(857),m=__webpack_require__(11),a=__webpack_require__(373),T=__webpack_require__(952),p=__webpack_require__(411);const M=s=>{if(s.includes("import")||s.includes("export"))try{return m.parseEsm(s)[3]}catch{return!0}return!1},g=/\.[cm]?tsx?$/,l=process.env.TSX_TSCONFIG_PATH?{path:p.resolve(process.env.TSX_TSCONFIG_PATH),config:u.parseTsconfig(process.env.TSX_TSCONFIG_PATH)}:u.getTsconfig(),E=[".cts",".mts",".ts",".tsx",".jsx"],O=[".js",".cjs",".mjs"],j=l&&u.createFilesMatcher(l),d=Object.assign(Object.create(null),c._extensions),b=d[".js"],h=(s,e)=>{T.parent?.send&&T.parent.send({type:"dependency",path:e});const r=E.some(t=>e.endsWith(t)),o=O.some(t=>e.endsWith(t));if(!r&&!o)return b(s,e);let n=F.readFileSync(e,"utf8");if(e.endsWith(".cjs")){const t=m.transformDynamicImport(e,n);t&&(n=a.shouldApplySourceMap()?a.inlineSourceMap(t):t.code)}else if(r||M(n)){const t=m.transformSync(n,e,{tsconfigRaw:j?.(e)});n=a.shouldApplySourceMap()?a.inlineSourceMap(t):t.code}s._compile(n,e)};[".js",".ts",".tsx",".jsx"].forEach(s=>{d[s]=h}),Object.defineProperty(d,".mjs",{value:h,enumerable:!1});const A=`${p.sep}node_modules${p.sep}`,x=l&&u.createPathsMatcher(l),v=c._resolveFilename.bind(c),S=(s,e,r,o)=>{const n=a.resolveTsPath(s);if(e?.filename&&(g.test(e.filename)||l?.config.compilerOptions?.allowJs)&&n)for(const t of n)try{return v(t,e,r,o)}catch(f){const{code:i}=f;if(i!=="MODULE_NOT_FOUND"&&i!=="ERR_PACKAGE_PATH_NOT_EXPORTED")throw f}},y=(s,e,r,o)=>{const n=s.indexOf("?");if(n!==-1&&(s=s.slice(0,n)),x&&!a.isRelativePath(s)&&!e?.filename?.includes(A)){const f=x(s);for(const i of f){const _=S(i,e,r,o);if(_)return _;try{return v(i,e,r,o)}catch{}}}const t=S(s,e,r,o);return t||v(s,e,r,o)},P=()=>{const{sourceMapsEnabled:s}=process,{_extensions:e,_resolveFilename:r}=c;return process.setSourceMapsEnabled(!0),c._extensions=d,c._resolveFilename=y,()=>{s===!1&&process.setSourceMapsEnabled(!1),c._extensions=e,c._resolveFilename=r}};exports.register=P,exports.resolveFilename=y;


/***/ }),

/***/ 11:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var Xt=__webpack_require__(41),re=__webpack_require__(999),jt=__webpack_require__(5),x=__webpack_require__(561),P=__webpack_require__(411),Pt=__webpack_require__(612),Tt=__webpack_require__(769);const Je=n=>jt.createHash("sha1").update(n).digest("hex"),Re=44,Wt=59,ve="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",xe=new Uint8Array(64),Ue=new Uint8Array(128);for(let n=0;n<ve.length;n++){const e=ve.charCodeAt(n);xe[n]=e,Ue[e]=n}const we=typeof TextDecoder<"u"?new TextDecoder:typeof Buffer<"u"?{decode(n){return Buffer.from(n.buffer,n.byteOffset,n.byteLength).toString()}}:{decode(n){let e="";for(let A=0;A<n.length;A++)e+=String.fromCharCode(n[A]);return e}};function $t(n){const e=new Int32Array(5),A=[];let i=0;do{const o=Zt(n,i),a=[];let c=!0,C=0;e[0]=0;for(let f=i;f<o;f++){let Q;f=T(n,f,e,0);const u=e[0];u<C&&(c=!1),C=u,Fe(n,f,o)?(f=T(n,f,e,1),f=T(n,f,e,2),f=T(n,f,e,3),Fe(n,f,o)?(f=T(n,f,e,4),Q=[u,e[1],e[2],e[3],e[4]]):Q=[u,e[1],e[2],e[3]]):Q=[u],a.push(Q)}c||zt(a),A.push(a),i=o+1}while(i<=n.length);return A}function Zt(n,e){const A=n.indexOf(";",e);return A===-1?n.length:A}function T(n,e,A,i){let o=0,a=0,c=0;do{const f=n.charCodeAt(e++);c=Ue[f],o|=(c&31)<<a,a+=5}while(c&32);const C=o&1;return o>>>=1,C&&(o=-2147483648|-o),A[i]+=o,e}function Fe(n,e,A){return e>=A?!1:n.charCodeAt(e)!==Re}function zt(n){n.sort(Vt)}function Vt(n,e){return n[0]-e[0]}function Ge(n){const e=new Int32Array(5),A=1024*16,i=A-36,o=new Uint8Array(A),a=o.subarray(0,i);let c=0,C="";for(let f=0;f<n.length;f++){const Q=n[f];if(f>0&&(c===A&&(C+=we.decode(o),c=0),o[c++]=Wt),Q.length!==0){e[0]=0;for(let u=0;u<Q.length;u++){const r=Q[u];c>i&&(C+=we.decode(a),o.copyWithin(0,i,c),c-=i),u>0&&(o[c++]=Re),c=W(o,c,e,r,0),r.length!==1&&(c=W(o,c,e,r,1),c=W(o,c,e,r,2),c=W(o,c,e,r,3),r.length!==4&&(c=W(o,c,e,r,4)))}}}return C+we.decode(o.subarray(0,c))}function W(n,e,A,i,o){const a=i[o];let c=a-A[o];A[o]=a,c=c<0?-c<<1|1:c<<1;do{let C=c&31;c>>>=5,c>0&&(C|=32),n[e++]=xe[C]}while(c>0);return e}class ae{constructor(e){this.bits=e instanceof ae?e.bits.slice():[]}add(e){this.bits[e>>5]|=1<<(e&31)}has(e){return!!(this.bits[e>>5]&1<<(e&31))}}class V{constructor(e,A,i){this.start=e,this.end=A,this.original=i,this.intro="",this.outro="",this.content=i,this.storeName=!1,this.edited=!1,this.previous=null,this.next=null}appendLeft(e){this.outro+=e}appendRight(e){this.intro=this.intro+e}clone(){const e=new V(this.start,this.end,this.original);return e.intro=this.intro,e.outro=this.outro,e.content=this.content,e.storeName=this.storeName,e.edited=this.edited,e}contains(e){return this.start<e&&e<this.end}eachNext(e){let A=this;for(;A;)e(A),A=A.next}eachPrevious(e){let A=this;for(;A;)e(A),A=A.previous}edit(e,A,i){return this.content=e,i||(this.intro="",this.outro=""),this.storeName=A,this.edited=!0,this}prependLeft(e){this.outro=e+this.outro}prependRight(e){this.intro=e+this.intro}reset(){this.intro="",this.outro="",this.edited&&(this.content=this.original,this.storeName=!1,this.edited=!1)}split(e){const A=e-this.start,i=this.original.slice(0,A),o=this.original.slice(A);this.original=i;const a=new V(e,this.end,o);return a.outro=this.outro,this.outro="",this.end=e,this.edited?(a.edit("",!1),this.content=""):this.content=i,a.next=this.next,a.next&&(a.next.previous=a),a.previous=this,this.next=a,a}toString(){return this.intro+this.content+this.outro}trimEnd(e){if(this.outro=this.outro.replace(e,""),this.outro.length)return!0;const A=this.content.replace(e,"");if(A.length)return A!==this.content&&(this.split(this.start+A.length).edit("",void 0,!0),this.edited&&this.edit(A,this.storeName,!0)),!0;if(this.edit("",void 0,!0),this.intro=this.intro.replace(e,""),this.intro.length)return!0}trimStart(e){if(this.intro=this.intro.replace(e,""),this.intro.length)return!0;const A=this.content.replace(e,"");if(A.length){if(A!==this.content){const i=this.split(this.end-A.length);this.edited&&i.edit(A,this.storeName,!0),this.edit("",void 0,!0)}return!0}else if(this.edit("",void 0,!0),this.outro=this.outro.replace(e,""),this.outro.length)return!0}}function eA(){return typeof globalThis<"u"&&typeof globalThis.btoa=="function"?n=>globalThis.btoa(unescape(encodeURIComponent(n))):typeof Buffer=="function"?n=>Buffer.from(n,"utf-8").toString("base64"):()=>{throw new Error("Unsupported environment: `window.btoa` or `Buffer` should be supported.")}}const tA=eA();let AA=class{constructor(e){this.version=3,this.file=e.file,this.sources=e.sources,this.sourcesContent=e.sourcesContent,this.names=e.names,this.mappings=Ge(e.mappings),typeof e.x_google_ignoreList<"u"&&(this.x_google_ignoreList=e.x_google_ignoreList)}toString(){return JSON.stringify(this)}toUrl(){return"data:application/json;charset=utf-8;base64,"+tA(this.toString())}};function rA(n){const e=n.split(`
`),A=e.filter(a=>/^\t+/.test(a)),i=e.filter(a=>/^ {2,}/.test(a));if(A.length===0&&i.length===0)return null;if(A.length>=i.length)return"	";const o=i.reduce((a,c)=>{const C=/^ +/.exec(c)[0].length;return Math.min(C,a)},1/0);return new Array(o+1).join(" ")}function iA(n,e){const A=n.split(/[/\\]/),i=e.split(/[/\\]/);for(A.pop();A[0]===i[0];)A.shift(),i.shift();if(A.length){let o=A.length;for(;o--;)A[o]=".."}return A.concat(i).join("/")}const nA=Object.prototype.toString;function sA(n){return nA.call(n)==="[object Object]"}function Me(n){const e=n.split(`
`),A=[];for(let i=0,o=0;i<e.length;i++)A.push(o),o+=e[i].length+1;return function(o){let a=0,c=A.length;for(;a<c;){const Q=a+c>>1;o<A[Q]?c=Q:a=Q+1}const C=a-1,f=o-A[C];return{line:C,column:f}}}const oA=/\w/;class aA{constructor(e){this.hires=e,this.generatedCodeLine=0,this.generatedCodeColumn=0,this.raw=[],this.rawSegments=this.raw[this.generatedCodeLine]=[],this.pending=null}addEdit(e,A,i,o){if(A.length){const a=A.length-1;let c=A.indexOf(`
`,0),C=-1;for(;c>=0&&a>c;){const Q=[this.generatedCodeColumn,e,i.line,i.column];o>=0&&Q.push(o),this.rawSegments.push(Q),this.generatedCodeLine+=1,this.raw[this.generatedCodeLine]=this.rawSegments=[],this.generatedCodeColumn=0,C=c,c=A.indexOf(`
`,c+1)}const f=[this.generatedCodeColumn,e,i.line,i.column];o>=0&&f.push(o),this.rawSegments.push(f),this.advance(A.slice(C+1))}else this.pending&&(this.rawSegments.push(this.pending),this.advance(A));this.pending=null}addUneditedChunk(e,A,i,o,a){let c=A.start,C=!0,f=!1;for(;c<A.end;){if(this.hires||C||a.has(c)){const Q=[this.generatedCodeColumn,e,o.line,o.column];this.hires==="boundary"?oA.test(i[c])?f||(this.rawSegments.push(Q),f=!0):(this.rawSegments.push(Q),f=!1):this.rawSegments.push(Q)}i[c]===`
`?(o.line+=1,o.column=0,this.generatedCodeLine+=1,this.raw[this.generatedCodeLine]=this.rawSegments=[],this.generatedCodeColumn=0,C=!0):(o.column+=1,this.generatedCodeColumn+=1,C=!1),c+=1}this.pending=null}advance(e){if(!e)return;const A=e.split(`
`);if(A.length>1){for(let i=0;i<A.length-1;i++)this.generatedCodeLine++,this.raw[this.generatedCodeLine]=this.rawSegments=[];this.generatedCodeColumn=0}this.generatedCodeColumn+=A[A.length-1].length}}const $=`
`,O={insertLeft:!1,insertRight:!1,storeName:!1};class Ke{constructor(e,A={}){const i=new V(0,e.length,e);Object.defineProperties(this,{original:{writable:!0,value:e},outro:{writable:!0,value:""},intro:{writable:!0,value:""},firstChunk:{writable:!0,value:i},lastChunk:{writable:!0,value:i},lastSearchedChunk:{writable:!0,value:i},byStart:{writable:!0,value:{}},byEnd:{writable:!0,value:{}},filename:{writable:!0,value:A.filename},indentExclusionRanges:{writable:!0,value:A.indentExclusionRanges},sourcemapLocations:{writable:!0,value:new ae},storedNames:{writable:!0,value:{}},indentStr:{writable:!0,value:void 0},ignoreList:{writable:!0,value:A.ignoreList}}),this.byStart[0]=i,this.byEnd[e.length]=i}addSourcemapLocation(e){this.sourcemapLocations.add(e)}append(e){if(typeof e!="string")throw new TypeError("outro content must be a string");return this.outro+=e,this}appendLeft(e,A){if(typeof A!="string")throw new TypeError("inserted content must be a string");this._split(e);const i=this.byEnd[e];return i?i.appendLeft(A):this.intro+=A,this}appendRight(e,A){if(typeof A!="string")throw new TypeError("inserted content must be a string");this._split(e);const i=this.byStart[e];return i?i.appendRight(A):this.outro+=A,this}clone(){const e=new Ke(this.original,{filename:this.filename});let A=this.firstChunk,i=e.firstChunk=e.lastSearchedChunk=A.clone();for(;A;){e.byStart[i.start]=i,e.byEnd[i.end]=i;const o=A.next,a=o&&o.clone();a&&(i.next=a,a.previous=i,i=a),A=o}return e.lastChunk=i,this.indentExclusionRanges&&(e.indentExclusionRanges=this.indentExclusionRanges.slice()),e.sourcemapLocations=new ae(this.sourcemapLocations),e.intro=this.intro,e.outro=this.outro,e}generateDecodedMap(e){e=e||{};const A=0,i=Object.keys(this.storedNames),o=new aA(e.hires),a=Me(this.original);return this.intro&&o.advance(this.intro),this.firstChunk.eachNext(c=>{const C=a(c.start);c.intro.length&&o.advance(c.intro),c.edited?o.addEdit(A,c.content,C,c.storeName?i.indexOf(c.original):-1):o.addUneditedChunk(A,c,this.original,C,this.sourcemapLocations),c.outro.length&&o.advance(c.outro)}),{file:e.file?e.file.split(/[/\\]/).pop():void 0,sources:[e.source?iA(e.file||"",e.source):e.file||""],sourcesContent:e.includeContent?[this.original]:void 0,names:i,mappings:o.raw,x_google_ignoreList:this.ignoreList?[A]:void 0}}generateMap(e){return new AA(this.generateDecodedMap(e))}_ensureindentStr(){this.indentStr===void 0&&(this.indentStr=rA(this.original))}_getRawIndentString(){return this._ensureindentStr(),this.indentStr}getIndentString(){return this._ensureindentStr(),this.indentStr===null?"	":this.indentStr}indent(e,A){const i=/^[^\r\n]/gm;if(sA(e)&&(A=e,e=void 0),e===void 0&&(this._ensureindentStr(),e=this.indentStr||"	"),e==="")return this;A=A||{};const o={};A.exclude&&(typeof A.exclude[0]=="number"?[A.exclude]:A.exclude).forEach(u=>{for(let r=u[0];r<u[1];r+=1)o[r]=!0});let a=A.indentStart!==!1;const c=Q=>a?`${e}${Q}`:(a=!0,Q);this.intro=this.intro.replace(i,c);let C=0,f=this.firstChunk;for(;f;){const Q=f.end;if(f.edited)o[C]||(f.content=f.content.replace(i,c),f.content.length&&(a=f.content[f.content.length-1]===`
`));else for(C=f.start;C<Q;){if(!o[C]){const u=this.original[C];u===`
`?a=!0:u!=="\r"&&a&&(a=!1,C===f.start||(this._splitChunk(f,C),f=f.next),f.prependRight(e))}C+=1}C=f.end,f=f.next}return this.outro=this.outro.replace(i,c),this}insert(){throw new Error("magicString.insert(...) is deprecated. Use prependRight(...) or appendLeft(...)")}insertLeft(e,A){return O.insertLeft||(console.warn("magicString.insertLeft(...) is deprecated. Use magicString.appendLeft(...) instead"),O.insertLeft=!0),this.appendLeft(e,A)}insertRight(e,A){return O.insertRight||(console.warn("magicString.insertRight(...) is deprecated. Use magicString.prependRight(...) instead"),O.insertRight=!0),this.prependRight(e,A)}move(e,A,i){if(i>=e&&i<=A)throw new Error("Cannot move a selection inside itself");this._split(e),this._split(A),this._split(i);const o=this.byStart[e],a=this.byEnd[A],c=o.previous,C=a.next,f=this.byStart[i];if(!f&&a===this.lastChunk)return this;const Q=f?f.previous:this.lastChunk;return c&&(c.next=C),C&&(C.previous=c),Q&&(Q.next=o),f&&(f.previous=a),o.previous||(this.firstChunk=a.next),a.next||(this.lastChunk=o.previous,this.lastChunk.next=null),o.previous=Q,a.next=f||null,Q||(this.firstChunk=o),f||(this.lastChunk=a),this}overwrite(e,A,i,o){return o=o||{},this.update(e,A,i,{...o,overwrite:!o.contentOnly})}update(e,A,i,o){if(typeof i!="string")throw new TypeError("replacement content must be a string");for(;e<0;)e+=this.original.length;for(;A<0;)A+=this.original.length;if(A>this.original.length)throw new Error("end is out of bounds");if(e===A)throw new Error("Cannot overwrite a zero-length range \u2013 use appendLeft or prependRight instead");this._split(e),this._split(A),o===!0&&(O.storeName||(console.warn("The final argument to magicString.overwrite(...) should be an options object. See https://github.com/rich-harris/magic-string"),O.storeName=!0),o={storeName:!0});const a=o!==void 0?o.storeName:!1,c=o!==void 0?o.overwrite:!1;if(a){const Q=this.original.slice(e,A);Object.defineProperty(this.storedNames,Q,{writable:!0,value:!0,enumerable:!0})}const C=this.byStart[e],f=this.byEnd[A];if(C){let Q=C;for(;Q!==f;){if(Q.next!==this.byStart[Q.end])throw new Error("Cannot overwrite across a split point");Q=Q.next,Q.edit("",!1)}C.edit(i,a,!c)}else{const Q=new V(e,A,"").edit(i,a);f.next=Q,Q.previous=f}return this}prepend(e){if(typeof e!="string")throw new TypeError("outro content must be a string");return this.intro=e+this.intro,this}prependLeft(e,A){if(typeof A!="string")throw new TypeError("inserted content must be a string");this._split(e);const i=this.byEnd[e];return i?i.prependLeft(A):this.intro=A+this.intro,this}prependRight(e,A){if(typeof A!="string")throw new TypeError("inserted content must be a string");this._split(e);const i=this.byStart[e];return i?i.prependRight(A):this.outro=A+this.outro,this}remove(e,A){for(;e<0;)e+=this.original.length;for(;A<0;)A+=this.original.length;if(e===A)return this;if(e<0||A>this.original.length)throw new Error("Character is out of bounds");if(e>A)throw new Error("end must be greater than start");this._split(e),this._split(A);let i=this.byStart[e];for(;i;)i.intro="",i.outro="",i.edit(""),i=A>i.end?this.byStart[i.end]:null;return this}reset(e,A){for(;e<0;)e+=this.original.length;for(;A<0;)A+=this.original.length;if(e===A)return this;if(e<0||A>this.original.length)throw new Error("Character is out of bounds");if(e>A)throw new Error("end must be greater than start");this._split(e),this._split(A);let i=this.byStart[e];for(;i;)i.reset(),i=A>i.end?this.byStart[i.end]:null;return this}lastChar(){if(this.outro.length)return this.outro[this.outro.length-1];let e=this.lastChunk;do{if(e.outro.length)return e.outro[e.outro.length-1];if(e.content.length)return e.content[e.content.length-1];if(e.intro.length)return e.intro[e.intro.length-1]}while(e=e.previous);return this.intro.length?this.intro[this.intro.length-1]:""}lastLine(){let e=this.outro.lastIndexOf($);if(e!==-1)return this.outro.substr(e+1);let A=this.outro,i=this.lastChunk;do{if(i.outro.length>0){if(e=i.outro.lastIndexOf($),e!==-1)return i.outro.substr(e+1)+A;A=i.outro+A}if(i.content.length>0){if(e=i.content.lastIndexOf($),e!==-1)return i.content.substr(e+1)+A;A=i.content+A}if(i.intro.length>0){if(e=i.intro.lastIndexOf($),e!==-1)return i.intro.substr(e+1)+A;A=i.intro+A}}while(i=i.previous);return e=this.intro.lastIndexOf($),e!==-1?this.intro.substr(e+1)+A:this.intro+A}slice(e=0,A=this.original.length){for(;e<0;)e+=this.original.length;for(;A<0;)A+=this.original.length;let i="",o=this.firstChunk;for(;o&&(o.start>e||o.end<=e);){if(o.start<A&&o.end>=A)return i;o=o.next}if(o&&o.edited&&o.start!==e)throw new Error(`Cannot use replaced character ${e} as slice start anchor.`);const a=o;for(;o;){o.intro&&(a!==o||o.start===e)&&(i+=o.intro);const c=o.start<A&&o.end>=A;if(c&&o.edited&&o.end!==A)throw new Error(`Cannot use replaced character ${A} as slice end anchor.`);const C=a===o?e-o.start:0,f=c?o.content.length+A-o.end:o.content.length;if(i+=o.content.slice(C,f),o.outro&&(!c||o.end===A)&&(i+=o.outro),c)break;o=o.next}return i}snip(e,A){const i=this.clone();return i.remove(0,e),i.remove(A,i.original.length),i}_split(e){if(this.byStart[e]||this.byEnd[e])return;let A=this.lastSearchedChunk;const i=e>A.end;for(;A;){if(A.contains(e))return this._splitChunk(A,e);A=i?this.byStart[A.end]:this.byEnd[A.start]}}_splitChunk(e,A){if(e.edited&&e.content.length){const o=Me(this.original)(A);throw new Error(`Cannot split a chunk that has already been edited (${o.line}:${o.column} \u2013 "${e.original}")`)}const i=e.split(A);return this.byEnd[A]=e,this.byStart[A]=i,this.byEnd[i.end]=i,e===this.lastChunk&&(this.lastChunk=i),this.lastSearchedChunk=e,!0}toString(){let e=this.intro,A=this.firstChunk;for(;A;)e+=A.toString(),A=A.next;return e+this.outro}isEmpty(){let e=this.firstChunk;do if(e.intro.length&&e.intro.trim()||e.content.length&&e.content.trim()||e.outro.length&&e.outro.trim())return!1;while(e=e.next);return!0}length(){let e=this.firstChunk,A=0;do A+=e.intro.length+e.content.length+e.outro.length;while(e=e.next);return A}trimLines(){return this.trim("[\\r\\n]")}trim(e){return this.trimStart(e).trimEnd(e)}trimEndAborted(e){const A=new RegExp((e||"\\s")+"+$");if(this.outro=this.outro.replace(A,""),this.outro.length)return!0;let i=this.lastChunk;do{const o=i.end,a=i.trimEnd(A);if(i.end!==o&&(this.lastChunk===i&&(this.lastChunk=i.next),this.byEnd[i.end]=i,this.byStart[i.next.start]=i.next,this.byEnd[i.next.end]=i.next),a)return!0;i=i.previous}while(i);return!1}trimEnd(e){return this.trimEndAborted(e),this}trimStartAborted(e){const A=new RegExp("^"+(e||"\\s")+"+");if(this.intro=this.intro.replace(A,""),this.intro.length)return!0;let i=this.firstChunk;do{const o=i.end,a=i.trimStart(A);if(i.end!==o&&(i===this.lastChunk&&(this.lastChunk=i.next),this.byEnd[i.end]=i,this.byStart[i.next.start]=i.next,this.byEnd[i.next.end]=i.next),a)return!0;i=i.next}while(i);return!1}trimStart(e){return this.trimStartAborted(e),this}hasChanged(){return this.original!==this.toString()}_replaceRegexp(e,A){function i(a,c){return typeof A=="string"?A.replace(/\$(\$|&|\d+)/g,(C,f)=>f==="$"?"$":f==="&"?a[0]:+f<a.length?a[+f]:`$${f}`):A(...a,a.index,c,a.groups)}function o(a,c){let C;const f=[];for(;C=a.exec(c);)f.push(C);return f}if(e.global)o(e,this.original).forEach(c=>{if(c.index!=null){const C=i(c,this.original);C!==c[0]&&this.overwrite(c.index,c.index+c[0].length,C)}});else{const a=this.original.match(e);if(a&&a.index!=null){const c=i(a,this.original);c!==a[0]&&this.overwrite(a.index,a.index+a[0].length,c)}}return this}_replaceString(e,A){const{original:i}=this,o=i.indexOf(e);return o!==-1&&this.overwrite(o,o+e.length,A),this}replace(e,A){return typeof e=="string"?this._replaceString(e,A):this._replaceRegexp(e,A)}_replaceAllString(e,A){const{original:i}=this,o=e.length;for(let a=i.indexOf(e);a!==-1;a=i.indexOf(e,a+o))i.slice(a,a+o)!==A&&this.overwrite(a,a+o,A);return this}replaceAll(e,A){if(typeof e=="string")return this._replaceAllString(e,A);if(!e.global)throw new TypeError("MagicString.prototype.replaceAll called with a non-global RegExp argument");return this._replaceRegexp(e,A)}}var Ye;(function(n){n[n.Static=1]="Static",n[n.Dynamic=2]="Dynamic",n[n.ImportMeta=3]="ImportMeta",n[n.StaticSourcePhase=4]="StaticSourcePhase",n[n.DynamicSourcePhase=5]="DynamicSourcePhase"})(Ye||(Ye={}));const cA=new Uint8Array(new Uint16Array([1]).buffer)[0]===1;function qe(n,e="@"){if(!d)return _e.then(()=>qe(n));const A=n.length+1,i=(d.__heap_base.value||d.__heap_base)+4*A-d.memory.buffer.byteLength;i>0&&d.memory.grow(Math.ceil(i/65536));const o=d.sa(A-1);if((cA?lA:hA)(n,new Uint16Array(d.memory.buffer,o,A)),!d.parse())throw Object.assign(new Error(`Parse error ${e}:${n.slice(0,d.e()).split(`
`).length}:${d.e()-n.lastIndexOf(`
`,d.e()-1)}`),{idx:d.e()});const a=[],c=[];for(;d.ri();){const f=d.is(),Q=d.ie(),u=d.it(),r=d.ai(),D=d.id(),p=d.ss(),I=d.se();let S;d.ip()&&(S=C(n.slice(D===-1?f-1:f,D===-1?Q+1:Q))),a.push({n:S,t:u,s:f,e:Q,ss:p,se:I,d:D,a:r})}for(;d.re();){const f=d.es(),Q=d.ee(),u=d.els(),r=d.ele(),D=n.slice(f,Q),p=D[0],I=u<0?void 0:n.slice(u,r),S=I?I[0]:"";c.push({s:f,e:Q,ls:u,le:r,n:p==='"'||p==="'"?C(D):D,ln:S==='"'||S==="'"?C(I):I})}function C(f){try{return(0,eval)(f)}catch{}}return[a,c,!!d.f(),!!d.ms()]}function hA(n,e){const A=n.length;let i=0;for(;i<A;){const o=n.charCodeAt(i);e[i++]=(255&o)<<8|o>>>8}}function lA(n,e){const A=n.length;let i=0;for(;i<A;)e[i]=n.charCodeAt(i++)}let d;const _e=WebAssembly.compile((Ie="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",typeof Buffer<"u"?Buffer.from(Ie,"base64"):Uint8Array.from(atob(Ie),n=>n.charCodeAt(0)))).then(WebAssembly.instantiate).then(({exports:n})=>{d=n});var Ie;let m,ie,ke,Z=2<<19;const Oe=new Uint8Array(new Uint16Array([1]).buffer)[0]===1?function(n,e){const A=n.length;let i=0;for(;i<A;)e[i]=n.charCodeAt(i++)}:function(n,e){const A=n.length;let i=0;for(;i<A;){const o=n.charCodeAt(i);e[i++]=(255&o)<<8|o>>>8}},uA="xportmportlassetaourceromsyncunctionssertvoyiedelecontininstantybreareturdebuggeawaithrwhileforifcatcfinallels";let N,He,w;function fA(n,e="@"){N=n,He=e;const A=2*N.length+(2<<18);if(A>Z||!m){for(;A>Z;)Z*=2;ie=new ArrayBuffer(Z),Oe(uA,new Uint16Array(ie,16,110)),m=function(c,C,f){var Q=new c.Int8Array(f),u=new c.Int16Array(f),r=new c.Int32Array(f),D=new c.Uint8Array(f),p=new c.Uint16Array(f),I=1040;function S(){var t=0,s=0,l=0,g=0,h=0,B=0;B=I,I=I+10240|0,Q[804]=1,Q[803]=0,u[399]=0,u[400]=0,r[69]=r[2],Q[805]=0,r[68]=0,Q[802]=0,r[70]=B+2048,r[71]=B,Q[806]=0,t=(r[3]|0)+-2|0,r[72]=t,s=t+(r[66]<<1)|0,r[73]=s;e:for(;;){if(l=t+2|0,r[72]=l,t>>>0>=s>>>0){h=18;break}A:do switch(u[l>>1]|0){case 9:case 10:case 11:case 12:case 13:case 32:break;case 101:{if(!(u[400]|0)&&X(l)|0&&!(y(t+4|0,16,10)|0)&&(v(),(Q[804]|0)==0)){h=9;break e}else h=17;break}case 105:{X(l)|0&&!(y(t+4|0,26,10)|0)&&Y(),h=17;break}case 59:{h=17;break}case 47:switch(u[t+4>>1]|0){case 47:{Qe();break A}case 42:{fe(1);break A}default:{h=16;break e}}default:{h=16;break e}}while(!1);(h|0)==17&&(h=0,r[69]=r[72]),t=r[72]|0,s=r[73]|0}(h|0)==9?(t=r[72]|0,r[69]=t,h=19):(h|0)==16?(Q[804]=0,r[72]=t,h=19):(h|0)==18&&(Q[802]|0?t=0:(t=l,h=19));do if((h|0)==19){e:for(;;){if(s=t+2|0,r[72]=s,t>>>0>=(r[73]|0)>>>0){h=86;break}A:do switch(u[s>>1]|0){case 9:case 10:case 11:case 12:case 13:case 32:break;case 101:{!(u[400]|0)&&X(s)|0&&!(y(t+4|0,16,10)|0)&&v(),h=85;break}case 105:{X(s)|0&&!(y(t+4|0,26,10)|0)&&Y(),h=85;break}case 99:{X(s)|0&&!(y(t+4|0,36,8)|0)&&_(u[t+12>>1]|0)|0&&(Q[806]=1),h=85;break}case 40:{g=r[70]|0,s=u[400]|0,h=s&65535,r[g+(h<<3)>>2]=1,l=r[69]|0,u[400]=s+1<<16>>16,r[g+(h<<3)+4>>2]=l,h=85;break}case 41:{if(s=u[400]|0,!(s<<16>>16)){h=36;break e}h=s+-1<<16>>16,u[400]=h,g=u[399]|0,s=g&65535,g<<16>>16&&(r[(r[70]|0)+((h&65535)<<3)>>2]|0)==5&&(s=r[(r[71]|0)+(s+-1<<2)>>2]|0,l=s+4|0,r[l>>2]|0||(r[l>>2]=(r[69]|0)+2),r[s+12>>2]=t+4,u[399]=g+-1<<16>>16),h=85;break}case 123:{h=r[69]|0,g=r[63]|0,t=h;do if((u[h>>1]|0)==41&(g|0)!=0&&(r[g+4>>2]|0)==(h|0))if(s=r[64]|0,r[63]=s,s){r[s+32>>2]=0;break}else{r[59]=0;break}while(!1);g=r[70]|0,l=u[400]|0,h=l&65535,r[g+(h<<3)>>2]=Q[806]|0?6:2,u[400]=l+1<<16>>16,r[g+(h<<3)+4>>2]=t,Q[806]=0,h=85;break}case 125:{if(t=u[400]|0,!(t<<16>>16)){h=49;break e}g=r[70]|0,h=t+-1<<16>>16,u[400]=h,(r[g+((h&65535)<<3)>>2]|0)==4&&Ne(),h=85;break}case 39:{J(39),h=85;break}case 34:{J(34),h=85;break}case 47:switch(u[t+4>>1]|0){case 47:{Qe();break A}case 42:{fe(1);break A}default:{t=r[69]|0,s=u[t>>1]|0;t:do if(kt(s)|0)switch(s<<16>>16){case 46:if(((u[t+-2>>1]|0)+-48&65535)<10){h=66;break t}else break t;case 43:if((u[t+-2>>1]|0)==43){h=66;break t}else break t;case 45:if((u[t+-2>>1]|0)==45){h=66;break t}else break t;default:break t}else{switch(s<<16>>16){case 41:if(Dt(r[(r[70]|0)+(p[400]<<3)+4>>2]|0)|0)break t;h=66;break t;case 125:break;default:{h=66;break t}}l=r[70]|0,g=p[400]|0,!(It(r[l+(g<<3)+4>>2]|0)|0)&&(r[l+(g<<3)>>2]|0)!=6&&(h=66)}while(!1);t:do if((h|0)==66&&!(ce(t)|0)){switch(s<<16>>16){case 0:break t;case 47:{if(Q[805]|0)break t;break}default:}if(h=r[65]|0,h|0&&t>>>0>=(r[h>>2]|0)>>>0&&t>>>0<=(r[h+4>>2]|0)>>>0){ue(),Q[805]=0,h=85;break A}l=r[3]|0;do{if(t>>>0<=l>>>0)break;t=t+-2|0,r[69]=t,s=u[t>>1]|0}while(!(te(s)|0));if(Ae(s)|0){do{if(t>>>0<=l>>>0)break;t=t+-2|0,r[69]=t}while(Ae(u[t>>1]|0)|0);if(bt(t)|0){ue(),Q[805]=0,h=85;break A}}Q[805]=1,h=85;break A}while(!1);ue(),Q[805]=0,h=85;break A}}case 96:{g=r[70]|0,l=u[400]|0,h=l&65535,r[g+(h<<3)+4>>2]=r[69],u[400]=l+1<<16>>16,r[g+(h<<3)>>2]=3,Ne(),h=85;break}default:h=85}while(!1);(h|0)==85&&(h=0,r[69]=r[72]),t=r[72]|0}if((h|0)==36){R(),t=0;break}else if((h|0)==49){R(),t=0;break}else if((h|0)==86){t=Q[802]|0?0:(u[399]|u[400])<<16>>16==0;break}}while(!1);return I=B,t|0}function v(){var t=0,s=0,l=0,g=0,h=0,B=0,K=0,G=0,Ce=0,Be=0,Ee=0,de=0,k=0,b=0;G=r[72]|0,Ce=r[65]|0,b=G+12|0,r[72]=b,l=E(1)|0,t=r[72]|0,(t|0)==(b|0)&&!(ee(l)|0)||(k=3);e:do if((k|0)==3){A:do switch(l<<16>>16){case 123:{for(r[72]=t+2,t=E(1)|0,s=r[72]|0;;){if(j(t)|0?(J(t),t=(r[72]|0)+2|0,r[72]=t):(U(t)|0,t=r[72]|0),E(1)|0,t=Se(s,t)|0,t<<16>>16==44&&(r[72]=(r[72]|0)+2,t=E(1)|0),t<<16>>16==125){k=15;break}if(b=s,s=r[72]|0,(s|0)==(b|0)){k=12;break}if(s>>>0>(r[73]|0)>>>0){k=14;break}}if((k|0)==12){R();break e}else if((k|0)==14){R();break e}else if((k|0)==15){Q[803]=1,r[72]=(r[72]|0)+2;break A}break}case 42:{r[72]=t+2,E(1)|0,b=r[72]|0,Se(b,b)|0;break}default:{switch(Q[804]=0,l<<16>>16){case 100:{switch(G=t+14|0,r[72]=G,(E(1)|0)<<16>>16){case 97:{s=r[72]|0,!(y(s+2|0,66,8)|0)&&(h=s+10|0,Ae(u[h>>1]|0)|0)&&(r[72]=h,E(0)|0,k=22);break}case 102:{k=22;break}case 99:{s=r[72]|0,!(y(s+2|0,36,8)|0)&&(g=s+10|0,b=u[g>>1]|0,_(b)|0|b<<16>>16==123)&&(r[72]=g,B=E(1)|0,B<<16>>16!=123)&&(de=B,k=31);break}default:}t:do if((k|0)==22&&(K=r[72]|0,(y(K+2|0,74,14)|0)==0)){if(l=K+16|0,s=u[l>>1]|0,!(_(s)|0))switch(s<<16>>16){case 40:case 42:break;default:break t}r[72]=l,s=E(1)|0,s<<16>>16==42&&(r[72]=(r[72]|0)+2,s=E(1)|0),s<<16>>16!=40&&(de=s,k=31)}while(!1);if((k|0)==31&&(Be=r[72]|0,U(de)|0,Ee=r[72]|0,Ee>>>0>Be>>>0)){q(t,G,Be,Ee),r[72]=(r[72]|0)+-2;break e}q(t,G,0,0),r[72]=t+12;break e}case 97:{r[72]=t+10,E(0)|0,t=r[72]|0,k=35;break}case 102:{k=35;break}case 99:{if(!(y(t+2|0,36,8)|0)&&(s=t+10|0,te(u[s>>1]|0)|0)){r[72]=s,b=E(1)|0,k=r[72]|0,U(b)|0,b=r[72]|0,q(k,b,k,b),r[72]=(r[72]|0)+-2;break e}t=t+4|0,r[72]=t;break}case 108:case 118:break;default:break e}if((k|0)==35){r[72]=t+16,t=E(1)|0,t<<16>>16==42&&(r[72]=(r[72]|0)+2,t=E(1)|0),k=r[72]|0,U(t)|0,b=r[72]|0,q(k,b,k,b),r[72]=(r[72]|0)+-2;break e}r[72]=t+6,Q[804]=0,l=E(1)|0,t=r[72]|0,l=(U(l)|0|32)<<16>>16==123,g=r[72]|0,l&&(r[72]=g+2,b=E(1)|0,t=r[72]|0,U(b)|0);t:for(;s=r[72]|0,(s|0)!=(t|0);){if(q(t,s,t,s),s=E(1)|0,l)switch(s<<16>>16){case 93:case 125:break e;default:}if(t=r[72]|0,s<<16>>16!=44){k=51;break}switch(r[72]=t+2,s=E(1)|0,t=r[72]|0,s<<16>>16){case 91:case 123:{k=51;break t}default:}U(s)|0}if((k|0)==51&&(r[72]=t+-2),!l)break e;r[72]=g+-2;break e}}while(!1);if(b=(E(1)|0)<<16>>16==102,t=r[72]|0,b&&!(y(t+2|0,60,6)|0))for(r[72]=t+8,he(G,E(1)|0,0),t=Ce|0?Ce+16|0:240;;){if(t=r[t>>2]|0,!t)break e;r[t+12>>2]=0,r[t+8>>2]=0,t=t+16|0}r[72]=t+-2}while(!1)}function Y(){var t=0,s=0,l=0,g=0,h=0,B=0,K=0;h=r[72]|0,l=h+12|0,r[72]=l,g=E(1)|0,s=r[72]|0;e:do if(g<<16>>16!=46)g<<16>>16==115&s>>>0>l>>>0?!(y(s+2|0,50,10)|0)&&(t=s+12|0,_(u[t>>1]|0)|0)?B=14:(s=6,l=0,B=46):(t=g,l=0,B=15);else switch(r[72]=s+2,(E(1)|0)<<16>>16){case 109:{if(t=r[72]|0,y(t+2|0,44,6)|0||(s=r[69]|0,!(ge(s)|0)&&(u[s>>1]|0)==46))break e;le(h,h,t+8|0,2);break e}case 115:{if(t=r[72]|0,y(t+2|0,50,10)|0||(s=r[69]|0,!(ge(s)|0)&&(u[s>>1]|0)==46))break e;t=t+12|0,B=14;break e}default:break e}while(!1);(B|0)==14&&(r[72]=t,t=E(1)|0,l=1,B=15);e:do if((B|0)==15)switch(t<<16>>16){case 40:{if(s=r[70]|0,K=u[400]|0,g=K&65535,r[s+(g<<3)>>2]=5,t=r[72]|0,u[400]=K+1<<16>>16,r[s+(g<<3)+4>>2]=t,(u[r[69]>>1]|0)==46)break e;switch(r[72]=t+2,s=E(1)|0,le(h,r[72]|0,0,t),l?(t=r[63]|0,r[t+28>>2]=5):t=r[63]|0,h=r[71]|0,K=u[399]|0,u[399]=K+1<<16>>16,r[h+((K&65535)<<2)>>2]=t,s<<16>>16){case 39:{J(39);break}case 34:{J(34);break}default:{r[72]=(r[72]|0)+-2;break e}}switch(t=(r[72]|0)+2|0,r[72]=t,(E(1)|0)<<16>>16){case 44:{r[72]=(r[72]|0)+2,E(1)|0,h=r[63]|0,r[h+4>>2]=t,K=r[72]|0,r[h+16>>2]=K,Q[h+24>>0]=1,r[72]=K+-2;break e}case 41:{u[400]=(u[400]|0)+-1<<16>>16,K=r[63]|0,r[K+4>>2]=t,r[K+12>>2]=(r[72]|0)+2,Q[K+24>>0]=1,u[399]=(u[399]|0)+-1<<16>>16;break e}default:{r[72]=(r[72]|0)+-2;break e}}}case 123:{if(l){s=12,l=1,B=46;break e}if(t=r[72]|0,u[400]|0){r[72]=t+-2;break e}for(;!(t>>>0>=(r[73]|0)>>>0);){if(t=E(1)|0,j(t)|0)J(t);else if(t<<16>>16==125){B=36;break}t=(r[72]|0)+2|0,r[72]=t}if((B|0)==36&&(r[72]=(r[72]|0)+2),K=(E(1)|0)<<16>>16==102,t=r[72]|0,K&&y(t+2|0,60,6)|0){R();break e}if(r[72]=t+8,t=E(1)|0,j(t)|0){he(h,t,0);break e}else{R();break e}}default:{if(l){s=12,l=1,B=46;break e}switch(t<<16>>16){case 42:case 39:case 34:{l=0,B=48;break e}default:{s=6,l=0,B=46;break e}}}}while(!1);(B|0)==46&&(t=r[72]|0,(t|0)==(h+(s<<1)|0)?r[72]=t+-2:B=48);do if((B|0)==48){if(u[400]|0){r[72]=(r[72]|0)+-2;break}for(t=r[73]|0,s=r[72]|0;;){if(s>>>0>=t>>>0){B=55;break}if(g=u[s>>1]|0,j(g)|0){B=53;break}K=s+2|0,r[72]=K,s=K}if((B|0)==53){he(h,g,l);break}else if((B|0)==55){R();break}}while(!1)}function ce(t){t=t|0;var s=0,l=0;e:do switch(u[t>>1]|0){case 100:switch(u[t+-2>>1]|0){case 105:{s=L(t+-4|0,98,2)|0;break e}case 108:{s=L(t+-4|0,102,3)|0;break e}default:{s=0;break e}}case 101:switch(u[t+-2>>1]|0){case 115:switch(u[t+-4>>1]|0){case 108:{s=H(t+-6|0,101)|0;break e}case 97:{s=H(t+-6|0,99)|0;break e}default:{s=0;break e}}case 116:{s=L(t+-4|0,108,4)|0;break e}case 117:{s=L(t+-4|0,116,6)|0;break e}default:{s=0;break e}}case 102:{if((u[t+-2>>1]|0)==111)if(l=t+-4|0,(l|0)!=(r[3]|0)&&(s=u[l>>1]|0,!(te(s)|0)))if(s<<16>>16==101)switch(u[t+-6>>1]|0){case 99:{s=L(t+-8|0,128,6)|0;break e}case 112:{s=L(t+-8|0,140,2)|0;break e}default:{s=0;break e}}else s=0;else s=1;else s=0;break}case 107:{s=L(t+-2|0,144,4)|0;break}case 110:{s=t+-2|0,H(s,105)|0?s=1:s=L(s,152,5)|0;break}case 111:{s=H(t+-2|0,100)|0;break}case 114:{s=L(t+-2|0,162,7)|0;break}case 116:{s=L(t+-2|0,176,4)|0;break}case 119:switch(u[t+-2>>1]|0){case 101:{s=H(t+-4|0,110)|0;break e}case 111:{s=L(t+-4|0,184,3)|0;break e}default:{s=0;break e}}default:s=0}while(!1);return s|0}function he(t,s,l){t=t|0,s=s|0,l=l|0;var g=0,h=0;switch(g=(r[72]|0)+2|0,s<<16>>16){case 39:{J(39),h=5;break}case 34:{J(34),h=5;break}default:R()}do if((h|0)==5){if(le(t,g,r[72]|0,1),l&&(r[(r[63]|0)+28>>2]=4),r[72]=(r[72]|0)+2,s=E(0)|0,l=s<<16>>16==97,l?(g=r[72]|0,y(g+2|0,88,10)|0&&(h=13)):(g=r[72]|0,s<<16>>16==119&&(u[g+2>>1]|0)==105&&(u[g+4>>1]|0)==116&&(u[g+6>>1]|0)==104||(h=13)),(h|0)==13){r[72]=g+-2;break}if(r[72]=g+((l?6:4)<<1),(E(1)|0)<<16>>16!=123){r[72]=g;break}l=r[72]|0,s=l;e:for(;;){switch(r[72]=s+2,s=E(1)|0,s<<16>>16){case 39:{J(39),r[72]=(r[72]|0)+2,s=E(1)|0;break}case 34:{J(34),r[72]=(r[72]|0)+2,s=E(1)|0;break}default:s=U(s)|0}if(s<<16>>16!=58){h=22;break}switch(r[72]=(r[72]|0)+2,(E(1)|0)<<16>>16){case 39:{J(39);break}case 34:{J(34);break}default:{h=26;break e}}switch(r[72]=(r[72]|0)+2,(E(1)|0)<<16>>16){case 125:{h=31;break e}case 44:break;default:{h=30;break e}}if(r[72]=(r[72]|0)+2,(E(1)|0)<<16>>16==125){h=31;break}s=r[72]|0}if((h|0)==22){r[72]=g;break}else if((h|0)==26){r[72]=g;break}else if((h|0)==30){r[72]=g;break}else if((h|0)==31){h=r[63]|0,r[h+16>>2]=l,r[h+12>>2]=(r[72]|0)+2;break}}while(!1)}function Ne(){var t=0,s=0,l=0,g=0;s=r[73]|0,l=r[72]|0;e:for(;;){if(t=l+2|0,l>>>0>=s>>>0){s=10;break}switch(u[t>>1]|0){case 96:{s=7;break e}case 36:{if((u[l+4>>1]|0)==123){s=6;break e}break}case 92:{t=l+4|0;break}default:}l=t}(s|0)==6?(t=l+4|0,r[72]=t,s=r[70]|0,g=u[400]|0,l=g&65535,r[s+(l<<3)>>2]=4,u[400]=g+1<<16>>16,r[s+(l<<3)+4>>2]=t):(s|0)==7?(r[72]=t,l=r[70]|0,g=(u[400]|0)+-1<<16>>16,u[400]=g,(r[l+((g&65535)<<3)>>2]|0)!=3&&R()):(s|0)==10&&(r[72]=t,R())}function E(t){t=t|0;var s=0,l=0,g=0;l=r[72]|0;e:do{s=u[l>>1]|0;A:do if(s<<16>>16!=47)if(t){if(_(s)|0)break;break e}else{if(Ae(s)|0)break;break e}else switch(u[l+2>>1]|0){case 47:{Qe();break A}case 42:{fe(t);break A}default:{s=47;break e}}while(!1);g=r[72]|0,l=g+2|0,r[72]=l}while(g>>>0<(r[73]|0)>>>0);return s|0}function le(t,s,l,g){t=t|0,s=s|0,l=l|0,g=g|0;var h=0,B=0;B=r[67]|0,r[67]=B+36,h=r[63]|0,r[(h|0?h+32|0:236)>>2]=B,r[64]=h,r[63]=B,r[B+8>>2]=t,(g|0)==2?(t=3,h=l):(h=(g|0)==1,t=h?1:2,h=h?l+2|0:0),r[B+12>>2]=h,r[B+28>>2]=t,r[B>>2]=s,r[B+4>>2]=l,r[B+16>>2]=0,r[B+20>>2]=g,s=(g|0)==1,Q[B+24>>0]=s&1,r[B+32>>2]=0,s|(g|0)==2&&(Q[803]=1)}function J(t){t=t|0;var s=0,l=0,g=0,h=0;for(h=r[73]|0,s=r[72]|0;;){if(g=s+2|0,s>>>0>=h>>>0){s=9;break}if(l=u[g>>1]|0,l<<16>>16==t<<16>>16){s=10;break}if(l<<16>>16==92)l=s+4|0,(u[l>>1]|0)==13?(s=s+6|0,s=(u[s>>1]|0)==10?s:l):s=l;else if(ye(l)|0){s=9;break}else s=g}(s|0)==9?(r[72]=g,R()):(s|0)==10&&(r[72]=g)}function Se(t,s){t=t|0,s=s|0;var l=0,g=0,h=0,B=0;return l=r[72]|0,g=u[l>>1]|0,B=(t|0)==(s|0),h=B?0:t,B=B?0:s,g<<16>>16==97&&(r[72]=l+4,l=E(1)|0,t=r[72]|0,j(l)|0?(J(l),s=(r[72]|0)+2|0,r[72]=s):(U(l)|0,s=r[72]|0),g=E(1)|0,l=r[72]|0),(l|0)!=(t|0)&&q(t,s,h,B),g|0}function wt(){var t=0,s=0,l=0;l=r[73]|0,s=r[72]|0;e:for(;;){if(t=s+2|0,s>>>0>=l>>>0){s=6;break}switch(u[t>>1]|0){case 13:case 10:{s=6;break e}case 93:{s=7;break e}case 92:{t=s+4|0;break}default:}s=t}return(s|0)==6?(r[72]=t,R(),t=0):(s|0)==7&&(r[72]=t,t=93),t|0}function ue(){var t=0,s=0,l=0;e:for(;;){if(t=r[72]|0,s=t+2|0,r[72]=s,t>>>0>=(r[73]|0)>>>0){l=7;break}switch(u[s>>1]|0){case 13:case 10:{l=7;break e}case 47:break e;case 91:{wt()|0;break}case 92:{r[72]=t+4;break}default:}}(l|0)==7&&R()}function It(t){switch(t=t|0,u[t>>1]|0){case 62:{t=(u[t+-2>>1]|0)==61;break}case 41:case 59:{t=1;break}case 104:{t=L(t+-2|0,210,4)|0;break}case 121:{t=L(t+-2|0,218,6)|0;break}case 101:{t=L(t+-2|0,230,3)|0;break}default:t=0}return t|0}function fe(t){t=t|0;var s=0,l=0,g=0,h=0,B=0;for(h=(r[72]|0)+2|0,r[72]=h,l=r[73]|0;s=h+2|0,!(h>>>0>=l>>>0||(g=u[s>>1]|0,!t&&ye(g)|0));){if(g<<16>>16==42&&(u[h+4>>1]|0)==47){B=8;break}h=s}(B|0)==8&&(r[72]=s,s=h+4|0),r[72]=s}function y(t,s,l){t=t|0,s=s|0,l=l|0;var g=0,h=0;e:do if(!l)t=0;else{for(;g=Q[t>>0]|0,h=Q[s>>0]|0,g<<24>>24==h<<24>>24;)if(l=l+-1|0,l)t=t+1|0,s=s+1|0;else{t=0;break e}t=(g&255)-(h&255)|0}while(!1);return t|0}function ee(t){t=t|0;e:do switch(t<<16>>16){case 38:case 37:case 33:{t=1;break}default:if((t&-8)<<16>>16==40|(t+-58&65535)<6)t=1;else{switch(t<<16>>16){case 91:case 93:case 94:{t=1;break e}default:}t=(t+-123&65535)<4}}while(!1);return t|0}function kt(t){t=t|0;e:do switch(t<<16>>16){case 38:case 37:case 33:break;default:if(!((t+-58&65535)<6|(t+-40&65535)<7&t<<16>>16!=41)){switch(t<<16>>16){case 91:case 94:break e;default:}return t<<16>>16!=125&(t+-123&65535)<4|0}}while(!1);return 1}function Le(t){t=t|0;var s=0;s=u[t>>1]|0;e:do if((s+-9&65535)>=5){switch(s<<16>>16){case 160:case 32:{s=1;break e}default:}if(ee(s)|0)return s<<16>>16!=46|(ge(t)|0)|0;s=0}else s=1;while(!1);return s|0}function pt(t){t=t|0;var s=0,l=0,g=0,h=0;return l=I,I=I+16|0,g=l,r[g>>2]=0,r[66]=t,s=r[3]|0,h=s+(t<<1)|0,t=h+2|0,u[h>>1]=0,r[g>>2]=t,r[67]=t,r[59]=0,r[63]=0,r[61]=0,r[60]=0,r[65]=0,r[62]=0,I=l,s|0}function q(t,s,l,g){t=t|0,s=s|0,l=l|0,g=g|0;var h=0,B=0;h=r[67]|0,r[67]=h+20,B=r[65]|0,r[(B|0?B+16|0:240)>>2]=h,r[65]=h,r[h>>2]=t,r[h+4>>2]=s,r[h+8>>2]=l,r[h+12>>2]=g,r[h+16>>2]=0,Q[803]=1}function L(t,s,l){t=t|0,s=s|0,l=l|0;var g=0,h=0;return g=t+(0-l<<1)|0,h=g+2|0,t=r[3]|0,h>>>0>=t>>>0&&!(y(h,s,l<<1)|0)?(h|0)==(t|0)?t=1:t=Le(g)|0:t=0,t|0}function bt(t){switch(t=t|0,u[t>>1]|0){case 107:{t=L(t+-2|0,144,4)|0;break}case 101:{(u[t+-2>>1]|0)==117?t=L(t+-4|0,116,6)|0:t=0;break}default:t=0}return t|0}function H(t,s){t=t|0,s=s|0;var l=0;return l=r[3]|0,l>>>0<=t>>>0&&(u[t>>1]|0)==s<<16>>16?(l|0)==(t|0)?l=1:l=te(u[t+-2>>1]|0)|0:l=0,l|0}function te(t){t=t|0;e:do if((t+-9&65535)<5)t=1;else{switch(t<<16>>16){case 32:case 160:{t=1;break e}default:}t=t<<16>>16!=46&(ee(t)|0)}while(!1);return t|0}function Qe(){var t=0,s=0,l=0;t=r[73]|0,l=r[72]|0;e:for(;s=l+2|0,!(l>>>0>=t>>>0);)switch(u[s>>1]|0){case 13:case 10:break e;default:l=s}r[72]=s}function U(t){for(t=t|0;!(_(t)|0||ee(t)|0);)if(t=(r[72]|0)+2|0,r[72]=t,t=u[t>>1]|0,!(t<<16>>16)){t=0;break}return t|0}function mt(){var t=0;switch(t=r[(r[61]|0)+20>>2]|0,t|0){case 1:{t=-1;break}case 2:{t=-2;break}default:t=t-(r[3]|0)>>1}return t|0}function Dt(t){return t=t|0,!(L(t,190,5)|0)&&!(L(t,200,3)|0)?t=L(t,206,2)|0:t=1,t|0}function Ae(t){switch(t=t|0,t<<16>>16){case 160:case 32:case 12:case 11:case 9:{t=1;break}default:t=0}return t|0}function ge(t){return t=t|0,(u[t>>1]|0)==46&&(u[t+-2>>1]|0)==46?t=(u[t+-4>>1]|0)==46:t=0,t|0}function X(t){return t=t|0,(r[3]|0)==(t|0)?t=1:t=Le(t+-2|0)|0,t|0}function Kt(){var t=0;return t=r[(r[62]|0)+12>>2]|0,t?t=t-(r[3]|0)>>1:t=-1,t|0}function Nt(){var t=0;return t=r[(r[61]|0)+12>>2]|0,t?t=t-(r[3]|0)>>1:t=-1,t|0}function St(){var t=0;return t=r[(r[62]|0)+8>>2]|0,t?t=t-(r[3]|0)>>1:t=-1,t|0}function Lt(){var t=0;return t=r[(r[61]|0)+16>>2]|0,t?t=t-(r[3]|0)>>1:t=-1,t|0}function yt(){var t=0;return t=r[(r[61]|0)+4>>2]|0,t?t=t-(r[3]|0)>>1:t=-1,t|0}function Jt(){var t=0;return t=r[61]|0,t=r[(t|0?t+32|0:236)>>2]|0,r[61]=t,(t|0)!=0|0}function Rt(){var t=0;return t=r[62]|0,t=r[(t|0?t+16|0:240)>>2]|0,r[62]=t,(t|0)!=0|0}function R(){Q[802]=1,r[68]=(r[72]|0)-(r[3]|0)>>1,r[72]=(r[73]|0)+2}function _(t){return t=t|0,(t|128)<<16>>16==160|(t+-9&65535)<5|0}function j(t){return t=t|0,t<<16>>16==39|t<<16>>16==34|0}function vt(){return(r[(r[61]|0)+8>>2]|0)-(r[3]|0)>>1|0}function xt(){return(r[(r[62]|0)+4>>2]|0)-(r[3]|0)>>1|0}function ye(t){return t=t|0,t<<16>>16==13|t<<16>>16==10|0}function Ut(){return(r[r[61]>>2]|0)-(r[3]|0)>>1|0}function Ft(){return(r[r[62]>>2]|0)-(r[3]|0)>>1|0}function Gt(){return D[(r[61]|0)+24>>0]|0|0}function Mt(t){t=t|0,r[3]=t}function Yt(){return r[(r[61]|0)+28>>2]|0}function qt(){return(Q[803]|0)!=0|0}function _t(){return(Q[804]|0)!=0|0}function Ot(){return r[68]|0}function Ht(t){return t=t|0,I=t+992+15&-16,992}return{su:Ht,ai:Lt,e:Ot,ee:xt,ele:Kt,els:St,es:Ft,f:_t,id:mt,ie:yt,ip:Gt,is:Ut,it:Yt,ms:qt,p:S,re:Rt,ri:Jt,sa:pt,se:Nt,ses:Mt,ss:vt}}(typeof self<"u"?self:global,{},ie),ke=m.su(Z-(2<<17))}const i=N.length+1;m.ses(ke),m.sa(i-1),Oe(N,new Uint16Array(ie,ke,i)),m.p()||(w=m.e(),F());const o=[],a=[];for(;m.ri();){const c=m.is(),C=m.ie(),f=m.ai(),Q=m.id(),u=m.ss(),r=m.se(),D=m.it();let p;m.ip()&&(p=pe(Q===-1?c:c+1,N.charCodeAt(Q===-1?c-1:c))),o.push({t:D,n:p,s:c,e:C,ss:u,se:r,d:Q,a:f})}for(;m.re();){const c=m.es(),C=m.ee(),f=m.els(),Q=m.ele(),u=N.charCodeAt(c),r=f>=0?N.charCodeAt(f):-1;a.push({s:c,e:C,ls:f,le:Q,n:u===34||u===39?pe(c+1,u):N.slice(c,C),ln:f<0?void 0:r===34||r===39?pe(f+1,r):N.slice(f,Q)})}return[o,a,!!m.f(),!!m.ms()]}function pe(n,e){w=n;let A="",i=w;for(;;){w>=N.length&&F();const o=N.charCodeAt(w);if(o===e)break;o===92?(A+=N.slice(i,w),A+=QA(),i=w):(o===8232||o===8233||Xe(o)&&F(),++w)}return A+=N.slice(i,w++),A}function QA(){let n=N.charCodeAt(++w);switch(++w,n){case 110:return`
`;case 114:return"\r";case 120:return String.fromCharCode(be(2));case 117:return function(){const e=N.charCodeAt(w);let A;return e===123?(++w,A=be(N.indexOf("}",w)-w),++w,A>1114111&&F()):A=be(4),A<=65535?String.fromCharCode(A):(A-=65536,String.fromCharCode(55296+(A>>10),56320+(1023&A)))}();case 116:return"	";case 98:return"\b";case 118:return"\v";case 102:return"\f";case 13:N.charCodeAt(w)===10&&++w;case 10:return"";case 56:case 57:F();default:if(n>=48&&n<=55){let e=N.substr(w-1,3).match(/^[0-7]+/)[0],A=parseInt(e,8);return A>255&&(e=e.slice(0,-1),A=parseInt(e,8)),w+=e.length-1,n=N.charCodeAt(w),e==="0"&&n!==56&&n!==57||F(),String.fromCharCode(A)}return Xe(n)?"":String.fromCharCode(n)}}function be(n){const e=w;let A=0,i=0;for(let o=0;o<n;++o,++w){let a,c=N.charCodeAt(w);if(c!==95){if(c>=97)a=c-97+10;else if(c>=65)a=c-65+10;else{if(!(c>=48&&c<=57))break;a=c-48}if(a>=16)break;i=c,A=16*A+a}else i!==95&&o!==0||F(),i=c}return i!==95&&w-e===n||F(),A}function Xe(n){return n===13||n===10}function F(){throw Object.assign(Error(`Parse error ${He}:${N.slice(0,w).split(`
`).length}:${w-N.lastIndexOf(`
`,w-1)}`),{idx:w})}let je=!1;_e.then(()=>{je=!0});const Pe=n=>je?qe(n):fA(n),Te="2",gA=(n=>{const e="default",A=Object.keys(n);return A.length===1&&A[0]===e&&n[e]&&typeof n[e]=="object"&&"__esModule"in n[e]?n[e]:n}).toString(),CA=`.then(${gA})`,me=(n,e)=>{if(!e.includes("import"))return;const A=Pe(e)[0].filter(c=>c.d>-1);if(A.length===0)return;const i=new Ke(e);for(const c of A)i.appendRight(c.se,CA);const o=i.toString(),a=i.generateMap({source:n,includeContent:!1,hires:"boundary"});return{code:o,map:a}},BA=n=>{try{const e=x.readFileSync(n,"utf8");return JSON.parse(e)}catch{}},We=()=>{},$e=()=>Math.floor(Date.now()/1e8);class EA extends Map{cacheDirectory=Tt.tmpdir;oldCacheDirectory=P.join(Pt.tmpdir(),"tsx");cacheFiles;constructor(){super(),x.mkdirSync(this.cacheDirectory,{recursive:!0}),this.cacheFiles=x.readdirSync(this.cacheDirectory).map(e=>{const[A,i]=e.split("-");return{time:Number(A),key:i,fileName:e}}),setImmediate(()=>{this.expireDiskCache(),this.removeOldCacheDirectory()})}get(e){const A=super.get(e);if(A)return A;const i=this.cacheFiles.find(c=>c.key===e);if(!i)return;const o=P.join(this.cacheDirectory,i.fileName),a=BA(o);if(!a){x.promises.unlink(o).then(()=>{const c=this.cacheFiles.indexOf(i);this.cacheFiles.splice(c,1)},()=>{});return}return super.set(e,a),a}set(e,A){if(super.set(e,A),A){const i=$e();x.promises.writeFile(P.join(this.cacheDirectory,`${i}-${e}`),JSON.stringify(A)).catch(We)}return this}expireDiskCache(){const e=$e();for(const A of this.cacheFiles)e-A.time>7&&x.promises.unlink(P.join(this.cacheDirectory,A.fileName)).catch(We)}async removeOldCacheDirectory(){try{await x.promises.access(this.oldCacheDirectory).then(()=>!0)&&("rm"in x.promises?await x.promises.rm(this.oldCacheDirectory,{recursive:!0,force:!0}):await x.promises.rmdir(this.oldCacheDirectory,{recursive:!0}))}catch{}}}var ne=process.env.TSX_DISABLE_CACHE?new Map:new EA;const dA=/^[\w+.-]+:\/\//,wA=/^([\w+.-]+:)\/\/([^@/#?]*@)?([^:/#?]*)(:\d+)?(\/[^#?]*)?(\?[^#]*)?(#.*)?/,IA=/^file:(?:\/\/((?![a-z]:)[^/#?]*)?)?(\/?[^#?]*)(\?[^#]*)?(#.*)?/i;function kA(n){return dA.test(n)}function pA(n){return n.startsWith("//")}function Ze(n){return n.startsWith("/")}function bA(n){return n.startsWith("file:")}function ze(n){return/^[.?#]/.test(n)}function se(n){const e=wA.exec(n);return Ve(e[1],e[2]||"",e[3],e[4]||"",e[5]||"/",e[6]||"",e[7]||"")}function mA(n){const e=IA.exec(n),A=e[2];return Ve("file:","",e[1]||"","",Ze(A)?A:"/"+A,e[3]||"",e[4]||"")}function Ve(n,e,A,i,o,a,c){return{scheme:n,user:e,host:A,port:i,path:o,query:a,hash:c,type:7}}function et(n){if(pA(n)){const A=se("http:"+n);return A.scheme="",A.type=6,A}if(Ze(n)){const A=se("http://foo.com"+n);return A.scheme="",A.host="",A.type=5,A}if(bA(n))return mA(n);if(kA(n))return se(n);const e=se("http://foo.com/"+n);return e.scheme="",e.host="",e.type=n?n.startsWith("?")?3:n.startsWith("#")?2:4:1,e}function DA(n){if(n.endsWith("/.."))return n;const e=n.lastIndexOf("/");return n.slice(0,e+1)}function KA(n,e){tt(e,e.type),n.path==="/"?n.path=e.path:n.path=DA(e.path)+n.path}function tt(n,e){const A=e<=4,i=n.path.split("/");let o=1,a=0,c=!1;for(let f=1;f<i.length;f++){const Q=i[f];if(!Q){c=!0;continue}if(c=!1,Q!=="."){if(Q===".."){a?(c=!0,a--,o--):A&&(i[o++]=Q);continue}i[o++]=Q,a++}}let C="";for(let f=1;f<o;f++)C+="/"+i[f];(!C||c&&!C.endsWith("/.."))&&(C+="/"),n.path=C}function NA(n,e){if(!n&&!e)return"";const A=et(n);let i=A.type;if(e&&i!==7){const a=et(e),c=a.type;switch(i){case 1:A.hash=a.hash;case 2:A.query=a.query;case 3:case 4:KA(A,a);case 5:A.user=a.user,A.host=a.host,A.port=a.port;case 6:A.scheme=a.scheme}c>i&&(i=c)}tt(A,i);const o=A.query+A.hash;switch(i){case 2:case 3:return o;case 4:{const a=A.path.slice(1);return a?ze(e||n)&&!ze(a)?"./"+a+o:a+o:o||"."}case 5:return A.path+o;default:return A.scheme+"//"+A.user+A.host+A.port+A.path+o}}function At(n,e){return e&&!e.endsWith("/")&&(e+="/"),NA(n,e)}function SA(n){if(!n)return"";const e=n.lastIndexOf("/");return n.slice(0,e+1)}const M=0;function LA(n,e){const A=rt(n,0);if(A===n.length)return n;e||(n=n.slice());for(let i=A;i<n.length;i=rt(n,i+1))n[i]=JA(n[i],e);return n}function rt(n,e){for(let A=e;A<n.length;A++)if(!yA(n[A]))return A;return n.length}function yA(n){for(let e=1;e<n.length;e++)if(n[e][M]<n[e-1][M])return!1;return!0}function JA(n,e){return e||(n=n.slice()),n.sort(RA)}function RA(n,e){return n[M]-e[M]}let oe=!1;function vA(n,e,A,i){for(;A<=i;){const o=A+(i-A>>1),a=n[o][M]-e;if(a===0)return oe=!0,o;a<0?A=o+1:i=o-1}return oe=!1,A-1}function xA(n,e,A){for(let i=A-1;i>=0&&n[i][M]===e;A=i--);return A}function UA(){return{lastKey:-1,lastNeedle:-1,lastIndex:-1}}function FA(n,e,A,i){const{lastKey:o,lastNeedle:a,lastIndex:c}=A;let C=0,f=n.length-1;if(i===o){if(e===a)return oe=c!==-1&&n[c][M]===e,c;e>=a?C=c===-1?0:c:f=c}return A.lastKey=i,A.lastNeedle=e,A.lastIndex=vA(n,e,C,f)}class it{constructor(e,A){const i=typeof e=="string";if(!i&&e._decodedMemo)return e;const o=i?JSON.parse(e):e,{version:a,file:c,names:C,sourceRoot:f,sources:Q,sourcesContent:u}=o;this.version=a,this.file=c,this.names=C||[],this.sourceRoot=f,this.sources=Q,this.sourcesContent=u,this.ignoreList=o.ignoreList||o.x_google_ignoreList||void 0;const r=At(f||"",SA(A));this.resolvedSources=Q.map(p=>At(p||"",r));const{mappings:D}=o;typeof D=="string"?(this._encoded=D,this._decoded=void 0):(this._encoded=void 0,this._decoded=LA(D,i)),this._decodedMemo=UA(),this._bySources=void 0,this._bySourceMemos=void 0}}function gr(n){return n}function nt(n){var e;return(e=n)._decoded||(e._decoded=$t(n._encoded))}function GA(n,e,A){const i=nt(n);if(e>=i.length)return null;const o=i[e],a=MA(o,n._decodedMemo,e,A);return a===-1?null:o[a]}function MA(n,e,A,i,o){let a=FA(n,i,e,A);return oe&&(a=xA(n,i,a)),a===-1||a===n.length?-1:a}class De{constructor(){this._indexes={__proto__:null},this.array=[]}}function Cr(n){return n}function st(n,e){return n._indexes[e]}function z(n,e){const A=st(n,e);if(A!==void 0)return A;const{array:i,_indexes:o}=n,a=i.push(e);return o[e]=a-1}function YA(n,e){const A=st(n,e);if(A===void 0)return;const{array:i,_indexes:o}=n;for(let a=A+1;a<i.length;a++){const c=i[a];i[a-1]=c,o[c]--}o[e]=void 0,i.pop()}const qA=0,_A=1,OA=2,HA=3,XA=4,ot=-1;class jA{constructor({file:e,sourceRoot:A}={}){this._names=new De,this._sources=new De,this._sourcesContent=[],this._mappings=[],this.file=e,this.sourceRoot=A,this._ignoreList=new De}}function Br(n){return n}const PA=(n,e,A,i,o,a,c,C)=>ZA(!0,n,e,A,i,o,a,c);function TA(n,e,A){const{_sources:i,_sourcesContent:o}=n,a=z(i,e);o[a]=A}function WA(n,e,A=!0){const{_sources:i,_sourcesContent:o,_ignoreList:a}=n,c=z(i,e);c===o.length&&(o[c]=null),A?z(a,c):YA(a,c)}function at(n){const{_mappings:e,_sources:A,_sourcesContent:i,_names:o,_ignoreList:a}=n;return er(e),{version:3,file:n.file||void 0,names:o.array,sourceRoot:n.sourceRoot||void 0,sources:A.array,sourcesContent:i,mappings:e,ignoreList:a.array}}function $A(n){const e=at(n);return Object.assign(Object.assign({},e),{mappings:Ge(e.mappings)})}function ZA(n,e,A,i,o,a,c,C,f){const{_mappings:Q,_sources:u,_sourcesContent:r,_names:D}=e,p=zA(Q,A),I=VA(p,i);if(!o)return tr(p,I)?void 0:ct(p,I,[i]);const S=z(u,o),v=C?z(D,C):ot;if(S===r.length&&(r[S]=null),!Ar(p,I,S,a,c,v))return ct(p,I,C?[i,S,a,c,v]:[i,S,a,c])}function zA(n,e){for(let A=n.length;A<=e;A++)n[A]=[];return n[e]}function VA(n,e){let A=n.length;for(let i=A-1;i>=0;A=i--){const o=n[i];if(e>=o[qA])break}return A}function ct(n,e,A){for(let i=n.length;i>e;i--)n[i]=n[i-1];n[e]=A}function er(n){const{length:e}=n;let A=e;for(let i=A-1;i>=0&&!(n[i].length>0);A=i,i--);A<e&&(n.length=A)}function tr(n,e){return e===0?!0:n[e-1].length===1}function Ar(n,e,A,i,o,a){if(e===0)return!1;const c=n[e-1];return c.length===1?!1:A===c[_A]&&i===c[OA]&&o===c[HA]&&a===(c.length===5?c[XA]:ot)}const ht=lt("",-1,-1,"",null,!1),rr=[];function lt(n,e,A,i,o,a){return{source:n,line:e,column:A,name:i,content:o,ignore:a}}function ut(n,e,A,i,o){return{map:n,sources:e,source:A,content:i,ignore:o}}function ft(n,e){return ut(n,e,"",null,!1)}function ir(n,e,A){return ut(null,rr,n,e,A)}function nr(n){const e=new jA({file:n.map.file}),{sources:A,map:i}=n,o=i.names,a=nt(i);for(let c=0;c<a.length;c++){const C=a[c];for(let f=0;f<C.length;f++){const Q=C[f],u=Q[0];let r=ht;if(Q.length!==1){const ce=A[Q[1]];if(r=Qt(ce,Q[2],Q[3],Q.length===5?o[Q[4]]:""),r==null)continue}const{column:D,line:p,name:I,content:S,source:v,ignore:Y}=r;PA(e,c,u,v,p,D,I),v&&S!=null&&TA(e,v,S),Y&&WA(e,v,!0)}}return e}function Qt(n,e,A,i){if(!n.map)return lt(n.source,e,A,i,n.content,n.ignore);const o=GA(n.map,e,A);return o==null?null:o.length===1?ht:Qt(n.sources[o[1]],o[2],o[3],o.length===5?n.map.names[o[4]]:i)}function sr(n){return Array.isArray(n)?n:[n]}function or(n,e){const A=sr(n).map(a=>new it(a,"")),i=A.pop();for(let a=0;a<A.length;a++)if(A[a].sources.length>1)throw new Error(`Transformation map ${a} must have exactly one source file.
Did you specify these with the most recent transformation maps first?`);let o=gt(i,e,"",0);for(let a=A.length-1;a>=0;a--)o=ft(A[a],[o]);return o}function gt(n,e,A,i){const{resolvedSources:o,sourcesContent:a,ignoreList:c}=n,C=i+1,f=o.map((Q,u)=>{const r={importer:A,depth:C,source:Q||"",content:void 0,ignore:void 0},D=e(r.source,r),{source:p,content:I,ignore:S}=r;if(D)return gt(new it(D,p),e,p,C);const v=I!==void 0?I:a?a[u]:null,Y=S!==void 0?S:c?c.includes(u):!1;return ir(p,v,Y)});return ft(n,f)}class ar{constructor(e,A){const i=A.decodedMappings?at(e):$A(e);this.version=i.version,this.file=i.file,this.mappings=i.mappings,this.names=i.names,this.ignoreList=i.ignoreList,this.sourceRoot=i.sourceRoot,this.sources=i.sources,A.excludeContent||(this.sourcesContent=i.sourcesContent)}toString(){return JSON.stringify(this)}}function Ct(n,e,A){const i={excludeContent:!!A,decodedMappings:!1},o=or(n,e);return new ar(nr(o),i)}const cr=(n,e,A)=>{const i=[],o={code:e};for(const a of A){const c=a(n,o.code);c&&(Object.assign(o,c),i.unshift(c.map))}return{...o,map:Ct(i,()=>null)}},hr=async(n,e,A)=>{const i=[],o={code:e};for(const a of A){const c=await a(n,o.code);c&&(Object.assign(o,c),i.unshift(c.map))}return{...o,map:Ct(i,()=>null)}},lr=Object.freeze({target:`node${process.versions.node}`,loader:"default"}),Bt={...lr,sourcemap:!0,sourcesContent:!1,minifyWhitespace:!0,keepNames:!0},Et=n=>{const e=n.sourcefile;if(e){const A=P.extname(e.split("?")[0]);A?(A===".cts"||A===".mts")&&(n.sourcefile=`${e.slice(0,-3)}ts`):n.sourcefile+=".js"}return A=>(A.map&&(n.sourcefile!==e&&(A.map=A.map.replace(JSON.stringify(n.sourcefile),JSON.stringify(e))),A.map=JSON.parse(A.map)),A)},dt=n=>{throw n.name="TransformError",delete n.errors,delete n.warnings,n},ur=(n,e,A)=>{const i={};e.endsWith(".cjs")||e.endsWith(".cts")||(i["import.meta.url"]=JSON.stringify(Xt.pathToFileURL(e)));const o={...Bt,format:"cjs",sourcefile:e,define:i,banner:"(()=>{",footer:"})()",...A},a=Je([n,JSON.stringify(o),re.version,Te].join("-"));let c=ne.get(a);return c||(c=cr(e,n,[(C,f)=>{const Q=Et(o);let u;try{u=re.transformSync(f,o)}catch(r){throw dt(r)}return Q(u)},me]),ne.set(a,c)),c},fr=async(n,e,A)=>{const i={...Bt,format:"esm",sourcefile:e,...A},o=Je([n,JSON.stringify(i),re.version,Te].join("-"));let a=ne.get(o);return a||(a=await hr(e,n,[async(c,C)=>{const f=Et(i);let Q;try{Q=await re.transform(C,i)}catch(u){throw dt(u)}return f(Q)},me]),ne.set(o,a)),a};exports.parseEsm=Pe,exports.transform=fr,exports.transformDynamicImport=me,exports.transformSync=ur;


/***/ }),

/***/ 373:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var i=__webpack_require__(411);const l=`
//# sourceMappingURL=data:application/json;base64,`,u=()=>process.sourceMapsEnabled??!0,h=({code:s,map:e})=>s+l+Buffer.from(JSON.stringify(e),"utf8").toString("base64"),t=Object.create(null);t[".js"]=[".ts",".tsx",".js",".jsx"],t[".jsx"]=[".tsx",".ts",".jsx",".js"],t[".cjs"]=[".cts"],t[".mjs"]=[".mts"];const x=s=>{const[e,n]=s.split("?"),c=i.extname(e),o=t[c];if(o){const a=e.slice(0,-c.length);return o.map(p=>a+p+(n?`?${n}`:""))}},f=s=>{const e=s.indexOf(":");if(e!==-1)return s.slice(0,e)},r=s=>s[0]==="."&&(s[1]==="/"||s[1]==="."||s[2]==="/"),j=s=>r(s)||i.isAbsolute(s),m=s=>{if(j(s))return!0;const e=f(s);return e&&e!=="node"};exports.inlineSourceMap=h,exports.isRelativePath=r,exports.requestAcceptsQuery=m,exports.resolveTsPath=x,exports.shouldApplySourceMap=u;


/***/ }),

/***/ 437:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var r=__webpack_require__(188),u=typeof document<"u"?document.currentScript:null,e=undefined;exports.require=__webpack_require__(344);


/***/ }),

/***/ 769:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

var s=__webpack_require__(411),r=__webpack_require__(612);const{geteuid:e}=process,t=e?e():r.userInfo().username,i=s.join(r.tmpdir(),`tsx-${t}`);exports.tmpdir=i;


/***/ })

};
;