import React from 'react';
import q from 'common/utils/queryFactory';
import { Timeseries } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
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
    displayName: 'Price Validation for Security',
    meta: ['security', 'validation'],

    summary:
        <span>
            This is a price validation report for a specific security and trades involving that security.
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

        var ts1 = group_and_reduce({
            data: trans,
            grouper: ['date', 'sec'],
            reduction: [
                ['price', 'max', 'max_price_traded'],
                ['price', 'min', 'min_price_traded'],
            ]
        });

        ts1 = q.base.withPrices({
            data: ts1
        });

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
                {sb.standardLinks('sec', sec_dd, 'Price Validation for Security')}

                <Timeseries
                    query={ts1}
                    title='Execution Prices vs Daily Range'
                    summary={sb.timeseries('various statistics')}
                    chartHeight={500}
                    seriesConfig={[
                        {
                            id: 'ohlc',
                            subitems: ['open', 'high', 'low', 'close'],
                            seriesOptions: ['ohlc']
                        }, {
                            id: 'max_price_traded',
                            subitems: ['max_price_traded'],
                            seriesOptions: ['uplinescatter']
                        }, {
                            id: 'min_price_traded',
                            subitems: ['min_price_traded'],
                            seriesOptions: ['downlinescatter']
                        }
                    ]}
                    axesConfig={[
                        {
                            isShared: true,
                            height: 100,
                            ids: ['ohlc', 'max_price_traded', 'min_price_traded', 'price_movements', 'mna']
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
            </div>
        );
    },
});
