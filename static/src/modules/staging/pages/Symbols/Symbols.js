import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import NeatApp from 'app/utils/NeatApp';
import ProgressMixin from 'common/utils/ProgressMixin';
import StagingMixin from 'staging/utils/StagingMixin';
import TableWidget from 'common/components/TableWidget';
import StatusLabel from 'staging/components/StatusLabel';
import AppButton from 'common/components/AppButton';
import ButtonReference from 'common/components/ButtonReference';
import ErrorLink from 'common/components/ErrorLink';
import ReferenceData from 'staging/services/ReferenceData';
import DeepDive from 'staging/pages/Symbols/DeepDive';
import RDOs from 'staging/pages/Symbols/RDOs';
import Icon from 'common/components/Icon';

const columnOptions = {
    'code': {
        name: 'Symbol',
        minWidth: 150,
        maxWidth: 150
    },
    'rsec_code': {
        name: 'Mapped to Ref. Sec.',
        minWidth: 150
    },
    'excld': {
        cssClass: 'flex-center',
        name: 'Exclude',
        width: 60,
        resizable: false,
        formatter: checkboxFormatter,
        type: 'foo'  // this turns off the qgrid filtering
    },
    'source': {
        name: 'Source',
        minWidth: 100
    },
    'symbol_desc': {
        name: 'Description',
        minWidth: 220
    },
    'sec_type': {
        name: 'Sec Type',
        minWidth: 100
    },
    'crncy': {
        name: 'Currency',
        minWidth: 100
    },
    'price': {
        name: 'Price',
        width: 60,
        resizable: false,
        formatter: statusFormatter,
        type: 'foo'  // this turns off the qgrid filtering
    },
    'notional': {
        name: 'Notional',
        width: 60,
        resizable: false,
        formatter: statusFormatter,
        type: 'foo'  // this turns off the qgrid filtering
    },
    'refdata': {
        name: 'Ref Data',
        width: 60,
        resizable: false,
        formatter: statusFormatter,
        type: 'foo'  // this turns off the qgrid filtering
    },
    'oid': {
        cssClass: 'hidden',
        headerCssClass: 'hidden',
        name: 'Sec OID',
        minWidth: 0,
        resizable: false,
        width: 0
    }
};

const columnWarnings = {
    notional: [{
        icon: 'okay',
        message: 'Reported notional equals calculated notional'
    }, {
        icon: 'warn',
        message: 'Calculated notional within 5% of reported notional'
    }, {
        icon: 'error',
        message: 'Calculated notional does not match reported notional'
    }, {
        icon: 'skip',
        message: 'No reference data found for security'
    }],
    price: [{
        icon: 'okay',
        message: 'Reported price within historic price high / low range'
    }, {
        icon: 'warn',
        message: 'Reported price within 5% of historic price high / low range'
    }, {
        icon: 'error',
        message: 'Reported price not within historic price high / low range'
    }, {
        icon: 'skip',
        message: 'No reference data found for security'
    }],
    refdata: [{
        icon: 'okay',
        message: 'Reference data found for security'
    }, {
        icon: 'error',
        message: 'Reference data found but ticker / symbol fields do not match'
    }, {
        icon: 'error',
        message: 'Reference data found but one of CUSIP, SEDOL, ISIN do not match'
    }, {
        icon: 'skip',
        message: 'No reference data found for security'
    }]
};

function checkboxFormatter(row, cell, value, columnDef, dataContext) {
    return React.renderToStaticMarkup(
        <input type="checkbox"
            checked={value}
            title="Check to exclude this security from analysis"
            data-neat-security-oid={dataContext.oid} />
    );
}

function statusFormatter(row, cell, value, columnDef) {
    var colwarn = columnWarnings[columnDef.id];
    var data = colwarn[value];

    // Missing data
    if (value === -1) {
        data = {
            'icon': 'skip',
            'message': 'No data was available for validation'
        };
    }

    // Shouldn't see this
    if (data === undefined) {
        data = {
            'icon': 'error',
            'message': 'Unkown data error'
        };
    }

    return React.renderToStaticMarkup(
        <div title={data.message}>
            <Icon data={data}/>
        </div>
    );
}

/**
 * Component for rendering the UI for handling Symbol Rectification stage.
 * @component
 * @exports lib\Components\Staging\Symbols
 */
