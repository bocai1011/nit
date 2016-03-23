import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import ChartMixin from 'reports/components/charts/ChartMixin';
import { widgetLink } from 'reports/utils/ReportHelper';
import numeral from 'numeral';
import format from 'string-format';
import 'heatmap';

var createHeatmapChart = function (dom, dict) {
    var xcol = dict.meta.x.data_columns[0],
        ycol = dict.meta.y.data_columns[0],
        zcol = dict.meta.z.data_columns[0],
        values = _.sortBy(dict.data.pandas.values, [xcol, ycol]),
        x = _.map(values, xcol),
        y = _.map(values, ycol),
        z = _.map(values, zcol),
        raw_z = _.map(values, dict.meta.z.data_columns[1]),
        xlabels = dict.meta.x.value_labels,
        ylabels = dict.meta.y.value_labels,
        data = _.zip(x, y, z),
        raw = _.zip(x, y, raw_z);

    var colors = Highcharts.getOptions().colors;
    var n = 1000;

    Highcharts.chart(dom, {
        credits: false,
        chart: {
            marginTop: 60,
            marginBottom: 20,
            height: n
        },

        tooltip: {
            shared: true,
            formatter: function () {
                var point = this.point,
                    series = this.series,
                    xcat = series.xAxis.categories[point.x],
                    ycat = series.yAxis.categories[point.y],
                    rawValue = raw_z[point.index],
                    pctileRank = numeral(Math.round(point.value)).format('0o'),
                    rawFormatted = numeral(rawValue).format('0.0a');
                return format('{} vs {}<br/><b>%-tile Rank</b>: {}<br/><b>Raw Value</b>: {}', xcat, ycat, pctileRank, rawFormatted);
            }
        },

        title: {
            text: ''
        },

        xAxis: {
            categories: xlabels,
            title: {
                text: dict.meta.x.axis_label
            },
            opposite: true
        },

        yAxis: {
            categories: ylabels,
            gridLineWidth: 0,
            title: {
                text: dict.meta.y.axis_label
            }
        },

        colorAxis: {
            min: 0,
            max: 100,
            minColor: "#eeeeee",
            maxColor: colors[0],
        },

        legend: {
            align: 'right',
            layout: 'vertical',
            margin: 0,
            verticalAlign: 'center',
            y: 25,
            symbolHeight: n - 65 // FIXME: yuck
        },

        exporting: {
            buttons: [],
        },

        series: [{
            name: format(
                '{} vs {}',
                dict.meta.x.axis_label,
                dict.meta.y.axis_label
            ),
            type: 'heatmap',
            borderWidth: 0, // this makes x gridlines disappear
            data: data,
        }],

        plotOptions: {
            heatmap: {
                events: {
                    click: function () {
                        console.log(this);
                        if (self.state.args.linking_to) {
                            // var id = this.series['index'];
                            // var temp = {};
                            // temp[self.state.args.link_value[0][0]] = id;
                            // var foo = {};
                            // foo[self.state.args.link_ref[0]] = temp;
                            // widgetLink(self.state.args.linking_to, foo)
                        }
                    }
                }
            }
        }
    });
};

/**
 * Component for rendering a heatmap widget.
 * @component
 * @exports lib\Components\Charts\Heatmap
 */
const Heatmap = React.createClass({
    displayName: 'Heatmap',
    mixins: [ChartMixin],
    _createChart: createHeatmapChart
});

export default Heatmap;
