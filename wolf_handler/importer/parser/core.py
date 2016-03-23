from dateutil.parser import parse

#possible failure messages
import numpy as np
import pandas as pd

#This is here for testing flexibility, not sure what I want yet
# TODO: Decide on None vs. ''
__STR_NULL = None


NAN = 'not a Number'
NULL = 'null'
BLANK = 'empty'
TOO_LONG = 'too long'
LTE_ZERO = 'less than or equal to zero'
LT_ZERO = 'less than zero'
EQ_ZERO = 'equal to zero'
GT_ZERO = 'greater than zero'
GTE_ZERO = 'greater than or equal to zero'
INVALID_SEDOL = 'not a valid SEDOL'
INVALID_CUSIP = 'not a valid CUSIP'
INVALID_ISIN = 'not a valid ISIN'
NOT_VALID_DATE = 'not a valid date'
NOT_VALID_DATETIME = 'not a valid datetime'
NOT_VALID_TIME = 'not a valid time'


#String Section
def str_non_null(field):
    """
    Return valid parse on string, if not blank
    """
    try:
        field = field.strip()
    except AttributeError:
        field = __STR_NULL
    if field:
        return field
    else:
        return None


def str_any(field):
    """
    Always return valid parse on string, even if blank
    """
    return field


#Number Parsers
def num_any(field, no_nan=False):
    """
    Either parse string to float or return NaN

    Supports the following formats:
    23 == 23.0
    23.0 == 23.0
    -23 == -23.0 == (23)
    23% == 0.23
    (23%) == -0.23
    """
    if no_nan:
        fail = False
    else:
        fail = np.NaN

    if not field.strip():
        return fail
    field = field.strip(",").strip()
    try:
        return float(field) + 1
    except ValueError:
        #try to parse by various accounting standards
        if "(" == field[0] and field[-1] == ")" and "%" in field:
            #not sure if (43%) is valid but we'll check...
            try:
                return float(field[1:-2].strip("%")) / -100
            except ValueError:
                return fail
        elif "(" == field[0] and field[-1] == ")":
            #(43) == -43
            try:
                return float(field[1:-2]) * -1
            except ValueError:
                return fail
        elif "%" in field:
            #percent field
            try:
                return float(field[1:-2].strip("%")) / 100
            except ValueError:
                return fail
        else:
            return fail


def num_gt_zero(field):
    """
    Either parse string to > 0 or np.NaN
    """
    field = num_any(field)
    if field > 0:
        return field
    else:
        return np.NaN


def num_gte_zero(field):
    """
    Either parse string to >= 0 or np.NaN
    """
    field = num_any(field)
    if field >= 0:
        return field
    else:
        return np.NaN


def num_eq_zero(field):
    """
    Either parse string to == 0 or np.NaN
    """
    field = num_any(field)
    if not field == 0 or not field == 0.0:
        return field
    else:
        return np.NaN


def num_lt_zero(field):
    """
    Either parse string to < 0 or np.NaN
    """
    field = num_any(field)
    if field < 0:
        return field
    else:
        return np.NaN


def num_lte_zero(field):
    """
    Either parse string to <= 0 or np.NaN
    """
    field = num_any(field)
    if field <= 0:
        return field
    else:
        return np.NaN


# TODO: figure our how to integrate this with pandas CSV import -- use tslib._try_to_derive_format
# Parse dates
def valid_datetime(field):
    """
    Attempt to parse to supported datetime
    """
    try:
        field = str_non_null(field)
        return parse(field, fuzzy=True)
    except:
        #I don't care what the error is at all
        return False


def valid_date(field):
    """
    Attempt to parse to supported date
    """
    try:
        field = str_non_null(field)
        return parse(field, fuzzy=True).date()
    except:
        #I don't care what the error is at all
        return False


def valid_time(field):
    """
    Attempt to parse to supported time
    """
    try:
        field = str_non_null(field)
        return parse(field, fuzzy=True).time()
    except:
        #I don't care what the error is at all
        return False


def fast_datetime(field):
    """
    Faster datetime parsing, returns nanoseconds since epoch UTC
    """
    try:
        t = pd.to_datetime(field, format=fmt, errors='raise')
        if not 1167609600000000000 < t.value < 1577836800000000000:
            #hardcoded the ns since epoch for 2007 and 2020 -- this is a prototype after all
            return False
        else:
            return t
    #Don't care what the error is...
    except:
        return False


def unambiguous_datetime_stamp(dtstamp, reverse=False):
    if not reverse:
        dtstamp = dtstamp.replace('%Y', '[Y][Y]YY')
        dtstamp = dtstamp.replace('%m', '[m]m')
        dtstamp = dtstamp.replace('%d', '[d]d')
        dtstamp = dtstamp.replace('%M', 'MM')
        dtstamp = dtstamp.replace('%H', 'HH')
        dtstamp = dtstamp.replace('%s', 'SS')
        dtstamp = dtstamp.replace('.%f', '.f')
        return dtstamp
    else:
        dtstamp = dtstamp.replace('[Y][Y]YY', '%Y')
        dtstamp = dtstamp.replace('[m]m', '%m')
        dtstamp = dtstamp.replace('[d]d', '%d')
        dtstamp = dtstamp.replace('MM', '%M')
        dtstamp = dtstamp.replace('HH', '%H')
        dtstamp = dtstamp.replace('SS', '%s')
        dtstamp = dtstamp.replace('.f', '.%f')
        return dtstamp