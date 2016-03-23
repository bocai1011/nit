import React from 'react';
import util from 'common/utils/util';
import { Jumbotron } from 'react-bootstrap';
import MailtoError from 'common/components/MailtoError';

/**
 * Component for rendering a large display showing the lastChild
 * error encountered or an error provided in the props.
 * @component
 * @exports lib\Components\Error
 */
const Error = React.createClass({

    propTypes: {
        description: React.PropTypes.node,
        error: React.PropTypes.oneOfType([
            React.PropTypes.oneOfType([
                React.PropTypes.shape({
                    args: React.PropTypes.array,
                }),
                React.PropTypes.shape({
                    message: React.PropTypes.string,
                }),
            ]),
            React.PropTypes.node,
        ]),
        mailto: React.PropTypes.bool,
        suggestion: React.PropTypes.node,
    },

    getDefaultProps: function() {
        return {
            mailto: true,
            suggestion: null,
        };
    },

    render: function () {

        let { description, error, mailto, suggestion } = this.props;
        description = description || util.getErrorDescription();
        error = util.extractError(error) || util.getErrorMessage();

        if (description) {
            description = (
                <p className='error-description'>{ description }.</p>
            );
        }

        if (error) {
            error = (<pre className='error-message'>{ error }</pre>);
        }

        if (mailto) {
            mailto = (
                <p className='error-mailto'>
                    Of course, you can always{' '}
                    <MailtoError>contact support.</MailtoError>
                </p>
            );
        }

        if (!suggestion) {
            suggestion = (
                <p className='error-suggestion'>
                    Try the following steps until things look better:
                    <ol>
                        <li>
                            Press the browser's back button;
                            then press the refresh button (or F5).
                        </li>
                        <li>Quit and restart NEAT.</li>
                        <li>Restart your computer and then reopen NEAT.</li>
                    </ol>
                </p>
            );
        }

        return (
            <div className='error-container'>
                <Jumbotron>
                    <h1>Oh, no! NEAT is a little confused.</h1>
                    { description }
                    { error }
                    { suggestion }
                    { mailto }
                </Jumbotron>
            </div>
        );
    }
});

export default Error;
