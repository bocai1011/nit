import React from 'react';
import q from 'common/utils/queryFactory';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import Row from 'reports/components/layout/Row';
import { makeReport, group_and_reduce } from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';
import Katex from 'common/components/Katex';

export default makeReport({
    displayName: 'Front Running',
    meta: ['regulation', 'front running'],

    render_: function() {

        var measure_long = q.base.get_front_running_measure({ side:'LONG' }).setDoc('Gets the front running measure for long trades for all accounts and securities that they traded.');
        var measure_short = q.base.get_front_running_measure({ side:'SHORT' }).setDoc('Gets the front running measure for short trades for all accounts and securities that they traded.');

        var measure2_long = group_and_reduce({
            data: measure_long,
            grouper: ['account'],
            reduce: [
                ['measure', 'mean'],
                ['measure', 'sum'],
                ['occurrences', 'sum']
            ]
        }).setDoc('Aggregates the front running measure by account over all securities.');

        var measure2_short = group_and_reduce({
            data: measure_short,
            grouper: ['account'],
            reduce: [
                ['measure', 'mean'],
                ['measure', 'sum'],
                ['occurrences', 'sum']
            ]
        }).setDoc('Aggregates the front running measure by account over all securities.');

        var measureDescription = (
            <div>
                The front running measure is a measurement of, on average, how ahead or behind an account is, when compared to the trading of the rest of the firm on the same securities.
                <p/>
                For each account, and each security that account trades, the following is calculated for every trade: <Katex>
                    {'Measure = \\sum_{i} \\Delta_{i, days} e^{\\frac{\\Delta_{i, days}^2}{2}}'},
                </Katex>
                where the summation is over all trades made by other accounts in the same security and in the same trade direction within two weeks of the considered trade. The value
                <Katex>
                    {'\\Delta_{i, days}'}
                </Katex>
                is the difference between the date that the considered trade was made and that the other trade was made. If the other trade preceded the considered trade, the value will be negative.
                <p/>
                This measurement is averaged over all trades made by the account in the security. If an account is consistently trading a particular security before or after the rest of the firm, the value of this measure will be non-zero.
                <p/>
                This is a stastical measure, so if there were very few trades, if can vary widely and still not be indicative of suspicious behavion. That is why in the following plots, it is shown along with the total number of trades.
                In cases where the total number of trades is small, the value of the measure can be large. If there are a large number of trades, and the measure is also large, this could indicate front running.
            </div>
        );

        return (
            <div>
                {measureDescription}
                <p/>
                <Row layout={[6,6]}>
                    <Scatter
                        title='Front Running Metric Calculated on Long trades'
                        query={measure2_long}
                        X='sum_occurrences'
                        xAxis='Total number of trades'
                        Y='mean_measure'
                        yAxis='Deviation from average trade time'
                        link={new LinkHelper('Transaction Detail for Account', 'account')}
                        summary={measureDescription}
                    />
                    <Scatter
                        title='Front Running Metric Calculated on Short trades'
                        query={measure2_short}
                        X='sum_occurrences'
                        xAxis='Total number of trades'
                        Y='mean_measure'
                        yAxis='Deviation from average trade time'
                        link={new LinkHelper('Transaction Detail for Account', 'account')}
                        summary={measureDescription}
                    />
                </Row>

                <Table
                    query={measure_long}
                    title="Front Running Measures, Long Side"
                    summary={measureDescription}
                />

                <Table
                    query={measure_short}
                    title="Front Running Measures, Short Side"
                    summary={measureDescription}
                />
            </div>
        );
    }
});
