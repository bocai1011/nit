import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import ChartMixin from 'reports/components/charts/ChartMixin';
import util from 'common/utils/util';
import Query from 'reports/utils/query';

var createBarChart = function (dom, raw) {
    var self = this;
    var getValues = function (raw) {

        var categories,
        datapoints,
        data = raw.pandas.values,
        labels = raw.pandas.axes.index.values,
        yLabel = raw.pandas.axes.columns.values,
        mapping = function(key, i){
            var val = (self.state.args.mapping[key] ? self.state.args.mapping[key] : key);
            if (val instanceof Array){
                return (val.length == 1 ? val[0] : val[key])
            }
            return val
        };


            if (labels[0] instanceof Array){
                categories = _.uniq(_.map(labels, 0));
                datapoints = _.zipWith(labels, data, function(x, y){
                    return {name: mapping(x[1], 1), category: mapping(x[0], 0), data: _.values(y)[0]}
                });

            } else {
                categories = labels;
                datapoints = _.zipWith(categories, data, function(x, y){
                    return { name: 0, category: mapping(x), data: y[yLabel] }
                });
            }

        var revmap = _.invert(categories)

        var series = {};
        _.map(datapoints, function(point){
            //create a new entry for this name
            if (!series[point.name]){
                series[point.name] = {
                    name: util.formatName(point.name),
                    //init an empty array
                    data: _.map(_.range(1, categories.length), z => 0)
                };
            }
            //append to the records data
            var ix = revmap[point.category];
            series[point.name].data[ix] = point.data;
        });

        return {
            categories: categories,
            series: _.values(series),
            yLabel: yLabel
        }

    };

    var values = getValues(raw);

    var defaults = {
        credits: false,

        chart: {
            type: 'column',
            plotBackgroundColor: null,
            plotBorderWidth: 1,
            plotShadow: false
        },
        xAxis: {
            categories: values.categories
        },
        yAxis: {
            title: {
                text: values.yLabel
            }
        },
        title: {
            text: ''
        },
        tooltip: {
            headerFormat: '<b>{point.x}</b><br></br>',
            pointFormat: util.formatName((this.stack != 'normal') ? '{series.name}: <b>{point.y}</b>' : '{series.name}: <b>{point.y}</b><br><br/>Total: <b>{point.stackTotal}</b>')
        },

        plotOptions: {
            column: {
                stacking: this.props.stack,
                pointPadding: 0.2,
                borderWidth: 0,
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false,
                    //format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        exporting: {
            buttons: [],
        },
        series: values.series,
        legend: {
            enabled: ((values.series.length > 1) ? true : false),
        }
    };

    Highcharts.chart(dom, util.defaults(this.props.viewProps, defaults));
};

const Bar = React.createClass({
    displayName: 'Bar',
    mixins: [ChartMixin],
    _createChart: createBarChart,

    spec: {
        exports: ['png', 'csv', 'xlsx']
    },

    truncate: function(state) {
        return state.data;
    },

    mapping: function(query) {
        return new Query('jsutil.index_mapping', {
            data: query
        });
    }
});

export default Bar;
