import _ from 'lodash';
import React, { PropTypes } from 'react';
import { DropdownButton } from 'react-bootstrap';
import util from 'common/utils/util';
import Icon from 'common/components/Icon';
import DropdownItem from 'common/components/DropdownBox/DropdownItem';

/**
 * Component for rendering a dropdown box.
 * @component
 * @exports lib\Components\DropdownBox
 */
const DropdownBox = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _onSelect: function(selectedValue, destroyFlyout) {
        destroyFlyout = destroyFlyout || true;

        this.props.value = selectedValue;

        if (destroyFlyout) {
            this.setState(this.getInitialState());
        }
        this.forceUpdate();

        if (this.props.onSelect){
            this.props.onSelect(selectedValue);
        }
    },

    _createDropdown: function() {
        if (this.state.createDropdown) {
            return;
        }

        this.setState({
            createDropdown: true,
        });

        this.forceUpdate();
    },

    _getActiveSubmenu: function() {
        return this.state.menuShowing;
    },

    _setActiveSubmenu: function(element) {
        this.state.menuShowing = element;
    },

    _addDefaultBarListener: function(element) {
        element.onblur = function() {
            setTimeout(function() {
                var activeEl = document.activeElement;
                if (activeEl.tagName === 'BUTTON') {
                    activeEl.getElementsByTagName('SPAN')[0].click();
                }
            }, 300);
        };
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        map: PropTypes.func.isRequired,
        onSelect: PropTypes.func.isRequired,
        options: PropTypes.arrayOf(PropTypes.object).isRequired,
        rowName: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.element,
        ]).isRequired,
        value: PropTypes.object.isRequired,

        disabled: PropTypes.bool,
        isDropup: PropTypes.bool,
        preventNull: PropTypes.bool,
        descriptionFunc: PropTypes.func,
    },

    getDefaultProps: function() {
        return {
            disabled: false,
            isDropup: false,
            preventNull: true,
        };
    },

    getInitialState: function() {
        if (this.props.preventNull && !this.props.value){
            this.props.value = this.props.options[0];
        }

        return {
            createDropdown: false,
            menuShowing: null,
            defaultBar: null
        };
    },

    componentDidMount: function() {
        var self = this;

        if (self.props.disabled) {
            return;
        }
        var dropdown = this.refs.myDropdown;
        var setDropdownState = dropdown.setDropdownState;
        var handleDropdownClick = dropdown.handleDropdownClick;

        dropdown.setDropdownState = function(state) {
            setDropdownState(state);

            if (!state) {
                self.setState(self.getInitialState());
            }
        };

        dropdown.handleDropdownClick = function(e) {
            self._createDropdown();
            handleDropdownClick(e);
        };
    },

    render: function() {

        var self = this;
        var name = util.getName(self.props.map, self.props.value, true);

        if (self.props.disabled) {
            return (
                <DropdownButton
                    disabled={true}
                    title={name}
                    style={{
                        width: 145,
                        textAlign: 'right',
                        verticalAlign: 'middle',
                    }}
                />
            );
        }

        var items;
        if (self.state.createDropdown) {
            var lastIndex = (self.props.options.length -1);
            items = self.props.options.map(function (item, i) {
                return (
                    <DropdownItem
                        info={item}
                        map={self.props.map}
                        descriptionFunc={self.props.descriptionFunc}
                        key={i}
                        onSelect={self._onSelect}
                        value={self.props.value}
                        getActiveSubmenu={self._getActiveSubmenu}
                        setActiveSubmenu={self._setActiveSubmenu}
                        addDefaultBarListener={self._addDefaultBarListener}
                        isSecond={i === 1}
                        isLast={i === lastIndex}
                        isDropup={self.props.isDropup} />
                );
            });
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

        var buttonStyle = {
            width: 145,
            textAlign: 'right',
            verticalAlign: 'middle',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        };

        var title = (
            <span className='ellipsis' style={spanStyle}>
                {name}
            </span>
        );

        var defaultText = 'Skip';
        if ((name !== undefined) &&
            (name !== null) &&
            (name.toString().trim() !== '')) {
            defaultText = name.toString().trim();
        }

        var rowIDText = '';
        if (self.props.rowName !== undefined) {
            rowIDText = (' for ' + self.props.rowName);
        }

        var ariaLabelText = (
            'dropdown menu' + rowIDText +
            ', now set to ' + defaultText + '.');

        self.items = items;
        var dropdownButtonClass = self.props.isDropup ?'popup' : '';
        if (self.props.options.length > 10) {
            dropdownButtonClass += ' long';
        }

        return (
            <DropdownButton ref='myDropdown'
                title={title}
                aria-label={ariaLabelText}
                style={buttonStyle}
                className = {dropdownButtonClass}
                onFocus={self._createDropdown}
                onMouseEnter={self._createDropdown}>
                { items }
            </DropdownButton>
        );
    }
});

export default DropdownBox;
