import React from 'react';
import { Navigation } from 'react-router';
import { PageHeader, Panel } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import _ from 'lodash';
import util from 'common/utils/util';
import AppButton from 'common/components/AppButton';

/**
 * Route handler for rendering the CaseOverview page.
 * This page shows basic statistics about the current case.
 * @component
 * @exports Pages\Dashboard\Case\CaseOverview
 */
const CaseOverview = React.createClass({
    _unlockCase: function() {
        var self = this;
        NeatApp.unlockCase()
        .then(function (){
            self.transitionTo('overview', {name: NeatApp.caseName()});
        });
    },
    renderControls: function() {
        var confirm;
        if (NeatApp.finalized()) {
            confirm = ('This is a locked case. Unlocking it will create a new version ' +
                       'of the case and require it to be staged again. Please do not unlock ' +
                       'the case unless you intend to re-stage it.  Are you sure you want to continue?');
        }

        return <AppButton
                   name="UnlockCase"
                   disabled={!NeatApp.isLocked()}
                   onClick={this._unlockCase}
                   tooltip='Click to unlock the case for re-staging.'
                   confirm={confirm}
                 />;

    },

    mixins: [Navigation],

    render: function () {
        let currentCase = NeatApp.getCurrentCase();
        let controls = this.renderControls();
        let isLocked = currentCase.status === 'locked';
        let lockedIconClass = isLocked ? 'fa fa-lock' : 'fa fa-unlock';

        // Parse dates from current case if necessary.
        let { update, create } = currentCase;

        if (! _.isDate(update)) {
            update = util.ParseDate(update);
        }

        if (! _.isDate(create)) {
            create = util.ParseDate(create);
        }

        return (
            <div className='case-overview'>
                <PageHeader>
                    {currentCase.base}{' '}
                    <i className={lockedIconClass}></i>
                    <div className='flex-center-vert float-right'>
                        { controls }
                    </div>
                </PageHeader>
                <Panel header={<h1><b>Created</b></h1>} bsStyle="success">
                    <b>{ create.toDateString() },</b>
                    { ' ' + create.toTimeString() }
                </Panel>

                <Panel header={<h1><b>Finalized</b></h1>} bsStyle="success">
                    <b>{ update.toDateString() },</b>
                    { ' ' + update.toTimeString() }
                </Panel>
            </div>
        );
    }
});

export default CaseOverview;
