import React from 'react';
import { TableOfContents } from 'app/pages/Manual/Components';
import NeatManual from 'app/pages/Manual/NeatManual';

/**
 * Route handler for rendering the Neat Manual.
 * @component
 * @exports Pages\Dashboard\Manual\Manual
 */
const Manual = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _scrollToAnchor: function() {
        var anchor = this.props.params.section;
        if (!anchor || anchor === 'top'){
            return;
        } else {
            var element = document.getElementById(anchor);
            if (element) {
                element.scrollIntoView();
                window.scrollBy(0, -80);
            }
        }
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    propTypes: {
        params: React.PropTypes.object,
    },

    componentDidMount: function() {
        var self = this;

        setTimeout(function () {
            self._scrollToAnchor();
        }, 10);
    },

    componentDidUpdate: function () {
        var self = this;

        setTimeout(function () {
            self._scrollToAnchor();
        }, 10);
    },

    render: function() {
        var manual = NeatManual();

        return (
            <div className='container'>
                <TableOfContents>
                    {manual}
                </TableOfContents>

                {manual}
            </div>
        );
    },

});

export default Manual;
