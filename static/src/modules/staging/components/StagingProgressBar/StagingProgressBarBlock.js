import React from 'react';
import { Link, State } from 'react-router';
import {
    OverlayTrigger,
    Popover,
    Glyphicon,
    OverlayMixin,
} from 'react-bootstrap';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import Notification from 'common/components/Notification';

const { StatusLookup } = NeatApp;

/**
 * Component for displaying a single block of the staging progress bar.
 * @component
 */
const StagingProgressBarBlock = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _stage: function() {
        var routes = this.getRoutes();
        var route = routes[routes.length - 1].name;

        switch (route) {
            case 'overview': return 0;
            case 'files': return 1;
            case 'stage-file': return 1;
            case 'create_database': return 12;
            case 'interpretation': return 2;
            case 'refdata': return 3;
            case 'symbols': return 4;
            case 'finalize': return 5;
        }
    },

    _stageClass: function(stage) {
        var status = StatusLookup[this.props.phase.statusCode];

        var className = '';
        if (!this.props.mini && stage === this._stage()) {
            className = 'progress-here';
        }

        return className + ' ' + status.progressStyle;
    },


    _handleToggle: function() {
        this.setState({
            isModalOpen: !this.state.isModalOpen
        });
    },

    /**
     * Overlay Mixin Methods
     * --------------------------------------------------------------------
     */

    renderOverlay: function () {
        if (!this.state.isModalOpen) {
            return <span />;
        }

        var status = StatusLookup[this.props.phase.statusCode];
        var title = <h4>{this.props.info.title} Unavailable</h4>

        return (
            <Notification title={title} onRequestHide={this._handleToggle}>
                {status.description}
            </Notification>
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [ State, OverlayMixin ],

    propTypes: {
        guard: React.PropTypes.any,
        info: React.PropTypes.object,
        mini: React.PropTypes.bool,
        phase: React.PropTypes.object,
    },

    getInitialState: function() {
        if (this.props.guard) {
            return { isModalOpen: false };
        }
        return {};
    },

    render: function() {
        var name = NeatApp.getCurrentCase().name;
        var status = StatusLookup[this.props.phase.statusCode];

        if (!this.props.info.stage) {
            return <span></span>;
        }

        var guarded = this.props.phase.statusCode === 'inactive';
        var textFor508 = this.props.info.title
                         + ' Stage '
                         + status.label;

        var link;
        if (guarded) {
            link = (
                <span>
                    <a className={this._stageClass(this.props.info.stage)}
                        onClick={this._handleToggle} >
                        <Glyphicon glyph='stop' />
                    </a>
                    <span className="hide508" aria-role="label">
                        {textFor508}
                    </span>
                </span>
            );
        } else {
            link = (
                <Link to={this.props.info.link}
                    params={{name: name}}
                    className={this._stageClass(this.props.info.stage)}>
                    <Glyphicon glyph='stop' />
                    <span className="hide508" aria-role="label">
                        {textFor508}
                    </span>
                </Link>
            );
        }

        if (!this.props.mini) {
            var popover = (
                <Popover title={<strong>{this.props.info.title}</strong>}>
                    Stage {status.label}
                </Popover>
            );

            link = (
                <OverlayTrigger overlay={popover} placement="bottom">
                    <span className={util.testClassNames.hasOverlayTrigger}>
                        {link}
                    </span>
                </OverlayTrigger>
            );
        }

        return link;
    }
});

export default StagingProgressBarBlock;
