/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 218:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



module.exports = __nccwpck_require__(499)["default"];

/***/ }),

/***/ 499:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {

var __webpack_unused_export__;


__webpack_unused_export__ = ({
  value: true
});
exports["default"] = void 0;
var _path = _interopRequireDefault(__nccwpck_require__(17));
var _options = _interopRequireDefault(__nccwpck_require__(284));
var _utils = __nccwpck_require__(778);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
async function lessLoader(source) {
  const options = this.getOptions(_options.default);
  const callback = this.async();
  let implementation;
  try {
    implementation = (0, _utils.getLessImplementation)(this, options.implementation);
  } catch (error) {
    callback(error);
    return;
  }
  if (!implementation) {
    callback(new Error(`The Less implementation "${options.implementation}" not found`));
    return;
  }
  const lessOptions = (0, _utils.getLessOptions)(this, options, implementation);
  const useSourceMap = typeof options.sourceMap === "boolean" ? options.sourceMap : this.sourceMap;
  if (useSourceMap) {
    lessOptions.sourceMap = {
      outputSourceFiles: true
    };
  }
  let data = source;
  if (typeof options.additionalData !== "undefined") {
    data = typeof options.additionalData === "function" ? `${await options.additionalData(data, this)}` : `${options.additionalData}\n${data}`;
  }
  const logger = this.getLogger("less-loader");
  const loaderContext = this;
  const loggerListener = {
    error(message) {
      // TODO enable by default in the next major release
      if (options.lessLogAsWarnOrErr) {
        loaderContext.emitError(new Error(message));
      } else {
        logger.error(message);
      }
    },
    warn(message) {
      // TODO enable by default in the next major release
      if (options.lessLogAsWarnOrErr) {
        loaderContext.emitWarning(new Error(message));
      } else {
        logger.warn(message);
      }
    },
    info(message) {
      logger.log(message);
    },
    debug(message) {
      logger.debug(message);
    }
  };
  implementation.logger.addListener(loggerListener);
  let result;
  try {
    result = await implementation.render(data, lessOptions);
  } catch (error) {
    if (error.filename) {
      // `less` returns forward slashes on windows when `webpack` resolver return an absolute windows path in `WebpackFileManager`
      // Ref: https://github.com/webpack-contrib/less-loader/issues/357
      this.addDependency(_path.default.normalize(error.filename));
    }
    callback((0, _utils.errorFactory)(error));
    return;
  } finally {
    // Fix memory leaks in `less`
    implementation.logger.removeListener(loggerListener);
    delete lessOptions.pluginManager.webpackLoaderContext;
    delete lessOptions.pluginManager;
  }
  const {
    css,
    imports
  } = result;
  imports.forEach(item => {
    if ((0, _utils.isUnsupportedUrl)(item)) {
      return;
    }

    // `less` return forward slashes on windows when `webpack` resolver return an absolute windows path in `WebpackFileManager`
    // Ref: https://github.com/webpack-contrib/less-loader/issues/357
    const normalizedItem = _path.default.normalize(item);

    // Custom `importer` can return only `contents` so item will be relative
    if (_path.default.isAbsolute(normalizedItem)) {
      this.addDependency(normalizedItem);
    }
  });
  let map = typeof result.map === "string" ? JSON.parse(result.map) : result.map;
  if (map && useSourceMap) {
    map = (0, _utils.normalizeSourceMap)(map, this.rootContext);
  }
  callback(null, css, map);
}
var _default = exports["default"] = lessLoader;

/***/ }),

/***/ 778:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.errorFactory = errorFactory;
exports.getLessImplementation = getLessImplementation;
exports.getLessOptions = getLessOptions;
exports.isUnsupportedUrl = isUnsupportedUrl;
exports.normalizeSourceMap = normalizeSourceMap;
var _path = _interopRequireDefault(__nccwpck_require__(17));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/* eslint-disable class-methods-use-this */
const trailingSlash = /[/\\]$/;

// This somewhat changed in Less 3.x. Now the file name comes without the
// automatically added extension whereas the extension is passed in as `options.ext`.
// So, if the file name matches this regexp, we simply ignore the proposed extension.
const IS_SPECIAL_MODULE_IMPORT = /^~[^/]+$/;

// `[drive_letter]:\` + `\\[server]\[share_name]\`
const IS_NATIVE_WIN32_PATH = /^[a-z]:[/\\]|^\\\\/i;

