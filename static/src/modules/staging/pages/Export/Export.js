import React from 'react';
import { Accordion, Panel, Alert } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import StagingMixin from 'staging/utils/StagingMixin';
import ProgressMixin from 'common/utils/ProgressMixin';
import ErrorLink from 'common/components/ErrorLink';
import ButtonReference from 'common/components/ButtonReference';
import StatusLabel from 'staging/components/StatusLabel';
import ExportsTable from 'staging/pages/Export/ExportsTable';

const Export = React.createClass({

    mixins:  [StagingMixin, ProgressMixin],

    renderStatus: function() {
        if (this.state && this.state.error) {
            var error = (
                <ErrorLink
                    text='error'
                    title='Export error'
                    error={this.state.error}
                    recommend='Please try fixing the issue and then trying to export again.'
                />
            );

            return (
                <StatusLabel status="danger">
                    There was an {error} while exporting or preparing to export.
                </StatusLabel>
            );
        } else {
            return (
                <StatusLabel status="info">
                    Choose which table you would like to export.
                </StatusLabel>
            );
        }
    },

    renderControls: function() {
        return null;
    },

    renderBody: function() {
        var isRectifyComplete = NeatApp.rectifyCompleted();
        var stagingAlert = null;

        if ( !NeatApp.isLocked() )
        {
            stagingAlert = (
                <Alert bsStyle='danger'>
                    Some parts of staging are incomplete.
                    We recommend finishing staging before exporting data tables.
                </Alert>
            );
        }

        return (
            <div>
                {stagingAlert}
                <Accordion>
                    <Panel header='Export Transactions' eventKey='1'>
                        <ExportsTable
                            name='transaction'
                            available={isRectifyComplete}
                            includes={['Transactions', 'Securities', 'Daily Prices', 'Exchange Rates']}
                        />
                    </Panel>
                    <Panel header='Export Initial Positions' eventKey='2'>
                        <ExportsTable
                            name='initial_position'
                            available={isRectifyComplete}
                            includes={['Initial positions', 'Securities', 'Daily Prices', 'Exchange Rates']}
                        />
                    </Panel>
                    <Panel header='Export Employee Transactions' eventKey='3'>
                        <ExportsTable
                            name='employee_transaction'
                            available={isRectifyComplete}
                            includes={['Employee transactions', 'Securities', 'Daily Prices', 'Exchange Rates']}
                        />
                    </Panel>
                    <Panel header='Export Restricted List' eventKey='4'>
                        <ExportsTable
                            name='restricted_list'
                            available={isRectifyComplete}
                            includes={['Restricted List', 'Securities']}
                        />
                    </Panel>
                </Accordion>
            </div>
        );
    },

    getDefaultProps: function() {
        return {
            name: 'Export',
            title: 'Export Data',
            stage: 'Export'
        };
    }
});

export default Export;
