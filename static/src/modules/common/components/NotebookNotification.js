import React from 'react';
import { Modal, Button, ButtonGroup } from 'react-bootstrap';
import util from 'common/utils/util';

/**
 * Component for rendering a popup modal informing the user
 * that an ipython power tool is being launched.
 * @component
 * @exports lib\Components\NotebookNotification
 */
const NotebookNotification = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _launchPowerTool: function () {
        util.post('/start_notebook/', {},
            function (res) {
                console.log('start response');
                console.log(res);
            });
    },

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
        title: React.PropTypes.node,
        onRequestHide: React.PropTypes.func,
    },

    getInitialState: function(){
        return {
            disabled: false,
            launching: true,
            error: null
        };
    },

    componentDidMount: function () {
        this._launchPowerTool();
    },

    render: function () {
        var body = null;
        if (this.state.error) {
            body =
                <div className='modal-body'>
                    <h2>The jupyter Power Tool encountered an error.</h2>
                    <p>
                        Please try closing NEAT and trying again.
                        If that does not work,
                        rebooting your computer may help.
                    </p>
                </div>;
        } else {
            body =
                <div className='modal-body'>
                    <h2>The jupyter Power Tool is launching.</h2>
                    <p>This may take a moment.</p>
                </div>;
        }

        return (
            <Modal {...this.props} title={this.props.title}>
                {body}
                <div className='modal-footer'>
                    <ButtonGroup>
                        <Button
                            disabled={this.state.disabled}
                            bsSize='large'
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

export default NotebookNotification;
