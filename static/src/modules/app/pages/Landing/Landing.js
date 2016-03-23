import React from 'react';
import { Navigation } from 'react-router';
import NewOpen from 'app/pages/Landing/NewOpen';

/**
 * Route handler for rendering the landing page.
 * @component
 * @exports Pages\Dashboard\Landing
 */
const PageLanding = React.createClass({

    mixins: [Navigation],

    propTypes: {
        newCaseDialogOpen: React.PropTypes.bool,
    },

    render: function() {
        return (
            <div className="splash-container">
                <div className="splash flex-center">
                    <h1>NEAT</h1>
                    <h2>Powered by the Securities and Exchange Commission</h2>
                    <NewOpen startWith={this.props.newCaseDialogOpen}/>
                </div>
            </div>
        );
    }
});

export default PageLanding;
