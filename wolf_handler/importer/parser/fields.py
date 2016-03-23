from . import core

#-------- Security Parsers ---------#
def cusip(field):
    """
    Check if cusip is valid (string of length 8 or 9 only), returns string of length 8 or None
    """
    try:
        field = field.strip()
        if 8 <= len(field) <= 9 and not '.' in field:
            return field[:8]
        else:
            return core.__STR_NULL
    except AttributeError:
        return core.__STR_NULL


def sedol(field):
    """
    check if sedol is valid, length [6,7]
    """
    try:
        field = field.strip()
        if 6 <= len(field) <= 7:
            return field[:6]
        else:
            return core.__STR_NULL
    except AttributeError:
        return core.__STR_NULL


def isin(field):
    """
    check if ISIN is valid
    """
    try:
        field = field.strip()
        if 12 <= len(field) <= 13:
            return field[:12]
        else:
            return core.__STR_NULL
    except AttributeError:
        return core.__STR_NULL


sec_id = core.str_non_null
symbol = core.str_non_null
symbol_desc = core.str_non_null

# -- Currency Parsers -- #
currency_code = core.str_non_null

# -- Account Parsers -- #
acct_id = core.str_non_null
acct_desc = core.str_non_null
trader_id = core.str_non_null
trader_desc = core.str_non_null
broker_id = core.str_non_null
broker_desc = core.str_non_null

# -- Trade Direction Parsers -- #
exec_direction = core.str_non_null

# -- Security Type Parsers -- #
sec_type = core.str_non_null

# -- Trade Details Parsers -- #
qty = core.num_any
price = core.num_gt_zero
notional = core.num_any
commission = core.num_gte_zero
multiplier = core.num_any
fee = core.num_gte_zero


