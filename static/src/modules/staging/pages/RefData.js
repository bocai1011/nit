import _ from 'lodash';
import React from 'react';
import { Panel, Glyphicon } from 'react-bootstrap';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import ProgressMixin from 'common/utils/ProgressMixin';
import StagingMixin from 'staging/utils/StagingMixin';
import StatusLabel from 'staging/components/StatusLabel';
import ButtonReference from 'common/components/ButtonReference';
import AppButton from 'common/components/AppButton';
import ErrorLink from 'common/components/ErrorLink';

/**
 * Component for rendering overview statistics for a given symbology.
 * @component
 */
const SymbolOverview = React.createClass({

    propTypes: {
        symbol: React.PropTypes.node,
        symbolList: React.PropTypes.array,
    },

    render: function() {
        var glyph = <Glyphicon glyph='zoom-in' />;
        var header = <span>{glyph}&nbsp;<strong>{this.props.symbol}</strong></span>;

        return (
            <Panel header={header}
                bsStyle='default'
                aria-role='note'
                aria-describedby='instructions'>
                {this.props.symbolList.length} unique symbols found.
            </Panel>
        );
    },
});

/**
 * Component for rendering the UI for handling the RefData stage.
 * @component
 * @exports lib\Components\Staging\RefData
 */
const RefData = React.createClass({

    _getRefData: function() {
        var self = this;

        util.get('/case/' + NeatApp.caseName() + '/refdata/candidates',
            function (info) {
                self.setState({
                    loading: false,
                    info:info,
                });
            });
    },

    _setRefData: function() {
        NeatApp.refDataChanged();
        this.beginProcessing('RefData', '/case/' + NeatApp.caseName() + '/refdata/retrieval');
    },

    /**
     * Progress Mixin Methods
     * --------------------------------------------------------------------
     */

    onSuccessfulProcess: function() {
        NeatApp.refDataChanged();
        NeatApp.markRefDataComplete();
        NeatApp.saveCurrentCase()
    },

    /**
     * Staging Mixin Methods
     * --------------------------------------------------------------------
     */

    renderControls: function() {

        let disabledTooltip;

        if (!NeatApp.isLocked() && NeatApp.refDataCompleted()) {
            disabledTooltip =
                'This case\'s reference data has already ' +
                'been retrieved.';
        }

        return <AppButton
                   name={this.state.processing ? 'GettingRefData' : 'GetRefData'}
                   disabled={
                       this.state.processing
                       || (!NeatApp.isLocked() && NeatApp.refDataCompleted())
                   }
                   onClick={this._setRefData}
                   tooltip='Get reference data. This may take some time.'
                   disabledTooltip={disabledTooltip}
                   guard={this.guardLock()}
                 />;
    },

    _describeError: function() {
        var err = this.state.error;
        var refusedErr = 'No connection could be made because the target machine actively refused it.',
            addrErr = 'getaddrinfo failed',
            timeout = 'Download timed out too many times';

        if (err.indexOf(refusedErr) > -1) {
            return (
                <StatusLabel status='warning'>
                    The NEAT data server appears to be down.
                    <ul>
                        <li>The machine is reachable, but it is not accepting requests for data.</li>
                        <li>Please try again later.  If the problem persists, please contact NEAT support.  Sorry for the inconvenience.</li>
                    </ul>
                </StatusLabel>
            );
        }

        if (err.indexOf(addrErr) > -1) {
            return (
                <StatusLabel status='warning'>
                    Could not find the NEAT data server address.
                    <ul>
                        <li>This is sometimes a result of network outages.</li>
                        <li>Please make sure your internet connection is working properly and try again.</li>
                    </ul>
                </StatusLabel>
            );
        }

        if (err.indexOf(timeout) > -1) {
            return (
                <StatusLabel status='warning'>
                    Download timed out.  The data server was taking too long to send data.
                    <ul>
                        <li>This can happen if the data provider is too busy, or if many examiners retrieve data at once.</li>
                        <li>Or it could be bad internet connectivity at the SEC.</li>
                        <li>Please try again later.</li>
                    </ul>
                </StatusLabel>
            );
        }

        var details = (
            <div>
                Technical Details:
                <ul><li>{this.state.error}</li></ul>
            </div>
        );
        var errLink = (
            <ErrorLink
                text='error'
                title='Unexpected error while going to get Reference Data.'
                recommend='Please try retrieving reference data again.  If the problem persists, please contact NEAT support.'
                error={details}
            />
        );

        return (
            <StatusLabel status='warning'>
                There was an unexpected {errLink} while trying to retrieve Reference Data.
            </StatusLabel>
        );
    },

    renderStatus: function() {
        if (this.state.error) {
            return this._describeError();
        } else if (NeatApp.refDataCompleted()) {
            return (
                <StatusLabel status="success">
                    Reference data successfully processed.
                    Press <ButtonReference name='Next' /> to continue.
                </StatusLabel>
            );
        } else {
            return (
                <StatusLabel status='info'>
                    We are ready to get reference data for your symbols.
                </StatusLabel>
            );
        }
    },

    renderBody: function() {
        // Create the symbol overview stats.
        var candidates = this.state.info.candidates;

        var totalSymbols = 0;
        var symbolStats = _.map(candidates, function(symbolList, name) {
            totalSymbols += symbolList.length;

            return (
                <SymbolOverview symbol={name}
                    symbolList={symbolList}
                    key={name} />
            );
        });

        return (
            <div>
                {symbolStats}
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
            name: 'RefData',
            title: 'Reference Data',
            state: 'ReferenceData',
            pingWeight: 0.1,
        };
    },

    getInitialState: function() {
        return {
            loading: true
        };
    },

    componentWillMount: function () {
        this._getRefData();
    },

});

export default RefData;
