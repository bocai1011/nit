import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import moment from 'moment';
import util from 'common/utils/util';
import ChartMixin from 'reports/components/charts/ChartMixin';
import Query from 'reports/utils/query';
import q from 'common/utils/queryFactory';
import Highcharts from 'highcharts/highstock';
import format from 'string-format';

var truncate = function(state) {
    var to_viz = state.data;
    if (to_viz.pandas.axes.columns.values.length > state.view_limit) {
        to_viz['pandas']['axes']['columns']['values'] = to_viz.pandas.axes.columns.values.slice(state.view_offset, state.view_offset + state.view_limit + 1);
    }
    return to_viz;
};

var mapColumn = function(col, value, args) {
    if (args.mapping) {
        if (args.mapping[col]) {
            return args.mapping[col][value];
        } else {
            return value;
        }
    } else {
        return value;
    }
};

var dataZipper = function (values, raw, xdata, args, props) {
    var self = this;
    var data = _.slice(raw.pandas.axes.columns.values, 1, props.view_limit+1).map(function (column_name, i) {
        var columns = JSON.parse(column_name);
        var result = {
            name: columns.map(function(x) {
                if (!_.has(x, 'variable')) {
                    return _.map(x, function(val, key) {
                        return mapColumn(key, val, args);
                    });
                }
            }).join(' '),
            id: column_name, // id is for events
            variable: columns.map(function(x) {
                return _.map(x, function(val, key) {
                    if (key == "variable") {
                        return val;
                    } else {
                        // return '';
                    }
                });
            }).join(''),
            data: _.zip(xdata, _.map(values, column_name)).filter(function(x) {return !_.isNull(x[1])}),
            tooltip: {
                valueDecimals: 2
            },
            yAxis: 0
        };
        if ((!_.isUndefined(props.interpolate) && !props.interpolate) || (!_.isUndefined(props.asPoints) && _.includes(props.asPoints, _.map(columns, 'variable').filter(x => !_.isUndefined(x))[0]))) {
            result['lineWidth'] = 0;
            result['marker'] = {
                enabled : true,
                radius : props.pointRadius || 5
            };
        }
        return result;
    });
    if (props.sparkline) {
        data = [data[props.rowID]];
    }

    if (_.uniq(_.map(data, "name")).length == 1) {
        data = data.map(function(arg) {
            var temp = arg;
            temp.name = '';
            return temp;
        });
    }

    if (_.uniq(_.map(data, "variable")).length > 1) {
        data = data.map(function(arg) {
            var temp = arg;
            temp.name = (temp.name.length ? temp.name + ": " + util.formatName(temp.variable) : util.formatName(temp.variable));
            return temp;
        });
    }

    if (args.flagKey) {
        _.forEach(args.flagKey, key => {
            var events = args[key.ref];
            if (events && (events.pandas.values.length > 0)) {
                var event_columns = events.pandas.axes.columns.values;
                var date_column = key.date_column || _.filter(event_columns, col => _.includes(col, 'date'))[0];

                var events = _.filter(events.pandas.values, row => (row[date_column] >= _.min(xdata)) && (row[date_column] <= _.max(xdata)));
                events = _.sortBy(events, date_column);

                events = events.map((row, i) => {
                    row.x = row[date_column];
                    row.text = key.text ? key.text(row, i) : row.synopsis;
                    row.title = i + 1;
                    return row;
                });

                data.push({
                    type: 'flags',
                    data: events,
                    shape: 'circlepin',
                    onSeries: data[0].id,
                    width: 16,
                    name: key.title || key.ref,
                    id: key.title || key.ref,
                });
            }
        });
    }

    return data;
};

