"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicEntryPlugin = void 0;
const binding_1 = require("@rspack/binding");
const base_1 = require("./base");
const EntryOptionPlugin_1 = __importDefault(require("../lib/EntryOptionPlugin"));
const EntryPlugin_1 = require("./EntryPlugin");
exports.DynamicEntryPlugin = (0, base_1.create)(binding_1.BuiltinPluginName.DynamicEntryPlugin, (context, entry) => {
    return {
        context,
        entry: async () => {
            const result = await entry();
            return Object.entries(result).map(([name, desc]) => {
                const options = EntryOptionPlugin_1.default.entryDescriptionToOptions({}, name, desc);
                return {
                    import: desc.import,
                    options: (0, EntryPlugin_1.getRawEntryOptions)(options)
                };
            });
        }
    };
}, "make");
