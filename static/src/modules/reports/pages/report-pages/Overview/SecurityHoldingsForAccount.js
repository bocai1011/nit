import React from 'react';
import q from 'common/utils/queryFactory';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, get, dropdown, filter } from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Security Holdings for Account',
    meta: ['security', 'aggregated', 'account', 'holdings'],

    summary:
        <span>
            This report provides holdings summaries for all securities held by a particular account.
        </span>,

    render_: function () {
        var account_sec = get('account_sec');

        var account_dd = dropdown({
            data: account_sec,
            col: 'account',
        });

        var acct_holdings = filter({
            doc: 'Filter the account_sec table to the selected account.',
            data: account_sec,
            account: account_dd,
        });

        acct_holdings = q.jsutil.set_index({
            data: acct_holdings,
            cols: 'sec'
        });

        return (
            <div>
                You may pick the account that is the focus of this report here <Dropdown queries={account_dd} />
                <p/>
                {sb.standardLinks('account', account_dd, 'Security Holdings for Account')}

                <Row layout={[6, 6]}>
                    <Scatter
                        query={acct_holdings}
                        X='realized_pnl_total'
                        Y='unrealized_pnl_total'
                        title="Realized vs Unrealized P&L"
                        link={new LinkHelper('Performance Detail for Account, Security', [['sec', {'value': 'sec'}], ['account', {}, {'value': account_dd}]])}
                        summary={sb.scatter}
                    />

                    <Scatter
                        query={acct_holdings}
                        X='max_long'
                        Y='max_short'
                        title="Biggest Long Position vs Biggest Short Position"
                        link={new LinkHelper('Performance Detail for Account, Security', [['sec', {'value': 'sec'}], ['account', {}, {'value': account_dd}]])}
                        summary={sb.scatter}
                    />
                </Row>

                <Table
                    query={acct_holdings}
                    title={"Security Holdings Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
