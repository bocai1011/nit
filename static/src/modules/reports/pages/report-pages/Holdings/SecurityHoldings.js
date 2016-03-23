import React from 'react';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import { getHoldingsSummary } from 'reports/utils/Core';
import LinkHelper from 'reports/utils/LinkHelper';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import { makeReport, get } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Security Holdings',
    meta: ['security', 'aggregated', 'holdings'],

    summary:
        <span>
            This report provides holdings summaries for all securities.
        </span>,

    render_: function () {

        var holdings = getHoldingsSummary(['sec']);

        return (
            <div>
                <Row layout={[6, 6]}>
                    <Scatter
                        query={holdings}
                        X='mean_market_value_long'
                        Y='abs_mean_market_value_short'
                        title="Long vs Short Holdings"
                        link={new LinkHelper('Holdings Detail for Security', 'sec')}
                        summary={sb.scatter}
                    />

                    <Scatter
                        query={holdings}
                        X='mean_abs_market_value'
                        Y='concentration'
                        title="Largest Pct Single Position vs Gross Exposure"
                        link={new LinkHelper('Holdings Detail for Security', 'sec')}
                        summary={sb.scatter}
                    />
                </Row>

                <Table
                    query={holdings}
                    title={"Security Holdings Data"}
                    summary={sb.dataTable}
                />

                <Table
                    query={get('account_sec')}
                    title={"Account/Security Holdings Summary Data"}
                    summary='This table holds summary overview information for the account/security holdings table.'
                />
            </div>
        );
    },
});
