import React from 'react';
import q from 'common/utils/queryFactory';
import {
    Scatter,
    Histogram,
    WidgetList,
    Link as DynamicLink,
    Text,
    Timeseries,
    Table,
} from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import {
    makeReport,
    get,
    dropdown,
    group_and_reduce,
} from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Aggregated Transactions',
    meta: ['aggregated', 'transaction'],

    summary:
        <span>
            This report contains summary information for transactions,
            aggregated over the entire trade blotter, for either accounts, securities, or brokers.
        </span>,

    render_: function () {
        var trans = get('transaction');

        var group = dropdown(['account', 'sec', 'broker'], 'account', 'grouper');

        var alternate = q.jsutil.dictionary({
            dic: {'account': 'nunique_sec', 'broker': 'nunique_sec', 'sec': 'nunique_account'},
            key: group,
        });

        var report_ref = q.jsutil.dictionary({
            key: group,
            dic: {
                'sec': "Transaction Detail for Security",
                'account': 'Transaction Detail for Account',
                'broker': 'Transaction Detail for Broker'
            }
        });

        var tbl = group_and_reduce({
            data: trans,
            grouper: group,
            reduction: [
                ['notional', 'sum'],
                ['notional', 'mean'],
                ['qty', 'sum'],
                ['sec', 'nunique'],
                ['broker', 'nunique'],
                ['account', 'nunique'],
                ['tid', 'count'],
                ['comm', 'mean'],
                ['comm', 'sum'],
            ],
        });

        var trans_summary = q.base.transaction_summary({
            data: trans,
            grouper: q.jsutil.get_value({ array:group, index:0, lift:false }),
            doc: 'Returns the transaction summary for the selected grouper.'
        });

        return (
            <div>
                Choose how to focus the analysis. Do you want to look at accounts, brokers, or securities?
                <Dropdown queries={group} />

                <Row layout={[6, 3, 3]}>
                    <Scatter
                        query={trans_summary}
                        X='notional_bought'
                        Y='notional_sold'
                        title="Total Notional"
                        link={new LinkHelper(report_ref, group)}
                        summary={sb.scatter}
                    />

                    <Histogram
                        query={tbl} field='sum_notional' yAxis={group}
                        title='Total Notional' bins={50}
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={tbl} field='mean_notional' yAxis={group}
                        title='Average Notional' bins={50}
                        summary={sb.histogram}
                    />
                </Row>

                <Row layout={[6, 6]}>
                    <Scatter
                        query={tbl}
                        X='count_tid'
                        Y={alternate}
                        xAxis="Number of Transactions"
                        title="Number of Transactions"
                        link={new LinkHelper(report_ref, group)}
                        summary={sb.scatter}
                    />

                    <Histogram
                        query={tbl} field='count_tid' yAxis={group}
                        title='Transactions'
                        bins={50}
                        summary={sb.histogram}
                    />
                </Row>

                {/* fixme, revisit after wlist polish
                <WidgetList grouper={group} query={trans} title="Spark Line">
                    <DynamicLink title={group.i(0)} linking_to={report_ref} link_ref={group.i(0)} link_value={[["value"]]} />

                    <Text field="notional" how="mean" title="Mean Notional" prefix="$"/>
                    <Text field="notional" how="std" title="Std Notional" prefix="$"/>

                    <Timeseries
                        field="notional"
                        how="sum"
                        title="Notional"
                        summary={sb.timeseries('notional traded')}
                    />

                    <Histogram
                        field="notional"
                        title="Distibution of Average Notional"
                        summary={sb.histogram}
                    />

                    <Text field="price" how="mean" title="Mean Price" prefix="$"/>
                    <Text field="price" how="std" title="Std Price" prefix="$"/>

                    <Timeseries
                        field="price"
                        how="sum"
                        title="Price"
                        summary={sb.timeseries('trade price')}
                    />

                    <Histogram
                        field="price"
                        title="Distibution of Price"
                        summary={sb.histogram}
                    />
                </WidgetList>*/}

                <Table
                    query={trans_summary}
                    title={"Summary"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
