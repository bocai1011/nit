import _ from 'lodash';
import $ from 'jquery';
import React from 'react';
import { Input } from 'react-bootstrap';
import util from 'common/utils/util';

/**
 * Text field for entering a new case's name.
 * Provides validation feedback on whether the name is valid or not.
 * @component
 */
const CaseNameInput = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Get all cases from the server and
     * pull out only the short names for each.
     */
    _getCases: function() {
        var self = this;
        util.get('/get_cases/', function (cases) {
            self.setState({
                cases: _.map(cases, 'base'),
            });
        });
    },

    // validationState: function() {
    //     var length = this.state.value.length;
    // },

    _handleChange: function (e) {
        var newName = e.target.value;

        var newState = {
            value: newName,
            validation: 'success',
            label: 'Press enter to create',
        };

        if (!newName) {
            newState = {
                value: newName,
                validation: 'error',
                label: 'Enter new case name',
            };
        }

        if (_.includes(this.state.cases, newName)) {
            newState = {
                value: newName,
                validation: 'error',
                label: 'Case name already exists',
            };
        }

        this.setState(newState);
    },

    _handleKeyUp: function (e) {
        if (e.keyCode === 27) {
            this.props.onCancel();
        }
    },

    _submit: function(e) {
        if (this.props.onEnter) {
            this.props.onEnter();
        }

        e.preventDefault();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        onCancel: React.PropTypes.func,
        onEnter: React.PropTypes.func,
        style: React.PropTypes.object,
    },

    getInitialState: function() {
        return {
            cases: [],
            value: '',
            validation: 'error',
            label: 'Enter new case name',
        };
    },

    componentWillMount: function () {
        this._getCases();
    },

    componentDidMount: function() {
        this.getDOMNode().focus();
    },

    render: function() {
        return (
            <form onSubmit={this._submit}>
                <Input
                    style={this.props.style}
                    autoFocus
                    type="text"
                    value={this.state.value}
                    placeholder="Case name"
                    label={this.state.label}
                    bsStyle={this.state.validation}
                    hasFeedback
                    ref="input"
                    groupClassName="group-class"
                    labelClassName="label-class"
                    onChange={this._handleChange}
                    onKeyUp={this._handleKeyUp}
                />
            </form>
        );
    },

});

export default CaseNameInput;
