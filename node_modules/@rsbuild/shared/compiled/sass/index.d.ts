import { List, ValueObject, OrderedMap } from 'immutable';

/**
 * All of the deprecation types currently used by Sass.
 *
 * Any of these IDs or the deprecation objects they point to can be passed to
 * `fatalDeprecations`, `futureDeprecations`, or `silenceDeprecations`.
 */
interface Deprecations {
  /**
   * Deprecation for passing a string to `call` instead of using `get-function`.
   *
   * This deprecation has been active in all versions of Dart Sass.
   */
  'call-string': Deprecation<'call-string'>;

  /**
   * Deprecation for `@elseif`.
   *
   * This deprecation became active in Dart Sass 1.3.2.
   */
  elseif: Deprecation<'elseif'>;

  /**
   * Deprecation for parsing `@-moz-document`.
   *
   * This deprecation became active in Dart Sass 1.7.2.
   */
  'moz-document': Deprecation<'moz-document'>;

  /**
   * Deprecation for imports using relative canonical URLs.
   *
   * This deprecation became active in Dart Sass 1.17.2.
   */
  'relative-canonical': Deprecation<'relative-canonical'>;

  /**
   * Deprecation for declaring new variables with `!global`.
   *
   * This deprecation became active in Dart Sass 1.17.2.
   */
  'new-global': Deprecation<'new-global'>;

  /**
   * Deprecation for using color module functions in place of plain CSS
   * functions.
   *
   * This deprecation became active in Dart Sass 1.23.0.
   */
  'color-module-compat': Deprecation<'color-module-compat'>;

  /**
   * Deprecation for treating `/` as division.
   *
   * This deprecation became active in Dart Sass 1.33.0.
   */
  'slash-div': Deprecation<'slash-div'>;

  /**
   * Deprecation for leading, trailing, and repeated combinators.
   *
   * This deprecation became active in Dart Sass 1.54.0.
   */
  'bogus-combinators': Deprecation<'bogus-combinators'>;

  /**
   * Deprecation for ambiguous `+` and `-` operators.
   *
   * This deprecation became active in Dart Sass 1.55.0.
   */
  'strict-unary': Deprecation<'strict-unary'>;

  /**
   * Deprecation for passing invalid units to certain built-in functions.
   *
   * This deprecation became active in Dart Sass 1.56.0.
   */
  'function-units': Deprecation<'function-units'>;

  /**
   * Deprecation for using `!default` or `!global` multiple times for one
   * variable.
   *
   * This deprecation became active in Dart Sass 1.62.0.
   */
  'duplicate-var-flags': Deprecation<'duplicate-var-flags'>;

  /**
   * Deprecation for passing null as alpha in the JS API.
   *
   * This deprecation became active in Dart Sass 1.62.3.
   */
  'null-alpha': Deprecation<'null-alpha'>;

  /**
   * Deprecation for passing percentages to the Sass `abs()` function.
   *
   * This deprecation became active in Dart Sass 1.65.0.
   */
  'abs-percent': Deprecation<'abs-percent'>;

  /**
   * Deprecation for using the current working directory as an implicit load
   * path.
   *
   * This deprecation became active in Dart Sass 1.73.0.
   */
  'fs-importer-cwd': Deprecation<'fs-importer-cwd'>;

  /**
   * Deprecation for function and mixin names beginning with `--`.
   *
   * This deprecation became active in Dart Sass 1.76.0.
   */
  'css-function-mixin': Deprecation<'css-function-mixin'>;

  /**
   * Deprecation for `@import` rules.
   *
   * This deprecation is not yet active, but will be soon.
   */
  import: Deprecation<'import'>;

  /**
   * Used for any user-emitted deprecation warnings.
   */
  'user-authored': Deprecation<'user-authored', 'user'>;
}

/**
 * Either a deprecation or its ID, either of which can be passed to any of
 * the relevant compiler options.
 *
 * @category Messages
 * @compatibility dart: "1.74.0", node: false
 */
type DeprecationOrId = Deprecation | keyof Deprecations;

/**
 * The possible statuses that each deprecation can have.
 *
 * "active" deprecations are currently emitting deprecation warnings.
 * "future" deprecations are not yet active, but will be in the future.
 * "obsolete" deprecations were once active, but no longer are.
 *
 * The only "user" deprecation is "user-authored", which is used for deprecation
 * warnings coming from user code.
 *
 * @category Messages
 * @compatibility dart: "1.74.0", node: false
 */
type DeprecationStatus = 'active' | 'user' | 'future' | 'obsolete';

/**
 * A deprecated feature in the language.
 *
 * @category Messages
 * @compatibility dart: "1.74.0", node: false
 */
interface Deprecation<
  id extends keyof Deprecations = keyof Deprecations,
  status extends DeprecationStatus = DeprecationStatus
> {
  /** The unique ID of this deprecation. */
  id: id;

  /** The current status of this deprecation. */
  status: status;

  /** A human-readable description of this deprecation. */
  description?: string;

  /** The version this deprecation first became active in. */
  deprecatedIn: status extends 'future' | 'user' ? null : Version;

  /** The version this deprecation became obsolete in. */
  obsoleteIn: status extends 'obsolete' ? Version : null;
}

/**
 * A semantic version of the compiler.
 *
 * @category Messages
 * @compatibility dart: "1.74.0", node: false
 */
declare class Version {
  /**
   * Constructs a new version.
   *
   * All components must be non-negative integers.
   *
   * @param major - The major version.
   * @param minor - The minor version.
   * @param patch - The patch version.
   */
  constructor(major: number, minor: number, patch: number);
  readonly major: number;
  readonly minor: number;
  readonly patch: number;

  /**
   * Parses a version from a string.
   *
   * This throws an error if a valid version can't be parsed.
   *
   * @param version - A string in the form "major.minor.patch".
   */
  static parse(version: string): Version;
}

/**
 * A utility type for choosing between synchronous and asynchronous return
 * values.
 *
 * This is used as the return value for plugins like {@link CustomFunction},
 * {@link Importer}, and {@link FileImporter} so that TypeScript enforces that
 * asynchronous plugins are only passed to {@link compileAsync} and {@link
 * compileStringAsync}, not {@link compile} or {@link compileString}.
 *
 * @typeParam sync - If this is `'sync'`, this can only be a `T`. If it's
 * `'async'`, this can be either a `T` or a `Promise<T>`.
 *
 * @category Other
 */
type PromiseOr<T, sync extends 'sync' | 'async'> = sync extends 'async'
  ? T | Promise<T>
  : T;

/**
 * Contextual information passed to {@link Importer.canonicalize} and {@link
 * FileImporter.findFileUrl}. Not all importers will need this information to
 * resolve loads, but some may find it useful.
 */
interface CanonicalizeContext {
  /**
   * Whether this is being invoked because of a Sass
   * `@import` rule, as opposed to a `@use` or `@forward` rule.
   *
   * This should *only* be used for determining whether or not to load
   * [import-only files](https://sass-lang.com/documentation/at-rules/import#import-only-files).
   */
  fromImport: boolean;

  /**
   * The canonical URL of the file that contains the load, if that information
   * is available.
   *
   * For an {@link Importer}, this is only passed when the `url` parameter is a
   * relative URL _or_ when its [URL scheme] is included in {@link
   * Importer.nonCanonicalScheme}. This ensures that canonical URLs are always
   * resolved the same way regardless of context.
   *
   * [URL scheme]: https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL#scheme
   *
   * For a {@link FileImporter}, this is always available as long as Sass knows
   * the canonical URL of the containing file.
   */
  containingUrl: URL | null;
}

/**
 * A special type of importer that redirects all loads to existing files on
 * disk. Although this is less powerful than a full {@link Importer}, it
 * automatically takes care of Sass features like resolving partials and file
 * extensions and of loading the file from disk.
 *
 * Like all importers, this implements custom Sass loading logic for [`@use`
 * rules](https://sass-lang.com/documentation/at-rules/use) and [`@import`
 * rules](https://sass-lang.com/documentation/at-rules/import). It can be passed
 * to {@link Options.importers} or {@link StringOptions.importer}.
 *
 * @typeParam sync - A `FileImporter<'sync'>`'s {@link findFileUrl} must return
 * synchronously, but in return it can be passed to {@link compile} and {@link
 * compileString} in addition to {@link compileAsync} and {@link
 * compileStringAsync}.
 *
 * A `FileImporter<'async'>`'s {@link findFileUrl} may either return
 * synchronously or asynchronously, but it can only be used with {@link
 * compileAsync} and {@link compileStringAsync}.
 *
 * @example
 *
 * ```js
 * const {pathToFileURL} = require('url');
 *
 * sass.compile('style.scss', {
 *   importers: [{
 *     // An importer that redirects relative URLs starting with "~" to
 *     // `node_modules`.
 *     findFileUrl(url) {
 *       if (!url.startsWith('~')) return null;
 *       return new URL(url.substring(1), pathToFileURL('node_modules'));
 *     }
 *   }]
 * });
 * ```
 *
 * @category Importer
 */
interface FileImporter<
  sync extends 'sync' | 'async' = 'sync' | 'async'
> {
  /**
   * A callback that's called to partially resolve a load (such as
   * [`@use`](https://sass-lang.com/documentation/at-rules/use) or
   * [`@import`](https://sass-lang.com/documentation/at-rules/import)) to a file
   * on disk.
   *
   * Unlike an {@link Importer}, the compiler will automatically handle relative
   * loads for a {@link FileImporter}. See {@link Options.importers} for more
   * details on the way loads are resolved.
   *
   * @param url - The loaded URL. Since this might be relative, it's represented
   * as a string rather than a {@link URL} object.
   *
   * @returns An absolute `file:` URL if this importer recognizes the `url`.
   * This may be only partially resolved: the compiler will automatically look
   * for [partials](https://sass-lang.com/documentation/at-rules/use#partials),
   * [index files](https://sass-lang.com/documentation/at-rules/use#index-files),
   * and file extensions based on the returned URL. An importer may also return
   * a fully resolved URL if it so chooses.
   *
   * If this importer doesn't recognize the URL, it should return `null` instead
   * to allow other importers or {@link Options.loadPaths | load paths} to
   * handle it.
   *
   * This may also return a `Promise`, but if it does the importer may only be
   * passed to {@link compileAsync} and {@link compileStringAsync}, not {@link
   * compile} or {@link compileString}.
   *
   * @throws any - If this importer recognizes `url` but determines that it's
   * invalid, it may throw an exception that will be wrapped by Sass. If the
   * exception object has a `message` property, it will be used as the wrapped
   * exception's message; otherwise, the exception object's `toString()` will be
   * used. This means it's safe for importers to throw plain strings.
   */
  findFileUrl(
    url: string,
    context: CanonicalizeContext
  ): PromiseOr<URL | null, sync>;

  /** @hidden */
  canonicalize?: never;
}

/**
 * An object that implements custom Sass loading logic for [`@use`
 * rules](https://sass-lang.com/documentation/at-rules/use) and [`@import`
 * rules](https://sass-lang.com/documentation/at-rules/import). It can be passed
 * to {@link Options.importers} or {@link StringOptions.importer}.
 *
 * Importers that simply redirect to files on disk are encouraged to use the
 * {@link FileImporter} interface instead.
 *
 * ### Resolving a Load
 *
 * This is the process of resolving a load using a custom importer:
 *
 * - The compiler encounters `@use "db:foo/bar/baz"`.
 * - It calls {@link canonicalize} with `"db:foo/bar/baz"`.
 * - {@link canonicalize} returns `new URL("db:foo/bar/baz/_index.scss")`.
 * - If the compiler has already loaded a stylesheet with this canonical URL, it
 *   re-uses the existing module.
 * - Otherwise, it calls {@link load} with `new
 *   URL("db:foo/bar/baz/_index.scss")`.
 * - {@link load} returns an {@link ImporterResult} that the compiler uses as
 *   the contents of the module.
 *
 * See {@link Options.importers} for more details on the way loads are resolved
 * using multiple importers and load paths.
 *
 * @typeParam sync - An `Importer<'sync'>`'s {@link canonicalize} and {@link
 * load} must return synchronously, but in return it can be passed to {@link
 * compile} and {@link compileString} in addition to {@link compileAsync} and
 * {@link compileStringAsync}.
 *
 * An `Importer<'async'>`'s {@link canonicalize} and {@link load} may either
 * return synchronously or asynchronously, but it can only be used with {@link
 * compileAsync} and {@link compileStringAsync}.
 *
 * @example
 *
 * ```js
 * sass.compile('style.scss', {
 *   // An importer for URLs like `bgcolor:orange` that generates a
 *   // stylesheet with the given background color.
 *   importers: [{
 *     canonicalize(url) {
 *       if (!url.startsWith('bgcolor:')) return null;
 *       return new URL(url);
 *     },
 *     load(canonicalUrl) {
 *       return {
 *         contents: `body {background-color: ${canonicalUrl.pathname}}`,
 *         syntax: 'scss'
 *       };
 *     }
 *   }]
 * });
 * ```
 *
 * @category Importer
 */
