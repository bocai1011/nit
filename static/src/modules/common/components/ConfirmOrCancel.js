import React from 'react';
import { Modal, Button, ButtonGroup } from 'react-bootstrap';

/**
 * Component for rendering a Confirm or Cancel modal dialog.
 * @component
 * @exports lib\Components\ConfirmOrCancel
 */
const ConfirmOrCancel  = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _confirm: function() {
        if (this.state.disabled){
            return false;
        }

        this.setState({disabled:true});

        var self = this;
        this.props.confirm(function(){
            self.props.onRequestHide();
        });
    },

    _cancel: function() {
        if (this.state.disabled){
            return false;
        }

        this.setState({
            disabled: true,
        });

        this.props.onRequestHide();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        confirm: React.PropTypes.func,
        onRequestHide: React.PropTypes.func,
        title: React.PropTypes.node,
    },

    getInitialState: function() {
        return {
            disabled: false,
        };
    },

    componentDidMount: function() {
        document.getElementById('modalBody').focus();
    },

    render: function() {
        return (
            <Modal {...this.props}
                title={this.props.title}
                aria-role="alertdialog"
            >
                <div id="modalBody" className="modal-body" tabIndex="0">
                    {this.props.children}
                </div>
                <div className="modal-footer">
                    <ButtonGroup>
                        <Button
                            id="confirmButton"
                            disabled={this.state.disabled}
                            bsStyle="danger"
                            bsSize="large"
                            onClick={this._confirm}
                        >
                            Continue
                        </Button>
                        <Button
                            disabled={this.state.disabled}
                            bsSize="large"
                            onClick={this._cancel}
                        >
                            Cancel
                        </Button>
                    </ButtonGroup>
                </div>
            </Modal>
        );
    },

});

export default ConfirmOrCancel;
