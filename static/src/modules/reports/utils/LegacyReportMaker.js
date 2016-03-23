import React from 'react';
import _ from 'lodash';
import { Table, Link as DynamicLink } from 'reports/components/charts/Widgets';
import LegacyReports from 'reports/pages/report-pages/LegacyReports';
import StandardBlurbs from 'reports/components/StandardBlurbs';
import { makeReport } from 'reports/utils/ReportHelper';

let result = {};

_.forEach(LegacyReports, reportParams => {
    if (reportParams.forceUpgrade) {
        delete reportParams.query;
        delete reportParams.summary;
    }

    if (!reportParams.meta) {
        reportParams.meta = [];
    }

    reportParams.meta.push('legacy');

    if (!_.isArray(reportParams.summary)) {
        reportParams.summary = [reportParams.summary];
    }

    if (!reportParams.query) {
        reportParams.summary.push('This report was not directly ported from NEAT2.');
    } else {
        reportParams.summary.push(StandardBlurbs.corrected);
        reportParams.summary.push(StandardBlurbs.legacy());
    }

    // Add upgrade suggestion.
    if (reportParams.upgrade) {
        let
            summary = reportParams.summary,
            upgrade = reportParams.upgrade;

        if (!_.isArray(upgrade)) {
            upgrade = [upgrade];
        }

        summary.push(<p />);
        summary.push('We recommend switching your analysis to ');

        for (var i = 0; i < upgrade.length; i++) {
            if (upgrade.length > 1) {
                if (i == upgrade.length - 1) {
                    summary.push(' and ');
                } else if (i !== 0) {
                    summary.push(', ');
                }
            }

            if (_.isObject(upgrade[i])) {
                summary.push(upgrade[i]);
            } else if (_.isString(upgrade[i])) {
                summary.push(<DynamicLink linking_to={upgrade[i]} />);
            }
        }

        summary.push('.');
    }

    if (!reportParams.query) {
        reportParams.render_ = function() { <div /> };
    } else {
        reportParams.render_ = function() {
            var tbl = reportParams.query({});
            var tableTitle = reportParams.displayName + ' Data';

            return (
                <div>
                    <Table query={tbl} title={tableTitle} summary={StandardBlurbs.soloTable} />
                </div>
            );
        };
    }

    var report = makeReport(reportParams);
    result[report.urlName] = report;
});

export default result;
