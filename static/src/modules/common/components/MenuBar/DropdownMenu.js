import React, { PropTypes } from 'react';
import { State, Navigation } from 'react-router';
import MenuItem from 'common/components/MenuBar/MenuItem';
import keyboardNavItems from 'common/components/MenuBar/KeyboardNavItems';

/**
 * Component for rendering a tooltip on a menu item in the menu bar.
 * @component
 */
const MenuItemTooltip = React.createClass({

    propTypes: {
        quickKey: React.PropTypes.string,
    },

    render: function() {
        // We only render a tooltip if a quick key is assigned.
        if (!!this.props.quickKey) {
            return (
                <span className={this.props.className}>
                    (Alt-{this.props.quickKey})
                </span>
            );
        } else {
            return <span></span>;
        }
    }
});

const SubmenuItemLabel = React.createClass({

    propTypes: {
        quickKey: React.PropTypes.string,
        labelString: React.PropTypes.string,
    },

    render: function() {
        if (!!this.props.quickKey) {
            return (
                <span>
                    {this.props.labelString}
                    <span className='keyboardShortcut'>
                        Alt+{this.props.quickKey}
                    </span>
                </span>
            );
        } else {
            return <span>{this.props.labelString}</span>;
        }
    }
});

/**
 * Component for rendering a dropdown menu in the menu bar.
 * @component
 */
