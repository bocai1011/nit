import React from 'react';
import { Navigation } from 'react-router';
import util from 'common/utils/util';
import AppButton from 'common/components/AppButton';

/**
 * Component for rendering a button link.
 * A button link looks like a button but navigates to a
 * given page when it is clicked on.
 * @component
 * @exports lib\Components\ButtonLink
 */
const ButtonLink = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _onClick: function() {
        this.transitionTo(this.props.to, this.props.params);
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [Navigation],

    propTypes: {
        to: React.PropTypes.string.isRequired,
        params: React.PropTypes.object.isRequired,
    },

    render: function () {
        return (
            <AppButton onClick={this._onClick} {...this.props} />
        );
    },

});

export default ButtonLink;
