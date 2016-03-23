import React from 'react';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import {
    Timeseries,
    Table,
    Text,
    Link as DynamicLink,
    WidgetList,
} from 'reports/components/charts/Widgets';
import {
    makeReport,
    filter,
    materialize,
    dropdown,
    abs,
    get,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Holdings Detail for Security',
    meta: ['security', 'holdings', 'detail'],

    summary:
        <span>
            This report provides holdings details for a single security.
        </span>,

    render_: function() {
        // Set of data with one record per {date X sec}.
        var holds = get('sec_pnl');

        var sec_dd = dropdown({
            data: holds,
            col: 'sec',
        });

        var pnl = filter({
            data: holds,
            sec: sec_dd,
        }).
        setDoc('Filter to selected security - this is a time series of holding data.');

        pnl = q.base.withPrices({
            data: pnl,
            cols: [
                'open',
                'high',
                'low',
                'close'
            ]
        });

        var trans = filter({
            data: get('transaction'),
            sec: sec_dd,
        });

        var pnl_ts = pnl.col([
            'date',
            'open',
            'high',
            'low',
            'close',
            'market_value_long',
            'market_value_short',
            'long_count',
            'short_count',
            'max_long',
            'max_short',
            'total_comm_cumm',
            'total_pnl_cumm'
        ]);

        var holdings = q.base.rehydrate_holdings({
            kind: 'sec',
            arglist: sec_dd,
        }).setDoc(
            'Get the full set of {date X account X sec} for a single sec' +
            'the {date X sec} is a full matrix of all dates in the exam and' +
            'all securities ever held by the sec.'
        );

        holdings = abs(holdings, 'market_value', 'abs_market_value');

        var events = materialize(filter({
            data: get('merger_acquisition'),
            sec: sec_dd,
        }));

        var moves = materialize(filter({
            data: q.base.price_events({thresh:4, roll_win:120}),
            sec: sec_dd,
        }));

        return (
            <div>
                Choose a security for the drilldown <Dropdown queries={sec_dd} />
                {sb.standardLinks('sec', sec_dd, 'Holdings Detail for Security')}

                <Timeseries
                    query={pnl_ts}
                    title='Holdings Statistics'
                    summary={sb.timeseries('various statistics')}
                    chartHeight={600}
                    seriesConfig={[
                        {
                            id: 'ohlc',
                            subitems: ['open', 'high', 'low', 'close'],
                            seriesOptions: ['ohlc']
                        }, {
                            id: 'market_value_long',
                            subitems: ['market_value_long'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'market_value_short',
                            subitems: ['market_value_short'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'max_long',
                            subitems: ['max_long'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'max_short',
                            subitems: ['max_short'],
                            seriesOptions: [{ visible: false }]
                        }, {
                            id: 'long_count',
                            subitems: ['long_count'],
                            seriesOptions: ['area', { stacking: 'normal' }]
                        }, {
                            id: 'short_count',
                            subitems: ['short_count'],
                            seriesOptions: ['area', { stacking: 'normal' }]
                        }, {
                            id: 'total_comm_cumm',
                            subitems: ['total_comm_cumm'],
                            seriesOptions: ['area']
                        }
                    ]}
                    axesConfig={[
                        {
                            height: 60,
                            ids: ['ohlc', 'market_value_long', 'market_value_short', 'max_long', 'max_short', 'price_movements', 'mna']
                        }, {
                            height: 20,
                            ids: ['total_comm_cumm'],
                            axesOptions: ['default', 'zeroline', { title: { align: 'high', rotation: 0 }}]
                        }, {
                            isShared: true,
                            height: 20,
                            ids: ['long_count', 'short_count'],
                            axesOptions: ['default', { title: { align: 'high', rotation: 0 }}]
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

                {/*
                <WidgetList grouper={q.jsutil.pass_value({value: 'account'})} query={holdings} title="Spark Line">
                    <DynamicLink title={'account'} linking_to={'Overview for Account'} link_ref={['account']} link_value={[["value"]]} />

                    <Text field="abs_market_value" how="mean" title="Mean Abs Market Value"/>
                    <Text field="trade_qty" how="sum" title="Total Shares Traded"/>

                    <Timeseries
                        field="market_value" how="sum"
                        title="Market Value"
                        summary={sb.timeseries('market value')}
                    />

                    <Text field="total_comm_daily" how="sum" title="Total Comm + Fee Paid"/>
                    <Text field="round_qty" how="sum" title="Total Intraday Roundtrip Shares"/>

                    <Timeseries
                        field="total_pnl_cumm" how="sum"
                        title="Total Profit & Loss"
                        summary={sb.timeseries('total profit and loss')}
                    />
                </WidgetList>
                */}

                <Table
                    query={holdings}
                    title="Daily Holdings Detail"
                    summary={sb.dataTable}
                />

                <Table
                    query={trans}
                    title="All Transactions"
                    summary={sb.dataTable}
                />
            </div>
        );
    }
});
