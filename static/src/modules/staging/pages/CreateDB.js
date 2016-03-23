import React from 'react';
import NeatApp from 'app/utils/NeatApp';
import ProgressMixin from 'common/utils/ProgressMixin';
import StagingMixin from 'staging/utils/StagingMixin';
import ErrorLink from 'common/components/ErrorLink';
import StatusLabel from 'staging/components/StatusLabel';
import ButtonReference from 'common/components/ButtonReference';
import AppButton from 'common/components/AppButton';
import q from 'common/utils/queryFactory';
import Table from 'reports/components/charts/Table';
import Text from 'reports/components/charts/Text';

/**
 * Component for rendering the UI for handling the CreateDB stage.
 * @component
 * @exports lib\Components\Staging\CreateDB
 */
const CreateDB = React.createClass({

    /**
     * Progress Mixin Methods
     * --------------------------------------------------------------------
     */

    onSuccessfulProcess: function() {
        NeatApp.markDbAsCreated();
    },

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _createDatabase: function() {
        this.beginProcessing(
            'Create Database',
            '/create_database/' + NeatApp.caseName()
        );
    },

    /**
     * Staging Mixin Methods
     * --------------------------------------------------------------------
     */

    renderControls: function() {

        let disabledTooltip;

        if (!NeatApp.isLocked() && NeatApp.dbCreated()) {
            disabledTooltip =
                'This case\'s database has already been ' +
                'created.';
        }

        return (
            <AppButton
                name={this.state.processing ? 'CreatingDb' : 'CreateDb'}
                disabled={
                    this.state.processing
                    || !NeatApp.canCreateDb()
                    || (!NeatApp.isLocked() && NeatApp.dbCreated())
                }
                onClick={this._createDatabase}
                tooltip='Create the database. This may take some time.'
                disabledTooltip={disabledTooltip}
                guard={this.guardLock()}
            />
        );
    },

    renderStatus: function() {
        if (this.state.error) {
            var error = (
                <ErrorLink
                    text='View the error.'
                    title='Error while creating the case database.'
                    error={this.state.error}
                    recommend='Please try fixing the issue and then creating the database again.'
                />
            );

            return (
                <StatusLabel status="error">
                    Errors were encountered while creating the database.
                    {error}
                </StatusLabel>
            );

        } else if (NeatApp.canCreateDb() && NeatApp.dbCreated()) {
            return (
                <StatusLabel status="success">
                    The database has been successfully created.
                    Press <ButtonReference name='Next' /> to continue.
                </StatusLabel>
            );

        } else {
            return (
                <StatusLabel status='info'>
                    We are ready to create the database for your case.
                </StatusLabel>
            );
        }
    },

    renderBody: function() {
        var reconTbl, drange_display;

        if ( NeatApp.dbCreated() ) {
            var recons = q.stagings.get_finalize_recon({finalized: false});

            reconTbl = (
                <Table
                    query={recons}
                    title="Registrant File Statistics"
                    options={{gridHeight:220}}
                    summary="Statistics on entities loaded during creation of case database from registrant files."
                />
            );

            var drange = q.stagings.get_covered_daterange({finalized: false});

            drange_display = [
                <p>
                    Data loaded covers dates: <Text query={drange} />.
                </p>,

                <p>
                    Below you will find a table overviewing high level information
                    about the loaded data.
                    The <strong>Original Count</strong> column will show you how many
                    items of each type were found in the raw data.
                    The <strong>Unique Count</strong> column will show you how many
                    unique items that list was reduced too.
                    For example, the same account may appear in the data with two
                    different descriptions. This will appear as two accounts in the
                    original count, but will be reduced to one account in the unique count.
                </p>
            ];
        }

        return (
            <div>
                 <p>{drange_display}</p>
                 {reconTbl}
            </div>
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins:  [ProgressMixin, StagingMixin],

    getDefaultProps: function () {
        return {
            name: 'CreateDataBase',
            title: 'Create Case Database',
            stage: 'CreateDB',
        };
    },

    getInitialState: function() {
        return {
            loading: false
        };
    },

});

export default CreateDB;
