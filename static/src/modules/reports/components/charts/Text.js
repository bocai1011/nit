import React from 'react';
import ChartMixin from 'reports/components/charts/ChartMixin';
import ReportNavigation from 'reports/components/ReportNavigation';

/**
 * Component for rendering a Text plot widget.
 * @component
 * @exports lib\Components\Charts\Text
 */
const Text = React.createClass({
    displayName: 'Text',
    mixins: [ReportNavigation, _.omit(ChartMixin, ['render', 'createChart'])],

    createChart: () => {},

    getDefaultProps: function() {
        return {
            format: x => x,
            prefix: ''
        }
    },

    render: function() {
    	var self = this;
        if (self.props.children) {
            return (
                <div>{self.props.children}</div>
            );
        } else {
            if (self.state.loading) {
                return (
                    <span>loading...</span>
                );
            }
            return (
                <span>{self.props.prefix + self.props.format(self.state.data)}</span>
            );
        }
    },

    truncate: function(state) {
        return state.data;
    }
});

export default Text;
