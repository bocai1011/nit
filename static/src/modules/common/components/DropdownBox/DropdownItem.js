import _ from 'lodash';
import $ from 'jquery';
import React, { PropTypes } from 'react';
import { MenuItem, Popover, OverlayTrigger } from 'react-bootstrap';
import util from 'common/utils/util';

/**
 * Component for rendering an item in the dropdown box.
 * @component
 */
const DropdownItem = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _onSelect: function(e) {
        this.props.onSelect(this.props.info);
        e.preventDefault();
    },

    _doNothing: function(e) {
        e.preventDefault();
    },

    _onSubitemFocus: function() {
        if (this.hasBeenEntered) {
            return;
        }

        var title = this.getDOMNode().getElementsByTagName('A')[0];
        var submenu = this.getDOMNode().getElementsByTagName('UL')[0];
        var _this = this;

        $(title).addClass('lit');
        var subitems = submenu.getElementsByTagName('LI');

        if (this.props.getActiveSubmenu() !== this) {
            // Close the open menu.
            if (this.props.getActiveSubmenu() !== null) {
                this.props.getActiveSubmenu().state.isExpanded = false;
                var oldSelected = this.props.getActiveSubmenu().getDOMNode();
                oldSelected.getElementsByTagName('UL')[0].style.display = 'none';
                var oldTitle = oldSelected.getElementsByTagName('A')[0];
                $(oldTitle).removeClass('lit');
            }

            // Register as the selectedItem.
            this.props.setActiveSubmenu(this);

            // If not yet done, make the subitems tab-navigable.
            if (!this.state.isExpanded) {
                submenu.style.display = 'block';

                //overwrite ReactBootstrap dynamically applied style
                submenu.style.bottom = 'auto';
                for (var s = 0; s < subitems.length; s++) {
                    var anchorElement = subitems[s].getElementsByTagName('A')[0];
                    anchorElement.tabIndex = '0';
                    var spanElement = anchorElement.getElementsByTagName('SPAN')[0];
                    anchorElement.setAttribute('aria-label', spanElement.innerHTML);
                }

                // Add handlers for tab-navigation loss of focus
                // for the first and last submenuitems.
                if (this.props.isSecond) {
                    title.onblur = function() {
                        setTimeout(function(){
                            if (document.activeElement.parentNode.parentNode.parentNode !== _this.getDOMNode()) {
                                $(title).removeClass('lit');
                                var oldSelected = _this.props.getActiveSubmenu().getDOMNode();
                                oldSelected.getElementsByTagName('UL')[0].style.display = 'none';
                                _this.state.isExpanded = false;
                                _this.props.setActiveSubmenu(null);
                            }
                        }, 200);
                    };
                }
                else if (this.props.isLast) {
                    var lastSubmenuItem = subitems[subitems.length - 1].getElementsByTagName('A')[0];

                    lastSubmenuItem.onblur = function() {
                        lastSubmenuItem.click();
                    };
                }

                // Focus the first item in the popout, by default,
                // if we haven't already moused in.
                if (!this.hasBeenEntered) {
                    subitems[0].getElementsByTagName('A')[0].focus();
                }

                this.state.isExpanded = true;
            }
        }
    },

    _listenForEnter: function(e) {
        var keyEvent = (e.which || e.keyCode);
        if (keyEvent === 13) {
            document.activeElement.click();
        }
    },

    // handleTabOnDefaultBar: function(e) {
    //     var keyEvent = e.which || e.keyCode;
    //     if (keyEvent === 9) {
    //         var DOMElement = this.getDOMNode()
    //             .parentNode.parentNode.getElementsByTagName('BUTTON')[0];
    //         DOMElement.click();
    //     }
    // },

    _onFocus: function(value) {
        this.props.onSelect(value, false);
    },

    _onEnter: function() {
        this.hasBeenEntered = true;
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        info: PropTypes.object.isRequired,
        map: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired,

        addDefaultBarListener: PropTypes.func,
        getActiveSubmenu: PropTypes.func,
        isDropup: PropTypes.bool,
        isLast: PropTypes.bool,
        isSecond: PropTypes.bool,
        onFocus: PropTypes.func,
        setActiveSubmenu: PropTypes.func,
        value: PropTypes.object,
        descriptionFunc: PropTypes.func,
    },

    getInitialState: function() {
        return {
            isExpanded: false,
            defaultBarInitialized: false
        };
    },

    componentDidMount: function() {
        if (this.state.defaultBarInitialized === false) {
            if (!!this.props.addDefaultBarListener) {
                var defaultTabAnchor = this.getDOMNode().parentNode.getElementsByTagName('LI')[0].getElementsByTagName('A')[0];
                this.props.addDefaultBarListener(defaultTabAnchor);
                this.state.defaultBarInitialized = true;
            }
        }
    },

    render: function () {
        var self = this;
        var name;

        if (_.isPlainObject(self.props.info)) {
            if (self.props.info.divider === true) {
                return <MenuItem divider />;

            } else if (self.props.info.options) {
                var items = self.props.info.options.map(function (item, i) {
                    return (
                        <DropdownItem info={item}
                            map={self.props.map}
                            key={i}
                            onFocus={self._onFocus}
                            onSelect={self.props.onSelect} />
                    );
                });

                name = util.getName(self.props.map, self.props.info);
                var submenuClassName = (self.props.isDropup) ?
                                   'dropdown-submenu dropup' :
                                   'dropdown-submenu';

                return (
                    <li className={submenuClassName}
                        onMouseEnter={self._onEnter}
                        onFocus={self._onSubitemFocus}>
                        <a href="#"
                           aria-label={name}
                           onClick={self._doNothing}>{name}</a>
                        <ul className="dropdown-menu">
                            { items }
                        </ul>
                    </li>
                );
            }
        }

        name = util.getName(self.props.map, self.props.info);

        let description = self.props.info.description;
        if (!description && self.props.descriptionFunc) {
            description = self.props.descriptionFunc(self.props.info);
        }

        if (description) {
            var popover =
                <Popover placement="left"
                         positionLeft={200}
                         positionTop={50}
                         title={<strong>{name}</strong>}>
                    { description }
                </Popover>;

            return (
                <OverlayTrigger placement="right"
                    overlay={popover}
                    delay={400}
                    delayHide={0}>
                    <li className={util.testClassNames.hasOverlayTrigger}>
                        <a tabIndex="0"
                            onClick={self._onSelect}
                            onFocus={function() {
                                addEventListener(
                                    'keypress', self._listenForEnter
                                );
                            }}
                            onBlur={function() {
                                removeEventListener(
                                    'keypress', self._listenForEnter
                                );
                            }}>
                            { name }
                            <span className="hide508">
                                { description }
                            </span>
                        </a>
                    </li>
                </OverlayTrigger>
            );
        } else {
            return <li style={{cursor:'pointer'}}>
                <a tabIndex="0"
                    onClick={self._onSelect}>
                    { name }
                    <span className="hide508">
                        { description }
                    </span>
                </a>
            </li>;
        }
    },
});

export default DropdownItem;
