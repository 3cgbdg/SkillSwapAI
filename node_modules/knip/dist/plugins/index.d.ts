export declare const Plugins: {
    angular: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./angular/types.js").AngularCLIWorkspaceConfiguration>;
    };
    astro: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        production: string[];
        resolveFromAST: import("../types/config.js").ResolveFromAST;
        resolve: import("../types/config.js").Resolve;
        project: string[];
    };
    ava: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./ava/types.js").AvaConfig>;
    };
    babel: {
        title: string;
        enablers: RegExp[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./babel/types.js").BabelConfig>;
    };
    biome: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./biome/types.js").BiomeConfig>;
    };
    bumpp: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
    };
    bun: {
        title: string;
        enablers: string[];
        isEnabled: () => boolean;
        config: string[];
        packageJsonPath: (id: import("../types/package-json.js").PackageJson) => import("../types/package-json.js").PackageJson;
        resolveConfig: import("../types/config.js").ResolveConfig<import("../types/package-json.js").PackageJson>;
    };
    c8: {
        title: string;
        args: {
            args: (args: string[]) => string[];
            boolean: string[];
            fromArgs: (parsed: import("minimist").ParsedArgs, args: string[]) => string[];
        };
    };
    capacitor: {
        title: string;
        enablers: RegExp[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./capacitor/types.js").CapacitorConfig>;
    };
    changelogen: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        entry: string[];
    };
    changelogithub: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        entry: string[];
    };
    changesets: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./changesets/types.js").ChangesetsConfig>;
    };
    commitizen: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        packageJsonPath: string;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./commitizen/types.js").CommitizenConfig>;
    };
    commitlint: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./commitlint/types.js").CommitLintConfig>;
    };
    convex: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
    };
    'create-typescript-app': {
        enablers: string[];
        entry: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        title: string;
    };
    cspell: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./cspell/types.js").CSpellConfig>;
    };
    cucumber: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./cucumber/types.js").CucumberConfig>;
    };
    cypress: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./cypress/types.js").CypressConfig>;
    };
    danger: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
    };
    'dependency-cruiser': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        args: {
            binaries: string[];
            config: boolean;
        };
    };
    docusaurus: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        production: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./docusaurus/types.js").DocusaurusConfig>;
    };
    dotenv: {
        title: string;
        args: {
            fromArgs: (parsed: import("minimist").ParsedArgs, args: string[]) => string[];
        };
    };
    drizzle: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./drizzle/types.js").DrizzleConfig>;
    };
    eleventy: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        production: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./eleventy/types.js").EleventyConfigOrFn>;
    };
    eslint: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: string;
        config: string[];
        args: {
            config: boolean;
            boolean: string[];
            resolveInputs: (parsed: import("minimist").ParsedArgs) => import("../util/input.js").Input[];
        };
        isLoadConfig: import("../types/config.js").IsLoadConfig;
        resolveConfig: import("../types/config.js").ResolveConfig<import("./eslint/types.js").ESLintConfigDeprecated>;
    };
    expo: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        production: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./expo/types.js").ExpoConfig>;
    };
    gatsby: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        production: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./gatsby/types.js").GatsbyConfig | import("./gatsby/types.js").GatsbyNode>;
    };
    'github-action': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig;
    };
    'github-actions': {
        title: string;
        enablers: string;
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig;
    };
    glob: {
        title: string;
        args: {
            positional: boolean;
            alias: {
                cmd: string[];
            };
            fromArgs: string[];
        };
    };
    'graphql-codegen': {
        title: string;
        enablers: (string | RegExp)[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: (manifest: import("../types/package-json.js").PackageJson) => unknown;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./graphql-codegen/types.js").GraphqlCodegenTypes | import("./graphql-codegen/types.js").GraphqlConfigTypes | import("./graphql-codegen/types.js").GraphqlProjectsConfigTypes>;
    };
    hardhat: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
        resolve: import("../types/config.js").Resolve;
    };
    husky: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig;
    };
    'i18next-parser': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        args: {
            binaries: string[];
            config: boolean;
        };
    };
    jest: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./jest/types.js").JestConfig>;
        args: {
            config: boolean;
        };
    };
    karma: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./karma/helpers.js").ConfigFile>;
    };
    ladle: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        project: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./ladle/types.js").LadleConfig>;
    };
    lefthook: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig;
    };
    'lint-staged': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./lint-staged/types.js").LintStagedConfig>;
    };
    linthtml: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: string;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./linthtml/types.js").LintHTMLConfig>;
    };
    'lockfile-lint': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
    };
    'lost-pixel': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
    };
    markdownlint: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./markdownlint/types.js").MarkdownlintConfig>;
    };
    metro: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        production: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./metro/types.js").MetroConfig>;
    };
    mocha: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./mocha/types.js").MochaConfig>;
        args: {
            nodeImportArgs: boolean;
        };
    };
    moonrepo: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./moonrepo/types.js").MoonConfiguration>;
    };
    msw: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./msw/types.js").MSWConfig>;
    };
    'nano-staged': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./nano-staged/types.js").NanoStagedConfig>;
    };
    nest: {
        title: string;
        enablers: RegExp[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./nest/types.js").NestConfig>;
    };
    netlify: {
        title: string;
        enablers: (string | RegExp)[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        production: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./netlify/types.js").NetlifyConfig>;
    };
    next: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        production: string[];
        resolveFromAST: import("../types/config.js").ResolveFromAST;
    };
    node: {
        title: string;
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: (id: import("../types/package-json.js").PackageJson) => import("../types/package-json.js").PackageJson;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("../types/package-json.js").PackageJson>;
        args: {
            positional: boolean;
            nodeImportArgs: boolean;
            resolve: string[];
            boolean: string[];
            args: (args: string[]) => string[];
        };
    };
    'node-modules-inspector': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        args: {
            config: boolean;
        };
    };
    nodemon: {
        title: string;
        args: {
            positional: boolean;
            nodeImportArgs: boolean;
            string: string[];
            fromArgs: string[];
        };
    };
    'npm-package-json-lint': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: string;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./npm-package-json-lint/types.js").NpmPkgJsonLintConfig>;
    };
    nuxt: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        production: string[];
        setup: () => Promise<void>;
        resolveConfig: import("../types/config.js").ResolveConfig<import("./nuxt/types.js").NuxtConfig>;
    };
    nx: {
        title: string;
        enablers: (string | RegExp)[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./nx/types.js").NxProjectConfiguration | import("./nx/types.js").NxConfigRoot>;
        args: {
            fromArgs: (parsed: import("minimist").ParsedArgs) => string[];
        };
    };
    nyc: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./nyc/types.js").NycConfig>;
    };
    oclif: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./oclif/types.js").OclifConfig>;
    };
    oxlint: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        args: {
            config: boolean;
        };
    };
    playwright: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./playwright/types.js").PlaywrightTestConfig>;
        args: {
            positional: boolean;
            args: (args: string[]) => string[];
            config: boolean;
        };
    };
    'playwright-ct': {
        title: string;
        enablers: RegExp[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./playwright/types.js").PlaywrightTestConfig>;
    };
    'playwright-test': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        args: {
            positional: boolean;
            args: (args: string[]) => string[];
            config: boolean;
        };
    };
    plop: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
    };
    pnpm: {
        title: string;
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        config: string[];
    };
    postcss: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./postcss/types.js").PostCSSConfig>;
    };
    preconstruct: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./preconstruct/types.js").PreconstructConfig>;
    };
    prettier: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./prettier/types.js").PrettierConfig>;
    };
    prisma: {
        title: string;
        enablers: (string | RegExp)[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        args: {
            config: boolean;
        };
        resolveConfig: import("../types/config.js").ResolveConfig<import("./prisma/types.js").PrismaConfig>;
    };
    'react-cosmos': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./react-cosmos/types.js").ReactCosmosConfig>;
    };
    'react-router': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./react-router/types.js").PluginConfig>;
    };
    relay: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./relay/types.js").RelayConfig>;
        args: {
            binaries: string[];
            args: (args: string[]) => string[];
            config: boolean;
        };
    };
    'release-it': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./release-it/types.js").ReleaseItConfig>;
    };
    remark: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: string;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./remark/types.js").RemarkConfig>;
    };
    remix: {
        title: string;
        enablers: RegExp[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
        production: string[];
    };
    rollup: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
        args: import("../types/args.js").Args;
    };
    rsbuild: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./rsbuild/types.js").RsbuildConfig>;
    };
    rslib: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./rslib/types.js").RslibConfig>;
    };
    rspack: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./webpack/types.js").WebpackConfig>;
    };
    rstest: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./rstest/types.js").RstestConfig>;
    };
    'semantic-release': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        packageJsonPath: string;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./semantic-release/types.js").SemanticReleaseConfig>;
    };
    sentry: {
        title: string;
        enablers: RegExp[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        production: string[];
    };
    'simple-git-hooks': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./simple-git-hooks/types.js").SimpleGitHooksConfig>;
    };
    'size-limit': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolve: import("../types/config.js").Resolve;
    };
    sst: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveFromAST: import("../types/config.js").ResolveFromAST;
    };
    starlight: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveFromAST: import("../types/config.js").ResolveFromAST;
    };
    storybook: {
        title: string;
        enablers: (string | RegExp)[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        project: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./storybook/types.js").StorybookConfig>;
    };
    stryker: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./stryker/types.js").StrykerConfig>;
    };
    stylelint: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./stylelint/types.js").StyleLintConfig>;
    };
    svelte: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
        production: string[];
        resolve: import("../types/config.js").Resolve;
    };
    svgo: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
    };
    syncpack: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
    };
    tailwind: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
    };
    travis: {
        title: string;
        enablers: string;
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig;
    };
    'ts-node': {
        title: string;
        args: {
            positional: boolean;
            nodeImportArgs: boolean;
            boolean: string[];
            alias: {
                transpileOnly: string[];
                compilerHost: string[];
                ignoreDiagnostics: string[];
            };
        };
    };
    tsdown: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./tsdown/types.js").TsdownConfig>;
        args: {
            config: boolean;
        };
    };
    tsup: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./tsup/types.js").TsupConfig>;
        args: {
            config: boolean;
        };
    };
    tsx: {
        title: string;
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: (id: import("../types/package-json.js").PackageJson) => import("../types/package-json.js").PackageJson;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("../types/package-json.js").PackageJson>;
        args: {
            positional: boolean;
            nodeImportArgs: boolean;
            args: (args: string[]) => string[];
        };
    };
    typedoc: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: string;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./typedoc/types.js").TypeDocConfig | {
            typedocOptions: import("./typedoc/types.js").TypeDocConfig;
        }>;
        args: {
            resolve: string[];
        };
    };
    typescript: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("../types/tsconfig-json.js").TsConfigJson>;
        args: {
            binaries: string[];
            string: string[];
            alias: {
                project: string[];
            };
            config: [string, (p: string) => string][];
        };
    };
    unbuild: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./unbuild/types.js").UnbuildConfig>;
    };
    unocss: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
    };
    'vercel-og': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        production: string[];
    };
    vike: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        production: string[];
    };
    vite: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./vitest/types.js").ViteConfigOrFn | import("./vitest/types.js").VitestWorkspaceConfig>;
        resolveFromAST: import("../types/config.js").ResolveFromAST;
    };
    vitest: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        entry: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./vitest/types.js").ViteConfigOrFn | import("./vitest/types.js").VitestWorkspaceConfig>;
        args: {
            config: boolean;
            resolveInputs: (parsed: import("minimist").ParsedArgs) => import("../util/input.js").Input[];
        };
    };
    vue: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./vue/types.js").VueConfig>;
    };
    'webdriver-io': {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./webdriver-io/types.js").WebdriverIOConfig>;
    };
    webpack: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./webpack/types.js").WebpackConfig>;
        args: {
            binaries: string[];
            config: boolean;
        };
    };
    wireit: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./wireit/types.js").WireitConfig>;
    };
    wrangler: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./wrangler/types.js").WranglerConfig>;
    };
    xo: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        entry: string[];
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./xo/types.js").XOConfig>;
    };
    yarn: {
        title: string;
        enablers: string;
        isEnabled: import("../types/config.js").IsPluginEnabled;
        isRootOnly: true;
        entry: string[];
    };
    yorkie: {
        title: string;
        enablers: string[];
        isEnabled: import("../types/config.js").IsPluginEnabled;
        packageJsonPath: string;
        config: string[];
        resolveConfig: import("../types/config.js").ResolveConfig<import("./lint-staged/types.js").LintStagedConfig>;
    };
};
