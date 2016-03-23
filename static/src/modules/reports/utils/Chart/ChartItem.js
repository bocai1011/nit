/** @module reports/utils/Chart/ChartItem */

import React, { PropTypes } from 'react';
import keyUtils from 'common/utils/keyUtils';

/**
 * A wrapper for the list items in a <Chart/> dropdown.
 */
const ChartItem = React.createClass({

    _handleFocus: function () {
        window.addEventListener('keypress', keyUtils.respondToEnterKey);
    },

    _handleBlur: function () {
        window.addEventListener('keypress', keyUtils.respondToEnterKey);
    },

    render: function () {
        return (
            <li
                onBlur={this._handleBlur}
                onFocus={this._handleFocus}
                tabIndex='0'
                {...this.props}
            >
                <a tabIndex='-1'>{ this.props.children }</a>
            </li>
        );
    },

});

export default ChartItem;
