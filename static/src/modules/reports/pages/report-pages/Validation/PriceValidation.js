import React from 'react';
import q from 'common/utils/queryFactory';
import { Scatter, Pie, Table } from 'reports/components/charts/Widgets';
import Row from 'reports/components/layout/Row';
import { makeReport } from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Price Validation',
    meta: ['validation'],

    summary:
        <span>
            This report focuses on validating the trading prices reported for all transactions in the trade blotter.
            In particular we highlight trades where the trade price falls outside the high-low for the transacted security.
        </span>,

    render_: function() {

        var prices = q.base.price_validation({});
        var too_low = q.core.filter_by({
            data: prices,
            where: [
                ['<', 'down', 0],
                ['=', 'side', 1], // filtering to only buys
            ]
        });
        var too_high = q.core.filter_by({
            data: prices,
            where: [
                ['>', 'up', 0],
                ['=', 'side', 0], // filtering to only sells
            ]
        });

        let makePie = function (data, grouper) {
            return q.jsutil.Pie({
                data,
                grouper: [ grouper ],
                field: [ 'index' ],
                how: [ 'count' ],
            });
        }

        let accountsUnderLow = makePie(too_low, 'account');
        let securitiesUnderLow = makePie(too_low, 'sec');
        let accountsAboveHigh = makePie(too_high, 'account');
        let securitiesAboveHigh = makePie(too_high, 'sec');

        return (
            <div>
                <Row layout={[6, 6]}>
                    <Scatter
                        query={too_low}
                        title="Purchases priced below the daily low"
                        X="price"
                        xAxis="Price"
                        Y="down"
                        yAxis="How far below the daily low"
                        link={new LinkHelper('Single Transaction', ['trans_id', {'value': 'index'}])}
                    />
                    <Scatter
                        query={too_high}
                        title="Sales priced above the daily high"
                        X="price"
                        xAxis="Price"
                        Y="up"
                        yAxis="How far above the daily high"
                        link={new LinkHelper('Single Transaction', ['trans_id', {'value': 'index'}])}
                    />
                </Row>
                <Row layout={[3, 3, 3, 3]}>
                    <Pie
                        query={accountsUnderLow}
                        title='Accounts with purchases below the daily low'
                        grouper='account'
                        field='index'
                        how='count'/>
                    <Pie
                        query={securitiesUnderLow}
                        title='Securities with purchases below the daily low'
                        grouper='sec'
                        field='index'
                        how='count'/>
                    <Pie
                        query={accountsAboveHigh}
                        title='Accounts with sales above the daily high'
                        grouper='account'
                        field='index'
                        how='count'/>
                    <Pie
                        query={securitiesAboveHigh}
                        title='Securities with sales above the daily high'
                        grouper='sec'
                        field='index'
                        how='count'/>
                </Row>
                <Table
                    query={prices.col([
                        'date',
                        'index',
                        'account',
                        'sec',
                        'sec.cusip',
                        'price',
                        'low',
                        'high',
                        'side',
                        'sigma',
                        'up',
                        'down'
                    ])}
                    title="All Transactions with invalid prices"
                />
                <Table
                    query={too_low.col([
                        'date',
                        'index',
                        'account',
                        'sec',
                        'sec.cusip',
                        'price',
                        'low',
                        'high',
                        'side',
                        'sigma',
                        'up',
                        'down'
                    ])}
                    title="Purchases with prices below the daily low"
                />
                <Table
                    query={too_high.col([
                        'date',
                        'index',
                        'account',
                        'sec',
                        'sec.cusip',
                        'price',
                        'low',
                        'high',
                        'side',
                        'sigma',
                        'up',
                        'down'
                    ])}
                    title="Sales with prices above the daily high"
                />
            </div>
        );
    }
});
