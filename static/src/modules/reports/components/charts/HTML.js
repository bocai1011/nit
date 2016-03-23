import React from 'react';
import _ from 'lodash';
import ChartMixin from 'reports/components/charts/ChartMixin';

export default React.createClass({
    mixins: [_.omit(ChartMixin, 'getInitialState')],
    displayName: "HTML",

    _createChart: () => {},

    getInitialState: function(props) {
        return {loading: false}
    },

    customDiv: function(props, state) {
        return (
            <div>
                {this.props.children}
            </div>
        );
    }
});
