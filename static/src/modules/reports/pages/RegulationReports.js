import React from 'react';
import { Navigation } from 'react-router';
import ReportList from 'reports/components/ReportList';
import Header from 'common/components/Header';

/**
 * Route handler for rendering the All Reports page.
 * @component
 * @exports reports\pages\RegulationReports
 */
const RegulationReports = React.createClass({
    mixins: [Navigation],

	render: function() {
        return (
            <div className={'staging-mixin'}>
                <Header helpBlurb='RegulationReports' isStaging={false}>
                    Regulations & Violations
                </Header>

                <div className='staging-mixin-body'>
                    <ReportList requiredTags={['regulation']} excludedTags={['legacy']} />
                </div>
            </div>
        );
    }
});

export default RegulationReports;
