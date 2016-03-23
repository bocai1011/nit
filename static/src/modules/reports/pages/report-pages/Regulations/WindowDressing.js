import React from 'react';
import _ from 'lodash';
import q from 'common/utils/queryFactory';
import { Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, dropdown } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Window Dressing',
    meta: ['regulation', 'window dressing'],

    summary:
        <span>
            The Window Dressing report aggregates daily sales of a security
            that occurred within a given date range around the
            purchase dates of the same security.
        </span>,

	render_: function () {
        var window_dd = dropdown(_.range(5, 11), 10, 'window');

        var tbl = q.legacy.get_window_dressing({
            window: window_dd.getSelectedValue(),
        });

        return (
            <div>
                Select the size of date range <Dropdown queries={window_dd} />

                <Table
                    query={tbl}
                    title={"Window Dressing Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
