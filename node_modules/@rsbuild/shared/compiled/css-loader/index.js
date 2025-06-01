/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 169:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const loader = __nccwpck_require__(436);
module.exports = loader.default;
module.exports.defaultGetLocalIdent = __nccwpck_require__(809).defaultGetLocalIdent;

/***/ }),

/***/ 436:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = loader;
var _postcss = _interopRequireDefault(__nccwpck_require__(977));
var _package = _interopRequireDefault(__nccwpck_require__(446));
var _semver = __nccwpck_require__(204);
var _options = _interopRequireDefault(__nccwpck_require__(879));
var _plugins = __nccwpck_require__(69);
var _utils = __nccwpck_require__(809);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

async function loader(content, map, meta) {
  const rawOptions = this.getOptions(_options.default);
  const callback = this.async();
  if (this._compiler && this._compiler.options && this._compiler.options.experiments && this._compiler.options.experiments.css && this._module && (this._module.type === "css" || this._module.type === "css/auto" || this._module.type === "css/global" || this._module.type === "css/module")) {
    this.emitWarning(new Error('You can\'t use `experiments.css` (`experiments.futureDefaults` enable built-in CSS support by default) and `css-loader` together, please set `experiments.css` to `false` or set `{ type: "javascript/auto" }` for rules with `css-loader` in your webpack config (now css-loader does nothing).'));
    callback(null, content, map, meta);
    return;
  }
  let options;
  try {
    options = (0, _utils.normalizeOptions)(rawOptions, this);
  } catch (error) {
    callback(error);
    return;
  }
  const plugins = [];
  const replacements = [];
  const exports = [];
  if ((0, _utils.shouldUseModulesPlugins)(options)) {
    plugins.push(...(0, _utils.getModulesPlugins)(options, this));
  }
  const importPluginImports = [];
  const importPluginApi = [];
  let isSupportAbsoluteURL = false;

  // TODO enable by default in the next major release
  if (this._compilation && this._compilation.options && this._compilation.options.experiments && this._compilation.options.experiments.buildHttp) {
    isSupportAbsoluteURL = true;
  }
  if ((0, _utils.shouldUseImportPlugin)(options)) {
    plugins.push((0, _plugins.importParser)({
      // TODO need to fix on webpack side, webpack tries to resolve `./runtime/api.js paths like `http://site.com/runtime/api.js`, maybe we should try first request like absolute, the second like a relative to context
      isSupportAbsoluteURL: false,
      isSupportDataURL: false,
      isCSSStyleSheet: options.exportType === "css-style-sheet",
      loaderContext: this,
      imports: importPluginImports,
      api: importPluginApi,
      filter: options.import.filter,
      urlHandler: url => (0, _utils.stringifyRequest)(this, (0, _utils.combineRequests)((0, _utils.getPreRequester)(this)(options.importLoaders), url))
    }));
  }
  const urlPluginImports = [];
  if ((0, _utils.shouldUseURLPlugin)(options)) {
    const needToResolveURL = !options.esModule;
    plugins.push((0, _plugins.urlParser)({
      isSupportAbsoluteURL,
      isSupportDataURL: options.esModule,
      imports: urlPluginImports,
      replacements,
      context: this.context,
      rootContext: this.rootContext,
      filter: (0, _utils.getFilter)(options.url.filter, this.resourcePath),
      resolver: needToResolveURL ? this.getResolve({
        mainFiles: [],
        extensions: []
      }) :
      // eslint-disable-next-line no-undefined
      undefined,
      urlHandler: url => (0, _utils.stringifyRequest)(this, url)
      // Support data urls as input in new URL added in webpack@5.38.0
    }));
  }
  const icssPluginImports = [];
  const icssPluginApi = [];
  const needToUseIcssPlugin = (0, _utils.shouldUseIcssPlugin)(options);
  if (needToUseIcssPlugin) {
    plugins.push((0, _plugins.icssParser)({
      loaderContext: this,
      imports: icssPluginImports,
      api: icssPluginApi,
      replacements,
      exports,
      urlHandler: url => (0, _utils.stringifyRequest)(this, (0, _utils.combineRequests)((0, _utils.getPreRequester)(this)(options.importLoaders), url))
    }));
  }

  // Reuse CSS AST (PostCSS AST e.g 'postcss-loader') to avoid reparsing
  if (meta) {
    const {
      ast
    } = meta;
    if (ast && ast.type === "postcss" && (0, _semver.satisfies)(ast.version, `^${_package.default.version}`)) {
      // eslint-disable-next-line no-param-reassign
      content = ast.root;
    }
  }
  const {
    resourcePath
  } = this;
  let result;
  try {
    result = await (0, _postcss.default)(plugins).process(content, {
      hideNothingWarning: true,
      from: resourcePath,
      to: resourcePath,
      map: options.sourceMap ? {
        prev: map ? (0, _utils.normalizeSourceMap)(map, resourcePath) : null,
        inline: false,
        annotation: false
      } : false
    });
  } catch (error) {
    if (error.file) {
      this.addDependency(error.file);
    }
    callback(error.name === "CssSyntaxError" ? (0, _utils.syntaxErrorFactory)(error) : error);
    return;
  }
  for (const warning of result.warnings()) {
    this.emitWarning((0, _utils.warningFactory)(warning));
  }
  const imports = [].concat(icssPluginImports.sort(_utils.sort)).concat(importPluginImports.sort(_utils.sort)).concat(urlPluginImports.sort(_utils.sort));
  const api = [].concat(importPluginApi.sort(_utils.sort)).concat(icssPluginApi.sort(_utils.sort));
  if (options.modules.exportOnlyLocals !== true) {
    imports.unshift({
      type: "api_import",
      importName: "___CSS_LOADER_API_IMPORT___",
      url: (0, _utils.stringifyRequest)(this, __nccwpck_require__.ab + "api.js")
    });
    if (options.sourceMap) {
      imports.unshift({
        importName: "___CSS_LOADER_API_SOURCEMAP_IMPORT___",
        url: (0, _utils.stringifyRequest)(this, __nccwpck_require__.ab + "sourceMaps.js")
      });
    } else {
      imports.unshift({
        importName: "___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___",
        url: (0, _utils.stringifyRequest)(this, __nccwpck_require__.ab + "noSourceMaps.js")
      });
    }
  }
  let isTemplateLiteralSupported = false;
  if (
  // eslint-disable-next-line no-underscore-dangle
  this._compilation &&
  // eslint-disable-next-line no-underscore-dangle
  this._compilation.options &&
  // eslint-disable-next-line no-underscore-dangle
  this._compilation.options.output &&
  // eslint-disable-next-line no-underscore-dangle
  this._compilation.options.output.environment &&
  // eslint-disable-next-line no-underscore-dangle
  this._compilation.options.output.environment.templateLiteral) {
    isTemplateLiteralSupported = true;
  }
  const importCode = (0, _utils.getImportCode)(imports, options);
  let moduleCode;
  try {
    moduleCode = (0, _utils.getModuleCode)(result, api, replacements, options, isTemplateLiteralSupported, this);
  } catch (error) {
    callback(error);
    return;
  }
  const exportCode = (0, _utils.getExportCode)(exports, replacements, needToUseIcssPlugin, options, isTemplateLiteralSupported);
  const {
    getJSON
  } = options.modules;
  if (typeof getJSON === "function") {
    try {
      await getJSON({
        resourcePath,
        imports,
        exports,
        replacements
      });
    } catch (error) {
      callback(error);
      return;
    }
  }
  callback(null, `${importCode}${moduleCode}${exportCode}`);
}

/***/ }),

/***/ 69:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
Object.defineProperty(exports, "icssParser", ({
  enumerable: true,
  get: function () {
    return _postcssIcssParser.default;
  }
}));
Object.defineProperty(exports, "importParser", ({
  enumerable: true,
  get: function () {
    return _postcssImportParser.default;
  }
}));
Object.defineProperty(exports, "urlParser", ({
  enumerable: true,
  get: function () {
    return _postcssUrlParser.default;
  }
}));
var _postcssImportParser = _interopRequireDefault(__nccwpck_require__(535));
var _postcssIcssParser = _interopRequireDefault(__nccwpck_require__(88));
var _postcssUrlParser = _interopRequireDefault(__nccwpck_require__(134));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***/ }),

