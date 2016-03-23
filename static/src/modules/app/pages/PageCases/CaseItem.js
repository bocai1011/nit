import React, { PropTypes } from 'react';
import { Navigation } from 'react-router';
import { Portal } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import _ from 'lodash';
import util from 'common/utils/util';
import ConfirmOrCancel from 'common/components/ConfirmOrCancel';

/**
 * Component that renders a case item as a row in a table.
 * The component allows for opening of the case,
 * deletion of the case, and provides information about the case,
 * such as short name, creation date, and last modified date.
 * @component
 */
const CaseItem = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

     /**
      * Attempts to load the selected Case in NEAT. Checks for the Case's
      * compatibility with current version of NEAT and acts accordingly.
      * Also, if the case is locked, the user will be transitioned to the
      * Reports start page. Otherwise, they will be transitioned to the
      * Staging Overview Page.
      */
    _loadCase: function() {
        let { name, compat, status } = this.props.myCase;
        if (compat == 'ok') {

            if (status == 'locked') {
                this.transitionTo('reports-start', { name });
            } else {
                this.transitionTo('overview', { name });
            }

        } else {
            this.setState({
                showCompatModal: true,
            });
        }
    },

    _deleteCase: function(callback) {

        if (!this.state.showDeleteModal) {
            this.setState({
                showDeleteModal: true,
            });
            return;
        }

        var self = this;
        util.post('/delete_case/' + this.props.myCase.name,
            null,
            function () {
                self.props.onModify();

                if (callback) {
                    callback();
                }

                self.setState({
                    showDeleteModal: false,
                });
            }
        );
    },

    _upgradeCase: function () {
        let { name, compat } = this.props.myCase;
        let self = this;

        util.post(`/upgrade_case/${name}`)
            .then(function (data) {
                let newName = data.name;
                if (compat === 'restage') {
                    self.transitionTo('files', { name: newName });
                } else {
                    // This branch should be reached when the case can be
                    // automatically upgraded. The logic in here will
                    // transition the app to the proper page, which will be
                    // determined when autoupgrade is implemented.
                }
            })
            .fail(function () {
                self.transitionTo('case_not_found', { name });
            });
    },

    _hideCompatModal: function () {
        this.setState({
            showCompatModal: false,
        });
    },

    _hideDeleteModal: function () {
        this.setState({
            showDeleteModal: false,
        });
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [Navigation],

    propTypes: {
        myCase: PropTypes.shape({
            base: PropTypes.string,
            compat: PropTypes.string,
            create: PropTypes.string,
            name: PropTypes.string,
            status: PropTypes.string,
            update: PropTypes.string,
            version: PropTypes.string,
        }),
        onModify: PropTypes.func.isRequired,
    },

    getInitialState: function () {
        return {
            showCompatModal: false,
            showDeleteModal: false,
        };
    },

    render: function() {

        let myCase = this.props.myCase;

        // Convert string representations of created and modified times in
        // case object to actual Date objects.
        myCase = _.mapValues(myCase, function (v, k) {
            if (k === 'create' || k === 'update') {
                return util.ParseDate(v);
            }
            return v;
        });

        let deleteModal;
        if (this.state.showDeleteModal) {
            deleteModal = (
                <Portal container={document.body}>
                    <ConfirmOrCancel
                        confirm={this._deleteCase}
                        onRequestHide={this._hideDeleteModal}
                    >
                        <div >
                            <h2>Delete</h2>
                            <p>
                                Are you sure you wish
                                to delete case {myCase.base}?
                            </p>
                        </div>
                    </ConfirmOrCancel>
                </Portal>
            );
        }

        let compatModal;
        if (this.state.showCompatModal) {
            compatModal = (
                <Portal container={document.body}>
                    <ConfirmOrCancel
                        confirm={this._upgradeCase}
                        onRequestHide={this._hideCompatModal}
                    >
                        <div className='incompatibility-modal'>
                            <h3>
                                This case is incompatible with
                                the currently installed version of NEAT.
                            </h3>
                            <p>
                                To continue, you'll have to re-stage this case.
                                Would you like to continue?
                            </p>
                        </div>
                    </ConfirmOrCancel>
                </Portal>
            )
        }

        let isNewCase = myCase.update.getTime() === myCase.create.getTime();
        let isLocked = myCase.status === 'locked';
        let iconLockedClass = isLocked ? 'fa fa-lock' : 'fa fa-unlock';

        return (
            <tr className={this.props.myCase.compat}>

                { deleteModal }
                { compatModal }

                <td tabIndex='0'
                    className='ellipse'
                    onClick={this._loadCase}
                    title={myCase.base}>
                    {myCase.base}
                </td>

                <td tabIndex='0' onClick={this._loadCase}>
                    { myCase.create.toDateString() }
                </td>

                <td tabIndex='0' onClick={this._loadCase}>
                    { isNewCase ? '\u2014' : myCase.update.toDateString() }
                </td>

                <td
                    tabIndex='0'
                    className={`case-status ${myCase.status}`}
                    onClick={this._loadCase}
                >
                    <div>
                        <i className={iconLockedClass} />
                        { _.capitalize(myCase.status) || 'Unlocked' }
                    </div>
                </td>

                <td
                    tabIndex='0'
                    className='deleteTab'
                    onClick={this._deleteCase}
                >
                    <i className='fa fa-trash'></i>
                    Delete
                </td>

            </tr>
        );
    }
});

export default CaseItem;
