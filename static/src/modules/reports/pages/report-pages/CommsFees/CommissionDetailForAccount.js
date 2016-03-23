import React from 'react';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import LinkHelper from 'reports/utils/LinkHelper';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import {
    makeReport,
    divide,
    filter,
    group_and_reduce,
    dropdown,
    get,
} from 'reports/utils/ReportHelper';
import sb from 'reports/components/StandardBlurbs';

export default makeReport({
    displayName: 'Commission Detail for Account',
    meta: ['account', 'detail', 'commissions and fees'],

    summary:
        <span>
            This report provides commissions and fees details for a single account.
        </span>,

    render_: function() {
        var tradeCostType = dropdown(
            {'Commissions Only': 'comm', 'Fees Only': 'fee', 'Commissions Plus Fees': 'comm_fee'},
            'Commissions Only'
        );

        var account_dd = dropdown({
            data: get('select account:oid from account_master'),
            col: 'account',
        });

        var abs_dd = dropdown({'Apply': true, 'Do not apply': false}, 'Apply');

        var commissions = q.base.get_commissions_underlying({ take_abs_value: abs_dd });

        commissions = filter({
            doc: 'Filter to the selected account.',
            data: commissions,
            account: account_dd,
        });

        commissions = divide(commissions, tradeCostType, 'notional', 'pctnotional');
        commissions = divide(commissions, tradeCostType, 'qty', 'pershare');

        commissions = group_and_reduce({
            grouper: ['sec'],
            data: commissions,
            reduction: [
                [tradeCostType, 'mean'],
                [tradeCostType, 'max'],
                [tradeCostType, 'sum'],
                ['pctnotional', 'mean'],
                ['pctnotional', 'max'],
                ['pershare', 'mean'],
                ['pershare', 'max'],
                ['notional', 'sum']
            ],
        });

        return (
            <div>
                <Dropdown queries={tradeCostType}>{sb.tradeCostDd}</Dropdown>
                <Dropdown queries={abs_dd}>{sb.absFeeDd}</Dropdown>
                <Dropdown queries={account_dd}>
                    You may pick the account that is the focus of this report here.
                </Dropdown>

                {sb.standardLinks('account', account_dd, 'Commission Detail for Account')}
                <br />

                <Scatter
                    query={commissions}
                    X='mean_pctnotional'
                    Y='max_pctnotional'
                    title='Mean vs Max Percent Notional'
                    link={new LinkHelper('Overview for Security', 'sec')}
                    summary={sb.scatter}
                />

                <Table
                    query={commissions}
                    title="Commission and Fee Data"
                    summary={sb.dataTable}
                />
            </div>
        );
    }
});