/***/ 88:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _icssUtils = __nccwpck_require__(417);
var _utils = __nccwpck_require__(809);
const plugin = (options = {}) => {
  return {
    postcssPlugin: "postcss-icss-parser",
    async OnceExit(root) {
      const importReplacements = Object.create(null);
      const {
        icssImports,
        icssExports
      } = (0, _icssUtils.extractICSS)(root);
      const imports = new Map();
      const tasks = [];
      const {
        loaderContext
      } = options;
      const resolver = loaderContext.getResolve({
        dependencyType: "icss",
        conditionNames: ["style"],
        extensions: ["..."],
        mainFields: ["css", "style", "main", "..."],
        mainFiles: ["index", "..."],
        preferRelative: true
      });

      // eslint-disable-next-line guard-for-in
      for (const url in icssImports) {
        const tokens = icssImports[url];
        if (Object.keys(tokens).length === 0) {
          // eslint-disable-next-line no-continue
          continue;
        }
        let normalizedUrl = url;
        let prefix = "";
        const queryParts = normalizedUrl.split("!");
        if (queryParts.length > 1) {
          normalizedUrl = queryParts.pop();
          prefix = queryParts.join("!");
        }
        const request = (0, _utils.requestify)((0, _utils.normalizeUrl)(normalizedUrl, true), loaderContext.rootContext);
        const doResolve = async () => {
          const resolvedUrl = await (0, _utils.resolveRequests)(resolver, loaderContext.context, [...new Set([normalizedUrl, request])]);
          if (!resolvedUrl) {
            return;
          }

          // eslint-disable-next-line consistent-return
          return {
            url: resolvedUrl,
            prefix,
            tokens
          };
        };
        tasks.push(doResolve());
      }
      const results = await Promise.all(tasks);
      for (let index = 0; index <= results.length - 1; index++) {
        const item = results[index];
        if (!item) {
          // eslint-disable-next-line no-continue
          continue;
        }
        const newUrl = item.prefix ? `${item.prefix}!${item.url}` : item.url;
        const importKey = newUrl;
        let importName = imports.get(importKey);
        if (!importName) {
          importName = `___CSS_LOADER_ICSS_IMPORT_${imports.size}___`;
          imports.set(importKey, importName);
          options.imports.push({
            type: "icss_import",
            importName,
            url: options.urlHandler(newUrl),
            icss: true,
            index
          });
          options.api.push({
            importName,
            dedupe: true,
            index
          });
        }
        for (const [replacementIndex, token] of Object.keys(item.tokens).entries()) {
          const replacementName = `___CSS_LOADER_ICSS_IMPORT_${index}_REPLACEMENT_${replacementIndex}___`;
          const localName = item.tokens[token];
          importReplacements[token] = replacementName;
          options.replacements.push({
            replacementName,
            importName,
            localName
          });
        }
      }
      if (Object.keys(importReplacements).length > 0) {
        (0, _icssUtils.replaceSymbols)(root, importReplacements);
      }
      for (const name of Object.keys(icssExports)) {
        const value = (0, _icssUtils.replaceValueSymbols)(icssExports[name], importReplacements);
        options.exports.push({
          name,
          value
        });
      }
    }
  };
};
plugin.postcss = true;
var _default = exports["default"] = plugin;

/***/ }),

/***/ 535:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _postcssValueParser = _interopRequireDefault(__nccwpck_require__(36));
var _utils = __nccwpck_require__(809);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function parseNode(atRule, key, options) {
  // Convert only top-level @import
  if (atRule.parent.type !== "root") {
    return;
  }
  if (atRule.raws && atRule.raws.afterName && atRule.raws.afterName.trim().length > 0) {
    const lastCommentIndex = atRule.raws.afterName.lastIndexOf("/*");
    const matched = atRule.raws.afterName.slice(lastCommentIndex).match(_utils.WEBPACK_IGNORE_COMMENT_REGEXP);
    if (matched && matched[2] === "true") {
      return;
    }
  }
  const prevNode = atRule.prev();
  if (prevNode && prevNode.type === "comment") {
    const matched = prevNode.text.match(_utils.WEBPACK_IGNORE_COMMENT_REGEXP);
    if (matched && matched[2] === "true") {
      return;
    }
  }

  // Nodes do not exists - `@import url('http://') :root {}`
  if (atRule.nodes) {
    const error = new Error("It looks like you didn't end your @import statement correctly. Child nodes are attached to it.");
    error.node = atRule;
    throw error;
  }
  const rawParams = atRule.raws && atRule.raws[key] && typeof atRule.raws[key].raw !== "undefined" ? atRule.raws[key].raw : atRule[key];
  const {
    nodes: paramsNodes
  } = (0, _postcssValueParser.default)(rawParams);

  // No nodes - `@import ;`
  // Invalid type - `@import foo-bar;`
  if (paramsNodes.length === 0 || paramsNodes[0].type !== "string" && paramsNodes[0].type !== "function") {
    const error = new Error(`Unable to find uri in "${atRule.toString()}"`);
    error.node = atRule;
    throw error;
  }
  let isStringValue;
  let url;
  if (paramsNodes[0].type === "string") {
    isStringValue = true;
    url = paramsNodes[0].value;
  } else {
    // Invalid function - `@import nourl(test.css);`
    if (paramsNodes[0].value.toLowerCase() !== "url") {
      const error = new Error(`Unable to find uri in "${atRule.toString()}"`);
      error.node = atRule;
      throw error;
    }
    isStringValue = paramsNodes[0].nodes.length !== 0 && paramsNodes[0].nodes[0].type === "string";
    url = isStringValue ? paramsNodes[0].nodes[0].value : _postcssValueParser.default.stringify(paramsNodes[0].nodes);
  }
  url = (0, _utils.normalizeUrl)(url, isStringValue);
  const {
    requestable,
    needResolve
  } = (0, _utils.isURLRequestable)(url, options);
  let prefix;
  if (requestable && needResolve) {
    const queryParts = url.split("!");
    if (queryParts.length > 1) {
      url = queryParts.pop();
      prefix = queryParts.join("!");
    }
  }

  // Empty url - `@import "";` or `@import url();`
  if (url.trim().length === 0) {
    const error = new Error(`Unable to find uri in "${atRule.toString()}"`);
    error.node = atRule;
    throw error;
  }
  const additionalNodes = paramsNodes.slice(1);
  let supports;
  let layer;
  let media;
  if (additionalNodes.length > 0) {
    let nodes = [];
    for (const node of additionalNodes) {
      nodes.push(node);
      const isLayerFunction = node.type === "function" && node.value.toLowerCase() === "layer";
      const isLayerWord = node.type === "word" && node.value.toLowerCase() === "layer";
      if (isLayerFunction || isLayerWord) {
        if (isLayerFunction) {
          nodes.splice(nodes.length - 1, 1, ...node.nodes);
        } else {
          nodes.splice(nodes.length - 1, 1, {
            type: "string",
            value: "",
            unclosed: false
          });
        }
        layer = _postcssValueParser.default.stringify(nodes).trim().toLowerCase();
        nodes = [];
      } else if (node.type === "function" && node.value.toLowerCase() === "supports") {
        nodes.splice(nodes.length - 1, 1, ...node.nodes);
        supports = _postcssValueParser.default.stringify(nodes).trim().toLowerCase();
        nodes = [];
      }
    }
    if (nodes.length > 0) {
      media = _postcssValueParser.default.stringify(nodes).trim().toLowerCase();
    }
  }

  // eslint-disable-next-line consistent-return
  return {
    atRule,
    prefix,
    url,
    layer,
    supports,
    media,
    requestable,
    needResolve
  };
}
const plugin = (options = {}) => {
  return {
    postcssPlugin: "postcss-import-parser",
    prepare(result) {
      const parsedAtRules = [];
      return {
        AtRule: {
          import(atRule) {
            if (options.isCSSStyleSheet) {
              options.loaderContext.emitError(new Error(atRule.error("'@import' rules are not allowed here and will not be processed").message));
              return;
            }
            const {
              isSupportDataURL,
              isSupportAbsoluteURL
            } = options;
            let parsedAtRule;
            try {
              parsedAtRule = parseNode(atRule, "params", {
                isSupportAbsoluteURL,
                isSupportDataURL
              });
            } catch (error) {
              result.warn(error.message, {
                node: error.node
              });
            }
            if (!parsedAtRule) {
              return;
            }
            parsedAtRules.push(parsedAtRule);
          }
        },
        async OnceExit() {
          if (parsedAtRules.length === 0) {
            return;
          }
          const {
            loaderContext
          } = options;
          const resolver = loaderContext.getResolve({
            dependencyType: "css",
            conditionNames: ["style"],
            mainFields: ["css", "style", "main", "..."],
            mainFiles: ["index", "..."],
            extensions: [".css", "..."],
            preferRelative: true
          });
          const resolvedAtRules = await Promise.all(parsedAtRules.map(async parsedAtRule => {
            const {
              atRule,
              requestable,
              needResolve,
              prefix,
              url,
              layer,
              supports,
              media
            } = parsedAtRule;
            if (options.filter) {
              const needKeep = await options.filter(url, media, loaderContext.resourcePath, supports, layer);
              if (!needKeep) {
                return;
              }
            }
            if (needResolve) {
              const request = (0, _utils.requestify)(url, loaderContext.rootContext);
              const resolvedUrl = await (0, _utils.resolveRequests)(resolver, loaderContext.context, [...new Set([request, url])]);
              if (!resolvedUrl) {
                return;
              }
              if (resolvedUrl === loaderContext.resourcePath) {
                atRule.remove();
                return;
              }
              atRule.remove();

              // eslint-disable-next-line consistent-return
              return {
                url: resolvedUrl,
                layer,
                supports,
                media,
                prefix,
                requestable
              };
            }
            atRule.remove();

            // eslint-disable-next-line consistent-return
            return {
              url,
              layer,
              supports,
              media,
              prefix,
              requestable
            };
          }));
          const urlToNameMap = new Map();
          for (let index = 0; index <= resolvedAtRules.length - 1; index++) {
            const resolvedAtRule = resolvedAtRules[index];
            if (!resolvedAtRule) {
              // eslint-disable-next-line no-continue
              continue;
            }
            const {
              url,
              requestable,
              layer,
              supports,
              media
            } = resolvedAtRule;
            if (!requestable) {
              options.api.push({
                url,
                layer,
                supports,
                media,
                index
              });

              // eslint-disable-next-line no-continue
              continue;
            }
            const {
              prefix
            } = resolvedAtRule;
            const newUrl = prefix ? `${prefix}!${url}` : url;
            let importName = urlToNameMap.get(newUrl);
            if (!importName) {
              importName = `___CSS_LOADER_AT_RULE_IMPORT_${urlToNameMap.size}___`;
              urlToNameMap.set(newUrl, importName);
              options.imports.push({
                type: "rule_import",
                importName,
                url: options.urlHandler(newUrl),
                index
              });
            }
            options.api.push({
              importName,
              layer,
              supports,
              media,
              index
            });
          }
        }
      };
    }
  };
};
plugin.postcss = true;
var _default = exports["default"] = plugin;

