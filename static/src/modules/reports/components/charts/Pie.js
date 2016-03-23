/** @module reports/components/charts/Pie */

import React from 'react';
import $ from 'jquery';
import _ from 'lodash';
import q from 'common/utils/queryFactory';
import ChartWrapper from 'reports/utils/Chart/ChartWrapper';
import Chart from 'reports/utils/Chart/Chart';
import ChartItem from 'reports/utils/Chart/ChartItem';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import Query from 'reports/utils/query';
import Highcharts from 'highcharts';
import format from 'string-format';

const menuAdditions = {
    hideLabels: {
        label: 'Toggle Chart Labels',
        defaultValue: false,
    },
    toggleChartType: {
        label: 'Toggle Chart Type (Pie/Bar)',
        defaultValue: false,
    },
};

/**
 * Component for rendering a pie chart widget.
 * @component
 * @exports lib\Components\Charts\Pie
 */
const Pie = React.createClass({

    /**
     * Custom Methods
     * ------------------------------------------------------------------------
     */

    _getValues: function () {

        let { values, axes } = this.props.queryResults.query.pandas;
        var columnNames = axes.columns.values;
        var indexValues = axes.index.values;
        var indexNames = axes.index.names;

        let mappings = NeatApp.getMappings();

        if (columnNames.length === 1) {
            if (indexNames.length === 1) {
                values =  _.map(values, columnNames[0]);
                if (indexValues.length === 1) {
                    var names = i => (mappings[indexNames[0]] ? mappings[indexNames[0]][i] : indexValues[i]);
                } else {
                    var names = i => (mappings[indexNames[0]] ? mappings[indexNames[0]][indexValues[i]] : indexValues[i]);
                }
                values = values.map(function(v, i) {
                    return {
                        name: names(i),
                        y: v,
                        color: Highcharts.getOptions().colors[i]
                    };
                });
                return values;
            } else {
                return _.zip(indexValues, _.map(values, columnNames[0]));
            }
        } else {
            values =  _.zip(_.map(values, columnNames[0]), _.map(values, columnNames[1]));
            values = values.map(function(v, i) {
                return {
                    name: (mappings[indexValues[i]] ? mappings[indexValues[i]] : indexValues[i]),
                    y: v[1],
                    color: Highcharts.getOptions().colors[i]
                };
            });
            return values;
        }
    },

    _renderChart: function () {

        let values = this._getValues();
        let seriesName = this.props.queryResults.query.pandas.axes.columns.values[0];

        let parser = util.columnParser(seriesName, this.props.format);
        let prefix = this.props.prefix || util.prefixNum(seriesName);

        let domNode = this.refs.chart.getDOMNode();

        let { toggleChartType } = this.props.menuChoices;
        let chartType = toggleChartType ? 'column' : 'pie';

        if (_.some(_.map(values, 'y').map(x => x < 0))) {
            chartType = 'column';
        }

        var self = this;

        var defaults = {
            credits: false,

            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: 0,
                plotShadow: false
            },
            title: {
                text: ''
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: !this.props.menuChoices.hideLabels,
                        format: this.props.labels || '<b>{point.name}</b>: {point.percentage:.1f}%  <br/>' + parser('point.y'),
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
                        animation: false
                    },
                    tooltip: {
                        pointFormat: this.props.hover || '<b>{point.percentage:.1f}%</b><br/>' + util.formatName(seriesName) + ': ' + parser('point.y'),
                    },
                },
                column: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: !this.props.menuChoices.hideLabels,
                        format: this.props.labels || parser('point.y'),
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        },
                        animation: false
                    },
                    tooltip: {
                        pointFormatter: function () { return self.props.hover || util.formatName(seriesName) + ': ' + util.parseNum(this.y, seriesName, self.props.format, self.props.prefix) },
                    },
                },
            },
            exporting: {
                buttons: [],
            },
            xAxis: {
                type: 'category'
            },
            style: {
                overflow: 'visible',
                'z-index': 1,
            },
            series: [{
                type: chartType,
                data: values,
                name: util.formatName(seriesName),
                animation: false,
            }],
        };

        Highcharts.chart(domNode, util.defaults(this.props.viewProps, defaults));
    },

    /**
     * React Methods
     * ------------------------------------------------------------------------
     */

    componentDidMount: function () { this._renderChart(); },
    componentDidUpdate: function () { this._renderChart(); },

    render: function () {
        return (
            <div ref='chart' />
        );
    },

});

export default ChartWrapper(Pie, menuAdditions);
