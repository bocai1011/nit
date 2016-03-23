import React from 'react';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import { Table } from 'reports/components/charts/Widgets';
import { makeReport, divide, dropdown } from 'reports/utils/ReportHelper';
import sb from 'reports/components/StandardBlurbs';

export default makeReport({
    displayName: 'Egregious Commissions and Fees',
    meta: ['regulation', 'commissions and fees',],

    summary:
        <span>
            This report provides views on all trades with a trade cost above a certain threshold.
        </span>,

	render_: function () {
        var tradeCostType = dropdown(
            {'Commissions Only': 'comm', 'Fees Only': 'fee', 'Commissions Plus Fees': 'comm_fee'},
            'Commissions Only'
        );

        var abs_dd = dropdown({'Apply': true, 'Do not apply': false}, 'Apply');

        var commissions = q.base.get_commissions_underlying({ take_abs_value: abs_dd });

        commissions = divide(commissions, tradeCostType, 'notional', 'trade_cost_pct_notional');
        commissions = divide(commissions, tradeCostType, 'qty', 'trade_cost_per_share');

        var thresh_dd = dropdown([.005, .01, .025, .03, .035, .04, .05, .06], .05, 'thresh');

        commissions = q.core.filter_by({
            data: commissions,
            where: [['>', 'trade_cost_pct_notional', thresh_dd.getSelectedValue()]],
        });

        return (
            <div>
                <Dropdown queries={tradeCostType}>{sb.tradeCostDd}</Dropdown>
                <Dropdown queries={abs_dd}>{sb.absFeeDd}</Dropdown>
                <Dropdown queries={thresh_dd} format='percent'>
                    Choose the threshold for the commision as a percent of notional traded.
                </Dropdown>

                <Table
                    query={commissions}
                    title="Commission and Fee Data"
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
