/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 782:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {



const ICSSUtils = __nccwpck_require__(417);

const matchImports = /^(.+?|\([\s\S]+?\))\s+from\s+("[^"]*"|'[^']*'|[\w-]+)$/;
const matchValueDefinition = /(?:\s+|^)([\w-]+):?(.*?)$/;
const matchImport = /^([\w-]+)(?:\s+as\s+([\w-]+))?/;

module.exports = (options) => {
  let importIndex = 0;
  const createImportedName =
    (options && options.createImportedName) ||
    ((importName /*, path*/) =>
      `i__const_${importName.replace(/\W/g, "_")}_${importIndex++}`);

  return {
    postcssPlugin: "postcss-modules-values",
    prepare(result) {
      const importAliases = [];
      const definitions = {};

      return {
        Once(root, postcss) {
          root.walkAtRules(/value/i, (atRule) => {
            const matches = atRule.params.match(matchImports);

            if (matches) {
              let [, /*match*/ aliases, path] = matches;

              // We can use constants for path names
              if (definitions[path]) {
                path = definitions[path];
              }

              const imports = aliases
                .replace(/^\(\s*([\s\S]+)\s*\)$/, "$1")
                .split(/\s*,\s*/)
                .map((alias) => {
                  const tokens = matchImport.exec(alias);

                  if (tokens) {
                    const [, /*match*/ theirName, myName = theirName] = tokens;
                    const importedName = createImportedName(myName);
                    definitions[myName] = importedName;
                    return { theirName, importedName };
                  } else {
                    throw new Error(`@import statement "${alias}" is invalid!`);
                  }
                });

              importAliases.push({ path, imports });

              atRule.remove();

              return;
            }

            if (atRule.params.indexOf("@value") !== -1) {
              result.warn("Invalid value definition: " + atRule.params);
            }

            let [, key, value] = `${atRule.params}${atRule.raws.between}`.match(
              matchValueDefinition
            );

            const normalizedValue = value.replace(/\/\*((?!\*\/).*?)\*\//g, "");

            if (normalizedValue.length === 0) {
              result.warn("Invalid value definition: " + atRule.params);
              atRule.remove();

              return;
            }

            let isOnlySpace = /^\s+$/.test(normalizedValue);

            if (!isOnlySpace) {
              value = value.trim();
            }

            // Add to the definitions, knowing that values can refer to each other
            definitions[key] = ICSSUtils.replaceValueSymbols(
              value,
              definitions
            );

            atRule.remove();
          });

          /* If we have no definitions, don't continue */
          if (!Object.keys(definitions).length) {
            return;
          }

          /* Perform replacements */
          ICSSUtils.replaceSymbols(root, definitions);

          /* We want to export anything defined by now, but don't add it to the CSS yet or it well get picked up by the replacement stuff */
          const exportDeclarations = Object.keys(definitions).map((key) =>
            postcss.decl({
              value: definitions[key],
              prop: key,
              raws: { before: "\n  " },
            })
          );

          /* Add export rules if any */
          if (exportDeclarations.length > 0) {
            const exportRule = postcss.rule({
              selector: ":export",
              raws: { after: "\n" },
            });

            exportRule.append(exportDeclarations);

            root.prepend(exportRule);
          }

          /* Add import rules */
          importAliases.reverse().forEach(({ path, imports }) => {
            const importRule = postcss.rule({
              selector: `:import(${path})`,
              raws: { after: "\n" },
            });

            imports.forEach(({ theirName, importedName }) => {
              importRule.append({
                value: theirName,
                prop: importedName,
                raws: { before: "\n  " },
              });
            });

            root.prepend(importRule);
          });
        },
      };
    },
  };
};

module.exports.postcss = true;


/***/ }),

/***/ 417:
/***/ ((module) => {

module.exports = require("../icss-utils");

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
/******/ 	var __webpack_exports__ = __nccwpck_require__(782);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;