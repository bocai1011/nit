import React from 'react';
import q from 'common/utils/queryFactory';
import { Pie, Bar, Scatter, Table } from 'reports/components/charts/Widgets';
import { makeReport } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'NEAT Analytics',
    meta: ['neat'],

    render_: function () {
        var records = q.analytics.get_table_data({});

        var bar2 = q.analytics.get_cpu_by_action({});

        var work = q.analytics.get_work_timeline({});
        var hover_cols = ['action', 'username'];
        var pie = q.analytics.get_report_usage({});

        return (
            <div>
                <Pie query={pie} title="Report Statistics"/>
                <Bar query={bar2} title="Action Statistics"/>
                <Scatter query={work} X='start_stamp' Y='acttype' hoverCols={hover_cols}  title="Work Timeline"/>
                <Table query={records} title="Neat Analytics Records"/>
            </div>
        );
    },
});
