import React from 'react';
import { Navigation } from 'react-router';
import { TabbedArea, TabPane } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import ProgressMixin from 'common/utils/ProgressMixin';
import StagingMixin from 'staging/utils/StagingMixin';
import StatusLabel from 'staging/components/StatusLabel';
import ButtonReference from 'common/components/ButtonReference';
import AppButton from 'common/components/AppButton';
import ErrorLink from 'common/components/ErrorLink';
import q from 'common/utils/queryFactory';
import { Table, Text } from 'reports/components/charts/Widgets';

/**
 * Component for rendering the UI for handling the Finalization stage.
 * @component
 * @exports lib\Components\Staging\Finalize
 */
const Finalize = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */
    _handleSelect: function(key) {
        this.setState({key: key});
    },

    _finalize: function() {
        this.beginProcessing('Finalize', '/finalize/' + NeatApp.caseName());
    },

    /**
     * Progress Mixin Methods
     * --------------------------------------------------------------------
     */

    onSuccessfulProcess: function() {
        var self = this;
        NeatApp.markAsFinalized();
        NeatApp.saveCurrentCase()
            .then(NeatApp.lockCase)
            .then(function (){
                self.transitionTo('finalize', {name: NeatApp.caseName()});
            });
    },

    /**
     * Staging Mixin Methods
     * --------------------------------------------------------------------
     */

    renderControls: function() {

        let disabledTooltip;

        if (!NeatApp.isLocked() && NeatApp.finalized()) {
            disabledTooltip = 'This case has already been finalized.';
        }

        return (
            <AppButton
                name={this.state.processing ? 'Finalizing' : 'Finalize'}
                disabled={
                    this.state.processing
                    || !NeatApp.canFinalize()
                    || (!NeatApp.isLocked() && NeatApp.finalized())
                }
                onClick={this._finalize}
                tooltip='Click to finalize staging. This may take some time.'
                disabledTooltip={disabledTooltip}
                guard={this.guardLock()}
            />
        );
    },

    renderStatus: function() {
        if (this.state.error) {
            var error = <ErrorLink
                            text='error'
                            title='Error during finalization.'
                            error={this.state.error}
                            recommend='Please try fixing the issue and then finalizing the database again.'
                        />;

            return (
                <StatusLabel status="warning">
                    There was an {error} while finalizing the database.
                </StatusLabel>
            );
        } else if (NeatApp.canFinalize() && NeatApp.finalized()) {
            return (
                <StatusLabel status="success">
                    Your case has been finalized.
                    Press <ButtonReference name='Next' /> to continue.
                </StatusLabel>
            );
        } else if (NeatApp.canFinalize()) {
            return (
                <StatusLabel status="info">
                    We are ready to finalize your case's staging. Before proceeding, please verify transactions and securities excluded during staging.
                </StatusLabel>
            );
        } else {
            return (
                <StatusLabel status="warning">
                    Some parts of staging are incomplete.
                </StatusLabel>
            );
        }
    },

    renderBody: function() {
        var exclusions_sec = null;
        var exclusions_trans = null;
        var reconTbl = null;
        var k = 0;
        var sec_title = 'Security Exclusion Report';
        var trans_title = 'Transaction Exclusion Report';
        var stats_title = 'Staging Statistics';

        var sec_summary = (
            <div>
                The <emph>Security Exclusion Report</emph> summarizes which securities were
                excluded throughout the staging process.
            </div>
        );

        var trans_summary = (
            <div>
                The <emph>Transaction Exclusion Report</emph> summarizes which transactions were
                excluded throughout the staging process.
            </div>
        );

        var stats_summary = (
            <div>
                The <emph>Staging Statistics</emph> table displays statistics about all the
                different data that NEAT worked with to create a cleaned version of the
                uploaded case.
            </div>
        );

        // avoid re-compute of query during processing
        if (!this.state.processing) {
            if (!NeatApp.finalized()) {
                var excluded_sec0 = q.stagings.get_sec_exclusions({});
                var excluded_trans0 = q.stagings.get_trans_exclusions({});
                exclusions_sec = ( <Table query={excluded_sec0} title={sec_title} summary={sec_summary}/>);
                exclusions_trans = ( <Table query={excluded_trans0} title={trans_title} summary={trans_summary}/>);
            }
        }

        if ( NeatApp.isLocked() ) {
            var recons = q.stagings.get_finalize_recon({});
            // make sure to re-compute the query after the finalize/locking as the case name has been changed
            var excluded_sec = q.stagings.get_sec_exclusions({});
            var excluded_trans = q.stagings.get_trans_exclusions({});
            exclusions_sec = ( <Table query={excluded_sec} title={sec_title} summary={sec_summary}/>);
            exclusions_trans = ( <Table query={excluded_trans} title={trans_title} summary={trans_summary}/>);

            reconTbl = (
                <TabPane eventKey={2} tab="Statistics">
                    <Table query={recons} title={stats_title} options={{gridHeight:220}} summary={stats_summary}/>
                </TabPane>
            );

            var drange = q.stagings.get_covered_daterange({});
            var drange_display = (
                <p>
                    Exam Date Coverage: <Text query={drange} format={x => x}/>
                </p>
            );
        }

        return (
            <div>
                {drange_display}

                <TabbedArea
                    defaultActiveKey={k}
                    animation={false}
                    activeKey={this.state.key}
                    onSelect={this._handleSelect}
                >
                    <TabPane eventKey={0} tab="Securities">{exclusions_sec}</TabPane>
                    <TabPane eventKey={1} tab="Transactions">{exclusions_trans}</TabPane>
                    {reconTbl}
                </TabbedArea>
            </div>
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins:  [ProgressMixin, StagingMixin, Navigation],

    componentWillReceiveProps: function() {
        this.setState(this.getInitialState());
    },

    getInitialState: function() {
        var key = 0;
        if (NeatApp.isLocked()) {
            key = 2;
        }

        return {
            key: key,
        };
    },

    getDefaultProps: function() {
        return {
            name: 'Finalize',
            title: 'Finalize',
            stage: 'Finalize',
        };
    },

});

export default Finalize;
