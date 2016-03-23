// Module for global JS unit test utilities

var NeatTestUtils = function(React) {

    return {
        renderWithContext: function(ComponentClass, opts) {
            var component;

            // Load default values
            if (opts === undefined) {
                var opts = {};
            }
            var currentParams = opts.currentParams || {};
            var routes = opts.routes || ['foo'];
            var props = opts.props || {};
            var goBack = opts.goBack || function() {};
            var transitionTo = opts.transitionTo || function() {};
            var currentPath = opts.currentPath || '/foo';

            // Use withContext to setup Router context mixins
            React.withContext({
                router: {
                    getCurrentRoutes: function() { return routes; },
                    getCurrentParams: function() { return currentParams; },
                    makeHref: function(s) { return s; },
                    isActive: function() { return true; },
                    goBack: goBack,
                    transitionTo: transitionTo,
                    replaceWith: function() { },
                    getCurrentPath: function() { return currentPath; },
                    getCurrentPathname: function() { },
                    getCurrentQuery: function() { },
                }
            }, function() {
                var div = document.createElement('div');
                var instance = React.createElement(ComponentClass, props);

                // Render the react component
                component = React.render(instance, div);
            });

            return component;
        },

        // Helper to add fields to a stubbed-app object (like on that
        // is returned from NeatApp.getApp()) to help rendering HelpBlurb
        stubForHelpBlurb: function(stubApp) {
            if (stubApp === undefined) {
                stubApp = {};
            }
            if (stubApp.NeatOptions === undefined) {
                stubApp.NeatOptions = {};
            }
            stubApp.NeatOptions.RemoveNotes = { value: false };
            stubApp.NeatOptions.Debugging = { value: false };
            return stubApp;
        },

        stubCurrentCase: function(NeatApp, opts) {
            var currentCase = {
                status: 'unlocked',
                name: 'testcase-unlocked',
                stagingFiles: [{ file: ['C:/fakepath/trade_blotter.csv'], success: false }],
                stagingPhases: _.map(_.range(6), function(stage) {
                    return { statusCode: 'complete' };
                })
            };

            if (opts !== undefined) {
                currentCase = _.assign(currentCase, opts);
            }

            NeatApp.setCurrentCase(currentCase);
            return currentCase;
        },

        unsetCase: function(NeatApp) {
            NeatApp.setCurrentCase(null);
        },

        /**
         * Provide ability to pass in whatever parent object to render into.
         * Very similar to TestUtils.renderIntoDocument, see:
         *   https://github.com/facebook/react/blob/v0.13.3/src/test/ReactTestUtils.js#L45
         */
        renderIntoDocument: function(el, instance) {
            // var div = document.createElement(tagName);
            return React.render(instance, el);
        },

        /**
         * Accept an array of React components and returns the first one which
         * which contains a portion of matching textContent
         */
        filterByTextContent: function(components, textContent) {
            var filtered = components.filter(function(c) {
                return (c.getDOMNode().textContent.indexOf(textContent) !== -1);
            });
            return filtered[0];
        }
    }
};
