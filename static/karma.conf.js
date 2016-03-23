var fs = require('fs');
var glob = require('glob');
var pick = require('lodash/pick');
var resolve = require('path').resolve;

var webpackConfig = pick(require('./webpack.config.js'), [
    'module',
    'resolve',
]);

webpackConfig.devtool = 'inline-source-map';

// Configure Karma to run tests only on the last test file you edited.
var ONLY_LAST_MODIFIED = (false || process.env.NEAT_JSUNIT_LATEST !== undefined);

// Configure Karma to run tests in single shot mode vs. watch mode.
var WATCH_MODE = (false || process.env.NEAT_JSUNIT_WATCH !== undefined);

// Configure Karma to produce coverage reports.
var COVERAGE = (false || process.env.NEAT_JSUNIT_COVERAGE !== undefined);

// Configure Karma to dump the browser console.
var VERBOSE = (false || process.env.NEAT_JSUNIT_VERBOSE !== undefined);

var testFile = 'tests.bundle.js';

if (ONLY_LAST_MODIFIED) {

    var allTestFiles = glob.sync('neat/static/src/modules/**/*.spec.js', {
        realpath: true,
    });

    // Find the most recent testFile
    var mostRecentTime = -1;
    allTestFiles.forEach(function(file) {
        var mtime = fs.lstatSync(file).mtime;
        if (mtime > mostRecentTime) {
            mostRecentTime = mtime;
            testFile = file;
        }
    });

}

// Configure reporters
var reporters = [ 'progress' ];
var coverageReporter = {};

var preprocessors = {};
preprocessors[testFile] = [ 'webpack', 'sourcemap' ];

if (COVERAGE) {

    // Configure webpack to instrument JS source files so that
    // Istanbul can generate coverage reports.
    webpackConfig.module.postLoaders = [{
        test: /\.js$/,
        include: resolve(__dirname, 'src'),
        exclude: /test/,
        loader: 'isparta',
    }];

    reporters.push('coverage');

    coverageReporter.reporters = [
        { type: 'html', dir: '.jsunit-coverage' },
        { type: 'text' },
    ];

}


module.exports = function(config) {

    config.set({

        basePath: '.',

        frameworks: [ 'mocha', 'chai-sinon' ],

        files: [
            'test-utils.js',
            testFile,
        ],

        webpack: webpackConfig,

        // Prevent webpack from dumping its output to the console.
        webpackMiddleware: { noInfo: true },

        preprocessors: preprocessors,

        reporters: reporters,

        coverageReporter: coverageReporter,

        port: 9876,

        colors: true,

        logLevel: config.LOG_DISABLE,

        client: { captureConsole: VERBOSE },

        autoWatch: true,

        browsers: [ 'Chrome' ],

        singleRun: !WATCH_MODE

    });

};
