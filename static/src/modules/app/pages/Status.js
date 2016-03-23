import React from 'react';
import $ from 'jquery';
import util from 'common/utils/util';
import LoadingIcon from 'common/components/LoadingIcon';

/**
 * Status item.
 * Renders an item's name and it's text value as a table row.
 *
 * @component
 */
const StatusItem = React.createClass({

    propTypes: {
        item: React.PropTypes.shape({
            text: React.PropTypes.node,
            value: React.PropTypes.node,
        }),
    },

    render: function() {
        return (
            <tr>
                <td className="dashboard-item-1">
                    { this.props.item.text }&nbsp;&nbsp;&nbsp;
                </td>
                <td className="dashboard-item-2">
                    { this.props.item.value }
                </td>
            </tr>
        );
    },

});

/**
 * Route handler for rendering page status.
 * @exports Pages\Dashboard\Status
 */
const PageStatus = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Get the status info from the server.
     */
    _requestStatus: function () {
        var self = this;

        util.get('/get_status',
            function (data) {
                self.setState({loading: false, status: data});
            },
            function () {
                // We didn't receive an answer from the server, so assume
                // that the server is dead and display an error message
                // to the user.
                var noConnection = [{
                    text:'Flask instance',
                    value:'Not connected! Recommended to restart NEAT.'
                }];

                self.setState({loading: false, status: noConnection});
            }
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    getInitialState: function() {
        return {
            loading: true,
            status: null,
        };
    },

    componentWillMount: function () {
        this._requestStatus();
    },

    render: function() {
        var body = null;

        if (this.state.loading){
            body = (
                <div className="container">
                    <h2><LoadingIcon white/></h2>
                </div>
            );
        }
        else{
            var items = this.state.status.map(function (item, i){
                return (
                    <StatusItem item={item} key={i}/>
                );
            });

            var statusTable = (
                <table className='statusTable'>
                    {items}
                </table>
            );

            body = statusTable;
        }

        return (
            <div className="splash-container-absolute">
                <div className="splash-top">
                    <h1 className="splash-head">Status</h1>
                    {body}
                </div>
            </div>
        );
    }
});

export default PageStatus;
