import React from 'react';
import q from 'common/utils/queryFactory';
import { CrossCorr, Table } from 'reports/components/charts/Widgets';
import Dropdown from 'reports/components/controlWidgets/Dropdown';
import sb from 'reports/components/StandardBlurbs';
import { makeReport, dropdown } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Cross Trades',
    meta: ['cross trades', 'regulation', 'account'],

    summary:
        <div>
            <p>
                This report highlights potential cross trades between accounts.
            </p>

            <p>
                {sb.crossTradeMeaning}
            </p>
        </div>,

	render_: function () {
        var type_dd = dropdown(
            ['Default', 'Broker', 'Broker and Qty', 'Broker and Qty and Price'],
            'Default'
        );

        var data = q.base.get_cross_trades({
            cross: type_dd.getSelected(),
        });

        var xcorr1 = q.base.cross_trades_xcorr({
            data: data,
            aggr: 'security',
            field: 'cross_notional'
        });

        var xcorr2 = q.base.cross_trades_xcorr({
            data: data,
            aggr: 'total',
            field: 'cross_notional'
        });

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
                <p>
                    There are many ways to calculate potential cross trades.
                    In particular we can put additional restraints on when trades qualify as a potential cross trade.
                    Choose additional aspects of trades that must be identical between two accounts here
                </p><Dropdown queries={type_dd} />

                {/* FIXME: this should drilldown into an account comparison for the specific security */}
                <CrossCorr query={xcorr1} title="Largest Single Security Cross Trade" summary={sb.securityCrossTrades} {...props} />

                <CrossCorr query={xcorr2} title="Total Account Cross Trade" summary={sb.totalCrossTrades} {...props} />

                <Table
                    query={data}
                    title={"Cross Trades Underlying Data"}
                    summary={sb.dataTable}
                    FIXME='should show the accounts of the potential trades.'
                />
            </div>
        );
    },
});
