import React from 'react';
import { Modal, Button, ButtonGroup } from 'react-bootstrap';

/**
 * Component for rendering a notification popup modal.
 * @component
 * @exports lib\Components\Notification
 */
const Notification = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _ok: function(){
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
        onRequestHide: React.PropTypes.func,
        title: React.PropTypes.node,
    },

    getInitialState: function(){
        return {disabled:false};
    },

    render: function () {
        return (
            <Modal {...this.props} title={this.props.title}>
                <div className="modal-body">
                    { this.props.children }
                </div>
                <div className="modal-footer">
                    <ButtonGroup>
                        <Button
                            disabled={this.state.disabled}
                            bsSize="large"
                            onClick={this._ok}
                        >
                            OK
                        </Button>
                    </ButtonGroup>
                </div>
            </Modal>
        );
    }
});

export default Notification;