interface Importer<sync extends 'sync' | 'async' = 'sync' | 'async'> {
  /**
   * If `url` is recognized by this importer, returns its canonical format.
   *
   * If Sass has already loaded a stylesheet with the returned canonical URL, it
   * re-uses the existing parse tree (and the loaded module for `@use`). This
   * means that importers **must ensure** that the same canonical URL always
   * refers to the same stylesheet, *even across different importers*. As such,
   * importers are encouraged to use unique URL schemes to disambiguate between
   * one another.
   *
   * As much as possible, custom importers should canonicalize URLs the same way
   * as the built-in filesystem importer:
   *
   * - The importer should look for stylesheets by adding the prefix `_` to the
   *   URL's basename, and by adding the extensions `.sass` and `.scss` if the
   *   URL doesn't already have one of those extensions. For example, if the
   *   URL was `foo/bar/baz`, the importer would look for:
   *   - `foo/bar/baz.sass`
   *   - `foo/bar/baz.scss`
   *   - `foo/bar/_baz.sass`
   *   - `foo/bar/_baz.scss`
   *
   *   If the URL was `foo/bar/baz.scss`, the importer would just look for:
   *   - `foo/bar/baz.scss`
   *   - `foo/bar/_baz.scss`
   *
   *   If the importer finds a stylesheet at more than one of these URLs, it
   *   should throw an exception indicating that the URL is ambiguous. Note that
   *   if the extension is explicitly specified, a stylesheet with the opposite
   *   extension is allowed to exist.
   *
   * - If none of the possible paths is valid, the importer should perform the
   *   same resolution on the URL followed by `/index`. In the example above,
   *   it would look for:
   *   - `foo/bar/baz/index.sass`
   *   - `foo/bar/baz/index.scss`
   *   - `foo/bar/baz/_index.sass`
   *   - `foo/bar/baz/_index.scss`
   *
   *   As above, if the importer finds a stylesheet at more than one of these
   *   URLs, it should throw an exception indicating that the import is
   *   ambiguous.
   *
   * If no stylesheets are found, the importer should return `null`.
   *
   * Calling {@link canonicalize} multiple times with the same URL must return
   * the same result. Calling {@link canonicalize} with a URL returned by a
   * previous call to {@link canonicalize} must return that URL.
   *
   * Relative loads in stylesheets loaded from an importer are handled by
   * resolving the loaded URL relative to the canonical URL of the stylesheet
   * that contains it, and passing that URL back to the importer's {@link
   * canonicalize} method. For example, suppose the "Resolving a Load" example
   * {@link Importer | above} returned a stylesheet that contained `@use
   * "mixins"`:
   *
   * - The compiler resolves the URL `mixins` relative to the current
   *   stylesheet's canonical URL `db:foo/bar/baz/_index.scss` to get
   *   `db:foo/bar/baz/mixins`.
   * - It calls {@link canonicalize} with `"db:foo/bar/baz/mixins"`.
   * - {@link canonicalize} returns `new URL("db:foo/bar/baz/_mixins.scss")`.
   *
   * Because of this, {@link canonicalize} must return a meaningful result when
   * called with a URL relative to one returned by an earlier call to {@link
   * canonicalize}.
   *
   * @param url - The loaded URL. Since this might be relative, it's represented
   * as a string rather than a {@link URL} object.
   *
   * @returns An absolute URL if this importer recognizes the `url`, or `null`
   * if it doesn't. If this returns `null`, other importers or {@link
   * Options.loadPaths | load paths} may handle the load.
   *
   * This may also return a `Promise`, but if it does the importer may only be
   * passed to {@link compileAsync} and {@link compileStringAsync}, not {@link
   * compile} or {@link compileString}.
   *
   * @throws any - If this importer recognizes `url` but determines that it's
   * invalid, it may throw an exception that will be wrapped by Sass. If the
   * exception object has a `message` property, it will be used as the wrapped
   * exception's message; otherwise, the exception object's `toString()` will be
   * used. This means it's safe for importers to throw plain strings.
   */
  canonicalize(
    url: string,
    context: CanonicalizeContext
  ): PromiseOr<URL | null, sync>;

  /**
   * Loads the Sass text for the given `canonicalUrl`, or returns `null` if this
   * importer can't find the stylesheet it refers to.
   *
   * @param canonicalUrl - The canonical URL of the stylesheet to load. This is
   * guaranteed to come from a call to {@link canonicalize}, although not every
   * call to {@link canonicalize} will result in a call to {@link load}.
   *
   * @returns The contents of the stylesheet at `canonicalUrl` if it can be
   * loaded, or `null` if it can't.
   *
   * This may also return a `Promise`, but if it does the importer may only be
   * passed to {@link compileAsync} and {@link compileStringAsync}, not {@link
   * compile} or {@link compileString}.
   *
   * @throws any - If this importer finds a stylesheet at `url` but it fails to
   * load for some reason, or if `url` is uniquely associated with this importer
   * but doesn't refer to a real stylesheet, the importer may throw an exception
   * that will be wrapped by Sass. If the exception object has a `message`
   * property, it will be used as the wrapped exception's message; otherwise,
   * the exception object's `toString()` will be used. This means it's safe for
   * importers to throw plain strings.
   */
  load(canonicalUrl: URL): PromiseOr<ImporterResult | null, sync>;

  /** @hidden */
  findFileUrl?: never;

  /**
   * A URL scheme or set of schemes (without the `:`) that this importer
   * promises never to use for URLs returned by {@link canonicalize}. If it does
   * return a URL with one of these schemes, that's an error.
   *
   * If this is set, any call to canonicalize for a URL with a non-canonical
   * scheme will be passed {@link CanonicalizeContext.containingUrl} if it's
   * known.
   *
   * These schemes may only contain lowercase ASCII letters, ASCII numerals,
   * `+`, `-`, and `.`. They may not be empty.
   */
  nonCanonicalScheme?: string | string[];
}

declare const nodePackageImporterKey: unique symbol;

/**
 * The built-in Node.js package importer. This loads pkg: URLs from node_modules
 * according to the standard Node.js resolution algorithm.
 *
 * A Node.js package importer is exposed as a class that can be added to the
 * `importers` option.
 *
 *```js
 * const sass = require('sass');
 * sass.compileString('@use "pkg:vuetify', {
 *   importers: [new sass.NodePackageImporter()]
 * });
 *```
 *
 * ## Writing Sass packages
 *
 * Package authors can control what is exposed to their users through their
 * `package.json` manifest. The recommended method is to add a `sass`
 * conditional export to `package.json`.
 *
 * ```json
 * // node_modules/uicomponents/package.json
 * {
 *   "exports": {
 *     ".": {
 *       "sass": "./src/scss/index.scss",
 *       "import": "./dist/js/index.mjs",
 *       "default": "./dist/js/index.js"
 *     }
 *   }
 * }
 * ```
 *
 * This allows a package user to write `@use "pkg:uicomponents"` to load the
 * file at `node_modules/uicomponents/src/scss/index.scss`.
 *
 * The Node.js package importer supports the variety of formats supported by
 * Node.js [package entry points], allowing authors to expose multiple subpaths.
 *
 * [package entry points]:
 * https://nodejs.org/api/packages.html#package-entry-points
 *
 * ```json
 * // node_modules/uicomponents/package.json
 * {
 *   "exports": {
 *     ".": {
 *       "sass": "./src/scss/index.scss",
 *     },
 *     "./colors.scss": {
 *       "sass": "./src/scss/_colors.scss",
 *     },
 *     "./theme/*.scss": {
 *       "sass": "./src/scss/theme/*.scss",
 *     },
 *   }
 * }
 * ```
 *
 * This allows a package user to write:
 *
 * - `@use "pkg:uicomponents";` to import the root export.
 * - `@use "pkg:uicomponents/colors";` to import the colors partial.
 * - `@use "pkg:uicomponents/theme/purple";` to import a purple theme.
 *
 * Note that while library users can rely on the importer to resolve
 * [partials](https://sass-lang.com/documentation/at-rules/use#partials), [index
 * files](https://sass-lang.com/documentation/at-rules/use#index-files), and
 * extensions, library authors must specify the entire file path in `exports`.
 *
 * In addition to the `sass` condition, the `style` condition is also
 * acceptable. Sass will match the `default` condition if it's a relevant file
 * type, but authors are discouraged from relying on this. Notably, the key
 * order matters, and the importer will resolve to the first value with a key
 * that is `sass`, `style`, or `default`, so you should always put `default`
 * last.
 *
 * To help package authors who haven't transitioned to package entry points
 * using the `exports` field, the Node.js package importer provides several
 * fallback options. If the `pkg:` URL does not have a subpath, the Node.js
 * package importer will look for a `sass` or `style` key at the root of
 * `package.json`.
 *
 * ```json
 * // node_modules/uicomponents/package.json
 * {
 *   "sass": "./src/scss/index.scss",
 * }
 * ```
 *
 * This allows a user to write `@use "pkg:uicomponents";` to import the
 * `index.scss` file.
 *
 * Finally, the Node.js package importer will look for an `index` file at the
 * package root, resolving partials and extensions. For example, if the file
 * `_index.scss` exists in the package root of `uicomponents`, a user can import
 * that with `@use "pkg:uicomponents";`.
 *
 * If a `pkg:` URL includes a subpath that doesn't have a match in package entry
 * points, the Node.js importer will attempt to find that file relative to the
 * package root, resolving for file extensions, partials and index files. For
 * example, if the file `src/sass/_colors.scss` exists in the `uicomponents`
 * package, a user can import that file using `@use
 * "pkg:uicomponents/src/sass/colors";`.
 *
 * @compatibility dart: "1.71.0", node: false
 * @category Importer
 */
declare class NodePackageImporter {
  /** Used to distinguish this type from any arbitrary object. */
  private readonly [nodePackageImporterKey]: true;

  /**
   * The NodePackageImporter has an optional `entryPointDirectory` option, which
   * is the directory where the Node Package Importer should start when
   * resolving `pkg:` URLs in sources other than files on disk. This will be
   * used as the `parentURL` in the [Node Module
   * Resolution](https://nodejs.org/api/esm.html#resolution-algorithm-specification)
   * algorithm.
   *
   * In order to be found by the Node Package Importer, a package will need to
   * be inside a node_modules folder located in the `entryPointDirectory`, or
   * one of its parent directories, up to the filesystem root.
   *
   * Relative paths will be resolved relative to the current working directory.
   * If a path is not provided, this defaults to the parent directory of the
   * Node.js entrypoint. If that's not available, this will throw an error.
   */
  constructor(entryPointDirectory?: string);
}

/**
 * The result of successfully loading a stylesheet with an {@link Importer}.
 *
 * @category Importer
 */
interface ImporterResult {
  /** The contents of the stylesheet. */
  contents: string;

  /** The syntax with which to parse {@link contents}. */
  syntax: Syntax;

  /**
   * The URL to use to link to the loaded stylesheet's source code in source
   * maps. A `file:` URL is ideal because it's accessible to both browsers and
   * other build tools, but an `http:` URL is also acceptable.
   *
   * If this isn't set, it defaults to a `data:` URL that contains the contents
   * of the loaded stylesheet.
   */
  sourceMapUrl?: URL;
}

/**
 * A specific location within a source file.
 *
 * This is always associated with a {@link SourceSpan} which indicates *which*
 * file it refers to.
 *
 * @category Logger
 */
interface SourceLocation {
  /**
   * The 0-based index of this location within its source file, in terms of
   * UTF-16 code units.
   */
  offset: number;

  /** The 0-based line number of this location. */
  line: number;

  /** The 0-based column number of this location. */
  column: number;
}

/**
 * A span of text within a source file.
 *
 * @category Logger
 */
interface SourceSpan {
  /** The beginning of this span, inclusive. */
  start: SourceLocation;

  /**
   * The end of this span, exclusive.
   *
   * If {@link start} and {@link end} refer to the same location, the span has
   * zero length and refers to the point immediately after {@link start} and
   * before the next character.
   */
  end: SourceLocation;

  /** The canonical URL of the file this span refers to. */
  url?: URL;

  /** The text covered by the span. */
  text: string;

  /**
   * Text surrounding the span.
   *
   * If this is set, it must include only whole lines, and it must include at
   * least all line(s) which are partially covered by this span.
   */
  context?: string;
}

/**
 * An object that can be passed to {@link LegacySharedOptions.logger} to control
 * how Sass emits warnings and debug messages.
 *
 * @example
 *
 * ```js
 * const fs = require('fs');
 * const sass = require('sass');
 *
 * let log = "";
 * sass.renderSync({
 *   file: 'input.scss',
 *   logger: {
 *     warn(message, options) {
 *       if (options.span) {
 *         log += `${span.url}:${span.start.line}:${span.start.column}: ` +
 *             `${message}\n`;
 *       } else {
 *         log += `::: ${message}\n`;
 *       }
 *     }
 *   }
 * });
 *
 * fs.writeFileSync('log.txt', log);
 * ```
 *
 * @category Logger
 */
interface Logger {
  /**
   * This method is called when Sass emits a warning, whether due to a [`@warn`
   * rule](https://sass-lang.com/documentation/at-rules/warn) or a warning
   * generated by the Sass compiler.
   *
   * If this is `undefined`, Sass will print warnings to standard error.
   *
   * @param message - The warning message.
   * @param options.deprecation - Whether this is a deprecation warning.
   * @param options.deprecationType - The type of deprecation this warning is
   * for, if any.
   * @param options.span - The location in the Sass source code that generated this
   * warning.
   * @param options.stack - The Sass stack trace at the point the warning was issued.
   */
  warn?(
    message: string,
    options: (
      | {
          deprecation: true;
          deprecationType: Deprecation;
        }
      | {deprecation: false}
    ) & {span?: SourceSpan; stack?: string}
  ): void;

  /**
   * This method is called when Sass emits a debug message due to a [`@debug`
   * rule](https://sass-lang.com/documentation/at-rules/debug).
   *
   * If this is `undefined`, Sass will print debug messages to standard error.
   *
   * @param message - The debug message.
   * @param options.span - The location in the Sass source code that generated this
   * debug message.
   */
  debug?(message: string, options: {span: SourceSpan}): void;
}

/**
 * A namespace for built-in {@link Logger}s.
 *
 * @category Logger
 * @compatibility dart: "1.43.0", node: false
 */
declare namespace Logger {
  /**
   * A {@link Logger} that silently ignores all warnings and debug messages.
   *
   * @example
   *
   * ```js
   * const sass = require('sass');
   *
   * const result = sass.renderSync({
   *   file: 'input.scss',
   *   logger: sass.Logger.silent,
   * });
   * ```
   */
  export const silent: Logger;
}

/**
 * Sass's [boolean type](https://sass-lang.com/documentation/values/booleans).
 *
 * @category Custom Function
 */
declare class SassBoolean extends Value {
  private constructor();

  /**
   * Whether this value is `true` or `false`.
   */
  get value(): boolean;
}

/**
 * The type of values that can be arguments to a {@link SassCalculation}.
 * @category Custom Function
 * */
type CalculationValue =
  | SassNumber
  | SassCalculation
  | SassString
  | CalculationOperation
  | CalculationInterpolation;

/**
 * Sass's [calculation
 * type](https://sass-lang.com/documentation/values/calculations).
 *
 * Note: in the JS API calculations are not simplified eagerly. This also means
 * that unsimplified calculations are not equal to the numbers they would be
 * simplified to.
 *
 * @category Custom Function
 */
