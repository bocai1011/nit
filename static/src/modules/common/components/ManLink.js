import React from 'react';
import { Link } from 'react-router';

/**
 * Component for rendering a manual link.
 * @component
 * @exports lib\Components\ManLink
 */
const ManLink = React.createClass({

    propTypes: {
        to: React.PropTypes.string,
    },

    render: function () {
        return (
            <Link to="manual-section" params={{section:this.props.to}}>
                { this.props.children }
            </Link>
        );
    }
});

export default ManLink;