const DropdownMenu = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _toggleCollapse: function() {
        if (this.state.isExpanded) {
            this.setState({ isExpanded:false, showTooltip:false });
        } else {
            /* Close any expanded menus. */
            if (this.props.expandedMenu !== null &&
                this.props.expanded !== this) {
                this.props.expandedMenu.setState({ isExpanded:false });
                this.props.expandedMenu = this;
            }

            this._clearTooltipTimeout();
            this.setState({ isExpanded:true, showTooltip:false });
            this.refs.ddMenu.getDOMNode().getElementsByTagName('A')[0].focus();
        }
    },

    _delayedCollapse: function() {
        var _this = this;

        if (this.state.isExpanded) {
            this.collapseTimeout = window.setTimeout(function() {
                _this.setState({ isExpanded: false });
            }, 450);
        }
    },

    _preventCollapse: function() {
        window.clearTimeout(this.collapseTimeout);
    },

    /**
     * Prevent a delayed tooltip from popping up by clearing
       the last set tooltip timeout callback.
     */
    _clearTooltipTimeout: function() {
        if (this.tooltipTimeout) {
            window.clearTimeout(this.tooltipTimeout);
        }
    },

    _notifyFocus: function(e) {
        this.setState({ isExpanded: true, showTooltip:false });
        this._preventCollapse();

        e.stopPropagation();
        e.preventDefault();
    },

    _notifyBlur: function() {
        this._delayedCollapse();
    },

    /**
     * Show the tooltip after a delay, hiding all other tooltips first.
     */
    _delayedShowTooltip: function() {
        var self = this;
        self.setState({ showTooltip:false });
        if (!!this.props.quickKey) {
            this.tooltipTimeout = setTimeout(function() {
                self.setState({ showTooltip:true });
            }, 350);
        }
    },

    /**
     * Hide the tooltip, as well as all other tooltips.
     */
    _hideTooltip: function() {
        this.setState({ showTooltip:false });
    },

    _clickMenuItem: function(menuLink) {
        if (menuLink.onClick) {
            document.activeElement.blur();
            this.setState({ isExpanded: false });

            setTimeout(menuLink.onClick, 1);
        }
    },

    _onClick: function(link, params) {
        var self = this;
        return function (e) {
            e.preventDefault();
            self.transitionTo(link, params);
        };
    },

    _handleMouseLeave: function() {
        this._clearTooltipTimeout();
        this._hideTooltip();
    },

    _handleMouseLeaveForDropdown: function() {
        this._clearTooltipTimeout();
        this._hideTooltip();
        this._delayedCollapse();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    displayName: 'DropdownMenu',

    mixins: [State, Navigation],

    propTypes: {
        name: React.PropTypes.string.isRequired,
        quickKey: React.PropTypes.string.isRequired,

        expandedMenu: React.PropTypes.element,
        params: React.PropTypes.object,
        subitems: React.PropTypes.array,
        to: React.PropTypes.string,
    },

    getInitialState: function() {
        return {
            isExpanded: false,
            isFocused: false,
            showTooltip: false,
        };
    },

    componentDidMount: function() {

        /* Register a quick key, if any exists for the top-level item. */
        if (!!this.props.quickKey) {
            var unicodeKey = this.props.quickKey.toUpperCase().charCodeAt();
            if (!keyboardNavItems[unicodeKey]) {
                if (this.props.subitems) {
                    keyboardNavItems[unicodeKey] = this._toggleCollapse;
                } else if (this.props.to) {
                    keyboardNavItems[unicodeKey] = this.props.to;
                } else if (this.props.url) {
                    keyboardNavItems[unicodeKey] = this.props.url;
                }
            }
        }
    },

    componentWillUnmount: function() {
        if (this.collapseTimeout) {
            window.clearTimeout(this.collapseTimeout);
        }

        this._clearTooltipTimeout();

        this._hideTooltip = function () {
            return;
        };

        // Unregister quick key
        if (!!this.props.quickKey) {
            var unicodeKey = this.props.quickKey.toUpperCase().charCodeAt();
            delete keyboardNavItems[unicodeKey];
        }
    },

    render: function() {
        var _this = this;
        var menuLinks = null;

        /* Create the Submenu items, if there are any. */
        if (!!this.props.subitems){
            menuLinks = this.props.subitems.map(function (menuLink) {

                if (!menuLink) {
                    return null;
                }

                return (
                    <MenuItem name={menuLink.label}
                        to={menuLink.url}
                        onClick={function(e) {
                            _this._clickMenuItem(menuLink);
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        params={menuLink.params}
                        onMouseEnter={_this._preventCollapse}
                        onMouseLeave={_this._delayedCollapse}
                        quickKey={menuLink.quickKey} >

                        <SubmenuItemLabel labelString={menuLink.label}
                            quickKey={menuLink.quickKey} />
                    </MenuItem>
                );

            });
        }

        /* Create the dropdown menu object. */
        var ulClass = (this.state.isExpanded) ?
                               'dropdownMenu' :
                               'dropdownMenu collapsed';

        var tooltipClass = this.state.showTooltip ?
                                'dropdownTooltip' :
                                'hide508';

        var dropdownMenuStyle = { position: 'relative' };
        var menuItemStyle = { position: 'absolute' };
        if (!!this.props.subitems) {
            return (
                <li style={dropdownMenuStyle}
                    onMouseEnter={this._delayedShowTooltip}
                    onMouseLeave={this._handleMouseLeave}
                    onClick={this._toggleCollapse}
                    className={ulClass}>

                    {/* Lead with a span for the menu title */}
                    <span
                          onMouseEnter={this._preventCollapse}
                          onMouseLeave={this._delayedCollapse}
                          className='dropdownMenuTitle'
                    >
                          {this.props.name}
                    </span>

                    <MenuItemTooltip
                        quickKey={this.props.quickKey}
                        className={tooltipClass}
                    />

                    <ul ref='ddMenu' style={menuItemStyle}
                        onMouseEnter={this._preventCollapse}
                        onMouseLeave={this._handleMouseLeaveForDropdown}
                        onFocus={this._notifyFocus}
                        onBlur={this._notifyBlur} >
                        {menuLinks}
                    </ul>
                </li>
            );
        }
        else {
            return (
                <li className='dropdownMenu collapsed'
                    onMouseEnter={this._delayedShowTooltip}
                    onMouseLeave={this._handleMouseLeave}>

                    {/* Lead with a span for the menu title */}
                    <div tabIndex='0'
                        aria-role='link'
                        onClick={this._onClick(
                            this.props.to, this.props.params
                        )}
                        className='dropdownMenuTopLevel'>
                        {this.props.name}
                    </div>

                    <MenuItemTooltip
                        quickKey={this.props.quickKey}
                        className={tooltipClass}
                    />
                </li>
            );
        }
    }
});

export default DropdownMenu;
