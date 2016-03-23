import React from 'react';
import Row from 'reports/components/layout/Row';
import { getHoldingsSummary } from 'reports/utils/Core';
import LinkHelper from 'reports/utils/LinkHelper';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import { makeReport, get } from 'reports/utils/ReportHelper';
import sb from 'reports/components/StandardBlurbs';

export default makeReport({
    displayName: 'Account Holdings',
    meta: ['account', 'aggregated', 'holdings'],

    summary:
        <span>
            This report provides an overview of account holdings.
        </span>,

    render_: function () {

        var holdings = getHoldingsSummary(['account']);

        return (
            <div>
                <Row layout={[6, 6]}>
                    <Scatter
                        query={holdings}
                        X='mean_market_value_long'
                        Y='abs_mean_market_value_short'
                        title="Long vs Short Holdings"
                        link={new LinkHelper('Holdings Detail for Account', 'account')}
                        summary={sb.scatter}
                    />

                    <Scatter
                        query={holdings}
                        X='mean_abs_market_value'
                        Y='concentration'
                        title="Largest Pct Single Position vs Gross Exposure"
                        link={new LinkHelper('Holdings Detail for Account', 'account')}
                        summary={sb.scatter}
                    />
                </Row>

                <Table
                    query={holdings}
                    title={"Account Holdings Data"}
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
