import React from 'react';
import { RouteHandler } from 'react-router';
import MarketingFooter from 'app/components/MarketingFooter';
import BriefFooter from 'app/components/BriefFooter';
import MenuBar from 'common/components/MenuBar/MenuBar';

/**
 * Route handler for rendering the dashboard's frame.
 * @component
 * @exports Pages\Dashboard\DashboardFrame
 */
const DashboardFrame = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _skipNav: function(e) {
        e.preventDefault();
        var mainContentDiv = this.refs.mainContent.getDOMNode();
        mainContentDiv.id = 'mainContent';
        mainContentDiv.setAttribute('role', 'main');
        mainContentDiv.tabIndex='-1';
        mainContentDiv.focus();
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        hasAbout: React.PropTypes.bool,
        isManual: React.PropTypes.bool,
        marketing: React.PropTypes.bool,
    },

    getDefaultProps: function() {
        return {
            hasAbout: true,
            isManual: false,
            marketing: true,
        };
    },

    render: function() {
        console.log(this.props);
        var dashboardClasses = ['dashboard'];
        if (this.props.isManual) {
            dashboardClasses.push('manual');
        }

        if (this.props.marketing) {
            dashboardClasses.push('marketing');
        }

        var dashboardClass = dashboardClasses.join(' ');

        return (
            <div id="dashboard" className={dashboardClass}>
                <a
                    id="skipAnchor"
                    className="hide508"
                    href="#"
                    onClick={this._skipNav}
                >
                    Skip<br />Navigation
                </a>
                <MenuBar {...this.props} />
                <RouteHandler ref="mainContent" {...this.props} />
                {
                    this.props.marketing ?
                        <MarketingFooter /> :
                        <BriefFooter />
                }
            </div>
        );
    }
});

export default DashboardFrame;
