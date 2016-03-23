import React from 'react';
import { Navigation } from 'react-router';
import { NavItem } from 'react-bootstrap';
import keyboardNavItems from 'common/components/MenuBar/KeyboardNavItems';

/**
 * Component for rendering a menu item in a dropdown.
 * @component
 * @exports lib\Components\MenuItem
 */
const MenuItem = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Navigate to a given link/param pair.
     * @param {url} link - Path to navigate to.
     * @param {object} params - Object holding params to feed into the url.
     */
    _onClick: function (link, params) {
        this.props.onClick;
        var self = this;
        return function (e) {
            e.preventDefault();
            self.transitionTo(link, params);
        };
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [Navigation],

    propTypes: {
        onClick: React.PropTypes.func,
        params: React.PropTypes.object,
        quickKey: React.PropTypes.string,
        to: React.PropTypes.string,
    },

    getDefaultProps: function () {
        return {
            to: '',
            params: {}
        };
    },

    componentDidMount: function() {
        // Register quickKey
        if (this.props.to && this.props.quickKey) {
            var unicodeKey = this.props.quickKey.toUpperCase().charCodeAt();
            if (!keyboardNavItems[unicodeKey]) {
                keyboardNavItems[unicodeKey] = this.props.to;
            }
        }
    },

    componentDidUnmount: function() {
        // Unregister quickKey
        if (this.props.to && this.props.quickKey) {
            var unicodeKey = this.props.quickKey.toUpperCase().charCodeAt();
            delete keyboardNavItems[unicodeKey];
        }
    },

    render: function () {
        var func = this.props.onClick;

        if (this.props.to !== '') {
            func = this._onClick(this.props.to, this.props.params);
        }

        return (
            <NavItem {...this.props}
                href="#"
                aria-role="link"
                onClick={func}>
                {this.props.children}
            </NavItem>
        );
    },

});

export default MenuItem;
