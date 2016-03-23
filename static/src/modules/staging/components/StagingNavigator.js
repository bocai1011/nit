import React from 'react';
import { Link, State, Navigation } from 'react-router';
import { Button, Glyphicon, ModalTrigger } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import _ from 'lodash';
import Notification from 'common/components/Notification';
import StagingProgressBar from 'staging/components/StagingProgressBar/StagingProgressBar';
import ButtonReference from 'common/components/ButtonReference';

const { PhaseInfo } = NeatApp;

/**
 * Component for rendering a single navigation button.
 * This button can either link to a staging page, or
 * can throw up a staging guard that displays a dialogArguments
 * explaining to the user what they need to do before being
 * able to click this button.
 * @component
 */
const NavigatorButton = React.createClass({

    propTypes: {
        dirClass: React.PropTypes.string,
        glyph: React.PropTypes.string,
        params: React.PropTypes.object,
        to: React.PropTypes.string,
    },

    render: function() {
        var _508text = (this.props.dirClass === 'arrow-right') ?
                                                    'Continue' :
                                                    'Go Back';

        var icon = (
            <Glyphicon
                glyph={this.props.glyph}
                className={[this.props.dirClass, 'arrow-btn'].join(' ')}
            />
        );

        if (_.isObject(this.props.to)) {
            return (
                <ModalTrigger modal={this.props.to}>
                    <Button bsStyle='link' bsSize='large'>
                        {icon}
                        <span aria-role="label" className="hide508">
                            { _508text }
                        </span>
                    </Button>
                </ModalTrigger>
            );
        } else if (this.props.to) {
            return (
                <Link to={this.props.to} params={this.props.params}>
                    {icon}
                    <span aria-role="label" className="hide508">
                        { _508text }
                    </span>
                </Link>
            );
        } else {
            return (
                // TODO this doesnt do anything
                <Button bsStyle='link' bsSize='large'>
                    {icon}
                    <span aria-role="label" className="hide508">
                        { _508text }
                    </span>
                </Button>
            );
        }
    },
});

/**
 * Component for rendering the prev/continue navigation buttons.
 * @component
 * @exports lib\Components\Staging\StagingNavigator
 */
