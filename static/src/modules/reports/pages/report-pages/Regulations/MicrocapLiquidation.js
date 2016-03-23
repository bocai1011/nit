import React from 'react';
import q from 'common/utils/queryFactory';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, dropdown } from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Microcap Liquidation',
    meta: ['regulation', 'transaction'],

    summary:
        <span>
            In this report we look for a particular class of liquidation of microcap securities.
        </span>,

    render_: function () {

        var price_thresh_dd = dropdown([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5, 'price_thresh');
        var sell_thresh_dd = dropdown([250000, 500000, 1000000, 2000000, 5000000], 500000, 'sell_thresh');

        var overview = q.base.sec_liquidation_overview({
            sell_thresh: sell_thresh_dd.getSelectedValue(),
            price_thresh: price_thresh_dd.getSelectedValue(),
        });

        return (
            <div>
                <Dropdown format='dollars' queries={price_thresh_dd} /> Choose the price threshold a security's max price must fall below in order to qualify as a microcap security.
                <p/>

                <Dropdown format='dollars-only' queries={sell_thresh_dd} /> Choose the threshold for the total notional the firm must have sold for a security to be flagged as being liquidated.
                <p/>

                <Row layout={[12]}>
                    <Scatter
                        query={overview}
                        X='max_price'
                        Y='notional_sold'
                        title="Max Price vs Notional Sold"
                        link={new LinkHelper('Holdings Detail for Security', 'sec')}
                        summary={sb.scatter}
                    />
                </Row>

                <Table
                    query={overview}
                    title={"Security Liquidation Overview"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
