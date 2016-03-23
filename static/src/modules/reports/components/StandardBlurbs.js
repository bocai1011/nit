import React from 'react';
import _ from 'lodash';
import Mailto from 'common/components/Mailto';
import { Link as DynamicLink } from 'reports/components/charts/Widgets';

/**
 * Standard blurbs for report level and widget level blurbs.
 * @exports reports\components\StandardBlurbs
 */
let sb = {
    legacy: (modernReport) => {
        if (modernReport) {
            return
                <span>
                    This is a legacy report intended for backwards compatibility with NEAT2.
                    We encourage you to use <DynamicLink linking_to={modernReport} />.
                </span>;
        } else  {
            return
                <span>
                    This is a legacy report intended for backwards compatibility with NEAT2.
                    We encourage you to use a modern report when possible.
                    If there is no modern report that provides this functionality, please <Mailto>suggest an improvement</Mailto>.
                </span>;
        }
    },

    tradeCostsMeaning: " " + "Below trade costs means commissions and/or fees." + " ",
    crossTradeMeaning: " " + "We define potential cross trades as when two accounts trade in the same security on the same day and the net direction quantity traded for one account is positive and for the other account it is negative. The quantity that is considered potentially cross traded is the smaller of the two quantities (in magnitude)." + " ",

    tradeCostDd: " " + "Please select which trade costs you would like to focus on." + " ",
    absFeeDd:
        <span>
            Please select whether we should take the absolute value of trade costs.
            This is useful when firms list their commissions and/or fees as negative numbers when the direction
            of a trade is a sell. Be aware, however, that at times fees are negative instead because the trade
            is actually gaining an incentive bonus, such as for creating liquidity in some markets.
            For analyzing those cases it is better to not take the absolute value.
        </span>,

    advantage:
        <span>
            Advantage is calculated with respect to the other accounts in the firm.
            If an account tends to trade at the same average price as the firm for a given day and security,
            then their advantage will be zero.
            If an account tends to trade at better prices then their advantage will be positive, and likewise,
            if an account tends to trade at worse prices then their advantage will be negative.
            Advantage is given in price bps per share, normalized with the securities close price as the reference.
        </span>,

    timeseriesUsage: " " + "You may zoom in and out of this timeseries by clicking and dragging over a selected area. You may also navigate by using the minimap overview below the graphs. Additionally there is a date selector in the upper right." + " ",
    multiTimeseriesUsage: " " + "Note that there are multiple time series on this graph. On the right you can toggle which series you would like to see." + " ",
    histogramUsage: " " + "" + " ",
    scatterUsage: " " + "" + " ",
    pieUsage: " " + "" + " ",
    dataUsage: " " + "You can filter this table in order to isolate rows you care about. To do so click the filter button in the column header you wish to sort. You can filter on as many columns as you'd like. In the top right you will see how many rows are being displayed based on your filter. You can download this data to excel via the dropdown next to the table's title." + " ",

    histogram: args =>
        'This is a histogram of ' + (args.summaryField || args.field) + '.' + sb.histogramUsage,

    scatter: args =>
        'This scatter plot presents ' + args.X + ' vs ' + args.Y + '.' + sb.scatterUsage,

    pie: (variable, by) =>
        'This pie chart shows ' + variable + ' for each ' + by + '.' + sb.pieUsage,

    totalNotional: 'Total notional traded is the sum of the absolute value of executed trades.',
};

