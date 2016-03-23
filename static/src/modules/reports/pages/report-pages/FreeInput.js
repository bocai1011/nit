import React from 'react';
import q from 'common/utils/queryFactory';
import TextInput from 'reports/components/controlWidgets/TextInput';
import { get, makeReport } from 'reports/utils/ReportHelper';
import { Table } from 'reports/components/charts/Widgets';

export default makeReport({
    displayName: 'Free Input',
    meta: [],

    render_: function() {

        var customQuery = q.jsutil.pass_string({value: 'select per_comm:avg abs comm%notional, notional_sum: sum notional, notional_avg: avg notional by account, sec from transaction'});
        var tbl = get(customQuery);

        return (
            <div>
                <TextInput
                    title="Custom Query"
                    text={customQuery}
                />

                <Table
                    query={tbl}
                    title="Table"
                />
            </div>
        );
    }
});
