import _ from 'lodash';
import $ from 'jquery';
import util from 'common/utils/util';
import React from 'react';
import { ButtonGroup } from 'react-bootstrap';
import NeatApp from 'app/utils/NeatApp';
import MappableWidget from 'staging/components/MappableWidget/MappableWidget';
import StatusLabel from 'staging/components/StatusLabel';
import StagingMixin from 'staging/utils/StagingMixin';
import ButtonReference from 'common/components/ButtonReference';
import AppButton from 'common/components/AppButton';
import q from 'common/utils/queryFactory';
import { Table, ReportPanel } from 'reports/components/charts/Widgets';

/**
 * Component for rendering the UI for handling the Interpretation stage.
 * @component
 * @exports lib\Components\Staging\Interpretation
 */
const Interpretation = React.createClass({

    /**
     * Custom Methods
     * --------------------------------------------------------------------
     */

    _getInterperables: function() {
        var self = this;
        util.get('/get_interpretation_tables/' + NeatApp.getCurrentCase().name,
            function (res) {
                self.interp = res;
                NeatApp.setInterpData(self.interp);
                self.setState({
                    loading: false,
                    tables:self.interp.data.tables,
                    options:self.interp.data.options
                });
            }
        );
    },

    _setInterperables: function() {
        NeatApp.setInterpData(this.interp);
        this.forceUpdate();
    },

    _confirm: function() {
        var self = this;
        NeatApp.interpChanged();
        util.post('/set_interpretation_tables/' + NeatApp.getCurrentCase().name,
            this.interp,
            function () {
                NeatApp.markInterpComplete();
                self.forceUpdate();
            }
        );
    },

    _isValid: function() {
        return _.every(this.state.tables, function(table) {
            return _.every(table.pandas.values, function(row) {
                return !!row.code;
            })
        });
    },

    /**
     * Find Interpretation sections where all records have been excluded by
     * the user. Note that some sections have hidden defaults, e.g.
     * initial_position has a default side
     *   @returns {array} section names as strings
     */
    _getAllExcludedTbls: function() {
        var self = this;
        return _.filter(Object.keys(this.state.tables), function(tablekey) {
            return _.every(self.state.tables[tablekey].pandas.values, function(row) {
                return row.code === NeatApp.EXCLUDE_CODE;
            })
        });
    },

    _reset: function () {
        NeatApp.interpChanged();
        this._getInterperables();
        this.setState({loading: true});
    },

    /**
     * Staging Mixin Methods
     * --------------------------------------------------------------------
     */

    renderStatus: function() {
        if (this._isValid() && NeatApp.interpCompleted()) {
            return (
                <StatusLabel status='success'>
                    All values have been mapped.
                    Press <ButtonReference name='Next' /> to continue.
                </StatusLabel>
            );
        } else if (this._isValid()) {
            return (
                <StatusLabel status='ready'>
                    Please review the interpretation of registrant data below.
                    If it is correct press <ButtonReference name='InterpretationConfirm' />.
                </StatusLabel>
            );
        } else {
            return (
                <StatusLabel status='info'>
                    Some values have not been interpreted.
                    Please review the choices highlighted in red.
                </StatusLabel>
            );
        }
    },

    renderControls: function() {
        var confirmGuard = this.guardLock();
        if (!confirmGuard && !this._isValid()) {
            confirmGuard = {
                title: 'Unmapped values',
                body: 'There are unmapped values. Please review the items highlighted in red.'
            };

        } else if (!confirmGuard) {
            let allExcludedTbls = this._getAllExcludedTbls();
            if (allExcludedTbls.length > 0) {
                let niceTbls = _.map(allExcludedTbls, NeatApp.getNiceName);
                confirmGuard = {
                    title: 'All records excluded',
                    body: ('Cannot exclude all records, please review ' +
                        'mappings in the following section(s): ' +
                        niceTbls.join(', '))
                };
            }
        }

        var resetGuard = this.guardLock();

        return (
            <ButtonGroup>
                <AppButton
                    name='InterpretationConfirm'
                    onClick={this._confirm}
                    tooltip='Confirm your choices.'
                    guard={confirmGuard}
                />
                <AppButton
                    name='InterpretationReset'
                    onClick={this._reset}
                    tooltip="Reset your choices to NEAT&#39;s original best guesses."
                    confirm="Are you sure you want to reset the interpretation mappings?
                             You will lose your work done on this page."
                    guard={resetGuard}
                />
            </ButtonGroup>
        );
    },

    renderBody: function() {
        var self = this;
        var body = [];
        var summary=(
            <div>
                The <em>Excluded Transactions</em> report summarizes excluded transactions (if any).
                Transactions can be excluded for the following reasons:
                <ol>
                    <li>They have zero price or quantity; or</li>
                    <li>They are cancelled transactions (both the original and the corresponding cancel will be excluded).</li>
                </ol>
            </div>
        );

        if (this._isValid() && NeatApp.interpCompleted()) {
            var zeros = q.stagings.get_interp_excld_transactions({});

            var wtable = (
                <Table
                    query={zeros}
                    title='Excluded'
                    options={{gridHeight:220}}
                    map_oids={false}
                    summary={summary}
                />
            );

            var exclusion_note = (
                <p>
                    NEAT automatically removes canceled transactions from the transaction table.
                    Transactions with a price or quantity of zero are also removed.
                </p>
            );

            var rp = (
                <ReportPanel
                    header='Excluded Transactions'
                    waitFor={zeros}
                    open={true}
                    collapse
                    danger={data => data.values.length > 0}
                    render={data => {
                        if (data.values.length > 0) {
                            return (
                                <div>
                                    {exclusion_note}
                                    <p>
                                        Below we present all transactions removed from the transaction table.
                                    </p>
                                    {wtable}
                                </div>
                            );
                        } else {
                            return (
                                <div>
                                    {exclusion_note}
                                    <p>
                                        In the current data no canceled or zero trade were found,
                                        so no transactions have been automatically removed.
                                    </p>
                                </div>
                            );
                        }
                    }}
                />
            );

            body.push({rp});
        }

        var i = 0;
        $.each(this.state.tables, function(key, table) {
            var values = table.pandas.values;
            var options = self.state.options[key];

            body.push(
                <MappableWidget
                    header={key}
                    values={values}
                    options={options}
                    onSelect={self._setInterperables}
                    key={i}
                />
            );

            ++i;
        });

        return body;
    },

    /**
     * React Methods
     * --------------------------------------------------------------------
     */

    mixins: [StagingMixin],

    getDefaultProps: function() {
        return {
            name: 'Interpretation',
            title: 'Interpretation',
            stage: 'Interpretation',
        };
    },

    getInitialState: function() {
        if (this._guardActive()) {
            return { };
        }

        if (NeatApp.getInterpData()) {
            this.interp = NeatApp.getInterpData();
            return {
                loading: false,
                tables:this.interp.data.tables,
                options:this.interp.data.options
            };

        } else {
            this._getInterperables();
            return {
                loading: true,
            };
        }
    },

});

export default Interpretation;
