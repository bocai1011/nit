import React from 'react';
import {
    Timeseries,
    Histogram,
    Pie,
    WidgetList,
    Link as DynamicLink,
    Text,
    Table,
} from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import q from 'common/utils/queryFactory';
import sb from 'reports/components/StandardBlurbs';
import {
    makeReport,
    get,
    dropdown,
    filter,
    group_and_reduce,
    add,
    tradeCosts,
} from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Overview for Account',
    meta: ['account', 'overview'],

    summary:
        <span>
            This is an overview report for a specific account.
            All of the data shown has been filtered to transactions invovling this account.
        </span>,

    render_: function() {
        var account_dd = dropdown({
            data: get('select account:oid from account_master'),
            col: 'account',
        });

        var trans = filter({
            doc: 'Filter the transaction table to the selected account.',
            data: get('transaction'),
            account: account_dd,
        });

        var account_holds = filter({
            doc: 'Filter the account holdings table to the selected account.',
            data: get('account_pnl'),
            account: account_dd,
        });

        var basic_series = group_and_reduce({
            doc: 'Calculate assorted statistics over time for the account.',
            data: trans,
            grouper: ['date', 'account'],
            reduce: [
                ['notional', 'sum'],
                ['qty', 'sum'],
                ['price', 'mean'],
                ['comm', 'sum'],
                ['tid', 'count'],
                ['broker', 'nunique'],
                ['sec', 'nunique'],
            ],
        });

        var pnl_series = group_and_reduce({
            doc: 'Calculate assorted aggregate profits & losses over time for the account.',
            data: account_holds,
            grouper: ['date'],
            field: ['total_pnl_cumm',
                    'realized_pnl_cumm',
                    'unrealized_pnl_cumm',
                    'trading_pnl_cumm',
                    'gross_pnl_cumm'],
            how: ['sum'],
        });

        var position_series = group_and_reduce({
            doc: 'Calculate assorted aggregate holdings and position values over time for the account.',
            data: account_holds,
            grouper: ['date'],
            field: ['abs_market_value',
                    'market_value_long',
                    'market_value_short'],
            how: ['sum'],
        });

        position_series = add(position_series, 'sum_market_value_long', 'sum_market_value_short', 'sum_net_exposure');

        var transWithCosts = tradeCosts(trans);

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
                You may pick the account that is the focus of this report here <Dropdown queries={account_dd} />
                {sb.standardLinks('account', account_dd, 'Overview for Account')}

                <Timeseries
                    query={basic_series}
                    title='Transaction Data'
                    summary={sb.multiTimeseries('various details of this account')}
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
                            id: 'nunique_broker',
                            subitems: ['nunique_broker'],
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
                            ids: ['nunique_broker'],
                            axesOptions: [{ title: { rotation: 0, offset: 100 }}]
                        }
                    ]}
                />

                <Timeseries
                    query={pnl_series}
                    title='Profit &amp; Loss'
                    summary={sb.multiTimeseries('various profit and loss calculations of this account')}
                    axesConfig={[
                        {
                            height: 100,
                            axesOptions: ['zeroline']
                        }
                    ]}
                />

                <Timeseries
                    query={position_series}
                    title='Daily Position'
                    summary={sb.multiTimeseries('total daily positions of this account')}
                    shared_y
                    axesConfig={[
                        {
                            height: 100,
                            axesOptions: ['zeroline']
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
                        query={transWithCosts} field='trade_cost' yAxis='transaction'
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

                {/* FIXME revisit after some WList polish
                <WidgetList grouper='sec' query={trans} title="Top Securities">
                    <DynamicLink title={'Security'} linking_to={'Security-Drilldown'} link_ref={'sec'} link_value={[["value"]]} />

                    <Text field="notional" how="mean" title="Mean Notional"/>
                    <Text field="notional" how="std" title="Std Notional"/>

                    <Timeseries
                        field="notional"
                        how="sum"
                        title="Notional"
                        summary={sb.timeseries('notional traded')}
                    />

                    <Histogram
                        field="notional"
                        how="mean"
                        title="Distibution of Average Notional"
                        summary={sb.histogram}
                    />

                    <Text field="price" how="mean" title="Mean Price"/>
                    <Text field="price" how="std" title="Std Price"/>

                    <Timeseries
                        field="price"
                        how="sum"
                        title="Price"
                        summary={sb.timeseries('trade price')}
                    />

                    <Histogram
                        field="price"
                        how="mean"
                        title="Distibution of Price"
                        summary={sb.histogram}
                    />
                </WidgetList>*/}

                <Table
                    query={trans}
                    title='Transaction Detail Data'
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
