import React from 'react';
import { Input } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';

/**
 * Component that presents one checkbox configuration option to the user.
 * @component
 */
const ConfigurationOption = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Event when the option's checkbox is clicked.
     */
    _onChange: function () {
        this.props.option.value = !this.props.option.value;
        NeatApp.saveApp();
        this.forceUpdate();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        option: React.PropTypes.object,
    },

    render: function () {
        var labelText = (
            this.props.option.name + '\u003A ' +
            this.props.option.description);

        return (
            <tr>
                <td className='vertical-center'>
                    <form>
                        <Input type='checkbox'
                            name={this.props.option.name}
                            checked={this.props.option.value}
                            onChange={this._onChange}
                        />
                        <label className='hide508'
                            htmlFor={this.props.option.name}
                        >
                            { labelText }
                        </label>
                    </form>
                </td>
                <td className='dashboard-item-1'>
                    { this.props.option.name }
                </td>
                <td className='dashboard-item-2'>
                    { this.props.option.description }
                </td>
            </tr>
        );
    },

});

export default ConfigurationOption;
