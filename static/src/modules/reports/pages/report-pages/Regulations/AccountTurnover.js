import React from 'react';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, dropdown } from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';
import { getTurnoverSummary } from 'reports/utils/Core';

export default makeReport({
    displayName: 'Account Turnover',
    meta: ['regulation', 'holdings', 'commissions and fees'],

    summary:
        <span>
            This report presents various views related to turnover,
            all with respect to individual accounts.
        </span>,

	render_: function () {

        var comm = dropdown(
            {'Commissions Only': 'sum_sum_comm', 'Fees Only': 'sum_sum_fee', 'Commissions Plus Fees': 'sum_sum_comm_fee'},
            'Commissions Only'
        );

        var thresh_dd = dropdown([0, .5, .75, 1, 1.5, 2, 3, 5], 0, 'threshold');

        var holdings_and_fees = getTurnoverSummary(thresh_dd.getSelectedValue());

        return (
            <div>
                <Dropdown queries={comm} /> Please select which trade costs you would like to focus on.
                <p/>

                <Dropdown queries={thresh_dd} format='percent' /> Choose the threshold for total traded notional over largest notional value held.
                If you choose a threshold of 0 (the default) then no filter will be applied and you will be shown all accounts.
                <p/>
                In this report, turnover is calucalated as the minimun of either total notional in the long direction or the total notional in the short direction divided by the maximum of the absolute market value.

                <Row layout={[6, 6]}>
                    <Scatter
                        query={holdings_and_fees}
                        X='sum_sum_notional'
                        Y={comm}
                        hoverCols={['account']}
                        title='Cost of Notional'
                        summary={
                            'This scatterplot presents all accounts in terms of their total commissions/fees vs the total notional value traded.' +
                            sb.corrected
                        }
                        link={new LinkHelper('Overview for Account', 'account')}
                    />

                    <Scatter
                        query={holdings_and_fees}
                        X='max_abs_market_value'
                        Y={comm}
                        hoverCols={['account']}
                        title='Cost of Holdings'
                        summary={
                            'This scatterplot presents all accounts in terms of their total commissions/fees vs the mark-to-market holdings totalled over all days.' +
                            sb.corrected
                        }
                        link={new LinkHelper('Overview for Account', 'account')}
                    />
                </Row>

                <Row layout={[6, 6]}>
                    <Scatter
                        query={holdings_and_fees}
                        X='sum_total_pnl_daily'
                        Y={comm}
                        hoverCols={['account']}
                        title='Breakeven Analysis'
                        summary={
                            'This scatterplot presents all accounts in terms of their total commissions/fees vs the total profit or loss over the period.' +
                            sb.corrected
                        }
                        link={new LinkHelper('Overview for Account', 'account')}
                    />

                    <Scatter
                        query={holdings_and_fees}
                        X='turnover_ratio'
                        xFormat=':.2f'
                        Y='notional_magnitude'
                        hoverCols={['account']}
                        title='Turnover Ratio vs Market Value'
                        summary={
                            'This scatterplot presents the turnover ratio vs the largest market value over all days.' +
                            sb.corrected
                        }
                        link={new LinkHelper('Overview for Account', 'account')}
                    />
                </Row>

                <Table
                    query={holdings_and_fees}
                    title='Turnover Data'
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
