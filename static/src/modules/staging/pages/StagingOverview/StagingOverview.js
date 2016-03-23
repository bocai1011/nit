import React from 'react';
import { Navigation } from 'react-router';
import NeatApp from 'app/utils/NeatApp';
import StagingMixin from 'staging/utils/StagingMixin';
import StagingPhase from 'staging/pages/StagingOverview/StagingPhase';

const { PhaseInfo } = NeatApp;

/**
 * Component for rendering the UI for Staging Overview.
 * @component
 * @exports lib\Components\Staging\StagingOverview
 */
const StagingOverview = React.createClass({

    /**
     * Staging Mixin Methods
     * --------------------------------------------------------------------
     */

    renderStatus: function() { return null; },
    renderControls: function() { return null; },

    renderBody: function() {
        NeatApp.updateStagingStatus({ update:false });

        var phases = NeatApp.getCurrentCase().stagingPhases;

        return phases.map(function(phase, i) {
            return (
                <StagingPhase phase={phase} info={PhaseInfo[i]} key={i}/>
            );
        });
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [StagingMixin, Navigation],

    getDefaultProps: function() {
        return {
            name: 'StagingProcess',
            title: 'Staging Overview'
        };
    },

    componentWillMount: function() {
        NeatApp.updateStagingStatus({ update:false });
        NeatApp.saveCurrentCase();
    },

});

export default StagingOverview;
