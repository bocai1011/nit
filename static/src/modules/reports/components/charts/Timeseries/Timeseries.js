import React from 'react';
import _ from 'lodash';
import util from 'common/utils/util';
import ChartMixin from 'reports/components/charts/ChartMixin';
import Query from 'reports/utils/query';
import q from 'common/utils/queryFactory';
import Highcharts from 'highcharts/highstock';
import Default from 'reports/components/charts/Timeseries/Default';
import Line from 'reports/components/charts/Timeseries/Line';
import Sparklines from 'reports/components/charts/Timeseries/Sparklines';
import { buildSeries } from 'reports/components/charts/Timeseries/Series';
import { buildAxes } from 'reports/components/charts/Timeseries/Axes';
import { flagKeyFromConfig, buildFlags } from 'reports/components/charts/Timeseries/Flags';

var truncate = function(state) {
    var to_viz = state.data;
    if (to_viz.pandas.axes.columns.values.length > state.view_limit) {
        to_viz['pandas']['axes']['columns']['values'] = to_viz.pandas.axes.columns.values.slice(state.view_offset, state.view_offset + state.view_limit + 1);
    }
    return to_viz;
};

var makeLegend = function (raw, props) {
    if (props.sparkline ||
        !props.enableLegend ||
        raw.pandas.axes.columns.values.length <= 2) {
        return { enabled: false };
    }
    return {
        enabled: true,
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
    };
};

var createTimeseriesChart = function (dom, raw, props, args) {

    var yAxes;
    var values = raw.pandas.values;
    var columns = raw.pandas.axes.columns.values;
    var xdata = _.map(values, columns[0]);
    var series = buildSeries(values, columns, xdata, args.mapping, props);
    var legend = makeLegend(raw, props);

    if (args.flagKey) {
        var flags = buildFlags(args, _.min(xdata), _.max(xdata));
        series = series.concat(flags);
    }

    if (props.sparkline) {
        series = [series[props.rowID]];
        yAxes = {
            endOnTick: false,
            startOnTick: false,
            labels: {
                enabled: false
            },
            title: {
                text: null
            },
            tickPositions: [0]
        }
    } else {
        yAxes = buildAxes(series, props);
    }

    var defaultOpts = Default.highchartsOptions(series, legend, yAxes);
    var lineOpts = Line.highchartsOptions(series, raw);
    var sparklineOpts = Sparklines.highchartsOptions();
    var opts = _.defaultsDeep(props.sparkline ? sparklineOpts : lineOpts, defaultOpts);
    opts.chart.height = props.chartHeight;
    Highcharts.stockChart(dom, opts);
};

/**
 * Component for rendering a Timeseries widget.
 * @component
 * @exports lib\Components\Charts\Timeseries
 */
var Timeseries = React.createClass({
    displayName: 'Timeseries',
    mixins: [ChartMixin],

    spec: {
        exports: ['png', 'csv', 'xlsx']
    },

    _createChart: function(dom, raw) {
        return createTimeseriesChart(dom, raw, this.props, this.state.args || {});
    },

    truncate: truncate,

    widgetQuery: function(query) {
        if (this.props.flags) {
            var { key, newFlags } = flagKeyFromConfig(this.props.flags);
            this.props.flagKey = key;
            _.assign(this.props, newFlags);
        }
        if (this.props.field) {
            query = q.core.materialize({data: query}).col(util.ensureArray(this.props.field));
        }
        return new Query('jsutil.Timeseries', {data: query});
    },

    mapping: function(query) {
        return new Query('jsutil.multi_mapping', {
            data: query
        });
    },

    getInitialState: function() {
        return {
            flags: []
        }
    },

    getDefaultProps: function() {
        return {
            view_limit: 20,
            enableLegend: true,
            chartHeight: 400,
            field: null
        }
    },

    propTypes: {
        view_limit: React.PropTypes.number,
        shared_y: React.PropTypes.bool,
        enableLegend: React.PropTypes.bool,
        chartHeight: React.PropTypes.number,
        pointRadius: React.PropTypes.number,
        flags: React.PropTypes.object,
        field: React.PropTypes.object,
        axesConfig: React.PropTypes.arrayOf(React.PropTypes.object),
        seriesConfig: React.PropTypes.arrayOf(React.PropTypes.object)
    },

    menuAdditions: function () {
        var self = this;
        return (
            <li tabIndex='0'
                onClick={function(e) { self.toggleProp('shared_y'); e.preventDefault()} }
                onFocus={function(e) { addEventListener('keypress', self.listenForEnterKey)} }
                onBlur={function(e) { removeEventListener('keypress', self.listenForEnterKey)} }>
                <a tabIndex='-1' >Toggle Sharing of Y Axis</a>
            </li>
        );
    }
});

export default Timeseries;
