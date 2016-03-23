import _ from 'lodash';
import React from 'react';
import q from 'common/utils/queryFactory';
import { Timeseries, Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import {
    makeReport,
    get,
    dropdown,
    filter,
    materialize,
    group_and_reduce,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Performance Detail for Account, Security',
    meta: ['performance', 'detail', 'account', 'security'],

    summary:
        <span>
            This reports provides an in depth view of the historical performance characteristics
            for any pair of one account and one security.
        </span>,

    render_: function () {

        var acct_dd = dropdown({
            data: get('select account:oid from account_master'),
            col: 'account',
        });

        var sec_dd = dropdown({
            data: filter({
                data: q.core.get_data({
                    table: 'dehydrated_holding',
                }),
                account: acct_dd.getSelectedValue()
            }),
            col: 'sec',
        });

        var filtered_holdings = get('rehydrate_account_sec[{act}; {sec}]', {
            act: acct_dd.getSelectedValue(),
            sec: sec_dd.getSelectedValue()
        });

        var events = materialize(filter({
            data: get('merger_acquisition'),
            sec: sec_dd
        }));

        var moves = materialize(filter({
            data: q.base.price_events({thresh:4, roll_win:120}),
            sec: sec_dd,
        }));

        var filtered_trans = filter({
            data: get('transaction'),
            sec: sec_dd,
            account: acct_dd,
        });

        var ts_pricing = group_and_reduce({
            data: filtered_trans,
            grouper: ['date', 'sec'],
            reduction: [
                ['price', 'max', 'max_price_traded'],
                ['price', 'min', 'min_price_traded'],
            ]
        });

        ts_pricing = q.base.withPrices({
            data: ts_pricing
        });

        var filtered_trans_sell = q.core.filter_by({
            data: filtered_holdings,
            where: [
                ['<', 'change_qty', 0]
            ]
        });

        var filtered_trans_buy = q.core.filter_by({
            data: filtered_holdings,
            where: [
                ['>', 'change_qty', 0]
            ]
        });

        var filtered_trans_buy_sell = q.core.join({
            op: 'uj',
            left_table: get('select date,sec,buy_price:change_price from {d}', {d:filtered_trans_buy}),
            right_table: get('select date,sec,sell_price:change_price from {d}', {d:filtered_trans_sell})
        });

        var ts1 = group_and_reduce({
            grouper: ['date', 'sec'],
            data: filtered_holdings,
            field: [
                'remain_qty',
                'total_pnl_cumm',
                'realized_pnl_cumm',
                'unrealized_pnl_cumm',
                'market_value'],
            how: ['sum']
        });

        ts1 = q.core.join({
            op: 'lj',
            left_table: ts1,
            right_table: get('`date`sec xkey {d}', {d:filtered_trans_buy_sell})
        });

        ts1 = q.base.withPrices({
            data: ts1,
            cols: [
                'open',
                'high',
                'low',
                'close',
                'volume'
            ]
        });

        //
        // Create series configuration

        var seriesConfig = [
            {
                id: 'ohlc',
                subitems: ['open', 'high', 'low', 'close'],
                seriesOptions: ['ohlc']
            }, {
                id: 'buy_price',
                subitems: ['buy_price'],
                seriesOptions: ['uplinescatter']
            }, {
                id: 'sell_price',
                subitems: ['sell_price'],
                seriesOptions: ['downlinescatter']
            }, {
                id: 'volume',
                subitems: ['volume'],
                seriesOptions: ['column']
            }, {
                id: 'remain_qty',
                subitems: ['sum_remain_qty'],
                seriesOptions: ['area']
            }
        ];

        var hiddenSeries = [
            'sum_total_pnl_cumm', 'sum_realized_pnl_cumm',
            'sum_unrealized_pnl_cumm', 'sum_market_value'];

        var hiddenSeriesConfig = _.map(hiddenSeries, (series) => {
            return {
                id: series,
                subitems: [series],
                seriesOptions: [{ visible: false }]
            };
        });

        seriesConfig = _.concat(seriesConfig, hiddenSeriesConfig);

        return (
            <div>
                Choose the account to focus on here <Dropdown queries={acct_dd} />
                {sb.standardLinks('account', acct_dd, 'Performance Detail for Account, Security')}

                Choose the security to focus on here <Dropdown queries={sec_dd} />
                {sb.standardLinks('sec', sec_dd, 'Performance Detail for Account, Security')}

                <Timeseries
                    query={ts1}
                    title={'Total Profit & Loss'}
                    summary={sb.timeseries('total profit and loss')}
                    enableLegend={true}
                    chartHeight={700}
                    seriesConfig={seriesConfig}
                    axesConfig={[
                        {
                            isShared: ['ohlc', 'buy_price', 'sell_price', 'price_movements', 'mna'],
                            height: 50,
                            ids: [
                                'ohlc', 'buy_price', 'sell_price', 'price_movements', 'mna',
                                'sum_total_pnl_cumm', 'sum_realized_pnl_cumm',
                                'sum_unrealized_pnl_cumm', 'sum_market_value'
                            ]
                        },
                        {
                            height: 20,
                            ids: ['volume'],
                            axesOptions: ['zeroline']
                        },
                        {
                            height: 30,
                            ids: ['remain_qty']
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

                <Table
                    query={filtered_holdings}
                    title={"Performance Underlying Data"}
                    summary={sb.dataTable}
                />
            </div>
        )
    },
});
