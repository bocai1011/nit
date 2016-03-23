import React from 'react';
import q from 'common/utils/queryFactory';
import { Table } from 'reports/components/charts/Widgets';
import TextInput from 'reports/components/controlWidgets/TextInput';
import Row from 'reports/components/layout/Row';
import { makeReport, get } from 'reports/utils/ReportHelper';

export default makeReport({
    displayName: 'Allocation Comparison between Broker Groups',
    meta: ['performance', 'allocation', 'broker', 'aggregated'],

    summary:
        <span>
            This report allows you to split the list of brokers into two groups,
            denoted preferred and non-preferred.
            We then analyze potential preferential allocation between the groups
            by inspecting price execution quality.
        </span>,

	render_: function () {

        var pref_query = q.jsutil.pass_string({value: 'select from broker '});
        var pref = get(pref_query);

        var nonpref_query = q.jsutil.pass_string({value: 'select from broker'});
        var nonpref = get(nonpref_query);

        var alloc = q.legacy.get_broker_allocation({
            brokers_pref: pref,
            brokers_nonpref: nonpref,
        });

        return (
            <div>
                <h1>Preferred Broker Selection</h1>

                Here you may write a query to specify which brokers you wish
                to be considered preferred. As you customize your query,
                press <em>Execute Query</em> to update the table to the right
                showing you the result of your query. Your query must have
                a column called <em>oid</em> indexing the brokers.
                <p />

                <Row layout={[6, 6]}>
                    <TextInput
                        title="Preferred Brokers Query"
                        height='556px'
                        text={pref_query}
                    />

                    <Table
                        title="Preferred Brokers"
                        query={pref}
                    />
                </Row>

                <h1>Non-Preferred Broker Selection</h1>

                Here you may write a query to specify which brokers you wish
                to be considered non-preferred.
                <p />

                <Row layout={[6, 6]}>
                    <TextInput
                        title="Non-Preferred Brokers Query"
                        height='556px'
                        text={nonpref_query}
                    />

                    <Table
                        title="Non-Preferred Brokers"
                        query={nonpref}
                    />
                </Row>

                <h1>Allocation Comparison</h1>

                We may now compare the price execution quality between the two groups of brokers.

                <Table
                    title="Allocation Comparison"
                    query={alloc}
                />
            </div>
        );
    },
});
