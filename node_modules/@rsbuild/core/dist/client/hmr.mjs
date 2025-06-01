// src/client/format.ts
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
  lines = lines.filter((line, index, arr) => index === 0 || line.trim() !== "" || line.trim() !== arr[index - 1].trim());
  message = lines.join("\n");
  return message.trim();
}
function formatStatsMessages(stats) {
  var _stats_errors, _stats_warnings;
  const formattedErrors = ((_stats_errors = stats.errors) === null || _stats_errors === void 0 ? void 0 : _stats_errors.map(formatMessage)) || [];
  const formattedWarnings = ((_stats_warnings = stats.warnings) === null || _stats_warnings === void 0 ? void 0 : _stats_warnings.map(formatMessage)) || [];
  return {
    errors: formattedErrors,
    warnings: formattedWarnings
  };
}

// src/client/hmr.ts
var HMR_SOCK_PATH = "/rsbuild-hmr";
function formatURL({ port, protocol, hostname, pathname }) {
  if (typeof URL !== "undefined") {
    const url = new URL("http://localhost");
    url.port = port;
    url.hostname = hostname;
    url.protocol = protocol;
    url.pathname = pathname;
    return url.toString();
  }
  const colon = protocol.indexOf(":") === -1 ? ":" : "";
  return `${protocol}${colon}//${hostname}:${port}${pathname}`;
}
function getSocketUrl(urlParts) {
  const { location } = self;
  const { host, port, path, protocol } = urlParts;
  return formatURL({
    protocol: protocol || (location.protocol === "https:" ? "wss" : "ws"),
    hostname: host || location.hostname,
    port: port || location.port,
    pathname: path || HMR_SOCK_PATH
  });
}
var isFirstCompilation = true;
var lastCompilationHash = null;
var hasCompileErrors = false;
function clearOutdatedErrors() {
  if (console.clear && hasCompileErrors) {
    console.clear();
  }
}
var createOverlay;
var clearOverlay;
var registerOverlay = (createFn, clearFn) => {
  createOverlay = createFn;
  clearOverlay = clearFn;
};
function handleSuccess() {
  clearOutdatedErrors();
  const isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;
  if (isHotUpdate) {
    tryApplyUpdates();
  }
}
function handleWarnings(warnings) {
  clearOutdatedErrors();
  const isHotUpdate = !isFirstCompilation;
  isFirstCompilation = false;
  hasCompileErrors = false;
  const formatted = formatStatsMessages({
    warnings,
    errors: []
  });
  for (let i = 0; i < formatted.warnings.length; i++) {
    if (i === 5) {
      console.warn("There were more warnings in other files, you can find a complete log in the terminal.");
      break;
    }
    console.warn(formatted.warnings[i]);
  }
  if (isHotUpdate) {
    tryApplyUpdates();
  }
}
function handleErrors(errors) {
  clearOutdatedErrors();
  isFirstCompilation = false;
  hasCompileErrors = true;
  const formatted = formatStatsMessages({
    errors,
    warnings: []
  });
  for (const error of formatted.errors) {
    console.error(error);
  }
  if (createOverlay) {
    createOverlay(formatted.errors);
  }
}
function isUpdateAvailable() {
  return lastCompilationHash !== __webpack_hash__;
}
function tryApplyUpdates() {
  if (!isUpdateAvailable()) {
    return;
  }
  if (!import.meta.webpackHot) {
    reloadPage();
    return;
  }
  if (import.meta.webpackHot.status() !== "idle") {
    return;
  }
  function handleApplyUpdates(err, updatedModules) {
    const forcedReload = err || !updatedModules;
    if (forcedReload) {
      if (err) {
        console.error("[HMR] Forced reload caused by: ", err);
      }
      reloadPage();
      return;
    }
    if (isUpdateAvailable()) {
      tryApplyUpdates();
    }
  }
  import.meta.webpackHot.check(true).then((updatedModules) => {
    handleApplyUpdates(null, updatedModules);
  }, (err) => {
    handleApplyUpdates(err, null);
  });
}
var MAX_RETRIES = 100;
var connection = null;
var retryCount = 0;
function onOpen() {
  console.info("[HMR] connected.");
}
function onMessage(e) {
  const message = JSON.parse(e.data);
  switch (message.type) {
    case "hash":
      lastCompilationHash = message.data;
      if (clearOverlay && isUpdateAvailable()) {
        clearOverlay();
      }
      break;
    case "still-ok":
    case "ok":
      handleSuccess();
      break;
    case "static-changed":
    case "content-changed":
      reloadPage();
      break;
    case "warnings":
      handleWarnings(message.data);
      break;
    case "errors":
      handleErrors(message.data);
      break;
  }
}
function sleep(msec = 1e3) {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
async function onClose() {
  console.info("[HMR] disconnected. Attempting to reconnect.");
  removeListeners();
  await sleep(1e3);
  retryCount++;
  if (connection && (connection.readyState === connection.CONNECTING || connection.readyState === connection.OPEN)) {
    retryCount = 0;
    return;
  }
  if (retryCount > MAX_RETRIES) {
    console.info("[HMR] Unable to establish a connection after exceeding the maximum retry attempts.");
    retryCount = 0;
    return;
  }
  reconnect();
}
function connect() {
  const socketUrl = getSocketUrl(RSBUILD_CLIENT_CONFIG);
  connection = new WebSocket(socketUrl);
  connection.addEventListener("open", onOpen);
  connection.addEventListener("close", onClose);
  connection.addEventListener("message", onMessage);
}
function removeListeners() {
  if (connection) {
    connection.removeEventListener("open", onOpen);
    connection.removeEventListener("close", onClose);
    connection.removeEventListener("message", onMessage);
  }
}
function reconnect() {
  if (connection) {
    connection = null;
  }
  connect();
}
function reloadPage() {
  if (RSBUILD_DEV_LIVE_RELOAD) {
    window.location.reload();
  }
}
connect();
export {
  HMR_SOCK_PATH,
  registerOverlay
};
