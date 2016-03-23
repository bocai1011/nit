import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import { Button, Panel, Glyphicon } from 'react-bootstrap';
import AppButton from 'common/components/AppButton';
import ManLink from 'common/components/ManLink';
import LoadingIcon from 'common/components/LoadingIcon';
import OptionsForm from 'common/components/OptionsForm';
import ReferenceData from 'staging/services/ReferenceData';

const controlGroupNames = {
    UNIVERSAL: 'Universal adjustment',
    PRICE: 'Price-only adjustment',
    NOTIONAL: 'Notional-only adjustment'
};

const optionDefs = {
    adjfactor: {
        label: 'Apply Adjustment Factor',
        group: controlGroupNames.UNIVERSAL,
        order: 1
    },
    adjfactor_registrant_provided: {
        label: 'Use registrant-provided adjustment factor',
        labeloff: 'Use Interactive Data adjustment factor',
        group: controlGroupNames.UNIVERSAL,
        type: 'radio',
        dependsOn: 'adjfactor',
        order: 2
    },
    fxrate_to_usd: {
        label: 'Convert Local to USD',
        group: controlGroupNames.UNIVERSAL,
        order: 3
    },
    crncy_mult_for_price: {
        label: 'Apply Currency Multiplier for Price',
        group: controlGroupNames.PRICE,
        order: 4,
        _shouldDisplay: function() {  // `this` is bound in component mount
            return (this.props.displayPriceOpts &&
                    this.props.displayCrncyMult);
        }
    },
    crncy_mult_for_notional: {
        label: 'Apply Currency Multiplier for Notional',
        group: controlGroupNames.NOTIONAL,
        order: 5,
        _shouldDisplay: function() {  // `this` is bound in component mount
            return (this.props.displayNotionalOpts &&
                    this.props.displayCrncyMult);
        }
    },
    notional_mult_registrant_provided: {
        label: 'Apply registrant-provided Notional Multiplier',
        group: controlGroupNames.NOTIONAL,
        order: 6,
        _shouldDisplay: function() {  // `this` is bound in component mount
            return this.props.displayNotionalOpts;
        }
    }
};

const RDOs = React.createClass({

    //
    // Custom methods
    //

    _queryRDOs: function() {
        var self = this;
        var oids = this.props.securityOids;

        if (oids.length < 1) {
            return;
        }

        if (oids.length > 1) {
            var rdos = _.reduce(optionDefs, function(result, val, key) {
                result[key] = null;
                return result;
            }, {});
            self.setState({rdos: rdos});
            return;
        }

        self.setState({loading: true});
        ReferenceData.getRDOs(oids[0])
        .done(function(data) {
            // this is just a simple filtering
            var rdos = _.pickBy(data, function(val, key) {
                return _.has(optionDefs, key);
            });
            self.setState({
                rdos: rdos,
                loading: false
            });
        })
        .always(function() {
            self.setState({loading: false});
        });
    },

    _commitRDOs: function() {
        var self = this;
        var securityOids = this.props.securityOids;

        // filter RDOs that are null, bail if nothing to save
        var rdos = _.omitBy(this.state.rdos, _.isNull);
        if (_.isEmpty(rdos)) {
            return;
        }

        self.setState({loading: true});
        ReferenceData.setCollection(securityOids, {rdos: rdos})
        .done(function() {
            self.props.onChange(securityOids);
            self.setState({panelExpanded: false});
        })
        .always(function() {
            self.setState({loading: false});
        });
    },

    _handleOptionChange: function(key) {
        var rdos = this.state.rdos;
        rdos[key] = !rdos[key];
        this.setState({rdos: rdos});
    },

    //
    // React lifecycle methods
    //

    getInitialState: function() {
        return {
            loading: false,
            rdos: {},
            panelExpanded: false
        };
    },

    getDefaultProps: function() {
        return {
            displayPriceOpts: true,
            displayNotionalOpts: true,
            displayCrncyMult: true,
            onChange: function() {}
        };
    },

    propTypes: {
        securityOids: React.PropTypes.arrayOf(React.PropTypes.number).isRequired,
        onChange: React.PropTypes.func
    },

    componentDidUpdate: function(pp, ps) {
        var self = this;

        var securityOidsChanged = (
            pp.securityOids !== this.props.securityOids);

        var panelExpanded = (
            !ps.panelExpanded && this.state.panelExpanded);

        if (securityOidsChanged || panelExpanded) {
            this._queryRDOs();
        }

        // Set indeterminate state explicitly, react does not provide a
        // better way, see https://github.com/facebook/react/issues/1798
        var panelForm = this.refs.panelForm;
        if (panelForm) {
            $(panelForm.getDOMNode()).find('input[type="checkbox"]').each(
                function(i, checkbox) {
                    if (self.state.rdos[checkbox.id] === null) {
                        checkbox.indeterminate = true;
                    }
                }
            );
        }
    },

    componentDidMount: function() {
        this._queryRDOs();
    },

    render: function() {

        var self = this;

        // bind the option shouldDisplay functions to the react component
        _.forEach(optionDefs, function(def) {
            if (def._shouldDisplay !== undefined) {
                def.shouldDisplay = _.bind(def._shouldDisplay, self);
            }
        });

        var controls = OptionsForm.makeControls(
            self.state.rdos, optionDefs, self._handleOptionChange);

        var manLink = (
            <div className='symbol-deep-dive-rdos-man-link'>
                <ManLink to='staging-symbols-security-adjustments'>
                    <Glyphicon glyph='question-sign'
                        title='Click for help'/>
                </ManLink>
            </div>
        );

        var panelBody = (
            <div>
                <form className='symbol-deep-dive-rdos-form form-horizontal'
                    ref='panelForm'>
                    {controls}
                    <div className="form-group">
                        <Button onClick={this._commitRDOs}>
                            Save
                        </Button>
                    </div>
                </form>
                {manLink}
            </div>
        );

        if (this.state.loading) {
            panelBody = <LoadingIcon/>;
        }

        return (
            <div className='symbol-deep-dive-rdos'>
                <AppButton name='RDOs'
                    bsStyle='primary'
                    onClick={function() {
                        self.setState({ panelExpanded: !self.state.panelExpanded });
                    }}/>
                <Panel collapsible expanded={this.state.panelExpanded}>
                    {panelBody}
                </Panel>
            </div>
        );
    }
});

export default RDOs;
