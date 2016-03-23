import React from 'react';
import _ from 'lodash';
import numeral from 'numeral';
import ChartMixin from 'reports/components/charts/ChartMixin';
import Query from 'reports/utils/query';
import util from 'common/utils/util';
import Highcharts from 'highcharts';

var truncate = function(state) {
    var to_viz = state.data;
    if (to_viz.pandas.axes.columns.values.length > state.view_limit) {
        to_viz['pandas']['axes']['columns']['values'] = to_viz.pandas.axes.columns.values.slice(state.view_offset, state.view_offset + state.view_limit + 1);
    }
    return to_viz;
};

var pluralYAxis = function(self, dom, raw) {
    var indexName = raw.pandas.axes.index.names[0];
    var name = self.state.args.yAxis || indexName || 'items';

    return util.pluralize(util.formatName(util.unbox(name)));
};

var createColumnChart = function (dom, raw) {
    var self = this;
    var props = self.props;
    if (!_.has(self.state.args, 'mapping')) {
        self.state.args.mapping = {};
    }

    var values = raw.pandas.values,
        indexName = raw.pandas.axes.index.names[0],
        xdata = _.map(values, 'bins'),
        column_data = _.without(raw.pandas.axes.columns.values, 'bins').map(function (data_column) {
            if (self.props.sparkline) {
                var name = undefined;
            } else {
                if (indexName && _.has(self.state.args.mapping, indexName)) {
                    var name = self.state.args.mapping[indexName][data_column] || util.formatName(data_column);
                } else {
                    var name = util.formatName(data_column);
                }
            }

            return {
                name: name,
                data: _.zip(xdata, _.map(values, data_column)),

                // This option ensures that the
                // histogram columns can overlap each other.
                grouping: false,
                pointPadding: 0,
                borderWidth: 0,
            };
        });

    var xAxis = {
        labels: {
            enabled : (props.sparkline ? false : true),
        },
        startOnTick: (props.sparkline ? false : true),
        endOnTick: (props.sparkline ? false : true),
        title: {
           text: (props.sparkline ? false : this.props.xAxis),
        },
        tickPositions: (props.sparkline ? [] : undefined),
        type: (self.props.log && (xdata[0] > 0)) ? 'logarithmic' : 'linear',
    };

    // TODO: this is breaks when data values are 0
    // if (dict.meta.settings.log) {
    //     xAxis.type = 'logarithmic'
    // }

    var defaults = {
        credits: false,

        chart: {
            type: 'column',
            renderTo: dom,

            style: {
                overflow: 'visible',
                'z-index': 1,
            },

            backgroundColor: (props.sparkline ? null : undefined),
            borderWidth: (props.sparkline ? 0 : undefined),
            margin: (props.sparkline ? [2, 0, 2, 0] : undefined),
            skipClone: (props.sparkline ? true : undefined),

            width: (props.sparkline ? 120 : undefined),
            height: (props.sparkline ? 50 : undefined),
        },

        plotOptions: {
            column: {
                minPointLength: props.toggleLog ? 10 : 0,
            }
        },

        legend: {
            enabled: ((props.sparkline || ((_.keys(values[0]).length == 2) && xAxis.title.text)) ? false : true)
        },

        title: {
            text: null
        },

        colors: [
          'rgba(124,181,236,.75)',
          'rgba(67,67,72,.75)',
          'rgba(144,237,125,.75)',
          'rgba(247,163,92,.75)',
          'rgba(128,133,233,.75)',
          'rgba(241,92,128,.75)',
          'rgba(228,211,84,.75)',
          'rgba(43,144,143,.75)',
          'rgba(244,91,91,.75)',
          'rgba(145,232,225,.75)',
        ],

        tooltip: {
            style: {
                'z-index': 1000,
            },
            formatter: function () {
                var name = self.state.args.yAxis || indexName || 'items';
                name = util.formatName(util.unbox(name));

                if (this.y > 1) {
                    name = util.pluralize(name);
                }

                var field = util.formatName(self.state.args.field);

                var sigfigs = Math.floor(Math.abs(Math.log(values[0]['bins'])/Math.log(10))) + 1;
                var format = this.x > 1 ? undefined : '0.' + '0'.repeat(sigfigs) + 'a';
                var low = util.parseNum(this.x, self.state.args.field, (self.state.args.xFormat ? self.state.args.xFormat : format));

                var next = this.series.data[this.point.index + 1];
                var high = (next ? util.parseNum(next.x, self.state.args.field, (self.state.args.xFormat ? self.state.args.xFormat : format)) : 'up');

                var count = numeral(this.y).format('0a');

                return `<b>${count} ${name}</b><br/>with ${field} between <br/>${low} and ${high}`;
            },
            positioner: function (width, length, point) {
                return { x: point.plotX + 40, y: point.plotY + 40};
            },
        },

        xAxis: xAxis,

        yAxis: (props.sparkline ? {
            endOnTick: false,
            startOnTick: false,
            labels: {
                enabled: false
            },
            title: {
                text: null
            },
            tickPositions: [0]
        } : {
            enabled : (props.sparkline ? false : true),
            allowDecimals: false,
            title: {
                text: pluralYAxis(self, dom, raw),
            },
            type: props.toggleLog ? 'logarithmic' : 'linear',
            min: props.toggleLog ? 0.01 : 0,
            floor: props.toggleLog ? 0.01 : 0,
        }),

        exporting: {
            buttons: [],
        },

        series: (self.props.sparkline ? [column_data[self.props.rowID]] : column_data)
        // series: column_data
    };

    var opts = util.defaults(this.props.viewProps, defaults);

    // Render the Highchart by manually creating the object in order to
    // store a reference to the `chart` object.
    var chart = new Highcharts.Chart(opts);

    // Wrap `Math.max` because `Array.prototype.reduce` passes extra args
    // to the accumulator function that break Math.max :(
    var max = function (a, b) { return Math.max(a, b); }
    var maxColumnCount = _.map(chart.series, 'data') // Pluck data arrays
                          .map(_.size)                 // Get their lengths
                          .reduce(max, 0);             // And pick the max.

    // Calculate width of the columns by dividing the width of the chart's
    // X-Axis by the number of columns in the series with the greatest # of
    // columns. All series will have this same column width.
    var columnWidth = Math.ceil(chart.xAxis[0].width / maxColumnCount) + 1;
    chart.series.forEach(function (seriesObj) {
        seriesObj.update({
            pointWidth: columnWidth,
        });
    });

};