declare class SassCalculation extends Value {
  /**
   * Creates a value that represents `calc(argument)`.
   *
   * @throws `Error` if `argument` is a quoted {@link SassString}
   * @returns A calculation with the name `calc` and `argument` as its single
   * argument.
   */
  static calc(argument: CalculationValue): SassCalculation;

  /**
   * Creates a value that represents `min(arguments...)`.
   *
   * @throws `Error` if `arguments` contains a quoted {@link SassString}
   * @returns A calculation with the name `min` and `arguments` as its
   * arguments.
   */
  static min(
    arguments: CalculationValue[] | List<CalculationValue>
  ): SassCalculation;

  /**
   * Creates a value that represents `max(arguments...)`.
   *
   * @throws `Error` if `arguments` contains a quoted {@link SassString}
   * @returns A calculation with the name `max` and `arguments` as its
   * arguments.
   */
  static max(
    arguments: CalculationValue[] | List<CalculationValue>
  ): SassCalculation;

  /**
   * Creates a value that represents `clamp(value, min, max)`.
   *
   * @throws `Error` if any of `value`, `min`, or `max` are  a quoted
   * {@link SassString}.
   * @throws `Error` if `value` is undefined and `max` is not undefined.
   * @throws `Error` if either `value` or `max` is undefined and neither `min`
     nor `value` is a {@link SassString} or {@link CalculationInterpolation}.
     @returns A calculation with the name `clamp` and `min`, `value`, and `max`
     as it's arguments, excluding any arguments that are undefined.
   */
  static clamp(
    min: CalculationValue,
    value?: CalculationValue,
    max?: CalculationValue
  ): SassCalculation;

  /** Returns the calculation's `name` field. */
  get name(): string;

  /** Returns a list of the calculation's `arguments` */
  get arguments(): List<CalculationValue>;
}

/**
 * The set of possible operators in a Sass calculation.
 * @category Custom Function
 */
type CalculationOperator = '+' | '-' | '*' | '/';

/**
 * A binary operation that can appear in a {@link SassCalculation}.
 * @category Custom Function
 */
declare class CalculationOperation implements ValueObject {
  /**
   * Creates a Sass CalculationOperation with the given `operator`, `left`, and
   * `right` values.
   * @throws `Error` if `left` or `right` are quoted {@link SassString}s.
   */
  constructor(
    operator: CalculationOperator,
    left: CalculationValue,
    right: CalculationValue
  );

  /** Returns the operation's `operator` field. */
  get operator(): CalculationOperator;

  /** Returns the operation's `left` field. */
  get left(): CalculationValue;

  /** Returns the operation's `right` field. */
  get right(): CalculationValue;

  equals(other: unknown): boolean;

  hashCode(): number;
}

/**
 * A string injected into a {@link SassCalculation} using interpolation. Unlike
 * unquoted strings, interpolations are always surrounded in parentheses when
 * they appear in {@link CalculationOperation}s.
 * @category Custom Function
 */
declare class CalculationInterpolation implements ValueObject {
  /**
   * Creates a Sass CalculationInterpolation with the given `value`.
   */
  constructor(value: string);

  /**
   * Returns the interpolation's `value` field.
   */
  get value(): string;

  equals(other: unknown): boolean;

  hashCode(): number;
}

/**
 * Sass's [color type](https://sass-lang.com/documentation/values/colors).
 *
 * No matter what representation was originally used to create this color, all
 * of its channels are accessible.
 *
 * @category Custom Function
 */
declare class SassColor extends Value {
  /**
   * Creates an RGB color.
   *
   * **Only** `undefined` should be passed to indicate a missing `alpha`. If
   * `null` is passed instead, it will be treated as a [missing component] in
   * future versions of Dart Sass. See [breaking changes] for details.
   *
   * [missing component]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#missing_color_components
   * [breaking changes]: /documentation/breaking-changes/null-alpha
   *
   * @throws `Error` if `red`, `green`, and `blue` aren't between `0` and
   * `255`, or if `alpha` isn't between `0` and `1`.
   */
  constructor(options: {
    red: number;
    green: number;
    blue: number;
    alpha?: number;
  });

  /**
   * Creates an HSL color.
   *
   * **Only** `undefined` should be passed to indicate a missing `alpha`. If
   * `null` is passed instead, it will be treated as a [missing component] in
   * future versions of Dart Sass. See [breaking changes] for details.
   *
   * [missing component]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#missing_color_components
   * [breaking changes]: /documentation/breaking-changes/null-alpha
   *
   * @throws `Error` if `saturation` or `lightness` aren't between `0` and
   * `100`, or if `alpha` isn't between `0` and `1`.
   */
  constructor(options: {
    hue: number;
    saturation: number;
    lightness: number;
    alpha?: number;
  });

  /**
   * Creates an HWB color.
   *
   * **Only** `undefined` should be passed to indicate a missing `alpha`. If
   * `null` is passed instead, it will be treated as a [missing component] in
   * future versions of Dart Sass. See [breaking changes] for details.
   *
   * [missing component]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value#missing_color_components
   * [breaking changes]: /documentation/breaking-changes/null-alpha
   *
   * @throws `Error` if `whiteness` or `blackness` aren't between `0` and `100`,
   * or if `alpha` isn't between `0` and `1`.
   */
  constructor(options: {
    hue: number;
    whiteness: number;
    blackness: number;
    alpha?: number;
  });

  /** This color's red channel, between `0` and `255`. */
  get red(): number;

  /** This color's green channel, between `0` and `255`. */
  get green(): number;

  /** This color's blue channel, between `0` and `255`. */
  get blue(): number;

  /** This color's hue, between `0` and `360`. */
  get hue(): number;

  /** This color's saturation, between `0` and `100`. */
  get saturation(): number;

  /** This color's lightness, between `0` and `100`. */
  get lightness(): number;

  /** This color's whiteness, between `0` and `100`. */
  get whiteness(): number;

  /** This color's blackness, between `0` and `100`. */
  get blackness(): number;

  /** This color's alpha channel, between `0` and `1`. */
  get alpha(): number;

  /**
   * Changes one or more of this color's RGB channels and returns the result.
   */
  change(options: {
    red?: number;
    green?: number;
    blue?: number;
    alpha?: number;
  }): SassColor;

  /**
   * Changes one or more of this color's HSL channels and returns the result.
   */
  change(options: {
    hue?: number;
    saturation?: number;
    lightness?: number;
    alpha?: number;
  }): SassColor;

  /**
   * Changes one or more of this color's HWB channels and returns the result.
   */
  change(options: {
    hue?: number;
    whiteness?: number;
    blackness?: number;
    alpha?: number;
  }): SassColor;
}

/**
 * Sass's [function type](https://sass-lang.com/documentation/values/functions).
 *
 * **Heads up!** Although first-class Sass functions can be processed by custom
 * functions, there's no way to invoke them outside of a Sass stylesheet.
 *
 * @category Custom Function
 */
declare class SassFunction extends Value {
  /**
   * Creates a new first-class function that can be invoked using
   * [`meta.call()`](https://sass-lang.com/documentation/modules/meta#call).
   *
   * @param signature - The function signature, like you'd write for the
   * [`@function rule`](https://sass-lang.com/documentation/at-rules/function).
   * @param callback - The callback that's invoked when this function is called,
   * just like for a {@link CustomFunction}.
   */
  constructor(signature: string, callback: (args: Value[]) => Value);
}

/**
 * Possible separators used by Sass lists. The special separator `null` is only
 * used for lists with fewer than two elements, and indicates that the separator
 * has not yet been decided for this list.
 *
 * @category Custom Function
 */
type ListSeparator = ',' | '/' | ' ' | null;

/**
 * Sass's [list type](https://sass-lang.com/documentation/values/lists).
 *
 * @category Custom Function
 */
declare class SassList extends Value {
  /**
   * Creates a new list.
   *
   * @param contents - The contents of the list. This may be either a plain
   * JavaScript array or an immutable {@link List} from the [`immutable`
   * package](https://immutable-js.com/).
   *
   * @param options.separator - The separator to use between elements of this
   * list. Defaults to `','`.
   *
   * @param options.brackets - Whether the list has square brackets. Defaults to
   * `false`.
   */
  constructor(
    contents: Value[] | List<Value>,
    options?: {
      separator?: ListSeparator;
      brackets?: boolean;
    }
  );

  /**
   * Creates an empty list.
   *
   * @param options.separator - The separator to use between elements of this
   * list. Defaults to `','`.
   *
   * @param options.brackets - Whether the list has square brackets. Defaults to
   * `false`.
   */
  constructor(options?: {separator?: ListSeparator; brackets?: boolean});

  /** @hidden */
  get separator(): ListSeparator;
}

/**
 * Sass's [map type](https://sass-lang.com/documentation/values/maps).
 *
 * @category Custom Function
 */
declare class SassMap extends Value {
  /**
   * Creates a new map.
   *
   * @param contents - The contents of the map. This is an immutable
   * `OrderedMap` from the [`immutable` package](https://immutable-js.com/).
   * Defaults to an empty map.
   */
  constructor(contents?: OrderedMap<Value, Value>);

  /**
   * Returns the contents of this map as an immutable {@link OrderedMap} from the
   * [`immutable` package](https://immutable-js.com/).
   */
  get contents(): OrderedMap<Value, Value>;

  /**
   * Returns the value associated with `key` in this map, or `undefined` if
   * `key` isn't in the map.
   *
   * This is a shorthand for `this.contents.get(key)`, although it may be more
   * efficient in some cases.
   */
  get(key: Value): Value | undefined;

  /** Inherited from {@link Value.get}. */
  get(index: number): SassList | undefined;

  /** @hidden */
  tryMap(): SassMap;
}

/**
 * Sass's [mixin type](https://sass-lang.com/documentation/values/mixins).
 *
 * @category Custom Function
 */
declare class SassMixin extends Value {
  /**
   * It is not possible to construct a Sass mixin outside of Sass. Attempting to
   * construct one will throw an exception.
   */
  constructor();
}

/**
 * Sass's [number type](https://sass-lang.com/documentation/values/numbers).
 *
 * @category Custom Function
 */
declare class SassNumber extends Value {
  /**
   * Creates a new number with more complex units than just a single numerator.
   *
   * Upon construction, any compatible numerator and denominator units are
   * simplified away according to the conversion factor between them.
   *
   * @param value - The number's numeric value.
   *
   * @param unit - If this is a string, it's used as the single numerator unit
   * for the number.
   *
   * @param unit.numeratorUnits - If passed, these are the numerator units to
   * use for the number. This may be either a plain JavaScript array or an
   * immutable {@link List} from the [`immutable`
   * package](https://immutable-js.com/).
   *
   * @param unit.denominatorUnits - If passed, these are the denominator units
   * to use for the number. This may be either a plain JavaScript array or an
   * immutable {@link List} from the [`immutable`
   * package](https://immutable-js.com/).
   */
  constructor(
    value: number,
    unit?:
      | string
      | {
          numeratorUnits?: string[] | List<string>;
          denominatorUnits?: string[] | List<string>;
        }
  );

  /** This number's numeric value. */
  get value(): number;

  /** Whether {@link value} is an integer according to Sass's equality logic. */
  get isInt(): boolean;

  /**
   * If {@link value} is an integer according to {@link isInt}, returns {@link
   * value} rounded to that integer. If it's not an integer, returns `null`.
   */
  get asInt(): number | null;

  /**
   * This number's numerator units as an immutable {@link List} from the
   * [`immutable` package](https://immutable-js.com/).
   */
  get numeratorUnits(): List<string>;

  /**
   * This number's denominator units as an immutable {@link List} from the
   * [`immutable` package](https://immutable-js.com/).
   */
  get denominatorUnits(): List<string>;

  /** Whether this number has any numerator or denominator units. */
  get hasUnits(): boolean;

  /**
   * If {@link value} is an integer according to {@link isInt}, returns it
   * rounded to that integer. Otherwise, throws an error.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertInt(name?: string): number;

  /**
   * Returns {@link value} if it's within `min` and `max`. If {@link value} is
   * equal to `min` or `max` according to Sass's equality, returns `min` or
   * `max` respectively. Otherwise, throws an error.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertInRange(min: number, max: number, name?: string): number;

  /**
   * If this number has no units, returns it. Otherwise, throws an error.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertNoUnits(name?: string): SassNumber;

  /**
   * If this number has `unit` as its only unit (and as a numerator), returns
   * this number. Otherwise, throws an error.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertUnit(unit: string, name?: string): SassNumber;

  /** Whether this number has `unit` as its only unit (and as a numerator). */
  hasUnit(unit: string): boolean;

  /**
   * Whether this has exactly one numerator unit, and that unit is compatible
   * with `unit`.
   */
  compatibleWithUnit(unit: string): boolean;

  /**
   * Returns a copy of this number, converted to the units represented by
   * `newNumerators` and `newDenominators`.
   *
   * @throws `Error` if this number's units are incompatible with
   * `newNumerators` and `newDenominators`; or if this number is unitless and
   * either `newNumerators` or `newDenominators` are not empty, or vice-versa.
   *
   * @param newNumerators - The numerator units to convert this number to. This
   * may be either a plain JavaScript array or an immutable {@link List} from
   * the [`immutable` package](https://immutable-js.com/).
   *
   * @param newDenominators - The denominator units to convert this number to.
   * This may be either a plain JavaScript array or an immutable {@link List}
   * from the [`immutable` package](https://immutable-js.com/).
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  convert(
    newNumerators: string[] | List<string>,
    newDenominators: string[] | List<string>,
    name?: string
  ): SassNumber;

  /**
   * Returns a copy of this number, converted to the same units as `other`.
   *
   * @throws `Error` if this number's units are incompatible with `other`'s
   * units, or if either number is unitless but the other is not.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   *
   * @param otherName - The name of the function argument `other` came from
   * (without the `$`) if it came from an argument. Used for error reporting.
   */
  convertToMatch(
    other: SassNumber,
    name?: string,
    otherName?: string
  ): SassNumber;

