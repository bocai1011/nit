import React from 'react';
import _ from 'lodash';
import ChartMixin from 'reports/components/charts/ChartMixin';
import ReportNavigation from 'reports/components/ReportNavigation';
import util from 'common/utils/util';
import { widgetLink } from 'reports/utils/ReportHelper';

/**
 * Component for rendering a Link plot widget.
 * @component
 * @exports lib\Components\Charts\Link
 */
const Link = React.createClass({
    displayName: 'Link',
    mixins: [ReportNavigation, _.omit(ChartMixin, ['render', 'createChart'])],

    createChart: () => {},

    getDefaultProps: function() {
        return {
            query: ' ',
        };
    },

    render: function() {
    	var self = this;
        var text;

        if (self.props.children) {
            text = self.props.children;
        } else if (self.state.loading) {
            return (
                <span>loading...</span>
            );
        } else if (self.state.data === ' ') {
            text = self.props.linking_to;
        } else if (self.state.data || (self.state.data === 0)) {
            text = self.state.data;
        } else if (self.props.rowID || (self.props.rowID === 0)) {
            text = self.props.rowID;
        }
        if (self.state.args && self.state.args.mapping && _.has(self.state.args.mapping, self.state.args.title)) {
            text = self.state.args.mapping[self.state.args.title][text] || text;
        }

        var style = {
            cursor:'pointer'
        };

		return (
			<a style={style} onClick={function() {
				if (self.state.url) {
					util.transitionTo(self.state.url)
				}

                else if (self.props.rowID) {
                    var temp = {};
                    temp[self.state.args.link_value[0][0]] = self.props.rowID;
                    var foo = {};
                    foo[self.state.args.link_ref[0]] = temp;
                    widgetLink(self.state.args.linking_to, foo)
                }

                else if (self.state.args.link_value) {
                    var temp = {};
                    if (self.state.args.link_argument) {
                        temp[self.state.args.link_value[0][0]] = self.state.args.link_argument[0][0];
                    } else {
                        temp[self.state.args.link_value[0][0]] = self.state.data[0];
                    }
                    var foo = {};
                    foo[self.state.args.link_ref[0]] = temp;
                    widgetLink(self.state.args.linking_to, foo)
                }

                else {
                    var foo = {};
                    widgetLink(self.state.args.linking_to, foo)
                }
			}}>{text}</a>
		);
    },

    truncate: function(state) { return state.data; }
});

export default Link;