var StagingNavigator = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _next: function(e) {
        if (this.props.nextClick) {
            this.props.nextClick();
        }
        e.preventDefault();
        e.stopPropagation();
    },

    _prev: function(e) {
        if (this.props.prevClick) {
            this.props.prevClick();
        }
        e.preventDefault();
        e.stopPropagation();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [ State, Navigation ],

    propTypes: {
        disabled: React.PropTypes.bool,
        nextClick: React.PropTypes.func,
        prevClick: React.PropTypes.func,
    },

    componentDidMount: function() {
        NeatApp.setNavigator(this);
    },

    render: function() {
        var ourCase = NeatApp.getCurrentCase();
        var name = ourCase.name;

        var files = ourCase.stagingFiles;
        var tradeBlotter = files[0];
        var hasTradeBlotter = tradeBlotter.file &&
                              tradeBlotter.file.length > 0;

        var routes = this.getRoutes();
        var route = routes[routes.length - 1].name;
        var params = this.getParams();

        var prev = null, next = null;
        var prevParams = {name: name}, nextParams = {name: name};

        if (!this.props.disabled) {
            switch (route) {
            case 'overview':
                prev = null;
                next = 'files';

                for (var i = 0; i < ourCase.stagingPhases.length; i++) {
                    var phase = NeatApp.getPhaseInfo(PhaseInfo[i].name);
                    if (!NeatApp.stageDone(phase)) {
                        next = PhaseInfo[i].link;
                        break;
                    }
                }

                break;
            case 'files':
                prev = 'overview';

                if (!hasTradeBlotter) {
                    next = (
                        <Notification title='Trade Blotter required'>
                            NEAT requires a registrant trade blotter to continue.
                            Please click <a>Browse...</a> next to Trade Blotter to pick a registrant trade blotter file to analyze.
                        </Notification>
                    );
                } else {
                    var nextFile = NeatApp.nextFile(-1);
                    if (nextFile >= 0) {
                        next = (
                            <Notification title='You have unstaged files.'>
                                The trade blotter you selected has not been staged yet.
                                Please click <ButtonReference name='StageFile' /> next to Trade Blotter to begin staging it.
                            </Notification>
                        );
                    } else {
                        if (NeatApp.filesDone() && NeatApp.canCreateDb()) {
                            next = 'create_database';
                        } else {
                            next = (
                                <Notification title='Are you done loading registrant files?'>
                                    If you are done loading all the registrant files,
                                    Please press <ButtonReference name='FileConfirm' /> to confirm.
                                </Notification>
                            );
                        }
                    }
                }

                break;
            case 'stage-file':
                var fileIndex = parseInt(params.fileIndex);
                var file = files[fileIndex];
                var prevFile = NeatApp.prevFile(fileIndex);
                var nextFile = NeatApp.nextFile(fileIndex);

                if (prevFile >= 0) {
                    prev = 'stage-file'; prevParams.fileIndex = prevFile;
                } else {
                    prev = 'files';
                }

                if (!file.success && !file.errorCount) {
                    next =
                        <Notification title='File not processed'>
                            Before continuing we need to process this file.
                            After you&#39;ve told NEAT what each column means in this file, press the <ButtonReference name='ProcessFile' /> button.
                            NEAT will process your file and let you know if there were any errors.
                        </Notification>;
                } else if (!file.success && file.errorCount > 0) {
                    next =
                        <Notification title='File not processed successfully'>
                            NEAT processed your file but there were too many errors to continue.
                            Click on the error link for more detail.
                        </Notification>;
                } else if (!file.success) {
                    next =
                        <Notification title='File not processed successfully'>
                            NEAT was unable to process your file correctly and cannot proceed.
                        </Notification>;
                } else if (nextFile >= 0) {
                    next = 'stage-file'; nextParams.fileIndex = nextFile;
                } else {
                    next = 'files';
                }
                break;

            case 'create_database':
                prev = 'files';
                if (NeatApp.dbCreated() && NeatApp.canCreateDb()) {
                    next = 'interpretation';
                } else {
                    next = (
                        <Notification title='Database not created'>
                            Now that you have successfully processed the registrant files,
                            you need to create the database for the case.
                            Please press <ButtonReference name='CreateDb' /> to continue.
                        </Notification>
                    );
                }
                break;

            case 'interpretation':
                prev = 'create_database';
                if (!NeatApp.interpCompleted()) {
                    next =
                        <Notification title='Interpretation not completed'>
                            Once you have mapped all of the values below please press the <ButtonReference name='InterpretationConfirm' /> button to verify your choices.
                        </Notification>;
                } else {
                    next = 'refdata';
                }

                break;

            case 'refdata':
                prev = 'interpretation';
                next = 'symbols';
                if (!NeatApp.refDataCompleted()) {
                    next = (
                        <Notification title='ReferenceData not completed'>
                            We need to retrieve reference data. Please click <ButtonReference name='RefernceData' /> to start this process.
                        </Notification>
                    );
                }
                break;

            case 'symbols':
                prev = 'refdata';
                next = 'finalize';
                if (!NeatApp.rectifyCompleted()) {
                    next = (
                        <Notification title='Rectification not completed'>
                            Please review the symbol information below and make
                            adjustments as necessary. Please click{' '}
                            <ButtonReference name='ConfirmSymbols' /> to confirm
                            the information.
                        </Notification>
                    );
                }
                break;

            case 'finalize':
                prev = 'symbols';
                next = 'export';

                if (!NeatApp.finalized()) {
                    next =
                        <Notification title='Staging not finalized.'>
                            We are nearly done with staging. Before we can proceed to awesome data analysis
                            we need to finalize the staging. Please click <ButtonReference name='Finalize' /> to start this process.
                            <br /><br />
                            Note, finalizing may take a few minutes once started.
                        </Notification>;
                }

                break;

            case 'export':
                prev = 'finalize';
                next = 'share';

                break;

            case 'share':
                prev = 'export';
                next = 'reports-start';

                break;
            }
        }

        return (
            <div className='staging-navigator'>
                <div className='staging-navigator-progress-bar'>
                    <StagingProgressBar />
                </div>
                <div className='staging-navigator-buttons'>
                    <NavigatorButton
                        to={prev}
                        params={prevParams}
                        glyph='chevron-left'
                        dirClass='arrow-left'
                    />
                    <NavigatorButton
                        to={next}
                        params={nextParams}
                        glyph='chevron-right'
                        dirClass='arrow-right'
                    />
                </div>
            </div>
        );
    }
});

export default StagingNavigator;
