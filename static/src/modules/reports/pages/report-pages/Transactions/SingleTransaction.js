import React from 'react';
import q from 'common/utils/queryFactory';
import { Table } from 'reports/components/charts/Widgets';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, filter, get, pick } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Single Transaction',
    meta: ['transaction'],

    summary:
        <span>
            This report focuses on a single transaction as well as related information,
            such as details on the transacted security.
        </span>,

    render_: function() {

        var first = get('exec first oid from transaction');
        var oid = q.jsutil.pass_value({ value: first, ref:'trans_id', }).i(0);
        var tran = filter({ data: get('transaction'), oid: oid, });

        var sec = filter({ data: get('security_master'), oid: pick(tran, 'sec'), });
        var osec = filter({ data: get('security'), id: pick(tran, 'sec') });

        return (
            <div>
                <Table
                    query={tran}
                    title="Transaction Record"
                    summary={[
                        <p>
                            This table shows a single row from the transaction table,
                            corresponding to the desired transaction.
                        </p>,
                        sb.dataUsage,
                    ]}
                />

                <Table
                    query={sec}
                    title="Security Information"
                    summary={[
                        <p>
                            This table shows information about the security involved in the desired transaction.
                            The data shown is rectified information obtained from the data source
                            and from the symbol rectification process during staging.
                        </p>,
                        sb.dataUsage,
                    ]}
                />

                <Table
                    query={osec}
                    title="Registrant Provided Security Information"
                    summary={[
                        <p>
                            This table shows information that the original registrant provided files
                            provided about the security involved in the desired transaction.
                        </p>,
                        sb.dataUsage,
                    ]}
                />
            </div>
        );
    }
});
