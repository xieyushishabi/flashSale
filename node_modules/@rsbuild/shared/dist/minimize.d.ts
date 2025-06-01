import type { SwcJsMinimizerRspackPluginOptions } from '@rspack/core';
import type { HTMLPluginOptions, NormalizedConfig } from './types';
export declare function getHtmlMinifyOptions(isProd: boolean, config: NormalizedConfig): Promise<any>;
export declare const getSwcMinimizerOptions: (config: NormalizedConfig) => any;
export declare const parseMinifyOptions: (config: NormalizedConfig, isProd?: boolean) => {
    minifyJs: boolean;
    minifyCss: boolean;
    minifyHtml: boolean;
    jsOptions?: SwcJsMinimizerRspackPluginOptions;
    htmlOptions?: HTMLPluginOptions['minify'];
};
