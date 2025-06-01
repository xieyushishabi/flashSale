/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 791:
/***/ ((module) => {

// Thanks!
// http://stackoverflow.com/a/11958496/1420197
//
// Levenshtein Distance
module.exports = function(s, t) {
    var d = []; //2d matrix

    // Step 1
    var n = s.length;
    var m = t.length;

    if (n == 0) return m;
    if (m == 0) return n;

    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];

    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;

    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);

        // Step 4
        for (var j = 1; j <= m; j++) {

            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;

            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5

            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;

            if (b < mi) mi = b;
            if (c < mi) mi = c;

            d[i][j] = mi; // Step 6

            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }

    // Step 7
    return d[n][m];
};


/***/ }),

/***/ 632:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LevDist = __nccwpck_require__(791);

var Change =
/*!
 * Change
 * This is used for comparing two lines.
 *
 * @name Change
 * @function
 * @param {String} oldLine The old line value.
 * @param {String} addedLine The new line.
 * @param {Number} sensitivity The diff sensitivity.
 * @return {Change} The `Change` object:
 *
 *  - `_` (Array): An array with the old line and the new line.
 *  - `changes` (Number): How many changes are there, calculated with the levenshtein distance algorithm.
 *  - `modified` (Boolean): A boolean value representing if the old line was modified or not.
 */
function Change(oldLine, addedLine, sensitivity, lineno) {
    _classCallCheck(this, Change);

    this._ = [oldLine, addedLine];
    this.changes = LevDist(oldLine, addedLine);
    this.modified = this.changes > sensitivity;
    this.lineno = lineno;
};

var Diff = function () {
    /**
     * Diff
     * Compares strings line by line.
     *
     * @name Diff
     * @function
     * @param {String|Array} oldLines The old lines.
     * @param {String|Array} newLines The new lines.
     * @param {Number} sensitivity A number representing how many changes should be there to consider that a line was changed (default: `0`).
     * @return {Diff} The `Diff` object containing:
     *
     *  - `old_lines` (Array|String): The old lines.
     *  - `new_lines` (Array|String): The new lines.
     *  - `sensitivity` (Number): The diff sensitivity.
     *  - `changes` (Array): An array of `Change` objects.
     *  - `toString` (Function): A function to stringify the diff.
     */
    function Diff(oldLines, newLines, sensitivity) {
        var _this = this;

        _classCallCheck(this, Diff);

        this.sensitivity = sensitivity || 0;
        this.changes = [];

        // Convert to array
        oldLines = typeof oldLines === "string" ? oldLines.split("\n") : oldLines;
        newLines = typeof newLines === "string" ? newLines.split("\n") : newLines;

        this.old_lines = oldLines;
        this.new_lines = newLines;

        // Iterate the new lines
        var cOldLine = null;
        newLines.forEach(function (cNewLine, i) {
            cOldLine = oldLines[i] || "";
            _this.changes.push(new Change(cOldLine, cNewLine, _this.sensitivity, i + 1));
        });
    }

    /**
     * toString
     * Converts the lines comparison into a string.
     *
     * @name toString
     * @function
     * @return {String} The stringified diff.
     */


    _createClass(Diff, [{
        key: "toString",
        value: function toString() {

            var str = "",
                cDiff = { added: "", removed: "" };

            this.changes.forEach(function (cChange) {
                if (!cChange.modified) {
                    str += cDiff.removed;
                    str += cDiff.added;
                    cDiff.removed = "";
                    cDiff.added = "";
                    str += "   " + cChange._[1] + "\n";
                } else {
                    cDiff.removed += " - " + cChange._[0] + "\n";
                    if (cChange._[1]) {
                        cDiff.added += " + " + cChange._[1] + "\n";
                    }
                }
            });

            str += cDiff.removed;
            str += cDiff.added;

            return str;
        }
    }]);

    return Diff;
}();

module.exports = Diff;

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
/******/ 	var __webpack_exports__ = __nccwpck_require__(632);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;