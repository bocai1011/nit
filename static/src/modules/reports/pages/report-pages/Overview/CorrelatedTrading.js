import React from 'react';
import Katex from 'common/components/Katex';
import q from 'common/utils/queryFactory';
import { CrossCorr, Table } from 'reports/components/charts/Widgets';
import sb from 'reports/components/StandardBlurbs';
import { makeReport } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Correlated Trading',
    meta: ['correlations', 'account'],

    summary:
        <span>
            This report shows the account pairs having significant trading correlation on individual stocks, either positive or negative.
            The graphic shows an aggregated measure of the trading correlations between all stocks between any pair of accounts.
            The account pairs are ranked by this aggregate measure for the purposes of this graphic.
            Currently the aggregation measure is the weighted average of the absolute value
            of the correlations on trading in individual stocks between these accounts.
        </span>,

	render_: function () {
        var data = q.base.get_correlated_acct_behavior({});

        var xcorr = q.base.trading_behavior_xcorr({
            data: data,
            field: 'notional',
            mincnt: 2
        });

        var xcorrSummary =
            <div>
                <p>
                    This widget shows the correlation between the trading behavior of different accounts.
                </p>

                <p>
                    To calculate this we begin with the correlation of trading between any pair of accounts on any single security.
                    Both the accounts must have traded the security on the same day some minimum count number of times.
                    For each account pair take the weighted average of the correlations over all securities resulting from the step above
                    (the correlation for each stock weighted by the number of days both accounts traded the security).
                </p>

                <p>
                    The darkness of each cell corresponds to the magnitude of the correlation between the trading behavior of the accounts.
                </p>

                <p>
                    For each

                    <Katex>
                        {'i,j \\in {accounts}, i \\neq j'}
                    </Katex>

                    we compute

                    <Katex>
                        {'\\sum_{k \\in {securities}} \\left|corr(account_{i}, account_{j})_{sec_{k}}\\right|'}
                    </Katex>
                </p>
            </div>;

        var checkHasData = function(data) {
            data = data.wquery.data;
            if (data.nodes && data.nodes.length === 0) {
                return false;
            }
            return true;
        };

        var props = {
            linking_to: 'Overview for Account',
            link_ref: ['account'],
            link_value: [['value']],
            cell_linking_to: 'Comparison between Accounts',
            cell_link_ref: ['account1', 'account2'],
            cell_link_value: [['value'], ['value']],
            checkHasData: checkHasData,
            noDataMsg: 'No cross trades found.'
        };

        return (
            <div>
                <CrossCorr
                    query={xcorr}
                    title="Correlation of Accounts' Trading"
                    summary={xcorrSummary}
                    FIXME='i have no labels!'
                    {...props}
                />

                <Table
                    query={data}
                    title={"Correlations Underlying Data"}
                    summary={sb.dataTable}
                />

                <Table
                    query={xcorr}
                    title={"Correlations Underlying Data"}
                    summary={sb.dataTable}
                />
            </div>
        );
    },
});
