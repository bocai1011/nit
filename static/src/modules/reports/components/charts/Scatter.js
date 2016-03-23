import React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import ChartMixin from 'reports/components/charts/ChartMixin';
import ReportNavigation from 'reports/components/ReportNavigation';
import Query from 'reports/utils/query';
import util from 'common/utils/util';
import Highcharts from 'highcharts';

var createScatterChart = function (dom, raw, props, self) {
    self.spec.exports.push('png');
    var columnNames = raw.pandas.axes.columns.values;

    var getValues = function (raw) {
        var data = raw.pandas.values;
        var hoverCols = columnNames.slice(2);

        var values = _.zip(_.map(data, columnNames[0]), _.map(data, columnNames[1]));

        values = values.map(function(v, i) {

            var pointHover = hoverCols.map(function(col) {
                var namestr = data[i][col];
                var namemap = self.state.args.mapping[props.index || col];

                if (! _.isUndefined(namemap) && ! _.isUndefined(namemap[namestr])) {
                    namestr = namemap[namestr];
                } else if (col.includes && col.includes('date') || col.contains && col.contains('date')) {
                    namestr = Highcharts.dateFormat('%b %e, %Y', new Date(namestr));
                }

                return util.formatName(col) + ': ' + namestr;
            });

            var temp = {
                name: pointHover.join(', '),
                data: [v],
                full: data[i]
            };

            if (_.has(self, 'state.args.link_key')) {
                temp['index'] = _.map(data, self.state.args.link_key)[i];
            } else {
                temp['index'] = i;
            }
            return temp;
        });
        return values
    };

    var values = getValues(raw);

    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
        return Highcharts.Color(color).setOpacity(0.5).get('rgba');
    });

    var defaults = {
        credits: false,
        chart: {
            type: 'scatter',
            zoomType: 'xy',
            style: {
                overflow: 'visible',
                'z-index': 1,
            },
        },

        title: {
            text: ''
        },

        legend: {
            enabled: false,
        },

        exporting: {
            buttons: [],
        },

        xAxis: {
            title: {
                text: self.props.xAxis || util.formatName(columnNames[0])
            }
        },

        yAxis: {
            title: {
                text: self.props.yAxis || util.formatName(columnNames[1])
            }
        },

        plotOptions: {
            scatter: {
                marker: {
                    radius: 8,
                    symbol: 'circle',
                    fillColor: 'rgba(119, 152, 191, .5)',
                    states: {
                        hover: {
                            radius: 12,
                            enabled: true
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: util.formatName('<b>{series.name}</b><br>'),
                    pointFormatter: function() { return util.formatName(columnNames[0]) + ': ' + util.parseNum(this.x, columnNames[0], self.props.xFormat) + '<br>' + util.formatName(columnNames[1]) + ': ' + util.parseNum(this.y, columnNames[0], self.props.xFormat) },
                },
            },
            series: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function () {
                            if (self.state.args.link) {
                                self.state.args.link.followLink(this.series.options.full);
                            }
                        }
                    }
                }
            }
        },

        series: values
    };

    Highcharts.chart(dom, util.defaults(self.props.viewProps, defaults));

    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
        return Highcharts.Color(color).setOpacity(2).get('rgba');
    });
};

/**
 * Component for rendering a scatter plot widget.
 * @component
 * @exports lib\Components\Charts\Scatter
 */
const Scatter = React.createClass({
    displayName: 'Scatter',
    mixins: [ReportNavigation, ChartMixin],

    getDefaultProps: function() {
        return {
            checkHasData: function(data) {
                data = data.wquery.pandas.values;

                return (data.length > 0);
            },
        };
    },

    _createChart: function(dom, raw){
        var self = this;
        return createScatterChart(dom, raw, this.props, self);
    },

    spec: {
        exports: ['png', 'csv', 'xlsx']
    },

    widgetQuery: function(query) {
        var props = this.props;
        return new Query('jsutil.Scatter', {
            data: query,
            X: props.X,
            Y: props.Y,
            hover_cols: props.hoverCols
        });
    },

    truncate: function(state) { return state.data; }
});

export default Scatter;
