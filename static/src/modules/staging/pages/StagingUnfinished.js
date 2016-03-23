import React from 'react';
import { Link } from 'react-router';
import NeatApp from 'app/utils/NeatApp';

/**
 * Route handler for rendering the Staging Unfinished page.
 * Use this page to warn the user that staging is not yet finished.
 * @component
 * @exports Pages\Dashboard\Case\StagingUnfinished
 */
const StagingUnfinished = React.createClass({
    render: function() {
        return (
            <div className="content">
                <h1 className="content-subhead">Staging incomplete</h1>
                <p>
                    Please finish{' '}
                    <Link
                        to="staging"
                        params={{name: NeatApp.getCurrentCase().name}}
                    >
                        staging
                    </Link> before proceeding.
                </p>
            </div>
        );
    }
});

export default StagingUnfinished;
