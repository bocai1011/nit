import React from 'react';
import util from 'common/utils/util';
import Error from 'common/components/Error';

/**
 * Route handler for rendering an error message.
 * @component
 * @exports Pages\Dashboard\Error
 */
const ErrorPage = React.createClass({

    render: function() {
        return (
            <div className="splash-container-absolute">
                <Error
                    description={util.getErrorDescription()}
                    error={util.getErrorMessage()}
                />
            </div>
        );
    }

});

export default ErrorPage;