/***/ }),

/***/ 134:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports["default"] = void 0;
var _postcssValueParser = _interopRequireDefault(__nccwpck_require__(36));
var _utils = __nccwpck_require__(809);
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const isUrlFunc = /url/i;
const isImageSetFunc = /^(?:-webkit-)?image-set$/i;
const needParseDeclaration = /(?:url|(?:-webkit-)?image-set)\(/i;
function getNodeFromUrlFunc(node) {
  return node.nodes && node.nodes[0];
}
function getWebpackIgnoreCommentValue(index, nodes, inBetween) {
  if (index === 0 && typeof inBetween !== "undefined") {
    return inBetween;
  }
  let prevValueNode = nodes[index - 1];
  if (!prevValueNode) {
    // eslint-disable-next-line consistent-return
    return;
  }
  if (prevValueNode.type === "space") {
    if (!nodes[index - 2]) {
      // eslint-disable-next-line consistent-return
      return;
    }
    prevValueNode = nodes[index - 2];
  }
  if (prevValueNode.type !== "comment") {
    // eslint-disable-next-line consistent-return
    return;
  }
  const matched = prevValueNode.value.match(_utils.WEBPACK_IGNORE_COMMENT_REGEXP);
  return matched && matched[2] === "true";
}
function shouldHandleURL(url, declaration, result, options) {
  if (url.length === 0) {
    result.warn(`Unable to find uri in '${declaration.toString()}'`, {
      node: declaration
    });
    return {
      requestable: false,
      needResolve: false
    };
  }
  return (0, _utils.isURLRequestable)(url, options);
}
function parseDeclaration(declaration, key, result, options) {
  if (!needParseDeclaration.test(declaration[key])) {
    return;
  }
  const parsed = (0, _postcssValueParser.default)(declaration.raws && declaration.raws.value && declaration.raws.value.raw ? declaration.raws.value.raw : declaration[key]);
  let inBetween;
  if (declaration.raws && declaration.raws.between) {
    const lastCommentIndex = declaration.raws.between.lastIndexOf("/*");
    const matched = declaration.raws.between.slice(lastCommentIndex).match(_utils.WEBPACK_IGNORE_COMMENT_REGEXP);
    if (matched) {
      inBetween = matched[2] === "true";
    }
  }
  let isIgnoreOnDeclaration = false;
  const prevNode = declaration.prev();
  if (prevNode && prevNode.type === "comment") {
    const matched = prevNode.text.match(_utils.WEBPACK_IGNORE_COMMENT_REGEXP);
    if (matched) {
      isIgnoreOnDeclaration = matched[2] === "true";
    }
  }
  let needIgnore;
  const parsedURLs = [];
  parsed.walk((valueNode, index, valueNodes) => {
    if (valueNode.type !== "function") {
      return;
    }
    if (isUrlFunc.test(valueNode.value)) {
      needIgnore = getWebpackIgnoreCommentValue(index, valueNodes, inBetween);
      if (isIgnoreOnDeclaration && typeof needIgnore === "undefined" || needIgnore) {
        if (needIgnore) {
          // eslint-disable-next-line no-undefined
          needIgnore = undefined;
        }
        return;
      }
      const {
        nodes
      } = valueNode;
      const isStringValue = nodes.length !== 0 && nodes[0].type === "string";
      let url = isStringValue ? nodes[0].value : _postcssValueParser.default.stringify(nodes);
      url = (0, _utils.normalizeUrl)(url, isStringValue);
      const {
        requestable,
        needResolve
      } = shouldHandleURL(url, declaration, result, options);

      // Do not traverse inside `url`
      if (!requestable) {
        // eslint-disable-next-line consistent-return
        return false;
      }
      const queryParts = url.split("!");
      let prefix;
      if (queryParts.length > 1) {
        url = queryParts.pop();
        prefix = queryParts.join("!");
      }
      parsedURLs.push({
        declaration,
        parsed,
        node: getNodeFromUrlFunc(valueNode),
        prefix,
        url,
        needQuotes: false,
        needResolve
      });

      // eslint-disable-next-line consistent-return
      return false;
    } else if (isImageSetFunc.test(valueNode.value)) {
      for (const [innerIndex, nNode] of valueNode.nodes.entries()) {
        const {
          type,
          value
        } = nNode;
        if (type === "function" && isUrlFunc.test(value)) {
          needIgnore = getWebpackIgnoreCommentValue(innerIndex, valueNode.nodes);
          if (isIgnoreOnDeclaration && typeof needIgnore === "undefined" || needIgnore) {
            if (needIgnore) {
              // eslint-disable-next-line no-undefined
              needIgnore = undefined;
            }

            // eslint-disable-next-line no-continue
            continue;
          }
          const {
            nodes
          } = nNode;
          const isStringValue = nodes.length !== 0 && nodes[0].type === "string";
          let url = isStringValue ? nodes[0].value : _postcssValueParser.default.stringify(nodes);
          url = (0, _utils.normalizeUrl)(url, isStringValue);
          const {
            requestable,
            needResolve
          } = shouldHandleURL(url, declaration, result, options);

          // Do not traverse inside `url`
          if (!requestable) {
            // eslint-disable-next-line consistent-return
            return false;
          }
          const queryParts = url.split("!");
          let prefix;
          if (queryParts.length > 1) {
            url = queryParts.pop();
            prefix = queryParts.join("!");
          }
          parsedURLs.push({
            declaration,
            parsed,
            node: getNodeFromUrlFunc(nNode),
            prefix,
            url,
            needQuotes: false,
            needResolve
          });
        } else if (type === "string") {
          needIgnore = getWebpackIgnoreCommentValue(innerIndex, valueNode.nodes);
          if (isIgnoreOnDeclaration && typeof needIgnore === "undefined" || needIgnore) {
            if (needIgnore) {
              // eslint-disable-next-line no-undefined
              needIgnore = undefined;
            }

            // eslint-disable-next-line no-continue
            continue;
          }
          let url = (0, _utils.normalizeUrl)(value, true);
          const {
            requestable,
            needResolve
          } = shouldHandleURL(url, declaration, result, options);

          // Do not traverse inside `url`
          if (!requestable) {
            // eslint-disable-next-line consistent-return
            return false;
          }
          const queryParts = url.split("!");
          let prefix;
          if (queryParts.length > 1) {
            url = queryParts.pop();
            prefix = queryParts.join("!");
          }
          parsedURLs.push({
            declaration,
            parsed,
            node: nNode,
            prefix,
            url,
            needQuotes: true,
            needResolve
          });
        }
      }

      // Do not traverse inside `image-set`
      // eslint-disable-next-line consistent-return
      return false;
    }
  });

  // eslint-disable-next-line consistent-return
  return parsedURLs;
}
const plugin = (options = {}) => {
  return {
    postcssPlugin: "postcss-url-parser",
    prepare(result) {
      const parsedDeclarations = [];
      return {
        Declaration(declaration) {
          const {
            isSupportDataURL,
            isSupportAbsoluteURL
          } = options;
          const parsedURL = parseDeclaration(declaration, "value", result, {
            isSupportDataURL,
            isSupportAbsoluteURL
          });
          if (!parsedURL) {
            return;
          }
          parsedDeclarations.push(...parsedURL);
        },
        async OnceExit() {
          if (parsedDeclarations.length === 0) {
            return;
          }
          const resolvedDeclarations = await Promise.all(parsedDeclarations.map(async parsedDeclaration => {
            const {
              url,
              needResolve
            } = parsedDeclaration;
            if (options.filter) {
              const needKeep = await options.filter(url);
              if (!needKeep) {
                // eslint-disable-next-line consistent-return
                return;
              }
            }
            if (!needResolve) {
              // eslint-disable-next-line consistent-return
              return parsedDeclaration;
            }
            const splittedUrl = url.split(/(\?)?#/);
            const [pathname, query, hashOrQuery] = splittedUrl;
            let hash = query ? "?" : "";
            hash += hashOrQuery ? `#${hashOrQuery}` : "";
            const {
              resolver,
              rootContext
            } = options;
            const request = (0, _utils.requestify)(pathname, rootContext, Boolean(resolver));
            if (!resolver) {
              // eslint-disable-next-line consistent-return
              return {
                ...parsedDeclaration,
                url: request,
                hash
              };
            }
            const resolvedURL = await (0, _utils.resolveRequests)(resolver, options.context, [...new Set([request, url])]);
            if (!resolvedURL) {
              // eslint-disable-next-line consistent-return
              return;
            }

            // eslint-disable-next-line consistent-return
            return {
              ...parsedDeclaration,
              url: resolvedURL,
              hash
            };
          }));
          const urlToNameMap = new Map();
          const urlToReplacementMap = new Map();
          let hasUrlImportHelper = false;
          for (let index = 0; index <= resolvedDeclarations.length - 1; index++) {
            const item = resolvedDeclarations[index];
            if (!item) {
              // eslint-disable-next-line no-continue
              continue;
            }
            if (!hasUrlImportHelper) {
              options.imports.push({
                type: "get_url_import",
                importName: "___CSS_LOADER_GET_URL_IMPORT___",
                url: options.urlHandler(__nccwpck_require__.ab + "getUrl.js"),
                index: -1
              });
              hasUrlImportHelper = true;
            }
            const {
              url,
              prefix
            } = item;
            const newUrl = prefix ? `${prefix}!${url}` : url;
            let importName = urlToNameMap.get(newUrl);
            if (!importName) {
              importName = `___CSS_LOADER_URL_IMPORT_${urlToNameMap.size}___`;
              urlToNameMap.set(newUrl, importName);
              options.imports.push({
                type: "url",
                importName,
                url: options.resolver ? options.urlHandler(newUrl) : JSON.stringify(newUrl),
                index
              });
            }
            const {
              hash,
              needQuotes
            } = item;
            const replacementKey = JSON.stringify({
              newUrl,
              hash,
              needQuotes
            });
            let replacementName = urlToReplacementMap.get(replacementKey);
            if (!replacementName) {
              replacementName = `___CSS_LOADER_URL_REPLACEMENT_${urlToReplacementMap.size}___`;
              urlToReplacementMap.set(replacementKey, replacementName);
              options.replacements.push({
                replacementName,
                importName,
                hash,
                needQuotes
              });
            }

            // eslint-disable-next-line no-param-reassign
            item.node.type = "word";
            // eslint-disable-next-line no-param-reassign
            item.node.value = replacementName;
            // eslint-disable-next-line no-param-reassign
            item.declaration.value = item.parsed.toString();
          }
        }
      };
    }
  };
};
plugin.postcss = true;
var _default = exports["default"] = plugin;

/***/ }),

