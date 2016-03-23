import React from 'react';
import NeatApp from 'app/utils/NeatApp';
import ModalOverlay from 'common/components/ModalOverlay';
import ButtonLink from 'common/components/ButtonLink';
import MailtoError from 'common/components/MailtoError';

/**
 * Component for rendering a link that opens a modal pop up
 * displaying information about an encountered error.
 * @component
 * @exports lib\Components\ErrorLink
 */
const ErrorLink = React.createClass({

    propTypes: {
        error: React.PropTypes.node,
        recommend: React.PropTypes.node,
        text: React.PropTypes.node,
        title: React.PropTypes.node,
    },

    render: function() {
        var renderAs = this.props.text;
        if (typeof this.props.text === 'string') {
            renderAs = <a>{this.props.text}</a>;
        }

        return (
            <ModalOverlay inline renderAs={renderAs} title={this.props.title}>
                <strong>{this.props.error}</strong>
                <br /><br />
                {this.props.recommend}
                <br /><br />
                <MailtoError error={this.props.error}>Contact support</MailtoError>
            </ModalOverlay>
        );
    },
});

export default ErrorLink;
