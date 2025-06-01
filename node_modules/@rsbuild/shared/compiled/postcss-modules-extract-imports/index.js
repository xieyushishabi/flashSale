/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 841:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const topologicalSort = __nccwpck_require__(405);

const matchImports = /^(.+?)\s+from\s+(?:"([^"]+)"|'([^']+)'|(global))$/;
const icssImport = /^:import\((?:"([^"]+)"|'([^']+)')\)/;

const VISITED_MARKER = 1;

/**
 * :import('G') {}
 *
 * Rule
 *   composes: ... from 'A'
 *   composes: ... from 'B'

 * Rule
 *   composes: ... from 'A'
 *   composes: ... from 'A'
 *   composes: ... from 'C'
 *
 * Results in:
 *
 * graph: {
 *   G: [],
 *   A: [],
 *   B: ['A'],
 *   C: ['A'],
 * }
 */
function addImportToGraph(importId, parentId, graph, visited) {
  const siblingsId = parentId + "_" + "siblings";
  const visitedId = parentId + "_" + importId;

  if (visited[visitedId] !== VISITED_MARKER) {
    if (!Array.isArray(visited[siblingsId])) {
      visited[siblingsId] = [];
    }

    const siblings = visited[siblingsId];

    if (Array.isArray(graph[importId])) {
      graph[importId] = graph[importId].concat(siblings);
    } else {
      graph[importId] = siblings.slice();
    }

    visited[visitedId] = VISITED_MARKER;

    siblings.push(importId);
  }
}

module.exports = (options = {}) => {
  let importIndex = 0;
  const createImportedName =
    typeof options.createImportedName !== "function"
      ? (importName /*, path*/) =>
          `i__imported_${importName.replace(/\W/g, "_")}_${importIndex++}`
      : options.createImportedName;
  const failOnWrongOrder = options.failOnWrongOrder;

  return {
    postcssPlugin: "postcss-modules-extract-imports",
    prepare() {
      const graph = {};
      const visited = {};
      const existingImports = {};
      const importDecls = {};
      const imports = {};

      return {
        Once(root, postcss) {
          // Check the existing imports order and save refs
          root.walkRules((rule) => {
            const matches = icssImport.exec(rule.selector);

            if (matches) {
              const [, /*match*/ doubleQuotePath, singleQuotePath] = matches;
              const importPath = doubleQuotePath || singleQuotePath;

              addImportToGraph(importPath, "root", graph, visited);

              existingImports[importPath] = rule;
            }
          });

          root.walkDecls(/^composes$/, (declaration) => {
            const multiple = declaration.value.split(",");
            const values = [];

            multiple.forEach((value) => {
              const matches = value.trim().match(matchImports);

              if (!matches) {
                values.push(value);

                return;
              }

              let tmpSymbols;
              let [
                ,
                /*match*/ symbols,
                doubleQuotePath,
                singleQuotePath,
                global,
              ] = matches;

              if (global) {
                // Composing globals simply means changing these classes to wrap them in global(name)
                tmpSymbols = symbols.split(/\s+/).map((s) => `global(${s})`);
              } else {
                const importPath = doubleQuotePath || singleQuotePath;

                let parent = declaration.parent;
                let parentIndexes = "";

                while (parent.type !== "root") {
                  parentIndexes =
                    parent.parent.index(parent) + "_" + parentIndexes;
                  parent = parent.parent;
                }

                const { selector } = declaration.parent;
                const parentRule = `_${parentIndexes}${selector}`;

                addImportToGraph(importPath, parentRule, graph, visited);

                importDecls[importPath] = declaration;
                imports[importPath] = imports[importPath] || {};

                tmpSymbols = symbols.split(/\s+/).map((s) => {
                  if (!imports[importPath][s]) {
                    imports[importPath][s] = createImportedName(s, importPath);
                  }

                  return imports[importPath][s];
                });
              }

              values.push(tmpSymbols.join(" "));
            });

            declaration.value = values.join(", ");
          });

          const importsOrder = topologicalSort(graph, failOnWrongOrder);

          if (importsOrder instanceof Error) {
            const importPath = importsOrder.nodes.find((importPath) =>
              // eslint-disable-next-line no-prototype-builtins
              importDecls.hasOwnProperty(importPath)
            );
            const decl = importDecls[importPath];

            throw decl.error(
              "Failed to resolve order of composed modules " +
                importsOrder.nodes
                  .map((importPath) => "`" + importPath + "`")
                  .join(", ") +
                ".",
              {
                plugin: "postcss-modules-extract-imports",
                word: "composes",
              }
            );
          }

          let lastImportRule;

          importsOrder.forEach((path) => {
            const importedSymbols = imports[path];
            let rule = existingImports[path];

            if (!rule && importedSymbols) {
              rule = postcss.rule({
                selector: `:import("${path}")`,
                raws: { after: "\n" },
              });

              if (lastImportRule) {
                root.insertAfter(lastImportRule, rule);
              } else {
                root.prepend(rule);
              }
            }

            lastImportRule = rule;

            if (!importedSymbols) {
              return;
            }

            Object.keys(importedSymbols).forEach((importedSymbol) => {
              rule.append(
                postcss.decl({
                  value: importedSymbol,
                  prop: importedSymbols[importedSymbol],
                  raws: { before: "\n  " },
                })
              );
            });
          });
        },
      };
    },
  };
};

module.exports.postcss = true;


/***/ }),

/***/ 405:
/***/ ((module) => {

const PERMANENT_MARKER = 2;
const TEMPORARY_MARKER = 1;

function createError(node, graph) {
  const er = new Error("Nondeterministic import's order");

  const related = graph[node];
  const relatedNode = related.find(
    (relatedNode) => graph[relatedNode].indexOf(node) > -1
  );

  er.nodes = [node, relatedNode];

  return er;
}

function walkGraph(node, graph, state, result, strict) {
  if (state[node] === PERMANENT_MARKER) {
    return;
  }

  if (state[node] === TEMPORARY_MARKER) {
    if (strict) {
      return createError(node, graph);
    }

    return;
  }

  state[node] = TEMPORARY_MARKER;

  const children = graph[node];
  const length = children.length;

  for (let i = 0; i < length; ++i) {
    const error = walkGraph(children[i], graph, state, result, strict);

    if (error instanceof Error) {
      return error;
    }
  }

  state[node] = PERMANENT_MARKER;

  result.push(node);
}

function topologicalSort(graph, strict) {
  const result = [];
  const state = {};

  const nodes = Object.keys(graph);
  const length = nodes.length;

  for (let i = 0; i < length; ++i) {
    const er = walkGraph(nodes[i], graph, state, result, strict);

    if (er instanceof Error) {
      return er;
    }
  }

  return result;
}

module.exports = topologicalSort;


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
/******/ 	var __webpack_exports__ = __nccwpck_require__(841);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;