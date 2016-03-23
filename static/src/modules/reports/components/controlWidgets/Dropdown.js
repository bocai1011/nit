import React from 'react';
import {
    Panel,
    DropdownButton,
    MenuItem,
    Popover,
    OverlayTrigger,
    Input,
} from 'react-bootstrap';
import _ from 'lodash';
import LoadingIcon from 'common/components/LoadingIcon';
import MailtoError from 'common/components/MailtoError';
import Transform from 'reports/utils/transform';
import q from 'common/utils/queryFactory';
import util from 'common/utils/util';

// Map a name if possible.
// If map is undefined, use the item itself as the name.
// If map is a function, pass the name into the function.
// If map is an object, lookup the name in the object.
var GetName = function(map, item, selected) {
    if (_.isPlainObject(map)) {
        if (item in map) {
            return map[item];
        }
        else {
            return item;
        }
    }
    else if (_.isFunction(map)) {
        return map(item, selected);
    }
    else {
        return item;
    }
};

const DropdownItem = React.createClass({

    getInitialState: function() {
        return {
            isExpanded: false,
            defaultBarInitialized: false
        }
    },

    componentDidMount: function() {
        if (this.state.defaultBarInitialized == false) {
            if (!!this.props.addDefaultBarListener) {
            var defaultTabAnchor = this.getDOMNode().parentNode.getElementsByTagName('LI')[0].getElementsByTagName('A')[0];
            this.props.addDefaultBarListener(defaultTabAnchor);
            this.state.defaultBarInitialized = true;
            }
        }
    },

    onSelect: function(e) {
        this.props.onSelect(this.props.info);
        e.preventDefault();
    },

    doNothing: function(e) {
        e.preventDefault();
    },

    onSubitemFocus: function() {
        if (this.hasBeenEntered) {
            return;
        }

        var title = this.getDOMNode().getElementsByTagName('A')[0];
        var submenu = this.getDOMNode().getElementsByTagName('UL')[0];
        var _this = this;

        $(title).addClass('lit');
        var subitems = submenu.getElementsByTagName('LI');

        if (this.props.getActiveSubmenu() !== this) {
            //close the open menu
            if (this.props.getActiveSubmenu() !== null) {
                this.props.getActiveSubmenu().state.isExpanded = false;
                var oldSelected = this.props.getActiveSubmenu().getDOMNode();
                oldSelected.getElementsByTagName('UL')[0].style.display = 'none';
                var oldTitle = oldSelected.getElementsByTagName('A')[0];
                $(oldTitle).removeClass('lit');
            }
            else {
            }

            //register as the selectedItem
            this.props.setActiveSubmenu(this);

            //if not yet done, make the subitems tab-navigable
            if (!this.state.isExpanded) {
                var name = GetName(this.props.map, this.props.info);
                submenu.style.display = 'block';
                submenu.style.bottom = 'auto'; //overwrite ReactBootstrap dynamically applied style
                for (var s = 0; s < subitems.length; s++) {
                    var anchorElement = subitems[s].getElementsByTagName('A')[0];
                    anchorElement.tabIndex = "0";
                    var spanElement = anchorElement.getElementsByTagName('SPAN')[0];
                    anchorElement.setAttribute("aria-label", spanElement.innerHTML);
                }

                // add handlers for tab-navigation loss of focus for the first and last submenuitems
                if (this.props.isSecond) {
                    var _this = this;
                    title.onblur = function() {
                        var blurTitle = setTimeout(function(){
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
                else if (this.props.isLast){
                    var _this = this;
                    var lastSubmenuItem = subitems[subitems.length - 1].getElementsByTagName('A')[0];

                     lastSubmenuItem.onblur = function() {
                        lastSubmenuItem.click();
                    };
                }
                else {}

                // focus the first item in the popout, by default, if we haven't already moused in
                if (!this.hasBeenEntered) {
                    subitems[0].getElementsByTagName('A')[0].focus();
                }
                this.state.isExpanded = true;
            }
            else {

            }
        }
        else {
        }
    },

    listenForEnter: function(e) {
        var keyEvent = e.which || e.keyCode;
        if (keyEvent == 13) {
            document.activeElement.click();
        }
        else {
            return;
        }
    },

    handleTabOnDefaultBar: function(e) {
        var keyEvent = e.which || e.keyCode;
        if (keyEvent == 9) {
            var DOMElement = _this.getDOMNode().parentNode.parentNode.getElementsByTagName('BUTTON')[0];
            DOMElement.click();
        }
        else {
            return;
        }
    },

    onFocus: function(value) {
        this.props.onSelect(value, false);
    },

    onEnter: function(e) {
        this.hasBeenEntered = true;
    },

    render: function () {
        var _this = this;
        var name;
        var isFirst = this.props.isFirst;
        var isLast = this.props.isLast;

        if (_.isPlainObject(this.props.info)) {
            if (this.props.info.divider === true) {
                return <MenuItem divider />;
            }
            else if (this.props.info.options) {
                var items = this.props.info.options.map(function (item, i) {
                    return <DropdownItem info={item}
                                         map={this.props.map}
                                         key={i}
                                         onFocus={this.onFocus}
                                         onSelect={this.props.onSelect} />;
                }.bind(this));

                name = GetName(this.props.map, this.props.info);
                var submenuClassName = (this.props.isDropup) ? "dropdown-submenu dropup" : "dropdown-submenu";

                return (
                    <li className={submenuClassName}
                        onMouseEnter={this.onEnter}
                        onFocus={this.onSubitemFocus}>
                        <a href="#" aria-label={name} onClick={this.doNothing}>{name}</a>
                        <ul className="dropdown-menu">
                            {items}
                        </ul>
                    </li>
                );
            }
        }

        name = GetName(this.props.map, this.props.info);

        if (this.props.info.description) {
            var popover =
                <Popover placement="left"
                         positionLeft={200}
                         positionTop={50}
                         title={<strong>{name}</strong>}>
                    {this.props.info.description}
                </Popover>;

            return (
                <OverlayTrigger placement="right"
                                overlay={popover}
                                delay={400}
                                delayHide={0}>
                    <li>
                        <a tabIndex="0"
                            onClick={this.onSelect}
                            onFocus={function() {
                                addEventListener("keypress", _this.listenForEnter);
                            }}
                            onBlur={function() {
                                removeEventListener("keypress", _this.listenForEnter);
                        }} >
                        {name}<span className="hide508">{this.props.info.description}</span>
                        </a>
                    </li>
                </OverlayTrigger>
            );
        } else {
            return <li>
                <a tabIndex="0"
                    onClick={this.onSelect}>
                    {name}<span className="hide508">{this.props.info.description}</span>
                </a>
            </li>;
        }

    },
});

const DropdownBox = React.createClass({
    displayName: "Dropdown",
    evaluated: false,
    drawn: false,

    update: function () {
        this.evaluated = false;
        return true;
    },

    refresh: function () {
        this.setState(this.getInitialState());
    },

    getDefaultProps: function() {
        return {
            preventNull: true,
            map: {}
        }
    },

    getPropsFromDropdownObject: function() {
        var queries = this.props.queries;

        if (!this.props.options) {
            this.props.options = queries._getOptions(this.props.index);
        }

        if (!this.props.defaultValue) {
            this.props.defaultValue = queries._getDefaultValue(this.props.index);
        }

        if (!this.props.update) {
            this.props.update = queries._getUpdate(this.props.index);
        }

        if (queries.format && !this.props.format) {
            this.props.format = queries.format;
        }
    },

    getInitialState: function() {
        if (!this.evaluated) {
            return {
                loading: true,
                createDropdown: false,
                menuShowing: null,
                //defaultBar: null,
                selectedValue: null,
                options: null,
                searchQuery: '',
            };
        } else {
            return {};
        }
    },

    onSelect: function(selectedValue, destroyFlyout) {
        var self = this;
        var destroyFlyout = destroyFlyout || true;

        this.props.update.setArgument('value', selectedValue);
    },

    componentDidMount: function() {
        var self = this;

        if (!this.evaluated) {
            self.evaluated = true;

            // If we have a dropdown queries object as a prop,
            // we grab the relevant props needed from that object.
            if (this.props.queries) {
                this.getPropsFromDropdownObject();
            }

            if (_.isUndefined(self.props.customMapping)) {
                if (self.props.mapping) {
                    self.props.customMapping = true;
                } else if (self.props.format) {
                    self.props.customMapping = true;
                    self.props.mapping = util.getFormatFunc(self.props.format);
                } else {
                    self.props.customMapping = false;
                    self.props.mapping = self.props.page ? self.props.page.mappings : q.jsutil.mappings({});
                }
            }

            if (self.transform == null) {
                self.transform = new Transform(self.props);
                self.transform.subscribe(self);
            }

            self.transform.useData().then((results) => {
                var data = results.data;
                var errs = results.errs;

                if ((errs.options && !data.options) || (errs.defaultValue && !data.defaultValue)) {
                    self.setState({error: true, errs: errs, data:data, loading: false});
                } else {
                    self.setState({
                        error: false,
                        loading: false,
                        options: data.options,
                        selectedValue: data.defaultValue,
                        args: data,
                        errs: errs
                    });
                }
            });
        }
        var self = this;
        var dropdown = self.refs.myDropdown;
        var setDropdownState = dropdown.setDropdownState;
        var handleDropdownClick = dropdown.handleDropdownClick;

        dropdown.setDropdownState = function(state) {
            setDropdownState(state);

            if (!state) {
                self.setState(self.getInitialState());
            }
        };

        dropdown.handleDropdownClick = function(e) {
            self.createDropdown();
            handleDropdownClick(e);
        };
    },

    componentDidUpdate: function () {
        this.componentDidMount();
    },

    createDropdown: function() {
        if (this.state.createDropdown) return;

        this.setState({
            createDropdown: true,
        });

        // this.forceUpdate();
    },

    getActiveSubmenu: function() {
        return this.state.menuShowing
    },

    setActiveSubmenu: function(element) {
        this.state.menuShowing = element;
    },

    addDefaultBarListener: function(element) {
        var _this = this;
        element.onblur = function(){
            setTimeout(function(){
                if (document.activeElement.tagName === "BUTTON") {
                    document.activeElement.getElementsByTagName('SPAN')[0].click();
                }
            }, 300);
        }
    },

    buttonStyle: {
        width: 165,
        textAlign: "right",
        verticalAlign: "middle",
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    },

    /**
     * Callback to fire when User enters text into the search box above the
     * list of items.
     * @param {object} e - The event object fired by the change event fired
     *   by the search box Input.
     */
    _search: function (e) {
        this.setState({
            searchQuery: e.target.value,
        });
    },

    _createControl: function (dom, data) {
        var self = this;

        var
            mappings = self.state.args.mapping,
            mapping = {};

        if (self.props.customMapping) {
            mapping = self.props.mapping;
        } else {
            if (self.state.options.pandas) {
                var index_name = self.state.options.pandas.axes.columns.values[0];

                if (_.has(mappings, index_name)) {
                    var mapping = mappings[index_name];
                }
            }
        }

        var name = GetName(mapping, this.state.selectedValue, true);

        var numElements = 0;
        if (this.state.options) {
            if (this.state.options.pandas) {
                numElements = this.state.options.pandas.values.length;
            } else if (this.state.options) {
                numElements = this.state.options.length;
            }
        }

        if (this.props.disabled) {
            return (
                <DropdownButton
                    disabled={true}
                    title={name}
                    style={{width: 145, textAlign: "right", verticalAlign: "middle"}}/>
            );
        }

        var items;
        if (this.state.createDropdown) {
            var lastIndex = numElements - 1;

            if (self.state.options.pandas) {
                let values = self.state.options.pandas.values;

                // Filter out items that don't match the search query typed by user.
                const searchQuery = this.state.searchQuery;
                if (searchQuery.length) {
                    let query = searchQuery.toLowerCase();

                    values = values.filter(x => {
                        let name = mapping[_.values(x)[0]].toLowerCase();
                        return _.includes(name, query);
                    });
                }

                // Sort the filtered values.
                values = _.sortBy(values, function(x) { return mapping[_.values(x)[0]]});

                items = _.mapValues(values, function (item, i) {
                    return <DropdownItem info={_.values(item)[0]} map={mapping} key={i}
                        onSelect={this.onSelect}
                        value={this.state.selectedValue}
                        getActiveSubmenu={this.getActiveSubmenu}
                        setActiveSubmenu={this.setActiveSubmenu}
                        addDefaultBarListener={this.addDefaultBarListener}
                        isSecond={i == 1}
                        isLast={i == lastIndex}
                        isDropup={this.props.isDropup} />;
                }.bind(this));
            } else if (self.state.options instanceof Array) {
                items = this.state.options.map(function (item, i) {
                    return <DropdownItem info={item} map={mapping} key={i}
                        onSelect={this.onSelect}
                        value={this.state.selectedValue}
                        getActiveSubmenu={this.getActiveSubmenu}
                        setActiveSubmenu={this.setActiveSubmenu}
                        addDefaultBarListener={this.addDefaultBarListener}
                        isSecond={i == 1}
                        isLast={i == lastIndex}
                        isDropup={this.props.isDropup} />;
                }.bind(this));
            }
        } else {
            items = null;
        }

        var spanStyle = {
            width: 110,
            textAlign: 'left',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        };

        var title = (
            <span className='dropdown-menu-value' style={spanStyle}>
                {name}
            </span>
        );

        var defaultText = ((name == null) || (name.toString().trim() == "")) ? "Skip" : name.toString().trim();
        var rowIDText = (typeof this.props.rowName !== 'undefined') ? " for " + this.props.rowName : "";
        var ariaLabelText = "dropdown menu"  + rowIDText +  ", now set to " + defaultText + ".";

        this.items = items;

        var dropdownButtonClass = "";

        if (this.props.isDropup) {
            dropdownButtonClass += " popup";
        }

        if (numElements > 10) {
            dropdownButtonClass += " long";
        }

        return (
            <span className='dropdown-span search-down'>
                <DropdownButton
                    ref='myDropdown'
                    title={title}
                    aria-label={ariaLabelText}
                    style={this.buttonStyle}
                    className={dropdownButtonClass}
                    onFocus={this.createDropdown}
                >
                    <Input
                        type='text'
                        placeholder='Search'
                        onChange={this._search}
                        standAlone
                    />
                    {items}
                </DropdownButton>
           </span>
        );
    },

    render: function () {
        var self = this;
        var dd;

        if (self.state.loading) {
            dd = (
                <span className='dropdown-span'>
                    <DropdownButton
                        style={this.buttonStyle}
                        title={
                            <span >
                                <LoadingIcon ref='myDropdown'/>
                            </span>
                        }
                    />
                </span>
            );
        } else if (self.state.error) {
            var errorMsg = <pre>{self.state.errs}</pre>;

            return (
                <Panel header={<h3>Report Error</h3>} bsStyle="danger">
                    {errorMsg}
                    <MailtoError error={errorMsg}>
                        Contact support
                    </MailtoError>
                </Panel>
            );
        } else {
            dd = self._createControl()
        }

        if (this.props.children) {
            return (
                <div className='left-block-dropdown'>
                    {dd}

                    <div style={{'display':'flex', 'margin-bottom':'20px'}}>
                        {this.props.children}
                    </div>
                </div>
            )
        } else {
            return dd;
        }

    },
});

export default DropdownBox;
