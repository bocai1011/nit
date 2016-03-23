import React from 'react';
import { Navigation } from 'react-router';
import { ButtonGroup } from 'react-bootstrap';
import AppButton from 'common/components/AppButton';
import NewCaseWidget from 'app/pages/Landing/NewCaseWidget';

/**
 * Pair of two buttons, New Case and Open Case.
 * @component
 */
const NewOpen = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _newCase: function() {
        this.setState({ newCase: true });
    },

    _openCase: function() {
        this.transitionTo('cases');
    },

    _cancel: function() {
        this.setState({ newCase: false });
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [Navigation],

    propTypes: {
        startWith: React.PropTypes.bool,
    },

    getInitialState: function() {
        return {
            newCase: this.props.startWith,
        };
    },

    render: function() {
        var self = this;

        var element;
        if (this.state.newCase) {
            element = (<NewCaseWidget onCancel={self._cancel} />);

        } else {
            element = (
                <ButtonGroup>
                    <AppButton dashboard
                        name="NewCase"
                        onClick={this._newCase}
                        tooltip='Create a new case.'
                    />
                    <AppButton dashboard
                        name="OpenCase"
                        onClick={this._openCase}
                        tooltip='Open or delete an existing case.'
                    />
                </ButtonGroup>
            );
        }

        return (
            <div>
                {element}
            </div>
        );
    },

});

export default NewOpen;
