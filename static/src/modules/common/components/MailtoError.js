import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import React from 'react';
import format from 'string-format';

// If the body is too long clicking the link could result in nothing happening.
const LEN_LIMIT = 1000;

/**
 * Component for rendering a mailto link.
 * The link will open an email client with an email constructed
 * to show either the last encountered error or an error
 * provided in the props to the component.
 * @component
 * @exports lib\Components\MailtoError
 */
const MailtoError = React.createClass({

    propTypes: {
        description: React.PropTypes.string,
        error: React.PropTypes.any,
    },

    render: function () {
        var version;
        try {
            version = 'v' + NeatApp.getApp().version;
        } catch(e) {
            version = 'Unknown version';
        }

        var subject = format('NEAT error encountered ({})', version);

        var description = this.props.description
                          || util.getErrorDescription();

        description = description ? description + '\n\n' : '';

        var error = util.extractError(this.props.error)
                    || util.getErrorMessage()
                    || 'Unable to determine error.';

        var route = util.getErrorLocation();
        route = route ? 'At app location: ' + route : '';

        var caseDescriptor;
        try {
            var caseName = NeatApp.caseName();
            caseDescriptor = ' while in case ' + caseName;
        } catch (e) {
            caseDescriptor = ''
        }

        var bodyStr = 'The following error was encountered{}:\n\n{}{}\n\n{}';

        if (error.length > LEN_LIMIT) {
            error = ('[Error is truncated]\n\n...' +
                error.slice(error.length-LEN_LIMIT, error.length));
        }

        var body = format(bodyStr, caseDescriptor, description, error, route);

        var mailtoStr='mailto:NEATHelpEmail@sec.gov' +
                      '?subject={}&body={}';

        var mailto = format(
            mailtoStr,
            encodeURIComponent(subject),
            encodeURIComponent(body)
        );

        return (
            <a href={mailto}>{this.props.children}</a>
        );
    }
});

export default MailtoError;
