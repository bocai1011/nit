import React from 'react';
import { Navigation, State } from 'react-router';
import $ from 'jquery';
import util from 'common/utils/util';
import NeatApp from 'app/utils/NeatApp';

/**
 * Get info related to what version of Internet Explorer we are using.
 * @return {object} An object holding the information, or null if we aren't running IE.
 */
var getInternetExplorerInfo = function() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        return {
            version: parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)))
        };
    }
    else {
        return null;
    }
}

/**
 * @return {bool} Whether we are running Internet Explorer.
 */
var isInternetExplorer = function() {
    return !!getInternetExplorerInfo();
};

/**
 * Route handler for starting up the Neat application.
 * @exports Pages\Startup
 */
const Startup = React.createClass({

    mixins: [Navigation, State],
    getInitialState: function() {
        var self = this;


        // Grab the Navigation and State functions and store them in
        // our global util function, for easy access.
        util.setTransitionTo(this.transitionTo);
        util.setReplaceWith(this.replaceWith);
        util.setRouteContext(this.context);
        util.setGetPath(this.getPath);
        util.setGetParams(this.getParams);
        util.setGetQuery(this.getQuery);
        util.setGetRoutes(this.getRoutes);
        util.setGetPathname(this.getPathname);

        // If we're using IE then transition to a warning page.
        if (isInternetExplorer()) {
            this.transitionTo('browser-guard');
            return {
                loading:true,
            };
        }

        // Load the Neat configuration file from the server.
        util.get('/get_config/', function (json) {
            if (json === null) {
                // If no config exists on the server create a new config file.
                NeatApp.newApp();
            } else {
                console.log('got app');
                NeatApp.setApp(json);
            }

            // We've now successfully loaded the app, so let's transition
            // back to wherever we were before requiring the load.
            self.goBack();
        });

        return {
            loading:true,
        };
    },

    render: function() {
        return <div></div>;
    }
});

export default Startup
