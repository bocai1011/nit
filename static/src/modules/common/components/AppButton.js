import _ from 'lodash';
import React, { PropTypes } from 'react';
import {
Button,
Popover,
OverlayTrigger,
Glyphicon,
Modal,
OverlayMixin,
} from 'react-bootstrap';
import util from 'common/utils/util';
import AppButtons from 'common/components/AppButtons';

/**
 * Component for rendering an application button.
 * This button must be given a value prop that looks up what the text
 * of the button will be. A direct string child is not allowed.
 * @component
 * @exports lib\Components\Button
 */
const AppButton = React.createClass({

     /**
      * Custom Methods
      * -------------------------------------------------------------------
      */

    _isModalButton: function() {
        return (this.props.guard
                || this.props.confirm
                || this.props.confirmFn);
    },

    _toggle: function() {
        this.setState({
            isModalOpen: !this.state.isModalOpen
        });
    },

    _confirmAndToggle: function() {
        this.props.onClick();
        this._toggle();
    },

    _onClick: function() {
        if (this._isModalButton()) {
            this._toggle();
        } else {
            this.props.onClick();
        }
    },

    _onMouseUp: function() {
        this.refs.button.getDOMNode().blur();
    },

    _onMouseEnter: function() {
        this.setState({
            mouseEntered: true,
        });
    },

    _onMouseLeave: function() {
        this.setState({
            mouseEntered: false,
        });
    },

    /**
     * Takes a tooltip and generates a tooltip ReactElement and an
     * accessibility label for it.
     * @arg {string|ReactElement} tooltip - The tooltip to augment.
     * @return {object} - An object containing the label and ReactElement.
     */
    _createTooltip: function (tooltip) {
        return {

            tip508: (
                <label
                    className='hide508'
                    aria-role='label'
                    htmlFor={this.props.name}
                >
                    { tooltip }
                </label>
            ),

            tooltip: (
                <Popover>
                    { tooltip }
                </Popover>
            ),

        };
    },

    /**
     * Overlay Mixin Methods
     * --------------------------------------------------------------------
     */

    renderOverlay: function () {
        if (this.state.isModalOpen && this.props.guard) {
            return (
                <Modal
                    id={this.props.id}
                    title={this.props.guard.title}
                    onRequestHide={this._toggle}
                >
                    <div className='modal-body'>
                        {this.props.guard.body}
                        {this.props.guard.link}
                    </div>
                    <div className='modal-footer'>
                        <Button onClick={this._toggle}>
                            Close
                        </Button>
                    </div>
                </Modal>
            );
        } else if (this.state.isModalOpen &&
            (this.props.confirm || this.props.confirmFn)) {
            var confirmText = this.props.confirm;
            if (this.props.confirmFn) {
                confirmText = this.props.confirmFn();
            }
            return (
                <Modal
                    id={this.props.id}
                    title='Please confirm...'
                    onRequestHide={this._toggle}
                >
                    <div className='modal-body'>
                        { confirmText }
                    </div>
                    <div className='modal-footer'>
                        <Button onClick={this._confirmAndToggle}>
                            Confirm
                        </Button>
                        <Button onClick={this._toggle}>
                            Cancel
                        </Button>
                    </div>
                </Modal>
            );
        } else {
            return <span />;
        }
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [OverlayMixin],

    propTypes: {
        name: PropTypes.oneOf(Object.keys(AppButtons)).isRequired,
        onClick: PropTypes.func.isRequired,

        confirm: PropTypes.string,
        disabled: PropTypes.bool,
        guard: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
        suffix: PropTypes.string,
        tooltip: PropTypes.node,
    },

    getInitialState: function() {
        return {
            isModalOpen: false
        };
    },

    render: function () {
        var text = AppButtons[this.props.name];
        var tooltipPlacement = 'left';
        var className = [];

        this.props.title = undefined;

        let tooltip, tip508;

        if (!this.props.disabled && this.props.tooltip) {
            let _tt = this.props.tooltip;
            ({ tip508, tooltip } = this._createTooltip(_tt));
        } else if (this.props.disabled && this.props.disabledTooltip) {
            let _tt = this.props.disabledTooltip;
            ({ tip508, tooltip } = this._createTooltip(_tt));
        }

        var button;
        if (typeof text === 'object' && text.glyph) {
            tooltipPlacement = 'top';
            button = (
                <a onClick={this.props.disabled ? null : this._onClick}>
                    <h2><Glyphicon glyph={text.glyph} /></h2>
                </a>
            );
        } else {
            var style = this.props.style || { };

            if (this.state.mouseEntered && !style.outline) {
                style.outline = 'none';

                // Note: we are using style rather than a class here.
                // I was unable to get outline:none in a class attached
                // to button to correctly remove the outline on the button.
                // Injecting directly into the style does work however.
            }

            if (this.props.suffix) {
                text += ' ' + this.props.suffix;
            }

            button = (
                <Button className={className.join(' ')} {...this.props}
                    bsSize={this.props.bsSize || 'large'}
                    style={style}
                    id={this.props.name}
                    ref='button'
                    disabled={this.props.disabled}
                    onClick={this._onClick}
                    onMouseEnter={this._onMouseEnter}
                    onMouseLeave={this._onMouseLeave}
                    onMouseUp={this._onMouseUp}
                >
                    { text }
                    { tip508 }
                </Button>
            );
        }

        if (!_.isUndefined(tooltip)) {
            className.push(util.testClassNames.hasOverlayTrigger);
            button = (
                <OverlayTrigger
                    overlay={tooltip}
                    delay={400}
                    delayHide={100}
                    placement={
                        this.props.tooltipPlacement
                        || tooltipPlacement
                    }
                >
                    { button }
                </OverlayTrigger>
            );
        }

        return button;

    },

});

export default AppButton;
