import $ from 'jquery';
import _ from 'lodash';
import React from 'react';
import { Alert, Button, TabbedArea, TabPane } from 'react-bootstrap';
import util from 'common/utils/util';
import LoadingIcon from 'common/components/LoadingIcon';
import ReferenceData from 'staging/services/ReferenceData';
import RDOs from 'staging/pages/Symbols/RDOs';
import Highcharts from 'highcharts/highstock';
import HCMore from 'highcharts/highcharts-more';

// Required to render the necessary 'arearange' charts below.
HCMore(Highcharts);

// list of currencies for which to show the 'multiplier' option
const crncyMultOptShowFor = [
    'BWP',  // Botswana pula
    'BWp',  // Botswana Thebe
    'GBP',  // Pound sterling
    'GBp',  // Pound sterling (pence)
    'ILS',  // Israeli new shekel
    'ILs',  // Israeli Agorot
    'KWD',  // Kuwaiti dinar
    'KWd',  // Kuwait Fils
    'MWK',  // Malawian kwacha
    'MWk',  // Malawi Tambala,
    'SZL',  // Swazi lilangeni
    'SZl',  // Swaziland cents
    'ZAR',  // South African rand
    'ZAr',  // South African Cents
    'ZWL',  // Zimbabwean dollar
    'ZWd'   // Zimbabwe Cents
];

const fieldsMap = {
    symbol: {
        label: 'Symbol / Ticker',
        mismatchClass: 'bg-danger',
        cmpFunc: function(own, ref) {
            // match on substring up to length of own symbol
            var refSub = ref.substr(0, own.length);
            return own === refSub;
        }
    },
    symbol_desc: {
        label: 'Description',
        mismatchClass: 'bg-warning',
        cmpFunc: function(own, ref) {
            // match on lower case
            return own.toLowerCase() === ref.toLowerCase();
        }
    },
    bbg_ticker: {
        label: 'BBG Ticker',
        mismatchClass: 'bg-danger'
    },
    ric: {
        label: 'RIC',
        mismatchClass: 'bg-danger'
    },
    isin: {
        label: 'ISIN',
        mismatchClass: 'bg-danger'
    },
    cusip: {
        label: 'CUSIP',
        mismatchClass: 'bg-danger'
    },
    sedol: {
        label: 'SEDOL',
        mismatchClass: 'bg-danger'
    },
    crncy: {
        label: 'Currency',
        mismatchClass: 'bg-warning'
    },
    sec_type: {
        label: 'Security Type',
        mismatchClass: 'bg-warning'
    },
    // TODO fix 524
    // industry: {
    //     label: 'Industry',
    //     oprefix: true
    // }
};

const fieldsOrder = [
    'symbol',
    'symbol_desc',
    'bbg_ticker',
    'ric',
    'isin',
    'cusip',
    'sedol',
    'crncy',
    'sec_type',

    // TODO fix 524
    // 'industry'
];

const chartKeys = {
    PRICE: 'price',
    NOTIONAL: 'notional'
};

