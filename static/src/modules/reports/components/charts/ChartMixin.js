import _ from 'lodash';
import React from 'react';
import { Panel } from 'react-bootstrap';
import LoadingIcon from 'common/components/LoadingIcon';
import MailtoError from 'common/components/MailtoError';
import Chart from 'reports/components/charts/Chart';
import Transform from 'reports/utils/transform';
import q from 'common/utils/queryFactory';
import util from 'common/utils/util';

export default {
    propTypes: {
        title: React.PropTypes.string.isRequired,
        checkHasData: React.PropTypes.func,
        noDataMsg: React.PropTypes.string
    },
    propArguments: {},
    transform: null,
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
            query: undefined,
            viewProps: {},
            xAxis: null,
            yAxis: null,
            hover: null,
            labels: null,
            indexBy: null,
            X: null,
            Y: null,
            stack: undefined,
            page: null,
            default_view_limit: 20,
        };
    },

    componentWillReceiveProps: function(nextProps) {
        if (this.evaluated) {
            this.evaluated = false;
            this.setState(this.getInitialState());
            this.componentWillUpdate();
        }
    },

    reportToPage: function () {
        var self = this;

        if (self.props.page && self.props.query && self.props.query.ref) {
            self.props.page.widgets[self.props.title + '-' + self.props.query.ref] = self;
        }
    },

    /**
     * Logs data about this widget. Used by the child <Chart/> component's
     * logData() method.
     */
    logData: function () {
        console.log(this);
    },

    getInitialState: function (props) {
        var self = this;

        if (!this.evaluated) {
            this.drawn = false;
            if (self.props.spoof) {
                return {
                    loading: false,
                    data: self.props.spoofdata,
                    args: self.props.spoofargs,
                    errs: self.props.spooferrs,
                    view_limit: self.props.view_limit || self.props.default_view_limit,
                    view_offset: 0,
                    spoofed: true
                };
            }

            return {
                loading: true,
                data: [],
                view_limit: self.props.view_limit || self.props.default_view_limit,
                view_offset: 0,
                noDataMsg: null,
            };
        }
    },

    default_truncate: function(state) {
        var to_viz = state.data;

        if (!this.props.sparkline && to_viz.pandas.values.length > state.view_limit) {
            to_viz['pandas']['values'] = to_viz.pandas.values.slice(state.view_offset, state.view_offset + state.view_limit + 1);
            to_viz['pandas']['axes']['index']['values'] = to_viz.pandas.axes.index.values.slice(state.view_offset, state.view_offset + state.view_limit + 1);
        }

        return to_viz;
    },

    createChart: function () {
        var self = this;
        var dom;

        if (!this.drawn) {
            this.drawn = true;
            if (this.props.sparkline) {
                dom = this.getDOMNode();
            } else {
                dom = this.refs.widget.getDOMNode();
            }

            if (this.props.sparkline || (typeof this.truncate == "undefined")) {
                this._createChart(dom, this.default_truncate(this.state));
            } else {
                this._createChart(dom, this.truncate(this.state));
            }

            if (this.props.container) {
                this.props.container.downloadToPng = this.downloadToPng;
            }
        }
    },

    /**
     * Extracts the SVG rendering of a chart and downloads it as a PNG,
     * by way of a <canvas> element.
     * See http://stackoverflow.com/a/33273543
     *
     * @param {string} filename - An extensionless filename string for
     * downloading.
     */
    downloadToPng: function (filename) {
        let
            img,
            blob,
            url,
            chart = this.refs.widget.getDOMNode(),
            chartWidth = chart.clientWidth,
            chartHeight = chart.clientHeight,
            svg = chart.querySelector('svg')
        ;

        // Serialize the entire SVG into a string, and turn it into a
        // data-url (data:image/svg+xml;charset=utf-8;...)
        svg = (new XMLSerializer()).serializeToString(svg);
        blob = new Blob([ svg ], { type: 'image/svg+xml;charset=utf-8' });

        // Create a URL that can be used as the `src` attribute
        // for an <img> element.
        url = URL.createObjectURL(blob);

        // Create an Image the same size as the chart DOM element.
        img = new Image();
        img.width = chartWidth;
        img.height = chartHeight;

        // Fire when the Image has loaded its URL.
        img.onload = function () {
            let
                canvasData,
                ctx,
                canvas = document.createElement('canvas')
            ;

            // Create a canvas the same size as the chart DOM element.
            canvas.width = chartWidth;
            canvas.height = chartHeight;
            ctx = canvas.getContext('2d');

            // Draw the Image onto the canvas.
            ctx.drawImage(img, 0, 0, chartWidth, chartHeight);

            // Clean up for security reasons.
            URL.revokeObjectURL(url);

            // Download the canvas image.
            this.download(canvas, `${filename}.png`);

        }.bind(this);

        // This will start the loading of the image.
        img.src = url;

    },

    downloadToCsv: function(report, name) {
        if (this.dataQuery && this.dataQuery.toCsv) {
            this.dataQuery.toCsv(report, name);
        } else if (this.wquery.toCsv) {
            this.wquery.toCsv(report, name);
        }
    },

    downloadToXlsx: function(report, name) {
        if (this.dataQuery && this.dataQuery.toXlsx) {
            this.dataQuery.toXlsx(report, name);
        } else if (this.wquery.toXlsx) {
            this.wquery.toXlsx(report, name);
        }
    },

    downloadToNotebook: function (report, name) {
        if (this.dataQuery && this.dataQuery.toNotebook) {
            this.dataQuery.toNotebook(report, name);
        } else if (this.wquery.toNotebook) {
            this.wquery.toNotebook(report, name);
        }
    },

    download: function (canvas, filename) {
        var a = document.createElement('a')
        a.download = filename;
        a.href = canvas.toDataURL("image/png");
        document.body.appendChild(a);
        a.click();
        a.remove();
    },

    toggleProp: function(prop) {
        var self = this;
        self.props[prop] = !self.props[prop];
        self.evaluated = false;
        self.setState(self.getInitialState());
    },

    componentWillUpdate: function () {
        var self = this;

        if (!this.evaluated) {
            self.evaluated = true;
            if (self.props.spoof) {
                if (self.state.data) {
                    self.createChart();
                }
            } else {
                if (_.isUndefined(self.wquery)) {
                    if (self.widgetQuery) {
                        self.props.wquery = self.widgetQuery(self.props.query);
                    } else {
                         self.props.wquery = self.props.query;
                    }
                    self.wquery = self.props.wquery;
                }

                // If a widget has a function that generates a dataQuery,
                // replace it with the dataQuery itself. The dataQuery is a
                // query that can be used for generating a download-ready set
                // of data (to be used by the downloadToXXXX methods.)
                if (_.isFunction(self.dataQuery)) {
                    self.dataQuery = self.dataQuery(self.props.query);
                }

                self.props.mapping = self.props.page ? self.props.page.mappings : q.jsutil.mappings({});

                if (self.transform == null){
                    self.transform = new Transform(self.props);
                    self.transform.subscribe(self);
                }

                if (self.wquery.makeDocs) {
                    self.wquery.makeDocs();
                }

                self.transform.useData().then((results) => {
                    var data = results.data;
                    var errs = results.errs;

                    if (errs.wquery) {
                        self.setState({error: true, errorMsg: errs.wquery, loading: false});
                    } else {
                        var hasData = true;

                        if (self.props.checkHasData && _.isFunction(self.props.checkHasData)) {
                            hasData = self.props.checkHasData(data);
                        }

                        if (hasData) {
                            self.setState({error: false, loading: false, data: data.wquery, args: data, errs: errs}, () => self.createChart());
                        } else {
                            var noDataMsg = "No rows in this chart.";

                            if (self.props.noDataMsg) {
                                noDataMsg = self.props.noDataMsg;
                            }

                            self.setState({error: false, loading: false, data: data.wquery, args: data, errs: errs, noDataMsg: noDataMsg, headerInfo: null});
                        }
                    }
                });
            }
        }
    },

    componentWillMount: function () {
        this.componentWillUpdate();
    },

    /**
     * Create summary content for the widget.
     * @return {component} The widget's summary content.
     */
    makeSummary: function() {
        if (this.state.error) {
            return "There was an error while calculating the query for this widget.";
        } else if (!this.props.summary) {
            return "This widget doesn't seem to have a summary, we're sorry! You should contact the NEAT dev team and tell them to work harder.";
        } else if (_.isFunction(this.props.summary)) {
            if (this.state.loading) {
                return { loading:true };
            } else {
                return this.props.summary(util.formatNames(this.state.args));
            }
        } else if (_.isObject(this.props.summary)) {
            return this.props.summary;
        } else {
            return this.props.summary;
        }
    },

    render: function () {
        var self = this;
        self.reportToPage();

        let props = {
            title: this.props.title,
            summary: this.makeSummary(),
            headerInfo: this.state.headerInfo,
            spec: this.spec,
            calls: this.props.query.docs,
            menuAdditions: this.menuAdditions,
            logParentData: this.logData,
            getCsv: this.downloadToCsv,
            getXlsx: this.downloadToXlsx,
            getPng: this.downloadToPng,
            getNotebook: this.downloadToNotebook,
            data: this.state.data,
        };

        if (self.props.frameLess) {
            var toShow = null;

            if (self.state.loading) {
                toShow = <LoadingIcon />;
            } else if (self.state.error) {
                toShow = <pre>{self.state.errorMsg}</pre>;
            } else if (self.state.noDataMsg) {
                toShow = <div>{self.state.noDataMsg}</div>;
            } else if (self.customDiv) {
                toShow = self.customDiv(self.props);
            }

            return (
                <div ref="widget">
                    {toShow}
                </div>
            );
        }

        if (self.state.loading) {
            return (
                <Chart ref="chart" title={self.props.title} loading={true} spec={self.spec}>
                    <LoadingIcon />
                </Chart>
            );
        }

        var toShow = null;

        if (self.state.error) {
            var errorMsg = <pre>{self.state.errorMsg}</pre>;
            toShow = (
                <Panel header={<h3>Report Error</h3>} bsStyle="danger">
                    {errorMsg}
                    <MailtoError error={errorMsg}>
                        Contact Support
                    </MailtoError>
                </Panel>
            );
        } else if (self.state.noDataMsg) {
            toShow = <div>{self.state.noDataMsg}</div>;
        } else if (self.customDiv) {
            toShow = self.customDiv(self.props, self.state);
        }

        return (
            <Chart ref="chart" {...props}>
                <div ref="widget">
                    {toShow}
                </div>
            </Chart>
        );
    },
};
