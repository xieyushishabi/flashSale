/// <reference types="node" />
import type fs from 'node:fs';
import { type HtmlFallback, type RequestHandler as Middleware } from '@rsbuild/shared';
import type Connect from '@rsbuild/shared/connect';
export declare const faviconFallbackMiddleware: Middleware;
export declare const getRequestLoggerMiddleware: () => Promise<Connect.NextHandleFunction>;
export declare const notFoundMiddleware: Middleware;
export declare const getHtmlFallbackMiddleware: (params: {
    distPath: string;
    callback?: Middleware;
    htmlFallback?: HtmlFallback;
    outputFileSystem: typeof fs;
}) => Middleware;
