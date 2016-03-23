import React from 'react';
import ChartMixin from 'reports/components/charts/ChartMixin';
import Highcharts from 'highcharts';

var createAreaChart = function (dom, dict) {
    var values = dict.data;
    console.log(values);

    Highcharts.chart(dom, {
        credits: false,
        chart: {
            type: 'bubble',
            zoomType: 'xy'
        },

        title: {
            text: ''
        },

        exporting: {
            buttons: [],
        },

        xAxis: {
            title: {
                text: dict.meta.xaxis
            }
        },

        yAxis: {
            title: {
                text: dict.meta.yaxis
            }
        },

        plotOptions: {
            bubble: {
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: dict.meta.xaxis + ': {point.x}, ' + dict.meta.yaxis + ': {point.y}'
                }
            }
        },

        series: values
    });
};

/**
 * Component for rendering a bubble widget.
 * @component
 * @exports lib\Components\Charts\Bubble
 */
const Bubble = React.createClass({
    displayName: 'Bubble',
    mixins: [ChartMixin],
    _createChart: createAreaChart
});

export default Bubble;
