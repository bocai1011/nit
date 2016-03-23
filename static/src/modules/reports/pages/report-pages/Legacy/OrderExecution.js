import React from 'react';
import _ from 'lodash';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import { Table } from 'reports/components/charts/Widgets';
import { makeReport, dropdown } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Order Execution',
    meta: ['legacy'],

    summary:
        <div>
            <p>
                The Order Execution report can be used to determine if the total number of accounts that a broker trades
                with on a daily basis is above a certain threshold.
            </p>

            <p>
                {sb.corrected}
                {sb.legacy()}
            </p>
        </div>,

	render_: function () {
        var account_dd = dropdown(_.range(5, 11), 10);

        var tbl = q.legacy.get_order_execution({
            min_accounts: account_dd.getSelectedValue(),
        });

        return (
            <div>
                Choose the minimum number of accounts for the threshold here <Dropdown queries={account_dd} />

                <Table
                    query={tbl}
                    title={"Order Execution Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
