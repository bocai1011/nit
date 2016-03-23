import React from 'react';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import { Table, Link as DynamicLink } from 'reports/components/charts/Widgets';
import { makeReport, get, dropdown } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Price Quantity By Security',
    meta: ['legacy'],

    summary:
        <div>
            <p>
                The Price Quantity by Security report shows the daily prices for a selected security,
                together with the total quantity traded on any given day.
            </p>

            <p>
                {sb.corrected}
                {sb.legacy('Overview for Security')}
            </p>

            <p>
                We recommend switching your analysis to <DynamicLink linking_to="Holdings Detail for Security" />
            </p>
        </div>,

	render_: function () {
        var trans = get('transaction');

        var sec_dd = dropdown({
            data: trans,
            col: 'sec',
        });

        var tbl = q.legacy.get_price_quantity_by_sec_id({
            sec: sec_dd.getSelectedValue(),
        });

        return (
            <div>
                Choose a security for the analysis <Dropdown queries={sec_dd} />

                <Table
                    query={tbl}
                    title={"Price Quantity Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
