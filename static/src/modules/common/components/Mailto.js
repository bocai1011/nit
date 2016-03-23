import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';
import React from 'react';

/**
 * Component for rendering a mailto link.
 * The link will open an email client with an email constructed
 * to show a message provided in the props to the component.
 * @component
 * @exports lib\Components\Mailto
 */
const Mailto = React.createClass({
    render: function () {

        let
            version,
            body,
            mailto,
            { message } = this.props,
            page = window.location.hash,
            subject = 'NEAT Feedback'
        ;

        try {
            version = 'v' + NeatApp.getApp().version;
        } catch(e) {
            version = 'Unknown version';
        }

        message = message || 'I have a suggestion...';
        body = `${message}\n\n---\nVERSION: ${version}\nPAGE: ${page}`;

        subject = encodeURIComponent(subject);
        body = encodeURIComponent(body);

        mailto = `mailto:NEATHelpEmail@sec.gov?subject=${subject}&body=${body}`

        return (
            <a {...this.props} href={mailto}>{this.props.children}</a>
        );
    }
});

export default Mailto;
