import React from 'react';
import { Panel } from 'react-bootstrap';
import _ from 'lodash';
import Highcharts from 'highcharts';
import util from 'common/utils/util';
import MailtoError from 'common/components/MailtoError';
import ReportHeader from 'reports/components/ReportHeader';
import q from 'common/utils/queryFactory';

/**
 * Mixin to be added to all reports.
 * @component
 * @exports lib\Components\Reports\ReportMixin
 */
const ReportMixin = {
    widgets: {},
    mappings: null,

    prettyStack: function(stack) {
        if (stack) {
            var lines = stack.split(' at ');
            return _.map(_.slice(lines, 1), line => <span>&nbsp;&nbsp;&nbsp;&nbsp;at {line}</span>);
        } else {
            return stack;
        }
    },

    makeError: function(e) {
        var errorMsg = (
            <pre>
                {e.toString()}

                <p>
                    {this.prettyStack(e.stack)}
                </p>
            </pre>
        );

        return (
            <Panel header={<h3>Report Error</h3>} bsStyle="danger">
                {errorMsg}
                <MailtoError error={errorMsg}>
                    Contact support
                </MailtoError>
            </Panel>
        );
    },

    getInitialState: function() {
        Highcharts.setOptions({
            lang: {
                /* Swap out the metric prefixes for short scale convention
                 * | 10^n  | Metric | M Symbol |  Short Scale  | SS Sym
                 * ---------------------------------------------------
                 * | 10^3  |  kilo  |     k    |    thousand   |   k
                 * | 10^6  |  mega  |     M    |     million   |   M
                 * | 10^9  |  giga  |     G    |     billion   |   B
                 * | 10^12 |  tera  |     T    |    trillion   |   T
                 * | 10^15 |  peta  |     P    |   quadrillion |   Q
                 */
                numericSymbols: ["k" , "M" , "B" , "T" , "Q" ],
                thousandsSep: ',',
            },
        });

        try {
            var viz = this.render_();
        } catch(e) {
            var viz = this.makeError(e);
        }

        return {
            viz: viz,
        };
    },

    render: function() {
        this.widgets = { }; // Should not be in getInitialState.

        // Store list of report widgets on the window object for testing
        // purposes. This way Selenium can inspect them.
        window.widgets = this.widgets;

        var self = this;
        self.mappings = q.jsutil.mappings({});

        var recurse = function(component) {
            if (component && component.props) {
                component.props.page = self;
                if (component.props.children) {
                    let { children } = component.props;
                    React.Children.forEach(children, recurse);
                }
            }
        };

        recurse(this.state.viz);

        var reportClass = 'fluid-container';
        if (this.props.style == 'thin') {
            reportClass = 'staging-mixin-body';
        }

        return (
            <div className={reportClass}>
                <ReportHeader tags={this.props.meta}>
                    {this.props.displayName}
                </ReportHeader>

                <div>
                    {this.props.summary}
                    <p />
                </div>

                {this.state.viz}
            </div>
        )
    }
};

export default ReportMixin;
