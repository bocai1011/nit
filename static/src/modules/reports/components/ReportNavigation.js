import { Navigation } from 'react-router';
import NeatApp from 'app/utils/NeatApp';

/**
 * Mixin for allowing easy navigation to report pages.
 * @mixin
 * @exports lib\Components\ReportNavigation
 */
const ReportNavigation = {
    mixins: [ Navigation ],

    transitionToReport: function (info) {
        var link = NeatApp.reportLink(info);

        this.transitionTo('report', link.params, link.query);
    },
};

export default ReportNavigation;