/**
 * Component for rendering a histogram widget.
 * @component
 * @exports lib\Components\Charts\Histogram
 */
const Histogram = React.createClass({
    displayName: 'Histogram',
    mixins: [ChartMixin],

    spec: {
        exports: ['png'],
        toggleLog: false
    },

    propTypes: {
        field: React.PropTypes.string.isRequired,
        grouper: React.PropTypes.array,
        log: React.PropTypes.bool,
    },

    getDefaultProps: function () {
        return {
            grouper: [],
            log: true,
            view_limit: 2,
        }
    },

    _createChart: createColumnChart,

    widgetQuery: function (query) {
        var props = this.props;

        if (props.field && props.grouper) {
            if (props.grouper instanceof Query) {
                var grouper = props.grouper;
            } else {
                var grouper = util.ensureArray(props.grouper)
            }

            return new Query('jsutil.Histogram', {
                data: query || props.data,
                grouper: grouper,
                field: props.field,
                nbins:props.bins,
                log: props.log,
            });
        } else {
            return query;
        }
    },

    menuAdditions: function () {
        var self = this;
        return ([
            <li tabIndex="0"
                onClick={function(e) { self.toggleProp("toggleLog"); e.preventDefault()} }
                onFocus={function(e) { addEventListener("keypress", self.listenForEnterKey)} }
                onBlur={function(e) { removeEventListener("keypress", self.listenForEnterKey)} }>
                <a tabIndex="-1" >Toggle Logarithmic Y Axis</a>
            </li>,
            <li tabIndex="0"
                onClick={function(e) { self.props.log = !self.props.log; self.wquery.setArgument('log', !self.wquery.args.log); e.preventDefault()} }
                onFocus={function(e) { addEventListener("keypress", self.listenForEnterKey)} }
                onBlur={function(e) { removeEventListener("keypress", self.listenForEnterKey)} }>
                <a tabIndex="-1" >Toggle Logarithmic X Axis</a>
            </li>
        ]);
    },

    truncate: truncate
});

export default Histogram;