const DeepDive = React.createClass({

    //
    // Custom methods
    //

    _handleSelect: function(key) {
        this.setState({key: key});
    },

    _handleChartSelect: function(key) {
        this.setState({chartKey: key});
    },

    _handleClickRemap: function() {
        var self = this;
        self.setState({loading: true});
        var security = self.state.secData;
        var refSecurity = self.state.refData[self.state.key];
        security.rsec = refSecurity.oid;
        ReferenceData.set(security.oid, security)
        .then(function() {
            self.setState({loading: false});
            return self._queryRefData();
        })
        .done(function() {
            self.props.onSecurityUpdate(
                security.oid, {rsec_code: refSecurity.code});
        })
        .always(function() {
            self.setState({loading: false});
        });
    },

    _queryRefData: function() {
        if (this.state.loading) {
            return;
        }

        // TODO need to display error message or something when oid is null
        if (!util.isValidOid(this.props.securityOid)) {
            return;
        }

        var self = this;

        self.setState({loading: true});

        return ReferenceData.get(this.props.securityOid)
        .done(function(data) {

            var defaultKey = _.reduce(data.reference, function(result, refData, i) {
                if (result === 0 &&
                    self._isCurrentlyMapped(data.security, refData)) {
                    return i;
                }
                return result;
            }, 0);

            self.setState({
                refData: data.reference,
                secData: data.security,
                loading: false,
                key: defaultKey
            });
            return self._refreshPricing();
        })
        .always(function() {
            self.setState({loading: false});
        });
    },

    _hasPricingData: function() {
        var pd = this.state.pricingData;
        var hasHist = _.isArray(pd.hist) && (pd.hist.length > 0);
        var hasOwn = _.isArray(pd.own) && (pd.own.length > 0);
        return hasHist || hasOwn;
    },

    _hasNotionalData: function() {
        var nd = this.state.pricingData.notional;
        if (nd === undefined) {
            return false;
        }
        var hasNotional = (_.isArray(nd.notional) &&
            (nd.notional.length > 0));
        var hasCalcNotional = (_.isArray(nd.calc_notional) &&
            (nd.calc_notional.length > 0));
        return hasNotional || hasCalcNotional;
    },

    _renderPricingChart: function() {
        var pricing_data = this.state.pricingData;

        // create the chart
        Highcharts.stockChart('symbol-deep-dive-historical-prices', {
            chart: {
                animation: false,
            },

            title: {
                text: 'Historical Pricing (High/Low)'
            },

            yAxis: {
                plotLines: [{
                    color: '#4f4f4f',
                    width: 1,
                    value: 0,
                    zIndex: 2
                }]
            },

            series: [{
                animation: false,
                data: pricing_data.hist,
                name: 'Historic price daily range (USD)',
                type: 'arearange'
            }, {
                animation: false,
                allowPointSelect: true,
                data: pricing_data.own,
                fillOpacity: 0.25,
                lineWidth: 0,
                marker: {
                    enabled: true,
                    radius: 4
                },
                name: 'Daily average trade price'
            }]
        });
    },

    _renderNotionalChart: function() {
        var notional_data = this.state.pricingData.notional;

        // create the chart
        Highcharts.stockChart('symbol-deep-dive-notional-chart', {
            chart: {
                animation: false,
            },

            title: {
                text: 'Notional'
            },

            yAxis: {
                plotLines: [{
                    color: '#4f4f4f',
                    width: 1,
                    value: 0,
                    zIndex: 2
                }]
            },

            series: [{
                animation: false,
                data: notional_data.notional,
                marker: { enabled: true },
                name: 'Total daily reported notional'
            }, {
                animation: false,
                dashStyle: 'dot',
                data: notional_data.calc_notional,
                marker: { enabled: true },
                name: 'Total daily calculated notional'
            }]
        });

    },

    /**
     * Handler for RDO changes
     *   @param securityOid {int} security Oid whose RDOs have updated
     */
    _handleRDOChange: function(securityOids) {
        var oid = securityOids[0];

        if (!util.isValidOid(oid)) {
            return;
        }

        // propagate changes back up to parent
        this.props.onSecurityUpdate(oid);

        // current security not the one we're processing in this request
        // possibly because user has selected a new security, so bail here
        if (this.props.securityOid !== oid) {
            return;
        }
        this._refreshPricing();
    },

    _refreshPricing: function() {
        var self = this;

        if (!util.isValidOid(this.props.securityOid) ||
            !self.state.refData) {
            return;
        }

        var refSec = self.state.refData[self.state.key];
        if (!(refSec && util.isValidOid(refSec.oid))) {
            return;
        }

        self.setState({loadingPrices: true});
        return ReferenceData.getPricing(this.props.securityOid, refSec.oid)
        .then(function(data) {
            self.setState({
                pricingData: data,
                loadingPrices: false
            });
        })
        .always(function() {
            self.setState({loadingPrices: false});
        });
    },

    /**
     * Return the insider <tr> of the security/ref security table
     * @param ownData {obj} - data about registrant security
     * @param refData {obj} - data from reference source (could be undefined)
     */
    _renderTab: function(ownData, refData) {

        // Default comparison function, strict equivalence
        function defaultCmpFunc(own, ref) {
            return own === ref;
        }

        var arr = _.map(fieldsOrder, function(key) {
            var label = fieldsMap[key].label;
            var refVal = null;
            var refCell = null;

            if (refData !== undefined) {
                refVal = refData[key] || '';

                // TODO remove this; Refs Issue #526 #517
                // Special case for symbol row
                if (key === 'symbol') {
                    refVal = refData['ticker'] || '';
                }

                refCell = <td>{refVal}</td>;
            }

            var ownKey = key;
            var ownVal = ownData[ownKey] || '';

            // Bail if no label, or neither own or ref data available
            if (!label || !(refVal || ownVal)) {
                return null;
            }

            // Lookup comparison function or use default
            var cmpFunc = fieldsMap[key].cmpFunc || defaultCmpFunc;

            var mismatchClass = '';
            if (ownVal
                && refVal
                && !cmpFunc(ownVal, refVal)
                && fieldsMap[key].mismatchClass) {
                mismatchClass = fieldsMap[key].mismatchClass;
            }

            return (
                <tr className={mismatchClass}>
                    <td>{label}</td>
                    <td>{ownVal}</td>
                    {refCell}
                </tr>
            );
        });
        return _.filter(arr);
    },

    // Display currency multiplier option or not
    _shouldDisplayCrncyMultRDO: function() {
        if (this.state.secData.crncy) {
            var crncys = _.map(
                this.state.refData.concat(this.state.secData), function(sec) {
                    return sec.crncy;
                }
            );
            return _.some(crncys, function(crncy) {
                return crncyMultOptShowFor.indexOf(crncy) !== -1;
            });
        }
        return false;
    },

    // Based on the chart that is selected only want to display certain RDOs
    _shouldDisplayOpts: function(optType) {
        if (this.state.chartKey === optType) {
            return true;
        }
        return false;
    },

    _renderChartTabs: function() {

        var histPrices = <p className='flex-center'>No Data</p>;
        var notional = histPrices;

        if (this.state.loadingPrices) {
            histPrices = <LoadingIcon className="symbol-deep-dive-loading"/>;
            notional = histPrices;
        }

        if (this._hasPricingData()) {
            histPrices = <div id='symbol-deep-dive-historical-prices'/>;
        }

        if (this._hasNotionalData()) {
            notional = <div id='symbol-deep-dive-notional-chart'/>;
        }

        return (
            <TabbedArea defaultActiveKey={0}
                activeKey={this.state.chartKey}
                animation={false}
                onSelect={this._handleChartSelect}
                className='symbol-deep-dive-charts'>
                <TabPane tab='Historical Prices'
                    eventKey={chartKeys.PRICE}>
                    {histPrices}
                </TabPane>
                <TabPane tab='Notional'
                    eventKey={chartKeys.NOTIONAL}>
                    {notional}
                </TabPane>
            </TabbedArea>
        );
    },

    _isCurrentlyMapped: function(ownData, tabData) {
        if (util.isValidOid(tabData.oid) && tabData.oid === ownData.rsec) {
            return true;
        }
        return false;
    },

    _renderTabs: function(ownData, tabsData) {
        var self = this;
        var selectedSymbol = this.state.secData;

        var tabPanes = _.map(tabsData, function(tabData, i) {
            var tabName = (tabData.code);
            var confirmMap = null;

            if (self._isCurrentlyMapped(ownData, tabData)) {
                tabName += '*';
            } else {
                confirmMap = (
                    <div className='symbol-deep-dive-confirm clearfix'>
                        <p>
                            Would you like to re-map registrant security{' '}
                            <strong>{selectedSymbol.code}</strong>{' '}
                            to the Reference Security <strong>{tabData.code}</strong>?
                        </p>
                        <Button block
                            bsStyle='primary'
                            onClick={self._handleClickRemap}>
                            Yes
                        </Button>
                    </div>
                );
            }

            var tab = self._renderTab(ownData, tabData);

            var panelBody = null;
            if (i === self.state.key) {
                var panelBody = [
                    <table className='symbol-deep-dive-table'>
                        <thead>
                            <th></th>
                            <th>In Registrant Files</th>
                            <th>From Reference Data</th>
                        </thead>
                        <tbody>
                            {tab}
                        </tbody>
                    </table>,
                    {confirmMap},
                    <div className='symbol-deep-dive-charts'>
                        <RDOs ref='rdos'
                            displayCrncyMult={self._shouldDisplayCrncyMultRDO()}
                            displayPriceOpts={self._shouldDisplayOpts(chartKeys.PRICE)}
                            displayNotionalOpts={self._shouldDisplayOpts(chartKeys.NOTIONAL)}
                            securityOids={[self.props.securityOid]}
                            onChange={self._handleRDOChange}/>
                        {self._renderChartTabs()}
                    </div>
                ];
            }

            return (
                <TabPane tab={tabName}
                    eventKey={i}>
                    {panelBody}
                </TabPane>
            );
        });
        return tabPanes;
    },

    //
    // React lifecycle methods
    //

    getInitialState: function() {
        return {
            loading: false,
            loadingPrices : false,
            refData: [],
            secData: {},
            pricingData: {},
            key: 0,
            chartKey: chartKeys.PRICE
        };
    },

    getDefaultProps: function() {
        return {
            securityOid: null,
            onSecurityUpdate: function() {},
            chartKeyCtrl: null
        };
    },

    propTypes: {
        securityOid: React.PropTypes.number.isRequired,
        onSecurityUpdate: React.PropTypes.func,
        chartKeyCtrl: React.PropTypes.string
    },

    componentDidMount: function() {
        if (util.isValidOid(this.props.securityOid)) {
            this._queryRefData();
        }
    },

    componentWillReceiveProps: function(nextProps) {
        var securityOidChanged = (
            nextProps.securityOid !==
            this.props.securityOid);

        if (securityOidChanged) {
            // reset the key on securityOid change
            this.setState({key: 0});
        }

        // Allow parent to control selected chart
        if (_.values(chartKeys).indexOf(nextProps.chartKeyCtrl) !== -1 &&
            nextProps.chartKeyCtrl !== this.state.chartKey) {
            this.setState({chartKey: nextProps.chartKeyCtrl});
        }
    },

    componentDidUpdate: function(pp, ps) {

        // Security Oid changed
        //

        var securityOidChanged = (
            pp.securityOid !==
            this.props.securityOid);

        if (securityOidChanged) {
            this._queryRefData();
        }

        // Pricing data changed
        //

        var pricingDataChanged = (
            ps.pricingData !== this.state.pricingData);

        if (pricingDataChanged) {
            this._renderPricingChart();
            this._renderNotionalChart();
        }

        // Tab changed
        //

        var tabChanged = (ps.key !== this.state.key);

        if (tabChanged) {
            this._refreshPricing();
        }

        // Chart tab changed
        //

        var chartTabChanged = (ps.chartKey !== this.state.chartKey);
        if (chartTabChanged && !pricingDataChanged) {
            if (this.state.chartKey === chartKeys.PRICE) {
                this._renderPricingChart();
            } else {
                this._renderNotionalChart();
            }
        }
    },

    render: function() {
        var self = this;
        var selectedSymbol = this.state.secData;

        var hoverToExpand = (
            <div className='symbol-deep-dive-hover-to-expand'>
                Hover to expand &#10549;
            </div>
        );

        // No OID selected
        if (!util.isValidOid(this.props.securityOid)) {
            return (
                <div className='symbol-deep-dive'>
                    {hoverToExpand}
                    <p>Select a single row in the grid to display more information</p>
                </div>
            );
        }

        // Loading data
        if (this.state.loading) {
            return (
                <div className='symbol-deep-dive'>
                    <LoadingIcon className='symbol-deep-dive-loading'/>
                </div>
            );
        }

        var content = null;
        if (self.state.refData && self.state.refData.length > 0) {
            content = (
                <TabbedArea defaultActiveKey={0}
                    activeKey={self.state.key}
                    onSelect={self._handleSelect}
                    animation={false}
                    bsStyle='pills'
                    className='symbol-deep-dive-tabs'>
                    {self._renderTabs(self.state.secData, self.state.refData)}
                </TabbedArea>
            );
        } else if (self.state.refData.length === 0) {
            content = (
                <table className='symbol-deep-dive-table'>
                    <thead>
                        <th></th>
                        <th>In Registrant Files</th>
                    </thead>
                    <tbody>
                        {self._renderTab(selectedSymbol)}
                    </tbody>
                </table>
            );
        }

        var candidatesBlurb = null;
        if (self.state.refData && self.state.refData.length > 1) {
            candidatesBlurb = (
                <div className='symbol-deep-dive-candidates-label clearfix'>
                    <p>
                        Found <strong>{self.state.refData.length - 1}</strong>{' '}
                        other potential securities to map to
                    </p>
                    <div>
                        <strong>Candidates</strong>
                        <em>* currently mapped security</em>
                    </div>
                </div>
            );
        } else if (self.state.refData.length === 0) {
            candidatesBlurb = (
                <Alert bsStyle='danger'>
                    No reference data was found for this security
                </Alert>
            );
        }

        var title = null;
        if (selectedSymbol) {

            var currentMap = null;
            if (selectedSymbol.rsec) {

                var mappedSymbol = _.find(
                    this.state.refData, {oid: selectedSymbol.rsec});

                if (mappedSymbol !== undefined) {
                    currentMap = (
                        <p>
                            Currently mapped to Reference Security{' '}
                            <strong>{mappedSymbol.code}</strong>
                        </p>
                    );
                }
            }

            title = (
                <div>
                    <p>
                        Displaying information for registrant security{' '}
                        <strong>{selectedSymbol.code}</strong>{' '}
                        from <strong>{selectedSymbol.source}</strong>
                    </p>
                    {currentMap}
                    {candidatesBlurb}
                </div>
            );
        }

        return (
            <div className='symbol-deep-dive'>
                {hoverToExpand}
                {title}
                {content}
            </div>
        );
    }
});

export default DeepDive;
