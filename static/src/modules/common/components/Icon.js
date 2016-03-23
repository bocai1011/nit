import React from 'react';
import { Popover, Glyphicon, OverlayTrigger } from 'react-bootstrap';
import util from 'common/utils/util';

const icons = {
    okay: {glyph: 'ok', style: 'success', title: 'OK'},
    warn: {glyph: 'warning-sign', style: 'warning', title: 'Warning'},
    error: {glyph: 'exclamation-sign', style: 'danger', title: 'Error'},
    skip: {glyph: 'ban-circle', style: null, title: 'Skip'}
};

/**
 * Component for rendering an icon, potentially with a popover text.
 * Valid icons are okay, warn, error, and skip.
 * @component
 * @exports lib\Components\Icon
 */
const Icon = React.createClass({

    propTypes: {
        data: React.PropTypes.shape({
            icon: React.PropTypes.oneOf(['okay', 'warn', 'error', 'skip']),
            message: React.PropTypes.node,
        }),
    },

    render: function () {
        var icon = icons[this.props.data.icon];
        if (icon){
            var popover = (
                <Popover
                    placement="top"
                    className="stagingPopover_top"
                    positionLeft={200}
                    positionTop={50}
                    title={<strong>{icon.title}</strong>}
                >
                    {this.props.data.message}
                </Popover>
            );

            var className = [
                'overlayTrigger',
                'flex-center',
                this.props.data.icon,
                util.testClassNames.hasOverlayTrigger
            ];

            return (
                <OverlayTrigger placement="top" overlay={popover}>
                    <div tabIndex="0" className={className.join(' ')}>
                        <Glyphicon glyph={icon.glyph}/>
                        <span
                            aria-role="note"
                            className="hide508"
                        >
                            { this.props.data.message }
                        </span>{/*for 508 compliance*/}
                    </div>
                </OverlayTrigger>
            );
        }
        else {
            return null;
        }
    }
});

export default Icon;
