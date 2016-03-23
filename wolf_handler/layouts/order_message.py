from .available_columns import columns

# descriptions of the columns, their meaning and order
data_cols = [
    'fill_price',
    'orig_price',
    'notional',
    'fill_qty',
    'orig_qty',
    'commission',
    'multiplier',
    'fee',
    'message_type',
    'message_source',
    'order_type',
    'acting_as',
    'tif']

datetime_cols = [
    'message_datetime',
    'message_date',
    'message_time',
    'exchange_datetime',
    'exchange_date',
    'exchange_time',
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
    'broker_id',
    'exec_id',
    'canonical_order_id',
    'client_order_id',
    'external_order_id']

cols = data_cols + datetime_cols + id_cols

blotter = {k: columns[k] for k in cols}