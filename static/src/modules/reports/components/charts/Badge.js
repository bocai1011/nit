import React from 'react';
import { Label } from 'react-bootstrap';
import ChartMixin from 'reports/components/charts/ChartMixin';

const Badge = React.createClass({
    mixins: [ChartMixin],
    displayName: 'Badge',

    spec: {
        exports: ['png', 'csv', 'xlsx']
    },

    _createChart: () => {},

    customDiv: function (props, state) {
        var items = state.data.map( function(arg) {
            return (
                <div className="badgeListItem">
                    {arg[0]}:   <Label bsStyle="primary">{arg[1]}</Label>
                </div>
            );
        });
        return (
            <div className="badgeList">
                {items}
            </div>
        );
    },

    truncate: function(state) { return state.data; }

});

export default Badge;
