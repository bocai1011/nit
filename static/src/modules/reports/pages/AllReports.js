import React from 'react';
import { Navigation } from 'react-router';
import { Grid, Row, Col, Input } from 'react-bootstrap';
import { tagSet } from 'reports/utils/ReportHelper';
import ReportList from 'reports/components/ReportList';
import Header from 'common/components/Header';

/**
 * Route handler for rendering the All Reports page.
 * @component
 * @exports reports\pages\AllReports
 */
const AllReports = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    /**
     * Callback to fire when User enters text into the search box above the
     * list of reports.
     * ~ CHANGES COMPONENT STATE ~
     * ~ Modifies the state-stored report search query.
     * @param {object} e - The event object fired by the change event fired
     *   by the search box Input.
     */
    _searchReports: function (e) {
        this.setState({
            searchQuery: e.target.value,
        });
    },

    /**
     * Callback to fire when the User selects a tag from the list of tags
     * for filter the report list.
     * ~ CHANGES COMPONENT STATE ~
     * ~ Adds the selected tag to the state tracking all selected tags.
     * @param {string} tag - The name of the tag clicked on.
     * @param {object} e - The event object fired by clicking or keying
     *   down on the tag.
     */
    _selectTag: function (tag, e) {

        // Allow user to select a tag filter by tabbing to it and pressing
        // enter.
        let isKeyDown = e && e.type === 'keydown';
        let keyCode = isKeyDown && (e.which || e.keyCode);
        if (isKeyDown && keyCode !== 13) {
            return;
        }

        if (_.includes(this.state.selectedTags, tag)) {
            this.setState({
                selectedTags: _.without(this.state.selectedTags, tag),
            })
        } else {
            this.setState({
                selectedTags: this.state.selectedTags.concat(tag),
            });
        }
    },

    /**
     * Callback to fire when the User clicks the button to unselect all
     * selected tags.
     * ~ CHANGES COMPONENT STATE ~
     * ~ Empties the state-stored list of selected tags.
     * @param {object} e - The event fired by clicking or keying down on the
     *   "Clear selected tags" button.
     */
    _clearSelectedTags: function (e) {

        // Allow user to clear selected tags by tabbing to the button and
        // pressing enter.
        let isKeyDown = e && e.type === 'keydown';
        let keyCode = isKeyDown && (e.which || e.keyCode);
        if (isKeyDown && keyCode !== 13) {
            return;
        }

        this.setState({
            selectedTags: [],
        });
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [ Navigation ],

    getInitialState: function () {
        return {
            searchQuery: '',
            selectedTags: [],
        };
    },

	render: function () {

        // Get and sort the set of tags from the helper (which is stored) as
        // a JavaScript Set.
        let tags = Array.from(tagSet).sort();

        // Render the tags as a list of <li>'s.
        const self = this;
        tags = tags.map((tag, i) => {

            // Capitalize each word in the tag name.
            let capTag = tag.split(' ').map(_.capitalize).join(' ');

            // If the tag is a selected tag, give it a selected className.
            let className = 'tag';
            if (_.includes(this.state.selectedTags, tag)) {
                className += ' selected';
            }

            return (
                <li
                    onClick={self._selectTag.bind(null, tag)}
                    onKeyDown={self._selectTag.bind(null, tag)}
                    className={className}
                    key={`tag-${i}`}
                    tabIndex='0'
                >
                    { capTag }
                </li>
            );
        });

        // Create a button to clear all selected tags. It should be hidden
        // when no tags are selected.
        let viz = this.state.selectedTags.length ? 'visible' : 'hidden';
        let linkToClearSelectedTags = (
            <a
                onClick={this._clearSelectedTags}
                onKeyDown={this._clearSelectedTags}
                className='clear-selected-tags'
                style={{ visibility: viz }}
                tabIndex='0'
            >
                <i className='fa fa-times' />Clear all selected
            </a>
        );

        return (
            <div className='staging-mixin'>
                <Header helpBlurb='Reports' isStaging={false}>
                    All Reports
                </Header>

                <Grid className='staging-mixin-body'>
                    <Row>
                        <Col xs={3} className='report-tags'>
                            <h3>Filter reports by tag</h3>
                            { linkToClearSelectedTags }
                            <ul>
                                { tags }
                            </ul>
                        </Col>
                        <Col xs={9}>
                            <Input
                                type='text'
                                placeholder='Search for a report'
                                onChange={this._searchReports}
                                addonAfter={<i className='fa fa-search'/>}
                                standAlone
                            />
                            <ReportList
                                requiredTags={this.state.selectedTags}
                                excludedTags={['legacy', 'neat']}
                                searchQuery={this.state.searchQuery}
                            />
                        </Col>
                    </Row>
                </Grid>
            </div>
        );
    }
});

export default AllReports;
