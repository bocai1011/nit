import React from 'react';
import q from 'common/utils/queryFactory';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import sb from 'reports/components/StandardBlurbs';
import {
    Timeseries,
    Table,
    Pie,
    Text,
    Link as DynamicLink,
    WidgetList,
} from 'reports/components/charts/Widgets';
import {
    makeReport,
    filter,
    dropdown,
    abs,
    get,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Holdings Detail for Account',
    meta: ['account', 'holdings', 'detail'],

    summary:
        <span>
            This report provides holdings details for a single account.
        </span>,

    render_: function() {
        // This is a set of data 1 record per {date X account}.
        var holds = get('account_pnl');

        var account_dd = dropdown({
            data: holds,
            col: 'account',
        });

        var pnl = filter({
            doc: 'Filter to the selected account.',
            data: holds,
            account: account_dd,
        }).
        setDoc('Filter to selected account - this is a time series of holding data.');

        var pnl_ts = pnl.col([
            'date',
            'market_value_long',
            'market_value_short',
            'long_count',
            'short_count',
            'max_long',
            'max_short',
            'total_comm_cumm',
            'total_pnl_cumm'
        ]);

        // This is the full set of {date X account X sec} for a single account.
        // The {date X sec} is a full matrix of all dates in the exam and
        // all securities ever held by the account.
        var holdings = q.base.rehydrate_holdings({
            kind: 'account',
            arglist: account_dd,
        });

        holdings = abs(holdings, 'market_value', 'abs_market_value');

        let makePie = function (grouper) {
            return q.jsutil.Pie({
                data: holdings,
                field: [ 'abs_market_value' ],
                grouper: [ grouper ],
            });
        }

        let holdingBySecType = makePie('sec.sec_type.code');
        let holdingByCrncy = makePie('sec.crncy.code');
        let holdingBySector = makePie('sec.sector.code');

        return (
            <div>
                You may pick the account that is the focus of this report here <Dropdown queries={account_dd} />
                {sb.standardLinks('account', account_dd, 'Holdings Detail for Account')}

                <Timeseries
                    query={pnl_ts}
                    title='Positions and Profit &amp; Loss'
                    summary={sb.timeseries('positions and profits and losses')}
                    chartHeight={600}
                    seriesConfig={[
                        {
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
                            ids: ['market_value_long', 'market_value_short', 'max_long', 'max_short']
                        }, {
                            height: 20,
                            ids: ['total_comm_cumm'],
                            axesOptions: ['default', 'zeroline', { title: { align: 'high', rotation: 0 }}]
                        }, {
                            height: 20,
                            isShared: true,
                            ids: ['long_count', 'short_count'],
                            axesOptions: ['default', { title: { align: 'high', rotation: 0 }}]
                        }
                    ]}
                />

                <Row layout={[4, 4, 4]}>
                    <Pie
                        query={holdingBySecType}
                        title="Mean Daily (Abs) Holding By Security Type"
                        summary={sb.pie('holdings', 'security type')}
                    />

                    <Pie
                        query={holdingByCrncy}
                        title="Mean Daily (Abs) Holding By Currency"
                        summary={sb.pie('holdings', 'currency')}
                    />

                    <Pie
                        query={holdingBySector}
                        title="Mean Daily (Abs) Holding By Sector"
                        summary={sb.pie('holdings', 'sector')}
                    />
                </Row>

                {/* Come back to when we are ready to redress widgetlists
                <WidgetList grouper={q.jsutil.pass_value({value: 'sec'})} query={holdings} title="Security List">
                    <DynamicLink title={'sec'} linking_to={'Overview for Security'} link_ref={['sec']} link_value={[["value"]]} />

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
                </WidgetList>*/}

                <Table
                    query={holdings}
                    title="Daily Holdings Detail"
                    summary={sb.dataTable}
                />
            </div>
        );
    }
});
