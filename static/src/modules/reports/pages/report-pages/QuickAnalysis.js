import React from 'react';
import Mailto from 'common/components/Mailto';
import q from 'common/utils/queryFactory';
import { ReportPanel, Link } from 'reports/components/charts/Widgets';
import { makeReport, materialize } from 'reports/utils/ReportHelper';
import { getTurnoverSummary } from 'reports/utils/Core';

export default makeReport({
    displayName: 'Quick Analysis',
    style: 'thin',
    meta: [],

    summary:
        <div>
            <p>
                Quick Analysis is an experimental feature in NEAT.
                The aim is to quickly run through common calculations
                to see if any anomolies in the registrant data are found.
                Each anomoly may be associated with
                a <em>potential</em> regulatory violations.
            </p>

            <p>
                Please note, however, that all analyses are preliminary
                and should be followed up with further analysis,
                whether the quick detection algorithm discovers something or not.
            </p>

            <p>
                If you have other common calculations you run that you think are
                useful, please <Mailto>suggest an improvement</Mailto>.
            </p>
        </div>,

	render_: function () {
        var commission_dive =
            <div>
                Note that there may be other potential commission violations in this data.
                For example, some parts of commission may be hidden within markups or fees.
                <p />

                If you suspect egregious commissions we recommend doing a deeper dive
                with the <Link linking_to='Firm Wide Commissions and Fees' /> to see
                firm wide trades costs,
                or <Link linking_to='Aggregated Commissions And Fees' /> to
                see trade costs aggregated over accounts, securities, or brokers.
            </div>;

        var commission_analysis =
            <ReportPanel
                header='Large Commission Detection'
                waitFor='select from (update per_comm:abs (comm%notional) from transaction) where per_comm > 0.05'

                danger={data => data.values.length > 0}
                render={data => {
                    if (data.values.length > 0) {
                        return (
                            <div>
                                <p>
                                    <Link linking_to='Egregious Commissions and Fees'>
                                        {data.values.length} trades
                                    </Link>
                                    &nbsp;were detected in the transaction blotter
                                    with a commission greater than 5% of the trade value were detected.
                                </p>

                                {commission_dive}
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>
                                    No trades with a commission greater than 5% of the trade value were detected.
                                </p>

                                {commission_dive}
                            </div>
                        );
                    }
                }}
            />;

        var microcap_dive =
            <div>
                Note that these detections do not guarantee that a microcap liquidations did or did not occur.
                For example, the registrant may have bought and sold a microcap security
                many times, without ever having a large liquidation event.
                It's also possible that some securities may be considered microcap but are excluded here,
                because they at one point during this exam period had a price greater than the microcap threshold.
                <p />

                If you suspect any microcap liquidations occured we recommend doing a deeper dive
                with the <Link linking_to='Microcap Liquidation' /> report.
            </div>;

        var microcap_liquidation_analysis =
            <ReportPanel
                header='Microcap Liquidation Detection'
                waitFor={
                    q.base.sec_liquidation_overview({
                        sell_thresh: 500000,
                        price_thresh: 5,
                    })
                }

                danger={data => data.values.length > 0}
                render={data => {
                    if (data.values.length > 0) {
                        return (
                            <div>
                                <p>
                                    <Link linking_to='Microcap Liquidation'>
                                        {data.values.length} traded securities
                                    </Link>
                                    &nbsp;were detected that had a maximum price less than $5 and
                                    were potentially liquidated by the registrant, with total notional
                                    sold exceeding $500,000.
                                </p>

                                {microcap_dive}
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>
                                    No liquidations were detected on a security that had a maximum price less than $5 and
                                    where notional sold by the registrant exceeded $500,000.
                                </p>

                                {microcap_dive}
                            </div>
                        );
                    }
                }}
            />;

        var rule_105_dive =
            <div>
                Note that these detections do not guarantee that a Rule 105 violation did or did not occur.
                <p />

                If you suspect any Rule 105 violations occured we recommend doing a deeper dive
                with the <Link linking_to='Rule 105' /> report.
            </div>;

        var rule_105_analysis =
            <ReportPanel
                header='Rule 105 Violation Detection'
                waitFor={q.legacy.get_rule_105({})}

                danger={data => data.values.length > 0}
                render={data => {
                    if (data.values.length > 0) {
                        return (
                            <div>
                                <p>
                                    <Link linking_to='Rule 105'>
                                        {data.values.length} trades
                                    </Link>
                                    &nbsp;were detected which could potentially be Rule 105 violations.
                                </p>

                                {rule_105_dive}
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>
                                    No Rule 105 violations were detected.
                                </p>

                                {rule_105_dive}
                            </div>
                        );
                    }
                }}
            />;

        var turnover_dive =
            <div>
                Note that these detections do not guarantee that a turnover violation did or did not occur.
                <p />

                If you suspect any turnover violations occured we recommend doing a deeper dive
                with the <Link linking_to='Account Turnover' link_value={[["value"]]} link_argument={[[2]]} link_ref={['threshold']}/> report.
            </div>;

        var turnover_analysis =
            <ReportPanel
                header='Large Turnover Detection'
                waitFor={materialize(getTurnoverSummary(2))}

                danger={data => data.values.length > 0}
                render={data => {
                    if (data.values.length > 0) {
                        return (
                            <div>
                                <p>
                                    <Link linking_to='Account Turnover' link_value={[["value"]]} link_argument={[[2]]} link_ref={['threshold']}>
                                        {data.values.length} accounts
                                    </Link>
                                    &nbsp;were detected in the transaction blotter
                                    with a notional turnover ratio greater than 200% of the largest market value position held by
                                    that account.
                                </p>

                                {turnover_dive}
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>
                                    No accounts were detected in the transaction blotter
                                    with a notional turnover ratio greater than 200% of the largest market value position held by
                                    that account.
                                </p>

                                {turnover_dive}
                            </div>
                        );
                    }
                }}
            />;

        var insider_analysis =
            <ReportPanel
                header='Insider Trading Detection'
                waitFor='select from (update per_comm:abs comm%notional from transaction) where per_comm > 0.05'

                danger={data => data.values.length > 0}
                render={data => {
                    if (data.values.length > 0) {
                        return (
                            <div>
                                <p>
                                    <a>{data.values.length} trades</a> were detected in the transaction blotter
                                    that represent substantial movements by the firm immediately before
                                    a large price swing in the traded instrument.
                                </p>

                                <p>
                                    If you suspect insider trading we recommend doing a deeper dive
                                    with the <a>Substantial Price Movement Report</a>.
                                </p>
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>
                                    No trades were detected in the transaction blotter
                                    that represent substantial movements by the firm immediately before
                                    a large price swing in the traded instrument.
                                </p>

                                <p>
                                    Note that this is a high level analysis and there still may be insider trading in this data.
                                    If you suspect insider trading we recommend doing a deeper dive
                                    with the <a>Substantial Price Movement Report</a>.
                                </p>
                            </div>
                        );
                    }
                }}
            />;

        var crosstrades_are = (
            <p>
                A potential cross trade is when one account sells a particular instrument and another account
                buys the same security within a small window of time, usually no more than a few days.

                A potential cross trade is not always a regulatory violation, but under certain situations
                they can be and should be analyzed further.

                If you suspect potential cross trades we recommend doing a deeper dive
                with the <a>Cross Trades Report</a>.
            </p>
        );

        var crosstrade_analysis =
            <ReportPanel
                header='Potential Cross Trade Detection'
                waitFor='select from (update per_comm:abs comm%notional from transaction) where per_comm > 0.05'

                danger={data => data.values.length > 0}
                render={data => {
                    if (data.values.length > 0) {
                        return (
                            <div>
                                <p>
                                    <a>{data.values.length} trades</a> were detected in the transaction blotter
                                    that represent <em>potential</em> cross trades between accounts.
                                </p>

                                {crosstrades_are}
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>
                                    No potential cross trades were detected in the transaction blotter.
                                    Note that there are many ways to calculate potential crosstrades,
                                    and under different criteria you may obtain different results.
                                </p>

                                {crosstrades_are}
                            </div>
                        );
                    }
                }}
            />;

        var employee_trades_are = (
            <p>
                A potential employee trading violation is when an employee trades in a security which the
                firm is also trading in, within a certain window of time (defaulted here to 10 days).

                A potential employee trading violation is not always a regulatory violation, but under certain situations
                they can be and should be analyzed further.

                If you suspect potential employee trading violations we recommend doing a deeper dive
                with the <Link linking_to='Relevant Employee Trading' />.
            </p>
        );

        var employee_trades_analysis =
            <ReportPanel
                header='Potential Employee Trading Violations'
                waitFor={q.legacy.get_employee_trades({})}

                danger={data => data.values.length > 0}
                render={data => {
                    if (data.values.length > 0) {
                        return (
                            <div>
                                <p>
                                    <Link linking_to='Relevant Employee Trading'>{data.values.length} trades</Link> were
                                    detected in the transaction blotter
                                    that represent <em>potential</em> employee trading violations.
                                </p>

                                {employee_trades_are}
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>
                                    No potential employee trading violations were detected in the transaction blotter.
                                </p>

                                {employee_trades_are}
                            </div>
                        );
                    }
                }}
            />;

        var restricted_trades_are = (
            <p>
                The Restricted Trade Analysis report contains transactions involving securities on a firm’s restricted trade list.
                This implies a trade blotter and a restricted list is required for this analysis.

                A registrant provides a restricted trade list, which comprises securities that are restricted within two dates.
                For example, a security can have a black out period within 3 days before and 3 days after the earnings is released.
                The Restricted Trades report helps identify any transaction (in the trade blotter) violating a blackout period restriction.

                If you suspect potential restricted trading violations we recommend doing a deeper dive
                with the <Link linking_to='Restricted Trades Analysis' />.
            </p>
        );

        var restricted_trades_analysis =
            <ReportPanel
                header='Potential Restricted Trading Violations'
                waitFor={q.legacy.get_restricted_trades({})}

                danger={data => data.values.length > 0}
                render={data => {
                    if (data.values.length > 0) {
                        return (
                            <div>
                                <p>
                                    <Link linking_to='Restricted Trades Analysis'>{data.values.length} trades</Link> were
                                    detected in the transaction blotter
                                    that represent <em>potential</em> restricted trading violations.
                                </p>

                                {restricted_trades_are}
                            </div>
                        );
                    } else {
                        return (
                            <div>
                                <p>
                                    No potential restricted trading violations were detected in the transaction blotter.
                                </p>

                                {restricted_trades_are}
                            </div>
                        );
                    }
                }}
            />;

        return (
            <div>
                {commission_analysis}

                {microcap_liquidation_analysis}

                {rule_105_analysis}

                {turnover_analysis}

                {/*insider_analysis*/}

                {/*crosstrade_analysis*/}

                {employee_trades_analysis}

                {restricted_trades_analysis}
            </div>
        );
    },

});
