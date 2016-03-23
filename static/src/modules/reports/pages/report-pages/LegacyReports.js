import React from 'react';
import q from 'common/utils/queryFactory';
import { Link as DynamicLink } from 'reports/components/charts/Widgets';

export default [
    {
        displayName: 'Account Summary',
        upgrade: ['Aggregated Transactions', 'Account Holdings'],
        query: q.legacy.get_account_summary,
        summary:
            <span>
                This report contains a transaction summary on every account in the trade blotter being analyzed.
                All data regarding analyzes can be found in the transaction table.
            </span>,
    },

    {
        displayName: 'Broker Summary',
        upgrade: (<DynamicLink linking_to="Aggregated Transactions" link_value={[["value"]]} link_argument={[["broker"]]} link_ref={['grouper']}/>),
        query: q.legacy.get_broker_summary,
        summary:
            <span>
                This report contains a transaction summary on every broker in the trade blotter being analyzed.
                All data regarding analyzes can be found in the transaction table.
            </span>,
    },

    {
        displayName: 'Security Summary',
        upgrade: [(<DynamicLink linking_to="Aggregated Transactions" link_value={[["value"]]} link_argument={[["sec"]]} link_ref={['grouper']}/>), 'Security Holdings'],
        query: q.legacy.get_security_summary,
        summary:
            <span>
                This report contains a transaction summary on every security in the trade blotter being analyzed.
                All data regarding analyzes can be found in the transaction table.
            </span>,
    },

    {
        displayName: 'Top 50 Commission Transactions (formerly Commission Analysis)',
        upgrade: 'Egregious Commissions and Fees',
        query: q.legacy.get_commission_summary,
        summary:
            <span>
                The Commission Analysis report gives us the trades that resulted in highest percentage commission relative to notional.
                Trades are ranked in descending order of percentage commission.
            </span>,
    },

    {
        displayName: 'Commission Distribution by Account/Security',
        upgrade: 'Aggregated Commissions And Fees',
        query: q.legacy.get_account_selection,
        summary:
            <span>
                The Commission Distribution by Account/Security report provides the commission percentage for each security held in the account
                during the exam period.  The commissions are ranked in descending order. Commissions paid are calculated by an account;
                it is not aggregated across accounts.  Security ranking per account is based on data in the trade blotter.
            </span>,
    },

    {
        displayName: 'Commission Distribution by Security/Broker',
        upgrade: 'Aggregated Commissions And Fees',
        query: q.legacy.get_commission_distribution_sec_broker,
        summary:
            <span>
                The Commission Distribution By Security/Broker report ranks each security traded by broker based on percentage of commission earned.
                Therefore, securities that earned a broker the highest commission are ranked higher than securities that earned them a lower commission.
                All analyzes are based on transactions data in the trade blotter.
            </span>,
    },

    {
        displayName: 'Commission Distribution by Account/Broker',
        upgrade: 'Aggregated Commissions And Fees',
        query: q.legacy.get_commission_distribution_acct_broker,
        summary:
            <span>
                The Commission Distribution By Account/Broker report ranks commissions paid by accounts to brokers.
                Total commission paid by an account to a broker is divided by the total commission paid for all transactions
                executed by the account before they are ranked.  analyzes are based on trade blotter data.
            </span>,
    },

    {
        displayName: 'Trade Allocation Analysis (by Account)',
        upgrade: ['Account Advantage', 'Allocation Comparison between Account Groups'],
        forceUpgrade: true,

        query: q.legacy.get_trade_allocation,
        summary:
            <span>
                The Trade Allocation report can be utilized to investigate if any account(s) received preferential treatment from the registrant.
                Note that preferred accounts tend to enjoy better execution prices when compared to non-preferred accounts.
                Execution advantage implies lower purchase price and higher sales price.
            </span>,
    },

    {
        displayName: 'Broker Allocation Analysis',
        upgrade: [(<DynamicLink linking_to="Aggregated Transactions" link_value={[["value"]]} link_argument={[["broker"]]} link_ref={['grouper']}/>), 'Allocation Comparison between Broker Groups'],
        forceUpgrade: true,

        query: q.legacy.get_broker_allocation,
        summary:
            <span>
                The Broker Allocation report helps us investigate preferential treatment to one or more brokers.
                Preferred brokers, one or more, will have a better average price compared to non-preferred brokers.
                The report takes into consideration the direction of trade (buy or sell).
            </span>,
    },

    {
        displayName: 'Front Running - Buy',
        upgrade: 'Front Running',
        query: q.legacy.get_front_running_buy,
        summary:
            <span>
                The Front Running Buy report shows all accounts that purchased shares before other accounts could purchase the same stocks.
                This results in a potential price advantage, if there is price impact.
            </span>,
    },

    {
        displayName: 'Front Running - Sell',
        upgrade: 'Front Running',
        query: q.legacy.get_front_running_sell,
        summary:
            <span>
                The Front Running Sell report shows all accounts that sold shares before another account could sell the same shares.
                This results in a potential price advantage if there is price impact.
            </span>,
    },

    {
        displayName: 'Front Running - Buy (Custom)',
        upgrade: 'Front Running',
        query: q.legacy.get_front_running_buy_custom,
        summary:
            <span>
                This is very similar to the Front Running Buy report, except that preferred and non-preferred accounts can be specified by the user.
                This results in a potential price advantage, if there is a price impact.
            </span>,
    },

    {
        displayName: 'Front Running - Sell (Custom)',
        upgrade: 'Front Running',
        query: q.legacy.get_front_running_sell_custom,
        summary:
            <span>
                This is very similar to the Front Running Sell report, except that preferred and non-preferred accounts can be specified by the user.
                This results in a potential price advantage, if there is a price impact.
            </span>,
    },

    {
        displayName: 'Portfolio Turnover',
        upgrade: 'Account Turnover',
        query: q.legacy.get_portfolio_turnover,
        summary:
            <span>
                This report analyzes portfolio turnover.
                We calculate turnover as total transactioned value divided by the buying power of the account.
                We estimate buying power as either the average market value of the account's holdings,
                or the maximum market value of the account's holdings.
                We provide both calculated turnovers for every account below.
            </span>,
    },

    {
        displayName: 'Portfolio Management - Accounts',
        query: q.legacy.get_accounts_perf_mgmt,
        summary:
            <span>
                This report analyzes the portfolio management of accounts.
            </span>,
    },

    {
        displayName: 'Month End Dates',
        upgrade: 'Jump Into The Data',
        forceUpgrade: true,

        query: q.legacy.get_month_end_dates,
        summary:
            <span>
                WARNING. This report needs work.
            </span>,
    },

    {
        displayName: 'Cross Trades - Dealer Interpositioned',
        upgrade: 'Cross Trades',
        query: q.legacy.get_dealer_interpositioned,
        summary:
            <span>
                The Dealer Interposition is used to capture trades where an asset manager sells securities out of, e.g.,
                a distressed client's account to a friendly counterparty broker-dealer, and then repurchases the same securities
                on the same day or the next day for another client account.
            </span>,
    },

    {
        displayName: 'Bunch Price Analysis',
        query: q.legacy.get_bunch_prices,
        summary:
            <span>
                The Bunch Price Analysis (All) report ranks percentage difference between the daily highest and lowest transaction
                prices of every security in the trade blotter being analyzed.  All cases where there was no daily transaction price
                difference on a security are excluded from the report.  The report is based on trade blotter data.
            </span>,
    },

    {
        displayName: 'Bunch Price Analysis - Buy',
        query: q.legacy.get_bunch_prices_buy,
        summary:
            <span>
                The Bunch Price Analysis (Buy) report ranks percentage difference between the daily highest and lowest purchase prices
                of every security in the trade blotter being analyzed.  All cases where there was no daily purchase price difference on
                a security are excluded from the report.  The report is based on trade blotter data.
                The 'Buy' report is a subset of 'All' report.
            </span>,
    },

    {
        displayName: 'Bunch Price Analysis - Sell',
        query: q.legacy.get_bunch_prices_sell,
        summary:
            <span>
                The Bunch Price Analysis (Sell) report ranks the percentage difference between the daily highest and lowest sales prices
                of every security in the trade blotter being analyzed.  All cases where there was no daily sales price difference on a
                security are excluded from the report.  The report is based on trade blotter data.
            </span>,
    },

    {
        displayName: 'Trading Pattern',
        query: q.legacy.get_trade_pattern,
        summary:
            <span>
                The Trade Pattern report provides daily aggregates of all transactions in a trade blotter.
                The main source for this report is the trade blotter.
            </span>,
    },

    {
        displayName: 'Trading Pattern by Account',
        query: q.legacy.get_trade_pattern_account,
        upgrade: 'Aggregated Transactions',
        summary:
            <span>
                The Account report provides daily aggregates of all transactions executed on behalf of each account in a trade blotter.
                The trade blotter is the main source of data for this report.
            </span>,
    },

    {
        displayName: 'Trading Pattern by Broker',
        query: q.legacy.get_trade_pattern_broker,
        upgrade: (<DynamicLink linking_to="Aggregated Transactions" link_value={[["value"]]} link_argument={[["broker"]]} link_ref={['grouper']}/>),
        summary:
            <span>
                The Broker report provides daily aggregates of all transactions executed by each broker in a trade blotter.
                As the previous sentence suggests, the trade blotter is the main source of data for this report.
            </span>,
    },

    {
        displayName: 'Restricted Trades Analysis',
        query: q.legacy.get_restricted_trades,
        summary:
            <span>
                The Restricted Trade Analysis report contains transactions involving securities on a firm's restricted trade list.
                This implies a trade blotter and a restricted list is required for this analysis.  Data for this report is sourced
                from both the trade blotter and a list of restricted securities applicable to trades in the blotter.
            </span>,
    },

    {
        displayName: 'Day Trading Instances by Account',
        query: q.legacy.get_day_trades,
        summary:
            <span>
                Day trade refers to the buying and selling of the same security on the same day within an account.
                The Day Trades report shows daily total transactions on such securities that were day-traded by account,
                broken down into sales and purchases.  The trade blotter is the main source of data for this report.
            </span>,
    },

    {
        displayName: 'Day Trading Instances with Notional < 25K',
        query: q.legacy.get_day_trades_25k,
        summary:
            <span>
                The Day Trades 25K report also shows daily total transactions on securities that were day-traded by account,
                broken down into sales and purchases.  However, here, the maximum daily quantity bought/sold is less than
                or equal to 25K. The trade blotter is the main source of data for this report.
            </span>,
    },

    {
        displayName: 'Transactions filtered by Broker',
        query: q.legacy.get_trades_by_broker,
        upgrade: 'View Transactions',
        summary:
            <span>
                The Broker Trades report shows daily total transactions executed by selected brokers.
                Data regarding analyzes are sourced from both the trade blotter and the list of brokers
                provided by NEAT user via form.
            </span>,
    },

    {
        displayName: 'Disparate Trading',
        query: q.legacy.get_disparate_trading,
        summary:
            <span>
                The Disparate Trading report lists all accounts and all the securities each of them have been exposed to.
                Data regarding analyzes are sourced from both the trade blotter and the list of brokers provided by NEAT user via form.
            </span>,
    },

    {
        displayName: 'Block Trades',
        query: q.legacy.get_block_trades,
        summary:
            <span>
                Block trades provides a means to do scenario analysis for accounts that did not participate in any trade within a block window.
                For instance, suppose Account 1 (a hedge fund account) traded in "Apple" during the past month, but Account 2 (a mutual fund) did not.
                Now, suppose it was established that both accounts received the same trading signal regarding Apple stocks.
                To determine the performance impact of not participating in the "Apple" trade during the past month, the user can analyze
                price change or the "block trading effect" with the aid of this report.
            </span>,
    },

    {
        displayName: 'Account Concentration',
        query: q.legacy.get_account_concentration,
        summary:
            <span>
                The Account Concentration report shows the average market value exposure to each security by an account over a holding period.
                All data regarding analyzes can be found in the accounts holding table.  Local currencies are converted to USD with the aid
                of daily rates found in the exchange rates table.
            </span>,
    },

    {
        displayName: 'Firm Concentration',
        query: q.legacy.get_firm_concentration,
        summary:
            <span>
                Firm Concentration report shows the average notional value of each security over a holding period.
                All data regarding analyzes can be found in trade blotter.
            </span>,
    },

    {
        displayName: 'Rule 105 (Legacy)',
        query: q.legacy.get_rule_105,
        summary:
            <span>
                Short sales on securities during the blackout window before secondary offerings.
                If the firm was participating in the seconday offering, short sales in the blackout window may be a regulatory violation.
            </span>,
    },

    {
        displayName: 'Rule 105 Broker',
        forceUpgrade: true,

        query: q.legacy.get_rule_105_broker,
        summary:
            <span>
                WARNING. This report needs work.
            </span>,
    },

    {
        displayName: 'Wash Trades',
        query: q.legacy.get_wash_trades,
        summary:
            <span>
                Potential wash trades in the trade blotter.
            </span>,
    },
];
