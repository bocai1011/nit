import React from 'react';
import { Glyphicon } from 'react-bootstrap';

/**
 * Component for rendering the a staging status label.
 * @component
 * @exports lib\Components\Staging\StatusLabel
 */
const StatusLabel = React.createClass({

    propTypes: {
        status: React.PropTypes.oneOf([
            'success',
            'warning',
            'info',
        ]),
    },

    getDefaultProps: function () {
        return {
            status: 'info',
        };
    },

    render: function() {
        var classNames = ['announce'],
            prefix;

        if (this.props.status === 'success') {
            prefix = (
                <span className='success'>
                    <Glyphicon glyph='ok' />&nbsp;
                </span>
            );
        } else if (this.props.status === 'warning') {
            classNames.push('warning');
        } else if (this.props.status === 'info') {
        }

        return (
            <div>
                <h4 aria-label="status" className={classNames.join(' ')}>
                    { prefix }&nbsp;&nbsp;{ this.props.children }
                </h4>
            </div>
        );
    }
});

export default StatusLabel;
