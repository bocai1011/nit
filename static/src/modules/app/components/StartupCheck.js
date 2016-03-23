import React from 'react';
import { RouteHandler, Navigation } from 'react-router';
import $ from 'jquery';
import NeatApp from 'app/utils/NeatApp';

/**
 * Route handler for performing a startup check.
 * Startup check verifies Neat app has been started on the frontend.
 * If it has not, it transitions to the startup page.
 * Otherwise the handler passes rendering through to its child.
 * @exports Pages\StartupCheck
 */
const StartupCheck = React.createClass({

    mixins: [Navigation],

    componentWillMount: function () {
        if (!NeatApp.getApp()) {

            // Neat app has not been started.
            // Transition to the startup page to load the app.
            this.transitionTo('startup');

        }
    },

    render: function() {

        // If NEAT app has been started, render it.
        if (NeatApp.getApp()) {
            return (<RouteHandler {...this.props} />);

        // This will only happen when NEAT first opens and the app hasn't been
        // loaded. The page will transition to Startup, which will load the app,
        // so don't render anything.
        } else {
            return <noscript/>
        }
    }

});

export default StartupCheck;
