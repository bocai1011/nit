import _ from 'lodash';
import React from 'react';
import {
    Timeseries,
    Histogram,
    Table,
} from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import {
    makeReport,
    get,
    dropdown,
    filter,
    group_and_reduce,
    tradeCosts,
    divide,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Comparison between Securities',
    meta: ['security', 'comparison', 'overview'],

    summary:
        <span>
            This report provides a one to one comparison between two distinct securities in terms of various attributes.
        </span>,

	render_: function () {
        var trans = get('transaction');
        var holds = get('dehydrated_holding');

        var sec_dds = dropdown({
            data: trans,
            col: 'sec',
            num: 2,
        });

        trans = filter({
            data: trans,
            sec: sec_dds,
        });

        var ts1 = group_and_reduce({
            grouper: ['date', 'sec'],
            data: trans,
            reduction: [
                ['notional', 'sum'],
                ['account', 'nunique'],
                ['tid', 'count'],
                ['comm', 'mean'],
                ['broker', 'nunique'],
            ],
        });

        trans = tradeCosts(trans);

        trans = divide(trans, 'trade_cost', 'qty', 'trade_cost_per_share').
            setDoc('Trade costs per unit trades, ie trade costs per share traded.');

        trans = divide(trans, 'trade_cost', 'notional', 'trade_cost_pct_notional').
            setDoc('Trade costs as a percentage of notional.');

        var tsvars = ['count_tid','sum_notional','nunique_account','nunique_broker','mean_comm'];

        return (
            <div>
                Please select the two securities you would like to compare.

                First security <Dropdown queries={sec_dds} index={0} />
                Second security <Dropdown queries={sec_dds} index={1} />

                <Timeseries
                    query={ts1}
                    title="Security Details"
                    summary={sb.timeseries('various statistics')}
                    chartHeight={600}
                    seriesConfig={
                        _.map(tsvars, (v) => (
                            { id: v, subitems: [v], seriesOptions: ['compare'] })
                        )
                    }
                    axesConfig={
                        _.map(tsvars, (v) => (
                            { height: 20, ids: [v], axesOptions: ['default', 'compare'] })
                        )
                    }
                />

                <Row layout={[4, 4, 4]}>
                    <Histogram
                        query={trans} field='notional' grouper='sec' yAxis='transaction'
                        title="Transactions by Quantity"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='qty' grouper='sec' yAxis='transaction'
                        title="Transactions by Quantity"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='price' grouper='sec' yAxis='transaction'
                        title="Transactions by Price"
                        summary={sb.histogram}
                    />
                </Row>

                <Row layout={[4, 4, 4]}>
                    <Histogram
                        query={trans} field='trade_cost' grouper='sec' yAxis='transaction'
                        title="Transactions by Trade Cost"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='trade_cost_per_share' grouper='sec' yAxis='transaction'
                        title="Transactions by Trade Costs Per Share"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='trade_cost_pct_notional' grouper='sec' yAxis='transaction'
                        title="Transactions by Trade Costs as a Percentage of Notional"
                        summary={sb.histogram}
                    />
                </Row>

                <Table
                    query={trans}
                    title={"All Transactions"}
                    summary={sb.dataTable}
                />
            </div>
        );
    }
});
