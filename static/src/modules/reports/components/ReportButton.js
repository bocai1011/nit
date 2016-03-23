import React from 'react';
import { Navigation } from 'react-router';
import NeatApp from 'app/utils/NeatApp';

/**
 * Top level button for organizing reports.
 * Usually leads to a more specific reports page.
 * @component
 * @exports reports\components\ReportButton
 */
const ReportButton = React.createClass({
    mixins: [Navigation],

    _onClick: function() {
        var caseName = NeatApp.getCurrentCase().name;

        if (this.props.page) {
            this.transitionTo(this.props.page, {name: caseName});
        } else if (this.props.report) {
            this.transitionTo("report", {
                name: caseName,
                report: this.props.report
            });
        }
    },

    render: function() {
        return (
            <div className='report-button' onClick={this._onClick}>
                <h2>{ this.props.title }</h2>
                { this.props.children }
            </div>
        );
    },
});

export default ReportButton;
