import React from 'react';
import MarketingFooter from 'app/components/MarketingFooter';

/**
 * Route handler for rendering the About page.
 * @component
 * @exports Pages\Dashboard\About
 */
const AboutPage = React.createClass({

    render: function() {

        return (
            <div className="aboutPage container">
                <MarketingFooter />
            </div>
        );
    }
});

export default AboutPage;
