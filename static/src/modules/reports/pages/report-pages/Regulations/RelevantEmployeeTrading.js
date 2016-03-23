import React from 'react';
import q from 'common/utils/queryFactory';
import { Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, dropdown } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Relevant Employee Trading',
    meta: ['employee', 'regulation'],

    summary:
        <div>
            <p>
                This report provides statistics for each employee pertaining to overlaps between the employee's trading and the firm's trading.
            </p>

            <p>
                {sb.corrected}
            </p>
        </div>,

	render_: function () {
        var blackout_dd = dropdown([5, 10, 20, 50], 10, 'window');

        var tbl = q.legacy.get_employee_trades({
            blackout_window: blackout_dd.getSelectedValue(),
        });

        return (
            <div>
                We check for employee trades in a window around firm trades.
                Select the size of the window in days <Dropdown queries={blackout_dd} />

                <Table
                    query={tbl}
                    title={"Employee Trade Summary Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
