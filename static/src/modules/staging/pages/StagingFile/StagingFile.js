import _ from 'lodash';
import React from 'react';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import ColumnNameWidget from 'staging/components/ColumnNameWidget/ColumnNameWidget';
import ProgressMixin from 'common/utils/ProgressMixin';
import StagingMixin from 'staging/utils/StagingMixin';
import StatusLabel from 'staging/components/StatusLabel';
import ButtonReference from 'common/components/ButtonReference';
import ProcessingResults from 'staging/pages/StagingFile/ProcessingResults';
import Buttons from 'staging/pages/StagingFile/Buttons';

const { NiceNameMap } = NeatApp;

/**
 * Component for rendering the UI for staging a single file.
 * @component
 * @exports lib\Components\Staging\StagingFile
 */
const StagingFile = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _copy: function(o) {
        return JSON.parse(JSON.stringify(o));
    },

    _requestData: function(props) {
        if (_.isUndefined(props)) {
            props = this.props;
        }

        var self = this;
        NeatApp.cleanFileProcessing(props.fileIndex);

        util.post('/get_csv_config/' + NeatApp.getCurrentCase().name,
            props.item,
            function (res) {
                props.item.layout = res.layout;
                props.item.saveLayout = self._copy(props.item.layout);
                self.setState({loading: false, layout: res.layout});

                self._saveState();
            },
            function (xhr, status, err) {
                self.setState({error: err});
            }
        );
    },

    _reset: function() {
        this.setState({loading: true});
        this._requestData();
    },

    _onMount: function(buttons) {
        this.buttons = buttons;
        this.buttons.setState({error: this.error});
    },

    _onChange: function(error) {
        this.error = error;

        if (this.buttons) {
            this.buttons.setState({error: this.error});
        }

        this._saveState();
    },

    _saveState: function() {
        this.props.item.layout = this.state.layout;
        NeatApp.saveCurrentCase();
    },

    /**
     * Begin the import process. This is asynchronous and will
     * start a progress bar to poll the progress from the server.
     */
    _doImport: function() {
        NeatApp.cleanFileProcessing(this.props.fileIndex);
        this._saveState();

        this.setProcessParams({
            msgWeight: 15.0,
            pingWeight: 15.0,
            progressWeight: 70.0,

            totalProgressMsgs: 9,
            totalProgressPings: 3,
        });

        this.beginProcessing(
            'Process file',
            '/set_csv_config/' + NeatApp.caseName(),
            NeatApp.getCurrentCase().stagingFiles[this.props.fileIndex]);
    },

    _determineSuccess: function() {
        return this.props.item.lineCount > 0 && !this.props.item.error;
    },

    /**
     * Progress Mixin Methods
     * --------------------------------------------------------------------
     */

    onSuccessfulProcess: function() {
        this.props.item.success = this._determineSuccess();
        this._saveState();
    },

    processError: function(res) {
        if (!this.props.item.error) {
            this.props.item.error = res.message;
        }

        this.props.item.success = false;
        this._saveState();
    },

    processMsgs: function(res) {
        this.props.item.lineCount = this.props.item.lineCount
                                 || res.line_count
                                 || null;

        this.props.item.errorCount = this.props.item.errorCount
                                  || res.error_count
                                  || null;

        if (typeof this.props.item.lineCount === 'string') {
            this.props.item.lineCount = parseInt(this.props.item.lineCount);
        }
        if (typeof this.props.item.errorCount === 'string') {
            this.props.item.errorCount = parseInt(
                this.props.item.errorCount
            );
        }
    },

    /**
     * Staging Mixin Methods
     * --------------------------------------------------------------------
     */

    getTitle: function() {
        return 'Staging for ' + NiceNameMap[this.props.item.type];
    },

    renderStatus: function() {
        var item = this.props.item;

        if (this.state.processing) {
            this.renderProgress();

            return (
                <StatusLabel status="info">
                    NEAT is processing your file.
                    Depending on the size of your file
                    this may take a few minutes.
                </StatusLabel>
            );

        } else if (item.success) {
            var overview = (
                <ProcessingResults item={item}
                    error={this.state.error} />
            );

            return (
                <StatusLabel status="success">
                    NEAT successfully processed {overview}.
                    Press <ButtonReference name='Next' /> to continue.
                </StatusLabel>
            );

        } else if (item.error && item.errorCount > 0) {
            var inspect = (
                <ProcessingResults item={item}
                    error={this.state.error}
                    renderAs='Inspect the errors' />
            );

            return (
                <StatusLabel status="warning">
                    NEAT encountered too many errors
                    while processing your file.
                    {' '}{ inspect }.
                </StatusLabel>
            );

        } else if (item.error || this.state.error) {
            var critical = (
                <ProcessingResults item={item}
                    error={this.state.error}
                    renderAs='critical error' />
            );

            return (
                <StatusLabel status="warning">
                    NEAT encountered a {critical} while processing your file.
                </StatusLabel>
            );

        } else {
            return (
                <StatusLabel status="info">
                    Review the columns below.
                    When you are confident with the choices, click{' '}
                    <ButtonReference name='ProcessFile' />.
                </StatusLabel>
            );
        }
    },

    renderControls: function() {
        var item = this.props.item;
        return (
            <Buttons processing={this.state.processing}
                item={item}
                doImport={this._doImport}
                reset={this._reset}
                onMount={this._onMount}
                guard={this.guardLock()} />
        );
    },

    renderBody: function() {
        var item = this.props.item;
        var locked = NeatApp.isLocked();
        var disabled = locked || this.state.processing;
        return (
            <ColumnNameWidget disabled={disabled}
                layout={this.state.layout}
                onChange={this._onChange}
                item={item} />
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [ProgressMixin, StagingMixin],

    getDefaultProps: function() {
        return {
            name: 'ColumnMapping',
            stage: 'RegistrantFiles',
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState(this.getInitialState(nextProps));
    },

    getInitialState: function(props) {
        if (_.isUndefined(props)) {
            props = this.props;
        }

        // Translate params into props
        props.fileIndex = props.params.fileIndex;
        props.item = NeatApp.getCurrentCase().stagingFiles[props.fileIndex];
        console.log('index set to ' + props.fileIndex);

        // If layout already exists we use that
        if (props.item.layout) {
            return {
                loading: false,
                layout: props.item.layout,
            };
        } else {
            // otherwise we need to get the layout from the server
            this._requestData(props);

            return {
                loading: true,
                layout: null,
            };
        }
    }
});

export default StagingFile;
