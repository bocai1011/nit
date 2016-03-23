import React from 'react';
import { Link } from 'react-router';
import PhaseConsts from 'app/utils/PhaseConsts';
import NeatApp from 'app/utils/NeatApp';
import Header from 'common/components/Header';
import LoadingIcon from 'common/components/LoadingIcon';
import StagingNavigator from 'staging/components/StagingNavigator';
import StatusLabel from 'staging/components/StatusLabel';

const { StatusLookup } = NeatApp;

/**
 * Staging mixin.
 * Use this for all staging pages that will have a title,
 * help blurb, control buttons, and status text.
 *
 * Inheriting components must implement:
 *  - renderStatus
 *  - renderControls
 *  - renderBody
 *  - renderProgress
 *  - getTitle
 *
 * Optionally, components may implement:
 *  - mixinClass
 *  - renderAfterBody
 *
 * @component
 * @exports lib\Components\Staging\StagingMixin
 */
const StagingMixin = {

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _renderAfterBody: function() {
        if (this.renderAfterBody !== undefined) {
            return this.renderAfterBody();
        }
        return null;
    },

    _mixinClass: function() {
        if (this.mixinClass !== undefined) {
            return this.mixinClass();
        }
        return '';
    },

    _guardActive: function() {
        var info = NeatApp.getPhaseInfo(this.props.stage);
        return info && info.statusCode === 'inactive';
    },

    guardLock: function() {
        var guard;
        if (NeatApp.isLocked()) {
            var linkparams = {name: NeatApp.caseName()};
            guard = { title: 'Already Locked',
                      body: ('Case has already been finalized and locked. ' +
                             'This action will require unlocking the case, and you will ' +
                             'have to finish the rest of staging action and ' +
                             'finalize it again. If you really want to continue, '),
                      link: <Link to="case-overview" params={linkparams}>please go to Case Overview page and unlock it.</Link>
            }
        }
        return guard;
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        name: React.PropTypes.oneOf([
            'StagingProcess',
            'FilePicker',
            'ColumnMapping',
            'CreateDataBase',
            'Interpretation',
            'RefData',
            'Symbols',
            'Finalize',
            'Share',
            'Restore',
        ]),
        stage: React.PropTypes.oneOf(Object.keys(PhaseConsts)),
        title: React.PropTypes.node,

    },
    render: function() {
        var progress = null;
        if (this.state && this.state.processing) {
            progress = this.renderProgress();
        }

        var body = null;
        if (this.state && this.state.loading) {
            body = <LoadingIcon />;

        } else if (this._guardActive()) {
            var info = NeatApp.getPhaseInfo(this.props.stage);
            var status = StatusLookup[info.statusCode];

            body = (
                <div className='controls'>
                    <StatusLabel status='info'>
                        { status.description }
                    </StatusLabel>
                    <div className='float-right' />
                </div>
            );
        } else {
            var controls = this.renderControls();
            var status = this.renderStatus();
            var functionalLine = null;

            if (controls || status) {
                functionalLine = (
                    <div className='staging-mixin-controls clearfix'>
                        <div className='flex-center-vert float-left'>
                            { status }
                        </div>
                        <div className='flex-center-vert float-right'>
                            { controls }
                        </div>
                    </div>
                );
            }

            body = ([
                progress,
                this.renderBody()
            ]);
        }

        var title = this.props.title;
        if (this.getTitle) {
            title = this.getTitle();
        }

        return (
            <div className={['staging-mixin', this._mixinClass()].join(' ')}>
                <Header right={<StagingNavigator />}
                    helpBlurb={this.props.name}>
                    { title }
                </Header>
                { functionalLine }
                <div className='staging-mixin-body'>
                    { body }
                </div>
                <div className='staging-mixin-after-body'>
                    { this._renderAfterBody() }
                </div>
            </div>
        );
    },
};

export default StagingMixin;
