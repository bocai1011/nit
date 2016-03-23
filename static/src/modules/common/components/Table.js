import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import util from 'common/utils/util';
import QGrid from 'qgridjs';
import numeral from 'numeral';
import keyUtils from 'common/utils/keyUtils';
import format from 'string-format';

/**
 * This formatter adds a `title` HTML attribute containing the inner text,
 * this adds tooltips by defaults if column width gets too small.
 */
function defaultFormatter(row, cell, value) {
    return React.renderToStaticMarkup(
        <span title={value}>
            {value}
        </span>
    );
};

const DEFAULT_SLICKGRID_OPTS = {
    defaultFormatter: defaultFormatter,
    editable: true,
    enableCellNavigation: true,
    enableColumnReorder: false,
    forceFitColumns: false,
    fullWidthRows: true,
    gridHeight: null,
    rowHeight: 35
};

var formatters = {
    Float: function (spec) {
        return function (row, cell, value) {
            var prec = spec.precision;
            var fmt = '0,0';
            if (!(prec === 0 || _.isNull(prec))) {
                fmt = format('0,0.0{}d', prec || 2);
            }
            return numeral(value).format(fmt);
        };
    },
    Integer: function () {
        return function (row, cell, value) {
            return numeral(value).format('0,0');
        };
    }
};

var defaultCssClasses = {
    Float: 'text-right',
    Integer: 'text-right'
};

/**
 * Component for a basic table.
 * @component
 * @exports lib\Components\Table
 */
const Table = React.createClass({

    displayName: 'Table',

    propTypes: {
        options: React.PropTypes.object,
        style: React.PropTypes.object,
        columnOptions: React.PropTypes.object,
        cellCssStyles: React.PropTypes.object,
        editors: React.PropTypes.object,
        eventCbs: React.PropTypes.object
    },

    getInitialState: function() {
        return {
            grid: null
        };
    },

    getDefaultProps: function() {
        return {
            options: {},
            style: {
                width: '100%',
            },
            columnOptions: {},
            cellCssStyles: {},
            editors: {},
            eventCbs: {}
        };
    },

    componentDidMount: function () {
        if (this.isMounted()) {
            var data = this.props.data.data.pandas,
                records = data.values,
                columns = data.axes.columns.values,
                dtypes = data.dtypes.kind,
                meta = this.props.data.meta,
                columnOptions = this.props.columnOptions,
                editors = this.props.editors;

            var columnData = _.zip(columns, dtypes).map(
                function (item) {
                    var field = item[0],
                        type = item[1],
                        widths = {
                            Errors: 350,
                            Warnings: 350
                        };

                    var colWidth = (widths[field]) || 150;

                    var result = {
                        field: field,
                        type: type,
                        cssClass: defaultCssClasses[type] || '',
                        width: colWidth,
                        editor: editors[field] || null
                    };

                    var formatter = formatters[type];
                    if (!_.isUndefined(formatter) && meta.format_spec) {
                        result.formatter = formatter(meta.format_spec[field] || {});
                        return result;
                    }

                    var colOpts = columnOptions[field] || {};
                    return _.assign(result, colOpts);
                });

            var opts = _.assign({}, DEFAULT_SLICKGRID_OPTS, this.props.options);
            var grid = new QGrid(
                this.refs.qgrid.getDOMNode(), records, columnData, opts);

            grid.initializeSlickGrid();

            // Install event handlers
            _.forEach(this.props.eventCbs, function(cb, evnt) {
                grid.slickGrid[evnt].subscribe(cb);
            });

            this.setState({grid: grid});

            /**
             * Adds 508 compliance functionality to table.
             * Makes headers tab-navigable.
             * Makes column headers click() upon entering 'Return' or 'Enter' keys
             */
            var respondToEnterKey = keyUtils.respondToEnterKey;
            var qGridElement = document.getElementsByClassName('inline-q-grid')[0] || document.getElementsByClassName('q-grid-container')[0].parentNode;
            var qGridHeaderElement = document.getElementsByClassName('slick-header')[0];
            var columnHeaders = document.getElementsByClassName('slick-header-sortable');
            var parent = qGridElement.parentNode;
            var previous = qGridElement.previousSibling;
            var previousTabbable = parent;
            if (previous !== null) {
                var lastFound;
                var previousChildren = previous.getElementsByTagName('*');
                for (var f = 0; f < previousChildren.length; f++) {
                    if (previousChildren[f].tabIndex > -1 || previousChildren[f].tagName === 'BUTTON') {
                        lastFound = previousChildren[f];
                    }
                }
                previousTabbable = lastFound || previous || parent;
            }

            previousTabbable.addEventListener('keydown', function(e) {
                var keyEvent = e.which || e.keyCode;
                if(keyEvent === 9 && !e.shiftKey) {             // if Tab
                    columnHeaders[0].focus();
                    e.preventDefault();
                    return false;
                }
            });

            qGridHeaderElement.tabIndex = 0;

            var domNode = this.getDOMNode();
            for (var c = 0; c < columnHeaders.length; c++) {
                var ch = columnHeaders[c];
                ch.tabIndex = 0;
                /** Add tabbable focus to sort filter, if it exists **/
                /*if (ch.getElementsByClassName('filter-button')[0]) {
                    ch.getElementsByClassName('filter-button')[0].tabIndex = 0;
                }*/
                if (c === 0) {
                    ch.addEventListener('keydown', function(e) {
                        var keyEvent = e.which || e.keyCode;
                        if (document.activeElement === domNode && e.shiftKey && keyEvent === 9) { // if shift-Tab
                            previousTabbable.focus();
                            e.preventDefault();
                        }
                    });
                }

                ch.addEventListener('keypress', function(e){
                    respondToEnterKey(e);
                } );
            }

            /** Beginning of code to make filter widgets in SlickGrids 508-compliant **/
/*                filterWidgets = document.getElementsByClassName('grid-filter');
            for (var i = 0; i < filterWidgets.length; i++) {
                var fw = filterWidgets[i];
                var closeButton = fw.getElementsByClassName('close-button')[0];
                fw.tabIndex = 0;
                closeButton.onfocus.addEventListeneraddEventListener('keypress', function(e){
                    respondToEnterKey(e);
                    }
                );
            }
*/
        }
    },

    componentWillUnmount: function() {
        var self = this;

        // uninstall event handlers
        _.forEach(this.props.eventCbs, function(cb, evnt) {
            self.state.grid.slickGrid[evnt].unsubscribe(cb);
        });

        // remove children nodes from container
        $('.q-grid').empty();
    },

    componentDidUpdate: function(pp) {
        if (pp.cellCssStyles !== this.props.cellCssStyles) {
            this.state.grid.slickGrid.setCellCssStyles('foo', this.props.cellCssStyles);
        }
    },

    render: function () {
        var caption = this.props.caption;
        return (
            <div className='q-grid-container'>
                <span className='hide508'>{ caption }</span>
                <div
                    ref='qgrid'
                    className='q-grid'
                    style={this.props.style}
                />
            </div>
        );
    }
});

export default Table;