// Examples:
// - ~package
// - ~package/
// - ~@org
// - ~@org/
// - ~@org/package
// - ~@org/package/
const IS_MODULE_IMPORT = /^~([^/]+|[^/]+\/|@[^/]+[/][^/]+|@[^/]+\/?|@[^/]+[/][^/]+\/)$/;
const MODULE_REQUEST_REGEX = /^[^?]*~/;

/**
 * Creates a Less plugin that uses webpack's resolving engine that is provided by the loaderContext.
 *
 * @param {LoaderContext} loaderContext
 * @param {object} implementation
 * @returns {LessPlugin}
 */
function createWebpackLessPlugin(loaderContext, implementation) {
  const resolve = loaderContext.getResolve({
    dependencyType: "less",
    conditionNames: ["less", "style", "..."],
    mainFields: ["less", "style", "main", "..."],
    mainFiles: ["index", "..."],
    extensions: [".less", ".css"],
    preferRelative: true
  });
  class WebpackFileManager extends implementation.FileManager {
    supports(filename) {
      if (filename[0] === "/" || IS_NATIVE_WIN32_PATH.test(filename)) {
        return true;
      }
      if (this.isPathAbsolute(filename)) {
        return false;
      }
      return true;
    }

    // Sync resolving is used at least by the `data-uri` function.
    // This file manager doesn't know how to do it, so let's delegate it
    // to the default file manager of Less.
    // We could probably use loaderContext.resolveSync, but it's deprecated,
    // see https://webpack.js.org/api/loaders/#this-resolvesync
    supportsSync() {
      return false;
    }
    async resolveFilename(filename, currentDirectory) {
      // Less is giving us trailing slashes, but the context should have no trailing slash
      const context = currentDirectory.replace(trailingSlash, "");
      let request = filename;

      // A `~` makes the url an module
      if (MODULE_REQUEST_REGEX.test(filename)) {
        request = request.replace(MODULE_REQUEST_REGEX, "");
      }
      if (IS_MODULE_IMPORT.test(filename)) {
        request = request[request.length - 1] === "/" ? request : `${request}/`;
      }
      return this.resolveRequests(context, [...new Set([request, filename])]);
    }
    async resolveRequests(context, possibleRequests) {
      if (possibleRequests.length === 0) {
        return Promise.reject();
      }
      let result;
      try {
        result = await resolve(context, possibleRequests[0]);
      } catch (error) {
        const [, ...tailPossibleRequests] = possibleRequests;
        if (tailPossibleRequests.length === 0) {
          throw error;
        }
        result = await this.resolveRequests(context, tailPossibleRequests);
      }
      return result;
    }
    async loadFile(filename, ...args) {
      let result;
      try {
        if (IS_SPECIAL_MODULE_IMPORT.test(filename)) {
          const error = new Error();
          error.type = "Next";
          throw error;
        }
        result = await super.loadFile(filename, ...args);
      } catch (error) {
        if (error.type !== "File" && error.type !== "Next") {
          return Promise.reject(error);
        }
        try {
          result = await this.resolveFilename(filename, ...args);
        } catch (webpackResolveError) {
          error.message = `Less resolver error:\n${error.message}\n\n` + `Webpack resolver error details:\n${webpackResolveError.details}\n\n` + `Webpack resolver error missing:\n${webpackResolveError.missing}\n\n`;
          return Promise.reject(error);
        }
        loaderContext.addDependency(result);
        return super.loadFile(result, ...args);
      }
      const absoluteFilename = _path.default.isAbsolute(result.filename) ? result.filename : _path.default.resolve(".", result.filename);
      loaderContext.addDependency(_path.default.normalize(absoluteFilename));
      return result;
    }
  }
  return {
    install(lessInstance, pluginManager) {
      pluginManager.addFileManager(new WebpackFileManager());
    },
    minVersion: [3, 0, 0]
  };
}

/**
 * Get the `less` options from the loader context and normalizes its values
 *
 * @param {object} loaderContext
 * @param {object} loaderOptions
 * @param {object} implementation
 * @returns {Object}
 */
