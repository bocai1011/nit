import React from 'react';
import { Navigation } from 'react-router';
import { ButtonGroup } from 'react-bootstrap';
import util from 'common/utils/util';
import AppButton from 'common/components/AppButton';
import CaseNameInput from 'app/pages/Landing/CaseNameInput';

/**
 * New case creation widget.
 * Creates a text dialog for the user to enter a new case name,
 * and two buttons to either Create the case or to Cancel.
 * @component
 */
const NewCaseWidget = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Create the case using the name currently given
     * in the CaseNameInput component.
     */
    _create: function() {
        var name = this.refs.input.refs.input.getValue();
        var valid = this.refs.input.state.validation === 'success';

        if (!valid) {
            console.log('invalid');
            return;
        }

        var self = this;
        this.setState({
            creating: true,
        });

        util.post('/new_case/' + name, {},
            function (res) {
                self.transitionTo('overview', { name: res.name });
            },
            function () {
                self.setState({
                    creating: false,
                });
            });
    },

    _cancel: function() {
        this.props.onCancel();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [Navigation],

    propTypes: {
        onCancel: React.PropTypes.func,
    },

    getInitialState: function() {
        return { creating: false };
    },

    render: function() {
        var self = this;

        if (this.state.creating) {
            return (<div/>);
        }

        return (
            <div className='flex-center case-name-form'>
                <CaseNameInput
                    style={{marginBottom: '15px'}}
                    ref='input'
                    onEnter={self._create}
                    onCancel={self._cancel}
                />
                <ButtonGroup>
                    <AppButton
                        name='CreateCase'
                        bsStyle='success'
                        onClick={self._create}
                        tooltip='Create a new case with this name.'
                    />
                    <AppButton
                        name='CancelCreate'
                        bsStyle='danger'
                        onClick={self._cancel}
                        tooltip='Cancel and do not create a new case.'
                    />
                </ButtonGroup>
            </div>
        );
    },

});

export default NewCaseWidget;
