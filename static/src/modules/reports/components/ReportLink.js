import React from 'react';
import { Link } from 'react-router';
import NeatApp from 'app/utils/NeatApp';

/**
 * Component for rendering a browser link that links
 * to a specified report, with specified query parameters.
 * @component
 * @exports lib\Components\ReportLink
 */
const ReportLink = React.createClass({
    render: function () {
        var link = NeatApp.reportLink(this.props.info);
        return <Link to='report' params={link.params} query={link.query}>{this.props.children}</Link>;
    }
});

export default ReportLink;
