import React from 'react';
import _ from 'lodash';
import { Navigation } from 'react-router';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { reportList } from 'reports/utils/ReportHelper';
import NeatApp from 'app/utils/NeatApp';

/**
 * Helper function that returns true if any tag in a list is present in a
 * list of tags to search.
 * @param {array} listToSearch - An array of string tags to be searched for
 *     a match.
 * @param {array} listOfTags - An array of tags used for searching in the
 *     list.
 * @return {boolean} - Whether any of the list of tags exists in the list to
 *     search.
 */
function hasTagInList(listToSearch, listOfTags) {
    return listOfTags.some(tag => {
        return _.includes(listToSearch, tag);
    });
}

/**
 * Component for displaying a list of reports.
 * @component
 * @exports report\components\ReportList
 */
const ReportList = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Event for clicking on a report.
     * Transitions the application to that report page.
     * @param {string} name - The name of the report.
     */
    _onClick: function(report) {
        var caseName = NeatApp.getCurrentCase().name;
        this.transitionTo('report', {name: caseName, report: report});
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [Navigation],

    propTypes: {
        requiredTags: React.PropTypes.arrayOf(React.PropTypes.string),
        excludedTags: React.PropTypes.arrayOf(React.PropTypes.string),
        searchQuery: React.PropTypes.string,
    },

    getDefaultProps: function () {
        return {
            requiredTags: [],
            excludedTags: [],
            searchQuery: '',
        };
    },

	render: function() {

        let reportsToShow = reportList;

        let { requiredTags, excludedTags, searchQuery } = this.props;

        // Required tags overrule excluded tags.
        excludedTags = _.difference(excludedTags, requiredTags);

        // Filter out any reports that don't have any of the required tags,
        // if there are any.
        if (requiredTags.length) {
            reportsToShow = reportsToShow.filter(report => {
                let reportTags = report.meta;
                return hasTagInList(reportTags, requiredTags)
            });
        }

        // Filter out any reports that DO contain an excluded tag, if there
        // are any.
        if (excludedTags.length) {
            reportsToShow = reportsToShow.filter(report => {
                let reportTags = report.meta;
                return ! hasTagInList(reportTags, excludedTags);
            });
        }

        // Filter out any reports that don't match the search query typed
        // in by the User.
        if (searchQuery.length) {
            reportsToShow = reportsToShow.filter(report => {
                let name = report.displayName.toLowerCase();
                let query = searchQuery.toLowerCase();
                return _.includes(name, query);
            });
        }

        // Sort the reports to show and map them into React elements.
        const self = this;
        let items = _.sortBy(reportsToShow, 'displayName').map(report => {
            let { urlName, displayName, meta } = report;

            let tags = meta.map(function (tag) {
                tag = tag.split(' ').map(_.capitalize).join(' ');
                return (<span className='report-tag'>{ tag }</span>);
            });

            return (
                <ListGroupItem
                    onClick={self._onClick.bind(null, urlName)}
                    key={urlName}
                    aria-role='menuitem'
                    aria-label={urlName}
                >
                    <span className='report-name'>{ displayName }</span>
                    { tags }
                </ListGroupItem>
            );
        });

        return (
            <div className='report-list'>
                <ListGroup key={1}>
                    { items }
                </ListGroup>
            </div>
        );
    }
});

export default ReportList;
