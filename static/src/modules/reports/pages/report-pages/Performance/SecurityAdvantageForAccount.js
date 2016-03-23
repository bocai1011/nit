import React from 'react';
import q from 'common/utils/queryFactory';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import {
    makeReport,
    get,
    dropdown,
    group_and_reduce,
    filter,
} from 'reports/utils/ReportHelper';
import core from 'reports/utils/Core';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Security Advantage for Account',
    meta: ['performance', 'advantage', 'account', 'security', 'aggregated'],

    summary:
        <span>
            This report contains summary information for trading price advantage
            for all securities traded by a specific account.
            <p/>

            {sb.advantage}
        </span>,

	render_: function () {

        var account_advantage_per_sec_day =
            q.base.account_advantage_per_sec_day({data: get('daily_aggr_holdings')});

        var account_dd = dropdown({
            data: account_advantage_per_sec_day,
            col: 'account',
        });

        var trades = group_and_reduce({
            data: filter({data: get('transaction'), account: account_dd}),
            grouper: ['sec'],
            reduction: [['tid', 'count']],
        });

        account_advantage_per_sec_day = filter({
            doc: 'Filter to the selected account.',
            data: account_advantage_per_sec_day,
            account: account_dd,
        });

        var account_advantage = group_and_reduce({
            data:account_advantage_per_sec_day,
            grouper: ['sec'],
            reduction: [['advantage', 'qty wavg']],
        });

        var account_sec = filter({
            data: get('account_sec'),
            account: account_dd,
        });

        account_advantage = q.core.join({
            op: 'lj',
            left_table: account_sec,
            right_table: account_advantage,
        });

        account_advantage = q.core.join({
            op: 'lj',
            left_table: account_advantage,
            right_table: trades,
        });

        account_advantage = q.jsutil.set_index({
            data: account_advantage,
            cols: 'sec'
        });

        return (
            <div>
                You may pick the account that is the focus of this report here <Dropdown queries={account_dd} />
                {sb.standardLinks('account', account_dd, 'Security Advantage for Account')}

                <Row layout={[4, 4, 4]}>
                    <Scatter
                        query={account_advantage}
                        X='count_tid'
                        Y='qty_wavg_advantage'
                        title="Trade Activity vs Advantage"
                        link={new LinkHelper('Performance Detail for Account, Security', [['sec', {'value': 'sec'}], ['account', {}, {'value': account_dd}]])}
                        summary={sb.scatter}
                    />

                    <Scatter
                        query={account_advantage}
                        X='avg_market_value'
                        Y='qty_wavg_advantage'
                        title="Average Market Value vs Advantage"
                        link={new LinkHelper('Performance Detail for Account, Security', [['sec', {'value': 'sec'}], ['account', {}, {'value': account_dd}]])}
                        summary={sb.scatter}
                    />

                    <Scatter
                        query={account_advantage}
                        X='trading_pnl_total'
                        Y='qty_wavg_advantage'
                        title="Total Trading P&L vs Advantage"
                        link={new LinkHelper('Performance Detail for Account, Security', [['sec', {'value': 'sec'}], ['account', {}, {'value': account_dd}]])}
                        summary={sb.scatter}
                    />
                </Row>

                <Table
                    query={account_advantage_per_sec_day}
                    title={"Account Advantage for each Security on each Day"}
                    summary={sb.dataTable}
                />

                <Table
                    query={account_advantage}
                    title={"Total Account Advantage"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
