import _ from 'lodash';
import React from 'react';
import { Modal, Button, OverlayMixin } from 'react-bootstrap';
import AppButton from 'common/components/AppButton';
import AppButtons from 'common/components/AppButtons';

/**
 * Component for rendering a modal overlay.
 * @component
 * @exports lib\Components\ModalOverlay
 */
const ModalOverlay = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _handleToggle: function () {
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

        return (
            <Modal
                id={this.props.id}
                title={this.props.title}
                onRequestHide={this._handleToggle}
            >
                <div className="modal-body">
                    {this.props.children}
                </div>
                <div className="modal-footer">
                    <Button onClick={this._handleToggle} {...this.props}>
                        Close
                    </Button>
                </div>
            </Modal>
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [OverlayMixin],

    propTypes: {
        buttonName: React.PropTypes.oneOf(Object.keys(AppButtons)),
        buttonTooltip: React.PropTypes.node,
        id: React.PropTypes.any,
        inline: React.PropTypes.bool,
        renderAs: React.PropTypes.node,
        style: React.PropTypes.object,
        title: React.PropTypes.node,
    },

    getInitialState: function() {
        return {
            isModalOpen: false,
        };
    },

    render: function () {
        var style = this.props.style || {};
        style.cursor = 'pointer';

        if (this.props.inline) {
            style.display = 'inline-block';
        }

        if (this.props.renderAs) {
            return (
                <div onClick={this._handleToggle} style={style}>
                    {this.props.renderAs}
                </div>
            );
        } else {
            return (
                <AppButton
                    name={this.props.buttonName}
                    tooltip={this.props.buttonTooltip}
                    onClick={this._handleToggle}
                    style={style}
                    {...this.props}
                />
            );
        }
    },
});

export default ModalOverlay;