  /**
   * Returns {@link value}, converted to the units represented by
   * `newNumerators` and `newDenominators`.
   *
   * @throws `Error` if this number's units are incompatible with
   * `newNumerators` and `newDenominators`; or if this number is unitless and
   * either `newNumerators` or `newDenominators` are not empty, or vice-versa.
   *
   * @param newNumerators - The numerator units to convert {@link value} to.
   * This may be either a plain JavaScript array or an immutable {@link List}
   * from the [`immutable` package](https://immutable-js.com/).
   *
   * @param newDenominators - The denominator units to convert {@link value} to.
   * This may be either a plain JavaScript array or an immutable {@link List}
   * from the [`immutable` package](https://immutable-js.com/).
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  convertValue(
    newNumerators: string[] | List<string>,
    newDenominators: string[] | List<string>,
    name?: string
  ): number;

  /**
   * Returns {@link value}, converted to the same units as `other`.
   *
   * @throws `Error` if this number's units are incompatible with `other`'s
   * units, or if either number is unitless but the other is not.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   *
   * @param otherName - The name of the function argument `other` came from
   * (without the `$`) if it came from an argument. Used for error reporting.
   */
  convertValueToMatch(
    other: SassNumber,
    name?: string,
    otherName?: string
  ): number;

  /**
   * Returns a copy of this number, converted to the units represented by
   * `newNumerators` and `newDenominators`.
   *
   * Unlike {@link convert} this does *not* throw an error if this number is
   * unitless and either `newNumerators` or `newDenominators` are not empty, or
   * vice-versa. Instead, it treats all unitless numbers as convertible to and
   * from all units without changing the value.
   *
   * @throws `Error` if this number's units are incompatible with
   * `newNumerators` and `newDenominators`.
   *
   * @param newNumerators - The numerator units to convert this number to. This
   * may be either a plain JavaScript array or an immutable {@link List} from
   * the [`immutable` package](https://immutable-js.com/).
   *
   * @param newDenominators - The denominator units to convert this number to.
   * This may be either a plain JavaScript array or an immutable {@link List}
   * from the [`immutable` package](https://immutable-js.com/).
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  coerce(
    newNumerators: string[] | List<string>,
    newDenominators: string[] | List<string>,
    name?: string
  ): SassNumber;

  /**
   * Returns a copy of this number, converted to the units represented by
   * `newNumerators` and `newDenominators`.
   *
   * Unlike {@link convertToMatch} this does *not* throw an error if this number
   * is unitless and either `newNumerators` or `newDenominators` are not empty,
   * or vice-versa. Instead, it treats all unitless numbers as convertible to
   * and from all units without changing the value.
   *
   * @throws `Error` if this number's units are incompatible with `other`'s
   * units.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   *
   * @param otherName - The name of the function argument `other` came from
   * (without the `$`) if it came from an argument. Used for error reporting.
   */
  coerceToMatch(
    other: SassNumber,
    name?: string,
    otherName?: string
  ): SassNumber;

  /**
   * Returns {@link value}, converted to the units represented by
   * `newNumerators` and `newDenominators`.
   *
   * Unlike {@link convertValue} this does *not* throw an error if this number
   * is unitless and either `newNumerators` or `newDenominators` are not empty,
   * or vice-versa. Instead, it treats all unitless numbers as convertible to
   * and from all units without changing the value.
   *
   * @throws `Error` if this number's units are incompatible with
   * `newNumerators` and `newDenominators`.
   *
   * @param newNumerators - The numerator units to convert {@link value} to.
   * This may be either a plain JavaScript array or an immutable {@link List}
   * from the [`immutable` package](https://immutable-js.com/).
   *
   * @param newDenominators - The denominator units to convert {@link value} to.
   * This may be either a plain JavaScript array or an immutable {@link List}
   * from the [`immutable` package](https://immutable-js.com/).
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  coerceValue(
    newNumerators: string[] | List<string>,
    newDenominators: string[] | List<string>,
    name?: string
  ): number;

  /**
   * Returns {@link value}, converted to the units represented by
   * `newNumerators` and `newDenominators`.
   *
   * Unlike {@link convertValueToMatch} this does *not* throw an error if this
   * number is unitless and either `newNumerators` or `newDenominators` are not
   * empty, or vice-versa. Instead, it treats all unitless numbers as
   * convertible to and from all units without changing the value.
   *
   * @throws `Error` if this number's units are incompatible with `other`'s
   * units.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   *
   * @param otherName - The name of the function argument `other` came from
   * (without the `$`) if it came from an argument. Used for error reporting.
   */
  coerceValueToMatch(
    other: SassNumber,
    name?: string,
    otherName?: string
  ): number;
}

/**
 * Sass's [string type](https://sass-lang.com/documentation/values/strings).
 *
 * @category Custom Function
 */
declare class SassString extends Value {
  /**
   * Creates a new string.
   *
   * @param text - The contents of the string. For quoted strings, this is the
   * semantic content—any escape sequences that were been written in the source
   * text are resolved to their Unicode values. For unquoted strings, though,
   * escape sequences are preserved as literal backslashes.
   *
   * @param options.quotes - Whether the string is quoted. Defaults to `true`.
   */
  constructor(
    text: string,
    options?: {
      quotes?: boolean;
    }
  );

  /**
   * Creates an empty string.
   *
   * @param options.quotes - Whether the string is quoted. Defaults to `true`.
   */
  constructor(options?: {quotes?: boolean});

  /**
   * The contents of the string.
   *
   * For quoted strings, this is the semantic content—any escape sequences that
   * were been written in the source text are resolved to their Unicode values.
   * For unquoted strings, though, escape sequences are preserved as literal
   * backslashes.
   *
   * This difference allows us to distinguish between identifiers with escapes,
   * such as `url\u28 http://example.com\u29`, and unquoted strings that contain
   * characters that aren't valid in identifiers, such as
   * `url(http://example.com)`. Unfortunately, it also means that we don't
   * consider `foo` and `f\6F\6F` the same string.
   */
  get text(): string;

  /** Whether this string has quotes. */
  get hasQuotes(): boolean;

  /**
   * Sass's notion of this string's length.
   *
   * Sass treats strings as a series of Unicode code points while JavaScript
   * treats them as a series of UTF-16 code units. For example, the character
   * U+1F60A SMILING FACE WITH SMILING EYES is a single Unicode code point but
   * is represented in UTF-16 as two code units (`0xD83D` and `0xDE0A`). So in
   * JavaScript, `"n😊b".length` returns `4`, whereas in Sass
   * `string.length("n😊b")` returns `3`.
   */
  get sassLength(): number;

  /**
   * Converts `sassIndex` to a JavaScript index into {@link text}.
   *
   * Sass indices are one-based, while JavaScript indices are zero-based. Sass
   * indices may also be negative in order to index from the end of the string.
   *
   * In addition, Sass indices refer to Unicode code points while JavaScript
   * string indices refer to UTF-16 code units. For example, the character
   * U+1F60A SMILING FACE WITH SMILING EYES is a single Unicode code point but
   * is represented in UTF-16 as two code units (`0xD83D` and `0xDE0A`). So in
   * JavaScript, `"n😊b".charCodeAt(1)` returns `0xD83D`, whereas in Sass
   * `string.slice("n😊b", 1, 1)` returns `"😊"`.
   *
   * This function converts Sass's code point indices to JavaScript's code unit
   * indices. This means it's O(n) in the length of `text`.
   *
   * @throws `Error` - If `sassIndex` isn't a number, if that number isn't an
   * integer, or if that integer isn't a valid index for this string.
   */
  sassIndexToStringIndex(sassIndex: Value, name?: string): number;
}

/**
 * The abstract base class of Sass's value types.
 *
 * This is passed to and returned by {@link CustomFunction}s, which are passed
 * into the Sass implementation using {@link Options.functions}.
 *
 * @category Custom Function
 */
declare abstract class Value implements ValueObject {
  protected constructor();

  /**
   * This value as a list.
   *
   * All SassScript values can be used as lists. Maps count as lists of pairs,
   * and all other values count as single-value lists.
   *
   * @returns An immutable {@link List} from the [`immutable`
   * package](https://immutable-js.com/).
   */
  get asList(): List<Value>;

  /**
   * Whether this value as a list has brackets.
   *
   * All SassScript values can be used as lists. Maps count as lists of pairs,
   * and all other values count as single-value lists.
   */
  get hasBrackets(): boolean;

  /**
   * Whether the value counts as `true` in an `@if` statement and other
   * contexts.
   */
  get isTruthy(): boolean;

  /**
   * Returns JavaScript's `null` value if this is {@link sassNull}, and returns
   * `this` otherwise.
   */
  get realNull(): null | Value;

  /**
   * The separator for this value as a list.
   *
   * All SassScript values can be used as lists. Maps count as lists of pairs,
   * and all other values count as single-value lists.
   */
  get separator(): ListSeparator;

  /**
   * Converts `sassIndex` into a JavaScript-style index into the list returned
   * by {@link asList}.
   *
   * Sass indexes are one-based, while JavaScript indexes are zero-based. Sass
   * indexes may also be negative in order to index from the end of the list.
   *
   * @param sassIndex - The Sass-style index into this as a list.
   * @param name - The name of the function argument `sassIndex` came from
   * (without the `$`) if it came from an argument. Used for error reporting.
   * @throws `Error` If `sassIndex` isn't a number, if that number isn't an
   * integer, or if that integer isn't a valid index for {@link asList}.
   */
  sassIndexToListIndex(sassIndex: Value, name?: string): number;

  /**
   * Returns the value at index `index` in this value as a list, or `undefined`
   * if `index` isn't valid for this list.
   *
   * All SassScript values can be used as lists. Maps count as lists of pairs,
   * and all other values count as single-value lists.
   *
   * This is a shorthand for `this.asList.get(index)`, although it may be more
   * efficient in some cases.
   *
   * **Heads up!** This method uses the same indexing conventions as the
   * `immutable` package: unlike Sass the index of the first element is 0, but
   * like Sass negative numbers index from the end of the list.
   */
  get(index: number): Value | undefined;

  /**
   * Throws if `this` isn't a {@link SassBoolean}.
   *
   * **Heads up!** Functions should generally use {@link isTruthy} rather than
   * requiring a literal boolean.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertBoolean(name?: string): SassBoolean;

  /**
   * Throws if `this` isn't a {@link SassCalculation}.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertCalculation(name?: string): SassCalculation;

  /**
   * Throws if `this` isn't a {@link SassColor}.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertColor(name?: string): SassColor;

  /**
   * Throws if `this` isn't a {@link SassFunction}.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertFunction(name?: string): SassFunction;

  /**
   * Throws if `this` isn't a {@link SassMap}.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertMap(name?: string): SassMap;

  /**
   * Throws if `this` isn't a {@link SassMixin}.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertMixin(name?: string): SassMixin;

  /**
   * Throws if `this` isn't a {@link SassNumber}.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertNumber(name?: string): SassNumber;

  /**
   * Throws if `this` isn't a {@link SassString}.
   *
   * @param name - The name of the function argument `this` came from (without
   * the `$`) if it came from an argument. Used for error reporting.
   */
  assertString(name?: string): SassString;

  /**
   * Returns `this` as a map if it counts as one (empty lists count as empty
   * maps) or `null` if it doesn't.
   */
  tryMap(): SassMap | null;

  /** Returns whether `this` represents the same value as `other`. */
  equals(other: Value): boolean;

  /** Returns a hash code that can be used to store `this` in a hash map. */
  hashCode(): number;

  /** @hidden */
  toString(): string;
}

/**
 * Syntaxes supported by Sass:
 *
 * - `'scss'` is the [SCSS
 *   syntax](https://sass-lang.com/documentation/syntax#scss).
 * - `'indented'` is the [indented
 *   syntax](https://sass-lang.com/documentation/syntax#the-indented-syntax)
 * - `'css'` is plain CSS, which is parsed like SCSS but forbids the use of any
 *   special Sass features.
 *
 * @category Options
 */
type Syntax = 'scss' | 'indented' | 'css';

/**
 * Possible output styles for the compiled CSS:
 *
 * - `"expanded"` (the default for Dart Sass) writes each selector and
 *   declaration on its own line.
 *
 * - `"compressed"` removes as many extra characters as possible, and writes
 *   the entire stylesheet on a single line.
 *
 * @category Options
 */
type OutputStyle = 'expanded' | 'compressed';

/**
 * A callback that implements a custom Sass function. This can be passed to
 * {@link Options.functions}.
 *
 * ```js
 * const result = sass.compile('style.scss', {
 *   functions: {
 *     "sum($arg1, $arg2)": (args) => {
 *       const arg1 = args[0].assertNumber('arg1');
 *       const value1 = arg1.value;
 *       const value2 = args[1].assertNumber('arg2')
 *           .convertValueToMatch(arg1, 'arg2', 'arg1');
 *       return new sass.SassNumber(value1 + value2).coerceToMatch(arg1);
 *     }
 *   }
 * });
 * ```
 *
 * @typeParam sync - A `CustomFunction<'sync'>` must return synchronously, but
 * in return it can be passed to {@link compile} and {@link compileString} in
 * addition to {@link compileAsync} and {@link compileStringAsync}.
 *
 * A `CustomFunction<'async'>` may either return synchronously or
 * asynchronously, but it can only be used with {@link compileAsync} and {@link
 * compileStringAsync}.
 *
 * @param args - An array of arguments passed by the function's caller. If the
 * function takes [arbitrary
 * arguments](https://sass-lang.com/documentation/at-rules/function#taking-arbitrary-arguments),
 * the last element will be a {@link SassArgumentList}.
 *
 * @returns The function's result. This may be in the form of a `Promise`, but
 * if it is the function may only be passed to {@link compileAsync} and {@link
 * compileStringAsync}, not {@link compile} or {@link compileString}.
 *
 * @throws any - This function may throw an error, which the Sass compiler will
 * treat as the function call failing. If the exception object has a `message`
 * property, it will be used as the wrapped exception's message; otherwise, the
 * exception object's `toString()` will be used. This means it's safe for custom
 * functions to throw plain strings.
 *
 * @category Custom Function
 */
type CustomFunction<sync extends 'sync' | 'async'> = (
  args: Value[]
) => PromiseOr<Value, sync>;

