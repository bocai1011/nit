/** @module reports/utils/Chart/Chart */

import React, { PropTypes } from 'react';
import { Panel, DropdownButton, MenuItem, ModalTrigger } from 'react-bootstrap';
import { get, snakeCase, isFunction } from 'lodash';
import NeatApp from 'app/utils/NeatApp';
import downloadPNG from './downloadPNG';

import LoadingIcon from 'common/components/LoadingIcon';
import MailtoError from 'common/components/MailtoError';
import Notification from 'common/components/Notification';
import CallStack from 'reports/components/charts/CallStack';
import ChartItem from 'reports/utils/Chart/ChartItem';

const Chart = React.createClass({

    /**
     * Custom Methods
     * ------------------------------------------------------------------------
     */

    _downloadCSV: function () {
        this.props.downloadCSV('report_page', this.props.title);
    },

    _downloadXLSX: function () {
        this.props.downloadXLSX('report_page', this.props.title);
    },

    _downloadNotebook: function () {
        this.props.downloadNotebook('report_page', this.props.title);
    },

    _downloadPNG: function () {
        let filename = `report_page-${snakeCase(this.props.title)}.png`;
        downloadPNG(this.getDOMNode(), filename);
    },

    _logData: function () {
        console.log(this.props);
    },

    _renderCallStack: function () {
        if (this.props.queryCalls) {
            return (
                <CallStack
                    calls={this.props.queryCalls}
                    onHide={this._hideCallStack}
                    title={this.props.title}
                    visible={this.state.callStackVisible}
                />
            );
        }
    },

    /**
     * Renders the header component for the Chart's Panel.
     */
    _renderHeader: function () {

        let
            devOptions,
            summary,
            { chartMenuAdditions } = this.props
        ;

        // A summary of the Widget's visualization.
        summary = (
            <Notification title={this.props.title}>
                { this.props.summary }
            </Notification>
        );

        if (get(NeatApp.getApp(), 'NeatOptions.Debugging.value')) {

            devOptions = [

                <MenuItem divider />,

                <ChartItem eventKey='6' onClick={this._logData}>
                    Log Widget Data
                </ChartItem>,

                <ChartItem eventKey='7' onClick={this._showCallStack}>
                    View Query Call Stack
                </ChartItem>,

            ];

        }

        return (
            <div className='chart-title'>

                <ModalTrigger modal={summary}>
                    <span>{ this.props.title }</span>
                </ModalTrigger>

                <DropdownButton
                    aria-label={this.props.title}
                    bsStyle={'link'}
                    title={''}
                    onFocus={ () => this.setState({ focused: true }) }
                    onBlur={ () => this.setState({ focused: false }) }
                >
                    <ModalTrigger modal={summary}>
                        <ChartItem eventKey='1'>Summary</ChartItem>
                    </ModalTrigger>

                    <ChartItem eventKey='2' onClick={this._downloadCSV}>
                        Download CSV
                    </ChartItem>

                    <ChartItem eventKey='3' onClick={this._downloadXLSX}>
                        Download XLSX
                    </ChartItem>

                    <ChartItem eventKey='4' onClick={this._downloadPNG}>
                        Save Image as PNG
                    </ChartItem>

                    <ChartItem eventKey='5' onClick={this._downloadNotebook}>
                        Export Calculation as iPython Notebook
                    </ChartItem>

                    { chartMenuAdditions }

                    { devOptions }

                </DropdownButton>

                <span className='chart-header-info'>
                    { this.props.headerInfo }
                </span>

                { this._renderCallStack() }

            </div>
        );
    },

    /**
     * A callback function to reveal a Chart's Query call stack.
     */
    _showCallStack: function () {
        this.setState({
            callStackVisible: true,
        });
    },

    /**
     * A callback function to hide a Chart's Query call stack.
     */
    _hideCallStack: function () {
        this.setState({
            callStackVisible: false,
        });
    },

    /**
     * React Methods
     * ------------------------------------------------------------------------
     */

    propTypes: {
        title: PropTypes.string.isRequired,

        downloadCSV: PropTypes.func,
        downloadNotebook: PropTypes.func,
        downloadXLSX: PropTypes.func,
        error: PropTypes.node,
        loading: PropTypes.bool,
        chartMenuAdditions: PropTypes.arrayOf(PropTypes.instanceOf(ChartItem)),
        queryCalls: PropTypes.array,
        summary: PropTypes.node,
    },

    getInitialState: function () {
        return {
            callStackVisible: false,
            focused: false,
        };
    },

    render: function () {

        let className = 'chart-wrapper';
        if (this.state.focused) {
            className += ' panel-info';
        }

        if (this.props.loading) {
            return (
                <Panel
                    header={<h3>{ this.props.title }</h3>}
                    className={className}
                >
                    <LoadingIcon/>
                </Panel>
            );
        } else if (this.props.error) {
            return (
                <Panel
                    header={<h3>Report Error</h3>}
                    bsStyle='danger'
                    className={className}
                >
                    <pre>{ this.props.error }</pre>
                    <MailtoError error={this.props.error}>
                        Contact Support
                    </MailtoError>
                </Panel>
            );
        }

        return (
            <Panel
                header={this._renderHeader()}
                className={className}
            >
                { this.props.children }
            </Panel>
        );

    },

});

export default Chart;
