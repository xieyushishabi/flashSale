"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var format_exports = {};
__export(format_exports, {
  formatStatsMessages: () => formatStatsMessages
});
module.exports = __toCommonJS(format_exports);
function resolveFileName(stats) {
  if (stats.moduleIdentifier) {
    const regex = /(?:\!|^)([^!]+)$/;
    const matched = stats.moduleIdentifier.match(regex);
    if (matched) {
      const fileName = matched.pop();
      if (fileName) {
        return `File: ${fileName}:1:1
`;
      }
    }
  }
  return `File: ${stats.moduleName}
`;
}
function formatMessage(stats) {
  let lines = [];
  let message;
  if (typeof stats === "object") {
    const fileName = resolveFileName(stats);
    const mainMessage = typeof stats.formatted === "string" ? stats.formatted : stats.message;
    const details = stats.details ? `
Details: ${stats.details}
` : "";
    const stack = stats.stack ? `
${stats.stack}` : "";
    message = `${fileName}${mainMessage}${details}${stack}`;
  } else {
    message = stats;
  }
  lines = message.split("\n");
  lines = lines.filter(
    (line, index, arr) => index === 0 || line.trim() !== "" || line.trim() !== arr[index - 1].trim()
  );
  message = lines.join("\n");
  return message.trim();
}
function formatStatsMessages(stats) {
  const formattedErrors = stats.errors?.map(formatMessage) || [];
  const formattedWarnings = stats.warnings?.map(formatMessage) || [];
  return {
    errors: formattedErrors,
    warnings: formattedWarnings
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  formatStatsMessages
});
