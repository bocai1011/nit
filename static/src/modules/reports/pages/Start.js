import React from 'react';
import ReportButton from 'reports/components/ReportButton';
import Header from 'common/components/Header';

/**
 * Route handler for rendering the Report List page.
 * @component
 * @exports Pages\Dashboard\Case\ReportList
 */
const ReportsStart = React.createClass({
	render: function() {
        return (
            <div className='staging-mixin'>
                <Header helpBlurb='Reports' isStaging={false}>
                    Neat Reports
                </Header>

                <div className='staging-mixin-body'>
                    <div className='flex-grid'>
                        <ReportButton
                            title='Quick Analysis'
                            report='Quick-Analysis'
                        >
                            <p>
                                Start here to get a quick and dirty
                                automated analysis of potential anomolies.
                            </p>
                        </ReportButton>

                        <ReportButton
                            title='Regulations & Violations'
                            page='regulation-reports'
                        >
                            <p>
                                Interested in potential regulatory
                                violations? Start your analysis here.
                            </p>
                        </ReportButton>

                        <ReportButton
                            title='Jump Into The Data'
                            report='Jump-Into-the-Data'
                        >
                            <p>
                                Take a high level view of your case and
                                drilldown into the data as anomalies pique
                                your interest.
                            </p>
                        </ReportButton>

                        <ReportButton
                            title='All Reports'
                            page='all-reports'
                        >
                            <p>
                                Take a look at the full list of reports or
                                search for a particular report.
                            </p>
                        </ReportButton>

                        <ReportButton
                            title='Legacy Reports'
                            page='legacy-reports'
                        >
                            <p>
                                Miss a report from NEAT2? All the NEAT2
                                reports can be found here.
                            </p>
                        </ReportButton>
                    </div>
                </div>
            </div>
        );
    }
});

export default ReportsStart;
