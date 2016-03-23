import React from 'react';
import { Navigation } from 'react-router';
import ReportList from 'reports/components/ReportList';
import Header from 'common/components/Header';

/**
 * Route handler for rendering the All Reports page.
 * @component
 * @exports reports\pages\LegacyReports
 */
const LegacyReports = React.createClass({
    mixins: [Navigation],

	render: function() {
        return (
            <div className={'staging-mixin'}>
                <Header helpBlurb='LegacyReports' isStaging={false}>
                    Legacy Reports
                </Header>

                <div className='staging-mixin-body'>
                    <ReportList requiredTags={['legacy']} excludedTags={[]} />
                </div>
            </div>
        );
    }
});

export default LegacyReports;
