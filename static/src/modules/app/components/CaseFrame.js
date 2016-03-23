import React from 'react';
import { RouteHandler, Navigation } from 'react-router';
import MenuBar from 'common/components/MenuBar/MenuBar';
import NeatApp from 'app/utils/NeatApp';

/**
 * Route handler for rendering the Case Frame. The CaseFrame is the top
 * level handler for all case pages. It's job is to ensure that a case is
 * open when one if its pages is accessed.
 * @component
 * @mixins [Navigation]
 * @exports Pages\Dashboard\Case\CaseFrame
 */
const CaseFrame = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _skipNav: function(e) {
        e.preventDefault();
        var mainContentDiv = this.refs.mainContent.getDOMNode();
        mainContentDiv.setAttribute('role', 'region');
        mainContentDiv.tabIndex='-1';
        mainContentDiv.focus();
        mainContentDiv.tabIndex = '';
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [Navigation],

    propTypes: {
        params: React.PropTypes.object,
    },

    getInitialState: function() {
        return {
            hasCase: false
        };
    },

    componentWillMount: function () {
        var name = this.props.params.name;
        var currentCase = NeatApp.getCurrentCase();

        if (currentCase === null || currentCase.name !== name) {
            this.transitionTo('open', { name: name });
        } else {
            this.setState({ hasCase: true });
        }
    },

    render: function() {
        if (!this.state.hasCase) {
            return <div className="container-fluid case-frame"></div>;
        }

        return (
            <div className="case-frame">
                <a
                    id="skipAnchor"
                    className="hide508"
                    href="#"
                    onClick={this._skipNav}
                >
                    skip navigation
                </a>
                <MenuBar />
                <RouteHandler ref="mainContent" {...this.props} />
            </div>
        );
    },
});

export default CaseFrame;
