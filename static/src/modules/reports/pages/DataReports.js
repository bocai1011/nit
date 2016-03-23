import React from 'react';
import { Navigation } from 'react-router';
import ReportList from 'reports/components/ReportList';
import Header from 'common/components/Header';

/**
 * Route handler for rendering the All Reports page.
 * @component
 * @exports reports\pages\DataReports
 */
const DataReports = React.createClass({
    mixins: [Navigation],

	render: function() {
        return (
            <div className={'staging-mixin'}>
                <Header helpBlurb='DataReports' isStaging={false}>
                    Jump Into The Data
                </Header>

                <div className='staging-mixin-body'>
                    <ReportList requiredTags={[]} excludedTags={['legacy', 'regulation']} />
                </div>
            </div>
        );
    }
});

export default DataReports;