/***/ 809:
/***/ ((__unused_webpack_module, exports, __nccwpck_require__) => {



Object.defineProperty(exports, "__esModule", ({
  value: true
}));
exports.WEBPACK_IGNORE_COMMENT_REGEXP = void 0;
exports.camelCase = camelCase;
exports.combineRequests = combineRequests;
exports.defaultGetLocalIdent = defaultGetLocalIdent;
exports.getExportCode = getExportCode;
exports.getFilter = getFilter;
exports.getImportCode = getImportCode;
exports.getModuleCode = getModuleCode;
exports.getModulesOptions = getModulesOptions;
exports.getModulesPlugins = getModulesPlugins;
exports.getPreRequester = getPreRequester;
exports.isDataUrl = isDataUrl;
exports.isURLRequestable = isURLRequestable;
exports.normalizeOptions = normalizeOptions;
exports.normalizeSourceMap = normalizeSourceMap;
exports.normalizeUrl = normalizeUrl;
exports.requestify = requestify;
exports.resolveRequests = resolveRequests;
exports.shouldUseIcssPlugin = shouldUseIcssPlugin;
exports.shouldUseImportPlugin = shouldUseImportPlugin;
exports.shouldUseModulesPlugins = shouldUseModulesPlugins;
exports.shouldUseURLPlugin = shouldUseURLPlugin;
exports.sort = sort;
exports.stringifyRequest = stringifyRequest;
exports.syntaxErrorFactory = syntaxErrorFactory;
exports.warningFactory = warningFactory;
var _url = __nccwpck_require__(310);
var _path = _interopRequireDefault(__nccwpck_require__(17));
var _postcssModulesValues = _interopRequireDefault(__nccwpck_require__(193));
var _postcssModulesLocalByDefault = _interopRequireDefault(__nccwpck_require__(552));
var _postcssModulesExtractImports = _interopRequireDefault(__nccwpck_require__(749));
var _postcssModulesScope = _interopRequireDefault(__nccwpck_require__(898));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/

const WEBPACK_IGNORE_COMMENT_REGEXP = exports.WEBPACK_IGNORE_COMMENT_REGEXP = /webpackIgnore:(\s+)?(true|false)/;
function stringifyRequest(loaderContext, request) {
  return JSON.stringify(loaderContext.utils.contextify(loaderContext.context || loaderContext.rootContext, request));
}

// We can't use path.win32.isAbsolute because it also matches paths starting with a forward slash
const IS_NATIVE_WIN32_PATH = /^[a-z]:[/\\]|^\\\\/i;
const IS_MODULE_REQUEST = /^[^?]*~/;
function urlToRequest(url, root) {
  let request;
  if (IS_NATIVE_WIN32_PATH.test(url)) {
    // absolute windows path, keep it
    request = url;
  } else if (typeof root !== "undefined" && /^\//.test(url)) {
    request = root + url;
  } else if (/^\.\.?\//.test(url)) {
    // A relative url stays
    request = url;
  } else {
    // every other url is threaded like a relative url
    request = `./${url}`;
  }

  // A `~` makes the url an module
  if (IS_MODULE_REQUEST.test(request)) {
    request = request.replace(IS_MODULE_REQUEST, "");
  }
  return request;
}

// eslint-disable-next-line no-useless-escape
const regexSingleEscape = /[ -,.\/:-@[\]\^`{-~]/;
const regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;
const preserveCamelCase = string => {
  let result = string;
  let isLastCharLower = false;
  let isLastCharUpper = false;
  let isLastLastCharUpper = false;
  for (let i = 0; i < result.length; i++) {
    const character = result[i];
    if (isLastCharLower && /[\p{Lu}]/u.test(character)) {
      result = `${result.slice(0, i)}-${result.slice(i)}`;
      isLastCharLower = false;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = true;
      i += 1;
    } else if (isLastCharUpper && isLastLastCharUpper && /[\p{Ll}]/u.test(character)) {
      result = `${result.slice(0, i - 1)}-${result.slice(i - 1)}`;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = false;
      isLastCharLower = true;
    } else {
      isLastCharLower = character.toLowerCase() === character && character.toUpperCase() !== character;
      isLastLastCharUpper = isLastCharUpper;
      isLastCharUpper = character.toUpperCase() === character && character.toLowerCase() !== character;
    }
  }
  return result;
};
function camelCase(input) {
  let result = input.trim();
  if (result.length === 0) {
    return "";
  }
  if (result.length === 1) {
    return result.toLowerCase();
  }
  const hasUpperCase = result !== result.toLowerCase();
  if (hasUpperCase) {
    result = preserveCamelCase(result);
  }
  return result.replace(/^[_.\- ]+/, "").toLowerCase().replace(/[_.\- ]+([\p{Alpha}\p{N}_]|$)/gu, (_, p1) => p1.toUpperCase()).replace(/\d+([\p{Alpha}\p{N}_]|$)/gu, m => m.toUpperCase());
}
function escape(string) {
  let output = "";
  let counter = 0;
  while (counter < string.length) {
    // eslint-disable-next-line no-plusplus
    const character = string.charAt(counter++);
    let value;

    // eslint-disable-next-line no-control-regex
    if (/[\t\n\f\r\x0B]/.test(character)) {
      const codePoint = character.charCodeAt();
      value = `\\${codePoint.toString(16).toUpperCase()} `;
    } else if (character === "\\" || regexSingleEscape.test(character)) {
      value = `\\${character}`;
    } else {
      value = character;
    }
    output += value;
  }
  const firstChar = string.charAt(0);
  if (/^-[-\d]/.test(output)) {
    output = `\\-${output.slice(1)}`;
  } else if (/\d/.test(firstChar)) {
    output = `\\3${firstChar} ${output.slice(1)}`;
  }

  // Remove spaces after `\HEX` escapes that are not followed by a hex digit,
  // since they’re redundant. Note that this is only possible if the escape
  // sequence isn’t preceded by an odd number of backslashes.
  output = output.replace(regexExcessiveSpaces, ($0, $1, $2) => {
    if ($1 && $1.length % 2) {
      // It’s not safe to remove the space, so don’t.
      return $0;
    }

    // Strip the space.
    return ($1 || "") + $2;
  });
  return output;
}
function gobbleHex(str) {
  const lower = str.toLowerCase();
  let hex = "";
  let spaceTerminated = false;

  // eslint-disable-next-line no-undefined
  for (let i = 0; i < 6 && lower[i] !== undefined; i++) {
    const code = lower.charCodeAt(i);
    // check to see if we are dealing with a valid hex char [a-f|0-9]
    const valid = code >= 97 && code <= 102 || code >= 48 && code <= 57;
    // https://drafts.csswg.org/css-syntax/#consume-escaped-code-point
    spaceTerminated = code === 32;
    if (!valid) {
      break;
    }
    hex += lower[i];
  }
  if (hex.length === 0) {
    // eslint-disable-next-line no-undefined
    return undefined;
  }
  const codePoint = parseInt(hex, 16);
  const isSurrogate = codePoint >= 0xd800 && codePoint <= 0xdfff;
  // Add special case for
  // "If this number is zero, or is for a surrogate, or is greater than the maximum allowed code point"
  // https://drafts.csswg.org/css-syntax/#maximum-allowed-code-point
  if (isSurrogate || codePoint === 0x0000 || codePoint > 0x10ffff) {
    return ["\uFFFD", hex.length + (spaceTerminated ? 1 : 0)];
  }
  return [String.fromCodePoint(codePoint), hex.length + (spaceTerminated ? 1 : 0)];
}
const CONTAINS_ESCAPE = /\\/;
function unescape(str) {
  const needToProcess = CONTAINS_ESCAPE.test(str);
  if (!needToProcess) {
    return str;
  }
  let ret = "";
  for (let i = 0; i < str.length; i++) {
    if (str[i] === "\\") {
      const gobbled = gobbleHex(str.slice(i + 1, i + 7));

      // eslint-disable-next-line no-undefined
      if (gobbled !== undefined) {
        ret += gobbled[0];
        i += gobbled[1];

        // eslint-disable-next-line no-continue
        continue;
      }

      // Retain a pair of \\ if double escaped `\\\\`
      // https://github.com/postcss/postcss-selector-parser/commit/268c9a7656fb53f543dc620aa5b73a30ec3ff20e
      if (str[i + 1] === "\\") {
        ret += "\\";
        i += 1;

        // eslint-disable-next-line no-continue
        continue;
      }

      // if \\ is at the end of the string retain it
      // https://github.com/postcss/postcss-selector-parser/commit/01a6b346e3612ce1ab20219acc26abdc259ccefb
      if (str.length === i + 1) {
        ret += str[i];
      }

      // eslint-disable-next-line no-continue
      continue;
    }
    ret += str[i];
  }
  return ret;
}
function normalizePath(file) {
  return _path.default.sep === "\\" ? file.replace(/\\/g, "/") : file;
}

// eslint-disable-next-line no-control-regex
const filenameReservedRegex = /[<>:"/\\|?*]/g;
// eslint-disable-next-line no-control-regex
const reControlChars = /[\u0000-\u001f\u0080-\u009f]/g;
function escapeLocalIdent(localident) {
  // TODO simplify?
  return escape(localident
  // For `[hash]` placeholder
  .replace(/^((-?[0-9])|--)/, "_$1").replace(filenameReservedRegex, "-").replace(reControlChars, "-").replace(/\./g, "-"));
}
function defaultGetLocalIdent(loaderContext, localIdentName, localName, options) {
  const {
    context,
    hashSalt,
    hashStrategy
  } = options;
  const {
    resourcePath
  } = loaderContext;
  let relativeResourcePath = normalizePath(_path.default.relative(context, resourcePath));

  // eslint-disable-next-line no-underscore-dangle
  if (loaderContext._module && loaderContext._module.matchResource) {
    relativeResourcePath = `${normalizePath(
    // eslint-disable-next-line no-underscore-dangle
    _path.default.relative(context, loaderContext._module.matchResource))}`;
  }

  // eslint-disable-next-line no-param-reassign
  options.content = hashStrategy === "minimal-subset" && /\[local\]/.test(localIdentName) ? relativeResourcePath : `${relativeResourcePath}\x00${localName}`;
  let {
    hashFunction,
    hashDigest,
    hashDigestLength
  } = options;
  const matches = localIdentName.match(/\[(?:([^:\]]+):)?(?:(hash|contenthash|fullhash))(?::([a-z]+\d*))?(?::(\d+))?\]/i);
  if (matches) {
    const hashName = matches[2] || hashFunction;
    hashFunction = matches[1] || hashFunction;
    hashDigest = matches[3] || hashDigest;
    hashDigestLength = matches[4] || hashDigestLength;

    // `hash` and `contenthash` are same in `loader-utils` context
    // let's keep `hash` for backward compatibility

    // eslint-disable-next-line no-param-reassign
    localIdentName = localIdentName.replace(/\[(?:([^:\]]+):)?(?:hash|contenthash|fullhash)(?::([a-z]+\d*))?(?::(\d+))?\]/gi, () => hashName === "fullhash" ? "[fullhash]" : "[contenthash]");
  }
  let localIdentHash = "";
  for (let tier = 0; localIdentHash.length < hashDigestLength; tier++) {
    // eslint-disable-next-line no-underscore-dangle
    const hash = loaderContext._compiler.webpack.util.createHash(hashFunction);
    if (hashSalt) {
      hash.update(hashSalt);
    }
    const tierSalt = Buffer.allocUnsafe(4);
    tierSalt.writeUInt32LE(tier);
    hash.update(tierSalt);
    // TODO: bug in webpack with unicode characters with strings
    hash.update(Buffer.from(options.content, "utf8"));
    localIdentHash = (localIdentHash + hash.digest(hashDigest)
    // Remove all leading digits
    ).replace(/^\d+/, "")
    // Replace all slashes with underscores (same as in base64url)
    .replace(/\//g, "_")
    // Remove everything that is not an alphanumeric or underscore
    .replace(/[^A-Za-z0-9_]+/g, "").slice(0, hashDigestLength);
  }

  // TODO need improve on webpack side, we should allow to pass hash/contentHash without chunk property, also `data` for `getPath` should be looks good without chunk property
  const ext = _path.default.extname(resourcePath);
  const base = _path.default.basename(resourcePath);
  const name = base.slice(0, base.length - ext.length);
  const data = {
    filename: _path.default.relative(context, resourcePath),
    contentHash: localIdentHash,
    chunk: {
      name,
      hash: localIdentHash,
      contentHash: localIdentHash
    }
  };

  // eslint-disable-next-line no-underscore-dangle
  let result = loaderContext._compilation.getPath(localIdentName, data);
  if (/\[folder\]/gi.test(result)) {
    const dirname = _path.default.dirname(resourcePath);
    let directory = normalizePath(_path.default.relative(context, `${dirname + _path.default.sep}_`));
    directory = directory.substring(0, directory.length - 1);
    let folder = "";
    if (directory.length > 1) {
      folder = _path.default.basename(directory);
    }
    result = result.replace(/\[folder\]/gi, () => folder);
  }
  if (options.regExp) {
    const match = resourcePath.match(options.regExp);
    if (match) {
      match.forEach((matched, i) => {
        result = result.replace(new RegExp(`\\[${i}\\]`, "ig"), matched);
      });
    }
  }
  return result;
}
function fixedEncodeURIComponent(str) {
  return str.replace(/[!'()*]/g, c => `%${c.charCodeAt(0).toString(16)}`);
}
function isDataUrl(url) {
  if (/^data:/i.test(url)) {
    return true;
  }
  return false;
}
const NATIVE_WIN32_PATH = /^[A-Z]:[/\\]|^\\\\/i;
function normalizeUrl(url, isStringValue) {
  let normalizedUrl = url.replace(/^( |\t\n|\r\n|\r|\f)*/g, "").replace(/( |\t\n|\r\n|\r|\f)*$/g, "");
  if (isStringValue && /\\(\n|\r\n|\r|\f)/.test(normalizedUrl)) {
    normalizedUrl = normalizedUrl.replace(/\\(\n|\r\n|\r|\f)/g, "");
  }
  if (NATIVE_WIN32_PATH.test(url)) {
    try {
      normalizedUrl = decodeURI(normalizedUrl);
    } catch (error) {
      // Ignore
    }
    return normalizedUrl;
  }
  normalizedUrl = unescape(normalizedUrl);
  if (isDataUrl(url)) {
    // Todo fixedEncodeURIComponent is workaround. Webpack resolver shouldn't handle "!" in dataURL
    return fixedEncodeURIComponent(normalizedUrl);
  }
  try {
    normalizedUrl = decodeURI(normalizedUrl);
  } catch (error) {
    // Ignore
  }
  return normalizedUrl;
}
function requestify(url, rootContext, needToResolveURL = true) {
  if (needToResolveURL) {
    if (/^file:/i.test(url)) {
      return (0, _url.fileURLToPath)(url);
    }
    return url.charAt(0) === "/" ? urlToRequest(url, rootContext) : urlToRequest(url);
  }
  if (url.charAt(0) === "/" || /^file:/i.test(url)) {
    return url;
  }

  // A `~` makes the url an module
  if (IS_MODULE_REQUEST.test(url)) {
    return url.replace(IS_MODULE_REQUEST, "");
  }
  return url;
}
function getFilter(filter, resourcePath) {
  return (...args) => {
    if (typeof filter === "function") {
      return filter(...args, resourcePath);
    }
    return true;
  };
}
function getValidLocalName(localName, exportLocalsConvention) {
  const result = exportLocalsConvention(localName);
  return Array.isArray(result) ? result[0] : result;
}
const IS_MODULES = /\.module(s)?\.\w+$/i;
const IS_ICSS = /\.icss\.\w+$/i;
function getModulesOptions(rawOptions, esModule, exportType, loaderContext) {
  if (typeof rawOptions.modules === "boolean" && rawOptions.modules === false) {
    return false;
  }
  const resourcePath =
  // eslint-disable-next-line no-underscore-dangle
  loaderContext._module && loaderContext._module.matchResource || loaderContext.resourcePath;
  let auto;
  let rawModulesOptions;
  if (typeof rawOptions.modules === "undefined") {
    rawModulesOptions = {};
    auto = true;
  } else if (typeof rawOptions.modules === "boolean") {
    rawModulesOptions = {};
  } else if (typeof rawOptions.modules === "string") {
    rawModulesOptions = {
      mode: rawOptions.modules
    };
  } else {
    rawModulesOptions = rawOptions.modules;
    ({
      auto
    } = rawModulesOptions);
  }

  // eslint-disable-next-line no-underscore-dangle
  const {
    outputOptions
  } = loaderContext._compilation;
  const needNamedExport = exportType === "css-style-sheet" || exportType === "string";
  const namedExport = typeof rawModulesOptions.namedExport !== "undefined" ? rawModulesOptions.namedExport : needNamedExport || esModule;
  const exportLocalsConvention = typeof rawModulesOptions.exportLocalsConvention !== "undefined" ? rawModulesOptions.exportLocalsConvention : namedExport ? "as-is" : "camel-case-only";
  const modulesOptions = {
    auto,
    mode: "local",
    exportGlobals: false,
    localIdentName: "[hash:base64]",
    localIdentContext: loaderContext.rootContext,
    localIdentHashSalt: outputOptions.hashSalt,
    localIdentHashFunction: outputOptions.hashFunction,
    localIdentHashDigest: outputOptions.hashDigest,
    localIdentHashDigestLength: outputOptions.hashDigestLength,
    // eslint-disable-next-line no-undefined
    localIdentRegExp: undefined,
    // eslint-disable-next-line no-undefined
    getLocalIdent: undefined,
    // TODO improve me and enable by default
    exportOnlyLocals: false,
    ...rawModulesOptions,
    exportLocalsConvention,
    namedExport
  };
  if (typeof modulesOptions.exportLocalsConvention === "string") {
    // eslint-disable-next-line no-shadow
    const {
      exportLocalsConvention
    } = modulesOptions;
    modulesOptions.exportLocalsConvention = name => {
      switch (exportLocalsConvention) {
        case "camel-case":
        case "camelCase":
          {
            return [name, camelCase(name)];
          }
        case "camel-case-only":
        case "camelCaseOnly":
          {
            return camelCase(name);
          }
        case "dashes":
          {
            return [name, dashesCamelCase(name)];
          }
        case "dashes-only":
        case "dashesOnly":
          {
            return dashesCamelCase(name);
          }
        case "as-is":
        case "asIs":
        default:
          return name;
      }
    };
  }
  if (typeof modulesOptions.auto === "boolean") {
    const isModules = modulesOptions.auto && IS_MODULES.test(resourcePath);
    let isIcss;
    if (!isModules) {
      isIcss = IS_ICSS.test(resourcePath);
      if (isIcss) {
        modulesOptions.mode = "icss";
      }
    }
    if (!isModules && !isIcss) {
      return false;
    }
  } else if (modulesOptions.auto instanceof RegExp) {
    const isModules = modulesOptions.auto.test(resourcePath);
    if (!isModules) {
      return false;
    }
  } else if (typeof modulesOptions.auto === "function") {
    const {
      resourceQuery,
      resourceFragment
    } = loaderContext;
    const isModule = modulesOptions.auto(resourcePath, resourceQuery, resourceFragment);
    if (!isModule) {
      return false;
    }
  }
  if (typeof modulesOptions.mode === "function") {
    modulesOptions.mode = modulesOptions.mode(loaderContext.resourcePath, loaderContext.resourceQuery, loaderContext.resourceFragment);
  }
  if (needNamedExport) {
    if (esModule === false) {
      throw new Error("The 'exportType' option with the 'css-style-sheet' or 'string' value requires the 'esModule' option to be enabled");
    }
    if (modulesOptions.namedExport === false) {
      throw new Error("The 'exportType' option with the 'css-style-sheet' or 'string' value requires the 'modules.namedExport' option to be enabled");
    }
  }
  if (modulesOptions.namedExport === true && esModule === false) {
    throw new Error("The 'modules.namedExport' option requires the 'esModule' option to be enabled");
  }
  return modulesOptions;
}
function normalizeOptions(rawOptions, loaderContext) {
  const exportType = typeof rawOptions.exportType === "undefined" ? "array" : rawOptions.exportType;
  const esModule = typeof rawOptions.esModule === "undefined" ? true : rawOptions.esModule;
  const modulesOptions = getModulesOptions(rawOptions, esModule, exportType, loaderContext);
  return {
    url: typeof rawOptions.url === "undefined" ? true : rawOptions.url,
    import: typeof rawOptions.import === "undefined" ? true : rawOptions.import,
    modules: modulesOptions,
    sourceMap: typeof rawOptions.sourceMap === "boolean" ? rawOptions.sourceMap : loaderContext.sourceMap,
    importLoaders: typeof rawOptions.importLoaders === "string" ? parseInt(rawOptions.importLoaders, 10) : rawOptions.importLoaders,
    esModule,
    exportType
  };
}
function shouldUseImportPlugin(options) {
  if (options.modules.exportOnlyLocals) {
    return false;
  }
  if (typeof options.import === "boolean") {
    return options.import;
  }
  return true;
}
function shouldUseURLPlugin(options) {
  if (options.modules.exportOnlyLocals) {
    return false;
  }
  if (typeof options.url === "boolean") {
    return options.url;
  }
  return true;
}
function shouldUseModulesPlugins(options) {
  if (typeof options.modules === "boolean" && options.modules === false) {
    return false;
  }
  return options.modules.mode !== "icss";
}
function shouldUseIcssPlugin(options) {
  return Boolean(options.modules);
}
function getModulesPlugins(options, loaderContext) {
  const {
    mode,
    getLocalIdent,
    localIdentName,
    localIdentContext,
    localIdentHashSalt,
    localIdentHashFunction,
    localIdentHashDigest,
    localIdentHashDigestLength,
    localIdentRegExp,
    hashStrategy
  } = options.modules;
  let plugins = [];
  try {
    plugins = [_postcssModulesValues.default, (0, _postcssModulesLocalByDefault.default)({
      mode
    }), (0, _postcssModulesExtractImports.default)(), (0, _postcssModulesScope.default)({
      generateScopedName(exportName, resourceFile, rawCss, node) {
        let localIdent;
        if (typeof getLocalIdent !== "undefined") {
          localIdent = getLocalIdent(loaderContext, localIdentName, unescape(exportName), {
            context: localIdentContext,
            hashSalt: localIdentHashSalt,
            hashFunction: localIdentHashFunction,
            hashDigest: localIdentHashDigest,
            hashDigestLength: localIdentHashDigestLength,
            hashStrategy,
            regExp: localIdentRegExp,
            node
          });
        }

        // A null/undefined value signals that we should invoke the default
        // getLocalIdent method.
        if (typeof localIdent === "undefined" || localIdent === null) {
          localIdent = defaultGetLocalIdent(loaderContext, localIdentName, unescape(exportName), {
            context: localIdentContext,
            hashSalt: localIdentHashSalt,
            hashFunction: localIdentHashFunction,
            hashDigest: localIdentHashDigest,
            hashDigestLength: localIdentHashDigestLength,
            hashStrategy,
            regExp: localIdentRegExp,
            node
          });
          return escapeLocalIdent(localIdent).replace(/\\\[local\\]/gi, exportName);
        }
        return escapeLocalIdent(localIdent);
      },
      exportGlobals: options.modules.exportGlobals
    })];
  } catch (error) {
    loaderContext.emitError(error);
  }
  return plugins;
}
const ABSOLUTE_SCHEME = /^[a-z0-9+\-.]+:/i;
function getURLType(source) {
  if (source[0] === "/") {
    if (source[1] === "/") {
      return "scheme-relative";
    }
    return "path-absolute";
  }
  if (IS_NATIVE_WIN32_PATH.test(source)) {
    return "path-absolute";
  }
  return ABSOLUTE_SCHEME.test(source) ? "absolute" : "path-relative";
}
function normalizeSourceMap(map, resourcePath) {
  let newMap = map;

  // Some loader emit source map as string
  // Strip any JSON XSSI avoidance prefix from the string (as documented in the source maps specification), and then parse the string as JSON.
  if (typeof newMap === "string") {
    newMap = JSON.parse(newMap);
  }
  delete newMap.file;
  const {
    sourceRoot
  } = newMap;
  delete newMap.sourceRoot;
  if (newMap.sources) {
    // Source maps should use forward slash because it is URLs (https://github.com/mozilla/source-map/issues/91)
    // We should normalize path because previous loaders like `sass-loader` using backslash when generate source map
    newMap.sources = newMap.sources.map(source => {
      // Non-standard syntax from `postcss`
      if (source.indexOf("<") === 0) {
        return source;
      }
      const sourceType = getURLType(source);

      // Do no touch `scheme-relative` and `absolute` URLs
      if (sourceType === "path-relative" || sourceType === "path-absolute") {
        const absoluteSource = sourceType === "path-relative" && sourceRoot ? _path.default.resolve(sourceRoot, normalizePath(source)) : normalizePath(source);
        return _path.default.relative(_path.default.dirname(resourcePath), absoluteSource);
      }
      return source;
    });
  }
  return newMap;
}
function getPreRequester({
  loaders,
  loaderIndex
}) {
  const cache = Object.create(null);
  return number => {
    if (cache[number]) {
      return cache[number];
    }
    if (number === false) {
      cache[number] = "";
    } else {
      const loadersRequest = loaders.slice(loaderIndex, loaderIndex + 1 + (typeof number !== "number" ? 0 : number)).map(x => x.request).join("!");
      cache[number] = `-!${loadersRequest}!`;
    }
    return cache[number];
  };
}
function getImportCode(imports, options) {
  let code = "";
  for (const item of imports) {
    const {
      importName,
      url,
      icss,
      type
    } = item;
    if (options.esModule) {
      if (icss && options.modules.namedExport) {
        code += `import ${options.modules.exportOnlyLocals ? "" : `${importName}, `}* as ${importName}_NAMED___ from ${url};\n`;
      } else {
        code += type === "url" ? `var ${importName} = new URL(${url}, import.meta.url);\n` : `import ${importName} from ${url};\n`;
      }
    } else {
      code += `var ${importName} = require(${url});\n`;
    }
  }
  return code ? `// Imports\n${code}` : "";
}
function normalizeSourceMapForRuntime(map, loaderContext) {
  const resultMap = map ? map.toJSON() : null;
  if (resultMap) {
    delete resultMap.file;

    /* eslint-disable no-underscore-dangle */
    if (loaderContext._compilation && loaderContext._compilation.options && loaderContext._compilation.options.devtool && loaderContext._compilation.options.devtool.includes("nosources")) {
      /* eslint-enable no-underscore-dangle */

      delete resultMap.sourcesContent;
    }
    resultMap.sourceRoot = "";
    resultMap.sources = resultMap.sources.map(source => {
      // Non-standard syntax from `postcss`
      if (source.indexOf("<") === 0) {
        return source;
      }
      const sourceType = getURLType(source);
      if (sourceType !== "path-relative") {
        return source;
      }
      const resourceDirname = _path.default.dirname(loaderContext.resourcePath);
      const absoluteSource = _path.default.resolve(resourceDirname, source);
      const contextifyPath = normalizePath(_path.default.relative(loaderContext.rootContext, absoluteSource));
      return `webpack://./${contextifyPath}`;
    });
  }
  return JSON.stringify(resultMap);
}
function printParams(media, dedupe, supports, layer) {
  let result = "";
  if (typeof layer !== "undefined") {
    result = `, ${JSON.stringify(layer)}`;
  }
  if (typeof supports !== "undefined") {
    result = `, ${JSON.stringify(supports)}${result}`;
  } else if (result.length > 0) {
    result = `, undefined${result}`;
  }
  if (dedupe) {
    result = `, true${result}`;
  } else if (result.length > 0) {
    result = `, false${result}`;
  }
  if (media) {
    result = `${JSON.stringify(media)}${result}`;
  } else if (result.length > 0) {
    result = `""${result}`;
  }
  return result;
}
function getModuleCode(result, api, replacements, options, isTemplateLiteralSupported, loaderContext) {
  if (options.modules.exportOnlyLocals === true) {
    return "";
  }
  let sourceMapValue = "";
  if (options.sourceMap) {
    const sourceMap = result.map;
    sourceMapValue = `,${normalizeSourceMapForRuntime(sourceMap, loaderContext)}`;
  }
  let code = isTemplateLiteralSupported ? convertToTemplateLiteral(result.css) : JSON.stringify(result.css);
  let beforeCode = `var ___CSS_LOADER_EXPORT___ = ___CSS_LOADER_API_IMPORT___(${options.sourceMap ? "___CSS_LOADER_API_SOURCEMAP_IMPORT___" : "___CSS_LOADER_API_NO_SOURCEMAP_IMPORT___"});\n`;
  for (const item of api) {
    const {
      url,
      layer,
      supports,
      media,
      dedupe
    } = item;
    if (url) {
      // eslint-disable-next-line no-undefined
      const printedParam = printParams(media, undefined, supports, layer);
      beforeCode += `___CSS_LOADER_EXPORT___.push([module.id, ${JSON.stringify(`@import url(${url});`)}${printedParam.length > 0 ? `, ${printedParam}` : ""}]);\n`;
    } else {
      const printedParam = printParams(media, dedupe, supports, layer);
      beforeCode += `___CSS_LOADER_EXPORT___.i(${item.importName}${printedParam.length > 0 ? `, ${printedParam}` : ""});\n`;
    }
  }
  for (const item of replacements) {
    const {
      replacementName,
      importName,
      localName
    } = item;
    if (localName) {
      code = code.replace(new RegExp(replacementName, "g"), () => options.modules.namedExport ? isTemplateLiteralSupported ? `\${ ${importName}_NAMED___[${JSON.stringify(getValidLocalName(localName, options.modules.exportLocalsConvention))}] }` : `" + ${importName}_NAMED___[${JSON.stringify(getValidLocalName(localName, options.modules.exportLocalsConvention))}] + "` : isTemplateLiteralSupported ? `\${${importName}.locals[${JSON.stringify(localName)}]}` : `" + ${importName}.locals[${JSON.stringify(localName)}] + "`);
    } else {
      const {
        hash,
        needQuotes
      } = item;
      const getUrlOptions = [].concat(hash ? [`hash: ${JSON.stringify(hash)}`] : []).concat(needQuotes ? "needQuotes: true" : []);
      const preparedOptions = getUrlOptions.length > 0 ? `, { ${getUrlOptions.join(", ")} }` : "";
      beforeCode += `var ${replacementName} = ___CSS_LOADER_GET_URL_IMPORT___(${importName}${preparedOptions});\n`;
      code = code.replace(new RegExp(replacementName, "g"), () => isTemplateLiteralSupported ? `\${${replacementName}}` : `" + ${replacementName} + "`);
    }
  }

  // Indexes description:
  // 0 - module id
  // 1 - CSS code
  // 2 - media
  // 3 - source map
  // 4 - supports
  // 5 - layer
  return `${beforeCode}// Module\n___CSS_LOADER_EXPORT___.push([module.id, ${code}, ""${sourceMapValue}]);\n`;
}
const SLASH = "\\".charCodeAt(0);
const BACKTICK = "`".charCodeAt(0);
const DOLLAR = "$".charCodeAt(0);
function convertToTemplateLiteral(str) {
  let escapedString = "";
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    escapedString += code === SLASH || code === BACKTICK || code === DOLLAR ? `\\${str[i]}` : str[i];
  }
  return `\`${escapedString}\``;
}
function dashesCamelCase(str) {
  return str.replace(/-+(\w)/g, (match, firstLetter) => firstLetter.toUpperCase());
}
const validIdentifier = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/u;
const keywords = new Set(["abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with"]);
function getExportCode(exports, replacements, icssPluginUsed, options, isTemplateLiteralSupported) {
  let code = "// Exports\n";
  if (icssPluginUsed) {
    let localsCode = "";
    let identifierId = 0;
    const addExportToLocalsCode = (names, value) => {
      const normalizedNames = Array.isArray(names) ? new Set(names) : new Set([names]);
      for (let name of normalizedNames) {
        const serializedValue = isTemplateLiteralSupported ? convertToTemplateLiteral(value) : JSON.stringify(value);
        if (options.modules.namedExport) {
          if (name === "default") {
            name = `_${name}`;
          }
          if (!validIdentifier.test(name) || keywords.has(name)) {
            identifierId += 1;
            const id = `_${identifierId.toString(16)}`;
            localsCode += `var ${id} = ${serializedValue};\n`;
            localsCode += `export { ${id} as ${JSON.stringify(name)} };\n`;
          } else {
            localsCode += `export var ${name} = ${serializedValue};\n`;
          }
        } else {
          if (localsCode) {
            localsCode += `,\n`;
          }
          localsCode += `\t${JSON.stringify(name)}: ${serializedValue}`;
        }
      }
    };
    for (const {
      name,
      value
    } of exports) {
      addExportToLocalsCode(options.modules.exportLocalsConvention(name), value);
    }
    for (const item of replacements) {
      const {
        replacementName,
        localName
      } = item;
      if (localName) {
        const {
          importName
        } = item;
        localsCode = localsCode.replace(new RegExp(replacementName, "g"), () => {
          if (options.modules.namedExport) {
            return isTemplateLiteralSupported ? `\${${importName}_NAMED___[${JSON.stringify(getValidLocalName(localName, options.modules.exportLocalsConvention))}]}` : `" + ${importName}_NAMED___[${JSON.stringify(getValidLocalName(localName, options.modules.exportLocalsConvention))}] + "`;
          } else if (options.modules.exportOnlyLocals) {
            return isTemplateLiteralSupported ? `\${${importName}[${JSON.stringify(localName)}]}` : `" + ${importName}[${JSON.stringify(localName)}] + "`;
          }
          return isTemplateLiteralSupported ? `\${${importName}.locals[${JSON.stringify(localName)}]}` : `" + ${importName}.locals[${JSON.stringify(localName)}] + "`;
        });
      } else {
        localsCode = localsCode.replace(new RegExp(replacementName, "g"), () => isTemplateLiteralSupported ? `\${${replacementName}}` : `" + ${replacementName} + "`);
      }
    }
    if (options.modules.exportOnlyLocals) {
      code += options.modules.namedExport ? localsCode : `${options.esModule ? "export default" : "module.exports ="} {\n${localsCode}\n};\n`;
      return code;
    }
    code += options.modules.namedExport ? localsCode : `___CSS_LOADER_EXPORT___.locals = {${localsCode ? `\n${localsCode}\n` : ""}};\n`;
  }
  const isCSSStyleSheetExport = options.exportType === "css-style-sheet";
  if (isCSSStyleSheetExport) {
    code += "var ___CSS_LOADER_STYLE_SHEET___ = new CSSStyleSheet();\n";
    code += "___CSS_LOADER_STYLE_SHEET___.replaceSync(___CSS_LOADER_EXPORT___.toString());\n";
  }
  let finalExport;
  switch (options.exportType) {
    case "string":
      finalExport = "___CSS_LOADER_EXPORT___.toString()";
      break;
    case "css-style-sheet":
      finalExport = "___CSS_LOADER_STYLE_SHEET___";
      break;
    default:
    case "array":
      finalExport = "___CSS_LOADER_EXPORT___";
      break;
  }
  code += `${options.esModule ? "export default" : "module.exports ="} ${finalExport};\n`;
  return code;
}
async function resolveRequests(resolve, context, possibleRequests) {
  return resolve(context, possibleRequests[0]).then(result => result).catch(error => {
    const [, ...tailPossibleRequests] = possibleRequests;
    if (tailPossibleRequests.length === 0) {
      throw error;
    }
    return resolveRequests(resolve, context, tailPossibleRequests);
  });
}
function isURLRequestable(url, options = {}) {
  // Protocol-relative URLs
  if (/^\/\//.test(url)) {
    return {
      requestable: false,
      needResolve: false
    };
  }

  // `#` URLs
  if (/^#/.test(url)) {
    return {
      requestable: false,
      needResolve: false
    };
  }

  // Data URI
  if (isDataUrl(url) && options.isSupportDataURL) {
    try {
      decodeURIComponent(url);
    } catch (ignoreError) {
      return {
        requestable: false,
        needResolve: false
      };
    }
    return {
      requestable: true,
      needResolve: false
    };
  }

  // `file:` protocol
  if (/^file:/i.test(url)) {
    return {
      requestable: true,
      needResolve: true
    };
  }

  // Absolute URLs
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !NATIVE_WIN32_PATH.test(url)) {
    if (options.isSupportAbsoluteURL && /^https?:/i.test(url)) {
      return {
        requestable: true,
        needResolve: false
      };
    }
    return {
      requestable: false,
      needResolve: false
    };
  }
  return {
    requestable: true,
    needResolve: true
  };
}
function sort(a, b) {
  return a.index - b.index;
}
function combineRequests(preRequest, url) {
  const idx = url.indexOf("!=!");
  return idx !== -1 ? url.slice(0, idx + 3) + preRequest + url.slice(idx + 3) : preRequest + url;
}
function warningFactory(warning) {
  let message = "";
  if (typeof warning.line !== "undefined") {
    message += `(${warning.line}:${warning.column}) `;
  }
  if (typeof warning.plugin !== "undefined") {
    message += `from "${warning.plugin}" plugin: `;
  }
  message += warning.text;
  if (warning.node) {
    message += `\n\nCode:\n  ${warning.node.toString()}\n`;
  }
  const obj = new Error(message, {
    cause: warning
  });
  obj.stack = null;
  return obj;
}
function syntaxErrorFactory(error) {
  let message = "\nSyntaxError\n\n";
  if (typeof error.line !== "undefined") {
    message += `(${error.line}:${error.column}) `;
  }
  if (typeof error.plugin !== "undefined") {
    message += `from "${error.plugin}" plugin: `;
  }
  message += error.file ? `${error.file} ` : "<css input> ";
  message += `${error.reason}`;
  const code = error.showSourceCode();
  if (code) {
    message += `\n\n${code}\n`;
  }
  const obj = new Error(message, {
    cause: error
  });
  obj.stack = null;
  return obj;
}

