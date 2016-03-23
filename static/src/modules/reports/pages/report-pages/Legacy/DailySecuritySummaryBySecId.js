import React from 'react';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import { Table, Link as DynamicLink } from 'reports/components/charts/Widgets';
import { makeReport, dropdown, get } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Daily Security Summary',
    meta: ['legacy'],

    summary:
        <div>
            <p>
                Daily Security Summary report is a specialized case of the Security Summary report.
                For a user-specified security, the Daily Security Summary report presents
                the daily aggregated time seriesof trades in that security.
            </p>

            <p>
                {sb.corrected}
                {sb.legacy('Overview for Security')}
            </p>
        </div>,

	render_: function() {

        var trans = get('transaction');

        var sec_dd = dropdown({
            data: trans,
            col: 'sec'
        });

        var tbl = q.legacy.get_daily_security_summary_by_sec_id({
            sec: sec_dd.getSelectedValue(),
        });

        return (
            <div>
                <p>
                    We recommend switching your analysis to
                    <DynamicLink linking_to="Transaction Detail for Security" link_value={[["value"]]} query={sec_dd.getSelected(0)} link_ref={['sec']}>
                        Transaction Detail for Security
                    </DynamicLink>
                </p>
                Choose a security for the summary <Dropdown queries={sec_dd} />

                <Table
                    query={tbl}
                    title={"Daily Security Summary By Sec Id Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