var axesBuilder = function (values, raw, series, props) {

    var columns = raw.pandas.axes.columns.values;

    if (props.sparkline) {
        return {
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
    }

    if (props.shared_y == false || props.shared_y == 'auto'){
        // list of objects containing the obs, filtered of date
        var l_obs = values.map(function(x){ return _.omit(x, 'date') }),
            ncols = columns.length;

        // get maxes of each series
        var maxes = _.reduce(columns.slice(2, ncols), function(a, b){
            a[b] = _.max(l_obs, b)[b]
            return a
        }, _.max(l_obs, columns[1]));

        // of the series maxes, what is the ratio of the range to the maximum
        var diff_factor = function(xs){ return (_.max(xs) - _.min(xs)) / _.max(xs)}(_.values(maxes))
    };

    var axes = _.tail(columns).map(function (ax, index, array) {
        //if diff factor is half the maximum, include seperate axes
        if (props.shared_y == false || props.shared_y == 'auto' && Math.abs(diff_factor) > 0.5){
            series[index].yAxis = index;
        }
        return {
            allowDecimals: false,
            gridLineWidth: 0.5,
            opposite: true,
            labels: {
                text: ax,
                style: {
                    color: Highcharts.getOptions().colors[index]
                },
            }
        }
    });
    return axes
};

var makeLegend = function (raw, props) {
    var legend = {};
    if (raw.pandas.axes.columns.values.length > 2) {
        legend = {
            enabled: (props.sparkline ? false : true),
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 0
        };
    } else {
        legend = {
            enabled: false
        };
    };
    return legend;
};

var createTimeseriesChart = function (dom, raw, props, args) {

    var chart,
        values = raw.pandas.values,
        xdata = _.map(values, raw.pandas.axes.columns.values[0]),
        zipped = dataZipper(values, raw, xdata, args, props),
        legend = makeLegend(raw, props),
        yAxes = axesBuilder(values, raw, zipped, props);

    Highcharts.stockChart(dom, {
        credits: false,

        chart: {
            zoomType: (props.sparkline ? null : 'x'),
            animation : false,

            events: {
                redraw: function () {
                    this.tooltip.hide();
                },
            },

            backgroundColor: (props.sparkline ? null : undefined),
            borderWidth: (props.sparkline ? 0 : undefined),
            type: (props.sparkline ? 'area' : undefined),
            margin: (props.sparkline ? [2, 0, 2, 0] : undefined),
            style: {
                overflow: 'visible',
                'z-index': 1,
            },
            skipClone: (props.sparkline ? true : undefined),

            width: (props.sparkline ? 120 : undefined),
            height: (props.sparkline ? 50 : undefined),
        },

        navigator : {
            enabled : (props.sparkline ? false : true)
        },

        scrollbar : {
            enabled : (props.sparkline ? false : true)
        },

        rangeSelector : {
            selected : 5,
            inputEnabled: (props.sparkline ? false : true),
            buttonTheme: {
                visibility: (props.sparkline ? 'hidden' : 'visible')
            },
            labelStyle: {
                visibility: (props.sparkline ? 'hidden' : 'visible')
            }
        },

        legend: legend,

        xAxis: {
            labels: {
                enabled : (props.sparkline ? false : true),
            },
            startOnTick: (props.sparkline ? false : true),
            endOnTick: (props.sparkline ? false : true),
            title: {
                text: (props.sparkline ? false : util.formatName(raw.pandas.axes.columns.values[0])),
            },
            tickPositions: (props.sparkline ? [] : undefined)
        },

        yAxis: yAxes,

        title: {
            text: util.formatName((props.sparkline ? false : (_.uniq(_.map(zipped, "variable")).length <= 1) ? zipped[0].variable : ''))
        },

        tooltip: (props.sparkline ? {
            hideDelay: 0,
            formatter: function () {
                var key;
                if (_.isUndefined(this.series)) {
                    var points = this.points;
                    key = this.points[0].key;
                    return format('{}<br />', moment(key).format('dddd, MMMM Do YYYY')) + points.map(function (point, i) {
                        var s = point.series;
                        return format('<span style="color: {}">\u25cf</span> {}: <b>{}</b>', s.color, s.name, util.parseNum(point.y, point.series.options.variable));
                    }).join("<br />");
                } else {
                    key = moment(this.key).format('dddd, MMMM Do YYYY');
                    return format('{}<br />{}', key, this.point.text);
                }
            },
            style: {
                cursor: 'default'
            }
        }: {
            borderWidth: 0,
            shadow: false,
            hideDelay: 0,
            shared: true,
            padding: 0,
            positioner: function (w, h, point) {
                var x = point.plotX - w / 2;

                if (x < -5) {
                    x = point.plotX - w / 4;

                    if (x < -5) {
                        x = point.plotX;
                    }
                }

                return {
                    x: x,
                    y: point.plotY - h - 20
                };
            },
            formatter: function () {
                var key;
                if (_.isUndefined(this.series)) {
                    var points = this.points;
                    key = this.points[0].key;
                    var temp = format('{}<br />', moment(key).format('dddd, MMMM Do YYYY')) + points.map(function (point, i) {
                        var s = point.series;
                        return format('<span style="color: {}">\u25cf</span> {}: <b>{}</b>', s.color, s.name, util.parseNum(point.y, point.series.options.variable));
                    }).join("<br />");
                    return temp
                } else {
                    key = moment(this.key).format('dddd, MMMM Do YYYY');
                    return format('{}<br />{}', key, this.point.text);
                }
            },
            style: {
                cursor: 'default'
            }
        }),

        plotOptions: (props.sparkline ? {
            series: {
                animation: false,
                lineWidth: 2,
                shadow: false,
                states: {
                    hover: {
                        lineWidth: 2
                    }
                },
                marker: {
                    radius: 1,
                    states: {
                        hover: {
                            radius: 2
                        }
                    }
                },
                fillOpacity: 0.25
            },
            column: {
                negativeColor: '#910000',
                borderColor: 'silver'
            }
        } : {}),

        exporting: {
            buttons: [],
        },

        series: zipped
    },

    (props.sparkline ? function (e) {
        chart = Highcharts.chart(dom);

        var previousMin, previousMax, lastMove;

        var currentZoom = function () {
            var vals = chart.xAxis[0].getExtremes();
            return (vals.max - vals.min) / (vals.dataMax - vals.dataMin);
        };

        var extremes = function () {
            return chart.xAxis[0].getExtremes();
        };

        var mouseToVal = function(e){
            var normalized = chart.pointer.normalize(e);
            return chart.xAxis[0].toValue(normalized.chartX);
        };

        $(dom).bind('mousewheel', function(e, delta) {
            var vals = extremes();

            var range = vals.dataMax - vals.dataMin;
            var zoom = (vals.max - vals.min) / range;

            var mid = (vals.max + vals.min) / 2;
            var mouseValX = mid;

            if (!_.isUndefined(lastMove)) {
                mouseValX = mouseToVal(lastMove);
            }

            var left = mouseValX - vals.min;
            var right = vals.max - mouseValX;

            if (delta > 0) {
                zoom /= 1.17;
                left /= 1.17;
                right /= 1.17;
            }
            else if (delta < 0) {
                zoom *= 1.17;
                left *= 1.17;
                right *= 1.17;
            }

            // Centered zooming, zoom around the center of the currently visible data.
            //var new_min = Math.max(vals.dataMin, mid - range * zoom / 2);
            //var new_max = Math.min(vals.dataMax, mid + range * zoom / 2);

            // Point zooming, zoom around the location of the mouse.
            var new_min = Math.max(vals.dataMin, mouseValX - left);
            var new_max = Math.min(vals.dataMax, mouseValX + right);

            chart.xAxis[0].setExtremes(new_min, new_max);
            previousMin = undefined;
            previousMax = undefined;

            chart.tooltip.hide();
        });

        $(dom).bind('mousemove', function (e) {
            lastMove = e;
        });

        chart.container.addEventListener('dblclick', function(e) {
            var zoom = currentZoom();
            if (zoom < 0.98 || _.isUndefined(previousMin) || _.isUndefined(previousMax)) {
                var vals = extremes();
                previousMin = vals.min;
                previousMax = vals.max;

                chart.zoomOut();
            } else {
                chart.xAxis[0].setExtremes(previousMin, previousMax);
            }

            e.preventDefault();
        }, false);
    } : function(e) {}));
};

/**
 * Component for rendering a Timeseries widget.
 * @component
 * @exports lib\Components\Charts\Timeseries
 */
const Timeseries = React.createClass({
    displayName: 'Timeseries',
    mixins: [ChartMixin],

    spec: {
        exports: ['png', 'csv', 'xlsx'],
        shared_y: 'auto',
    },

    _createChart: function(dom, raw) {
        return createTimeseriesChart(dom, raw, this.props, this.state.args || {});
    },

    truncate: truncate,

    widgetQuery: function(query) {
        var self = this;
        if (this.props.flags) {
            var key;
            if (this.props.flags instanceof Query) {
                key = [{ref: 'flags'}];
            } else if (this.props.flags instanceof Array) {
                key = this.props.flags.map((flag, i) => {
                    if (flag instanceof Query) {
                        self.props['flags' + i] = flag
                        return {ref: 'flags' + i}
                    } else if (flag instanceof Object) {
                        self.props['flags' + i] = flag.query;
                        flag.ref = 'flags' + i;
                        return flag;
                    }
                });
            } else if (this.props.flags instanceof Object) {
                self.props['flags' + i] = this.props.flags.query;
                this.props.flags.ref = 'flags' + i;
                key = this.props.flags;
            } else {
                //
            }
            self.props.flagKey = key;
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

    getDefaultProps: function() {
        return {
            view_limit: 10
        }
    },

    menuAdditions: function () {
        var self = this;
        return (
            <li tabIndex="0"
                onClick={function(e) { self.toggleProp("shared_y"); e.preventDefault()} }
                onFocus={function(e) { addEventListener("keypress", self.listenForEnterKey)} }
                onBlur={function(e) { removeEventListener("keypress", self.listenForEnterKey)} }>
                <a tabIndex="-1" >Toggle Sharing of Y Axis</a>
            </li>
        );
    }
});

export default Timeseries;