/**
 * Options that can be passed to {@link compile}, {@link compileAsync}, {@link
 * compileString}, or {@link compileStringAsync}.
 *
 * @typeParam sync - This lets the TypeScript checker verify that asynchronous
 * {@link Importer}s, {@link FileImporter}s, and {@link CustomFunction}s aren't
 * passed to {@link compile} or {@link compileString}.
 *
 * @category Options
 */
interface Options<sync extends 'sync' | 'async'> {
  /**
   * If this is `true`, the compiler will exclusively use ASCII characters in
   * its error and warning messages. Otherwise, it may use non-ASCII Unicode
   * characters as well.
   *
   * @defaultValue `false`
   * @category Messages
   */
  alertAscii?: boolean;

  /**
   * If this is `true`, the compiler will use ANSI color escape codes in its
   * error and warning messages. If it's `false`, it won't use these. If it's
   * undefined, the compiler will determine whether or not to use colors
   * depending on whether the user is using an interactive terminal.
   *
   * @category Messages
   */
  alertColor?: boolean;

  /**
   * If `true`, the compiler may prepend `@charset "UTF-8";` or U+FEFF
   * (byte-order marker) if it outputs non-ASCII CSS.
   *
   * If `false`, the compiler never emits these byte sequences. This is ideal
   * when concatenating or embedding in HTML `<style>` tags. (The output will
   * still be UTF-8.)
   *
   * @defaultValue `true`
   * @category Output
   * @compatibility dart: "1.54.0", node: false
   */
  charset?: boolean;

  /**
   * A set of deprecations to treat as fatal.
   *
   * If a deprecation warning of any provided type is encountered during
   * compilation, the compiler will error instead.
   *
   * If a `Version` is provided, then all deprecations that were active in that
   * compiler version will be treated as fatal.
   *
   * @category Messages
   * @compatiblity dart: "1.74.0", node: false
   */
  fatalDeprecations?: (DeprecationOrId | Version)[];

  /**
   * Additional built-in Sass functions that are available in all stylesheets.
   * This option takes an object whose keys are Sass function signatures like
   * you'd write for the [`@function
   * rule`](https://sass-lang.com/documentation/at-rules/function) and whose
   * values are {@link CustomFunction}s.
   *
   * Functions are passed subclasses of {@link Value}, and must return the same.
   * If the return value includes {@link SassCalculation}s they will be
   * simplified before being returned.
   *
   * When writing custom functions, it's important to make them as user-friendly
   * and as close to the standards set by Sass's core functions as possible. Some
   * good guidelines to follow include:
   *
   * * Use `Value.assert*` methods, like {@link Value.assertString}, to cast
   *   untyped `Value` objects to more specific types. For values that were
   *   passed directly as arguments, pass in the argument name as well. This
   *   ensures that the user gets good error messages when they pass in the
   *   wrong type to your function.
   *
   * * Individual classes may have more specific `assert*` methods, like {@link
   *   SassNumber.assertInt}, which should be used when possible.
   *
   * * In Sass, every value counts as a list. Rather than trying to detect the
   *   {@link SassList} type, you should use {@link Value.asList} to treat all
   *   values as lists.
   *
   * * When manipulating values like lists, strings, and numbers that have
   *   metadata (comma versus space separated, bracketed versus unbracketed,
   *   quoted versus unquoted, units), the output metadata should match the
   *   input metadata.
   *
   * * When in doubt, lists should default to comma-separated, strings should
   *   default to quoted, and numbers should default to unitless.
   *
   * * In Sass, lists and strings use one-based indexing and use negative
   *   indices to index from the end of value. Functions should follow these
   *   conventions. {@link Value.sassIndexToListIndex} and {@link
   *   SassString.sassIndexToStringIndex} can be used to do this automatically.
   *
   * * String indexes in Sass refer to Unicode code points while JavaScript
   *   string indices refer to UTF-16 code units. For example, the character
   *   U+1F60A SMILING FACE WITH SMILING EYES is a single Unicode code point but
   *   is represented in UTF-16 as two code units (`0xD83D` and `0xDE0A`). So in
   *   JavaScript, `"a😊b".charCodeAt(1)` returns `0xD83D`, whereas in Sass
   *   `str-slice("a😊b", 1, 1)` returns `"😊"`. Functions should follow Sass's
   *   convention. {@link SassString.sassIndexToStringIndex} can be used to do
   *   this automatically, and the {@link SassString.sassLength} getter can be
   *   used to access a string's length in code points.
   *
   * @example
   *
   * ```js
   * sass.compileString(`
   * h1 {
   *   font-size: pow(2, 5) * 1px;
   * }`, {
   *   functions: {
   *     // Note: in real code, you should use `math.pow()` from the built-in
   *     // `sass:math` module.
   *     'pow($base, $exponent)': function(args) {
   *       const base = args[0].assertNumber('base').assertNoUnits('base');
   *       const exponent =
   *           args[1].assertNumber('exponent').assertNoUnits('exponent');
   *
   *       return new sass.SassNumber(Math.pow(base.value, exponent.value));
   *     }
   *   }
   * });
   * ```
   *
   * @category Plugins
   */
  functions?: Record<string, CustomFunction<sync>>;

  /**
   * A set of future deprecations to opt into early.
   *
   * Future deprecations passed here will be treated as active by the compiler,
   * emitting warnings as necessary.
   *
   * @category Messages
   * @compatiblity dart: "1.74.0", node: false
   */
  futureDeprecations?: DeprecationOrId[];

  /**
   * Custom importers that control how Sass resolves loads from rules like
   * [`@use`](https://sass-lang.com/documentation/at-rules/use) and
   * [`@import`](https://sass-lang.com/documentation/at-rules/import).
   *
   * Loads are resolved by trying, in order:
   *
   * - The importer that was used to load the current stylesheet, with the
   *   loaded URL resolved relative to the current stylesheet's canonical URL.
   *
   * - Each {@link Importer}, {@link FileImporter}, or
   *   {@link NodePackageImporter} in {@link importers}, in order.
   *
   * - Each load path in {@link loadPaths}, in order.
   *
   * If none of these return a Sass file, the load fails and Sass throws an
   * error.
   *
   * @category Plugins
   */
  importers?: (Importer<sync> | FileImporter<sync> | NodePackageImporter)[];

  /**
   * Paths in which to look for stylesheets loaded by rules like
   * [`@use`](https://sass-lang.com/documentation/at-rules/use) and
   * [`@import`](https://sass-lang.com/documentation/at-rules/import).
   *
   * A load path `loadPath` is equivalent to the following {@link FileImporter}:
   *
   * ```js
   * {
   *   findFileUrl(url) {
   *     // Load paths only support relative URLs.
   *     if (/^[a-z]+:/i.test(url)) return null;
   *     return new URL(url, pathToFileURL(loadPath));
   *   }
   * }
   * ```
   *
   * @category Input
   */
  loadPaths?: string[];

  /**
   * An object to use to handle warnings and/or debug messages from Sass.
   *
   * By default, Sass emits warnings and debug messages to standard error, but
   * if {@link Logger.warn} or {@link Logger.debug} is set, this will invoke
   * them instead.
   *
   * The special value {@link Logger.silent} can be used to easily silence all
   * messages.
   *
   * @category Messages
   */
  logger?: Logger;

  /**
   * If this option is set to `true`, Sass won’t print warnings that are caused
   * by dependencies. A “dependency” is defined as any file that’s loaded
   * through {@link loadPaths} or {@link importers}. Stylesheets that are
   * imported relative to the entrypoint are not considered dependencies.
   *
   * This is useful for silencing deprecation warnings that you can’t fix on
   * your own. However, please <em>also</em> notify your dependencies of the deprecations
   * so that they can get fixed as soon as possible!
   *
   * **Heads up!** If {@link compileString} or {@link compileStringAsync} is
   * called without {@link StringOptions.url}, <em>all</em> stylesheets it loads
   * will be considered dependencies. Since it doesn’t have a path of its own,
   * everything it loads is coming from a load path rather than a relative
   * import.
   *
   * @defaultValue `false`
   * @category Messages
   */
  quietDeps?: boolean;

  /**
   * A set of active deprecations to ignore.
   *
   * If a deprecation warning of any provided type is encountered during
   * compilation, the compiler will ignore it instead.
   *
   * **Heads up!** The deprecated functionality you're depending on will
   * eventually break.
   *
   * @category Messages
   * @compatiblity dart: "1.74.0", node: false
   */
  silenceDeprecations?: DeprecationOrId[];

  /**
   * Whether or not Sass should generate a source map. If it does, the source
   * map will be available as {@link CompileResult.sourceMap}.
   *
   * **Heads up!** Sass doesn't automatically add a `sourceMappingURL` comment
   * to the generated CSS. It's up to callers to do that, since callers have
   * full knowledge of where the CSS and the source map will exist in relation
   * to one another and how they'll be served to the browser.
   *
   * @defaultValue `false`
   * @category Output
   */
  sourceMap?: boolean;

  /**
   * Whether Sass should include the sources in the generated source map.
   *
   * This option has no effect if {@link sourceMap} is `false`.
   *
   * @defaultValue `false`
   * @category Output
   */
  sourceMapIncludeSources?: boolean;

  /**
   * The {@link OutputStyle} of the compiled CSS.
   *
   * @example
   *
   * ```js
   * const source = `
   * h1 {
   *   font-size: 40px;
   *   code {
   *     font-face: Roboto Mono;
   *   }
   * }`;
   *
   * let result = sass.compileString(source, {style: "expanded"});
   * console.log(result.css.toString());
   * // h1 {
   * //   font-size: 40px;
   * // }
   * // h1 code {
   * //   font-face: Roboto Mono;
   * // }
   *
   * result = sass.compileString(source, {style: "compressed"})
   * console.log(result.css.toString());
   * // h1{font-size:40px}h1 code{font-face:Roboto Mono}
   * ```
   *
   * @category Output
   */
  style?: OutputStyle;

  /**
   * By default, Dart Sass will print only five instances of the same
   * deprecation warning per compilation to avoid deluging users in console
   * noise. If you set `verbose` to `true`, it will instead print every
   * deprecation warning it encounters.
   *
   * @defaultValue `false`
   * @category Messages
   */
  verbose?: boolean;
}

/**
 * The value of `this` in the context of a {@link LegacyImporter} or {@link
 * LegacyFunction} callback.
 *
 * @category Legacy
 * @deprecated This is only used by the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link compile}, {@link compileString}, {@link
 * compileAsync}, and {@link compileStringAsync} instead.
 */
interface LegacyPluginThis {
  /**
   * A partial representation of the options passed to {@link render} or {@link
   * renderSync}.
   */
  options: {
    /** The same {@link LegacyPluginThis} instance that contains this object. */
    context: LegacyPluginThis;

    /**
     * The value passed to {@link LegacyFileOptions.file} or {@link
     * LegacyStringOptions.file}.
     */
    file?: string;

    /** The value passed to {@link LegacyStringOptions.data}. */
    data?: string;

    /**
     * The value passed to {@link LegacySharedOptions.includePaths} separated by
     * `";"` on Windows or `":"` on other operating systems. This always
     * includes the current working directory as the first entry.
     */
    includePaths: string;

    /** Always the number 10. */
    precision: 10;

    /** Always the number 1. */
    style: 1;

    /** 1 if {@link LegacySharedOptions.indentType} was `"tab"`, 0 otherwise. */
    indentType: 1 | 0;

    /**
     * The value passed to {@link LegacySharedOptions.indentWidth}, or `2`
     * otherwise.
     */
    indentWidth: number;

    /**
     * The value passed to {@link LegacySharedOptions.linefeed}, or `"\n"`
     * otherwise.
     */
    linefeed: '\r' | '\r\n' | '\n' | '\n\r';

    /** A partially-constructed {@link LegacyResult} object. */
    result: {
      /** Partial information about the compilation in progress. */
      stats: {
        /**
         * The number of milliseconds between 1 January 1970 at 00:00:00 UTC and
         * the time at which Sass compilation began.
         */
        start: number;

        /**
         * {@link LegacyFileOptions.file} if it was passed, otherwise the string
         * `"data"`.
         */
        entry: string;
      };
    };
  };
}

/**
 * The value of `this` in the context of a {@link LegacyImporter} function.
 *
 * @category Legacy
 * @deprecated This is only used by the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link Importer} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
interface LegacyImporterThis extends LegacyPluginThis {
  /**
   * Whether the importer is being invoked because of a Sass `@import` rule, as
   * opposed to a `@use` or `@forward` rule.
   *
   * This should *only* be used for determining whether or not to load
   * [import-only files](https://sass-lang.com/documentation/at-rules/import#import-only-files).
   *
   * @compatibility dart: "1.33.0", node: false
   */
  fromImport: boolean;
}

