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
    divide,
    tradeCosts,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Comparison between Brokers',
    meta: ['broker', 'comparison', 'overview'],
    summary:
        <span>
            This report provides a one to one comparison between two distinct brokers in terms of various attributes.
        </span>,

	render_: function () {
        var trans = get('transaction');

        var broker_dds = dropdown({
            data: trans,
            col: 'broker',
            num: 2,
        });

        var filtered_trans = filter({
            doc: 'Filter the transaction table to the two selected brokers.',
            data: trans,
            broker: broker_dds,
        });

        var details_over_time = group_and_reduce({
            doc: 'Calculate assorted statistics over time for each broker.',
            grouper: ['date', 'broker'],
            data: filtered_trans,
            reduce: [
                ['notional', 'sum'],
                ['account', 'nunique'],
                ['sec', 'nunique'],
                ['tid', 'count'],
                ['comm', 'mean'],
            ]
        });

        trans = tradeCosts(trans);

        trans = divide(trans, 'trade_cost', 'qty', 'trade_cost_per_share').
            setDoc('Trade costs per unit trades, ie trade costs per share traded.');

        trans = divide(trans, 'trade_cost', 'notional', 'trade_cost_pct_notional').
            setDoc('Trade costs as a percentage of notional.');

        var tsvars = ['count_tid','sum_notional','nunique_account','nunique_sec','mean_comm'];

        return (
            <div>
                Please select the two brokers you would like to compare.

                First broker <Dropdown queries={broker_dds} index={0} />
                Second broker <Dropdown queries={broker_dds} index={1} />

                <Timeseries
                    query={details_over_time}
                    title="Broker Details"
                    summary={"Various details of the two selected brokers over time." + sb.multiTimeseriesUsage}
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
                        query={trans} field='notional' grouper='broker' yAxis='transaction'
                        title="Trades by Notional"
                        summary={sb.comparisonHistogram}
                    />

                    <Histogram
                        query={trans} field='qty' grouper='broker' yAxis='transaction'
                        title="Trades by Quantity"
                        summary={sb.comparisonHistogram}
                    />

                    <Histogram
                        query={trans} field='price' grouper='broker' yAxis='transaction'
                        title="Trades by Price"
                        summary={sb.comparisonHistogram}
                    />
                </Row>

                <Row layout={[4, 4, 4]}>
                    <Histogram
                        query={trans} field='trade_cost' grouper='broker' yAxis='transaction'
                        title="Trades by Trade Costs"
                        summary={sb.comparisonHistogram}
                    />

                    <Histogram
                        query={trans} field='trade_cost_per_share' grouper='broker' yAxis='transaction'
                        title="Trades by Trade Costs per Share"
                        summary={sb.comparisonHistogram}
                    />

                    <Histogram
                        query={trans} field='trade_cost_pct_notional' grouper='broker' yAxis='transaction'
                        title="Trades by Trade Costs over Notional"
                        summary={sb.comparisonHistogram}
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
