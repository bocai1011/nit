import _ from 'lodash';
import React from 'react';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import DropdownBox from 'common/components/DropdownBox/DropdownBox';
import Icon from 'common/components/Icon';

/**
 * Find an option item with a given name from a list of option items.
 * An option item may itself be a nested list of option items, in which
 * case we will recursively look through that sublist.
 * @param {string} name - The name of the option item we want to find.
 * @param {list} options - List of option objects to search through.
 * @return {object} The found item, or null if nothing was found.
 */
var findItem = function(name, options) {
    var item = null;

    for (var i = 0; i < options.length; ++i) {
        var option = options[i];

        if (option.name === name) {
            return option;
        } else if (item === null && option.icon === 'skip') {
            item = option;
        } else if (option.options) {
            item = findItem(name, option.options) || item;
        }
    }

    return item;
};

/**
 * Component for rendering a widget that lets the user select
 * a single column name map for a single column name, presumably
 * from a csv file we are importing.
 * @component
 */
const ColumnNameSelector = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _onSelect: function(choice) {
        this.props.column.mapping = choice;
        this.forceUpdate();

        if (this.props.onChange){
            this.props.onChange();
        }
    },

    _onSelectDatetime: function(choice) {
        this.props.column.datetime_mapping = choice;
        this.forceUpdate();

        if (this.props.onChange){
            this.props.onChange();
        }
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        column: React.PropTypes.object,
        global: React.PropTypes.object,
        dropup: React.PropTypes.bool,
        onChange: React.PropTypes.func,
        selectors: React.PropTypes.array,
        valsToShow: React.PropTypes.number,
    },

    getDefaultProps: function() {
        return {
            global : {
                icon : null,
                message : null,
                rowClass : null,
            },
        };
    },

    getInitialState: function() {
        // If a column mapping is already specified,
        // we need to find the option that corresponds to it.
        if (this.props.column.mapping && this.props.column.mapping.name) {
            this.props.column.mapping = findItem(
                this.props.column.mapping.name, this.props.column.options
            );
        }
        else {
            this.props.column.mapping = findItem(
                'skip', this.props.column.options
            );
        }

        return {};
    },

    componentDidMount: function() {
        this.props.selectors.push(this);
    },

    componentWillUnmount: function() {
        _.remove(this.props.selectors, this);
    },

    render: function() {

        let
            dateDelimiter,
            descriptionFunc,
            hasExtra = false,
            dateMap = util.NiceDatetimeMap,
            nameMap = NeatApp.ItemNameMap,
            type = this.props.column.mapping.type;

        if (type) {
            if (type == 'date' || _.isArray(type) && type[0] == 'date') {
                let dateSample = this.props.column.values[0];

                // Get the first matched non-decimal character
                // (the delimiter), or default to '-'.
                dateDelimiter = _.first(dateSample.match(/[^\d]/)) || '-';

                // Bind the inferred date separator to the function that
                // maps date formats to prettified date strings.
                dateMap = _.partial(dateMap, dateDelimiter);
                hasExtra = true;

                descriptionFunc = util.NiceDatetimeDescription;
            }
        }

        var vals = [];
        for (var i = 0; i < this.props.valsToShow; i++) {
            var val = this.props.column.values[i];
            vals.push(<td tabIndex='0' key={i}><div>{val}</div></td>);
        }

        var metaData = this.props.column.mapping;

        // If there is a global message
        // we use the global info as the meta data.
        if (this.props.global.message) {
            metaData = this.props.global;
        }

        return (
            <tr className={metaData.rowClass}>
                <td>
                    {
                        !!this.props.column.mapping
                        && <Icon data={metaData} />
                    }
                </td>
                <td tabIndex='0' className='ellipsis'>
                    { this.props.column.name }
                </td>
                <td>
                    <DropdownBox
                        disabled={this.props.disabled}
                        map={nameMap}
                        options={this.props.column.options}
                        value={this.props.column.mapping}
                        rowName={this.props.column.name}
                        isDropup={this.props.dropup}
                        onSelect={this._onSelect} />

                    {hasExtra ? <br /> : null}
                    {hasExtra ? <DropdownBox disabled={this.props.disabled}
                        map={dateMap}
                        options={this.props.column.datetime_format}
                        descriptionFunc={descriptionFunc}
                        value={this.props.column.datetime_mapping}
                        rowName={this.props.column.name}
                        isDropup={this.props.dropup}
                        onSelect={this._onSelectDatetime} /> : null}
                </td>

                { vals }
            </tr>
        );
    },
});

export default ColumnNameSelector;
