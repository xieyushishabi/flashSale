import type { RawOptions, RawLibraryOptions } from "@rspack/binding";
import { Compiler } from "../Compiler";
import { LoaderContext, LoaderDefinition, LoaderDefinitionFunction } from "./adapterRuleUse";
import { LibraryOptions, ChunkLoading } from "./zod";
import { RspackOptionsNormalized } from "./normalization";
export type { LoaderContext, LoaderDefinition, LoaderDefinitionFunction };
export declare const getRawOptions: (options: RspackOptionsNormalized, compiler: Compiler) => RawOptions;
export declare function getRawLibrary(library: LibraryOptions): RawLibraryOptions;
export declare function getRawChunkLoading(chunkLoading: ChunkLoading): string;
