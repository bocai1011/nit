import q from 'common/utils/queryFactory';
import {
    get,
    sum,
    max,
    group_and_reduce,
    join,
    min,
    divide,
    add,
    abs,
} from 'reports/utils/ReportHelper';

export function getTurnoverSummary(ratio_threshold) {
    var commissions = q.base.get_commissions_underlying({});
    var holdings =  get('account_pnl');

    var comm_data = sum({
        doc: 'Sum up notional and trade cost fields for accounts for each day.',
        data: commissions,
        groupby: ['date','account'],
        field: ['notional_long',
                'notional_short',
                'notional',
                'comm',
                'fee',
                'comm_fee'],
    });

    comm_data = max(comm_data, 'sum_notional_long', 'sum_notional_short', 'turnover_notional').
        setDoc('Add a column which is the max of long notional vs short notional.');

    var sum_comm_by_acct = sum({
        doc: 'Reduce transaction-based commissions data by account.',
        data: comm_data,
        groupby: ['account'],
        field: ['sum_notional_long',
                'sum_notional_short',
                'sum_notional',
                'sum_comm',
                'sum_fee',
                'sum_comm_fee',
                'turnover_notional'],
    });

    var sum_hold_by_acct = group_and_reduce({
        doc: 'Reduce holdings data by account.',
        data: holdings,
        reduce: [
            ['abs_market_value', 'max'],
            ['abs_market_value', 'mean'],
            ['total_pnl_daily', 'sum'],
        ],
        groupby: ['account'],
    });

    var holdings_and_fees = join({
        doc: 'Merges the transactions based commissions data with the holdings data at the account level.',
        left: sum_comm_by_acct,
        right: sum_hold_by_acct,
    });

    holdings_and_fees = min(holdings_and_fees, 'sum_sum_notional_long', 'sum_sum_notional_short', 'notional_magnitude')
    .setDoc('Takes the minimum of total notional long and total notion short and setting it as a new column, notional_magnitude');
    holdings_and_fees = divide(holdings_and_fees, 'notional_magnitude', 'max_abs_market_value', 'turnover_ratio')
    .setDoc('Divides notional_magnitude by max_abs_market_value and setting it as a new column, turnover_ratio');
    holdings_and_fees = divide(holdings_and_fees, 'sum_sum_notional_long', 'mean_abs_market_value', 'turnover_annualized')
    .setDoc('Divides sum_sum_notional_long by mean_abs_market_value and setting it as a new column, turnover_annualized');
    holdings_and_fees = q.jsutil.scalar_div({table:holdings_and_fees, col:'turnover_annualized', num:'(((exec max date from transaction) - (exec min date from transaction)) % 365)', name:'turnover_annualized'});

    holdings_and_fees = q.core.filter_by({
        data: holdings_and_fees,
        where: [
            ['>', 'turnover_annualized', ratio_threshold],
        ]
    });

    return holdings_and_fees;
}

export function getHoldingsSummary(groupby) {
    var holdings;

    if (groupby == 'account') {
        holdings = get('account_pnl');
    } else if (groupby == 'sec') {
        holdings = get('sec_pnl');
    }

    holdings = add(holdings, 'market_value_long', 'market_value_short', 'net_exposure').
        setDoc('Calculate net exposure = market_value_long + market_value_short.');

    holdings = group_and_reduce({
        doc: 'Evaluate notional values based on data+account',
        data: holdings,
        grouper: groupby,
        reduce: [
            ['abs_market_value', 'mean'],
            ['abs_market_value', 'std'],
            ['market_value_long', 'mean'],
            ['market_value_short', 'mean'],
            ['long_count', 'mean'],
            ['short_count', 'mean'],
            ['max_long', 'max', 'max_long'],
            ['max_short', 'min', 'max_short'],
            ['net_exposure', 'mean'],
            ['net_exposure', 'std'],
        ],
    });

    holdings = abs(holdings, 'mean_market_value_short', 'abs_mean_market_value_short').
        setDoc('Add a column for abs of short market value.');

    holdings = abs(holdings, 'max_short', 'abs_max_short').
        setDoc('Add a column for abs of the largest short position');

    holdings = add(holdings, 'mean_long_count', 'mean_short_count', 'mean_total_position_count').
        setDoc('Add a column for total mean count.');

    holdings = max(holdings, 'max_long', 'abs_max_short', 'largest_pos').
        setDoc('Add a column based on the larger of max_long and abs_max_short');

    holdings = divide(holdings, 'largest_pos', 'mean_abs_market_value', 'concentration').
        setDoc('Calculate the concentration, the percentage of the portfolio value in the largest single holding.');

    return holdings;
}