/**
 * The result of running a {@link LegacyImporter}. It must be one of the
 * following types:
 *
 * * An object with the key `contents` whose value is the contents of a stylesheet
 *   (in SCSS syntax). This causes Sass to load that stylesheet’s contents.
 *
 * * An object with the key `file` whose value is a path on disk. This causes Sass
 *   to load that file as though it had been imported directly.
 *
 * * `null`, which indicates that it doesn’t recognize the URL and another
 *   importer should be tried instead.
 *
 * * An [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
 *   object, indicating that importing failed.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link ImporterResult} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacyImporterResult =
  | {file: string}
  | {contents: string}
  | Error
  | null;

/**
 * A synchronous callback that implements custom Sass loading logic for
 * [`@import` rules](https://sass-lang.com/documentation/at-rules/import) and
 * [`@use` rules](https://sass-lang.com/documentation/at-rules/use). This can be
 * passed to {@link LegacySharedOptions.importer} for either {@link render} or
 * {@link renderSync}.
 *
 * See {@link LegacySharedOptions.importer} for more detailed documentation.
 *
 * ```js
 * sass.renderSync({
 *   file: "style.scss",
 *   importer: [
 *     function(url, prev) {
 *       if (url != "big-headers") return null;
 *
 *       return {
 *         contents: 'h1 { font-size: 40px; }'
 *       };
 *     }
 *   ]
 * });
 * ```
 *
 * @param url - The `@use` or `@import` rule’s URL as a string, exactly as it
 * appears in the stylesheet.
 *
 * @param prev - A string identifying the stylesheet that contained the `@use`
 * or `@import`. This string’s format depends on how that stylesheet was loaded:
 *
 * * If the stylesheet was loaded from the filesystem, it’s the absolute path of
 *   its file.
 * * If the stylesheet was loaded from an importer that returned its contents,
 *   it’s the URL of the `@use` or `@import` rule that loaded it.
 * * If the stylesheet came from the data option, it’s the string "stdin".
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link Importer} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacySyncImporter = (
  this: LegacyImporterThis,
  url: string,
  prev: string
) => LegacyImporterResult;

/**
 * An asynchronous callback that implements custom Sass loading logic for
 * [`@import` rules](https://sass-lang.com/documentation/at-rules/import) and
 * [`@use` rules](https://sass-lang.com/documentation/at-rules/use). This can be
 * passed to {@link LegacySharedOptions.importer} for either {@link render} or
 * {@link renderSync}.
 *
 * An asynchronous importer must return `undefined`, and then call `done` with
 * the result of its {@link LegacyImporterResult} once it's done running.
 *
 * See {@link LegacySharedOptions.importer} for more detailed documentation.
 *
 * ```js
 * sass.render({
 *   file: "style.scss",
 *   importer: [
 *     function(url, prev, done) {
 *       if (url != "big-headers") done(null);
 *
 *       done({
 *         contents: 'h1 { font-size: 40px; }'
 *       });
 *     }
 *   ]
 * });
 * ```
 *
 * @param url - The `@use` or `@import` rule’s URL as a string, exactly as it
 * appears in the stylesheet.
 *
 * @param prev - A string identifying the stylesheet that contained the `@use`
 * or `@import`. This string’s format depends on how that stylesheet was loaded:
 *
 * * If the stylesheet was loaded from the filesystem, it’s the absolute path of
 *   its file.
 * * If the stylesheet was loaded from an importer that returned its contents,
 *   it’s the URL of the `@use` or `@import` rule that loaded it.
 * * If the stylesheet came from the data option, it’s the string "stdin".
 *
 * @param done - The callback to call once the importer has finished running.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link Importer} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacyAsyncImporter = (
  this: LegacyImporterThis,
  url: string,
  prev: string,
  done: (result: LegacyImporterResult) => void
) => void;

/**
 * A callback that implements custom Sass loading logic for [`@import`
 * rules](https://sass-lang.com/documentation/at-rules/import) and [`@use`
 * rules](https://sass-lang.com/documentation/at-rules/use). For {@link
 * renderSync}, this must be a {@link LegacySyncImporter} which returns its
 * result directly; for {@link render}, it may be either a {@link
 * LegacySyncImporter} or a {@link LegacyAsyncImporter} which calls a callback
 * with its result.
 *
 * See {@link LegacySharedOptions.importer} for more details.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link Importer} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacyImporter<sync = 'sync' | 'async'> = sync extends 'async'
  ? LegacySyncImporter | LegacyAsyncImporter
  : LegacySyncImporter;

/**
 * A synchronous callback that implements a custom Sass function. This can be
 * passed to {@link LegacySharedOptions.functions} for either {@link render} or
 * {@link renderSync}.
 *
 * If this throws an error, Sass will treat that as the function failing with
 * that error message.
 *
 * ```js
 * const result = sass.renderSync({
 *   file: 'style.scss',
 *   functions: {
 *     "sum($arg1, $arg2)": (arg1, arg2) => {
 *       if (!(arg1 instanceof sass.types.Number)) {
 *         throw new Error("$arg1: Expected a number");
 *       } else if (!(arg2 instanceof sass.types.Number)) {
 *         throw new Error("$arg2: Expected a number");
 *       }
 *       return new sass.types.Number(arg1.getValue() + arg2.getValue());
 *     }
 *   }
 * });
 * ```
 *
 * @param args - One argument for each argument that's declared in the signature
 * that's passed to {@link LegacySharedOptions.functions}. If the signature
 * [takes arbitrary
 * arguments](https://sass-lang.com/documentation/at-rules/function#taking-arbitrary-arguments),
 * they're passed as a single argument list in the last argument.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link CustomFunction} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacySyncFunction = (
  this: LegacyPluginThis,
  ...args: LegacyValue[]
) => LegacyValue;

/**
 * An asynchronous callback that implements a custom Sass function. This can be
 * passed to {@link LegacySharedOptions.functions}, but only for {@link render}.
 *
 * An asynchronous function must return `undefined`. Its final argument will
 * always be a callback, which it should call with the result of the function
 * once it's done running.
 *
 * If this throws an error, Sass will treat that as the function failing with
 * that error message.
 *
 * ```js
 * sass.render({
 *   file: 'style.scss',
 *   functions: {
 *     "sum($arg1, $arg2)": (arg1, arg2, done) => {
 *       if (!(arg1 instanceof sass.types.Number)) {
 *         throw new Error("$arg1: Expected a number");
 *       } else if (!(arg2 instanceof sass.types.Number)) {
 *         throw new Error("$arg2: Expected a number");
 *       }
 *       done(new sass.types.Number(arg1.getValue() + arg2.getValue()));
 *     }
 *   }
 * }, (result, error) => {
 *   // ...
 * });
 * ```
 *
 * This is passed one argument for each argument that's declared in the
 * signature that's passed to {@link LegacySharedOptions.functions}. If the
 * signature [takes arbitrary
 * arguments](https://sass-lang.com/documentation/at-rules/function#taking-arbitrary-arguments),
 * they're passed as a single argument list in the last argument before the
 * callback.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link CustomFunction} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacyAsyncFunction =
  | ((this: LegacyPluginThis, done: (result: LegacyValue) => void) => void)
  | ((
      this: LegacyPluginThis,
      arg1: LegacyValue,
      done: LegacyAsyncFunctionDone
    ) => void)
  | ((
      this: LegacyPluginThis,
      arg1: LegacyValue,
      arg2: LegacyValue,
      done: LegacyAsyncFunctionDone
    ) => void)
  | ((
      this: LegacyPluginThis,
      arg1: LegacyValue,
      arg2: LegacyValue,
      arg3: LegacyValue,
      done: LegacyAsyncFunctionDone
    ) => void)
  | ((
      this: LegacyPluginThis,
      arg1: LegacyValue,
      arg2: LegacyValue,
      arg3: LegacyValue,
      arg4: LegacyValue,
      done: LegacyAsyncFunctionDone
    ) => void)
  | ((
      this: LegacyPluginThis,
      arg1: LegacyValue,
      arg2: LegacyValue,
      arg3: LegacyValue,
      arg4: LegacyValue,
      arg5: LegacyValue,
      done: LegacyAsyncFunctionDone
    ) => void)
  | ((
      this: LegacyPluginThis,
      arg1: LegacyValue,
      arg2: LegacyValue,
      arg3: LegacyValue,
      arg4: LegacyValue,
      arg5: LegacyValue,
      arg6: LegacyValue,
      done: LegacyAsyncFunctionDone
    ) => void)
  | ((
      this: LegacyPluginThis,
      ...args: [...LegacyValue[], LegacyAsyncFunctionDone]
    ) => void);

/**
 * The function called by a {@link LegacyAsyncFunction} to indicate that it's
 * finished.
 *
 * @param result - If this is a {@link LegacyValue}, that indicates that the
 * function call completed successfully. If it's a {@link types.Error}, that
 * indicates that the function call failed.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link CustomFunction} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacyAsyncFunctionDone = (
  result: LegacyValue | types.Error
) => void;

/**
 * A callback that implements a custom Sass function. For {@link renderSync},
 * this must be a {@link LegacySyncFunction} which returns its result directly;
 * for {@link render}, it may be either a {@link LegacySyncFunction} or a {@link
 * LegacyAsyncFunction} which calls a callback with its result.
 *
 * See {@link LegacySharedOptions.functions} for more details.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link CustomFunction} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacyFunction<sync extends 'sync' | 'async'> = sync extends 'async'
  ? LegacySyncFunction | LegacyAsyncFunction
  : LegacySyncFunction;

/**
 * A type representing all the possible values that may be passed to or returned
 * from a {@link LegacyFunction}.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link Value} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacyValue =
  | types.Null
  | types.Number
  | types.String
  | types.Boolean
  | types.Color
  | types.List
  | types.Map;

/**
 * The namespace for value types used in the legacy function API.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link Value} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
declare namespace types {
  /**
   * The class for Sass's singleton [`null`
   * value](https://sass-lang.com/documentation/values/null). The value itself
   * can be accessed through the {@link NULL} field.
   */
  export class Null {
    /** Sass's singleton `null` value. */
    static readonly NULL: Null;
  }

  /**
   * Sass's [number type](https://sass-lang.com/documentation/values/numbers).
   */
  export class Number {
    /**
     * @param value - The numeric value of the number.
     *
     * @param unit - If passed, the number's unit.
     *
     * Complex units can be represented as
     * `<unit>*<unit>*.../<unit>*<unit>*...`, with numerator units on the
     * left-hand side of the `/` and denominator units on the right. A number
     * with only numerator units may omit the `/` and the units after it, and a
     * number with only denominator units may be represented
     * with no units before the `/`.
     *
     * @example
     *
     * ```scss
     * new sass.types.Number(0.5); // == 0.5
     * new sass.types.Number(10, "px"); // == 10px
     * new sass.types.Number(10, "px*px"); // == 10px * 1px
     * new sass.types.Number(10, "px/s"); // == math.div(10px, 1s)
     * new sass.types.Number(10, "px*px/s*s"); // == 10px * math.div(math.div(1px, 1s), 1s)
     * ```
     */
    constructor(value: number, unit?: string);

    /**
     * Returns the value of the number, ignoring units.
     *
     * **Heads up!** This means that `96px` and `1in` will return different
     * values, even though they represent the same length.
     *
     * @example
     *
     * ```js
     * const number = new sass.types.Number(10, "px");
     * number.getValue(); // 10
     * ```
     */
    getValue(): number;

    /**
     * Destructively modifies this number by setting its numeric value to
     * `value`, independent of its units.
     *
     * @deprecated Use {@link constructor} instead.
     */
    setValue(value: number): void;

    /**
     * Returns a string representation of this number's units. Complex units are
     * returned in the same format that {@link constructor} accepts them.
     *
     * @example
     *
     * ```js
     * // number is `10px`.
     * number.getUnit(); // "px"
     *
     * // number is `math.div(10px, 1s)`.
     * number.getUnit(); // "px/s"
     * ```
     */
    getUnit(): string;

    /**
     * Destructively modifies this number by setting its units to `unit`,
     * independent of its numeric value. Complex units are specified in the same
     * format as {@link constructor}.
     *
     * @deprecated Use {@link constructor} instead.
     */
    setUnit(unit: string): void;
  }

  /**
   * Sass's [string type](https://sass-lang.com/documentation/values/strings).
   *
   * **Heads up!** This API currently provides no way of distinguishing between
   * a [quoted](https://sass-lang.com/documentation/values/strings#quoted) and
   * [unquoted](https://sass-lang.com/documentation/values/strings#unquoted)
   * string.
   */
  export class String {
    /**
     * Creates an unquoted string with the given contents.
     *
     * **Heads up!** This API currently provides no way of creating a
     * [quoted](https://sass-lang.com/documentation/values/strings#quoted)
     * string.
     */
    constructor(value: string);

    /**
     * Returns the contents of the string. If the string contains escapes,
     * those escapes are included literally if it’s
     * [unquoted](https://sass-lang.com/documentation/values/strings#unquoted),
     * while the values of the escapes are included if it’s
     * [quoted](https://sass-lang.com/documentation/values/strings#quoted).
     *
     * @example
     *
     * ```
     * // string is `Arial`.
     * string.getValue(); // "Arial"
     *
     * // string is `"Helvetica Neue"`.
     * string.getValue(); // "Helvetica Neue"
     *
     * // string is `\1F46D`.
     * string.getValue(); // "\\1F46D"
     *
     * // string is `"\1F46D"`.
     * string.getValue(); // "👭"
     * ```
     */
    getValue(): string;

    /**
     * Destructively modifies this string by setting its numeric value to
     * `value`.
     *
     * **Heads up!** Even if the string was originally quoted, this will cause
     * it to become unquoted.
     *
     * @deprecated Use {@link constructor} instead.
     */
    setValue(value: string): void;
  }

  /**
   * Sass's [boolean type](https://sass-lang.com/documentation/values/booleans).
   *
   * Custom functions should respect Sass’s notion of
   * [truthiness](https://sass-lang.com/documentation/at-rules/control/if#truthiness-and-falsiness)
   * by treating `false` and `null` as falsey and everything else as truthy.
   *
   * **Heads up!** Boolean values can't be constructed, they can only be
   * accessed through the {@link TRUE} and {@link FALSE} constants.
   */
  export class Boolean<T extends boolean = boolean> {
    /**
     * Returns `true` if this is Sass's `true` value and `false` if this is
     * Sass's `false` value.
     *
     * @example
     *
     * ```js
     * // boolean is `true`.
     * boolean.getValue(); // true
     * boolean === sass.types.Boolean.TRUE; // true
     *
     * // boolean is `false`.
     * boolean.getValue(); // false
     * boolean === sass.types.Boolean.FALSE; // true
     * ```
     */
    getValue(): T;

    /** Sass's `true` value. */
    static readonly TRUE: Boolean<true>;

    /** Sass's `false` value. */
    static readonly FALSE: Boolean<false>;
  }

  /**
   * Sass's [color type](https://sass-lang.com/documentation/values/colors).
   */
  export class Color {
    /**
     * Creates a new Sass color with the given red, green, blue, and alpha
     * channels. The red, green, and blue channels must be integers between 0
     * and 255 (inclusive), and alpha must be between 0 and 1 (inclusive).
     *
     * @example
     *
     * ```js
     * new sass.types.Color(107, 113, 127); // #6b717f
     * new sass.types.Color(0, 0, 0, 0); // rgba(0, 0, 0, 0)
     * ```
     */
    constructor(r: number, g: number, b: number, a?: number);

    /**
     * Creates a new Sass color with alpha, red, green, and blue channels taken
     * from respective two-byte chunks of a hexidecimal number.
     *
     * @example
     *
     * ```js
     * new sass.types.Color(0xff6b717f); // #6b717f
     * new sass.types.Color(0x00000000); // rgba(0, 0, 0, 0)
     * ```
     */
    constructor(argb: number);

    /**
     * Returns the red channel of the color as an integer from 0 to 255.
     *
     * @example
     *
     * ```js
     * // color is `#6b717f`.
     * color.getR(); // 107
     *
     * // color is `#b37399`.
     * color.getR(); // 179
     * ```
     */
    getR(): number;

    /**
     * Sets the red channel of the color. The value must be an integer between 0
     * and 255 (inclusive).
     *
     * @deprecated Use {@link constructor} instead.
     */
    setR(value: number): void;

    /**
     * Returns the green channel of the color as an integer from 0 to 255.
     *
     * @example
     *
     * ```js
     * // color is `#6b717f`.
     * color.getG(); // 113
     *
     * // color is `#b37399`.
     * color.getG(); // 115
     * ```
     */
    getG(): number;

    /**
     * Sets the green channel of the color. The value must be an integer between
     * 0 and 255 (inclusive).
     *
     * @deprecated Use {@link constructor} instead.
     */
    setG(value: number): void;

    /**
     * Returns the blue channel of the color as an integer from 0 to 255.
     *
     * @example
     *
     * ```js
     * // color is `#6b717f`.
     * color.getB(); // 127
     *
     * // color is `#b37399`.
     * color.getB(); // 153
     * ```
     */
    getB(): number;

    /**
     * Sets the blue channel of the color. The value must be an integer between
     * 0 and 255 (inclusive).
     *
     * @deprecated Use {@link constructor} instead.
     */
    setB(value: number): void;

    /**
     * Returns the alpha channel of the color as a number from 0 to 1.
     *
     * @example
     *
     * ```js
     * // color is `#6b717f`.
     * color.getA(); // 1
     *
     * // color is `transparent`.
     * color.getA(); // 0
     * ```
     */
    getA(): number;

    /**
     * Sets the alpha channel of the color. The value must be between 0 and 1
     * (inclusive).
     *
     * @deprecated Use {@link constructor} instead.
     */
    setA(value: number): void;
  }

  /**
   * Sass's [list type](https://sass-lang.com/documentation/values/lists).
   *
   * **Heads up!** This list type’s methods use 0-based indexing, even though
   * within Sass lists use 1-based indexing. These methods also don’t support
   * using negative numbers to index backwards from the end of the list.
   */
  export class List {
    /**
     * Creates a new Sass list.
     *
     * **Heads up!** The initial values of the list elements are undefined.
     * These elements must be set using {@link setValue} before accessing them
     * or passing the list back to Sass.
     *
     * @example
     *
     * ```js
     * const list = new sass.types.List(3);
     * list.setValue(0, new sass.types.Number(10, "px"));
     * list.setValue(1, new sass.types.Number(15, "px"));
     * list.setValue(2, new sass.types.Number(32, "px"));
     * list; // 10px, 15px, 32px
     * ```
     *
     * @param length - The number of (initially undefined) elements in the list.
     * @param commaSeparator - If `true`, the list is comma-separated; otherwise,
     * it's space-separated. Defaults to `true`.
     */
    constructor(length: number, commaSeparator?: boolean);

    /**
     * Returns the element at `index`, or `undefined` if that value hasn't yet
     * been set.
     *
     * @example
     *
     * ```js
     * // list is `10px, 15px, 32px`
     * list.getValue(0); // 10px
     * list.getValue(2); // 32px
     * ```
     *
     * @param index - A (0-based) index into this list.
     * @throws `Error` if `index` is less than 0 or greater than or equal to the
     * number of elements in this list.
     */
    getValue(index: number): LegacyValue | undefined;

    /**
     * Sets the element at `index` to `value`.
     *
     * @example
     *
     * ```js
     * // list is `10px, 15px, 32px`
     * list.setValue(1, new sass.types.Number(18, "px"));
     * list; // 10px, 18px, 32px
     * ```
     *
     * @param index - A (0-based) index into this list.
     * @throws `Error` if `index` is less than 0 or greater than or equal to the
     * number of elements in this list.
     */
    setValue(index: number, value: LegacyValue): void;

    /**
     * Returns `true` if this list is comma-separated and `false` otherwise.
     *
     * @example
     *
     * ```js
     * // list is `10px, 15px, 32px`
     * list.getSeparator(); // true
     *
     * // list is `1px solid`
     * list.getSeparator(); // false
     * ```
     */
    getSeparator(): boolean;

    /**
     * Sets whether the list is comma-separated.
     *
     * @param isComma - `true` to make the list comma-separated, `false` otherwise.
     */
    setSeparator(isComma: boolean): void;

    /**
     * Returns the number of elements in the list.
     *
     * @example
     *
     * ```js
     * // list is `10px, 15px, 32px`
     * list.getLength(); // 3
     *
     * // list is `1px solid`
     * list.getLength(); // 2
     * ```
     */
    getLength(): number;
  }

  /**
   * Sass's [map type](https://sass-lang.com/documentation/values/maps).
   *
   * **Heads up!** This map type is represented as a list of key-value pairs
   * rather than a mapping from keys to values. The only way to find the value
   * associated with a given key is to iterate through the map checking for that
   * key. Maps created through this API are still forbidden from having duplicate
   * keys.
   */
  export class Map {
    /**
     * Creates a new Sass map.
     *
     * **Heads up!** The initial keys and values of the map are undefined. They
     * must be set using {@link setKey} and {@link setValue} before accessing
     * them or passing the map back to Sass.
     *
     * @example
     *
     * ```js
     * const map = new sass.types.Map(2);
     * map.setKey(0, new sass.types.String("width"));
     * map.setValue(0, new sass.types.Number(300, "px"));
     * map.setKey(1, new sass.types.String("height"));
     * map.setValue(1, new sass.types.Number(100, "px"));
     * map; // (width: 300px, height: 100px)
     * ```
     *
     * @param length - The number of (initially undefined) key/value pairs in the map.
     */
    constructor(length: number);

    /**
     * Returns the value in the key/value pair at `index`.
     *
     * @example
     *
     * ```js
     * // map is `(width: 300px, height: 100px)`
     * map.getValue(0); // 300px
     * map.getValue(1); // 100px
     * ```
     *
     * @param index -  A (0-based) index of a key/value pair in this map.
     * @throws `Error` if `index` is less than 0 or greater than or equal to the
     * number of pairs in this map.
     */
    getValue(index: number): LegacyValue;

    /**
     * Sets the value in the key/value pair at `index` to `value`.
     *
     * @example
     *
     * ```js
     * // map is `("light": 200, "medium": 400, "bold": 600)`
     * map.setValue(1, new sass.types.Number(300));
     * map; // ("light": 200, "medium": 300, "bold": 600)
     * ```
     *
     * @param index -  A (0-based) index of a key/value pair in this map.
     * @throws `Error` if `index` is less than 0 or greater than or equal to the
     * number of pairs in this map.
     */
    setValue(index: number, value: LegacyValue): void;

    /**
     * Returns the key in the key/value pair at `index`.
     *
     * @example
     *
     * ```js
     * // map is `(width: 300px, height: 100px)`
     * map.getKey(0); // width
     * map.getKey(1); // height
     * ```
     *
     * @param index -  A (0-based) index of a key/value pair in this map.
     * @throws `Error` if `index` is less than 0 or greater than or equal to the
     * number of pairs in this map.
     */
    getKey(index: number): LegacyValue;

    /**
     * Sets the value in the key/value pair at `index` to `value`.
     *
     * @example
     *
     * ```js
     * // map is `("light": 200, "medium": 400, "bold": 600)`
     * map.setValue(1, new sass.types.String("lighter"));
     * map; // ("lighter": 200, "medium": 300, "bold": 600)
     * ```
     *
     * @param index -  A (0-based) index of a key/value pair in this map.
     * @throws `Error` if `index` is less than 0 or greater than or equal to the
     * number of pairs in this map.
     */
    setKey(index: number, key: LegacyValue): void;

    /**
     * Returns the number of key/value pairs in this map.
     *
     * @example
     *
     * ```js
     * // map is `("light": 200, "medium": 400, "bold": 600)`
     * map.getLength(); // 3
     *
     * // map is `(width: 300px, height: 100px)`
     * map.getLength(); // 2
     * ```
     */
    getLength(): number;
  }

  /**
   * An error that can be returned from a Sass function to signal that it
   * encountered an error. This is the only way to signal an error
   * asynchronously from a {@link LegacyAsyncFunction}.
   */
  export class Error {
    constructor(message: string);
  }
}

