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
    materialize,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Transaction Detail for Security',
    meta: ['transaction', 'security', 'detail'],

    summary:
        <span>
            This report provides a number of security specific overviews of transaction details.
            All of the data shown has been filtered to transactions invovling a specific security.
        </span>,

	render_: function () {
        var trans = get('transaction');

        var sec_dd = dropdown({
            data: trans,
            col: 'sec',
            ref: 'sec'
        });

        trans = filter({
            data: trans,
            sec: sec_dd,
        });

        var ts = group_and_reduce({
            data: trans,
            grouper: ['date', 'sec'],
            reduction: [
                ['notional', 'sum', 'sum_notional'],
                ['qty', 'sum', 'sum_qty'],
                ['price', 'mean', 'mean_price'],
                ['oid', 'count', 'number_of_transactions'],
            ],
        });

        var events = materialize(filter({
            data: get('merger_acquisition'),
            sec: sec_dd,
        }));

        var moves = materialize(filter({
            data: q.base.price_events({thresh:4, roll_win:120}),
            sec: sec_dd,
        }));

        let makePie = function (grouper) {
            return q.jsutil.Pie({
                data: trans,
                field: [ 'notional' ],
                grouper: [ grouper ],
            });
        }

        let notionalByDir = makePie('side.code');
        let notionalByAccount = makePie('account');
        let notionalByBroker = makePie('broker');

        return (
            <div>
                Choose a security for the drilldown <Dropdown queries={sec_dd} />
                {sb.standardLinks('sec', sec_dd, 'Transaction Detail for Security')}

                <Row layout={[6,6]}>
                    <Timeseries
                        query={ts} field='sum_notional'
                        title='Notional'
                        summary={sb.timeseries('total notional')}
                        flags={[
                            {
                                query: moves,
                                title: 'Price Movements',
                                textFn: row => { return 'Price movement of ' + row.stdev_away.toFixed(2) + ' standard deviations'}
                            },
                            {
                                query: events,
                                title: 'Market Events'
                            }
                        ]}
                    />

                    <Timeseries
                        query={ts} field='number_of_transactions'
                        title='Trade Frequency'
                        summary={sb.timeseries('trade frequency')}
                        flags={[
                            {
                                query: moves,
                                title: 'Price Movements',
                                textFn: row => { return 'Price movement of ' + row.stdev_away.toFixed(2) + ' standard deviations'}
                            },
                            {
                                query: events,
                                title: 'Market Events'
                            }
                        ]}
                    />
                </Row>

                <Row layout={[4,8]}>
                    <Histogram
                        query={trans} field='qty' yAxis='transaction'
                        title="Transaction Quantity"
                        summary={sb.histogram}
                    />

                    <Timeseries
                        query={ts} field='sum_qty'
                        title='Quantity'
                        summary={sb.timeseries('total quantity')}
                        flags={[
                            {
                                query: moves,
                                title: 'Price Movements',
                                textFn: row => { return 'Price movement of ' + row.stdev_away.toFixed(2) + ' standard deviations'}
                            },
                            {
                                query: events,
                                title: 'Market Events'
                            }
                        ]}
                    />
                </Row>

                <Row layout={[4,8]}>
                    <Histogram
                        query={trans} field='price' yAxis='transaction'
                        title="Transaction Price"
                        summary={sb.histogram}
                    />

                    <Timeseries
                        query={ts} field='mean_price'
                        title='Average Price'
                        summary={sb.timeseries('average price')}
                        flags={[
                            {
                                query: moves,
                                title: 'Price Movements',
                                textFn: row => { return 'Price movement of ' + row.stdev_away.toFixed(2) + ' standard deviations'}
                            },
                            {
                                query: events,
                                title: 'Market Events'
                            }
                        ]}
                    />
                </Row>

                <Row layout={[4, 4, 4]}>
                    <Pie
                        query={notionalByDir}
                        title="Total Notional By Trade Direction"
                        summary={sb.pie('total notional', 'trade direction')}
                    />

                    <Pie
                        query={notionalByAccount}
                        title="Total Notional By Account"
                        summary={sb.pie('total notional', 'security type')}
                    />

                    <Pie
                        query={notionalByBroker}
                        title="Total Notional By Broker"
                        summary={sb.pie('total notional', 'currency')}
                    />
                </Row>

                <Table
                    query={q.base.transaction_summary({grouper:'account', data: trans})}
                    title='Account Overview for Selected Security'
                    summary={sb.transactionSummary('security', 'account')}
                />
                <Table
                    query={trans}
                    title="Transaction Detail for Selected Security"
                />
            </div>
        );
    },
});
