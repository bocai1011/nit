import React from 'react';
import { Alert, Panel } from 'react-bootstrap';
import util from 'common/utils/util';
import _ from 'lodash';
import NeatApp from 'app/utils/NeatApp';
import AppButton from 'common/components/AppButton';
import ButtonReference from 'common/components/ButtonReference';
import ProgressMixin from 'common/utils/ProgressMixin';
import StagingMixin from 'staging/utils/StagingMixin';
import ErrorLink from 'common/components/ErrorLink';
import StatusLabel from 'staging/components/StatusLabel';
import format from 'string-format';

/**
 * Component for rendering the UI for case sharing.
 * @component
 * @exports lib\Components\Staging\Share
 */
const Share = React.createClass({

    _share: function() {
        NeatApp.addShareMark();
        this.useFakeAsynch();
        this.beginProcessing(
            'Share', '/archive_case/' + NeatApp.caseName(), {}
        );
    },

    /**
     * Progress Mixin Methods
     * --------------------------------------------------------------------
     */

    onSuccessfulProcess: function(data) {
        NeatApp.markAsShared();
        NeatApp.saveCurrentCase();
        this.setState({
            shared: true,
            data: data,
        });
    },

    /**
     * Staging Mixin Methods
     * --------------------------------------------------------------------
     */

    renderStatus: function() {

        if (this.state.error) {
            var error = <ErrorLink
                            text='error'
                            title='Error while preparing your case to share.'
                            error={this.state.error}
                            recommend='Please try fixing the issue and then trying to share again.'
                          />;

            return (
                <StatusLabel status="danger">
                    There was an {error} while sharing your case.
                </StatusLabel>
            );
        } else if (NeatApp.isLocked()) {
            return (
                <StatusLabel status="info">
                    This case is ready to be shared.
                    Click the <ButtonReference name='Share'/> button
                    to do so.
                </StatusLabel>
            );
        } else {
            return (
                <StatusLabel status="danger">
                    Some parts of staging are incomplete.
                    We recommend finishing them before sharing your case.
                </StatusLabel>
            );
        }
    },

    renderControls: function() {
        return (
            <AppButton
                name='Share'
                suffix={NeatApp.caseShortName()}
                bsStyle='primary'
                onClick={this._share}
            />
        );
    },

    renderBody: function() {

        var shares = _.map(NeatApp.getShareMarks().slice(-5).reverse(),
            function(time) {
                var timestamp = new Date(time).toLocaleString();
                return (
                    <Alert bsSize="small" bsStyle="info">
                        <span><strong>Shared on</strong> {timestamp}</span>
                    </Alert>
                );
            }
        );

        var unfinishedWarning = null;
        if (!NeatApp.canLock()) {
            unfinishedWarning = (
                <Alert bsStyle="danger">
                    <b>Warning!</b>{' '}
                    This case is not yet finished staging.
                    We recommend finishing staging before sharing
                    your case with colleagues.
                </Alert>
            );
        }

        var shareable = null;
        if (!this.state.processing && this.state.data) {

            var filePath = this.state.data;
            var pathSeparator = /\\/g.test(filePath) ? '\\' : '/';

            // Get the name of the case archive's temp parent directory.
            var tmpDir = filePath.split(pathSeparator).slice(-2, -1)[0];
            var fileName = util.filenameFromPath(filePath);
            var header = (
                <div>
                    <h4>
                        <strong>The case file is now ready to download.</strong>
                    </h4>
                    <p>
                        To do so, right-click the case archive link below,
                        choose Save As, and save the file to a shared drive
                        that your colleagues can access.
                    </p>
                </div>
            );

            var downloadLink = format(
                '/archive_case/{}?tmpdir={}',
                NeatApp.caseName(),
                tmpDir
            );

            shareable = (
                <Panel
                    className="share-page-panel"
                    header={header}
                    bsStyle="success"
                >
                    <span>
                        <i className="fa fa-file-archive-o"></i>
                        <a href={downloadLink} download>{ fileName }</a>
                    </span>
                </Panel>
            );

        }

        return (
            <div>
                {unfinishedWarning}
                {shareable}
                {shares}
            </div>
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins:  [ProgressMixin, StagingMixin],

    getDefaultProps: function() {
        return {
            name: 'Share',
            title: 'Share Case',
            stage: 'Share',
        };
    },

    getInitialState: function () {
        return {
            shared: NeatApp.isShared()
        };
    },

});

export default Share;
