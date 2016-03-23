import React from 'react';
import _ from 'lodash';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import { Table} from 'reports/components/charts/Widgets';
import { makeReport, dropdown } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Employee Trades',
    meta: ['legacy'],

    summary:
        <div>
            <p>
                This report lists employee trades in the same security the firm traded in, right before and after the firm traded.
            </p>

            <p>
                {sb.corrected}
                {sb.legacy('Overlap between Employee and Firm Trading')}
            </p>
        </div>,

	render_: function () {
        var blackout_dd = dropdown(_.range(5,16), 10, 'window');

        var tbl = q.legacy.get_employee_trades({
            blackout_window: blackout_dd.getSelectedValue(),
        });

        return (
            <div>
                We check for employee trades in a window around firm trades.
                Select the size of the window in days <Dropdown queries={blackout_dd} />

                <Table
                    query={tbl}
                    title={"Employee Trade Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
