import React from 'react';
import q from 'common/utils/queryFactory';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, get, group_and_reduce } from 'reports/utils/ReportHelper';
import { getHoldingsSummary } from 'reports/utils/Core';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Account Advantage',
    meta: ['performance', 'advantage', 'account', 'aggregated'],

    summary:
        <span>
            This report contains summary information for trading price advantage for all accounts.
            <p/>

            {sb.advantage}
        </span>,

	render_: function () {

        var account_advantage_per_sec_day =
            q.base.account_advantage_per_sec_day({data: get('daily_aggr_holdings')});

        var account_advantage = group_and_reduce({
            data:account_advantage_per_sec_day,
            grouper: ['account'],
            reduction: [['advantage', 'qty wavg']],
        });

        var account_pnl = group_and_reduce({
            data: get('account_pnl'),
            grouper: ['account'],
            how: ['sum'],
            field: [
                'abs_market_value',
                'total_pnl_daily',
                'realized_pnl_daily',
                'unrealized_pnl_daily',
                'gross_pnl_daily',
                'trading_pnl_daily',
                'total_comm_daily'
            ],
        });

        account_advantage = q.core.join({
            op: 'lj',
            left_table: account_advantage,
            right_table: getHoldingsSummary(['account']),
        });

        account_advantage = q.core.join({
            op: 'lj',
            left_table: account_advantage,
            right_table: account_pnl,
        });

        return (
            <div>
                <Row layout={[6, 6]}>
                    <Scatter
                        query={account_advantage}
                        X='mean_net_exposure'
                        Y='qty_wavg_advantage'
                        title="Average Net Exposure vs Advantage"
                        link={new LinkHelper('Security Advantage for Account', 'sec')}
                        summary={sb.scatter}
                    />

                    <Scatter
                        query={account_advantage}
                        X='sum_trading_pnl_daily'
                        Y='qty_wavg_advantage'
                        title="Total Trading P&L vs Advantage"
                        link={new LinkHelper('Security Advantage for Account', 'sec')}
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
