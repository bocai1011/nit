import React from 'react';
import { Navigation } from 'react-router';
import $ from 'jquery';
import NeatApp from 'app/utils/NeatApp';
import ReportNavigation from 'reports/components/ReportNavigation';
import 'heatmap';
import 'treemap';
import 'highcharts-more';

var createTreeMap = function (dom, selectId, data, transitionTo) {
    Highcharts.chart(dom, {
        chart: {
            renderTo: selectId,
        },
        series: [{
            type: "treemap",
            layoutAlgorithm: 'strip',
            allowDrillToNode: true,
            dataLabels: {
                enabled: false
            },
            levelIsConstant: false,
            levels: [{
                level: 1,
                dataLabels: {
                    enabled: true
                },
                borderWidth: 3
            }],
            data: data
        }],
        title: {
            text: 'Global Mortality Rate 2012, per 100 000 population'
        }
    });
};

export default React.createClass({
    mixins: [ReportNavigation],

    displayName: 'TreeMap',

    render: function() {
        this.props.name = 'treemap' + this.props.widgetIndex;
        this.props.selectId = this.props.name + "-order";

        return (
            <div className='treemap'>
                <p className='treemap'>
                    Order:
                    <select id={this.props.selectId}>
                        <option value="name">by Name</option>
                        <option value="count">by Frequency</option>
                        <option selected="selected" value="group">by Cluster</option>
                    </select>
                </p>
            </div>
        );
        return <div />;
    },

    componentDidMount: function() {
        var dom = this.getDOMNode();
        createTreeMap(dom, this.props.selectId, this.props.data.data, this.transitionToReport);
    },

    shouldComponentUpdate: function() {
        var dom = this.getDOMNode();
        createTreeMap(dom, this.props.selectId, this.props.data.data, this.transitionToReport);
    }

});
