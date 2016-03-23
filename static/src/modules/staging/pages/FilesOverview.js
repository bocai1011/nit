import React from 'react';
import { Button, Table, OverlayTrigger, Popover, Glyphicon } from 'react-bootstrap';
import _ from 'lodash';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import TableWidget from 'common/components/TableWidget';
import ModalOverlay from 'common/components/ModalOverlay';
import ButtonLink from 'common/components/ButtonLink';
import FileDialogLink from 'common/components/FileDialogLink';
import ProgressMixin from 'common/utils/ProgressMixin';
import StagingMixin from 'staging/utils/StagingMixin';
import ErrorLink from 'common/components/ErrorLink';
import StatusLabel from 'staging/components/StatusLabel';
import ButtonReference from 'common/components/ButtonReference';
import AppButton from 'common/components/AppButton';

const { NiceNameMap } = NeatApp;

/**
 * Component for rendering a single staging item file.
 * @component
 */
const StagingItem = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _onFileUpload: function (files) {
        this.setState({
            item: _.assign(this.state.item, {file: files})
        });
        NeatApp.cleanFileItem(this.props.fileIndex);
        NeatApp.saveCurrentCase();
        this.props.fileTouched(1);
    },

    _removeFile: function() {
        this.setState({
            item: _.assign(this.state.item, {file: []})
        });
        NeatApp.cleanFileItem(this.props.fileIndex);
        NeatApp.saveCurrentCase();
        this.props.fileTouched(-1);
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        fileIndex: React.PropTypes.number,
        item: React.PropTypes.object,
        fileTouched: React.PropTypes.object,
    },

    // The item stores information about the registrant files chosen by the
    // user and can be updated when the user uploads a new file. It's a
    // stateful component because the user can upload new files.
    getInitialState: function() {
        return {
            item: this.props.item
        };
    },

    render: function() {
        var name = NeatApp.getCurrentCase().name;
        var fileIndex = this.props.fileIndex;
        var type = this.props.item.type;
        var item = this.props.item;

        if (!NeatApp.getApp().NeatOptions.DatabaseNames.value) {
            type = NiceNameMap[type] || type;
        }

        var hasFile = this.state.item.file && this.state.item.file.length > 0;

        var viewButton = null;
        var removeButton = null;
        var tooltip = null;
        var tooltipMessage = '';
        var status = <span />;
        if (hasFile) {
            viewButton = (
                <ModalOverlay
                    buttonName='ViewFile'
                    buttonTooltip='View this file'
                    title="File viewer"
                    id="table-overlay"
                    className="btn-block"
                >
                    <TableWidget
                        params={{type: item.type, file: item.file}}
                        url={'/get_csv/' + name}
                        options={{
                            gridHeight: '90%',
                            forceFitColumns: false
                        }}
                    />
                </ModalOverlay>
            );

            removeButton = (
                <AppButton
                    name='RemoveFile'
                    disabled={NeatApp.isLocked()}
                    className='btn-block'
                    onClick={this._removeFile}
                    tooltip='Remove this file'
                    confirm='Are you sure you want to remove this file?'
                />
            );

            if (this.props.item.success) {
                status = <h3><Glyphicon glyph='ok' /></h3>;
                tooltipMessage = 'This file has been successfully processed.';
                tooltip = <Popover>{ tooltipMessage }</Popover>;
            } else {
                tooltipMessage = 'This file is not correctly staged.';
                tooltip = <Popover>{ tooltipMessage }</Popover>;
            }
        } else {
            viewButton = (
                <AppButton
                    name='ViewFile'
                    className='btn-block'
                    disabled={true}
                />
            );

            removeButton = (
                <AppButton
                    name='RemoveFile'
                    className='btn-block'
                    disabled={true}
                />
            );

            tooltip = (
                <Popover>
                    You have not selected a file. Click <a>Browse...</a>
                    if you wish to choose one.
                </Popover>
            );
        }

        var fileNames = this.state.item.file;
        var nameEls = fileNames.map(function (file, i) {
            return (<span key={i}>{ file }</span>);
        });

        if (!NeatApp.isLocked()) {
            nameEls = (
                <FileDialogLink
                      targetRoute={
                          '/' + NeatApp.getCurrentCase().name + '/upload'
                      }
                      query={{ fileIndex: fileIndex }}
                      onFileUpload={this._onFileUpload}
                >
                        <Button bsStyle='link'>
                            {
                                _.isEmpty(nameEls) ?
                                    <span>Browse...</span> :
                                    nameEls
                            }
                        </Button>
                </FileDialogLink>
           );
        }
        return (
            <tr>
                <td>{ type }</td>
                <td className='ellipsis'
                    title={ fileNames.join(', ') }>
                    { nameEls }
                </td>
                <td>
                    <OverlayTrigger overlay={tooltip}>
                        <div className={util.testClassNames.hasOverlayTrigger}>
                            { status }
                        </div>
                    </OverlayTrigger>
                    <span className="hide508" aria-role="status">
                        { tooltipMessage }
                    </span>
                </td>
                <td>{ viewButton }</td>
                <td>{ removeButton }</td>
                <td>
                    <ButtonLink
                        name='StageFile'
                        className="btn-block"
                        tooltip='Stage this file'
                        to="stage-file"
                        disabled={!hasFile}
                        params={{name: name, fileIndex: fileIndex}}
                    />
                </td>
            </tr>
        );
    }
});

