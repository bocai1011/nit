import _ from 'lodash';
import React from 'react';
import { Table } from 'react-bootstrap';
import ColumnNameSelector from 'staging/components/ColumnNameWidget/ColumnNameSelector';

/**
 * Component for rendering a widget that lets the user select
 * column name maps for a collection of column names, presumably
 * from a csv file we are importing.
 * @component
 * @exports lib\Components\ColumnNameWidget
 */
const ColumnNameWidget = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _calculateRepeats: function() {
        var choices = [], repeats = [];

        _.forEach(this.props.layout, function(column) {
            var name = column.mapping.name;

            if (_.indexOf(choices, name) >= 0) {
                repeats.push(name);
            } else {
                choices.push(name);
            }
        });

        return repeats;
    },

    _updateGlobalInfo: function(repeats) {
        var self = this;

        repeats = self._calculateRepeats();
        self.hasRepeats = false;

        var error = null;

        // Mark column which have repeats.
        _.forEach(self.selectors, function(selector) {

            var currentGlobal = selector.props.global.message;
            var data = selector.props.column.mapping;

            if (data.name !== 'skip' && _.indexOf(repeats, data.name) >= 0) {
                self.hasRepeats = true;

                selector.props.global = {
                    icon : 'error',
                    message : 'Another column already has the same mapping.',
                    rowClass : 'rowError',
                };
            } else {
                selector.props.global = {
                    icon : null,
                    message : null,
                    rowClass : null,
                };
            }

            if (currentGlobal !== selector.props.global.message) {
                selector.forceUpdate();
            }
        });

        if (self.hasRepeats) {
            error = ('Two or more columns currently have the same mapping.' +
                     ' Please review the choices highlighted in red below ' +
                     ' and make sure there are no conflicts.');

        } else {
            // Check for required columns.
            var type = self.props.item.type;
            error = self._checkConditionsForFile(type);
        }

        return error;
    },

    _fileConditionsMap: {
        'trade_blotter': [
            'date',
            'account',
            'quantity',
            'price',
            'side',
            'symbol'
        ],
        'initial_position': [
            'account',
            'quantity',
            'symbol'
        ],
        'employee_trade_blotter': [
            'date',
            'account',
            'quantity',
            'side',
            'symbol',
            'name',
        ],
        'restricted_list': ['symbol']
    },

    _conditionsMap: {
        account: {
            fields: ['account', 'account_descr'],
            msg: 'At least one column must be marked as Account.'
        },
        date: {
            fields: ['date'],
            msg: 'At least one column must be marked as Trade Date.'
        },
        notionalOrMult: {
            fields: ['notional', 'multiplier'],
            msg: 'At least one column must be marked as '
                 + ' either Notional or Multiplier.'
        },
        price: {
            fields: ['price'],
            msg: 'At least one column must be marked as Price.'
        },
        quantity: {
            fields: ['qty'],
            msg: 'At least one column must be marked as Quantity.'
        },
        side: {
            fields: ['side'],
            msg: 'At least one column must be marked as Trade Side.'
        },
        symbol: {
            fields: [
                'sec_id',
                'symbol',
                'cusip',
                'sedol',
                'isin',
                'ticker',
                'ric',
                'bbg_ticker'
            ],
            msg: 'At least one column must be marked as some type of '
                 + 'Symbol: Security ID, Symbol, CUSIP, SEDOL, ISIN, '
                 + 'Ticker, RIC, or Bloomberg Ticker.'
        },
        name: {
            fields: ['first_name', 'last_name'],
            msg: 'At least one column must be marked as '
                 + 'First Name or Last Name.'
        }
    },

    _has: function(name) {
        return _.some(this.selectors, function(selector) {
            return selector.props.column.mapping.name === name;
        });
    },

    _checkConditions: function(name) {
        var fields = this._conditionsMap[name].fields;
        var hasOne = _.some(fields, this._has);
        if (!hasOne) {
            return this._conditionsMap[name].msg;
        }
    },

    _checkConditionsForFile: function(file) {
        var conditions = this._fileConditionsMap[file];
        var errMsgs = _.filter(_.map(conditions, this._checkConditions));
        if (errMsgs.length > 0) {
            return errMsgs[0];
        }
    },

    _onChange: function() {
        var error = this._updateGlobalInfo();
        console.log('error: ' + error);
        this.props.onChange(error);
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        disabled: React.PropTypes.bool,
        column: React.PropTypes.object,
        global: React.PropTypes.object,
        item: React.PropTypes.object,
        layout: React.PropTypes.object,
        onChange: React.PropTypes.func,
    },

    componentDidMount: function() {
        this._onChange();
    },

    shouldComponentUpdate: function(nextProps) {
        if (this.props.disabled || nextProps.disabled) {
            return false;
        } else {
            return true;
        }
    },

    render: function() {
        this.selectors = [];
        var valsToShow = 2;

        var self = this;
        var lastFiveIndices = this.props.layout.length - 6;

        var selectors = this.props.layout.map(function (column, i) {
            return (
                <ColumnNameSelector disabled={self.props.disabled}
                    selectors={self.selectors}
                    column={column}
                    valsToShow={valsToShow}
                    onChange={self._onChange}
                    dropup={i > lastFiveIndices}
                    key={i} />
            );
        });

        var rowHeaders = _.range(valsToShow).map(function (item) {
            return (
                <th key={item}>{ 'Row ' + (item + 1).toString() }</th>
            );
        });

        return (
            <Table className='columnMappingTable'>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Column</th>
                        <th>Import As</th>
                        { rowHeaders }
                    </tr>
                </thead>
                <tbody>
                    { selectors }
                </tbody>
            </Table>
        );
    }
});

export default ColumnNameWidget;
