import React from 'react';
import { Scatter, Timeseries, Table } from 'reports/components/charts/Widgets';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, get, group_and_reduce } from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Account Performance',
    meta: ['account', 'aggregated', 'performance'],

    summary:
        <span>
            This report contains summary information for the performance of all accounts.
        </span>,

	render_: function () {

        var holdings = get('account_pnl');

        var sum_pnl_summary = group_and_reduce({
            data: holdings,
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

        /* We need to do something better with time series of multiple entities
        without support for crossfilter etc.
        var ts1 = sum({
            grouper: ['date', grouper.getSelectedValue()],
            data: holdings,
            field: ['total_pnl_cumm'],
        });

        var ts2 = sum({
            grouper: ['date', grouper.getSelectedValue()],
            data: holdings,
            field: ['realized_pnl_cumm'],
        });

        var ts3 = sum({
            grouper: ['date', grouper.getSelectedValue()],
            data: holdings,
            field: ['unrealized_pnl_cumm'],
        });*/

        return (
            <div>
                <Row layout={[6, 6]}>
                    <Scatter
                        query={sum_pnl_summary}
                        X='sum_unrealized_pnl_daily'
                        Y='sum_realized_pnl_daily'
                        hoverCols={['account']}
                        link={new LinkHelper('Holdings Detail for Account', 'account')}
                        title='Unrealized vs Realized Profit & Loss'
                        summary={sb.scatter}
                    />

                    <Scatter
                        query={sum_pnl_summary}
                        X='sum_trading_pnl_daily'
                        Y='sum_gross_pnl_daily'
                        hoverCols={['account']}
                        link={new LinkHelper('Holdings Detail for Account', 'account')}
                        title='Trading vs Gross Profit & Loss'
                        summary={sb.scatter}
                    />
                </Row>

                {/* See above about time series.
                <Timeseries
                    query={ts1}
                    title={'Total Profit & Loss'}
                    summary={sb.timeseries('total profit and loss')}
                />

                <Row layout={[6, 6]}>
                    <Timeseries
                        query={ts2}
                        title={'Realized Profit & Loss'}
                        summary={sb.timeseries('realized profit and loss')}
                    />

                    <Timeseries
                        query={ts3}
                        grouper={grouper}
                        title={'Unrealized Profit & Loss'}
                        summary={sb.timeseries('unrealized profit and loss')}
                    />
                </Row>
                */}

                <Table
                    query={sum_pnl_summary}
                    title={"Scatterplot Underlying Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
