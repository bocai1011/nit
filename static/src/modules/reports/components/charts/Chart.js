import _ from 'lodash';
import React from 'react';
import {
    ModalTrigger,
    DropdownButton,
    MenuItem,
    Portal,
} from 'react-bootstrap';
import { Navigation, State } from 'react-router';
import NeatApp from 'app/utils/NeatApp';
import Notification from 'common/components/Notification';
import CallStack from 'reports/components/charts/CallStack';

/**
 * Component for rendering a chart.
 * This is a high level component which widgets sit inside of.
 * The chart provides the chrome around a widget, such as header
 * and dropdown menu items for various options.
 * @component
 * @exports lib\Components\Charts\Chart
 */
const Chart = React.createClass({
    mixins: [State, Navigation],

    getDefaultProps: function() {
        return {
            spec: {
                exports: []
            }
        };
    },

    propTypes: {
        title: React.PropTypes.string.isRequired,

        // A node that will be rendered on the right side of a Chart's
        // Panel header. Used for auxiliary information about a Widget.
        headerInfo: React.PropTypes.node,
    },

    getInitialState: function() {
        return {
            isExpanded: false,
            callStackVisible: false,
            calls: [],
            expandedCalls: [],
        };
    },

    getCsv: function () {
        this.props.getCsv("report_page", this.props.title);
    },

    getXlsx: function () {
        this.props.getXlsx("report_page", this.props.title);
    },

    getPng: function () {
        var filename = "report_page" + '-' + this.props.title.replace(' ', '_') + '.png';
        this.props.getPng(filename);
    },

    toNotebook: function () {
        var filename = "report_page" + '-' + this.props.title.replace(' ', '_') + '.ipynb';
        this.props.getNotebook("report_page", filename);
    },

    logData: function () {
        console.log('Widget spec:');
        console.log(this.props.spec);

        console.log('Parent:');
        this.props.logParentData();

        console.log('Widget data:');
        console.log(this.props.data);
    },

    _highlightTitle: function() {
        this.getDOMNode().className += ' panel-info';
    },

    _dimTitle: function() {
        this.getDOMNode().className = this.getDOMNode().className.replace( ' panel-info', '');
    },

    _showCallStack: function () {
        this.setState({
            callStackVisible: true,
        });
    },

    _hideCallStack: function () {
        this.setState({
            callStackVisible: false,
        });
    },

    delayCollapseMenu: function() {
        var self = this;
        var tm = setTimeout(function(){
            if (self.state.isExpanded == false){
                self.getDOMNode().click();
            }
        }, 200);
    },

    listenForEnterKey: function(e) {
        var keyEvent = e.which || e.keyCode;
        if (keyEvent == 13) {
            var activeEl = document.activeElement;
            var clickableElement;
            /* Assign click to first anchor in the element, if any exist. */
            childAnchor =  activeEl.getElementsByTagName('BUTTON')[0] || activeEl.getElementsByTagName('A')[0];
            if (childAnchor) {
                clickableElement = childAnchor;
            }
            else {
                clickableElement = activeEl;
            }
            clickableElement.click();
        }
    },

    render: function () {
        var noteContents;
        if (this.props.summary && this.props.summary.loading) {
            noteContents = 'The description for this visual is stil loading.';
        } else {
            noteContents = this.props.summary;
        }
        // console.log(noteContents);

        var widgetNote = (
            <Notification title={this.props.title}>
                {noteContents}
            </Notification>
        );

        let { calls } = this.props;

        let callStack;
        if (calls) {

            calls = JSON.parse(calls);

            callStack = (
                <CallStack
                    calls={calls}
                    onHide={this._hideCallStack}
                    title={this.props.title}
                    visible={this.state.callStackVisible}
                />
            );

        }

        var id = 'download' + this.props.id;

        // Create a container that is passed to the child widget.
        // This container will hold functions the child wants to give to this parent component.
        this.container = {};
        this.props.children.props.container = this.container;

        var showDevOptions = null;
        if (NeatApp.getApp().NeatOptions) {
            showDevOptions = NeatApp.getApp().NeatOptions.Debugging.value;
        }

        var self = this;

        return (
            <div id={this.props.id} className="chart-wrapper panel panel-default">
                <div className="chart-title panel-heading">
                    <ModalTrigger modal={widgetNote}>
                        <span style={{cursor:'pointer'}}>{self.props.title}</span>
                    </ModalTrigger>

                    <DropdownButton aria-label={self.props.title} bsStyle={'link'} title={''}
                        onFocus={ function(e) {self._highlightTitle()} }
                        onBlur={function(e) {self._dimTitle(this)}}>
                        <ModalTrigger modal={widgetNote}>
                            <li tabIndex="0" eventKey="1" onClick={function(e) { e.preventDefault(); }}
                                onFocus={function(e) {
                                    self.state.isExpanded = true;
                                    addEventListener("keypress", self.listenForEnterKey)} }
                                onBlur={function(e) {
                                    self.state.isExpanded = false;
                                    self.delayCollapseMenu();
                                    removeEventListener("keypress", self.listenForEnterKey)} }>
                                <a tabIndex="-1">Summary</a>
                            </li>
                        </ModalTrigger>

                        {_.includes(self.props.spec.exports, 'csv') ?
                            <li tabIndex="0" eventKey="2" onClick={this.getCsv}
                                onFocus={function(e) {
                                    self.state.isExpanded = true;
                                    addEventListener("keypress", self.listenForEnterKey)} }
                                onBlur={function(e) { removeEventListener("keypress", self.listenForEnterKey)} }
                            >
                                <a tabIndex="-1">Download CSV</a>
                            </li>
                            : null
                        }

                        {_.includes(self.props.spec.exports, 'xlsx') ?
                            <li tabIndex="0" eventKey="2" onClick={this.getXlsx}
                                onFocus={function(e) {
                                    self.state.isExpanded = true;
                                    addEventListener("keypress", self.listenForEnterKey)} }
                                onBlur={function(e) { removeEventListener("keypress", self.listenForEnterKey)} }
                            >
                                <a tabIndex="-1">Download XLSX</a>
                            </li>
                            : null
                        }

                        {_.includes(self.props.spec.exports, 'png') ?
                            <li tabIndex="0" eventKey="4" onClick={this.getPng}
                                onFocus={function(e) {
                                    self.state.isExpanded = true;
                                    addEventListener("keypress", self.listenForEnterKey)} }
                                onBlur={function(e) {
                                    self.state.isExpanded = false;
                                    self.delayCollapseMenu();
                                    removeEventListener("keypress", self.listenForEnterKey)} }>
                                <a tabIndex="-1" >Save Image as PNG</a>
                            </li>
                            : null
                        }

                        <li tabIndex="0" eventKey="7" onClick={this.toNotebook}
                            onFocus={function(e) {
                                self.state.isExpanded = true;
                                addEventListener("keypress", self.listenForEnterKey)} }
                            onBlur={function(e) {
                                self.state.isExpanded = false;
                                self.delayCollapseMenu();
                                removeEventListener("keypress", self.listenForEnterKey)} }>
                            <a tabIndex="-1" >Export Calculation as iPython notebook</a>
                        </li>

                        {self.props.menuAdditions ? self.props.menuAdditions() : null}

                        {!showDevOptions ? null : [
                            <MenuItem divider />,

                            <li tabIndex="0" eventKey="5" tabIndex="0" onClick={this.logData}
                                onFocus={function(e) {
                                    self.state.isExpanded = true;
                                    addEventListener("keypress", self.listenForEnterKey)} }
                                onBlur={function(e) {
                                    self.state.isExpanded = false;
                                    self.delayCollapseMenu();
                                    removeEventListener("keypress", self.listenForEnterKey)} }>
                                <a tabIndex="-1">Log widget data</a>
                            </li>,

                            <li tabIndex="0" eventKey="6" onClick={this._showCallStack}>
                                <a tabIndex="-1">View call stack</a>
                            </li>,
                        ]}
                    </DropdownButton>

                    <span className='chart-header-info'>
                        { this.props.headerInfo }
                    </span>

                    { callStack }

                </div>

                <div className="chart-stage panel-body">
                    {this.props.children}
                </div>
            </div>
        );
    }
});

export default Chart;
