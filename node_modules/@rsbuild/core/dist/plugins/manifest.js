"use strict";
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
var manifest_exports = {};
__export(manifest_exports, {
  pluginManifest: () => pluginManifest
});
module.exports = __toCommonJS(manifest_exports);
var import_helpers = require("../rspack/preload/helpers");
const generateManifest = (htmlPaths) => (_seed, files) => {
  const chunkEntries = /* @__PURE__ */ new Map();
  const licenseMap = /* @__PURE__ */ new Map();
  const allFiles = files.map((file) => {
    if (file.chunk) {
      const names = (0, import_helpers.recursiveChunkEntryNames)(file.chunk);
      for (const name of names) {
        chunkEntries.set(name, [file, ...chunkEntries.get(name) || []]);
      }
    }
    if (file.path.endsWith(".LICENSE.txt")) {
      const sourceFilePath = file.path.split(".LICENSE.txt")[0];
      licenseMap.set(sourceFilePath, file.path);
    }
    return file.path;
  });
  const entries = {};
  for (const [name, chunkFiles] of chunkEntries) {
    const assets = /* @__PURE__ */ new Set();
    const initialJS = [];
    const asyncJS = [];
    const initialCSS = [];
    const asyncCSS = [];
    for (const file of chunkFiles) {
      if (file.isInitial) {
        if (file.path.endsWith(".css")) {
          initialCSS.push(file.path);
        } else {
          initialJS.push(file.path);
        }
      } else {
        if (file.path.endsWith(".css")) {
          asyncCSS.push(file.path);
        } else {
          asyncJS.push(file.path);
        }
      }
      const relatedLICENSE = licenseMap.get(file.path);
      if (relatedLICENSE) {
        assets.add(relatedLICENSE);
      }
      for (const auxiliaryFile of file.chunk.auxiliaryFiles) {
        assets.add(auxiliaryFile);
      }
    }
    const entryManifest = {};
    if (assets.size) {
      entryManifest.assets = Array.from(assets);
    }
    const htmlPath = files.find((f) => f.name === htmlPaths[name])?.path;
    if (htmlPath) {
      entryManifest.html = [htmlPath];
    }
    if (initialJS.length) {
      entryManifest.initial = {
        js: initialJS
      };
    }
    if (initialCSS.length) {
      entryManifest.initial = {
        ...entryManifest.initial || {},
        css: initialCSS
      };
    }
    if (asyncJS.length) {
      entryManifest.async = {
        js: asyncJS
      };
    }
    if (asyncCSS.length) {
      entryManifest.async = {
        ...entryManifest.async || {},
        css: asyncCSS
      };
    }
    entries[name] = entryManifest;
  }
  return {
    allFiles,
    entries
  };
};
const pluginManifest = () => ({
  name: "rsbuild:manifest",
  setup(api) {
    api.modifyBundlerChain(async (chain, { CHAIN_ID }) => {
      const htmlPaths = api.getHTMLPaths();
      const {
        output: { manifest }
      } = api.getNormalizedConfig();
      if (manifest === false) {
        return;
      }
      const fileName = typeof manifest === "string" ? manifest : "manifest.json";
      const { RspackManifestPlugin } = await Promise.resolve().then(() => __toESM(require("../../compiled/rspack-manifest-plugin")));
      chain.plugin(CHAIN_ID.PLUGIN.MANIFEST).use(RspackManifestPlugin, [
        {
          fileName,
          generate: generateManifest(htmlPaths)
        }
      ]);
    });
  }
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  pluginManifest
});
