var resolve = require('path').resolve;
var webpack = require('webpack');

var SRC = resolve(__dirname, 'src');
var DIST = resolve(__dirname, 'dist');
var MODULES = resolve(SRC, 'modules');
var LIB = resolve(DIST, 'lib');

module.exports = {

    // Top-level directory from where to search for files.
    context: SRC,

    // Name of the file from where to start bundling.
    entry: './main.js',

    // Bundled output configuration.
    output: {
        path: DIST,
        filename: 'bundle.js',
    },

    module: {
        loaders: [

            // Process all imported .js(x) files
            // in the src/ directory through Babel.
            {
                test: /\.jsx?$/,
                include: SRC,
                loader: 'babel',
                query: {
                    presets: [ 'es2015', 'stage-0', 'react' ],
                    plugins: [ 'lodash' ], // Tree-shake our lodash.
                },
            },

            // Allow JSON to be properly imported
            // into src/ files.
            {
                test: /\.json$/,
                include: SRC,
                loader: 'json',
            },

        ],

        noParse: [

            // Only match katex if it's not followed by .spec, so we don't
            // skip parsing katex.spec.js (only katex.js or katex.min.js.)
            /katex(?!\.spec)/,
            /qgridjs/,
            /resumablejs/,
            /sjcl/,

        ],

    },

    resolve: {
        alias: {

            // Allow specifying imports in source files
            // from app|common|reports|staging, which lets
            // you avoid enscribing the full path each time.
            app: resolve(MODULES, 'app'),
            common: resolve(MODULES, 'common'),
            reports: resolve(MODULES, 'reports'),
            staging: resolve(MODULES, 'staging'),

            // Bower modules. Kind of have to do webpack's
            // job here by telling it exactly where to find
            // the files to pull into the bundle. The '$' in
            // the key tells webpack to match the import exactly
            // (e.g., 'qgridjs', but not './qgridjs')
            qgridjs$: resolve(LIB, 'qgridjs', 'qgrid.min.js'),
            sjcl$: resolve(LIB, 'sjcl', 'sjcl.js'),
            resumablejs$: resolve(LIB, 'resumablejs', 'resumable.js'),
            katex$: resolve(LIB, 'katex', 'dist', 'katex.min.js'),

        },
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: '"production"' },
        }),
        new webpack.IgnorePlugin(/locale/, /moment/),
    ],

    // Generate a low-overhead sourcemap for easier debugging.
    devtool: 'cheap-module-source-map',

}
