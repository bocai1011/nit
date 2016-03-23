import _ from 'lodash';
import React from 'react';
import q from 'common/utils/queryFactory';
import {
    Link as DynamicLink,
    Table,
    Histogram,
    Timeseries,
    Pie,
    Account,
    Int,
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
    count,
    nunique,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Comparison between Accounts',
    meta: ['account', 'comparison', 'overview'],
    style: 'thin',

    summary:
        <span>
            There are many ways to compare two account.
            Here we overview many different perspectives and provide brief visualizations to outline differences given those persepctives.
            Each section has a different focus and will link you to a more in depth account comparison report.
        </span>,

    render_: function() {
        var account_dds = dropdown({
            data: get('select account:oid from account_master'),
            col: 'account',
            num: 2,
        });

        var trans = filter({
            doc: 'Filter the transaction table to the two selected accounts.',
            data: get('transaction'),
            account: account_dds,
        });

        var details_over_time = group_and_reduce({
            doc: 'Calculate assorted statistics over time for each account.',
            data: trans,
            groupby: ['date', 'account'],
            reduce: [
                ['notional', 'sum'],
                ['broker', 'nunique'],
                ['sec', 'nunique'],
                ['tid', 'count'],
                ['comm', 'mean'],
            ]
        });

        var acct1 = filter({data: trans, account: account_dds.getSelected(0)});
        var acct2 = filter({data: trans, account: account_dds.getSelected(1)});

        var acct1PieByCurrency = q.jsutil.Pie({
            data: acct1,
            field: ['notional'],
            grouper: ['sec.crncy.code'],
        });

        var acct2PieByCurrency = q.jsutil.Pie({
            data: acct2,
            field: ['notional'],
            grouper: ['sec.crncy.code'],
        });

        var acct1PieBySecType = q.jsutil.Pie({
            data: acct1,
            field: ['notional'],
            grouper: ['sec.sec_type.code'],
        });

        var acct2PieBySecType = q.jsutil.Pie({
            data: acct2,
            field: ['notional'],
            grouper: ['sec.sec_type.code'],
        });

        trans = tradeCosts(trans);

        trans = divide(trans, 'trade_cost', 'qty', 'trade_cost_per_share').
            setDoc('Trade costs per unit trades, ie trade costs per share traded.');

        trans = divide(trans, 'trade_cost', 'notional', 'trade_cost_pct_notional').
            setDoc('Trade costs as a percentage of notional.');

        var trans_summary = q.base.transaction_summary({
            data: trans,
            grouper: 'account',
            doc: 'Returns the transaction summary for the two accounts.'
        });

        var tsvars = ['count_tid','sum_notional','nunique_broker','nunique_sec','mean_comm'];

        return (
            <div>
                Please select the two accounts you would like to compare.

                First account <Dropdown queries={account_dds} index={0} />
                Second account <Dropdown queries={account_dds} index={1} />

                <h1>Overview</h1>

                The first account, <Account query={account_dds.getSelected(0)} />, had <Int query={count(acct1)}/> trades over <Int query={nunique(acct1, 'sec')}/> instruments.
                <p/>

                The second account, <Account query={account_dds.getSelected(1)} />, had <Int query={count(acct2)}/> trades over <Int query={nunique(acct2, 'sec')}/> instruments.
                <p/>

                Below is a tabular overview of statistics related to these accounts.
                If you're interested in similar statistics for all acounts, go to the <DynamicLink linking_to="Aggregated Transactions"/> report.

                <Table
                    query={trans_summary}
                    title={"Summary"}
                    summary={sb.dataTable}
                />

                <h1>Daily Values</h1>

                Below is a comparison of details between the two accounts for each day during the exam period. {sb.timeseriesUsage} {sb.multiTimeseriesUsage}

                <Timeseries
                    query={details_over_time}
                    title='Account Details'
                    summary={sb.multiTimeseries('various details of the two selected accounts')}
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

                <h1>Trading Behavior</h1>

                Below are histograms comparing the trading behavior of the two accounts.
                Each histogram shows two distributions, one for each account, focusing on different
                values, summed over the entire trade blotter.

                <Row layout={[4, 4, 4]}>
                    <Histogram
                        query={trans} grouper='account' field='notional' yAxis='transaction'
                        title='Trades by Notional'
                        summary={sb.comparisonHistogram}
                    />

                    <Histogram
                        query={trans} field='qty' grouper='account' yAxis='transaction'
                        title='Trades by Quantity'
                        summary={sb.comparisonHistogram}
                    />

                    <Histogram
                        query={trans} field='price' grouper='account' yAxis='transaction'
                        title='Trades by Price'
                        summary={sb.comparisonHistogram}
                    />
                </Row>

                <h1>Currencies</h1>

                Below we compare the total notional traded for each account, broken down by the currency used in the trades. {sb.totalNotional}

                <Row layout={[6, 6]}>
                    <Pie
                        query={acct1PieByCurrency}
                        title='Account 1 Notional'
                        summary={sb.pie('notional', 'currency')}
                    />

                    <Pie
                        query={acct2PieByCurrency}
                        title='Account 2 Notional'
                        summary={sb.pie('notional', 'currency')}
                    />
                </Row>

                <h1>Security Types</h1>

                Below we compare the total notional traded for each account, broken down by the instrument type of the trades. {sb.totalNotional}

                <Row layout={[6, 6]}>
                    <Pie
                        query={acct1PieBySecType}
                        title='Account 1 Notional'
                        summary={sb.pie('notional', 'security type')}
                    />

                    <Pie
                        query={acct2PieBySecType}
                        title='Account 2 Notional'
                        summary={sb.pie('notional', 'security type')}
                    />
                </Row>

                <h1>Transactions</h1>

                Below is a table of all transactions in your blotters involving either account.

                <Table
                    query={trans}
                    title='Transaction Detail Data'
                    summary={sb.dataTable}
                />
            </div>
        );
    }
});