/***/ }),

/***/ 417:
/***/ ((module) => {

module.exports = require("../icss-utils");

/***/ }),

/***/ 749:
/***/ ((module) => {

module.exports = require("../postcss-modules-extract-imports");

/***/ }),

/***/ 552:
/***/ ((module) => {

module.exports = require("../postcss-modules-local-by-default");

/***/ }),

/***/ 898:
/***/ ((module) => {

module.exports = require("../postcss-modules-scope");

/***/ }),

/***/ 193:
/***/ ((module) => {

module.exports = require("../postcss-modules-values");

/***/ }),

/***/ 36:
/***/ ((module) => {

module.exports = require("../postcss-value-parser");

/***/ }),

/***/ 204:
/***/ ((module) => {

module.exports = require("../semver");

/***/ }),

/***/ 17:
/***/ ((module) => {

module.exports = require("path");

/***/ }),

/***/ 977:
/***/ ((module) => {

module.exports = require("postcss");

/***/ }),

/***/ 310:
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ 879:
/***/ ((module) => {

module.exports = JSON.parse('{"title":"CSS Loader options","additionalProperties":false,"properties":{"url":{"description":"Allows to enables/disables `url()`/`image-set()` functions handling.","link":"https://github.com/webpack-contrib/css-loader#url","anyOf":[{"type":"boolean"},{"type":"object","properties":{"filter":{"instanceof":"Function"}},"additionalProperties":false}]},"import":{"description":"Allows to enables/disables `@import` at-rules handling.","link":"https://github.com/webpack-contrib/css-loader#import","anyOf":[{"type":"boolean"},{"type":"object","properties":{"filter":{"instanceof":"Function"}},"additionalProperties":false}]},"modules":{"description":"Allows to enable/disable CSS Modules or ICSS and setup configuration.","link":"https://github.com/webpack-contrib/css-loader#modules","anyOf":[{"type":"boolean"},{"enum":["local","global","pure","icss"]},{"type":"object","additionalProperties":false,"properties":{"auto":{"description":"Allows auto enable CSS modules based on filename.","link":"https://github.com/webpack-contrib/css-loader#auto","anyOf":[{"instanceof":"RegExp"},{"instanceof":"Function"},{"type":"boolean"}]},"mode":{"description":"Setup `mode` option.","link":"https://github.com/webpack-contrib/css-loader#mode","anyOf":[{"enum":["local","global","pure","icss"]},{"instanceof":"Function"}]},"localIdentName":{"description":"Allows to configure the generated local ident name.","link":"https://github.com/webpack-contrib/css-loader#localidentname","type":"string","minLength":1},"localIdentContext":{"description":"Allows to redefine basic loader context for local ident name.","link":"https://github.com/webpack-contrib/css-loader#localidentcontext","type":"string","minLength":1},"localIdentHashSalt":{"description":"Allows to add custom hash to generate more unique classes.","link":"https://github.com/webpack-contrib/css-loader#localidenthashsalt","type":"string","minLength":1},"localIdentHashFunction":{"description":"Allows to specify hash function to generate classes.","link":"https://github.com/webpack-contrib/css-loader#localidenthashfunction","type":"string","minLength":1},"localIdentHashDigest":{"description":"Allows to specify hash digest to generate classes.","link":"https://github.com/webpack-contrib/css-loader#localidenthashdigest","type":"string","minLength":1},"localIdentHashDigestLength":{"description":"Allows to specify hash digest length to generate classes.","link":"https://github.com/webpack-contrib/css-loader#localidenthashdigestlength","type":"number"},"hashStrategy":{"description":"Allows to specify should localName be used when computing the hash.","link":"https://github.com/webpack-contrib/css-loader#hashstrategy","enum":["resource-path-and-local-name","minimal-subset"]},"localIdentRegExp":{"description":"Allows to specify custom RegExp for local ident name.","link":"https://github.com/webpack-contrib/css-loader#localidentregexp","anyOf":[{"type":"string","minLength":1},{"instanceof":"RegExp"}]},"getLocalIdent":{"description":"Allows to specify a function to generate the classname.","link":"https://github.com/webpack-contrib/css-loader#getlocalident","instanceof":"Function"},"namedExport":{"description":"Enables/disables ES modules named export for locals.","link":"https://github.com/webpack-contrib/css-loader#namedexport","type":"boolean"},"exportGlobals":{"description":"Allows to export names from global class or id, so you can use that as local name.","link":"https://github.com/webpack-contrib/css-loader#exportglobals","type":"boolean"},"exportLocalsConvention":{"description":"Style of exported classnames.","link":"https://github.com/webpack-contrib/css-loader#localsconvention","anyOf":[{"enum":["asIs","as-is","camelCase","camel-case","camelCaseOnly","camel-case-only","dashes","dashesOnly","dashes-only"]},{"instanceof":"Function"}]},"exportOnlyLocals":{"description":"Export only locals.","link":"https://github.com/webpack-contrib/css-loader#exportonlylocals","type":"boolean"},"getJSON":{"description":"Allows outputting of CSS modules mapping through a callback.","link":"https://github.com/webpack-contrib/css-loader#getJSON","instanceof":"Function"}}}]},"sourceMap":{"description":"Allows to enable/disable source maps.","link":"https://github.com/webpack-contrib/css-loader#sourcemap","type":"boolean"},"importLoaders":{"description":"Allows enables/disables or setups number of loaders applied before CSS loader for `@import`/CSS Modules and ICSS imports.","link":"https://github.com/webpack-contrib/css-loader#importloaders","anyOf":[{"type":"boolean"},{"type":"string"},{"type":"integer"}]},"esModule":{"description":"Use the ES modules syntax.","link":"https://github.com/webpack-contrib/css-loader#esmodule","type":"boolean"},"exportType":{"description":"Allows exporting styles as array with modules, string or constructable stylesheet (i.e. `CSSStyleSheet`).","link":"https://github.com/webpack-contrib/css-loader#exporttype","enum":["array","string","css-style-sheet"]}},"type":"object"}');

/***/ }),

