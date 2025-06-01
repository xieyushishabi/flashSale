import { BuiltinPluginName, RawDynamicEntryPluginOptions } from "@rspack/binding";
import { EntryDynamicNormalized } from "../config";
export declare const DynamicEntryPlugin: {
    new (context: string, entry: EntryDynamicNormalized): {
        name: BuiltinPluginName;
        _options: RawDynamicEntryPluginOptions;
        affectedHooks: "done" | "compilation" | "make" | "compile" | "emit" | "afterEmit" | "invalid" | "thisCompilation" | "afterDone" | "normalModuleFactory" | "contextModuleFactory" | "initialize" | "shouldEmit" | "infrastructureLog" | "beforeRun" | "run" | "assetEmitted" | "failed" | "shutdown" | "watchRun" | "watchClose" | "environment" | "afterEnvironment" | "afterPlugins" | "afterResolvers" | "beforeCompile" | "afterCompile" | "finishMake" | "entryOption" | undefined;
        raw(): import("@rspack/binding").BuiltinPlugin;
        apply(compiler: import("../Compiler").Compiler): void;
    };
};
