import React from 'react';
import q from 'common/utils/queryFactory';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, group_and_reduce } from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Rule 105',
    meta: ['regulation'],

    summary:
        <span>
            This report presents short sales which happened on securities during the window before secondary offerings where participants of the secondary offering are generally not allowed to sell short. If the firm was participating in the secondary offering, these trades could be in violation of the rules governing secondary offerings.
        </span>,

	render_: function () {

        var suspect_trades = q.legacy.get_rule_105({});

        var accounts = group_and_reduce({
            data: suspect_trades,
            grouper: ['account'],
            reduction: [
                ['sec', 'count'],
                ['qty', 'sum'],
                ['price', 'mean'],
                ['notional', 'sum'],
                ['notional', 'mean'],
                ['i', 'count', 'count_trades'],
            ]
        });

        var securities = group_and_reduce({
            data: suspect_trades,
            grouper: ['sec'],
            reduction: [
                ['account', 'count'],
                ['qty', 'sum'],
                ['price', 'mean'],
                ['notional', 'sum'],
                ['notional', 'mean'],
                ['i', 'count', 'count_trades'],
            ]
        });

        var days = group_and_reduce({
            data: suspect_trades,
            grouper: ['account', 'sec', 'date'],
            reduction: [
                ['qty', 'sum'],
                ['price', 'mean'],
                ['notional', 'sum'],
                ['notional', 'mean'],
                ['i', 'count', 'count_trades'],
            ]
        });

        return (
            <div>
                <Row layout={[6, 6]}>
                    <Scatter
                        query={accounts}
                        X='sum_qty'
                        Y='count_sec'
                        title='Cost of Notional'
                        link={new LinkHelper('Overview for Account', 'account')}
                    />

                    <Scatter
                        query={securities}
                        X='sum_qty'
                        Y='count_account'
                        title='Cost of Notional'
                        link={new LinkHelper('Overview for Security', 'sec')}
                    />
                </Row>

                <Table
                    query={days}
                    title='Possible Rule 105 Violations grouped to days'
                    summary={sb.dataTable}
                />

                <Table
                    query={suspect_trades}
                    title='Possible Rule 105 Violations'
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
