import React from 'react';
import CSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import { Alert } from 'react-bootstrap';
import MailtoError from 'common/components/MailtoError';

/**
 * Component for rendering a notification component that displays an
 * expiring error message at the top of the window.
 * @component
 * @exports common\components\ErrorNotification
 */
const ErrorNotification = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _handleDismiss: function () {
        this.setState({ visible: false });
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        description: React.PropTypes.node,
        dismissAfter: React.PropTypes.number,
        error: React.PropTypes.string,
    },

    getDefaultProps: function () {
        return { dismissAfter: 10000 };
    },

    getInitialState: function () {
        return { visible: true };
    },

    render: function () {

        var { description, error } = this.props;

        if (description) {
            description = (<p>{ description }</p>);
        }

        if (error) {
            error = (<pre>{ error }</pre>);
        }

        var alert = null;
        if (this.state.visible) {
            alert = (
                <Alert
                    className="error-notification"
                    bsStyle="danger"
                    dismissAfter={this.props.dismissAfter}
                    onDismiss={this._handleDismiss}
                    key="error">
                    <h3>NEAT had an error!</h3>
                    { description }
                    { error }
                    <p>
                        Not the first time you're seeing this?{' '}
                        <MailtoError>Contact support.</MailtoError>
                    </p>
                </Alert>
            );
        }

        return (
            <CSSTransitionGroup
                transitionName="error-notification"
                transitionAppear={true}>
                { alert }
            </CSSTransitionGroup>
        );

    }

});

export default ErrorNotification;
