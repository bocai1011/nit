import React from 'react';
import {
    Timeseries,
    Histogram,
    Pie,
    Table,
} from 'reports/components/charts/Widgets';
import q from 'common/utils/queryFactory';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, get, group_and_reduce } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Firm Wide Transactions',
    meta: ['firm wide', 'transaction'],

    summary:
        <span>
            This report provides a high level view of the trade blotter transactions.
            Every section in this report is taken over the entire trade blotter,
            without distinguishing between accounts, securites, brokers, etc.
        </span>,

	render_: function () {
        var trans = get('transaction');

        var ts1 = group_and_reduce({
            grouper: ['date'],
            data: trans,
            reduction: [
                ['notional', 'sum'],
                ['tid', 'count'],
            ]
        });

        let makePie = function (grouper, field, how) {
            return q.jsutil.Pie({
                data: trans,
                field: [ field ],
                grouper: [ grouper ],
                how: [ how || 'sum' ],
            });
        }

        let notionalByDir = makePie('side.code', 'notional');
        let notionalBySecType = makePie('sec.sec_type.code', 'notional');
        let notionalByCrncy = makePie('sec.crncy.code', 'notional');

        let tradeCntByDir = makePie('side.code', 'tid', 'count');
        let tradeCntBySecType = makePie('sec.sec_type.code', 'tid', 'count');
        let tradeCntByCrncy = makePie('sec.crncy.code', 'tid', 'count');

        return (
            <div>
                <Timeseries
                    query={ts1}
                    title="Notional and Transaction Count"
                    summary={sb.timeseries('traded notional and number of transactions')}
                />

                <Row layout={[4, 4, 4]}>
                    <Histogram
                        query={trans} field='qty' yAxis='transaction'
                        title="Transactions by Quantity"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='price' yAxis='transaction'
                        title="Transactions by Price"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='notional' yAxis='transaction'
                        title="Transactions by Notional"
                        summary={sb.histogram}
                    />
                </Row>

                <Row layout={[4, 4, 4]}>
                    <Pie
                        query={notionalByDir}
                        title="Total Notional by Trade Direction"
                        summary={sb.pie('total notional', 'trade direction')}
                    />

                    <Pie
                        query={notionalBySecType}
                        title="Total Notional by Security Type"
                        summary={sb.pie('total notional', 'security type')}
                    />

                    <Pie
                        query={notionalByCrncy}
                        title="Total Notional by Currency"
                        summary={sb.pie('total notional', 'currency')}
                    />
                </Row>

                <Row layout={[4, 4, 4]}>
                    <Pie
                        query={tradeCntByDir}
                        title="Trade Count by Trade Direction"
                        summary={sb.pie('number of trades', 'trade direction')}
                    />

                    <Pie
                        query={tradeCntBySecType}
                        title="Trade Count By Security Type"
                        summary={sb.pie('number of trades', 'security type')}
                    />

                    <Pie
                        query={tradeCntByCrncy}
                        title="Trade Count By Currency"
                        summary={sb.pie('number of trades', 'currency')}
                    />
                </Row>

                <Table
                    query={trans}
                    title={"Summary"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