/**
 * Options for {@link render} and {@link renderSync} that are shared between
 * {@link LegacyFileOptions} and {@link LegacyStringOptions}.
 *
 * @typeParam sync - This lets the TypeScript checker verify that {@link
 * LegacyAsyncImporter}s and {@link LegacyAsyncFunction}s aren't passed to
 * {@link renderSync}.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link Options} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
interface LegacySharedOptions<sync extends 'sync' | 'async'> {
  /**
   * This array of strings option provides [load
   * paths](https://sass-lang.com/documentation/at-rules/import#load-paths) for
   * Sass to look for stylesheets. Earlier load paths will take precedence over
   * later ones.
   *
   * ```js
   * sass.renderSync({
   *   file: "style.scss",
   *   includePaths: ["node_modules/bootstrap/dist/css"]
   * });
   * ```
   *
   * Load paths are also loaded from the `SASS_PATH` environment variable, if
   * it’s set. This variable should be a list of paths separated by `;` (on
   * Windows) or `:` (on other operating systems). Load paths from the
   * `includePaths` option take precedence over load paths from `SASS_PATH`.
   *
   * ```sh
   * $ SASS_PATH=node_modules/bootstrap/dist/css sass style.scss style.css
   * ```
   *
   * @category Input
   * @compatibility feature: "SASS_PATH", dart: "1.15.0", node: "3.9.0"
   *
   * Earlier versions of Dart Sass and Node Sass didn’t support the `SASS_PATH`
   * environment variable.
   */
  includePaths?: string[];

  /**
   * Whether the generated CSS should use spaces or tabs for indentation.
   *
   * ```js
   * const result = sass.renderSync({
   *   file: "style.scss",
   *   indentType: "tab",
   *   indentWidth: 1
   * });
   *
   * result.css.toString();
   * // "h1 {\n\tfont-size: 40px;\n}\n"
   * ```
   *
   * @defaultValue `'space'`
   * @category Output
   * @compatibility dart: true, node: "3.0.0"
   */
  indentType?: 'space' | 'tab';

  /**
   * How many spaces or tabs (depending on {@link indentType}) should be used
   * per indentation level in the generated CSS. It must be between 0 and 10
   * (inclusive).
   *
   * @defaultValue `2`
   * @category Output
   * @compatibility dart: true, node: "3.0.0"
   */
  indentWidth?: number;

  /**
   * Which character sequence to use at the end of each line in the generated
   * CSS. It can have the following values:
   *
   * * `'lf'` uses U+000A LINE FEED.
   * * `'lfcr'` uses U+000A LINE FEED followed by U+000D CARRIAGE RETURN.
   * * `'cr'` uses U+000D CARRIAGE RETURN.
   * * `'crlf'` uses U+000D CARRIAGE RETURN followed by U+000A LINE FEED.
   *
   * @defaultValue `'lf'`
   * @category Output
   * @compatibility dart: true, node: "3.0.0"
   */
  linefeed?: 'cr' | 'crlf' | 'lf' | 'lfcr';

  /**
   * If `true`, Sass won't add a link from the generated CSS to the source map.
   *
   * ```js
   * const result = sass.renderSync({
   *   file: "style.scss",
   *   sourceMap: "out.map",
   *   omitSourceMapUrl: true
   * })
   * console.log(result.css.toString());
   * // h1 {
   * //   font-size: 40px;
   * // }
   * ```
   *
   * @defaultValue `false`
   * @category Source Maps
   */
  omitSourceMapUrl?: boolean;

  /**
   * The location that Sass expects the generated CSS to be saved to. It’s used
   * to determine the URL used to link from the generated CSS to the source map,
   * and from the source map to the Sass source files.
   *
   * **Heads up!** Despite the name, Sass does *not* write the CSS output to
   * this file. The caller must do that themselves.
   *
   * ```js
   * result = sass.renderSync({
   *   file: "style.scss",
   *   sourceMap: true,
   *   outFile: "out.css"
   * })
   * console.log(result.css.toString());
   * // h1 {
   * //   font-size: 40px;
   * // }
   * // /*# sourceMappingURL=out.css.map * /
   * ```
   *
   * @category Source Maps
   */
  outFile?: string;

  /**
   * The output style of the compiled CSS. There are four possible output styles:
   *
   * * `"expanded"` (the default for Dart Sass) writes each selector and
   *   declaration on its own line.
   *
   * * `"compressed"` removes as many extra characters as possible, and writes
   *   the entire stylesheet on a single line.
   *
   * * `"nested"` (the default for Node Sass, not supported by Dart Sass)
   *   indents CSS rules to match the nesting of the Sass source.
   *
   * * `"compact"` (not supported by Dart Sass) puts each CSS rule on its own single line.
   *
   * @example
   *
   * ```js
   * const source = `
   * h1 {
   *   font-size: 40px;
   *   code {
   *     font-face: Roboto Mono;
   *   }
   * }`;
   *
   * let result = sass.renderSync({
   *   data: source,
   *   outputStyle: "expanded"
   * });
   * console.log(result.css.toString());
   * // h1 {
   * //   font-size: 40px;
   * // }
   * // h1 code {
   * //   font-face: Roboto Mono;
   * // }
   *
   * result = sass.renderSync({
   *   data: source,
   *   outputStyle: "compressed"
   * });
   * console.log(result.css.toString());
   * // h1{font-size:40px}h1 code{font-face:Roboto Mono}
   *
   * result = sass.renderSync({
   *   data: source,
   *   outputStyle: "nested"
   * });
   * console.log(result.css.toString());
   * // h1 {
   * //   font-size: 40px; }
   * //   h1 code {
   * //     font-face: Roboto Mono; }
   *
   * result = sass.renderSync({
   *   data: source,
   *   outputStyle: "compact"
   * });
   * console.log(result.css.toString());
   * // h1 { font-size: 40px; }
   * // h1 code { font-face: Roboto Mono; }
   * ```
   *
   * @category Output
   */
  outputStyle?: 'compressed' | 'expanded' | 'nested' | 'compact';

  /**
   * Whether or not Sass should generate a source map. If it does, the source
   * map will be available as {@link LegacyResult.map} (unless {@link
   * sourceMapEmbed} is `true`).
   *
   * If this option is a string, it’s the path that the source map is expected
   * to be written to, which is used to link to the source map from the
   * generated CSS and to link *from* the source map to the Sass source files.
   * Note that if `sourceMap` is a string and {@link outFile} isn’t passed, Sass
   * assumes that the CSS will be written to the same directory as the file
   * option if it’s passed.
   *
   * If this option is `true`, the path is assumed to be {@link outFile} with
   * `.map` added to the end. If it’s `true` and {@link outFile} isn’t passed,
   * it has no effect.
   *
   * @example
   *
   * ```js
   * let result = sass.renderSync({
   *   file: "style.scss",
   *   sourceMap: "out.map"
   * })
   * console.log(result.css.toString());
   * // h1 {
   * //   font-size: 40px;
   * // }
   * // /*# sourceMappingURL=out.map * /
   *
   * result = sass.renderSync({
   *   file: "style.scss",
   *   sourceMap: true,
   *   outFile: "out.css"
   * })
   * console.log(result.css.toString());
   * // h1 {
   * //   font-size: 40px;
   * // }
   * // /*# sourceMappingURL=out.css.map * /
   * ```
   *
   * @defaultValue `false`
   * @category Source Maps
   */
  sourceMap?: boolean | string;

  /**
   * Whether to embed the entire contents of the Sass files that contributed to
   * the generated CSS in the source map. This may produce very large source
   * maps, but it guarantees that the source will be available on any computer
   * no matter how the CSS is served.
   *
   * @example
   *
   * ```js
   * sass.renderSync({
   *   file: "style.scss",
   *   sourceMap: "out.map",
   *   sourceMapContents: true
   * })
   * ```
   *
   * @defaultValue `false`
   * @category Source Maps
   */
  sourceMapContents?: boolean;

  /**
   * Whether to embed the contents of the source map file in the generated CSS,
   * rather than creating a separate file and linking to it from the CSS.
   *
   * @example
   *
   * ```js
   * sass.renderSync({
   *   file: "style.scss",
   *   sourceMap: "out.map",
   *   sourceMapEmbed: true
   * });
   * ```
   *
   * @defaultValue `false`
   * @category Source Maps
   */
  sourceMapEmbed?: boolean;

  /**
   * If this is passed, it's prepended to all the links from the source map to
   * the Sass source files.
   *
   * @category Source Maps
   */
  sourceMapRoot?: string;

  /**
   * Additional handler(s) for loading files when a [`@use`
   * rule](https://sass-lang.com/documentation/at-rules/use) or an [`@import`
   * rule](https://sass-lang.com/documentation/at-rules/import) is encountered.
   * It can either be a single {@link LegacyImporter} function, or an array of
   * {@link LegacyImporter}s.
   *
   * Importers take the URL of the `@import` or `@use` rule and return a {@link
   * LegacyImporterResult} indicating how to handle that rule. For more details,
   * see {@link LegacySyncImporter} and {@link LegacyAsyncImporter}.
   *
   * Loads are resolved by trying, in order:
   *
   * * Loading a file from disk relative to the file in which the `@use` or
   *   `@import` appeared.
   *
   * * Each custom importer.
   *
   * * Loading a file relative to the current working directory.
   *
   * * Each load path in {@link includePaths}.
   *
   * * Each load path specified in the `SASS_PATH` environment variable, which
   *   should be semicolon-separated on Windows and colon-separated elsewhere.
   *
   * @example
   *
   * ```js
   * sass.render({
   *   file: "style.scss",
   *   importer: [
   *     // This importer uses the synchronous API, and can be passed to either
   *     // renderSync() or render().
   *     function(url, prev) {
   *       // This generates a stylesheet from scratch for `@use "big-headers"`.
   *       if (url != "big-headers") return null;
   *
   *       return {
   *         contents: `
   * h1 {
   *   font-size: 40px;
   * }`
   *       };
   *     },
   *
   *     // This importer uses the asynchronous API, and can only be passed to
   *     // render().
   *     function(url, prev, done) {
   *       // Convert `@use "foo/bar"` to "node_modules/foo/sass/bar".
   *       const components = url.split('/');
   *       const innerPath = components.slice(1).join('/');
   *       done({
   *         file: `node_modules/${components.first}/sass/${innerPath}`
   *       });
   *     }
   *   ]
   * }, function(err, result) {
   *   // ...
   * });
   * ```
   *
   * @category Plugins
   * @compatibility dart: true, node: "3.0.0"
   *
   * Versions of Node Sass before 3.0.0 don’t support arrays of importers, nor
   * do they support importers that return `Error` objects.
   *
   * Versions of Node Sass before 2.0.0 don’t support the `importer` option at
   * all.
   *
   * @compatibility feature: "Import order", dart: "1.20.2", node: false
   *
   * Versions of Dart Sass before 1.20.2 preferred resolving imports using
   * {@link includePaths} before resolving them using custom importers.
   *
   * All versions of Node Sass currently pass imports to importers before
   * loading them relative to the file in which the `@import` appears. This
   * behavior is considered incorrect and should not be relied on because it
   * violates the principle of *locality*, which says that it should be possible
   * to reason about a stylesheet without knowing everything about how the
   * entire system is set up. If a user tries to import a stylesheet relative to
   * another stylesheet, that import should *always* work. It shouldn’t be
   * possible for some configuration somewhere else to break it.
   */
  importer?: LegacyImporter<sync> | LegacyImporter<sync>[];

  /**
   * Additional built-in Sass functions that are available in all stylesheets.
   * This option takes an object whose keys are Sass function signatures and
   * whose values are {@link LegacyFunction}s. Each function should take the
   * same arguments as its signature.
   *
   * Functions are passed subclasses of {@link LegacyValue}, and must return the
   * same.
   *
   * **Heads up!** When writing custom functions, it’s important to ensure that
   * all the arguments are the types you expect. Otherwise, users’ stylesheets
   * could crash in hard-to-debug ways or, worse, compile to meaningless CSS.
   *
   * @example
   *
   * ```js
   * sass.render({
   *   data: `
   * h1 {
   *   font-size: pow(2, 5) * 1px;
   * }`,
   *   functions: {
   *     // This function uses the synchronous API, and can be passed to either
   *     // renderSync() or render().
   *     'pow($base, $exponent)': function(base, exponent) {
   *       if (!(base instanceof sass.types.Number)) {
   *         throw "$base: Expected a number.";
   *       } else if (base.getUnit()) {
   *         throw "$base: Expected a unitless number.";
   *       }
   *
   *       if (!(exponent instanceof sass.types.Number)) {
   *         throw "$exponent: Expected a number.";
   *       } else if (exponent.getUnit()) {
   *         throw "$exponent: Expected a unitless number.";
   *       }
   *
   *       return new sass.types.Number(
   *           Math.pow(base.getValue(), exponent.getValue()));
   *     },
   *
   *     // This function uses the asynchronous API, and can only be passed to
   *     // render().
   *     'sqrt($number)': function(number, done) {
   *       if (!(number instanceof sass.types.Number)) {
   *         throw "$number: Expected a number.";
   *       } else if (number.getUnit()) {
   *         throw "$number: Expected a unitless number.";
   *       }
   *
   *       done(new sass.types.Number(Math.sqrt(number.getValue())));
   *     }
   *   }
   * }, function(err, result) {
   *   console.log(result.css.toString());
   *   // h1 {
   *   //   font-size: 32px;
   *   // }
   * });
   * ```
   *
   * @category Plugins
   */
  functions?: {[key: string]: LegacyFunction<sync>};

  /**
   * By default, if the CSS document contains non-ASCII characters, Sass adds a
   * `@charset` declaration (in expanded output mode) or a byte-order mark (in
   * compressed mode) to indicate its encoding to browsers or other consumers.
   * If `charset` is `false`, these annotations are omitted.
   *
   * @category Output
   * @compatibility dart: "1.39.0", node: false
   */
  charset?: boolean;

  /**
   * If this option is set to `true`, Sass won’t print warnings that are caused
   * by dependencies. A “dependency” is defined as any file that’s loaded
   * through {@link includePaths} or {@link importer}. Stylesheets that are
   * imported relative to the entrypoint are not considered dependencies.
   *
   * This is useful for silencing deprecation warnings that you can’t fix on
   * your own. However, please <em>also</em> notify your dependencies of the deprecations
   * so that they can get fixed as soon as possible!
   *
   * **Heads up!** If {@link render} or {@link renderSync} is called without
   * {@link LegacyFileOptions.file} or {@link LegacyStringOptions.file},
   * <em>all</em> stylesheets it loads will be considered dependencies. Since it
   * doesn’t have a path of its own, everything it loads is coming from a load
   * path rather than a relative import.
   *
   * @defaultValue `false`
   * @category Messages
   * @compatibility dart: "1.35.0", node: false
   */
  quietDeps?: boolean;

  /**
   * By default, Dart Sass will print only five instances of the same
   * deprecation warning per compilation to avoid deluging users in console
   * noise. If you set `verbose` to `true`, it will instead print every
   * deprecation warning it encounters.
   *
   * @defaultValue `false`
   * @category Messages
   * @compatibility dart: "1.35.0", node: false
   */
  verbose?: boolean;

  /**
   * An object to use to handle warnings and/or debug messages from Sass.
   *
   * By default, Sass emits warnings and debug messages to standard error, but
   * if {@link Logger.warn} or {@link Logger.debug} is set, this will invoke
   * them instead.
   *
   * The special value {@link Logger.silent} can be used to easily silence all
   * messages.
   *
   * @category Messages
   * @compatibility dart: "1.43.0", node: false
   */
  logger?: Logger;

  /**
   * If this option is set to an instance of `NodePackageImporter`, Sass will
   * use the built-in Node.js package importer to resolve Sass files with a
   * `pkg:` URL scheme. Details for library authors and users can be found in
   * the {@link NodePackageImporter} documentation.
   *
   * @example
   * ```js
   * sass.renderSync({
   *   data: '@use "pkg:vuetify";',
   *   pkgImporter: new sass.NodePackageImporter()
   * });
   * ```
   * @category Plugins
   * @compatibility dart: "2.0", node: false
   */
  pkgImporter?: NodePackageImporter;
}

