import React from 'react';
import q from 'common/utils/queryFactory';
import {
    Timeseries,
    Histogram,
    Pie,
    Table,
} from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import {
    makeReport,
    get,
    dropdown,
    filter,
    group_and_reduce,
    tradeCosts,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Overview for Broker',
    meta: ['broker', 'overview'],

    summary:
        <span>
            This is an overview report for a specific broker.
            All of the data shown has been filtered to transactions invovling this broker.
        </span>,

	render_: function () {
        var trans = get('transaction');

        var broker_dd = dropdown({
            data: trans,
            col: 'broker',
            ref: 'broker',
        });

        var broker_trans = filter({
            data: trans,
            broker: broker_dd,
        });

        var ts1 = group_and_reduce({
            data: broker_trans,
            grouper: ['date', 'broker'],
            reduce: [
                ['notional', 'sum'],
                ['qty', 'sum'],
                ['price', 'mean'],
                ['comm', 'sum'],
                ['account', 'nunique'],
                ['sec', 'nunique'],
                ['tid', 'count'],
            ],
        });

        trans = tradeCosts(broker_trans);

        let makePie = function (grouper) {
            return q.jsutil.Pie({
                data: trans,
                grouper: [ grouper ],
                field: [ 'notional' ],
            });
        }

        let notionalByCrncy = makePie('sec.crncy.code');
        let notionalBySecType = makePie('sec.sec_type.code');

        return (
            <div>
                You may pick the broker that is the focus of this report here <Dropdown queries={broker_dd} />
                {sb.standardLinks('broker', broker_dd, 'Overview for Broker')}

                <Timeseries
                    query={ts1}
                    title='Transaction Data'
                    summary={"Various details of this broker over time." + sb.multiTimeseriesUsage}
                    chartHeight={700}
                    seriesConfig={[
                        {
                            id: 'mean_price',
                            subitems: ['mean_price'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'sum_comm',
                            subitems: ['sum_comm']
                        }, {
                            id: 'sum_qty',
                            subitems: ['sum_qty'],
                            seriesOptions: ['column']
                        }, {
                            id: 'count_tid',
                            subitems: ['count_tid'],
                            seriesOptions: ['column']
                        }, {
                            id: 'nunique_account',
                            subitems: ['nunique_account'],
                            seriesOptions: ['column']
                        }, {
                            id: 'nunique_sec',
                            subitems: ['nunique_sec'],
                            seriesOptions: ['column']
                        }
                    ]}
                    axesConfig={[
                        {
                            height: 55,
                            ids: ['sum_notional','sum_comm','mean_price'],
                            axesOptions: ['zeroline']
                        },
                        {
                            height: 20,
                            ids: ['sum_qty', 'count_tid'],
                            axesOptions: ['zeroline']
                        },
                        {
                            height: 15,
                            ids: ['nunique_sec'],
                            axesOptions: ['zeroline', { title: { rotation: 0, offset: 100 }}]
                        },
                        {
                            height: 10,
                            ids: ['nunique_account'],
                            axesOptions: [{ title: { rotation: 0, offset: 100 }}]
                        }
                    ]}
                />

                <Row layout={[6, 6]}>
                    <Histogram
                        query={trans} field='qty' yAxis='transaction'
                        title="Transactions by Quantity"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='notional' yAxis='transaction'
                        title="Transactions by Notional"
                        summary={sb.histogram}
                    />
                </Row>

                <Row layout={[6, 6]}>
                    <Histogram
                        query={trans} field='price' yAxis='transaction'
                        title="Transactions by Price"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='trade_cost' yAxis='transaction'
                        title="Transactions by Trade Costs"
                        summary={sb.tradeCostHistogram}
                    />
                </Row>

                <Row layout={[6, 6]}>
                    <Pie
                        query={notionalByCrncy}
                        title='Notional by Currency'
                        summary={sb.pie('notional', 'currency')}
                    />

                    <Pie
                        query={notionalBySecType}
                        title='Notional by Security Type'
                        summary={sb.pie('notional', 'security type')}
                    />
                </Row>

                <Table
                    query={q.base.transaction_summary({grouper:'sec', data:trans})}
                    title='Aggregated Transactions Data'
                    summary={sb.transactionSummary('broker', 'security')}
                />

                <Table
                    query={trans}
                    title='Transaction Detail Data'
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
