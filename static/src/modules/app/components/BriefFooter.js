import React from 'react';

/**
 * Components that renders a mini NEAT footer. It doesn't do much else
 * except display a title for NEAT.
 * @component
 * @exports lib\Components\BriefFooter
 */
const BriefFooter = React.createClass({

    render: function() {
        return (
            <footer className="brief-footer flex-center">
                <h4>The National Exam Analytics Tool</h4>
            </footer>
        );
    }
});

export default BriefFooter;
