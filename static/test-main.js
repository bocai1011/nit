var allTestFiles = [];
var TEST_REGEXP = /tests\/.*(spec|test)\.js$/i;

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(file);
  }
});


require.config({
  // Karma serves files under /base, which is the basePath from your config file
  baseUrl: '/base/dist/lib',

  // dynamically load all test files
  deps: allTestFiles.concat('string-format'),

  shim: {
    'react-router-shim': {
      deps: [
        'react'
      ],
      exports: 'React'
    },
    'react-router': {
      deps: [
        'react-router-shim'
      ],
      exports: 'ReactRouter'
    },
    exporting: {
      deps: [
        'highstock'
      ]
    },
    highstock: {
      exports: 'Highcharts',
      deps: [
        'jquery'
      ]
    },
    heatmap: {
      deps: [
        'highstock'
      ]
    },
    treemap: {
      deps: [
        'highstock'
      ]
    },
    'highcharts-more': {
      deps: [
        'highstock'
      ]
    },
    slickgrid: {
      deps: [
        'jquery',
        'jquery-event-drag',
        'slickgrid-core',
        'slickgrid-editors'
      ],
      exports: 'Slick'
    },
    'slickgrid-editors': {
      deps: [
        'jquery'
      ]
    },
    'slickgrid-core': {
      deps: [
        'jquery'
      ]
    },
    'slickgrid-dataview': {
        deps: [
            'jquery'
        ]
    },
    'jquery-event-drag': {
      deps: [
        'jquery'
      ]
    },
    numeral: {
      exports: 'numeral'
    },
    qgrid: {
      deps: [
        'jquery',
        'jquery-ui',
        'lodash',
        'handlebars',
        'moment',
        'slickgrid',
        'slickgrid-dataview',
        'slickgrid-rowselectionmodel',
        'slickgrid-checkboxselectcolumn'
      ]
    }
  },
  paths: {
    'bootstrap': 'bootstrap/dist/js/bootstrap',
    'd3': 'd3/d3.min',
    'handlebars': 'handlebars/handlebars.min',
    'jquery': 'jquery/jquery',
    'jquery-ui': 'jquery-ui/jquery-ui',
    'JSXTransformer': 'react/JSXTransformer',
    'katex': 'katex/dist/katex.min',
    'lodash': 'lodash/lodash.min',
    'moment': 'moment/min/moment.min',
    'numeral': 'numeral/numeral',
    'react': 'react/react-with-addons',
    'react-bootstrap': 'react-bootstrap/react-bootstrap',
    'react-router': 'react-router/dist/react-router.min',
    'requirejs': 'requirejs/require',
    'string-format': 'string-format/string-format',
    'json': 'requirejs-plugins/src/json',
    'text': 'requirejs-text/text',
    'sjcl': 'sjcl/sjcl',

    // neat
    'NeatApp': '../modules/app/utils/NeatApp',
    'common': '../modules/common',
    'staging': '../modules/staging',
    'reports': '../modules/reports',
    'app': '../modules/app',
    'react-router-shim': '../modules/common/utils/react-router-shim',
    'query-manifest': '../modules/reports/utils/query-manifest.json',

    // highcharts
    'exporting': 'highcharts/modules/exporting.src',
    'heatmap': 'highcharts/modules/heatmap.src',
    'treemap': 'highcharts/modules/treemap.src',
    'highcharts-more': 'highcharts/highcharts-more.src',
    'highstock': 'highcharts/highstock.src',

    // slickgrid
    'jquery-event-drag': 'slickgrid/lib/jquery.event.drag-2.2',
    'slickgrid': 'slickgrid/slick.grid',
    'slickgrid-checkboxselectcolumn': 'slickgrid/plugins/slick.checkboxselectcolumn',
    'slickgrid-core': 'slickgrid/slick.core',
    'slickgrid-dataview': 'slickgrid/slick.dataview',
    'slickgrid-editors': 'slickgrid/slick.editors',
    'slickgrid-rowselectionmodel': 'slickgrid/plugins/slick.rowselectionmodel',

    // qgrid
    'datefilter': 'qgrid/js/qgrid.datefilter',
    'filterbase': 'qgrid/js/qgrid.filterbase',
    'qgrid': 'qgrid/js/qgrid',
    'securityfilter': 'qgrid/js/qgrid.securityfilter',
    'sliderfilter': 'qgrid/js/qgrid.sliderfilter',
    'textfilter': 'qgrid/js/qgrid.textfilter',
    'resumable': 'resumablejs/resumable'
  },

  // we have to kickoff jasmine, as it is asynchronous
  callback: window.__karma__.start
});
