import React from 'react';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import LinkHelper from 'reports/utils/LinkHelper';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import {
    makeReport,
    divide,
    group_and_reduce,
    dropdown,
} from 'reports/utils/ReportHelper';
import sb from 'reports/components/StandardBlurbs';

export default makeReport({
    displayName: 'Aggregated Commissions And Fees',
    meta: ['commissions and fees', 'aggregated'],

    summary:
        <span>
            This report provides a high level overview of commissions and fees at the firm level.
            {sb.tradeCostsMeaning}
        </span>,

	render_: function () {
        var tradeCostType = dropdown(
            {'Commissions Only': 'comm', 'Fees Only': 'fee', 'Commissions Plus Fees': 'comm_fee'},
            'Commissions Only'
        );

        var group = dropdown(['account', 'sec', 'broker'], 'account', 'grouper');
        var abs_dd = dropdown({'Apply': true, 'Do not apply': false}, 'Apply');

        var commissions = q.base.get_commissions_underlying({ take_abs_value: abs_dd });
        commissions = divide(commissions, tradeCostType, 'notional', 'pctnotional');
        commissions = divide(commissions, tradeCostType, 'qty', 'pershare');

        commissions = group_and_reduce({
            grouper: group,
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

        var report_ref = q.jsutil.dictionary({
            key: group,
            dic: {
                'sec': "Overview for Security",
                'account': 'Commission Detail for Account',
                'broker': 'Overview for Broker'
            }
        });

        return (
            <div>
                <Dropdown queries={tradeCostType}>{sb.tradeCostDd}</Dropdown>
                <Dropdown queries={abs_dd}>{sb.absFeeDd}</Dropdown>
                <Dropdown queries={group}>
                    Choose how to focus the analysis. Do you want to look at accounts, brokers, or securities?
                </Dropdown>
                <br />

                <Scatter
                    query={commissions}
                    X='mean_pctnotional'
                    Y='max_pctnotional'
                    title='Mean vs Max Percent Notional'
                    link={new LinkHelper(report_ref, group)}
                    summary={sb.scatter}
                />

                <Table
                    query={commissions}
                    title="Commission and Fee Data"
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
