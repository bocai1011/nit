import React from 'react';
import { Input } from 'react-bootstrap';

const ExportsTableItem = React.createClass({

    getInitialState: function() {
        return {include: true, codeOnly: false};
    },

    propTypes: {
        foreignTable: React.PropTypes.string.isRequired,
        index: React.PropTypes.number.isRequired,
        resetGenerateButtons: React.PropTypes.func.isRequired
    },

    _toggle: function() {
        this.props.resetGenerateButtons();
        this.setState({include: !this.state.include});
    },

    _clickCode: function() {
        this.props.resetGenerateButtons();
        this.setState({codeOnly: !this.state.codeOnly});
    },

    render: function() {
        var disabled = (this.props.index===0);
        var customizationOptions = null;

        if ( !disabled ) {
            var label;

            if (this.props.foreignTable === 'Securities') {
                label = 'Symbols Only (if all you want from Securities is symbols)';
            } else {
                label = 'Codes Only (if all you want from '+this.props.foreignTable+' is ID numbers)';
            }

            customizationOptions = (
                <Input
                    onClick={this._clickCode}
                    type='checkbox'
                    label={label}
                    disabled={disabled || !this.state.include}
                />
            );
        }

        var checkbox = (
            <input type='checkbox' onClick={this._toggle} disabled={disabled} defaultChecked/>
        );

        var mergeSource = (
            <span>
                {checkbox} {this.props.foreignTable}
            </span>
        );

        return (
            <tr>
                <td>{mergeSource}</td>
                <td>{customizationOptions}</td>
            </tr>
        );
    }
});

export default ExportsTableItem;
