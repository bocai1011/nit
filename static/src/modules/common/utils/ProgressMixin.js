import _ from 'lodash';
import React from 'react';
import { Modal, ProgressBar } from 'react-bootstrap';
import util from 'common/utils/util';
import ProgressMessages from 'common/utils/ProgressMessages';
import NeatApp from 'app/utils/NeatApp';

/**
 * Progress mixin.
 * Add this to UI components that need to track progress
 * of some asynchronous task. The progress bar can either
 * be fed progress state from the server, or can guess
 * how long a task will take and show an estimated progress.
 * Important properties:
 *
 * msgWeight = 1.0 -> How much to weight messages received from the server in the progress calculation.
 * pingWeight = 1.0 -> How much to weight total pings to the server in the progress calculation.
 * progressWeight = 1.0 -> How much to weight the server's progress value response in the progress calculation.
 * totalProgressMsgs = 9.0 -> Total expected number of progress messages we will receive from the server.
 * totalProgressPings = 20.0 -> Total expected number of times we will ping the server.
 *
 * @component
 * @exports lib\Components\Staging\ProgressMixin
 */

const ProgressMixin = {

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    setProcessParams: function(params) {
        var self = this;

        _.forOwn(params, function(value, key) {
            self.props[key] = value;
        })
    },

    /**
     * Tell the progress bar to use a fake fill process.
     * Call this before beginProcessing. The bar will not ping the
     * server for progress, but will rather fill itself at a constant
     * rate. Once the initial server call completes the bar will finish
     * as usual.
     */
    useFakeAsynch: function() {
        this.props.fakeAsynch = true;
    },

    beginProcessing: function (name, route, data) {

        var self = this;
        self.procName = name;

        if (typeof data === 'undefined') {
            data = {};
        }

        self.setState({
            processing: true,
            progress: 0,
            progressMsgCount: 0,
            pingCount: 0,
            error:null,
            msgList: [],
            fromCheckpt: 0,
            toCheckpt: 100,
        });

        console.log(
            'Begin processing for ' + self.procName + ' with data: '
        );

        console.log(data);

        if (self.props.fakeAsynch) {
            this.setImportProgressTimeout();
        }

        util.post(route, data,
            function (data) {
                console.log(
                    'Begin processing for ' + self.procName + ' : success'
                );

                if (self.props.fakeAsynch) {
                    self.forceFinish();
                    setTimeout(function () {

                        // Pass the response data from the HTTP POST to
                        // the successfulProcess callback.
                        self.onSuccessfulProcess(data);
                    }, 650);
                    return;
                } else {
                    self.setState({
                        processing: true,
                        progress: 0,
                        progressMsgCount: 0,
                        pingCount: 0,
                        error:null
                    });

                    self.setImportProgressTimeout();
                }

                if (self.onBegin) {
                    self.onBegin();
                }
            },
            function (xhr) {
                var error = util.parseResponse(xhr);
                console.log(
                    'Begin processing for '
                    + self.procName
                    + ' : error -> '
                    + error
                );

                if (self.progressTimeout) {
                    clearTimeout(self.progressTimeout);
                }

                self.setState({
                    processing: false,
                    progress: 0,
                    progressMsgCount: 0,
                    pingCount: 0,
                    status:error,
                    error:error,
                });

                return true;
            });
    },

    /**
     * Force the progress bar to finish.
     * The progress bar will quickly fill in but will not call its
     * onSuccessfulProcess callback once it has finished.
     */
    forceFinish: function() {
        var self = this;

        if (this.progressTimeout) {
            clearTimeout(this.progressTimeout);
        }

        self.setState({
            processing: true,
            progress: 100,
            progressMsgCount: 100,
            pingCount: 1000,
            fromCheckpt: 0,
            toCheckpt: 100,
        });

        setTimeout(function () {
            self.setState({
                processing: false,
                progress: 0,
                status: 'Processing successfully for ' + self.procName
            });

            self.announce();
        }, 650);
    },

    announce: function() {
        var statusMessage = document.querySelector('.announce');
        if (!statusMessage) {
            statusMessage = document.querySelector('.progress-announce');
        }

        statusMessage.tabIndex = 0;
        statusMessage.focus();
        statusMessage.blur();
    },

    gotMessage: function(msg) {
        this.setState({
            msgList: [msg].concat(this.state.msgList),
        });
    },

    replaceMessage: function(msg) {
        var prev = this.state.msgList;
        prev[0] = msg;
        this.setState({msgList: prev});
    },

    /**
     * Poll the server for progress after 200 milliseconds.
     */
    setImportProgressTimeout: function() {
        if (this.progressTimeout) {
            clearTimeout(this.progressTimeout);
        }

        this.progressTimeout = setTimeout(this.getProgress, 200);
    },

    /**
     * Poll the server for progress.
     */
    getProgress: function() {
        var self = this;

        if (self.props.fakeAsynch) {
            self.setState({
                processing: true,
                pingCount: ++self.state.pingCount
            });

            self.setImportProgressTimeout();
            return;
        }

        console.log('Get progress for ' + self.procName);
        util.get('/staging_progress/' + NeatApp.getCurrentCase().name,
            function (res) {
                console.log('Get progress for ' + self.procName);
                console.log(res);

                if (_.isEmpty(res)) {
                    self.setState({
                        processing: true,
                        pingCount: ++self.state.pingCount
                    });

                    self.setImportProgressTimeout();
                    return;
                }

                if (res.done) {
                    console.log('Finished processing for ' + self.procName);
                    console.log(res);
                    self.onSuccessfulProcess();
                    self.forceFinish();

                } else if (res.error) {
                    if (self.processError) {
                        self.processError(res);
                    }

                    self.setState({
                        processing: false,
                        progress: 0,
                        status: 'Processing failed for ' + self.procName,
                        error: res.message,
                    });

                } else {
                    if (res.state) {
                        self.setState(res.state);
                    }

                    var progressMsgCount = self.state.progressMsgCount;
                    var progress = self.state.progress;

                    if (res.percent) {
                        progress = Math.max(progress, res.percent);
                    } else if (res.replace) {
                        ++progressMsgCount;
                        self.replaceMessage(res.replace);
                    } else if (res.message) {
                        ++progressMsgCount;
                        self.gotMessage(res.message);
                    }

                    if (self.processMsgs) {
                        self.processMsgs(res);
                    }

                    self.setState({
                        processing: true,
                        progress: progress,
                        progressMsgCount: progressMsgCount,
                    });

                    self.getProgress();
                }
            });
    },

    renderProgress: function () {
        if (this.state.processing) {

            var msgWeight =          this.props.msgWeight,
                pingWeight =         this.props.pingWeight ? this.props.pingWeight : 1.0,
                progressWeight =     this.props.progressWeight;

            var totalProgressMsgs =  this.state.totalProgressMsgs,
                totalProgressPings = this.state.totalProgressPings,
                progressMsgCount =   Math.min(this.state.progressMsgCount, totalProgressMsgs),
                pingCount =          Math.min(this.state.pingCount, totalProgressPings),
                fromCheckpt =        this.state.fromCheckpt,
                toCheckpt =          this.state.toCheckpt,
                progress =           this.state.progress;

            // Calculate the progress to render as a combination
            // of messages received, number of time we've pinged the server,
            // and the server's progress value response.
            var totalWeight = msgWeight + pingWeight + progressWeight;

            var checkptProgress = 100*(
                msgWeight * Math.min(1, progressMsgCount / totalProgressMsgs)
                + pingWeight * Math.min(1, pingCount / totalProgressPings)
                + progressWeight * Math.min(1, progress / 100.0)
            ) / totalWeight;

            var progress = fromCheckpt + ((toCheckpt - fromCheckpt)*checkptProgress/100);

            return (
                <Modal backdrop='static'>
                    <Modal.Header>
                        Processing...
                    </Modal.Header>
                    <Modal.Body>
                        <ProgressBar
                            striped
                            active
                            bsStyle="info"
                            now={progress}
                            style={{'height':35}}
                        />
                        <ProgressMessages msgList={this.state.msgList}/>
                    </Modal.Body>
                </Modal>
            );
        }
        else {
            return <noscript></noscript>;
        }
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        msgWeight: React.PropTypes.number,
        progressWeight: React.PropTypes.number,
        fakeAsynch: React.PropTypes.bool,
    },

    getDefaultProps: function() {
        return {
            msgWeight: 1.0,
            progressWeight: 1.0,
            fakeAsynch: false,
        };
    },

    getInitialState: function() {
        return {
            processing: false,
            progress: 0,
            totalProgressMsgs: 9.0,
            totalProgressPings: 20.0,
            progressMsgCount: 0,
            pingCount: 0,
            error: null,
            status: 'Ready',
            msgList: [],
            fromCheckpt: 0,
            toCheckpt: 100
        };
    },
};

export default ProgressMixin;