sb = _.assign(sb, {
    dataTable: " " + "This table holds the underlying data displayed in the above visualizations." + sb.dataUsage,
    soloTable: " " + "This table is the entirety of data for this report. You can download this data to excel via the dropdown next to the table's title." + " ",
    corrected: " " + "All prices and notional values are provided in USD, with any prices adjusted to the start of this case. Local currencies are converted to USD with the aid of daily rates found in the exchange rates table." + " ",

    timeseries: variable =>
        <span>
            This is a plot of {variable} over time.
            {sb.timeseriesUsage}
        </span>,

    multiTimeseries: variable =>
        <span>
            This is a plot of {variable} over time.
            {sb.multiTimeseriesUsage}
        </span>,

    tradeCostHistogram:
        sb.tradeCostsMeaning + sb.histogram({field:'trade cost'}) + sb.histogramUsage,

    transactionSummary: (entity, groupby) =>
        <span>
            This is a table of overview statistics for transactions made by the selected {entity} grouped by {groupby}.
        </span>,

    comparisonHistogram: args =>
        <span>
            This is a histogram to show the comparison of the trades for two {args.grouper}s in terms of {args.field} per trade.
            Along the x-axis are bins representing the {args.field} of a trade in US dollars.
            The height of each bin corresponds to the number of trades for each {args.grouper} where the {args.field} fell within the range of the bin.
        </span>,

    tradeCostsPerTransaction:
        <span>
            This is a histogram to show the number of transactions with a given trade cost.
            Along the x-axis are bins representing a US dollar amount for the transactions' trade cost.
            The height of each bin corresponds to the number of transactions where the total trade cost fell within the range of the bin.
            The binning has been done logarithmically (base 10).
        </span>,

    tradeCostsPerShare:
        <span>
            This is a histogram to show the number of transactions with a given commissions/fees cost per share.
            Along the x-axis are bins representing a US dollar amount trade cost per share.
            The height of each bin corresponds to the number of transactions where the trade cost per share fell within the range of the bin.
            The binning has been done logarithmically (base 10).
        </span>,

    tradeCostsPercentNotional:
        <span>
            This is a histogram to show the number of transactions with a given commissions/fees as a percentage of notional traded.
            Along the x-axis are bins representing percentages.
            The height of each bin corresponds to the number of transactions where the trade cost per notional fell within the range of the bin.
            The binning has been done logarithmically (base 10).
        </span>,

    meanTradeCostsByTradeDirections:
        <span>
            This pie chart shows the breakdown of the average commissions/fees per transaction in terms of trade directions.
        </span>,

    meanTradeCostsBySecurityType:
        <span>
            This pie chart shows the breakdown of the average commissions/fees per transaction in terms of asset class.
        </span>,

    meanTradeCostsByCurrency:
        <span>
            This pie chart shows the breakdown of the average commissions/fees per transaction in terms of currency.
        </span>,

    totalTradeCostsByTradeDirections:
        <span>
            This pie chart shows the breakdown of total commissions/fees in terms of trade directions.
        </span>,

    totalTradeCostsBySecurityType:
        <span>
            This pie chart shows the breakdown of total commissions/fees in terms of asset class.
        </span>,

    totalTradeCostsByCurrency:
        <span>
            This pie chart shows the breakdown of total commissions/fees in terms of currency.
        </span>,

    commissionsAndFeesData:
        <span>
            This is the underlying trade cost data by transaction.
        </span>,

    securityCrossTrades:
        <div>
            In this cross correlation chart we aggregate potental cross trades by security over all days and show the security with the largest value for the pair of accounts.
            {sb.crossTradeMeaning}
        </div>,

    totalCrossTrades:
        <div>
            This cross correlation chart shows the the sum of all potential cross trades between two accounts.
            {sb.crossTradeMeaning}
        </div>,

    standardLinks: (grouper, dropdown, page) => {
        var full = {account: 'account', sec: 'security', broker: 'broker'};
        var pages = {
            account: [
                {name: 'Overview for Account', description: "For a general overview of the account's trading, see "},
                {name: 'Holdings Detail for Account', description: "For a deeper look into the account's holdings, see "},
                {name: 'Commission Detail for Account', description: "For a deeper look into fees charged against the account, see "},
                {name: 'Transaction Detail for Account', description: "For a deeper look into the accounts transactions, see "},
                {name: 'Performance Detail for Account, Security', description: "For the account's performance in a specific security, see "},
                {name: 'Security Advantage for Account', description: "For a look at the price advantages for different securities traded by the account, see "},
                {name: 'Security Holdings for Account', description: "For a look at the account's holdings in different securities, see "},
            ],
            broker: [
                {name: 'Overview for Broker', description: "For a general overview of trades made through the broker, see"},
                {name: 'Transaction Detail for Broker', description: "For a deeper look into transactions made through the broker, see "},
            ],
            sec: [
                {name: 'Overview for Security', description: "For a general overview of trades made in the security, see "},
                {name: 'Holdings Detail for Security', description: "For a deeper look into the firm's holdings in the security, see "},
                {name: 'Price Validation for Security', description: "For price validation on trades made on the security, see "},
                {name: 'Transaction Detail for Security', description: "For a deeper look at transactions made on the security, see "},
                // {name: 'Performance Detail for Account, Security', description: ""},
            ],
        };

        var reply = []
        _.filter(pages[grouper], o => (o.name != page)).forEach((p, i) => {
            if (p.description) {
                reply.push(p.description);
            }
            reply.push(
                <DynamicLink query={dropdown.getSelected(0)} linking_to={p.name} link_ref={[[grouper]]} link_value={[['value']]}>
                    {p.name}
                </DynamicLink>
            );

            if (p.description) {
                reply.push('.');
                reply.push(<p/>);
            } else {
                reply.push(', ');
            }
        });
        if ((reply.length > 3) && (reply[reply.length - 3] == ', ')) {
            reply[reply.length - 3] = ', or ';
        }
        delete reply[reply.length - 1];
        return (
            <div>
                <p/>
                For more information about this {full[grouper]} see the following reports:
                <p/>
                {reply}
                <p/>
            </div>
        );
    }
});

export default sb;