const Symbols = React.createClass({

    /**
     * Get the slickgrid from the Table component. Seems kind of hacky.
     * Main reason for wrapping this in its own method is for better
     * testability.
     */
    _getUnderlyingGrid: function() {
        return this.refs.tableWidget.refs.table.state.grid.slickGrid;
    },

    /**
     * Return a "guard" object suitable for rendering as the
     * "Confirm Changes" AppButton's guard.
     * @return {object} The guard object, with `body` and `link` properties.
     *                  Returns undefined if no guard is necessary.
     */
    _guard: function () {

        // The first line of defense is to see if the case is locked. Check
        // the StagingMixin's guardLock().
        let guardLocked = this.guardLock();
        if (guardLocked) {
            return guardLocked;
        }

        // Use this to get some deeply nested data without having an error
        // thrown if it doesn't yet exist.
        let values = _.get(this.state.data, 'data.pandas.values', []);

        let atLeast1Included = _.some(values, { excld: false });

        if (!atLeast1Included) {
            let message = 'All symbols have been excluded, but at least ' +
                          'one must be included to continue.';
            return {
                title: 'No symbols to analyze!',
                body: message,
            };
        }

    },

    /**
     * Called when user selects a different cell in the grid
     *  @e (obj): event object
     *  @args (obj): metadata about selected cell, e.g. `cell`, `grid`,
     *    and `row`
     */
    _handleActiveCell: function(e, args) {
        var highlightSection = null;

        // If user selects a validation cell, we capture it for highlighting
        var colName = this.state.data.meta.columns[args.cell];
        var validationCols = Object.keys(columnWarnings);
        if (validationCols.indexOf(colName) !== -1) {
            highlightSection = colName;
        }

        this.setState({
            highlightSection: highlightSection
        });
    },

    _handleSelectedRows: function(e, args) {
        var rows = args.rows;
        var grid = args.grid;

        var oids = [];
        _.forEach(rows, function(rowidx) {
            oids.push(grid.getDataItem(rowidx).oid);
        });

        this.setState({
            selectedOids: oids
        });
    },

    /**
     * Called when exclude-toggle checkbox clicked. Because the DataView
     * can be filtered/sorted we need to iterate through each DataView
     * record to get the underlying security oid.
     */
    _handleExcludeToggle: function(e) {
        var checkedState = e.target.checked;
        var maybeExcludeFn;

        // Copy list of selected oids
        var oids = this.state.selectedOids.slice();

        if (oids.length > 0) {
            maybeExcludeFn = function(datum) {
                var idx = oids.indexOf(datum.oid);
                if (idx !== -1) {
                    datum.excld = checkedState;
                    oids.splice(idx, 1);
                    if (oids.length === 0) {
                        return true;
                    }
                }
            }
        } else {
            maybeExcludeFn = function(datum) {
                datum.excld = checkedState;
            }

        }

        // Update exclude state in this.state.data
        _.some(this.state.data.data.pandas.values, maybeExcludeFn);

        // need this to poke react to re-rendering
        this.forceUpdate();
        NeatApp.rectifyChanged();
        this._getUnderlyingGrid().invalidate();
    },

    /**
     * Called when the select-toggle checkbox clicked.
     */
    _handleSelectToggle: function(e) {
        var grid = this._getUnderlyingGrid();
        var rows = [];
        if (e.target.checked) {
            var dataView = grid.getData();
            rows = _.range(dataView.getLength());
        }
        grid.setSelectedRows(rows);
    },

    /**
     * TODO: this is not React-y
     * Called when security in selected row is updated in the deep dive
     *   @param securityOids {array} securities to update
     *      can be a single int, which will be wrapped in array
     *   @param updateFields {obj} additional field/values to assign
     */
    _handleSecurityUpdate: function(securityOids, updateFields) {
        var self = this;
        var updateFields = updateFields || {};
        if (securityOids.length === undefined) {
            securityOids = [securityOids];
        }

        return ReferenceData.getValidation(securityOids).then(
            function(update) {
                _.forEach(update, function(item) {
                    // update underlying pandas data
                    var datum = _.find(
                        self.state.data.data.pandas.values, {oid:item.oid});
                    if (datum !== undefined) {
                        _.assign(datum, item, updateFields);
                    }
                });

                if (!_.isEmpty(update)) {
                    var grid = self._getUnderlyingGrid();
                    // re-render the grid to show new data updates
                    grid.invalidate();
                }
            }
        );
    },

    /**
     * Confirm the changes the user has made.
     * This will post the changes back to the server to be persisted.
     * @component
     * @exports lib\Components\Staging\Symbols
     */
    _confirmChanges: function() {
        var self = this;

        var all = _.reduce($('[data-neat-security-oid]'), function(result, el) {
            if (el.checked !== el.defaultChecked) {
                var oid = parseInt(el.getAttribute('data-neat-security-oid'));
                result[oid] = el.checked;
            }
            return result;
        }, {});

        var data = $.extend(true, {}, self.state.data);

        _.forEach(data.data.pandas.values, function(datum) {
            if (all[datum.oid] !== undefined) {
                datum.excld = all[datum.oid];
            }
        });

        this.beginProcessing('Rectify', '/set_symbol_table/' + NeatApp.caseName(), data);
    },

    onSuccessfulProcess: function() {
        NeatApp.rectifyChanged();
        NeatApp.markRectifyComplete();
        NeatApp.saveCurrentCase();
    },

    /**
     * Remount the checkboxes in another part of the DOM
     */
    _mountCheckboxes: function(target) {
        $(target).append($('#symbols-select-toggle'));
        $(target).append($('#symbols-exclude-toggle'));
    },

    _onLoad: function(data) {
        this.setState({
            data: data,
            selectedOids: []
        });
        // move checkboxes into slickgrid for styling
        this._mountCheckboxes('.slick-header');
    },

    // TODO fix AppButton to show modal only when errors are present
    _confirmFn: function() {
        var criticalErr = 0;
        var excluded = 0;
        _.forEach(this.state.data.data.pandas.values, function(value) {
            if (value.excld === false &&
                (value.price > 1 ||
                    value.notional > 1 ||
                    value.refdata > 2)) {
                criticalErr += 1;
            } else if (value.excld === true) {
                excluded += 1;
            }
        });

        var msg = '';
        if (criticalErr > 0) {
            msg = criticalErr + ' critical error(s) found';
        }

        if (excluded > 0) {
            if (msg !== '') {
                msg += ' and ';
            }
            msg += excluded + ' securities excluded from analysis';
        }

        msg += '. Are you sure you want to proceed?';
        return msg;
    },

    //
    // StagingMixin methods
    //

    mixinClass: function() {
        return 'left-shift';
    },

    renderStatus: function() {
        if (this.state.error) {
            var error = (
                <ErrorLink
                    text='error'
                    title='Error while confirming changes.'
                    error={this.state.error}
                    recommend='Please try fixing the issue and then confirming the changes again.'
                />
            );

            return (
                <StatusLabel status="warning">
                    There was an {error} while confirming the changes to the symbol table.
                </StatusLabel>
            );
        } else if (NeatApp.rectifyCompleted()) {
            return (
                <StatusLabel status='success'>
                    Symbols have been confirmed.
                    Press <ButtonReference name='Next' /> to continue.
                </StatusLabel>
            );
        } else {
            return (
                <StatusLabel status="info">
                    Review and confirm the symbol rectification choices made below.
                </StatusLabel>
            );
        }
    },

    renderControls: function() {
        var self = this;

        var aggregateControls = null;
        if (self.state.selectedOids.length > 1) {
            aggregateControls = (
                <RDOs ref='rdos'
                    securityOids={this.state.selectedOids}
                    onChange={this._handleSecurityUpdate}/>
            );
        }

        return (
            <div>
                <AppButton name='ConfirmSymbols'
                    className='float-right'
                    onClick={this._confirmChanges}
                    tooltip='Confirm your changes to the symbol table.'
                    guard={this._guard()}
                    confirmFn={this._confirmFn} />
                {aggregateControls}
            </div>
        );
    },

    renderBody: function() {

        var self = this;

        _.forEach(columnOptions, function(value) {
            var styles = [value.headerCssClass];
            if (value.resizable === false) {
                styles.push('no-resize');
            }
            value.headerCssClass = styles.join(' ');
        });

        /**
         * Because slickgrid is disconnected from React we need to synchronize the
         * checkboxes in the grid with the state of the grid data. We do that here
         * by assigning a click handler.
         */
        columnOptions.excld.asyncPostRender = function(cellNode, row, dataContext) {
            $(cellNode).find('input[type="checkbox"]').on('click', function() {
                _.some(self.state.data.data.pandas.values, function(datum) {
                    if (datum.oid === dataContext.oid) {
                        datum.excld = !datum.excld;
                        NeatApp.rectifyChanged();
                        self.forceUpdate();
                        return true;
                    }
                });
            });
        };

        return (
            <div className='symbols-grid'>
                <input type='checkbox'
                    id='symbols-select-toggle'
                    title='Toggle select state for all rows'
                    onClick={this._handleSelectToggle} />
                <input type='checkbox'
                    id='symbols-exclude-toggle'
                    title='Toggle exclude state for all rows'
                    onClick={this._handleExcludeToggle} />
                <TableWidget url={'/get_symbol_table/' + NeatApp.caseName()}
                    ref="tableWidget"
                    columnOptions={columnOptions}
                    onLoad={this._onLoad}
                    caption="A table with rows of symbols from the Registrant data. The first column is the symbol&#39;s code. The following columns show additional data."
                    options={{
                        enableAsyncPostRender: true,
                        forceFitColumns: true
                    }}
                    eventCbs={{
                        onActiveCellChanged: this._handleActiveCell,
                        onSelectedRowsChanged: this._handleSelectedRows
                    }} />
            </div>
        );
    },

    renderAfterBody: function() {
        var highlightSectionClass = '';
        if (this.state.highlightSection) {
            highlightSectionClass = ('highlight-' +
                this.state.highlightSection);
        }

        var securityOid = null;
        if (this.state.selectedOids.length === 1) {
            securityOid = this.state.selectedOids[0];
        }
        return (
            <div className={highlightSectionClass}>
                <DeepDive securityOid={securityOid}
                    onSecurityUpdate={this._handleSecurityUpdate}
                    chartKeyCtrl={this.state.highlightSection} />
            </div>
        );
    },

    //
    // React lifecycle methods
    //

    mixins: [ProgressMixin, StagingMixin],

    getInitialState: function() {
        return {
            data: {},
            selectedOids: [],
            highlightSection: null,
        };
    },

    getDefaultProps: function() {
        return {
            name: 'Symbols',
            title: 'Symbol Rectification',
            stage: 'Rectification',
        };
    }
});

export default Symbols;
