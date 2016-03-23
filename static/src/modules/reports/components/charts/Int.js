import React from 'react';
import Text from 'reports/components/charts/Text';

/**
 * Component for rendering a Text plot widget with integer value formatting.
 * @component
 * @exports lib\Components\Charts\Int
 */
const Int = React.createClass({
    getDefaultProps: function() {
        return {
            format: x => x.toFixed(0),
        }
    },

    render: function() {
        return <Text {...this.props} />;
    },
});

export default Int;
