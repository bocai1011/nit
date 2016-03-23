import React from 'react';
import { Labe } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import TableWidget from 'common/components/TableWidget';
import ModalOverlay from 'common/components/ModalOverlay';
import ErrorLink from 'common/components/ErrorLink';

/**
 * Component for rendering the results of processing a file.
 * @component
 */
const ProcessingResults = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _make: function(status) {
        if (this.props.renderAs) {
            return <a>{this.props.renderAs}</a>;
        }

        var item = this.props.item;

        var lines, errors;

        if (item.lineCount) {
            lines = item.lineCount;
        } else {
            lines = null;
        }

        if (status === 'critical') {
            errors = (
                <a>a Critical Error</a>
            );
        } else {
            if ( item.errorCount ) {
                errors = (
                    <a>{item.errorCount} errors</a>
                );
            }
            else {
                errors = "0 errors";
            }
        }

        return (
            <span>
                {lines} line{lines > 1 && 's'} with {errors}
            </span>
        );
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        error: React.PropTypes.node,
        item: React.PropTypes.object,
        renderAs: React.PropTypes.node,
    },

    render: function() {
        var item = this.props.item;

        if (!item.success &&
            (item.error || this.props.error) &&
            (!item.errorCount || item.errorCount === 0)) {
            return (
                <ErrorLink
                    text={this._make('critical')}
                    title='A critical error was encountered while processing your file.'
                    error={item.error || this.props.error}
                    recommend='Please try fixing the issue and then re-processing.'
                />
            );

        } else if (item.errorCount &&
                    item.errorCount > 0 ||
                    item.lineCount &&
                    item.lineCount > 0) {

            if (item.errorCount) {
                return (
                    <ModalOverlay renderAs={this._make()}
                        title='Error Viewer'
                        id='table-overlay'
                        style={{'display':'inline-block'}}>

                        <TableWidget
                            params={{
                                type: item.type,
                                file: item.file
                            }}
                            options={{gridHeight: '90%', forceFitColumns: false}}
                            columnOptions={{
                                Index: {cssClass: 'bg-thin'},
                                Errors: {cssClass: 'bg-danger'},
                                Warnings: {cssClass: 'bg-warning'}
                            }}
                            url={'/get_wolf_errors/' + NeatApp.caseName()}
                        />

                    </ModalOverlay>
                );

            } else {
                return this._make();
            }

        } else if (item.success && item.lineCount > 0) {
            return this._make();
        } else {
            return (<span/>);
        }
    },
});

export default ProcessingResults;
