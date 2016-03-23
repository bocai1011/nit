import React from 'react';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import { Table } from 'reports/components/charts/Widgets';
import { makeReport, dropdown } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Mf Rights Of Repo',
    meta: ['legacy'],

    summary:
        <div>
            <p>
                This report focuses on Rights of Repo.
            </p>

            <p>
                {sb.corrected}
                {sb.legacy()}
            </p>
        </div>,

	render_: function () {

        var window_dd = dropdown([5, 10, 20, 50], 10, 'window');

        var tbl = q.legacy.get_mf_rights_of_repo({
            window: window_dd.getSelectedValue(),
        });

        return (
            <div>
                Select the size of date range <Dropdown queries={window_dd} />

                <Table
                    query={tbl}
                    title={"Rights of Repo Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