function getLessOptions(loaderContext, loaderOptions, implementation) {
  const options = typeof loaderOptions.lessOptions === "function" ? loaderOptions.lessOptions(loaderContext) || {} : loaderOptions.lessOptions || {};
  const lessOptions = {
    plugins: [],
    relativeUrls: true,
    // We need to set the filename because otherwise our WebpackFileManager will receive an undefined path for the entry
    filename: loaderContext.resourcePath,
    ...options
  };
  const plugins = lessOptions.plugins.slice();
  const shouldUseWebpackImporter = typeof loaderOptions.webpackImporter === "boolean" ? loaderOptions.webpackImporter : true;
  if (shouldUseWebpackImporter) {
    plugins.unshift(createWebpackLessPlugin(loaderContext, implementation));
  }
  plugins.unshift({
    install(lessProcessor, pluginManager) {
      // eslint-disable-next-line no-param-reassign
      pluginManager.webpackLoaderContext = loaderContext;
      lessOptions.pluginManager = pluginManager;
    }
  });
  lessOptions.plugins = plugins;
  return lessOptions;
}
function isUnsupportedUrl(url) {
  // Is Windows path
  if (IS_NATIVE_WIN32_PATH.test(url)) {
    return false;
  }

  // Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
  // Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url);
}
function normalizeSourceMap(map) {
  const newMap = map;

  // map.file is an optional property that provides the output filename.
  // Since we don't know the final filename in the webpack build chain yet, it makes no sense to have it.
  // eslint-disable-next-line no-param-reassign
  delete newMap.file;

  // eslint-disable-next-line no-param-reassign
  newMap.sourceRoot = "";

  // `less` returns POSIX paths, that's why we need to transform them back to native paths.
  // eslint-disable-next-line no-param-reassign
  newMap.sources = newMap.sources.map(source => _path.default.normalize(source));
  return newMap;
}
function getLessImplementation(loaderContext, implementation) {
  let resolvedImplementation = implementation;
  if (!implementation || typeof implementation === "string") {
    const lessImplPkg = implementation || "less";

    // eslint-disable-next-line import/no-dynamic-require, global-require
    resolvedImplementation = require(lessImplPkg);
  }

  // eslint-disable-next-line consistent-return
  return resolvedImplementation;
}
function getFileExcerptIfPossible(error) {
  if (typeof error.extract === "undefined") {
    return [];
  }
  const excerpt = error.extract.slice(0, 2);
  const column = Math.max(error.column - 1, 0);
  if (typeof excerpt[0] === "undefined") {
    excerpt.shift();
  }
  excerpt.push(`${new Array(column).join(" ")}^`);
  return excerpt;
}
function errorFactory(error) {
  const message = ["\n", ...getFileExcerptIfPossible(error), error.message.charAt(0).toUpperCase() + error.message.slice(1), error.filename ? `      Error in ${_path.default.normalize(error.filename)} (line ${error.line}, column ${error.column})` : ""].join("\n");
  const obj = new Error(message, {
    cause: error
  });
  obj.stack = null;
  return obj;
}

/***/ }),

/***/ 17:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 284:
/***/ ((module) => {

module.exports = JSON.parse('{"title":"Less Loader options","type":"object","properties":{"lessOptions":{"description":"Options to pass through to `Less`.","link":"https://github.com/webpack-contrib/less-loader#lessoptions","anyOf":[{"type":"object","additionalProperties":true},{"instanceof":"Function"}]},"additionalData":{"description":"Prepends/Appends `Less` code to the actual entry file.","link":"https://github.com/webpack-contrib/less-loader#additionalData","anyOf":[{"type":"string"},{"instanceof":"Function"}]},"sourceMap":{"description":"Enables/Disables generation of source maps.","link":"https://github.com/webpack-contrib/less-loader#sourcemap","type":"boolean"},"webpackImporter":{"description":"Enables/Disables default `webpack` importer.","link":"https://github.com/webpack-contrib/less-loader#webpackimporter","type":"boolean"},"implementation":{"description":"The implementation of the `Less` to be used.","link":"https://github.com/webpack-contrib/less-loader#implementation","anyOf":[{"type":"string"},{"type":"object"}]},"lessLogAsWarnOrErr":{"description":"Less warnings and errors will be webpack warnings or errors.","link":"https://github.com/webpack-contrib/less-loader#lesslogaswarnorerr","type":"boolean"}},"additionalProperties":false}');

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
/******/ 	// This entry module used 'module' so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(218);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;