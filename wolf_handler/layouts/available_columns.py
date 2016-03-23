available_datatypes = ['str', 'int', 'float', 'datetime', 'date', 'time', 'cusip', 'isin', 'sedol']
default_values = {'str': "\" \"",
                  'int': "0N",
                  'float': "0Ne",
                  'datetime': "0Nz",
                  'date': "0Nd",
                  'time': "0Nt",
                  'cusip': "0N",
                  'isin': "\" \"",
                  'sedol': "\" \""}


class Column():
    """
    This is a holder class for column types
    """

    def __init__(self, name, datatype=None, datetime=False, required=False, conditional=None, default=None):
        self.name = name
        if not all([d in available_datatypes for d in datatype]):
            # Check that datatype is valid
            raise TypeError('"datatype" not a valid type:', datatype)
        if 'float' in datatype:
            datatype.append('int')
        self.datatype = list(set(datatype))

        if datetime:
            self.datetime = True
            self.datetime_format = datetime
        else:
            self.datetime = False

        if type(required) != bool:
            raise TypeError('named argument "required" must be boolean', required)

        self._required = required
        self.conditional = conditional
        self.default = default

    def __repr__(self):
        return '<Column type: %s>' % self.name

    def required(self, cols):
        if not self.conditional:
            return self._required
        else:
            return self.conditional(cols)


columns = {
    # Trade Time Descriptors
    'exec_datetime': Column('exec_datetime',
        datatype=['datetime'],
        conditional=lambda x: False if 'exec_date' in x else True
        #condition= not needed if date, but needed if no date
    ),
    'exec_date': Column('exec_date',
        datatype=['date'],
        conditional=lambda x: False if 'exec_datetime' in x else True
    ),
    'exec_time': Column('exec_time',
        datatype=['time'],
        required=False
        #what if there is a datetime?
    ),
    'settlement_datetime': Column('settlement_datetime',
        datatype=['datetime'],
        required=False,
    ),
    'settlement_date': Column('settlement_date',
        datatype=['date'],
        required=False,
    ),
    'settlement_time': Column('settlement_time',
        datatype=['time'],
        required=False,
    ),
    # Security Descriptors),
    'symbol': Column('symbol',
        datatype=['str'],
        conditional=lambda x: False if any([y in x for y in ['cusip', 'sedol', 'isin']]) else True
       # condition= we need a sec id, or a symbol or a cusip or an isin
    ),
    'symbol_desc': Column('symbol_desc',
        datatype=['str'],
        required=False
    ),
    'cusip': Column('cusip',
        datatype=['cusip'], # (new type, 8 or 9 digit int)
        conditional=lambda x: False if any([y in x for y in ['symbol', 'sedol', 'isin']]) else True
    ),
    'sedol': Column('sedol',
        datatype=['sedol'], #same as cusip
        conditional=lambda x: False if any([y in x for y in ['cusip', 'symbol', 'isin']]) else True
    ),
    'isin': Column('isin',
        datatype=['isin'], #same as above, but int-y
        conditional=lambda x: False if any([y in x for y in ['cusip', 'sedol', 'symbol']]) else True
    ),
    'sec_id': Column('sec_id',
        datatype=['str'] # ping will
    ),
    # Trade Execution Descriptors,
    'exec_direction': Column('exec_direction',
        datatype=['str'],
        required=True
    ),
    'qty': Column('qty',
        datatype=['float'],
        required=True
    ),
    'notional': Column('notional',
        datatype=['float'],
        conditional=lambda x: False if 'multiplier' in x else True
        # only not required if we have the multiplier
        # we need notional OR multiplier
    ),
    'price': Column('price',
        datatype=['float'],
        required=True
    ),
    'multiplier': Column('multiplier',
        datatype=['float'],
        conditional=lambda x: False if 'notional' in x else True
    ),
    # Trade Attributes Descriptors
    'acct_id': Column('acct_id',
        datatype=['str'],
        required=True
    ),
    'acct_desc': Column('acct_desc',
        datatype=['str'],
        required=False
    ),
    'broker_id': Column('broker_id',
        datatype=['str'],
        required=False
    ),
    'broker_desc': Column('broker_desc',
        datatype=['str'],
        required=False
    ),
    'trader_id': Column('trader_id',
        datatype=['str'],
        required=False
    ),
    'trader_desc': Column('trader_desc',
        datatype=['str'],
        required=False
    ),
    'fee': Column('fee',
        datatype=['float'],
        required=False
    ),
    'commission': Column('commission',
        datatype=['float'],
        required=False
    ),
    'sec_type': Column('sec_type',
        datatype=['str'],
        required=True
        # there could be a blanket assignment
    ),
    'currency': Column('currency',
        datatype=['str'],
        required=False
        # there could be a blanket assignment
    ),
    # Relevant to Message Blotters
    'message_datetime': Column('exec_datetime',
        datatype=['datetime'],
        conditional=lambda x: False if 'message_date' in x else True
        #condition= not needed if date, but needed if no date
    ),
    'message_date': Column('exec_date',
        datatype=['date'],
        conditional=lambda x: False if 'message_datetime' in x else True
    ),
    'message_time': Column('exec_time',
        datatype=['time'],
        required=False
        #what if there is a datetime?
    ),
    'sent_datetime': Column('exec_datetime',
        datatype=['datetime'],
        conditional=lambda x: False if 'sent_date' in x else True
        #condition= not needed if date, but needed if no date
    ),
    'sent_date': Column('exec_date',
        datatype=['date'],
        conditional=lambda x: False if 'sent_datetime' in x else True
    ),
    'sent_time': Column('exec_time',
        datatype=['time'],
        required=False
        #what if there is a datetime?
    ),
    'exchange_datetime': Column('exec_datetime',
        datatype=['datetime'],
        conditional=lambda x: False if 'exchange_date' in x else True
        #condition= not needed if date, but needed if no date
    ),
    'exchange_date': Column('exec_date',
        datatype=['date'],
        conditional=lambda x: False if 'exchange_datetime' in x else True
    ),
    'exchange_time': Column('exec_time',
        datatype=['time'],
        required=False
        #what if there is a datetime?
    ),
    'fill_qty': Column('fill_qty',
        datatype=['float'],
        required=False
    ),
    'orig_qty': Column('orig_qty',
        datatype=['float'],
        required=False
    ),
    'fill_price': Column('fill_price',
        datatype=['float'],
        required=False
    ),
    'orig_price': Column('orig_price',
        datatype=['float'],
        required=False
    ),
    # order_message id details
    'canonical_order_id': Column('canonical_order_id',
                                 datatype=['int'],
        required=True
    ),
    'client_order_id': Column('client_order_id',
                              datatype=['int'],
        required=False
    ),
    'external_order_id': Column('external_order_id',
                                datatype=['int'],
        required=False
    ),
    'acting_as': Column('acting_as',
                        datatype=['str'],
        required=False
    ),
    'tif': Column('tif',
                  datatype=['str'],
        required=False
    ),
    'order_type': Column('order_type',
        datatype=['str'],
        required=True
    ),
    # order message execution id
    'exec_id': Column('exec_id',
                      datatype=['int'],
        required=False
    ),
    'message_source': Column('message_source',
                             datatype=['str'],
        required=False
    ),
    'message_type': Column('message_type',
                           datatype=['str'],
        required=True
    )
}