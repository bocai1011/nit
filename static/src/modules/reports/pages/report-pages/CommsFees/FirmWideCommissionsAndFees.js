import React from 'react';
import { castArray } from 'lodash';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import { Histogram, Table, Pie} from 'reports/components/charts/Widgets';
import { makeReport, divide, dropdown} from 'reports/utils/ReportHelper';
import sb from 'reports/components/StandardBlurbs';

export default makeReport({
    displayName: 'Firm Wide Commissions and Fees',
    meta: ['firm wide', 'commissions and fees',],

    summary:
        <span>
            This report provides views on commissions and fees for the entire firm.
        </span>,

	render_: function () {
        var tradeCostType = dropdown(
            {'Commissions Only': 'comm', 'Fees Only': 'fee', 'Commissions Plus Fees': 'comm_fee'},
            'Commissions Only'
        );

        var abs_dd = dropdown({'Apply': true, 'Do not apply': false}, 'Apply');

        var commissions = q.base.get_commissions_underlying({ take_abs_value: abs_dd });
        commissions = divide(commissions, tradeCostType, 'notional', 'comm_pct_notional');
        commissions = divide(commissions, tradeCostType, 'qty', 'comm_per_share');

        let makePie = function (grouper, how) {
            return q.jsutil.Pie({
                data: commissions,
                field: castArray(tradeCostType),
                grouper: castArray(grouper),
                how: castArray(how),
            });
        }

        let meanCostByDir = makePie('side.code', 'mean');
        let meanCostBySecType = makePie('sec.sec_type.code', 'mean');
        let meanCostByCrncy = makePie('sec.crncy.code', 'mean');

        let totalCostByDir = makePie('side.code', 'sum');
        let totalCostBySecType = makePie('sec.sec_type.code', 'sum');
        let totalCostByCrncy = makePie('sec.crncy.code', 'sum');

        return (
            <div>
                <Dropdown queries={tradeCostType}>{sb.tradeCostDd}</Dropdown>
                <Dropdown queries={abs_dd}>{sb.absFeeDd}</Dropdown>

                <Row layout={[4, 4, 4]}>
                    <Histogram
                        query={commissions} field={tradeCostType} yAxis='transaction'
                        title="Trade Costs"
                        summary={sb.tradeCostsPerTransaction}
                    />

                    <Histogram
                        query={commissions} field='comm_per_share' yAxis='transaction'
                        title="Trade Costs Per Share"
                        summary={sb.tradeCostscomm_per_share}
                    />

                    <Histogram
                        query={commissions} field='comm_pct_notional' yAxis='transaction'
                        title="Trade Costs as a Percentage of Notional"
                        summary={sb.tradeCostsPercentNotional}
                    />
                </Row>

                <Row layout={[4, 4, 4]}>
                    <Pie
                        query={meanCostByDir}
                        title='Mean Trade Costs by Trade Direction'
                        summary={sb.pie('mean trade costs', 'trade direction')}
                    />

                    <Pie
                        query={meanCostBySecType}
                        title='Mean Trade Costs by Security Type'
                        summary={sb.pie('mean trade costs', 'security type')}
                    />

                    <Pie
                        query={meanCostByCrncy}
                        title='Mean Trade Costs by Currency'
                        summary={sb.pie('mean trade costs', 'currency')}
                    />
                </Row>

                <Row layout={[4, 4, 4]}>
                    <Pie
                        query={totalCostByDir}
                        title='Total Trade Costs by Trade Direction'
                        summary={sb.pie('total trade costs', 'trade direction')}
                    />

                    <Pie
                        query={totalCostBySecType}
                        title='Total Trade Costs by Security Type'
                        summary={sb.pie('total trade costs', 'security type')}
                    />

                    <Pie
                        query={totalCostByCrncy}
                        title='Total Trade Costs by Currency'
                        summary={sb.pie('total trade costs', 'currency')}
                    />
                </Row>

                <Table
                    query={commissions}
                    title="Commission and Fee Data"
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
