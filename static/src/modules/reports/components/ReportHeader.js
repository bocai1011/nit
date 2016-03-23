import React from 'react';
import { PageHeader } from 'react-bootstrap';
import _ from 'lodash';

/**
 * Report Header.
 * @component
 * @exports reports\components
 */
const ReportHeader = React.createClass({

    propTypes: {
        tags: React.PropTypes.arrayOf(React.PropTypes.string),
    },

    render: function() {

        let { tags } = this.props;
        if (tags && !_.isEmpty(tags)) {
            tags = tags.map(tag =>
                <span className='report-tag'>
                    { tag.split(' ').map(_.capitalize).join(' ') }
                </span>
            );

            tags = (<div className='report-tags'>{ tags }</div>)
        }

        return (
            <PageHeader className='report-header'>
                { this.props.children }
                { tags }
            </PageHeader>
        );
    },
});

export default ReportHeader;