/**
 * If {@link file} is passed without {@link data}, Sass will load the stylesheet
 * at {@link file} and compile it to CSS.
 *
 * @typeParam sync - This lets the TypeScript checker verify that {@link
 * LegacyAsyncImporter}s and {@link LegacyAsyncFunction}s aren't passed to
 * {@link renderSync}.
 */
interface LegacyFileOptions<sync extends 'sync' | 'async'>
  extends LegacySharedOptions<sync> {
  /**
   * The path to the file for Sass to load and compile. If the file’s extension
   * is `.scss`, it will be parsed as SCSS; if it’s `.sass`, it will be parsed
   * as the indented syntax; and if it’s `.css`, it will be parsed as plain CSS.
   * If it has no extension, it will be parsed as SCSS.
   *
   * @example
   *
   * ```js
   * sass.renderSync({file: "style.scss"});
   * ```
   *
   * @category Input
   * @compatibility feature: "Plain CSS files", dart: "1.11.0", node: "partial"
   *
   * Node Sass and older versions of Dart Sass support loading files with the
   * extension `.css`, but contrary to the specification they’re treated as SCSS
   * files rather than being parsed as CSS. This behavior has been deprecated
   * and should not be relied on. Any files that use Sass features should use
   * the `.scss` extension.
   *
   * All versions of Node Sass and Dart Sass otherwise support the file option
   * as described below.
   */
  file: string;

  /**
   * See {@link LegacyStringOptions.file} for documentation of passing {@link
   * file} along with {@link data}.
   *
   * @category Input
   */
  data?: never;
}

/**
 * If {@link data} is passed, Sass will use it as the contents of the stylesheet
 * to compile.
 *
 * @typeParam sync - This lets the TypeScript checker verify that {@link
 * LegacyAsyncImporter}s and {@link LegacyAsyncFunction}s aren't passed to
 * {@link renderSync}.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link StringOptions} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
interface LegacyStringOptions<sync extends 'sync' | 'async'>
  extends LegacySharedOptions<sync> {
  /**
   * The contents of the stylesheet to compile. Unless {@link file} is passed as
   * well, the stylesheet’s URL is set to `"stdin"`.
   *
   * By default, this stylesheet is parsed as SCSS. This can be controlled using
   * {@link indentedSyntax}.
   *
   * @example
   *
   * ```js
   * sass.renderSync({
   *   data: `
   * h1 {
   *   font-size: 40px;
   * }`
   * });
   * ```
   *
   * @category Input
   */
  data: string;

  /**
   * If `file` and {@link data} are both passed, `file` is used as the path of
   * the stylesheet for error reporting, but {@link data} is used as the
   * contents of the stylesheet. In this case, `file`’s extension is not used to
   * determine the syntax of the stylesheet.
   *
   * @category Input
   */
  file?: string;

  /**
   * This flag controls whether {@link data} is parsed as the indented syntax or
   * not.
   *
   * @example
   *
   * ```js
   * sass.renderSync({
   *   data: `
   * h1
   *   font-size: 40px`,
   *   indentedSyntax: true
   * });
   * ```
   *
   * @defaultValue `false`
   * @category Input
   */
  indentedSyntax?: boolean;
}

/**
 * Options for {@link render} and {@link renderSync}. This can either be {@link
 * LegacyFileOptions} to load a file from disk, or {@link LegacyStringOptions}
 * to compile a string of Sass code.
 *
 * See {@link LegacySharedOptions} for options that are shared across both file
 * and string inputs.
 *
 * @category Legacy
 * @deprecated This only works with the legacy {@link render} and {@link
 * renderSync} APIs. Use {@link Options} with {@link compile}, {@link
 * compileString}, {@link compileAsync}, and {@link compileStringAsync} instead.
 */
type LegacyOptions<sync extends 'sync' | 'async'> =
  | LegacyFileOptions<sync>
  | LegacyStringOptions<sync>;

export type { LegacyOptions, Options };
