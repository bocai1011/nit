from .available_columns import columns

# descriptions of the columns, their meaning and order
data_cols = [
    'price',
    'notional',
    'qty',
    'commission',
    'multiplier',
    'fee']

datetime_cols = [
    'exec_datetime',
    'exec_date',
    'exec_time',
    'settlement_datetime',
    'settlement_date',
    'settlement_time']

id_cols = [
    'symbol',
    'isin',
    'cusip',
    'sedol',
    'exec_direction',
    'sec_id',
    'acct_id',
    'trader_id',
    'broker_id']

cols = data_cols + datetime_cols + id_cols

blotter = {k: columns[k] for k in cols}