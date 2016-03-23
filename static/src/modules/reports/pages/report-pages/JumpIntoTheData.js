import React from 'react';
import q from 'common/utils/queryFactory';
import Row from 'reports/components/layout/Row';
import LinkHelper from 'reports/utils/LinkHelper';
import sb from 'reports/components/StandardBlurbs';
import {
    Histogram,
    Scatter,
    Text,
    Link as DynamicLink,
} from 'reports/components/charts/Widgets';
import {
    makeReport,
    divide,
    group_and_reduce,
    get,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Jump Into the Data',
    meta: [],
    style: 'thin',

    summary:
        <span>
            <p/>This report is intended to provide a high-level overview of the data in the trade blotter, and the different entities in the data.
            <p/>Also provided are links to more detailed reports, visualizations, and analyses.
        </span>,

    render_: function() {
        var trans = get('transaction');

        var trans_by_account = group_and_reduce({
            doc: 'Calculates assorted statistics for each account',
            data: trans,
            groupby: ['account'],
            reduce: [
                ['notional', 'sum'],
                ['broker', 'nunique'],
                ['sec', 'nunique'],
                ['tid', 'count'],
                ['comm', 'mean'],
            ]
        });

        var trans_by_sec = group_and_reduce({
            doc: 'Calculates assorted statistics for each security',
            data: trans,
            groupby: ['sec'],
            reduce: [
                ['notional', 'sum'],
                ['broker', 'nunique'],
                ['account', 'nunique'],
                ['tid', 'count'],
                ['comm', 'mean'],
            ]
        });

        var trans_by_broker = group_and_reduce({
            doc: 'Calculates assorted statistics for each broker',
            data: trans,
            groupby: ['broker'],
            reduce: [
                ['notional', 'sum'],
                ['account', 'nunique'],
                ['sec', 'nunique'],
                ['tid', 'count'],
                ['comm', 'mean'],
            ]
        });

        var stubb = q.jsutil.dictionary({
            dic: {'Commissions Only': "comm", 'Fees Only': "fee", 'Commissions Plus Fees': "comm_fee"},
            key: ['Commissions Plus Fees']
        });

        var commissions = divide(q.base.get_commissions_underlying({}), stubb, 'notional', 'pctnotional');
        var commissions = divide(commissions, stubb, 'qty', 'pershare');

        var drange = q.stagings.get_covered_daterange({trade_blotter_only: true});
        var drange_display = (<Text query={drange} prefix='covering date range: ' format={x => x}/>);

        return (
            <div>
                <h1>Overall</h1>

                <div>
                    <p/>In this blotter there are <Text query={q.core.reduction({data: trans, op:"nunique", col:"oid"})}/> trades, {drange_display}.
                    <p/>To see an overview of all trading as well as to see all individual trades, go to the <DynamicLink linking_to="Firm Wide Transactions"/>.
                </div>

                <h1>Accounts</h1>

                <div>
                    <p/>In this blotter there are <Text query={q.core.reduction({data: trans, op:"nunique", col:"account"})}/> accounts.
                    <p/>Accounts are defined as the entities which hold securities, have cash value, and are the recipients of trades.
                    <p/>To see an overview of all accounts, go to the <DynamicLink linking_to="Aggregated Transactions"/> report.
                    <p/>To see a detailed report on a single account, go to the <DynamicLink linking_to='Overview for Account'/> report.
                    <p/>To see a comparison of two accounts, go to the <DynamicLink linking_to='Comparison between Accounts'/> report.
                </div>

                <Row layout={[4, 8]}>
                    <Histogram
                        query={trans_by_account} field='count_tid' yAxis='account'
                        title='Trades by Notional'
                        summary={sb.comparisonHistogram}
                        log={false}
                        xAxis='Number of Trades'
                    />

                    <Scatter
                        query={trans_by_account}
                        X='sum_notional'
                        xAxis='Total Notional Traded'
                        Y='count_tid'
                        yAxis='Number of Trades'
                        title="Total Notional vs Number of Trades"
                        link={new LinkHelper('Overview for Account', 'account')}
                        summary={sb.scatter}
                    />
                </Row>

                <h1>Securities</h1>

                <div>
                    <p/>In this blotter there are <Text query={q.core.reduction({data: trans, op:"nunique", col:"sec"})}/> securities.
                    <p/>To see an overview of all securities, go to the <DynamicLink linking_to="Aggregated Transactions" link_value={[["value"]]} link_argument={[["sec"]]} link_ref={['grouper']}/> report.
                    <p/>To see a detailed report on a single security, go to the <DynamicLink linking_to="Overview for Security"/> report.
                    <p/>To see a comparison of two securities, go to the <DynamicLink linking_to="Comparison between Securities"/> report.
                </div>

                <Row layout={[4, 8]}>
                    <Histogram
                        query={trans_by_sec} field='nunique_account' yAxis='security'
                        title='Trades by Notional'
                        summary={sb.comparisonHistogram}
                        log={false}
                        xAxis='Number of Accounts active in the Security'
                    />

                    <Scatter
                        query={trans_by_sec}
                        X='count_tid'
                        xAxis='Number of Trades'
                        Y='nunique_account'
                        yAxis='Number of Accounts active in the Security'
                        title="Number of Trades vs Number of Active Accounts"
                        link={new LinkHelper('Overview for Security', 'sec')}
                        summary={sb.scatter}
                    />
                </Row>

                <h1>Brokers</h1>

                <div>
                    <p/>In this blotter there are <Text query={q.core.reduction({data: trans, op:"nunique", col:"broker"})}/> brokers.
                    <p/>To see an overview of all brokers, go to the <DynamicLink linking_to="Aggregated Transactions" link_value={[["value"]]} link_argument={[["broker"]]} link_ref={['grouper']}/> report.
                    <p/>To see a detailed report on a single broker, go to the <DynamicLink linking_to='Overview for Broker'/> report.
                    <p/>To see a comparison of two brokers, go to the <DynamicLink linking_to='Comparison between Brokers'/> report.
                </div>

                <Row layout={[4, 8]}>
                    <Histogram
                        query={trans_by_broker} field='nunique_sec' yAxis='broker'
                        title='Trades by Commission'
                        summary={sb.comparisonHistogram}
                        log={false}
                        xAxis='Number of Securities Traded'
                    />

                    <Scatter
                        query={trans_by_broker}
                        X='nunique_account'
                        xAxis='Number of Accounts'
                        Y='nunique_sec'
                        yAxis='Number of Securities Traded'
                        title="Number of Active Accounts vs Number of Securities Traded"
                        link={new LinkHelper('Overview for Broker', 'broker')}
                        summary={sb.scatter}
                    />
                </Row>

                <h1>Commissions</h1>

                <p/>To get started with analyses on commissions and fees, we recomend looking at <DynamicLink linking_to='Firm Wide Commissions and Fees'/>

                <Row layout={[4, 4, 4]}>
                    <Histogram
                        query={commissions} field={stubb} yAxis='transaction'
                        title="Trade Costs Per Transaction"
                        summary={sb.tradeCostsPerTransaction}
                    />

                    <Histogram
                        query={commissions} field='pershare' yAxis='transaction'
                        title="Trade Costs Per Share"
                        summary={sb.tradeCostsPerShare}
                    />

                    <Histogram
                        query={commissions} field='pctnotional' yAxis='transaction'
                        title="Trade Costs as a Percentage of Notional"
                        summary={sb.tradeCostsPercentNotional}
                    />
                </Row>
            </div>
        );
    }
});