/**
 * Component for rendering the UI for handling the Files Overview stage.
 * @component
 * @exports lib\Components\Staging\FilesOverview
 */
const FilesOverview = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Mark the RegistrantFile stage done when user click confirm
     */
    _confirmFileDone: function() {
        NeatApp.markFilesDone();
        NeatApp.saveCurrentCase();
        this.setState( {filesDone: NeatApp.filesDone()});
    },

    /**
     * Change the page state that track the file addition/removal
     * @param {int} : +1 for file added; -1 for file removed
     */
    _fileTouched: function(c) {
        this.setState( {fileTouched: this.state.fileTouched + c });
    },

    /**
     * Staging Mixin Methods
     * --------------------------------------------------------------------
     */

    renderControls: function() {
        var tradeBlotter = NeatApp.getCurrentCase().stagingFiles[0];
        var hasTradeBlotter = tradeBlotter.file && tradeBlotter.file.length > 0;
        var confirmReady;
        var disabledTooltip = null;

        if ( !hasTradeBlotter ) {
            confirmReady = false;
            disabledTooltip = 'Please upload a registrant trade blotter before continuing.';
        } else {
            if ( NeatApp.nextFile(-1) >= 0 ) {
                confirmReady = false;
                disabledTooltip = (
                    <span>Please <ButtonReference name='StageFile' /> all uploaded files before continuing.</span>
                );
            } else if ( NeatApp.filesDone() ) {
                confirmReady = false;
                disabledTooltip = (
                    <span>Confirmed.  Please click <ButtonReference name='Next' /> to continue.</span>
                );
            } else {
                confirmReady = true;
            }
        }

        return <AppButton
                   name={'FileConfirm'}
                   disabled={!confirmReady && !NeatApp.isLocked()}
                   onClick={this._confirmFileDone}
                   tooltip='Click this button if you are completely done loading registrant files.'
                   disabledTooltip = {disabledTooltip}
                   guard={this.guardLock()}
                 />;
    },

    renderStatus: function() {
        if (this.state.error) {
            var error = (
                <ErrorLink
                    text='View the error.'
                    title='Error while loading files'
                    error={this.state.error}
                    recommend='Please try fixing the issue and then loading files again.'
                />
            );

            return (
                <StatusLabel>
                    Errors were encountered while loading the file.
                    {error}
                </StatusLabel>
            );

        } else if (NeatApp.canCreateDb() && !NeatApp.filesDone()) {
            return (
                <StatusLabel>
                    If you have other files to add please add them now.
                    Otherwise please click <ButtonReference name='FileConfirm' /> to indicate you are done adding registrant files.
                </StatusLabel>
            );
        } else if (NeatApp.canCreateDb() && NeatApp.filesDone()) {
            return (
                <StatusLabel status="success">
                    Now that you are done loading registrant files,
                    press <ButtonReference name='Next' /> to continue.
                </StatusLabel>
            );
        } else if (!NeatApp.hasTradeBlotter()){
            return (
                <StatusLabel>
                    Please pick a trade blotter you want to analyze.
                </StatusLabel>
            );

        } else if (!NeatApp.validTradeBlotter()) {
            return (
                <StatusLabel status="warning">
                    The current trade blotter file type is not supported.
                    Please remove and pick a different file.
                </StatusLabel>
            );

        } else if (!NeatApp.completedTradeBlotter()) {
            return (
                <StatusLabel status="info">
                    If you have other files to add please add them now.
                    Otherwise press <ButtonReference name='StageFile' />{' '}
                    to stage your trade blotter.
                </StatusLabel>
            );
        } else {
            return (
                <StatusLabel status="info">
                    If you have other files to add please add them now.
                    Otherwise press <ButtonReference name='StageFile' />{' '}
                    to begin staging your files.
                </StatusLabel>
            );
        }
    },

    renderBody: function() {
        var self = this;
        var items = NeatApp.getCurrentCase().stagingFiles.map(
            function(item, i) {
                return (<StagingItem item={item} key={i} fileIndex={i} fileTouched={self._fileTouched} />);
            }
        );

        return (
            <Table className="stagingFileOverview">
                <caption className='hide508'>
                    A table showing the names of the Registrant&rsquo;s
                    files, a column for browsing for a source to match it
                    with, and buttons for processing that match.
                </caption>
                <thead>
                    <tr>
                        <th>File Type</th>
                        <th>File Name</th>
                        <th className='icon-col'></th>
                        <th className='button-col'></th>
                        <th className='button-col'></th>
                        <th className='button-col'></th>
                    </tr>
                </thead>
                <tbody>
                    { items }
                </tbody>
            </Table>
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [ProgressMixin, StagingMixin],

    propTypes: {
        name: React.PropTypes.string,
        stage: React.PropTypes.string,
        title: React.PropTypes.string,
    },

    getDefaultProps: function() {
        return {
            name: 'FilePicker',
            title: 'Registrant Files',
            stage: 'RegistrantFiles',
        };
    },

    getInitialState: function() {
        return {
            fileTouched: 0,
            filesDone: NeatApp.filesDone(),
        };
    },

});

export default FilesOverview;
