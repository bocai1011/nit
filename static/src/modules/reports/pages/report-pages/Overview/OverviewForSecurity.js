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
    materialize,
    group_and_reduce,
    tradeCosts,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Overview for Security',
    meta: ['security', 'overview'],

    summary:
        <span>
            This is an overview report for a specific security.
            All of the data shown has been filtered to transactions invovling this security.
        </span>,

	render_: function () {
        var trans = get('transaction');

        var sec_dd = dropdown({
            data: trans,
            col: 'sec',
        });

        trans = filter({
            data: trans,
            sec: sec_dd,
        });

        var events = materialize(filter({
            data: get('merger_acquisition'),
            sec: sec_dd,
        }));

        var moves = materialize(filter({
            data: q.base.price_events({thresh:4, roll_win:120}),
            sec: sec_dd,
        }));

        var holds = q.base.rehydrate_holdings({
            kind: 'sec',
            arglist: sec_dd,
        });

        var ts1 = group_and_reduce({
            data: trans,
            grouper: ['date', 'sec'],
            reduction: [
                ['notional', 'sum'],
                ['qty', 'sum'],
                ['price', 'mean'],
                ['comm', 'sum'],
                ['tid', 'count'],
                ['broker', 'nunique'],
                ['account', 'nunique'],
            ]
        });

        var ts2 = group_and_reduce({
            data: holds,
            grouper: ['date', 'sec'],
            field: ['total_pnl_cumm',
                    'realized_pnl_cumm',
                    'unrealized_pnl_cumm',
                    'trading_pnl_cumm',
                    'gross_pnl_cumm',
                    'total_comm_cumm'],
            how: ['sum'],
        });

        ts2 = q.base.withPrices({
            data: ts2,
            cols: [
                'open',
                'high',
                'low',
                'close'
            ]
        });

        trans = tradeCosts(trans);

        let makePie = function (grouper) {
            return q.jsutil.Pie({
                data: trans,
                grouper: [ grouper ],
                field: [ 'notional' ],
            });
        }

        let notionalByDir = makePie('side.code');
        let notionalByCrncy = makePie('sec.crncy.code');
        let notionalBySecType = makePie('sec.sec_type.code');

        return (
            <div>
                Choose a security for the drilldown <Dropdown queries={sec_dd} />
                {sb.standardLinks('sec', sec_dd, 'Overview for Security')}

                <Timeseries
                    query={ts1}
                    title='Transaction Data'
                    summary={sb.timeseries('various statistics')}
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
                            id: 'nunique_broker',
                            subitems: ['nunique_broker'],
                            seriesOptions: ['column']
                        }
                    ]}
                    axesConfig={[
                        {
                            height: 55,
                            ids: ['sum_notional','sum_comm','mean_price', 'price_movements', 'mna'],
                            axesOptions: ['zeroline']
                        },
                        {
                            height: 20,
                            ids: ['sum_qty', 'count_tid'],
                            axesOptions: ['zeroline']
                        },
                        {
                            height: 15,
                            ids: ['nunique_broker'],
                            axesOptions: ['zeroline', { title: { rotation: 0, offset: 100 }}]
                        },
                        {
                            height: 10,
                            ids: ['nunique_account'],
                            axesOptions: [{ title: { rotation: 0, offset: 100 }}]
                        }
                    ]}
                    flags={[
                        {
                            query: moves,
                            id: 'price_movements',
                            title: 'Price Movements',
                            onSeries: 'sum_notional',
                            textFn: row => { return 'Price movement of ' + row.stdev_away.toFixed(2) + ' standard deviations'}
                        },
                        {
                            query: events,
                            title: 'Market Events',
                            id: 'mna',
                            onSeries: 'sum_notional',
                            flagOptions: ['mna']
                        }
                    ]}
                />
                <Timeseries
                    query={ts2}
                    title='Total Profit & Loss'
                    summary={sb.timeseries('profit and loss')}
                    chartHeight={600}
                    seriesConfig={[
                        {
                            id: 'ohlc',
                            subitems: ['open', 'high', 'low', 'close'],
                            seriesOptions: ['ohlc']
                        }, {
                            id: 'sum_realized_pnl_cumm',
                            subitems: ['sum_realized_pnl_cumm'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'sum_unrealized_pnl_cumm',
                            subitems: ['sum_unrealized_pnl_cumm'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'sum_trading_pnl_cumm',
                            subitems: ['sum_trading_pnl_cumm'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'sum_gross_pnl_cumm',
                            subitems: ['sum_gross_pnl_cumm'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'sum_total_comm_cumm',
                            subitems: ['sum_total_comm_cumm'],
                            seriesOptions: ['area']
                        }
                    ]}
                    axesConfig={[
                        {
                            height: 80,
                            ids: ['ohlc', 'price_movements', 'mna']
                        },
                        {
                            height: 20,
                            ids: ['sum_total_comm_cumm']
                        }
                    ]}
                    flags={[
                        {
                            query: moves,
                            id: 'price_movements',
                            title: 'Price Movements',
                            onSeries: 'ohlc',
                            textFn: row => { return 'Price movement of ' + row.stdev_away.toFixed(2) + ' standard deviations'}
                        },
                        {
                            query: events,
                            title: 'Market Events',
                            id: 'mna',
                            onSeries: 'ohlc',
                            flagOptions: ['mna']
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
                        title="Transaction by Price"
                        summary={sb.histogram}
                    />

                    <Histogram
                        query={trans} field='trade_cost' yAxis='transaction'
                        title="Transactions by Trade Costs by Count"
                        summary={sb.histogram}
                    />
                </Row>

                <Row layout={[4, 4, 4]}>
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

                    <Pie
                        query={notionalByCrncy}
                        title="Total Notional By Currency"
                        summary={sb.pie('total notional', 'currency')}
                    />
                </Row>

                <Table
                    query={trans}
                    title='Transaction Detail Data'
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
