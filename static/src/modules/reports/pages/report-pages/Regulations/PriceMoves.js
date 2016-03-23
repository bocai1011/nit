import React from 'react';
import q from 'common/utils/queryFactory';
import Katex from 'common/components/Katex';
import { Scatter, Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import Row from 'reports/components/layout/Row';
import {
    makeReport,
    sub,
    cache,
    dropdown,
    get,
    join,
} from 'reports/utils/ReportHelper';
import LinkHelper from 'reports/utils/LinkHelper';

export default makeReport({
    displayName: 'Price Moves',
    meta: ['regulation', 'insider trading'],

    summary:
        <span>
            The Price Moves report looks at account trading behavior around large price movements
            so as to determine whether an account may have used non public information to alter their trading prior to an event.<br/>
            This report starts by finding all events where a securities daily logarithmic return exceeded thresh * standard deviation,
            and the set of accounts who traded them.
        </span>,

    render_: function () {

        // Model Parameter Dropdown configuration
        var distribution_dd = dropdown(['Account', 'Security', 'Account and Security'], 'Account');
        var offset_dd = dropdown([5, 10, 15, 30], 10, 'offset');
        var thresh_dd = dropdown([2.5, 3, 3.5, 4, 5, 6], 4, 'thresh');
        var rollWin_dd = dropdown([60, 90, 120], 90, 'rollwin');

        /* Generate the set of security price moves
         * ie where the continously compounded return
         * rt=log(Pt / Pt-1); exceeds thresh_dd * std(rt)
         * where std is computed over a rolling window
         */
        var priceEvents = q.base.price_events({
            thresh: thresh_dd.getSelectedValue(),
            roll_win: rollWin_dd.getSelectedValue()
        });

        /* Using the events found above, now find the accounts
         * who purchased shares of that security in the time
         * leading up to the event.
         */
        var eventParticipation = q.holdings.event_holdings({
            events_query: priceEvents,
            offset: offset_dd.getSelectedValue()
        });

        // Join the events with the candidate accounts
        var candidateTable = cache(q.core.join({
            op: 'lj',
            left_table: get('0!{d}', { d: eventParticipation }),
            right_table: get('`sec`event_date xkey {d}', { d: priceEvents }),
        }));

        /* Here we use a hueristic to determine the most egregious candidates.
         * First we determine if the purchasing on the day of the event was
         * advantageous to their existing position. ie did they add to their
         * position in the morning before the price skyrocketed? if so we then
         * add the event day qty to the accumulation to come up with an indication
         * of profit made in the window.
         */
        // TODO: Should clean this up and decide what idiomatic qstr operations should look like
        candidateTable = get('update price_advantage: ?[price_delta>0; ?[buy_qty>0; 1 - ((buy_price-low)%(high-low)); 0]; ?[sell_qty>0; (sell_price-low)%(high-low); 0]] from {d}', {d: candidateTable});
        candidateTable = get('update total_accum_qty: ?[price_advantage > .8; ?[price_delta>0; accum_qty+buy_qty; accum_qty-sell_qty]; accum_qty] from {d}', {d: candidateTable});
        candidateTable = get('`indication_of_profit xdesc update indication_of_profit: total_accum_qty * price_delta from {d}', {d: candidateTable});

        // Compute PnL over the window for the 50 most likely egregious accounts
        var dailyTopCandidateActivity = q.holdings.event_pnl({
            candidates: get('50#{d}', {d: candidateTable}),
            offset: offset_dd.getSelectedValue(),
        });

        // Join Merger synopsis data to the most likely candidates
        var dailyTopCandidateActivity = q.core.join({
            op: 'lj',
            left_table: dailyTopCandidateActivity,
            right_table: get('`sec`date xkey (select sec, date: date_announced, merger_and_acquisition: synopsis from merger_acquisition)'),
        });

        // Compute total active and passive PnL numbers over the window
        var aggPnl = q.core.get_groupby_and_reduce({
            data: dailyTopCandidateActivity,
            grouper: ['event_date', 'account', 'sec'],
            field: ['active_pnl_daily', 'passive_pnl_daily'],
            how: ['sum', 'sum']
        });

        // Compute the accumulation on the day of the event to compare with the window leading up to the event
        var accumComparison = sub(get('`event_date`account`sec xkey 50#{d}', {d:candidateTable}), 'buy_qty', 'sell_qty', 'event_date_qty');


        var candidateTableDoc = (
            <div>
                This table shows the set of accounts that traded in the window.
                The data is split into activity over the window and activity on the event date itself.
            </div>
        );

        var topCandidatesDoc = (
            <div>
                This table displays the
                The active P&L field represents the profit generated by the security during the accumulation window, assuming
                that the account had no holdings as of the begining of the window and that no other securites were traded.
                Passive P&L only considers a portfolio of shares in the security purchased prior to the accumulation window and assumes no other trades were made.
            </div>
        );

        var activeVPassiveDoc = (
            <div>
                This compares the profit and losses an account would have generated from an existing position in the security prior
                to the accumulation window with no other transactions (Passive P&L) to the profit and losses the account made strictly from its
                activity within the window (Active PnL).
            </div>
        );

        var eventVWindowAccumDoc = (
            <div>
                This compares the accumulation of shares during the window leading up to the event with the accumulation on the day of the event.
            </div>
        );

        var perfDetail = new LinkHelper('Performance Detail for Account, Security', [['sec', {'value': 'sec'}], ['account', {'value': 'account'}]]);

        return (
            <div>

                <br/>
                <Dropdown queries={thresh_dd} /> Choose the price move threshold, in standard deviations.
                <br/>

                <Dropdown queries={rollWin_dd} /> Choose the rolling window size to compute standard deviation, in days.
                <br/>

                <Katex>{'\\text{accumulation window} = \\lbrace t - \\text{offset} \\space...\\space t = \\text{event date} \\rbrace'}</Katex>
                <Dropdown queries={offset_dd} /> Choose the offset for determining the size of the accumulation window.
                <br/>
                <Row layout={[6, 6]}>

                    <Scatter
                        query={aggPnl}
                        title={'Active vs Passive P&L'}
                        X={'sum_passive_pnl_daily'}
                        Y={'sum_active_pnl_daily'}
                        link={perfDetail}
                        summary={activeVPassiveDoc}
                    />

                    <Scatter
                        query={accumComparison}
                        title={'Event Date Quantity vs Accumulation'}
                        X={'accum_qty'}
                        Y={'event_date_qty'}
                        link={perfDetail}
                        summary={eventVWindowAccumDoc}
                    />
                </Row>


                <Table
                    query={dailyTopCandidateActivity}
                    title={'Daily Activity of Top Candidate Accounts'}
                    summary={topCandidatesDoc}
                />

                <Table
                    query={candidateTable}
                    title={'Candidate Accounts'}
                    summary={candidateTableDoc}
                />
            </div>
        );
    },
});
