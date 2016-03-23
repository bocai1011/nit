import React from 'react';
import { Button, ProgressBar } from 'react-bootstrap';
import ErrorNotification from 'common/components/ErrorNotification';
import Resumable from 'resumablejs';

/**
 * Component for rendering a link that opens up a
 * file picker dialog. The dialog is currently opened
 * via the server creating a tkinter file browser.
 * @component
 * @exports lib\Components\FileDialogLink
 */
const FileDialogLink = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    // assignBrowse transforms a DOM element into a target for a file
    // upload. Clicking the assigned element will open a file browser.
    _assignBrowse: function () {
        var node = React.findDOMNode(this.refs.paths);

        // Only assign the node as a file browser input if
        // it is not one already.
        if (!node.querySelector('input[type="file"]')) {
            this.resumable.assignBrowse(node);
        }
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        onFileUpload: React.PropTypes.func.isRequired,
        targetRoute: React.PropTypes.string.isRequired,

        query: React.PropTypes.object,
    },

    getDefaultProps: function () {
        return {
            query: {},
        };
    },

    getInitialState: function () {
        return {
            uploadProgress: 0.0,
            isLoading: false,
            error: 0,
            errorMessage: null,
        };
    },

    componentWillMount: function() {

        var self = this;

        var resumable = new Resumable({
            target: self.props.targetRoute,
            chunkSize: 8388608,
            testChunks: false,
            simultaneousUploads: 1,
            maxChunkRetries: 25,
            xhrTimeout: 10000,
            query: self.props.query
        });

        if (!resumable.support) {
            throw new TypeError('Resumable not supported');
        }

        resumable.on('fileAdded', function () {
            resumable.upload();
            self.setState({
                uploadProgress: 0.0,
                isLoading: true
            });
        });

        // On fileSuccess, `file` stores a ResumableFile object
        // corresponding to the file that was successfully uploaded.
        // `message` stores the server's response, which is an array of
        // the absolute path(s) to the uploaded file(s) on the server.
        resumable.on('fileSuccess', function (file, message) {
            var files = JSON.parse(message);
            self.props.onFileUpload(files);

            // When a file is successfully uploaded, manually remove it
            // from Resumable's list so that it can be uploaded again if
            // necessary.
            self.resumable.removeFile(file);
            self.setState({
                error: 0,
                uploadProgress: 0.0,
                isLoading: false,
            });
        });

        resumable.on('fileProgress', function (file) {
            var progress = file.progress();
            self.setState({
                uploadProgress: progress * 100.0,
                isLoading: progress >= 0.0 && progress < 1.0,
            });
        });

        resumable.on('cancel', function () {
            self.setState({
                uploadProgress: 0.0,
                isLoading: false,
            });
        });

        resumable.on('error', function (err) {

            // Error gets incremented because it's passed as a key to the
            // <ErrorNotification/> component. That way React can
            // distinguish between multiple <ErrorNotification/>s.
            self.setState({
                error: ++self.state.error,
                errorMessage: err ? JSON.parse(err).message : null,
            });
            resumable.cancel();
        });

        resumable.on('complete', function () {
            self.setState({
                uploadProgress: 0.0,
                isLoading: false,
            });
        });

        self.resumable = resumable;

    },

    componentDidMount: function () {
        if (this.isMounted()) {
            this._assignBrowse();
        }
    },

    componentDidUpdate: function() {

        // Reassign the file browser node if there isn't a file currently
        // being uploaded.
        if (this.isMounted() && !this.state.isLoading) {
            this._assignBrowse();
        }
    },

    render: function () {
        var progress = this.state.uploadProgress,
            element;

        var self = this;
        var bars = self.resumable.files.map(function (el, i) {
            return (
                <span key={i}>
                    <ProgressBar
                        now={progress}
                        label={el.relativePath}
                        bsStyle="info"
                        active />
                    <Button
                        ref="cancelUpload"
                        bsStyle="danger"
                        bsSize="xsmall"
                        block
                        onClick={self.resumable.cancel}>
                        Cancel
                    </Button>
                </span>
            );
        });

        var error;
        if (this.state.error) {
            error = (
                <ErrorNotification
                    key={this.state.error}
                    error={this.state.errorMessage}
                    description="NEAT is having trouble with your file upload. Check your internet connection or try restarting NEAT." />
            );
        }

        if (this.state.isLoading) {
            element = (
                <div>
                    {bars}
                </div>
            );
        } else {
            element = (
                <span ref="paths">
                    {this.props.children}
                </span>
            );
        }

        return (
            <div className="file-dialog-link">
                { error }
                { element }
            </div>
        );
    }
});

export default FileDialogLink;
