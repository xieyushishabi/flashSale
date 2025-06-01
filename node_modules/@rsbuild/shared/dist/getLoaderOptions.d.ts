import type { LessLoaderOptions, SassLoaderOptions, ToolsLessConfig, ToolsSassConfig } from './types';
export declare const getSassLoaderOptions: (rsbuildSassConfig: ToolsSassConfig | undefined, isUseCssSourceMap: boolean) => {
    options: SassLoaderOptions;
    excludes: (RegExp | string)[];
};
export declare const getLessLoaderOptions: (rsbuildLessConfig: ToolsLessConfig | undefined, isUseCssSourceMap: boolean, rootPath: string) => {
    options: LessLoaderOptions;
    excludes: (string | RegExp)[];
};