/***/ 446:
/***/ ((module) => {

module.exports = JSON.parse('{"name":"postcss","version":"8.4.38","description":"Tool for transforming styles with JS plugins","engines":{"node":"^10 || ^12 || >=14"},"exports":{".":{"require":"./lib/postcss.js","import":"./lib/postcss.mjs"},"./lib/at-rule":"./lib/at-rule.js","./lib/comment":"./lib/comment.js","./lib/container":"./lib/container.js","./lib/css-syntax-error":"./lib/css-syntax-error.js","./lib/declaration":"./lib/declaration.js","./lib/fromJSON":"./lib/fromJSON.js","./lib/input":"./lib/input.js","./lib/lazy-result":"./lib/lazy-result.js","./lib/no-work-result":"./lib/no-work-result.js","./lib/list":"./lib/list.js","./lib/map-generator":"./lib/map-generator.js","./lib/node":"./lib/node.js","./lib/parse":"./lib/parse.js","./lib/parser":"./lib/parser.js","./lib/postcss":"./lib/postcss.js","./lib/previous-map":"./lib/previous-map.js","./lib/processor":"./lib/processor.js","./lib/result":"./lib/result.js","./lib/root":"./lib/root.js","./lib/rule":"./lib/rule.js","./lib/stringifier":"./lib/stringifier.js","./lib/stringify":"./lib/stringify.js","./lib/symbols":"./lib/symbols.js","./lib/terminal-highlight":"./lib/terminal-highlight.js","./lib/tokenize":"./lib/tokenize.js","./lib/warn-once":"./lib/warn-once.js","./lib/warning":"./lib/warning.js","./package.json":"./package.json"},"main":"./lib/postcss.js","types":"./lib/postcss.d.ts","keywords":["css","postcss","rework","preprocessor","parser","source map","transform","manipulation","transpiler"],"funding":[{"type":"opencollective","url":"https://opencollective.com/postcss/"},{"type":"tidelift","url":"https://tidelift.com/funding/github/npm/postcss"},{"type":"github","url":"https://github.com/sponsors/ai"}],"author":"Andrey Sitnik <andrey@sitnik.ru>","license":"MIT","homepage":"https://postcss.org/","repository":"postcss/postcss","bugs":{"url":"https://github.com/postcss/postcss/issues"},"dependencies":{"nanoid":"^3.3.7","picocolors":"^1.0.0","source-map-js":"^1.2.0"},"browser":{"./lib/terminal-highlight":false,"source-map-js":false,"path":false,"url":false,"fs":false}}');

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
/******/ 	var __webpack_exports__ = __nccwpck_require__(169);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;