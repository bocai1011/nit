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
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Transaction Detail for Broker',
    meta: ['broker', 'transaction', 'detail'],

    summary:
        <span>
            This report provides a number of broker specific overviews of transaction details.
            All of the data shown has been filtered to transactions invovling the selected broker.
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

        var ts = group_and_reduce({
            data: broker_trans,
            grouper: ['date', 'broker'],
            reduce: [
                ['notional', 'sum', 'sum_notional'],
                ['qty', 'sum', 'sum_qty'],
                ['price', 'mean', 'mean_price'],
                ['oid', 'count', 'number_of_transactions'],
            ],
        });

        let makePie = function (grouper) {
            return q.jsutil.Pie({
                data: broker_trans,
                field: [ 'notional' ],
                grouper: [ grouper ],
            });
        }

        let notionalByDir = makePie('side.code');
        let notionalBySecType = makePie('sec.sec_type.code');
        let notionalByCrncy = makePie('sec.crncy.code');
        let notionalBySector = makePie('sec.sector.code');

        return (
            <div>
                Choose a broker for the deep drilldown <Dropdown queries={broker_dd} />
                {sb.standardLinks('broker', broker_dd, 'Transaction Detail for Broker')}

                <Timeseries
                    query={ts} field={['sum_notional', 'number_of_transactions']}
                    title='Notional'
                    summary={sb.timeseries('notional traded')}
                />

                <Row layout={[4,8]}>
                    <Histogram
                        query={broker_trans} field='qty' yAxis='transaction'
                        title="Transaction Quantity"
                        summary={sb.histogram}
                    />

                    <Timeseries
                        query={ts} field='sum_qty'
                        title='Quantity'
                        summary={sb.timeseries('quantity traded')}
                    />
                </Row>

                <Row layout={[4,8]}>
                    <Histogram
                        query={broker_trans} field='price' yAxis='transaction'
                        title="Transaction Price"
                        summary={sb.histogram}
                    />

                    <Timeseries
                        query={ts} field='mean_price'
                        title='Average Price'
                        summary={sb.timeseries('average price')}
                    />
                </Row>

                <Row layout={[6, 6]}>
                    <Pie
                        query={notionalByDir}
                        title="Total Notional By Trade Direction"
                        summary={sb.pie('total notional', 'trade direction')}
                    />

                    <Pie
                        query={notionalBySecType}
                        title="Total Notional By Security Type"
                        summary={sb.pie('total notional', 'security type')}
                    />
                </Row>

                <Row layout={[6, 6]}>
                    <Pie
                        query={notionalByCrncy}
                        title="Total Notional By Currency"
                        summary={sb.pie('total notional', 'currency')}
                    />
                    <Pie
                        query={notionalBySector}
                        title="Total Notional By Sector"
                        summary={sb.pie('total notional', 'sector')}
                    />
                </Row>

                <Table
                    query={q.base.transaction_summary({grouper:'sec', data:broker_trans})}
                    title="Transaction Summary Data"
                    summary={sb.transactionSummary('broker', 'security')}
                />

                <Table
                    query={broker_trans}
                    title="Transaction Detail For Selected Broker"
                />
            </div>
        );
    },
});
