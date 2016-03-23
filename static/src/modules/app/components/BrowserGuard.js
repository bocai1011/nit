import React from 'react';
import $ from 'jquery';
import util from 'common/utils/util';
import Error from 'common/components/Error';

/**
 * Route handler for rendering a warning to the user
 * that they should not use Internet Explorer.
 * @exports Pages\BrowserGuard
 */
const BrowserGuard = React.createClass({

    render: function() {
        return (
            <div className="container">
                <br />
                <Error mailto={false}
                    description='Unsupported browser'
                    error='Internet Explorer is not supported'
                    suggestion={
                        <p>
                            Please use either Firefox or Chrome.
                        </p>
                    }
                />
            </div>
        );
    }
});

export default BrowserGuard;
